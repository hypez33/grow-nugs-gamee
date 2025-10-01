// Research tree and technology upgrades
export type ResearchCategory = 'lighting' | 'nutrients' | 'environment' | 'genetics' | 'automation';

export interface ResearchNode {
  id: string;
  name: string;
  description: string;
  category: ResearchCategory;
  cost: number; // Research points needed
  timeRequired: number; // Ticks to complete
  prerequisites: string[]; // IDs of required research
  unlocks: string[]; // What this unlocks
  effects: ResearchEffect[];
  icon: string;
}

export interface ResearchEffect {
  type: 'yield_multiplier' | 'time_reduction' | 'quality_boost' | 'terpene_boost' | 'cost_reduction' | 'unlock_feature';
  value: number;
  target?: string; // Optional specific target (e.g., strain type)
}

export interface ActiveResearch {
  nodeId: string;
  progress: number; // 0-100
  startedAt: number;
}

export const RESEARCH_TREE: ResearchNode[] = [
  // LIGHTING CATEGORY
  {
    id: 'basic-led',
    name: 'LED Grundlagen',
    description: 'Effiziente LED-Beleuchtung für besseres Wachstum',
    category: 'lighting',
    cost: 100,
    timeRequired: 20,
    prerequisites: [],
    unlocks: ['advanced-spectrum', 'uv-supplementation'],
    effects: [
      { type: 'yield_multiplier', value: 1.1 },
      { type: 'cost_reduction', value: 0.15, target: 'electricity' }
    ],
    icon: '💡'
  },
  {
    id: 'advanced-spectrum',
    name: 'Spektrum-Optimierung',
    description: 'Präzise Lichtwellenlängen für maximale Photosynthese',
    category: 'lighting',
    cost: 250,
    timeRequired: 35,
    prerequisites: ['basic-led'],
    unlocks: ['full-spectrum-control'],
    effects: [
      { type: 'yield_multiplier', value: 1.2 },
      { type: 'terpene_boost', value: 15 }
    ],
    icon: '🌈'
  },
  {
    id: 'uv-supplementation',
    name: 'UV-Supplementierung',
    description: 'UV-Licht erhöht Terpene und Trichom-Produktion',
    category: 'lighting',
    cost: 200,
    timeRequired: 30,
    prerequisites: ['basic-led'],
    unlocks: ['full-spectrum-control'],
    effects: [
      { type: 'terpene_boost', value: 25 },
      { type: 'quality_boost', value: 10 }
    ],
    icon: '☀️'
  },
  {
    id: 'full-spectrum-control',
    name: 'Vollspektrum-Kontrolle',
    description: 'Komplette Kontrolle über alle Lichtparameter',
    category: 'lighting',
    cost: 400,
    timeRequired: 50,
    prerequisites: ['advanced-spectrum', 'uv-supplementation'],
    unlocks: [],
    effects: [
      { type: 'yield_multiplier', value: 1.35 },
      { type: 'terpene_boost', value: 30 },
      { type: 'quality_boost', value: 15 }
    ],
    icon: '✨'
  },
  
  // NUTRIENTS CATEGORY
  {
    id: 'organic-nutrients',
    name: 'Bio-Nährstoffe',
    description: 'Organische Dünger verbessern Geschmack und Qualität',
    category: 'nutrients',
    cost: 150,
    timeRequired: 25,
    prerequisites: [],
    unlocks: ['microbial-inoculants', 'custom-feeding'],
    effects: [
      { type: 'quality_boost', value: 12 },
      { type: 'terpene_boost', value: 20 }
    ],
    icon: '🌱'
  },
  {
    id: 'microbial-inoculants',
    name: 'Mikrobielle Impfstoffe',
    description: 'Nützliche Bakterien und Pilze für gesündere Wurzeln',
    category: 'nutrients',
    cost: 200,
    timeRequired: 30,
    prerequisites: ['organic-nutrients'],
    unlocks: ['living-soil'],
    effects: [
      { type: 'yield_multiplier', value: 1.15 },
      { type: 'quality_boost', value: 8 }
    ],
    icon: '🦠'
  },
  {
    id: 'custom-feeding',
    name: 'Maßgeschneidertes Feeding',
    description: 'Strain-spezifische Nährstoffprogramme',
    category: 'nutrients',
    cost: 250,
    timeRequired: 35,
    prerequisites: ['organic-nutrients'],
    unlocks: ['living-soil'],
    effects: [
      { type: 'yield_multiplier', value: 1.2 },
      { type: 'time_reduction', value: 0.05 }
    ],
    icon: '🧪'
  },
  {
    id: 'living-soil',
    name: 'Living Soil System',
    description: 'Selbstregulierendes Boden-Ökosystem',
    category: 'nutrients',
    cost: 450,
    timeRequired: 55,
    prerequisites: ['microbial-inoculants', 'custom-feeding'],
    unlocks: [],
    effects: [
      { type: 'yield_multiplier', value: 1.3 },
      { type: 'quality_boost', value: 20 },
      { type: 'cost_reduction', value: 0.25, target: 'nutrients' }
    ],
    icon: '🌍'
  },
  
  // ENVIRONMENT CATEGORY
  {
    id: 'climate-control',
    name: 'Klima-Kontrolle',
    description: 'Präzise Temperatur- und Luftfeuchtigkeitskontrolle',
    category: 'environment',
    cost: 175,
    timeRequired: 28,
    prerequisites: [],
    unlocks: ['co2-injection', 'vpd-optimization'],
    effects: [
      { type: 'quality_boost', value: 10 },
      { type: 'yield_multiplier', value: 1.1 }
    ],
    icon: '🌡️'
  },
  {
    id: 'co2-injection',
    name: 'CO2-Injektion',
    description: 'Erhöhte CO2-Level für schnelleres Wachstum',
    category: 'environment',
    cost: 300,
    timeRequired: 40,
    prerequisites: ['climate-control'],
    unlocks: ['sealed-environment'],
    effects: [
      { type: 'yield_multiplier', value: 1.25 },
      { type: 'time_reduction', value: 0.1 }
    ],
    icon: '💨'
  },
  {
    id: 'vpd-optimization',
    name: 'VPD-Optimierung',
    description: 'Vapor Pressure Deficit für optimale Transpiration',
    category: 'environment',
    cost: 280,
    timeRequired: 38,
    prerequisites: ['climate-control'],
    unlocks: ['sealed-environment'],
    effects: [
      { type: 'yield_multiplier', value: 1.2 },
      { type: 'quality_boost', value: 15 }
    ],
    icon: '💧'
  },
  {
    id: 'sealed-environment',
    name: 'Versiegeltes Environment',
    description: 'Komplett kontrollierte Grow-Umgebung',
    category: 'environment',
    cost: 500,
    timeRequired: 60,
    prerequisites: ['co2-injection', 'vpd-optimization'],
    unlocks: [],
    effects: [
      { type: 'yield_multiplier', value: 1.4 },
      { type: 'quality_boost', value: 25 },
      { type: 'terpene_boost', value: 20 }
    ],
    icon: '🏢'
  },
  
  // GENETICS CATEGORY
  {
    id: 'pheno-hunting',
    name: 'Pheno-Hunting',
    description: 'Systematische Suche nach Elite-Phänotypen',
    category: 'genetics',
    cost: 200,
    timeRequired: 30,
    prerequisites: [],
    unlocks: ['tissue-culture', 'selective-breeding'],
    effects: [
      { type: 'unlock_feature', value: 1, target: 'pheno_selection' },
      { type: 'quality_boost', value: 10 }
    ],
    icon: '🔍'
  },
  {
    id: 'tissue-culture',
    name: 'Gewebekultur',
    description: 'Klone direkt aus Zellgewebe - keine Mutterpflanzen nötig',
    category: 'genetics',
    cost: 350,
    timeRequired: 45,
    prerequisites: ['pheno-hunting'],
    unlocks: ['genetic-modification'],
    effects: [
      { type: 'unlock_feature', value: 1, target: 'tissue_culture' },
      { type: 'cost_reduction', value: 0.3, target: 'mother_plants' }
    ],
    icon: '🧬'
  },
  {
    id: 'selective-breeding',
    name: 'Selektive Züchtung',
    description: 'Gezielte Kreuzung für gewünschte Eigenschaften',
    category: 'genetics',
    cost: 300,
    timeRequired: 40,
    prerequisites: ['pheno-hunting'],
    unlocks: ['genetic-modification'],
    effects: [
      { type: 'unlock_feature', value: 1, target: 'advanced_breeding' },
      { type: 'yield_multiplier', value: 1.15 }
    ],
    icon: '🧪'
  },
  {
    id: 'genetic-modification',
    name: 'Genetische Modifikation',
    description: 'Direkte Gen-Editierung für perfekte Strains',
    category: 'genetics',
    cost: 600,
    timeRequired: 70,
    prerequisites: ['tissue-culture', 'selective-breeding'],
    unlocks: [],
    effects: [
      { type: 'unlock_feature', value: 1, target: 'gene_editing' },
      { type: 'yield_multiplier', value: 1.5 },
      { type: 'quality_boost', value: 30 }
    ],
    icon: '🔬'
  },
  
  // AUTOMATION CATEGORY
  {
    id: 'auto-watering',
    name: 'Auto-Bewässerung',
    description: 'Automatisches Bewässerungssystem',
    category: 'automation',
    cost: 150,
    timeRequired: 25,
    prerequisites: [],
    unlocks: ['smart-monitoring', 'drip-irrigation'],
    effects: [
      { type: 'unlock_feature', value: 1, target: 'auto_water' }
    ],
    icon: '💦'
  },
  {
    id: 'smart-monitoring',
    name: 'Smart Monitoring',
    description: 'KI-gestützte Überwachung aller Parameter',
    category: 'automation',
    cost: 250,
    timeRequired: 35,
    prerequisites: ['auto-watering'],
    unlocks: ['full-automation'],
    effects: [
      { type: 'unlock_feature', value: 1, target: 'smart_alerts' },
      { type: 'quality_boost', value: 12 }
    ],
    icon: '📊'
  },
  {
    id: 'drip-irrigation',
    name: 'Tropfbewässerung',
    description: 'Präzise Nährstoffversorgung direkt an den Wurzeln',
    category: 'automation',
    cost: 200,
    timeRequired: 30,
    prerequisites: ['auto-watering'],
    unlocks: ['full-automation'],
    effects: [
      { type: 'yield_multiplier', value: 1.15 },
      { type: 'cost_reduction', value: 0.2, target: 'water' }
    ],
    icon: '💧'
  },
  {
    id: 'full-automation',
    name: 'Voll-Automatisierung',
    description: 'Komplett automatisierter Grow-Betrieb',
    category: 'automation',
    cost: 500,
    timeRequired: 60,
    prerequisites: ['smart-monitoring', 'drip-irrigation'],
    unlocks: [],
    effects: [
      { type: 'unlock_feature', value: 1, target: 'full_auto' },
      { type: 'time_reduction', value: 0.15 }
    ],
    icon: '🤖'
  }
];

