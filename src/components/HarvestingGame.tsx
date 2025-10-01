import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import nugImage from '@/assets/nug.png';

interface Bud {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  collected: boolean;
}

interface HarvestingGameProps {
  budQuantity: number;
  baseQuality: number;
  onComplete: (qualityBonus: number) => void;
  onSkip: () => void;
}

export const HarvestingGame = ({ budQuantity, baseQuality, onComplete, onSkip }: HarvestingGameProps) => {
  const targetBuds = Math.min(Math.ceil(budQuantity / 20), 30); // Max 30 buds to click
  const [buds, setBuds] = useState<Bud[]>([]);
  const [collected, setCollected] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Generate random buds
  useEffect(() => {
    const newBuds: Bud[] = [];
    for (let i = 0; i < targetBuds; i++) {
      newBuds.push({
        id: i,
        x: Math.random() * 80 + 10, // 10-90%
        y: Math.random() * 70 + 10, // 10-80%
        scale: Math.random() * 0.4 + 0.8, // 0.8-1.2
        rotation: Math.random() * 360,
        collected: false,
      });
    }
    setBuds(newBuds);
  }, [targetBuds]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      finishGame();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const finishGame = useCallback(() => {
    const percentage = collected / targetBuds;
    let qualityBonus = 0;

    if (percentage >= 0.95) qualityBonus = 0.35; // 35% bonus
    else if (percentage >= 0.85) qualityBonus = 0.25; // 25% bonus
    else if (percentage >= 0.70) qualityBonus = 0.15; // 15% bonus
    else if (percentage >= 0.50) qualityBonus = 0.08; // 8% bonus

    onComplete(qualityBonus);
  }, [collected, targetBuds, onComplete]);

  const handleBudClick = (budId: number, event: React.MouseEvent<HTMLDivElement>) => {
    const bud = buds.find(b => b.id === budId);
    if (!bud || bud.collected) return;

    // Mark as collected
    setBuds(prev => prev.map(b => 
      b.id === budId ? { ...b, collected: true } : b
    ));
    setCollected(prev => prev + 1);

    // Create particles
    const rect = event.currentTarget.getBoundingClientRect();
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }));
    setParticles(prev => [...prev, ...newParticles]);

    // Remove particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);

    // Check if all collected
    if (collected + 1 >= targetBuds) {
      setTimeout(() => finishGame(), 300);
    }
  };

  const handleQuickHarvest = () => {
    onComplete(0.05); // Quick harvest gives minimal bonus
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl h-[600px] bg-card border-2 border-primary rounded-lg shadow-2xl p-6">
        {/* Header */}
        <div className="absolute top-4 left-6 right-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-1">🌿 Ernte-Phase</h2>
            <p className="text-sm text-muted-foreground">Klicke die Buds so schnell wie möglich!</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{timeLeft}s</div>
            <div className="text-sm text-muted-foreground">{collected}/{targetBuds} gesammelt</div>
          </div>
        </div>

        {/* Game Area */}
        <div className="absolute inset-0 m-6 mt-20 mb-20 rounded-lg bg-gradient-to-br from-green-950/20 to-green-900/20 border border-primary/20 overflow-hidden">
          {/* Buds */}
          {buds.map(bud => (
            <div
              key={bud.id}
              onClick={(e) => handleBudClick(bud.id, e)}
              className={`absolute cursor-pointer transition-all duration-300 hover:scale-110 ${
                bud.collected ? 'scale-0 opacity-0' : 'animate-in zoom-in'
              }`}
              style={{
                left: `${bud.x}%`,
                top: `${bud.y}%`,
                transform: `translate(-50%, -50%) scale(${bud.scale}) rotate(${bud.rotation}deg)`,
                animation: bud.collected ? 'none' : 'float 3s ease-in-out infinite',
                animationDelay: `${bud.id * 0.1}s`,
              }}
            >
              <img 
                src={nugImage} 
                alt="Bud" 
                className="w-16 h-16 drop-shadow-lg filter hover:brightness-125 transition-all"
                draggable={false}
              />
              {!bud.collected && (
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
              )}
            </div>
          ))}

          {/* Particles */}
          {particles.map((particle, idx) => (
            <div
              key={particle.id}
              className="fixed w-2 h-2 bg-primary rounded-full pointer-events-none"
              style={{
                left: particle.x,
                top: particle.y,
                animation: `particle-burst 1s ease-out forwards`,
                animationDelay: `${idx * 0.05}s`,
                '--angle': `${idx * 45}deg`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Bottom UI */}
        <div className="absolute bottom-6 left-6 right-6 flex gap-3 justify-center">
          <Button
            onClick={handleQuickHarvest}
            variant="outline"
            size="lg"
            className="min-w-[150px]"
          >
            Schnell-Ernte (+5%)
          </Button>
          <Button
            onClick={() => onSkip()}
            variant="ghost"
            size="lg"
          >
            Überspringen
          </Button>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-24 left-6 right-6">
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-green-400 transition-all duration-300"
              style={{ width: `${(collected / targetBuds) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-10px); }
        }

        @keyframes particle-burst {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) 
                       translate(
                         calc(cos(var(--angle)) * 50px),
                         calc(sin(var(--angle)) * 50px)
                       ) 
                       scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
