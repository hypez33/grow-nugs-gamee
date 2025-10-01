import { Card } from '@/components/ui/card';
import { TrendingUp, Award, Coins, Activity, Leaf } from 'lucide-react';

interface StatsPanelProps {
  stats: {
    totalHarvests: number;
    bestHarvest: number; // buds
    totalNugsEarned: number;
    totalBudsHarvested: number;
    totalBudsSold: number;
    totalTrades: number;
  };
  currentNugs: number;
  currentBuds?: number;
}

export const StatsPanel = ({ stats, currentNugs, currentBuds = 0 }: StatsPanelProps) => {
  const avgHarvestBuds = stats.totalHarvests > 0
    ? Math.floor(stats.totalBudsHarvested / stats.totalHarvests)
    : 0;

  const statCards = [
    {
      label: 'Aktuelle Nugs',
      value: currentNugs,
      icon: Coins,
      color: 'text-accent'
    },
    {
      label: 'Aktuelle Buds',
      value: currentBuds,
      icon: Leaf,
      color: 'text-primary'
    },
    {
      label: 'Gesamt-Ernten',
      value: stats.totalHarvests,
      icon: Activity,
      color: 'text-primary'
    },
    {
      label: 'Beste Ernte (Buds)',
      value: stats.bestHarvest,
      icon: Award,
      color: 'text-accent'
    },
    {
      label: 'Ø Ernte (Buds)',
      value: avgHarvestBuds,
      icon: TrendingUp,
      color: 'text-primary'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.label} className="p-4 bg-card/80 backdrop-blur transition-all hover:scale-105 hover:shadow-lg hover:border-primary/50 animate-fade-in">
          <div className="flex items-center gap-3">
            <stat.icon className={`w-8 h-8 ${stat.color} transition-transform hover:scale-110 hover:rotate-12`} />
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </Card>
      ))}

      <Card className="col-span-2 md:col-span-4 p-4 bg-muted/30 transition-all hover:bg-muted/40 animate-fade-in">
        <h3 className="font-semibold mb-2">Gesamt-Statistiken</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="transition-all hover:scale-105">
            <p className="text-muted-foreground">Verdiente Nugs</p>
            <p className="font-bold text-lg">{stats.totalNugsEarned}</p>
          </div>
          <div className="transition-all hover:scale-105">
            <p className="text-muted-foreground">Geerntete Buds</p>
            <p className="font-bold text-lg">{stats.totalBudsHarvested}</p>
          </div>
          <div className="transition-all hover:scale-105">
            <p className="text-muted-foreground">Verkaufte Buds</p>
            <p className="font-bold text-lg">{stats.totalBudsSold}</p>
          </div>
          <div className="transition-all hover:scale-105">
            <p className="text-muted-foreground">Erfolgsrate</p>
            <p className="font-bold text-lg">{stats.totalHarvests > 0 ? '100%' : '0%'}</p>
          </div>
          <div className="transition-all hover:scale-105">
            <p className="text-muted-foreground">Trades</p>
            <p className="font-bold text-lg">{stats.totalTrades}</p>
          </div>
          <div className="transition-all hover:scale-105">
            <p className="text-muted-foreground">Status</p>
            <p className="font-bold text-lg text-primary animate-pulse">
              {currentNugs > 500 ? 'Pro Grower' : currentNugs > 200 ? 'Fortgeschritten' : 'Anfänger'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatsPanel;


