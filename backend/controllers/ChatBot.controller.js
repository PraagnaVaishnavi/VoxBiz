import { GoogleGenerativeAI } from '@google/generative-ai';

console.log(process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const handleBusinessChat = async (req, res) => {
  try {
    const { message: userMessage, systemPrompt, currentVisualization, screenshot } = req.body;

    if (!userMessage || !userMessage.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const modelName = screenshot ? "gemini-1.5-pro-vision" : "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const parts = [];

    if (systemPrompt) {
      let enhancedSystemPrompt = systemPrompt;
      if (currentVisualization) {
        enhancedSystemPrompt += `\n\nThe user is currently viewing a ${currentVisualization} visualization. Please consider this when responding.`;
      }
      parts.push({ text: enhancedSystemPrompt });
    }

    parts.push({ text: `User: ${userMessage}` });

    if (screenshot) {
      const base64Data = screenshot.replace(/^data:image\/[^;]+;base64,/, '');
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: "image/png"
        }
      });
      parts.push({ text: "The above image is a screenshot of the current data visualization the user is referring to." });
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ]
    });

    const response = result.response;
    const botResponse = response.text();

    if (!botResponse) {
      return res.status(500).json({ error: "No valid response from Gemini" });
    }

    res.json({
      success: true,
      botResponse,
      metadata: {
        model: modelName,
        visualizationType: currentVisualization || "none"
      }
    });
  } catch (error) {
    console.error("Business chat error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });

    res.status(500).json({ 
      error: "Failed to generate response", 
      details: error.message 
    });
  }
};