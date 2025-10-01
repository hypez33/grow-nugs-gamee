import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dna, Sparkles, Copy, Plus } from 'lucide-react';
import { STRAINS, Strain } from '@/data/strains';
import { PHENOTYPES, CLONE_COST, MOTHER_PLANT_COST, CustomStrain } from '@/data/breeding';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { BreedingSuccessModal } from './BreedingSuccessModal';

interface BreedingLabProps {
  nugs: number;
  motherPlants: any[];
  discoveredStrains: string[];
  customStrains: CustomStrain[];
  onBreed: (parent1: string, parent2: string) => void;
  onCreateMother: (strainId: string, phenotypeId?: string) => void;
  onClone: (motherId: string, slotIndex: number) => void;
  onPlant: (slotIndex: number) => void;
}

export const BreedingLab = ({ 
  nugs, 
  motherPlants, 
  discoveredStrains,
  customStrains,
  onBreed,
  onCreateMother,
  onClone,
  onPlant
}: BreedingLabProps) => {
  const [selectedParent1, setSelectedParent1] = useState<string | null>(null);
  const [selectedParent2, setSelectedParent2] = useState<string | null>(null);
  const [isBreeding, setIsBreeding] = useState(false);
  const [newStrain, setNewStrain] = useState<CustomStrain | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleBreed = () => {
    if (!selectedParent1 || !selectedParent2) return;
    setIsBreeding(true);
    setTimeout(() => {
      onBreed(selectedParent1, selectedParent2);
      
      // Get the newly created strain (last in customStrains array after a short delay)
      setTimeout(() => {
        const latestStrain = customStrains[customStrains.length - 1];
        if (latestStrain) {
          setNewStrain(latestStrain);
          setShowSuccessModal(true);
        }
      }, 100);
      
      setIsBreeding(false);
      setSelectedParent1(null);
      setSelectedParent2(null);
    }, 2000);
  };

  const availableStrains: (Strain | CustomStrain)[] = [
    ...STRAINS.filter(s => discoveredStrains.includes(s.id)),
    ...(customStrains || [])
  ];

  return (
    <>
      <BreedingSuccessModal 
        strain={newStrain}
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
      
      <div className="space-y-6">
      {/* Breeding Section */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 transition-all hover:shadow-lg animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10 transition-all hover:scale-110">
            <Dna className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold transition-colors hover:text-primary">Züchtungs-Labor</h3>
            <p className="text-sm text-muted-foreground">Kreuze Strains für neue Genetiken</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Parent 1 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Elternteil 1</label>
            <div className="grid grid-cols-2 gap-2">
               {availableStrains.map(strain => (
                <Button
                  key={strain.id}
                  size="sm"
                  variant={selectedParent1 === strain.id ? "default" : "outline"}
                  onClick={() => setSelectedParent1(strain.id)}
                  className={cn(
                    "transition-all text-xs",
                    selectedParent1 === strain.id && "ring-2 ring-primary"
                  )}
                >
                  <span className="truncate">{strain.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Plus Icon */}
          <div className="flex items-center justify-center">
            <div className={cn(
              "w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center transition-all",
              (selectedParent1 && selectedParent2) && "animate-pulse bg-primary/20"
            )}>
              <Plus className="w-6 h-6 text-primary" />
            </div>
          </div>

          {/* Parent 2 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Elternteil 2</label>
            <div className="grid grid-cols-2 gap-2">
              {availableStrains.map(strain => (
                <Button
                  key={strain.id}
                  size="sm"
                  variant={selectedParent2 === strain.id ? "default" : "outline"}
                  onClick={() => setSelectedParent2(strain.id)}
                  className={cn(
                    "transition-all text-xs",
                    selectedParent2 === strain.id && "ring-2 ring-primary"
                  )}
                >
                  <span className="truncate">{strain.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {isBreeding && (
          <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20 animate-fade-in">
            <div className="text-sm font-medium mb-2">Kreuzung läuft...</div>
            <Progress value={50} className="animate-pulse" />
          </div>
        )}

        <Button 
          onClick={handleBreed}
          disabled={!selectedParent1 || !selectedParent2 || isBreeding}
          className="w-full bg-gradient-to-r from-primary to-accent transition-all hover:scale-105 hover:shadow-lg"
        >
          <Sparkles className={`w-4 h-4 mr-2 ${isBreeding && 'animate-spin'}`} />
          {isBreeding ? "Züchtet..." : "Kreuzen"}
        </Button>

        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="text-xs font-medium mb-2">💡 Tipp:</div>
          <p className="text-xs text-muted-foreground">
            Kreuze beliebige Strains miteinander! Je höher die Generation, desto verrücktere Namen entstehen.
          </p>
        </div>
      </Card>

      {/* Mother Plants Section */}
      <Card className="p-6 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20 transition-all hover:shadow-lg animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-accent/10 transition-all hover:scale-110">
              <Copy className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-bold transition-colors hover:text-accent">Mutterpflanzen</h3>
              <p className="text-sm text-muted-foreground">Bewahre Elite-Genetiken</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toast.info("Wähle eine geerntete Pflanze mit guter Qualität")}
            className="transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Neue Mutter ({MOTHER_PLANT_COST} Nugs)
          </Button>
        </div>

        {motherPlants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Copy className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Noch keine Mutterpflanzen</p>
            <p className="text-xs mt-1">Erstelle eine aus deiner besten Ernte</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {motherPlants.map((mother) => {
              const strain = STRAINS.find(s => s.id === mother.strainId);
              const phenotype = mother.phenotypeId ? PHENOTYPES.find(p => p.id === mother.phenotypeId) : null;
              const progress = (mother.clonesTaken / mother.maxClones) * 100;
              
              return (
                <Card key={mother.id} className="p-4 bg-card hover:bg-accent/5 transition-all">
                  <div className="space-y-3">
                    <div>
                      <div className="font-bold">{strain?.name}</div>
                      {phenotype && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {phenotype.name}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Klone: {mother.clonesTaken}/{mother.maxClones}</span>
                      </div>
                      <Progress value={progress} className="h-1" />
                    </div>

                    <Button 
                      size="sm" 
                      className="w-full"
                      disabled={mother.clonesTaken >= mother.maxClones || nugs < CLONE_COST}
                      onClick={() => {
                        // Show slot selection
                        onPlant(0); // This would need proper implementation
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Klon nehmen ({CLONE_COST} Nugs)
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* Custom Strains Collection */}
      {customStrains && customStrains.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Sparkles className="w-6 h-6 text-accent animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Eigene Kreuzungen</h3>
              <p className="text-sm text-muted-foreground">Deine gezüchteten Strains</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customStrains.map(strain => (
              <Card 
                key={strain.id}
                className={cn(
                  "p-4 transition-all hover:scale-[1.02]",
                  strain.mutation && "ring-2 ring-yellow-500 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 animate-pulse"
                )}
              >
                <div className="space-y-2">
                  <div>
                    <div className="font-bold text-sm line-clamp-2">{strain.name}</div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          strain.rarity === 'legendary' && "text-yellow-500 border-yellow-500 animate-pulse",
                          strain.rarity === 'epic' && "text-accent border-accent",
                          strain.rarity === 'rare' && "text-primary border-primary"
                        )}
                      >
                        {strain.rarity}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Gen {strain.generation}
                      </Badge>
                    </div>
                  </div>

                  {strain.mutation && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xl">{strain.mutation.name.split(' ')[0]}</span>
                        <span className="text-xs font-bold text-yellow-500">MUTATION!</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {strain.mutation.description}
                      </div>
                      <div className="text-xs font-semibold text-yellow-500">
                        {strain.mutation.type === 'yield' && `+${((strain.mutation.bonus - 1) * 100).toFixed(0)}% Ertrag!`}
                        {strain.mutation.type === 'quality' && `+${((strain.mutation.bonus - 1) * 100).toFixed(0)}% Qualität!`}
                        {strain.mutation.type === 'speed' && `${((1 - strain.mutation.bonus) * 100).toFixed(0)}% schneller!`}
                        {strain.mutation.type === 'super' && `+${((strain.mutation.bonus - 1) * 100).toFixed(0)}% ALLES!`}
                      </div>
                    </div>
                  )}

                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ertrag:</span>
                      <span className="font-semibold">{strain.baseYield}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Preis:</span>
                      <span className="font-semibold">{strain.seedPrice} Nugs</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {strain.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Phenotypes Collection */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Entdeckte Phänotypen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PHENOTYPES.map(pheno => (
            <div 
              key={pheno.id}
              className={cn(
                "p-3 rounded-lg border-2 transition-all",
                pheno.rarity === 'legendary' && "border-accent bg-accent/5",
                pheno.rarity === 'rare' && "border-primary bg-primary/5",
                pheno.rarity === 'common' && "border-border bg-muted/30"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className={cn(
                  "w-4 h-4",
                  pheno.rarity === 'legendary' && "text-accent",
                  pheno.rarity === 'rare' && "text-primary",
                  pheno.rarity === 'common' && "text-muted-foreground"
                )} />
                <span className="font-medium text-sm">{pheno.name}</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                {pheno.bonuses.yieldBonus && (
                  <div>+{(pheno.bonuses.yieldBonus * 100).toFixed(0)}% Ertrag</div>
                )}
                {pheno.bonuses.qualityBonus && (
                  <div>+{(pheno.bonuses.qualityBonus * 100).toFixed(0)}% Qualität</div>
                )}
                {pheno.bonuses.speedBonus && (
                  <div>+{(pheno.bonuses.speedBonus * 100).toFixed(0)}% Geschwindigkeit</div>
                )}
                {pheno.bonuses.resistanceBonus && (
                  <div>+{(pheno.bonuses.resistanceBonus * 100).toFixed(0)}% Resistenz</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
      </div>
    </>
  );
};
