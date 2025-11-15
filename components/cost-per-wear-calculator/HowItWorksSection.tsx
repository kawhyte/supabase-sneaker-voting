/**
 * How It Works Section - Educational content about cost per wear
 */

'use client';

import { Card } from '@/components/ui/card';
import { BookOpen, Target, TrendingUp, Heart } from 'lucide-react';

export function HowItWorksSection() {
  return (
    <section className="py-16 px-6 bg-stone-50">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            How Cost Per Wear Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Make smarter fashion decisions by understanding the true value of your purchases
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* The Formula */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-sun-400 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-6 w-6 text-slate-900" />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-xl font-bold text-foreground">The Formula</h3>
                <div className="p-3 bg-stone-100 rounded-lg font-mono text-sm text-foreground border border-stone-200">
                  Price ÷ Number of Wears = Cost Per Wear
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Simple math that reveals the true cost of your clothing. A $200 jacket worn 100
                  times costs only $2 per wear, while a $50 shirt worn twice costs $25 per wear.
                </p>
              </div>
            </div>
          </Card>

          {/* Category-Aware Targets */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-xl font-bold text-foreground">Category-Aware Targets</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shoes (Budget):</span>
                    <span className="font-semibold text-foreground">$2/wear</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Outerwear (Premium):</span>
                    <span className="font-semibold text-foreground">$8/wear</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accessories (Luxury):</span>
                    <span className="font-semibold text-foreground">$10/wear</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Different clothing types have different wear patterns. Our calculator uses
                  industry-standard targets tailored to each category and price range.
                </p>
              </div>
            </div>
          </Card>

          {/* Smart Shopping */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-xl font-bold text-foreground">Make Better Decisions</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <span>Avoid impulse purchases that won't get worn</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <span>Justify quality investments that last</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <span>Reduce wardrobe clutter and save money</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <span>Build a sustainable, intentional wardrobe</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Sustainable Fashion */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-xl font-bold text-foreground">Sustainable Fashion</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Cost per wear thinking promotes sustainability by encouraging thoughtful
                  purchases. When you buy items you'll actually wear, you reduce waste, support
                  quality over quantity, and build a wardrobe that serves you better while
                  minimizing environmental impact.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Example Scenarios */}
        <div className="bg-white rounded-2xl p-8 border border-border shadow-md">
          <h3 className="text-2xl font-bold text-foreground mb-6">Real-World Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Scenario 1 */}
            <div className="space-y-3">
              <div className="text-4xl">👟</div>
              <div className="font-semibold text-foreground">Daily Sneakers</div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Price: $120</div>
                <div>Wears: 200/year</div>
                <div className="font-semibold text-green-600">CPW: $0.60/wear ✨</div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Excellent value! Regular use makes even premium sneakers worthwhile.
              </p>
            </div>

            {/* Scenario 2 */}
            <div className="space-y-3">
              <div className="text-4xl">🧥</div>
              <div className="font-semibold text-foreground">Winter Coat</div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Price: $300</div>
                <div>Wears: 40/year</div>
                <div className="font-semibold text-green-600">CPW: $7.50/wear 👍</div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Good investment. Quality outerwear that lasts multiple seasons pays off.
              </p>
            </div>

            {/* Scenario 3 */}
            <div className="space-y-3">
              <div className="text-4xl">👗</div>
              <div className="font-semibold text-foreground">Trendy Dress</div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Price: $80</div>
                <div>Wears: 3/year</div>
                <div className="font-semibold text-red-600">CPW: $26.67/wear ⚠️</div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Think twice. High cost per wear suggests this might not be worth it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
