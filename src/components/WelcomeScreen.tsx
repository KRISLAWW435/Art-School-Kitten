import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

const welcomeCat = 'https://github.com/KRISLAWW435/Cat-assets-/blob/main/cat/cat2.webp?raw=true';

export default function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between p-8 overflow-hidden bg-white"
    >
      {/* Watercolor background effect using blurred circles */}
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-yellow-100/60 blur-[120px]" />
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-pink-100/60 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-blue-100/60 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-orange-50/60 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center mt-12">
        <motion.h1 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-bold text-2xl md:text-3xl text-slate-700 mb-3"
          style={{ fontFamily: "'Quicksand', sans-serif" }}
        >
          Добро пожаловать в <br className="md:hidden" />
          <span 
            className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-yellow-500 drop-shadow-sm tracking-tight"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            RENDERIA!
          </span>
        </motion.h1>
        <motion.p 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-slate-500 text-lg md:text-xl font-medium italic"
          style={{ fontFamily: "'Quicksand', sans-serif" }}
        >
          Котёнок Рэнди и его творческая мастерская
        </motion.p>
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          damping: 20,
          stiffness: 80,
          delay: 0.6 
        }}
        className="relative flex-1 flex items-center justify-center -my-8"
      >
         <motion.div
           animate={{ y: [0, -15, 0] }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
         >
            <img 
              src={welcomeCat} 
              alt="Рэнди" 
              className="w-[85vw] max-w-[480px] h-auto drop-shadow-[0_15px_40px_rgba(0,0,0,0.1)] object-contain"
              referrerPolicy="no-referrer"
            />
         </motion.div>
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="relative z-10 w-full flex justify-center mb-10"
      >
        <motion.button
          onClick={onNext}
          animate={{ 
            scale: [1, 1.06, 1],
            boxShadow: [
              "0 15px 35px -5px rgba(236, 72, 153, 0.3)",
              "0 25px 45px -5px rgba(139, 92, 246, 0.4)",
              "0 15px 35px -5px rgba(59, 130, 246, 0.3)"
            ]
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="px-20 py-6 bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 rounded-full text-white font-black text-2xl tracking-[0.2em] shadow-2xl transition-all uppercase"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Начать
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
