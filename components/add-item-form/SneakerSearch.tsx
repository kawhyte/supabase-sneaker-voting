'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, Loader2, X, Sparkles, BadgeCheck } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

export interface SneakerSearchResult {
  title: string
  cleanModelName: string
  brand: string
  sku: string
  color: string
  releaseYear: string
  imageUrl: string
  price: string
  hasEpid: boolean
}

interface SneakerSearchProps {
  onSelect: (result: SneakerSearchResult) => void
}

export function SneakerSearch({ onSelect }: SneakerSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SneakerSearchResult[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [hasSearched, setHasSearched] = useState(false)

  const debouncedQuery = useDebounce(query, 500)
  // Client-side query cache — prevents redundant API calls for repeated searches
  const cache = useRef<Map<string, SneakerSearchResult[]>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchResults = useCallback(async (q: string) => {
    if (cache.current.has(q)) {
      setResults(cache.current.get(q)!)
      setIsOpen(true)
      setHasSearched(true)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/sneaker-search?q=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      const fetched: SneakerSearchResult[] = data.results ?? []
      cache.current.set(q, fetched)
      setResults(fetched)
      setIsOpen(true)
      setHasSearched(true)
    } catch {
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const trimmed = debouncedQuery.trim()
    if (trimmed.length >= 3) {
      fetchResults(trimmed)
    } else {
      setResults([])
      setIsOpen(false)
      setHasSearched(false)
    }
  }, [debouncedQuery, fetchResults])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (result: SneakerSearchResult) => {
    onSelect(result)
    setQuery('')
    setIsOpen(false)
    setResults([])
    setActiveIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0) handleSelect(results[activeIndex])
        break
      case 'Escape':
        setIsOpen(false)
        setActiveIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const showDropdown = isOpen && !isLoading && (results.length > 0 || hasSearched)

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search input */}
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3.5 flex items-center">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </span>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActiveIndex(-1)
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search sneakers — e.g. Air Jordan 1 Bred, Yeezy 350..."
          className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          autoComplete="off"
          spellCheck={false}
          aria-label="Search sneakers"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
          aria-autocomplete="list"
        />

        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
              inputRef.current?.focus()
            }}
            className="absolute right-3 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showDropdown && (
        <div
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
        >
          {results.length > 0 ? (
            <>
              <ul className="py-1.5">
                {results.map((result, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={idx === activeIndex}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                        idx === activeIndex ? 'bg-primary/8 text-foreground' : 'hover:bg-muted/60'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                        {result.imageUrl ? (
                          <img
                            src={result.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Sparkles className="h-4 w-4 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      {/* Title + badges */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium leading-snug text-foreground">
                          {result.cleanModelName || result.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                          {result.brand && (
                            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {result.brand}
                            </span>
                          )}
                          {result.sku && (
                            <span className={`font-mono text-[10px] ${result.hasEpid ? 'text-primary font-semibold' : 'text-muted-foreground/70'}`}>
                              {result.sku}
                            </span>
                          )}
                          {result.hasEpid && (
                            <BadgeCheck className="h-3 w-3 text-primary flex-shrink-0" />
                          )}
                          {result.color && (
                            <span className="text-[10px] text-muted-foreground/60 truncate max-w-[80px]">
                              {result.color}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      {result.price && (
                        <span className="flex-shrink-0 tabular-nums text-xs font-semibold text-foreground">
                          {result.price}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border px-3 py-2">
                <span className="text-[10px] text-muted-foreground/40">Results from eBay</span>
              </div>
            </>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No results for &ldquo;{debouncedQuery}&rdquo;
              </p>
              <p className="mt-1 text-xs text-muted-foreground/50">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
