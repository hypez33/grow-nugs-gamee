// Breeding and genetics system
import { TerpeneProfile } from './terpenes';

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
  terpeneProfile: TerpeneProfile;
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

// Balanced Mutations (Max 150% bonus for legendary)
export const MUTATIONS: Mutation[] = [
  // LEGENDARY Tier - Powerful (100-150% bonus)
  {
    id: 'megalodon',
    name: '🦈 Megalodon',
    type: 'yield',
    bonus: 2.5, // +150% Ertrag
    description: 'Gigantische Monster-Erträge! +150%',
    rarity: 'legendary'
  },
  {
    id: 'supersonic',
    name: '⚡ Supersonic',
    type: 'speed',
    bonus: 0.4, // 60% schneller
    description: 'Hyperwachstum! 60% schneller',
    rarity: 'legendary'
  },
  {
    id: 'midas-touch',
    name: '👑 Midas Touch',
    type: 'quality',
    bonus: 2.0, // +100% Qualität
    description: 'Goldene Qualität! +100%',
    rarity: 'legendary'
  },
  {
    id: 'omnipotent',
    name: '✨ Omnipotent',
    type: 'super',
    bonus: 1.6, // +60% auf ALLES
    description: 'Göttliche Perfektion! +60% auf ALLES',
    rarity: 'legendary'
  },
  {
    id: 'godzilla',
    name: '🦖 Godzilla',
    type: 'yield',
    bonus: 2.3, // +130% Ertrag
    description: 'Monströse Erträge! +130%',
    rarity: 'legendary'
  },
  {
    id: 'diamond',
    name: '💎 Diamond Trichomes',
    type: 'quality',
    bonus: 1.8, // +80% Qualität
    description: 'Kristallklare Perfektion! +80%',
    rarity: 'legendary'
  },
  
  // EPIC Tier - Strong (60-100% bonus)
  {
    id: 'titan',
    name: '⚔️ Titan Blood',
    type: 'yield',
    bonus: 1.9, // +90% Ertrag
    description: 'Titanische Kraft! +90%',
    rarity: 'epic'
  },
  {
    id: 'rocket',
    name: '🚀 Rocket Growth',
    type: 'speed',
    bonus: 0.5, // 50% schneller
    description: 'Raketenwachstum! 50% schneller',
    rarity: 'epic'
  },
  {
    id: 'mega-yield',
    name: '🌟 Mega Yield',
    type: 'yield',
    bonus: 1.7, // +70% Ertrag
    description: 'Überdurchschnittliche Erträge! +70%',
    rarity: 'epic'
  },
  {
    id: 'platinum',
    name: '⭐ Platinum Quality',
    type: 'quality',
    bonus: 1.6, // +60% Qualität
    description: 'Premium Qualität! +60%',
    rarity: 'epic'
  },
  {
    id: 'phoenix',
    name: '🔥 Phoenix Gene',
    type: 'super',
    bonus: 1.5, // +50% auf ALLES
    description: 'Aus der Asche! +50% auf ALLES',
    rarity: 'epic'
  },
  
  // RARE Tier - Good (30-50% bonus)
  {
    id: 'godmode',
    name: '✨ God Mode',
    type: 'super',
    bonus: 1.4, // +40% auf ALLES
    description: 'Perfekte Genetik! +40%',
    rarity: 'rare'
  },
  {
    id: 'turbo',
    name: '⚡ Turbo Gene',
    type: 'speed',
    bonus: 0.65, // 35% schneller
    description: 'Beschleunigtes Wachstum! 35% schneller',
    rarity: 'rare'
  },
  {
    id: 'beast',
    name: '💪 Beast Mode',
    type: 'yield',
    bonus: 1.5, // +50% Ertrag
    description: 'Kräftiges Wachstum! +50%',
    rarity: 'rare'
  },
  {
    id: 'crystal',
    name: '💠 Crystal Gene',
    type: 'quality',
    bonus: 1.35, // +35% Qualität
    description: 'Kristalline Struktur! +35%',
    rarity: 'rare'
  }
];

const getMutationChance = (generation: number): number => {
  // Balanced: 6% base + 2.5% per generation, max 25%
  return Math.min(0.06 + (generation * 0.025), 0.25);
};

const rollForMutation = (generation: number): Mutation | undefined => {
  const chance = getMutationChance(generation);
  
  if (Math.random() > chance) return undefined;
  
  // Weighted random selection with balanced legendary chance
  const roll = Math.random();
  let availableMutations: Mutation[];
  
  // Generation bonus for legendary (max 8% at gen 5+)
  const legendaryBonus = Math.min(generation * 0.015, 0.08);
  
  if (roll < (0.04 + legendaryBonus)) { // 4-12% legendary
    availableMutations = MUTATIONS.filter(m => m.rarity === 'legendary');
  } else if (roll < 0.25) { // 21% epic
    availableMutations = MUTATIONS.filter(m => m.rarity === 'epic');
  } else { // 75% rare
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
  
  // Gezüchtete Strains sind 40-50% günstiger (Außer bei Elite-Mutationen)
  // Extreme Mutationen haben höhere Wartungskosten
  let priceReduction = 0.5 + Math.random() * 0.1; // 40-50% günstiger
  if (mutation) {
    // Elite mutations cost more to maintain
    if (mutation.bonus >= 2.0) priceReduction = 0.9; // Only 10% cheaper
    else if (mutation.bonus >= 1.5) priceReduction = 0.7; // 30% cheaper
    else priceReduction = 0.8; // 20% cheaper
  }
  const seedPrice = Math.round((parent1.seedPrice + parent2.seedPrice) / 2 * priceReduction);
  
  // Mix terpene profiles - with safety checks
  const terpeneProfile: TerpeneProfile = {};
  const profile1 = parent1.terpeneProfile || {};
  const profile2 = parent2.terpeneProfile || {};
  const allTerpenes = new Set([...Object.keys(profile1), ...Object.keys(profile2)]);
  allTerpenes.forEach(terpene => {
    const val1 = profile1[terpene] || 0;
    const val2 = profile2[terpene] || 0;
    terpeneProfile[terpene] = Math.round((val1 + val2) / 2 * (0.9 + Math.random() * 0.2));
  });
  
  return {
    id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: mutation ? `${name} [${mutation.name}]` : name,
    rarity,
    baseYield,
    baseTimeMultiplier,
    waterTolerance,
    nutrientSensitivity,
    seedPrice,
    terpeneProfile,
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
