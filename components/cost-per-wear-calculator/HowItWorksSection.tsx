/**
 * How It Works Section - Dark editorial redesign
 */

'use client';

import { Calculator, Gem, RefreshCw, PiggyBank, Footprints, Shirt } from 'lucide-react';

export function HowItWorksSection() {
  return (
    <section className="py-20 px-6 bg-slate-50 border-t border-border">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Not Just a Calculator. <br/> It&apos;s an Investment Advisor.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Most calculators just divide price by wears. We go deeper — analyzing resale value,
            wardrobe utility, and item quality to give you the{' '}
            <strong className="text-foreground">True Net Cost</strong>.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* 1. The Asset Factor */}
          <div className="p-6 bg-background border border-border rounded-2xl hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <PiggyBank className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-foreground">1. The Asset Factor</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We treat high-value items (like sneakers) as assets, not just expenses.
                  If a $200 pair has a $100 resale value, your{' '}
                  <strong className="text-foreground">Net Cost is only $100</strong>.
                  We factor this &ldquo;exit strategy&rdquo; into your score.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Quality & Lifespan */}
          <div className="p-6 bg-background border border-border rounded-2xl hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Gem className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-foreground">2. Quality Over Quantity</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Cheap items often cost more in the long run because they don&apos;t last.
                  Our algorithm rewards{' '}
                  <strong className="text-foreground">&ldquo;High Quality&rdquo;</strong> ratings by
                  extending the estimated lifespan, lowering your long-term cost per wear.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Wardrobe Utility */}
          <div className="p-6 bg-background border border-border rounded-2xl hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-foreground">3. The Clutter Penalty</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Buying a duplicate of something you already own reduces the value of both items.
                  We apply a <strong className="text-foreground">&ldquo;Clutter Penalty&rdquo;</strong> to
                  duplicates and a{' '}
                  <strong className="text-foreground">&ldquo;Utility Bonus&rdquo;</strong> to items
                  that fill a gap in your rotation.
                </p>
              </div>
            </div>
          </div>

          {/* 4. The Smart Buy Score */}
          <div className="p-6 bg-background border border-border rounded-2xl hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-foreground">4. The &ldquo;Smart Buy&rdquo; Score</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We combine all these factors into a single{' '}
                  <strong className="text-foreground">0–100 Score</strong>.{' '}
                  <span className="text-green-400 font-semibold">80+</span> = Buy Now.{' '}
                  <span className="text-primary font-semibold">50–79</span> = Wait for Market Drop.{' '}
                  <span className="text-red-400 font-semibold">&lt;50</span> = Pass.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Real-World Comparison Table */}
        <div className="bg-background rounded-2xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-2xl font-bold text-white">The Difference in Action</h3>
            <p className="text-muted-foreground text-sm mt-1">Why &ldquo;Cheap&rdquo; isn&apos;t always &ldquo;Good Value&rdquo;</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-muted-foreground font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Resale</th>
                  <th className="px-6 py-4">Quality</th>
                  <th className="px-6 py-4 text-right">True Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="border-l-2 border-primary hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                    <Footprints className="h-4 w-4 text-muted-foreground flex-shrink-0" /> Limited Jordans
                  </td>
                  <td className="px-6 py-4 text-foreground/80">$220</td>
                  <td className="px-6 py-4 text-green-400">High (~$150)</td>
                  <td className="px-6 py-4 text-foreground/80">High</td>
                  <td className="px-6 py-4 text-right font-bold text-green-400">
                    SMART BUY (92/100)
                  </td>
                </tr>
                <tr className="border-l-2 border-red-500 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                    <Shirt className="h-4 w-4 text-muted-foreground flex-shrink-0" /> Fast Fashion Tee
                  </td>
                  <td className="px-6 py-4 text-foreground/80">$25</td>
                  <td className="px-6 py-4 text-muted-foreground">$0</td>
                  <td className="px-6 py-4 text-red-400">Low</td>
                  <td className="px-6 py-4 text-right font-bold text-red-400">
                    PASS (35/100)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
