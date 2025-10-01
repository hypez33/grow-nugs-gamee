// PGR and other yield enhancers that reduce quality
export interface Enhancer {
  id: string;
  name: string;
  description: string;
  price: number;
  yieldMultiplier: number;
  qualityPenalty: number;
  isBanned?: boolean; // Some are illegal/unethical
}

export const ENHANCERS: Enhancer[] = [
  {
    id: 'pgr-paclobutrazol',
    name: 'PGR (Paclobutrazol)',
    description: '⚠️ Plant Growth Regulator - Massiver Ertrag, aber minderwertige Qualität',
    price: 80,
    yieldMultiplier: 1.8,
    qualityPenalty: 0.4, // -40% quality
    isBanned: true
  },
  {
    id: 'terpen-spray',
    name: 'Terpen-Spray',
    description: 'Künstliche Terpene - Verstärkt Geruch, senkt aber echte Qualität',
    price: 60,
    yieldMultiplier: 1.0,
    qualityPenalty: 0.15 // -15% quality
  },
  {
    id: 'density-booster',
    name: 'Density Booster',
    description: 'Macht Buds dichter und schwerer, aber weniger potent',
    price: 100,
    yieldMultiplier: 1.4,
    qualityPenalty: 0.25 // -25% quality
  },
  {
    id: 'rapid-bulk',
    name: 'Rapid Bulk',
    description: 'Beschleunigt Wachstum auf Kosten der Cannabinoid-Produktion',
    price: 70,
    yieldMultiplier: 1.3,
    qualityPenalty: 0.2 // -20% quality
  },
  {
    id: 'sugar-water',
    name: 'Zucker-Wasser',
    description: 'Erhöht Gewicht, aber nur durch Wasser - keine echte Potenz',
    price: 30,
    yieldMultiplier: 1.15,
    qualityPenalty: 0.1 // -10% quality
  }
];

export const getEnhancerWarning = (enhancer: Enhancer): string => {
  if (enhancer.isBanned) {
    return '🚫 ILLEGAL: Verwendung auf eigene Gefahr!';
  }
  if (enhancer.qualityPenalty > 0.3) {
    return '⚠️ WARNUNG: Starke Qualitätsminderung!';
  }
  if (enhancer.qualityPenalty > 0.15) {
    return '⚠️ VORSICHT: Sichtbare Qualitätsminderung';
  }
  return 'ℹ️ Leichte Qualitätsminderung';
};
