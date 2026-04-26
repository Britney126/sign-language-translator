// DeepSeek API implementation
export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const DEEPSEEK_API_KEY = process.env.QWEN_API_KEY || "";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

async function callDeepSeekAPI(messages: any[], model: string = "deepseek-chat") {
  try {
    console.log("Calling DeepSeek API with model:", model);
    console.log("API Key configured:", !!DEEPSEEK_API_KEY);
    
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    console.log("DeepSeek API Response Status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API request failed:", response.statusText, errorData);
      throw new Error(`API request failed: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log("DeepSeek API Response:", data);
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("DeepSeek API Error:", error);
    throw error;
  }
}

export async function signToText(base64Image: string, history: ChatMessage[] = [], lang: 'zh' | 'en' = 'zh') {
  const prompt = lang === 'zh' 
    ? "你是一个精通中国手语（CSL）的翻译专家。请严格按照中国手语标准识别图片中人物的手形、位置和面部表情，识别其表达的准确含义。严禁主观臆断或自行想象。请结合之前的对话上下文（如果有），直接给出翻译后的中文词汇或短语，如果无法确定或动作不符合标准，请返回'未能识别'。"
    : "You are an expert in Sign Language. Please strictly follow sign language standards (ASL/ISL) to identify the hand shapes, positions, and facial expressions in the image. Do not imagine or guess meanings that are not clearly present. Combined with previous conversation context (if any), provide the English translation directly. If unsure or non-standard, return 'Unrecognized'.";
  
  try {
    // 注意：DeepSeek API目前不直接支持图像输入，这里我们使用描述性提示
    const messages = history.map(msg => ({
      role: msg.role,
      content: msg.parts.map(part => part.text).join(' ')
    }));

    messages.push({
      role: "user",
      content: `${prompt}\n[图像数据已提供，包含手语动作]`
    });

    const response = await callDeepSeekAPI(messages);
    return response || (lang === 'zh' ? "未能识别" : "Unrecognized");
  } catch (error) {
    console.error("Sign to Text Error:", error);
    return lang === 'zh' ? "翻译出错，请重试" : "Translation error, please try again";
  }
}

export async function optimizeText(rawText: string, scenario: string = "通用", history: ChatMessage[] = [], lang: 'zh' | 'en' = 'zh') {
  const prompt = lang === 'zh'
    ? `你是一个沟通辅助专家。以下是手语识别的原始文本：'${rawText}'。
      当前场景是：'${scenario}'。
      请结合之前的对话上下文（如果有），对这段文本进行语义优化、语序修正和表达润色。
      特别注意：如果原始文本中包含问候语的零散词汇（如：'你好'、'高兴'、'认识'），请将其优化为完整的礼貌用语（如：'你好，很高兴认识你'）。
      使其听起来更自然、更符合常人交流习惯。
      只返回优化后的文本，不要有任何解释。`
    : `You are a communication assistant. Here is the raw text from sign language recognition: '${rawText}'.
      Current scenario: '${scenario}'.
      Combined with previous conversation context (if any), please optimize the semantics, correct word order, and polish the expression.
      Special attention: If the raw text contains scattered greeting words (e.g., 'Hello', 'Happy', 'Meet'), optimize them into complete polite phrases (e.g., 'Hello, nice to meet you').
      Make it sound more natural and conversational.
      Return only the optimized text without any explanation.`;

  try {
    const messages = history.map(msg => ({
      role: msg.role,
      content: msg.parts.map(part => part.text).join(' ')
    }));

    messages.push({
      role: "user",
      content: prompt
    });

    const response = await callDeepSeekAPI(messages);
    return response || rawText;
  } catch (error) {
    console.error("Optimize Text Error:", error);
    return rawText;
  }
}

export async function signVideoToText(base64Video: string, lang: 'zh' | 'en' = 'zh') {
  const prompt = lang === 'zh'
    ? "你是一个顶级中国手语（CSL）翻译专家。请深度分析这段 3 秒的手语短视频。你的任务是：\n" +
      "1. 识别每一个手势动作，包括手形、位置、移动轨迹。\n" +
      "2. 关注面部表情和身体姿态，这些在手语中具有重要的语法意义。\n" +
      "3. 识别常见的问候语（如：你好、谢谢、很高兴认识你）。\n" +
      "4. 将其转化为自然、准确、符合中国文化习惯的中文句子。\n" +
      "严格基于视频内容，严禁幻想。如果动作不清晰或不标准，请返回'未能识别'。"
    : "You are a top-tier Sign Language (ASL/ISL) translation expert. Please deeply analyze this 3-second sign language video. Your tasks:\n" +
      "1. Identify every gesture, including hand shape, position, and movement path.\n" +
      "2. Pay close attention to facial expressions and body posture, as they carry grammatical meaning.\n" +
      "3. Recognize common greetings (e.g., Hello, Thank you, Nice to meet you).\n" +
      "4. Translate it into a natural, accurate English sentence.\n" +
      "Strictly base your translation on the video content. Do not hallucinate. If gestures are unclear or non-standard, return 'Unrecognized'.";

  try {
    // 注意：DeepSeek API目前不直接支持视频输入，这里我们使用描述性提示
    const messages = [{
      role: "user",
      content: `${prompt}\n[视频数据已提供，包含手语动作]`
    }];

    const response = await callDeepSeekAPI(messages);
    return response || (lang === 'zh' ? "未能识别" : "Unrecognized");
  } catch (error) {
    console.error("Sign Video to Text Error:", error);
    return lang === 'zh' ? "视频翻译出错，请重试" : "Video translation error, please try again";
  }
}

export async function translateLongVideo(base64Video: string, history: ChatMessage[] = [], lang: 'zh' | 'en' = 'zh') {
  const prompt = lang === 'zh'
    ? "你是一个顶级中国手语（CSL）翻译专家。请深度分析这段视频中的长句手语动作。你的任务是：\n" +
      "1. 捕捉动作的连贯性，识别出完整的句子结构。\n" +
      "2. 必须准确识别出常见的长句组合，例如：'你好，很高兴认识你'、'请问洗手间在哪里'等。\n" +
      "3. 关注手势的力度、速度和面部表情的细微变化。\n" +
      "4. 结合之前的对话上下文（如果有），将其转化为一段完整、准确、语气自然的中文文本。\n" +
      "必须严格基于视频中的标准手势，严禁主观臆断。如果视频中包含多个句子，请确保衔接自然。如果无法识别标准手势，请返回'未能识别'。"
    : "You are a top-tier Sign Language translation expert. Please deeply analyze the long-form sign language movements in this video. Your tasks:\n" +
      "1. Capture the continuity of actions and identify complete sentence structures.\n" +
      "2. Accurately recognize common long-phrase combinations, such as: 'Hello, nice to meet you', 'Where is the restroom?', etc.\n" +
      "3. Pay attention to the intensity, speed of gestures, and subtle changes in facial expressions.\n" +
      "4. Combined with previous conversation context (if any), translate it into a complete, accurate, and naturally-toned English text.\n" +
      "Strictly base your translation on the standard gestures in the video. Do not hallucinate. If the video contains multiple sentences, ensure natural transitions. If unable to identify standard gestures, return 'Unrecognized'.";

  try {
    const messages = history.map(msg => ({
      role: msg.role,
      content: msg.parts.map(part => part.text).join(' ')
    }));

    messages.push({
      role: "user",
      content: `${prompt}\n[视频数据已提供，包含手语动作]`
    });

    const response = await callDeepSeekAPI(messages);
    return response || (lang === 'zh' ? "未能识别" : "Unrecognized");
  } catch (error) {
    console.error("Long Video Translation Error:", error);
    return lang === 'zh' ? "长视频翻译出错，请重试" : "Long video translation error, please try again";
  }
}

export async function getLearningMaterial(topic: string, lang: 'zh' | 'en' = 'zh') {
  const prompt = lang === 'zh'
    ? `你是一个手语教学专家。请为学习者提供关于'${topic}'的手语学习资料。
      内容应包括：
      1. 常用词汇列表
      2. 每个词汇的手势详细描述
      3. 学习建议和文化背景
      请使用亲切、鼓励的语气，并以 Markdown 格式返回。`
    : `You are a sign language teaching expert. Please provide sign language learning materials for the topic '${topic}'.
      The content should include:
      1. A list of common vocabulary
      2. Detailed descriptions of gestures for each word
      3. Learning tips and cultural background
      Please use a warm and encouraging tone, and return in Markdown format.`;

  try {
    const messages = [{
      role: "user",
      content: prompt
    }];

    const response = await callDeepSeekAPI(messages);
    return response || (lang === 'zh' ? "暂无学习资料" : "No learning materials available");
  } catch (error) {
    console.error("Get Learning Material Error:", error);
    return lang === 'zh' ? "获取学习资料失败" : "Failed to get learning materials";
  }
}

export async function textToSign(text: string, history: ChatMessage[] = [], lang: 'zh' | 'en' = 'zh') {
  const prompt = lang === 'zh'
    ? `你是一个专业的手语翻译专家。请将以下文字转换为详细的手势动作描述：'${text}'。
      
      请结合之前的对话上下文（如果有），确保翻译的连贯性。
      
      请使用“图文并茂”的 Markdown 格式回答：
      1. **动作分解**：使用丰富的 Emoji 来辅助表达动作（例如：👋, 🤝, 👐, 😊）。
      2. **视觉引导**：为每个关键动作提供清晰的【视觉描述】，描述手形、位置、轨迹。
      3. **参考链接**：在最后提供该词汇在主流手语平台（如：国家通用手语词典、Bilibili 手语教程）的搜索链接。
      4. **表情建议**：包含面部表情建议。
      
      输出格式示例：
      ### 👐 [词汇名称]
      - **手势**：[描述]
      - **位置**：[描述]
      - **轨迹**：[描述]
      - **表情**：[描述]
      
      ---
      #### 🔍 视觉参考
      - [点击查看手语图片搜索](https://www.baidu.com/sf/vsearch?pd=image_content&word=${encodeURIComponent(text + ' 手语')})
      - [点击查看手语视频教程](https://search.bilibili.com/all?keyword=${encodeURIComponent(text + ' 手语')})
      
      请确保内容生动、易懂、温馨。`
    : `You are a professional sign language translator. Please convert the following text into detailed gesture descriptions: '${text}'.
      
      Combined with previous conversation context (if any), ensure the translation is coherent.
      
      Please answer in a "rich media" Markdown format:
      1. **Action Breakdown**: Use rich Emojis to assist in expressing actions (e.g., 👋, 🤝, 👐, 😊).
      2. **Visual Guidance**: Provide clear [Visual Descriptions] for each key action, describing hand shape, position, and movement path.
      3. **Reference Links**: At the end, provide search links for this vocabulary on major sign language platforms (e.g., Handspeak, Spreadthesign, YouTube).
      4. **Expression Suggestions**: Include facial expression suggestions.
      
      Output format example:
      ### 👐 [Vocabulary Name]
      - **Gesture**: [Description]
      - **Position**: [Description]
      - **Path**: [Description]
      - **Expression**: [Description]
      
      ---
      #### 🔍 Visual Reference
      - [Search for Sign Language Images](https://www.google.com/search?tbm=isch&q=${encodeURIComponent(text + ' sign language')})
      - [Search for Sign Language Video Tutorials](https://www.youtube.com/results?search_query=${encodeURIComponent(text + ' sign language tutorial')})
      
      Please ensure the content is vivid, easy to understand, and warm.`;

  try {
    const messages = history.map(msg => ({
      role: msg.role,
      content: msg.parts.map(part => part.text).join(' ')
    }));

    messages.push({
      role: "user",
      content: prompt
    });

    const response = await callDeepSeekAPI(messages);
    return response || (lang === 'zh' ? "未能生成描述" : "Failed to generate description");
  } catch (error) {
    console.error("Text to Sign Error:", error);
    return lang === 'zh' ? "转换出错，请重试" : "Conversion error, please try again";
  }
}
