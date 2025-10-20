'use client'

import { useState, useEffect } from 'react'

export interface Brand {
  id: number
  name: string | null
  brand_logo: string | null
}

interface UseBrandsReturn {
  brands: Brand[]
  isLoading: boolean
  error: Error | null
}

/**
 * Custom hook to fetch and manage brands from the API
 *
 * @returns Object containing brands array, loading state, and error state
 *
 * @example
 * const { brands, isLoading, error } = useBrands()
 */
export function useBrands(): UseBrandsReturn {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/brands')

        if (!response.ok) {
          throw new Error(`Failed to fetch brands: ${response.statusText}`)
        }

        const data: Brand[] = await response.json()
        setBrands(data)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred')
        setError(error)
        console.error('Error fetching brands:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBrands()
  }, [])

  return { brands, isLoading, error }
}
