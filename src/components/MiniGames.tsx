import React, { useState, useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { X } from "lucide-react";
import { motion } from "motion/react";

export const CatchMouseGame = ({ onClose }: { onClose: () => void }) => {
  const { profile, addCoins, addMood, addMessage } = useGameStore();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    // Move mouse every interval
    // Speed depends on age
    const speed =
      profile.ageGroup === "5-7"
        ? 1200
        : profile.ageGroup === "8-10"
          ? 900
          : 600;

    const moveInterval = setInterval(() => {
      setMousePos({
        x: 10 + Math.random() * 80, // 10% to 90%
        y: 10 + Math.random() * 80,
      });
    }, speed);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(moveInterval);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(moveInterval);
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.ageGroup]);

  useEffect(() => {
    if (timeLeft === 0) {
      endGame(score);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const endGame = (finalScore: number) => {
    const coinsEarned = Math.floor(finalScore / 2);
    const xpEarned = finalScore * 5;
    const { addXP, addFriendship } = useGameStore.getState();

    addCoins(coinsEarned);
    addXP(xpEarned);
    addMood(10);
    addFriendship(2);
    addMessage({
      sender: "randy",
      text: `Ого! Мы поймали мышку ${finalScore} раз! Ты заработал ${coinsEarned} Рекоинов и ${xpEarned} XP! 🐀✨`,
    });
    setTimeout(onClose, 2000);
  };

  const handleCatch = () => {
    setScore((s) => s + 1);
    // Instantly move it away upon catch to avoid spam clicking
    setMousePos({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl h-[60vh] flex flex-col overflow-hidden relative border-4 border-blue-400">
        <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center z-10">
          <div>
            <h2 className="font-bold text-blue-900 text-xl">Поймай мышку</h2>
            <p className="text-sm text-blue-600">Счет: {score}</p>
          </div>
          <div className="text-2xl font-black text-rose-500 font-mono">
            00:{timeLeft.toString().padStart(2, "0")}
          </div>
        </div>

        <div className="flex-1 relative bg-slate-100 overflow-hidden cursor-crosshair">
          {timeLeft > 0 ? (
            <motion.div
              animate={{ left: `${mousePos.x}%`, top: `${mousePos.y}%` }}
              transition={{ type: "spring", damping: 12, stiffness: 100 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-4xl select-none"
              onMouseDown={handleCatch}
              onTouchStart={handleCatch}
            >
              🐁
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-slate-800">
                Игра окончена!
              </h2>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-200/50 hover:bg-slate-300 text-slate-600 rounded-full transition-colors z-20"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
