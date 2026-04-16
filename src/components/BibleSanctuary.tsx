import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Settings, Volume2, VolumeX, BookOpen } from "lucide-react";
import { bibleChapters } from "@/lib/verses";

interface BibleSanctuaryProps {
  onBack: () => void;
}

const BibleSanctuary = ({ onBack }: BibleSanctuaryProps) => {
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);
  const [ambientOn, setAmbientOn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(15);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [readingTime, setReadingTime] = useState(0);
  const [showBadge, setShowBadge] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chapter = bibleChapters[selectedChapter];

  // Reading timer for Deep Seeker badge
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setReadingTime((prev) => {
        const next = prev + 1;
        if (next === 300 && !showBadge) setShowBadge(true); // 5 min = 300s
        return next;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showBadge]);

  // Ambient audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      // Use a gentle brown noise / ambient tone data URI (silent fallback)
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
  }, []);

  const toggleAmbient = () => {
    if (!audioRef.current) return;
    if (ambientOn) {
      audioRef.current.pause();
    } else {
      // Create ambient sound using Web Audio API
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.015; // Very quiet white noise
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Low-pass filter for warm ambient feel
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 200;

        const gain = ctx.createGain();
        gain.gain.value = 0.4;

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        whiteNoise.start();

        // Store for cleanup
        (audioRef.current as any)._ctx = ctx;
        (audioRef.current as any)._source = whiteNoise;
      } catch {
        // Fallback: silent
      }
    }
    if (ambientOn && (audioRef.current as any)?._ctx) {
      try {
        (audioRef.current as any)._source?.stop();
        (audioRef.current as any)._ctx?.close();
      } catch {}
    }
    setAmbientOn(!ambientOn);
  };

  const goNext = () => {
    if (selectedChapter < bibleChapters.length - 1) {
      setSelectedChapter(selectedChapter + 1);
      setHighlightedVerse(null);
      setSearchQuery("");
    }
  };

  const goPrev = () => {
    if (selectedChapter > 0) {
      setSelectedChapter(selectedChapter - 1);
      setHighlightedVerse(null);
      setSearchQuery("");
    }
  };

  const filteredVerses = chapter.verses.map((verse, i) => ({
    text: verse,
    index: i,
    matches: searchQuery
      ? verse.toLowerCase().includes(searchQuery.toLowerCase())
      : true,
  }));

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl px-5 py-3 flex items-center justify-between">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          {/* Ambient toggle */}
          <button
            onClick={toggleAmbient}
            className={`p-1.5 rounded-full transition-colors ${
              ambientOn ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
            }`}
            title={ambientOn ? "Disable ambient whispers" : "Enable ambient whispers"}
          >
            {ambientOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button className="px-3 py-1 rounded-full bg-secondary text-xs font-body font-medium text-secondary-foreground">
            ESV
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-5 pb-3"
        >
          <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search in this chapter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground outline-none w-full"
              autoFocus
            />
          </div>
        </motion.div>
      )}

      {/* Font size settings */}
      {showSettings && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="px-5 pb-3"
        >
          <div className="flex items-center gap-4 bg-secondary rounded-xl px-4 py-3">
            <span className="text-xs font-body text-muted-foreground">Aa</span>
            <input
              type="range"
              min="12"
              max="22"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="text-xs font-body text-muted-foreground">{fontSize}px</span>
          </div>
        </motion.div>
      )}

      {/* Ambient indicator */}
      {ambientOn && (
        <div className="px-5 pb-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 w-fit">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
            <span className="text-[10px] font-body text-primary">Atmospheric Whispers</span>
          </div>
        </div>
      )}

      {/* Deep Seeker badge popup */}
      {showBadge && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mb-4 p-3 rounded-xl bg-primary/15 border border-primary/20 flex items-center gap-3"
        >
          <BookOpen className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-xs font-heading font-semibold text-foreground">Deep Seeker Badge Earned!</p>
            <p className="text-[10px] text-muted-foreground font-body">You've been reading for 5+ minutes</p>
          </div>
          <button
            onClick={() => setShowBadge(false)}
            className="ml-auto text-muted-foreground hover:text-foreground text-xs"
          >
            ✕
          </button>
        </motion.div>
      )}

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

        {filteredVerses.map((v) => (
          <motion.p
            key={`${selectedChapter}-${v.index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: v.index * 0.03 }}
            onClick={() => setHighlightedVerse(highlightedVerse === v.index ? null : v.index)}
            style={{ fontSize: `${fontSize}px` }}
            className={`font-body leading-[2] cursor-pointer transition-colors inline ${
              highlightedVerse === v.index
                ? "bg-primary/15 text-foreground rounded px-0.5"
                : searchQuery && v.matches
                  ? "bg-accent/15 text-foreground"
                  : searchQuery && !v.matches
                    ? "text-foreground/30"
                    : "text-foreground/85 hover:text-foreground"
            }`}
          >
            <span className="text-primary/60 text-xs font-heading font-bold mr-1.5 select-none">
              {v.index + 1}
            </span>
            {v.text}{" "}
          </motion.p>
        ))}
      </div>

      {/* Reading time indicator */}
      <div className="fixed bottom-[88px] right-4 z-30">
        <div className="px-2.5 py-1 rounded-full bg-secondary/90 backdrop-blur-sm text-[10px] font-body text-muted-foreground">
          {Math.floor(readingTime / 60)}:{(readingTime % 60).toString().padStart(2, "0")}
        </div>
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
