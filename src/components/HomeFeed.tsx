import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Flame, Heart, MessageCircle, Share2, Bell, BookOpen, HandHelping, UserPlus, Play } from "lucide-react";
import { verses, devotionals } from "@/lib/verses";
import type { Category } from "@/lib/verses";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface HomeFeedProps {
  category: Category;
  streak: number;
  onNavigate: (page: string) => void;
  displayName?: string;
}

const friends = [
  { name: "Sarah", avatar: "S", color: "bg-rose-500" },
  { name: "David", avatar: "D", color: "bg-blue-500" },
  { name: "Grace", avatar: "G", color: "bg-emerald-500" },
  { name: "Mark", avatar: "M", color: "bg-amber-500" },
  { name: "Ruth", avatar: "R", color: "bg-purple-500" },
];

const highlights = [
  {
    name: "Sarah M.",
    verse: "Philippians 4:13",
    text: "I can do all things through Christ who strengthens me.",
    time: "2h ago",
    avatar: "S",
    avatarColor: "bg-rose-500",
  },
  {
    name: "David K.",
    verse: "Romans 8:28",
    text: "And we know that in all things God works for the good of those who love him.",
    time: "4h ago",
    avatar: "D",
    avatarColor: "bg-blue-500",
  },
  {
    name: "Grace L.",
    verse: "Psalm 23:4",
    text: "Even though I walk through the valley of the shadow of death, I will fear no evil.",
    time: "5h ago",
    avatar: "G",
    avatarColor: "bg-emerald-500",
  },
];

const suggestedFriends = [
  { name: "Elijah", avatar: "E", color: "bg-sky-500" },
  { name: "Hannah", avatar: "H", color: "bg-pink-500" },
  { name: "Caleb", avatar: "C", color: "bg-teal-500" },
  { name: "Miriam", avatar: "M", color: "bg-orange-500" },
  { name: "Joel", avatar: "J", color: "bg-indigo-500" },
];

type HomePane = "today" | "community";

