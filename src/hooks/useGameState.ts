import { useState, useEffect, useCallback } from 'react';
import { Strain, STRAINS } from '@/data/strains';
import { EnvironmentState } from '@/data/environment';
import { breedTwoStrains, CustomStrain } from '@/data/breeding';
import { PESTS, TREATMENTS, getPestProtection } from '@/data/pests';
import { ENHANCERS } from '@/data/enhancers';
import { DealerRelationship, TradeContract } from '@/data/dealers';
import { TerpeneProfile, calculateTerpeneModifiers, getDominantTerpenes } from '@/data/terpenes';
import { MarketData, INITIAL_MARKET_DATA, MarketCondition, AICompetitor, AI_COMPETITORS, decayMarketSupply, simulateCompetitorActions, calculateDynamicPrice } from '@/data/market';
import { ActiveResearch, calculateResearchPoints, getAvailableResearch, calculateResearchBonuses } from '@/data/research';

export interface PlantModifiers {
  waterStacks: number;
  fertilizerApplied: boolean;
  soilType: 'basic' | 'light-mix' | 'all-mix';
  lastWaterTime: number;
  lastFertilizerTime: number;
  qualityMultiplier: number;
  phenotypeId?: string;
  pestInfestationIds: string[];
  appliedEnhancers: string[]; // PGR, terpen spray, etc.
  appliedTrainings?: Array<{
    techniqueId: string;
    appliedAt: number;
    successLevel: number;
  }>;
  terpeneProfile?: TerpeneProfile; // Terpene composition of this plant
}

export interface PlantEnvironment {
  ph: number;
  ec: number;
  humidity: number;
  temperature: number;
}

export interface Plant {
  id: string;
  strainId: string;
  phaseIndex: number;
  elapsedInPhase: number;
  plantedAt: number;
  modifiers: PlantModifiers;
  environment: PlantEnvironment;
}

export interface MotherPlant {
  id: string;
  strainId: string;
  phenotypeId?: string;
  clonesTaken: number;
  maxClones: number;
  acquiredAt: number;
}

export interface PestInfestation {
  id: string;
  pestId: string;
  slotIndex: number;
  startedAt: number;
  severity: number;
  treated: boolean;
}

export interface TradeOffer {
  id: string;
  quantity: number;
  pricePerBud: number;
}

export type QualityTier = 'C' | 'B' | 'A' | 'S';

export interface CuringBatch {
  id: string;
  quantity: number;
  startedAt: number;
  durationMs: number;
  qualityScore: number; // base 1.0 means 100%
}

export interface InventoryBatch {
  id: string;
  quantity: number;
  qualityTier: QualityTier;
  qualityMultiplier: number; // price multiplier derived from tier
}

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  endsAt: number;
  effects: {
    priceMultiplier?: number;
    quantityMultiplier?: number;
    growthMultiplier?: number; // <1 faster growth, >1 slower
  };
}

export type QuestType = 'harvest' | 'sell' | 'water';

export interface Quest {
  id: string;
  type: QuestType;
  description: string;
  goal: number;
  progress: number;
  reward: { nugs?: number; buds?: number };
  claimed: boolean;
}

export interface GameState {
  nugs: number;
  buds: number;
  slots: (Plant | null)[];
  upgrades: Record<string, number>;
  curing: { batches: CuringBatch[] };
  inventory: { batches: InventoryBatch[] };
  trade: {
    offers: TradeOffer[];
    nextRefreshAt: number;
    reputation: number;
    dealerRelationships: DealerRelationship[];
    activeContracts: TradeContract[];
    totalRevenue: number;
  };
  event?: GameEvent;
  quests: Quest[];
  stats: {
    totalHarvests: number;
    bestHarvest: number; // in buds
    totalNugsEarned: number;
    totalBudsHarvested: number;
    totalBudsSold: number;
    totalTrades: number;
    waterChain: number;
    bestWaterChain: number;
    lastWaterDay: string | null;
  };
  settings: {
    sfxEnabled: boolean;
    randomEventsEnabled: boolean;
    pestFrequency: number; // 0.0 to 1.0, multiplier for pest chances
  };
  breeding: {
    motherPlants: MotherPlant[];
    discoveredStrains: string[];
    customStrains: CustomStrain[];
  };
  environment: EnvironmentState;
  envUpgrades: Record<string, number>;
  pests: {
    infestations: PestInfestation[];
    lastCheckAt: number;
  };
  market: {
    data: Record<string, MarketData>;
    activeConditions: MarketCondition[];
    competitors: AICompetitor[];
    lastUpdateAt: number;
  };
  research: {
    points: number;
    completedResearch: string[];
    activeResearch: ActiveResearch | null;
  };
}

