import React, { useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { getAssetUrl } from '../utils/assets';

const catImg = getAssetUrl('cat/cat.webp');

export const RandyCat = () => {
   const { stats, isSleeping } = useGameStore();
   
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
       <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
           <motion.div
               animate={{ y: yAnim }}
               transition={{ repeat: Infinity, duration, ease: "easeInOut" }}
               className="relative group will-change-transform pointer-events-none"
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
                   <div className="absolute -top-10 right-4 text-slate-400 font-bold text-3xl font-mono animate-bounce opacity-80 pointer-events-none">
                       Zzz...
                   </div>
               )}
           </motion.div>
       </div>
   );
};
