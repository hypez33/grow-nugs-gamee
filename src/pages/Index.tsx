import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGameState } from '@/hooks/useGameState';
import { UPGRADES, getUpgradePrice } from '@/data/upgrades';
import { ENV_UPGRADES } from '@/data/environment';
import { usePlantLogic } from '@/hooks/usePlantLogic';
import { PlantSlot } from '@/components/PlantSlot';
import { ShopModal } from '@/components/ShopModal';
import { ShopContent } from '@/components/ShopContent';
import { TradePanel } from '@/components/TradePanel';
import { CuringPanel } from '@/components/CuringPanel';
import { StatsPanel } from '@/components/StatsPanel';
import { BreedingLab } from '@/components/BreedingLab';
import { EnvironmentControl } from '@/components/EnvironmentControl';
import { PestControl } from '@/components/PestControl';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Sprout, ShoppingCart, Save, RotateCcw, TrendingUp, Settings, BadgeDollarSign, Leaf, ListChecks, PartyPopper, Dna, Droplets, Bug } from 'lucide-react';
import nugIcon from '@/assets/ui/nug-icon.png';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Index = () => {
  const {
    state,
    manualSave,
    resetGame,
    addNugs,
    addBuds,
    spendNugs,
    plantSeed,
    removePlant,
    updatePlant,
    recordHarvest,
    upgradeLevel,
    addSlot,
    generateTradeOffers,
    acceptTradeOffer,
    haggleTradeOffer,
    claimQuestReward,
    triggerRandomEvent,
    tickEvent,
    recordWaterAction,
    recordPerfectWater,
    startCuring,
    processCuringTick,
    rushCuring,
    breedStrains,
    createMotherPlant,
    adjustEnvironment,
    toggleLightCycle,
    buyEnvUpgrade,
    treatInfestation,
    checkForPests
  } = useGameState();

  const logic = usePlantLogic(state.upgrades, state.event?.effects?.growthMultiplier ?? 1);

  const [shopOpen, setShopOpen] = useState(false);
  const [plantingSlot, setPlantingSlot] = useState<number | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Ensure we have initial trade offers
  useEffect(() => {
    if (state.trade.offers.length === 0 && Date.now() >= state.trade.nextRefreshAt) {
      generateTradeOffers();
    }
  }, [state.trade.offers.length, state.trade.nextRefreshAt, generateTradeOffers]);

  // Events: expire and sometimes trigger new
  useEffect(() => {
    const t = setInterval(() => {
      tickEvent();
      processCuringTick();
    }, 1000);
    return () => clearInterval(t);
  }, [tickEvent, processCuringTick]);

  useEffect(() => {
    const t = setInterval(() => {
      if (!state.event && state.settings.randomEventsEnabled) {
        if (Math.random() < 0.2) {
          triggerRandomEvent();
        }
      }
    }, 30000);
    return () => clearInterval(t);
  }, [state.event, state.settings.randomEventsEnabled, triggerRandomEvent]);

  // Pest checks
  useEffect(() => {
    const t = setInterval(() => {
      checkForPests();
    }, 60000); // Check every minute
    return () => clearInterval(t);
  }, [checkForPests]);

  const handlePlantClick = (slotIndex: number) => {
    setPlantingSlot(slotIndex);
    setShopOpen(true);
  };

  const handleBuySeed = (strainId: string) => {
    if (plantingSlot === null) return;

    const strain = logic.getStrain(strainId);
    if (!strain) return;

    // For now, using 'basic' soil - could be extended to let user choose
    const soilType = 'basic';
    const soilCost = 0;
    const totalCost = strain.seedPrice + soilCost;

    if (spendNugs(totalCost)) {
      plantSeed(plantingSlot, strainId, soilType);
      setShopOpen(false);
      setPlantingSlot(null);
      toast.success(`${strain.name} gepflanzt!`, {
        description: `−${totalCost} Nugs`
      });
    } else {
      toast.error('Nicht genug Nugs!');
    }
  };

  const handleWater = (slotIndex: number, skillBonus: number = 0) => {
    const plant = state.slots[slotIndex];
    if (!plant) return;

    const action = logic.canWater(plant, state.nugs);
    if (!action.canPerform) {
      toast.error('Gießen nicht möglich', { description: action.reason });
      return;
    }
    const baseWindow = 2500;
    const windowMs = state.event?.id === 'festival' ? 4000 : state.event?.id === 'cosmic-alignment' ? 3500 : state.event?.id === 'mystic-fog' ? 1500 : baseWindow;

    const total = action.cooldownTotalMs ?? 15000;
    const readySince = Date.now() - (plant.modifiers.lastWaterTime + total);
    const isPerfect = readySince >= 0 && readySince <= windowMs;
    if (spendNugs(action.cost)) {
      const chainBonus = Math.min(0.03, Math.floor((state.stats?.waterChain || 0) / 3) * 0.01);
      const newModifiers = logic.applyWater(plant, isPerfect, skillBonus + chainBonus);
      updatePlant(slotIndex, { modifiers: newModifiers });
      recordWaterAction(1);
      recordPerfectWater(isPerfect);
      toast.success(isPerfect ? 'Perfektes Gießen!' : 'Pflanze gegossen', {
        description: `Qualität: ${(newModifiers.qualityMultiplier * 100).toFixed(0)}%`
      });
    }
  };

  const handleFertilize = (slotIndex: number) => {
    const plant = state.slots[slotIndex];
    if (!plant) return;

    const action = logic.canFertilize(plant, state.nugs);
    if (!action.canPerform) {
      toast.error('Düngen nicht möglich', { description: action.reason });
      return;
    }

    if (spendNugs(action.cost)) {
      const newModifiers = logic.applyFertilizer(plant);
      updatePlant(slotIndex, { modifiers: newModifiers });
      
      const qualityChange = newModifiers.qualityMultiplier - plant.modifiers.qualityMultiplier;
      if (qualityChange > 0) {
        toast.success('Dünger angewendet', {
          description: `Qualität erhöht! ${(newModifiers.qualityMultiplier * 100).toFixed(0)}%`
        });
      } else {
        toast.warning('Dünger angewendet', {
          description: 'Pflanze reagiert empfindlich...'
        });
      }
    }
  };

  const handleHarvest = (slotIndex: number) => {
    const plant = state.slots[slotIndex];
    if (!plant) return;

    const harvest = logic.calculateHarvest(plant);
    // send to curing with current quality score
    startCuring(harvest, plant.modifiers.qualityMultiplier);
    recordHarvest(harvest);
    removePlant(slotIndex);

    toast.success('Ernte abgeschlossen!', {
      description: `Batch in Trocknung: +${harvest} Buds`,
      duration: 5000
    });
  };

  const handleUpdate = (slotIndex: number, elapsed: number, phaseIndex: number) => {
    updatePlant(slotIndex, {
      elapsedInPhase: elapsed,
      phaseIndex
    });
  };

  const handleBuyUpgrade = (upgradeId: string) => {
    const upgrade = UPGRADES.find((u) => u.id === upgradeId);
    if (!upgrade) return;

    const currentLevel = state.upgrades[upgradeId] || 0;
    if (currentLevel >= upgrade.maxLevel) {
      toast.error('Maximales Level erreicht!');
      return;
    }

    const price = getUpgradePrice(upgrade.basePrice, currentLevel);
    
    if (spendNugs(price)) {
      upgradeLevel(upgradeId);
      
      // Special handling for slot upgrade
      if (upgrade.effectType === 'slot') {
        addSlot();
      }

      toast.success(`${upgrade.name} verbessert!`, {
        description: `Jetzt Level ${currentLevel + 1}`
      });
    } else {
      toast.error('Nicht genug Nugs!');
    }
  };

  const handleManualSave = () => {
    manualSave();
    toast.success('Spielstand gespeichert!');
  };

  const handleReset = () => {
    resetGame();
    setResetDialogOpen(false);
    toast.success('Spiel zurückgesetzt!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sprout className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Cannabis Grower
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg">
                <Leaf className="w-6 h-6 text-primary" />
                <span className="text-2xl font-bold text-primary">{state.buds}</span>
                <span className="text-sm text-muted-foreground">Buds</span>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg">
                <img src={nugIcon} alt="Nugs" className="w-6 h-6" />
                <span className="text-2xl font-bold text-accent">{state.nugs}</span>
                <span className="text-sm text-muted-foreground">Nugs</span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleManualSave}
                title="Manuell speichern"
              >
                <Save className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setResetDialogOpen(true)}
                title="Spiel zurücksetzen"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {state.event && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <PartyPopper className="w-6 h-6 text-primary" />
                <div>
                  <div className="font-bold">{state.event.name}</div>
                  <div className="text-sm text-muted-foreground">{state.event.description}</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                endet in {Math.max(0, Math.ceil((state.event.endsAt - Date.now()) / 1000))}s
              </div>
            </div>
          </Card>
        )}
        <Tabs defaultValue="farm" className="space-y-6">
          <TabsList className="grid w-full max-w-6xl mx-auto grid-cols-8 gap-1">
            <TabsTrigger value="farm" className="text-xs md:text-sm">
              <Sprout className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Farm</span>
            </TabsTrigger>
            <TabsTrigger value="shop" className="text-xs md:text-sm">
              <ShoppingCart className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Shop</span>
            </TabsTrigger>
            <TabsTrigger value="breeding" className="text-xs md:text-sm">
              <Dna className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Züchtung</span>
            </TabsTrigger>
            <TabsTrigger value="environment" className="text-xs md:text-sm">
              <Droplets className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Umwelt</span>
            </TabsTrigger>
            <TabsTrigger value="pests" className="text-xs md:text-sm">
              <Bug className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Schädlinge</span>
            </TabsTrigger>
            <TabsTrigger value="trade" className="text-xs md:text-sm">
              <BadgeDollarSign className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Handel</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs md:text-sm">
              <TrendingUp className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="quests" className="text-xs md:text-sm">
              <ListChecks className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Quests</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="farm" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.slots.map((plant, index) => (
                <PlantSlot
                  key={index}
                  plant={plant}
                  slotIndex={index}
                  nugs={state.nugs}
                  upgrades={state.upgrades}
                  onPlant={handlePlantClick}
                  onWater={handleWater}
                  onFertilize={handleFertilize}
                  onHarvest={handleHarvest}
                  onUpdate={handleUpdate}
                  perfectWindowMs={state.event?.id === 'festival' ? 4000 : state.event?.id === 'cosmic-alignment' ? 3500 : state.event?.id === 'mystic-fog' ? 1500 : 2500}
                />
              ))}
            </div>

            {state.slots.length < 6 && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Kaufe das "Smart-Tent Slot" Upgrade für mehr Pflanzenslots!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="shop">
            <div className="max-w-4xl mx-auto space-y-6">
              <ShopContent
                nugs={state.nugs}
                upgrades={state.upgrades}
                onBuySeed={handleBuySeed}
                onBuyUpgrade={handleBuyUpgrade}
              />
              <CuringPanel batches={state.curing?.batches || []} onRush={(id) => {
                const ok = rushCuring(id);
                if (ok) {
                  toast.warning('Batch schnellgereift', { description: 'Qualität leicht gesenkt' });
                }
              }} />
            </div>
          </TabsContent>

          <TabsContent value="breeding">
            <BreedingLab
              nugs={state.nugs}
              motherPlants={state.breeding.motherPlants}
              discoveredStrains={state.breeding.discoveredStrains}
              customStrains={state.breeding.customStrains}
              onBreed={(p1, p2) => {
                const success = breedStrains(p1, p2);
                toast[success ? 'success' : 'warning'](
                  success ? 'Neue Sorte entdeckt!' : 'Kreuzung fehlgeschlagen',
                  { description: success ? 'Check deine verfügbaren Strains' : 'Versuche es erneut' }
                );
              }}
              onCreateMother={createMotherPlant}
              onClone={(motherId, slotIdx) => toast.info('Klon-System coming soon')}
              onPlant={handlePlantClick}
            />
          </TabsContent>

          <TabsContent value="environment">
            <EnvironmentControl
              environment={state.environment}
              currentPhase="veg"
              envUpgrades={state.envUpgrades}
              nugs={state.nugs}
              onAdjust={adjustEnvironment}
              onBuyUpgrade={(id) => {
                const upgrade = ENV_UPGRADES.find(u => u.id === id);
                if (!upgrade) return;
                const ok = buyEnvUpgrade(id, upgrade.basePrice);
                if (ok) toast.success(`${upgrade.name} installiert!`);
                else toast.error('Nicht genug Nugs!');
              }}
              onToggleLightCycle={toggleLightCycle}
            />
          </TabsContent>

          <TabsContent value="pests">
            <PestControl
              infestations={state.pests.infestations}
              nugs={state.nugs}
              onTreat={(infId, treatId) => {
                const ok = treatInfestation(infId, treatId, 50);
                if (ok) toast.success('Behandlung erfolgreich!');
                else toast.error('Nicht genug Nugs!');
              }}
              onPreventiveTreatment={() => {
                if (spendNugs(100)) toast.success('Prophylaxe durchgeführt');
                else toast.error('Nicht genug Nugs!');
              }}
            />
          </TabsContent>

          <TabsContent value="stats">
            <div className="max-w-4xl mx-auto">
              <StatsPanel stats={state.stats} currentNugs={state.nugs} currentBuds={state.buds} />
            </div>
          </TabsContent>

          <TabsContent value="trade">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Verkaufe deine geernteten Buds und erhalte Nugs. Zu Beginn erscheinen kleinere Anfragen, später größere.
                </div>
                <TradePanel
                  buds={state.buds}
                  nugs={state.nugs}
                  offers={state.trade.offers}
                  nextRefreshAt={state.trade.nextRefreshAt}
                  inventoryBatches={state.inventory?.batches || []}
                  onRefresh={generateTradeOffers}
                  onAccept={(id) => {
                    const offer = state.trade.offers.find(o => o.id === id);
                    const ok = acceptTradeOffer(id);
                    if (!ok || !offer) return;
                    const revenue = Math.floor(offer.quantity * offer.pricePerBud);
                    toast.success('Verkauf abgeschlossen', {
                      description: `-${offer.quantity} Buds  +${revenue} Nugs`
                    });
                  }}
                  onHaggle={(id) => {
                    const success = haggleTradeOffer(id);
                    toast[success ? 'success' : 'warning'](success ? 'Erfolg!' : 'Oh nein...', {
                      description: success ? 'Preis erhoeht!' : 'Kaeufer ist abgesprungen.'
                    });
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quests">
            <div className="max-w-4xl mx-auto">
              <Card className="p-4 mb-4">
                <div className="font-semibold mb-2">Taegliche Quests</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {state.quests.map((q) => {
                    const pct = Math.min(100, Math.floor((q.progress / q.goal) * 100));
                    const done = q.progress >= q.goal;
                    return (
                      <Card key={q.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{q.description}</div>
                          <div className="text-xs text-muted-foreground">{q.progress}/{q.goal}</div>
                        </div>
                        <div className="mt-2 h-2 bg-muted rounded">
                          <div className="h-2 bg-primary rounded" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Belohnung: {q.reward.nugs ? `${q.reward.nugs} Nugs` : ''}{q.reward.nugs && q.reward.buds ? ' · ' : ''}{q.reward.buds ? `${q.reward.buds} Buds` : ''}
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button size="sm" disabled={!done || q.claimed} onClick={() => {
                            const ok = claimQuestReward(q.id);
                            if (ok) {
                              toast.success('Belohnung eingesammelt');
                            }
                          }}>
                            {q.claimed ? 'Eingesammelt' : (done ? 'Belohnung abholen' : 'In Arbeit')}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <ShopModal
        open={shopOpen}
        onClose={() => {
          setShopOpen(false);
          setPlantingSlot(null);
        }}
        nugs={state.nugs}
        upgrades={state.upgrades}
        onBuySeed={handleBuySeed}
        onBuyUpgrade={handleBuyUpgrade}
      />

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Spiel zurücksetzen?</AlertDialogTitle>
            <AlertDialogDescription>
              Dies löscht deinen gesamten Fortschritt und kann nicht rückgängig gemacht werden.
              Alle Pflanzen, Nugs und Upgrades gehen verloren.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive">
              Zurücksetzen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Auto-save indicator */}
      <div className="fixed bottom-4 right-4 text-xs text-muted-foreground bg-card/80 backdrop-blur px-3 py-2 rounded-full border border-border">
        Auto-Save alle 5s
      </div>
    </div>
  );
};

export default Index;


