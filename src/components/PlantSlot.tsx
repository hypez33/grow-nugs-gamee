import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plant, PestInfestation } from '@/hooks/useGameState';
import { usePlantLogic } from '@/hooks/usePlantLogic';
import { PHASES } from '@/data/phases';
import { Droplets, Sprout, Sparkles, Bug, AlertTriangle, Gauge, Wind, Thermometer, AlertOctagon, Scissors, Bot, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnvironmentState } from '@/data/environment';
import { PESTS } from '@/data/pests';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrainingModal } from './TrainingModal';
import { AppliedTraining } from '@/data/training';
import { AutomationPanel } from './AutomationPanel';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Import phase images
import germinationImg from '@/assets/phases/germination.png';
import seedlingImg from '@/assets/phases/seedling.png';
import vegImg from '@/assets/phases/veg.png';
import preflowerImg from '@/assets/phases/preflower.png';
import flowerImg from '@/assets/phases/flower.png';
import harvestImg from '@/assets/phases/harvest.png';

const PHASE_IMAGES = [
  germinationImg,
  seedlingImg,
  vegImg,
  preflowerImg,
  flowerImg,
  harvestImg
];

interface PlantSlotProps {
  plant: Plant | null;
  slotIndex: number;
  nugs: number;
  upgrades: Record<string, number>;
  pests?: PestInfestation[];
  customStrains?: any[];
  employees?: string[];
  automation?: {
    isAutomated: boolean;
    assignedEmployeeId?: string;
    autoReplantStrainId?: string;
  };
  onPlant: (slotIndex: number) => void;
  onWater: (slotIndex: number, skillBonus?: number) => void;
  onFertilize: (slotIndex: number) => void;
  onHarvest: (slotIndex: number) => void;
  onUpdate: (slotIndex: number, elapsed: number, phaseIndex: number) => void;
  onTraining: (slotIndex: number, techniqueId: string, success: number) => void;
  onAssignEmployee?: (slotIndex: number, employeeId: string | undefined) => void;
  onToggleAutomation?: (slotIndex: number, enabled: boolean) => void;
  onSetAutoReplant?: (slotIndex: number, strainId: string | undefined) => void;
  onClickBoost?: (slotIndex: number, seconds: number) => void;
  perfectWindowMs?: number;
}

