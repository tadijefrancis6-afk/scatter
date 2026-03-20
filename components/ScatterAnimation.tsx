"use client";

import { motion } from "framer-motion";
import { Disc3 } from "lucide-react";

interface ScatterAnimationProps {
  positions: { col: number; row: number }[];
  onComplete?: () => void;
}

export function ScatterAnimation({ positions, onComplete }: ScatterAnimationProps) {
  if (positions.length === 0) return null;

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {positions.map((pos, i) => {
        // Approximate cell positions within the grid
        const xPercent = (pos.col / 5) * 100 + 10;
        const yPercent = (pos.row / 3) * 100 + 16;

        return (
          <motion.div
            key={`scatter-${pos.col}-${pos.row}-${i}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.8, 1.2],
              opacity: [0, 1, 0.8],
            }}
            transition={{
              duration: 0.6,
              delay: i * 0.15,
              ease: "easeOut",
            }}
            onAnimationComplete={i === positions.length - 1 ? onComplete : undefined}
            className="absolute"
            style={{
              left: `${xPercent}%`,
              top: `${yPercent}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Glow ring */}
            <motion.div
              animate={{
                scale: [1, 2.5],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15,
              }}
              className="absolute inset-0 w-20 h-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#00ffcc] bg-[#00ffcc]/10"
            />

            {/* Scatter icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Disc3 className="w-10 h-10 text-[#00ffcc] drop-shadow-[0_0_25px_rgba(0,255,204,0.9)]" />
            </motion.div>

            {/* Particle sparks */}
            {[0, 1, 2, 3, 4, 5].map((sparkIdx) => (
              <motion.div
                key={sparkIdx}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((sparkIdx / 6) * Math.PI * 2) * 40,
                  y: Math.sin((sparkIdx / 6) * Math.PI * 2) * 40,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.15 + 0.3,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
                className="absolute w-2 h-2 rounded-full bg-[#00ffcc] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            ))}
          </motion.div>
        );
      })}
    </div>
  );
}
