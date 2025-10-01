import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dealer, DealerRelationship, getDealerTypeColor, getDealerTypeName, getQualityColor } from '@/data/dealers';
import { Lock, TrendingUp, MapPin, Clock, AlertTriangle, Heart } from 'lucide-react';

interface DealerCardProps {
  dealer: Dealer;
  relationship?: DealerRelationship;
  playerReputation: number;
  isAvailable: boolean;
  onSelect: (dealerId: string) => void;
}

export const DealerCard = ({ dealer, relationship, playerReputation, isAvailable, onSelect }: DealerCardProps) => {
  const isUnlocked = playerReputation >= dealer.unlockReputation;
  const relationLevel = relationship?.relationshipLevel || 0;
  const loyaltyBonus = relationship?.loyaltyBonus || 0;
  const effectiveMultiplier = dealer.priceMultiplier + loyaltyBonus;
  
  const now = new Date().getHours();
  const isTimeAvailable = 
    dealer.availability.start <= dealer.availability.end
      ? now >= dealer.availability.start && now <= dealer.availability.end
      : now >= dealer.availability.start || now <= dealer.availability.end;
  
  const canTrade = isUnlocked && isTimeAvailable;

  console.log(`[Dealer] ${dealer.name}:`, {
    unlockReputation: dealer.unlockReputation,
    playerReputation,
    isUnlocked,
    isTimeAvailable,
    canTrade
  });

  return (
    <Card 
      className={`p-4 transition-all duration-300 ${
        canTrade 
          ? 'hover:scale-[1.02] hover:shadow-lg cursor-pointer border-primary/30' 
          : 'opacity-60 cursor-not-allowed'
      } animate-fade-in`}
      onClick={() => canTrade && onSelect(dealer.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{dealer.avatar}</div>
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              {dealer.name}
              {!isUnlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
            </h3>
            <p className={`text-sm ${getDealerTypeColor(dealer.type)}`}>
              {getDealerTypeName(dealer.type)}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className={getQualityColor(dealer.qualityRequirement)}>
            {dealer.qualityRequirement}+ Qualität
          </Badge>
          {relationLevel > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="w-3 h-3 fill-primary text-primary" />
              <span>Level {relationLevel}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-3">{dealer.description}</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-accent" />
          <span className="text-muted-foreground">Preis:</span>
          <span className="font-semibold">{effectiveMultiplier.toFixed(2)}x</span>
          {loyaltyBonus > 0 && <span className="text-primary text-[10px]">+{(loyaltyBonus * 100).toFixed(0)}%</span>}
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-sky-400" />
          <span className="text-muted-foreground truncate">{dealer.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">
            {dealer.availability.start}:00 - {dealer.availability.end}:00
          </span>
        </div>
        <div className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-warning" />
          <span className="text-muted-foreground">Risiko:</span>
          <span className="font-semibold">{dealer.riskLevel}%</span>
        </div>
      </div>

      {/* Quantity Range */}
      <div className="mb-3 p-2 bg-muted/30 rounded text-xs">
        <span className="text-muted-foreground">Menge: </span>
        <span className="font-semibold">{dealer.minQuantity} - {dealer.maxQuantity} Buds</span>
      </div>

      {/* Relationship Progress */}
      {relationship && relationship.relationshipLevel < 10 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Beziehung</span>
            <span className="text-primary">{relationship.totalDeals} Deals</span>
          </div>
          <Progress value={(relationLevel / 10) * 100} className="h-1" />
        </div>
      )}

      {/* Action Button */}
      <Button 
        onClick={() => canTrade && onSelect(dealer.id)}
        disabled={!canTrade}
        className="w-full"
        variant={canTrade ? "default" : "outline"}
      >
        {!isUnlocked && `🔒 Braucht ${dealer.unlockReputation} Rep`}
        {isUnlocked && !isTimeAvailable && '⏰ Nicht verfügbar'}
        {isUnlocked && isTimeAvailable && !isAvailable && '❌ Beschäftigt'}
        {canTrade && '💰 Handeln'}
      </Button>

      {/* Unlock Requirement */}
      {!isUnlocked && (
        <div className="mt-2 text-xs text-center text-muted-foreground">
          Reputation: {playerReputation} / {dealer.unlockReputation}
        </div>
      )}
    </Card>
  );
};
