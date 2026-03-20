"use client";

import React from "react";
import { Radio, Glasses, CupSoda, Disc3, Star, Music, Key, Eye, Flame, Lamp, Archive, Bird, BellRing } from "lucide-react";
import { SymbolID } from "@/lib/slotEngine";

interface SymbolConfig {
  icon: React.ElementType | string;
  bgColors: string;
  iconColor: string;
  label?: string;
  shadowColor: string;
}

const TextA = ({ className }: { className?: string }) => 
  React.createElement('span', { className: `${className} text-[3.5rem] md:text-[5rem] font-black flex items-center justify-center font-sans tracking-tighter drop-shadow-md` }, 'A');

const TextK = ({ className }: { className?: string }) => 
  React.createElement('span', { className: `${className} text-[3.5rem] md:text-[5rem] font-black flex items-center justify-center font-sans tracking-tighter drop-shadow-md` }, 'K');

export const SYMBOL_RENDER: Record<SymbolID, SymbolConfig> = {
  WILD: { 
    icon: Star, // Ape replacement
    bgColors: "from-[#ff00a0]/60 via-[#ff00a0]/20 to-transparent",
    iconColor: "text-amber-300 fill-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.9)]",
    label: "WILD x2",
    shadowColor: "shadow-[#ff00a0]/50"
  },
  SCATTER: {
    icon: "/peso-guy.jpg",
    bgColors: "from-[#00ffcc]/40 via-[#00ffcc]/10 to-transparent",
    iconColor: "text-emerald-300 fill-blue-500 drop-shadow-[0_0_20px_rgba(0,255,204,0.8)]",
    label: "SCATTER",
    shadowColor: "shadow-[#00ffcc]/60"
  },
  EYE: { 
    icon: Radio, // Boombox
    bgColors: "from-[#ff6600]/40 via-[#ff6600]/10 to-transparent",
    iconColor: "text-[#ff9900] fill-[#ff5500] drop-shadow-[0_0_15px_rgba(255,102,0,0.8)]",
    shadowColor: "shadow-[#ff6600]/40"
  },
  BOMB: { 
    icon: Music, // Sneaker/Music
    bgColors: "from-[#0066ff]/40 via-[#0066ff]/10 to-transparent",
    iconColor: "text-[#3399ff] fill-[#0066ff] drop-shadow-[0_0_15px_rgba(0,102,255,0.8)]",
    shadowColor: "shadow-[#0066ff]/50"
  },
  LANTERN: { 
    icon: Glasses, // Star Glasses
    bgColors: "from-[#ff00ff]/40 via-[#ff00ff]/10 to-transparent",
    iconColor: "text-[#ff66ff] fill-[#ff00ff] drop-shadow-[0_0_15px_rgba(255,0,255,0.8)]",
    shadowColor: "shadow-[#ff00ff]/40"
  },
  CHEST: { 
    icon: CupSoda, // Drink Can
    bgColors: "from-[#00ff00]/40 via-[#00ff00]/10 to-transparent",
    iconColor: "text-[#66ff66] fill-[#00cc00] drop-shadow-[0_0_15px_rgba(0,255,0,0.8)]",
    shadowColor: "shadow-[#00ff00]/40"
  },
  RAVEN: { 
    icon: TextA, 
    bgColors: "transparent",
    iconColor: "text-[#ff00a0] drop-shadow-[0_0_8px_rgba(255,0,160,0.8)]",
    shadowColor: "shadow-transparent"
  },
  BELL: { 
    icon: TextK, 
    bgColors: "transparent",
    iconColor: "text-[#ff3300] drop-shadow-[0_0_8px_rgba(255,51,0,0.8)]",
    shadowColor: "shadow-transparent"
  },
};
