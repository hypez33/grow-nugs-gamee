import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bug, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';
import { PESTS, TREATMENTS } from '@/data/pests';
import { cn } from '@/lib/utils';

interface PestInfestation {
  id: string;
  pestId: string;
  slotIndex: number;
  severity: number;
  treated: boolean;
}

interface PestControlProps {
  infestations: PestInfestation[];
  nugs: number;
  onTreat: (infestationId: string, treatmentId: string) => void;
  onPreventiveTreatment: () => void;
}

export const PestControl = ({
  infestations,
  nugs,
  onTreat,
  onPreventiveTreatment
}: PestControlProps) => {
  const activeInfestations = infestations.filter(i => !i.treated && i.severity > 0);
  const hasInfestations = activeInfestations.length > 0;

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {hasInfestations && (
        <Card className="p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30 animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
            <div>
              <div className="font-bold text-red-700 dark:text-red-400">
                Schädlingsbefall erkannt!
              </div>
              <div className="text-sm text-muted-foreground">
                {activeInfestations.length} Pflanze{activeInfestations.length > 1 ? 'n' : ''} betroffen
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Active Infestations */}
      {activeInfestations.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Bug className="w-5 h-5 text-red-500" />
            Aktive Befälle
          </h3>
          
          <div className="space-y-4">
            {activeInfestations.map(infestation => {
              const pest = PESTS.find(p => p.id === infestation.pestId);
              if (!pest) return null;
              
              const effectiveTreatments = TREATMENTS.filter(t => 
                t.targetPests.includes('all') || t.targetPests.includes(pest.id)
              );

              return (
                <Card 
                  key={infestation.id} 
                  className={cn(
                    "p-4 border-2 animate-fade-in",
                    pest.severity === 'high' && "border-red-500/50 bg-red-500/5",
                    pest.severity === 'medium' && "border-orange-500/50 bg-orange-500/5",
                    pest.severity === 'low' && "border-yellow-500/50 bg-yellow-500/5"
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          <Bug className={cn(
                            "w-5 h-5",
                            pest.severity === 'high' && "text-red-500",
                            pest.severity === 'medium' && "text-orange-500",
                            pest.severity === 'low' && "text-yellow-500"
                          )} />
                          {pest.name}
                        </div>
                        <div className="text-sm text-muted-foreground">{pest.description}</div>
                      </div>
                      <Badge 
                        variant="destructive"
                        className={cn(
                          pest.severity === 'high' && "bg-red-500/20 text-red-700 dark:text-red-400",
                          pest.severity === 'medium' && "bg-orange-500/20 text-orange-700 dark:text-orange-400",
                          pest.severity === 'low' && "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                        )}
                      >
                        {pest.severity === 'high' ? 'Kritisch' : pest.severity === 'medium' ? 'Mittel' : 'Schwach'}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Befallsstärke</span>
                        <span>{infestation.severity.toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={infestation.severity} 
                        className={cn(
                          "h-2",
                          pest.severity === 'high' && "[&>div]:bg-red-500",
                          pest.severity === 'medium' && "[&>div]:bg-orange-500",
                          pest.severity === 'low' && "[&>div]:bg-yellow-500"
                        )}
                      />
                    </div>

                    <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
                      Slot {infestation.slotIndex + 1} • Schaden: -{(pest.damagePerTick * 100).toFixed(1)}% Qualität/Tick
                    </div>

                    {/* Treatment Options */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {effectiveTreatments.map(treatment => {
                        const canAfford = nugs >= treatment.price;
                        return (
                          <Button
                            key={treatment.id}
                            size="sm"
                            variant="outline"
                            disabled={!canAfford}
                            onClick={() => onTreat(infestation.id, treatment.id)}
                            className="flex flex-col items-start h-auto py-2 hover:bg-green-500/10 hover:border-green-500/50"
                          >
                            <span className="text-xs font-medium">{treatment.name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {(treatment.effectiveness * 100).toFixed(0)}% • {treatment.price} Nugs
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      )}

      {/* Preventive Measures */}
      <Card className="p-6 bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
        <div className="flex items-center gap-3 mb-4">
          <ShieldAlert className="w-6 h-6 text-green-500" />
          <div>
            <h3 className="text-lg font-bold">Prävention</h3>
            <p className="text-sm text-muted-foreground">Vorbeugende Maßnahmen</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-start hover:bg-green-500/10 hover:border-green-500/50"
            onClick={onPreventiveTreatment}
            disabled={nugs < 100}
          >
            <Sparkles className="w-5 h-5 text-green-500 mb-2" />
            <span className="font-medium">Prophylaxe Behandlung</span>
            <span className="text-xs text-muted-foreground">100 Nugs • Reduziert Befallschance um 50%</span>
          </Button>

          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="font-medium mb-2">Tipps zur Vorbeugung:</div>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Optimale Luftfeuchtigkeit halten</li>
              <li>Regelmäßige Kontrolle</li>
              <li>Saubere Arbeitsumgebung</li>
              <li>Sticky Traps installieren</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Treatment Library */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Verfügbare Behandlungen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TREATMENTS.map(treatment => (
            <Card key={treatment.id} className="p-4 hover:bg-accent/5 transition-all">
              <div className="space-y-2">
                <div className="font-medium">{treatment.name}</div>
                <div className="text-xs text-muted-foreground">{treatment.description}</div>
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="secondary">
                    {(treatment.effectiveness * 100).toFixed(0)}% Wirkung
                  </Badge>
                  <span className="font-medium">{treatment.price} Nugs</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Wirkt gegen: {treatment.targetPests.includes('all') ? 'Alle' : treatment.targetPests.join(', ')}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Pest Encyclopedia */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Schädlinge-Lexikon</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PESTS.map(pest => (
            <Card key={pest.id} className="p-4 hover:bg-muted/30 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    {pest.name}
                  </div>
                  <Badge 
                    variant={pest.severity === 'high' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {pest.severity === 'high' ? 'Gefährlich' : pest.severity === 'medium' ? 'Mittel' : 'Harmlos'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">{pest.description}</div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                  <div>Ausbreitungsrate: {pest.spreadRate}/Tag</div>
                  <div>Schaden: -{(pest.damagePerTick * 100).toFixed(1)}%</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};
