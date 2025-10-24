/**
 * Purchase Prevention Settings
 *
 * Phase 3 Smart Purchase Prevention UI
 * - Cooling-off period configuration (7, 14, 30 days)
 * - Duplication detection toggle
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Clock, AlertTriangle } from 'lucide-react';
import { getCoolingOffLabel, COOLING_OFF_OPTIONS, type CoolingOffDays } from '@/lib/cooling-off-period';

interface PurchasePreventionSettings {
  enable_duplication_warnings: boolean;
  preferred_cooling_off_days: number;
}

export function PurchasePreventionSettings() {
  const supabase = createClient();
  const [settings, setSettings] = useState<PurchasePreventionSettings>({
    enable_duplication_warnings: false,
    preferred_cooling_off_days: 7,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('enable_duplication_warnings, preferred_cooling_off_days')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile) {
          setSettings({
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

  // Save settings
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Not authenticated');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          enable_duplication_warnings: settings.enable_duplication_warnings,
          preferred_cooling_off_days: settings.preferred_cooling_off_days,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Purchase prevention settings saved');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

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

  if (isLoading) {
    return (
      <Card className="border border-stone-200">
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
    <Card className="border border-stone-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Smart Purchase Prevention
        </CardTitle>
        <CardDescription>
          Configure cooling-off periods and duplicate item warnings to help you make intentional purchases
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
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
            disabled={isSaving}
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
          <div className="flex items-start justify-between">
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
              disabled={isSaving}
              className="ml-2"
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

        {/* Save button */}
        <div className="pt-4 border-t border-stone-200">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full px-4 py-2 bg-sun-400 hover:bg-sun-600 disabled:bg-stone-300 text-foreground font-medium rounded-lg transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Purchase Prevention Settings'}
          </button>
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
