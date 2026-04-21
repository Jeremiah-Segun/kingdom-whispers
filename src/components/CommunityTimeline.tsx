import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Loader2, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PostCommentsDrawer from "@/components/PostCommentsDrawer";
import { toast } from "@/hooks/use-toast";

interface PostRow {
  id: string;
  user_id: string;
  body: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  author_name: string | null;
  author_avatar: string | null;
}

const colors = ["bg-rose-500/80", "bg-blue-500/80", "bg-emerald-500/80", "bg-amber-500/80", "bg-purple-500/80"];

const timeAgo = (iso: string) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const CommunityTimeline = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<PostRow[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activePost, setActivePost] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: posts } = await supabase
      .from("posts")
      .select("id, user_id, body, like_count, comment_count, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    const ids = Array.from(new Set((posts ?? []).map((p) => p.user_id)));
    const { data: profiles } = ids.length
      ? await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", ids)
      : { data: [] as { user_id: string; display_name: string | null; avatar_url: string | null }[] };
    const map = new Map((profiles ?? []).map((p) => [p.user_id, p]));

    const merged: PostRow[] = (posts ?? []).map((p) => ({
      ...p,
      author_name: map.get(p.user_id)?.display_name ?? "Whisperer",
      author_avatar: map.get(p.user_id)?.avatar_url ?? null,
    }));
    setItems(merged);

    if (user && merged.length) {
      const { data: myLikes } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", merged.map((m) => m.id));
      setLiked(new Set((myLikes ?? []).map((l) => l.post_id)));
    } else {
      setLiked(new Set());
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [user, refreshKey]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("community-timeline")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line
  }, [user]);

  const toggleLike = async (id: string) => {
    if (!user) return;
    const isLiked = liked.has(id);
    const next = new Set(liked);
    if (isLiked) {
      next.delete(id);
      setLiked(next);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, like_count: Math.max(0, i.like_count - 1) } : i)));
      await supabase.from("post_likes").delete().eq("user_id", user.id).eq("post_id", id);
    } else {
      next.add(id);
      setLiked(next);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, like_count: i.like_count + 1 } : i)));
      await supabase.from("post_likes").insert({ user_id: user.id, post_id: id });
    }
  };

  const colorFor = useMemo(() => (uid: string) => colors[uid.charCodeAt(0) % colors.length], []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl bg-card border border-border p-6 text-center">
        <p className="text-sm font-body text-muted-foreground">
          No posts yet. Share what's on your mind to start the conversation.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {items.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i }}
            className="rounded-xl bg-card border border-border p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-9 h-9 rounded-full ${colorFor(p.user_id)} flex items-center justify-center overflow-hidden`}
              >
                {p.author_avatar ? (
                  <img src={p.author_avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-heading font-bold text-foreground">
                    {(p.author_name?.[0] ?? "·").toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-semibold text-foreground truncate">{p.author_name}</p>
                <span className="text-[10px] text-muted-foreground">{timeAgo(p.created_at)}</span>
              </div>
            </div>

            <p className="text-sm text-foreground font-body leading-relaxed whitespace-pre-wrap mb-3">{p.body}</p>

            <div className="flex items-center gap-5 pt-3 border-t border-border">
              <button
                onClick={() => toggleLike(p.id)}
                className={`flex items-center gap-1.5 transition-colors ${
                  liked.has(p.id) ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                <Heart className="w-3.5 h-3.5" fill={liked.has(p.id) ? "currentColor" : "none"} />
                <span className="text-[11px] font-body">{p.like_count}</span>
              </button>
              <button
                onClick={() => setActivePost(p.id)}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-accent transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="text-[11px] font-body">{p.comment_count}</span>
              </button>
              {user && user.id !== p.user_id && (
                <button
                  onClick={async () => {
                    const { error } = await supabase.from("post_reports").insert({ post_id: p.id, user_id: user.id });
                    if (error?.code === "23505") {
                      toast({ title: "Already reported" });
                    } else if (error) {
                      toast({ title: "Error", description: error.message, variant: "destructive" });
                    } else {
                      toast({ title: "Reported", description: "Thank you for helping keep the community safe." });
                    }
                  }}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-destructive transition-colors ml-auto"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <PostCommentsDrawer
        open={!!activePost}
        onOpenChange={(v) => !v && setActivePost(null)}
        postId={activePost}
      />
    </>
  );
};

export default CommunityTimeline;