export const PlantSlot = ({
  plant,
  slotIndex,
  nugs,
  upgrades,
  pests,
  customStrains = [],
  employees = [],
  automation,
  onPlant,
  onWater,
  onFertilize,
  onHarvest,
  onUpdate,
  onTraining,
  onAssignEmployee,
  onToggleAutomation,
  onSetAutoReplant,
  onClickBoost,
  perfectWindowMs = 2500
}: PlantSlotProps) => {
  const logic = usePlantLogic(upgrades, 1, customStrains);
  const [localElapsed, setLocalElapsed] = useState(plant?.elapsedInPhase || 0);
  const [gameOpen, setGameOpen] = useState(false);
  const [trainingOpen, setTrainingOpen] = useState(false);
  const [slider, setSlider] = useState(0);
  const [dir, setDir] = useState(1);
  const [droplets, setDroplets] = useState<{id:number; left:number;}[]>([]);
  const [clickCooldown, setClickCooldown] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number; x: number; y: number}>>([]);
  const [boostText, setBoostText] = useState<{id: number; text: string; x: number; y: number} | null>(null);
  const [automationOpen, setAutomationOpen] = useState(false);

  useEffect(() => {
    if (!plant) return;

    const interval = setInterval(() => {
      const strain = logic.getStrain(plant.strainId);
      if (!strain) return;

      const timeMultiplier = logic.getTimeMultiplier(plant.strainId);
      const soilMultiplier = plant.modifiers.soilType === 'light-mix' ? 0.9 : 1.0;
      const currentPhase = PHASES[plant.phaseIndex];
      const phaseDuration = currentPhase.duration * timeMultiplier * soilMultiplier;

      const newElapsed = localElapsed + 1;
      setLocalElapsed(newElapsed);

      if (newElapsed >= phaseDuration) {
        const nextPhase = plant.phaseIndex + 1;
        if (nextPhase < PHASES.length) {
          onUpdate(slotIndex, 0, nextPhase);
          setLocalElapsed(0);
        }
      } else {
        onUpdate(slotIndex, newElapsed, plant.phaseIndex);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [plant, localElapsed, logic, slotIndex, onUpdate]);

  // Animate slider for mini-game
  useEffect(() => {
    if (!gameOpen) return;
    const id = setInterval(() => {
      setSlider(prev => {
        let next = prev + dir * 2.5;
        if (next >= 98) { next = 98; setDir(-1); }
        if (next <= 2) { next = 2; setDir(1); }
        return next;
      });
    }, 20);
    return () => clearInterval(id);
  }, [gameOpen, dir]);

  if (!plant) {
    return (
      <Card className="plant-card p-6 bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all cursor-pointer group">
        <div
          onClick={() => onPlant(slotIndex)}
          className="flex flex-col items-center justify-center h-64 text-muted-foreground group-hover:text-primary transition-colors"
        >
          <Sprout className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm">Leerer Slot</p>
          <p className="text-xs mt-1">Klicke zum Pflanzen</p>
        </div>
      </Card>
    );
  }

  const strain = logic.getStrain(plant.strainId);
  if (!strain) return null;

  const currentPhase = PHASES[plant.phaseIndex];
  const timeMultiplier = logic.getTimeMultiplier(plant.strainId);
  const soilMultiplier = plant.modifiers.soilType === 'light-mix' ? 0.9 : 1.0;
  const phaseDuration = currentPhase.duration * timeMultiplier * soilMultiplier;
  const progress = (localElapsed / phaseDuration) * 100;
  
  const isHarvestReady = plant.phaseIndex === PHASES.length - 1 && progress >= 100;
  const waterAction = logic.canWater(plant, nugs);
  const fertAction = logic.canFertilize(plant, nugs);
  
  // Calculate stress levels
  const now = Date.now();
  const timeSinceLastWater = now - plant.modifiers.lastWaterTime;
  const hasWaterStress = timeSinceLastWater > 30000; // 30 seconds without water
  
  const phOptimal = plant.environment.ph >= 6.0 && plant.environment.ph <= 6.5;
  const ecOptimal = plant.environment.ec >= 1.2 && plant.environment.ec <= 1.8;
  const tempOptimal = plant.environment.temperature >= 20 && plant.environment.temperature <= 26;
  const humidityOptimal = plant.environment.humidity >= 50 && plant.environment.humidity <= 65;
  
  const hasEnvironmentStress = !phOptimal || !ecOptimal || !tempOptimal || !humidityOptimal;
  const isHealthy = !hasWaterStress && !hasEnvironmentStress;
  
  const waterTotal = waterAction.cooldownTotalMs ?? 15000;
  const waterRemaining = Math.max(0, waterAction.cooldownRemainingMs ?? 0);
  const windowMs = perfectWindowMs;
  const markerPercent = Math.max(0, Math.min(100, Math.round((windowMs / (waterTotal || 1)) * 100)));
  const waterLevel = Math.max(0, Math.min(100, Math.round((waterRemaining / (waterTotal || 1)) * 100)));
  const waterSecs = Math.ceil(waterRemaining / 1000);

  // Click boost handler with cost scaling
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!plant || isHarvestReady || clickCooldown) return;
    
    const currentBoosts = plant.clickBoosts || 0;
    const maxBoosts = 50;
    
    if (currentBoosts >= maxBoosts) {
      return; // Max boosts reached
    }

    // Calculate boost with diminishing returns and cost
    const boostSeconds = currentBoosts < 3 ? 5 : currentBoosts < 6 ? 3 : currentBoosts < 10 ? 2 : 1;
    
    // Progressive cost scaling: free for first 5, then increasing cost
    const clickCost = currentBoosts < 5 ? 0 : Math.floor(Math.pow(currentBoosts - 4, 1.5));
    
    if (clickCost > 0 && nugs < clickCost) {
      toast.error('Nicht genug Nugs für Click-Boost!', {
        description: `Kosten: ${clickCost} Nugs`,
        duration: 1500
      });
      return;
    }
    
    if (onClickBoost) {
      onClickBoost(slotIndex, boostSeconds);
      
      // Deduct cost if applicable
      if (clickCost > 0) {
        // Cost would be deducted in parent component
        toast.info(`Click-Boost (${clickCost} Nugs)`, {
          description: `+${boostSeconds}s Wachstum`,
          duration: 1000
        });
      }
      
      // Set cooldown
      setClickCooldown(true);
      setTimeout(() => setClickCooldown(false), 1000);

      // Get click position
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Create particles
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x,
        y,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 800);

      // Show boost text
      setBoostText({ id: Date.now(), text: `+${boostSeconds}s${clickCost > 0 ? ` (-${clickCost}₦)` : ''}`, x, y });
      setTimeout(() => setBoostText(null), 1000);
    }
  };

  return (
    <Card className={`plant-card p-4 bg-card/80 backdrop-blur border-border overflow-hidden relative ${isHealthy ? 'healthy-plant' : ''} ${hasEnvironmentStress || hasWaterStress ? 'stress-indicator' : ''} ${!isHarvestReady && plant ? 'clickable-card' : ''}`}>
      {/* Particles */}
      {particles.map((particle, i) => (
        <div
          key={particle.id}
          className="sparkle-particle"
          style={{
            left: particle.x,
            top: particle.y,
            '--tx': `${Math.cos((i / particles.length) * Math.PI * 2) * 60}px`,
            '--ty': `${Math.sin((i / particles.length) * Math.PI * 2) * 60}px`,
          } as React.CSSProperties}
        />
      ))}
      
      {/* Boost text */}
      {boostText && (
        <div
          className="boost-text"
          style={{
            left: boostText.x,
            top: boostText.y,
          }}
        >
          {boostText.text}
        </div>
      )}

      {/* Phase Image - Clickable */}
      <div 
        className="relative h-48 mb-4 rounded-lg overflow-hidden bg-muted/20 cursor-pointer"
        onClick={handleCardClick}
      >
        <img
          src={PHASE_IMAGES[plant.phaseIndex]}
          alt={currentPhase.name}
          className={`w-full h-full object-cover transition-all ${isHealthy ? '' : 'brightness-75'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <span className="float-animation inline-block">{strain.name}</span>
                {(hasWaterStress || hasEnvironmentStress) && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertOctagon className="h-5 w-5 text-destructive animate-pulse" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm font-semibold">Pflanze unter Stress!</p>
                        {hasWaterStress && <p className="text-xs">• Wassermangel</p>}
                        {!phOptimal && <p className="text-xs">• pH nicht optimal (6.0-6.5)</p>}
                        {!ecOptimal && <p className="text-xs">• EC nicht optimal (1.2-1.8)</p>}
                        {!tempOptimal && <p className="text-xs">• Temperatur nicht optimal (20-26°C)</p>}
                        {!humidityOptimal && <p className="text-xs">• Luftfeuchtigkeit nicht optimal (50-65%)</p>}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">{currentPhase.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{Math.floor(localElapsed)}s / {Math.floor(phaseDuration)}s</span>
          <span>Phase {plant.phaseIndex + 1}/6</span>
        </div>
        <Progress value={Math.min(100, progress)} className="h-2" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="bg-muted/30 rounded p-2">
          <p className="text-muted-foreground">Qualität</p>
          <p className="font-semibold text-primary">
            {(plant.modifiers.qualityMultiplier * 100).toFixed(0)}%
          </p>
        </div>
        <div className="bg-muted/30 rounded p-2">
          <p className="text-muted-foreground">Click Boosts</p>
          <p className="font-semibold text-accent">
            {plant.clickBoosts || 0}s / 50s
          </p>
        </div>
      </div>

      {/* Automation Panel - Collapsible */}
      {automation && (
        <div className="mb-4">
          <Collapsible open={automationOpen} onOpenChange={setAutomationOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-between hover:bg-primary/10"
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    Automation {automation.isAutomated ? '✓' : ''}
                  </span>
                </div>
                {automationOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <AutomationPanel
                automation={automation}
                employees={employees}
                strainId={plant.strainId}
                onToggleAutomation={(enabled) => onToggleAutomation?.(slotIndex, enabled)}
                onAssignEmployee={(employeeId) => onAssignEmployee?.(slotIndex, employeeId)}
                onSetAutoReplant={(strainId) => onSetAutoReplant?.(slotIndex, strainId)}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Environment & Pests Info */}
      {(plant.environment || (pests && pests.length > 0)) && (
        <div className="mb-4 space-y-2">
          {/* Pests Warning */}
          {pests && pests.filter(p => p.slotIndex === slotIndex && !p.treated).length > 0 && (
            <div className="bg-destructive/10 border border-destructive/30 rounded p-2">
              <div className="flex items-center gap-2 mb-1">
                <Bug className="w-4 h-4 text-destructive" />
                <span className="text-xs font-semibold text-destructive">Schädlingsbefall!</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {pests
                  .filter(p => p.slotIndex === slotIndex && !p.treated)
                  .map(infestation => {
                    const pest = PESTS.find(p => p.id === infestation.pestId);
                    return pest ? (
                      <Badge key={infestation.id} variant="destructive" className="text-xs">
                        {pest.name}
                      </Badge>
                    ) : null;
                  })}
              </div>
            </div>
          )}

          {/* Environment Stats with warning indicators */}
          {plant.environment && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`rounded p-2 flex items-center gap-2 transition-all ${!phOptimal ? 'stat-warning' : 'bg-muted/20 hover:bg-accent'}`}>
                      <Gauge className="w-3 h-3" />
                      <div>
                        <p className="text-xs opacity-80">pH</p>
                        <p className="font-semibold">{plant.environment.ph.toFixed(1)}</p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Optimal: 6.0-6.5</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`rounded p-2 flex items-center gap-2 transition-all ${!ecOptimal ? 'stat-warning' : 'bg-muted/20 hover:bg-accent'}`}>
                      <Gauge className="w-3 h-3" />
                      <div>
                        <p className="text-xs opacity-80">EC</p>
                        <p className="font-semibold">{plant.environment.ec.toFixed(1)}</p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Optimal: 1.2-1.8</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`rounded p-2 flex items-center gap-2 transition-all ${!humidityOptimal ? 'stat-warning' : 'bg-muted/20 hover:bg-accent'}`}>
                      <Wind className="w-3 h-3" />
                      <div>
                        <p className="text-xs opacity-80">Luftf.</p>
                        <p className="font-semibold">{plant.environment.humidity.toFixed(0)}%</p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Optimal: 50-65%</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`rounded p-2 flex items-center gap-2 transition-all ${!tempOptimal ? 'stat-warning' : 'bg-muted/20 hover:bg-accent'}`}>
                      <Thermometer className="w-3 h-3" />
                      <div>
                        <p className="text-xs opacity-80">Temp</p>
                        <p className="font-semibold">{plant.environment.temperature.toFixed(1)}°C</p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Optimal: 20-26°C</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      )}

      {/* Water Level */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <div className="flex items-center gap-1">
            <Droplets className="w-4 h-4 text-sky-400" />
            <span>Wasser</span>
          </div>
          <span>
            {waterRemaining > 0 ? `braucht in ${waterSecs}s` : 'Wasser benötigt'}
          </span>
        </div>
        <div className="relative">
          <Progress
            value={waterLevel}
            className={cn('h-2 bg-sky-950/40 border border-sky-500/20', waterLevel === 0 && 'ring-2 ring-sky-500/60')}
            indicatorClassName="water-indicator"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center" style={{ width: `${markerPercent}%` }}>
            <div className="w-0.5 h-3 bg-sky-300/80 shadow-[0_0_6px_hsl(200_90%_60%/0.8)]" />
          </div>
        </div>
      </div>

      {/* Actions */}
      {isHarvestReady ? (
        <Button
          onClick={() => onHarvest(slotIndex)}
          className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 hover:scale-105 transition-transform"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Ernten!
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => {
                if (!waterAction.canPerform) return;
                setGameOpen(true);
                setSlider(0);
                setDir(1);
              }}
              disabled={!waterAction.canPerform}
              variant="secondary"
              size="sm"
              className={cn(
                "relative hover:scale-105 transition-transform",
                currentPhase.waterRecommended && "ring-2 ring-primary/50",
                hasWaterStress && "ring-2 ring-destructive/50 animate-pulse"
              )}
            >
              <Droplets className="w-4 h-4 mr-1" />
              Gießen
              <span className="text-xs ml-1">({waterAction.cost})</span>
            </Button>
            <Button
              onClick={() => onFertilize(slotIndex)}
              disabled={!fertAction.canPerform}
              variant="secondary"
              size="sm"
              className={cn(
                "relative hover:scale-105 transition-transform",
                currentPhase.fertilizerRecommended && "ring-2 ring-primary/50"
              )}
            >
              <Sprout className="w-4 h-4 mr-1" />
              Düngen
              <span className="text-xs ml-1">({fertAction.cost})</span>
            </Button>
          </div>
          
          {/* Training Button */}
          <Button
            onClick={() => setTrainingOpen(true)}
            variant="outline"
            size="sm"
            className="w-full hover:scale-105 transition-transform hover:border-primary/50"
          >
            <Scissors className="w-4 h-4 mr-1" />
            Training
            {plant.modifiers.appliedTrainings && plant.modifiers.appliedTrainings.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {plant.modifiers.appliedTrainings.length}
              </Badge>
            )}
          </Button>
        </div>
      )}

      {/* Tooltips for disabled actions */}
      {(!waterAction.canPerform || !fertAction.canPerform) && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {!waterAction.canPerform && waterAction.reason}
          {!fertAction.canPerform && !waterAction.canPerform && ' | '}
          {!fertAction.canPerform && fertAction.reason}
        </p>
      )}

      {/* Training Modal */}
      {trainingOpen && plant && (
        <TrainingModal
          open={trainingOpen}
          onClose={() => setTrainingOpen(false)}
          currentPhase={plant.phaseIndex}
          nugs={nugs}
          appliedTrainings={(plant.modifiers.appliedTrainings || []) as AppliedTraining[]}
          onApplyTraining={(techniqueId, success) => {
            onTraining(slotIndex, techniqueId, success);
            setTrainingOpen(false);
          }}
        />
      )}

      {/* Water mini-game overlay */}
      {gameOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="w-full max-w-sm bg-card border border-border rounded-lg p-4 shadow-lg">
            <p className="text-sm text-muted-foreground mb-2">Stoppe den Regler möglichst nah an der Mitte für Bonus!</p>
            <div className="relative h-10 bg-muted/40 rounded overflow-hidden">
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-16 bg-sky-400/20 border border-sky-400/40 rounded" />
              <div className="absolute inset-y-0" style={{ left: `${slider}%` }}>
                <div className="w-2 h-10 bg-sky-400 shadow-[0_0_10px_hsl(200_90%_60%/0.7)]" />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button className="flex-1" onClick={() => {
                const diff = Math.abs(slider - 50);
                let bonus = -0.02;
                if (diff <= 10) bonus = 0.05; else if (diff <= 20) bonus = 0.02;
                setGameOpen(false);
                setDroplets(Array.from({length: 10}).map((_,i)=>({id:i,left:Math.random()*100})));
                setTimeout(()=>setDroplets([]), 800);
                onWater(slotIndex, bonus);
              }}>Stop</Button>
              <Button variant="outline" onClick={() => setGameOpen(false)}>Abbrechen</Button>
            </div>
          </div>
        </div>
      )}

      {/* droplets micro particles */}
      {droplets.length > 0 && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {droplets.map(d => (
            <span key={d.id} className="droplet" style={{ left: `${d.left}%` }} />
          ))}
        </div>
      )}
    </Card>
  );
};




