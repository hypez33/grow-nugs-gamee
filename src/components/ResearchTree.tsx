import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RESEARCH_TREE, ResearchNode, ResearchCategory } from '@/data/research';
import { Microscope, Lightbulb, Sprout, CloudRain, Dna, Cog, Lock, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ResearchTreeProps {
  researchPoints: number;
  completedResearch: string[];
  activeResearch: { nodeId: string; progress: number; startedAt: number } | null;
  onStartResearch: (nodeId: string) => void;
  onCancelResearch: () => void;
}

const CATEGORY_INFO: Record<ResearchCategory, { icon: any; label: string; color: string }> = {
  lighting: { icon: Lightbulb, label: 'Beleuchtung', color: 'text-yellow-500' },
  nutrients: { icon: Sprout, label: 'Nährstoffe', color: 'text-green-500' },
  environment: { icon: CloudRain, label: 'Umwelt', color: 'text-blue-500' },
  genetics: { icon: Dna, label: 'Genetik', color: 'text-purple-500' },
  automation: { icon: Cog, label: 'Automatisierung', color: 'text-orange-500' },
};

export function ResearchTree({ 
  researchPoints, 
  completedResearch, 
  activeResearch,
  onStartResearch,
  onCancelResearch
}: ResearchTreeProps) {
  
  const isCompleted = (nodeId: string) => completedResearch.includes(nodeId);
  const isActive = (nodeId: string) => activeResearch?.nodeId === nodeId;
  
  const canResearch = (node: ResearchNode) => {
    if (isCompleted(node.id)) return false;
    if (isActive(node.id)) return false;
    if (activeResearch !== null) return false; // Can only research one at a time
    if (researchPoints < node.cost) return false;
    return node.prerequisites.every(prereq => isCompleted(prereq));
  };

  const getNodeStatus = (node: ResearchNode): 'locked' | 'available' | 'active' | 'completed' => {
    if (isCompleted(node.id)) return 'completed';
    if (isActive(node.id)) return 'active';
    if (!node.prerequisites.every(prereq => isCompleted(prereq))) return 'locked';
    return 'available';
  };

  const handleStartResearch = (node: ResearchNode) => {
    if (!canResearch(node)) {
      if (researchPoints < node.cost) {
        toast.error('Nicht genug Forschungspunkte!');
      } else if (activeResearch) {
        toast.error('Forschung bereits aktiv!');
      } else {
        toast.error('Voraussetzungen nicht erfüllt!');
      }
      return;
    }
    onStartResearch(node.id);
    toast.success(`Forschung gestartet: ${node.name}`);
  };

  const renderNode = (node: ResearchNode) => {
    const status = getNodeStatus(node);
    const Icon = CATEGORY_INFO[node.category].icon;
    
    return (
      <Card 
        key={node.id}
        className={`p-4 transition-all hover:shadow-lg ${
          status === 'completed' ? 'bg-primary/5 border-primary' :
          status === 'active' ? 'bg-accent/5 border-accent animate-pulse' :
          status === 'available' ? 'bg-card border-border hover:border-primary' :
          'bg-muted/20 border-muted opacity-60'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`text-4xl ${status === 'locked' ? 'grayscale' : ''}`}>
            {node.icon}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold flex items-center gap-2">
                  {node.name}
                  {status === 'completed' && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  {status === 'locked' && <Lock className="w-4 h-4 text-muted-foreground" />}
                  {status === 'active' && <Clock className="w-4 h-4 text-accent animate-spin" />}
                </h4>
                <p className="text-sm text-muted-foreground">{node.description}</p>
              </div>
              <Icon className={`w-5 h-5 ${CATEGORY_INFO[node.category].color}`} />
            </div>

            {/* Effects */}
            <div className="flex flex-wrap gap-1">
              {node.effects.map((effect, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {effect.type === 'yield_multiplier' && `+${((effect.value - 1) * 100).toFixed(0)}% Ertrag`}
                  {effect.type === 'time_reduction' && `-${(effect.value * 100).toFixed(0)}% Zeit`}
                  {effect.type === 'quality_boost' && `+${effect.value}% Qualität`}
                  {effect.type === 'terpene_boost' && `+${effect.value}% Terpene`}
                  {effect.type === 'cost_reduction' && `-${(effect.value * 100).toFixed(0)}% ${effect.target || 'Kosten'}`}
                  {effect.type === 'unlock_feature' && `🔓 ${effect.target}`}
                </Badge>
              ))}
            </div>

            {/* Prerequisites */}
            {node.prerequisites.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Benötigt: {node.prerequisites.map(prereq => {
                  const prereqNode = RESEARCH_TREE.find(n => n.id === prereq);
                  return prereqNode?.name;
                }).join(', ')}
              </div>
            )}

            {/* Progress or Action */}
            {status === 'active' && activeResearch && (
              <div className="space-y-2">
                <Progress value={activeResearch.progress} className="h-2" />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{activeResearch.progress.toFixed(0)}% abgeschlossen</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onCancelResearch}
                    className="h-6"
                  >
                    Abbrechen
                  </Button>
                </div>
              </div>
            )}

            {status === 'available' && (
              <Button 
                onClick={() => handleStartResearch(node)}
                disabled={!canResearch(node)}
                size="sm"
                className="w-full"
              >
                <Microscope className="w-4 h-4 mr-2" />
                Erforschen ({node.cost} RP)
              </Button>
            )}

            {status === 'completed' && (
              <div className="text-sm text-primary font-medium">
                ✓ Abgeschlossen
              </div>
            )}

            {status === 'locked' && (
              <div className="text-sm text-muted-foreground">
                Gesperrt - Erfülle die Voraussetzungen
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const categories: ResearchCategory[] = ['lighting', 'nutrients', 'environment', 'genetics', 'automation'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Microscope className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Forschungsbaum</h2>
              <p className="text-sm text-muted-foreground">
                Schalte neue Technologien frei, um deinen Grow zu optimieren
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{researchPoints}</div>
            <div className="text-sm text-muted-foreground">Forschungspunkte</div>
          </div>
        </div>
      </Card>

      {/* Research Progress */}
      {activeResearch && (
        <Card className="p-4 bg-accent/5 border-accent">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-accent animate-spin" />
            <div className="flex-1">
              <div className="font-bold">
                {RESEARCH_TREE.find(n => n.id === activeResearch.nodeId)?.name}
              </div>
              <Progress value={activeResearch.progress} className="mt-2 h-2" />
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {activeResearch.progress.toFixed(0)}%
            </div>
          </div>
        </Card>
      )}

      {/* Research by Category */}
      <Tabs defaultValue="lighting" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          {categories.map(cat => {
            const Icon = CATEGORY_INFO[cat].icon;
            return (
              <TabsTrigger key={cat} value={cat} className="text-xs md:text-sm">
                <Icon className={`w-4 h-4 mr-1 ${CATEGORY_INFO[cat].color}`} />
                <span className="hidden md:inline">{CATEGORY_INFO[cat].label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {RESEARCH_TREE
                .filter(node => node.category === category)
                .map(node => renderNode(node))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
