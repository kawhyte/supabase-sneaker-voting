// components/cost-per-wear-calculator/CalculatorForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalculatorResults, generateSmartRecommendation, calculateSmartMetrics, CalculatorInput } from '@/lib/worth-it-calculator/calculator-logic';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from '@/components/ui/separator';
// NEW IMPORTS: Puzzle, Palette, Copy
import {
  Sparkles, ArrowRight, TrendingDown, Shield, Gem,
  XCircle, Banknote, Flame, Coins, Puzzle, Palette, Copy,
  Footprints, Shirt, Scissors, Wind, ShoppingBag
} from 'lucide-react'; 
import { ResultsDisplay } from './ResultsDisplay';
import { cn } from '@/lib/utils';

const smartCalculatorSchema = z.object({
  price: z.coerce.number().min(1, "Price is required"),
  category: z.enum(['shoes', 'tops', 'bottoms', 'outerwear', 'accessories']),
  wearFrequency: z.enum(['rarely', 'monthly', 'weekly', 'daily']),
  resalePotential: z.enum(['none', 'low', 'medium', 'high']),
  wardrobeRole: z.enum(['gap_fill', 'upgrade', 'variety', 'duplicate']),
  qualityRating: z.enum(['low', 'average', 'high']),
});

type FormData = z.infer<typeof smartCalculatorSchema>;

