import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, MessageSquare, LogOut, Send, Mic, MicOff, Sparkles, User, Hash } from 'lucide-react';
import { translations } from '../constants';
import { cn } from '../lib/utils';

interface Room {
  id: string;
  name: string;
  createdBy: string;
  members: string[];
  createdAt: any;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// 本地存储管理
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

// 生成唯一ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 生成当前时间戳
function getTimestamp() {
  return new Date().toISOString();
}

export function LearningRooms({ language = 'zh', user, isGuest }: { language?: 'zh' | 'en', user: any, isGuest: boolean }) {
  const t = translations[language].rooms;
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Voice Recognition Setup
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
        setNewMessage(prev => prev + transcript);
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
            // Wait longer between retries for network issues
            setTimeout(() => {
              if (retryCountRef.current < 4) { // Still in retry mode
                try {
                  recognitionRef.current?.start();
                } catch (e) {
                  console.error("Retry start failed:", e);
                  setIsListening(false);
                }
              }
            }, 2000);
            return; // Don't set error yet
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
        // Only set listening to false if we aren't currently retrying
        if (retryCountRef.current === 0) {
          setIsListening(false);
        }
      };
    }
  }, [language]);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert(language === 'zh' ? "您的浏览器不支持语音识别" : "Your browser does not support speech recognition");
      return;
    }
    setSpeechError(null);
    if (isListening) {
      retryCountRef.current = 3; // Prevent auto-retry when manually stopping
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

  // Fetch Rooms from Local Storage
  useEffect(() => {
    if (!user && !isGuest) return;
    const roomsData = getLocalStorage('learning_rooms', []);
    setRooms(roomsData);
  }, [user, isGuest]);

  // Fetch Messages for Active Room from Local Storage
  useEffect(() => {
    if (!activeRoom || (!user && !isGuest)) return;
    const messagesData = getLocalStorage(`room_messages_${activeRoom.id}`, []);
    setMessages(messagesData);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  }, [activeRoom, user, isGuest]);

  const createRoom = async () => {
    if (!newRoomName.trim()) return;
    
    if (!user && isGuest) {
      alert(language === 'zh' 
        ? '请登录后创建房间' 
        : 'Please login to create a room');
      return;
    }

    try {
      const userId = user?.uid || 'guest_' + generateId();
      const newRoom: Room = {
        id: generateId(),
        name: newRoomName,
        createdBy: userId,
        members: [userId],
        createdAt: getTimestamp()
      };
      
      const roomsData = getLocalStorage('learning_rooms', []);
      roomsData.unshift(newRoom);
      setLocalStorage('learning_rooms', roomsData);
      setRooms(roomsData);
      setNewRoomName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating room:', error);
      alert(language === 'zh' ? '创建房间失败' : 'Failed to create room');
    }
  };

  const joinRoom = async (room: Room) => {
    if (!user && isGuest) {
      // If not authenticated, just set active room locally
      setActiveRoom(room);
      return;
    }
    try {
      const userId = user?.uid || 'guest_' + generateId();
      const roomsData = getLocalStorage('learning_rooms', []);
      const updatedRooms = roomsData.map(r => {
        if (r.id === room.id && !r.members.includes(userId)) {
          return {
            ...r,
            members: [...r.members, userId]
          };
        }
        return r;
      });
      setLocalStorage('learning_rooms', updatedRooms);
      setRooms(updatedRooms);
      setActiveRoom(updatedRooms.find(r => r.id === room.id) || room);
    } catch (error) {
      console.error('Error joining room:', error);
      alert(language === 'zh' ? '加入房间失败' : 'Failed to join room');
    }
  };

  const leaveRoom = async () => {
    if (!activeRoom) return;
    if (isGuest) {
      setActiveRoom(null);
      return;
    }
    if (!user) return;
    try {
      const userId = user.uid;
      const roomsData = getLocalStorage('learning_rooms', []);
      const updatedRooms = roomsData.map(r => {
        if (r.id === activeRoom.id) {
          return {
            ...r,
            members: r.members.filter(memberId => memberId !== userId)
          };
        }
        return r;
      });
      setLocalStorage('learning_rooms', updatedRooms);
      setRooms(updatedRooms);
      setActiveRoom(null);
    } catch (error) {
      console.error('Error leaving room:', error);
      alert(language === 'zh' ? '离开房间失败' : 'Failed to leave room');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeRoom || (!user && isGuest)) return;
    try {
      const userId = user?.uid || 'guest_' + generateId();
      const userName = user?.displayName || 'Anonymous';
      const newMessageData: Message = {
        id: generateId(),
        senderId: userId,
        senderName: userName,
        text: newMessage,
        createdAt: getTimestamp()
      };
      
      const messagesData = getLocalStorage(`room_messages_${activeRoom.id}`, []);
      messagesData.push(newMessageData);
      setLocalStorage(`room_messages_${activeRoom.id}`, messagesData);
      setMessages(messagesData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert(language === 'zh' ? '发送消息失败' : 'Failed to send message');
    }
  };

  if (activeRoom) {
    return (
      <div className="card-accessible h-[600px] flex flex-col p-0 overflow-hidden border-none bg-white/40 backdrop-blur-2xl">
        {/* Room Header */}
        <div className="p-6 border-b border-rose-100/50 flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Hash size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground">{activeRoom.name}</h3>
              <p className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1">
                <Users size={12} /> {activeRoom.members.length} {t.members}
              </p>
            </div>
          </div>
          <button 
            onClick={leaveRoom}
            className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, x: msg.senderId === user?.uid ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[80%]",
                msg.senderId === user?.uid ? "ml-auto items-end" : "items-start"
              )}
            >
              <span className="text-[10px] font-bold text-rose-400 mb-1 uppercase tracking-tighter">
                {msg.senderName}
              </span>
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm font-medium shadow-sm",
                msg.senderId === user?.uid 
                ? "bg-primary text-white rounded-tr-none" 
                : "bg-white text-foreground rounded-tl-none"
              )}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white/60 border-t border-rose-100/50">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleVoice}
              className={cn(
                "p-4 rounded-2xl transition-all shadow-lg relative",
                isListening 
                ? "bg-rose-500 text-white animate-pulse" 
                : speechError === 'network'
                ? "bg-amber-100 text-amber-600"
                : "bg-rose-50 text-rose-400 hover:bg-rose-100"
              )}
              title={isListening ? t.voiceListening : speechError === 'network' ? "网络连接不稳定，请检查网络或稍后重试" : t.voiceHint}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
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
            <div className="flex-1 relative">
              <input 
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={t.chat}
                className="w-full bg-white/80 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
              />
              <motion.div 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/20 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles size={16} />
              </motion.div>
            </div>
            <button 
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <Send size={20} />
            </button>
            <button 
              onClick={() => {
                // 打开视频通话窗口
                const videoWindow = window.open('', '_blank', 'width=800,height=600');
                if (videoWindow) {
                  videoWindow.document.write(`
                    <html>
                      <head>
                        <title>视频通话</title>
                        <style>
                          body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                          .video-container { width: 100%; height: 100vh; display: flex; flex-direction: column; }
                          .video-header { background: linear-gradient(135deg, #f43f5e, #ec4899); color: white; padding: 20px; text-align: center; }
                          .video-area { flex: 1; display: flex; align-items: center; justify-content: center; background: #f9fafb; }
                          video { max-width: 100%; max-height: 100%; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
                          .video-footer { background: white; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
                          button { background: #f43f5e; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 16px; }
                          button:hover { background: #e11d48; }
                        </style>
                      </head>
                      <body>
                        <div class="video-container">
                          <div class="video-header">
                            <h1>视频通话</h1>
                            <p>房间: ${activeRoom.name}</p>
                          </div>
                          <div class="video-area">
                            <video id="localVideo" autoplay muted></video>
                          </div>
                          <div class="video-footer">
                            <button onclick="closeWindow()">结束通话</button>
                          </div>
                        </div>
                        <script>
                          function closeWindow() {
                            window.close();
                          }
                          
                          // 访问摄像头
                          navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                            .then(stream => {
                              const video = document.getElementById('localVideo');
                              if (video) {
                                video.srcObject = stream;
                              }
                            })
                            .catch(err => {
                              console.error('访问摄像头失败:', err);
                              alert('无法访问摄像头，请检查权限设置');
                            });
                        </script>
                      </body>
                    </html>
                  `);
                  videoWindow.document.close();
                }
              }}
              className="p-4 bg-accent text-white rounded-2xl shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="10" x="5" y="2" rx="2" ry="2"/><circle cx="12" cy="15" r="4"/><line x1="12" y1="19" x2="12.01" y2="19"/></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-primary">{t.title}</h2>
          <p className="text-rose-900/40 text-sm font-bold">{t.subtitle}</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-primary text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all font-bold"
        >
          <Plus size={20} /> {t.create}
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-rose-100 shadow-xl shadow-rose-900/5"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder={language === 'zh' ? '丫丫的学习室' : 'Yaya\'s Learning Room'}
                className="flex-1 bg-white border-2 border-rose-50 rounded-2xl px-6 py-4 focus:border-primary/30 outline-none transition-all font-bold text-rose-900 placeholder:text-rose-200"
              />
              <div className="flex gap-3">
                <button 
                  onClick={createRoom}
                  className="flex-1 sm:flex-none bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  {t.create}
                </button>
                <button 
                  onClick={() => setIsCreating(false)}
                  className="flex-1 sm:flex-none bg-rose-50 text-primary px-8 py-4 rounded-2xl font-black hover:bg-rose-100 transition-all"
                >
                  {translations[language].signToText.camera.cancel}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-200">
              <Users size={40} />
            </div>
            <p className="text-rose-300 font-bold">{t.empty}</p>
          </div>
        ) : (
          rooms.map((room) => (
            <motion.div
              key={room.id}
              whileHover={{ y: -5 }}
              className="card-accessible group cursor-pointer hover:border-primary/30 transition-all flex items-center justify-between"
              onClick={() => joinRoom(room)}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground">{room.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1">
                      <Users size={12} /> {room.members.length}
                    </span>
                    <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest flex items-center gap-1">
                      <User size={12} /> {room.createdBy === user?.uid ? 'Owner' : 'Member'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-300 group-hover:bg-primary group-hover:text-white transition-all">
                <Plus size={20} />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
