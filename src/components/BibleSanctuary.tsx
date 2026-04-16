import { motion } from "framer-motion";
import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { bibleChapters } from "@/lib/verses";

interface BibleSanctuaryProps {
  onBack: () => void;
}

const BibleSanctuary = ({ onBack }: BibleSanctuaryProps) => {
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);
  const chapter = bibleChapters[selectedChapter];

  const goNext = () => {
    if (selectedChapter < bibleChapters.length - 1) {
      setSelectedChapter(selectedChapter + 1);
      setHighlightedVerse(null);
    }
  };

  const goPrev = () => {
    if (selectedChapter > 0) {
      setSelectedChapter(selectedChapter - 1);
      setHighlightedVerse(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl px-5 py-3 flex items-center justify-between">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="px-3 py-1 rounded-full bg-secondary text-xs font-body font-medium text-secondary-foreground">
            ESV
          </button>
        </div>
      </div>

      {/* Verses */}
      <div className="px-6 py-8 max-w-lg mx-auto">
        <motion.h2
          key={selectedChapter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-heading text-2xl font-bold text-foreground mb-8"
        >
          {chapter.book} {chapter.chapter}
        </motion.h2>

        {chapter.verses.map((verse, i) => (
          <motion.p
            key={`${selectedChapter}-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setHighlightedVerse(highlightedVerse === i ? null : i)}
            className={`font-body text-[15px] leading-[2] cursor-pointer transition-colors inline ${
              highlightedVerse === i
                ? "bg-primary/15 text-foreground rounded px-0.5"
                : "text-foreground/85 hover:text-foreground"
            }`}
          >
            <span className="text-primary/60 text-xs font-heading font-bold mr-1.5 select-none">
              {i + 1}
            </span>
            {verse}{" "}
          </motion.p>
        ))}
      </div>

      {/* Floating chapter pill */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-1 bg-secondary/95 backdrop-blur-lg rounded-full px-2 py-1.5 shadow-card border border-border">
          <button
            onClick={goPrev}
            disabled={selectedChapter === 0}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 text-sm font-heading font-semibold text-foreground">
            {chapter.book} {chapter.chapter}
          </span>
          <button
            onClick={goNext}
            disabled={selectedChapter === bibleChapters.length - 1}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BibleSanctuary;
