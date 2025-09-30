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

const COMMON_SIZES = [
  { us: '3.5', women: '5', eu: '35.5' },
  { us: '4', women: '5.5', eu: '36' },
  { us: '4.5', women: '6', eu: '37' },
  { us: '5', women: '6.5', eu: '37.5' },
  { us: '5.5', women: '7', eu: '38' },
  { us: '6', women: '7.5', eu: '38.5' },
  { us: '6.5', women: '8', eu: '39' },
  { us: '7', women: '8.5', eu: '40' },
  { us: '7.5', women: '9', eu: '40.5' },
  { us: '8', women: '9.5', eu: '41' },
  { us: '8.5', women: '10', eu: '42' },
  { us: '9', women: '10.5', eu: '42.5' },
  { us: '9.5', women: '11', eu: '43' },
  { us: '10', women: '11.5', eu: '44' },
  { us: '10.5', women: '12', eu: '44.5' },
  { us: '11', women: '12.5', eu: '45' },
  { us: '11.5', women: '13', eu: '45.5' },
  { us: '12', women: '13.5', eu: '46' },
  { us: '12.5', women: '14', eu: '47' },
  { us: '13', women: '14.5', eu: '47.5' },
]

interface SizeComboboxProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  preferredSize?: string
}

export function SizeCombobox({ value, onChange, disabled, preferredSize }: SizeComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setOpen(false)
  }

  const selectedSize = COMMON_SIZES.find(s => s.us === value)
  const displayValue = selectedSize
    ? `US M ${selectedSize.us} / W ${selectedSize.women} (EU ${selectedSize.eu})`
    : 'Select size...'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between h-11"
        >
          <span className="truncate">{displayValue}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search size... (e.g., 8.5, 42, W 9)" />
          <CommandList>
            <CommandEmpty>
              <p className="py-6 text-center text-sm text-muted-foreground">
                No size found
              </p>
            </CommandEmpty>
            <CommandGroup>
              {COMMON_SIZES.map((size) => {
                const isPreferred = preferredSize === size.us
                return (
                  <CommandItem
                    key={size.us}
                    value={`${size.us} ${size.women} ${size.eu}`}
                    onSelect={() => handleSelect(size.us)}
                    className={cn(isPreferred && "bg-blue-50")}
                  >
                    <Check
                      className={cn(
                        'mr-[var(--space-md)] h-4 w-4',
                        value === size.us ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex items-center justify-between w-full">
                      <span>
                        US M {size.us} / W {size.women} (EU {size.eu})
                      </span>
                      {isPreferred && (
                        <span className="text-xs text-blue-600 ml-[var(--space-md)]">Your usual</span>
                      )}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}