import React, { useState } from 'react';
import { RecommendationResult } from '../types';
import { Info, Zap, TrendingUp, Share2, Check } from 'lucide-react';

interface RecommendationProps {
  result: RecommendationResult;
  onReset: () => void;
}

const Recommendation: React.FC<RecommendationProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  
  // Guard against missing comparison array
  const comparisonData = result.comparison || [];
  const sortedComparison = [...comparisonData].sort((a, b) => b.estimatedValue - a.estimatedValue);

  const handleShare = async () => {
    const text = `💳 Smart Saving Tip:\nUse ${result.recommendedCardName} for max rewards!\n💡 ${result.reason}\n\nCheck your cards at smartsaving.cards`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Credit Card Recommendation',
          text: text,
          url: 'https://smartsaving.cards'
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy');
      }
    }
  };

  if (!result.recommendedCardName) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl md:rounded-3xl shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden w-full max-w-full md:max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors duration-300 relative group">
      
      {/* Primary Suggestion - The Winner */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-gray-50 dark:from-indigo-600/20 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 relative">
        <div className="absolute top-4 right-4 md:right-6 opacity-20 pointer-events-none">
          <TrendingUp className="w-8 h-8 md:w-12 md:h-12 text-indigo-500 dark:text-indigo-400" />
        </div>
        
        {/* Share Button (Top Right) */}
        <button 
          onClick={handleShare}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/50 dark:bg-black/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-gray-600 dark:text-gray-300 transition-all backdrop-blur-sm shadow-sm"
          aria-label="Share recommendation"
          title="Share this tip"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
        </button>
        
        <div className="relative z-10 pr-8">
          <div className="flex items-center gap-2 mb-2 md:mb-3">
            <span className="bg-indigo-600 dark:bg-indigo-500 text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 md:px-2 md:py-1 rounded shadow-lg shadow-indigo-500/20">
              Best Reward
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-1 md:mb-2 break-words">
            {result.recommendedCardName}
          </h2>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium max-w-md">
            {result.reason}
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      {sortedComparison.length > 0 && (
        <div className="bg-white dark:bg-gray-900/50 p-0 md:p-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="py-2 md:py-3 px-3 md:px-4 text-[10px] uppercase tracking-wider text-gray-400 font-semibold w-2/5">Card</th>
                  <th className="py-2 md:py-3 px-3 md:px-4 text-[10px] uppercase tracking-wider text-gray-400 font-semibold w-1/5">Reward</th>
                  <th className="py-2 md:py-3 px-3 md:px-4 text-[10px] uppercase tracking-wider text-gray-400 font-semibold w-2/5">Benefit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {sortedComparison.map((row, idx) => {
                  const isWinner = row.cardName === result.recommendedCardName;
                  return (
                    <tr key={idx} className={`group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isWinner ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                      <td className="py-2 md:py-3 px-3 md:px-4">
                        <div className="flex items-center gap-2">
                          {isWinner && <Zap className="w-3 h-3 text-amber-500 shrink-0 fill-amber-500" />}
                          <span className={`text-xs md:text-sm font-medium ${isWinner ? 'text-indigo-900 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300'}`}>
                            {row.cardName}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 md:py-3 px-3 md:px-4">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] md:text-xs font-bold ${
                          isWinner 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {row.rewardRate}
                        </span>
                      </td>
                      <td className="py-2 md:py-3 px-3 md:px-4">
                        <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-500 leading-tight line-clamp-2" title={row.explanation}>
                          {row.explanation}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Footer Disclaimer */}
      <div className="bg-gray-50 dark:bg-gray-950 p-2 md:p-3 flex items-center gap-2 text-[9px] md:text-[10px] text-gray-400 border-t border-gray-100 dark:border-gray-800">
        <Info className="w-3 h-3 shrink-0" />
        <p>Values are estimates based on standard reward rates and current offers.</p>
      </div>
    </div>
  );
};

export default Recommendation;