// Calculate research points earned
export const calculateResearchPoints = (
  harvestQuality: number,
  strainRarity: 'common' | 'rare' | 'epic' | 'legendary'
): number => {
  const basePoints = Math.floor(harvestQuality / 10);
  const rarityMultiplier = {
    'common': 1,
    'rare': 1.5,
    'epic': 2,
    'legendary': 3
  }[strainRarity];
  
  return Math.floor(basePoints * rarityMultiplier);
};

// Get available research nodes (prerequisites met)
export const getAvailableResearch = (
  completedResearch: string[]
): ResearchNode[] => {
  return RESEARCH_TREE.filter(node => {
    if (completedResearch.includes(node.id)) return false;
    return node.prerequisites.every(prereq => completedResearch.includes(prereq));
  });
};

// Calculate total research effects
export const calculateResearchBonuses = (
  completedResearch: string[]
): {
  yieldMultiplier: number;
  timeReduction: number;
  qualityBoost: number;
  terpeneBoost: number;
  unlockedFeatures: string[];
} => {
  let yieldMultiplier = 1;
  let timeReduction = 0;
  let qualityBoost = 0;
  let terpeneBoost = 0;
  const unlockedFeatures: string[] = [];
  
  completedResearch.forEach(researchId => {
    const node = RESEARCH_TREE.find(n => n.id === researchId);
    if (!node) return;
    
    node.effects.forEach(effect => {
      switch (effect.type) {
        case 'yield_multiplier':
          yieldMultiplier *= effect.value;
          break;
        case 'time_reduction':
          timeReduction += effect.value;
          break;
        case 'quality_boost':
          qualityBoost += effect.value;
          break;
        case 'terpene_boost':
          terpeneBoost += effect.value;
          break;
        case 'unlock_feature':
          if (effect.target) unlockedFeatures.push(effect.target);
          break;
      }
    });
  });
  
  return { yieldMultiplier, timeReduction, qualityBoost, terpeneBoost, unlockedFeatures };
};
