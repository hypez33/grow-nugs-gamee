// Training technique definitions
export interface TrainingTechnique {
  id: string;
  name: string;
  description: string;
  cost: number;
  yieldBonus: number; // multiplier (1.15 = +15%)
  qualityImpact: number; // can be negative if done wrong
  stressRisk: number; // 0.0 to 1.0, chance of hurting plant if failed
  availablePhases: number[]; // phase indices where technique can be applied
  cooldownMs: number;
  oneTimeOnly: boolean; // e.g., topping can only be done once
  requiresMinigame: boolean;
  icon: string;
}

export const TRAINING_TECHNIQUES: TrainingTechnique[] = [
  {
    id: 'lst',
    name: 'LST (Low Stress Training)',
    description: 'Biege Zweige vorsichtig, um mehr Licht zu erreichen. Erhöht Ertrag um 15-25%.',
    cost: 20,
    yieldBonus: 1.2, // +20% average
    qualityImpact: 0.05,
    stressRisk: 0.1, // low risk
    availablePhases: [2, 3], // veg and preflower
    cooldownMs: 25000, // 25 seconds
    oneTimeOnly: false,
    requiresMinigame: true,
    icon: '🌿'
  },
  {
    id: 'topping',
    name: 'Topping',
    description: 'Schneide die Hauptspitze ab, um 2 Hauptcolas zu erzeugen. +25% Ertrag, verzögert Wachstum um 1-2 Tage.',
    cost: 30,
    yieldBonus: 1.25,
    qualityImpact: 0.1,
    stressRisk: 0.2, // medium risk
    availablePhases: [2], // early veg only
    cooldownMs: 0,
    oneTimeOnly: true,
    requiresMinigame: true,
    icon: '✂️'
  },
  {
    id: 'fim',
    name: 'FIM',
    description: 'Ähnlich wie Topping, aber weniger präzise. Erzeugt 3-4 Colas. +20% Ertrag.',
    cost: 25,
    yieldBonus: 1.2,
    qualityImpact: 0.08,
    stressRisk: 0.15,
    availablePhases: [2], // early veg only
    cooldownMs: 0,
    oneTimeOnly: true,
    requiresMinigame: true,
    icon: '✂️'
  },
  {
    id: 'defoliation',
    name: 'Defoliation',
    description: 'Entferne strategisch Blätter für bessere Lichtverteilung. +10-15% Ertrag.',
    cost: 15,
    yieldBonus: 1.12,
    qualityImpact: 0.03,
    stressRisk: 0.25, // higher risk if done wrong
    availablePhases: [2, 3, 4], // late veg through early flower
    cooldownMs: 30000, // 30 seconds
    oneTimeOnly: false,
    requiresMinigame: true,
    icon: '🍃'
  }
];

export interface AppliedTraining {
  techniqueId: string;
  appliedAt: number;
  successLevel: number; // 0.0 to 1.0 based on minigame performance
}