const DEFAULT_QUESTS: Quest[] = [
  {
    id: 'q-h-1',
    type: 'harvest',
    description: 'Ernte 3 Pflanzen',
    goal: 3,
    progress: 0,
    reward: { nugs: 75 },
    claimed: false,
  },
  {
    id: 'q-s-1',
    type: 'sell',
    description: 'Verkaufe 100 Buds',
    goal: 100,
    progress: 0,
    reward: { nugs: 150 },
    claimed: false,
  },
  {
    id: 'q-w-1',
    type: 'water',
    description: 'Gieße 10x',
    goal: 10,
    progress: 0,
    reward: { buds: 20 },
    claimed: false,
  },
];

const INITIAL_STATE: GameState = {
  nugs: 1000,
  buds: 500,
  slots: [null, null],
  upgrades: {},
  curing: { batches: [] },
  inventory: { batches: [] },
  trade: {
    offers: [],
    nextRefreshAt: 0,
    reputation: 0,
    dealerRelationships: [],
    activeContracts: [],
    totalRevenue: 0,
  },
  event: undefined,
  quests: DEFAULT_QUESTS,
  stats: {
    totalHarvests: 0,
    bestHarvest: 0,
    totalNugsEarned: 0,
    totalBudsHarvested: 0,
    totalBudsSold: 0,
    totalTrades: 0,
    waterChain: 0,
    bestWaterChain: 0,
    lastWaterDay: null,
  },
  settings: {
    sfxEnabled: true,
    randomEventsEnabled: true,
    pestFrequency: 0.3 // 30% of base pest chances
  },
  breeding: {
    motherPlants: [],
    discoveredStrains: ['green-gelato', 'honey-cream', 'gelato-auto'],
    customStrains: []
  },
  environment: {
    ph: 6.2,
    ec: 1.5,
    humidity: 60,
    temperature: 24,
    lightCycle: 'veg',
    co2Level: 400
  },
  envUpgrades: {},
  pests: {
    infestations: [],
    lastCheckAt: Date.now()
  },
  market: {
    data: INITIAL_MARKET_DATA,
    activeConditions: [],
    competitors: AI_COMPETITORS,
    lastUpdateAt: Date.now()
  },
  research: {
    points: 0,
    completedResearch: [],
    activeResearch: null
  }
};

const STORAGE_KEY = 'cannabis-grower-save';
const AUTOSAVE_INTERVAL = 5000; // 5 seconds

