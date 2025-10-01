// Market dynamics and pricing engine
import { TerpeneProfile } from './terpenes';

export interface MarketData {
  strainId: string;
  basePrice: number; // Base price per bud
  currentPrice: number; // Current market price
  demand: number; // 0-100, affects price
  supply: number; // Current market supply
  trend: 'rising' | 'falling' | 'stable';
  priceHistory: { timestamp: number; price: number }[];
  volatility: number; // 0-1, how much prices fluctuate
}

export interface MarketCondition {
  id: string;
  name: string;
  description: string;
  duration: number; // ticks
  priceMultiplier: number;
  demandModifier: number;
  affectedStrains?: string[]; // If empty, affects all
}

export interface GlobalMarket {
  conditions: MarketCondition[];
  aiCompetitors: AICompetitor[];
  totalSupply: number;
  averageQuality: number;
  seasonalModifier: number; // Changes with in-game seasons
}

export interface AICompetitor {
  id: string;
  name: string;
  reputation: number;
  marketShare: number; // 0-100%
  preferredStrains: string[];
  aggressiveness: number; // How fast they respond to market
}

// Initial market data
export const INITIAL_MARKET_DATA: Record<string, MarketData> = {
  'green-gelato': {
    strainId: 'green-gelato',
    basePrice: 8,
    currentPrice: 8,
    demand: 60,
    supply: 0,
    trend: 'stable',
    priceHistory: [],
    volatility: 0.2
  },
  'blue-zushi': {
    strainId: 'blue-zushi',
    basePrice: 15,
    currentPrice: 15,
    demand: 75,
    supply: 0,
    trend: 'rising',
    priceHistory: [],
    volatility: 0.3
  },
  'honey-cream': {
    strainId: 'honey-cream',
    basePrice: 7,
    currentPrice: 7,
    demand: 50,
    supply: 0,
    trend: 'stable',
    priceHistory: [],
    volatility: 0.15
  },
  'black-muffin': {
    strainId: 'black-muffin',
    basePrice: 22,
    currentPrice: 22,
    demand: 90,
    supply: 0,
    trend: 'rising',
    priceHistory: [],
    volatility: 0.4
  },
  'gelato-auto': {
    strainId: 'gelato-auto',
    basePrice: 9,
    currentPrice: 9,
    demand: 55,
    supply: 0,
    trend: 'stable',
    priceHistory: [],
    volatility: 0.25
  }
};

// Market events
export const MARKET_CONDITIONS: MarketCondition[] = [
  {
    id: 'cannabis-cup',
    name: '🏆 Cannabis Cup Event',
    description: 'Premium-Strains sind extrem gefragt!',
    duration: 20,
    priceMultiplier: 1.5,
    demandModifier: 30,
    affectedStrains: ['blue-zushi', 'black-muffin']
  },
  {
    id: '420-festival',
    name: '🎉 4/20 Festival',
    description: 'Alle Strains haben erhöhte Nachfrage',
    duration: 15,
    priceMultiplier: 1.3,
    demandModifier: 25
  },
  {
    id: 'tourist-season',
    name: '✈️ Touristen-Saison',
    description: 'Touristen zahlen Premium-Preise',
    duration: 30,
    priceMultiplier: 1.4,
    demandModifier: 20
  },
  {
    id: 'market-crash',
    name: '📉 Markt-Crash',
    description: 'Überangebot drückt die Preise',
    duration: 25,
    priceMultiplier: 0.6,
    demandModifier: -30
  },
  {
    id: 'police-raid',
    name: '🚨 Razzia-Welle',
    description: 'Konkurrenz fällt aus, Preise steigen',
    duration: 10,
    priceMultiplier: 1.6,
    demandModifier: 40
  },
  {
    id: 'new-competition',
    name: '🏪 Neue Konkurrenz',
    description: 'Neue Grower fluten den Markt',
    duration: 20,
    priceMultiplier: 0.8,
    demandModifier: -15
  }
];

