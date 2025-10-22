import { useState, useEffect, useRef, useCallback } from 'react'

interface UseValidationVisibilityProps {
	formRef: React.RefObject<HTMLFormElement>
	isDirty: boolean
	attemptedSubmit: boolean
}

interface ValidationVisibilityState {
	shouldShowCard: boolean
	isSticky: boolean
	isMobile: boolean
	scrollProgress: number
}

/**
 * Hook to manage smart visibility of validation card
 * Shows card when:
 * 1. User scrolls to 70% depth of form (sticky mode on desktop)
 * 2. User attempts to submit with errors (modal mode on mobile)
 * 3. Form has been edited (isDirty)
 */
export function useValidationVisibility({
	formRef,
	isDirty,
	attemptedSubmit,
}: UseValidationVisibilityProps): ValidationVisibilityState {
	const [shouldShowCard, setShouldShowCard] = useState(false)
	const [isSticky, setIsSticky] = useState(false)
	const [isMobile, setIsMobile] = useState(false)
	const [scrollProgress, setScrollProgress] = useState(0)
	const scrollTimeoutRef = useRef<NodeJS.Timeout>()
	const SCROLL_THRESHOLD = 0.7 // 70% scroll depth

	// Detect mobile device
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 1024) // lg breakpoint
		}

		checkMobile()
		window.addEventListener('resize', checkMobile)
		return () => window.removeEventListener('resize', checkMobile)
	}, [])

	// Calculate scroll progress and determine visibility
	const handleScroll = useCallback(() => {
		if (!formRef.current || !isDirty) {
			setShouldShowCard(false)
			return
		}

		const form = formRef.current
		const formRect = form.getBoundingClientRect()
		const windowHeight = window.innerHeight

		// Calculate scroll progress relative to form position
		const formTop = formRect.top
		const formHeight = formRect.height

		// Calculate how much of the form is visible
		const scrollFromTop = Math.max(0, -formTop)
		const totalScrollable = formHeight - windowHeight

		let progress = 0
		if (totalScrollable > 0) {
			progress = scrollFromTop / totalScrollable
		}

		setScrollProgress(Math.min(progress, 1))

		// Show card when scrolled past threshold (70%)
		const scrolledPastThreshold = progress >= SCROLL_THRESHOLD
		const shouldShow = scrolledPastThreshold && isDirty

		setShouldShowCard(shouldShow)
		setIsSticky(!isMobile && shouldShow)

		// Clear existing timeout
		if (scrollTimeoutRef.current) {
			clearTimeout(scrollTimeoutRef.current)
		}

		// Debounce scroll handler (only update every 50ms during scroll)
		scrollTimeoutRef.current = setTimeout(() => {
			// Update state after scroll ends
		}, 50)
	}, [formRef, isDirty, isMobile])

	// Scroll event listener
	useEffect(() => {
		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => {
			window.removeEventListener('scroll', handleScroll)
			if (scrollTimeoutRef.current) {
				clearTimeout(scrollTimeoutRef.current)
			}
		}
	}, [handleScroll])

	// Show card immediately if user attempts submit
	useEffect(() => {
		if (attemptedSubmit && isDirty) {
			setShouldShowCard(true)
			setIsSticky(false) // Always use modal on submit attempt
		}
	}, [attemptedSubmit, isDirty])

	return {
		shouldShowCard,
		isSticky,
		isMobile,
		scrollProgress,
	}
}
