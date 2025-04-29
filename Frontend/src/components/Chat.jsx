import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from "react-markdown";

const BusinessChatBox = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const SYSTEM_PROMPT = `You are a business strategy assistant.
You must:
✔ Provide data-driven business insights
✔ Generate strategic plans and recommendations
✔ Focus on trends, opportunities, risks, and KPIs
✔ Tailor responses for startups, SMEs, or large enterprises

You must NOT:
❌ Answer unrelated questions
❌ Provide non-business content

Respond strictly within business analysis, management, growth, and operational strategy.`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: `${SYSTEM_PROMPT}\n\n${userMessage} `}]
            }
          ]
        }
      );

      const botResponse =
        response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠ No response received.";

      setMessages([...newMessages, { role: "assistant", content: botResponse }]);
    } catch (error) {
      console.error("Gemini error:", error);
      setMessages([...newMessages, {
        role: "assistant",
        content: "⚠ Failed to fetch response. Please check your API key or try again later."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed top-1/2 transform -translate-y-1/2 w-[500px] bg-white shadow-lg border rounded-lg">
      <div className="p-4 bg-[#002244] text-white flex justify-between rounded-t-lg">
        <span className="font-bold">Business Strategy Assistant</span>
        <button
          onClick={onClose}
          className="hover:bg-neutral-700 rounded-full w-6 h-6 flex items-center justify-center"
        >
          X
        </button>
      </div>

      <div className="h-96 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="text-gray-500 text-center p-4">
            Welcome! Ask me anything about business strategy, KPIs, growth plans, or market trends.
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-lg ${
              msg.role === "user"
                ? "bg-blue-500 text-white text-right ml-auto"
                : "bg-gray-300 text-black"
            }`}
          >
            <div className="whitespace-pre-wrap break-words">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-bounce">●</div>
            <div className="animate-bounce [animation-delay:0.2s]">●</div>
            <div className="animate-bounce [animation-delay:0.4s]">●</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2 flex">
        <input
          type="text"
          className="flex-1 p-2 border rounded-lg text-black"
          placeholder="Ask me about strategy, KPIs, market insights..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={false}
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-[#002244] hover:bg-blue-800 text-white px-4 py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default BusinessChatBox; 