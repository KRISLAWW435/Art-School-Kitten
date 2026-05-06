import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

const welcomeCat = 'https://github.com/KRISLAWW435/Cat-assets-/blob/main/cat/cat2.webp?raw=true';

export default function WelcomeScreen({ onNext }: { onNext: () => void }) {
  const fullText = "Привет, я Рэнди, твой творческий друг!";
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let index = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (index <= fullText.length) {
          setDisplayText(fullText.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }, 1500); // Wait for bubble to appear
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between py-12 px-6 overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: 'url("https://github.com/KRISLAWW435/Cat-assets-/blob/main/bg/bgst.webp?raw=true")' }}
    >
      <div className="absolute inset-0 backdrop-blur-[3px] pointer-events-none" />

      {/* Top Section: Dialogue Bubble */}
      <div className="relative z-20 w-full flex justify-center mt-4">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.8,
            type: "spring",
            damping: 15
          }}
          className="bg-white/90 backdrop-blur-md px-8 py-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-2 border-white/50 max-w-[340px] text-center relative"
        >
          <p className="text-slate-700 font-bold text-xl md:text-2xl leading-tight">
            {displayText}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className={displayText.length >= fullText.length ? "hidden" : "inline-block w-1.5 h-6 bg-blue-400 ml-1 translate-y-1"}
            />
          </p>
          {/* Subtle bubble indicator at the bottom */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white/90 border-r-2 border-b-2 border-white/50 rotate-45"></div>
        </motion.div>
      </div>

      <div className="relative flex flex-col items-center justify-center w-full max-w-lg mb-8">
        {/* Randy Image */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
          className="relative"
        >
          <motion.div
             animate={{ y: [0, -15, 0] }}
             transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
              <img 
                src={welcomeCat} 
                alt="Рэнди" 
                className="w-[85vw] max-w-[440px] h-auto drop-shadow-[0_30px_70px_rgba(0,0,0,0.2)] relative z-10"
                referrerPolicy="no-referrer"
              />
          </motion.div>
        </motion.div>

        {/* Pulsing Start Button */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="w-full max-w-[320px] mt-8 relative z-10"
        >
          <motion.button
            onClick={onNext}
            animate={{ 
              scale: [1, 1.03, 1],
              boxShadow: [
                "0 15px 35px -5px rgba(236,72,153,0.3)",
                "0 25px 50px -5px rgba(139,92,246,0.5)",
                "0 15px 35px -5px rgba(59,130,246,0.3)"
              ]
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 1.18 }}
            className="w-full py-6 bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 rounded-full text-white font-black text-2xl tracking-[0.25em] transition-all uppercase shadow-2xl"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Начать
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
