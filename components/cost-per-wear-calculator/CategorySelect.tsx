/**
 * Category Select - Category dropdown with icons
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORY_CONFIGS, type ItemCategory } from '@/components/types/item-category';

interface CategorySelectProps {
  form: UseFormReturn<any>;
}

export function CategorySelect({ form }: CategorySelectProps) {
  const categories: ItemCategory[] = ['shoes', 'tops', 'bottoms', 'outerwear', 'accessories'];

  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-semibold text-foreground">
            What type of item is this?
          </FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {categories.map((cat) => {
                const config = CATEGORY_CONFIGS[cat];
                const Icon = config.icon;
                return (
                  <SelectItem key={cat} value={cat} className="text-base py-3">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span>{config.labelPlural}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
