import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface CommentRow {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  author_name: string | null;
  author_avatar: string | null;
}

const timeAgo = (iso: string) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

const PostCommentsDrawer = ({
  open,
  onOpenChange,
  postId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  postId: string | null;
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    if (!postId) return;
    setLoading(true);
    const { data: comments } = await supabase
      .from("post_comments")
      .select("id, user_id, body, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    const ids = Array.from(new Set((comments ?? []).map((c) => c.user_id)));
    const { data: profiles } = ids.length
      ? await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", ids)
      : { data: [] as { user_id: string; display_name: string | null; avatar_url: string | null }[] };
    const map = new Map((profiles ?? []).map((p) => [p.user_id, p]));

    setItems(
      (comments ?? []).map((c) => ({
        ...c,
        author_name: map.get(c.user_id)?.display_name ?? "Whisperer",
        author_avatar: map.get(c.user_id)?.avatar_url ?? null,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    if (open && postId) load();
    // eslint-disable-next-line
  }, [open, postId]);

  useEffect(() => {
    if (!open || !postId) return;
    const channel = supabase
      .channel(`post-comments-${postId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "post_comments", filter: `post_id=eq.${postId}` },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line
  }, [open, postId]);

  const submit = async () => {
    const trimmed = draft.trim();
    if (!user || !postId || !trimmed) return;
    if (trimmed.length > 300) {
      toast.error("Keep it under 300 characters");
      return;
    }
    setPosting(true);
    const { error } = await supabase.from("post_comments").insert({
      post_id: postId,
      user_id: user.id,
      body: trimmed,
    });
    setPosting(false);
    if (error) {
      toast.error("Couldn't add comment");
      return;
    }
    setDraft("");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="font-heading">Comments</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground font-body py-8">
              Be the first to reply.
            </p>
          ) : (
            items.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 overflow-hidden">
                  {c.author_avatar ? (
                    <img src={c.author_avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[11px] font-heading font-bold text-primary">
                      {(c.author_name?.[0] ?? "·").toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 rounded-xl bg-secondary px-3 py-2">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-xs font-body font-semibold text-foreground truncate">
                      {c.author_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-foreground font-body break-words">{c.body}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-5 pb-6 pt-3 border-t border-border flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 300))}
            placeholder="Write a reply…"
            className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={submit}
            disabled={!draft.trim() || posting}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PostCommentsDrawer;
