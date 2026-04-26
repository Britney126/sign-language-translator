import React from 'react';
import { Hand, Share2, Settings, LogOut, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
  onResetOnboarding: () => void;
}

export function Header({ onLogout, onResetOnboarding }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/60 backdrop-blur-xl border-b border-rose-100/50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30 transform hover:rotate-12 transition-transform cursor-pointer">
            <Hand size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">语隙 <span className="text-primary font-sans">YuXi</span></h1>
            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em]">无障碍手语翻译助手</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onResetOnboarding}
            className="p-2.5 rounded-2xl hover:bg-rose-50 text-rose-400 transition-all hover:text-primary active:scale-90 flex items-center gap-2" 
            title="重置引导"
          >
            <HelpCircle size={22} />
            <span className="hidden sm:inline text-xs font-bold">引导</span>
          </button>
          <button 
            onClick={onLogout}
            className="p-2.5 rounded-2xl hover:bg-rose-50 text-rose-400 transition-all hover:text-rose-600 active:scale-90 flex items-center gap-2" 
            title="退出登录"
          >
            <LogOut size={22} />
            <span className="hidden sm:inline text-xs font-bold">退出</span>
          </button>
        </div>
      </div>
    </header>
  );
}
