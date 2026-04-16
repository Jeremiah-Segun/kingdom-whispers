import { motion } from "framer-motion";
import { Flame, Heart, MessageCircle, Share2, Bell, BookOpen, HandHelping } from "lucide-react";
import { verses } from "@/lib/verses";
import type { Category } from "@/lib/verses";

interface HomeFeedProps {
  category: Category;
  streak: number;
  onNavigate: (page: string) => void;
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
  },
  {
    name: "David K.",
    verse: "Romans 8:28",
    text: "And we know that in all things God works for the good of those who love him.",
    time: "4h ago",
  },
];

const HomeFeed = ({ category, streak, onNavigate }: HomeFeedProps) => {
  const verse = verses.find((v) => v.category === category) || verses[0];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-2 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-body">Good Afternoon</p>
          <h1 className="font-heading text-xl font-semibold text-foreground">Whisperer</h1>
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

      <div className="px-5 space-y-5 mt-2">
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
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
              <Heart className="w-4 h-4" />
              <span className="text-xs font-body">2.4k</span>
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

        {/* Friends Activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-sm font-semibold text-foreground">Friends Activity</h2>
            <button className="text-xs text-primary font-body">See All</button>
          </div>

          {/* Avatar row */}
          <div className="flex gap-3 mb-4">
            {friends.map((f) => (
              <div key={f.name} className="flex flex-col items-center gap-1">
                <div className={`w-12 h-12 rounded-full ${f.color} flex items-center justify-center ring-2 ring-primary/30 ring-offset-2 ring-offset-background`}>
                  <span className="text-sm font-heading font-bold text-foreground">{f.avatar}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-body">{f.name}</span>
              </div>
            ))}
          </div>

          {/* Highlight cards */}
          <div className="space-y-3">
            {highlights.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="rounded-xl bg-secondary p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-body font-medium text-foreground">
                    {h.name} <span className="text-muted-foreground font-normal">highlighted</span>{" "}
                    <span className="text-primary">{h.verse}</span>
                  </p>
                  <span className="text-[10px] text-muted-foreground">{h.time}</span>
                </div>
                <p className="text-sm text-secondary-foreground font-body italic leading-relaxed pl-3 border-l-2 border-primary/30">
                  "{h.text}"
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Discovery cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
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
        </motion.div>
      </div>
    </div>
  );
};

export default HomeFeed;
