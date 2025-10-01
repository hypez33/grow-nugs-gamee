import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Clock, Leaf, Zap } from 'lucide-react';

interface CuringBatchView {
  id: string;
  quantity: number;
  startedAt: number;
  durationMs: number;
  qualityScore: number;
}

export const CuringPanel = ({ batches, onRush }: { batches: CuringBatchView[]; onRush?: (id: string) => void }) => {
  if (!batches || batches.length === 0) return null;
  const now = Date.now();
  return (
    <Card className="p-4 bg-card/80 backdrop-blur border-border transition-all hover:border-primary/30 hover:shadow-lg animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-primary animate-pulse" />
        <div className="font-semibold">Trocknung / Curing</div>
      </div>
      <div className="space-y-3">
        {batches.map(b => {
          const elapsed = Math.max(0, now - b.startedAt);
          const pct = Math.min(100, Math.round((elapsed / b.durationMs) * 100));
          const remaining = Math.max(0, b.durationMs - elapsed);
          const mm = Math.floor(remaining / 60000);
          const ss = Math.floor((remaining % 60000)/1000).toString().padStart(2,'0');
          return (
            <div key={b.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center transition-all hover:scale-[1.02]">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Leaf className="w-4 h-4 transition-transform hover:rotate-12" />
                <span>{b.quantity} Buds</span>
              </div>
              <div className="md:col-span-2">
                <Progress value={pct} className="h-2 transition-all" />
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                  <span>{pct}%</span>
                  <span>~{mm}:{ss}</span>
                </div>
                {onRush && remaining > 0 && (
                  <div className="mt-2 text-right">
                    <Button size="sm" variant="outline" onClick={() => onRush(b.id)} className="transition-all hover:scale-105">
                      <Zap className="w-3 h-3 mr-1 animate-pulse" /> Schnellreifen (Qualitätsverlust)
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default CuringPanel;
