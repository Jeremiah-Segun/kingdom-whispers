import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Calendar, Award, Eye, Crown, BookOpen, Sparkles } from "lucide-react";
import ResponsiveModal from "@/components/ResponsiveModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BADGE_CATALOG } from "@/lib/badges";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStreak: number;
}

const BADGE_ICONS: Record<string, JSX.Element> = {
  streak_7: <Flame className="w-4 h-4" />,
  streak_30: <Award className="w-4 h-4" />,
  streak_100: <Crown className="w-4 h-4" />,
  deep_seeker: <Eye className="w-4 h-4" />,
  first_whisper: <BookOpen className="w-4 h-4" />,
  whisper_keeper: <Sparkles className="w-4 h-4" />,
};

const BADGE_KEYS: (keyof typeof BADGE_CATALOG)[] = [
  "streak_7",
  "streak_30",
  "streak_100",
  "deep_seeker",
  "first_whisper",
  "whisper_keeper",
];

const BADGE_TARGETS: Record<string, number> = {
  streak_7: 7,
  streak_30: 30,
  streak_100: 100,
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const StreaksDashboard = ({ open, onOpenChange, currentStreak }: Props) => {
  const { user } = useAuth();
  const [readDates, setReadDates] = useState<Set<string>>(new Set());
  const [longestStreak, setLongestStreak] = useState(0);
  const [earnedKeys, setEarnedKeys] = useState<Set<string>>(new Set());
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const since = new Date(Date.now() - 84 * 86400000).toISOString().slice(0, 10);
      const [{ data: days }, { data: streakRow }, { data: badges }, { count: total }] = await Promise.all([
        supabase.from("reading_days").select("read_date").eq("user_id", user.id).gte("read_date", since),
        supabase.from("user_streaks").select("longest_streak").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_badges").select("badge_key").eq("user_id", user.id),
        supabase.from("reading_days").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      const set = new Set((days ?? []).map((d: any) => d.read_date));
      setReadDates(set);
      setLongestStreak(Math.max(streakRow?.longest_streak ?? 0, currentStreak));
      setEarnedKeys(new Set((badges ?? []).map((b: any) => b.badge_key)));
      setTotalDays(total ?? 0);
    })();
  }, [open, user, currentStreak]);

  // Build a 12-week heatmap (84 cells), grouped column-by-week.
  const grid = useMemo(() => {
    const today = new Date();
    const weeks: { date: string; read: boolean; isToday: boolean }[][] = [];
    for (let w = 11; w >= 0; w--) {
      const week: { date: string; read: boolean; isToday: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const offset = w * 7 + (6 - d);
        const date = new Date(today.getTime() - offset * 86400000);
        const iso = date.toISOString().slice(0, 10);
        week.push({ date: iso, read: readDates.has(iso), isToday: offset === 0 });
      }
      weeks.push(week);
    }
    return weeks;
  }, [readDates]);

  const monthMarkers = useMemo(() => {
    const seen = new Set<number>();
    return grid.map((week) => {
      const first = week[0];
      const m = new Date(first.date).getMonth();
      if (seen.has(m)) return "";
      seen.add(m);
      return MONTH_LABELS[m];
    });
  }, [grid]);

  const nextMilestone =
    currentStreak < 7 ? 7 : currentStreak < 30 ? 30 : currentStreak < 100 ? 100 : 365;
  const milestoneProgress = Math.min(100, Math.round((currentStreak / nextMilestone) * 100));

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Prayer & Devotion Streaks"
      description="Your daily walk, visualized."
      maxHeight="92vh"
    >
      <div className="space-y-5 max-h-[78vh] overflow-y-auto pr-1">
        {/* Top stats */}
        <div className="grid grid-cols-3 gap-2">
          <Stat icon={<Flame className="w-4 h-4 text-primary" />} value={currentStreak} label="Current" />
          <Stat icon={<Trophy className="w-4 h-4 text-gold-glow" />} value={longestStreak} label="Longest" />
          <Stat icon={<Calendar className="w-4 h-4 text-accent" />} value={totalDays} label="Total days" />
        </div>

        {/* Next milestone */}
        <div className="rounded-xl bg-gradient-to-br from-primary/15 via-card to-card border border-primary/15 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] tracking-[0.18em] uppercase text-primary font-body font-semibold">
              Next milestone
            </p>
            <span className="text-xs font-body text-muted-foreground">
              {currentStreak} / {nextMilestone} days
            </span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${milestoneProgress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-gold-glow"
            />
          </div>
        </div>

        {/* Heatmap */}
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-sm font-bold text-foreground">12-Week Heatmap</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-body">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-sm bg-secondary" />
              <span className="w-2.5 h-2.5 rounded-sm bg-primary/40" />
              <span className="w-2.5 h-2.5 rounded-sm bg-primary/70" />
              <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-br from-primary to-gold-glow" />
              <span>More</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div>
              <div className="flex gap-1 mb-1 pl-5">
                {monthMarkers.map((m, i) => (
                  <div key={i} className="w-3.5 text-[9px] font-body text-muted-foreground text-center">
                    {m}
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                {grid.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1">
                    {week.map((c, di) => (
                      <motion.div
                        key={c.date}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (wi * 7 + di) * 0.004 }}
                        title={`${c.date}${c.read ? " · read" : ""}`}
                        className={`w-3.5 h-3.5 rounded-sm transition-all ${
                          c.read
                            ? "bg-gradient-to-br from-primary to-gold-glow"
                            : "bg-secondary"
                        } ${c.isToday ? "ring-1 ring-primary" : ""}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div>
          <h3 className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">
            Milestone Badges
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {BADGE_KEYS.map((key, i) => {
              const earned = earnedKeys.has(key);
              const info = BADGE_CATALOG[key];
              const target = BADGE_TARGETS[key];
              const progress = earned
                ? 100
                : target
                ? Math.min(100, Math.round((currentStreak / target) * 100))
                : 0;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={`rounded-xl p-3 border text-center ${
                    earned ? "bg-primary/10 border-primary/30" : "bg-card border-border"
                  }`}
                >
                  <div className="relative w-12 h-12 mx-auto mb-2">
                    <svg className="w-12 h-12" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="20" fill="none" className="stroke-muted" strokeWidth="3" />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        className={earned ? "stroke-primary" : "stroke-accent/60"}
                        strokeWidth="3"
                        strokeDasharray={`${(progress / 100) * 125.6} 125.6`}
                        strokeLinecap="round"
                        transform="rotate(-90 24 24)"
                      />
                    </svg>
                    <div
                      className={`absolute inset-0 flex items-center justify-center ${
                        earned ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {BADGE_ICONS[key]}
                    </div>
                  </div>
                  <p
                    className={`text-[11px] font-body font-medium leading-tight ${
                      earned ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {info.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
};

const Stat = ({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) => (
  <div className="rounded-xl bg-card border border-border p-3 text-center">
    <div className="flex items-center justify-center mb-1">{icon}</div>
    <p className="font-heading text-xl font-bold text-foreground leading-none">{value}</p>
    <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mt-1">{label}</p>
  </div>
);

export default StreaksDashboard;
