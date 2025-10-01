import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CustomStrain } from '@/data/breeding';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, TrendingUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreedingSuccessModalProps {
  strain: CustomStrain | null;
  open: boolean;
  onClose: () => void;
}

export const BreedingSuccessModal = ({ strain, open, onClose }: BreedingSuccessModalProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (open && strain) {
      setShowContent(false);
      // Delay content reveal for dramatic effect
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    }
  }, [open, strain]);

  useEffect(() => {
    if (open && strain) {
      // Create confetti particles
      const confettiCount = strain.mutation ? 150 : 80;
      const container = document.getElementById('confetti-container');
      if (!container) return;

      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-particle';
        
        // Random colors - more gold for mutations
        const colors = strain.mutation 
          ? ['hsl(45 85% 55%)', 'hsl(140 65% 45%)', 'hsl(45 100% 60%)', 'hsl(50 100% 50%)']
          : ['hsl(140 65% 45%)', 'hsl(120 65% 50%)', 'hsl(160 65% 40%)', 'hsl(45 85% 55%)'];
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Random starting position
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.animationDelay = `${Math.random() * 0.5}s`;
        confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
        
        // Random rotation
        confetti.style.setProperty('--rotation', `${Math.random() * 360}deg`);
        
        container.appendChild(confetti);
      }

      // Clean up confetti after animation
      const cleanup = setTimeout(() => {
        if (container) {
          container.innerHTML = '';
        }
      }, 4000);

      return () => {
        clearTimeout(cleanup);
        if (container) {
          container.innerHTML = '';
        }
      };
    }
  }, [open, strain]);

  if (!strain) return null;

  const hasMutation = !!strain.mutation;
  const mutationBonus = strain.mutation 
    ? (strain.mutation.type === 'speed' 
        ? (1 - strain.mutation.bonus) * 100 
        : (strain.mutation.bonus - 1) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-primary/30 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
        {/* Confetti Container */}
        <div id="confetti-container" className="absolute inset-0 pointer-events-none z-50 overflow-hidden" />
        
        {/* Mutation Extra Effect */}
        {hasMutation && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="mutation-burst" />
            <div className="mutation-glow" />
          </div>
        )}

        {/* Content */}
        <div className={cn(
          "relative z-10 transition-all duration-500",
          showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}>
          <div className="text-center space-y-6 py-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="text-4xl font-bold animate-scale-in">
                {hasMutation ? '🎊 MUTATION! 🎊' : '✨ Neue Züchtung! ✨'}
              </div>
              <h2 className="text-3xl font-bold text-primary animate-fade-in">
                {strain.name}
              </h2>
            </div>

            {/* Badges */}
            <div className="flex gap-2 justify-center flex-wrap animate-fade-in">
              <Badge 
                className={cn(
                  "text-sm px-4 py-1",
                  strain.rarity === 'legendary' && "bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse",
                  strain.rarity === 'epic' && "bg-gradient-to-r from-purple-500 to-pink-500",
                  strain.rarity === 'rare' && "bg-primary"
                )}
              >
                {strain.rarity.toUpperCase()}
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-1">
                Generation {strain.generation}
              </Badge>
            </div>

            {/* Mutation Details */}
            {hasMutation && strain.mutation && (
              <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 border-2 border-yellow-500/50 rounded-lg p-6 space-y-3 animate-scale-in mutation-card">
                <div className="text-2xl font-bold text-yellow-500 flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 animate-spin-slow" />
                  {strain.mutation.name}
                  <Sparkles className="w-6 h-6 animate-spin-slow" />
                </div>
                <div className="text-lg text-yellow-100">
                  {strain.mutation.description}
                </div>
                <div className="text-3xl font-black text-yellow-400 animate-pulse">
                  {strain.mutation.type === 'yield' && `+${mutationBonus.toFixed(0)}% ERTRAG!`}
                  {strain.mutation.type === 'quality' && `+${mutationBonus.toFixed(0)}% QUALITÄT!`}
                  {strain.mutation.type === 'speed' && `-${mutationBonus.toFixed(0)}% ZEIT!`}
                  {strain.mutation.type === 'super' && `+${mutationBonus.toFixed(0)}% ALLES!`}
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
              <div className="bg-card/50 backdrop-blur rounded-lg p-4 space-y-1 hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6 text-primary mx-auto" />
                <div className="text-2xl font-bold text-primary">{strain.baseYield}</div>
                <div className="text-xs text-muted-foreground">Ertrag</div>
              </div>
              
              <div className="bg-card/50 backdrop-blur rounded-lg p-4 space-y-1 hover:scale-105 transition-transform">
                <Clock className="w-6 h-6 text-accent mx-auto" />
                <div className="text-2xl font-bold text-accent">{strain.baseTimeMultiplier.toFixed(2)}x</div>
                <div className="text-xs text-muted-foreground">Zeit</div>
              </div>
              
              <div className="bg-card/50 backdrop-blur rounded-lg p-4 space-y-1 hover:scale-105 transition-transform">
                <Zap className="w-6 h-6 text-yellow-500 mx-auto" />
                <div className="text-2xl font-bold text-yellow-500">{strain.seedPrice}</div>
                <div className="text-xs text-muted-foreground">Preis</div>
              </div>
              
              <div className="bg-card/50 backdrop-blur rounded-lg p-4 space-y-1 hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6 text-primary mx-auto" />
                <div className="text-2xl font-bold text-primary">{strain.waterTolerance.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Toleranz</div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-muted/30 backdrop-blur rounded-lg p-4 animate-fade-in">
              <p className="text-sm text-muted-foreground">
                {strain.description}
              </p>
            </div>

            {/* Close hint */}
            <div className="text-xs text-muted-foreground animate-fade-in">
              Klicke irgendwo um zu schließen
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};