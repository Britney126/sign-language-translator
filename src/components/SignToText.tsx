import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, RefreshCw, Check, Copy, Share2, Sparkles, AlertCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '../services/geminiService';
import { cn } from '../lib/utils';
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { translations } from '../constants';

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [0, 9], [9, 10], [10, 11], [11, 12], // Middle
  [0, 13], [13, 14], [14, 15], [15, 16], // Ring
  [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [5, 9], [9, 13], [13, 17] // Palm base
];

export function SignToText({ 
  onShare, 
  onComplete,
  chatHistory = [],
  language = 'zh'
}: { 
  onShare: (content: string) => void, 
  onComplete: (content: string) => void,
  chatHistory?: ChatMessage[],
  language?: 'zh' | 'en'
}) {
  const [image, setImage] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingLimit, setRecordingLimit] = useState(3); // Default 3s
  const [result, setResult] = useState<string | null>(null);
  const [optimizedResult, setOptimizedResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<string[]>([]);
  const requestRef = useRef<number | null>(null);
  const lastProcessTimeRef = useRef<number>(0);
  const isLiveProcessingRef = useRef<boolean>(false);

  const t = translations[language].signToText;

  // Initialize Hand Landmarker on demand or pre-load
  const initMP = useCallback(async () => {
    if (handLandmarker || !isAiEnabled) return;
    
    try {
      setIsAiLoading(true);
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
      });
      setHandLandmarker(landmarker);
      setIsAiLoading(false);
      console.log("MediaPipe HandLandmarker initialized");
    } catch (err) {
      console.error("MediaPipe Init Error:", err);
      setIsAiLoading(false);
    }
  }, [handLandmarker, isAiEnabled]);

  useEffect(() => {
    // Pre-load if enabled
    if (isAiEnabled) {
      initMP();
    }
  }, [isAiEnabled, initMP]);

  // Real-time tracking loop
  const predictWebcam = useCallback(async () => {
    const video = videoElementRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas && handLandmarker && isCameraActive && isAiEnabled && video.readyState >= 2) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        try {
          const startTimeMs = performance.now();
          const results = handLandmarker.detectForVideo(video, startTimeMs);

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          let handsDetected = false;
          if (results.landmarks && results.landmarks.length > 0) {
            handsDetected = true;
            for (const landmarks of results.landmarks) {
              // Draw connections (lines) - Glow effect
              ctx.strokeStyle = "rgba(255, 77, 109, 0.3)"; 
              ctx.lineWidth = 8;
              ctx.lineCap = "round";
              HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
                const start = landmarks[startIdx];
                const end = landmarks[endIdx];
                if (start && end) {
                  ctx.beginPath();
                  ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
                  ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
                  ctx.stroke();
                }
              });

              ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"; 
              ctx.lineWidth = 2;
              HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
                const start = landmarks[startIdx];
                const end = landmarks[endIdx];
                if (start && end) {
                  ctx.beginPath();
                  ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
                  ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
                  ctx.stroke();
                }
              });

              // Draw landmarks (points)
              landmarks.forEach((point) => {
                const x = point.x * canvas.width;
                const y = point.y * canvas.height;
                ctx.fillStyle = "#ff4d6d"; // Warm pink
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1;
                ctx.stroke();
              });
            }
          }

          // Real-time recognition logic
          if (isLiveMode && handsDetected && !isLiveProcessingRef.current) {
            const now = Date.now();
            if (now - lastProcessTimeRef.current > 2000) { // Process every 2 seconds
              lastProcessTimeRef.current = now;
              isLiveProcessingRef.current = true;
              
              // Capture frame
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = video.videoWidth;
              tempCanvas.height = video.videoHeight;
              const tempCtx = tempCanvas.getContext('2d');
              if (tempCtx) {
                tempCtx.drawImage(video, 0, 0);
                const frameData = tempCanvas.toDataURL('image/jpeg', 0.7);
                
                // Call API
                fetch('/api/sign-to-text', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ base64Image: frameData, history: chatHistory, lang: language })
                })
                .then(response => response.json())
                .then(data => {
                  if (data.success) {
                    const text = data.result;
                    const unrecognized = language === 'zh' ? "未能识别" : "Unrecognized";
                    const errorMsg = language === 'zh' ? "翻译出错，请重试" : "Translation error, please try again";
                    
                    if (text && text !== unrecognized && text !== errorMsg) {
                      setLiveTranscript(prev => {
                        // Avoid repeating the same word immediately
                        if (prev.length > 0 && prev[prev.length - 1] === text) return prev;
                        const next = [...prev, text].slice(-10); // Keep last 10 words
                        return next;
                      });
                      // Call onComplete after state update is scheduled
                      setTimeout(() => onComplete([...liveTranscript, text].slice(-10).join(' ')), 0);
                    }
                  }
                  isLiveProcessingRef.current = false;
                })
                .catch(() => {
                  isLiveProcessingRef.current = false;
                });
              } else {
                isLiveProcessingRef.current = false;
              }
            }
          }
        } catch (e) {
          console.warn("Tracking frame skipped", e);
        }
      }
    }
    requestRef.current = requestAnimationFrame(predictWebcam);
  }, [handLandmarker, isCameraActive, isLiveMode, isAiEnabled, onComplete, language]);

  useEffect(() => {
    if (isCameraActive && handLandmarker && isAiEnabled) {
      requestRef.current = requestAnimationFrame(predictWebcam);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isCameraActive, handLandmarker, isAiEnabled, predictWebcam]);

  const videoRefCallback = useCallback((node: HTMLVideoElement | null) => {
    if (!node) {
      videoElementRef.current = null;
      return;
    }
    
    if (videoElementRef.current !== node) {
      videoElementRef.current = node;
      if (stream) {
        node.srcObject = stream;
        const playPromise = node.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            if (err.name !== 'AbortError') {
              console.error("Video Play Error:", err);
            }
          });
        }
      }
    }
  }, [stream]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setOptimizedResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to ~10MB for proxy stability)
      if (file.size > 10 * 1024 * 1024) {
        setError(language === 'zh' ? "视频文件过大（超过10MB），请上传较小的视频或使用短视频识别。" : "Video file too large (over 10MB), please upload a smaller video or use short recognition.");
        return;
      }
      setIsProcessing(true);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Video = reader.result as string;
          // Call API
          const response = await fetch('/api/translate-long-video', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ base64Video, history: chatHistory, lang: language })
          });
          const data = await response.json();
          if (data.success) {
            const rawText = data.result;
            setResult(rawText);
            const unrecognized = language === 'zh' ? "未能识别" : "Unrecognized";
            if (rawText !== unrecognized) {
              const optimizeResponse = await fetch('/api/optimize-text', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rawText, scenario: "通用", history: chatHistory, lang: language })
              });
              const optimizeData = await optimizeResponse.json();
              if (optimizeData.success) {
                const optimized = optimizeData.result;
                setOptimizedResult(optimized);
                setTimeout(() => onComplete(optimized), 0);
              }
            } else {
              setTimeout(() => onComplete(rawText), 0);
            }
          } else {
            setError(language === 'zh' ? "视频处理失败，请重试。" : "Video processing failed, please try again.");
          }
        } catch (err) {
          setError(language === 'zh' ? "视频处理失败，请重试。" : "Video processing failed, please try again.");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser does not support camera access");
      }

      let newStream: MediaStream;
      try {
        // Try with ideal constraints first
        newStream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          } 
        });
      } catch (e) {
        console.warn("Ideal constraints failed, falling back to basic video", e);
        // Fallback to any available video device
        newStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setStream(newStream);
      setIsCameraActive(true);
      setError(null);
    } catch (err) {
      console.error("Camera Error:", err);
      let errorMessage = language === 'zh' 
        ? "无法访问摄像头。请确保已授权，并尝试点击预览窗口右上角图标“在新标签页打开”以获得更好兼容性。" 
        : "Cannot access camera. Please ensure permission is granted, and try clicking the 'Open in new tab' icon in the top right for better compatibility.";
      
      if (err instanceof Error) {
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMessage = language === 'zh' ? "未找到摄像头设备，请检查连接。" : "No camera device found, please check connection.";
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = language === 'zh' ? "摄像头权限被拒绝，请在浏览器设置中开启。" : "Camera permission denied, please enable it in browser settings.";
        }
      }
      
      setError(errorMessage);
    }
  };

  const capturePhoto = () => {
    const video = videoElementRef.current;
    if (video && video.readyState >= 2) { 
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setImage(dataUrl);
        stopCamera();
      }
    } else {
      setError(language === 'zh' ? "摄像头画面尚未就绪，请稍后再试。" : "Camera feed not ready, please try again later.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    setIsLiveMode(false);
    setLiveTranscript([]);
  };

  const startRecording = (limit: number = 3) => {
    if (!stream) return;
    
    setRecordingLimit(limit);
    setIsRecording(true);
    setRecordingTime(0);
    chunksRef.current = [];
    
    const recorder = new MediaRecorder(stream, { 
      mimeType: 'video/webm',
      videoBitsPerSecond: 1000000 // Increased to 1Mbps for better clarity
    });
    mediaRecorderRef.current = recorder;
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setVideoBlob(blob);
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      
      if (limit > 5) {
        await processLongVideo(blob);
      } else {
        await processVideo(blob);
      }
    };
    
    recorder.start();
    
    let timeLeft = limit;
    timerRef.current = setInterval(() => {
      timeLeft -= 1;
      setRecordingTime(limit - timeLeft);
      if (timeLeft <= 0) {
        recorder.stop();
      }
    }, 1000);
  };

  const processLongVideo = async (blob: Blob) => {
    setIsProcessing(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Video = reader.result as string;
        // Call API
        const response = await fetch('/api/translate-long-video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ base64Video, history: chatHistory, lang: language })
        });
        const data = await response.json();
        if (data.success) {
          const rawText = data.result;
          setResult(rawText);
          const unrecognized = language === 'zh' ? "未能识别" : "Unrecognized";
          if (rawText !== unrecognized) {
            const optimizeResponse = await fetch('/api/optimize-text', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ rawText, scenario: "通用", history: chatHistory, lang: language })
            });
            const optimizeData = await optimizeResponse.json();
            if (optimizeData.success) {
              const optimized = optimizeData.result;
              setOptimizedResult(optimized);
              setTimeout(() => onComplete(optimized), 0);
            }
          } else {
            setTimeout(() => onComplete(rawText), 0);
          }
        } else {
          setError(language === 'zh' ? "长视频处理失败，请重试。" : "Long video processing failed, please try again.");
        }
        setIsProcessing(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setError(language === 'zh' ? "长视频处理失败，请重试。" : "Long video processing failed, please try again.");
      setIsProcessing(false);
    }
  };

  const processVideo = async (blob: Blob) => {
    setIsProcessing(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Video = reader.result as string;
        // Call API
        const response = await fetch('/api/sign-video-to-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ base64Video, lang: language })
        });
        const data = await response.json();
        if (data.success) {
          const rawText = data.result;
          setResult(rawText);
          const unrecognized = language === 'zh' ? "未能识别" : "Unrecognized";
          if (rawText !== unrecognized) {
            const optimizeResponse = await fetch('/api/optimize-text', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ rawText, scenario: "通用", history: chatHistory, lang: language })
            });
            const optimizeData = await optimizeResponse.json();
            if (optimizeData.success) {
              const optimized = optimizeData.result;
              setOptimizedResult(optimized);
              setTimeout(() => onComplete(optimized), 0);
            }
          } else {
            setTimeout(() => onComplete(rawText), 0);
          }
        } else {
          setError(language === 'zh' ? "视频处理失败，请重试。" : "Video processing failed, please try again.");
        }
        setIsProcessing(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setError(language === 'zh' ? "视频处理失败，请重试。" : "Video processing failed, please try again.");
      setIsProcessing(false);
    }
  };

  const processImage = async () => {
    if (!image) return;
    setIsProcessing(true);
    setError(null);
    try {
      // Call API
      const response = await fetch('/api/sign-to-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ base64Image: image, history: chatHistory, lang: language })
      });
      const data = await response.json();
      if (data.success) {
        const rawText = data.result;
        setResult(rawText);
        const unrecognized = language === 'zh' ? "未能识别" : "Unrecognized";
        if (rawText !== unrecognized) {
          const optimizeResponse = await fetch('/api/optimize-text', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rawText, scenario: "通用", history: chatHistory, lang: language })
          });
          const optimizeData = await optimizeResponse.json();
          if (optimizeData.success) {
            const optimized = optimizeData.result;
            setOptimizedResult(optimized);
            setTimeout(() => onComplete(optimized), 0);
          }
        } else {
          setTimeout(() => onComplete(rawText), 0);
        }
      } else {
        setError(language === 'zh' ? "处理失败，请重试。" : "Processing failed, please try again.");
      }
    } catch (err) {
      setError(language === 'zh' ? "处理失败，请重试。" : "Processing failed, please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 relative z-10">
      <div className="card-accessible overflow-hidden relative min-h-[400px] flex flex-col items-center justify-center bg-white/40 backdrop-blur-xl border-none shadow-2xl shadow-rose-900/5">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ec4899 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
        
        <AnimatePresence mode="wait">
          {!image && !isCameraActive ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-4"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-rose-100 via-pink-200 to-rose-300 rounded-full flex items-center justify-center mx-auto shadow-inner relative group-hover:scale-110 transition-transform duration-500">
                <Camera className="text-rose-500 relative z-10" size={36} />
                <motion.div 
                  animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute inset-0 bg-rose-400 rounded-full"
                />
                <div className="absolute -top-2 -right-2 text-amber-400 animate-bounce">
                  <Sparkles size={24} fill="currentColor" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-rose-900">{t.empty.title}</p>
                <p className="text-rose-400">{t.empty.subtitle}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <button 
                  onClick={startCamera}
                  className="btn-accessible btn-primary gap-2"
                >
                  <Camera size={20} /> {t.empty.openCamera}
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-accessible btn-outline border-rose-200 text-rose-500 hover:bg-rose-50 gap-2"
                >
                  <Upload size={20} /> {t.empty.uploadImage}
                </button>
                <button 
                  onClick={() => videoInputRef.current?.click()}
                  className="btn-accessible btn-outline border-rose-200 text-rose-500 hover:bg-rose-50 gap-2"
                >
                  <Upload size={20} /> {t.empty.uploadVideo}
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <input 
                type="file" 
                ref={videoInputRef} 
                onChange={handleVideoUpload} 
                accept="video/*" 
                className="hidden" 
              />
            </motion.div>
          ) : isCameraActive ? (
            <motion.div 
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center relative"
            >
              <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-rose-900 shadow-inner">
                <video 
                  ref={videoRefCallback} 
                  autoPlay 
                  playsInline 
                  muted
                  className="w-full h-full object-contain"
                />
                <canvas 
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
                
                {/* AI Tracking Status */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-full border border-white/10">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    !isAiEnabled ? "bg-slate-500" : (handLandmarker ? "bg-green-400 animate-pulse" : (isAiLoading ? "bg-yellow-400 animate-bounce" : "bg-red-400"))
                  )} />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    {!isAiEnabled ? t.camera.trackingOff : (handLandmarker ? t.camera.trackingOn : (isAiLoading ? t.camera.loadingEngine : t.camera.loadingFailed))}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 mt-6">
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={() => setIsLiveMode(!isLiveMode)} 
                    disabled={isRecording || isProcessing}
                    className={cn(
                      "btn-accessible gap-2 px-6 min-w-[160px] shadow-xl transition-all",
                      isLiveMode ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white animate-pulse shadow-emerald-500/30" : "bg-gradient-to-r from-primary to-accent text-white shadow-primary/30"
                    )}
                  >
                    <Sparkles size={18} /> {isLiveMode ? t.camera.liveRecognizing : t.camera.liveMode}
                  </button>
                  <button 
                    onClick={() => startRecording(3)} 
                    disabled={isRecording || isProcessing}
                    className={cn(
                      "btn-accessible gap-2 px-6 min-w-[160px] shadow-xl transition-all",
                      isRecording && recordingLimit === 3 ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white animate-pulse shadow-rose-500/30" : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-500/30"
                    )}
                  >
                    {isRecording && recordingLimit === 3 ? (
                      <>{t.camera.recording} {3 - recordingTime}s</>
                    ) : (
                      <><RefreshCw size={18} className={isProcessing ? "animate-spin" : ""} /> {t.camera.shortRecognition}</>
                    )}
                  </button>
                  <button 
                    onClick={() => startRecording(10)} 
                    disabled={isRecording || isProcessing}
                    className={cn(
                      "btn-accessible gap-2 px-6 min-w-[160px] shadow-xl transition-all",
                      isRecording && recordingLimit === 10 ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white animate-pulse shadow-rose-500/30" : "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-500/30"
                    )}
                  >
                    {isRecording && recordingLimit === 10 ? (
                      <>{t.camera.recording} {10 - recordingTime}s</>
                    ) : (
                      <><Zap size={18} /> {t.camera.longRecognition}</>
                    )}
                  </button>
                  <button onClick={capturePhoto} disabled={isRecording || isProcessing} className="btn-accessible btn-outline border-rose-200 text-rose-500 px-8">{t.camera.capture}</button>
                  <button onClick={stopCamera} disabled={isRecording || isProcessing} className="btn-accessible btn-outline border-rose-200 text-rose-500">{t.camera.cancel}</button>
                </div>
                <div className="flex flex-col items-center gap-2 mt-4 p-4 bg-rose-100/30 rounded-2xl w-full max-w-md">
                  {isLiveMode && (
                    <div className="w-full mb-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-rose-100 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">{t.camera.liveTranscript}</span>
                        <button 
                          onClick={() => setLiveTranscript([])}
                          className="text-[10px] text-rose-300 hover:text-rose-500 transition-colors"
                        >
                          {t.camera.clear}
                        </button>
                      </div>
                      <div className="min-h-[40px] flex flex-wrap gap-2">
                        {liveTranscript.length > 0 ? (
                          liveTranscript.map((word, i) => (
                            <motion.span 
                              key={i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium"
                            >
                              {word}
                            </motion.span>
                          ))
                        ) : (
                          <span className="text-sm text-rose-200 italic">{t.camera.waiting}</span>
                        )}
                      </div>
                    </div>
                  )}
                  <p className="text-xs font-bold text-rose-500 uppercase">{t.tips.title}</p>
                  <ul className="text-[10px] text-rose-400 list-disc list-inside text-left">
                    {t.tips.items.map((item, i) => <li key={i}>{item}</li>)}
                    <li className="text-primary font-bold">{language === 'zh' ? "长句识别时请放慢动作，确保手势清晰完整" : "Slow down for long phrases to ensure clear gestures"}</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center"
            >
              <img src={image!} alt="Preview" className="max-h-[400px] rounded-3xl shadow-lg border-4 border-white object-contain" />
              <div className="flex gap-4 mt-6">
                <button 
                  onClick={processImage} 
                  disabled={isProcessing}
                  className="btn-accessible btn-primary gap-2 min-w-[140px]"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  {isProcessing ? t.preview.processing : t.preview.start}
                </button>
                <button 
                  onClick={() => { setImage(null); setResult(null); setOptimizedResult(null); }} 
                  className="btn-accessible btn-outline border-rose-200 text-rose-500"
                >
                  {t.preview.reselect}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="card-accessible bg-white border-rose-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-rose-300 uppercase tracking-widest">{t.results.title}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(optimizedResult || result || "");
                  }}
                  className="p-2 hover:bg-rose-50 rounded-lg text-rose-300" 
                  title={t.results.copy}
                >
                  <Copy size={18} />
                </button>
                <button 
                  onClick={() => {
                    onShare(optimizedResult || result || "");
                  }}
                  className="p-2 hover:bg-rose-50 rounded-lg text-rose-300" 
                  title={t.results.share}
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-rose-50/50 rounded-2xl">
                <p className="text-rose-400 text-sm mb-1">{t.results.raw}：</p>
                <p className="text-accessible-lg font-medium text-rose-900">{result}</p>
              </div>
              
              {optimizedResult && (
                <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3">
                    <Sparkles className="text-primary/10" size={48} />
                  </div>
                  <p className="text-primary text-sm font-bold mb-2 flex items-center gap-2">
                    <Sparkles size={14} /> {t.results.optimized}
                  </p>
                  <p className="text-accessible-xl text-primary leading-tight">
                    {optimizedResult}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
