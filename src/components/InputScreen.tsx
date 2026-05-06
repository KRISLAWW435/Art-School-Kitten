import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PlayerData } from '../types';
import { Cat } from 'lucide-react';

type Props = {
  onSubmit: (data: PlayerData) => void;
  key?: string;
};

export default function InputScreen({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && age) {
      onSubmit({ name, age });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-6"
    >
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 border-2 border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-dashed border-slate-300 flex flex-col items-center justify-center p-2 shadow-inner text-slate-400">
            <Cat size={32} />
            <span className="text-[10px] font-bold mt-1">Заглушка</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">
          Давай познакомимся!
        </h2>
        <p className="text-slate-500 text-center mb-8">
          Котенок хочет узнать, как к тебе обращаться.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Твое имя
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, Саша"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Твой возраст
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Например, 10"
              required
              min="3"
              max="99"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!name || !age}
            className="w-full mt-6 bg-pink-500 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none hover:bg-pink-600 text-white font-bold py-4 rounded-xl shadow-[0_4px_0_rgb(219,39,119)] active:shadow-[0_0px_0_rgb(219,39,119)] active:translate-y-1 transition-all text-lg"
          >
            Играть
          </button>
        </form>
      </div>
    </motion.div>
  );
}
