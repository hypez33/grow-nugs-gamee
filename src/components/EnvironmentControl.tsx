import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Thermometer, Droplets, Zap, Sun, Moon, Wind } from 'lucide-react';
import { EnvironmentState, PHASE_OPTIMAL_ENV, ENV_UPGRADES } from '@/data/environment';
import { cn } from '@/lib/utils';

interface EnvironmentControlProps {
  environment: EnvironmentState;
  currentPhase: string;
  envUpgrades: Record<string, number>;
  nugs: number;
  onAdjust: (param: keyof EnvironmentState, value: number) => void;
  onBuyUpgrade: (upgradeId: string) => void;
  onToggleLightCycle: () => void;
}

export const EnvironmentControl = ({
  environment,
  currentPhase,
  envUpgrades,
  nugs,
  onAdjust,
  onBuyUpgrade,
  onToggleLightCycle
}: EnvironmentControlProps) => {
  const optimal = PHASE_OPTIMAL_ENV[currentPhase] || PHASE_OPTIMAL_ENV['veg'];

  const getStatus = (value: number, min: number, max: number): 'optimal' | 'warning' | 'danger' => {
    if (value >= min && value <= max) return 'optimal';
    const deviation = Math.max(Math.abs(value - min), Math.abs(value - max));
    return deviation > (max - min) * 0.3 ? 'danger' : 'warning';
  };

  const phStatus = getStatus(environment.ph, optimal.phMin, optimal.phMax);
  const ecStatus = getStatus(environment.ec, optimal.ecMin, optimal.ecMax);
  const humStatus = getStatus(environment.humidity, optimal.humidityMin, optimal.humidityMax);
  const tempStatus = getStatus(environment.temperature, optimal.tempMin, optimal.tempMax);

  const StatusBadge = ({ status }: { status: 'optimal' | 'warning' | 'danger' }) => (
    <Badge 
      variant={status === 'optimal' ? 'default' : 'destructive'}
      className={cn(
        "text-xs",
        status === 'optimal' && "bg-green-500/20 text-green-700 dark:text-green-300",
        status === 'warning' && "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300"
      )}
    >
      {status === 'optimal' ? '✓ Optimal' : status === 'warning' ? '⚠ Suboptimal' : '✗ Kritisch'}
    </Badge>
  );

  return (
    <div className="space-y-6">
      {/* Main Environment Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* pH Control */}
        <Card className="p-4 bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-400" />
                <span className="font-medium">pH-Wert</span>
              </div>
              <StatusBadge status={phStatus} />
            </div>
            
            <div className="text-2xl font-bold">{environment.ph.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">
              Optimal: {optimal.phMin.toFixed(1)} - {optimal.phMax.toFixed(1)}
            </div>
            
            <Slider
              value={[environment.ph]}
              min={5.0}
              max={7.5}
              step={0.1}
              onValueChange={([val]) => onAdjust('ph', val)}
              className={cn(
                phStatus === 'optimal' && "[&_[role=slider]]:bg-green-500",
                phStatus === 'warning' && "[&_[role=slider]]:bg-yellow-500",
                phStatus === 'danger' && "[&_[role=slider]]:bg-red-500"
              )}
            />
          </div>
        </Card>

        {/* EC Control */}
        <Card className="p-4 bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="font-medium">EC-Wert</span>
              </div>
              <StatusBadge status={ecStatus} />
            </div>
            
            <div className="text-2xl font-bold">{environment.ec.toFixed(1)} mS/cm</div>
            <div className="text-xs text-muted-foreground">
              Optimal: {optimal.ecMin.toFixed(1)} - {optimal.ecMax.toFixed(1)}
            </div>
            
            <Slider
              value={[environment.ec]}
              min={0.0}
              max={3.0}
              step={0.1}
              onValueChange={([val]) => onAdjust('ec', val)}
              className={cn(
                ecStatus === 'optimal' && "[&_[role=slider]]:bg-green-500",
                ecStatus === 'warning' && "[&_[role=slider]]:bg-yellow-500",
                ecStatus === 'danger' && "[&_[role=slider]]:bg-red-500"
              )}
            />
          </div>
        </Card>

        {/* Humidity Control */}
        <Card className="p-4 bg-gradient-to-br from-cyan-500/5 to-cyan-500/10 border-cyan-500/20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-cyan-400" />
                <span className="font-medium">Luftfeuchtigkeit</span>
              </div>
              <StatusBadge status={humStatus} />
            </div>
            
            <div className="text-2xl font-bold">{environment.humidity.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">
              Optimal: {optimal.humidityMin} - {optimal.humidityMax}%
            </div>
            
            <Slider
              value={[environment.humidity]}
              min={20}
              max={90}
              step={1}
              onValueChange={([val]) => onAdjust('humidity', val)}
              className={cn(
                humStatus === 'optimal' && "[&_[role=slider]]:bg-green-500",
                humStatus === 'warning' && "[&_[role=slider]]:bg-yellow-500",
                humStatus === 'danger' && "[&_[role=slider]]:bg-red-500"
              )}
            />
          </div>
        </Card>

        {/* Temperature Control */}
        <Card className="p-4 bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-500/20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-orange-400" />
                <span className="font-medium">Temperatur</span>
              </div>
              <StatusBadge status={tempStatus} />
            </div>
            
            <div className="text-2xl font-bold">{environment.temperature.toFixed(1)}°C</div>
            <div className="text-xs text-muted-foreground">
              Optimal: {optimal.tempMin} - {optimal.tempMax}°C
            </div>
            
            <Slider
              value={[environment.temperature]}
              min={15}
              max={35}
              step={0.5}
              onValueChange={([val]) => onAdjust('temperature', val)}
              className={cn(
                tempStatus === 'optimal' && "[&_[role=slider]]:bg-green-500",
                tempStatus === 'warning' && "[&_[role=slider]]:bg-yellow-500",
                tempStatus === 'danger' && "[&_[role=slider]]:bg-red-500"
              )}
            />
          </div>
        </Card>
      </div>

      {/* Light Cycle */}
      <Card className="p-4 bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border-yellow-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {environment.lightCycle === 'veg' ? (
              <Sun className="w-6 h-6 text-yellow-400 animate-pulse" />
            ) : (
              <Moon className="w-6 h-6 text-indigo-400" />
            )}
            <div>
              <div className="font-medium">Lichtzyklus</div>
              <div className="text-sm text-muted-foreground">
                {environment.lightCycle === 'veg' ? '18/6 (Wachstum)' : '12/12 (Blüte)'}
              </div>
            </div>
          </div>
          <Button onClick={onToggleLightCycle} variant="outline">
            Umschalten
          </Button>
        </div>
      </Card>

      {/* CO2 Level */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-primary" />
            <span className="font-medium">CO₂ Level</span>
          </div>
          <div className="text-2xl font-bold">{environment.co2Level.toFixed(0)} ppm</div>
          <Progress value={(environment.co2Level / 1500) * 100} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {environment.co2Level > 1000 ? '✓ Erhöhtes Wachstum' : 'Normal'}
          </div>
        </div>
      </Card>

      {/* Upgrades */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Umwelt-Upgrades</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ENV_UPGRADES.map(upgrade => {
            const owned = envUpgrades[upgrade.id] || 0;
            const canAfford = nugs >= upgrade.basePrice;
            
            return (
              <Card key={upgrade.id} className="p-4 hover:bg-accent/5 transition-all">
                <div className="space-y-3">
                  <div>
                    <div className="font-medium">{upgrade.name}</div>
                    <div className="text-xs text-muted-foreground">{upgrade.description}</div>
                  </div>
                  
                  {owned > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      ✓ Installiert
                    </Badge>
                  )}
                  
                  <Button 
                    size="sm" 
                    className="w-full"
                    disabled={owned > 0 || !canAfford}
                    onClick={() => onBuyUpgrade(upgrade.id)}
                  >
                    {owned > 0 ? 'Installiert' : `Kaufen (${upgrade.basePrice} Nugs)`}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
