import { useEffect, useState } from "react";
import { Loader2, Save, Trash2 } from "lucide-react";
import ResponsiveModal from "@/components/ResponsiveModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { awardBadge } from "@/lib/badges";

interface VerseWhisperDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  verseText: string;
  /** Called when the bookmark is created/updated/deleted, so callers can refresh. */
  onChanged?: () => void;
}

const MAX_LEN = 1500;

const VerseWhisperDrawer = ({
  open,
  onOpenChange,
  reference,
  book,
  chapter,
  verse,
  verseText,
  onChanged,
}: VerseWhisperDrawerProps) => {
  const { user } = useAuth();
  const [note, setNote] = useState("");
  const [existingId, setExistingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("bookmarks")
        .select("id, note")
        .eq("user_id", user.id)
        .eq("reference", reference)
        .maybeSingle();
      if (cancelled) return;
      setExistingId(data?.id ?? null);
      setNote(data?.note ?? "");
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open, user, reference]);

  const save = async () => {
    if (!user) return;
    const trimmed = note.trim();
    if (trimmed.length > MAX_LEN) {
      toast.error(`Keep your Whisper under ${MAX_LEN} characters`);
      return;
    }
    setSaving(true);
    if (existingId) {
      const { error } = await supabase
        .from("bookmarks")
        .update({ note: trimmed || null })
        .eq("id", existingId);
      if (error) {
        toast.error("Couldn't save your Whisper");
      } else {
        toast.success("Whisper saved");
        onChanged?.();
        onOpenChange(false);
      }
    } else {
      const { data, error } = await supabase
        .from("bookmarks")
        .insert({
          user_id: user.id,
          reference,
          verse_text: verseText,
          book,
          chapter,
          verse,
          note: trimmed || null,
        })
        .select("id")
        .single();
      if (error) {
        toast.error("Couldn't save your Whisper");
      } else {
        setExistingId(data.id);
        toast.success("Whisper saved");
        onChanged?.();
        // Award badges
        if (trimmed) {
          const first = await awardBadge(user.id, "first_whisper");
          if (first) toast.success(`Badge unlocked: ${first.label}`);
          const { count } = await supabase
            .from("bookmarks")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .not("note", "is", null);
          if ((count ?? 0) >= 10) {
            const keeper = await awardBadge(user.id, "whisper_keeper");
            if (keeper) toast.success(`Badge unlocked: ${keeper.label}`);
          }
        }
        onOpenChange(false);
      }
    }
    setSaving(false);
  };

  const remove = async () => {
    if (!user || !existingId) return;
    setSaving(true);
    const { error } = await supabase.from("bookmarks").delete().eq("id", existingId);
    setSaving(false);
    if (error) {
      toast.error("Couldn't remove");
      return;
    }
    setExistingId(null);
    setNote("");
    toast.success("Removed");
    onChanged?.();
    onOpenChange(false);
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Add a Whisper"
      description={reference}
    >
      <div className="space-y-4">
        <blockquote className="pl-3 border-l-2 border-primary/40 text-sm font-body italic text-foreground/85">
          "{verseText}"
        </blockquote>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : (
          <>
            <div>
              <label className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground font-body font-semibold">
                Your reflection
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, MAX_LEN))}
                rows={6}
                placeholder="What is this verse stirring in you? Write a Whisper — a private reflection just for you."
                className="mt-2 w-full resize-none rounded-xl bg-secondary px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="text-right text-[10px] text-muted-foreground font-body mt-1">
                {note.length}/{MAX_LEN}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {existingId && (
                <button
                  onClick={remove}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-xs font-body font-medium disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
              <button
                onClick={save}
                disabled={saving}
                className="ml-auto inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-body font-medium disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Whisper
              </button>
            </div>
          </>
        )}
      </div>
    </ResponsiveModal>
  );
};

export default VerseWhisperDrawer;
