import { Home, BookOpen, Users, User } from "lucide-react";

interface BottomNavProps {
  active: string;
  onNavigate: (page: string) => void;
}

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "bible", label: "Word", icon: BookOpen },
  { id: "community", label: "Family", icon: Users },
  { id: "profile", label: "Altar", icon: User },
];

const BottomNav = ({ active, onNavigate }: BottomNavProps) => (
  <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-t border-border px-2 pb-[env(safe-area-inset-bottom)]">
    <div className="flex items-center justify-around max-w-md mx-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center gap-1 py-3 px-4 transition-colors ${
              isActive ? "text-gold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
            <span className="text-[10px] font-body font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  </nav>
);

export default BottomNav;
