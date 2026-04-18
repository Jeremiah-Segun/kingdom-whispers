import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import WelcomeScreen from "@/components/WelcomeScreen";
import HomeFeed from "@/components/HomeFeed";
import BibleSanctuary from "@/components/BibleSanctuary";
import PlansTab from "@/components/PlansTab";
import DiscoverTab from "@/components/DiscoverTab";
import ProfileAltar from "@/components/ProfileAltar";
import BottomNav from "@/components/BottomNav";
import type { Category } from "@/lib/verses";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null; category: Category } | null>(null);
  const [streak, setStreak] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [profileLoading, setProfileLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [discoverLink, setDiscoverLink] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    document.documentElement.classList.toggle("light-mode", !isDark);
  }, [isDark]);

  // Load profile + streak + bookmark count
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [{ data: prof }, { data: streakRow }, { count }] = await Promise.all([
        supabase.from("profiles").select("display_name, avatar_url, category").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_streaks").select("current_streak, last_active_date").eq("user_id", user.id).maybeSingle(),
        supabase.from("bookmarks").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      if (cancelled) return;
      setProfile({
        display_name: prof?.display_name ?? null,
        avatar_url: prof?.avatar_url ?? null,
        category: (prof?.category as Category) ?? "peace",
      });
      setStreak(streakRow?.current_streak ?? 0);
      setBookmarkCount(count ?? 0);
      setProfileLoading(false);

      // Update streak (once per day)
      const today = new Date().toISOString().slice(0, 10);
      const last = streakRow?.last_active_date;
      if (last !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const newStreak = last === yesterday ? (streakRow?.current_streak ?? 0) + 1 : 1;
        await supabase
          .from("user_streaks")
          .upsert({ user_id: user.id, current_streak: newStreak, last_active_date: today }, { onConflict: "user_id" });
        if (!cancelled) setStreak(newStreak);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleOnboardComplete = async (cat: Category) => {
    if (!user) return;
    await supabase.from("profiles").update({ category: cat }).eq("user_id", user.id);
    setProfile((p) => p ? { ...p, category: cat } : p);
  };

  if (loading || !user || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  // Show category onboarding if not yet chosen (first visit)
  if (!profile?.category || profile.category === null) {
    return <WelcomeScreen onComplete={handleOnboardComplete} />;
  }

  const displayName = profile.display_name ?? "Whisperer";

  return (
    <div className="max-w-md mx-auto relative">
      {page === "home" && <HomeFeed category={profile.category} streak={streak} onNavigate={setPage} displayName={displayName} />}
      {page === "bible" && <BibleSanctuary onBack={() => setPage("home")} />}
      {page === "plans" && <PlansTab />}
      {page === "discover" && <DiscoverTab />}
      {page === "you" && (
        <ProfileAltar
          streak={streak}
          onToggleTheme={() => setIsDark(!isDark)}
          isDark={isDark}
          displayName={displayName}
          avatarUrl={profile.avatar_url}
          bookmarkCount={bookmarkCount}
          onSignOut={async () => {
            await signOut();
            navigate("/auth", { replace: true });
          }}
        />
      )}
      <BottomNav active={page} onNavigate={setPage} />
    </div>
  );
};

export default Index;
