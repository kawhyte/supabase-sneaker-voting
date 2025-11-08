/**
 * Purchase Prevention Settings
 *
 * Complete Smart Purchase Prevention UI with all three features:
 * - Quiz Gate: "Can You Style This?" modal configuration
 * - Duplication detection toggle
 * - Cooling-off period configuration (7, 14, 30 days)
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Clock, AlertTriangle, Sparkles, Check, Loader2 } from 'lucide-react';
import { getCoolingOffLabel, COOLING_OFF_OPTIONS, type CoolingOffDays } from '@/lib/cooling-off-period';
import { useAutoSave } from '@/hooks/useAutoSave';

interface PurchasePreventionSettings {
  enable_quiz_gate: boolean;
  quiz_gate_outfit_threshold: number;
  enable_duplication_warnings: boolean;
  preferred_cooling_off_days: number;
}

export function PurchasePreventionSettings() {
  const supabase = createClient();
  const [settings, setSettings] = useState<PurchasePreventionSettings>({
    enable_quiz_gate: true,
    quiz_gate_outfit_threshold: 3,
    enable_duplication_warnings: false,
    preferred_cooling_off_days: 7,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Auto-save settings changes
  const { isSaving: isAutoSaving, hasUnsavedChanges } = useAutoSave({
    data: settings,
    onSave: async (data, signal) => {
      if (!userId) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          enable_quiz_gate: data.enable_quiz_gate,
          quiz_gate_outfit_threshold: data.quiz_gate_outfit_threshold,
          enable_duplication_warnings: data.enable_duplication_warnings,
          preferred_cooling_off_days: data.preferred_cooling_off_days,
        })
        .eq('id', userId)
        .abortSignal(signal);

      if (error) throw error;
    },
    delay: 1000,
    showToasts: true,
    enabled: !isLoading && userId !== null
  });

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserId(user.id);

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('enable_quiz_gate, quiz_gate_outfit_threshold, enable_duplication_warnings, preferred_cooling_off_days')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile) {
          setSettings({
            enable_quiz_gate: profile.enable_quiz_gate ?? true,
            quiz_gate_outfit_threshold: profile.quiz_gate_outfit_threshold ?? 3,
            enable_duplication_warnings: profile.enable_duplication_warnings ?? false,
            preferred_cooling_off_days: profile.preferred_cooling_off_days ?? 7,
          });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast.error('Failed to load purchase prevention settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [supabase]);

  // Handle duplication warnings toggle
  const handleDuplicationToggle = (checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      enable_duplication_warnings: checked,
    }));
  };

  // Handle cooling-off period change
  const handleCoolingOffChange = (value: string) => {
    const days = parseInt(value) as CoolingOffDays;
    setSettings((prev) => ({
      ...prev,
      preferred_cooling_off_days: days,
    }));
  };

  // Handle quiz gate toggle
  const handleQuizGateToggle = (checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      enable_quiz_gate: checked,
    }));
  };

  // Handle quiz gate threshold change
  const handleQuizGateThresholdChange = (value: number[]) => {
    setSettings((prev) => ({
      ...prev,
      quiz_gate_outfit_threshold: value[0],
    }));
  };

  if (isLoading) {
    return (
      <Card className="border border-stone-200  ">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Smart Purchase Prevention
          </CardTitle>
          <CardDescription>
            Configure cooling-off periods and duplicate item warnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            Loading settings...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className=" bg-muted px-8 py-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Smart Purchase Prevention
        </CardTitle>
        <CardDescription>
          Control impulse buying with Quiz Gate, duplication warnings, and cooling-off periods
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Quiz Gate Setting */}
        <div className="space-y-4 pb-6 border-b border-stone-200">
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              "Can You Style This?" Quiz Gate
            </Label>
            <p className="text-xs text-muted-foreground">
              Require users to prove they can style an outfit before adding items to their wishlist
            </p>
          </div>

          {/* Quiz Gate Toggle */}
          <div className="dense flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Enable Quiz Gate</p>
              <p className="text-xs text-muted-foreground">
                Block wishlist additions until user creates required outfits
              </p>
            </div>
            <Switch
              checked={settings.enable_quiz_gate}
              onCheckedChange={handleQuizGateToggle}
              disabled={isAutoSaving}
              className="dense ml-2"
            />
          </div>

          {/* Quiz Gate Threshold Slider */}
          {settings.enable_quiz_gate && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
              <div>
                <Label htmlFor="quiz-threshold" className="text-sm font-medium">
                  Required Outfits: {settings.quiz_gate_outfit_threshold}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Users must create this many outfits before they can add items to their wishlist
                </p>
              </div>

              <Slider
                id="quiz-threshold"
                min={2}
                max={10}
                step={1}
                value={[settings.quiz_gate_outfit_threshold]}
                onValueChange={handleQuizGateThresholdChange}
                disabled={isAutoSaving}
                className="mt-3"
              />

              <div className="flex items-start gap-2 mt-3 p-2 bg-blue-100 rounded text-xs text-blue-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>
                  Setting this to <strong>{settings.quiz_gate_outfit_threshold} outfits</strong> means users won't see the quiz modal until they've created at least {settings.quiz_gate_outfit_threshold} outfits.
                </p>
              </div>
            </div>
          )}

          {!settings.enable_quiz_gate && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Quiz Gate is disabled. Users can add items to their wishlist without the "Can You Style This?" check.
              </p>
            </div>
          )}
        </div>

        {/* Cooling-Off Period Setting */}
        <div className="space-y-4 pb-6 border-b border-stone-200">
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Default Cooling-Off Period
            </Label>
            <p className="text-xs text-muted-foreground">
              Prevent impulsive purchases with a waiting period before buying wishlist items
            </p>
          </div>

          <Select
            value={settings.preferred_cooling_off_days.toString()}
            onValueChange={handleCoolingOffChange}
            disabled={isAutoSaving}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select cooling-off period" />
            </SelectTrigger>
            <SelectContent>
              {COOLING_OFF_OPTIONS.map((days) => (
                <SelectItem key={days} value={days.toString()}>
                  {getCoolingOffLabel(days as CoolingOffDays)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              This gives you time to reconsider before purchasing. The cooling-off period is based on
              behavioral economics research showing that one week is optimal for reconsidering decisions.
            </p>
          </div>
        </div>

        {/* Duplication Warnings Setting */}
        <div className="space-y-4">
          <div className=" dense flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Warn About Duplicate Items
              </Label>
              <p className="text-xs text-muted-foreground">
                Get notified when adding items similar to ones you already own (same category + color)
              </p>
            </div>
            <Switch
              checked={settings.enable_duplication_warnings}
              onCheckedChange={handleDuplicationToggle}
              disabled={isAutoSaving}
              className="dense ml-2"
            />
          </div>

          {settings.enable_duplication_warnings && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                When enabled, you'll see a warning if you try to add a{' '}
                <span className="font-semibold">top in black</span> when you already have 2+ black tops.
                This helps you identify where you might already have what you want to buy.
              </p>
            </div>
          )}
        </div>

        {/* Auto-save status */}
        <div className="pt-4 border-t border-stone-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Check className="h-3 w-3" />
              Changes are saved automatically
            </p>
            {isAutoSaving && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </div>
            )}
          </div>
        </div>

        {/* Info section */}
        <div className="pt-4 border-t border-stone-200 space-y-3">
          <h3 className="text-sm font-semibold">How it works</h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-sun-400 font-bold">1.</span>
              <span>
                Add an item to your wishlist and it will be locked for your chosen cooling-off period
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-sun-400 font-bold">2.</span>
              <span>
                After the waiting period ends, you can purchase it if it still feels right
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-sun-400 font-bold">3.</span>
              <span>
                Optional: Enable duplicate warnings to see when you're about to buy something very
                similar to what you own
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
