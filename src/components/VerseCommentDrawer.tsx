import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Flag, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface CommentRow {
  id: string;
  user_id: string;
  body: string;
  like_count: number;
  created_at: string;
  author_name?: string;
  liked_by_me?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  verseText: string;
}

const VerseCommentDrawer = ({ open, onClose, reference, book, chapter, verse, verseText }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: rows } = await supabase
      .from("verse_comments")
      .select("id, user_id, body, like_count, created_at")
      .eq("reference", reference)
      .order("created_at", { ascending: false });

    const list = (rows ?? []) as CommentRow[];

    if (list.length > 0) {
      const ids = list.map((c) => c.user_id);
      const [{ data: profs }, { data: myLikes }] = await Promise.all([
        supabase.from("profiles").select("user_id, display_name").in("user_id", ids),
        supabase.from("comment_likes").select("comment_id").eq("user_id", user.id).in("comment_id", list.map((c) => c.id)),
      ]);
      const nameMap = new Map((profs ?? []).map((p: any) => [p.user_id, p.display_name]));
      const likedSet = new Set((myLikes ?? []).map((l: any) => l.comment_id));
      list.forEach((c) => {
        c.author_name = nameMap.get(c.user_id) ?? "Whisperer";
        c.liked_by_me = likedSet.has(c.id);
      });
    }
    setComments(list);
    setLoading(false);
  };

  useEffect(() => {
    if (open) load();
  }, [open, reference, user]);

  const post = async () => {
    if (!user || !draft.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("verse_comments").insert({
      user_id: user.id, reference, book, chapter, verse, body: draft.trim(),
    });
    setPosting(false);
    if (error) { toast({ title: "Couldn't post", description: error.message, variant: "destructive" }); return; }
    setDraft("");
    load();
  };

  const toggleLike = async (c: CommentRow) => {
    if (!user) return;
    const next = !c.liked_by_me;
    setComments((arr) => arr.map((x) => x.id === c.id ? { ...x, liked_by_me: next, like_count: x.like_count + (next ? 1 : -1) } : x));
    if (next) {
      await supabase.from("comment_likes").insert({ comment_id: c.id, user_id: user.id });
    } else {
      await supabase.from("comment_likes").delete().eq("comment_id", c.id).eq("user_id", user.id);
    }
  };

  const report = async (c: CommentRow) => {
    if (!user) return;
    const { error } = await supabase.from("comment_reports").insert({ comment_id: c.id, user_id: user.id, reason: "inappropriate" });
    if (error && !error.message.includes("duplicate")) {
      toast({ title: "Couldn't report", description: error.message, variant: "destructive" }); return;
    }
    toast({ title: "Reported", description: "Thank you. Our team will review." });
  };

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
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-3xl border-t border-border max-w-md mx-auto flex flex-col"
            style={{ maxHeight: "85vh" }}
          >
            <div className="flex items-start justify-between px-5 py-4 border-b border-border">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-body text-primary uppercase tracking-[0.15em] mb-1">{reference}</p>
                <p className="text-xs font-body text-muted-foreground italic line-clamp-2">"{verseText}"</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground shrink-0 ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {loading && <p className="text-center text-xs text-muted-foreground font-body py-6">Loading…</p>}
              {!loading && comments.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-sm text-muted-foreground font-body">Be the first to share on this verse.</p>
                </div>
              )}
              {comments.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-card border border-border"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-heading font-semibold text-foreground">{c.author_name}</p>
                    <span className="text-[10px] text-muted-foreground font-body">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm font-body text-foreground/90 leading-relaxed whitespace-pre-wrap">{c.body}</p>
                  <div className="flex items-center gap-3 mt-2.5">
                    <button onClick={() => toggleLike(c)} className={`flex items-center gap-1 text-[11px] font-body ${c.liked_by_me ? "text-primary" : "text-muted-foreground"}`}>
                      <Heart className="w-3.5 h-3.5" fill={c.liked_by_me ? "currentColor" : "none"} />
                      {c.like_count}
                    </button>
                    {c.user_id !== user?.id && (
                      <button onClick={() => report(c)} className="flex items-center gap-1 text-[10px] font-body text-muted-foreground hover:text-destructive ml-auto">
                        <Flag className="w-3 h-3" /> Report
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Composer */}
            <div className="px-4 py-3 border-t border-border bg-background flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Share a reflection on this verse…"
                rows={1}
                maxLength={500}
                className="flex-1 bg-secondary rounded-2xl px-3.5 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none resize-none max-h-24"
              />
              <button
                onClick={post}
                disabled={!draft.trim() || posting}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VerseCommentDrawer;
