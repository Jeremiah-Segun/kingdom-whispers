import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Search, UserPlus, UserCheck, Loader2 } from "lucide-react";

interface FriendSearchDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange?: () => void;
}

interface ProfileRow {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

const FriendSearchDrawer = ({ open, onOpenChange, onChange }: FriendSearchDrawerProps) => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfileRow[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load current following set
  useEffect(() => {
    if (!user || !open) return;
    (async () => {
      const { data } = await supabase
        .from("follows")
        .select("followee_id")
        .eq("follower_id", user.id);
      setFollowing(new Set((data ?? []).map((r) => r.followee_id)));
    })();
  }, [user, open]);

  // Search profiles (debounced)
  useEffect(() => {
    if (!user) return;
    const handle = setTimeout(async () => {
      setLoading(true);
      const builder = supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, bio")
        .neq("user_id", user.id)
        .limit(20);
      const { data } = query.trim()
        ? await builder.ilike("display_name", `%${query.trim()}%`)
        : await builder.order("created_at", { ascending: false });
      setResults((data ?? []) as ProfileRow[]);
      setLoading(false);
    }, 200);
    return () => clearTimeout(handle);
  }, [query, user, open]);

  const toggleFollow = async (followeeId: string) => {
    if (!user) return;
    const isFollowing = following.has(followeeId);
    const next = new Set(following);
    if (isFollowing) {
      next.delete(followeeId);
      setFollowing(next);
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("followee_id", followeeId);
    } else {
      next.add(followeeId);
      setFollowing(next);
      await supabase.from("follows").insert({ follower_id: user.id, followee_id: followeeId });
    }
    onChange?.();
  };

  const initial = (name: string | null) => (name?.trim()?.[0] ?? "·").toUpperCase();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-background border-border">
        <DrawerHeader>
          <DrawerTitle className="font-heading text-foreground">Find friends</DrawerTitle>
        </DrawerHeader>
        <div className="px-5 pb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground text-sm font-body border border-border focus:outline-none focus:border-primary/40"
            />
          </div>

          <div className="max-h-[60vh] overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            ) : results.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground font-body py-8">No users found</p>
            ) : (
              results.map((p) => {
                const isFollowing = following.has(p.user_id);
                return (
                  <div key={p.user_id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0 overflow-hidden">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-heading font-bold text-primary">{initial(p.display_name)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-heading font-semibold text-foreground truncate">
                        {p.display_name ?? "Whisperer"}
                      </p>
                      {p.bio && <p className="text-[11px] text-muted-foreground font-body truncate">{p.bio}</p>}
                    </div>
                    <button
                      onClick={() => toggleFollow(p.user_id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-body font-medium transition-colors ${
                        isFollowing
                          ? "bg-primary/15 text-primary"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FriendSearchDrawer;
