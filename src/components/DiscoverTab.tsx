import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Search, Mic, Play, Mail, BookOpen, ArrowLeft, PenSquare, CalendarDays } from "lucide-react";
import { discoverCategories, verses } from "@/lib/verses";
import NewsletterList from "@/components/NewsletterList";
import NewsletterEditor from "@/components/NewsletterEditor";
import EventsHub from "@/components/EventsHub";
import BooksLibrary from "@/components/BooksLibrary";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const quickLinks = [
  { label: "Events", icon: CalendarDays },
  { label: "Podcast", icon: Mic },
  { label: "Videos", icon: Play },
  { label: "Newsletter", icon: Mail },
  { label: "Books", icon: BookOpen },
];

interface DiscoverTabProps {
  initialLink?: string | null;
  onConsumedInitialLink?: () => void;
}

const DiscoverTab = ({ initialLink, onConsumedInitialLink }: DiscoverTabProps = {}) => {
  const { isAdmin } = useIsAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeLink, setActiveLink] = useState<string | null>(null);

  useEffect(() => {
    if (initialLink) {
      setActiveLink(initialLink);
      onConsumedInitialLink?.();
    }
  }, [initialLink, onConsumedInitialLink]);

  const filteredCategories = searchQuery
    ? discoverCategories.filter((c) => c.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : discoverCategories;

  const categoryVerses = selectedCategory
    ? verses.filter((v) => v.category === selectedCategory.toLowerCase())
    : [];

  if (selectedCategory) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-safe pb-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-body">Back to Discover</span>
          </button>
          <h1 className="font-heading text-2xl font-bold text-foreground">{selectedCategory}</h1>
          <p className="text-xs text-muted-foreground font-body mt-1">Explore verses about {selectedCategory.toLowerCase()}</p>
        </div>
        <div className="px-5 space-y-3">
          {categoryVerses.length > 0 ? (
            categoryVerses.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl bg-card border border-border"
              >
                <p className="font-body text-sm text-foreground leading-relaxed">"{v.text}"</p>
                <p className="text-xs text-primary font-body mt-2">— {v.reference}</p>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm font-body">
                Verses for this topic coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeLink === "Events") {
    return <EventsHub onBack={() => setActiveLink(null)} />;
  }

  if (activeLink === "Newsletter") {
    return <NewsletterList onBack={() => setActiveLink(null)} />;
  }

  if (activeLink === "NewsletterEditor") {
    return <NewsletterEditor onBack={() => setActiveLink(null)} />;
  }

  if (activeLink === "Books") {
    return <BooksLibrary onBack={() => setActiveLink(null)} />;
  }

  if (activeLink) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-safe pb-4">
          <button
            onClick={() => setActiveLink(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-body">Back to Discover</span>
          </button>
          <h1 className="font-heading text-2xl font-bold text-foreground">{activeLink}</h1>
        </div>
        <div className="px-5">
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm font-body">
              {activeLink} content coming soon. Stay tuned!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-safe pb-2">
        <h1 className="font-heading text-2xl font-bold text-foreground">Discover</h1>
      </div>

      {/* Search */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search topics, verses, plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
              onClick={() => setActiveLink(link.label)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground hover:border-primary/20 transition-colors shrink-0"
            >
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-xs font-body font-medium">{link.label}</span>
            </button>
          );
        })}
        {isAdmin && (
          <button
            onClick={() => setActiveLink("NewsletterEditor")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 transition-colors shrink-0"
          >
            <PenSquare className="w-4 h-4" />
            <span className="text-xs font-body font-medium">Write</span>
          </button>
        )}
      </div>

      {/* Category grid */}
      <div className="px-5 mt-4">
        <h2 className="font-heading text-sm font-semibold text-foreground mb-3">Browse Topics</h2>
        <div className="grid grid-cols-2 gap-3">
          {filteredCategories.map((cat, i) => (
            <motion.button
              key={cat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedCategory(cat.label)}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${cat.color} p-4 text-left h-24 hover:brightness-110 transition-all`}
            >
              <span className="absolute -bottom-2 -right-2 text-4xl opacity-20">{cat.icon}</span>
              <p className="font-heading text-sm font-bold text-foreground relative z-10">{cat.label}</p>
              <p className="text-[10px] text-foreground/60 font-body mt-0.5 relative z-10">Explore</p>
            </motion.button>
          ))}
        </div>
        {filteredCategories.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm font-body">No topics found for "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverTab;
