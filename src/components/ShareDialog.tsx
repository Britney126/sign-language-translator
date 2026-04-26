import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ShareDialog({ isOpen, onClose, content }: { isOpen: boolean, onClose: () => void, content: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/share?content=${encodeURIComponent(content)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900">分享翻译结果</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-3xl border border-slate-100">
              <QRCodeSVG value={shareUrl} size={200} level="H" includeMargin={true} />
              <p className="mt-4 text-sm text-slate-500 font-medium">扫描二维码在手机上查看</p>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">分享链接</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-600 truncate text-sm font-mono">
                  {shareUrl}
                </div>
                <button 
                  onClick={handleCopy}
                  className="btn-accessible btn-primary px-6 h-auto py-3"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 p-6 flex justify-center">
            <button onClick={onClose} className="btn-accessible btn-outline w-full">关闭</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
