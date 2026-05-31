import React from 'react';
import { Plane, Smartphone, ShoppingBag, Fuel, Utensils, Zap } from 'lucide-react';

interface QuickActionsProps {
  onSelect: (text: string) => void;
  disabled: boolean;
}

const actions = [
  { icon: <Smartphone className="w-3 h-3" />, label: "Electronics", query: "Best card for buying electronics on Amazon/Flipkart?" },
  { icon: <Utensils className="w-3 h-3" />, label: "Food Delivery", query: "Which card gives max rewards on Zomato/Swiggy?" },
  { icon: <Plane className="w-3 h-3" />, label: "Flights", query: "Best card for booking domestic flights right now?" },
  { icon: <Fuel className="w-3 h-3" />, label: "Fuel", query: "Which card to use for fuel surcharge waiver?" },
  { icon: <ShoppingBag className="w-3 h-3" />, label: "Groceries", query: "Best card for grocery shopping on Blinkit/Instamart?" },
  { icon: <Zap className="w-3 h-3" />, label: "Utility Bills", query: "Best card for paying electricity and broadband bills?" },
];

const QuickActions: React.FC<QuickActionsProps> = ({ onSelect, disabled }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide mask-fade-right">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(10);
            onSelect(action.query);
          }}
          disabled={disabled}
          className="flex items-center gap-1.5 bg-white dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500/50 text-gray-700 dark:text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm dark:shadow-none"
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default QuickActions;