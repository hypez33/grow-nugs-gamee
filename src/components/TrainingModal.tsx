import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TRAINING_TECHNIQUES, TrainingTechnique, AppliedTraining } from '@/data/training';
import { Scissors, TrendingUp, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrainingModalProps {
  open: boolean;
  onClose: () => void;
  currentPhase: number;
  nugs: number;
  appliedTrainings: AppliedTraining[];
  onApplyTraining: (techniqueId: string, success: number) => void;
}

export const TrainingModal = ({
  open,
  onClose,
  currentPhase,
  nugs,
  appliedTrainings,
  onApplyTraining
}: TrainingModalProps) => {
  const [selectedTechnique, setSelectedTechnique] = useState<TrainingTechnique | null>(null);
  const [minigameActive, setMinigameActive] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [sliderDir, setSliderDir] = useState(1);

  const availableTechniques = TRAINING_TECHNIQUES.filter(t => 
    t.availablePhases.includes(currentPhase)
  );

  const canApplyTechnique = (technique: TrainingTechnique): { can: boolean; reason?: string } => {
    if (nugs < technique.cost) {
      return { can: false, reason: 'Nicht genug Nugs' };
    }

    const alreadyApplied = appliedTrainings.find(at => at.techniqueId === technique.id);
    if (technique.oneTimeOnly && alreadyApplied) {
      return { can: false, reason: 'Bereits angewendet' };
    }

    const now = Date.now();
    if (alreadyApplied && (now - alreadyApplied.appliedAt) < technique.cooldownMs) {
      const remaining = Math.ceil((technique.cooldownMs - (now - alreadyApplied.appliedAt)) / 1000);
      return { can: false, reason: `Cooldown: ${remaining}s` };
    }

    return { can: true };
  };

  const startMinigame = (technique: TrainingTechnique) => {
    setSelectedTechnique(technique);
    setMinigameActive(true);
    setSliderPos(50);
    setSliderDir(1);

    // Animate slider (same speed as watering)
    const interval = setInterval(() => {
      setSliderPos(prev => {
        let next = prev + sliderDir * 2.5;
        if (next >= 98) {
          next = 98;
          setSliderDir(-1);
        }
        if (next <= 2) {
          next = 2;
          setSliderDir(1);
        }
        return next;
      });
    }, 20);

    // Store interval for cleanup
    (window as any).trainingInterval = interval;
  };

  const stopMinigame = () => {
    clearInterval((window as any).trainingInterval);
    
    if (!selectedTechnique) return;

    // Calculate success based on how close to center (50%) - same as watering
    const distance = Math.abs(sliderPos - 50);
    let successLevel = 1.0;
    
    if (distance <= 10) {
      successLevel = 1.0; // Perfect
    } else if (distance <= 20) {
      successLevel = 0.9; // Good
    } else if (distance <= 30) {
      successLevel = 0.75; // OK
    } else {
      successLevel = 0.6; // Passable
    }

    onApplyTraining(selectedTechnique.id, successLevel);
    setMinigameActive(false);
    setSelectedTechnique(null);
    onClose();
  };

  if (minigameActive && selectedTechnique) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedTechnique.icon}</span>
              {selectedTechnique.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Stoppe den Regler möglichst nah an der Mitte für maximalen Erfolg!
            </p>

            <div className="relative h-16 bg-muted/40 rounded-lg overflow-hidden">
              {/* Perfect zone - larger for easier gameplay */}
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-24 bg-green-500/20 border-x-2 border-green-500/40" />
              {/* Good zone */}
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-40 bg-yellow-500/10 border-x border-yellow-500/20" />
              
              {/* Slider */}
              <div
                className="absolute inset-y-0 w-2 bg-primary shadow-lg"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute inset-0 bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.7)]" />
              </div>
            </div>

            <Button
              onClick={stopMinigame}
              className="w-full"
              size="lg"
            >
              STOPP!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="w-5 h-5" />
            Training-Techniken
          </DialogTitle>
        </DialogHeader>

        {availableTechniques.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Keine Techniken in dieser Wachstumsphase verfügbar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableTechniques.map(technique => {
              const { can, reason } = canApplyTechnique(technique);
              const applied = appliedTrainings.find(at => at.techniqueId === technique.id);

              return (
                <Card
                  key={technique.id}
                  className={cn(
                    "p-4 transition-all hover:border-primary/50",
                    !can && "opacity-60"
                  )}
                >
                  <div className="flex gap-4">
                    <div className="text-4xl">{technique.icon}</div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {technique.name}
                            {applied && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {technique.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {technique.cost} Nugs
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="secondary" className="gap-1">
                          <TrendingUp className="w-3 h-3" />
                          +{((technique.yieldBonus - 1) * 100).toFixed(0)}% Ertrag
                        </Badge>
                        {technique.stressRisk > 0 && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {(technique.stressRisk * 100).toFixed(0)}% Stress-Risiko
                          </Badge>
                        )}
                        {technique.oneTimeOnly && (
                          <Badge variant="outline">
                            Einmalig
                          </Badge>
                        )}
                      </div>

                      <Button
                        onClick={() => startMinigame(technique)}
                        disabled={!can}
                        size="sm"
                        className="w-full"
                      >
                        {can ? 'Anwenden' : reason}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
