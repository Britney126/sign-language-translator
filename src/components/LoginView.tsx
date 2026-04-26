import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, UserCircle, Sparkles, Hand, Eye, EyeOff, Heart, Star, Cloud, Music, Coffee, Moon } from 'lucide-react';
import { translations } from '../constants';

interface LoginViewProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string) => Promise<void>;
  onGuest: () => void;
  language: 'zh' | 'en';
  onLanguageChange: (lang: 'zh' | 'en') => void;
}

export function LoginView({ onLogin, onRegister, onGuest, language, onLanguageChange }: LoginViewProps) {
  const t = translations[language].login;
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError(language === 'zh' ? '请输入账户名和密码' : 'Please enter username and password');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegister) {
        await onRegister(username, password);
      } else {
        await onLogin(username, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : (language === 'zh' ? '操作失败，请重试' : 'Operation failed, please try again'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white relative overflow-hidden">
      {/* Immersive Atmospheric Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gradient Backgrounds */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 45, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-gradient-to-br from-rose-200/40 via-purple-200/20 to-transparent rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -45, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-gradient-to-tl from-amber-200/40 via-orange-200/20 to-transparent rounded-full blur-[120px]" 
        />
        
        {/* Decorative Icons */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[10%] text-rose-300/20"
        >
          <Heart size={48} fill="currentColor" />
        </motion.div>
        
        <motion.div
          animate={{
            y: [0, 25, 0],
            rotate: [0, -15, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[30%] right-[15%] text-amber-300/20"
        >
          <Star size={64} fill="currentColor" />
        </motion.div>
        
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -15, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] left-[15%] text-blue-300/15"
        >
          <Cloud size={72} fill="currentColor" />
        </motion.div>
        
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[15%] right-[10%] text-indigo-300/20"
        >
          <Moon size={56} />
        </motion.div>
        
        <motion.div
          animate={{
            y: [0, -25, 0],
            x: [0, 10, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[60%] right-[20%] text-rose-200/15"
        >
          <Coffee size={44} />
        </motion.div>
        
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[25%] left-[40%] text-purple-200/10"
        >
          <Music size={80} />
        </motion.div>
        
        {/* Geometric Shapes */}
        <motion.div
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[50%] left-[20%] w-32 h-32 border-4 border-rose-100/20 rounded-full"
        />
        
        <motion.div
          animate={{
            rotate: [0, -180, -360],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 5 }}
          className="absolute bottom-[30%] right-[25%] w-24 h-24 border-4 border-amber-100/20 transform rotate-45"
        />
        
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] right-[30%] w-40 h-40 rounded-full bg-gradient-to-r from-purple-100/10 to-transparent"
        />
        
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-[10%] left-[30%] w-36 h-36 rounded-full bg-gradient-to-l from-amber-100/10 to-transparent"
        />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full space-y-10 text-center relative z-10"
      >
        <div className="space-y-8">
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 6, repeat: Infinity }}
            className="w-40 h-40 bg-gradient-to-br from-primary via-accent to-secondary rounded-[4rem] flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 relative group"
          >
            <Hand className="text-white group-hover:scale-110 transition-transform" size={80} />
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0, 0.2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-white rounded-[4rem]"
            />
          </motion.div>
          <div className="space-y-3">
            <h1 className="text-8xl font-black text-foreground tracking-tight drop-shadow-sm">
              语隙 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-sans">YuXi</span>
            </h1>
            <p className="text-rose-900/60 font-bold uppercase tracking-[0.3em] text-sm">{t.subtitle}</p>
          </div>
        </div>

        {/* Language Selection */}
        <div className="flex justify-center p-2 bg-rose-100/50 backdrop-blur-xl rounded-full w-fit mx-auto border border-rose-100 shadow-lg">
          <button
            onClick={() => onLanguageChange('zh')}
            className={`flex items-center gap-2 px-10 py-3 rounded-full text-base font-black transition-all ${
              language === 'zh' 
              ? 'bg-white text-primary shadow-xl' 
              : 'text-rose-400 hover:text-rose-600'
            }`}
          >
            中文
          </button>
          <button
            onClick={() => onLanguageChange('en')}
            className={`flex items-center gap-2 px-10 py-3 rounded-full text-base font-black transition-all ${
              language === 'en' 
              ? 'bg-white text-primary shadow-xl' 
              : 'text-rose-400 hover:text-rose-600'
            }`}
          >
            English
          </button>
        </div>

        <div className="space-y-6">
          {/* Login/Register Form */}
          <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-rose-100/50 border border-rose-100">
            {/* Login/Register Toggle */}
            <div className="flex justify-center p-2 bg-rose-100/50 backdrop-blur-xl rounded-full w-full mb-8">
              <button
                onClick={() => setIsRegister(false)}
                className={`flex-1 py-4 rounded-full text-base font-black transition-all ${
                  !isRegister 
                  ? 'bg-white text-primary shadow-lg' 
                  : 'text-rose-400 hover:text-rose-600'
                }`}
              >
                {language === 'zh' ? '登录' : 'Login'}
              </button>
              <button
                onClick={() => setIsRegister(true)}
                className={`flex-1 py-4 rounded-full text-base font-black transition-all ${
                  isRegister 
                  ? 'bg-white text-primary shadow-lg' 
                  : 'text-rose-400 hover:text-rose-600'
                }`}
              >
                {language === 'zh' ? '注册' : 'Register'}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-rose-100 text-rose-600 rounded-full text-base font-bold">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={language === 'zh' ? '账户名' : 'Username'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-8 py-6 bg-rose-50/80 border-2 border-rose-100 rounded-full text-xl font-medium focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all"
                  disabled={isLoading}
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={language === 'zh' ? '密码' : 'Password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-8 py-6 bg-rose-50/80 border-2 border-rose-100 rounded-full text-xl font-medium focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 text-rose-400 hover:text-primary transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={28} /> : <Eye size={28} />}
                </button>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full btn-accessible bg-gradient-to-r from-primary via-accent to-secondary text-white py-7 rounded-[3rem] text-2xl font-black flex items-center justify-center gap-4 shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all border-2 border-white/20"
              >
                <LogIn size={32} />
                {isRegister ? (language === 'zh' ? '注册' : 'Register') : (language === 'zh' ? '登录' : 'Login')}
                {isLoading && (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full"
                  />
                )}
              </button>
            </form>
          </div>
          
          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-rose-100"></div>
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-white px-6 text-rose-300 font-black tracking-widest">OR</span>
            </div>
          </div>

          <button 
            onClick={onGuest}
            className="w-full btn-accessible bg-rose-50/50 backdrop-blur-xl text-rose-600 border-2 border-rose-100 py-7 rounded-[3rem] text-2xl font-black flex items-center justify-center gap-4 hover:bg-rose-100/50 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            disabled={isLoading}
          >
            <UserCircle size={32} />
            {t.guestLogin}
          </button>
        </div>

        <div className="pt-8 flex items-center justify-center gap-2 text-rose-300">
          <Sparkles size={18} className="animate-pulse" />
          <p className="text-xs font-bold tracking-widest uppercase">{t.privacyNote}</p>
        </div>
      </motion.div>
    </div>
  );
}
