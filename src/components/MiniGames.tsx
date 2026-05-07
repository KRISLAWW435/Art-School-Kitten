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
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden relative border-4 border-blue-400"
      >
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
              className="absolute -translate-x-1/2 -translate-y-1/2 text-4xl select-none will-change-transform"
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
      </motion.div>
    </div>
  );
};

export const DrawingGame = ({ onClose }: { onClose: () => void }) => {
  const { addCoins, addXP, addMood, addMessage } = useGameStore();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);

  const colors = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500"];

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ("touches" in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ("touches" in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const finishDrawing = () => {
    addCoins(15);
    addXP(50);
    addMood(20);
    addMessage({
      sender: "randy",
      text: "Какой шедевр! 🎨 Ты настоящий художник! Я добавил тебе 15 Рекоинов и 50 XP за старания! ✨",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden relative border-4 border-emerald-400"
      >
        <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
          <h2 className="font-bold text-emerald-900 text-xl">Рисование с Рэнди 🎨</h2>
          <div className="flex gap-2">
            <button onClick={clearCanvas} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all">Очистить</button>
            <button onClick={finishDrawing} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30">Готово!</button>
          </div>
        </div>

        <div className="flex-1 bg-white relative overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-20 p-2 bg-slate-50 border-r border-slate-200 flex md:flex-col items-center justify-center gap-2 overflow-x-auto">
            {colors.map(c => (
              <button 
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-indigo-500 scale-125' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <div className="hidden md:block h-px w-8 bg-slate-300 my-2" />
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={brushSize} 
              onChange={(e) => setBrushSize(parseInt(e.target.value))} 
              className="w-20 md:w-auto h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer md:rotate-90 md:my-10" 
            />
          </div>
          <canvas 
            ref={canvasRef}
            width={800}
            height={600}
            className="flex-1 w-full h-full cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-200/50 hover:bg-slate-300 text-slate-600 rounded-full transition-colors z-20"
        >
          <X size={20} />
        </button>
      </motion.div>
    </div>
  );
};

export const MemoryMatchGame = ({ onClose }: { onClose: () => void }) => {
  const { addCoins, addXP, addMood, addMessage } = useGameStore();
  const emojis = ["🐱", "🐭", "🎨", "🧶", "🐟", "🥛", "🐾", "✨"];
  const [cards, setCards] = useState<{ id: number, emoji: string, isFlipped: boolean, isMatched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const deck = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, isFlipped: false, isMatched: false }));
    setCards(deck);
  }, []);

  const handleCardClick = (index: number) => {
    if (isProcessing || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const [idx1, idx2] = newFlipped;

      if (cards[idx1].emoji === cards[idx2].emoji) {
        newCards[idx1].isMatched = true;
        newCards[idx2].isMatched = true;
        setCards(newCards);
        setFlippedIndices([]);
        setIsProcessing(false);

        if (newCards.every(c => c.isMatched)) {
          setTimeout(endGame, 500);
        }
      } else {
        setTimeout(() => {
          newCards[idx1].isFlipped = false;
          newCards[idx2].isFlipped = false;
          setCards(newCards);
          setFlippedIndices([]);
          setIsProcessing(false);
        }, 800);
      }
    }
  };

  const endGame = () => {
    addCoins(25);
    addXP(100);
    addMood(30);
    addMessage({
      sender: "randy",
      text: "Какая отличная память! 🧠 Ты собрал все пары! Твоя награда: 25 Рекоинов и 100 XP! ✨🐾",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl p-6 flex flex-col items-center relative border-4 border-purple-400"
      >
        <h2 className="font-bold text-purple-900 text-2xl mb-6">Найди пары 🧩</h2>
        
        <div className="grid grid-cols-4 gap-4 w-full max-w-md">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(idx)}
              className={`aspect-square rounded-2xl flex items-center justify-center text-4xl cursor-pointer transition-all duration-300 shadow-lg ${
                card.isFlipped || card.isMatched 
                ? 'bg-purple-100 rotate-0' 
                : 'bg-gradient-to-br from-purple-400 to-indigo-500 rotate-180'
              }`}
            >
              {(card.isFlipped || card.isMatched) ? card.emoji : "❓"}
            </motion.div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-200/50 hover:bg-slate-300 text-slate-600 rounded-full transition-colors z-20"
        >
          <X size={20} />
        </button>
      </motion.div>
    </div>
  );
};

