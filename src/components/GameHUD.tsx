import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface GameHUDProps {
  health: number;
  maxHealth: number;
  coins: number;
  score: number;
  level: 'city' | 'clouds' | 'boss';
}

const GameHUD = ({ health, maxHealth, coins, score, level }: GameHUDProps) => {
  return (
    <Card className="p-4 bg-slate-800/80 backdrop-blur border-cyan-500/30">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <Icon name="Heart" className="text-red-500" />
          <Progress value={(health / maxHealth) * 100} className="w-32" />
          <span className="text-white font-bold">{health}</span>
        </div>
        <div className="flex items-center gap-2 text-yellow-400 font-bold text-lg">
          <Icon name="Coins" />
          <span>{coins}</span>
        </div>
        <div className="flex items-center gap-2 text-purple-400 font-bold text-lg">
          <Icon name="Zap" />
          <span>{score}</span>
        </div>
        <div className="text-white font-bold">
          Уровень: {level === 'city' ? '🏙️ Город' : level === 'clouds' ? '☁️ Облака' : '👾 БОСС'}
        </div>
      </div>
    </Card>
  );
};

export default GameHUD;
