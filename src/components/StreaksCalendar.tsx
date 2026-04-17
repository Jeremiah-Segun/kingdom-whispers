import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  currentStreak: number;
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const StreaksCalendar = ({ currentStreak }: Props) => {
  const { user } = useAuth();
  const [readDates, setReadDates] = useState<Set<string>>(new Set());
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Fetch last 90 days of reading
      const since = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
      const [{ data: days }, { data: streakRow }] = await Promise.all([
        supabase.from("reading_days").select("read_date").eq("user_id", user.id).gte("read_date", since),
        supabase.from("user_streaks").select("longest_streak").eq("user_id", user.id).maybeSingle(),
      ]);
      const set = new Set((days ?? []).map((d: any) => d.read_date));
      setReadDates(set);

      // Compute longest streak from data
      const sorted = Array.from(set).sort();
      let longest = 0, run = 0, prev: string | null = null;
      for (const d of sorted) {
        if (prev) {
          const diff = (new Date(d).getTime() - new Date(prev).getTime()) / 86400000;
          run = diff === 1 ? run + 1 : 1;
        } else run = 1;
        longest = Math.max(longest, run);
        prev = d;
      }
      const finalLongest = Math.max(longest, streakRow?.longest_streak ?? 0, currentStreak);
      setLongestStreak(finalLongest);

      // Persist longest if larger
      if (finalLongest > (streakRow?.longest_streak ?? 0)) {
        await supabase.from("user_streaks").update({ longest_streak: finalLongest }).eq("user_id", user.id);
      }
    })();
  }, [user, currentStreak]);

  // Build last 35 days grid (5 weeks)
  const today = new Date();
  const cells: { date: string; read: boolean; isToday: boolean }[] = [];
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const iso = d.toISOString().slice(0, 10);
    cells.push({ date: iso, read: readDates.has(iso), isToday: i === 0 });
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading text-sm font-bold text-foreground">Streaks & Milestones</h3>
          <p className="text-[10px] text-muted-foreground font-body">Last 5 weeks of reading</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Flame className="w-3.5 h-3.5 text-primary" />
              <span className="font-heading text-base font-bold text-foreground">{currentStreak}</span>
            </div>
            <p className="text-[9px] text-muted-foreground font-body uppercase tracking-wider">Current</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Trophy className="w-3.5 h-3.5 text-gold-glow" />
              <span className="font-heading text-base font-bold text-foreground">{longestStreak}</span>
            </div>
            <p className="text-[9px] text-muted-foreground font-body uppercase tracking-wider">Longest</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-center text-[9px] font-body text-muted-foreground">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((c, i) => (
          <motion.div
            key={c.date}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.008 }}
            title={c.date}
            className={`aspect-square rounded-md transition-all ${
              c.read
                ? "bg-gradient-to-br from-primary to-gold-glow shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
                : "bg-secondary"
            } ${c.isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
          />
        ))}
      </div>
    </div>
  );
};

export default StreaksCalendar;
