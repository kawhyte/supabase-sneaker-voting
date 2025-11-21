/**
 * View Density Context - Manages grid/list density preference
 *
 * Persists to localStorage for cross-session consistency
 * Provides global access via useDensity() hook
 *
 * View Modes:
 * - comfortable: 3-4 cards per row (grid) - DEFAULT
 * - detailed: 2-3 cards per row (grid)
 * - list: Horizontal rows (list/table view)
 */

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ViewDensity = "comfortable" | "detailed" | "list";

interface ViewDensityContextType {
	density: ViewDensity;
	setDensity: (density: ViewDensity) => void;
}

const ViewDensityContext = createContext<ViewDensityContextType | undefined>(
	undefined
);

const STORAGE_KEY = "purrview_density";
const DEFAULT_DENSITY: ViewDensity = "comfortable";

/**
 * Provider component - wrap your app with this
 */
export function ViewDensityProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [density, setDensityState] = useState<ViewDensity>(DEFAULT_DENSITY);

	// Load from localStorage on mount
	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored && ["comfortable", "detailed", "list"].includes(stored)) {
				setDensityState(stored as ViewDensity);
			} else if (stored === "compact") {
				// Migrate old "compact" preference to "comfortable"
				setDensityState("comfortable");
				localStorage.setItem(STORAGE_KEY, "comfortable");
			}
		} catch (error) {
			console.warn("Failed to read density from localStorage:", error);
			// Silently fall back to default if localStorage unavailable
		}
	}, []);

	const setDensity = (newDensity: ViewDensity) => {
		setDensityState(newDensity);
		try {
			localStorage.setItem(STORAGE_KEY, newDensity);
		} catch (error) {
			console.warn("Failed to save density to localStorage:", error);
			// Still updates state even if localStorage fails
		}
	};

	return (
		<ViewDensityContext.Provider value={{ density, setDensity }}>
			{children}
		</ViewDensityContext.Provider>
	);
}

/**
 * Hook to access density context
 */
export function useDensity(): ViewDensityContextType {
	const context = useContext(ViewDensityContext);
	if (!context) {
		throw new Error("useDensity must be used within ViewDensityProvider");
	}
	return context;
}

/**
 * Get grid classes based on density
 * Note: "list" density doesn't use grid - it returns empty string
 */
export function getDensityGridClasses(density: ViewDensity): string {
	switch (density) {
		case "comfortable":
			return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4";
		case "detailed":
			return "grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6";
		case "list":
			return ""; // List view doesn't use grid layout
	}
}

/**
 * Get image aspect ratio based on density
 */
export function getDensityImageAspect(
	density: ViewDensity
): "square" | "portrait" | "landscape" {
	switch (density) {
		case "comfortable":
			return "portrait"; // 3:4
		case "detailed":
			return "landscape"; // 4:3
		case "list":
			return "square"; // 1:1 for list thumbnails
	}
}
