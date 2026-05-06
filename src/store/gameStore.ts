import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  sender: 'user' | 'randy';
  text: string;
  timestamp: number;
  isTyping?: boolean;
}

export interface GameState {
  // Stats
  stats: {
    hunger: number; // 0-100
    energy: number; // 0-100
    mood: number; // 0-100
    friendship: number; // 0-infinity
  };
  
  // Progression
  coins: number;
  xp: number;
  level: number;
  soundEnabled: boolean;
  inventory: {
    accessories: string[];
    food: Record<string, number>;
  };
  equipped: {
    accessory: string | null;
  };
  
  // Profile
  profile: {
    name: string;
    ageGroup: '5-7' | '8-10' | '11-14' | '15-17' | '18+';
    gender: 'male' | 'female' | 'unknown';
    isSetup: boolean;
  };
  
  // Session details
  lastSessionTime: number;
  lastLoginDate: string;
  consecutiveDays: number;
  messages: Message[];
  isSleeping: boolean;
  activeGame: string | null;
  awaitingDialogueTopic: string | null;

  // Actions
  initializeSession: () => void;
  updateStats: (dtMins: number) => void;
  feed: (foodId: string, nutrition: number, moodBoost?: number) => void;
  pet: () => void;
  sleep: (hours: number) => void;
  wakeUp: () => void;
  addCoins: (amount: number) => void;
  addXP: (amount: number) => void;
  toggleSound: () => void;
  buyItem: (type: 'food'|'accessory', id: string, price: number) => boolean;
  equipAccessory: (id: string | null) => void;
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  updateTypingMessage: (text: string) => void;
  removeTypingMessage: () => void;
  setProfile: (profile: Partial<GameState['profile']>) => void;
  startGame: (gameId: string | null) => void;
  addFriendship: (amount: number) => void;
  addMood: (amount: number) => void;
  setAwaitingDialogueTopic: (topic: string | null) => void;
  resetGame: () => void;
}

