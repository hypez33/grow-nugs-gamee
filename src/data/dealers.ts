export type DealerType = 'street' | 'middleman' | 'vip' | 'wholesale' | 'tourist' | 'dispensary';
export type QualityRequirement = 'C' | 'B' | 'A' | 'S';

export interface Dealer {
  id: string;
  name: string;
  avatar: string;
  type: DealerType;
  reputation: number; // 0-100, affects unlock and prices
  preferredStrains?: string[];
  preferredTerpenes?: string[]; // Preferred terpene IDs
  qualityRequirement: QualityRequirement;
  priceMultiplier: number;
  minQuantity: number;
  maxQuantity: number;
  availability: { start: number; end: number }; // 0-23 hours
  location: string;
  riskLevel: number; // 0-100, chance for negative events
  description: string;
  unlockReputation: number; // player reputation needed to unlock
}

export interface DealerRelationship {
  dealerId: string;
  relationshipLevel: number; // 0-10
  totalDeals: number;
  lastDealAt: number;
  loyaltyBonus: number; // 0-0.3 additional price multiplier
}

export interface TradeContract {
  id: string;
  dealerId: string;
  quantity: number;
  strainId: string;
  pricePerBud: number;
  duration: number; // weeks
  deliverySchedule: 'weekly' | 'biweekly';
  startedAt: number;
  nextDeliveryAt: number;
  completedDeliveries: number;
  totalDeliveries: number;
}

export interface DealerRequest {
  id: string;
  dealerId: string;
  strainId?: string;
  qualityTier: QualityRequirement;
  quantity: number;
  pricePerBud: number;
  expiresAt: number;
  bonus?: string; // special reward
}

export const DEALERS: Dealer[] = [
  // Straßendealer - Low risk, small amounts, always available
  {
    id: 'dealer-street-mike',
    name: 'Mike "Quick"',
    avatar: '🧑',
    type: 'street',
    reputation: 0,
    preferredTerpenes: ['myrcene', 'pinene'],
    qualityRequirement: 'C',
    priceMultiplier: 0.9,
    minQuantity: 10,
    maxQuantity: 50,
    availability: { start: 0, end: 23 },
    location: 'Bahnhofsviertel',
    riskLevel: 15,
    description: 'Schnelle Deals, kleine Mengen. Nimmt alles, fragt nicht viel.',
    unlockReputation: 0,
  },
  {
    id: 'dealer-street-lisa',
    name: 'Lisa "Night"',
    avatar: '👩',
    type: 'street',
    reputation: 0,
    preferredTerpenes: ['limonene', 'caryophyllene'],
    qualityRequirement: 'B',
    priceMultiplier: 1.0,
    minQuantity: 20,
    maxQuantity: 80,
    availability: { start: 20, end: 6 },
    location: 'Club District',
    riskLevel: 25,
    description: 'Nur nachts aktiv. Zahlt fair für gute Qualität.',
    unlockReputation: 50,
  },
  
  // Mittelsmänner - Moderate prices, medium amounts
  {
    id: 'dealer-mid-carlos',
    name: 'Carlos "The Bridge"',
    avatar: '🧔',
    type: 'middleman',
    reputation: 0,
    preferredTerpenes: ['pinene', 'humulene'],
    qualityRequirement: 'B',
    priceMultiplier: 1.2,
    minQuantity: 50,
    maxQuantity: 200,
    availability: { start: 10, end: 22 },
    location: 'Industriegebiet',
    riskLevel: 30,
    description: 'Verbindet dich mit größeren Käufern. Zuverlässig und diskret.',
    unlockReputation: 100,
  },
  {
    id: 'dealer-mid-yasmin',
    name: 'Yasmin "Connect"',
    avatar: '🧕',
    type: 'middleman',
    reputation: 0,
    preferredTerpenes: ['linalool', 'terpinolene'],
    qualityRequirement: 'A',
    priceMultiplier: 1.3,
    minQuantity: 80,
    maxQuantity: 250,
    availability: { start: 14, end: 2 },
    location: 'Downtown',
    riskLevel: 20,
    description: 'Exzellentes Netzwerk. Bevorzugt Premium-Qualität.',
    unlockReputation: 200,
  },
  
  // VIP-Käufer - High prices, quality focused
  {
    id: 'dealer-vip-dimitri',
    name: 'Dimitri "Gold"',
    avatar: '👨‍💼',
    type: 'vip',
    reputation: 0,
    preferredStrains: ['green-gelato', 'do-si-dos'],
    preferredTerpenes: ['limonene', 'caryophyllene', 'linalool'],
    qualityRequirement: 'A',
    priceMultiplier: 1.8,
    minQuantity: 100,
    maxQuantity: 300,
    availability: { start: 18, end: 23 },
    location: 'Penthouse District',
    riskLevel: 5,
    description: 'Zahlt Premium für erstklassige Strains. Sehr wählerisch.',
    unlockReputation: 400,
  },
  {
    id: 'dealer-vip-sophia',
    name: 'Sophia "Velvet"',
    avatar: '👩‍💼',
    type: 'vip',
    reputation: 0,
    preferredTerpenes: ['linalool', 'terpinolene', 'ocimene'],
    qualityRequirement: 'S',
    priceMultiplier: 2.2,
    minQuantity: 50,
    maxQuantity: 200,
    availability: { start: 19, end: 1 },
    location: 'Exclusive Lounge',
    riskLevel: 2,
    description: 'Nur das Beste. Zahlt astronomische Preise für S-Tier.',
    unlockReputation: 600,
  },
  
  // Großhändler - Massive amounts, bulk discounts
  {
    id: 'dealer-whole-johann',
    name: 'Johann "Bulk"',
    avatar: '👴',
    type: 'wholesale',
    reputation: 0,
    preferredTerpenes: ['myrcene', 'pinene'],
    qualityRequirement: 'B',
    priceMultiplier: 1.1,
    minQuantity: 300,
    maxQuantity: 1000,
    availability: { start: 9, end: 18 },
    location: 'Lager Komplex',
    riskLevel: 40,
    description: 'Riesige Mengen, faire Preise. Braucht konstante Lieferungen.',
    unlockReputation: 300,
  },
  
  // Touristen - Premium prices, specific strains
  {
    id: 'dealer-tourist-group',
    name: 'Tourist Group',
    avatar: '🗺️',
    type: 'tourist',
    reputation: 0,
    preferredStrains: ['honey-cream', 'gelato-auto'],
    preferredTerpenes: ['limonene', 'ocimene'],
    qualityRequirement: 'A',
    priceMultiplier: 2.0,
    minQuantity: 20,
    maxQuantity: 100,
    availability: { start: 10, end: 20 },
    location: 'Hotel Zone',
    riskLevel: 10,
    description: 'Bezahlen Premiumpreise für beliebte Strains. Wechselnde Gäste.',
    unlockReputation: 250,
  },
  
  // Dispensary - Legal, safe, lower prices
  {
    id: 'dealer-disp-green',
    name: 'Green Valley Dispensary',
    avatar: '🏪',
    type: 'dispensary',
    reputation: 0,
    preferredTerpenes: ['caryophyllene', 'linalool', 'humulene'],
    qualityRequirement: 'A',
    priceMultiplier: 1.4,
    minQuantity: 100,
    maxQuantity: 500,
    availability: { start: 8, end: 20 },
    location: 'Medical District',
    riskLevel: 0,
    description: 'Legal und sicher. Faire Preise, hohe Standards.',
    unlockReputation: 500,
  },
];