export const useGameState = () => {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Shallow merge to keep compatibility with older saves
        return {
          ...INITIAL_STATE,
          ...parsed,
          curing: { ...(INITIAL_STATE as any).curing, ...(parsed as any)?.curing },
          inventory: { ...(INITIAL_STATE as any).inventory, ...(parsed as any)?.inventory },
          stats: { ...INITIAL_STATE.stats, ...(parsed?.stats || {}) },
          trade: { 
            ...INITIAL_STATE.trade, 
            ...(parsed?.trade || {}),
            reputation: parsed?.trade?.reputation || 0,
            dealerRelationships: parsed?.trade?.dealerRelationships || [],
            activeContracts: parsed?.trade?.activeContracts || [],
            totalRevenue: parsed?.trade?.totalRevenue || 0,
          },
          quests: parsed?.quests || DEFAULT_QUESTS,
          breeding: { 
            ...INITIAL_STATE.breeding, 
            ...(parsed?.breeding || {}),
            customStrains: parsed?.breeding?.customStrains || [],
            discoveredStrains: parsed?.breeding?.discoveredStrains || INITIAL_STATE.breeding.discoveredStrains,
            motherPlants: parsed?.breeding?.motherPlants || []
          },
          environment: { ...INITIAL_STATE.environment, ...(parsed?.environment || {}) },
          envUpgrades: { ...INITIAL_STATE.envUpgrades, ...(parsed?.envUpgrades || {}) },
          pests: { ...INITIAL_STATE.pests, ...(parsed?.pests || {}) },
          market: { 
            ...INITIAL_STATE.market, 
            ...(parsed?.market || {}),
            data: { ...INITIAL_MARKET_DATA, ...(parsed?.market?.data || {}) },
            competitors: parsed?.market?.competitors || AI_COMPETITORS,
            activeConditions: parsed?.market?.activeConditions || [],
          },
          research: {
            ...INITIAL_STATE.research,
            ...(parsed?.research || {}),
            points: parsed?.research?.points || 0,
            completedResearch: parsed?.research?.completedResearch || [],
            activeResearch: parsed?.research?.activeResearch || null,
          },
        } as GameState;
      } catch (e) {
        console.error('Failed to load save:', e);
      }
    }
    return INITIAL_STATE;
  });

  // Autosave
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [state]);

  const manualSave = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const resetGame = useCallback(() => {
    setState(INITIAL_STATE);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const addNugs = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      nugs: prev.nugs + amount,
      stats: {
        ...prev.stats,
        totalNugsEarned: prev.stats.totalNugsEarned + Math.max(0, amount)
      }
    }));
  }, []);

  const spendNugs = useCallback((amount: number): boolean => {
    if (state.nugs >= amount) {
      setState(prev => ({ ...prev, nugs: prev.nugs - amount }));
      return true;
    }
    return false;
  }, [state.nugs]);

  const plantSeed = useCallback((slotIndex: number, strainId: string, soilType: PlantModifiers['soilType']) => {
    setState(prev => {
      const newSlots = [...prev.slots];
      newSlots[slotIndex] = {
        id: `plant-${Date.now()}-${slotIndex}`,
        strainId,
        phaseIndex: 0,
        elapsedInPhase: 0,
        plantedAt: Date.now(),
        modifiers: {
          waterStacks: 0,
          fertilizerApplied: false,
          soilType,
          lastWaterTime: 0,
          lastFertilizerTime: 0,
          qualityMultiplier: 1.0,
          pestInfestationIds: [],
          appliedEnhancers: []
        },
        environment: {
          ph: 6.0 + (Math.random() - 0.5) * 0.4,
          ec: 1.2 + (Math.random() - 0.5) * 0.4,
          humidity: 60 + (Math.random() - 0.5) * 10,
          temperature: 24 + (Math.random() - 0.5) * 2
        }
      };
      return { ...prev, slots: newSlots };
    });
  }, []);

  const removePlant = useCallback((slotIndex: number) => {
    setState(prev => {
      const newSlots = [...prev.slots];
      newSlots[slotIndex] = null;
      return { ...prev, slots: newSlots };
    });
  }, []);

  const updatePlant = useCallback((slotIndex: number, updates: Partial<Plant>) => {
    setState(prev => {
      const newSlots = [...prev.slots];
      const plant = newSlots[slotIndex];
      if (plant) {
        newSlots[slotIndex] = { ...plant, ...updates };
      }
      return { ...prev, slots: newSlots };
    });
  }, []);

  const addBuds = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      buds: Math.max(0, prev.buds + amount)
    }));
  }, []);

  const spendBuds = useCallback((amount: number): boolean => {
    if (state.buds >= amount) {
      setState(prev => ({ ...prev, buds: prev.buds - amount }));
      return true;
    }
    return false;
  }, [state.buds]);

  const recordHarvest = useCallback((budsHarvested: number, qualityScore: number, strainRarity: 'common' | 'rare' | 'epic' | 'legendary') => {
    const researchPoints = calculateResearchPoints(qualityScore, strainRarity);
    
    setState(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        totalHarvests: prev.stats.totalHarvests + 1,
        bestHarvest: Math.max(prev.stats.bestHarvest, budsHarvested),
        totalBudsHarvested: prev.stats.totalBudsHarvested + budsHarvested,
      },
      research: {
        ...prev.research,
        points: prev.research.points + researchPoints,
      },
      quests: prev.quests.map(q =>
        q.type === 'harvest' && !q.claimed
          ? { ...q, progress: Math.min(q.goal, q.progress + 1) }
          : q
      ),
    }));
    
    return researchPoints;
  }, []);

  // Quality helpers
  const getTierFromScore = (score: number): { tier: QualityTier; multiplier: number } => {
    const s = Math.max(0.5, Math.min(1.5, score));
    if (s >= 1.25) return { tier: 'S', multiplier: 1.5 };
    if (s >= 1.1) return { tier: 'A', multiplier: 1.25 };
    if (s >= 0.95) return { tier: 'B', multiplier: 1.0 };
    return { tier: 'C', multiplier: 0.85 };
  };

  const startCuring = useCallback((quantity: number, qualityScore: number) => {
    setState(prev => {
      const base = 60000;
      const cl = prev.upgrades['climate-control'] || 0;
      const eventAdj = prev.event?.id === 'mystic-fog' ? 1.2 : prev.event?.id === 'festival' ? 0.9 : 1.0;
      const effective = Math.max(20000, Math.floor(base * (1 - cl * 0.08) * eventAdj));
      return ({
        ...prev,
        curing: {
          batches: [
            ...prev.curing.batches,
            {
              id: `curing-${Date.now()}-${Math.floor(Math.random()*1000)}`,
              quantity,
              startedAt: Date.now(),
              durationMs: effective,
              qualityScore,
            },
          ],
        },
      });
    });
  }, []);

  const processCuringTick = useCallback(() => {
    setState(prev => {
      if (prev.curing.batches.length === 0) return prev;
      const now = Date.now();
      const ready: CuringBatch[] = [];
      const pending: CuringBatch[] = [];
      for (const b of prev.curing.batches) {
        // allow slight grace window, then degrade if over-cured
        if (now >= b.startedAt + b.durationMs) ready.push(b); else pending.push(b);
      }
      if (ready.length === 0) return prev;
      const newInv = [...prev.inventory.batches];
      let addBudsTotal = 0;
      for (const b of ready) {
        // improvement after curing, degrade if severely over time
        const overdueMs = now - (b.startedAt + b.durationMs);
        let improved = Math.min(1.6, b.qualityScore + 0.06);
        if (overdueMs > 30000) {
          improved = Math.max(0.6, improved - 0.05);
        }
        const { tier, multiplier } = getTierFromScore(improved);
        newInv.push({ id: `inv-${b.id}`, quantity: b.quantity, qualityTier: tier, qualityMultiplier: multiplier });
        addBudsTotal += b.quantity;
      }
      return {
        ...prev,
        buds: prev.buds + addBudsTotal,
        curing: { batches: pending },
        inventory: { batches: newInv },
      };
    });
  }, []);

  const rushCuring = useCallback((batchId: string): boolean => {
    let ok = false;
    setState(prev => {
      const idx = prev.curing.batches.findIndex(b => b.id === batchId);
      if (idx === -1) return prev;
      const b = prev.curing.batches[idx];
      const penalty = 0.1; // rush degrades quality noticeably
      const adjusted = Math.max(0.5, b.qualityScore - penalty);
      const { tier, multiplier } = getTierFromScore(adjusted);
      const batches = [...prev.curing.batches];
      batches.splice(idx,1);
      ok = true;
      return {
        ...prev,
        buds: prev.buds + b.quantity,
        curing: { batches },
        inventory: { batches: [...prev.inventory.batches, { id: `inv-${b.id}`, quantity: b.quantity, qualityTier: tier, qualityMultiplier: multiplier }] },
      };
    });
    return ok;
  }, []);

  const generateTradeOffers = useCallback(() => {
    setState(prev => {
      const stage = Math.floor(prev.stats.totalHarvests / 5);
      const minQtyBase = Math.min(200, 5 + stage * 10);
      const maxQtyBase = Math.min(400, 20 + stage * 20);
      const qMult = prev.event?.effects.quantityMultiplier ?? 1;
      const pMult = prev.event?.effects.priceMultiplier ?? 1;
      const now = Date.now();
      const offers: TradeOffer[] = Array.from({ length: 3 }).map((_, i) => {
        const minQty = Math.floor(minQtyBase * qMult);
        const maxQty = Math.floor(maxQtyBase * qMult);
        const qty = Math.max(minQty, Math.floor(minQty + Math.random() * (Math.max(1, maxQty - minQty + 1))));
        const basePrice = 1 + Math.random() * 2; // 1.0 - 3.0
        const price = Math.min(4, Math.max(1, (basePrice + stage * 0.1) * pMult));
        return {
          id: `offer-${now}-${i}`,
          quantity: qty,
          pricePerBud: Math.round(price * 10) / 10,
        };
      });
      return {
        ...prev,
        trade: {
          ...prev.trade,
          offers,
          nextRefreshAt: now + 30000,
        },
      };
    });
  }, []);

  const acceptTradeOffer = useCallback((offerId: string): boolean => {
    let accepted = false;
    setState(prev => {
      const offer = prev.trade.offers.find(o => o.id === offerId);
      if (!offer) return prev;
      // total available buds
      const totalAvail = prev.buds;
      if (totalAvail < offer.quantity) return prev;
      accepted = true;
      let remaining = offer.quantity;
      let revenueAcc = 0;
      const batches = [...prev.inventory.batches].sort((a,b) => b.qualityMultiplier - a.qualityMultiplier);
      for (let i=0; i<batches.length && remaining>0; i++) {
        const b = batches[i];
        if (b.quantity <= 0) continue;
        const sell = Math.min(b.quantity, remaining);
        revenueAcc += Math.floor(sell * offer.pricePerBud * b.qualityMultiplier);
        b.quantity -= sell;
        remaining -= sell;
      }
      // Fallback if no batches (legacy buds)
      if (prev.inventory.batches.length === 0) {
        revenueAcc = Math.floor(offer.quantity * offer.pricePerBud);
      }
      const cleaned = batches.filter(b => b.quantity > 0);
      return {
        ...prev,
        buds: prev.buds - offer.quantity,
        nugs: prev.nugs + revenueAcc,
        inventory: { batches: cleaned },
        stats: {
          ...prev.stats,
          totalNugsEarned: prev.stats.totalNugsEarned + revenueAcc,
          totalBudsSold: prev.stats.totalBudsSold + offer.quantity,
          totalTrades: prev.stats.totalTrades + 1,
        },
        trade: {
          ...prev.trade,
          offers: prev.trade.offers.filter(o => o.id !== offerId),
        },
        quests: prev.quests.map(q =>
          q.type === 'sell' && !q.claimed
            ? { ...q, progress: Math.min(q.goal, q.progress + offer.quantity) }
            : q
        ),
      } as GameState;
    });
    return accepted;
  }, []);

  const haggleTradeOffer = useCallback((offerId: string): boolean => {
    let success = false;
    setState(prev => {
      const idx = prev.trade.offers.findIndex(o => o.id === offerId);
      if (idx === -1) return prev;
      const offers = [...prev.trade.offers];
      const current = offers[idx];
      success = Math.random() < 0.4;
      if (success) {
        const newPrice = Math.round(current.pricePerBud * 1.2 * 10) / 10;
        offers[idx] = { ...current, pricePerBud: Math.min(5, newPrice) };
      } else {
        // Buyer walks away
        offers.splice(idx, 1);
      }
      return {
        ...prev,
        trade: { ...prev.trade, offers },
      };
    });
    return success;
  }, []);

  // New Dealer System Functions
  const tradeWithDealer = useCallback((dealerId: string, quantity: number, priceMultiplier: number): boolean => {
    let success = false;
    setState(prev => {
      const totalAvail = prev.buds;
      if (totalAvail < quantity) return prev;

      let remaining = quantity;
      let revenueAcc = 0;
      const batches = [...prev.inventory.batches].sort((a,b) => b.qualityMultiplier - a.qualityMultiplier);
      
      for (let i=0; i<batches.length && remaining>0; i++) {
        const b = batches[i];
        if (b.quantity <= 0) continue;
        const sell = Math.min(b.quantity, remaining);
        revenueAcc += Math.floor(sell * 3 * priceMultiplier * b.qualityMultiplier);
        b.quantity -= sell;
        remaining -= sell;
      }

      if (prev.inventory.batches.length === 0) {
        revenueAcc = Math.floor(quantity * 3 * priceMultiplier);
      }

      const cleaned = batches.filter(b => b.quantity > 0);
      
      // Update or create relationship
      const relationships = [...prev.trade.dealerRelationships];
      const relIndex = relationships.findIndex(r => r.dealerId === dealerId);
      
      if (relIndex >= 0) {
        const rel = relationships[relIndex];
        const newLevel = Math.min(10, Math.floor((rel.totalDeals + 1) / 3));
        relationships[relIndex] = {
          ...rel,
          relationshipLevel: newLevel,
          totalDeals: rel.totalDeals + 1,
          lastDealAt: Date.now(),
          loyaltyBonus: Math.min(0.3, newLevel * 0.03),
        };
      } else {
        relationships.push({
          dealerId,
          relationshipLevel: 0,
          totalDeals: 1,
          lastDealAt: Date.now(),
          loyaltyBonus: 0,
        });
      }

      // Increase reputation
      const repGain = Math.floor(quantity / 10) + Math.floor(revenueAcc / 100);

      success = true;
      // Award research points for dealer trades (1 RP per 50 Buds)
      const dealerResearchPoints = Math.max(1, Math.floor(quantity / 50));

      return {
        ...prev,
        buds: prev.buds - quantity,
        nugs: prev.nugs + revenueAcc,
        inventory: { batches: cleaned },
        trade: {
          ...prev.trade,
          reputation: Math.min(1000, prev.trade.reputation + repGain),
          dealerRelationships: relationships,
          totalRevenue: prev.trade.totalRevenue + revenueAcc,
        },
        stats: {
          ...prev.stats,
          totalNugsEarned: prev.stats.totalNugsEarned + revenueAcc,
          totalBudsSold: prev.stats.totalBudsSold + quantity,
          totalTrades: prev.stats.totalTrades + 1,
        },
        research: {
          ...prev.research,
          points: prev.research.points + dealerResearchPoints,
        },
        quests: prev.quests.map(q =>
          q.type === 'sell' && !q.claimed
            ? { ...q, progress: Math.min(q.goal, q.progress + quantity) }
            : q
        ),
      } as GameState;
    });
    return success;
  }, []);

  const createContract = useCallback((dealerId: string, quantity: number, duration: number, priceMultiplier: number, strainId: string): boolean => {
    let success = false;
    setState(prev => {
      const contractId = `contract-${Date.now()}-${dealerId}`;
      const totalDeliveries = duration * 1; // weekly for now
      
      const newContract: TradeContract = {
        id: contractId,
        dealerId,
        quantity,
        strainId,
        pricePerBud: priceMultiplier * 3 * 1.1, // 10% bonus for contracts
        duration,
        deliverySchedule: 'weekly',
        startedAt: Date.now(),
        nextDeliveryAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        completedDeliveries: 0,
        totalDeliveries,
      };

      success = true;
      return {
        ...prev,
        trade: {
          ...prev.trade,
          activeContracts: [...prev.trade.activeContracts, newContract],
        },
      };
    });
    return success;
  }, []);

  const claimQuestReward = useCallback((questId: string): boolean => {
    let claimed = false;
    setState(prev => {
      const idx = prev.quests.findIndex(q => q.id === questId);
      if (idx === -1) return prev;
      const quest = prev.quests[idx];
      if (quest.claimed || quest.progress < quest.goal) return prev;
      claimed = true;
      const quests = [...prev.quests];
      quests[idx] = { ...quest, claimed: true };
      return {
        ...prev,
        quests,
        buds: prev.buds + (quest.reward.buds || 0),
        nugs: prev.nugs + (quest.reward.nugs || 0),
      };
    });
    return claimed;
  }, []);

  const recordWaterAction = useCallback((count: number = 1) => {
    setState(prev => ({
      ...prev,
      quests: prev.quests.map(q =>
        q.type === 'water' && !q.claimed
          ? { ...q, progress: Math.min(q.goal, q.progress + count) }
          : q
      ),
    }));
  }, []);

  const recordPerfectWater = useCallback((perfect: boolean) => {
    setState(prev => {
      const today = new Date();
      const dayKey = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
      const sameDay = prev.stats.lastWaterDay === dayKey || prev.stats.lastWaterDay === null;
      const chain = perfect ? ((sameDay ? prev.stats.waterChain : 0) + 1) : 0;
      return {
        ...prev,
        stats: {
          ...prev.stats,
          lastWaterDay: dayKey,
          waterChain: chain,
          bestWaterChain: Math.max(prev.stats.bestWaterChain, chain)
        }
      };
    });
  }, []);

  const triggerRandomEvent = useCallback(() => {
    const presets: Omit<GameEvent, 'endsAt'>[] = [
      {
        id: 'festival',
        name: 'Psychedelic Festival',
        description: 'Euphorische Kundschaft zahlt mehr und kauft mehr.',
        effects: { priceMultiplier: 1.5, quantityMultiplier: 1.2 },
      },
      {
        id: 'mystic-fog',
        name: 'Mystischer Nebel',
        description: 'Wachstum verlangsamt sich etwas.',
        effects: { growthMultiplier: 1.2 },
      },
      {
        id: 'cosmic-alignment',
        name: 'Kosmische Ausrichtung',
        description: 'Kosmische Energien beschleunigen das Wachstum!',
        effects: { growthMultiplier: 0.8 },
      },
      {
        id: 'market-rush',
        name: 'Marktrun',
        description: 'Kurzzeitig höhere Preise.',
        effects: { priceMultiplier: 1.3 },
      },
    ];
    setState(prev => {
      if (!prev.settings.randomEventsEnabled) return prev;
      const pick = presets[Math.floor(Math.random() * presets.length)];
      const now = Date.now();
      return { ...prev, event: { ...pick, endsAt: now + 60000 } };
    });
  }, []);

  const tickEvent = useCallback(() => {
    setState(prev => {
      if (!prev.event) return prev;
      if (Date.now() < prev.event.endsAt) return prev;
      return { ...prev, event: undefined };
    });
  }, []);

  const upgradeLevel = useCallback((upgradeId: string) => {
    setState(prev => ({
      ...prev,
      upgrades: {
        ...prev.upgrades,
        [upgradeId]: (prev.upgrades[upgradeId] || 0) + 1
      }
    }));
  }, []);

  const addSlot = useCallback(() => {
    setState(prev => ({
      ...prev,
      slots: [...prev.slots, null]
    }));
  }, []);

  // Breeding functions
  const breedStrains = useCallback((parent1Id: string, parent2Id: string): CustomStrain | null => {
    let newStrain: CustomStrain | null = null;
    
    setState(prev => {
      // Find parent strains (can be base strains or custom)
      const allStrains = [...STRAINS, ...(prev.breeding.customStrains || [])];
      const p1 = allStrains.find(s => s.id === parent1Id);
      const p2 = allStrains.find(s => s.id === parent2Id);
      
      if (!p1 || !p2) return prev;
      
      // Create new hybrid
      newStrain = breedTwoStrains(p1 as CustomStrain, p2 as CustomStrain);
      
      return {
        ...prev,
        breeding: {
          ...prev.breeding,
          customStrains: [...(prev.breeding.customStrains || []), newStrain],
          discoveredStrains: [...(prev.breeding.discoveredStrains || []), newStrain.id]
        }
      };
    });
    
    return newStrain;
  }, []);

  const createMotherPlant = useCallback((strainId: string, phenotypeId?: string) => {
    setState(prev => ({
      ...prev,
      breeding: {
        ...prev.breeding,
        motherPlants: [
          ...(prev.breeding.motherPlants || []),
          {
            id: `mother-${Date.now()}`,
            strainId,
            phenotypeId,
            clonesTaken: 0,
            maxClones: 10,
            acquiredAt: Date.now()
          }
        ]
      }
    }));
  }, []);

  // Environment functions - harder to adjust with resistance
  const adjustEnvironment = useCallback((param: keyof EnvironmentState, value: number) => {
    setState(prev => {
      // Adjust all plant environments with resistance
      const newSlots = prev.slots.map(plant => {
        if (!plant) return plant;
        
        const currentValue = plant.environment[param as keyof PlantEnvironment];
        if (typeof currentValue !== 'number') return plant;
        
        const difference = value - currentValue;
        // Only 60% effective + random variance - harder to control
        const adjustment = difference * 0.6 + (Math.random() - 0.5) * 0.2;
        
        return {
          ...plant,
          environment: {
            ...plant.environment,
            [param]: currentValue + adjustment
          }
        };
      });
      
      return {
        ...prev,
        slots: newSlots,
        environment: {
          ...prev.environment,
          [param]: value
        }
      };
    });
  }, []);

  const toggleLightCycle = useCallback(() => {
    setState(prev => ({
      ...prev,
      environment: {
        ...prev.environment,
        lightCycle: prev.environment.lightCycle === 'veg' ? 'flower' : 'veg'
      }
    }));
  }, []);

  const buyEnvUpgrade = useCallback((upgradeId: string, price: number): boolean => {
    if (state.nugs >= price) {
      setState(prev => ({
        ...prev,
        nugs: prev.nugs - price,
        envUpgrades: {
          ...prev.envUpgrades,
          [upgradeId]: 1
        }
      }));
      return true;
    }
    return false;
  }, [state.nugs]);

  // Pest functions
  const treatInfestation = useCallback((infestationId: string, treatmentId: string, price: number): boolean => {
    if (state.nugs >= price) {
      setState(prev => {
        const treatment = TREATMENTS.find((t: any) => t.id === treatmentId);
        if (!treatment) return prev;

        const success = Math.random() < treatment.effectiveness;
        
        return {
          ...prev,
          nugs: prev.nugs - price,
          pests: {
            ...prev.pests,
            infestations: prev.pests.infestations.map(inf =>
              inf.id === infestationId
                ? { ...inf, treated: true, severity: success ? 0 : inf.severity * 0.5 }
                : inf
            )
          }
        };
      });
      return true;
    }
    return false;
  }, [state.nugs]);

  const checkForPests = useCallback(() => {
    setState(prev => {
      const protection = getPestProtection(prev.upgrades);
      const frequencyMultiplier = prev.settings.pestFrequency ?? 0.3;
      const newInfestations: PestInfestation[] = [];

      prev.slots.forEach((plant, slotIndex) => {
        if (!plant) return;
        
        PESTS.forEach((pest: any) => {
          const chance = pest.baseChance * (1 - protection) * frequencyMultiplier;
          if (Math.random() < chance) {
            newInfestations.push({
              id: `pest-${Date.now()}-${slotIndex}-${pest.id}`,
              pestId: pest.id,
              slotIndex,
              startedAt: Date.now(),
              severity: Math.random() * 30 + 10,
              treated: false
            });
          }
        });
      });

      if (newInfestations.length === 0) return prev;

      return {
        ...prev,
        pests: {
          ...prev.pests,
          infestations: [...prev.pests.infestations, ...newInfestations],
          lastCheckAt: Date.now()
        }
      };
    });
  }, []);

  const updateSettings = useCallback((key: keyof GameState['settings'], value: any) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  }, []);

  // Training technique functions
  const applyTraining = useCallback((slotIndex: number, techniqueId: string, successLevel: number, cost: number): boolean => {
    if (state.nugs >= cost) {
      setState(prev => {
        const plant = prev.slots[slotIndex];
        if (!plant) return prev;

        const newSlots = [...prev.slots];
        const currentTrainings = plant.modifiers.appliedTrainings || [];
        
        newSlots[slotIndex] = {
          ...plant,
          modifiers: {
            ...plant.modifiers,
            appliedTrainings: [
              ...currentTrainings,
              {
                techniqueId,
                appliedAt: Date.now(),
                successLevel
              }
            ]
          }
        };

        return {
          ...prev,
          nugs: prev.nugs - cost,
          slots: newSlots
        };
      });
      return true;
    }
    return false;
  }, [state.nugs]);

  // Enhancer functions (PGR, Terpen Spray, etc.)
  const applyEnhancer = useCallback((slotIndex: number, enhancerId: string, price: number): boolean => {
    if (state.nugs >= price) {
      setState(prev => {
        const plant = prev.slots[slotIndex];
        if (!plant) return prev;
        
        const enhancer = ENHANCERS.find((e: any) => e.id === enhancerId);
        if (!enhancer) return prev;

        const newSlots = [...prev.slots];
        newSlots[slotIndex] = {
          ...plant,
          modifiers: {
            ...plant.modifiers,
            appliedEnhancers: [...plant.modifiers.appliedEnhancers, enhancerId]
          }
        };

        return {
          ...prev,
          nugs: prev.nugs - price,
          slots: newSlots
        };
      });
      return true;
    }
    return false;
  }, [state.nugs]);

  // Drift environment values slowly over time - stronger fluctuations
  const driftEnvironmentValues = useCallback(() => {
    setState(prev => {
      const newSlots = prev.slots.map(plant => {
        if (!plant) return plant;
        
        return {
          ...plant,
          environment: {
            ph: Math.max(4.0, Math.min(8.0, plant.environment.ph + (Math.random() - 0.5) * 0.3)),
            ec: Math.max(0.5, Math.min(3.0, plant.environment.ec + (Math.random() - 0.5) * 0.15)),
            humidity: Math.max(30, Math.min(80, plant.environment.humidity + (Math.random() - 0.5) * 5)),
            temperature: Math.max(15, Math.min(35, plant.environment.temperature + (Math.random() - 0.5) * 2.5))
          }
        };
      });
      
      return { ...prev, slots: newSlots };
    });
  }, []);

  // === MARKET SYSTEM ===
  const updateMarketData = useCallback(() => {
    setState(prev => {
      let updatedData = decayMarketSupply(prev.market.data);
      updatedData = simulateCompetitorActions(updatedData, prev.market.competitors);
      
      // Update market conditions duration
      const activeConditions = prev.market.activeConditions
        .map(c => ({ ...c, duration: c.duration - 1 }))
        .filter(c => c.duration > 0);
      
      // 5% chance for new market event
      if (Math.random() < 0.05 && activeConditions.length < 2) {
        const { MARKET_CONDITIONS } = require('@/data/market');
        const availableConditions = MARKET_CONDITIONS.filter(
          mc => !activeConditions.find(ac => ac.id === mc.id)
        );
        if (availableConditions.length > 0) {
          const newCondition = availableConditions[Math.floor(Math.random() * availableConditions.length)];
          activeConditions.push({ ...newCondition });
        }
      }
      
      return {
        ...prev,
        market: {
          ...prev.market,
          data: updatedData,
          activeConditions,
          lastUpdateAt: Date.now()
        }
      };
    });
  }, []);

  const getMarketPrice = useCallback((strainId: string, terpeneProfile: TerpeneProfile, quality: number): number => {
    const marketData = state.market.data[strainId];
    if (!marketData) return 10; // fallback
    
    return calculateDynamicPrice(marketData, terpeneProfile, quality, state.market.activeConditions);
  }, [state.market]);

  // === RESEARCH SYSTEM ===
  const addResearchPoints = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      research: {
        ...prev.research,
        points: prev.research.points + amount
      }
    }));
  }, []);

  const startResearch = useCallback((nodeId: string): boolean => {
    const availableNodes = getAvailableResearch(state.research.completedResearch);
    const node = availableNodes.find(n => n.id === nodeId);
    
    if (!node || state.research.points < node.cost || state.research.activeResearch) {
      return false;
    }
    
    setState(prev => ({
      ...prev,
      research: {
        ...prev.research,
        points: prev.research.points - node.cost,
        activeResearch: {
          nodeId,
          progress: 0,
          startedAt: Date.now()
        }
      }
    }));
    
    return true;
  }, [state.research]);

  const progressResearch = useCallback((progressAmount: number = 1) => {
    setState(prev => {
      if (!prev.research.activeResearch) return prev;
      
      const { RESEARCH_TREE } = require('@/data/research');
      const node = RESEARCH_TREE.find((n: any) => n.id === prev.research.activeResearch?.nodeId);
      if (!node) return prev;
      
      const newProgress = prev.research.activeResearch.progress + progressAmount;
      
      if (newProgress >= 100) {
        // Research complete!
        return {
          ...prev,
          research: {
            ...prev.research,
            completedResearch: [...prev.research.completedResearch, node.id],
            activeResearch: null
          }
        };
      }
      
      return {
        ...prev,
        research: {
          ...prev.research,
          activeResearch: {
            ...prev.research.activeResearch,
            progress: newProgress
          }
        }
      };
    });
  }, []);

  const cancelResearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      research: {
        ...prev.research,
        activeResearch: null
      }
    }));
  }, []);

  const getResearchBonuses = useCallback(() => {
    return calculateResearchBonuses(state.research.completedResearch);
  }, [state.research.completedResearch]);

  // Update plant terpene profile based on environment
  const updatePlantTerpenes = useCallback((slotIndex: number) => {
    setState(prev => {
      const plant = prev.slots[slotIndex];
      if (!plant) return prev;
      
      const strain = [...STRAINS, ...prev.breeding.customStrains].find(s => s.id === plant.strainId);
      if (!strain) return prev;
      
      const baseTerpenes = strain.terpeneProfile;
      const modifiedTerpenes = calculateTerpeneModifiers(
        baseTerpenes,
        plant.environment.temperature,
        plant.environment.humidity,
        prev.environment.lightCycle === 'flower' ? 80 : 70
      );
      
      const newSlots = [...prev.slots];
      newSlots[slotIndex] = {
        ...plant,
        modifiers: {
          ...plant.modifiers,
          terpeneProfile: modifiedTerpenes
        }
      };
      
      return { ...prev, slots: newSlots };
    });
  }, []);

  return {
    state,
    manualSave,
    resetGame,
    addNugs,
    spendNugs,
    addBuds,
    spendBuds,
    plantSeed,
    removePlant,
    updatePlant,
    recordHarvest,
    upgradeLevel,
    addSlot,
    generateTradeOffers,
    acceptTradeOffer,
    haggleTradeOffer,
    tradeWithDealer,
    createContract,
    claimQuestReward,
    recordWaterAction,
    recordPerfectWater,
    triggerRandomEvent,
    tickEvent,
    startCuring,
    processCuringTick,
    rushCuring,
    breedStrains,
    createMotherPlant,
    adjustEnvironment,
    toggleLightCycle,
    buyEnvUpgrade,
    treatInfestation,
    checkForPests,
    applyEnhancer,
    applyTraining,
    driftEnvironmentValues,
    updateSettings,
    updateMarketData,
    getMarketPrice,
    addResearchPoints,
    startResearch,
    progressResearch,
    cancelResearch,
    getResearchBonuses,
    updatePlantTerpenes
  };
};
