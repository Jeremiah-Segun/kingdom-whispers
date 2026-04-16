import { motion } from "framer-motion";
import { useState } from "react";
import { Flame, BookMarked, Eye, Award, Calendar, Sun, Moon, Bookmark, HandHelping, Heart } from "lucide-react";

interface ProfileAltarProps {
  streak: number;
  onToggleTheme: () => void;
  isDark: boolean;
}

const badges = [
  { label: "Deep Seeker", icon: <Eye className="w-4 h-4" />, earned: true, progress: 100 },
  { label: "7-Day Flame", icon: <Flame className="w-4 h-4" />, earned: true, progress: 100 },
  { label: "30-Day Flame", icon: <Award className="w-4 h-4" />, earned: false, progress: 23 },
];

const activityFilters = ["All", "Highlights", "Notes", "Plans"] as const;
type ActivityFilter = (typeof activityFilters)[number];

const activityItems = [
  { type: "Highlights" as const, text: "Highlighted Psalm 23:4", time: "Today" },
  { type: "Notes" as const, text: "Added note on John 1:1", time: "Yesterday" },
  { type: "Plans" as const, text: "Completed Day 3 of Finding Peace", time: "2 days ago" },
  { type: "Highlights" as const, text: "Highlighted Philippians 4:13", time: "3 days ago" },
  { type: "Notes" as const, text: "Reflected on Proverbs 3:5", time: "4 days ago" },
  { type: "Plans" as const, text: "Started Walking in Purpose plan", time: "5 days ago" },
];

const ProfileAltar = ({ streak, onToggleTheme, isDark }: ProfileAltarProps) => {
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("All");

  const filteredActivities = activityFilter === "All"
    ? activityItems
    : activityItems.filter((a) => a.type === activityFilter);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-gold-glow flex items-center justify-center text-primary-foreground font-heading text-2xl">
              W
            </div>
            <div>
              <h1 className="font-heading text-2xl text-foreground">Whisperer</h1>
              <p className="text-muted-foreground text-sm font-body">Joined April 2026</p>
              <div className="flex gap-3 mt-1">
                <span className="text-xs font-body text-foreground">
                  <span className="font-semibold">24</span>{" "}
                  <span className="text-muted-foreground">Friends</span>
                </span>
                <span className="text-xs font-body text-foreground">
                  <span className="font-semibold">12</span>{" "}
                  <span className="text-muted-foreground">Following</span>
                </span>
              </div>
            </div>
          </div>
          {/* Dark/Light Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-surface-hover transition-colors"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="px-6 space-y-5">
        {/* Utilities Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Saved", value: "12", icon: <Bookmark className="w-5 h-5 text-primary" /> },
            { label: "Prayer", value: "8", icon: <HandHelping className="w-5 h-5 text-accent" /> },
            { label: "Giving", value: "$240", icon: <Heart className="w-5 h-5 text-gold-glow" /> },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05 }}
              className="rounded-xl bg-card p-4 border border-border text-center cursor-pointer hover:border-primary/20 transition-colors"
            >
              <div className="flex justify-center mb-2">{item.icon}</div>
              <p className="font-heading text-lg text-foreground">{item.value}</p>
              <p className="text-[10px] text-muted-foreground font-body">{item.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 p-5 border border-primary/10"
        >
          <div className="flex items-center gap-3 mb-3">
            <Flame className="w-7 h-7 text-primary" />
            <div>
              <p className="font-heading text-2xl text-foreground">{streak}</p>
              <p className="text-xs text-muted-foreground font-body">Day Streak</p>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`h-7 rounded-md ${
                  i < streak % 7 ? "bg-primary/60" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground font-body mt-2">1 Grace Day available</p>
        </motion.div>

        {/* Badges */}
        <div>
          <h3 className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">Badges</h3>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {badges.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex flex-col items-center gap-2 shrink-0"
              >
                <div className="relative">
                  {/* Progress ring */}
                  <svg className="w-14 h-14" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" className="stroke-muted" strokeWidth="3" />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      className={b.earned ? "stroke-primary" : "stroke-destructive"}
                      strokeWidth="3"
                      strokeDasharray={`${(b.progress / 100) * 150.8} 150.8`}
                      strokeLinecap="round"
                      transform="rotate(-90 28 28)"
                    />
                  </svg>
                  <div className={`absolute inset-0 flex items-center justify-center ${
                    b.earned ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {b.icon}
                  </div>
                </div>
                <span className={`text-[10px] font-body font-medium text-center ${
                  b.earned ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {b.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Plans Done", value: "3", icon: <Calendar className="w-4 h-4 text-primary" /> },
            { label: "Bookmarks", value: "12", icon: <BookMarked className="w-4 h-4 text-accent" /> },
            { label: "Impact", value: "89", icon: <Eye className="w-4 h-4 text-gold-glow" /> },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="rounded-xl bg-card p-4 border border-border text-center"
            >
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <p className="font-heading text-xl text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Activity History */}
        <div>
          <h3 className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">Activity History</h3>
          <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
            {activityFilters.map((f) => (
              <button
                key={f}
                onClick={() => setActivityFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-body font-medium whitespace-nowrap transition-all ${
                  activityFilter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {filteredActivities.map((item, i) => (
              <motion.div
                key={`${item.text}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between p-3 rounded-xl bg-card border border-border"
              >
                <p className="text-sm font-body text-foreground">{item.text}</p>
                <span className="text-[10px] text-muted-foreground font-body shrink-0 ml-2">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAltar;
