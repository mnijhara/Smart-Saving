import React, { useState, useRef, useEffect } from 'react';
import { CreditCard, PRESET_CARDS } from '../types';
import { Plus, Trash2, CreditCard as CardIcon, Wallet } from 'lucide-react';

interface CardWalletProps {
  cards: CreditCard[];
  onAddCard: (name: string) => void;
  onRemoveCard: (id: string) => void;
}

const CardWallet: React.FC<CardWalletProps> = ({ cards, onAddCard, onRemoveCard }) => {
  const [newCardName, setNewCardName] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowPresets(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = () => {
    if (newCardName.trim()) {
      onAddCard(newCardName.trim());
      setNewCardName('');
      setShowPresets(false);
    }
  };

  const handleSelectPreset = (name: string) => {
    onAddCard(name);
    setShowPresets(false);
    setNewCardName('');
  };

  const getCardStyle = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hues = [
      'from-blue-600 to-blue-800',
      'from-purple-600 to-purple-800',
      'from-emerald-600 to-emerald-800',
      'from-amber-600 to-amber-800',
      'from-rose-600 to-rose-800',
      'from-slate-600 to-slate-800',
      'from-indigo-600 to-indigo-800'
    ];
    return hues[hash % hues.length];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm dark:shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300" ref={containerRef}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
          <Wallet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          My Wallet
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{cards.length} cards</span>
      </div>

      {/* Card List */}
      <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {cards.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <p className="text-sm font-medium">No cards added yet.</p>
            <p className="text-xs mt-1 opacity-60">Add your credit cards to start saving.</p>
          </div>
        ) : (
          cards.map((card) => (
            <div 
              key={card.id} 
              className={`relative group overflow-hidden rounded-lg p-4 bg-gradient-to-br ${getCardStyle(card.name)} shadow-md transition-all hover:translate-y-[-2px]`}
            >
              <div className="flex justify-between items-start z-10 relative">
                <div className="flex flex-col">
                  <span className="text-[9px] text-white/60 uppercase tracking-widest font-black">Verified Card</span>
                  <span className="text-base font-bold text-white mt-1 leading-tight">{card.name}</span>
                </div>
                <button
                  onClick={() => onRemoveCard(card.id)}
                  className="text-white/60 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
                  aria-label="Remove card"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <CardIcon className="absolute bottom-[-10px] right-[-10px] w-20 h-20 text-white/5 rotate-[-15deg]" />
            </div>
          ))
        )}
      </div>

      {/* Add Card Input */}
      <div className="relative">
        <div className="flex gap-2 relative z-20">
          <div className="relative flex-1">
            <input
              type="text"
              value={newCardName}
              onChange={(e) => setNewCardName(e.target.value)}
              placeholder="e.g. HDFC Infinia"
              className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 px-4 text-base text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              onFocus={() => setShowPresets(true)}
            />
            {showPresets && newCardName.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto overflow-x-hidden p-1 backdrop-blur-xl">
                <div className="px-3 py-2 text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Popular Options</div>
                {PRESET_CARDS.filter(p => !cards.some(c => c.name === p)).map(preset => (
                  <button
                    key={preset}
                    onClick={() => handleSelectPreset(preset)}
                    className="w-full text-left px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-600 hover:text-indigo-700 dark:hover:text-white rounded-lg transition-all"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={!newCardName.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:grayscale text-white px-4 rounded-lg font-bold transition-all flex items-center justify-center shrink-0"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardWallet;