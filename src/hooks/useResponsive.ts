import { useState, useEffect, useCallback } from 'react'

interface BreakpointState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLargeDesktop: boolean
  width: number
  height: number
  isLoading: boolean
}

const DESKTOP_DEFAULT_WIDTH = 1024
const DESKTOP_DEFAULT_HEIGHT = 768

// Safe way to check if we're in browser environment
const isBrowser = typeof window !== 'undefined'

// Get initial safe values
function getInitialDimensions() {
  if (!isBrowser) {
    return { width: DESKTOP_DEFAULT_WIDTH, height: DESKTOP_DEFAULT_HEIGHT }
  }
  
  try {
    return {
      width: window.innerWidth || DESKTOP_DEFAULT_WIDTH,
      height: window.innerHeight || DESKTOP_DEFAULT_HEIGHT
    }
  } catch (error) {
    console.warn('Error accessing window dimensions:', error)
    return { width: DESKTOP_DEFAULT_WIDTH, height: DESKTOP_DEFAULT_HEIGHT }
  }
}

function calculateBreakpoints(width: number): Omit<BreakpointState, 'width' | 'height' | 'isLoading'> {
  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024 && width < 1440,
    isLargeDesktop: width >= 1440,
  }
}

export function useResponsive(): BreakpointState {
  const initialDimensions = getInitialDimensions()
  const [state, setState] = useState<BreakpointState>(() => ({
    ...calculateBreakpoints(initialDimensions.width),
    width: initialDimensions.width,
    height: initialDimensions.height,
    isLoading: !isBrowser
  }))

  const updateSize = useCallback(() => {
    if (!isBrowser) return

    try {
      const width = window.innerWidth || DESKTOP_DEFAULT_WIDTH
      const height = window.innerHeight || DESKTOP_DEFAULT_HEIGHT

      setState(prevState => {
        const newBreakpoints = calculateBreakpoints(width)
        
        // Only update if something actually changed
        if (
          prevState.width === width &&
          prevState.height === height &&
          prevState.isMobile === newBreakpoints.isMobile &&
          prevState.isTablet === newBreakpoints.isTablet &&
          prevState.isDesktop === newBreakpoints.isDesktop &&
          prevState.isLargeDesktop === newBreakpoints.isLargeDesktop
        ) {
          return prevState
        }

        return {
          ...newBreakpoints,
          width,
          height,
          isLoading: false
        }
      })
    } catch (error) {
      console.error('Error in updateSize:', error)
    }
  }, [])

  useEffect(() => {
    if (!isBrowser) {
      setState(prev => ({ ...prev, isLoading: false }))
      return
    }

    // Set initial size
    updateSize()

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout
    const debouncedUpdateSize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateSize, 150)
    }

    try {
      window.addEventListener('resize', debouncedUpdateSize, { passive: true })
      
      return () => {
        clearTimeout(timeoutId)
        window.removeEventListener('resize', debouncedUpdateSize)
      }
    } catch (error) {
      console.error('Error setting up resize listener:', error)
      return () => {}
    }
  }, [updateSize])

  return state
}

export function getSidebarWidth(collapsed: boolean, breakpoint: BreakpointState): number {
  try {
    if (collapsed) return 80

    if (breakpoint.isLargeDesktop) return 320
    if (breakpoint.isDesktop) return 288
    return 256
  } catch (error) {
    console.warn('Error calculating sidebar width:', error)
    return collapsed ? 80 : 256 // Safe fallback
  }
}

export function getGridCols(collapsed: boolean, breakpoint: BreakpointState): string {
  try {
    // Safe fallback for loading state
    if (breakpoint.isLoading) {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    }

    if (breakpoint.isMobile) {
      return 'grid-cols-1 sm:grid-cols-2'
    }
    
    if (breakpoint.isTablet) {
      return 'grid-cols-2 md:grid-cols-3'
    }
    
    if (collapsed) {
      return 'grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
    }
    
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  } catch (error) {
    console.warn('Error calculating grid cols:', error)
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' // Safe fallback
  }
}

// New utility function for safe breakpoint checking
export function isSafeToUseBreakpoint(breakpoint: BreakpointState): boolean {
  return !breakpoint.isLoading && breakpoint.width > 0 && breakpoint.height > 0
}