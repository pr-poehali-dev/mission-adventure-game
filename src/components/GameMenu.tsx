import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface GameMenuProps {
  onStartGame: () => void;
}

const GameMenu = ({ onStartGame }: GameMenuProps) => {
  return (
    <Card className="p-8 bg-slate-800/50 backdrop-blur border-cyan-500/30">
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">🤖</div>
        <h2 className="text-3xl font-bold text-cyan-400">Готов к приключению?</h2>
        <div className="space-y-3 text-left text-slate-300">
          <div className="flex items-center gap-3">
            <Icon name="Zap" className="text-yellow-400" />
            <span>Собирай монеты и кристаллы энергии</span>
          </div>
          <div className="flex items-center gap-3">
            <Icon name="Swords" className="text-red-400" />
            <span>Побеждай роботов и летающих врагов</span>
          </div>
          <div className="flex items-center gap-3">
            <Icon name="Crown" className="text-purple-400" />
            <span>Сражайся с эпическими боссами</span>
          </div>
        </div>
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <p className="font-semibold text-cyan-400 mb-2">Управление:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>← → или A D - движение</div>
            <div>↑ или W или Пробел - прыжок</div>
          </div>
        </div>
        <Button
          onClick={onStartGame}
          size="lg"
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold text-xl"
        >
          <Icon name="Rocket" className="mr-2" />
          Начать игру!
        </Button>
      </div>
    </Card>
  );
};

export default GameMenu;
