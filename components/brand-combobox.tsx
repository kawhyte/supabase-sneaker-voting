'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
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

const COMMON_BRANDS = [
  { value: 'Nike', label: 'Nike' },
  { value: 'Jordan', label: 'Jordan' },
  { value: 'Adidas', label: 'Adidas' },
  { value: 'New Balance', label: 'New Balance' },
  { value: 'Asics', label: 'Asics' },
  { value: 'Puma', label: 'Puma' },
  { value: 'Vans', label: 'Vans' },
  { value: 'Converse', label: 'Converse' },
  { value: 'Reebok', label: 'Reebok' },
  { value: 'Under Armour', label: 'Under Armour' },
  { value: 'Saucony', label: 'Saucony' },
  { value: 'Brooks', label: 'Brooks' },
  { value: 'Hoka', label: 'Hoka' },
  { value: 'On Running', label: 'On Running' },
  { value: 'Salomon', label: 'Salomon' },
]

interface BrandComboboxProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function BrandCombobox({ value, onChange, disabled }: BrandComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')

  // Allow custom brand entry
  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setOpen(false)
    setSearchValue('')
  }

  const handleSearchChange = (search: string) => {
    setSearchValue(search)
  }

  // If user types something not in the list and presses Enter, use that as custom brand
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchValue && !COMMON_BRANDS.find(b => b.value.toLowerCase() === searchValue.toLowerCase())) {
      e.preventDefault()
      onChange(searchValue)
      setOpen(false)
      setSearchValue('')
    }
  }

  const displayValue = value || 'Select brand...'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          size='sm'
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between h-5" 
        >
          {displayValue}
          <ChevronsUpDown className="ml-[var(--space-xs)] h-2 w-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search or type brand..."
            value={searchValue}
            onValueChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            <CommandEmpty>
              {searchValue ? (
                <div className="py-6 text-center text-sm">
                  <p className="text-muted-foreground mb-[var(--space-xs)]">Brand not found</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelect(searchValue)}
                    className="mt-[var(--space-xs)]"
                  >
                    Use "{searchValue}"
                  </Button>
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Start typing to search brands
                </p>
              )}
            </CommandEmpty>
            <CommandGroup>
              {COMMON_BRANDS.map((brand) => (
                <CommandItem
                  key={brand.value}
                  value={brand.value}
                  onSelect={() => handleSelect(brand.value)}
                >
                  <Check
                    className={cn(
                      'mr-[var(--space-xs)] h-2 w-2',
                      value === brand.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {brand.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}