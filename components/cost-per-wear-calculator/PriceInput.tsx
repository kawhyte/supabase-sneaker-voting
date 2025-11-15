/**
 * Price Input - Dollar input with validation
 */

'use client';

import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DollarSign } from 'lucide-react';

interface PriceInputProps {
  form: UseFormReturn<any>;
}

export function PriceInput({ form }: PriceInputProps) {
  return (
    <FormField
      control={form.control}
      name="price"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-semibold text-foreground">
            What's the price?
          </FormLabel>
          <FormControl>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="number"
                placeholder="150"
                className="h-12 pl-10 text-base"
                min={1}
                max={10000}
                step={0.01}
                {...field}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === '' ? undefined : parseFloat(value));
                }}
                value={field.value ?? ''}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
