import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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

type TabId = "home" | "bible" | "plans" | "discover" | "you";

const TAB_ORDER: TabId[] = ["home", "bible", "plans", "discover", "you"];

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null; category: Category } | null>(null);
  const [streak, setStreak] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [profileLoading, setProfileLoading] = useState(true);
  const [page, setPage] = useState<TabId>("home");
  const [prevPage, setPrevPage] = useState<TabId>("home");
  const [discoverLink, setDiscoverLink] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);
  // Bumped to force a tab to remount back to its root when the active tab is tapped again.
  const [resetCounters, setResetCounters] = useState<Record<TabId, number>>({
    home: 0, bible: 0, plans: 0, discover: 0, you: 0,
  });

  // Per-tab scroll positions (window scroll within the tab's panel).
  const scrollPositions = useRef<Record<TabId, number>>({
    home: 0, bible: 0, plans: 0, discover: 0, you: 0,
  });
  const panelRefs = useRef<Record<TabId, HTMLDivElement | null>>({
    home: null, bible: null, plans: null, discover: null, you: null,
  });

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

  // Tab navigation: save current scroll, switch, restore target scroll.
  const handleTabNavigate = useCallback((next: string) => {
    const target = next as TabId;
    setPage((current) => {
      // Save current tab scroll
      const node = panelRefs.current[current];
      if (node) scrollPositions.current[current] = node.scrollTop;

      if (target === current) {
        // Tap active tab → reset stack to root + scroll to top
        scrollPositions.current[target] = 0;
        setResetCounters((rc) => ({ ...rc, [target]: rc[target] + 1 }));
        requestAnimationFrame(() => {
          const n = panelRefs.current[target];
          if (n) n.scrollTo({ top: 0, behavior: "smooth" });
        });
        return current;
      }

      setPrevPage(current);
      // Restore target tab scroll on next frame after mount
      requestAnimationFrame(() => {
        const n = panelRefs.current[target];
        if (n) n.scrollTop = scrollPositions.current[target] ?? 0;
      });
      return target;
    });
  }, []);

  // Cross-tab navigation requested by children (e.g., HomeFeed → discover)
  const handleCrossNavigate = useCallback((p: string, link?: string) => {
    if (link) setDiscoverLink(link);
    handleTabNavigate(p);
  }, [handleTabNavigate]);

  if (loading || !user || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!profile?.category || profile.category === null) {
    return <WelcomeScreen onComplete={handleOnboardComplete} />;
  }

  const displayName = profile.display_name ?? "Whisperer";

  // Determine slide direction based on tab order.
  const direction = TAB_ORDER.indexOf(page) >= TAB_ORDER.indexOf(prevPage) ? 1 : -1;

  const panelClass =
    "absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain";

  const renderPanel = (id: TabId) => {
    const key = `${id}-${resetCounters[id]}`;
    switch (id) {
      case "home":
        return (
          <HomeFeed
            key={key}
            category={profile.category}
            streak={streak}
            onNavigate={handleCrossNavigate}
            displayName={displayName}
          />
        );
      case "bible":
        return <BibleSanctuary key={key} onBack={() => handleTabNavigate("home")} />;
      case "plans":
        return <PlansTab key={key} />;
      case "discover":
        return (
          <DiscoverTab
            key={key}
            initialLink={discoverLink}
            onConsumedInitialLink={() => setDiscoverLink(null)}
          />
        );
      case "you":
        return (
          <ProfileAltar
            key={key}
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
        );
    }
  };

  return (
    <div className="max-w-md mx-auto relative h-[100dvh] overflow-hidden">
      <div className="relative h-full w-full">
        <AnimatePresence mode="sync" custom={direction} initial={false}>
          <motion.div
            key={page}
            ref={(el) => { panelRefs.current[page] = el; }}
            custom={direction}
            initial={{ x: direction > 0 ? "100%" : "-100%", opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? "-30%" : "30%", opacity: 0 }}
            transition={{ type: "tween", ease: [0.32, 0.72, 0, 1], duration: 0.32 }}
            className={panelClass}
          >
            {renderPanel(page)}
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav active={page} onNavigate={handleTabNavigate} />
    </div>
  );
};

export default Index;
