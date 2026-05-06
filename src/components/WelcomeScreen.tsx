import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

const bgImg = 'https://github.com/KRISLAWW435/Cat-assets-/blob/main/bg/bg1.png?raw=true';
const catImg = 'https://github.com/KRISLAWW435/Cat-assets-/blob/main/cat/cat.png?raw=true';

export default function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <div 
      className="w-full h-screen bg-cover bg-center flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundImage: `url("${bgImg}")` }}
    >
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6">
        
        {/* Dialogue Bubble */}
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-[2rem] p-5 shadow-xl mb-4 relative drop-shadow-md border-2 border-slate-100 text-center"
        >
          <div className="text-slate-700 font-bold text-lg leading-relaxed">
            Мяу! Привет! Я Рэнди. 🐾<br/>
            Я так ждал тебя! Пойдем играть и творить вместе!
          </div>
          {/* Bubble tail */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-b-2 border-r-2 border-slate-100 transform rotate-45"></div>
        </motion.div>

        {/* Kitten */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.7, delay: 0.2 }}
           className="my-4"
        >
          <img 
            src={catImg} 
            alt="Рэнди" 
            className="w-64 h-auto drop-shadow-[0_20px_30px_rgba(0,0,0,0.2)] object-contain object-bottom pointer-events-none select-none"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        {/* Forward Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 w-full"
        >
          <button 
            onClick={onNext}
            className="w-full relative group bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-bold py-4 rounded-[2rem] shadow-[0_8px_30px_rgba(59,130,246,0.3)] overflow-hidden flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span className="relative z-10 text-xl tracking-wide uppercase">Вперёд</span>
            <ChevronRight className="relative z-10" size={24} />
          </button>
        </motion.div>

      </div>
    </div>
  );
}
