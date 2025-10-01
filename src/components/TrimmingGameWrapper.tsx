import { useState } from 'react';
import { TrimmingGame } from './TrimmingGame';

interface TrimmingGameWrapperProps {
  budQuantity: number;
  baseQuality: number;
  onComplete: (finalQuality: number) => void;
}

export const TrimmingGameWrapper = ({ budQuantity, baseQuality, onComplete }: TrimmingGameWrapperProps) => {
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
    <TrimmingGame
      budQuantity={budQuantity}
      baseQuality={baseQuality}
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
};
