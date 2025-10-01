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

export interface Mutation {
  id: string;
  name: string;
  type: 'yield' | 'quality' | 'speed' | 'super';
  bonus: number; // Multiplicative bonus
  description: string;
  rarity: 'rare' | 'epic' | 'legendary';
}

export interface CustomStrain {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  baseYield: number;
  baseTimeMultiplier: number;
  waterTolerance: number;
  nutrientSensitivity: number;
  seedPrice: number;
  description: string;
  generation: number; // Wie oft wurde gekreuzt
  parents?: [string, string];
  mutation?: Mutation; // Seltene Mutation mit extremen Boni
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

// Mögliche Mutationen mit extremen Boni
export const MUTATIONS: Mutation[] = [
  {
    id: 'godzilla',
    name: '🦖 Godzilla Gene',
    type: 'yield',
    bonus: 2.5, // +150% Ertrag!
    description: 'Monströse Erträge!',
    rarity: 'legendary'
  },
  {
    id: 'diamond',
    name: '💎 Diamond Trichomes',
    type: 'quality',
    bonus: 2.0, // +100% Qualität!
    description: 'Kristallklare Perfektion!',
    rarity: 'legendary'
  },
  {
    id: 'rocket',
    name: '🚀 Rocket Growth',
    type: 'speed',
    bonus: 0.4, // 60% schneller!
    description: 'Wächst wie verrückt!',
    rarity: 'epic'
  },
  {
    id: 'mega-yield',
    name: '🌟 Mega Yield',
    type: 'yield',
    bonus: 1.8, // +80% Ertrag
    description: 'Überdurchschnittliche Erträge',
    rarity: 'epic'
  },
  {
    id: 'platinum',
    name: '⭐ Platinum Quality',
    type: 'quality',
    bonus: 1.6, // +60% Qualität
    description: 'Premium Qualität',
    rarity: 'epic'
  },
  {
    id: 'godmode',
    name: '✨ God Mode',
    type: 'super',
    bonus: 1.5, // +50% auf ALLES
    description: 'Perfekte Genetik!',
    rarity: 'legendary'
  },
  {
    id: 'turbo',
    name: '⚡ Turbo Gene',
    type: 'speed',
    bonus: 0.6, // 40% schneller
    description: 'Beschleunigtes Wachstum',
    rarity: 'rare'
  },
  {
    id: 'beast',
    name: '💪 Beast Mode',
    type: 'yield',
    bonus: 1.5, // +50% Ertrag
    description: 'Kräftiges Wachstum',
    rarity: 'rare'
  }
];

const getMutationChance = (generation: number): number => {
  // Base chance: 5%, increases with generation
  return Math.min(0.05 + (generation * 0.02), 0.25); // Max 25% bei hohen Generationen
};

const rollForMutation = (generation: number): Mutation | undefined => {
  const chance = getMutationChance(generation);
  
  if (Math.random() > chance) return undefined;
  
  // Weighted random selection based on rarity
  const roll = Math.random();
  let availableMutations: Mutation[];
  
  if (roll < 0.02) { // 2% legendary
    availableMutations = MUTATIONS.filter(m => m.rarity === 'legendary');
  } else if (roll < 0.15) { // 13% epic
    availableMutations = MUTATIONS.filter(m => m.rarity === 'epic');
  } else { // 85% rare
    availableMutations = MUTATIONS.filter(m => m.rarity === 'rare');
  }
  
  return availableMutations[Math.floor(Math.random() * availableMutations.length)];
};

export const breedTwoStrains = (parent1: CustomStrain, parent2: CustomStrain): CustomStrain => {
  const generation = Math.max(parent1.generation, parent2.generation) + 1;
  const name = generateStrainName(generation);
  
  // Mix stats with some randomness
  let baseYield = Math.round((parent1.baseYield + parent2.baseYield) / 2 * (0.9 + Math.random() * 0.3));
  let baseTimeMultiplier = (parent1.baseTimeMultiplier + parent2.baseTimeMultiplier) / 2 * (0.95 + Math.random() * 0.1);
  const waterTolerance = (parent1.waterTolerance + parent2.waterTolerance) / 2;
  const nutrientSensitivity = (parent1.nutrientSensitivity + parent2.nutrientSensitivity) / 2;
  
  // Check for mutation!
  const mutation = rollForMutation(generation);
  
  // Apply mutation bonuses
  if (mutation) {
    switch (mutation.type) {
      case 'yield':
        baseYield = Math.round(baseYield * mutation.bonus);
        break;
      case 'speed':
        baseTimeMultiplier *= mutation.bonus;
        break;
      case 'super':
        baseYield = Math.round(baseYield * mutation.bonus);
        baseTimeMultiplier *= mutation.bonus;
        break;
    }
  }
  
  // Rarity can improve (and mutations increase rarity)
  let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
  
  if (mutation?.rarity === 'legendary') {
    rarity = 'legendary';
  } else if (mutation?.rarity === 'epic') {
    rarity = Math.random() > 0.3 ? 'epic' : 'rare';
  } else if (parent1.rarity === 'epic' || parent2.rarity === 'epic') {
    rarity = Math.random() > 0.3 ? 'epic' : 'rare';
  } else if (parent1.rarity === 'rare' || parent2.rarity === 'rare') {
    rarity = Math.random() > 0.5 ? 'rare' : 'common';
  } else {
    rarity = Math.random() > 0.8 ? 'rare' : 'common';
  }
  
  const seedPrice = Math.round((parent1.seedPrice + parent2.seedPrice) / 2 * (mutation ? 2.0 : 1.2));
  
  return {
    id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: mutation ? `${name} [${mutation.name}]` : name,
    rarity,
    baseYield,
    baseTimeMultiplier,
    waterTolerance,
    nutrientSensitivity,
    seedPrice,
    description: mutation 
      ? `Gen ${generation} Hybrid mit MUTATION! ${mutation.description} | ${parent1.name} × ${parent2.name}`
      : `Gen ${generation} Hybrid: ${parent1.name} × ${parent2.name}`,
    generation,
    parents: [parent1.id, parent2.id],
    mutation
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
