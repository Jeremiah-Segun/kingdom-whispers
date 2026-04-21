import { useState, useRef, useCallback, ReactNode } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
}

const THRESHOLD = 80;

const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, THRESHOLD], [0, 1]);
  const scale = useTransform(y, [0, THRESHOLD], [0.5, 1]);
  const startY = useRef(0);
  const pulling = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const el = containerRef.current;
    if (!el || refreshing) return;
    // Only activate when scrolled to top
    if (el.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current || refreshing) return;
    const diff = Math.max(0, e.touches[0].clientY - startY.current);
    // Dampen the pull
    y.set(Math.min(diff * 0.5, THRESHOLD + 20));
  }, [refreshing, y]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (y.get() >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      animate(y, THRESHOLD * 0.6, { duration: 0.2 });
      try { await onRefresh(); } finally {
        setRefreshing(false);
        animate(y, 0, { duration: 0.25 });
      }
    } else {
      animate(y, 0, { duration: 0.25 });
    }
  }, [y, refreshing, onRefresh]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Indicator */}
      <motion.div
        style={{ opacity, scale, y: useTransform(y, (v) => v - 40) }}
        className="absolute top-0 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border shadow-lg"
      >
        <Loader2 className={`w-5 h-5 text-primary ${refreshing ? "animate-spin" : ""}`} />
      </motion.div>

      {/* Push content down while pulling */}
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;
