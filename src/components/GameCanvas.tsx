import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  isJumping: boolean;
  health: number;
  maxHealth: number;
}

interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  type: 'robot' | 'flying';
  health: number;
}

interface Collectible {
  x: number;
  y: number;
  type: 'coin' | 'crystal';
  collected: boolean;
}

interface Platform {
  x: number;
  y: number;
  width: number;
  type: 'solid' | 'cloud' | 'electric';
}

interface Boss {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  phase: number;
  attackCooldown: number;
}

interface GameCanvasProps {
  player: GameObject;
  enemies: Enemy[];
  collectibles: Collectible[];
  platforms: Platform[];
  boss: Boss | null;
  gameOver: boolean;
  victory: boolean;
  score: number;
  coins: number;
  onResetGame: () => void;
  canvasWidth: number;
  canvasHeight: number;
}

const GameCanvas = ({
  player,
  enemies,
  collectibles,
  platforms,
  boss,
  gameOver,
  victory,
  score,
  coins,
  onResetGame,
  canvasWidth,
  canvasHeight,
}: GameCanvasProps) => {
  return (
    <div
      className="relative bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg border-4 border-cyan-500/50 overflow-hidden"
      style={{ width: canvasWidth, height: canvasHeight }}
    >
      {platforms.map((platform, i) => (
        <div
          key={i}
          className={`absolute ${
            platform.type === 'solid'
              ? 'bg-gradient-to-r from-slate-600 to-slate-700 border-2 border-slate-500'
              : platform.type === 'cloud'
              ? 'bg-gradient-to-r from-blue-300/30 to-purple-300/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-full'
              : 'bg-gradient-to-r from-yellow-500 to-orange-500 border-2 border-yellow-400 animate-pulse'
          }`}
          style={{
            left: platform.x,
            top: platform.y,
            width: platform.width,
            height: 20,
          }}
        />
      ))}

      <div
        className="absolute bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-lg border-2 border-cyan-300 transition-all duration-75"
        style={{
          left: player.x,
          top: player.y,
          width: player.width,
          height: player.height,
        }}
      >
        <div className="text-2xl">🚀</div>
      </div>

      {enemies.map((enemy, i) => (
        <div
          key={i}
          className={`absolute ${
            enemy.type === 'robot'
              ? 'bg-gradient-to-r from-red-500 to-red-700 border-2 border-red-400'
              : 'bg-gradient-to-r from-purple-500 to-pink-600 border-2 border-purple-400 rounded-full'
          } transition-all duration-75`}
          style={{
            left: enemy.x,
            top: enemy.y,
            width: enemy.width,
            height: enemy.height,
          }}
        >
          <div className="text-2xl">{enemy.type === 'robot' ? '🤖' : '👾'}</div>
        </div>
      ))}

      {collectibles.map(
        (collectible, i) =>
          !collectible.collected && (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: collectible.x,
                top: collectible.y,
                width: 20,
                height: 20,
              }}
            >
              <div className="text-xl">
                {collectible.type === 'coin' ? '🪙' : '💎'}
              </div>
            </div>
          )
      )}

      {boss && (
        <>
          <div
            className="absolute bg-gradient-to-r from-purple-600 to-pink-600 border-4 border-purple-400 rounded-lg animate-pulse"
            style={{
              left: boss.x,
              top: boss.y,
              width: boss.width,
              height: boss.height,
            }}
          >
            <div className="text-5xl">👹</div>
          </div>
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-800/90 p-3 rounded-lg border-2 border-purple-500">
            <div className="text-purple-400 font-bold mb-1">МЕГА-БОСС</div>
            <Progress value={(boss.health / boss.maxHealth) * 100} className="w-64" />
          </div>
        </>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
          <Card className="p-8 bg-slate-800 border-red-500">
            <div className="text-center space-y-4">
              <div className="text-6xl">💥</div>
              <h2 className="text-3xl font-bold text-red-400">Игра окончена!</h2>
              <p className="text-slate-300">Набрано очков: {score}</p>
              <Button
                onClick={onResetGame}
                className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
              >
                Попробовать снова
              </Button>
            </div>
          </Card>
        </div>
      )}

      {victory && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
          <Card className="p-8 bg-slate-800 border-yellow-500">
            <div className="text-center space-y-4">
              <div className="text-6xl">🏆</div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                Победа!
              </h2>
              <p className="text-slate-300">Босс повержен! Набрано очков: {score}</p>
              <p className="text-cyan-400 font-bold">Монеты: {coins} 🪙</p>
              <Button
                onClick={onResetGame}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
              >
                <Icon name="Trophy" className="mr-2" />
                Играть снова
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
