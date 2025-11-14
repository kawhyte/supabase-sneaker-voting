'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Trophy } from 'lucide-react';
import {
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface UserStats {
  total_items: number | null;
  average_cost_per_wear: number | null;
  achievements_unlocked: number | null;
  total_achievements: number | null;
}

export function WardrobeStatsWidget({ userId }: { userId?: string }) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    async function fetchStats() {
      try {
        const { data, error } = await supabase
          .from('user_stats')
          .select('total_items, average_cost_per_wear, achievements_unlocked, total_achievements')
          .eq('user_id', userId)
          .single();

        if (error) {
          // Handle "not found" error - user_stats row doesn't exist yet
          if (error.code === 'PGRST116') {
            console.warn('user_stats row not found for user:', userId);

            // Fetch actual achievement counts as fallback
            const { count: unlockedCount } = await supabase
              .from('user_achievements')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId);

            const { count: totalCount } = await supabase
              .from('achievements')
              .select('*', { count: 'exact', head: true })
              .eq('is_active', true);

            // Set default stats with actual counts
            setStats({
              total_items: 0,
              average_cost_per_wear: null,
              achievements_unlocked: unlockedCount || 0,
              total_achievements: totalCount || 11
            });
          } else {
            throw error;
          }
        } else {
          setStats(data);
        }
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : String(error);
        console.error('Error fetching wardrobe stats:', errorMessage, error);

        // Try to fetch actual achievement counts as fallback
        try {
          const { count: unlockedCount } = await supabase
            .from('user_achievements')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

          const { count: totalCount } = await supabase
            .from('achievements')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

          setStats({
            total_items: 0,
            average_cost_per_wear: null,
            achievements_unlocked: unlockedCount || 0,
            total_achievements: totalCount || 11
          });
        } catch {
          // Set safe default to prevent blank display
          setStats({
            total_items: 0,
            average_cost_per_wear: null,
            achievements_unlocked: 0,
            total_achievements: 11
          });
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [userId, supabase]);

  /**
   * Get cost per wear quality rating and color
   * Portfolio-level thresholds (higher than individual targets)
   */
  const getCostPerWearQuality = (costPerWear: number | null): { label: string; color: string; emoji: string } => {
    if (!costPerWear) return { label: 'Not tracked', color: 'text-muted-foreground', emoji: '' };

    if (costPerWear < 3) return { label: 'Excellent', color: 'text-green-600', emoji: '✨' };
    if (costPerWear < 7) return { label: 'Great', color: 'text-green-500', emoji: '⭐' };
    if (costPerWear < 12) return { label: 'Good', color: 'text-yellow-600', emoji: '👍' };
    if (costPerWear < 20) return { label: 'Fair', color: 'text-orange-600', emoji: '📊' };
    return { label: 'Needs Work', color: 'text-red-600', emoji: '⚠️' };
  };

  const getCostPerWearLabel = (costPerWear: number | null) => {
    if (!costPerWear) return 'Not calculated';
    return `$${costPerWear.toFixed(2)}/wear`;
  };

  if (isLoading) {
    return (
      <div className="px-2 py-2">
        <p className="text-xs text-muted-foreground">Loading stats...</p>
      </div>
    );
  }

  const avgCostPerWear = stats?.average_cost_per_wear ?? null;
  const quality = getCostPerWearQuality(avgCostPerWear);
  const unlockedCount = stats?.achievements_unlocked || 0;
  const totalCount = stats?.total_achievements || 11;
  const achievementPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <>
      <DropdownMenuLabel className="text-xs">
        <div className="space-y-3">
          {/* Total Items */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Items</span>
            <span className="font-semibold">{stats?.total_items || 0}</span>
          </div>

          {/* Avg Cost/Wear with Quality Label */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Avg Cost/Wear</span>
              <span className={`font-semibold ${quality.color}`}>
                {getCostPerWearLabel(avgCostPerWear)}
              </span>
            </div>
            {avgCostPerWear && (
              <div className="flex justify-end items-center gap-1">
                <span className={`text-xs font-medium ${quality.color}`}>
                  {quality.emoji} {quality.label}
                </span>
              </div>
            )}
          </div>

          {/* Achievements with Progress Bar */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center gap-2">
              <Trophy className="h-3 w-3 text-sun-400" />
              <span className="text-muted-foreground">
                {unlockedCount} of {totalCount} Achievements
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-sun-400 h-full transition-all duration-300"
                style={{ width: `${achievementPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator className="my-2" />
    </>
  );
}
