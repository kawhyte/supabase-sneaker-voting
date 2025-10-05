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
import { CLOTHING_SIZES } from '@/lib/item-utils'

interface ClothingSizeComboboxProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function ClothingSizeCombobox({ value, onChange, disabled }: ClothingSizeComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setOpen(false)
  }

  const displayValue = value || 'Select size...'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between h-5"
        >
          <span className="truncate">{displayValue}</span>
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search size... (e.g., M, XL)" />
          <CommandList>
            <CommandEmpty>
              <p className="py-6 text-center text-sm text-muted-foreground">
                No size found
              </p>
            </CommandEmpty>
            <CommandGroup>
              {CLOTHING_SIZES.map((size) => (
                <CommandItem
                  key={size}
                  value={size}
                  onSelect={() => handleSelect(size)}
                >
                  <Check
                    className={cn(
                      'mr-[var(--space-xs)] h-4 w-4',
                      value === size ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span>{size}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
