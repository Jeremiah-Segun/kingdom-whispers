import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bookmark, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface BookmarkRow {
  id: string;
  reference: string;
  verse_text: string;
  created_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onChanged?: () => void;
}

const SavedBookmarksDrawer = ({ open, onClose, onChanged }: Props) => {
  const { user } = useAuth();
  const [items, setItems] = useState<BookmarkRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("bookmarks")
      .select("id, reference, verse_text, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data ?? []) as BookmarkRow[]);
    setLoading(false);
  };

  useEffect(() => { if (open) load(); }, [open, user]);

  const remove = async (id: string) => {
    setItems((arr) => arr.filter((x) => x.id !== id));
    await supabase.from("bookmarks").delete().eq("id", id);
    onChanged?.();
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
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed inset-x-0 bottom-0 top-16 z-50 bg-background rounded-t-3xl border-t border-border max-w-md mx-auto flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-primary" />
                <h2 className="font-heading text-lg font-bold text-foreground">Saved Verses</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {loading && <p className="text-center text-xs text-muted-foreground font-body py-8">Loading…</p>}
              {!loading && items.length === 0 && (
                <div className="text-center py-12">
                  <Bookmark className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground font-body">No saved verses yet.</p>
                  <p className="text-xs text-muted-foreground/70 font-body mt-1">Tap any verse in the Bible reader to save.</p>
                </div>
              )}
              {items.map((b) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-card border border-border"
                >
                  <p className="text-[10px] font-body text-primary uppercase tracking-[0.15em] mb-1.5">{b.reference}</p>
                  <p className="text-sm font-body text-foreground/90 leading-relaxed">"{b.verse_text}"</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-muted-foreground font-body">{new Date(b.created_at).toLocaleDateString()}</span>
                    <button onClick={() => remove(b.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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

export default SavedBookmarksDrawer;
