import { useEffect, useMemo, useState } from "react";
import { Search, Loader2, BookOpen, Trash2, Pencil } from "lucide-react";
import ResponsiveModal from "@/components/ResponsiveModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import VerseWhisperDrawer from "@/components/VerseWhisperDrawer";

interface WhisperRow {
  id: string;
  reference: string;
  verse_text: string;
  note: string | null;
  book: string | null;
  chapter: number | null;
  verse: number | null;
  created_at: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WhispersLibrary = ({ open, onOpenChange }: Props) => {
  const { user } = useAuth();
  const [items, setItems] = useState<WhisperRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<WhisperRow | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("bookmarks")
      .select("id, reference, verse_text, note, book, chapter, verse, created_at")
      .eq("user_id", user.id)
      .not("note", "is", null)
      .order("created_at", { ascending: false });
    setItems((data ?? []) as WhisperRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line
  }, [open, user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.note?.toLowerCase().includes(q) ||
        i.reference.toLowerCase().includes(q) ||
        i.verse_text.toLowerCase().includes(q)
    );
  }, [items, query]);

  const remove = async (id: string) => {
    const prev = items;
    setItems((arr) => arr.filter((i) => i.id !== id));
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);
    if (error) {
      setItems(prev);
      toast.error("Couldn't remove");
    } else {
      toast.success("Whisper removed");
    }
  };

  return (
    <>
      <ResponsiveModal
        open={open}
        onOpenChange={onOpenChange}
        title="Your Whispers"
        description="Personal reflections, attached to Scripture."
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-secondary rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reflections, verses, references…"
              className="bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground outline-none w-full"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10">
              <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-body text-muted-foreground">
                {items.length === 0
                  ? "Long-press a verse in the Bible reader to add your first Whisper."
                  : "No Whispers match that search."}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {filtered.map((w) => (
                <div key={w.id} className="rounded-xl bg-card border border-border p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[10px] tracking-[0.16em] uppercase text-primary font-body font-semibold">
                      {w.reference}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditing(w)}
                        className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary"
                        aria-label="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => remove(w.id)}
                        className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <blockquote className="pl-3 border-l-2 border-primary/40 text-xs font-body italic text-foreground/75 mb-2">
                    "{w.verse_text}"
                  </blockquote>
                  <p className="text-sm font-body text-foreground whitespace-pre-wrap leading-relaxed">
                    {w.note}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </ResponsiveModal>

      {editing && (
        <VerseWhisperDrawer
          open={!!editing}
          onOpenChange={(v) => !v && setEditing(null)}
          reference={editing.reference}
          book={editing.book ?? ""}
          chapter={editing.chapter ?? 0}
          verse={editing.verse ?? 0}
          verseText={editing.verse_text}
          onChanged={load}
        />
      )}
    </>
  );
};

export default WhispersLibrary;
