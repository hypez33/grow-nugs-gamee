// Pests and diseases system
export interface Pest {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  spreadRate: number; // per day
  damagePerTick: number; // quality reduction
  baseChance: number; // chance to appear
}

export interface PestInfestation {
  id: string;
  pestId: string;
  slotIndex: number;
  startedAt: number;
  severity: number; // 0-100
  treated: boolean;
}

export interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  effectiveness: number; // 0-1
  targetPests: string[]; // pest ids or 'all'
}

export const PESTS: Pest[] = [
  {
    id: 'fungus-gnats',
    name: 'Trauermücken',
    description: 'Kleine schwarze Fliegen, schädigen Wurzeln',
    severity: 'low',
    spreadRate: 5,
    damagePerTick: 0.01,
    baseChance: 0.15
  },
  {
    id: 'spider-mites',
    name: 'Spinnmilben',
    description: 'Winzige Spinnentiere, saugen Pflanzensaft',
    severity: 'high',
    spreadRate: 12,
    damagePerTick: 0.03,
    baseChance: 0.08
  },
  {
    id: 'aphids',
    name: 'Blattläuse',
    description: 'Grüne Insekten, schwächen die Pflanze',
    severity: 'medium',
    spreadRate: 8,
    damagePerTick: 0.02,
    baseChance: 0.12
  },
  {
    id: 'powdery-mildew',
    name: 'Echter Mehltau',
    description: 'Weißer Pilzbefall auf Blättern',
    severity: 'high',
    spreadRate: 10,
    damagePerTick: 0.025,
    baseChance: 0.1
  },
  {
    id: 'root-rot',
    name: 'Wurzelfäule',
    description: 'Pilzbefall der Wurzeln durch Überwässerung',
    severity: 'high',
    spreadRate: 6,
    damagePerTick: 0.04,
    baseChance: 0.05
  }
];

export const TREATMENTS: Treatment[] = [
  {
    id: 'neem-oil',
    name: 'Neemöl',
    description: 'Natürliches Insektizid',
    price: 50,
    effectiveness: 0.7,
    targetPests: ['fungus-gnats', 'aphids', 'spider-mites']
  },
  {
    id: 'predatory-mites',
    name: 'Raubmilben',
    description: 'Biologische Schädlingsbekämpfung',
    price: 120,
    effectiveness: 0.9,
    targetPests: ['spider-mites']
  },
  {
    id: 'sulfur-spray',
    name: 'Schwefel-Spray',
    description: 'Gegen Pilzbefall',
    price: 80,
    effectiveness: 0.85,
    targetPests: ['powdery-mildew']
  },
  {
    id: 'hydrogen-peroxide',
    name: 'Wasserstoffperoxid',
    description: 'Bekämpft Wurzelfäule',
    price: 60,
    effectiveness: 0.75,
    targetPests: ['root-rot']
  },
  {
    id: 'universal-treatment',
    name: 'Universal Bio-Spray',
    description: 'Wirkt gegen die meisten Schädlinge',
    price: 150,
    effectiveness: 0.65,
    targetPests: ['all']
  }
];

export const getPestProtection = (upgrades: Record<string, number>): number => {
  const stickyTraps = upgrades['sticky-traps'] || 0;
  const bioShield = upgrades['bio-shield'] || 0;
  return Math.min(0.9, (stickyTraps * 0.3) + (bioShield * 0.25));
};
