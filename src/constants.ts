export type Language = 'zh' | 'en';

export const translations = {
  zh: {
    intro: {
      badge: "多模态 AI 驱动 · 温馨无障碍沟通",
      title: "让沟通充满“爱”与“隙”",
      subtitle: "语隙是一款充满温情的手语助手，不仅是翻译工具，更是您学习手语、连接彼此的温馨港湾。"
    },
    nav: {
      translate: "翻译模式",
      learn: "学习模式",
      history: "询问记录"
    },
    modes: {
      signToText: "手语转文字",
      textToSign: "文字转手语"
    },
    login: {
      title: "语隙 (YuXi)",
      subtitle: "用技术弥合鸿沟 · 让沟通充满温情",
      googleLogin: "登录/注册",
      guestLogin: "直接开始使用（游客模式）",
      privacyNote: "登录即表示您同意我们的服务条款和隐私政策"
    },
    onboarding: {
      steps: [
        {
          title: "欢迎来到语隙 (YuXi)",
          description: "这是一个充满温情的手语助手，旨在用 AI 弥合沟通的鸿沟。让我们花一分钟了解如何使用它。",
          audioText: "欢迎来到语隙。这是一个手语助手，让我们花一分钟了解如何使用它。"
        },
        {
          title: "手语转文字",
          description: "点击‘开启摄像头’，您可以进行实时手语识别。支持拍照、短句识别和长句识别模式。",
          audioText: "手语转文字功能。开启摄像头后，您可以进行实时识别，也支持拍照和录制短视频。"
        },
        {
          title: "文字转手语",
          description: "输入您想说的话，AI 会为您生成详细的手语动作描述，并配有 Emoji 示意和视频教程链接。",
          audioText: "文字转手语功能。输入文字，AI 会为您生成详细的手语动作描述和视频教程。"
        },
        {
          title: "学习与记录",
          description: "在‘学习模式’中探索常用词汇，‘询问记录’则会帮您保存所有的翻译历史，方便随时回顾。",
          audioText: "学习与记录。您可以学习常用词汇，并在询问记录中查看翻译历史。"
        }
      ],
      next: "下一步",
      prev: "上一步",
      start: "开启旅程",
      replay: "重新播放语音提示"
    },
    signToText: {
      empty: {
        title: "开启您的手语翻译之旅",
        subtitle: "支持拍照、短视频录制及长视频上传",
        openCamera: "开启摄像头",
        uploadImage: "上传图片",
        uploadVideo: "上传视频"
      },
      camera: {
        trackingOn: "实时追踪中",
        trackingOff: "追踪关闭",
        loadingEngine: "加载引擎...",
        loadingFailed: "加载失败",
        liveMode: "实时识别",
        liveRecognizing: "实时识别中...",
        shortRecognition: "短句识别",
        longRecognition: "长句识别",
        capture: "拍照",
        cancel: "取消",
        recording: "录制中",
        liveTranscript: "实时字幕",
        clear: "清空",
        waiting: "等待识别手势..."
      },
      tips: {
        title: "温馨提示：",
        items: [
          "短句识别适用于单个词汇或简单问候",
          "长句识别适用于表达完整意思（10秒）",
          "请尽量保持动作在画面中心"
        ]
      },
      preview: {
        start: "开始识别",
        processing: "识别中...",
        reselect: "重选"
      },
      results: {
        title: "识别结果",
        copy: "复制",
        share: "分享",
        raw: "原始识别",
        optimized: "AI 语义优化"
      }
    },
    textToSign: {
      placeholder: "输入你想表达的文字...",
      convert: "转换手语",
      processing: "转换中...",
      results: {
        title: "手语表达指南",
        share: "分享"
      },
      tutorial: {
        title: "想要观看视频教程？",
        subtitle: "在 Bilibili 上查看“{text}”的专业手语演示",
        button: "立即前往观看"
      },
      note: "提示：以上是基于中国标准手语的动作描述。在实际交流中，配合面部表情和身体姿态能让表达更准确。"
    },
    learn: {
      title: "手语学习乐园",
      subtitle: "探索手语的魅力，让沟通无障碍",
      placeholder: "输入你想学习的主题，如：餐厅点餐...",
      start: "开始学习",
      exploring: "探索中...",
      hotTopics: "热门主题",
      quickTopics: ["日常问候", "数字与时间", "家庭成员", "紧急求助", "情绪表达"],
      encouragement: "加油！你已经迈出了重要的一步",
      newTopic: "学习新主题",
      features: [
        {
          title: "AI 智能导师",
          desc: "输入任何生活场景，AI 将为您量身定制手语教学方案，包括动作细节和表达技巧。"
        },
        {
          title: "循序渐进",
          desc: "从基础词汇到复杂句子，我们陪伴您在温馨的氛围中逐步掌握这门美丽的视觉语言。"
        }
      ]
    },
    history: {
      title: "询问记录",
      clear: "清空记录",
      empty: "暂无翻译记录"
    },
    scenarios: {
      title: "常用场景快捷输入",
      more: "查看更多",
      items: [
        { name: "医院就诊", phrases: ["我哪里不舒服", "挂号在哪里", "药房怎么走", "谢谢医生"] },
        { name: "超市购物", phrases: ["这个多少钱", "在哪里结账", "需要袋子", "可以用手机支付吗"] },
        { name: "校园交流", phrases: ["请问图书馆在哪", "这节是什么课", "一起去食堂吗", "能帮我一下吗"] },
        { name: "政务办理", phrases: ["我要办业务", "需要什么材料", "在这里签字吗", "办好了吗"] }
      ]
    },
    rooms: {
      title: "协作学习室",
      subtitle: "与志同道合的朋友一起探索手语",
      create: "创建学习室",
      join: "加入房间",
      roomName: "房间名称",
      placeholder: "输入房间名称...",
      members: "成员",
      chat: "实时交流",
      send: "发送",
      leave: "退出房间",
      empty: "暂无活跃学习室，快去创建一个吧！",
      voiceHint: "点击说话",
      voiceListening: "正在倾听...",
    }
  },
  en: {
    intro: {
      badge: "Multimodal AI · Warm Barrier-free Communication",
      title: "Fill Communication with Love",
      subtitle: "YuXi is a warm sign language assistant, not just a translation tool, but a harbor for learning and connecting."
    },
    nav: {
      translate: "Translate",
      learn: "Learn",
      history: "History"
    },
    modes: {
      signToText: "Sign to Text",
      textToSign: "Text to Sign"
    },
    login: {
      title: "YuXi",
      subtitle: "Bridging Divides with Technology · Warm Communication",
      googleLogin: "Login / Register",
      guestLogin: "Continue as Guest",
      privacyNote: "By logging in, you agree to our Terms and Privacy Policy"
    },
    onboarding: {
      steps: [
        {
          title: "Welcome to YuXi",
          description: "A warm sign language assistant using AI to bridge communication gaps. Let's take a minute to learn how to use it.",
          audioText: "Welcome to YuXi. This is a sign language assistant. Let's take a minute to learn how to use it."
        },
        {
          title: "Sign to Text",
          description: "Click 'Open Camera' for real-time recognition. Supports photo, short phrase, and long phrase modes.",
          audioText: "Sign to text function. After opening the camera, you can perform real-time recognition, or capture photos and short videos."
        },
        {
          title: "Text to Sign",
          description: "Enter text, and AI will generate detailed gesture descriptions with Emojis and tutorial links.",
          audioText: "Text to sign function. Enter text, and AI will generate detailed gesture descriptions and video tutorials."
        },
        {
          title: "Learn & History",
          description: "Explore vocabulary in 'Learn Mode' and review all your translations in 'History'.",
          audioText: "Learn and History. You can learn common vocabulary and view your translation history."
        }
      ],
      next: "Next",
      prev: "Back",
      start: "Start Journey",
      replay: "Replay Voice Hint"
    },
    signToText: {
      empty: {
        title: "Start Your Translation Journey",
        subtitle: "Supports photo, short video, and long video upload",
        openCamera: "Open Camera",
        uploadImage: "Upload Image",
        uploadVideo: "Upload Video"
      },
      camera: {
        trackingOn: "Tracking Active",
        trackingOff: "Tracking Off",
        loadingEngine: "Loading Engine...",
        loadingFailed: "Load Failed",
        liveMode: "Live Mode",
        liveRecognizing: "Recognizing...",
        shortRecognition: "Short Phrase",
        longRecognition: "Long Phrase",
        capture: "Capture",
        cancel: "Cancel",
        recording: "Recording",
        liveTranscript: "Live Transcript",
        clear: "Clear",
        waiting: "Waiting for gestures..."
      },
      tips: {
        title: "Tips:",
        items: [
          "Short phrase for single words or greetings",
          "Long phrase for complete sentences (10s)",
          "Please keep your movements in the center"
        ]
      },
      preview: {
        start: "Start Recognition",
        processing: "Processing...",
        reselect: "Reselect"
      },
      results: {
        title: "Recognition Results",
        copy: "Copy",
        share: "Share",
        raw: "Raw Recognition",
        optimized: "AI Optimized"
      }
    },
    textToSign: {
      placeholder: "Enter text to express...",
      convert: "Convert to Sign",
      processing: "Converting...",
      results: {
        title: "Sign Expression Guide",
        share: "Share"
      },
      tutorial: {
        title: "Want video tutorials?",
        subtitle: "Search for \"{text}\" sign language demos on YouTube",
        button: "Watch Now"
      },
      note: "Note: These are descriptions based on standard sign language. Facial expressions and body posture help accuracy."
    },
    learn: {
      title: "Sign Language Paradise",
      subtitle: "Explore the charm of sign language",
      placeholder: "Enter a topic, e.g., Ordering food...",
      start: "Start Learning",
      exploring: "Exploring...",
      hotTopics: "Hot Topics",
      quickTopics: ["Greetings", "Numbers & Time", "Family", "Emergency", "Emotions"],
      encouragement: "Keep it up! You've taken an important step.",
      newTopic: "Learn New Topic",
      features: [
        {
          title: "AI Smart Tutor",
          desc: "Enter any life scenario, and AI will tailor a sign language teaching plan for you."
        },
        {
          title: "Step by Step",
          desc: "From basic vocabulary to complex sentences, we accompany you to master this beautiful language."
        }
      ]
    },
    history: {
      title: "History",
      clear: "Clear All",
      empty: "No history yet"
    },
    scenarios: {
      title: "Quick Scenarios",
      more: "See More",
      items: [
        { name: "Medical", phrases: ["I feel unwell", "Where is registration", "How to get to pharmacy", "Thank you doctor"] },
        { name: "Shopping", phrases: ["How much is this", "Where to checkout", "I need a bag", "Can I pay by phone"] },
        { name: "Campus", phrases: ["Where is the library", "What class is this", "Go to canteen together", "Can you help me"] },
        { name: "Government", phrases: ["I need to handle business", "What materials are needed", "Sign here", "Is it done"] }
      ]
    },
    rooms: {
      title: "Learning Rooms",
      subtitle: "Explore sign language with like-minded friends",
      create: "Create Room",
      join: "Join Room",
      roomName: "Room Name",
      placeholder: "Enter room name...",
      members: "Members",
      chat: "Live Chat",
      send: "Send",
      leave: "Leave Room",
      empty: "No active rooms yet. Create one!",
      voiceHint: "Click to speak",
      voiceListening: "Listening...",
    }
  }
};
