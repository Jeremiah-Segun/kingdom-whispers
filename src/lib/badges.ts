import { supabase } from "@/integrations/supabase/client";
import type { BadgeInfo } from "@/components/BadgeUnlockModal";

const CATALOG: Record<string, BadgeInfo> = {
  streak_7: { key: "streak_7", label: "7-Day Flame", description: "A full week of daily Scripture. The fire is lit." },
  streak_30: { key: "streak_30", label: "30-Day Devotion", description: "A month of faithful presence. Roots are deepening." },
  streak_100: { key: "streak_100", label: "100-Day Pilgrim", description: "One hundred days walked. You are transformed." },
  deep_seeker: { key: "deep_seeker", label: "Deep Seeker", description: "Five minutes of unbroken reading. Stillness rewarded." },
};

export const BADGE_CATALOG = CATALOG;

/** Award a badge if not already earned. Returns BadgeInfo if newly awarded, else null. */
export async function awardBadge(userId: string, key: keyof typeof CATALOG): Promise<BadgeInfo | null> {
  const { data: existing } = await supabase
    .from("user_badges")
    .select("id")
    .eq("user_id", userId)
    .eq("badge_key", key)
    .maybeSingle();
  if (existing) return null;
  const { error } = await supabase.from("user_badges").insert({ user_id: userId, badge_key: key });
  if (error) return null;
  return CATALOG[key];
}

export function streakBadgeKey(streak: number): keyof typeof CATALOG | null {
  if (streak >= 100) return "streak_100";
  if (streak >= 30) return "streak_30";
  if (streak >= 7) return "streak_7";
  return null;
}
