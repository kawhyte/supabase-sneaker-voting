/**
 * Cost Per Wear Calculator Page
 *
 * Public page - no authentication required
 * Helps visitors make informed purchasing decisions
 * Purely educational, no database writes, no signup CTAs
 */

import { Metadata } from 'next';
import { CalculatorHero } from '@/components/cost-per-wear-calculator/CalculatorHero';
import { CalculatorForm } from '@/components/cost-per-wear-calculator/CalculatorForm';
import { HowItWorksSection } from '@/components/cost-per-wear-calculator/HowItWorksSection';

export const metadata: Metadata = {
  title: 'Cost Per Wear Calculator | PurrView',
  description:
    'Calculate if that clothing item is worth buying. Make smarter wardrobe decisions with our free cost-per-wear calculator. No signup required.',
  keywords: ['cost per wear', 'wardrobe calculator', 'sustainable fashion', 'smart shopping'],
};

export default function CostPerWearCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-stone-50 to-stone-100">
      {/* Hero Section */}
      <CalculatorHero />

      {/* Calculator Form + Results */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <CalculatorForm />
        </div>
      </section>

      {/* How It Works Educational Section */}
      <HowItWorksSection />

      {/* Footer Spacer */}
      <div className="h-16" />
    </div>
  );
}
