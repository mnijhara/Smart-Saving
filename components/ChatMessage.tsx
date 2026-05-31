import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { Bot, User, ExternalLink, ShieldCheck } from 'lucide-react';
import Recommendation from './Recommendation';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'assistant';

  return (
    <div className={`flex gap-3 md:gap-4 ${isBot ? 'bg-white dark:bg-gray-800/40 shadow-sm dark:shadow-none border border-gray-200 dark:border-transparent rounded-2xl rounded-tl-none' : 'bg-transparent'} p-3 md:p-6 animate-fade-in mb-2`}>
      <div className={`shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center ${isBot ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
        {isBot ? <Bot className="w-3.5 h-3.5 md:w-5 md:h-5 text-white" /> : <User className="w-3.5 h-3.5 md:w-5 md:h-5 text-gray-700 dark:text-white" />}
      </div>
      
      <div className="flex-1 space-y-3 md:space-y-4 min-w-0">
        <div className="overflow-x-auto">
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed break-words
            prose-p:my-1 md:prose-p:my-2 prose-ul:my-1 md:prose-ul:my-2 prose-li:my-0.5 md:prose-li:my-1 prose-strong:text-indigo-600 dark:prose-strong:text-indigo-300">
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        </div>

        {message.recommendation && (
          <div className="mt-1 md:mt-2">
            <Recommendation 
              result={message.recommendation} 
              onReset={() => {}} 
            />
          </div>
        )}

        {isBot && message.sources && message.sources.length > 0 && (
          <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center gap-2 mb-2 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" />
              Reference Data
            </div>
            <div className="flex flex-wrap gap-2">
              {message.sources.slice(0, 3).map((source, idx) => (
                <a 
                  key={idx}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 px-2 py-1 rounded-md text-gray-600 dark:text-gray-400 transition-colors"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                  <span className="truncate max-w-[100px] md:max-w-[120px]">{source.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;