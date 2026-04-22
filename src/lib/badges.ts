import { supabase } from "@/integrations/supabase/client";
import type { BadgeInfo } from "@/components/BadgeUnlockModal";

const CATALOG: Record<string, BadgeInfo> = {
  streak_7: { key: "streak_7", label: "7-Day Flame", description: "A full week of daily Scripture. The fire is lit." },
  streak_30: { key: "streak_30", label: "30-Day Devotion", description: "A month of faithful presence. Roots are deepening." },
  streak_100: { key: "streak_100", label: "100-Day Pilgrim", description: "One hundred days walked. You are transformed." },
  deep_seeker: { key: "deep_seeker", label: "Deep Seeker", description: "Five minutes of unbroken reading. Stillness rewarded." },
  first_whisper: { key: "first_whisper", label: "First Whisper", description: "Your first personal reflection on a verse. The journal begins." },
  whisper_keeper: { key: "whisper_keeper", label: "Whisper Keeper", description: "Ten verse reflections written. A library of the soul." },
};

export const BADGE_CATALOG = CATALOG;
export type BadgeKey = keyof typeof CATALOG;

/** Award a badge via server-side RPC. Returns BadgeInfo if newly awarded, else null. */
export async function awardBadge(_userId: string, key: BadgeKey): Promise<BadgeInfo | null> {
  const { data, error } = await supabase.rpc("award_badge", { _badge_key: key as string });
  if (error || !data) return null;
  return CATALOG[key];
}

export function streakBadgeKey(streak: number): BadgeKey | null {
  if (streak >= 100) return "streak_100";
  if (streak >= 30) return "streak_30";
  if (streak >= 7) return "streak_7";
  return null;
}
