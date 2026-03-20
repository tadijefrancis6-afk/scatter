"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Disc3, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface FreeSpinsModalProps {
  freeSpins: number;
  isRetrigger: boolean;
  onDismiss: () => void;
}

export function FreeSpinsModal({ freeSpins, isRetrigger, onDismiss }: FreeSpinsModalProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Fire confetti
    const duration = 2000;
    const end = Date.now() + duration;
    const colors = isRetrigger
      ? ["#ff00a0", "#ff66cc", "#ffb3e6", "#ffffff"]
      : ["#00ffcc", "#00cc99", "#33ff99", "#ffffff", "#fbbf24"];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    // Count-up animation
    const step = Math.max(1, Math.floor(freeSpins / 15));
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev + step >= freeSpins) {
          clearInterval(interval);
          return freeSpins;
        }
        return prev + step;
      });
    }, 80);

    // Auto-dismiss
    const timer = setTimeout(onDismiss, 3500);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [freeSpins, isRetrigger, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onDismiss}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Content */}
      <motion.div
        initial={{ scale: 0.3, rotateZ: -15 }}
        animate={{ scale: 1, rotateZ: 0 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative flex flex-col items-center gap-6 px-12 py-10"
      >
        {/* Glow background */}
        <div
          className={`absolute inset-0 rounded-3xl blur-[60px] opacity-50 ${
            isRetrigger ? "bg-[#ff00a0]" : "bg-[#00ffcc]"
          }`}
        />

        {/* Scatter icon ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <div
            className={`w-28 h-28 md:w-36 md:h-36 rounded-full border-4 flex items-center justify-center ${
              isRetrigger
                ? "border-[#ff00a0] shadow-[0_0_60px_rgba(255,0,160,0.8)]"
                : "border-[#00ffcc] shadow-[0_0_60px_rgba(0,255,204,0.8)]"
            }`}
          >
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Disc3
                className={`w-16 h-16 md:w-20 md:h-20 ${
                  isRetrigger
                    ? "text-[#ff00a0] drop-shadow-[0_0_30px_rgba(255,0,160,0.9)]"
                    : "text-[#00ffcc] drop-shadow-[0_0_30px_rgba(0,255,204,0.9)]"
                }`}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative text-center"
        >
          {isRetrigger ? (
            <span className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-pink-200 via-[#ff00a0] to-purple-800 drop-shadow-[0_0_30px_rgba(255,0,160,0.8)] tracking-tighter uppercase">
              Retrigger!
            </span>
          ) : (
            <span className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-200 via-[#00ffcc] to-teal-800 drop-shadow-[0_0_30px_rgba(0,255,204,0.8)] tracking-tighter uppercase">
              Free Spins!
            </span>
          )}
        </motion.h1>

        {/* Free spin count */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
          className="relative flex items-center gap-3"
        >
          <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          <span className="text-6xl md:text-8xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
            {count}
          </span>
          <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative text-lg md:text-xl font-bold text-white/70 tracking-wider uppercase"
        >
          {isRetrigger ? "Extra Spins Added!" : "Tap to start"}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
