import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Volume2, Sparkles, Camera, Hand, BookOpen } from 'lucide-react';
import { translations } from '../constants';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  audioText: string;
}

export function Onboarding({ onComplete, language }: { onComplete: () => void, language: 'zh' | 'en' }) {
  const [currentStep, setCurrentStep] = useState(0);
  const t = translations[language].onboarding;

  const steps: Step[] = [
    {
      title: t.steps[0].title,
      description: t.steps[0].description,
      icon: <Sparkles className="text-rose-500" size={48} />,
      audioText: t.steps[0].audioText
    },
    {
      title: t.steps[1].title,
      description: t.steps[1].description,
      icon: <Camera className="text-rose-500" size={48} />,
      audioText: t.steps[1].audioText
    },
    {
      title: t.steps[2].title,
      description: t.steps[2].description,
      icon: <Hand className="text-rose-500" size={48} />,
      audioText: t.steps[2].audioText
    },
    {
      title: t.steps[3].title,
      description: t.steps[3].description,
      icon: <BookOpen className="text-rose-500" size={48} />,
      audioText: t.steps[3].audioText
    }
  ];

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'zh' ? 'zh-CN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    speak(steps[currentStep].audioText);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-rose-900/40 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[3.5rem] shadow-2xl max-w-lg w-full overflow-hidden relative border-4 border-rose-100"
      >
        <button 
          onClick={onComplete}
          className="absolute top-8 right-8 p-3 text-rose-300 hover:text-rose-500 transition-colors bg-rose-50 rounded-2xl"
        >
          <X size={28} />
        </button>

        <div className="p-10 sm:p-14 space-y-10 text-center">
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            className="w-32 h-32 bg-gradient-to-br from-rose-50 to-orange-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner"
          >
            {steps[currentStep].icon}
          </motion.div>

          <div className="space-y-5">
            <motion.h3 
              key={`title-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-black text-rose-900 tracking-tight"
            >
              {steps[currentStep].title}
            </motion.h3>
            <motion.p 
              key={`desc-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-rose-600/80 leading-relaxed text-lg font-medium"
            >
              {steps[currentStep].description}
            </motion.p>
          </div>

          <div className="flex items-center justify-center gap-3">
            {steps.map((_, i) => (
              <div 
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === currentStep ? 'w-12 bg-rose-500 shadow-lg shadow-rose-500/30' : 'w-3 bg-rose-100'
                }`}
              />
            ))}
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <div className="flex gap-4">
              {currentStep > 0 && (
                <button 
                  onClick={handlePrev}
                  className="flex-1 btn-accessible bg-rose-50 text-rose-500 py-6 rounded-[2rem] font-black flex items-center justify-center gap-2 border-2 border-rose-100 hover:bg-rose-100 transition-all"
                >
                  <ChevronLeft size={24} /> {t.prev}
                </button>
              )}
              <button 
                onClick={handleNext}
                className="flex-[2] btn-accessible bg-gradient-to-r from-primary to-secondary text-white py-6 rounded-[2rem] font-black flex items-center justify-center gap-2 text-xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {currentStep === steps.length - 1 ? t.start : t.next}
                <ChevronRight size={24} />
              </button>
            </div>
            
            {currentStep === 0 && (
              <button 
                onClick={onComplete}
                className="text-rose-300 hover:text-rose-500 font-bold text-sm py-2 transition-colors"
              >
                跳过引导 (Skip)
              </button>
            )}
          </div>

          <button 
            onClick={() => speak(steps[currentStep].audioText)}
            className="flex items-center gap-3 px-6 py-3 bg-rose-50/50 rounded-2xl text-sm font-black text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all mx-auto border border-rose-100/50"
          >
            <Volume2 size={18} className="animate-bounce" /> {t.replay}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
