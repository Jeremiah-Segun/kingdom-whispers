import { motion } from "framer-motion";
import { BookOpen, Flame, Share2, ArrowRight, Clock } from "lucide-react";
import { verses, devotionals } from "@/lib/verses";
import type { Category } from "@/lib/verses";

interface HomeFeedProps {
  category: Category;
  streak: number;
  onNavigate: (page: string) => void;
}

const HomeFeed = ({ category, streak, onNavigate }: HomeFeedProps) => {
  const verse = verses.find((v) => v.category === category) || verses[0];
  const devotional = devotionals.find((d) => d.category === category) || devotionals[0];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase font-body">Good Morning, Whisperer</p>
        <h1 className="font-heading text-3xl font-light text-foreground mt-1">Your Daily Bread</h1>
      </div>

      <div className="px-6 space-y-5">
        {/* Verse of the Day */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gold/10 via-card to-ether-light/20 p-6 shadow-golden border border-gold-light/20"
        >
          <div className="absolute top-3 right-3 opacity-10">
            <Flame className="w-20 h-20 text-gold" />
          </div>
          <p className="text-xs tracking-[0.2em] uppercase text-gold font-body font-semibold mb-3">Verse of the Day</p>
          <p className="font-heading text-2xl md:text-3xl italic font-light leading-relaxed text-foreground mb-3">
            "{verse.text}"
          </p>
          <p className="text-muted-foreground text-sm font-body">— {verse.reference}</p>
          <button className="mt-4 flex items-center gap-2 text-gold text-sm font-body font-medium hover:text-gold-glow transition-colors">
            <Share2 className="w-4 h-4" /> Share This Whisper
          </button>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 rounded-2xl bg-card p-5 border border-border"
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gold/10">
            <Flame className="w-7 h-7 text-gold" />
          </div>
          <div className="flex-1">
            <p className="font-body font-semibold text-foreground">{streak}-Day Streak</p>
            <p className="text-muted-foreground text-xs font-body">1 Grace Day remaining</p>
          </div>
          <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((streak / 30) * 100, 100)}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-full rounded-full bg-gradient-to-r from-gold to-gold-glow"
            />
          </div>
        </motion.div>

        {/* Devotional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-card p-6 border border-border"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-body">{devotional.readTime} read</span>
          </div>
          <h3 className="font-heading text-xl text-foreground mb-2">{devotional.title}</h3>
          <p className="text-muted-foreground text-sm font-body leading-relaxed line-clamp-3">{devotional.snippet}</p>
          <button className="mt-4 flex items-center gap-1 text-gold text-sm font-body font-medium hover:text-gold-glow transition-colors">
            Continue Reading <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onNavigate("bible")}
          className="w-full rounded-2xl bg-primary text-primary-foreground p-5 font-body font-semibold text-center shadow-golden flex items-center justify-center gap-3 hover:brightness-110 transition-all"
        >
          <BookOpen className="w-5 h-5" /> Dive Into the Word
        </motion.button>
      </div>
    </div>
  );
};

export default HomeFeed;
