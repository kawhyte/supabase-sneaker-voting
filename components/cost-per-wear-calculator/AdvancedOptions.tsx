/**
 * Advanced Options - Expandable accordion with advanced fields
 */

'use client';

import { UseFormReturn } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { DollarSign } from 'lucide-react';

interface AdvancedOptionsProps {
  form: UseFormReturn<any>;
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
}

export function AdvancedOptions({ form, showAdvanced, setShowAdvanced }: AdvancedOptionsProps) {
  const isOnSale = form.watch('isOnSale');
  const similarItemsCount = form.watch('similarItemsCount') ?? 0;

  return (
    <Accordion
      type="single"
      collapsible
      value={showAdvanced ? 'advanced' : ''}
      onValueChange={(value) => setShowAdvanced(value === 'advanced')}
    >
      <AccordionItem value="advanced" className="border-t border-border">
        <AccordionTrigger className="text-base font-semibold hover:no-underline py-4">
          <div className="flex items-center gap-2">
            <span>Advanced Options</span>
            <span className="text-xs text-muted-foreground font-normal">
              (Optional - Get more detailed insights)
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-6 pt-4">
          {/* Brand (optional) */}
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Nike, Uniqlo, Zara"
                    {...field}
                    className="h-10"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Is On Sale */}
          <FormField
            control={form.control}
            name="isOnSale"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="h-4 w-4 mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-medium cursor-pointer">
                    This item is on sale
                  </FormLabel>
                  <FormDescription>
                    We'll analyze if the sale price makes it more worthwhile
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Original Price (conditional on sale) */}
          {isOnSale && (
            <FormField
              control={form.control}
              name="originalPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Original Price (Before Sale)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="200"
                        className="h-10 pl-10"
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
                </FormItem>
              )}
            />
          )}

          {/* Similar Items Count */}
          <FormField
            control={form.control}
            name="similarItemsCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How many similar items do you already own?</FormLabel>
                <FormDescription className="text-sm">
                  Similar = same category and general style (e.g., black sneakers, winter coats)
                </FormDescription>
                <FormControl>
                  <div className="space-y-3 pt-2">
                    <Slider
                      min={0}
                      max={10}
                      step={1}
                      value={[field.value ?? 0]}
                      onValueChange={(values) => field.onChange(values[0])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>None (0)</span>
                      <span className="font-semibold text-foreground text-base">
                        {similarItemsCount}
                      </span>
                      <span>Many (10+)</span>
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          {/* Has Same Color */}
          <FormField
            control={form.control}
            name="hasSameColor"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="h-4 w-4 mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-medium cursor-pointer">
                    I already own this color in this category
                  </FormLabel>
                  <FormDescription>
                    We'll warn you about potential redundancy
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Fills Gap */}
          <FormField
            control={form.control}
            name="fillsGap"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="h-4 w-4 mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-medium cursor-pointer">
                    This fills a missing need in my wardrobe
                  </FormLabel>
                  <FormDescription>
                    Essential items that fill gaps tend to get worn more
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
