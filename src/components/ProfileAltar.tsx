import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Flame, Award, Eye, Crown, Sun, Moon, Bookmark, HandHelping, Heart, LogOut, BookOpen, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import StreaksCalendar from "@/components/StreaksCalendar";
import StreaksDashboard from "@/components/StreaksDashboard";
import PrayerJournal from "@/components/PrayerJournal";
import SavedBookmarksDrawer from "@/components/SavedBookmarksDrawer";
import WhispersLibrary from "@/components/WhispersLibrary";
import { BADGE_CATALOG } from "@/lib/badges";

interface ProfileAltarProps {
  streak: number;
  onToggleTheme: () => void;
  isDark: boolean;
  displayName?: string;
  avatarUrl?: string | null;
  bookmarkCount?: number;
  onSignOut?: () => void;
}

const BADGE_ICONS: Record<string, JSX.Element> = {
  streak_7: <Flame className="w-4 h-4" />,
  streak_30: <Award className="w-4 h-4" />,
  streak_100: <Crown className="w-4 h-4" />,
  deep_seeker: <Eye className="w-4 h-4" />,
  first_whisper: <BookOpen className="w-4 h-4" />,
  whisper_keeper: <Sparkles className="w-4 h-4" />,
};

const ALL_BADGE_KEYS = ["streak_7", "streak_30", "streak_100", "deep_seeker", "first_whisper", "whisper_keeper"] as const;

const activityFilters = ["All", "Highlights", "Notes", "Plans"] as const;
type ActivityFilter = (typeof activityFilters)[number];

