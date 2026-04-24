// components/cost-per-wear-calculator/CalculatorForm.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalculatorResults, generateSmartRecommendation, calculateSmartMetrics, CalculatorInput, ResalePotential, getScenarioLabel } from '@/lib/worth-it-calculator/calculator-logic';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from 'sonner';
import {
  Sparkles, ArrowRight,
  XCircle, Banknote, Flame, Coins, Puzzle, Palette, Copy,
  Footprints, Activity, Trophy, Wind, Dumbbell, Mountain, Package,
  Search, X as XIcon, Loader2, Bell, Zap, RotateCw, Star,
} from 'lucide-react';
import { ResultsDisplay } from './ResultsDisplay';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';

interface EbayResult {
  title: string;
  cleanModelName: string;
  brand: string;
  sku: string;
  color: string;
  imageUrl: string;
  price: string;
}

function parseEbayPrice(raw: string): number {
  const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

const smartCalculatorSchema = z.object({
  price: z.coerce.number().min(1, "Price is required"),
  category: z.enum(['lifestyle', 'running', 'basketball', 'skate', 'training', 'boots', 'other']),
  rotationScenario: z.enum(['daily_beater', 'weekend_rotation', 'grail']),
  resalePotential: z.enum(['none', 'low', 'medium', 'high']),
  wardrobeRole: z.enum(['gap_fill', 'upgrade', 'variety', 'duplicate']),
});

type FormData = z.infer<typeof smartCalculatorSchema>;

export function CalculatorForm() {
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  // eBay search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<EbayResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSneaker, setSelectedSneaker] = useState<EbayResult | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Enrichment state for 3-factor score
  const [marketValue, setMarketValue] = useState<number | undefined>();
  const [ownedSameBrand, setOwnedSameBrand] = useState<number | undefined>();

  // Wishlist CTA state
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Debounced eBay search
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchInput = useCallback((val: string) => {
    setSearchQuery(val);
    setSelectedSneaker(null);
    setMarketValue(undefined);
    setOwnedSameBrand(undefined);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (val.length < 3) { setSearchResults([]); setShowDropdown(false); return; }
    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/sneaker-search?q=${encodeURIComponent(val)}`);
        const data = await res.json();
        setSearchResults(data.results ?? []);
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  }, []);

  const handleSelectSneaker = useCallback(async (sneaker: EbayResult) => {
    setSelectedSneaker(sneaker);
    setSearchQuery(`${sneaker.brand} ${sneaker.cleanModelName}`);
    setShowDropdown(false);
    const mv = parseEbayPrice(sneaker.price);
    if (mv > 0) {
      setMarketValue(mv);
      form.setValue('price', mv);          // Auto-fill asking price from eBay
    }
    form.setValue('category', 'lifestyle'); // Default category for sneakers

    // Brand-to-resale-potential mapping
    const brandResaleMap: [string, ResalePotential][] = [
      ['jordan', 'high'], ['off-white', 'high'], ['travis scott', 'high'], ['yeezy', 'high'],
      ['nike', 'medium'], ['adidas', 'medium'], ['new balance', 'medium'],
      ['converse', 'low'], ['vans', 'low'], ['asics', 'low'], ['reebok', 'low'],
    ];
    const brandLower = sneaker.brand.toLowerCase();
    const defaultResale = brandResaleMap.find(([k]) => brandLower.includes(k))?.[1] ?? 'low';
    form.setValue('resalePotential', defaultResale);

    // Query collection overlap if authenticated
    if (userId && sneaker.brand) {
      const { count } = await supabase
        .from('items')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'owned')
        .eq('is_archived', false)
        .ilike('brand', sneaker.brand);
      setOwnedSameBrand(count ?? 0);
    }
  }, [userId, supabase]);

  const handleAddToWishlist = useCallback(async () => {
    if (!results || !selectedSneaker || !userId) return;
    setIsSaving(true);
    try {
      // Create wishlisted item
      const { data: item, error: itemErr } = await supabase
        .from('items')
        .insert({
          user_id: userId,
          brand: selectedSneaker.brand,
          model: selectedSneaker.cleanModelName,
          status: 'wishlisted',
          retail_price: results.input.price,
          category: results.input.category,
          color: selectedSneaker.color || null,
        })
        .select('id')
        .single();

      if (itemErr || !item) throw itemErr;

      // Create price monitor with target buy price
      await supabase.from('price_monitors').insert({
        user_id: userId,
        item_id: item.id,
        store_name: 'eBay',
        tracking_provider: 'ebay',
        target_price: results.metrics.targetBuyPrice,
        is_active: true,
      });

      toast.success(`Added to wishlist. You'll be alerted if the price drops to $${results.metrics.targetBuyPrice}.`);
    } catch {
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [results, selectedSneaker, userId, supabase]);

  const form = useForm<FormData>({
    resolver: zodResolver(smartCalculatorSchema),
    defaultValues: {
      category: undefined,
      rotationScenario: 'weekend_rotation',
      resalePotential: 'none',
      wardrobeRole: 'variety',
    },
  });

  const onSubmit = (data: FormData) => {
    const input: CalculatorInput = {
      ...data,
      marketValue,
      ownedSameBrand,
    };
    const metrics = calculateSmartMetrics(input);
    const recommendation = generateSmartRecommendation(metrics, input);

    setResults({ metrics, recommendation, input });

    setTimeout(() => {
      document.getElementById('results-view')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const category = form.watch('category');

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border border-border shadow-none bg-card overflow-hidden rounded-2xl">
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
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
                    <span className="bg-primary text-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    The Basics
                  </h3>
                  <p className="text-slate-500 text-sm ml-8">What are we looking at?</p>
                </div>

                {/* eBay Sneaker Search */}
                <div ref={searchRef} className="relative mb-6">
                  <p className="text-sm font-medium text-slate-700 mb-2">Search eBay for market value <span className="text-muted-foreground font-normal">(optional — boosts score accuracy)</span></p>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => handleSearchInput(e.target.value)}
                      onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                      placeholder="e.g. Nike Air Max 90, Jordan 1 Retro…"
                      className="w-full pl-9 pr-9 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {isSearching && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 animate-spin" />}
                    {searchQuery && !isSearching && (
                      <button
                        type="button"
                        onClick={() => { setSearchQuery(''); setSelectedSneaker(null); setMarketValue(undefined); setOwnedSameBrand(undefined); setSearchResults([]); }}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Search dropdown */}
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                      {searchResults.map((r, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectSneaker(r)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted text-left transition-colors"
                        >
                          {r.imageUrl && (
                            <img src={r.imageUrl} alt="" className="w-10 h-10 object-contain rounded bg-slate-100 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-sm text-foreground truncate">{r.brand} {r.cleanModelName}</div>
                            <div className="text-xs text-muted-foreground">{r.color} · eBay avg {r.price}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Selected sneaker pill */}
                  {selectedSneaker && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <Footprints className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>eBay market value set to <strong>${marketValue ?? '—'}</strong>. Score will include market delta.</span>
                      {ownedSameBrand != null && (
                        <span className="ml-1 text-slate-500">· {ownedSameBrand} {selectedSneaker.brand} pair{ownedSameBrand !== 1 ? 's' : ''} owned</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sneaker Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="lifestyle">
                              <div className="flex items-center gap-2">
                                <Footprints className="h-4 w-4" /> Lifestyle / Casual
                              </div>
                            </SelectItem>
                            <SelectItem value="running">
                              <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4" /> Running
                              </div>
                            </SelectItem>
                            <SelectItem value="basketball">
                              <div className="flex items-center gap-2">
                                <Trophy className="h-4 w-4" /> Basketball
                              </div>
                            </SelectItem>
                            <SelectItem value="skate">
                              <div className="flex items-center gap-2">
                                <Wind className="h-4 w-4" /> Skate
                              </div>
                            </SelectItem>
                            <SelectItem value="training">
                              <div className="flex items-center gap-2">
                                <Dumbbell className="h-4 w-4" /> Training
                              </div>
                            </SelectItem>
                            <SelectItem value="boots">
                              <div className="flex items-center gap-2">
                                <Mountain className="h-4 w-4" /> Boots
                              </div>
                            </SelectItem>
                            <SelectItem value="other">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" /> Other
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
                            <span className="absolute left-3 top-2.5 text-slate-400">$</span>
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

                {/* Rotation Scenario */}
                <div className="mt-8">
                  <FormField
                    control={form.control}
                    name="rotationScenario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex justify-between">
                          <span>How will you rotate them?</span>
                          {field.value && (
                            <span className="text-primary font-medium">{getScenarioLabel(field.value)}</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2"
                          >
                            {[
                              { val: 'daily_beater', icon: Zap, label: 'Daily Beater', sub: '~15 wears/mo', color: 'text-orange-500' },
                              { val: 'weekend_rotation', icon: RotateCw, label: 'Weekend Rotation', sub: '~4 wears/mo', color: 'text-blue-500' },
                              { val: 'grail', icon: Star, label: 'Special Occasion / Grail', sub: '~1 wear/mo', color: 'text-purple-500' },
                            ].map((opt) => (
                              <FormItem key={opt.val}>
                                <FormControl>
                                  <RadioGroupItem value={opt.val} className="peer sr-only" />
                                </FormControl>
                                <FormLabel className={cn(
                                  "flex flex-col items-center text-center gap-2 rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-primary/5 cursor-pointer transition-all h-full",
                                  "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
                                )}>
                                  <opt.icon className={cn("w-5 h-5 mb-0.5", opt.color)} />
                                  <span className="font-semibold text-sm text-foreground leading-tight">{opt.label}</span>
                                  <span className="text-xs text-muted-foreground">{opt.sub}</span>
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
                  className="w-full mt-8 h-12 text-base group bg-primary hover:bg-primary text-slate-900 font-bold shadow-sm hover:shadow-md transition-all"
                  onClick={async () => {
                    const valid = await form.trigger(['price', 'category', 'rotationScenario']);
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
                    <span className="bg-primary text-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    The Reality Check
                  </h3>
                  <p className="text-slate-500 text-sm ml-8">Let&apos;s be honest about this purchase.</p>
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
                                  "flex items-start gap-3 rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-primary/50 cursor-pointer transition-all h-full",
                                  "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
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

                  {/* Resale Potential */}
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
                                  "flex flex-col items-center text-center gap-2 rounded-xl border-2 border-muted bg-transparent p-3 hover:bg-primary/5 cursor-pointer transition-all h-full",
                                  "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
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
                </div>

                <div className="flex gap-3 mt-12 pt-4 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary text-slate-900 font-bold transition-all">
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
        {results && (
          <>
            <ResultsDisplay results={results} />

            {/* Wishlist + Price Alert CTA */}
            {results.recommendation.verdict !== 'BUY_NOW' && (
              <Card className="mt-6 border border-border bg-card rounded-2xl overflow-hidden">
                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      Track this and get alerted when the price drops
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      We'll notify you when the market price hits your target of <strong>${results.metrics.targetBuyPrice}</strong>.
                    </p>
                  </div>
                  {userId ? (
                    <Button
                      onClick={handleAddToWishlist}
                      disabled={isSaving || !selectedSneaker}
                      className="flex-shrink-0 bg-primary hover:bg-primary text-slate-900 font-bold"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
                      {selectedSneaker ? 'Add to Wishlist & Set Alert' : 'Search a sneaker above to save'}
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="flex-shrink-0">
                      <a href="/login">Sign in to track price</a>
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}