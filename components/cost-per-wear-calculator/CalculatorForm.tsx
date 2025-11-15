/**
 * Calculator Form - Main form orchestrator with results display
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { CategorySelect } from './CategorySelect';
import { PriceInput } from './PriceInput';
import { WearFrequencySlider } from './WearFrequencySlider';
import { AdvancedOptions } from './AdvancedOptions';
import { ResultsDisplay } from './ResultsDisplay';
import type { ItemCategory } from '@/components/types/item-category';
import type { WearFrequency, CalculatorResults } from '@/lib/worth-it-calculator/calculator-logic';
import {
  calculateCalculatorMetrics,
  getRecommendation,
  calculateAdvancedInsights,
} from '@/lib/worth-it-calculator/calculator-logic';
import { trackCalculation } from '@/lib/worth-it-calculator/analytics';

const calculatorSchema = z.object({
  category: z.enum(['shoes', 'tops', 'bottoms', 'outerwear', 'accessories'], {
    required_error: 'Please select a category',
  }),
  price: z
    .number({ required_error: 'Price is required' })
    .min(1, 'Price must be at least $1')
    .max(10000, 'Price seems unrealistic (max $10,000)'),
  wearFrequency: z.enum(['rarely', 'monthly', 'weekly', 'daily'], {
    required_error: 'Please select how often you will wear this',
  }),

  // Advanced options (optional)
  brand: z.string().optional(),
  isOnSale: z.boolean().default(false),
  originalPrice: z.number().optional(),
  similarItemsCount: z.number().min(0).max(10).optional(),
  hasSameColor: z.boolean().optional(),
  fillsGap: z.boolean().optional(),
});

type CalculatorFormData = z.infer<typeof calculatorSchema>;

export function CalculatorForm() {
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const form = useForm<CalculatorFormData>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      wearFrequency: 'weekly',
      isOnSale: false,
      similarItemsCount: 0,
      hasSameColor: false,
      fillsGap: false,
    },
  });

  const onSubmit = (data: CalculatorFormData) => {
    // Calculate metrics
    const metrics = calculateCalculatorMetrics(
      data.price,
      data.category as ItemCategory,
      data.wearFrequency as WearFrequency
    );

    // Get recommendation
    const recommendation = getRecommendation(metrics, {
      category: data.category as ItemCategory,
      price: data.price,
      wearFrequency: data.wearFrequency as WearFrequency,
      brand: data.brand,
      isOnSale: data.isOnSale,
      originalPrice: data.originalPrice,
      similarItemsCount: data.similarItemsCount,
      hasSameColor: data.hasSameColor,
      fillsGap: data.fillsGap,
    });

    // Calculate advanced insights if any advanced options were used
    const hasAdvancedOptions =
      data.isOnSale ||
      (data.similarItemsCount !== undefined && data.similarItemsCount > 0) ||
      data.hasSameColor ||
      data.fillsGap !== undefined;

    const advancedInsights = hasAdvancedOptions
      ? calculateAdvancedInsights(metrics, {
          category: data.category as ItemCategory,
          price: data.price,
          wearFrequency: data.wearFrequency as WearFrequency,
          brand: data.brand,
          isOnSale: data.isOnSale,
          originalPrice: data.originalPrice,
          similarItemsCount: data.similarItemsCount,
          hasSameColor: data.hasSameColor,
          fillsGap: data.fillsGap,
        })
      : undefined;

    const calculatorInput = {
      category: data.category as ItemCategory,
      price: data.price,
      wearFrequency: data.wearFrequency as WearFrequency,
      brand: data.brand,
      isOnSale: data.isOnSale,
      originalPrice: data.originalPrice,
      similarItemsCount: data.similarItemsCount,
      hasSameColor: data.hasSameColor,
      fillsGap: data.fillsGap,
    };

    setResults({
      metrics,
      recommendation,
      advancedInsights,
      input: calculatorInput,
    });

    // Track calculation anonymously (fire and forget)
    trackCalculation(calculatorInput, recommendation.verdict);

    // Scroll to results (smooth)
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  return (
    <div className="space-y-8">
      {/* Form Card */}
      <Card className="p-6 sm:p-8 bg-card border-border shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Fields */}
            <div className="space-y-6">
              <CategorySelect form={form} />
              <PriceInput form={form} />
              <WearFrequencySlider form={form} />
            </div>

            {/* Advanced Options */}
            <AdvancedOptions
              form={form}
              showAdvanced={showAdvanced}
              setShowAdvanced={setShowAdvanced}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-sun-400 hover:bg-sun-500 text-slate-900 font-semibold"
            >
              Calculate Now
            </Button>
          </form>
        </Form>
      </Card>

      {/* Results Section */}
      {results && (
        <div id="results-section">
          <ResultsDisplay results={results} />
        </div>
      )}
    </div>
  );
}