export function CalculatorForm() {
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [step, setStep] = useState<1 | 2>(1); 

  const form = useForm<FormData>({
    resolver: zodResolver(smartCalculatorSchema),
    defaultValues: {
      category: undefined,
      wearFrequency: 'monthly',
      resalePotential: 'none',
      wardrobeRole: 'variety',
      qualityRating: 'average',
    },
  });

  const onSubmit = (data: FormData) => {
    const input: CalculatorInput = { ...data }; 
    const metrics = calculateSmartMetrics(input);
    const recommendation = generateSmartRecommendation(metrics, input);
    
    setResults({ metrics, recommendation, input } as any);
    
    setTimeout(() => {
        document.getElementById('results-view')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const category = form.watch('category');

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1 w-full bg-stone-100">
          <div 
            className="h-full bg-sun-400 transition-all duration-500 ease-out"
            style={{ width: results ? '100%' : step === 1 ? '50%' : '90%' }} 
          />
        </div>

        <div className="p-6 sm:p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* STEP 1: THE BASICS */}
              <div className={step === 1 ? 'block' : 'hidden'}>
                <div className="mb-6">
                  <h3 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
                    <span className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                    The Basics
                  </h3>
                  <p className="text-stone-500 text-sm ml-8">What are we looking at?</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="shoes">
                              <div className="flex items-center gap-2">
                                <Footprints className="h-4 w-4" /> Shoes / Sneakers
                              </div>
                            </SelectItem>
                            <SelectItem value="tops">
                              <div className="flex items-center gap-2">
                                <Shirt className="h-4 w-4" /> Tops / Shirts
                              </div>
                            </SelectItem>
                            <SelectItem value="bottoms">
                              <div className="flex items-center gap-2">
                                <Scissors className="h-4 w-4" /> Bottoms / Pants
                              </div>
                            </SelectItem>
                            <SelectItem value="outerwear">
                              <div className="flex items-center gap-2">
                                <Wind className="h-4 w-4" /> Outerwear
                              </div>
                            </SelectItem>
                            <SelectItem value="accessories">
                              <div className="flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4" /> Accessories
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Price */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-stone-400">$</span>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              className="pl-7" 
                              {...field} 
                              value={field.value || ''} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Frequency Slider */}
                <div className="mt-8">
                  <FormField
                    control={form.control}
                    name="wearFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex justify-between">
                          <span>How often will you wear it?</span>
                          <span className="text-sun-500 font-medium capitalize">{field.value}</span>
                        </FormLabel>
                        <FormControl>
                          <RadioGroup 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2"
                          >
                            {[
                              { val: 'rarely', label: 'Rarely', sub: '< 1/mo' },
                              { val: 'monthly', label: 'Monthly', sub: '1-2/mo' },
                              { val: 'weekly', label: 'Weekly', sub: '1/wk' },
                              { val: 'daily', label: 'Daily', sub: '3+/wk' },
                            ].map((opt) => (
                              <FormItem key={opt.val}>
                                <FormControl>
                                  <RadioGroupItem value={opt.val} className="peer sr-only" />
                                </FormControl>
                                <FormLabel className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-transparent p-3 hover:bg-stone-50 peer-data-[state=checked]:border-sun-400 peer-data-[state=checked]:bg-sun-50 cursor-pointer transition-all text-center h-full">
                                  <span className="font-semibold text-sm">{opt.label}</span>
                                  <span className="text-xs text-muted-foreground mt-1">{opt.sub}</span>
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="button" 
                  className="w-full mt-8 group"
                  onClick={async () => {
                    const valid = await form.trigger(['price', 'category', 'wearFrequency']);
                    if(valid) setStep(2);
                  }}
                >
                  Next: Value Factors 
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* STEP 2: VALUE FACTORS */}
              <div className={step === 2 ? 'block' : 'hidden'}>
                <div className="mb-6">
                  <h3 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
                    <span className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                    The Reality Check
                  </h3>
                  <p className="text-stone-500 text-sm ml-8">Let&apos;s be honest about this purchase.</p>
                </div>

                <div className="space-y-8">
                  {/* Wardrobe Role - NOW USING LUCIDE ICONS */}
                  <FormField
                    control={form.control}
                    name="wardrobeRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">What role does this item fill?</FormLabel>
                        <FormControl>
                          <RadioGroup 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"
                          >
                            {[
                              { val: 'gap_fill', icon: Puzzle, label: 'Fills a Gap', desc: 'Something I essentially need', color: 'text-blue-500' },
                              { val: 'upgrade', icon: Sparkles, label: 'Upgrade', desc: 'Replacing an old/worn item', color: 'text-purple-500' },
                              { val: 'variety', icon: Palette, label: 'Variety', desc: 'Different color/style', color: 'text-orange-500' },
                              { val: 'duplicate', icon: Copy, label: 'Duplicate', desc: 'I have something similar', color: 'text-red-500' },
                            ].map((opt) => (
                              <FormItem key={opt.val}>
                                <FormControl>
                                  <RadioGroupItem value={opt.val} className="peer sr-only" />
                                </FormControl>
                                <FormLabel className={cn(
                                  "flex items-start gap-3 rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-stone-50 cursor-pointer transition-all h-full",
                                  "peer-data-[state=checked]:border-slate-900 peer-data-[state=checked]:bg-slate-50"
                                )}>
                                  {/* Icon Render */}
                                  <opt.icon className={cn("w-6 h-6 mt-0.5", opt.color)} />
                                  
                                  <div>
                                    <div className="font-semibold text-foreground">{opt.label}</div>
                                    <div className="text-xs text-muted-foreground mt-1">{opt.desc}</div>
                                  </div>
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* UX SEPARATOR */}
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground font-semibold tracking-wider">
                        Asset Value Details
                      </span>
                    </div>
                  </div>

                  {/* ASSET VALUE SECTION */}
                  <div className="space-y-8">
                    {/* Quality Rating */}
                    <FormField
                        control={form.control}
                        name="qualityRating"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base font-semibold">Quality & Durability</FormLabel>
                            <FormControl>
                            <RadioGroup 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2"
                            >
                                {[
                                { val: 'low', icon: TrendingDown, label: 'Low', desc: 'Fast Fashion / Delicate' },
                                { val: 'average', icon: Shield, label: 'Average', desc: 'Standard Durability' },
                                { val: 'high', icon: Gem, label: 'Premium', desc: 'Buy It For Life' },
                                ].map((opt) => (
                                <FormItem key={opt.val}>
                                    <FormControl>
                                    <RadioGroupItem value={opt.val} className="peer sr-only" />
                                    </FormControl>
                                    <FormLabel className={cn(
                                    "flex flex-col items-center text-center gap-2 rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-stone-50 cursor-pointer transition-all h-full",
                                    "peer-data-[state=checked]:border-slate-900 peer-data-[state=checked]:bg-slate-50"
                                    )}>
                                    <opt.icon className={cn(
                                        "w-6 h-6 mb-1", 
                                        opt.val === 'low' ? 'text-red-500' : opt.val === 'high' ? 'text-blue-500' : 'text-slate-500'
                                    )} />
                                    <div>
                                        <div className="font-semibold text-foreground">{opt.label}</div>
                                        <div className="text-xs text-muted-foreground mt-1 leading-tight">{opt.desc}</div>
                                    </div>
                                    </FormLabel>
                                </FormItem>
                                ))}
                            </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    {/* Resale Potential */}
                    {(category === 'shoes' || category === 'accessories' || category === 'outerwear') && (
                        <FormField
                        control={form.control}
                        name="resalePotential"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-base font-semibold">Resale Potential</FormLabel>
                            <FormControl>
                                <RadioGroup 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2"
                                >
                                {[
                                    { val: 'none', icon: XCircle, label: 'None', desc: '$0' },
                                    { val: 'low', icon: Coins, label: 'Low', desc: '~10%' },
                                    { val: 'medium', icon: Banknote, label: 'Good', desc: '~25%' },
                                    { val: 'high', icon: Flame, label: 'Hype', desc: '~50%+' },
                                ].map((opt) => (
                                    <FormItem key={opt.val}>
                                    <FormControl>
                                        <RadioGroupItem value={opt.val} className="peer sr-only" />
                                    </FormControl>
                                    <FormLabel className={cn(
                                        "flex flex-col items-center text-center gap-2 rounded-xl border-2 border-muted bg-transparent p-3 hover:bg-stone-50 cursor-pointer transition-all h-full",
                                        "peer-data-[state=checked]:border-slate-900 peer-data-[state=checked]:bg-slate-50"
                                    )}>
                                        <opt.icon className="w-5 h-5 text-slate-600 mb-1" />
                                        <div>
                                        <div className="font-semibold text-sm text-foreground">{opt.label}</div>
                                        <div className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</div>
                                        </div>
                                    </FormLabel>
                                    </FormItem>
                                ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-12 pt-4 border-t border-stone-100">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button type="submit" className="flex-1 bg-sun-400 hover:bg-sun-500 text-slate-900 font-bold shadow-md hover:shadow-lg transition-all">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Reveal Verdict
                  </Button>
                </div>
              </div>

            </form>
          </Form>
        </div>
      </Card>

      {/* RESULTS SECTION */}
      <div id="results-view" className="pt-12">
        {results && <ResultsDisplay results={results} />}
      </div>
    </div>
  );
}