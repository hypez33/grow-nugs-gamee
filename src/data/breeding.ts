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

export interface BreedingRecipe {
  parent1: string; // strain id
  parent2: string; // strain id
  offspring: string; // new strain id
  discoveryChance: number;
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

export const BREEDING_RECIPES: BreedingRecipe[] = [
  {
    parent1: 'green-gelato',
    parent2: 'blue-zushi',
    offspring: 'gelato-zushi-f1',
    discoveryChance: 0.7
  },
  {
    parent1: 'honey-cream',
    parent2: 'gelato-auto',
    offspring: 'honey-gelato-auto',
    discoveryChance: 0.6
  },
  {
    parent1: 'blue-zushi',
    parent2: 'black-muffin',
    offspring: 'black-zushi-elite',
    discoveryChance: 0.4
  }
];

export const getPhenotypeChance = (rarity: Phenotype['rarity']): number => {
  switch (rarity) {
    case 'common': return 0.15;
    case 'rare': return 0.05;
    case 'legendary': return 0.01;
  }
};

export const CLONE_COST = 30;
export const MOTHER_PLANT_COST = 200;
