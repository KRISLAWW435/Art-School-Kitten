import React from 'react';
import { useGameStore } from '../store/gameStore';
import { X, Fish, Cookie, Utensils } from 'lucide-react';

const SHOP_ITEMS = {
    food: [
        { id: 'fish', name: 'Рыбка', icon: Fish, price: 30, nutrition: 30, moodBoost: 5, color: 'text-blue-500', bg: 'bg-blue-100' },
        { id: 'cookie', name: 'Печенье', icon: Cookie, price: 15, nutrition: 15, moodBoost: 2, color: 'text-orange-500', bg: 'bg-orange-100' },
        { id: 'premium', name: 'Премиум-корм', icon: Utensils, price: 50, nutrition: 50, moodBoost: 10, color: 'text-purple-500', bg: 'bg-purple-100' },
    ]
};

export const ShopModal = ({ onClose }: { onClose: () => void }) => {
   const { coins, buyItem, feed } = useGameStore();

   const handleBuyFood = (item: any) => {
       if (buyItem('food', item.id, item.price)) {
           // Instantly feed as well for simplicity, though normally buys to inventory
           feed(item.id, item.nutrition, item.moodBoost);
       } else {
           alert("Не хватает Рекоинов!");
       }
   };

   return (
       <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative">
               <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors z-10"
               >
                   <X size={20} />
               </button>

               <div className="p-6 bg-slate-50 border-b border-slate-100">
                   <h2 className="text-2xl font-bold text-slate-800">Магазин</h2>
                   <p className="text-slate-500 text-sm">Твой баланс: <strong className="text-yellow-600">{coins} Р</strong></p>
               </div>

               <div className="p-6">
                   <h3 className="font-bold text-slate-700 mb-4">Вкусняшки (Моментально кормят)</h3>
                   <div className="space-y-3">
                       {SHOP_ITEMS.food.map(item => (
                           <div key={item.id} className="flex flex-row items-center justify-between p-3 border border-slate-100 rounded-2xl hover:border-slate-300 transition-colors bg-white">
                               <div className="flex items-center gap-3">
                                   <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                                       <item.icon size={24} />
                                   </div>
                                   <div>
                                       <h4 className="font-bold text-slate-800">{item.name}</h4>
                                       <p className="text-xs text-slate-500">+{item.nutrition} Сытость</p>
                                   </div>
                               </div>
                               <button 
                                  onClick={() => handleBuyFood(item)}
                                  disabled={coins < item.price}
                                  className={`px-4 py-2 font-bold rounded-xl transition-colors ${
                                      coins >= item.price 
                                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  }`}
                               >
                                   {item.price} Р
                               </button>
                           </div>
                       ))}
                   </div>
               </div>
           </div>
       </div>
   );
};
