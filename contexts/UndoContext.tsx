"use client";

import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
} from "react";
import type { OutfitItem } from "@/components/types/outfit";

// ============================================================================
// TYPES
// ============================================================================

interface UndoAction {
	type: "ADD_ITEM" | "REMOVE_ITEM" | "REPLACE_ITEM" | "CLEAR_CANVAS";
	timestamp: number;
	outfitId?: string; // For outfit-specific undo stacks
	data: {
		previous: OutfitItem[]; // State before action
		current: OutfitItem[]; // State after action
	};
}

interface UndoContextValue {
	canUndo: boolean;
	canRedo: boolean;
	undo: () => OutfitItem[] | null;
	redo: () => OutfitItem[] | null;
	pushAction: (action: UndoAction) => void;
	clearStack: () => void;
	getStackSize: () => number;
}

// ============================================================================
// CONTEXT
// ============================================================================

const UndoContext = createContext<UndoContextValue | undefined>(undefined);

const MAX_STACK_SIZE = 10;
const EXPIRY_HOURS = 24;
const STORAGE_KEY = "outfit-undo-stack";

// ============================================================================
// PROVIDER
// ============================================================================

export function UndoProvider({ children }: { children: React.ReactNode }) {
	const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
	const [redoStack, setRedoStack] = useState<UndoAction[]>([]);

	// Load from localStorage on mount
	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				const now = Date.now();

				// Filter out expired actions (older than 24 hours)
				const validActions = parsed.filter((action: UndoAction) => {
					const ageHours = (now - action.timestamp) / (1000 * 60 * 60);
					return ageHours < EXPIRY_HOURS;
				});

				if (validActions.length > 0) {
					setUndoStack(validActions);
				} else {
					// All actions expired, clear storage
					localStorage.removeItem(STORAGE_KEY);
				}
			} catch (error) {
				console.error("Failed to load undo stack:", error);
				localStorage.removeItem(STORAGE_KEY);
			}
		}
	}, []);

	// Save to localStorage whenever stack changes
	useEffect(() => {
		if (undoStack.length > 0) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(undoStack));
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	}, [undoStack]);

	const pushAction = useCallback((action: UndoAction) => {
		setUndoStack((prev) => {
			const newStack = [...prev, action];
			// Limit stack size
			if (newStack.length > MAX_STACK_SIZE) {
				return newStack.slice(-MAX_STACK_SIZE);
			}
			return newStack;
		});
		// Clear redo stack when new action is pushed
		setRedoStack([]);
	}, []);

	const undo = useCallback(() => {
		if (undoStack.length === 0) return null;

		const action = undoStack[undoStack.length - 1];
		setUndoStack((prev) => prev.slice(0, -1));
		setRedoStack((prev) => [...prev, action]);

		return action.data.previous; // Return previous state
	}, [undoStack]);

	const redo = useCallback(() => {
		if (redoStack.length === 0) return null;

		const action = redoStack[redoStack.length - 1];
		setRedoStack((prev) => prev.slice(0, -1));
		setUndoStack((prev) => [...prev, action]);

		return action.data.current; // Return current state
	}, [redoStack]);

	const clearStack = useCallback(() => {
		setUndoStack([]);
		setRedoStack([]);
		localStorage.removeItem(STORAGE_KEY);
	}, []);

	const getStackSize = useCallback(() => undoStack.length, [undoStack]);

	return (
		<UndoContext.Provider
			value={{
				canUndo: undoStack.length > 0,
				canRedo: redoStack.length > 0,
				undo,
				redo,
				pushAction,
				clearStack,
				getStackSize,
			}}>
			{children}
		</UndoContext.Provider>
	);
}

export function useUndo() {
	const context = useContext(UndoContext);
	if (!context) {
		throw new Error("useUndo must be used within UndoProvider");
	}
	return context;
}
