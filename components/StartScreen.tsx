"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StartScreenProps {
  onStart: (timeLimit: number, categoryCount: number) => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [timeLimit, setTimeLimit] = useState(120); // seconds
  const [categoryCount, setCategoryCount] = useState(12);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-md mx-auto space-y-10"
    >
      <div className="text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.8, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="inline-block p-4 rounded-3xl glass-panel mb-2 relative group"
        >
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full group-hover:bg-blue-500/30 transition-colors" />
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center transform rotate-12 shadow-[0_0_40px_rgba(59,130,246,0.4)] border border-blue-400/30 inset-0 z-10 relative">
            <span className="text-5xl font-black text-white drop-shadow-md -rotate-12">S</span>
          </div>
        </motion.div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tight text-white drop-shadow-sm">
            Scatter
          </h1>
          <p className="text-zinc-400 text-xl font-medium tracking-wide">
            Think fast. Type faster.
          </p>
        </div>
      </div>

      <div className="w-full glass-panel rounded-[2rem] p-6 flex flex-col gap-4 shadow-[#00000040]_0px_10px_40px">
        <button
          onClick={() => onStart(timeLimit, categoryCount)}
          className="group relative w-full flex items-center justify-center gap-3 bg-white text-black font-bold text-xl py-5 px-8 rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
          <Play className="w-6 h-6 fill-black relative z-10" />
          <span className="relative z-10">Play Now</span>
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
        >
          <Settings2 className="w-4 h-4" />
          Game Settings
        </button>

        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-6 pt-4 border-t border-white/5 overflow-hidden"
            >
              <div className="space-y-4">
                <label className="text-sm font-medium text-zinc-300 flex justify-between">
                  <span>Time Limit</span>
                  <span className="text-white font-bold">{timeLimit}s</span>
                </label>
                <div className="relative">
                  <input 
                    type="range" 
                    min="30" 
                    max="300" 
                    step="30"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="w-full accent-blue-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <div className="flex justify-between text-xs text-zinc-600 mt-2 font-medium">
                    <span>30s</span>
                    <span>5m</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-medium text-zinc-300 flex justify-between">
                  <span>Categories</span>
                  <span className="text-white font-bold">{categoryCount}</span>
                </label>
                <div className="relative">
                  <input 
                    type="range" 
                    min="6" 
                    max="18" 
                    step="3"
                    value={categoryCount}
                    onChange={(e) => setCategoryCount(Number(e.target.value))}
                    className="w-full accent-blue-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <div className="flex justify-between text-xs text-zinc-600 mt-2 font-medium">
                    <span>6</span>
                    <span>18</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
