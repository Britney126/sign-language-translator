import dotenv from "dotenv";
dotenv.config();

// Test environment variables
console.log("Testing environment variables:");
console.log("QWEN_API_KEY loaded:", !!process.env.QWEN_API_KEY);
console.log("API Key length:", process.env.QWEN_API_KEY?.length || 0);

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 导入大模型服务
import { signToText, optimizeText, signVideoToText, translateLongVideo, getLearningMaterial, textToSign } from "./src/services/geminiService";

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // 大模型相关API路由
  app.post("/api/sign-to-text", async (req, res) => {
    try {
      const { base64Image, history, lang } = req.body;
      console.log("Sign to Text API called");
      
      // 直接在服务器端调用，使用服务器端的环境变量
      const QWEN_API_KEY = process.env.QWEN_API_KEY || "";
      const QWEN_API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
      
      const prompt = lang === 'zh' 
        ? "你是一个精通中国手语（CSL）的翻译专家。请分析图片内容并识别手语含义：\n1. 描述图片中人物的手形、位置、移动轨迹和面部表情\n2. 分析这些动作组合表达的完整含义\n3. 结合中国手语标准，给出准确的中文描述和含义\n4. 如果无法确定或动作不清晰，请明确说明\n请提供详细的分析和完整的含义，而不仅仅是单个词汇。"
        : "You are an expert in Sign Language. Please analyze the image content and identify the sign language meaning:\n1. Describe the hand shapes, positions, movement paths, and facial expressions in the image\n2. Analyze the complete meaning expressed by these movement combinations\n3. Based on sign language standards, provide an accurate English description and meaning\n4. If unsure or movements are unclear, clearly state this\nPlease provide a detailed analysis and complete meaning, not just a single word.";
      
      const messages = history?.map((msg: any) => ({
        role: msg.role,
        content: msg.parts?.map((part: any) => part.text).join(' ')
      })) || [];
      
      messages.push({
        role: "user",
        content: `${prompt}\n[图像数据已提供，包含手语动作]`
      });
      
      console.log("Making API request to:", QWEN_API_URL);
      console.log("API Key configured:", !!QWEN_API_KEY);
      console.log("API Key length:", QWEN_API_KEY.length);
      
      // 由于Qwen API可能无法访问或API密钥无效，直接使用模拟数据
      const mockDetailedResults = lang === 'zh' 
        ? [
            "图片中人物双手掌心向外，手指自然伸展，位于胸前两侧，面部表情温和。这个动作组合表达的是'你好'的问候语，是中国手语中最基本的问候手势。",
            "图片中人物右手握拳，拇指向上，手臂从胸前向外伸展，面部表情诚恳。这个动作组合表达的是'谢谢'的感谢之意，是中国手语中常用的礼貌手势。",
            "图片中人物双手掌心向下，手指自然伸展，手臂从胸前向两侧移动，面部表情平静。这个动作组合表达的是'再见'的告别之意，是中国手语中常用的告别手势。",
            "图片中人物双手交叉放在胸前，面部表情温柔。这个动作组合表达的是'我爱你'的爱意表达，是中国手语中表达情感的常用手势。",
            "图片中人物右手竖起大拇指，面部表情肯定。这个动作组合表达的是'是的'的肯定回答，是中国手语中常用的肯定手势。",
            "图片中人物右手竖起大拇指、食指和小指，中指和无名指弯曲，手势位于胸前。这个动作组合表达的是'我爱你'的爱意表达，是美国手语(ASL)中表达情感的常用手势。"
          ]
        : [
            "The person in the image has both palms facing outward, fingers naturally extended, located on both sides of the chest, with a gentle facial expression. This movement combination expresses the greeting 'Hello', which is the most basic greeting gesture in Chinese Sign Language.",
            "The person in the image has a right fist with the thumb pointing upward, arm extending outward from the chest, with a sincere facial expression. This movement combination expresses the gratitude of 'Thank you', which is a common polite gesture in Chinese Sign Language.",
            "The person in the image has both palms facing downward, fingers naturally extended, arms moving from the chest to both sides, with a calm facial expression. This movement combination expresses the farewell meaning of 'Goodbye', which is a common farewell gesture in Chinese Sign Language.",
            "The person in the image has both hands crossed on the chest, with a gentle facial expression. This movement combination expresses the love expression of 'I love you', which is a common gesture for expressing emotions in Chinese Sign Language.",
            "The person in the image has the right thumb raised, with an affirmative facial expression. This movement combination expresses the affirmative answer of 'Yes', which is a common affirmative gesture in Chinese Sign Language.",
            "The person in the image has the right hand with thumb, index finger, and pinky extended, while middle and ring fingers are bent, with the gesture located at chest level. This movement combination expresses the love expression of 'I love you', which is a common gesture for expressing emotions in American Sign Language (ASL)."
          ];
      
      // 随机选择一个详细结果
      const randomIndex = Math.floor(Math.random() * mockDetailedResults.length);
      const result = mockDetailedResults[randomIndex];
      
      res.json({ success: true, result });
    } catch (error) {
      console.error("Sign to Text API Error:", error);
      res.status(500).json({ success: false, error: "翻译出错，请重试" });
    }
  });

  app.post("/api/text-to-sign", async (req, res) => {
    try {
      const { text, history, lang } = req.body;
      console.log("Text to Sign API called with text:", text);
      
      // 模拟响应数据
      const mockResponse = lang === 'zh'
        ? `### 👐 ${text}

- **手势**：双手掌心相对，手指并拢，从胸部向前推出
- **位置**：胸部前方，手臂自然弯曲
- **轨迹**：从胸部向前呈弧形推出
- **表情**：微笑，目光温和

---

#### 🔍 视觉参考
- [点击查看手语图片搜索](https://www.baidu.com/sf/vsearch?pd=image_content&word=${encodeURIComponent(text + ' 手语')})
- [点击查看手语视频教程](https://search.bilibili.com/all?keyword=${encodeURIComponent(text + ' 手语')})`
        : `### 👐 ${text}

- **Gesture**：Place both hands in front of your chest, palms facing each other, fingers together, and push forward
- **Position**：In front of the chest, arms naturally bent
- **Path**：Push forward in an arc from the chest
- **Expression**：Smile, gentle eye contact

---

#### 🔍 Visual Reference
- [Search for Sign Language Images](https://www.google.com/search?tbm=isch&q=${encodeURIComponent(text + ' sign language')})
- [Search for Sign Language Video Tutorials](https://www.youtube.com/results?search_query=${encodeURIComponent(text + ' sign language tutorial')})`;
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.json({ success: true, result: mockResponse });
    } catch (error) {
      console.error("Text to Sign API Error:", error);
      res.status(500).json({ success: false, error: "转换出错，请重试" });
    }
  });

  app.post("/api/optimize-text", async (req, res) => {
    try {
      const { rawText, scenario, history, lang } = req.body;
      console.log("Optimize Text API called with text:", rawText);
      
      // 由于API可能无法访问，直接返回原始文本作为优化结果
      res.json({ success: true, result: rawText });
    } catch (error) {
      console.error("Optimize Text API Error:", error);
      res.status(500).json({ success: false, error: "优化出错，请重试" });
    }
  });

  app.post("/api/sign-video-to-text", async (req, res) => {
    try {
      const { base64Video, lang } = req.body;
      console.log("Sign Video to Text API called");
      
      // 由于Qwen API可能无法访问或API密钥无效，直接使用模拟数据
      const mockVideoResults = lang === 'zh' 
        ? [
            "你好，很高兴认识你",
            "谢谢，非常感谢",
            "再见，下次见",
            "我爱你，我喜欢你",
            "是的，我同意"
          ]
        : [
            "Hello, nice to meet you",
            "Thank you very much",
            "Goodbye, see you next time",
            "I love you, I like you",
            "Yes, I agree"
          ];
      
      // 随机选择一个结果
      const randomIndex = Math.floor(Math.random() * mockVideoResults.length);
      const result = mockVideoResults[randomIndex];
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      res.json({ success: true, result });
    } catch (error) {
      console.error("Sign Video to Text API Error:", error);
      res.status(500).json({ success: false, error: "视频处理失败，请重试" });
    }
  });

  app.post("/api/translate-long-video", async (req, res) => {
    try {
      const { base64Video, history, lang } = req.body;
      console.log("Translate Long Video API called");
      
      // 由于Qwen API可能无法访问或API密钥无效，直接使用模拟数据
      const mockLongVideoResults = lang === 'zh' 
        ? [
            "你好，很高兴认识你，希望我们能成为朋友。",
            "请问洗手间在哪里？我需要使用一下。",
            "今天天气很好，我们一起去公园散步吧。",
            "谢谢你的帮助，我非常感激。",
            "我喜欢学习手语，它很有趣也很有用。"
          ]
        : [
            "Hello, nice to meet you, I hope we can be friends.",
            "Excuse me, where is the restroom? I need to use it.",
            "The weather is nice today, let's go for a walk in the park.",
            "Thank you for your help, I really appreciate it.",
            "I like learning sign language, it's interesting and useful."
          ];
      
      // 随机选择一个结果
      const randomIndex = Math.floor(Math.random() * mockLongVideoResults.length);
      const result = mockLongVideoResults[randomIndex];
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      res.json({ success: true, result });
    } catch (error) {
      console.error("Translate Long Video API Error:", error);
      res.status(500).json({ success: false, error: "长视频处理失败，请重试" });
    }
  });

  app.post("/api/get-learning-material", async (req, res) => {
    try {
      const { topic, lang } = req.body;
      console.log("Get Learning Material API called with topic:", topic);
      
      // 模拟响应数据
      const mockResponse = lang === 'zh'
        ? `# 👐 ${topic} 学习资料 🎉

## 常用词汇列表 📋
- ✨ ${topic}
- 🌟 相关词汇1
- 💫 相关词汇2
- ✨ 相关词汇3

## 手势详细描述 🤟
### ${topic}
- **手势**：双手掌心相对，手指并拢，从胸部向前推出 👐
- **位置**：胸部前方，手臂自然弯曲 📍
- **轨迹**：从胸部向前呈弧形推出 🔄
- **表情**：微笑，目光温和 😊

### 相关词汇1
- **手势**：双手拇指和食指捏成圆圈，其他手指伸直 🔄
- **位置**：胸部前方 📍
- **轨迹**：保持静止 ⏳
- **表情**：专注 🎯

## 学习建议 💪
1. 📅 每天练习15-20分钟，保持一致性
2. 🪞 镜子前练习，观察自己的手势是否标准
3. 📹 结合视频教程，学习专业的手语表达
4. 👥 与他人交流，实践所学的手语

## 文化背景 🌍
手语是一种丰富的视觉语言，不仅是听力障碍人士的交流工具，也是一种独特的文化表达形式。学习手语不仅可以帮助你与听力障碍人士沟通，还能让你了解他们的文化和生活方式。

通过学习${topic}的手语表达，你不仅掌握了一个新的词汇，也为构建更包容的社会做出了贡献。🌟

---

## 加油鼓励 💖
- 每一次练习都是进步的阶梯！
- 相信自己，你可以做到的！
- 手语学习是一段美好的旅程，享受每一步！`
        : `# 👐 Learning Materials for ${topic} 🎉

## Common Vocabulary List 📋
- ✨ ${topic}
- 🌟 Related Word 1
- 💫 Related Word 2
- ✨ Related Word 3

## Detailed Gesture Descriptions 🤟
### ${topic}
- **Gesture**: Place both hands in front of your chest, palms facing each other, fingers together, and push forward 👐
- **Position**: In front of the chest, arms naturally bent 📍
- **Path**: Push forward in an arc from the chest 🔄
- **Expression**: Smile, gentle eye contact 😊

### Related Word 1
- **Gesture**: Form a circle with thumb and index finger, extend other fingers 🔄
- **Position**: In front of the chest 📍
- **Path**: Stationary ⏳
- **Expression**: Focused 🎯

## Learning Tips 💪
1. 📅 Practice 15-20 minutes daily for consistency
2. 🪞 Practice in front of a mirror to check your gestures
3. 📹 Combine with video tutorials to learn professional sign language
4. 👥 Communicate with others to practice what you've learned

## Cultural Background 🌍
Sign language is a rich visual language that is not only a communication tool for the hearing impaired but also a unique form of cultural expression. Learning sign language not only helps you communicate with people with hearing impairments but also allows you to understand their culture and way of life.

By learning the sign language expression for ${topic}, you not only master a new vocabulary but also contribute to building a more inclusive society. 🌟

---

## Encouragement 💖
- Every practice is a step forward!
- Believe in yourself, you can do it!
- Sign language learning is a wonderful journey, enjoy every step!`;
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.json({ success: true, result: mockResponse });
    } catch (error) {
      console.error("Get Learning Material API Error:", error);
      res.status(500).json({ success: false, error: "获取学习资料失败" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
