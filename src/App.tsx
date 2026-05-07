import React, { useState, useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import WelcomeScreen from './components/WelcomeScreen';
import RegistrationScreen from './components/RegistrationScreen';
import MainScreen from './components/MainScreen';
import CustomCursor from './components/CustomCursor';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

const PRELOAD_IMAGES = [
  'https://raw.githubusercontent.com/KRISLAWW435/Cat-assets-/main/cat/cat2.webp',
  'https://raw.githubusercontent.com/KRISLAWW435/Cat-assets-/main/bg/bgst.webp',
  'https://raw.githubusercontent.com/KRISLAWW435/Cat-assets-/main/bg/bg1.webp',
  'https://raw.githubusercontent.com/KRISLAWW435/Cat-assets-/main/cat/cat.webp',
  'https://raw.githubusercontent.com/KRISLAWW435/Cat-assets-/main/cat/%D0%BC%D1%83%D1%80%D1%87%D0%B0%D0%BD%D0%B8%D0%B5.webp',
  'https://raw.githubusercontent.com/KRISLAWW435/Cat-assets-/main/cat/%D0%BB%D0%B0%D0%BF%D0%BA%D0%B0/paw2.webp',
  'https://raw.githubusercontent.com/KRISLAWW435/Cat-assets-/main/cat/%D0%BB%D0%B0%D0%BF%D0%BA%D0%B0/paw1.webp',
];

export default function App() {
  const { profile } = useGameStore();
  const [stage, setStage] = useState<'loading' | 'welcome' | 'registration' | 'main'>('loading');
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    let loadedCount = 0;
    const totalImages = PRELOAD_IMAGES.length;

    const loadImages = async () => {
      const imagePromises = PRELOAD_IMAGES.map((src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.referrerPolicy = "no-referrer";
          img.src = src;
          img.onload = () => {
            if (!mounted) return;
            loadedCount++;
            setLoadingProgress(Math.round((loadedCount / totalImages) * 100));
            resolve(true);
          };
          img.onerror = () => {
            if (!mounted) return;
            loadedCount++;
            setLoadingProgress(Math.round((loadedCount / totalImages) * 100));
            resolve(false); // resolve even on error to not block forever
          };
        });
      });

      await Promise.all(imagePromises);
      
      if (mounted) {
        // slightly delay transition to make the 100% visible
        setTimeout(() => {
           setStage(profile.isSetup ? 'main' : 'welcome');
        }, 500);
      }
    };

    loadImages();

    return () => {
      mounted = false;
    };
  }, [profile.isSetup]);

  const handleReset = () => {
      localStorage.removeItem('renderia-cat-storage');
      window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans overflow-hidden relative">
      <CustomCursor />
      <AnimatePresence mode="wait">
        {stage === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-indigo-50"
          >
            <div className="flex flex-col items-center gap-4">
               <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
               <div className="text-xl font-bold text-indigo-800 font-quicksand">Loading kittens: {loadingProgress}%</div>
               <div className="w-64 h-3 bg-indigo-100 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-indigo-500 transition-all duration-300" 
                   style={{ width: `${loadingProgress}%` }}
                 />
               </div>
            </div>
          </motion.div>
        )}
        
        {stage === 'welcome' && (
          <WelcomeScreen onNext={() => setStage('registration')} />
        )}
        
        {stage === 'registration' && (
          <RegistrationScreen onComplete={() => setStage('main')} />
        )}
        
        {stage === 'main' && (
          <MainScreen />
        )}
      </AnimatePresence>
    </div>
  );
}