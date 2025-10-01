// Balancing utilities for game systems

/**
 * Applies diminishing returns to stacked bonuses
 * Example: 0.5 + 0.5 = 0.75 instead of 1.0
 */
export function applyDiminishingReturns(bonuses: number[]): number {
  if (bonuses.length === 0) return 0;
  if (bonuses.length === 1) return bonuses[0];
  
  // Sort bonuses descending
  const sorted = [...bonuses].sort((a, b) => b - a);
  
  // First bonus at full value, each subsequent at reduced effectiveness
  let total = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const diminishFactor = Math.pow(0.7, i); // 70% effectiveness for each stack
    total += sorted[i] * diminishFactor;
  }
  
  return total;
}

/**
 * Caps quality multiplier to prevent extreme values
 */
export function clampQualityMultiplier(value: number): number {
  return Math.max(0.3, Math.min(3.0, value));
}

/**
 * Caps time multiplier to prevent instant or frozen growth
 */
export function clampTimeMultiplier(value: number): number {
  return Math.max(0.2, Math.min(2.0, value));
}

/**
 * Calculate logarithmic research points for high-tier strains
 * Prevents exponential scaling with extreme mutations
 */
export function calculateResearchPoints(basePoints: number, bonusMultiplier: number): number {
  // Use logarithmic scaling for bonuses above 2.0x
  if (bonusMultiplier > 2.0) {
    const excessBonus = bonusMultiplier - 2.0;
    const logBonus = Math.log(1 + excessBonus) / Math.log(2); // log2(1 + excess)
    return Math.round(basePoints * (2.0 + logBonus));
  }
  return Math.round(basePoints * bonusMultiplier);
}

/**
 * Calculate employee efficiency with specialization balance
 * Specialists are better at their specialty than generalists
 */
export function calculateEmployeeEfficiency(
  baseEfficiency: number,
  specialization: 'watering' | 'fertilizing' | 'harvesting' | 'all',
  taskType: 'watering' | 'fertilizing' | 'harvesting'
): number {
  if (specialization === taskType) {
    // Specialists get 20% bonus on their specialty
    return baseEfficiency * 1.2;
  }
  if (specialization === 'all') {
    // Generalists perform at base efficiency (no penalty)
    return baseEfficiency;
  }
  // Wrong specialization gets 30% penalty
  return baseEfficiency * 0.7;
}

/**
 * Calculate upgrade effectiveness with diminishing returns
 */
export function calculateUpgradeBonus(effectPerLevel: number, level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    // Each level is 15% less effective than the previous
    const diminish = Math.pow(0.85, i - 1);
    total += effectPerLevel * diminish;
  }
  return total;
}

/**
 * Calculate click boost cost with progressive scaling
 * Prevents infinite clicking by making it more expensive
 */
export function calculateClickBoostCost(currentClicks: number, plantValue: number): number {
  const baseCost = 5; // 5 Nugs base
  const scalingFactor = Math.floor(currentClicks / 10); // Every 10 clicks increases cost
  const valueFactor = Math.max(1, plantValue / 100); // More expensive for valuable plants
  
  return Math.round(baseCost * (1 + scalingFactor * 0.5) * valueFactor);
}

/**
 * Cap mutation bonuses to prevent game-breaking combinations
 */
export function capMutationBonus(bonus: number, type: 'yield' | 'quality' | 'speed' | 'super'): number {
  const caps = {
    yield: 3.0,   // Max 200% increase
    quality: 2.5, // Max 150% increase
    speed: 0.3,   // Max 70% faster
    super: 2.0    // Max 100% across all
  };
  
  return Math.min(bonus, caps[type]);
}
