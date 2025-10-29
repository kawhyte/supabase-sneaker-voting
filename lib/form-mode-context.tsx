'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type FormMode = 'quick' | 'advanced'

interface FormModeContextType {
  mode: FormMode
  setMode: (mode: FormMode) => void
}

const FormModeContext = createContext<FormModeContextType | undefined>(undefined)

const STORAGE_KEY = 'purrview_form_mode'
const DEFAULT_MODE: FormMode = 'quick'

interface FormModeProviderProps {
  children: ReactNode
}

/**
 * FormModeProvider - Context provider for Quick/Advanced form mode
 *
 * Persists user's form mode preference to localStorage.
 * Quick mode: Essentials only (brand, model, photos)
 * Advanced mode: All fields including optional details
 *
 * Usage:
 * ```tsx
 * <FormModeProvider>
 *   <AddItemForm />
 * </FormModeProvider>
 * ```
 */
export function FormModeProvider({ children }: FormModeProviderProps) {
  const [modeState, setModeState] = useState<FormMode>(DEFAULT_MODE)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as FormMode | null
    if (stored && ['quick', 'advanced'].includes(stored)) {
      setModeState(stored)
    }
  }, [])

  // Save to localStorage when mode changes
  const setMode = (newMode: FormMode) => {
    setModeState(newMode)
    localStorage.setItem(STORAGE_KEY, newMode)
  }

  // Always provide context - even during hydration with default value
  // This prevents "useFormMode must be used within FormModeProvider" errors
  return (
    <FormModeContext.Provider value={{ mode: modeState, setMode }}>
      {children}
    </FormModeContext.Provider>
  )
}

/**
 * useFormMode - Hook to access form mode context
 *
 * Provides current mode ('quick' | 'advanced') and setter function.
 * Must be used within FormModeProvider.
 *
 * Returns: { mode: FormMode, setMode: (mode: FormMode) => void }
 *
 * Usage:
 * ```tsx
 * const { mode, setMode } = useFormMode()
 * ```
 */
export function useFormMode(): FormModeContextType {
  const context = useContext(FormModeContext)
  if (!context) {
    throw new Error('useFormMode must be used within FormModeProvider')
  }
  return context
}
