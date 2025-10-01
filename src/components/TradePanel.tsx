import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { DealerCard } from './DealerCard';
import { DealerDetails } from './DealerDetails';
import { ReputationDisplay } from './ReputationDisplay';
import { DEALERS } from '@/data/dealers';
import { DealerRelationship } from '@/data/dealers';
import { QualityTier } from '@/hooks/useGameState';
import { Users, TrendingUp, FileText } from 'lucide-react';

export interface TradeOfferView {
  id: string;
  quantity: number;
  pricePerBud: number;
}

interface TradePanelProps {
  buds: number;
  nugs: number;
  offers: TradeOfferView[];
  nextRefreshAt: number;
  onRefresh: () => void;
  onAccept: (offerId: string) => void;
  onHaggle?: (offerId: string) => void;
  inventoryBatches?: { quantity: number; qualityTier: QualityTier; qualityMultiplier: number; }[];
  reputation: number;
  dealerRelationships: DealerRelationship[];
  activeContracts: any[];
  totalRevenue: number;
  onTradeWithDealer: (dealerId: string, quantity: number) => void;
  onCreateContract: (dealerId: string, quantity: number, duration: number) => void;
}

export const TradePanel = ({ 
  buds, 
  nugs, 
  offers, 
  nextRefreshAt, 
  onRefresh, 
  onAccept, 
  onHaggle, 
  inventoryBatches = [],
  reputation,
  dealerRelationships,
  activeContracts,
  totalRevenue,
  onTradeWithDealer,
  onCreateContract,
}: TradePanelProps) => {
  const [selectedDealer, setSelectedDealer] = useState<string | null>(null);

  const dealer = selectedDealer ? DEALERS.find(d => d.id === selectedDealer) : null;
  const dealerRel = dealerRelationships.find(r => r.dealerId === selectedDealer);

  const handleTrade = (dealerId: string, quantity: number) => {
    onTradeWithDealer(dealerId, quantity);
    setSelectedDealer(null);
  };

  const handleContract = (dealerId: string, quantity: number, duration: number) => {
    onCreateContract(dealerId, quantity, duration);
    setSelectedDealer(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Dealer Details Overlay */}
      {dealer && (
        <DealerDetails
          dealer={dealer}
          relationship={dealerRel}
          playerBuds={buds}
          playerNugs={nugs}
          inventoryBatches={inventoryBatches}
          onTrade={handleTrade}
          onContract={handleContract}
          onClose={() => setSelectedDealer(null)}
        />
      )}

      {/* Reputation Display */}
      <ReputationDisplay 
        reputation={reputation} 
        totalDeals={dealerRelationships.reduce((sum, r) => sum + r.totalDeals, 0)}
        totalRevenue={totalRevenue}
      />

      {/* Tabs for different trade sections */}
      <Tabs defaultValue="dealers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dealers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Dealer-Netzwerk
          </TabsTrigger>
          <TabsTrigger value="legacy" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Schnelle Deals
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Verträge ({activeContracts.length})
          </TabsTrigger>
        </TabsList>

        {/* Dealer Network Tab */}
        <TabsContent value="dealers" className="space-y-4">
          <div className="mb-4 p-3 bg-muted/20 rounded-lg text-sm">
            <p className="text-muted-foreground">
              💡 Tipp: Erhöhe deine Reputation durch erfolgreiche Deals, um mehr Dealer freizuschalten!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEALERS
              .sort((a, b) => a.unlockReputation - b.unlockReputation) // Sort by unlock reputation
              .map(dealer => {
                const relationship = dealerRelationships.find(r => r.dealerId === dealer.id);
                const isUnlocked = reputation >= dealer.unlockReputation;
                
                return (
                  <DealerCard
                    key={dealer.id}
                    dealer={dealer}
                    relationship={relationship}
                    playerReputation={reputation}
                    isAvailable={isUnlocked}
                    onSelect={setSelectedDealer}
                  />
                );
              })}
          </div>
        </TabsContent>

        {/* Legacy Quick Deals Tab */}
        <TabsContent value="legacy" className="space-y-4">
          <Card className="p-3 bg-muted/30">
            <p className="text-sm text-muted-foreground text-center">
              Anonyme Schnelldeals - keine Reputation, keine Beziehungen
            </p>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.map((offer) => {
              const tierCounts = inventoryBatches.reduce((acc, b) => {
                acc[b.qualityTier] = (acc[b.qualityTier] || 0) + b.quantity;
                return acc;
              }, {} as Record<QualityTier, number>);
              
              const total = Object.values(tierCounts).reduce((a,b)=>a+b,0) || 1;
              const previewMult = inventoryBatches.length > 0
                ? (inventoryBatches.reduce((acc,b)=> acc + b.quantity*b.qualityMultiplier, 0) / total)
                : 1;
              
              const revenue = Math.floor(offer.quantity * offer.pricePerBud);
              const eff = Math.floor(revenue * previewMult);
              const canSell = buds >= offer.quantity;
              
              return (
                <Card key={offer.id} className="p-4 transition-all hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">Anonyme Anfrage</h3>
                      <div className="text-sm text-muted-foreground">Einmaliger Deal</div>
                    </div>
                    <Badge variant="secondary">{offer.pricePerBud} / Bud</Badge>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Menge:</span>
                      <span className="font-semibold">{offer.quantity} Buds</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Ertrag:</span>
                      <span className="font-semibold text-accent">{eff} Nugs</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => onAccept(offer.id)} disabled={!canSell} size="sm">
                      {canSell ? 'Verkaufen' : 'Zu wenig'}
                    </Button>
                    <Button variant="outline" onClick={() => onHaggle?.(offer.id)} size="sm">
                      Verhandeln
                    </Button>
                  </div>
                </Card>
              );
            })}
            {offers.length === 0 && (
              <Card className="p-6 text-center text-sm text-muted-foreground col-span-2">
                Keine anonymen Angebote verfügbar.
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-4">
          {activeContracts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Keine aktiven Verträge. Erreiche Level 3 mit einem Dealer für Langzeit-Verträge!
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeContracts.map(contract => {
                const dealer = DEALERS.find(d => d.id === contract.dealerId);
                return (
                  <Card key={contract.id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl">{dealer?.avatar}</div>
                      <div>
                        <h4 className="font-semibold">{dealer?.name}</h4>
                        <p className="text-xs text-muted-foreground">{contract.deliverySchedule}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fortschritt:</span>
                        <span>{contract.completedDeliveries}/{contract.totalDeliveries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pro Lieferung:</span>
                        <span>{contract.quantity} Buds</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Preis:</span>
                        <span className="text-accent">{contract.pricePerBud}/Bud</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradePanel;
