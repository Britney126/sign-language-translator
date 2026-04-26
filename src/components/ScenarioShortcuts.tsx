import React from 'react';
import { Hospital, ShoppingCart, GraduationCap, Building2 } from 'lucide-react';
import { translations } from '../constants';
import { motion } from 'motion/react';

export function ScenarioShortcuts({ onSelect, language = 'zh' }: { onSelect: (text: string) => void, language?: 'zh' | 'en' }) {
  const t = translations[language].scenarios;

  const scenarioIcons = [
    <Hospital size={24} />,
    <ShoppingCart size={24} />,
    <GraduationCap size={24} />,
    <Building2 size={24} />
  ];

  const scenarioGradients = [
    'from-rose-400 via-pink-500 to-rose-600',
    'from-emerald-400 via-teal-500 to-emerald-600',
    'from-blue-400 via-indigo-500 to-blue-600',
    'from-amber-400 via-orange-500 to-amber-600'
  ];

  const scenarioBgColors = [
    'bg-rose-50/50',
    'bg-emerald-50/50',
    'bg-blue-50/50',
    'bg-amber-50/50'
  ];

  const scenarioShadows = [
    'shadow-rose-500/20',
    'shadow-emerald-500/20',
    'shadow-blue-500/20',
    'shadow-amber-500/20'
  ];

  return (
    <div className="space-y-8 relative z-10">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black tracking-tight gradient-text">{t.title}</h2>
        <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group">
          {t.more}
          <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {t.items.map((scenario, index) => (
          <motion.div 
            key={index} 
            whileHover={{ y: -5 }}
            className={`card-accessible p-8 group relative overflow-hidden border-none shadow-2xl ${scenarioShadows[index]} ${scenarioBgColors[index]}`}
          >
            {/* Decorative background icon */}
            <div className="absolute -right-6 -bottom-6 opacity-[0.05] transform rotate-12 group-hover:scale-125 group-hover:rotate-0 transition-all duration-700">
              {React.cloneElement(scenarioIcons[index] as React.ReactElement<any>, { size: 160 })}
            </div>

            <div className="flex items-center gap-5 mb-8 relative z-10">
              <div className={`w-16 h-16 bg-gradient-to-br ${scenarioGradients[index]} rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-current/30 group-hover:rotate-6 transition-transform`}>
                {scenarioIcons[index]}
              </div>
              <h3 className="text-2xl font-black text-foreground">{scenario.name}</h3>
            </div>
            
            <div className="flex flex-wrap gap-3 relative z-10">
              {scenario.phrases.map((phrase) => (
                <button
                  key={phrase}
                  onClick={() => onSelect(phrase)}
                  className="px-5 py-3 bg-white/90 hover:bg-primary text-foreground hover:text-white rounded-2xl text-sm font-bold transition-all shadow-md hover:shadow-xl hover:-translate-y-1 border border-rose-100/50 backdrop-blur-sm"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