export const getDealerTypeColor = (type: DealerType): string => {
  switch (type) {
    case 'street': return 'text-zinc-400';
    case 'middleman': return 'text-sky-400';
    case 'vip': return 'text-amber-400';
    case 'wholesale': return 'text-purple-400';
    case 'tourist': return 'text-pink-400';
    case 'dispensary': return 'text-emerald-400';
    default: return 'text-muted-foreground';
  }
};

export const getDealerTypeName = (type: DealerType): string => {
  switch (type) {
    case 'street': return 'Straßendealer';
    case 'middleman': return 'Mittelsmann';
    case 'vip': return 'VIP-Käufer';
    case 'wholesale': return 'Großhändler';
    case 'tourist': return 'Tourist';
    case 'dispensary': return 'Dispensary';
    default: return type;
  }
};

export const getQualityColor = (quality: QualityRequirement): string => {
  switch (quality) {
    case 'S': return 'text-emerald-400';
    case 'A': return 'text-lime-400';
    case 'B': return 'text-sky-400';
    case 'C': return 'text-zinc-400';
    default: return 'text-muted-foreground';
  }
};

// Random event generator
export const generateDealerEvent = (dealer: Dealer): string | null => {
  const roll = Math.random() * 100;
  
  if (roll < dealer.riskLevel * 0.3) {
    const events = [
      'Polizei in der Nähe! Deal abgebrochen.',
      'Dealer wurde verhaftet. Vorübergehend nicht verfügbar.',
      'Razzia! Ware beschlagnahmt.',
      'Verräter im Netzwerk. Deal unsicher.',
    ];
    return events[Math.floor(Math.random() * events.length)];
  }
  
  if (roll > 95) {
    const bonuses = [
      'Dealer zahlt Bonus für schnelle Lieferung!',
      'Neuer Kontakt erschlossen!',
      'Dealer empfiehlt dich weiter!',
      'Sonderzahlung erhalten!',
    ];
    return bonuses[Math.floor(Math.random() * bonuses.length)];
  }
  
  return null;
};
