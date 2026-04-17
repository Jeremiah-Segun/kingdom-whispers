import { motion, AnimatePresence } from "framer-motion";
import { Award, Flame, Crown, Eye } from "lucide-react";

export interface BadgeInfo {
  key: string;
  label: string;
  description: string;
}

const ICONS: Record<string, JSX.Element> = {
  streak_7: <Flame className="w-12 h-12" />,
  streak_30: <Award className="w-12 h-12" />,
  streak_100: <Crown className="w-12 h-12" />,
  deep_seeker: <Eye className="w-12 h-12" />,
};

interface Props {
  badge: BadgeInfo | null;
  onClose: () => void;
}

const BadgeUnlockModal = ({ badge, onClose }: Props) => (
  <AnimatePresence>
    {badge && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-background/85 backdrop-blur-md flex items-center justify-center px-6"
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 18, stiffness: 220 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xs rounded-3xl bg-gradient-to-br from-primary/20 via-card to-card border border-primary/30 p-8 text-center shadow-golden"
        >
          {/* Glow ring */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.4, 1.2], opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl -z-10"
          />
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-primary mb-3">Badge Unlocked</p>
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.1 }}
            className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-gold-glow flex items-center justify-center text-primary-foreground mb-4 shadow-golden"
          >
            {ICONS[badge.key] ?? <Award className="w-12 h-12" />}
          </motion.div>
          <h3 className="font-heading text-xl font-bold text-foreground mb-1.5">{badge.label}</h3>
          <p className="text-xs font-body text-muted-foreground mb-5 leading-relaxed">{badge.description}</p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-body font-semibold"
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default BadgeUnlockModal;
