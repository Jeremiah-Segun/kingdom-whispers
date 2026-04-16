import { Home, BookOpen, ListChecks, Compass, User } from "lucide-react";

interface BottomNavProps {
  active: string;
  onNavigate: (page: string) => void;
}

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "bible", label: "Bible", icon: BookOpen },
  { id: "plans", label: "Plans", icon: ListChecks },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "you", label: "You", icon: User },
];

const BottomNav = ({ active, onNavigate }: BottomNavProps) => (
  <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border">
    <div className="flex items-center justify-around max-w-md mx-auto pb-[env(safe-area-inset-bottom)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center gap-0.5 py-2.5 px-3 transition-colors relative ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
            )}
            <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.5} />
            <span className="text-[10px] font-body font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  </nav>
);

export default BottomNav;
