'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import {
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface AchievementStats {
  achievements_unlocked: number | null;
  total_achievements: number | null;
}

export function AchievementsPreview({ userId }: { userId?: string }) {
  const [stats, setStats] = useState<AchievementStats | null>(null);
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
          .select('achievements_unlocked, total_achievements')
          .eq('user_id', userId)
          .single();

        if (error) {
          // Handle "not found" error - user_stats row doesn't exist yet
          if (error.code === 'PGRST116') {
            console.warn('user_stats row not found for user:', userId);
            // Set default stats
            setStats({ achievements_unlocked: 0, total_achievements: 8 });
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
        console.error('Error fetching achievement stats:', errorMessage, error);
        // Set safe default to prevent blank display
        setStats({ achievements_unlocked: 0, total_achievements: 8 });
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [userId, supabase]);

  if (isLoading) {
    return (
      <div className="px-2 py-2">
        <p className="text-xs text-muted-foreground">Loading achievements...</p>
      </div>
    );
  }

  const unlockedCount = stats?.achievements_unlocked || 0;
  const totalCount = stats?.total_achievements || 0;
  const percentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <>
      <DropdownMenuLabel className="text-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-sun-400" />
            <span className="font-semibold">
              {unlockedCount} of {totalCount} Achievements
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-sun-400 h-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <DropdownMenuItem asChild>
            <Link href="/achievements" className="cursor-pointer text-xs text-sun-400 hover:text-sun-600">
              View all achievements →
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator className="my-2" />
    </>
  );
}
