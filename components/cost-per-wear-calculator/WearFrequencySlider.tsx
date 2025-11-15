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

interface WearFrequencySliderProps {
  form: UseFormReturn<any>;
}

const frequencyOptions = [
  {
    value: 'rarely',
    label: 'Rarely',
    sublabel: 'Special occasions',
    emoji: '👗',
    wears: '~6 times/year',
  },
  {
    value: 'monthly',
    label: 'Monthly',
    sublabel: 'Occasional wear',
    emoji: '👔',
    wears: '~12 times/year',
  },
  {
    value: 'weekly',
    label: 'Weekly',
    sublabel: 'Regular rotation',
    emoji: '🧥',
    wears: '~52 times/year',
  },
  {
    value: 'daily',
    label: 'Daily',
    sublabel: 'Everyday staple',
    emoji: '👟',
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
                    <span className="text-2xl">{option.emoji}</span>
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
