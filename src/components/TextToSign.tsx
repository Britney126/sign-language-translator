import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, RefreshCw, BookOpen, Info, Share2, Video, ExternalLink, Mic, MicOff, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '../services/geminiService';
import { translations } from '../constants';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';

export function TextToSign({ 
  onShare, 
  onComplete,
  inputText, 
  setInputText,
  chatHistory = [],
  language = 'zh'
}: { 
  onShare: (content: string) => void,
  onComplete: (content: string) => void,
  inputText: string,
  setInputText: (text: string) => void,
  chatHistory?: ChatMessage[],
  language?: 'zh' | 'en'
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const t = translations[language].textToSign;
  const recognitionRef = useRef<any>(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'zh' ? 'zh-CN' : 'en-US';

      recognitionRef.current.onstart = () => {
        console.log("Speech Recognition Started");
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("Speech Recognition Result:", transcript);
        setInputText(transcript);
        setIsListening(false);
        setSpeechError(null);
        retryCountRef.current = 0;
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        
        if (event.error === 'network') {
          if (retryCountRef.current < 3) {
            retryCountRef.current++;
            console.log(`Network error. Retrying... (Attempt ${retryCountRef.current})`);
            setTimeout(() => {
              if (retryCountRef.current < 4) {
                try {
                  recognitionRef.current?.start();
                } catch (e) {
                  console.error("Retry start failed:", e);
                  setIsListening(false);
                }
              }
            }, 2000);
            return;
          }
          setSpeechError('network');
        } else if (event.error === 'not-allowed') {
          setSpeechError('permission-denied');
        } else {
          setSpeechError(event.error);
        }
        setIsListening(false);
        retryCountRef.current = 0;
      };

      recognitionRef.current.onend = () => {
        if (retryCountRef.current === 0) {
          setIsListening(false);
        }
      };
    }
  }, [language, setInputText]);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert(language === 'zh' ? "您的浏览器不支持语音识别" : "Your browser does not support speech recognition");
      return;
    }
    setSpeechError(null);
    if (isListening) {
      retryCountRef.current = 3;
      recognitionRef.current?.stop();
    } else {
      retryCountRef.current = 0;
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start recognition:", e);
        setSpeechError('failed-to-start');
      }
    }
  };

  const handleSearchVideo = () => {
    if (!inputText.trim()) return;
    const query = encodeURIComponent(`${inputText} ${language === 'zh' ? '手语 教程' : 'sign language tutorial'}`);
    const url = language === 'zh' 
      ? `https://search.bilibili.com/all?keyword=${query}`
      : `https://www.youtube.com/results?search_query=${query}`;
    window.open(url, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    setResult(null);
    try {
      // Call API
      const response = await fetch('/api/text-to-sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: inputText, history: chatHistory, lang: language })
      });
      const data = await response.json();
      if (data.success) {
        const description = data.result;
        setResult(description);
        setTimeout(() => onComplete(inputText), 0);
      } else {
        // API returned error
        setError(data.error || (language === 'zh' ? '转换出错，请重试' : 'Conversion error, please try again'));
      }
    } catch (err) {
      console.error(err);
      setError(language === 'zh' ? '网络错误，请检查网络连接' : 'Network error, please check your connection');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 relative z-10">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-pink-500 rounded-[2.25rem] blur opacity-20 group-focus-within:opacity-40 transition duration-1000 group-focus-within:duration-200"></div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.placeholder}
            className="relative w-full min-h-[180px] p-8 rounded-[2rem] border-none bg-white/80 backdrop-blur-md text-accessible-lg focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-xl shadow-rose-900/5"
          />
          <div className="absolute bottom-6 right-6 flex gap-3">
            <button
              type="button"
              onClick={toggleVoice}
              className={cn(
                "btn-accessible h-14 w-14 p-0 rounded-2xl transition-all shadow-lg relative",
                isListening 
                ? "bg-rose-500 text-white animate-pulse" 
                : speechError === 'network'
                ? "bg-amber-100 text-amber-600"
                : "bg-rose-50 text-rose-400 hover:bg-rose-100"
              )}
              title={isListening ? translations[language].rooms.voiceListening : speechError === 'network' ? "网络连接不稳定，请检查网络或稍后重试" : translations[language].rooms.voiceHint}
            >
              {isListening ? <MicOff size={22} /> : <Mic size={22} />}
              {speechError && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
                    speechError === 'network' ? "bg-amber-500" : "bg-rose-500"
                  )} 
                />
              )}
            </button>
            <button
              type="submit"
              disabled={isProcessing || !inputText.trim()}
              className="btn-accessible bg-gradient-to-r from-primary via-accent to-secondary text-white gap-2 h-14 px-8 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
              {isProcessing ? t.processing : t.convert}
            </button>
          </div>
        </div>
      </form>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 text-red-500 rounded-xl flex items-center justify-center shrink-0">
                <Info size={22} />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">{language === 'zh' ? '转换失败' : 'Conversion Failed'}</h4>
                <p>{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card-accessible bg-white/90 border-none shadow-2xl shadow-rose-900/10"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/10">
                  <BookOpen size={26} />
                </div>
                <h3 className="text-2xl font-black text-foreground">{t.results.title}</h3>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onShare(result)}
                  className="p-3 hover:bg-rose-50 rounded-2xl text-rose-400 transition-all hover:text-primary"
                  title={t.results.share}
                >
                  <Share2 size={22} />
                </button>
              </div>
            </div>

            <div className="prose prose-rose max-w-none markdown-body bg-gradient-to-br from-white to-rose-50/30 p-8 rounded-3xl border border-rose-100/50 shadow-inner">
              <Markdown>{result}</Markdown>
            </div>

            {/* Visual Reference Gallery */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex flex-col items-center text-center gap-3 cursor-pointer group"
                onClick={() => {
                  const query = encodeURIComponent(`${inputText} ${language === 'zh' ? '手语 图片' : 'sign language images'}`);
                  window.open(language === 'zh' ? `https://www.baidu.com/sf/vsearch?pd=image_content&word=${query}` : `https://www.google.com/search?tbm=isch&q=${query}`, '_blank');
                }}
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm group-hover:shadow-md transition-all">
                  <Palette size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-indigo-900">{language === 'zh' ? '查看手势图解' : 'View Gesture Diagrams'}</h4>
                  <p className="text-xs text-indigo-700/60 mt-1">{language === 'zh' ? '在网络上搜索相关手势图片' : 'Search for gesture images online'}</p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-6 bg-rose-50/50 rounded-3xl border border-rose-100 flex flex-col items-center text-center gap-3 cursor-pointer group"
                onClick={handleSearchVideo}
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm group-hover:shadow-md transition-all">
                  <Video size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-rose-900">{language === 'zh' ? '观看视频教程' : 'Watch Video Tutorials'}</h4>
                  <p className="text-xs text-rose-700/60 mt-1">{language === 'zh' ? '在视频平台搜索详细教学' : 'Search for detailed tutorials'}</p>
                </div>
              </motion.div>
            </div>

            <div className="mt-10 pt-10 border-t border-rose-100/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-gradient-to-br from-rose-50 to-pink-50 rounded-[2.5rem] border border-rose-100/50 relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 opacity-[0.05] transform rotate-12 group-hover:scale-110 transition-transform duration-700">
                  <Video size={160} />
                </div>
                
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-rose-500 shadow-xl shadow-rose-900/5">
                    <Video size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-foreground">{t.tutorial.title}</h4>
                    <p className="text-rose-900/60 font-medium">{t.tutorial.subtitle.replace('{text}', inputText)}</p>
                  </div>
                </div>
                <button
                  onClick={handleSearchVideo}
                  className="btn-accessible bg-white text-rose-500 hover:bg-primary hover:text-white border-none px-8 py-4 gap-2 w-full sm:w-auto shadow-xl shadow-rose-900/5 transition-all relative z-10"
                >
                  <ExternalLink size={20} />
                  {t.tutorial.button}
                </button>
              </div>
            </div>

            <div className="mt-8 p-5 bg-blue-50/50 backdrop-blur-sm rounded-2xl flex gap-4 items-start border border-blue-100/50">
              <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                <Info size={22} />
              </div>
              <div className="space-y-3">
                <p className="text-sm text-blue-700 font-medium leading-relaxed">
                  {t.note}
                </p>
                <div className="flex flex-wrap gap-2">
                  <a 
                    href={language === 'zh' ? "http://www.shouyu.org.cn/" : "https://www.handspeak.com/"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs bg-white/50 hover:bg-white px-3 py-1.5 rounded-lg border border-blue-100 text-blue-600 font-bold transition-all flex items-center gap-1"
                  >
                    <ExternalLink size={12} />
                    {language === 'zh' ? '国家通用手语词典' : 'Handspeak Dictionary'}
                  </a>
                  <a 
                    href={language === 'zh' ? "https://www.spreadthesign.com/zh.cn/" : "https://www.spreadthesign.com/"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs bg-white/50 hover:bg-white px-3 py-1.5 rounded-lg border border-blue-100 text-blue-600 font-bold transition-all flex items-center gap-1"
                  >
                    <ExternalLink size={12} />
                    Spreadthesign
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
