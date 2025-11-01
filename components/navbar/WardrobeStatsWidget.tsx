'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface UserStats {
  total_items: number | null;
  average_cost_per_wear: number | null;
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
          .select('total_items, average_cost_per_wear')
          .eq('user_id', userId)
          .single();

        if (error) {
          // Handle "not found" error - user_stats row doesn't exist yet
          if (error.code === 'PGRST116') {
            console.warn('user_stats row not found for user:', userId);
            // Set default stats
            setStats({ total_items: 0, average_cost_per_wear: null });
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
        // Set safe default to prevent blank display
        setStats({ total_items: 0, average_cost_per_wear: null });
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [userId, supabase]);

  const getCostPerWearColor = (costPerWear: number | null) => {
    if (!costPerWear) return 'text-muted-foreground';
    if (costPerWear < 5) return 'text-green-600';
    if (costPerWear < 10) return 'text-yellow-600';
    return 'text-red-600';
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

  return (
    <>
      <DropdownMenuLabel className="text-xs">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Items</span>
            <span className="font-semibold">{stats?.total_items || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Avg Cost/Wear</span>
            <span className={`font-semibold ${getCostPerWearColor(avgCostPerWear)}`}>
              {getCostPerWearLabel(avgCostPerWear)}
            </span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator className="my-2" />
    </>
  );
}
