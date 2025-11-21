/**
 * Wear Frequency Slider - Visual slider for wear frequency selection
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { getFrequencyLabel } from '@/lib/worth-it-calculator/calculator-logic';
import { ShirtIcon, Shirt, Coat, type LucideIcon } from 'lucide-react';

interface WearFrequencySliderProps {
  form: UseFormReturn<any>;
}

const frequencyOptions: ReadonlyArray<{
  value: string;
  label: string;
  sublabel: string;
  icon: LucideIcon;
  wears: string;
}> = [
  {
    value: 'rarely',
    label: 'Rarely',
    sublabel: 'Special occasions',
    icon: ShirtIcon,
    wears: '~6 times/year',
  },
  {
    value: 'monthly',
    label: 'Monthly',
    sublabel: 'Occasional wear',
    icon: Shirt,
    wears: '~12 times/year',
  },
  {
    value: 'weekly',
    label: 'Weekly',
    sublabel: 'Regular rotation',
    icon: Coat,
    wears: '~52 times/year',
  },
  {
    value: 'daily',
    label: 'Daily',
    sublabel: 'Everyday staple',
    icon: Shirt,
    wears: '~200 times/year',
  },
] as const;

export function WearFrequencySlider({ form }: WearFrequencySliderProps) {
  return (
    <FormField
      control={form.control}
      name="wearFrequency"
      render={({ field }) => (
        <FormItem className="space-y-4">
          <FormLabel className="text-base font-semibold text-foreground">
            How often will you wear this?
          </FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {frequencyOptions.map((option) => (
                <div key={option.value} className="relative">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.value}
                    className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-border bg-background p-4 hover:bg-accent hover:border-sun-400 cursor-pointer transition-all peer-data-[state=checked]:border-sun-400 peer-data-[state=checked]:bg-sun-50"
                  >
                    <option.icon className="h-8 w-8 text-muted-foreground" />
                    <div className="text-center space-y-1">
                      <div className="font-semibold text-sm">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.sublabel}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {option.wears}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
