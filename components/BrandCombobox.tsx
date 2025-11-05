'use client'

import * as React from 'react'
import Image from 'next/image'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useBrands } from '@/hooks/useBrands'

interface BrandComboboxProps {
  value?: number | null
  onChange: (value: number) => void
  disabled?: boolean
  placeholder?: string
}

/**
 * BrandCombobox Component
 *
 * A searchable dropdown component for selecting pre-defined brands from the database.
 * Fetches brands from the /api/brands endpoint and displays them with logos.
 *
 * Features:
 * - Loads brands dynamically from the API via useBrands hook
 * - Displays brand logos (if available) alongside brand names
 * - Searchable list with filtering
 * - Loading and error states
 * - Responsive sizing
 *
 * @param value - The currently selected brand ID (number)
 * @param onChange - Callback function when a brand is selected (receives brand ID)
 * @param disabled - Whether the component is disabled
 * @param placeholder - Custom placeholder text
 */
export function BrandCombobox({
  value,
  onChange,
  disabled,
  placeholder = 'Select a brand...',
}: BrandComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const { brands, isLoading, error } = useBrands()

  // Find the selected brand object to display its logo
  const selectedBrand = value ? brands.find((b) => b.id === value) : undefined

  const handleSelect = (selectedBrandId: number) => {
    onChange(selectedBrandId)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          size="sm"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className="w-full justify-between h-10 mt-2"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedBrand?.brand_logo && (
              <div className="relative w-5 h-5 flex-shrink-0">
                <Image
                  src={selectedBrand.brand_logo}
                  alt={selectedBrand.name || 'Brand logo'}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <span className="truncate">
              {isLoading ? 'Loading brands...' : selectedBrand?.name || placeholder}
            </span>
          </div>
          {isLoading ? (
            <Loader2 className="h-4 w-4 shrink-0 opacity-50 animate-spin" />
          ) : (
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search brands..." />
          <CommandList>
            <CommandEmpty>
              {error ? (
                <p className="py-6 text-center text-sm text-red-600">
                  Failed to load brands. Please try again.
                </p>
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {isLoading ? 'Loading brands...' : 'No brands found.'}
                </p>
              )}
            </CommandEmpty>
            {!isLoading && !error && brands.length > 0 && (
              <CommandGroup>
                {brands.map((brand) => (
                  <CommandItem
                    key={brand.id}
                    value={brand.id.toString()}
                    onSelect={() => handleSelect(brand.id)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === brand.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      {brand.brand_logo && (
                        <div className="relative w-5 h-5 flex-shrink-0">
                          <Image
                            src={brand.brand_logo}
                            alt={brand.name || 'Brand logo'}
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                      <span className="flex-1">{brand.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}