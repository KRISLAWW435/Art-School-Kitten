import React, { useState, useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import WelcomeScreen from './components/WelcomeScreen';
import RegistrationScreen from './components/RegistrationScreen';
import MainScreen from './components/MainScreen';
import CustomCursor from './components/CustomCursor';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const { profile } = useGameStore();
  const [stage, setStage] = useState<'welcome' | 'registration' | 'main'>(
    profile.isSetup ? 'main' : 'welcome'
  );

  const handleReset = () => {
      localStorage.removeItem('renderia-cat-storage');
      window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans overflow-hidden relative">
      <CustomCursor />
      <AnimatePresence mode="wait">
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