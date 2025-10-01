import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Scissors, Sparkles, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrimmingGameProps {
  budQuantity: number;
  baseQuality: number;
  onComplete: (qualityBonus: number) => void;
  onSkip: () => void;
}

interface TrimZone {
  id: number;
  x: number;
  y: number;
  size: number;
  trimmed: boolean;
  overTrimmed: boolean;
}

export const TrimmingGame = ({ budQuantity, baseQuality, onComplete, onSkip }: TrimmingGameProps) => {
  const [timeLeft, setTimeLeft] = useState(45); // 45 seconds
  const [trimZones, setTrimZones] = useState<TrimZone[]>([]);
  const [trimmedCount, setTrimmedCount] = useState(0);
  const [overTrimCount, setOverTrimCount] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  // Initialize trim zones
  useEffect(() => {
    const zones: TrimZone[] = [];
    const zoneCount = Math.min(20, 10 + Math.floor(budQuantity / 10));
    
    for (let i = 0; i < zoneCount; i++) {
      zones.push({
        id: i,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        size: 6 + Math.random() * 8,
        trimmed: false,
        overTrimmed: false
      });
    }
    setTrimZones(zones);
  }, [budQuantity]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      finishTrimming();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleZoneClick = (zoneId: number) => {
    setTrimZones(prev => prev.map(zone => {
      if (zone.id === zoneId) {
        if (zone.trimmed) {
          // Over-trimming!
          setOverTrimCount(c => c + 1);
          setAccuracy(acc => Math.max(0, acc - 5));
          return { ...zone, overTrimmed: true };
        } else {
          setTrimmedCount(c => c + 1);
          return { ...zone, trimmed: true };
        }
      }
      return zone;
    }));
  };

  const finishTrimming = () => {
    const totalZones = trimZones.length;
    const perfectTrimRate = trimmedCount / totalZones;
    const overTrimPenalty = (overTrimCount / totalZones) * 0.5;
    
    // Quality bonus calculation
    // Perfect trim (100% zones, no over-trim) = +30% quality
    // Good trim (70-99%) = +15-25%
    // Quick trim (50-69%) = +5-15%
    // Rushed (<50%) = 0-5%
    
    let qualityBonus = 0;
    if (perfectTrimRate >= 0.9 && overTrimCount === 0) {
      qualityBonus = 0.25 + (accuracy / 100) * 0.05; // Up to 30%
    } else if (perfectTrimRate >= 0.7) {
      qualityBonus = 0.15 + (perfectTrimRate - 0.7) * 0.3;
    } else if (perfectTrimRate >= 0.5) {
      qualityBonus = 0.05 + (perfectTrimRate - 0.5) * 0.25;
    } else {
      qualityBonus = perfectTrimRate * 0.1;
    }
    
    qualityBonus = Math.max(0, qualityBonus - overTrimPenalty);
    onComplete(qualityBonus);
  };

  const handleQuickTrim = () => {
    // Quick trim: auto-complete at 50% with small bonus
    onComplete(0.05);
  };

  const progressPercent = trimZones.length > 0 ? (trimmedCount / trimZones.length) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl p-6 space-y-4 animate-scale-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Trimming-Phase</h2>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-lg font-mono">{timeLeft}s</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Getrimmt: {trimmedCount}/{trimZones.length}</span>
            <span className={cn("font-semibold", overTrimCount > 0 && "text-destructive")}>
              Genauigkeit: {accuracy.toFixed(0)}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <p className="text-sm text-muted-foreground">
          Klicke auf die gelben Blätter, um sie zu entfernen. Klicke nicht zweimal auf dieselbe Stelle!
        </p>

        {/* Trimming Area */}
        <div className="relative w-full h-96 bg-gradient-to-b from-green-950/20 to-green-900/30 rounded-lg border-2 border-primary/30 overflow-hidden">
          {/* Bud visualization */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-green-600/40 rounded-full blur-xl animate-pulse" />
          </div>
          
          {/* Trim zones */}
          {trimZones.map(zone => (
            <button
              key={zone.id}
              onClick={() => handleZoneClick(zone.id)}
              disabled={zone.trimmed}
              className={cn(
                "absolute rounded-full transition-all cursor-pointer",
                "hover:scale-110 active:scale-90",
                zone.overTrimmed && "bg-red-500/60 cursor-not-allowed animate-pulse",
                zone.trimmed && !zone.overTrimmed && "bg-green-500/40 scale-0",
                !zone.trimmed && "bg-yellow-500/60 hover:bg-yellow-400/80 animate-subtle-bounce"
              )}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.size}%`,
                height: `${zone.size}%`,
                animationDelay: `${zone.id * 0.05}s`
              }}
            />
          ))}
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
            Überspringen (Kein Bonus)
          </Button>
          <Button
            onClick={finishTrimming}
            className="flex-1 bg-gradient-to-r from-primary to-primary/80"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Fertig
          </Button>
        </div>

        <div className="text-xs text-center text-muted-foreground">
          Tipp: Perfektes Trimming (alle Blätter entfernt, keine Fehler) gibt +30% Qualität!
        </div>
      </Card>
    </div>
  );
};
