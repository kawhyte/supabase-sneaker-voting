/**
 * Calculator Hero - Hero section for cost per wear calculator
 */

'use client';

import { Calculator } from 'lucide-react';

export function CalculatorHero() {
  return (
    <section className="relative py-16 px-6 bg-gradient-to-b from-sun-100 to-white">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-sun-400 flex items-center justify-center">
            <Calculator className="h-8 w-8 text-slate-900" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
          Cost Per Wear Calculator
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Make smarter wardrobe decisions. Calculate if that clothing item is really worth buying
          based on how often you'll actually wear it.
        </p>

        {/* Value Props */}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>No signup required</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Category-aware targets</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Instant results</span>
          </div>
        </div>
      </div>
    </section>
  );
}
