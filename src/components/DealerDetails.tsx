import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { Dealer, DealerRelationship, getDealerTypeName, getQualityColor } from '@/data/dealers';
import { QualityTier } from '@/hooks/useGameState';
import { X, TrendingUp, Package, Coins, AlertTriangle, Heart, ArrowLeft } from 'lucide-react';

interface DealerDetailsProps {
  dealer: Dealer;
  relationship?: DealerRelationship;
  playerBuds: number;
  playerNugs: number;
  inventoryBatches: { quantity: number; qualityTier: QualityTier; qualityMultiplier: number }[];
  onTrade: (dealerId: string, quantity: number) => void;
  onContract: (dealerId: string, quantity: number, duration: number) => void;
  onClose: () => void;
}

export const DealerDetails = ({ 
  dealer, 
  relationship, 
  playerBuds, 
  playerNugs,
  inventoryBatches,
  onTrade, 
  onContract,
  onClose 
}: DealerDetailsProps) => {
  const [quantity, setQuantity] = useState(dealer.minQuantity);
  const [contractWeeks, setContractWeeks] = useState(2);

  const relationLevel = relationship?.relationshipLevel || 0;
  const loyaltyBonus = relationship?.loyaltyBonus || 0;
  const effectiveMultiplier = dealer.priceMultiplier + loyaltyBonus;

  // Calculate available quality matching dealer requirement
  const qualityOrder: QualityTier[] = ['S', 'A', 'B', 'C'];
  const minQualityIndex = qualityOrder.indexOf(dealer.qualityRequirement);
  const availableBuds = inventoryBatches
    .filter(b => qualityOrder.indexOf(b.qualityTier) <= minQualityIndex)
    .reduce((sum, b) => sum + b.quantity, 0);

  // Calculate weighted quality multiplier for available inventory
  const weightedQuality = inventoryBatches
    .filter(b => qualityOrder.indexOf(b.qualityTier) <= minQualityIndex)
    .reduce((sum, b) => sum + b.quantity * b.qualityMultiplier, 0) / (availableBuds || 1);

  const baseRevenue = Math.floor(quantity * effectiveMultiplier * 3);
  const qualityRevenue = Math.floor(baseRevenue * weightedQuality);

  const canTrade = playerBuds >= quantity && quantity >= dealer.minQuantity && quantity <= dealer.maxQuantity && availableBuds >= quantity;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur z-50 overflow-y-auto p-4 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-5xl">{dealer.avatar}</div>
              <div>
                <h2 className="text-2xl font-bold">{dealer.name}</h2>
                <p className="text-muted-foreground">{getDealerTypeName(dealer.type)}</p>
                <p className="text-xs text-muted-foreground mt-1">{dealer.location}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <Separator className="my-4" />

          {/* Relationship Status */}
          {relationship && (
            <div className="mb-4 p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-primary text-primary" />
                  <span className="font-semibold">Beziehungslevel: {relationLevel}/10</span>
                </div>
                <Badge variant="outline" className="text-primary">
                  +{(loyaltyBonus * 100).toFixed(0)}% Bonus
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {relationship.totalDeals} erfolgreiche Deals
              </p>
            </div>
          )}

          {/* Dealer Info */}
          <div className="mb-4">
            <p className="text-sm mb-3">{dealer.description}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2 bg-muted/30 rounded">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Preis-Faktor</span>
                </div>
                <p className="font-bold text-accent">{effectiveMultiplier.toFixed(2)}x</p>
              </div>
              <div className="p-2 bg-muted/30 rounded">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Package className="w-4 h-4" />
                  <span>Qualität</span>
                </div>
                <p className={`font-bold ${getQualityColor(dealer.qualityRequirement)}`}>
                  {dealer.qualityRequirement}+ benötigt
                </p>
              </div>
              <div className="p-2 bg-muted/30 rounded">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Risiko</span>
                </div>
                <p className="font-bold text-warning">{dealer.riskLevel}%</p>
              </div>
              <div className="p-2 bg-muted/30 rounded">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Package className="w-4 h-4" />
                  <span>Verfügbar</span>
                </div>
                <p className="font-bold text-primary">{availableBuds} Buds</p>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Trade Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">Verkaufsmenge</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="quantity"
                  type="number"
                  min={dealer.minQuantity}
                  max={Math.min(dealer.maxQuantity, availableBuds)}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(dealer.minQuantity, parseInt(e.target.value) || dealer.minQuantity))}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={() => setQuantity(Math.min(dealer.maxQuantity, availableBuds))}
                >
                  Max
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Min: {dealer.minQuantity}, Max: {dealer.maxQuantity}
              </p>
            </div>

            {/* Revenue Preview */}
            <div className="p-3 bg-accent/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Basis-Ertrag:</span>
                <span className="font-semibold">{baseRevenue} Nugs</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Mit Qualität (Ø {weightedQuality.toFixed(2)}x):</span>
                <span className="font-bold text-accent">{qualityRevenue} Nugs</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-accent" />
                  <span className="font-bold">Gesamt-Ertrag:</span>
                </div>
                <span className="text-xl font-bold text-accent">{qualityRevenue} Nugs</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={() => onTrade(dealer.id, quantity)}
                disabled={!canTrade}
                className="flex-1"
              >
                {!canTrade && availableBuds < quantity && '❌ Zu wenig passende Buds'}
                {!canTrade && quantity < dealer.minQuantity && '❌ Zu wenig'}
                {!canTrade && quantity > dealer.maxQuantity && '❌ Zu viel'}
                {canTrade && '💰 Verkaufen'}
              </Button>
            </div>

            {/* Contract Option (for higher relationship levels) */}
            {relationLevel >= 3 && (
              <>
                <Separator className="my-4" />
                <div className="p-3 bg-primary/10 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    📜 Langzeit-Vertrag
                    <Badge variant="outline" className="text-xs">Level 3+</Badge>
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Verpflichte dich zu regelmäßigen Lieferungen für bessere Preise.
                  </p>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                      <Label htmlFor="weeks" className="text-xs">Wochen</Label>
                      <Input
                        id="weeks"
                        type="number"
                        min={2}
                        max={8}
                        value={contractWeeks}
                        onChange={(e) => setContractWeeks(parseInt(e.target.value) || 2)}
                      />
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => onContract(dealer.id, quantity, contractWeeks)}
                    disabled={!canTrade}
                  >
                    📋 Vertrag abschließen (+10% Bonus)
                  </Button>
                </div>
              </>
            )}
          </div>

          <Separator className="my-4" />

          <Button variant="ghost" onClick={onClose} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Übersicht
          </Button>
        </Card>
      </div>
    </div>
  );
};
