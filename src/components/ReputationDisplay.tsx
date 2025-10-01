import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Star, Award } from 'lucide-react';

interface ReputationDisplayProps {
  reputation: number;
  totalDeals: number;
  totalRevenue: number;
}

export const ReputationDisplay = ({ reputation, totalDeals, totalRevenue }: ReputationDisplayProps) => {
  const getReputationTier = (rep: number): { name: string; color: string; icon: string } => {
    if (rep >= 800) return { name: 'Legende', color: 'text-purple-400', icon: '👑' };
    if (rep >= 600) return { name: 'Kingpin', color: 'text-amber-400', icon: '💎' };
    if (rep >= 400) return { name: 'Boss', color: 'text-lime-400', icon: '⭐' };
    if (rep >= 200) return { name: 'Händler', color: 'text-sky-400', icon: '📈' };
    if (rep >= 100) return { name: 'Aufsteiger', color: 'text-emerald-400', icon: '🌱' };
    return { name: 'Neuling', color: 'text-zinc-400', icon: '🌿' };
  };

  const tier = getReputationTier(reputation);
  const nextTierThreshold = [100, 200, 400, 600, 800, 1000].find(t => t > reputation) || 1000;
  const prevTierThreshold = [0, 100, 200, 400, 600, 800].reverse().find(t => t <= reputation) || 0;
  const progressToNext = ((reputation - prevTierThreshold) / (nextTierThreshold - prevTierThreshold)) * 100;

  return (
    <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-primary/30 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{tier.icon}</div>
          <div>
            <h3 className="text-lg font-bold">Reputation</h3>
            <p className={`text-sm ${tier.color} font-semibold`}>{tier.name}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{reputation}</div>
          <p className="text-xs text-muted-foreground">/ 1000</p>
        </div>
      </div>

      {/* Progress to Next Tier */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Fortschritt</span>
          <span className="text-primary">Nächstes Level: {nextTierThreshold}</span>
        </div>
        <Progress value={Math.min(100, progressToNext)} className="h-2" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-muted/30 rounded">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy className="w-3 h-3 text-accent" />
          </div>
          <p className="text-xs text-muted-foreground">Deals</p>
          <p className="font-bold text-sm">{totalDeals}</p>
        </div>
        <div className="p-2 bg-muted/30 rounded">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">Umsatz</p>
          <p className="font-bold text-sm">{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="p-2 bg-muted/30 rounded">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-3 h-3 text-amber-400" />
          </div>
          <p className="text-xs text-muted-foreground">Rang</p>
          <p className="font-bold text-sm">
            {reputation >= 800 ? '#1' : reputation >= 600 ? '#2' : reputation >= 400 ? '#3' : '#4'}
          </p>
        </div>
      </div>

      {/* Reputation Benefits */}
      <div className="mt-4 p-2 bg-primary/10 rounded text-xs">
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-3 h-3 text-primary" />
          <span className="font-semibold">Vorteile:</span>
        </div>
        <ul className="text-muted-foreground space-y-1 ml-5 list-disc">
          {reputation >= 100 && <li>Zugang zu Mittelsmännern</li>}
          {reputation >= 200 && <li>Bessere Preise (+5%)</li>}
          {reputation >= 400 && <li>VIP-Käufer verfügbar</li>}
          {reputation >= 600 && <li>Exklusive Deals (+10%)</li>}
          {reputation >= 800 && <li>Maximale Rabatte (+15%)</li>}
          {reputation < 100 && <li className="text-muted-foreground/50">Schalte mehr frei...</li>}
        </ul>
      </div>
    </Card>
  );
};
