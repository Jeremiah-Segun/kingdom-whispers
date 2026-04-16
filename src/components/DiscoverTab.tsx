import { motion } from "framer-motion";
import { Search, BookOpen, Play, Church, Handshake } from "lucide-react";
import { discoverCategories } from "@/lib/verses";

const quickLinks = [
  { label: "Plans", icon: BookOpen },
  { label: "Videos", icon: Play },
  { label: "Churches", icon: Church },
  { label: "Partners", icon: Handshake },
];

const DiscoverTab = () => (
  <div className="min-h-screen bg-background pb-24">
    <div className="px-5 pt-14 pb-2">
      <h1 className="font-heading text-2xl font-bold text-foreground">Discover</h1>
    </div>

    {/* Search */}
    <div className="px-5 py-3">
      <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Search topics, verses, plans..."
          className="bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground outline-none w-full"
        />
      </div>
    </div>

    {/* Quick links */}
    <div className="px-5 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
      {quickLinks.map((link) => {
        const Icon = link.icon;
        return (
          <button
            key={link.label}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground hover:border-primary/20 transition-colors shrink-0"
          >
            <Icon className="w-4 h-4 text-primary" />
            <span className="text-xs font-body font-medium">{link.label}</span>
          </button>
        );
      })}
    </div>

    {/* Category grid */}
    <div className="px-5 mt-4">
      <h2 className="font-heading text-sm font-semibold text-foreground mb-3">Browse Topics</h2>
      <div className="grid grid-cols-2 gap-3">
        {discoverCategories.map((cat, i) => (
          <motion.button
            key={cat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${cat.color} p-4 text-left h-24 hover:brightness-110 transition-all`}
          >
            <span className="absolute -bottom-2 -right-2 text-4xl opacity-20">{cat.icon}</span>
            <p className="font-heading text-sm font-bold text-foreground relative z-10">{cat.label}</p>
            <p className="text-[10px] text-foreground/60 font-body mt-0.5 relative z-10">Explore</p>
          </motion.button>
        ))}
      </div>
    </div>
  </div>
);

export default DiscoverTab;
