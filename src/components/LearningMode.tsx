import React, { useState } from 'react';
import { BookOpen, Search, Sparkles, ArrowRight, Heart, Star, RefreshCw, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../constants';
import { SignLearningCenter } from './SignLearningCenter';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export function LearningMode({ onComplete, language = 'zh' }: { onComplete: (content: string) => void, language?: 'zh' | 'en' }) {
  const [view, setView] = useState<'center' | 'search'>('center');
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [material, setMaterial] = useState<string | null>(null);
  const t = translations[language].learn;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setIsLoading(true);
    try {
      // Call API
      const response = await fetch('/api/get-learning-material', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topic, lang: language })
      });
      const data = await response.json();
      if (data.success) {
        const result = data.result;
        setMaterial(result);
        onComplete(`${language === 'zh' ? '学习主题' : 'Learning Topic'}: ${topic}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* View Toggle */}
      <div className="flex justify-center">
        <div className="flex p-1.5 bg-rose-100/50 backdrop-blur-sm rounded-[2rem] border border-rose-100">
          <button
            onClick={() => setView('center')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.5rem] text-sm font-bold transition-all ${
              view === 'center' 
              ? 'bg-white text-primary shadow-sm' 
              : 'text-rose-400 hover:text-rose-600'
            }`}
          >
            <LayoutGrid size={18} /> {language === 'zh' ? '学习中心' : 'Learning Center'}
          </button>
          <button
            onClick={() => setView('search')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.5rem] text-sm font-bold transition-all ${
              view === 'search' 
              ? 'bg-white text-primary shadow-sm' 
              : 'text-rose-400 hover:text-rose-600'
            }`}
          >
            <Search size={18} /> {language === 'zh' ? 'AI 探索' : 'AI Explore'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'center' ? (
          <motion.div
            key="center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SignLearningCenter language={language} />
          </motion.div>
        ) : (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto text-primary shadow-xl shadow-primary/10"
              >
                <Sparkles size={40} />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-rose-950 tracking-tight uppercase">
                  {language === 'zh' ? 'AI 知识探索' : 'AI Knowledge Explorer'}
                </h2>
                <p className="text-rose-400 font-medium">{t.subtitle}</p>
              </div>
            </div>

            <div className="card-accessible bg-white/60 backdrop-blur-xl border-white/60 shadow-2xl p-8">
              <form onSubmit={handleSearch} className="relative group">
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t.placeholder}
                  className="w-full pl-16 pr-40 py-6 rounded-[2rem] border-2 border-white bg-white/40 focus:bg-white focus:border-primary focus:ring-0 transition-all text-xl font-bold text-rose-950 placeholder:text-rose-200 shadow-inner"
                />
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform" size={28} />
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn-accessible btn-primary py-4 px-10 text-base font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="animate-spin" size={20} />
                      <span>{t.exploring}</span>
                    </div>
                  ) : t.start}
                </button>
              </form>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-2xl border border-rose-100">
                  <Star size={16} className="text-primary fill-primary" />
                  <span className="text-xs font-black text-rose-950 uppercase tracking-widest">{t.hotTopics}</span>
                </div>
                {t.quickTopics.map(topicName => (
                  <button 
                    key={topicName}
                    onClick={() => { setTopic(topicName); }}
                    className="px-5 py-2.5 rounded-2xl bg-white hover:bg-primary text-rose-500 hover:text-white text-sm font-bold transition-all duration-300 border border-rose-50 shadow-sm hover:shadow-xl hover:shadow-primary/20"
                  >
                    {topicName}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {material && (
                <motion.div 
                  key="material"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="card-accessible bg-white/80 backdrop-blur-xl border-white/60 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 text-primary/5 pointer-events-none">
                    <Sparkles size={200} />
                  </div>

                  <div className="prose prose-rose max-w-none markdown-body relative z-10 p-8 bg-white/40 rounded-[2.5rem] border border-white/60">
                    <Markdown rehypePlugins={[rehypeRaw]}>{material}</Markdown>
                  </div>
                  
                  <div className="mt-10 pt-8 border-t border-rose-100 flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
                    <div className="flex items-center gap-4 px-6 py-3 bg-rose-50 rounded-2xl border border-rose-100">
                      <Heart size={20} className="fill-primary text-primary animate-pulse" />
                      <span className="text-sm font-bold text-rose-900">{t.encouragement}</span>
                    </div>
                    <button 
                      onClick={() => { setMaterial(null); setTopic(''); }}
                      className="btn-accessible bg-primary text-white px-8 py-4 gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      <span className="font-black uppercase tracking-widest">{t.newTopic}</span>
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
