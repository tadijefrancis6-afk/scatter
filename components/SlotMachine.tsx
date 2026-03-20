"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SymbolID, generateGrid, calculateWin, WinResult, FREE_SPIN_TIERS } from "@/lib/slotEngine";
import { SYMBOL_RENDER } from "@/lib/symbolRender";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { Plus, Minus, Settings, Zap } from "lucide-react";
import { FreeSpinsModal } from "./FreeSpinsModal";
import { ScatterAnimation } from "./ScatterAnimation";

export function SlotMachine() {
  const [balance, setBalance] = useState(79280239);
  const [bet, setBet] = useState(1000000);
  const [grid, setGrid] = useState<SymbolID[][]>(Array(5).fill(Array(3).fill("BELL")));
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [winResults, setWinResults] = useState<WinResult[]>([]);
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState(0);
  const [freeSpinsTotal, setFreeSpinsTotal] = useState(0);
  const [freeSpinMultiplier, setFreeSpinMultiplier] = useState(1);
  const [lockedReels, setLockedReels] = useState<number[]>([]);
  const [isRespinning, setIsRespinning] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Scatter/Free spins modal state
  const [showFreeSpinsModal, setShowFreeSpinsModal] = useState(false);
  const [pendingFreeSpins, setPendingFreeSpins] = useState(0);
  const [isRetrigger, setIsRetrigger] = useState(false);
  const [scatterPositions, setScatterPositions] = useState<{ col: number; row: number }[]>([]);
  const [isInFreeSpinsMode, setIsInFreeSpinsMode] = useState(false);

  // Auto-spin ref
  const autoSpinTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFreeSpinAutoSpinning = useRef(false);

  useEffect(() => {
    setGrid(generateGrid());
    setMounted(true);
  }, []);

  // Cleanup auto-spin timer
  useEffect(() => {
    return () => {
      if (autoSpinTimerRef.current) clearTimeout(autoSpinTimerRef.current);
    };
  }, []);

  // Track free spins mode
  useEffect(() => {
    if (freeSpinsRemaining > 0) {
      setIsInFreeSpinsMode(true);
    } else if (isInFreeSpinsMode && freeSpinsRemaining === 0 && !spinning && !showFreeSpinsModal) {
      // Free spins just ended
      setIsInFreeSpinsMode(false);
      setFreeSpinMultiplier(1);
      setFreeSpinsTotal(0);
      isFreeSpinAutoSpinning.current = false;
    }
  }, [freeSpinsRemaining, spinning, showFreeSpinsModal, isInFreeSpinsMode]);

  const handleBetChange = (amount: number) => {
    if (spinning) return;
    setBet(prev => Math.max(100000, prev + amount));
  };

  const dismissModal = useCallback(() => {
    setShowFreeSpinsModal(false);
    // Start auto-spinning after modal dismiss
    isFreeSpinAutoSpinning.current = true;
    autoSpinTimerRef.current = setTimeout(() => {
      startAutoSpin();
    }, 600);
  }, []);

  const startAutoSpin = () => {
    if (isFreeSpinAutoSpinning.current) {
      doSpin(true);
    }
  };

  const triggerSpin = (isRespin = false, currentLockedReels: number[] = [], currentGrid: SymbolID[][] | undefined = undefined, isAutoFree = false) => {
    setSpinning(true);
    if (!isRespin) {
      setLastWin(0);
      setWinResults([]);
      setScatterPositions([]);
    }

    setTimeout(() => {
      const newGrid = generateGrid(currentGrid, currentLockedReels);
      setGrid(newGrid);

      const multiplier = isInFreeSpinsMode || isAutoFree ? freeSpinMultiplier : 1;
      const winData = calculateWin(newGrid, bet, multiplier);

      // Handle scatter wins
      if (winData.totalFreeSpinsWon > 0) {
        const scatterWin = winData.wins.find(w => w.symbol === "SCATTER");
        if (scatterWin) {
          setScatterPositions(scatterWin.positions);
        }

        const wasAlreadyInFreeSpins = isInFreeSpinsMode || isAutoFree;
        setIsRetrigger(wasAlreadyInFreeSpins);
        setPendingFreeSpins(winData.totalFreeSpinsWon);

        if (wasAlreadyInFreeSpins) {
          // Retrigger: increase multiplier
          setFreeSpinMultiplier(prev => prev + 1);
        } else {
          setFreeSpinMultiplier(2);
          setFreeSpinsTotal(winData.totalFreeSpinsWon);
        }

        setFreeSpinsRemaining(prev => prev + winData.totalFreeSpinsWon);

        // Stop auto-spin while modal shows
        isFreeSpinAutoSpinning.current = false;
        if (autoSpinTimerRef.current) clearTimeout(autoSpinTimerRef.current);

        // Show scatter animation briefly, then modal
        setTimeout(() => {
          setShowFreeSpinsModal(true);
        }, 800);
      }

      // Party Ape Mechanic: Respin Until Win
      const fullWildReels = [...currentLockedReels];
      for (let c = 0; c < 5; c++) {
        if (!fullWildReels.includes(c) && newGrid[c].every(s => s === "WILD")) {
          fullWildReels.push(c);
        }
      }

      if (fullWildReels.length > 0 && winData.totalWin === 0 && fullWildReels.length < 5) {
        setLockedReels(fullWildReels);
        setIsRespinning(true);
        triggerSpin(true, fullWildReels, newGrid, isAutoFree);
        return;
      } else {
        setLockedReels([]);
        setIsRespinning(false);
      }

      if (winData.totalWin > 0 || winData.totalFreeSpinsWon > 0) {
        setLastWin(prev => (isRespin ? prev + winData.totalWin : winData.totalWin));
        setWinResults(winData.wins);
        setBalance(prev => prev + winData.totalWin);

        if (winData.totalWin > bet * 10 || winData.totalFreeSpinsWon > 0) {
          confetti({
            particleCount: 200,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#f59e0b', '#ecfccb']
          });
        }
      }

      setSpinning(false);

      // Continue auto-spin for free spins (if no modal is showing)
      if ((isInFreeSpinsMode || isAutoFree) && !winData.totalFreeSpinsWon && isFreeSpinAutoSpinning.current) {
        autoSpinTimerRef.current = setTimeout(() => {
          startAutoSpin();
        }, 2000);
      }
    }, 1500);
  };

  const doSpin = (isAutoFree = false) => {
    const isFreeSpin = freeSpinsRemaining > 0;
    if (spinning || (!isFreeSpin && balance < bet)) return;

    if (isFreeSpin) {
      setFreeSpinsRemaining(prev => prev - 1);
    } else {
      setBalance(prev => prev - bet);
    }

    triggerSpin(false, [], undefined, isAutoFree || isFreeSpin);
  };

  const spin = () => {
    // Stop any running auto-spin
    isFreeSpinAutoSpinning.current = false;
    if (autoSpinTimerRef.current) clearTimeout(autoSpinTimerRef.current);
    doSpin(freeSpinsRemaining > 0);
  };

  const isWinningPosition = (col: number, row: number) => {
    return winResults.some(win => win.positions.some(p => p.col === col && p.row === row));
  };

  const isScatterPosition = (col: number, row: number) => {
    return scatterPositions.some(p => p.col === col && p.row === row);
  };

  return (
    <div className={cn(
      "w-full h-screen flex flex-col justify-between overflow-hidden text-white font-sans relative transition-colors duration-1000",
      isInFreeSpinsMode ? "bg-[#0b1e2e]" : "bg-[#1a0b2e]"
    )}>
      {/* Neon Party Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40 pointer-events-none mix-blend-screen"
        style={{ 
          backgroundImage: isInFreeSpinsMode
            ? `radial-gradient(circle at 50% 0%, rgba(0,255,204,0.5) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(0,204,153,0.3) 0%, transparent 50%)`
            : `radial-gradient(circle at 50% 0%, rgba(255,0,160,0.4) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(0,255,204,0.3) 0%, transparent 50%)`
        }} 
      ></div>
      <div className={cn(
        "absolute inset-0 pointer-events-none z-0 transition-all duration-1000",
        isInFreeSpinsMode
          ? "bg-gradient-to-b from-[#0a2e4e]/80 via-[#0b1e2e]/90 to-[#050f18]/95"
          : "bg-gradient-to-b from-[#2d0a4e]/80 via-[#1a0b2e]/90 to-[#0f0518]/95"
      )}></div>

      {/* Top Bar / Header */}
      <div className="relative z-10 w-full pt-6 pb-2 flex items-center justify-between px-6 md:px-12">
        <div className="flex flex-col">
           <span className="text-4xl md:text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-pink-300 via-[#ff00a0] to-purple-800 drop-shadow-[0_0_15px_rgba(255,0,160,0.8)] tracking-tighter" style={{ WebkitTextStroke: '1px #ffb3e6' }}>
             AERON
           </span>
           <span className="text-4xl md:text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-400 to-orange-600 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] tracking-tighter -mt-3 ml-4" style={{ WebkitTextStroke: '1px #fef3c7' }}>
             APE
           </span>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-4 bg-[#1e0b3b]/90 border border-purple-500/50 rounded-lg px-6 py-1 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
             <div className="flex flex-col items-center">
               <span className="text-[10px] text-pink-300 font-bold tracking-widest uppercase mb-0">WAYS</span>
               <span className="text-xl font-black text-white">3600</span>
             </div>
          </div>

          {/* Free spins counter */}
          {isInFreeSpinsMode && (
             <motion.div
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="flex items-center gap-3 bg-[#00ffcc]/10 border-2 border-[#00ffcc] rounded-lg px-4 py-1.5 shadow-[0_0_25px_rgba(0,255,204,0.5)]"
             >
               <div className="flex flex-col items-center">
                 <span className="text-[10px] text-[#00ffcc] font-bold tracking-widest uppercase">FREE SPINS</span>
                 <span className="text-lg font-black text-white">
                   {freeSpinsRemaining}<span className="text-[#00ffcc]/60">/{freeSpinsTotal}</span>
                 </span>
               </div>
               {freeSpinMultiplier > 1 && (
                 <div className="flex flex-col items-center border-l border-[#00ffcc]/30 pl-3">
                   <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">MULTI</span>
                   <span className="text-lg font-black text-amber-400 multiplier-bounce">
                     x{freeSpinMultiplier}
                   </span>
                 </div>
               )}
             </motion.div>
          )}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 py-2">
        {/* Game Frame */}
        <div className={cn(
          "relative p-[4px] rounded-xl bg-gradient-to-b shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-all duration-1000",
          isInFreeSpinsMode
            ? "from-[#00ffcc]/60 via-[#00cc99]/40 to-[#00ffcc]/60 free-spins-active"
            : "from-[#ff00a0]/60 via-[#7000ff]/40 to-[#00ffcc]/60"
        )}>
           {/* Inner Frame */}
          <div className="bg-[#130727] p-2 rounded-xl border border-[#2d0a4e] shadow-inner relative">
            
            <div className="grid grid-cols-5 gap-2 md:gap-3 perspective-[1000px]">
              {grid.map((reel, colIndex) => {
                const isLocked = lockedReels.includes(colIndex);
                const isReelSpinning = spinning && !isLocked;
                
                return (
                <div key={colIndex} className={cn("flex flex-col gap-2 relative bg-[#0f0518]/90 rounded-md border-x overflow-hidden transition-all duration-500", isLocked ? "border-[#ff00a0] shadow-[0_0_30px_rgba(255,0,160,0.7)] z-30" : "border-purple-500/20")}>
                  {isLocked && <div className="absolute inset-0 bg-[#ff00a0]/10 z-0 pointer-events-none animate-pulse" />}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 shadow-inner z-20 pointer-events-none" />
                  
                  <motion.div 
                    initial={false}
                    animate={isReelSpinning ? { y: [0, -1000, 0] } : { y: 0 }}
                    transition={isReelSpinning ? { 
                      duration: 0.8, 
                      ease: "linear", 
                      repeat: Infinity,
                      repeatType: "loop"
                    } : {
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }}
                    className="flex flex-col gap-2 py-4"
                  >
                    {reel.map((symbolId, rowIndex) => {
                      const symConf = SYMBOL_RENDER[symbolId];
                      const Icon = symConf.icon;
                      const isWin = !spinning && isWinningPosition(colIndex, rowIndex);
                      const isScatter = !spinning && isScatterPosition(colIndex, rowIndex);

                      return (
                        <div 
                          key={`${colIndex}-${rowIndex}-${spinning}`}
                          className={cn(
                            "w-20 h-24 md:w-32 md:h-36 relative rounded-sm flex flex-col items-center justify-center transition-all bg-gradient-to-br overflow-hidden",
                            symConf.bgColors,
                            spinning && "blur-[2px]",
                            isScatter && "scatter-landed",
                            isWin ? `ring-4 ring-amber-400 z-30 ${symConf.shadowColor} shadow-2xl scale-105` : "border border-white/10 opacity-90"
                          )}
                        >
                           <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />
                           {symConf.label && (
                             <div className={cn(
                               "absolute bottom-2 right-2 px-2 py-0.5 rounded shadow-lg z-20 skew-x-[-10deg]",
                               symbolId === "SCATTER" && isInFreeSpinsMode
                                 ? "bg-[#00332a] border border-[#00ffcc]/50"
                                 : "bg-purple-950 border border-purple-500/50"
                             )}>
                               <span className={cn(
                                 "text-[10px] md:text-xs font-black tracking-wider",
                                 symbolId === "SCATTER" ? "text-[#00ffcc]" : "text-amber-200"
                               )}>
                                 {symConf.label}
                               </span>
                             </div>
                           )}
                           {typeof Icon === "string" ? (
                             <img src={Icon} alt="Symbol" className={cn("w-full h-full object-cover relative z-0", isWin && "animate-pulse")} />
                           ) : (
                             <Icon className={cn("w-12 h-12 md:w-16 md:h-16 relative z-10", symConf.iconColor, isWin && "animate-bounce")} />
                           )}
                        </div>
                      );
                    })}
                  </motion.div>
                </div>
              )})}
            </div>

            {/* Scatter Animation Overlay */}
            {scatterPositions.length >= 3 && !spinning && (
              <ScatterAnimation positions={scatterPositions} />
            )}

          </div>
        </div>

        {/* Win Display Middle Overlay */}
        <AnimatePresence>
          {lastWin > 0 && !spinning && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.5, y: 50 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.8 }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
             >
               <div className="relative text-center">
                 <div className="absolute inset-0 bg-yellow-500 blur-[80px] opacity-40" />
                 <h2 className="text-amber-400 font-black text-4xl md:text-6xl drop-shadow-[0_5px_5px_rgba(0,0,0,1)] uppercase tracking-tighter mix-blend-screen">
                   Win {lastWin.toLocaleString()} Coins
                 </h2>
                 {isInFreeSpinsMode && freeSpinMultiplier > 1 && (
                   <motion.p
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="text-[#00ffcc] text-xl md:text-2xl font-black mt-1 drop-shadow-[0_0_10px_rgba(0,255,204,0.8)]"
                   >
                     x{freeSpinMultiplier} MULTIPLIER
                   </motion.p>
                 )}
               </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Control Bar */}
      <div className={cn(
        "relative z-20 w-full h-28 border-t-2 flex items-center justify-between px-4 md:px-12 transition-all duration-1000",
        isInFreeSpinsMode
          ? "bg-gradient-to-t from-[#050f18] via-[#0b1e2e] to-[#0a2e4e] border-[#00ffcc]/40 shadow-[0_-10px_40px_rgba(0,255,204,0.3)]"
          : "bg-gradient-to-t from-[#0f0518] via-[#1e0b3b] to-[#2d0a4e] border-[#ff00a0]/40 shadow-[0_-10px_40px_rgba(255,0,160,0.3)]"
      )}>
         
         {/* Left Side: Bet & Balance */}
         <div className="flex flex-col items-start w-1/3">
           <span className="text-[#ffb3e6] text-[10px] md:text-sm font-bold tracking-widest uppercase mb-1 drop-shadow-md">Bet {bet.toLocaleString()}</span>
           <div className="flex items-center gap-1 md:gap-2 bg-[#130727]/80 rounded-full border border-purple-500/30 p-1">
             <button 
               onClick={() => handleBetChange(-100000)}
               disabled={spinning || bet <= 100000 || isInFreeSpinsMode}
               className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-purple-900/50 flex items-center justify-center hover:bg-pink-600 disabled:opacity-50 transition"
             >
               <Minus className="w-3 h-3 md:w-4 md:h-4 text-pink-200" />
             </button>
             <button 
               onClick={() => handleBetChange(100000)}
               disabled={spinning || bet >= balance || isInFreeSpinsMode}
               className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-purple-900/50 flex items-center justify-center hover:bg-pink-600 disabled:opacity-50 transition"
             >
               <Plus className="w-3 h-3 md:w-4 md:h-4 text-pink-200" />
             </button>
           </div>
           <div className="mt-2 text-[10px] md:text-xs font-medium text-purple-300">
             Balance <span className="text-white text-xs md:text-sm ml-1 font-bold">{balance.toLocaleString()}</span>
           </div>
         </div>

         {/* Center Display: Spin Button & Win Text */}
         <div className="flex flex-col items-center justify-end relative h-full w-1/3">
           {lastWin > 0 && !spinning && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
               className="absolute -top-[4.5rem] text-center whitespace-nowrap bg-black/60 px-4 py-1 rounded-full border border-amber-500/50 shadow-[0_0_15px_rgba(251,191,36,0.5)] z-50"
             >
               <span className="text-xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
                 WIN {lastWin.toLocaleString()}
               </span>
             </motion.div>
           )}
           
           <button
             onClick={spin}
             disabled={spinning || showFreeSpinsModal}
             className={cn(
               "absolute -top-10 group shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-full p-1.5 md:p-2 shadow-[0_0_30px_rgba(255,0,160,0.6)] group-disabled:grayscale transition-all active:scale-95",
               isInFreeSpinsMode
                 ? "bg-gradient-to-b from-[#00ffcc] to-[#007766]"
                 : "bg-gradient-to-b from-[#ff00a0] to-[#7000ff]"
             )}
           >
             <div className={cn(
               "w-full h-full rounded-full border-4 flex items-center justify-center relative overflow-hidden",
               isInFreeSpinsMode
                 ? "border-[#00ffcc]/30 bg-gradient-to-br from-[#006655] to-[#00aa88]"
                 : "border-pink-300/30 bg-gradient-to-br from-[#4a00e0] to-[#8e2de2]"
             )}>
                <div className={cn(
                  "absolute inset-0 blend-overlay",
                  isInFreeSpinsMode ? "bg-[#00ffcc]/20" : "bg-[#ff00a0]/20"
                )} />
                <div className={cn(
                  "absolute inset-0 border-[6px] rounded-full border-r-transparent border-b-transparent border-l-transparent",
                  isInFreeSpinsMode ? "border-t-[#00ffcc]" : "border-t-[#ff00a0]",
                  spinning && "animate-spin duration-700"
                )} />
                <span className={cn(
                  "text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b drop-shadow-md tracking-tighter italic",
                  isInFreeSpinsMode ? "from-white to-[#99ffee]" : "from-white to-pink-200"
                )} style={{ WebkitTextStroke: isInFreeSpinsMode ? '1px #00ffcc' : '1px #ff00a0' }}>
                 {isInFreeSpinsMode ? "FREE" : (isRespinning ? "RESPIN" : "JILI")}
                </span>
             </div>
           </button>
         </div>

         {/* Right Side Options */}
         <div className="flex items-center justify-end gap-2 md:gap-4 w-1/3">
           {/* Scatter pay info */}
           <div className="hidden md:flex flex-col items-end text-[10px] text-purple-400 font-medium">
             <span>3 SC → 8 FS</span>
             <span>4 SC → 15 FS</span>
             <span>5 SC → 25 FS</span>
           </div>
           <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-purple-500/50 flex items-center justify-center bg-[#2d0a4e] opacity-70 hover:opacity-100 cursor-pointer transition">
             <Zap className="w-4 h-4 md:w-5 md:h-5 text-purple-300" />
           </div>
           <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-purple-500/50 flex items-center justify-center bg-[#2d0a4e] opacity-70 hover:opacity-100 cursor-pointer transition">
             <Settings className="w-4 h-4 md:w-5 md:h-5 text-purple-300" />
           </div>
         </div>

      </div>

      {/* Free Spins Modal */}
      <AnimatePresence>
        {showFreeSpinsModal && (
          <FreeSpinsModal
            freeSpins={pendingFreeSpins}
            isRetrigger={isRetrigger}
            onDismiss={dismissModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
