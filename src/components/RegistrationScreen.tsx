import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useGameStore } from '../store/gameStore';

export default function RegistrationScreen({ onComplete }: { onComplete: () => void }) {
  const { setProfile, addMessage } = useGameStore();
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState<'5-7' | '8-10' | '11-14' | '15-17' | '18+'>('8-10');
  const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setProfile({
      name: name.trim(),
      ageGroup,
      gender,
      isSetup: true
    });

    // Custom greeting for the new player
    addMessage({
      sender: 'randy',
      text: `Приятно познакомиться, ${name.trim()}! 🐾 Начинаем наше приключение!`
    });

    onComplete();
  };

  return (
    <div 
      className="w-full h-screen bg-slate-100 flex flex-col items-center justify-center p-6"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Давай знакомиться!</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-500 uppercase">Как тебя зовут?</label>
            <input 
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Твое имя или ник..."
              className="w-full bg-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium text-slate-800"
              required
            />
          </div>

          {/* Age Group */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-500 uppercase">Сколько тебе лет?</label>
            <select
               value={ageGroup}
               onChange={e => setAgeGroup(e.target.value as any)}
               className="w-full bg-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium text-slate-800 appearance-none"
            >
              <option value="5-7">5 - 7 лет</option>
              <option value="8-10">8 - 10 лет</option>
              <option value="11-14">11 - 14 лет</option>
              <option value="15-17">15 - 17 лет</option>
              <option value="18+">18 лет и старше</option>
            </select>
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-500 uppercase">Твой пол</label>
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`flex-1 py-2 font-bold rounded-lg text-sm transition-colors ${gender === 'male' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Мальчик
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`flex-1 py-2 font-bold rounded-lg text-sm transition-colors ${gender === 'female' ? 'bg-white text-pink-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Девочка
              </button>
              <button
                type="button"
                onClick={() => setGender('unknown')}
                className={`flex-1 py-2 font-bold rounded-lg text-sm transition-colors ${gender === 'unknown' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Секрет
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={!name.trim()}
            className="mt-4 w-full bg-blue-500 text-white font-bold py-4 rounded-[2rem] shadow-lg shadow-blue-500/30 hover:bg-blue-600 disabled:opacity-50 disabled:shadow-none transition-all uppercase tracking-wide"
          >
            Продолжить
          </button>
        </form>
      </motion.div>
    </div>
  );
}
