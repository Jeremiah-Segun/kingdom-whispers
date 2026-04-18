import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Loader2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface FeedItem {
  id: string;
  user_id: string;
  body: string;
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  like_count: number;
  created_at: string;
  author_name: string | null;
  author_avatar: string | null;
}

const colors = ["bg-rose-500/80", "bg-blue-500/80", "bg-emerald-500/80", "bg-amber-500/80", "bg-purple-500/80"];

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const CommunityFeedLive = ({ onOpenSearch }: { onOpenSearch: () => void }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [followingCount, setFollowingCount] = useState(0);

  const load = async () => {
    if (!user) return;
    setLoading(true);

    const { data: follows } = await supabase
      .from("follows")
      .select("followee_id")
      .eq("follower_id", user.id);

    const followeeIds = (follows ?? []).map((f) => f.followee_id);
    setFollowingCount(followeeIds.length);

    if (followeeIds.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    const { data: comments } = await supabase
      .from("verse_comments")
      .select("id, user_id, body, reference, book, chapter, verse, like_count, created_at")
      .in("user_id", followeeIds)
      .order("created_at", { ascending: false })
      .limit(30);

    const authorIds = Array.from(new Set((comments ?? []).map((c) => c.user_id)));
    const { data: profiles } = authorIds.length
      ? await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", authorIds)
      : { data: [] as { user_id: string; display_name: string | null; avatar_url: string | null }[] };

    const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));

    const merged: FeedItem[] = (comments ?? []).map((c) => ({
      ...c,
      author_name: profileMap.get(c.user_id)?.display_name ?? "Whisperer",
      author_avatar: profileMap.get(c.user_id)?.avatar_url ?? null,
    }));
    setItems(merged);

    // Load my likes for these comments
    if (merged.length) {
      const { data: myLikes } = await supabase
        .from("comment_likes")
        .select("comment_id")
        .eq("user_id", user.id)
        .in("comment_id", merged.map((m) => m.id));
      setLiked(new Set((myLikes ?? []).map((l) => l.comment_id)));
    }

    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("community-feed-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "verse_comments" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line
  }, [user]);

  const toggleLike = async (id: string) => {
    if (!user) return;
    const isLiked = liked.has(id);
    const next = new Set(liked);
    if (isLiked) {
      next.delete(id);
      setLiked(next);
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, like_count: Math.max(0, i.like_count - 1) } : i));
      await supabase.from("comment_likes").delete().eq("user_id", user.id).eq("comment_id", id);
    } else {
      next.add(id);
      setLiked(next);
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, like_count: i.like_count + 1 } : i));
      await supabase.from("comment_likes").insert({ user_id: user.id, comment_id: id });
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

  if (followingCount === 0 || items.length === 0) {
    return (
      <div className="rounded-xl bg-card border border-border p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <p className="font-heading text-sm font-semibold text-foreground mb-1">
          {followingCount === 0 ? "Follow friends to see their highlights" : "No highlights yet from your friends"}
        </p>
        <p className="text-xs text-muted-foreground font-body mb-4">
          When people you follow comment on verses, they'll show up here.
        </p>
        <button
          onClick={onOpenSearch}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-body font-medium"
        >
          Find friends
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((h, i) => (
        <motion.div
          key={h.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 * i }}
          className="rounded-xl bg-card p-4 border border-border"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-full ${colorFor(h.user_id)} flex items-center justify-center overflow-hidden`}>
              {h.author_avatar ? (
                <img src={h.author_avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-heading font-bold text-foreground">
                  {(h.author_name?.[0] ?? "·").toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-body text-foreground truncate">
                <span className="font-semibold">{h.author_name}</span>{" "}
                <span className="text-muted-foreground">commented on</span>{" "}
                <span className="text-primary">{h.reference}</span>
              </p>
              <span className="text-[10px] text-muted-foreground">{timeAgo(h.created_at)}</span>
            </div>
          </div>

          <div className="pl-4 border-l-2 border-primary/40 mb-3">
            <p className="text-sm text-secondary-foreground font-body italic leading-relaxed">"{h.body}"</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => toggleLike(h.id)}
              className={`flex items-center gap-1.5 transition-colors ${
                liked.has(h.id) ? "text-primary" : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Heart className="w-3.5 h-3.5" fill={liked.has(h.id) ? "currentColor" : "none"} />
              <span className="text-[10px] font-body">{h.like_count}</span>
            </button>
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-accent transition-colors">
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-body">Comment</span>
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CommunityFeedLive;