const initialState = {
  stats: {
    hunger: 80,
    energy: 100,
    mood: 80,
    friendship: 0,
  },
  coins: 50,
  xp: 0,
  level: 1,
  soundEnabled: true,
  inventory: {
    accessories: [],
    food: {},
  },
  equipped: { accessory: null },
  profile: {
    name: 'Друг',
    ageGroup: '8-10' as const,
    gender: 'unknown' as const,
    isSetup: false,
  },
  isSleeping: false,
  activeGame: null,
  awaitingDialogueTopic: null,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,
      lastSessionTime: Date.now(),
      lastLoginDate: new Date().toDateString(),
      consecutiveDays: 1,
      messages: [{ id: 'welcome_1', sender: 'randy', text: 'Мяу! Привет! Я Рэнди. Давай дружить и изучать искусство? 😺🎨', timestamp: Date.now() }],

      initializeSession: () => {
        const { lastSessionTime, updateStats, lastLoginDate, consecutiveDays } = get();
        const now = Date.now();
        const dtMins = (now - lastSessionTime) / (1000 * 60);
        
        if (dtMins > 1) {
          updateStats(dtMins);
        }

        const todayStr = new Date().toDateString();
        if (todayStr !== lastLoginDate && get().profile.isSetup) {
           const MS_IN_DAY = 1000 * 60 * 60 * 24;
           const timeDiff = Math.abs(now - new Date(lastLoginDate).getTime());
           const diffDays = Math.ceil(timeDiff / MS_IN_DAY); 

           let newConsecutive = consecutiveDays;
           if (diffDays === 1) {
              newConsecutive += 1;
           } else {
              newConsecutive = 1; // broken streak
           }

           const dailyScore = 15;
           const dailyXP = 20;
           
           set({ 
              lastLoginDate: todayStr, 
              consecutiveDays: newConsecutive,
              coins: get().coins + dailyScore,
              xp: get().xp + dailyXP
           });

           setTimeout(() => {
               // Give a daily greeting and drop bonus
               get().addMessage({ sender: 'randy', text: `Доброе утро! Рэнди принес тебе подарок на новый день! ✨ +${dailyScore} Р и +${dailyXP} Опыта. Ты заходишь ко мне уже ${newConsecutive} дн. подряд! Рад тебя видеть! Мяу! 🐾🎁` });
           }, 2500);
        }

        set({ lastSessionTime: now });
      },

      updateStats: (dtMins: number) => {
        set((state) => {
          let { hunger, energy, mood, friendship } = state.stats;
          
          hunger = Math.max(0, hunger - (dtMins / 15));
          if (!state.isSleeping) {
             energy = Math.max(0, energy - (dtMins / 20));
          }
          mood = Math.max(0, mood - (dtMins / 30));

          // Simulate long absence greeting
          if (dtMins > 24 * 60 && state.profile.isSetup) {
             setTimeout(() => {
                get().addMessage({ sender: 'randy', text: 'Мяу! Ура, ты вернулся! Я так скучал и ждал тебя! Расскажи, как дела? 😻' });
             }, 2000);
          }

          if (energy < 10 && !state.isSleeping) {
             set({ isSleeping: true });
             setTimeout(() => {
                get().addMessage({ sender: 'randy', text: 'Мр-р... что-то глазки слипаются... 😴 Я немного посплю, хорошо?' });
             }, 1000);
          }

          return {
            stats: { hunger, energy, mood, friendship },
            lastSessionTime: Date.now()
          };
        });
      },

      feed: (foodId, nutrition, moodBoost = 0) => {
        set((state) => {
          const count = state.inventory.food[foodId] || 0;
          if (count > 0) {
            return {
              inventory: {
                ...state.inventory,
                food: { ...state.inventory.food, [foodId]: count - 1 }
              },
              stats: {
                ...state.stats,
                hunger: Math.min(100, state.stats.hunger + nutrition),
                mood: Math.min(100, state.stats.mood + moodBoost),
                friendship: state.stats.friendship + 1
              }
            };
          }
          return state;
        });
      },

      pet: () => {
        set((state) => ({
          stats: {
            ...state.stats,
            friendship: state.stats.friendship + 1,
            mood: Math.min(100, state.stats.mood + 2)
          }
        }));
      },

      sleep: (hours) => {
        set({ isSleeping: true });
        get().addMessage({ sender: 'randy', text: 'Мяу... я тааак устал. Пожалуй, пойду посплю. Спокойной ночи, увидимся завтра! 😴🌙' });
      },

      wakeUp: () => {
        set((state) => ({ 
          isSleeping: false,
          stats: { ...state.stats, energy: 100, mood: Math.min(100, state.stats.mood + 20) },
          lastSessionTime: Date.now()
        }));
      },

      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

      addXP: (amount) => set((state) => {
        const nextXP = state.xp + amount;
        const xpNeeded = state.level * 100; // simple curve
        if (nextXP >= xpNeeded) {
          // level up
          const newLevel = state.level + 1;
          setTimeout(() => {
             get().addMessage({ sender: 'randy', text: `Мяу! Это невероятно! Ты достиг ${newLevel} уровня! У нас новые навыки впереди! 🎉🎨` });
          }, 1000);
          return { xp: nextXP - xpNeeded, level: newLevel };
        }
        return { xp: nextXP };
      }),

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      buyItem: (type, id, price) => {
        const state = get();
        if (state.coins >= price) {
          if (type === 'accessory') {
             if (state.inventory.accessories.includes(id)) return false;
             set({ 
               coins: state.coins - price, 
               inventory: { ...state.inventory, accessories: [...state.inventory.accessories, id] }
             });
             return true;
          } else if (type === 'food') {
             const current = state.inventory.food[id] || 0;
             set({
               coins: state.coins - price,
               inventory: { ...state.inventory, food: { ...state.inventory.food, [id]: current + 1 } }
             });
             return true;
          }
        }
        return false;
      },

      equipAccessory: (id) => set({ equipped: { accessory: id } }),

      addMessage: (msg) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        set((state) => ({
          messages: [...state.messages, { ...msg, id, timestamp: Date.now() }]
        }));
      },

      updateTypingMessage: (text) => {
        set((state) => {
          const lastMsg = state.messages[state.messages.length - 1];
          if (lastMsg && lastMsg.isTyping && lastMsg.sender === 'randy') {
            const newMsgs = [...state.messages];
            newMsgs[newMsgs.length - 1] = { ...lastMsg, text };
            return { messages: newMsgs };
          } else {
             const id = 'typing_' + Date.now();
             return { messages: [...state.messages, { id, sender: 'randy', text, timestamp: Date.now(), isTyping: true }]};
          }
        });
      },

      removeTypingMessage: () => {
         set((state) => ({
            messages: state.messages.filter(m => !m.isTyping)
         }));
      },

      setProfile: (profileUpdates) => set((state) => ({ profile: { ...state.profile, ...profileUpdates } })),
      
      startGame: (gameId) => set({ activeGame: gameId }),

      addFriendship: (amount) => set((state) => ({ stats: { ...state.stats, friendship: state.stats.friendship + amount } })),
      addMood: (amount) => set((state) => ({ stats: { ...state.stats, mood: Math.min(100, state.stats.mood + amount) } })),
      
      setAwaitingDialogueTopic: (topic) => set({ awaitingDialogueTopic: topic }),
      
      resetGame: () => {
        // Clear all storage for a true fresh start as requested
        localStorage.clear();
        sessionStorage.clear();
        // Redirect to clean URL
        window.location.replace(window.location.origin + window.location.pathname);
      }

    }),
    {
      name: 'renderia-cat-storage',
    }
  )
);
