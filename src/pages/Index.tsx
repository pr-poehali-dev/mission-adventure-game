import { useState, useEffect, useCallback } from 'react';
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

const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const MOVE_SPEED = 5;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [level, setLevel] = useState<'city' | 'clouds' | 'boss'>('city');
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);

  const [player, setPlayer] = useState<GameObject>({
    x: 100,
    y: 400,
    width: 40,
    height: 50,
    velocityY: 0,
    isJumping: false,
    health: 100,
    maxHealth: 100,
  });

  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [boss, setBoss] = useState<Boss | null>(null);
  const [keys, setKeys] = useState<Set<string>>(new Set());

  const initLevel = useCallback((levelType: 'city' | 'clouds' | 'boss') => {
    if (levelType === 'city') {
      setPlatforms([
        { x: 0, y: 500, width: 200, type: 'solid' },
        { x: 250, y: 450, width: 150, type: 'electric' },
        { x: 450, y: 400, width: 150, type: 'solid' },
        { x: 650, y: 350, width: 150, type: 'electric' },
        { x: 0, y: 580, width: CANVAS_WIDTH, type: 'solid' },
      ]);
      setEnemies([
        { x: 300, y: 420, width: 35, height: 40, velocityX: 2, type: 'robot', health: 30 },
        { x: 500, y: 370, width: 35, height: 40, velocityX: -2, type: 'robot', health: 30 },
        { x: 700, y: 320, width: 35, height: 40, velocityX: 2, type: 'robot', health: 30 },
      ]);
      setCollectibles([
        { x: 120, y: 470, type: 'coin', collected: false },
        { x: 320, y: 420, type: 'crystal', collected: false },
        { x: 520, y: 370, type: 'coin', collected: false },
        { x: 720, y: 320, type: 'crystal', collected: false },
      ]);
      setBoss(null);
    } else if (levelType === 'clouds') {
      setPlatforms([
        { x: 50, y: 500, width: 120, type: 'cloud' },
        { x: 220, y: 450, width: 120, type: 'cloud' },
        { x: 390, y: 400, width: 120, type: 'cloud' },
        { x: 560, y: 350, width: 120, type: 'cloud' },
        { x: 730, y: 300, width: 120, type: 'cloud' },
      ]);
      setEnemies([
        { x: 250, y: 350, width: 30, height: 30, velocityX: 1.5, type: 'flying', health: 20 },
        { x: 450, y: 300, width: 30, height: 30, velocityX: -1.5, type: 'flying', health: 20 },
        { x: 650, y: 250, width: 30, height: 30, velocityX: 1.5, type: 'flying', health: 20 },
      ]);
      setCollectibles([
        { x: 110, y: 470, type: 'coin', collected: false },
        { x: 280, y: 420, type: 'crystal', collected: false },
        { x: 450, y: 370, type: 'coin', collected: false },
        { x: 620, y: 320, type: 'crystal', collected: false },
        { x: 790, y: 270, type: 'coin', collected: false },
      ]);
      setBoss(null);
    } else if (levelType === 'boss') {
      setPlatforms([
        { x: 0, y: 550, width: CANVAS_WIDTH, type: 'solid' },
        { x: 100, y: 450, width: 100, type: 'cloud' },
        { x: 600, y: 450, width: 100, type: 'cloud' },
      ]);
      setEnemies([]);
      setCollectibles([]);
      setBoss({
        x: 600,
        y: 380,
        width: 80,
        height: 100,
        health: 200,
        maxHealth: 200,
        phase: 1,
        attackCooldown: 0,
      });
    }
  }, []);

  useEffect(() => {
    if (gameStarted) {
      initLevel(level);
    }
  }, [gameStarted, level, initLevel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key.toLowerCase()));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key.toLowerCase());
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!gameStarted || gameOver || victory) return;

    const gameLoop = setInterval(() => {
      setPlayer(prev => {
        let newX = prev.x;
        let newY = prev.y + prev.velocityY;
        let newVelocityY = prev.velocityY + GRAVITY;
        let newIsJumping = prev.isJumping;

        if (keys.has('a') || keys.has('arrowleft')) {
          newX = Math.max(0, newX - MOVE_SPEED);
        }
        if (keys.has('d') || keys.has('arrowright')) {
          newX = Math.min(CANVAS_WIDTH - prev.width, newX + MOVE_SPEED);
        }

        let onGround = false;
        platforms.forEach(platform => {
          if (
            newX + prev.width > platform.x &&
            newX < platform.x + platform.width &&
            newY + prev.height >= platform.y &&
            newY + prev.height <= platform.y + 20 &&
            prev.velocityY >= 0
          ) {
            newY = platform.y - prev.height;
            newVelocityY = 0;
            newIsJumping = false;
            onGround = true;

            if (platform.type === 'electric') {
              setPlayer(p => ({ ...p, health: Math.max(0, p.health - 5) }));
            }
          }
        });

        if ((keys.has('w') || keys.has(' ') || keys.has('arrowup')) && !newIsJumping && onGround) {
          newVelocityY = JUMP_FORCE;
          newIsJumping = true;
        }

        if (newY > CANVAS_HEIGHT) {
          setGameOver(true);
        }

        return {
          ...prev,
          x: newX,
          y: newY,
          velocityY: newVelocityY,
          isJumping: newIsJumping,
        };
      });

      setEnemies(prevEnemies =>
        prevEnemies.map(enemy => {
          let newX = enemy.x + enemy.velocityX;

          if (enemy.type === 'robot') {
            platforms.forEach(platform => {
              if (
                newX + enemy.width > platform.x + platform.width ||
                newX < platform.x
              ) {
                enemy.velocityX *= -1;
                newX = enemy.x;
              }
            });
          } else if (enemy.type === 'flying') {
            if (newX < 0 || newX + enemy.width > CANVAS_WIDTH) {
              enemy.velocityX *= -1;
              newX = enemy.x;
            }
          }

          const hitPlayer =
            player.x + player.width > newX &&
            player.x < newX + enemy.width &&
            player.y + player.height > enemy.y &&
            player.y < enemy.y + enemy.height;

          if (hitPlayer) {
            setPlayer(p => ({ ...p, health: Math.max(0, p.health - 1) }));
          }

          return { ...enemy, x: newX };
        })
      );

      setCollectibles(prevCollectibles =>
        prevCollectibles.map(collectible => {
          if (collectible.collected) return collectible;

          const collected =
            player.x + player.width > collectible.x &&
            player.x < collectible.x + 20 &&
            player.y + player.height > collectible.y &&
            player.y < collectible.y + 20;

          if (collected) {
            setScore(s => s + (collectible.type === 'coin' ? 10 : 50));
            if (collectible.type === 'coin') setCoins(c => c + 1);
          }

          return { ...collectible, collected };
        })
      );

      if (boss) {
        setBoss(prevBoss => {
          if (!prevBoss) return null;

          const newAttackCooldown = Math.max(0, prevBoss.attackCooldown - 1);

          const hitPlayer =
            player.x + player.width > prevBoss.x &&
            player.x < prevBoss.x + prevBoss.width &&
            player.y + player.height > prevBoss.y &&
            player.y < prevBoss.y + prevBoss.height;

          if (hitPlayer && newAttackCooldown === 0) {
            setPlayer(p => ({ ...p, health: Math.max(0, p.health - 10) }));
            return { ...prevBoss, attackCooldown: 30 };
          }

          if (keys.has(' ') && hitPlayer) {
            const newHealth = prevBoss.health - 5;
            if (newHealth <= 0) {
              setVictory(true);
            }
            return { ...prevBoss, health: Math.max(0, newHealth) };
          }

          return { ...prevBoss, attackCooldown: newAttackCooldown };
        });
      }

      if (player.health <= 0) {
        setGameOver(true);
      }

      if (level !== 'boss' && collectibles.every(c => c.collected)) {
        if (level === 'city') {
          setLevel('clouds');
        } else if (level === 'clouds') {
          setLevel('boss');
        }
      }
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, victory, keys, player, platforms, collectibles, boss, level]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setVictory(false);
    setScore(0);
    setCoins(0);
    setLevel('city');
    setPlayer({
      x: 100,
      y: 400,
      width: 40,
      height: 50,
      velocityY: 0,
      isJumping: false,
      health: 100,
      maxHealth: 100,
    });
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setVictory(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center mb-6">
        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          🚀 Космический Прыгун
        </h1>
        <p className="text-slate-300 text-lg">
          Путешествуй по футуристичным мирам и побеждай боссов!
        </p>
      </div>

      {!gameStarted ? (
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
              onClick={startGame}
              size="lg"
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold text-xl"
            >
              <Icon name="Rocket" className="mr-2" />
              Начать игру!
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-4 bg-slate-800/80 backdrop-blur border-cyan-500/30">
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                <Icon name="Heart" className="text-red-500" />
                <Progress value={(player.health / player.maxHealth) * 100} className="w-32" />
                <span className="text-white font-bold">{player.health}</span>
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

          <div className="relative bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg border-4 border-cyan-500/50 overflow-hidden" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
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
                      onClick={resetGame}
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
                      onClick={resetGame}
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
        </div>
      )}
    </div>
  );
};

export default Index;
