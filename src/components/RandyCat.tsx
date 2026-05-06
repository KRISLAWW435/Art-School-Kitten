import React, { useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

const catImg = 'https://github.com/KRISLAWW435/Cat-assets-/blob/main/cat/cat.webp?raw=true';

export const RandyCat = () => {
   const { stats, isSleeping, pet, addMessage, addCoins } = useGameStore();
   const clickCount = useRef(0);
   const [hearts, setHearts] = useState<{id:number, x:number, y:number}[]>([]);

   const handlePet = (e: React.MouseEvent<HTMLDivElement>) => {
      if (isSleeping) return;
      
      pet();
      clickCount.current++;
      
      // Floating heart effect
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setHearts(prev => [...prev, { id: Date.now(), x, y }]);
      setTimeout(() => setHearts(prev => prev.filter(h => h.id !== Date.now())), 1000); // Wait for transition

      // Bonus milestone
      if (clickCount.current % 20 === 0) {
         addCoins(10);
         addMessage({ sender: 'randy', text: 'Мррррр... Какой прекрасный массаж! +10 Рекоинов! 💰💖' });
         confetti({
             particleCount: 40,
             spread: 60,
             origin: { y: 0.6 },
             colors: ['#f472b6', '#fbbf24', '#ffffff']
         });
      }
   };

   // Determine animation based on stats
   let yAnim = [0, -8, 0];
   let duration = 3;
   
   if (isSleeping) {
      yAnim = [0, 2, 0];
      duration = 4;
   } else if (stats.mood > 80 && stats.energy > 50) {
      yAnim = [0, -15, 0];
      duration = 1.5;
   } else if (stats.energy < 30 || stats.hunger < 30) {
      yAnim = [0, -3, 0];
      duration = 5;
   }

   return (
       <div className="relative w-full h-full flex flex-col items-center justify-center">
           <motion.div
               animate={{ y: yAnim }}
               transition={{ repeat: Infinity, duration, ease: "easeInOut" }}
               className="relative cursor-pointer group"
               onClick={handlePet}
           >
               <img 
                   src={catImg} 
                   alt="Randy the Kitten" 
                   className={`w-[60vw] md:w-[350px] lg:w-[400px] h-auto object-contain transition-all duration-300 ${isSleeping ? 'brightness-75 saturate-50' : 'group-hover:scale-105'}`}
                   style={{ filter: isSleeping ? 'brightness(0.7) sepia(0.3)' : 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))' }}
                   referrerPolicy="no-referrer"
               />

               {/* Zzz animation */}
               {isSleeping && (
                   <div className="absolute -top-10 right-4 text-slate-400 font-bold text-3xl font-mono animate-bounce opacity-80">
                       Zzz...
                   </div>
               )}

               {/* Floating Hearts */}
               <AnimatePresence>
                   {hearts.map(h => (
                       <motion.div
                           key={h.id}
                           initial={{ opacity: 1, y: h.y, x: h.x, scale: 0.5 }}
                           animate={{ opacity: 0, y: h.y - 100, scale: 1.5 }}
                           exit={{ opacity: 0 }}
                           transition={{ duration: 1 }}
                           className="absolute text-pink-400 text-2xl font-bold pointer-events-none"
                       >
                           💖
                       </motion.div>
                   ))}
               </AnimatePresence>
           </motion.div>
       </div>
   );
};
