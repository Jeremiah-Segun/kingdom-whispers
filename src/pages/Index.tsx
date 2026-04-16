import { useState, useEffect } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import HomeFeed from "@/components/HomeFeed";
import BibleSanctuary from "@/components/BibleSanctuary";
import PlansTab from "@/components/PlansTab";
import DiscoverTab from "@/components/DiscoverTab";
import ProfileAltar from "@/components/ProfileAltar";
import BottomNav from "@/components/BottomNav";
import type { Category } from "@/lib/verses";

const Index = () => {
  const [onboarded, setOnboarded] = useState(false);
  const [category, setCategory] = useState<Category>("peace");
  const [page, setPage] = useState("home");
  const [isDark, setIsDark] = useState(true);
  const streak = 7;

  useEffect(() => {
    document.documentElement.classList.toggle("light-mode", !isDark);
  }, [isDark]);

  const handleComplete = (cat: Category) => {
    setCategory(cat);
    setOnboarded(true);
  };

  if (!onboarded) {
    return <WelcomeScreen onComplete={handleComplete} />;
  }

  return (
    <div className="max-w-md mx-auto relative">
      {page === "home" && <HomeFeed category={category} streak={streak} onNavigate={setPage} />}
      {page === "bible" && <BibleSanctuary onBack={() => setPage("home")} />}
      {page === "plans" && <PlansTab />}
      {page === "discover" && <DiscoverTab />}
      {page === "you" && <ProfileAltar streak={streak} onToggleTheme={() => setIsDark(!isDark)} isDark={isDark} />}
      <BottomNav active={page} onNavigate={setPage} />
    </div>
  );
};

export default Index;
