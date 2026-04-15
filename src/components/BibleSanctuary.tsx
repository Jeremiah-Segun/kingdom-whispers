import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, Share2, MessageCircle, BookOpen } from "lucide-react";
import { bibleChapters } from "@/lib/verses";

interface BibleSanctuaryProps {
  onBack: () => void;
}

const BibleSanctuary = ({ onBack }: BibleSanctuaryProps) => {
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);
  const chapter = bibleChapters[selectedChapter];

  return (
    <div className="min-h-screen bg-parchment pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-parchment/90 backdrop-blur-md border-b border-border px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="font-heading text-xl text-foreground">{chapter.book} {chapter.chapter}</h2>
        </div>
        <BookOpen className="w-5 h-5 text-gold" />
      </div>

      {/* Book Tabs */}
      <div className="px-6 py-3 flex gap-2">
        {bibleChapters.map((ch, i) => (
          <button
            key={i}
            onClick={() => { setSelectedChapter(i); setHighlightedVerse(null); }}
            className={`px-4 py-2 rounded-full text-sm font-body transition-all ${
              selectedChapter === i
                ? "bg-primary text-primary-foreground shadow-golden"
                : "bg-card text-muted-foreground border border-border hover:border-gold/30"
            }`}
          >
            {ch.book} {ch.chapter}
          </button>
        ))}
      </div>

      {/* Verses */}
      <div className="px-6 py-6 max-w-2xl mx-auto">
        {chapter.verses.map((verse, i) => (
          <motion.div
            key={`${selectedChapter}-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setHighlightedVerse(highlightedVerse === i ? null : i)}
            className={`group cursor-pointer py-3 px-4 -mx-4 rounded-xl transition-all ${
              highlightedVerse === i ? "bg-gold/10 shadow-golden" : "hover:bg-card"
            }`}
          >
            <p className="font-body text-base leading-[1.9] text-foreground">
              <span className="font-heading text-sm text-gold mr-2 font-semibold">{i + 1}</span>
              {verse}
            </p>

            {/* Action bar on highlight */}
            {highlightedVerse === i && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mt-3 pt-3 border-t border-gold/20"
              >
                <button className="flex items-center gap-1.5 text-xs text-gold font-body font-medium hover:text-gold-glow transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" /> Whisper Your Thoughts
                </button>
                <button className="flex items-center gap-1.5 text-xs text-ether font-body font-medium hover:text-ether-light transition-colors">
                  <Share2 className="w-3.5 h-3.5" /> Create Verse Image
                </button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BibleSanctuary;
