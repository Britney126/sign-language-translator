import React from 'react';
import { History, Trash2, Clock, MessageCircle, Hand, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../constants';

export interface HistoryItem {
  id: string;
  type: 'sign-to-text' | 'text-to-sign' | 'learn';
  content: string;
  timestamp: number;
}

interface HistoryViewProps {
  history: HistoryItem[];
  onClear: () => void;
  onDelete: (id: string) => void;
  language?: 'zh' | 'en';
}

export function HistoryView({ history, onClear, onDelete, language = 'zh' }: HistoryViewProps) {
  const t = translations[language].history;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary rounded-full" />
          <h2 className="text-2xl font-black text-rose-950 tracking-tight uppercase flex items-center gap-3">
            <History size={28} /> {t.title}
          </h2>
        </div>
        {history.length > 0 && (
          <button 
            onClick={onClear}
            className="text-rose-400 hover:text-primary text-sm font-black uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            <Trash2 size={16} /> {t.clear}
          </button>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {history.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 bg-white/40 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-rose-100 flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl shadow-rose-500/5 text-rose-200">
                <History size={40} />
              </div>
              <p className="text-rose-300 font-bold uppercase tracking-widest">{t.empty}</p>
            </motion.div>
          ) : (
            history.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card-accessible bg-white/60 backdrop-blur-md border-white/60 flex gap-6 items-start group p-8"
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-110 duration-500",
                  item.type === 'sign-to-text' ? "bg-rose-500 text-white shadow-rose-500/20" : 
                  item.type === 'text-to-sign' ? "bg-primary text-white shadow-primary/20" :
                  "bg-amber-500 text-white shadow-amber-500/20"
                )}>
                  {item.type === 'sign-to-text' ? <Hand size={24} /> : 
                   item.type === 'text-to-sign' ? <MessageCircle size={24} /> :
                   <BookOpen size={24} />}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-white/60 rounded-full text-[10px] font-black uppercase tracking-widest text-rose-400 flex items-center gap-1.5 border border-rose-50 shadow-sm">
                      <Clock size={12} /> {new Date(item.timestamp).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US')}
                    </span>
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 bg-white hover:bg-red-50 rounded-xl text-rose-200 hover:text-red-500 transition-all shadow-sm border border-rose-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-xl font-bold text-rose-950 leading-tight">
                    {item.content}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper for cn
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
