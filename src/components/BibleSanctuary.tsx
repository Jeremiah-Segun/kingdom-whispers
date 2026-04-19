import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Settings, Volume2, VolumeX, BookOpen, Bookmark, MessageCircle } from "lucide-react";
import { bibleChapters } from "@/lib/verses";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import VerseCommentDrawer from "@/components/VerseCommentDrawer";
import VerseWhisperDrawer from "@/components/VerseWhisperDrawer";
import BadgeUnlockModal, { type BadgeInfo } from "@/components/BadgeUnlockModal";
import { awardBadge } from "@/lib/badges";

interface BibleSanctuaryProps {
  onBack: () => void;
}

const BibleSanctuary = ({ onBack }: BibleSanctuaryProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);
  const [ambientOn, setAmbientOn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(15);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [readingTime, setReadingTime] = useState(0);
  const [unlocked, setUnlocked] = useState<BadgeInfo | null>(null);
  const [bookmarkedRefs, setBookmarkedRefs] = useState<Set<string>>(new Set());
  const [commentDrawer, setCommentDrawer] = useState<{ ref: string; text: string; verse: number } | null>(null);
  const [whisperDrawer, setWhisperDrawer] = useState<{ ref: string; text: string; verse: number } | null>(null);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [resumeToast, setResumeToast] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);
  const baseSecondsRef = useRef(0); // seconds already persisted for current chapter
  const sessionStartRef = useRef(0); // readingTime value when current chapter began
  const lastVerseRef = useRef<number>(1);
  const chapter = bibleChapters[selectedChapter];

  // Load existing bookmarks + resume position
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: bms }, { data: prog }] = await Promise.all([
        supabase.from("bookmarks").select("reference").eq("user_id", user.id),
        supabase
          .from("reading_progress")
          .select("book, chapter, last_verse, read_seconds, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      setBookmarkedRefs(new Set((bms ?? []).map((b: any) => b.reference)));
      if (prog) {
        const idx = bibleChapters.findIndex((c) => c.book === prog.book && c.chapter === prog.chapter);
        if (idx >= 0) {
          setSelectedChapter(idx);
          if (prog.last_verse) {
            lastVerseRef.current = prog.last_verse;
            setHighlightedVerse(prog.last_verse - 1);
          }
          setResumeToast(`${prog.book} ${prog.chapter}:${prog.last_verse ?? 1}`);
        }
      }
      setProgressLoaded(true);
    })();
  }, [user]);

  // One-time resume toast
  useEffect(() => {
    if (resumeToast) {
      toast({ title: "Resumed where you left off", description: resumeToast });
      setResumeToast(null);
    }
  }, [resumeToast, toast]);

  // Load per-chapter accumulated read_seconds & reset session base whenever chapter changes
  useEffect(() => {
    if (!user || !progressLoaded) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("reading_progress")
        .select("read_seconds, last_verse")
        .eq("user_id", user.id)
        .eq("book", chapter.book)
        .eq("chapter", chapter.chapter)
        .maybeSingle();
      if (cancelled) return;
      baseSecondsRef.current = data?.read_seconds ?? 0;
      sessionStartRef.current = readingTime;
      lastVerseRef.current = data?.last_verse ?? 1;
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChapter, user, progressLoaded]);

  // Persist progress every 10s + on unmount
  const persistProgress = async () => {
    if (!user) return;
    const sessionSecs = Math.max(0, readingTime - sessionStartRef.current);
    const total = baseSecondsRef.current + sessionSecs;
    await supabase.from("reading_progress").upsert(
      {
        user_id: user.id,
        book: chapter.book,
        chapter: chapter.chapter,
        last_verse: lastVerseRef.current,
        read_seconds: total,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,book,chapter" }
    );
  };

  useEffect(() => {
    if (!user || !progressLoaded) return;
    saveRef.current = setInterval(() => { persistProgress(); }, 10000);
    const onHide = () => { persistProgress(); };
    window.addEventListener("beforeunload", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      if (saveRef.current) clearInterval(saveRef.current);
      window.removeEventListener("beforeunload", onHide);
      document.removeEventListener("visibilitychange", onHide);
      persistProgress();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, progressLoaded, selectedChapter]);

  // Log reading day on mount + check streak badges
  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    (async () => {
      await supabase.from("reading_days").insert({ user_id: user.id, read_date: today }).then(() => {});
      // Check streak badge
      const { data: streakRow } = await supabase
        .from("user_streaks").select("current_streak").eq("user_id", user.id).maybeSingle();
      const s = streakRow?.current_streak ?? 0;
      const key = s >= 100 ? "streak_100" : s >= 30 ? "streak_30" : s >= 7 ? "streak_7" : null;
      if (key) {
        const awarded = await awardBadge(user.id, key);
        if (awarded) setUnlocked(awarded);
      }
    })();
  }, [user]);

  // Reading timer for Deep Seeker badge
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setReadingTime((prev) => {
        const next = prev + 1;
        if (next === 300 && user) {
          awardBadge(user.id, "deep_seeker").then((b) => { if (b) setUnlocked(b); });
        }
        return next;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [user]);

  // Ambient audio (Web Audio API)
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const toggleAmbient = () => {
    if (ambientOn) {
      try { sourceRef.current?.stop(); ctxRef.current?.close(); } catch {}
      ctxRef.current = null; sourceRef.current = null;
      setAmbientOn(false);
      return;
    }
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1) * 0.015;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer; noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass"; filter.frequency.value = 200;
      const gain = ctx.createGain(); gain.gain.value = 0.4;
      noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      noise.start();
      ctxRef.current = ctx; sourceRef.current = noise;
      setAmbientOn(true);
    } catch {}
  };

  const goNext = () => {
    if (selectedChapter < bibleChapters.length - 1) {
      setSelectedChapter(selectedChapter + 1);
      setHighlightedVerse(null); setSearchQuery("");
    }
  };
  const goPrev = () => {
    if (selectedChapter > 0) {
      setSelectedChapter(selectedChapter - 1);
      setHighlightedVerse(null); setSearchQuery("");
    }
  };

  const refOf = (verseIdx: number) => `${chapter.book} ${chapter.chapter}:${verseIdx + 1}`;

  const toggleBookmark = async (verseIdx: number) => {
    if (!user) return;
    const reference = refOf(verseIdx);
    const text = chapter.verses[verseIdx];
    const isBookmarked = bookmarkedRefs.has(reference);
    if (isBookmarked) {
      setBookmarkedRefs((s) => { const n = new Set(s); n.delete(reference); return n; });
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("reference", reference);
      toast({ title: "Bookmark removed" });
    } else {
      setBookmarkedRefs((s) => new Set(s).add(reference));
      await supabase.from("bookmarks").insert({
        user_id: user.id, reference, verse_text: text,
        book: chapter.book, chapter: chapter.chapter, verse: verseIdx + 1,
      });
      toast({ title: "Verse saved", description: reference });
    }
  };

  const startLongPress = (verseIdx: number) => {
    longPressedRef.current = false;
    longPressRef.current = setTimeout(() => {
      longPressedRef.current = true;
      // Long-press now opens the private Whisper journal.
      setWhisperDrawer({ ref: refOf(verseIdx), text: chapter.verses[verseIdx], verse: verseIdx + 1 });
    }, 500);
  };
  const cancelLongPress = () => {
    if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null; }
  };
  const handleVerseClick = (verseIdx: number) => {
    if (longPressedRef.current) { longPressedRef.current = false; return; }
    setHighlightedVerse(highlightedVerse === verseIdx ? null : verseIdx);
    lastVerseRef.current = verseIdx + 1;
    toggleBookmark(verseIdx);
  };

  const filteredVerses = chapter.verses.map((verse, i) => ({
    text: verse, index: i,
    matches: searchQuery ? verse.toLowerCase().includes(searchQuery.toLowerCase()) : true,
  }));

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl px-5 py-3 flex items-center justify-between">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAmbient}
            className={`p-1.5 rounded-full transition-colors ${ambientOn ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
            title={ambientOn ? "Disable ambient whispers" : "Enable ambient whispers"}
          >
            {ambientOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button onClick={() => setSearchOpen(!searchOpen)} className="text-muted-foreground hover:text-foreground">
            <Search className="w-5 h-5" />
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="text-muted-foreground hover:text-foreground">
            <Settings className="w-5 h-5" />
          </button>
          <button className="px-3 py-1 rounded-full bg-secondary text-xs font-body font-medium text-secondary-foreground">ESV</button>
        </div>
      </div>

      {searchOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-5 pb-3">
          <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text" placeholder="Search in this chapter..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground outline-none w-full"
              autoFocus
            />
          </div>
        </motion.div>
      )}

      {showSettings && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-5 pb-3">
          <div className="flex items-center gap-4 bg-secondary rounded-xl px-4 py-3">
            <span className="text-xs font-body text-muted-foreground">Aa</span>
            <input type="range" min="12" max="22" value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))} className="flex-1 accent-primary" />
            <span className="text-xs font-body text-muted-foreground">{fontSize}px</span>
          </div>
        </motion.div>
      )}

      {ambientOn && (
        <div className="px-5 pb-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 w-fit">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
            <span className="text-[10px] font-body text-primary">Atmospheric Whispers</span>
          </div>
        </div>
      )}

      {/* Hint */}
      <div className="px-5 pb-1">
        <p className="text-[10px] text-muted-foreground/70 font-body italic">
          Tap to highlight · long-press to add a Whisper · double-tap for public comment
        </p>
      </div>

      {/* Verses */}
      <div className="px-6 py-6 max-w-lg mx-auto">
        <motion.h2 key={selectedChapter} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="font-heading text-2xl font-bold text-foreground mb-8">
          {chapter.book} {chapter.chapter}
        </motion.h2>

        {filteredVerses.map((v) => {
          const reference = refOf(v.index);
          const isBookmarked = bookmarkedRefs.has(reference);
          return (
            <motion.span
              key={`${selectedChapter}-${v.index}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: v.index * 0.03 }}
              onClick={() => handleVerseClick(v.index)}
              onMouseDown={() => startLongPress(v.index)}
              onMouseUp={cancelLongPress}
              onMouseLeave={cancelLongPress}
              onTouchStart={() => startLongPress(v.index)}
              onTouchEnd={cancelLongPress}
              onContextMenu={(e) => { e.preventDefault(); setWhisperDrawer({ ref: reference, text: v.text, verse: v.index + 1 }); }}
              onDoubleClick={() => setCommentDrawer({ ref: reference, text: v.text, verse: v.index + 1 })}
              style={{ fontSize: `${fontSize}px` }}
              className={`font-body leading-[2] cursor-pointer transition-colors inline select-none ${
                highlightedVerse === v.index || isBookmarked
                  ? "bg-primary/15 text-foreground rounded px-0.5"
                  : searchQuery && v.matches ? "bg-accent/15 text-foreground"
                  : searchQuery && !v.matches ? "text-foreground/30"
                  : "text-foreground/85 hover:text-foreground"
              }`}
            >
              <span className="text-primary/60 text-xs font-heading font-bold mr-1.5 select-none">{v.index + 1}</span>
              {isBookmarked && <Bookmark className="inline w-3 h-3 text-primary mr-1 -mt-0.5" fill="currentColor" />}
              {v.text}{" "}
            </motion.span>
          );
        })}
      </div>

      {/* Reading time */}
      <div className="fixed bottom-[88px] right-4 z-30">
        <div className="px-2.5 py-1 rounded-full bg-secondary/90 backdrop-blur-sm text-[10px] font-body text-muted-foreground">
          {Math.floor(readingTime / 60)}:{(readingTime % 60).toString().padStart(2, "0")}
        </div>
      </div>

      {/* Floating chapter pill */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-1 bg-secondary/95 backdrop-blur-lg rounded-full px-2 py-1.5 shadow-card border border-border">
          <button onClick={goPrev} disabled={selectedChapter === 0}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 text-sm font-heading font-semibold text-foreground">{chapter.book} {chapter.chapter}</span>
          <button onClick={goNext} disabled={selectedChapter === bibleChapters.length - 1}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drawers / modals */}
      <VerseCommentDrawer
        open={!!commentDrawer}
        onClose={() => setCommentDrawer(null)}
        reference={commentDrawer?.ref ?? ""}
        book={chapter.book}
        chapter={chapter.chapter}
        verse={commentDrawer?.verse ?? 1}
        verseText={commentDrawer?.text ?? ""}
      />
      <VerseWhisperDrawer
        open={!!whisperDrawer}
        onOpenChange={(v) => !v && setWhisperDrawer(null)}
        reference={whisperDrawer?.ref ?? ""}
        book={chapter.book}
        chapter={chapter.chapter}
        verse={whisperDrawer?.verse ?? 1}
        verseText={whisperDrawer?.text ?? ""}
        onChanged={async () => {
          if (!user) return;
          const { data: bms } = await supabase.from("bookmarks").select("reference").eq("user_id", user.id);
          setBookmarkedRefs(new Set((bms ?? []).map((b: any) => b.reference)));
        }}
      />
      <BadgeUnlockModal badge={unlocked} onClose={() => setUnlocked(null)} />
    </div>
  );
};

export default BibleSanctuary;
