import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scissors, Sparkles } from 'lucide-react';

interface TrimmingGameProps {
  budQuantity: number;
  baseQuality: number;
  onComplete: (qualityBonus: number) => void;
  onSkip: () => void;
}

export const TrimmingGame = ({ budQuantity, baseQuality, onComplete, onSkip }: TrimmingGameProps) => {
  const [slider, setSlider] = useState(0);
  const [dir, setDir] = useState(1);

  // Animate slider (same as watering minigame)
  useEffect(() => {
    const id = setInterval(() => {
      setSlider(prev => {
        let next = prev + dir * 2.5;
        if (next >= 98) { next = 98; setDir(-1); }
        if (next <= 2) { next = 2; setDir(1); }
        return next;
      });
    }, 20);
    return () => clearInterval(id);
  }, [dir]);

  const handleStop = () => {
    const diff = Math.abs(slider - 50);
    let qualityBonus = 0;
    
    // Same logic as watering but with higher rewards
    if (diff <= 10) {
      qualityBonus = 0.30; // Perfect: +30%
    } else if (diff <= 20) {
      qualityBonus = 0.20; // Good: +20%
    } else if (diff <= 30) {
      qualityBonus = 0.10; // OK: +10%
    } else {
      qualityBonus = 0.02; // Poor: +2%
    }
    
    onComplete(qualityBonus);
  };

  const handleQuickTrim = () => {
    onComplete(0.05); // Quick trim: +5%
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg p-6 space-y-4 animate-scale-in">
        <div className="flex items-center gap-2">
          <Scissors className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Trimming-Phase</h2>
        </div>

        <p className="text-sm text-muted-foreground">
          Stoppe den Regler möglichst nah an der Mitte für maximale Qualität!
        </p>

        {/* Trimming Slider - same as watering */}
        <div className="relative h-16 bg-muted/40 rounded-lg overflow-hidden">
          {/* Perfect zone */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-24 bg-green-500/20 border-x-2 border-green-500/40" />
          {/* Good zone */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-40 bg-yellow-500/10 border-x border-yellow-500/20" />
          
          {/* Slider */}
          <div
            className="absolute inset-y-0 w-2 bg-primary shadow-lg"
            style={{ left: `${slider}%` }}
          >
            <div className="absolute inset-0 bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.7)]" />
          </div>
        </div>

        {/* Bonus Preview */}
        <div className="text-center text-sm">
          <p className="text-muted-foreground mb-1">Mögliche Boni:</p>
          <div className="flex justify-center gap-4 text-xs">
            <span className="text-green-500">Perfekt: +30%</span>
            <span className="text-yellow-500">Gut: +20%</span>
            <span className="text-orange-500">OK: +10%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleQuickTrim}
            variant="outline"
            className="flex-1"
          >
            Quick Trim (+5%)
          </Button>
          <Button
            onClick={onSkip}
            variant="outline"
            className="flex-1"
          >
            Überspringen
          </Button>
          <Button
            onClick={handleStop}
            className="flex-1 bg-gradient-to-r from-primary to-primary/80"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            STOPP!
          </Button>
        </div>

        <div className="text-xs text-center text-muted-foreground">
          Tipp: Je näher an der Mitte, desto höher der Qualitätsbonus!
        </div>
      </Card>
    </div>
  );
};