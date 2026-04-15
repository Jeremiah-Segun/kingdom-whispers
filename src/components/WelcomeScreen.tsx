import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Heart, Shield, Compass, Sparkles } from "lucide-react";
import welcomeImg from "@/assets/welcome-landscape.jpg";
import type { Category } from "@/lib/verses";

const needs: { label: string; value: Category; icon: React.ReactNode; color: string }[] = [
  { label: "Peace", value: "peace", icon: <Heart className="w-6 h-6" />, color: "text-ether" },
  { label: "Strength", value: "strength", icon: <Shield className="w-6 h-6" />, color: "text-gold" },
  { label: "Purpose", value: "purpose", icon: <Compass className="w-6 h-6" />, color: "text-gold-glow" },
  { label: "Healing", value: "healing", icon: <Sparkles className="w-6 h-6" />, color: "text-ether" },
];

interface WelcomeScreenProps {
  onComplete: (category: Category) => void;
}

const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  const [step, setStep] = useState<"welcome" | "choose">("welcome");

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <img
        src={welcomeImg}
        alt="Serene landscape at dawn"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-end min-h-screen pb-16 px-6">
        <AnimatePresence mode="wait">
          {step === "welcome" ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center max-w-lg"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-primary-foreground/70 font-body text-sm tracking-[0.3em] uppercase mb-4"
              >
                Whisper of the Day
              </motion.p>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-primary-foreground leading-tight mb-4 italic font-light">
                "Be still, and know that I am God."
              </h1>
              <p className="text-primary-foreground/60 font-body text-sm mb-10">— Psalm 46:10</p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep("choose")}
                className="px-10 py-4 rounded-full bg-primary/90 text-primary-foreground font-body font-medium tracking-wide backdrop-blur-sm shadow-golden transition-all hover:bg-primary"
              >
                Begin Your Journey
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-md w-full"
            >
              <h2 className="font-heading text-3xl md:text-4xl text-primary-foreground mb-2 font-light">
                What do you need to hear today?
              </h2>
              <p className="text-primary-foreground/50 text-sm mb-8 font-body">Choose what speaks to your heart</p>
              <div className="grid grid-cols-2 gap-3">
                {needs.map((need, i) => (
                  <motion.button
                    key={need.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onComplete(need.value)}
                    className="glass-card rounded-2xl p-6 flex flex-col items-center gap-3 text-primary-foreground hover:shadow-golden transition-shadow"
                  >
                    <span className={need.color}>{need.icon}</span>
                    <span className="font-body font-medium text-sm">{need.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WelcomeScreen;
