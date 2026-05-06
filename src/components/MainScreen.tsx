import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../store/gameStore';
import { MessageCircle, Gamepad2, ShoppingBag, Zap, Coins, Volume2, VolumeX, Maximize, Minimize, Smile, Fish, Star } from 'lucide-react';
import { ChatModal } from './ChatModal';
import { ShopModal } from './ShopModal';
import { CatchMouseGame } from './MiniGames';

const BASE_URL = import.meta.env.BASE_URL;
const bg1Img = `${BASE_URL}bg1.png`;
const cat1Img = `${BASE_URL}cat1.png`;

function CircularProgress({ value, icon: Icon, colorClass, textClass, label, text, sizeClass = "w-16 h-16 md:w-20 md:h-20", radius = 28, strokeWidth = 4, tooltipPosition = "bottom" }: { value: number, icon?: any, text?: React.ReactNode, colorClass: string, textClass: string, label: string, sizeClass?: string, radius?: number, strokeWidth?: number, tooltipPosition?: "top" | "bottom" }) {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = Math.max(0, circumference - (value / 100) * circumference);
  const svgSize = radius * 2 + strokeWidth * 2; // e.g. 56 + 8 = 64

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
      <div className={`absolute ${tooltipPosition === "top" ? "-top-10 md:-top-12" : "-bottom-10 md:-bottom-12"} left-1/2 -translate-x-1/2 bg-slate-900/95 text-white text-[11px] md:text-sm font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-[100] pointer-events-none shadow-xl scale-95 group-hover:scale-100 duration-200 border border-white/10`}>
        {label}
      </div>
    </div>
  );
}

export default function MainScreen() {
  const { profile, coins, stats, isSleeping, pet, initializeSession, updateStats, level, xp, soundEnabled, toggleSound } = useGameStore();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [activeMinigame, setActiveMinigame] = useState<'mouse' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      className="flex flex-col h-screen w-full relative overflow-hidden"
      style={{ 
        backgroundImage: `url("${bg1Img}")`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
      }}
    >
      {/* Top Section */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-start z-10 pointer-events-none">
        
        {/* Top Left: Level */}
        <div className="pointer-events-auto mt-2 ml-2 md:mt-0 md:ml-0">
          <CircularProgress 
             value={xpProgress} 
             text={<span className="font-extrabold text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-br from-fuchsia-400 to-purple-600 drop-shadow-sm">{level}</span>}
             colorClass="stroke-fuchsia-500 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]" 
             textClass="hover:scale-110 transition-transform" 
             label={`${getLevelTitle()} (Опыт: ${Math.floor(xp)}/${xpNeeded})`} 
             tooltipPosition="bottom"
          />
        </div>

        {/* Top Right: Buttons & Coins & Shop */}
        <div className="flex flex-col items-end gap-4 pointer-events-none mt-2 mr-2 md:mt-0 md:mr-0">
          
          {/* Shop and Coins */}
          <div className="flex gap-2 items-center pointer-events-auto bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md border border-slate-100">
            <div className="flex items-center gap-2 pl-3 pr-2">
              <div className="font-extrabold text-slate-800 text-base md:text-lg">{coins}</div>
              <div className="relative w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] border border-yellow-200 overflow-hidden">
                <div className="absolute top-0 left-[-100%] w-[200%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-[30deg] animate-shine" />
                <span className="font-black text-white text-xs md:text-sm drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] z-10 leading-none">Р</span>
              </div>
            </div>
            <button 
              onClick={() => setIsShopOpen(true)}
              className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-colors shrink-0 group relative"
            >
              <ShoppingBag size={20} className="md:w-6 md:h-6" />
            </button>
          </div>

          {/* Other actions below */}
          <div className="flex flex-col gap-3 pointer-events-auto items-end pr-1">
            <button 
              onClick={toggleSound}
              className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-slate-100 flex items-center justify-center text-slate-600 hover:text-blue-500 hover:bg-white transition-colors"
            >
              {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} className="text-slate-400" />}
            </button>
            <button 
              onClick={toggleFullscreen}
              className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-slate-100 items-center justify-center text-slate-600 hover:text-blue-500 hover:bg-white transition-colors hidden sm:flex"
            >
              {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
            </button>
          </div>
          
        </div>
      </div>

      {/* Main Play Area (Cat lowered further) */}
      <div className="flex-1 flex flex-col items-center justify-end relative z-0 pb-6 md:pb-10 max-h-[85vh]">
        <div 
           className="relative cursor-pointer group translate-y-16"
           onClick={() => { if (!isSleeping) pet(); }}
        >
           <img 
               src={cat1Img} 
               alt="Randy the Kitten" 
               className={`w-[75vw] md:w-[450px] lg:w-[500px] h-auto object-contain transition-all duration-300 pointer-events-auto origin-bottom`}
               style={{ 
                 filter: isSleeping ? 'brightness(0.7) sepia(0.3)' : 'drop-shadow(0 30px 40px rgba(0,0,0,0.25))',
                 userSelect: 'none',
                 WebkitUserSelect: 'none'
               }}
               referrerPolicy="no-referrer"
               draggable={false}
           />
           {isSleeping && (
               <div className="absolute -top-10 right-4 text-slate-200 font-bold text-4xl font-mono animate-bounce opacity-80 drop-shadow-md">
                   Zzz...
               </div>
           )}
        </div>
      </div>

      {/* Bottom Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex justify-between items-end z-10 pointer-events-none">
        
        {/* Bottom Left: Status Indicators */}
        <div className="flex gap-3 md:gap-4 pointer-events-none">
          <CircularProgress value={stats.mood} icon={Smile} colorClass="stroke-pink-400" textClass="text-pink-500" label="Настроение" />
          <CircularProgress value={stats.hunger} icon={Fish} colorClass="stroke-orange-400" textClass="text-orange-500" label="Сытость" />
          <CircularProgress value={stats.energy} icon={Zap} colorClass="stroke-yellow-400" textClass="text-yellow-500" label="Бодрость" />
        </div>

        {/* Bottom Right: Action Buttons */}
        <div className="flex gap-3 md:gap-4 pointer-events-auto">
          {/* Minigames */}
          <button 
            onClick={() => setActiveMinigame('mouse')}
            className="w-14 h-14 md:w-16 md:h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md text-emerald-500 hover:text-emerald-600 hover:scale-105 active:scale-95 transition-all text-xs font-bold relative group border border-slate-100"
          >
            <Gamepad2 size={26} />
          </button>
          
          {/* Chat */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-14 h-14 md:w-16 md:h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md text-blue-500 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all text-xs font-bold relative group border border-slate-100"
          >
            <MessageCircle size={26} />
          </button>
        </div>

      </div>

      {/* Modals */}
      <AnimatePresence>
        {isChatOpen && (
          <ChatModal onClose={() => setIsChatOpen(false)} />
        )}
      </AnimatePresence>

      {isShopOpen && <ShopModal onClose={() => setIsShopOpen(false)} />}
      {activeMinigame === 'mouse' && <CatchMouseGame onClose={() => setActiveMinigame(null)} />}

    </motion.div>
  );
}
