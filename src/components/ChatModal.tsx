import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Send, Mic, Moon } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { processUserMessage } from '../engine/dialogueEngine';

export const ChatModal = ({ onClose }: { onClose: () => void }) => {
  const { messages, isSleeping, wakeUp, awaitingDialogueTopic } = useGameStore();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragged, setDragged] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const startDragging = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragged(false);
    if (!scrollRef.current) return;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const onDrag = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 10) setDragged(true);
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.sender === 'user' || lastMessage.isTyping) {
        setQuickReplies([]);
        return;
    }
    
    // Check if we are awaiting a dialogue topic
    if (awaitingDialogueTopic) {
        setQuickReplies(["Давай!", "Нет, спасибо", "Расскажи шутку"]);
        return;
    }

    const text = lastMessage.text.toLowerCase();
    let newReplies: string[] = [];

    if (text.includes("привет") || text.includes("как твои дела")) {
        newReplies = ["Привет!", "Отлично!", "Где ты живешь?", "Мне скучно"];
    } else if (text.includes("мульти") || text.includes("анимаци")) {
        newReplies = ["12 принципов Диснея", "Что такое тайминг?", "Про сжатие", "Замах"];
    } else if (text.includes("рису") || text.includes("творчеств") || text.includes("дизайн")) {
        newReplies = ["В чем рисовать?", "У меня не получается", "Люблю мультики", "Кисти"];
    } else if (text.includes("скучн") || text.includes("игра")) {
        newReplies = ["Поиграем!", "Расскажи шутку", "Посоветуй игру", "Кто ты?"];
    } else {
        const fallbacks = [
            "Рисование", "Мультики", "Игры", "Пошути", "Устал", "Кто ты?", "Привет"
        ];
        newReplies = fallbacks.sort(() => 0.5 - Math.random()).slice(0, 3);
    }
    setQuickReplies(newReplies);

  }, [messages, awaitingDialogueTopic]);

  const submitMessage = (text: string) => {
    if (!text.trim() || isSleeping) return;

    useGameStore.getState().addMessage({ sender: 'user', text });
    setQuickReplies([]); // hide immediately

    setTimeout(() => {
       processUserMessage(text);
    }, 300);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const currentInput = input;
    setInput('');
    submitMessage(currentInput);
  };

  const handleQuickReply = (text: string) => {
    if (dragged) return;
    submitMessage(text);
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Голосовой ввод не поддерживается вашим браузером.');
        return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    if (isListening) {
        recognition.stop();
        setIsListening(false);
        return;
    }

    recognition.start();
    setIsListening(true);

    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
    };

    recognition.onerror = () => {
        setIsListening(false);
    };
    
    recognition.onend = () => {
        setIsListening(false);
    }
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-x-0 bottom-0 top-0 md:top-auto md:h-[80vh] z-50 bg-slate-50 flex flex-col md:rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-slate-200 overflow-hidden"
    >
      <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-100 shadow-sm relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-xl shadow-inner border border-pink-200">
            🐾
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Рэнди</h3>
            <p className="text-xs text-green-500 font-bold uppercase tracking-wider">В сети</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 relative bg-slate-50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm border ${
                msg.sender === 'user' 
                  ? 'bg-blue-500 text-white rounded-br-[4px] border-blue-600' 
                  : 'bg-white text-slate-800 rounded-bl-[4px] border-slate-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.isTyping && (
                  <span className="ml-1 animate-pulse inline-block w-1.5 h-4 bg-slate-400 align-middle"></span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {isSleeping ? (
         <div className="p-4 bg-slate-100 border-t border-slate-200 text-center flex flex-col items-center gap-2 text-slate-500">
             <Moon size={24} className="text-indigo-400" />
             <p className="text-sm font-bold">Рэнди спит. Шшш...</p>
             <button 
                onClick={() => wakeUp()}
                className="mt-2 px-6 py-2 bg-white border-2 border-slate-200 rounded-full text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
             >
                Разбудить (1 раз/день)
             </button>
         </div>
      ) : (
        <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-3 pb-safe">
          {quickReplies.length > 0 && (
              <div 
                  ref={scrollRef}
                  onMouseDown={startDragging}
                  onMouseLeave={stopDragging}
                  onMouseUp={stopDragging}
                  onMouseMove={onDrag}
                  className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x cursor-grab active:cursor-grabbing max-w-full" 
                  style={{ scrollbarWidth: 'none' }}
              >
                  {quickReplies.map((reply, i) => (
                      <button
                          key={i}
                          onClick={() => handleQuickReply(reply)}
                          className="whitespace-nowrap px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full text-sm font-medium transition-colors border border-blue-100 snap-start shrink-0 pointer-events-auto"
                      >
                          {reply}
                      </button>
                  ))}
              </div>
          )}
          <form onSubmit={handleSend} className="flex gap-2 items-center w-full max-w-lg mx-auto">
            <button
                type="button"
                onClick={toggleVoice}
                className={`w-12 h-12 rounded-full flex flex-col items-center justify-center shrink-0 transition-colors border ${
                    isListening ? 'bg-red-100 text-red-500 border-red-200 animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border-slate-200'
                }`}
            >
                <Mic size={20} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={(e) => {
                // Focus scrolling for mobile
                setTimeout(() => {
                  e.target.scrollIntoView({ block: 'center', behavior: 'smooth' });
                }, 300);
              }}
              placeholder="Напиши что-нибудь..."
              className="flex-1 bg-slate-100 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-blue-400 border border-transparent font-medium text-slate-800 placeholder-slate-400 text-base"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-12 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full flex flex-col items-center justify-center shrink-0 transition-all shadow-md shadow-blue-500/30 disabled:shadow-none"
            >
              <Send size={18} className="translate-x-[1px]" />
            </button>
          </form>
        </div>
      )}
    </motion.div>
  );
}
