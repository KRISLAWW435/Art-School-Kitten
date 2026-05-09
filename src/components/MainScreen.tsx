import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../store/gameStore';
import { MessageCircle, Gamepad2, ShoppingBag, Zap, Coins, Volume2, VolumeX, Maximize, Minimize, Palette, Puzzle, RotateCcw, Smile, Fish, Heart } from 'lucide-react';
import { ChatModal } from './ChatModal';
import { ShopModal } from './ShopModal';
import { CatchMouseGame, DrawingGame, MemoryMatchGame } from './MiniGames';
import TutorialOverlay from './TutorialOverlay';
import { getAssetUrl } from '../utils/assets';

const bgImg = getAssetUrl('bg/bg1.webp');
const catImg = getAssetUrl('cat/cat.webp');
const purringCatImg = getAssetUrl('cat/%D0%BC%D1%83%D1%80%D1%87%D0%B0%D0%BD%D0%B8%D0%B5.webp');

function CircularProgress({ value, icon: Icon, colorClass, textClass, label, text, sizeClass = "w-16 h-16 md:w-20 md:h-20", radius = 28, strokeWidth = 4 }: { value: number, icon?: any, text?: React.ReactNode, colorClass: string, textClass: string, label: string, sizeClass?: string, radius?: number, strokeWidth?: number }) {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = Math.max(0, circumference - (value / 100) * circumference);
  const svgSize = radius * 2 + strokeWidth * 2;

  return (
    <div className="relative group flex items-center justify-center pointer-events-auto cursor-default">
      <div className={`${sizeClass} bg-white/95 backdrop-blur-sm rounded-full shadow-lg border-2 border-white flex items-center justify-center absolute z-0`} />
      <svg className={`${sizeClass} transform -rotate-90 relative z-10`} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        <circle cx={svgSize/2} cy={svgSize/2} r={radius} className="stroke-slate-100" strokeWidth={strokeWidth} fill="none" />
        <circle 
          cx={svgSize/2} cy={svgSize/2} r={radius} 
          className={`${colorClass} transition-all duration-500 ease-out`} 
          strokeWidth={strokeWidth} 
          fill="none" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round" 
        />
      </svg>
      <div className={`absolute z-20 flex items-center justify-center ${textClass}`}>
        {Icon && <Icon size={30} className={value > 20 ? "" : "opacity-40"} />}
        {text}
      </div>
    </div>
  );
}

