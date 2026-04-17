import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, CheckCircle2, Circle, Globe, Lock, Trash2, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Prayer {
  id: string;
  subject: string;
  body: string | null;
  tags: string[];
  is_answered: boolean;
  answered_at: string | null;
  is_public: boolean;
  created_at: string;
}

interface PrayerJournalProps {
  open: boolean;
  onClose: () => void;
}

const PRESET_TAGS = ["family", "health", "work", "guidance", "gratitude", "wisdom"];

const PrayerJournal = ({ open, onClose }: PrayerJournalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "answered">("all");

  // Form state
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("prayers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Couldn't load prayers", description: error.message, variant: "destructive" });
    setPrayers((data ?? []) as Prayer[]);
    setLoading(false);
  };

  useEffect(() => {
    if (open) load();
  }, [open, user]);

  const reset = () => {
    setSubject(""); setBody(""); setTags([]); setIsPublic(false); setShowForm(false);
  };

  const submit = async () => {
    if (!user || !subject.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("prayers").insert({
      user_id: user.id,
      subject: subject.trim(),
      body: body.trim() || null,
      tags,
      is_public: isPublic,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Couldn't save prayer", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Prayer saved", description: isPublic ? "Shared with the community" : "Kept private" });
    reset();
    load();
  };

  const toggleAnswered = async (p: Prayer) => {
    const next = !p.is_answered;
    setPrayers((arr) => arr.map((x) => x.id === p.id ? { ...x, is_answered: next, answered_at: next ? new Date().toISOString() : null } : x));
    await supabase.from("prayers").update({ is_answered: next, answered_at: next ? new Date().toISOString() : null }).eq("id", p.id);
  };

  const toggleShare = async (p: Prayer) => {
    const next = !p.is_public;
    setPrayers((arr) => arr.map((x) => x.id === p.id ? { ...x, is_public: next } : x));
    await supabase.from("prayers").update({ is_public: next }).eq("id", p.id);
    toast({ title: next ? "Shared with community" : "Made private" });
  };

  const remove = async (p: Prayer) => {
    setPrayers((arr) => arr.filter((x) => x.id !== p.id));
    await supabase.from("prayers").delete().eq("id", p.id);
  };

  const toggleTag = (t: string) => {
    setTags((arr) => arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]);
  };

  const filtered = prayers.filter((p) =>
    filter === "all" ? true : filter === "answered" ? p.is_answered : !p.is_answered
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed inset-x-0 bottom-0 top-12 z-50 bg-background rounded-t-3xl border-t border-border max-w-md mx-auto flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">Prayer Journal</h2>
                <p className="text-[10px] text-muted-foreground font-body">Private by default · share when ready</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-surface-hover">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filters + add */}
            <div className="px-5 py-3 flex items-center gap-2 border-b border-border">
              {(["all", "active", "answered"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-body font-medium capitalize transition-all ${
                    filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
              <button
                onClick={() => setShowForm((s) => !s)}
                className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-body font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                {showForm ? "Cancel" : "New"}
              </button>
            </div>

            {/* Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="px-5 py-4 border-b border-border bg-card/40 overflow-hidden"
                >
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What are you praying for?"
                    maxLength={120}
                    className="w-full bg-transparent text-sm font-body font-semibold text-foreground placeholder:text-muted-foreground outline-none border-b border-border pb-2 mb-3"
                  />
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Pour out your heart… (optional)"
                    rows={3}
                    maxLength={1000}
                    className="w-full bg-transparent text-sm font-body text-foreground/85 placeholder:text-muted-foreground outline-none resize-none mb-3"
                  />
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {PRESET_TAGS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTag(t)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-body font-medium transition-all ${
                          tags.includes(t) ? "bg-primary/15 text-primary border border-primary/30" : "bg-secondary text-muted-foreground border border-transparent"
                        }`}
                      >
                        <Tag className="w-2.5 h-2.5 inline mr-1" />{t}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsPublic((p) => !p)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-body transition-all ${
                        isPublic ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {isPublic ? "Sharing with community" : "Private"}
                    </button>
                    <button
                      onClick={submit}
                      disabled={!subject.trim() || saving}
                      className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-body font-semibold disabled:opacity-50"
                    >
                      {saving ? "Saving…" : "Save Prayer"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {loading && <p className="text-center text-xs text-muted-foreground font-body py-8">Loading…</p>}
              {!loading && filtered.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground font-body">No prayers yet.</p>
                  <p className="text-xs text-muted-foreground/70 font-body mt-1">Tap "New" to begin.</p>
                </div>
              )}
              {filtered.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border ${p.is_answered ? "bg-primary/5 border-primary/20" : "bg-card border-border"}`}
                >
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleAnswered(p)} className="mt-0.5 shrink-0">
                      {p.is_answered ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-heading text-sm font-semibold ${p.is_answered ? "text-foreground/70 line-through" : "text-foreground"}`}>
                        {p.subject}
                      </p>
                      {p.body && <p className="text-xs text-muted-foreground font-body mt-1 leading-relaxed whitespace-pre-wrap">{p.body}</p>}
                      {p.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.tags.map((t) => (
                            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-body">#{t}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-2.5">
                        <button onClick={() => toggleShare(p)} className={`flex items-center gap-1 text-[10px] font-body ${p.is_public ? "text-accent" : "text-muted-foreground"}`}>
                          {p.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {p.is_public ? "Shared" : "Private"}
                        </button>
                        <span className="text-[10px] text-muted-foreground/70 font-body">
                          {new Date(p.created_at).toLocaleDateString()}
                        </span>
                        <button onClick={() => remove(p)} className="ml-auto text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PrayerJournal;