const ProfileAltar = ({ streak, onToggleTheme, isDark, displayName = "Whisperer", avatarUrl, bookmarkCount = 0, onSignOut }: ProfileAltarProps) => {
  const { user } = useAuth();
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("All");
  const [prayerOpen, setPrayerOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [whispersOpen, setWhispersOpen] = useState(false);
  const [streaksOpen, setStreaksOpen] = useState(false);
  const [earnedKeys, setEarnedKeys] = useState<Set<string>>(new Set());
  const [prayerCount, setPrayerCount] = useState(0);
  const [whisperCount, setWhisperCount] = useState(0);
  const [localBookmarkCount, setLocalBookmarkCount] = useState(bookmarkCount);

  useEffect(() => setLocalBookmarkCount(bookmarkCount), [bookmarkCount]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: badges }, { count: pCount }, { count: wCount }] = await Promise.all([
        supabase.from("user_badges").select("badge_key").eq("user_id", user.id),
        supabase.from("prayers").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("bookmarks").select("id", { count: "exact", head: true }).eq("user_id", user.id).not("note", "is", null),
      ]);
      setEarnedKeys(new Set((badges ?? []).map((b: any) => b.badge_key)));
      setPrayerCount(pCount ?? 0);
      setWhisperCount(wCount ?? 0);
    })();
  }, [user, prayerOpen, whispersOpen]);

  const refreshBookmarks = async () => {
    if (!user) return;
    const { count } = await supabase.from("bookmarks").select("id", { count: "exact", head: true }).eq("user_id", user.id);
    setLocalBookmarkCount(count ?? 0);
  };

  // Mock activity for now (real wiring is Phase 2 — items 5/6)
  const activityItems = [
    { type: "Highlights" as const, text: "Highlighted Psalm 23:4", time: "Today" },
    { type: "Notes" as const, text: "Added note on John 1:1", time: "Yesterday" },
    { type: "Plans" as const, text: "Completed Day 3 of Finding Peace", time: "2 days ago" },
  ];
  const filteredActivities = activityFilter === "All" ? activityItems : activityItems.filter((a) => a.type === activityFilter);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-gold-glow flex items-center justify-center text-primary-foreground font-heading text-2xl">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="font-heading text-2xl text-foreground">{displayName}</h1>
              <p className="text-muted-foreground text-sm font-body">Joined April 2026</p>
              <div className="flex gap-3 mt-1">
                <span className="text-xs font-body text-foreground"><span className="font-semibold">24</span> <span className="text-muted-foreground">Friends</span></span>
                <span className="text-xs font-body text-foreground"><span className="font-semibold">12</span> <span className="text-muted-foreground">Following</span></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onToggleTheme} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground" title={isDark ? "Light mode" : "Dark mode"}>
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {onSignOut && (
              <button onClick={onSignOut} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground" title="Sign out">
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 space-y-5">
        {/* Utilities */}
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => setSavedOpen(true)} className="rounded-xl bg-card p-4 border border-border text-center hover:border-primary/30 transition-colors">
            <Bookmark className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="font-heading text-lg text-foreground">{localBookmarkCount}</p>
            <p className="text-[10px] text-muted-foreground font-body">Saved</p>
          </button>
          <button onClick={() => setPrayerOpen(true)} className="rounded-xl bg-card p-4 border border-border text-center hover:border-accent/30 transition-colors">
            <HandHelping className="w-5 h-5 text-accent mx-auto mb-2" />
            <p className="font-heading text-lg text-foreground">{prayerCount}</p>
            <p className="text-[10px] text-muted-foreground font-body">Prayer</p>
          </button>
          <div className="rounded-xl bg-card p-4 border border-border text-center">
            <Heart className="w-5 h-5 text-gold-glow mx-auto mb-2" />
            <p className="font-heading text-lg text-foreground">$240</p>
            <p className="text-[10px] text-muted-foreground font-body">Giving</p>
          </div>
        </div>

        {/* Streaks & Milestones (real calendar) */}
        <StreaksCalendar currentStreak={streak} />

        {/* Badges (real, from DB) */}
        <div>
          <h3 className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">Badges</h3>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {ALL_BADGE_KEYS.map((key, i) => {
              const earned = earnedKeys.has(key);
              const info = BADGE_CATALOG[key];
              const target = key === "streak_7" ? 7 : key === "streak_30" ? 30 : key === "streak_100" ? 100 : 5;
              const progress = earned ? 100 : key === "deep_seeker" ? 0 : Math.min(100, Math.round((streak / target) * 100));
              return (
                <motion.div key={key} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.08 }} className="flex flex-col items-center gap-2 shrink-0 w-20">
                  <div className="relative">
                    <svg className="w-14 h-14" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" fill="none" className="stroke-muted" strokeWidth="3" />
                      <circle cx="28" cy="28" r="24" fill="none"
                        className={earned ? "stroke-primary" : "stroke-accent/60"}
                        strokeWidth="3" strokeDasharray={`${(progress / 100) * 150.8} 150.8`}
                        strokeLinecap="round" transform="rotate(-90 28 28)" />
                    </svg>
                    <div className={`absolute inset-0 flex items-center justify-center ${earned ? "text-primary" : "text-muted-foreground"}`}>
                      {BADGE_ICONS[key]}
                    </div>
                  </div>
                  <span className={`text-[10px] font-body font-medium text-center leading-tight ${earned ? "text-foreground" : "text-muted-foreground"}`}>
                    {info.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Activity History */}
        <div>
          <h3 className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">Activity History</h3>
          <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
            {activityFilters.map((f) => (
              <button key={f} onClick={() => setActivityFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-body font-medium whitespace-nowrap transition-all ${
                  activityFilter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}>
                {f}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {filteredActivities.map((item, i) => (
              <motion.div key={`${item.text}-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                <p className="text-sm font-body text-foreground">{item.text}</p>
                <span className="text-[10px] text-muted-foreground font-body shrink-0 ml-2">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <PrayerJournal open={prayerOpen} onClose={() => setPrayerOpen(false)} />
      <SavedBookmarksDrawer open={savedOpen} onClose={() => setSavedOpen(false)} onChanged={refreshBookmarks} />
    </div>
  );
};

export default ProfileAltar;
