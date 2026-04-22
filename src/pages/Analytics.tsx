import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Heart, MessageCircle, Eye, Flame, HandHelping, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Stats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  totalPrayers: number;
  answeredPrayers: number;
  totalReadDays: number;
  currentStreak: number;
}

const AnalyticsPage = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const [
        { data: posts },
        { count: prayerCount },
        { count: answeredCount },
        { count: readDays },
        { data: streakData },
      ] = await Promise.all([
        supabase.from("posts").select("id, body, like_count, comment_count, view_count, created_at").eq("user_id", user.id).order("like_count", { ascending: false }).limit(50),
        supabase.from("prayers").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("prayers").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_answered", true),
        supabase.from("reading_days").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("user_streaks").select("current_streak").eq("user_id", user.id).maybeSingle(),
      ]);

      const allPosts = posts ?? [];
      const totalLikes = allPosts.reduce((s, p) => s + (p.like_count ?? 0), 0);
      const totalComments = allPosts.reduce((s, p) => s + (p.comment_count ?? 0), 0);
      const totalViews = allPosts.reduce((s, p) => s + (p.view_count ?? 0), 0);

      setStats({
        totalPosts: allPosts.length,
        totalLikes,
        totalComments,
        totalViews,
        totalPrayers: prayerCount ?? 0,
        answeredPrayers: answeredCount ?? 0,
        totalReadDays: readDays ?? 0,
        currentStreak: streakData?.current_streak ?? 0,
      });

      setTopPosts(allPosts.slice(0, 5));
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  const prayerRate = stats && stats.totalPrayers > 0
    ? Math.round((stats.answeredPrayers / stats.totalPrayers) * 100)
    : 0;

  const statCards = [
    { label: "Posts", value: stats?.totalPosts ?? 0, icon: FileText, color: "text-primary" },
    { label: "Total Likes", value: stats?.totalLikes ?? 0, icon: Heart, color: "text-rose-500" },
    { label: "Comments", value: stats?.totalComments ?? 0, icon: MessageCircle, color: "text-accent" },
    { label: "Views", value: stats?.totalViews ?? 0, icon: Eye, color: "text-blue-500" },
    { label: "Streak", value: stats?.currentStreak ?? 0, icon: Flame, color: "text-primary" },
    { label: "Read Days", value: stats?.totalReadDays ?? 0, icon: BookOpen, color: "text-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-safe pb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-body">Back</span>
        </button>
        <h1 className="font-heading text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-xs text-muted-foreground font-body mt-1">Your engagement overview</p>
      </div>

      <div className="px-5 space-y-5">
        {/* Stat Cards Grid */}
        <div className="grid grid-cols-3 gap-3">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl bg-card border border-border p-3 text-center"
              >
                <Icon className={`w-5 h-5 mx-auto mb-1.5 ${s.color}`} />
                <p className="font-heading text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-body">{s.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Prayer Answer Rate */}
        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-heading text-sm font-semibold text-foreground mb-3">Prayer Answer Rate</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" className="stroke-muted" strokeWidth="6" />
                <circle cx="40" cy="40" r="34" fill="none" className="stroke-primary" strokeWidth="6"
                  strokeDasharray={`${(prayerRate / 100) * 213.6} 213.6`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-heading text-lg font-bold text-foreground">{prayerRate}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-body text-foreground">{stats?.answeredPrayers ?? 0} answered</p>
              <p className="text-xs text-muted-foreground font-body">out of {stats?.totalPrayers ?? 0} prayers</p>
            </div>
          </div>
        </div>

        {/* Top Posts */}
        <div>
          <h3 className="font-heading text-sm font-semibold text-foreground mb-3">Top Posts by Likes</h3>
          {topPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body text-center py-6">No posts yet.</p>
          ) : (
            <div className="space-y-2">
              {topPosts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-heading font-bold text-primary shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body text-foreground line-clamp-2">{p.body}</p>
                    <div className="flex items-center gap-4 mt-1.5 text-muted-foreground">
                      <span className="flex items-center gap-1 text-[10px]"><Heart className="w-3 h-3" />{p.like_count}</span>
                      <span className="flex items-center gap-1 text-[10px]"><MessageCircle className="w-3 h-3" />{p.comment_count}</span>
                      <span className="flex items-center gap-1 text-[10px]"><Eye className="w-3 h-3" />{p.view_count}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
