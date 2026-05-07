import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../store/gameStore';
import { getAssetUrl } from '../utils/assets';

const pawPointer = getAssetUrl('cat/%D0%BB%D0%B0%D0%BF%D0%BA%D0%B0/paw2.webp');
const pawStatic = getAssetUrl('cat/%D0%BB%D0%B0%D0%BF%D0%BA%D0%B0/paw1.webp');

interface TutorialStep {
  targetId: string | null;
  text: string;
  position: 'top' | 'bottom' | 'center' | 'top-right' | 'bottom-right';
}

export default function TutorialOverlay() {
  const { profile, tutorialStep, setTutorialStep } = useGameStore();
  const [displayText, setDisplayText] = useState("");

  const steps: TutorialStep[] = [
    {
      targetId: null,
      text: `Мяу! Вот мы и дома, ${profile.name}! Это моя комната. Здесь мы будем болтать, играть и узнавать много всего интересного! Обещаю, будет весело!`,
      position: 'center'
    },
    {
      targetId: 'level-panel',
      text: "Здесь твой уровень и опыт. Чем больше мы играем и общаемся, тем выше твой уровень! С новыми уровнями открываются крутые штуки!",
      position: 'top-right'
    },
    {
      targetId: 'coins-display',
      text: "Это твои монетки - Рэнди-коины! Совсем скоро ты узнаешь, как их тратить.",
      position: 'top-right'
    },
    {
      targetId: 'shop-button',
      text: "А вот и магазин! Здесь можно купить вкусняшки, новые игрушки или даже сменить мне наряд. Заходи сюда почаще!",
      position: 'top-right'
    },
    {
      targetId: 'stats-panel',
      text: "Следи за моими показателями! Настроение, голод и энергия — если я проголодаюсь или устану, мы не сможем играть.",
      position: 'bottom-right'
    },
    {
      targetId: 'games-button',
      text: "Тут живут мини-игры! Давай играть вместе, чтобы зарабатывать монетки и опыт. Мяу!",
      position: 'bottom-right'
    },
    {
      targetId: 'chat-button',
      text: "Смотри, если ты нажмёшь сюда, сможешь написать мне что угодно. Попробуй прямо сейчас! Можешь спросить, например, о моём любимом цвете.",
      position: 'bottom-right'
    }
  ];

  const currentStepData = tutorialStep !== null ? steps[tutorialStep] : null;

  useEffect(() => {
    if (!currentStepData) return;
    
    let index = 0;
    setDisplayText("");
    const interval = setInterval(() => {
      index++;
      setDisplayText(currentStepData.text.slice(0, index));
      if (index >= currentStepData.text.length) {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [tutorialStep]);

  if (tutorialStep === null || !currentStepData) return null;

  const handleNext = () => {
    if (tutorialStep < steps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setTutorialStep(null);
    }
  };

  const getHighlightId = () => {
    if (!currentStepData.targetId) return null;
    const isMobile = window.innerWidth < 1024;
    let targetId = currentStepData.targetId;
    
    // Remap IDs for mobile if needed
    if (isMobile) {
      if (targetId === 'stats-panel') targetId = 'stats-panel-mobile';
      if (targetId === 'chat-button') targetId = 'chat-button-mobile';
      if (targetId === 'games-button') targetId = 'games-button-mobile';
      if (targetId === 'coins-display' || targetId === 'shop-button') targetId = 'shop-panel-mobile';
    }
    
    return targetId;
  };

  const getHighlightRect = () => {
    const targetId = getHighlightId();
    if (!targetId) return null;
    const el = document.getElementById(targetId);
    if (!el) return null;
    return el.getBoundingClientRect();
  };

  const rect = getHighlightRect();

  return (
    <div className="fixed inset-0 z-[1000] pointer-events-none">
      {/* Dim Overlay with SVG Mask (Spotlight) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto" onClick={handleNext}>
        <defs>
          <mask id="tutorial-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {rect && (
              <motion.rect
                initial={false}
                animate={{
                  x: rect.left - 8,
                  y: rect.top - 8,
                  width: rect.width + 16,
                  height: rect.height + 16,
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                rx="20"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect 
          x="0" 
          y="0" 
          width="100%" 
          height="100%" 
          fill="rgba(0,0,0,0.7)" 
          mask="url(#tutorial-mask)" 
          className="transition-all duration-500"
        />
      </svg>

      {/* Target Highlight Border (Visual only) */}
      <AnimatePresence>
        {rect && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            key={getHighlightId()}
            className="absolute z-[1010] border-4 border-white/90 rounded-2xl shadow-[0_0_80px_rgba(255,255,255,0.4)] pointer-events-none"
            style={{
              top: rect.top - 10,
              left: rect.left - 10,
              width: rect.width + 20,
              height: rect.height + 20
            }}
          />
        )}
      </AnimatePresence>

      {/* Randy Dialogue Box - Dynamic Position */}
      <div className={`fixed inset-x-0 inset-y-0 flex ${tutorialStep > 0 && tutorialStep <= 3 ? 'items-end pb-[10vh]' : 'items-start pt-[5vh]'} justify-center pointer-events-none px-4`}>
        <motion.div
          key={tutorialStep}
          initial={{ opacity: 0, y: tutorialStep > 0 && tutorialStep <= 3 ? 20 : -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative z-[1020] bg-white p-5 md:p-9 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-full max-w-[340px] md:max-w-lg pointer-events-auto cursor-none border-2 border-white/50"
        >
          <p className="text-slate-800 font-bold text-lg md:text-2xl leading-snug text-center">
             {displayText}
          </p>
          <div className="mt-6 md:mt-8 flex justify-between items-center">
             <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === tutorialStep ? 'w-6 bg-blue-500' : 'w-1.5 bg-slate-200'}`} 
                  />
                ))}
             </div>
             {tutorialStep < steps.length - 1 ? (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="px-6 md:px-10 py-2.5 md:py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-black text-xs md:text-sm hover:scale-105 active:scale-95 shadow-xl uppercase tracking-wider transition-all"
                >
                  Далее
                </button>
             ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="px-6 md:px-10 py-2.5 md:py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-black text-xs md:text-sm hover:scale-105 active:scale-95 shadow-xl uppercase tracking-wider transition-all"
                >
                  Понятно!
                </button>
             )}
          </div>
        </motion.div>
      </div>

      {/* Paw Pointer with Fixed Aspect Ratio */}
      {rect && (
         <motion.div
            key={`paw-${tutorialStep}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
               opacity: 1,
               scale: 1,
               x: rect.left + rect.width / 2 - 40, 
               y: [rect.top + rect.height + 60, rect.top + rect.height + 30, rect.top + rect.height + 60] 
            }}
            transition={{ 
               opacity: { duration: 0.3 },
               y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } 
            }}
            className="fixed z-[1015] pointer-events-none w-32 h-32"
         >
            <img 
               src={pawPointer} 
               alt="paw" 
               className="w-full h-full object-contain drop-shadow-2xl" 
               referrerPolicy="no-referrer"
            />
         </motion.div>
      )}
    </div>
  );
}