export default function MainScreen() {
  const { profile, coins, stats, isSleeping, pet, initializeSession, updateStats, level, xp, soundEnabled, toggleSound, resetGame } = useGameStore();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [activeMinigame, setActiveMinigame] = useState<'mouse' | 'draw' | 'puzzle' | null>(null);
  const [isGameSelectorOpen, setIsGameSelectorOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [particles, setParticles] = useState<{id: number, x: number, y: number, randomX: number, randomY: number, size: number}[]>([]);
  const [isPurring, setIsPurring] = useState(false);
  const purrTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize the regular audio file
  useEffect(() => {
    const audio = new Audio('/bubble.mp3');
    audio.volume = 0.5;
    audio.preload = 'auto';
    audioRef.current = audio;
    
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Unlock audio for strict browsers
  useEffect(() => {
    const unlockAudio = () => {
      const audio = audioRef.current;
      if (audio && audio.paused) {
        audio.play().then(() => {
          audio.pause();
          audio.currentTime = 0;
        }).catch(() => {});
      }
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });
    
    return () => {
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };
  }, []);

  const playBubbleSound = () => {
    if (!soundEnabled || !audioRef.current) return;
    const audio = audioRef.current;
    audio.currentTime = 0;
    audio.play().catch(e => console.log('Audio play error:', e));
  };

  useEffect(() => {
     initializeSession();
     const interval = setInterval(() => {
         updateStats(1); // 1 minute passed
     }, 60000);
     return () => clearInterval(interval);
  }, [initializeSession, updateStats]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  const clickCountRef = useRef(0);

  const handleCatClick = () => {
    if (!isSleeping) {
      pet();
      clickCountRef.current++;
      
      // 🔈 Воспроизведение звука пузырька
      playBubbleSound();

      // Создаём только 2 сердечка
      const newParticles = [];
      const particleCount = 2;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: Date.now() + i + Math.random(),
          x: centerX,
          y: centerY,
          randomX: (Math.random() - 0.5) * 200,
          randomY: -(Math.random() * 150 + 50),
          size: Math.random() * 20 + 20
        });
      }
      
      setParticles(prev => [...prev, ...newParticles]);
      
      setIsPurring(true);
      if (purrTimeoutRef.current) clearTimeout(purrTimeoutRef.current);
      purrTimeoutRef.current = setTimeout(() => setIsPurring(false), 2000);

      // Bonus milestone
      if (clickCountRef.current % 20 === 0) {
         addCoins(10);
         addMessage({ sender: 'randy', text: 'Мррррр... Какой прекрасный массаж! +10 Рекоинов! 💰💖' });
         confetti({
             particleCount: 40,
             spread: 60,
             origin: { y: 0.6 },
             colors: ['#f472b6', '#fbbf24', '#ffffff']
         });
      }
    }
  };

  const getLevelTitle = () => {
    if (profile.ageGroup === '5-7' || profile.ageGroup === '8-10') {
      if (level < 3) return 'Маленький художник';
      if (level < 6) return 'Юный творец';
      return 'Мастер красок';
    } else {
      if (level < 3) return 'Стажёр';
      if (level < 6) return 'Младший дизайнер';
      if (level < 10) return 'Новичок в UI/UX';
      return 'Специалист';
    }
  };

  const xpNeeded = level * 100;
  const xpProgress = (xp / xpNeeded) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-[100dvh] w-full relative overflow-hidden bg-slate-100"
    >
      {/* Background container for the cat (Desktop: centered, Mobile: full) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700 bg-indigo-950"
        style={{ backgroundImage: `url("${bgImg}")` }}
      />

      {/* Main Layout Overlay */}
      <div className="relative z-10 w-full h-full overflow-hidden">
        
        {/* LEFT PANEL (Desktop: Left border, Mobile: Top) */}
        <div className="absolute top-0 left-0 right-0 lg:bottom-0 lg:right-auto lg:w-24 p-4 lg:p-6 lg:h-full pointer-events-none lg:bg-white/10 lg:backdrop-blur-md lg:border-r lg:border-white/20 flex flex-row lg:flex-col items-start lg:items-center justify-between lg:justify-start z-10">
          
          {/* Level Circle */}
          <div id="level-panel" className="pointer-events-auto lg:mt-0 mb-0 lg:mb-8">
            <CircularProgress 
               value={xpProgress} 
               text={<span className="font-extrabold text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-br from-fuchsia-400 to-purple-600 drop-shadow-sm">{level}</span>}
               colorClass="stroke-fuchsia-500" 
               textClass="hover:scale-110 transition-transform" 
               label="Level" 
               sizeClass="w-14 h-14 md:w-20 md:h-20"
               radius={22}
            />
          </div>

          {/* Desktop Left Stack: Coins, Shop, Sound, Fullscreen */}
          <div className="hidden lg:flex flex-col items-center gap-6 pointer-events-auto">
             {/* Coins Display */}
             <div id="coins-display" className="flex flex-col items-center gap-1 group">
                <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white overflow-hidden transition-transform group-hover:rotate-12">
                   <span className="font-black text-white text-lg drop-shadow-md">Р</span>
                </div>
                <div className="font-black text-white drop-shadow-md text-sm">{coins}</div>
             </div>

             {/* Shop Button */}
             <button 
               id="shop-button"
               onClick={() => setIsShopOpen(true)}
               className="w-14 h-14 bg-white/95 rounded-2xl flex items-center justify-center text-slate-600 shadow-lg hover:bg-white hover:text-indigo-500 transition-all hover:scale-110 active:scale-95 group"
             >
               <ShoppingBag size={28} />
             </button>

            {/* Sound Button */}
            <button 
              onClick={toggleSound}
              className="w-14 h-14 bg-white/95 rounded-2xl flex items-center justify-center text-slate-600 shadow-lg hover:bg-white transition-all hover:scale-110 active:scale-95"
            >
              {soundEnabled ? <Volume2 size={28} /> : <VolumeX size={28} className="text-slate-400" />}
            </button>

            {/* Fullscreen Button */}
            <button 
              onClick={toggleFullscreen}
              className="w-14 h-14 bg-white/95 rounded-2xl flex items-center justify-center text-slate-600 shadow-lg hover:bg-white transition-all hover:scale-110 active:scale-95"
            >
              {isFullscreen ? <Minimize size={28} /> : <Maximize size={28} />}
            </button>

            {/* Reset Button */}
            <button 
              onClick={() => {
                if (confirm('Вы уверены, что хотите сбросить игру? Весь прогресс будет удален!')) {
                  resetGame();
                }
              }}
              className="w-14 h-14 bg-white/95 rounded-2xl flex items-center justify-center text-red-400 shadow-lg hover:bg-red-50 transition-all hover:scale-110 active:scale-95"
              title="Сбросить игру"
            >
              <RotateCcw size={28} />
            </button>
          </div>

          {/* Mobile Top Right Corner (Larger buttons for mobile) */}
          <div className="lg:hidden flex flex-col items-end gap-3 pointer-events-auto">
             <div id="shop-panel-mobile" className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-white/50">
                <span className="font-bold text-slate-800 text-base">{coins}</span>
                <span className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-black text-white">Р</span>
                <button onClick={() => setIsShopOpen(true)} className="ml-1 text-slate-500 flex items-center justify-center"><ShoppingBag size={20}/></button>
             </div>
             <div className="flex flex-col gap-2">
                <button onClick={toggleSound} className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform">
                   {soundEnabled ? <Volume2 size={24}/> : <VolumeX size={24}/>}
                </button>
                <button onClick={toggleFullscreen} className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform">
                   <Maximize size={24}/>
                </button>
                <button 
                   onClick={() => {
                     if (confirm('Сбросить игру?')) {
                       resetGame();
                     }
                   }} 
                   className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform text-red-500"
                >
                   <RotateCcw size={24}/>
                </button>
             </div>
          </div>
        </div>

        {/* CENTER AREA (KITTEN) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 overflow-hidden z-30 pointer-events-none lg:px-24">
           <div 
              className="relative cursor-pointer group mt-32 lg:mt-48 max-h-full pointer-events-auto"
              onClick={handleCatClick}
           >
              <img 
                  src={(isPurring && !isSleeping) ? purringCatImg : catImg} 
                  alt="Randy the Kitten" 
                  className="w-[75vw] md:w-[400px] lg:w-[500px] xl:w-[550px] h-auto max-h-[50vh] md:max-h-full object-contain transition-transform duration-300 pointer-events-auto origin-bottom hover:scale-105"
                  style={{ 
                    filter: isSleeping ? 'brightness(0.7) sepia(0.3)' : 'drop-shadow(0 30px 40px rgba(0,0,0,0.3))',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                  }}
                  referrerPolicy="no-referrer"
                  draggable={false}
              />
              {isSleeping && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-white font-black text-4xl md:text-5xl font-mono animate-bounce drop-shadow-2xl">
                      Zzz...
                  </div>
              )}
           </div>
        </div>

        {/* RIGHT PANEL (Desktop: Right border, Mobile: Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 lg:top-0 lg:left-auto lg:w-24 p-3 lg:p-6 lg:h-full lg:bg-white/10 lg:backdrop-blur-md lg:border-l lg:border-white/20 pointer-events-none flex flex-row lg:flex-col items-center justify-between lg:justify-between z-20 pb-4 lg:pb-6">
          
          {/* Desktop Right Stack: Stats, MiniGames, Chat */}
          <div className="hidden lg:flex flex-col items-center gap-6 pointer-events-auto">
             <div id="stats-panel" className="flex flex-col items-center gap-6">
                <CircularProgress value={stats.mood} icon={Smile} colorClass="stroke-pink-400" textClass="text-pink-500" label="Mood" sizeClass="w-14 h-14" radius={24} />
                <CircularProgress value={stats.hunger} icon={Fish} colorClass="stroke-orange-400" textClass="text-orange-500" label="Hunger" sizeClass="w-14 h-14" radius={24} />
                <CircularProgress value={stats.energy} icon={Zap} colorClass="stroke-yellow-400" textClass="text-yellow-500" label="Energy" sizeClass="w-14 h-14" radius={24} />
             </div>
             
             <div className="h-px w-12 bg-white/20 my-2" />

             <button 
               id="games-button"
               onClick={() => setIsGameSelectorOpen(true)}
               className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg hover:bg-emerald-600 transition-all hover:scale-110 active:scale-95"
             >
               <Gamepad2 size={28} />
             </button>
             
             <button
               id="chat-button"
               onClick={() => setIsChatOpen(true)}
               className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-all hover:scale-110 active:scale-95"
             >
               <MessageCircle size={28} />
             </button>
          </div>

          {/* Mobile Bottom Row (Larger for mobile) */}
          <div className="lg:hidden flex flex-row items-center gap-3 md:gap-4 pointer-events-auto w-full justify-between pb-2">
             <div id="stats-panel-mobile" className="flex gap-2">
                <CircularProgress value={stats.mood} icon={Smile} colorClass="stroke-pink-400" textClass="text-pink-500" label="Mood" sizeClass="w-14 h-14" radius={22} />
                <CircularProgress value={stats.hunger} icon={Fish} colorClass="stroke-orange-400" textClass="text-orange-500" label="Hunger" sizeClass="w-14 h-14" radius={22} />
                <CircularProgress value={stats.energy} icon={Zap} colorClass="stroke-yellow-400" textClass="text-yellow-500" label="Energy" sizeClass="w-14 h-14" radius={22} />
             </div>
             
             <div className="flex gap-3">
                <button id="games-button-mobile" onClick={() => setIsGameSelectorOpen(true)} className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-transform"><Gamepad2 size={28}/></button>
                <button id="chat-button-mobile" onClick={() => setIsChatOpen(true)} className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-transform"><MessageCircle size={28}/></button>
             </div>
          </div>

        </div>

      </div>

      {/* Modals */}
      <AnimatePresence>
        {isChatOpen && (
          <ChatModal onClose={() => setIsChatOpen(false)} />
        )}
      </AnimatePresence>

      {isShopOpen && <ShopModal onClose={() => setIsShopOpen(false)} />}
      
      {/* Game Selector Modal */}
      <AnimatePresence>
        {isGameSelectorOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-xl relative border-4 border-emerald-400"
            >
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Выбери игру</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => { setActiveMinigame('mouse'); setIsGameSelectorOpen(false); }}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 transition-all hover:scale-105"
                >
                  <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Gamepad2 size={32} />
                  </div>
                  <span className="font-bold text-blue-900">Поймай мышку</span>
                </button>

                <button 
                  onClick={() => { setActiveMinigame('draw'); setIsGameSelectorOpen(false); }}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 transition-all hover:scale-105"
                >
                  <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Palette size={32} />
                  </div>
                  <span className="font-bold text-emerald-900">Рисование</span>
                </button>

                <button 
                  onClick={() => { setActiveMinigame('puzzle'); setIsGameSelectorOpen(false); }}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 transition-all hover:scale-105"
                >
                  <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Puzzle size={32} />
                  </div>
                  <span className="font-bold text-purple-900">Пары</span>
                </button>
              </div>
              <button 
                onClick={() => setIsGameSelectorOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <RotateCcw size={24} className="rotate-45" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {activeMinigame === 'mouse' && <CatchMouseGame onClose={() => setActiveMinigame(null)} />}
      {activeMinigame === 'draw' && <DrawingGame onClose={() => setActiveMinigame(null)} />}
      {activeMinigame === 'puzzle' && <MemoryMatchGame onClose={() => setActiveMinigame(null)} />}

      <TutorialOverlay />

      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, opacity: 1, scale: 0.5 }}
            animate={{ 
              x: p.x + p.randomX, 
              y: p.y + p.randomY, 
              opacity: 0, 
              scale: 1.5 
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            onAnimationComplete={() => setParticles(prev => prev.filter(particle => particle.id !== p.id))}
            className="fixed z-40 pointer-events-none drop-shadow-md select-none will-change-transform"
            style={{ 
              left: 0, 
              top: 0, 
              transformOrigin: 'center center'
            }}
          >
            <Heart size={p.size} fill="#ef4444" color="#ef4444" />
          </motion.div>
        ))}
      </AnimatePresence>

    </motion.div>
  );
}
