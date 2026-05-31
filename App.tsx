import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, ChatMessage as ChatMessageType, AdvisorResponse } from './types';
import CardWallet from './components/CardWallet';
import ChatMessage from './components/ChatMessage';
import QuickActions from './components/QuickActions';
import { sendMessageToAdvisor } from './services/geminiService';
import { fetchUserData, syncUserData } from './services/dbService';
import { ShoppingBag, Send, Loader2, Menu, LogOut, CloudCheck, CloudOff, WifiOff, RotateCcw, X, Mic, MicOff, Sun, Moon, Share2, MoreVertical } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem('smartwallet_email'));
  const [cards, setCards] = useState<CreditCard[]>(() => JSON.parse(localStorage.getItem('smartwallet_cards') || '[]'));
  const [messages, setMessages] = useState<ChatMessageType[]>(() => JSON.parse(localStorage.getItem('smartwallet_messages') || '[]'));
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [showMobileWallet, setShowMobileWallet] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('smartwallet_theme');
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Sync theme to DOM
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('smartwallet_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Persistence
  useEffect(() => {
    localStorage.setItem('smartwallet_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('smartwallet_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (email) localStorage.setItem('smartwallet_email', email);
    else localStorage.removeItem('smartwallet_email');
  }, [email]);

  // Click outside listener for more menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Speech Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (navigator.vibrate) navigator.vibrate(20);
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleShareApp = async () => {
    const text = "Maximize your credit card rewards with smartsaving.cards! 🇮🇳💳";
    if (navigator.share) {
      try {
        await navigator.share({ title: 'smartsaving.cards', text, url: window.location.href });
      } catch (err) {}
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        alert("Link copied to clipboard!");
      } catch (err) {}
    }
    setShowMoreMenu(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSync = async () => {
    if (!email) {
      const newEmail = prompt("Enter your email to sync data across devices:");
      if (newEmail && newEmail.includes('@')) {
        setSyncing(true);
        const data = await fetchUserData(newEmail);
        if (data) {
          if (confirm("Found existing data in the cloud. Overwrite local data?")) {
            setCards(data.cards);
            setMessages(data.messages);
          }
        }
        setEmail(newEmail);
        await syncUserData(newEmail, cards, messages);
        setSyncing(false);
      }
    } else {
      setSyncing(true);
      const success = await syncUserData(email, cards, messages);
      setSyncError(!success);
      setSyncing(false);
      if (success) {
        setTimeout(() => setSyncError(false), 3000);
      }
    }
  };

  const handleClearChat = () => {
    if (messages.length > 0 && confirm("Are you sure you want to clear the entire chat history?")) {
      setMessages([]);
      setShowMoreMenu(false);
    }
  };

  const handleResetApp = () => {
    if (confirm("This will permanently delete ALL cards and messages from this device. Continue?")) {
      setEmail(null);
      setCards([]);
      setMessages([]);
      localStorage.clear();
      setShowMoreMenu(false);
    }
  };

  const handleAddCard = (name: string) => {
    if (!cards.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      const newCard: CreditCard = { id: generateId(), name };
      setCards(prev => [...prev, newCard]);
      if (email) syncUserData(email, [...cards, newCard], messages);
    }
  };

  const handleRemoveCard = (id: string) => {
    const updatedCards = cards.filter(c => c.id !== id);
    setCards(updatedCards);
    if (email) syncUserData(email, updatedCards, messages);
  };

  const handleSendMessage = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim()) return;

    if (navigator.vibrate) navigator.vibrate(10);
    setShowMobileWallet(false);

    const userMsg: ChatMessageType = {
      id: generateId(),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendMessageToAdvisor(cards, userMsg.text);
      
      // Auto-add cards if the AI detects the user has them but they aren't in the wallet
      if (response.extractedCards && response.extractedCards.length > 0) {
        const currentNames = cards.map(c => c.name.toLowerCase());
        const newDetectedCards = response.extractedCards
          .filter(name => !currentNames.includes(name.toLowerCase()))
          .map(name => ({ id: generateId(), name }));
        
        if (newDetectedCards.length > 0) {
          setCards(prev => [...prev, ...newDetectedCards]);
        }
      }

      const botMsg: ChatMessageType = {
        id: generateId(),
        role: 'assistant',
        text: response.responseText,
        recommendation: response.recommendation,
        sources: response.sources,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMsg]);
      if (email) syncUserData(email, cards, [...messages, userMsg, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden w-full relative touch-none transition-colors duration-300">
      <header className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-3 md:p-4 flex items-center justify-between shrink-0 z-50 h-16">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowMobileWallet(true)} 
            className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg active:scale-95 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-base md:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 truncate">
              smartsaving
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 md:gap-3">
          <button 
            onClick={handleSync} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
              email 
                ? (syncError ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20') 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {syncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : email ? (
              syncError ? <WifiOff className="w-3.5 h-3.5" /> : <CloudCheck className="w-3.5 h-3.5" />
            ) : (
              <CloudOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{email ? (syncError ? 'Failed' : 'Synced') : 'Sync'}</span>
          </button>

          <div className="relative" ref={moreMenuRef}>
            <button 
              onClick={() => setShowMoreMenu(!showMoreMenu)} 
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg active:scale-95 transition-all"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMoreMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 py-2 animate-in fade-in zoom-in-95 duration-100 z-[60]">
                <button 
                  onClick={toggleTheme} 
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button 
                  onClick={handleShareApp} 
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-indigo-500" />
                  <span>Share App</span>
                </button>
                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                <button 
                  onClick={handleClearChat} 
                  disabled={messages.length === 0}
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-30"
                >
                  <RotateCcw className="w-4 h-4 text-orange-500" />
                  <span>Clear Chat</span>
                </button>
                <button 
                  onClick={handleResetApp} 
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Reset App</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-80 lg:w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 overflow-y-auto custom-scrollbar">
          <CardWallet cards={cards} onAddCard={handleAddCard} onRemoveCard={handleRemoveCard} />
          <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">How it works</h3>
            <p className="text-[11px] leading-relaxed text-indigo-900/70 dark:text-indigo-300/60 font-medium">
              We track real-time bank offers across 500+ merchants in India. Just ask about a store, and we'll tell you which card from your wallet saves you the most money.
            </p>
          </div>
        </aside>

        {/* Mobile Sidebar (Drawer) */}
        {showMobileWallet && (
          <div className="absolute inset-0 z-[60] md:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowMobileWallet(false)} />
            <div className="absolute top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-gray-900 shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-bold">My Wallet</h2>
                <button onClick={() => setShowMobileWallet(false)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <CardWallet cards={cards} onAddCard={handleAddCard} onRemoveCard={handleRemoveCard} />
              </div>
            </div>
          </div>
        )}

        {/* Chat Main Area */}
        <main className="flex-1 flex flex-col relative w-full overflow-hidden bg-gray-50 dark:bg-gray-950">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 overscroll-contain custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-6 rounded-3xl mb-6">
                  <ShoppingBag className="w-16 h-16 text-indigo-500 animate-bounce" />
                </div>
                <h2 className="text-2xl font-black mb-2 tracking-tight">Ready to save?</h2>
                <p className="text-sm max-w-xs mb-8 font-medium">Mention what you're buying (e.g., "iPhone 15 on Flipkart") and I'll find the best card for you.</p>
                <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
                  <button onClick={() => handleSendMessage("Best card for Amazon shopping today?")} className="bg-white dark:bg-gray-800 p-4 rounded-2xl text-xs font-bold shadow-sm border border-gray-200 dark:border-gray-700 text-left hover:border-indigo-500 transition-all active:scale-95">
                    "Best card for Amazon today?"
                  </button>
                  <button onClick={() => handleSendMessage("How can I save on flight bookings?")} className="bg-white dark:bg-gray-800 p-4 rounded-2xl text-xs font-bold shadow-sm border border-gray-200 dark:border-gray-700 text-left hover:border-indigo-500 transition-all active:scale-95">
                    "Save on flight bookings?"
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto w-full">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {loading && (
                  <div className="flex items-center gap-2 p-4 bg-white dark:bg-gray-800/40 rounded-2xl w-fit border border-gray-100 dark:border-transparent animate-pulse ml-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>

          {/* Input Bar Section */}
          <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <div className="max-w-4xl mx-auto">
              <QuickActions onSelect={(q) => handleSendMessage(q)} disabled={loading} />
              <div className="flex items-end gap-2 mt-2">
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center focus-within:ring-2 ring-indigo-500/50 focus-within:border-transparent transition-all">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="What are you planning to buy?"
                    className="w-full bg-transparent border-none text-base p-4 focus:ring-0 resize-none max-h-32 min-h-[56px] custom-scrollbar"
                    rows={1}
                  />
                  <button 
                    onClick={toggleListening} 
                    className={`p-3 mr-1 rounded-xl transition-all active:scale-90 ${isListening ? 'text-red-500 animate-pulse bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:text-indigo-600'}`}
                    title="Voice input"
                  >
                    {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                </div>
                <button 
                  onClick={() => handleSendMessage()} 
                  disabled={!input.trim() || loading} 
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl w-14 h-14 flex items-center justify-center shadow-lg shadow-indigo-600/30 active:scale-95 transition-all shrink-0"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                </button>
              </div>
              <p className="text-[9px] text-center text-gray-400 mt-2 font-medium">
                smartsaving uses AI and live web data to suggest the best card for you.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
