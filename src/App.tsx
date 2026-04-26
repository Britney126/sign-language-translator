import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SignToText } from './components/SignToText';
import { TextToSign } from './components/TextToSign';
import { LearningMode } from './components/LearningMode';
import { LearningRooms } from './components/LearningRooms';
import { HistoryView, HistoryItem } from './components/HistoryView';
import { ScenarioShortcuts } from './components/ScenarioShortcuts';
import { ShareDialog } from './components/ShareDialog';
import { ChatMessage } from './services/geminiService';
import { LoginView } from './components/LoginView';
import { Onboarding } from './components/Onboarding';
import { motion, AnimatePresence } from 'motion/react';
import { Hand, MessageSquare, Sparkles, BookOpen, History as HistoryIcon, Heart, Star, Cloud, Sun, Moon, Umbrella, Coffee, Music, Camera, Palette, Users } from 'lucide-react';
import { translations } from './constants';
import { cn } from './lib/utils';

// Local user type
interface LocalUser {
  uid: string;
  username: string;
  password: string; // 实际项目中应该使用加密存储
  email: string;
  displayName: string;
  isAnonymous: boolean;
  hasCompletedOnboarding: boolean;
  language: 'zh' | 'en';
  createdAt: number;
  lastLogin: number;
}

// Users storage interface
interface UsersStorage {
  [username: string]: LocalUser;
}

const DecorativeBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <motion.div
      animate={{ 
        y: [0, -20, 0],
        rotate: [0, 10, 0],
        scale: [1, 1.1, 1]
      }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[10%] left-[5%] text-rose-400/20"
    >
      <Heart size={48} fill="currentColor" />
    </motion.div>
    <motion.div
      animate={{ 
        y: [0, 20, 0],
        rotate: [0, -15, 0],
        scale: [1, 1.2, 1]
      }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute top-[20%] right-[8%] text-amber-400/20"
    >
      <Star size={64} fill="currentColor" />
    </motion.div>
    <motion.div
      animate={{ 
        x: [0, 30, 0],
        y: [0, -10, 0]
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-[15%] left-[10%] text-orange-400/15"
    >
      <Cloud size={80} fill="currentColor" />
    </motion.div>
    <motion.div
      animate={{ 
        scale: [1, 1.1, 1],
        rotate: [0, 90, 0]
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-[10%] right-[12%] text-yellow-400/20"
    >
      <Sun size={56} />
    </motion.div>
    <motion.div
      animate={{ 
        rotate: [0, -360, 0],
        scale: [1, 0.9, 1]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-[40%] left-[15%] text-pink-400/15"
    >
      <Music size={40} />
    </motion.div>
    <motion.div
      animate={{ 
        y: [0, -30, 0],
        x: [0, 10, 0]
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute top-[60%] right-[20%] text-rose-300/15"
    >
      <Coffee size={44} />
    </motion.div>
    <motion.div
      animate={{ 
        scale: [1, 1.3, 1],
        opacity: [0.05, 0.2, 0.05]
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[15%] left-[40%] text-orange-300/10"
    >
      <Palette size={120} />
    </motion.div>
  </div>
);

// Local storage utility functions
function getLocalStorage(key: string, defaultValue: any) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}

function setLocalStorage(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

// Generate random ID
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'translate' | 'learn' | 'rooms' | 'history'>('translate');
  const [translateMode, setTranslateMode] = useState<'sign-to-text' | 'text-to-sign'>('sign-to-text');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareContent, setShareContent] = useState('');
  const [inputText, setInputText] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const t = translations[language];

  // Initialize user from local storage
  useEffect(() => {
    try {
      const savedUser = getLocalStorage('yuxi_user', null);
      if (savedUser) {
        setUser(savedUser);
        setIsGuest(savedUser.isAnonymous);
        if (!savedUser.hasCompletedOnboarding) {
          setShowOnboarding(true);
        }
        if (savedUser.language) {
          setLanguage(savedUser.language);
        }
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLanguageChange = (newLang: 'zh' | 'en') => {
    setLanguage(newLang);
    if (user) {
      const updatedUser = { ...user, language: newLang };
      setUser(updatedUser);
      setLocalStorage('yuxi_user', updatedUser);
    }
  };

  // Get users from local storage
  const getUsers = (): UsersStorage => {
    return getLocalStorage('yuxi_users', {});
  };

  // Save users to local storage
  const saveUsers = (users: UsersStorage) => {
    setLocalStorage('yuxi_users', users);
  };

  const handleLogin = async (username: string, password: string) => {
    const users = getUsers();
    const user = users[username];
    
    if (!user) {
      throw new Error(language === 'zh' ? '账户不存在' : 'Account does not exist');
    }
    
    if (user.password !== password) {
      throw new Error(language === 'zh' ? '密码错误' : 'Incorrect password');
    }
    
    // Update last login time
    const updatedUser = {
      ...user,
      lastLogin: Date.now()
    };
    
    // Save updated user
    const updatedUsers = {
      ...users,
      [username]: updatedUser
    };
    saveUsers(updatedUsers);
    
    setUser(updatedUser);
    setIsGuest(false);
    setLocalStorage('yuxi_user', updatedUser);
    
    if (!updatedUser.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  };

  const handleRegister = async (username: string, password: string) => {
    const users = getUsers();
    
    if (users[username]) {
      throw new Error(language === 'zh' ? '账户名已存在' : 'Username already exists');
    }
    
    const newUser: LocalUser = {
      uid: `user_${generateId()}`,
      username: username,
      password: password, // 实际项目中应该使用加密存储
      email: `${username}@example.com`, // 模拟邮箱
      displayName: username,
      isAnonymous: false,
      hasCompletedOnboarding: getLocalStorage('yuxi_guest_onboarding', false),
      language: language,
      createdAt: Date.now(),
      lastLogin: Date.now()
    };
    
    const updatedUsers = {
      ...users,
      [username]: newUser
    };
    saveUsers(updatedUsers);
    
    setUser(newUser);
    setIsGuest(false);
    setLocalStorage('yuxi_user', newUser);
    
    if (!newUser.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  };

  const handleGuestMode = () => {
    const guestUser: LocalUser = {
      uid: `guest_${generateId()}`,
      username: `guest_${generateId()}`,
      password: '',
      email: '',
      displayName: 'Guest',
      isAnonymous: true,
      hasCompletedOnboarding: getLocalStorage('yuxi_guest_onboarding', false),
      language: language,
      createdAt: Date.now(),
      lastLogin: Date.now()
    };
    setUser(guestUser);
    setIsGuest(true);
    setLocalStorage('yuxi_user', guestUser);
    
    if (!guestUser.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
    if (user) {
      const updatedUser = { ...user, hasCompletedOnboarding: true };
      setUser(updatedUser);
      setLocalStorage('yuxi_user', updatedUser);
    }
    localStorage.setItem('yuxi_guest_onboarding', 'true');
  };

  // Load history from localStorage
  useEffect(() => {
    if (user) {
      const historyKey = user.isAnonymous ? `yuxi_history_guest_${user.uid}` : `yuxi_history_${user.username}`;
      const saved = localStorage.getItem(historyKey);
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse history", e);
        }
      } else {
        setHistory([]);
      }
    }
  }, [user]);

  // Save history to localStorage
  useEffect(() => {
    if (user) {
      const historyKey = user.isAnonymous ? `yuxi_history_guest_${user.uid}` : `yuxi_history_${user.username}`;
      localStorage.setItem(historyKey, JSON.stringify(history));
    }
  }, [history, user]);

  const addToHistory = (type: 'sign-to-text' | 'text-to-sign' | 'learn', content: string) => {
    const newItem: HistoryItem = {
      id: generateId(),
      type,
      content,
      timestamp: Date.now()
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50)); // Keep last 50

    // Update chat history for context
    if (type !== 'learn') {
      setChatHistory(prev => {
        const newMsg: ChatMessage = {
          role: type === 'text-to-sign' ? 'user' : 'model',
          parts: [{ text: content }]
        };
        return [...prev, newMsg].slice(-10); // Keep last 10 messages for context
      });
    }
  };

  const handleShare = (content: string) => {
    setShareContent(content);
    setIsShareOpen(true);
    addToHistory(translateMode, content);
  };

  const handleScenarioSelect = (text: string) => {
    setInputText(text);
    setActiveTab('translate');
    setTranslateMode('text-to-sign');
  };

  const clearHistory = () => {
    if (window.confirm("确定要清空所有记录吗？")) {
      setHistory([]);
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleLogout = () => {
    setUser(null);
    setIsGuest(false);
    setShowOnboarding(false);
    localStorage.removeItem('yuxi_user');
    localStorage.removeItem('yuxi_guest_onboarding');
  };

  const handleResetOnboarding = () => {
    setShowOnboarding(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 bg-primary rounded-2xl"
        />
      </div>
    );
  }

  if (!user && !isGuest) {
    return (
      <LoginView 
        onLogin={handleLogin} 
        onRegister={handleRegister}
        onGuest={handleGuestMode} 
        language={language}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-rose-200 relative">
      <DecorativeBackground />
      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={completeOnboarding} language={language} />}
      </AnimatePresence>
      <Header onLogout={handleLogout} onResetOnboarding={handleResetOnboarding} />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 sm:py-12 space-y-12">
        {/* Intro Section */}
        <section className="text-center space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md text-primary rounded-full text-sm font-bold shadow-lg shadow-rose-900/5 border border-rose-100"
          >
            <Sparkles size={18} className="animate-pulse" />
            <span>{t.intro.badge}</span>
          </motion.div>
          
          <div className="space-y-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] gradient-text"
            >
              {t.intro.title}
            </motion.h2>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "140px" }}
              className="h-2.5 bg-gradient-to-r from-[#ff5a5f] via-[#ff4d6d] to-[#ff8a5c] mx-auto rounded-full"
            />
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-accessible-lg text-rose-900/60 max-w-2xl mx-auto font-medium"
          >
            {t.intro.subtitle}
          </motion.p>
        </section>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap justify-center gap-2 p-1.5 bg-rose-100/50 backdrop-blur-sm rounded-[2.5rem] w-full max-w-2xl mx-auto border border-rose-100">
          <button
            onClick={() => setActiveTab('translate')}
            className={`flex items-center gap-2 px-6 py-3 rounded-[2rem] text-sm font-bold transition-all ${
              activeTab === 'translate' 
              ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
              : 'text-rose-400 hover:text-rose-600'
            }`}
          >
            <Hand size={18} /> {t.nav.translate}
          </button>
          <button
            onClick={() => setActiveTab('learn')}
            className={`flex items-center gap-2 px-6 py-3 rounded-[2rem] text-sm font-bold transition-all ${
              activeTab === 'learn' 
              ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
              : 'text-rose-400 hover:text-rose-600'
            }`}
          >
            <BookOpen size={18} /> {t.nav.learn}
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center gap-2 px-6 py-3 rounded-[2rem] text-sm font-bold transition-all ${
              activeTab === 'rooms' 
              ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
              : 'text-rose-400 hover:text-rose-600'
            }`}
          >
            <Users size={18} /> {translations[language].rooms.title}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-3 rounded-[2rem] text-sm font-bold transition-all ${
              activeTab === 'history' 
              ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
              : 'text-rose-400 hover:text-rose-600'
            }`}
          >
            <HistoryIcon size={18} /> {t.nav.history}
          </button>
        </nav>

        <section className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'translate' && (
              <motion.div
                key="translate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex p-1.5 bg-rose-50 rounded-[2rem] w-full max-w-md mx-auto border border-rose-100">
                  <button
                    onClick={() => setTranslateMode('sign-to-text')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.75rem] text-sm font-bold transition-all ${
                      translateMode === 'sign-to-text' 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-rose-400 hover:text-rose-600'
                    }`}
                  >
                    {t.modes.signToText}
                  </button>
                  <button
                    onClick={() => setTranslateMode('text-to-sign')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.75rem] text-sm font-bold transition-all ${
                      translateMode === 'text-to-sign' 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-rose-400 hover:text-rose-600'
                    }`}
                  >
                    {t.modes.textToSign}
                  </button>
                </div>

                {translateMode === 'sign-to-text' ? (
                  <SignToText 
                    onShare={handleShare} 
                    onComplete={(content) => addToHistory('sign-to-text', content)} 
                    chatHistory={chatHistory}
                    language={language}
                  />
                ) : (
                  <TextToSign 
                    onShare={handleShare} 
                    onComplete={(content) => addToHistory('text-to-sign', content)}
                    inputText={inputText} 
                    setInputText={setInputText} 
                    chatHistory={chatHistory}
                    language={language}
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'learn' && (
              <motion.div
                key="learn"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <LearningMode 
                  onComplete={(content) => addToHistory('learn', content)} 
                  language={language}
                />
              </motion.div>
            )}

            {activeTab === 'rooms' && (
              <motion.div
                key="rooms"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <LearningRooms language={language} user={user} isGuest={isGuest} />
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <HistoryView 
                  history={history} 
                  onClear={clearHistory} 
                  onDelete={deleteHistoryItem} 
                  language={language}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Scenario Shortcuts */}
        {activeTab === 'translate' && (
          <section>
            <ScenarioShortcuts onSelect={handleScenarioSelect} language={language} />
          </section>
        )}

        {/* Footer Info */}
        <footer className="pt-12 pb-8 border-t border-rose-100 text-center space-y-6">
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-rose-300">
            <a href="#" className="hover:text-primary transition-colors">关于项目</a>
            <a href="#" className="hover:text-primary transition-colors">使用指南</a>
            <a href="#" className="hover:text-primary transition-colors">隐私政策</a>
            <a href="#" className="hover:text-primary transition-colors">反馈建议</a>
          </div>
          <p className="text-xs text-rose-300">
            © 2026 语隙 (YuXi) - 用技术弥合数字鸿沟 · 温馨无障碍沟通项目
          </p>
        </footer>
      </main>

      <ShareDialog 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
        content={shareContent} 
      />
    </div>
  );
}