// AI Competitors
export const AI_COMPETITORS: AICompetitor[] = [
  {
    id: 'green-thumb-gang',
    name: 'Green Thumb Gang',
    reputation: 65,
    marketShare: 15,
    preferredStrains: ['green-gelato', 'honey-cream'],
    aggressiveness: 0.6
  },
  {
    id: 'premium-cultivators',
    name: 'Premium Cultivators',
    reputation: 85,
    marketShare: 10,
    preferredStrains: ['blue-zushi', 'black-muffin'],
    aggressiveness: 0.4
  },
  {
    id: 'bulk-growers-inc',
    name: 'Bulk Growers Inc.',
    reputation: 50,
    marketShare: 20,
    preferredStrains: ['honey-cream', 'gelato-auto'],
    aggressiveness: 0.8
  }
];

// Calculate dynamic price based on supply/demand
export const calculateDynamicPrice = (
  marketData: MarketData,
  terpeneProfile: TerpeneProfile,
  quality: number,
  globalConditions: MarketCondition[]
): number => {
  let price = marketData.basePrice;
  
  // Supply/Demand ratio affects price
  const supplyDemandRatio = marketData.supply > 0 
    ? marketData.demand / marketData.supply 
    : marketData.demand / 10;
  
  const supplyDemandMultiplier = Math.max(0.5, Math.min(2.0, supplyDemandRatio / 5));
  price *= supplyDemandMultiplier;
  
  // Quality affects price (50%-150%)
  const qualityMultiplier = 0.5 + (quality / 100) * 1.0;
  price *= qualityMultiplier;
  
  // Terpene profile affects price
  const totalTerpenes = Object.values(terpeneProfile).reduce((sum, val) => sum + val, 0);
  const terpeneMultiplier = 1.0 + (totalTerpenes / 400); // Up to +25%
  price *= terpeneMultiplier;
  
  // Global market conditions
  globalConditions.forEach(condition => {
    if (!condition.affectedStrains || condition.affectedStrains.includes(marketData.strainId)) {
      price *= condition.priceMultiplier;
    }
  });
  
  // Add volatility
  const volatilityAdjustment = 1 + (Math.random() - 0.5) * marketData.volatility;
  price *= volatilityAdjustment;
  
  return Math.round(price * 100) / 100;
};

// Update market supply when player sells
export const updateMarketSupply = (
  marketData: Record<string, MarketData>,
  strainId: string,
  quantity: number
): Record<string, MarketData> => {
  const updated = { ...marketData };
  if (updated[strainId]) {
    updated[strainId] = {
      ...updated[strainId],
      supply: updated[strainId].supply + quantity
    };
    
    // Update trend based on supply changes
    if (quantity > 50) {
      updated[strainId].trend = 'falling';
    }
  }
  return updated;
};

// Simulate AI competitor actions
export const simulateCompetitorActions = (
  marketData: Record<string, MarketData>,
  competitors: AICompetitor[]
): Record<string, MarketData> => {
  const updated = { ...marketData };
  
  competitors.forEach(competitor => {
    competitor.preferredStrains.forEach(strainId => {
      if (updated[strainId]) {
        // AI adds supply based on aggressiveness
        const aiSupply = Math.floor(Math.random() * competitor.aggressiveness * 30);
        updated[strainId].supply += aiSupply;
        
        // High-reputation competitors affect demand
        if (competitor.reputation > 70) {
          updated[strainId].demand = Math.min(100, updated[strainId].demand + 2);
        }
      }
    });
  });
  
  return updated;
};

// Decay market supply over time
export const decayMarketSupply = (marketData: Record<string, MarketData>): Record<string, MarketData> => {
  const updated = { ...marketData };
  
  Object.keys(updated).forEach(strainId => {
    // Supply decays by 10% per tick (consumed by market)
    updated[strainId].supply = Math.max(0, Math.floor(updated[strainId].supply * 0.9));
    
    // Demand naturally fluctuates
    const demandChange = Math.floor((Math.random() - 0.5) * 5);
    updated[strainId].demand = Math.max(20, Math.min(100, updated[strainId].demand + demandChange));
    
    // Update trend
    if (updated[strainId].demand > 70 && updated[strainId].supply < 50) {
      updated[strainId].trend = 'rising';
    } else if (updated[strainId].demand < 40 || updated[strainId].supply > 100) {
      updated[strainId].trend = 'falling';
    } else {
      updated[strainId].trend = 'stable';
    }
  });
  
  return updated;
};
