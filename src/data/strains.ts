// Cannabis Strain definitions with balancing parameters
export interface Strain {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic';
  baseYield: number; // Base Nugs output
  baseTimeMultiplier: number; // Multiplier for phase durations
  waterTolerance: number; // 0-1, higher = more forgiving with water
  nutrientSensitivity: number; // 0-1, higher = more sensitive to nutrients
  seedPrice: number; // Cost in Nugs
  description: string;
  generation?: number;
  parents?: [string, string];
}

export const STRAINS: Strain[] = [
  {
    id: 'green-gelato',
    name: 'Green Gelato',
    rarity: 'common',
    baseYield: 80,
    baseTimeMultiplier: 1.0,
    waterTolerance: 0.8,
    nutrientSensitivity: 0.3,
    seedPrice: 50,
    description: 'Anfängerfreundlich, stabile Erträge, verzeiht Fehler',
    generation: 0
  },
  {
    id: 'blue-zushi',
    name: 'Blue Zushi',
    rarity: 'rare',
    baseYield: 120,
    baseTimeMultiplier: 1.1,
    waterTolerance: 0.6,
    nutrientSensitivity: 0.5,
    seedPrice: 200,
    description: 'Hochwertig, benötigt präzise Pflege für Top-Erträge',
    generation: 0
  },
  {
    id: 'honey-cream',
    name: 'Honey Cream',
    rarity: 'common',
    baseYield: 70,
    baseTimeMultiplier: 0.9,
    waterTolerance: 0.9,
    nutrientSensitivity: 0.2,
    seedPrice: 60,
    description: 'Schnell wachsend, robust, ideal für Anfänger',
    generation: 0
  },
  {
    id: 'black-muffin',
    name: 'Black Muffin F1',
    rarity: 'epic',
    baseYield: 180,
    baseTimeMultiplier: 1.2,
    waterTolerance: 0.5,
    nutrientSensitivity: 0.7,
    seedPrice: 350,
    description: 'Elite-Strain, maximale Erträge bei perfekter Pflege',
    generation: 0
  },
  {
    id: 'gelato-auto',
    name: 'Gelato Auto',
    rarity: 'common',
    baseYield: 90,
    baseTimeMultiplier: 0.85,
    waterTolerance: 0.7,
    nutrientSensitivity: 0.4,
    seedPrice: 75,
    description: 'Autoflower, schneller Zyklus, mittlere Erträge',
    generation: 0
  }
];

export const getRarityColor = (rarity: 'common' | 'rare' | 'epic' | 'legendary'): string => {
  switch (rarity) {
    case 'common': return 'text-muted-foreground';
    case 'rare': return 'text-info';
    case 'epic': return 'text-accent';
    case 'legendary': return 'text-yellow-500 animate-pulse';
  }
};

export const getRarityMultiplier = (rarity: 'common' | 'rare' | 'epic' | 'legendary'): number => {
  switch (rarity) {
    case 'common': return 1.0;
    case 'rare': return 1.3;
    case 'epic': return 1.6;
    case 'legendary': return 2.5;
  }
};
