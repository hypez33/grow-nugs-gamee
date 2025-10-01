// Terpene definitions and effects
export interface Terpene {
  id: string;
  name: string;
  description: string;
  aroma: string;
  effects: string[];
  dealerTypePreference: string[]; // Which dealer types prefer this terpene
  priceModifier: number; // 0.8-1.5, affects market value
}

export const TERPENES: Record<string, Terpene> = {
  myrcene: {
    id: 'myrcene',
    name: 'Myrcen',
    description: 'Erdiges, moschusartiges Aroma',
    aroma: '🌿 Erdig, Moschus',
    effects: ['Entspannend', 'Beruhigend', 'Schlaffördernd'],
    dealerTypePreference: ['street', 'middleman'],
    priceModifier: 1.0
  },
  limonene: {
    id: 'limonene',
    name: 'Limonen',
    description: 'Zitrusfrisches, belebendes Aroma',
    aroma: '🍋 Zitrus, Frisch',
    effects: ['Stimmungsaufhellend', 'Energetisch', 'Stressabbauend'],
    dealerTypePreference: ['vip', 'dispensary', 'tourist'],
    priceModifier: 1.2
  },
  caryophyllene: {
    id: 'caryophyllene',
    name: 'Caryophyllen',
    description: 'Würziges, pfeffriges Aroma',
    aroma: '🌶️ Würzig, Pfeffer',
    effects: ['Schmerzlindernd', 'Entzündungshemmend', 'Anti-Angst'],
    dealerTypePreference: ['medical', 'vip'],
    priceModifier: 1.3
  },
  pinene: {
    id: 'pinene',
    name: 'Pinen',
    description: 'Kiefernartiges, frisches Aroma',
    aroma: '🌲 Kiefer, Wald',
    effects: ['Fokus', 'Gedächtnis', 'Wachheit'],
    dealerTypePreference: ['middleman', 'wholesale'],
    priceModifier: 1.1
  },
  linalool: {
    id: 'linalool',
    name: 'Linalool',
    description: 'Blumiges, lavendelartiges Aroma',
    aroma: '💐 Blumen, Lavendel',
    effects: ['Beruhigend', 'Anti-Angst', 'Sedierend'],
    dealerTypePreference: ['vip', 'medical', 'tourist'],
    priceModifier: 1.4
  },
  humulene: {
    id: 'humulene',
    name: 'Humulen',
    description: 'Hopfenartiges, holziges Aroma',
    aroma: '🍺 Hopfen, Holz',
    effects: ['Appetitzügelnd', 'Entzündungshemmend', 'Antibakteriell'],
    dealerTypePreference: ['craft', 'dispensary'],
    priceModifier: 1.25
  },
  terpinolene: {
    id: 'terpinolene',
    name: 'Terpinolen',
    description: 'Blumiges, kräuterartiges Aroma',
    aroma: '🌸 Blumen, Kräuter',
    effects: ['Sedierend', 'Antioxidativ', 'Antibakteriell'],
    dealerTypePreference: ['craft', 'vip'],
    priceModifier: 1.35
  },
  ocimene: {
    id: 'ocimene',
    name: 'Ocimen',
    description: 'Süßes, zitrusartiges Aroma',
    aroma: '🍊 Süß, Zitrus',
    effects: ['Antivirall', 'Entzündungshemmend', 'Dekongestionierend'],
    dealerTypePreference: ['tourist', 'dispensary'],
    priceModifier: 1.15
  }
};

export interface TerpeneProfile {
  [terpeneId: string]: number; // 0-100 percentage
}

// Calculate terpene modifications based on environment
export const calculateTerpeneModifiers = (
  baseProfile: TerpeneProfile,
  temperature: number,
  humidity: number,
  lightIntensity: number
): TerpeneProfile => {
  const modified: TerpeneProfile = { ...baseProfile };
  
  // Temperature affects terpene production
  // Optimal: 20-25°C
  const tempFactor = temperature >= 20 && temperature <= 25 
    ? 1.1 
    : temperature < 15 || temperature > 30 
      ? 0.8 
      : 0.95;
  
  // Humidity affects certain terpenes
  // Higher humidity = more myrcene
  if (modified.myrcene && humidity > 60) {
    modified.myrcene = Math.min(100, modified.myrcene * 1.15);
  }
  
  // Lower humidity = more limonene
  if (modified.limonene && humidity < 50) {
    modified.limonene = Math.min(100, modified.limonene * 1.1);
  }
  
  // Light intensity affects overall terpene production
  const lightFactor = lightIntensity >= 70 ? 1.2 : lightIntensity < 50 ? 0.9 : 1.0;
  
  // Apply factors
  Object.keys(modified).forEach(key => {
    modified[key] = Math.min(100, Math.max(0, modified[key] * tempFactor * lightFactor));
  });
  
  return modified;
};

// Calculate overall quality bonus from terpene profile
export const calculateTerpeneQualityBonus = (profile: TerpeneProfile): number => {
  const totalTerpenes = Object.values(profile).reduce((sum, val) => sum + val, 0);
  const diversity = Object.keys(profile).length;
  
  // Bonus for high terpene content and diversity
  return Math.min(30, (totalTerpenes / 100) * diversity * 2);
};

// Get dominant terpene(s) from profile
export const getDominantTerpenes = (profile: TerpeneProfile, minPercentage: number = 15): string[] => {
  return Object.entries(profile)
    .filter(([_, value]) => value >= minPercentage)
    .sort(([_, a], [__, b]) => b - a)
    .map(([id, _]) => id);
};
