"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, RotateCcw, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface ReviewScreenProps {
  letter: string;
  categories: string[];
  answers: Record<string, string>;
  onRestart: () => void;
}

export function ReviewScreen({ letter, categories, answers, onRestart }: ReviewScreenProps) {
  const [scores, setScores] = useState<Record<string, boolean>>({});
  const [isDone, setIsDone] = useState(false);

  // Auto-score based on first letter as a baseline, but allow overrides
  useEffect(() => {
    const initialScores: Record<string, boolean> = {};
    categories.forEach((_, index) => {
      const answer = answers[index]?.trim().toLowerCase() || "";
      initialScores[index] = answer.startsWith(letter.toLowerCase()) && answer.length > 1;
    });
    setScores(initialScores);
  }, [answers, letter, categories]);

  const toggleScore = (index: number) => {
    setScores(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const finalScore = Object.values(scores).filter(Boolean).length;
  const maxScore = categories.length;

  const handleFinish = () => {
    setIsDone(true);
    const percentage = finalScore / maxScore;
    if (percentage > 0.5) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#ffffff']
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl mx-auto py-12 px-4 flex flex-col min-h-[90vh]"
    >
      <div className="text-center mb-10 space-y-4">
        <h2 className="text-4xl font-black text-white tracking-tight">Review Time</h2>
        <div className="inline-flex items-center gap-3 glass-panel px-5 py-2 rounded-full">
          <span className="text-zinc-400">Target Letter</span>
          <span className="text-xl font-bold text-blue-400">{letter}</span>
        </div>
      </div>

      <div className="grid gap-4 mb-24">
        {categories.map((category, index) => {
          const answer = answers[index] || "";
          const isCorrect = scores[index];

          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "glass-panel rounded-2xl p-5 flex items-center justify-between gap-4 transition-all",
                isCorrect ? "border-green-500/30 bg-green-500/[0.03]" : "border-red-500/30 bg-red-500/[0.03]",
                isDone && "pointer-events-none opacity-90"
              )}
            >
              <div className="flex-1 min-w-0 pr-4 border-r border-white/5">
                <p className="text-xs text-zinc-500 mb-1 font-medium tracking-wide uppercase">{category}</p>
                <p className={cn(
                  "text-xl font-bold truncate",
                  answer ? "text-white" : "text-zinc-600 italic font-normal"
                )}>
                  {answer || "No answer provided"}
                </p>
              </div>

              {!isDone && (
                <button
                  onClick={() => toggleScore(index)}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all transform active:scale-90",
                    isCorrect 
                      ? "bg-green-500/20 text-green-500 hover:bg-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]" 
                      : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                  )}
                >
                  {isCorrect ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                </button>
              )}
              
              {isDone && (
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  isCorrect ? "text-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.2)]" : "text-red-500 bg-red-500/10"
                )}>
                  {isCorrect ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {!isDone ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t w-full from-black via-black/80 to-transparent flex justify-center z-50"
          >
            <button
              onClick={handleFinish}
              className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-[1.5rem] font-bold text-lg shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 transition-all"
            >
              <Trophy className="w-5 h-5 group-hover:text-yellow-500 transition-colors" />
              Finish Scoring
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="fixed bottom-0 left-0 right-0 p-8 glass-panel border-t border-white/10 flex flex-col items-center gap-6 z-50 backdrop-blur-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="text-center">
              <p className="text-zinc-400 font-medium mb-2 tracking-widest uppercase text-sm">Final Score</p>
              <div className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500">
                {finalScore} <span className="text-3xl text-zinc-600 font-medium tracking-normal">/ {maxScore}</span>
              </div>
            </div>
            <button
              onClick={onRestart}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
