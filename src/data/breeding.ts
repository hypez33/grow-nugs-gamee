// Breeding and genetics system
export interface Phenotype {
  id: string;
  name: string;
  bonuses: {
    yieldBonus?: number;
    qualityBonus?: number;
    speedBonus?: number;
    resistanceBonus?: number;
  };
  rarity: 'common' | 'rare' | 'legendary';
}

export interface CustomStrain {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic';
  baseYield: number;
  baseTimeMultiplier: number;
  waterTolerance: number;
  nutrientSensitivity: number;
  seedPrice: number;
  description: string;
  generation: number; // Wie oft wurde gekreuzt
  parents?: [string, string];
}

export interface MotherPlant {
  id: string;
  strainId: string;
  phenotypeId?: string;
  clonesTaken: number;
  maxClones: number;
  acquiredAt: number;
}

export const PHENOTYPES: Phenotype[] = [
  {
    id: 'purple-pheno',
    name: 'Purple Pheno',
    bonuses: { qualityBonus: 0.15 },
    rarity: 'rare'
  },
  {
    id: 'beast-mode',
    name: 'Beast Mode',
    bonuses: { yieldBonus: 0.25 },
    rarity: 'rare'
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    bonuses: { speedBonus: 0.2 },
    rarity: 'common'
  },
  {
    id: 'iron-genetics',
    name: 'Iron Genetics',
    bonuses: { resistanceBonus: 0.3 },
    rarity: 'common'
  },
  {
    id: 'unicorn',
    name: 'Unicorn Cut',
    bonuses: { yieldBonus: 0.2, qualityBonus: 0.2, speedBonus: 0.15 },
    rarity: 'legendary'
  }
];

// Name parts for random generation
const NAME_PREFIXES = ['Super', 'Ultra', 'Mega', 'Ultimate', 'Royal', 'Divine', 'Cosmic', 'Mystic', 'Fire', 'Ice', 'Thunder', 'Diamond', 'Golden', 'Silver', 'Purple', 'Blue', 'Green', 'White', 'Black'];
const NAME_MIDS = ['Buba', 'Zkittlez', 'Cookie', 'Diesel', 'Widow', 'Dream', 'Queen', 'King', 'Monster', 'Beast', 'Dragon', 'Tiger', 'Lion', 'Wolf', 'Bear'];
const NAME_SUFFIXES = ['Kush', 'Haze', 'OG', 'Express', 'Auto', 'XL', 'XXL', 'Elite', 'Premium', 'Deluxe', 'Supreme', 'Maximum', 'Extreme'];

export const generateStrainName = (generation: number): string => {
  const parts: string[] = [];
  const numParts = Math.min(2 + Math.floor(generation / 2), 5); // More parts with higher generation
  
  for (let i = 0; i < numParts; i++) {
    if (i === 0 || Math.random() > 0.3) {
      parts.push(NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)]);
    }
    if (Math.random() > 0.2) {
      parts.push(NAME_MIDS[Math.floor(Math.random() * NAME_MIDS.length)]);
    }
  }
  parts.push(NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)]);
  
  return parts.join(' ');
};

export const breedTwoStrains = (parent1: CustomStrain, parent2: CustomStrain): CustomStrain => {
  const generation = Math.max(parent1.generation, parent2.generation) + 1;
  const name = generateStrainName(generation);
  
  // Mix stats with some randomness
  const baseYield = Math.round((parent1.baseYield + parent2.baseYield) / 2 * (0.9 + Math.random() * 0.3));
  const baseTimeMultiplier = (parent1.baseTimeMultiplier + parent2.baseTimeMultiplier) / 2 * (0.95 + Math.random() * 0.1);
  const waterTolerance = (parent1.waterTolerance + parent2.waterTolerance) / 2;
  const nutrientSensitivity = (parent1.nutrientSensitivity + parent2.nutrientSensitivity) / 2;
  
  // Rarity can improve
  let rarity: 'common' | 'rare' | 'epic' = 'common';
  if (parent1.rarity === 'epic' || parent2.rarity === 'epic') {
    rarity = Math.random() > 0.3 ? 'epic' : 'rare';
  } else if (parent1.rarity === 'rare' || parent2.rarity === 'rare') {
    rarity = Math.random() > 0.5 ? 'rare' : 'common';
  } else {
    rarity = Math.random() > 0.8 ? 'rare' : 'common';
  }
  
  const seedPrice = Math.round((parent1.seedPrice + parent2.seedPrice) / 2 * 1.2);
  
  return {
    id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    rarity,
    baseYield,
    baseTimeMultiplier,
    waterTolerance,
    nutrientSensitivity,
    seedPrice,
    description: `Gen ${generation} Hybrid: ${parent1.name} × ${parent2.name}`,
    generation,
    parents: [parent1.id, parent2.id]
  };
};

export const getPhenotypeChance = (rarity: Phenotype['rarity']): number => {
  switch (rarity) {
    case 'common': return 0.15;
    case 'rare': return 0.05;
    case 'legendary': return 0.01;
  }
};

export const CLONE_COST = 30;
export const MOTHER_PLANT_COST = 200;
