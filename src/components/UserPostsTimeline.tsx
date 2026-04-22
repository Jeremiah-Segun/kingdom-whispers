import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Eye, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface PostRow {
  id: string;
  body: string;
  like_count: number;
  comment_count: number;
  view_count: number;
  created_at: string;
}

const timeAgo = (iso: string) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const UserPostsTimeline = ({ userId, displayName, avatarUrl }: { userId: string; displayName: string; avatarUrl?: string | null }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("posts")
      .select("id, body, like_count, comment_count, view_count, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    setPosts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [userId]);

  const handleDelete = async (postId: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast({ title: "Post deleted" });
    }
  };

  const isOwner = user?.id === userId;
  const initial = (displayName?.[0] ?? "·").toUpperCase();

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground font-body">No posts yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 * i }}
          className="rounded-xl bg-card border border-border p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-heading font-bold text-primary">{initial}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-body font-semibold text-foreground truncate">{displayName}</p>
              <span className="text-[10px] text-muted-foreground">{timeAgo(p.created_at)}</span>
            </div>
            {isOwner && (
              <button
                onClick={() => handleDelete(p.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <p className="text-sm text-foreground font-body leading-relaxed whitespace-pre-wrap mb-3">{p.body}</p>

          <div className="flex items-center gap-5 pt-3 border-t border-border text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              <span className="text-[11px] font-body">{p.like_count}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="text-[11px] font-body">{p.comment_count}</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <Eye className="w-3.5 h-3.5" />
              <span className="text-[11px] font-body">{p.view_count}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default UserPostsTimeline;
