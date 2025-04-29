import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from "react-markdown";
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const BusinessChatBox = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(window.speechSynthesis);

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

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setInput(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
    
    // Clean up speech recognition on component unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthesisRef.current && speechSynthesisRef.current.speaking) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text) => {
    if (!speechSynthesisRef.current) {
      alert("Speech synthesis is not supported in your browser.");
      return;
    }
    
    // Cancel any ongoing speech
    if (speechSynthesisRef.current.speaking) {
      speechSynthesisRef.current.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    speechSynthesisRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesisRef.current && speechSynthesisRef.current.speaking) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Stop listening when sending a message
    if (isListening) {
      toggleListening();
    }

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
      
      // Automatically speak the response
      speakText(botResponse.replace(/[#*_]/g, ''));
    } catch (error) {
      console.error("Gemini error:", error);
      const errorMessage = "⚠ Failed to fetch response. Please check your API key or try again later.";
      setMessages([...newMessages, {
        role: "assistant",
        content: errorMessage
      }]);
      
      speakText(errorMessage);
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
    <div className="fixed top-1/3 mt-3 transform -translate-y-1/2 w-[500px] bg-white shadow-lg border rounded-lg z-50">
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
            {msg.role === "assistant" && (
              <div className="flex justify-end mt-1">
                <button 
                  onClick={() => isSpeaking ? stopSpeaking() : speakText(msg.content.replace(/[#*_]/g, ''))}
                  className="text-xs p-1 rounded hover:bg-gray-400"
                  title={isSpeaking ? "Stop speaking" : "Read aloud"}
                >
                  {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              </div>
            )}
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

      <div className="p-2 flex items-center">
        <button
          onClick={toggleListening}
          className={`p-2 rounded-lg mr-2 ${
            isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
          title={isListening ? "Stop listening" : "Start voice input"}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <input
          type="text"
          className="flex-1 p-2 border rounded-lg"
          placeholder="Ask me about strategy, KPIs, market insights..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
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