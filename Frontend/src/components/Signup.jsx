"use client";
import React, { useState, useEffect, useRef } from 'react';
import { TypewriterEffectSmooth } from './ui/TypeWriterEffect';
import { Link, useNavigate } from "react-router-dom";



const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: ''
  });
  const navigateTo = useNavigate();
  
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('english');
  const [showMenu, setShowMenu] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);

  
  // Default translations in English
  const [translations, setTranslations] = useState({
    signUp: "Sign up",
    fullName: "Full Name",
    email: "Email Address",
    mobile: "Mobile No",
    agreement: "You are agreeing to the",
    termsOfService: "Terms of Services",
    and: "and",
    privacyPolicy: "Privacy Policy",
    getStarted: "Get Started",
    alreadyMember: "Already a member?",
    signIn: "Sign in",
    theme: "Theme",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    language: "Language",
    welcomeMessage: "Welcome to your account creation! I'm here to help you through the process."
  });
  
  // Helper texts for assistant messages
  const [helperTexts, setHelperTexts] = useState({
    welcome: "Welcome to your account creation! I'm here to help you through the process.",
    fullName: "Please enter your full name as it appears on official documents.",
    email: "Great! Now enter a valid email address. We'll send a verification link to this address.",
    password: "Securely enter your password and remember it because we will not know what you typed.",
    mobile: "Excellent progress! Please enter your mobile number with country code for verification.",
    complete: "You're doing great! Just click 'Get Started' when you're ready to create your account."
  });
  
  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Load theme and language from localStorage on component mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    const storedLanguage = localStorage.getItem('language') || 'english';
    
    setTheme(storedTheme);
    setLanguage(storedLanguage);
    
    // Apply theme to the document
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Load translations for the stored language if not English
    if (storedLanguage !== 'english') {
      translateContent(storedLanguage);
    } else {
      // Add initial welcome message
      setMessages([
        { text: helperTexts.welcome, type: 'assistant' }
      ]);
    }
  }, []);
  
  const translateContent = async (targetLanguage) => {
    try {
      const apiKey = import.meta.env.VITE_API_GOOGLE;
      if (!apiKey) {
        console.error('Google Translate API key not found');
        return;
      }
      
      // Define source text in English
      const sourceTexts = Object.values(translations);
      const helperSourceTexts = Object.values(helperTexts);
      
      // Map language codes
      const languageMap = {
        english: 'en',
        hindi: 'hi',
        kannada: 'kn'
      };
      
      const targetLang = languageMap[targetLanguage];
      
      // Use Google Translate API for main translations
      const url = 'https://translation.googleapis.com/language/translate/v2';
      const response = await fetch(`${url}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: sourceTexts,
          source: 'en',
          target: targetLang,
          format: 'text'
        })
      });
      
      const data = await response.json();
      
      // Use Google Translate API for helper texts
      const helperResponse = await fetch(`${url}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: helperSourceTexts,
          source: 'en',
          target: targetLang,
          format: 'text'
        })
      });
      
      const helperData = await helperResponse.json();
      
      if (data.data && data.data.translations) {
        const translatedTexts = data.data.translations.map(t => t.translatedText);
        
        // Create new translations object with translated text
        const keys = Object.keys(translations);
        const newTranslations = {};
        
        keys.forEach((key, index) => {
          newTranslations[key] = translatedTexts[index];
        });
        
        // Update translations state
        setTranslations(newTranslations);
      }
      
      if (helperData.data && helperData.data.translations) {
        const translatedHelperTexts = helperData.data.translations.map(t => t.translatedText);
        
        // Create new helper texts object with translated text
        const helperKeys = Object.keys(helperTexts);
        const newHelperTexts = {};
        
        helperKeys.forEach((key, index) => {
          newHelperTexts[key] = translatedHelperTexts[index];
        });
        
        // Update helper texts state
        setHelperTexts(newHelperTexts);
        
        // Add translated welcome message to chat
        setMessages([
          { text: newHelperTexts.welcome, type: 'assistant' }
        ]);
      }
    } catch (error) {
      console.error('Translation error:', error);
      alert(`Translation failed. Defaulting to English. Error: ${error.message}`);
    }
  };
  
  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    setShowMenu(false);
  };
  
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    if (newLanguage !== 'english') {
      translateContent(newLanguage);
    } else {
      // Reset to default English translations
      setTranslations({
        signUp: "Sign up",
        fullName: "Full Name",
        email: "Email Address",
        mobile: "Mobile No",
        agreement: "You are agreeing to the",
        termsOfService: "Terms of Services",
        and: "and",
        privacyPolicy: "Privacy Policy",
        getStarted: "Get Started",
        alreadyMember: "Already a member?",
        signIn: "Sign in",
        theme: "Theme",
        lightMode: "Light Mode",
        darkMode: "Dark Mode",
        language: "Language",
        welcomeMessage: "Welcome to your account creation! I'm here to help you through the process."
      });
      
      setHelperTexts({
        welcome: "Welcome to your account creation! I'm here to help you through the process.",
        fullName: "Please enter your full name as it appears on official documents.",
        email: "Great! Now enter a valid email address. We'll send a verification link to this address.",
        password: "Securely enter your password and remember it because we will not know what you typed.",
        mobile: "Excellent progress! Please enter your mobile number with country code for verification.",
        complete: "You're doing great! Just click 'Get Started' when you're ready to create your account."
      });
      
      setMessages([
        { text: "Welcome to your account creation! I'm here to help you through the process.", type: 'assistant' }
      ]);
    }
    
    setShowMenu(false);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', { // Replace with your backend API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials:'include',
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Registration successful:', data);
        setMessages(prev => [...prev, { 
          text: "Your account has been created successfully!", 
          type: 'assistant' 
        }]);
        navigateTo('/main'); // Redirect to main page after successful registration
      } else {
        console.error('Registration failed:', response.statusText);
        setMessages(prev => [...prev, { 
          text: "There was an issue creating your account. Please try again.", 
          type: 'assistant' 
        }]);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setMessages(prev => [...prev, { 
        text: "An error occurred while creating your account. Please try again later.", 
        type: 'assistant' 
      }]);
    }
  };
  
  const handleFieldFocus = (field) => {
    setFocusedField(field);
    // Add field-specific message to chat
    setMessages(prev => [...prev, { 
      text: helperTexts[field], 
      type: 'assistant' 
    }]);
  };
  
  const getTypewriterWords = (text) => {
    return [{ text, className: "text-blue-500" }];
  };
  
  return (
    <div className={`w-screen min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-blue-50'} flex flex-col md:flex-row`}>
      {/* Left side - Sign up form */}
      <div className={`w-full md:w-1/2 p-8 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-8">
            <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{translations.signUp}</h2>
            
            {/* Theme and Language menu */}
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className={`${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-100 hover:bg-blue-200'} p-2 rounded-lg transition-colors`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke={theme === 'dark' ? 'currentColor' : '#2563EB'}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
              
              {showMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-50`}>
                  <div className={`px-4 py-2 text-sm font-medium border-b ${theme === 'dark' ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-blue-600 font-semibold'}`}>{translations.theme}</div>
                  <button
                    onClick={() => toggleTheme('light')}
                    className={`w-full text-left block px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-blue-700 hover:bg-blue-50'}`}
                  >
                    {translations.lightMode}
                  </button>
                  <button
                    onClick={() => toggleTheme('dark')}
                    className={`w-full text-left block px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-blue-700 hover:bg-blue-50'}`}
                  >
                    {translations.darkMode}
                  </button>
                  
                  <div className={`px-4 py-2 text-sm font-medium border-b border-t ${theme === 'dark' ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-blue-700 font-semibold'} mt-2`}>{translations.language}</div>
                  <button
                    onClick={() => changeLanguage('english')}
                    className={`w-full text-left block px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-blue-700 hover:bg-blue-50'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage('hindi')}
                    className={`w-full text-left block px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-blue-700 hover:bg-blue-50'}`}
                  >
                    Hindi
                  </button>
                  <button
                    onClick={() => changeLanguage('kannada')}
                    className={`w-full text-left block px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-blue-700 hover:bg-blue-50'}`}
                  >
                    Kannada
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                name="fullName"
                placeholder={translations.fullName}
                className={`w-full px-4 py-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-blue-500'} border focus:ring-2 focus:ring-blue-500 focus:outline-none transition`}
                value={formData.fullName}
                onChange={handleChange}
                onFocus={() => handleFieldFocus('fullName')}
                required
              />
            </div>
            
            <div>
              <input
                type="email"
                name="email"
                placeholder={translations.email}
                className={`w-full px-4 py-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-blue-500'} border focus:ring-2 focus:ring-blue-500 focus:outline-none transition`}
                value={formData.email}
                onChange={handleChange}
                onFocus={() => handleFieldFocus('email')}
                required
              />
            </div>
            
            <div>
              <input
                type="tel"
                name="mobile"
                placeholder={translations.mobile}
                className={`w-full px-4 py-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-blue-500'} border focus:ring-2 focus:ring-blue-500 focus:outline-none transition`}
                value={formData.mobile}
                onChange={handleChange}
                onFocus={() => handleFieldFocus('mobile')}
                required
              />
            </div>

            <div className="relative">
  <input
    type={showPassword ? 'text' : 'password'}
    name="password"
    placeholder={translations.password}
    className={`w-full px-4 py-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-blue-500'} border focus:ring-2 focus:ring-blue-500 focus:outline-none transition`}
    value={formData.password}
    onChange={handleChange}
    onFocus={() => handleFieldFocus('password')}
    required
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute inset-y-0 right-2 flex items-center p-1 text-gray-300 hover:text-gray-700 focus:outline-none bg-transparent border-none"
    style={{ background: 'none', boxShadow: 'none' }}
    tabIndex={-1}
  >
    {showPassword ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8a3 3 0 100 6 3 3 0 000-6z" />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.94 17.94A10.12 10.12 0 0112 20c-5 0-9.27-4.11-10-7 0-.61.13-1.22.36-1.79M3 3l18 18" />
        <path d="M9.88 9.88A3 3 0 0114.12 14.12M16.24 16.24A6 6 0 016.34 6.34" />
      </svg>
    )}
  </button>
</div>



            
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {translations.agreement} <a href="/terms" className="text-blue-600 hover:underline">{translations.termsOfService}</a> {translations.and} <a href="/privacy" className="text-blue-600 hover:underline">{translations.privacyPolicy}</a>.
            </div>
            
            <button 
              type="submit"
              className={`w-full ${theme === 'dark' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 rounded-lg font-medium transition`}
              onFocus={() => handleFieldFocus('complete')}
            >
              {translations.getStarted}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              {translations.alreadyMember} <a href="/login" className="text-blue-600 hover:underline">{translations.signIn}</a>
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side - AI Assistant */}
      <div className={`w-full md:w-1/2 flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-blue-100'}`}>
        <div className={`px-6 py-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-600'} text-white`}>
          <h3 className="text-xl font-semibold">Account Setup Assistant</h3>
        </div>
        
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
  {messages.map((message, index) => (
    <div key={index} className={`max-w-md md:max-w-2xl ${message.type === 'assistant' ? 'ml-0' : 'ml-auto'}`}>
      <div 
        className={`p-3 rounded-lg min-h-[50px] ${message.type === 'assistant' 
          ? (theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900') 
          : 'bg-blue-600 text-white'}`}
      >
        {index === messages.length - 1 ? (
          <TypewriterEffectSmooth
            words={getTypewriterWords(message.text)}
            className="text-sm"
          />
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        )}
      </div>
    </div>
  ))}
  <div ref={messagesEndRef} />
</div>
        
        {/* Assistant status */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${focusedField ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></div>
            <p className="text-sm">
              {focusedField ? 'Assistant is helping you...' : 'Assistant is standing by...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;   