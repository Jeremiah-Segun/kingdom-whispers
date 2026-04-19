import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

interface MobileHeaderProps {
  /** When provided, header shows a Back button that calls this. When omitted, shows brand title. */
  onBack?: () => void;
  /** Title shown next to the Back button on child routes. */
  title?: string;
  /** Optional right-side slot for actions (icons, buttons). */
  right?: React.ReactNode;
  /** Brand label shown on root routes. Defaults to "Whisper". */
  brand?: string;
}

const MobileHeader = ({ onBack, title, right, brand = "Whisper" }: MobileHeaderProps) => {
  const isChild = typeof onBack === "function";

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/60">
      <div className="max-w-md mx-auto flex items-center justify-between px-4 h-12 pt-[env(safe-area-inset-top)]">
        {isChild ? (
          <motion.button
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onBack}
            aria-label="Back"
            className="flex items-center gap-1 -ml-1 px-2 py-1.5 rounded-full text-foreground active:bg-secondary"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-body font-medium truncate max-w-[180px]">
              {title ?? "Back"}
            </span>
          </motion.button>
        ) : (
          <span className="font-heading text-base font-semibold tracking-tight text-foreground">
            {brand}
          </span>
        )}
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </header>
  );
};

export default MobileHeader;
