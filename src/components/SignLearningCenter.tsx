import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, X, Play, BookOpen, Star, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface Gesture {
  name: string;
  description: string;
  image: string;
  video?: string;
}

interface Course {
  id: string;
  title: string;
  titleEn: string;
  level: number;
  gestureCount: number;
  description: string;
  gestures: Gesture[];
  color: string;
}

const COURSES: Course[] = [
  {
    id: 'basic',
    title: '基础手势入门',
    titleEn: 'Basic Gestures',
    level: 1,
    gestureCount: 4,
    description: '学习最常用的日常手势：竖大拇指、OK、和平、摇滚',
    color: 'from-emerald-400 to-teal-500',
    gestures: [
      { name: '竖大拇指', description: '表示赞赏、肯定或鼓励。在手语中常用于表达“好”或“棒”。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      { name: 'OK', description: '食指和拇指捏成圆圈，表示同意或没问题。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44c/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      { name: '和平', description: '食指和中指呈V字形，表示和平或胜利。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/270c_fe0f/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      { name: '摇滚', description: '伸出食指和小指，表示酷、摇滚。注意与“我爱你”手势的区别（拇指是否伸出）。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f918/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
    ]
  },
  {
    id: 'numbers',
    title: '数字 1-5',
    titleEn: 'Numbers 1-5',
    level: 1,
    gestureCount: 5,
    description: '学习用手语表达数字1到5',
    color: 'from-blue-400 to-indigo-500',
    gestures: [
      { name: '数字 1', description: '伸出食指，手心向内。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/261d_fe0f/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      { name: '数字 2', description: '伸出食指和中指，手心向内。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/270c_fe0f/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      { name: '数字 3', description: '伸出拇指、食指和中指，手心向内。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f91f/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      { name: '数字 4', description: '伸出除拇指外的四指，手心向内。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f590_fe0f/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      { name: '数字 5', description: '伸出五指，手心向内。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f590_fe0f/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
    ]
  },
  {
    id: 'asl-easy',
    title: 'ASL字母 - 简单组',
    titleEn: 'ASL Alphabet - Easy',
    level: 1,
    gestureCount: 5,
    description: '学习较简单的ASL字母：A、B、D、I、L',
    color: 'from-purple-400 to-fuchsia-500',
    gestures: [
      { name: '字母 A', description: '握拳，拇指贴在食指侧面。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/270a/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      { name: '字母 B', description: '四指并拢伸直，拇指弯向掌心。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f590_fe0f/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      { name: '字母 D', description: '食指向上，其余三指与拇指捏合。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/261d_fe0f/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      { name: '字母 I', description: '小指向上，其余手指握拳. ', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f919/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      { name: '字母 L', description: '食指向上，拇指水平伸出，呈L形。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f91f/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
    ]
  },
  {
    id: 'asl-medium',
    title: 'ASL字母 - 进阶组',
    titleEn: 'ASL Alphabet - Medium',
    level: 2,
    gestureCount: 5,
    description: '学习难度适中的ASL字母：V、W、Y、U、S',
    color: 'from-amber-400 to-orange-500',
    gestures: [
      { name: '字母 V', description: '食指和中指呈V字形。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/270c_fe0f/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      { name: '字母 W', description: '食指、中指、无名指向上伸出。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f590_fe0f/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      { name: '字母 Y', description: '拇指和小指伸出，其余手指握拳。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f919/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      { name: '字母 U', description: '食指和中指并拢向上。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/270c_fe0f/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      { name: '字母 S', description: '握拳，拇指压在四指前方。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/270a/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
    ]
  },
  {
    id: 'asl-advanced',
    title: 'ASL字母 - 高级组',
    titleEn: 'ASL Alphabet - Advanced',
    level: 3,
    gestureCount: 4,
    description: '学习较复杂的ASL字母：C、F、K、O',
    color: 'from-rose-400 to-pink-500',
    gestures: [
      { name: '字母 C', description: '手呈C形。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44c/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      { name: '字母 F', description: '食指和拇指捏合，其余三指向上。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44c/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      { name: '字母 K', description: '食指向上，中指向前，拇指顶在中指中间。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/270c_fe0f/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      { name: '字母 O', description: '手呈O形。', image: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44c/512.gif', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
    ]
  }
];

export function SignLearningCenter({ language = 'zh' }: { language?: 'zh' | 'en' }) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeGestureIndex, setActiveGestureIndex] = useState(0);

  return (
    <div className="space-y-8">
      {!selectedCourse ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-rose-950 tracking-tight">
                {language === 'zh' ? '手语学习中心' : 'Sign Language Learning Center'}
              </h2>
              <p className="text-rose-400 font-bold">
                {language === 'zh' ? '选择课程开始学习' : 'Select a course to start learning'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {COURSES.map((course) => (
              <motion.div
                key={course.id}
                whileHover={{ scale: 1.01, x: 5 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedCourse(course)}
                className="group cursor-pointer relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-md border border-white/60 p-6 shadow-xl shadow-rose-500/5 hover:shadow-2xl hover:shadow-primary/10 transition-all"
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-black text-rose-950">{course.title}</h3>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest",
                        course.level === 1 ? "bg-emerald-500" : course.level === 2 ? "bg-amber-500" : "bg-rose-500"
                      )}>
                        Lv.{course.level}
                      </span>
                    </div>
                    <p className="text-rose-400 font-bold text-sm uppercase tracking-wider">{course.titleEn}</p>
                    <p className="text-rose-700/60 font-medium text-sm max-w-md">{course.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-rose-950 font-black text-lg">{course.gestureCount}</p>
                      <p className="text-rose-400 text-[10px] font-bold uppercase tracking-widest">
                        {language === 'zh' ? '个手势' : 'Gestures'}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-300 group-hover:bg-primary group-hover:text-white transition-all">
                      <ChevronRight size={24} />
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "absolute top-0 right-0 w-32 h-full bg-gradient-to-l opacity-0 group-hover:opacity-10 transition-opacity",
                  course.color
                )} />
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-accessible bg-white/80 backdrop-blur-2xl border-white p-0 overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-rose-100 flex items-center justify-between bg-white/40">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedCourse(null)}
                className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 hover:bg-rose-100 transition-all"
              >
                <X size={20} />
              </button>
              <div>
                <h3 className="text-xl font-black text-rose-950">{selectedCourse.title}</h3>
                <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">{selectedCourse.titleEn}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-2xl border border-rose-100">
              <BookOpen size={16} className="text-primary" />
              <span className="text-xs font-black text-rose-950">
                {activeGestureIndex + 1} / {selectedCourse.gestureCount}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Visual Area */}
            <div className="aspect-video lg:aspect-auto bg-rose-50/50 relative group overflow-hidden flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedCourse.gestures[activeGestureIndex].name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  src={selectedCourse.gestures[activeGestureIndex].image}
                  alt={selectedCourse.gestures[activeGestureIndex].name}
                  className="w-full h-full object-contain p-8"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
            </div>

            {/* Info Area */}
            <div className="p-8 space-y-8 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="space-y-2">
                  <motion.h4 
                    key={selectedCourse.gestures[activeGestureIndex].name}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-3xl font-black text-rose-950"
                  >
                    {selectedCourse.gestures[activeGestureIndex].name}
                  </motion.h4>
                  <div className="h-1 w-12 bg-primary rounded-full" />
                </div>
                
                <div className="p-6 rounded-3xl bg-rose-50/50 border border-rose-100 space-y-4">
                  <div className="flex items-center gap-2 text-rose-400">
                    <Info size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">动作解析</span>
                  </div>
                  <p className="text-rose-800 font-medium leading-relaxed">
                    {selectedCourse.gestures[activeGestureIndex].description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-rose-50 shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                      <Star size={16} fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-rose-400 uppercase">难度</p>
                      <p className="text-sm font-black text-rose-950">入门级</p>
                    </div>
                  </div>
                  <div 
                    onClick={() => {
                      const gestureName = selectedCourse.gestures[activeGestureIndex].name;
                      // Create Bilibili search URL for the gesture
                      const searchUrl = `https://search.bilibili.com/all?keyword=${encodeURIComponent(gestureName + ' 手语')}`;
                      window.open(searchUrl, '_blank');
                    }}
                    className="p-4 rounded-2xl bg-white border border-rose-50 shadow-sm flex items-center gap-3 transition-all cursor-pointer hover:bg-rose-50 hover:border-primary/20"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                      <Play size={16} fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-rose-400 uppercase">教学</p>
                      <p className="text-sm font-black text-rose-950">视频链接</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-4 pt-8 border-t border-rose-100">
                <button 
                  disabled={activeGestureIndex === 0}
                  onClick={() => setActiveGestureIndex(prev => prev - 1)}
                  className="flex-1 py-4 rounded-2xl bg-rose-50 text-rose-400 font-black uppercase tracking-widest disabled:opacity-30 hover:bg-rose-100 transition-all"
                >
                  上一个
                </button>
                <button 
                  onClick={() => {
                    if (activeGestureIndex < selectedCourse.gestureCount - 1) {
                      setActiveGestureIndex(prev => prev + 1);
                    } else {
                      setSelectedCourse(null);
                      setActiveGestureIndex(0);
                    }
                  }}
                  className="flex-[2] py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {activeGestureIndex < selectedCourse.gestureCount - 1 ? '下一个' : '完成学习'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
