"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Timer, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActiveGameProps {
  letter: string;
  categories: string[];
  timeLimit: number;
  onFinish: (answers: Record<string, string>) => void;
}

export function ActiveGame({ letter, categories, timeLimit, onFinish }: ActiveGameProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish(answers);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onFinish, answers]);

  const handleFinishEarly = () => {
    onFinish(answers);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const isWarning = timeLeft <= 10;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto py-8 px-4 flex flex-col min-h-[90vh]"
    >
      <div className="sticky top-4 z-50 flex items-center justify-between glass-panel rounded-2xl p-4 mb-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0">
            <span className="text-3xl font-black text-white">{letter}</span>
          </div>
          <div>
            <p className="text-sm text-blue-400 font-medium tracking-wide uppercase">Your Letter</p>
            <p className="text-2xl font-bold text-white leading-none">{letter}</p>
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-3 px-5 py-3 rounded-xl transition-colors",
          isWarning ? "bg-red-500/20 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]" : "bg-zinc-900/50 text-white border border-white/5"
        )}>
          <Timer className={cn("w-6 h-6", isWarning && "animate-pulse")} />
          <span className="text-3xl font-mono font-bold tracking-tight tabular-nums mt-0.5">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-4 mb-10 overflow-y-auto pb-24 custom-scrollbar">
        {categories.map((category, index) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            key={index} 
            className="glass-panel p-5 rounded-2xl flex flex-col gap-3 group focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:bg-white/[0.05] transition-all"
          >
            <label htmlFor={`cat-${index}`} className="text-sm font-medium text-zinc-300 flex items-center gap-2 px-1">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-zinc-400 font-mono">
                {index + 1}
              </span>
              {category}
            </label>
            <input
              id={`cat-${index}`}
              type="text"
              value={answers[index] || ""}
              onChange={(e) => setAnswers(prev => ({ ...prev, [index]: e.target.value }))}
              placeholder={`Starts with ${letter}...`}
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all font-medium text-lg shadow-inner"
              autoComplete="off"
              autoCorrect="off"
            />
          </motion.div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 w-full to-transparent flex justify-center z-50 pointer-events-none">
        <button
          onClick={handleFinishEarly}
          className="pointer-events-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[1.5rem] font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(59,130,246,0.3)]"
        >
          <CheckCircle className="w-5 h-5" />
          Finish Early
        </button>
      </div>
    </motion.div>
  );
}
