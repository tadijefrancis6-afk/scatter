import { Key, Eye, Flame, Lamp, Archive, Bird, BellRing } from "lucide-react";

export type SymbolID = "WILD" | "EYE" | "BOMB" | "LANTERN" | "CHEST" | "RAVEN" | "BELL" | "SCATTER";

export interface SlotSymbol {
  id: SymbolID;
  name: string;
  payoutMultiplier: number[]; // Index 0 = 3 matches, 1 = 4 matches, 2 = 5 matches
  weight: number; // For generation probability
  isScatter?: boolean;
}

export const SYMBOLS: Record<SymbolID, SlotSymbol> = {
  WILD: { id: "WILD", name: "Wild", payoutMultiplier: [10, 25, 100], weight: 1 }, // Skull Key
  SCATTER: { id: "SCATTER", name: "Free Spins", payoutMultiplier: [2, 5, 50], weight: 2, isScatter: true },
  EYE: { id: "EYE", name: "Eye", payoutMultiplier: [5, 15, 50], weight: 4 },
  BOMB: { id: "BOMB", name: "Bomb", payoutMultiplier: [3, 8, 25], weight: 4 },
  LANTERN: { id: "LANTERN", name: "Lantern", payoutMultiplier: [2, 5, 15], weight: 5 },
  CHEST: { id: "CHEST", name: "Chest", payoutMultiplier: [1, 3, 10], weight: 6 },
  RAVEN: { id: "RAVEN", name: "Raven", payoutMultiplier: [0.5, 2, 5], weight: 8 },
  BELL: { id: "BELL", name: "Bell", payoutMultiplier: [0.5, 1, 3], weight: 10 },
};

// JILI-style tiered free spin awards
export const FREE_SPIN_TIERS: Record<number, number> = {
  3: 8,
  4: 15,
  5: 25,
};

// Standard 20 paylines for 5x3 grid
export const PAYLINES = [
  // Straight lines
  [1, 1, 1, 1, 1], // Middle
  [0, 0, 0, 0, 0], // Top
  [2, 2, 2, 2, 2], // Bottom
  // V and Inverted V
  [0, 1, 2, 1, 0], // V down
  [2, 1, 0, 1, 2], // Inverted V
  // Zig Zags
  [1, 0, 1, 0, 1],
  [1, 2, 1, 2, 1],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  // Other patterns...
  [0, 1, 1, 1, 0],
  [2, 1, 1, 1, 2],
  [0, 2, 0, 2, 0],
  [2, 0, 2, 0, 2],
  [1, 0, 2, 0, 1],
  [1, 2, 0, 2, 1],
  [0, 1, 0, 1, 0],
  [2, 1, 2, 1, 2],
  [0, 2, 2, 2, 0],
  [2, 0, 0, 0, 2],
  [1, 1, 0, 1, 1],
];

export function getRandomSymbol(): SymbolID {
  const totalWeight = Object.values(SYMBOLS).reduce((acc, sym) => acc + sym.weight, 0);
  let random = Math.random() * totalWeight;

  for (const sym of Object.values(SYMBOLS)) {
    random -= sym.weight;
    if (random <= 0) return sym.id;
  }
  return "BELL"; // fallback
}

export function generateGrid(currentGrid?: SymbolID[][], lockedReels: number[] = []): SymbolID[][] {
  // 5 reels, 3 rows -> 5 arrays of 3 symbols each (easier to read columns)
  return Array(5).fill(null).map((_, col) => {
    if (currentGrid && lockedReels.includes(col)) {
      return [...currentGrid[col]]; // keep the locked reel
    }
    return Array(3).fill(null).map(() => getRandomSymbol());
  });
}

export interface WinResult {
  paylineIndex: number;
  symbol: SymbolID;
  count: number;
  winAmount: number;
  positions: { col: number; row: number }[];
  freeSpinsWon?: number;
}

export function calculateWin(
  grid: SymbolID[][],
  bet: number,
  freeSpinMultiplier: number = 1
): { totalWin: number; wins: WinResult[]; totalFreeSpinsWon: number; scatterCount: number } {
  let totalWin = 0;
  let totalFreeSpinsWon = 0;
  const wins: WinResult[] = [];

  PAYLINES.forEach((payline, lineIndex) => {
    let currentMatchStr: SymbolID | null = null;
    let matchCount = 0;
    const positions: { col: number; row: number }[] = [];

    for (let col = 0; col < 5; col++) {
      const row = payline[col];
      const symbolAtPos = grid[col][row];
      
      if (col === 0) {
        currentMatchStr = symbolAtPos;
        matchCount = 1;
        positions.push({ col, row });
        continue;
      }

      // Check if matches or is wild
      if (symbolAtPos === currentMatchStr || symbolAtPos === "WILD" || currentMatchStr === "WILD") {
        matchCount++;
        positions.push({ col, row });
        if (currentMatchStr === "WILD" && symbolAtPos !== "WILD") {
          currentMatchStr = symbolAtPos; // Switch wild chain to the specific symbol
        }
      } else {
        break; // Match line broken
      }
    }

    if (matchCount >= 3) {
      // Find the base symbol (might be purely WILDs or a mix)
      const baseSymbolId = currentMatchStr || "WILD";
      const symbolData = SYMBOLS[baseSymbolId];
      // Only pay lines for non-scatters
      if (symbolData && !symbolData.isScatter) {
        const multiplier = symbolData.payoutMultiplier[matchCount - 3];
        if (multiplier > 0) {
          const winAmount = multiplier * bet * freeSpinMultiplier;
          totalWin += winAmount;
          wins.push({ paylineIndex: lineIndex, symbol: baseSymbolId, count: matchCount, winAmount, positions });
        }
      }
    }
  });

  // Calculate scatter wins (anywhere on grid)
  let scatterCount = 0;
  const scatterPositions: {col: number; row: number}[] = [];
  for (let c = 0; c < 5; c++) {
    for (let r = 0; r < 3; r++) {
      if (grid[c][r] === "SCATTER") {
        scatterCount++;
        scatterPositions.push({ col: c, row: r });
      }
    }
  }

  // Tiered free spin awards for 3+ scatters
  if (scatterCount >= 3) {
    const tierKey = Math.min(scatterCount, 5);
    const spins = FREE_SPIN_TIERS[tierKey] || FREE_SPIN_TIERS[5];
    totalFreeSpinsWon += spins;

    // Scatter also pays coins based on multiplier table
    const scatterSymbol = SYMBOLS["SCATTER"];
    const scatterMultiplier = scatterSymbol.payoutMultiplier[Math.min(scatterCount, 5) - 3];
    const scatterWinAmount = scatterMultiplier * bet * freeSpinMultiplier;
    totalWin += scatterWinAmount;

    wins.push({
      paylineIndex: -1, // Indicates a scatter win
      symbol: "SCATTER",
      count: scatterCount,
      winAmount: scatterWinAmount,
      positions: scatterPositions,
      freeSpinsWon: spins,
    });
  }

  return { totalWin, wins, totalFreeSpinsWon, scatterCount };
}
