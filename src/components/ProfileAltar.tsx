import { motion } from "framer-motion";
import { Flame, BookMarked, Eye, Award, Calendar } from "lucide-react";

interface ProfileAltarProps {
  streak: number;
}

const badges = [
  { label: "Deep Seeker", icon: <Eye className="w-4 h-4" />, earned: true },
  { label: "7-Day Flame", icon: <Flame className="w-4 h-4" />, earned: true },
  { label: "30-Day Flame", icon: <Award className="w-4 h-4" />, earned: false },
];

const ProfileAltar = ({ streak }: ProfileAltarProps) => (
  <div className="min-h-screen bg-background pb-24">
    <div className="px-6 pt-8 pb-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-glow flex items-center justify-center text-primary-foreground font-heading text-2xl">
          W
        </div>
        <div>
          <h1 className="font-heading text-2xl text-foreground">Whisperer</h1>
          <p className="text-muted-foreground text-sm font-body">Joined April 2026</p>
        </div>
      </div>
    </div>

    <div className="px-6 space-y-5">
      {/* Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-gold/10 to-ether-light/10 p-6 border border-gold-light/20 shadow-golden"
      >
        <div className="flex items-center gap-3 mb-4">
          <Flame className="w-8 h-8 text-gold" />
          <div>
            <p className="font-heading text-3xl text-foreground">{streak}</p>
            <p className="text-xs text-muted-foreground font-body">Day Streak</p>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`h-8 rounded-md ${
                i < streak % 7 ? "bg-gold/60" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground font-body mt-2">1 Grace Day available</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Plans Done", value: "3", icon: <Calendar className="w-4 h-4 text-gold" /> },
          { label: "Bookmarks", value: "12", icon: <BookMarked className="w-4 h-4 text-ether" /> },
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

      {/* Badges */}
      <div>
        <h3 className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">Badges</h3>
        <div className="flex gap-3">
          {badges.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-body font-medium border ${
                b.earned
                  ? "bg-gold/10 text-gold border-gold/20"
                  : "bg-muted text-muted-foreground border-border opacity-50"
              }`}
            >
              {b.icon} {b.label}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ProfileAltar;
