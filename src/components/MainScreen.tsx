import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../store/gameStore';
import { MessageCircle, Gamepad2, ShoppingBag, Zap, Coins, Volume2, VolumeX, Maximize, Minimize, Smile, Fish, Star } from 'lucide-react';
import { ChatModal } from './ChatModal';
import { ShopModal } from './ShopModal';
import { CatchMouseGame } from './MiniGames';

const bgImg = 'https://github.com/KRISLAWW435/Cat-assets-/blob/main/bg/bg1.png?raw=true';
const catImg = 'https://github.com/KRISLAWW435/Cat-assets-/blob/main/cat/cat.png?raw=true';

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
      className="flex h-screen w-full relative overflow-hidden bg-slate-100"
    >
      {/* Background container for the cat (Desktop: centered, Mobile: full) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url("${bgImg}")` }}
      />

      {/* Main Layout Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row">
        
        {/* LEFT PANEL (Desktop: Column, Mobile: Absolute Top-Left) */}
        <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-start lg:w-24 p-4 lg:p-6 lg:h-full pointer-events-none lg:bg-white/10 lg:backdrop-blur-md lg:border-r lg:border-white/20">
          
          {/* Level Circle */}
          <div className="pointer-events-auto mb-0 lg:mb-8">
            <CircularProgress 
               value={xpProgress} 
               text={<span className="font-extrabold text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-br from-fuchsia-400 to-purple-600 drop-shadow-sm">{level}</span>}
               colorClass="stroke-fuchsia-500" 
               textClass="hover:scale-110 transition-transform" 
               label="Level" 
            />
          </div>

          {/* Desktop Left Stack: Coins, Shop, Sound, Fullscreen */}
          <div className="hidden lg:flex flex-col items-center gap-6 pointer-events-auto">
            {/* Coins Display */}
            <div className="flex flex-col items-center gap-1 group">
               <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white overflow-hidden transition-transform group-hover:rotate-12">
                  <span className="font-black text-white text-lg drop-shadow-md">Р</span>
               </div>
               <div className="font-black text-white drop-shadow-md text-sm">{coins}</div>
            </div>

            {/* Shop Button */}
            <button 
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
          </div>

          {/* Mobile Top Right Corner (Simplified for mobile) */}
          <div className="lg:hidden flex flex-col items-end gap-3 pointer-events-auto">
             <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md border border-white/50">
                <span className="font-bold text-slate-800 text-sm">{coins}</span>
                <span className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] font-black text-white">Р</span>
                <button onClick={() => setIsShopOpen(true)} className="ml-1 text-slate-500"><ShoppingBag size={18}/></button>
             </div>
             <div className="flex flex-col gap-2 scale-90 origin-top-right">
                <button onClick={toggleSound} className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md">{soundEnabled ? <Volume2 size={20}/> : <VolumeX size={20}/>}</button>
                <button onClick={toggleFullscreen} className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md"><Maximize size={20}/></button>
             </div>
          </div>
        </div>

        {/* CENTER AREA (KITTEN) */}
        <div className="flex-1 flex flex-col items-center justify-end md:justify-center relative p-8">
           <div 
              className="relative cursor-pointer group lg:mt-24"
              onClick={() => { if (!isSleeping) pet(); }}
           >
              <img 
                  src={catImg} 
                  alt="Randy the Kitten" 
                  className="w-[70vw] md:w-[400px] lg:w-[500px] xl:w-[550px] h-auto object-contain transition-transform duration-300 pointer-events-auto origin-bottom hover:scale-105"
                  style={{ 
                    filter: isSleeping ? 'brightness(0.7) sepia(0.3)' : 'drop-shadow(0 30px 40px rgba(0,0,0,0.3))',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                  }}
                  referrerPolicy="no-referrer"
                  draggable={false}
              />
              {isSleeping && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-white font-black text-5xl font-mono animate-bounce drop-shadow-2xl">
                      Zzz...
                  </div>
              )}
           </div>
        </div>

        {/* RIGHT PANEL (Desktop: Column, Mobile: Absolute Bottom) */}
        <div className="flex flex-row lg:flex-col items-center justify-center lg:justify-between lg:w-24 p-4 lg:p-6 lg:h-full lg:bg-white/10 lg:backdrop-blur-md lg:border-l lg:border-white/20">
          
          {/* Desktop Right Stack: Stats, MiniGames, Chat */}
          <div className="hidden lg:flex flex-col items-center gap-6 pointer-events-auto">
             <CircularProgress value={stats.mood} icon={Smile} colorClass="stroke-pink-400" textClass="text-pink-500" label="Mood" sizeClass="w-14 h-14" radius={24} />
             <CircularProgress value={stats.hunger} icon={Fish} colorClass="stroke-orange-400" textClass="text-orange-500" label="Hunger" sizeClass="w-14 h-14" radius={24} />
             <CircularProgress value={stats.energy} icon={Zap} colorClass="stroke-yellow-400" textClass="text-yellow-500" label="Energy" sizeClass="w-14 h-14" radius={24} />
             
             <div className="h-px w-12 bg-white/20 my-2" />

             <button 
               onClick={() => setActiveMinigame('mouse')}
               className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg hover:bg-emerald-600 transition-all hover:scale-110 active:scale-95"
             >
               <Gamepad2 size={28} />
             </button>
             
             <button
               onClick={() => setIsChatOpen(true)}
               className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-all hover:scale-110 active:scale-95"
             >
               <MessageCircle size={28} />
             </button>
          </div>

          {/* Mobile Bottom Row */}
          <div className="lg:hidden flex flex-row items-center gap-3 md:gap-4 pointer-events-auto w-full justify-between px-2">
             <div className="flex gap-2">
                <CircularProgress value={stats.mood} icon={Smile} colorClass="stroke-pink-400" textClass="text-pink-500" label="Mood" sizeClass="w-12 h-12" radius={20} />
                <CircularProgress value={stats.hunger} icon={Fish} colorClass="stroke-orange-400" textClass="text-orange-500" label="Hunger" sizeClass="w-12 h-12" radius={20} />
                <CircularProgress value={stats.energy} icon={Zap} colorClass="stroke-yellow-400" textClass="text-yellow-500" label="Energy" sizeClass="w-12 h-12" radius={20} />
             </div>
             
             <div className="flex gap-3">
                <button onClick={() => setActiveMinigame('mouse')} className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-md"><Gamepad2 size={24}/></button>
                <button onClick={() => setIsChatOpen(true)} className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md"><MessageCircle size={24}/></button>
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
      {activeMinigame === 'mouse' && <CatchMouseGame onClose={() => setActiveMinigame(null)} />}

    </motion.div>
  );
}
