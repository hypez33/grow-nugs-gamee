import { useState } from 'react';
import { HarvestingGame } from './HarvestingGame';

interface HarvestingGameWrapperProps {
  budQuantity: number;
  baseQuality: number;
  onComplete: (finalQuality: number) => void;
}

export const HarvestingGameWrapper = ({ budQuantity, baseQuality, onComplete }: HarvestingGameWrapperProps) => {
  const [showGame, setShowGame] = useState(true);

  const handleComplete = (qualityBonus: number) => {
    const finalQuality = baseQuality * (1 + qualityBonus);
    setShowGame(false);
    onComplete(finalQuality);
  };

  const handleSkip = () => {
    setShowGame(false);
    onComplete(baseQuality); // No bonus
  };

  if (!showGame) return null;

  return (
    <HarvestingGame
      budQuantity={budQuantity}
      baseQuality={baseQuality}
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
};