const HomeFeed = ({ category, streak, onNavigate, displayName = "Whisperer" }: HomeFeedProps) => {
  const { user } = useAuth();
  const [pane, setPane] = useState<HomePane>("today");
  const [likedVerse, setLikedVerse] = useState(false);
  const [likeCount, setLikeCount] = useState(2400);
  const [addedFriends, setAddedFriends] = useState<Set<string>>(new Set());
  const [likedHighlights, setLikedHighlights] = useState<Set<number>>(new Set());
  const [resume, setResume] = useState<{ book: string; chapter: number; last_verse: number | null; updated_at: string } | null>(null);

  const verse = verses.find((v) => v.category === category) || verses[0];

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("reading_progress")
        .select("book, chapter, last_verse, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled && data) setResume(data);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const toggleLike = () => {
    setLikedVerse(!likedVerse);
    setLikeCount(likedVerse ? likeCount - 1 : likeCount + 1);
  };

  const toggleFriend = (name: string) => {
    setAddedFriends((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleHighlightLike = (idx: number) => {
    setLikedHighlights((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-2 flex items-center justify-between">
        {/* Today / Community Toggle */}
        <div className="flex items-center gap-5">
          {(["today", "community"] as HomePane[]).map((p) => (
            <button
              key={p}
              onClick={() => setPane(p)}
              className="relative pb-1.5"
            >
              <span
                className={`font-heading text-lg font-semibold transition-colors ${
                  pane === p ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {p === "today" ? "Today" : "Community"}
              </span>
              {pane === p && (
                <motion.div
                  layoutId="home-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-primary to-gold-glow"
                />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-foreground">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-sm font-heading font-bold">{streak}</span>
          </button>
          <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
            <Bell className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {pane === "today" ? (
          <motion.div
            key="today"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="px-5 space-y-5 mt-2"
          >
            {/* Greeting */}
            <div>
              <p className="text-muted-foreground text-xs font-body">Good Afternoon</p>
              <h1 className="font-heading text-xl font-semibold text-foreground">{displayName}</h1>
            </div>

            {/* Continue Reading */}
            {resume && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onNavigate("bible")}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <Play className="w-4 h-4 text-primary" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] tracking-[0.18em] uppercase text-primary font-body font-semibold">Continue Reading</p>
                  <p className="font-heading text-sm font-semibold text-foreground truncate">
                    {resume.book} {resume.chapter}{resume.last_verse ? `:${resume.last_verse}` : ""}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground font-body shrink-0">Resume</span>
              </motion.button>
            )}

            {/* Verse of the Day Hero */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-card to-card p-5 border border-primary/10"
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary/5 blur-2xl" />
              <p className="text-[10px] tracking-[0.2em] uppercase text-primary font-body font-semibold mb-3">
                Verse of the Day
              </p>
              <p className="font-heading text-lg font-medium leading-relaxed text-foreground mb-1.5">
                "{verse.text}"
              </p>
              <p className="text-muted-foreground text-xs font-body mb-4">— {verse.reference}</p>

              <div className="flex items-center gap-4 pt-3 border-t border-border">
                <button
                  onClick={toggleLike}
                  className={`flex items-center gap-1.5 transition-colors ${
                    likedVerse ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  <Heart className="w-4 h-4" fill={likedVerse ? "currentColor" : "none"} />
                  <span className="text-xs font-body">{(likeCount / 1000).toFixed(1)}k</span>
                </button>
                <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs font-body">348</span>
                </button>
                <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs font-body">Share</span>
                </button>
              </div>
            </motion.div>

            {/* Daily Devotionals */}
            <div>
              <h2 className="font-heading text-sm font-semibold text-foreground mb-3">Daily Devotionals</h2>
              <div className="space-y-3">
                {devotionals.map((dev, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-sm font-semibold text-foreground">{dev.title}</h3>
                      <p className="text-xs text-muted-foreground font-body mt-1 line-clamp-2">{dev.snippet}</p>
                      <span className="text-[10px] text-primary font-body font-medium mt-2 inline-block">
                        Read · {dev.readTime}
                      </span>
                    </div>
                    <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      {dev.category === "peace" && <BookOpen className="w-5 h-5 text-accent" />}
                      {dev.category === "strength" && <HandHelping className="w-5 h-5 text-primary" />}
                      {dev.category === "purpose" && <BookOpen className="w-5 h-5 text-gold-glow" />}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Discovery cards */}
            <div>
              <h2 className="font-heading text-sm font-semibold text-foreground mb-3">For You</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onNavigate("bible")}
                  className="rounded-xl bg-accent/10 border border-accent/20 p-4 text-left hover:bg-accent/15 transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-accent mb-2" />
                  <p className="text-sm font-heading font-semibold text-foreground">Guided Scripture</p>
                  <p className="text-[10px] text-muted-foreground font-body mt-0.5">5 min daily reading</p>
                </button>
                <button
                  className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-left hover:bg-primary/15 transition-colors"
                >
                  <HandHelping className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm font-heading font-semibold text-foreground">Guided Prayer</p>
                  <p className="text-[10px] text-muted-foreground font-body mt-0.5">Center your spirit</p>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="community"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            className="px-5 space-y-5 mt-4"
          >
            {/* Suggested Friends Carousel */}
            <div>
              <h2 className="font-heading text-sm font-semibold text-foreground mb-3">Suggested Friends</h2>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {suggestedFriends.map((f) => (
                  <div key={f.name} className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className={`w-14 h-14 rounded-full ${f.color} flex items-center justify-center`}>
                      <span className="text-sm font-heading font-bold text-foreground">{f.avatar}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-body">{f.name}</span>
                    <button
                      onClick={() => toggleFriend(f.name)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-body font-medium transition-all ${
                        addedFriends.has(f.name)
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                      }`}
                    >
                      <UserPlus className="w-3 h-3" />
                      {addedFriends.has(f.name) ? "Added" : "Add"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div>
              <h2 className="font-heading text-sm font-semibold text-foreground mb-3">Activity</h2>
              <div className="space-y-3">
                {highlights.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.05 }}
                    className="rounded-xl bg-card p-4 border border-border"
                  >
                    {/* Card Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-full ${h.avatarColor} flex items-center justify-center`}>
                        <span className="text-xs font-heading font-bold text-foreground">{h.avatar}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-body text-foreground">
                          <span className="font-semibold">{h.name}</span>{" "}
                          <span className="text-muted-foreground">highlighted</span>{" "}
                          <span className="text-primary">{h.verse}</span>
                        </p>
                        <span className="text-[10px] text-muted-foreground">{h.time}</span>
                      </div>
                    </div>

                    {/* Verse blockquote */}
                    <div className="pl-4 border-l-2 border-primary/40 mb-3">
                      <p className="text-sm text-secondary-foreground font-body italic leading-relaxed">
                        "{h.text}"
                      </p>
                    </div>

                    {/* Interactions */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleHighlightLike(i)}
                        className={`flex items-center gap-1.5 transition-colors ${
                          likedHighlights.has(i) ? "text-primary" : "text-muted-foreground hover:text-primary"
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5" fill={likedHighlights.has(i) ? "currentColor" : "none"} />
                        <span className="text-[10px] font-body">{likedHighlights.has(i) ? "Liked" : "Like"}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-muted-foreground hover:text-accent transition-colors">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-body">Comment</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeFeed;
