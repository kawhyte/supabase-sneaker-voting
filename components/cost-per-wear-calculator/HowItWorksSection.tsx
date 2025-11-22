/**
 * How It Works Section - Updated for the new "Smart Buy" Logic
 */

'use client';

import { Card } from '@/components/ui/card';
import { Calculator, Gem, RefreshCw, PiggyBank } from 'lucide-react';

export function HowItWorksSection() {
  return (
    <section className="py-16 px-6 bg-stone-50">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground">
            Not Just a Calculator. <br/> It's an Investment Advisor.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Most calculators just divide price by wears. We go deeper, analyzing resale value, 
            wardrobe utility, and item quality to give you the <strong>True Net Cost</strong>.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. The Asset Factor */}
          <Card className="p-6 bg-white border-stone-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <PiggyBank className="h-6 w-6 text-blue-700" />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-xl font-bold text-foreground">1. The Asset Factor</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We treat high-value items (like sneakers) as assets, not just expenses. 
                  If a $200 pair has a $100 resale value, your <strong>Net Cost is only $100</strong>. 
                  We factor this "exit strategy" into your score.
                </p>
              </div>
            </div>
          </Card>

          {/* 2. Quality & Lifespan */}
          <Card className="p-6 bg-white border-stone-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Gem className="h-6 w-6 text-purple-700" />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-xl font-bold text-foreground">2. Quality Over Quantity</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Cheap items often cost more in the long run because they don't last. 
                  Our algorithm rewards <strong>"High Quality"</strong> ratings by extending the 
                  estimated lifespan, lowering your long-term cost per wear.
                </p>
              </div>
            </div>
          </Card>

          {/* 3. Wardrobe Utility */}
          <Card className="p-6 bg-white border-stone-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="h-6 w-6 text-orange-700" />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-xl font-bold text-foreground">3. The Clutter Penalty</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Buying a duplicate of something you already own reduces the value of both items. 
                  We apply a <strong>"Clutter Penalty"</strong> to duplicates and a 
                  <strong>"Utility Bonus"</strong> to items that fill a gap in your rotation.
                </p>
              </div>
            </div>
          </Card>

          {/* 4. The Smart Buy Score */}
          <Card className="p-6 bg-white border-stone-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Calculator className="h-6 w-6 text-green-700" />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-xl font-bold text-foreground">4. The "Smart Buy" Score</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We combine all these factors into a single <strong>0-100 Score</strong>. 
                  <br/>
                  <span className="text-green-600 font-semibold">80+</span> = Buy Now. 
                  <span className="text-sun-500 font-semibold ml-2">50-79</span> = Wait for Sale. 
                  <span className="text-red-500 font-semibold ml-2">&lt;50</span> = Pass.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Real-World Comparison Table */}
        <div className="bg-white rounded-2xl border border-border shadow-md overflow-hidden">
          <div className="p-6 border-b border-stone-100">
            <h3 className="text-2xl font-bold text-foreground">The Difference in Action</h3>
            <p className="text-muted-foreground text-sm">Why "Cheap" isn't always "Good Value"</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50 text-stone-500 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Resale</th>
                  <th className="px-6 py-4">Quality</th>
                  <th className="px-6 py-4 text-right">True Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <tr className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium">
                    <span className="mr-2">👟</span> Limited Jordans
                  </td>
                  <td className="px-6 py-4">$220</td>
                  <td className="px-6 py-4 text-green-600">High (~$150)</td>
                  <td className="px-6 py-4">High</td>
                  <td className="px-6 py-4 text-right font-bold text-green-600">
                    SMART BUY (92/100)
                  </td>
                </tr>
                <tr className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium">
                    <span className="mr-2">👕</span> Fast Fashion Tee
                  </td>
                  <td className="px-6 py-4">$25</td>
                  <td className="px-6 py-4 text-stone-400">$0</td>
                  <td className="px-6 py-4 text-red-500">Low</td>
                  <td className="px-6 py-4 text-right font-bold text-red-500">
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