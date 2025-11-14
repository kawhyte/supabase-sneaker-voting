/**
 * Purchase Prevention Settings
 *
 * Duplication Warning Configuration:
 * - Toggle to enable/disable duplicate item detection
 * - Warns when adding items similar to ones already owned (same category + color)
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';

interface DuplicationWarningSettings {
  enable_duplication_warnings: boolean;
  enable_similar_item_warnings: boolean;
}

export function PurchasePreventionSettings() {
  const supabase = createClient();
  const [settings, setSettings] = useState<DuplicationWarningSettings>({
    enable_duplication_warnings: true,
    enable_similar_item_warnings: true,
  });
  const [originalSettings, setOriginalSettings] = useState<DuplicationWarningSettings>({
    enable_duplication_warnings: true,
    enable_similar_item_warnings: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Track unsaved changes
  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  // Manual save function
  const handleSave = async () => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          enable_duplication_warnings: settings.enable_duplication_warnings,
          enable_similar_item_warnings: settings.enable_similar_item_warnings,
        })
        .eq('id', userId);

      if (error) throw error;

      setOriginalSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save as fallback after 60 seconds
  const { isSaving: isAutoSaving } = useAutoSave({
    data: settings,
    onSave: async (data, signal) => {
      if (!userId) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          enable_duplication_warnings: data.enable_duplication_warnings,
          enable_similar_item_warnings: data.enable_similar_item_warnings,
        })
        .eq('id', userId)
        .abortSignal(signal);

      if (error) throw error;

      setOriginalSettings(data);
    },
    delay: 60000, // 60 seconds
    showToasts: false, // Disable toasts for auto-save
    enabled: !isLoading && userId !== null && hasUnsavedChanges
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
          .select('enable_duplication_warnings, enable_similar_item_warnings')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile) {
          const loadedSettings = {
            enable_duplication_warnings: profile.enable_duplication_warnings ?? true,
            enable_similar_item_warnings: profile.enable_similar_item_warnings ?? true,
          };
          setSettings(loadedSettings);
          setOriginalSettings(loadedSettings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast.error('Failed to load duplication warning settings');
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

  // Handle similar item warnings toggle
  const handleSimilarItemToggle = (checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      enable_similar_item_warnings: checked,
    }));
  };

  if (isLoading) {
    return (
      <Card className="border border-stone-200  ">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Duplication Warnings
          </CardTitle>
          <CardDescription>
            Configure duplicate item detection
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
          <AlertTriangle className="h-5 w-5" />
          Duplication Warnings
        </CardTitle>
        <CardDescription>
          Get notified when adding items similar to ones you already own
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Exact Duplicate Detection Setting */}
        <div className="space-y-4">
          <div className=" dense flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Exact Duplicate Detection
                <span className="text-xs font-normal text-muted-foreground">(Recommended)</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Warns when adding items that are nearly identical (≥85% match). Catches typos and variations.
              </p>
            </div>
            <Switch
              checked={settings.enable_duplication_warnings}
              onCheckedChange={handleDuplicationToggle}
              disabled={isSaving}
              className="dense ml-2"
            />
          </div>

          {settings.enable_duplication_warnings && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-700">
                <p className="font-semibold mb-1">Example:</p>
                <p>
                  Adding <span className="font-semibold">"Black Nike Hoodie"</span> when you own{' '}
                  <span className="font-semibold">"Black Nike Hoody"</span> (typo) → Shows warning with 92% match
                </p>
              </div>
            </div>
          )}

          {!settings.enable_duplication_warnings && (
            <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg flex gap-2">
              <AlertCircle className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700">
                Exact duplicate detection is disabled. You won't be warned about nearly identical items.
              </p>
            </div>
          )}
        </div>

        {/* Similar Item Detection Setting */}
        <div className="space-y-4 pt-4 border-t border-stone-200">
          <div className=" dense flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Similar Item Detection
                <span className="text-xs font-normal text-muted-foreground">(Advanced)</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Warns when adding items that are very similar but not exact duplicates (60-84% match).
              </p>
            </div>
            <Switch
              checked={settings.enable_similar_item_warnings}
              onCheckedChange={handleSimilarItemToggle}
              disabled={isSaving}
              className="dense ml-2"
            />
          </div>

          {settings.enable_similar_item_warnings && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700">
                <p className="font-semibold mb-1">Example:</p>
                <p>
                  Adding <span className="font-semibold">"Charcoal Nike Hoodie"</span> when you own{' '}
                  <span className="font-semibold">"Dark Grey Nike Hoodie"</span> → Shows warning with 68% match
                </p>
              </div>
            </div>
          )}

          {!settings.enable_similar_item_warnings && (
            <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg flex gap-2">
              <AlertCircle className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700">
                Similar item detection is disabled. You'll only be warned about exact duplicates.
              </p>
            </div>
          )}
        </div>

        {/* Save Button Section */}
        <div className="pt-4 border-t border-stone-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 text-xs text-amber-600">
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>You have unsaved changes</span>
                </div>
              )}
              {!hasUnsavedChanges && (
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Check className="h-3 w-3" />
                  All changes saved
                </p>
              )}
              {isAutoSaving && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground ml-3">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Auto-saving...</span>
                </div>
              )}
            </div>
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Changes auto-save after 60 seconds of inactivity
          </p>
        </div>

        {/* Info section */}
        <div className="pt-4 border-t border-stone-200 space-y-3">
          <h3 className="text-sm font-semibold">How it works</h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-sun-400 font-bold">•</span>
              <span>
                <span className="font-semibold">Smart Matching:</span> Uses fuzzy text matching with weighted scoring (Category 40%, Color 30%, Brand 20%, Model 10%)
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-sun-400 font-bold">•</span>
              <span>
                <span className="font-semibold">Typo Tolerant:</span> Catches duplicates even with spelling errors or formatting differences
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-sun-400 font-bold">•</span>
              <span>
                <span className="font-semibold">Colorway Smart:</span> Won't warn about same brand + different colors (e.g., Black Hoodie vs White Hoodie)
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-sun-400 font-bold">•</span>
              <span>
                <span className="font-semibold">Non-Blocking:</span> Warnings show similarity score and similar items, but you can still add the item
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
