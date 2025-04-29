import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
const Signin = () => {
  const navigate = useNavigate();
  // State for theme and language
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('english');
  const [showMenu, setShowMenu] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  // State for translated content
  const [translations, setTranslations] = useState({
    title: 'Keep your online business organized',
    subtitle: 'Sign up to start your 30 days free trial',
    googleSignIn: 'Sign in with Google',
    or: 'or',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    loginAccount: 'Login to your account',
    donotHaveAccount: 'Do not have an account?',
    signupHere: 'Signup Here',
    forgotPassword: 'Forgot Password?',
    oneClick: 'One click to go',
    allDigital: 'all accessing.'
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedLanguage = localStorage.getItem('language') || 'english';
    
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    
    // If saved language is not English, translate content
    if (savedLanguage !== 'english') {
      translateContent(savedLanguage);
    }
  }, []);

  // Function to translate content using Google Translate API
  const translateContent = async (targetLanguage) => {
    try {
      const apiKey = import.meta.env.VITE_API_GOOGLE;
      console.log(apiKey);
      console.log("All env variables:", import.meta.env);
      if (!apiKey) {
        console.error('Google Translate API key not found');
        return;
      }
      
      // Define source text in English
      const sourceTexts = Object.values(translations);
      
      // Map language codes
      const languageMap = {
        english: 'en',
        hindi: 'hi',
        kannada: 'kn'
      };
      
      const targetLang = languageMap[targetLanguage];
      
      // Use Google Translate API
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
    } catch (error) {
      console.error('Translation error:', error);
      // Fallback to English if translation fails
      alert(`Translation failed. Defaulting to English. Error: ${error.message}`);
    }
  };

  // Toggle theme and save to localStorage
  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    setShowMenu(false);
  };

  // Change language and save to localStorage
  const changeLanguage = async (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    if (newLanguage !== 'english') {
      await translateContent(newLanguage);
    } else {
      // Reset to default English translations
      setTranslations({
        title: 'Keep your online business organized',
        subtitle: 'Sign up to start your 30 days free trial',
        googleSignIn: 'Sign in with Google',
        or: 'or',
        name: 'Name',
        email: 'Email',
        password: 'Password',
        loginAccount: 'Login to your account',
        donotHaveAccount: 'Do not have an account?',
        signupHere: 'Signup Here',
        forgotPassword: 'Forgot Password?',
        oneClick: 'One click to go',
        allDigital: 'all accessing.'
    });
    
    }
    
    setShowMenu(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  const handleGoogleSignIn = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/google-url');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Google OAuth
      }
    } catch (err) {
      console.error("Google Sign-in Error:", err);
      alert("Google Sign-in failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const { email, password } = formData;
  
    // Basic validation
    if (!email || !password) {
      toast.error("Please fill in all required fields", {
        duration: 3000,
      });
      return;
    }
  
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // 🔥 Important: send cookies
        body: JSON.stringify({ email, password })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong!");
      }
  
      toast.success("Login successful!", { duration: 3000 });
  
      // No need to store token manually since it's in a cookie
  
      setFormData({ name: "", email: "", password: "" });
      navigate("/main");
  
    } catch (error) {
      console.error("Error:", error.message);
      toast.error(error.message || "Login failed", { duration: 3000 });
    }
  };
  return (
    <div className={`flex min-h-screen w-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Main container */}
      <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto shadow-lg rounded-lg overflow-hidden">
        {/* Left side - Blue section with illustration */}
        <div className={`w-full md:w-1/2 ${theme === 'dark' ? 'bg-blue-800' : 'bg-blue-600'} p-8 md:p-12 text-white relative`}>
          {/* Logo */}
          <div className="mb-8">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl font-bold mb-4">
            {translations.oneClick}<br />
            {translations.allDigital}
          </h1>
          
          {/* Illustration */}
          <div className="mt-8 flex justify-center">
            <div className="relative">
              {/* Hexagon background pattern */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute w-20 h-20 bg-blue-400 rounded-xl"
                    style={{
                      transform: `rotate(45deg) translate(${Math.random() * 200}px, ${Math.random() * 100}px)`,
                      opacity: 0.6
                    }}
                  />
                ))}
              </div>
              
              {/* Tablet/Dashboard illustration */}
              <div className="relative z-10 flex items-center">
                {/* Person */}
                <div className="absolute left-2 bottom-2 z-20">
                  <div className="w-4 h-20 bg-red-400 rounded-full"></div>
                  <div className="w-8 h-8 bg-blue-900 rounded-full -mt-6 -ml-2"></div>
                </div>
                
                {/* Tablet */}
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-4 rounded-xl shadow-lg transform rotate-12 w-64 h-48`}>
                  <div className="flex space-x-1 mb-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <div className={`h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4 mb-2`}></div>
                  <div className="flex space-x-2">
                    <div className="w-1/2">
                      <div className={`h-20 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg overflow-hidden`}>
                        <div className="h-8 bg-red-400 w-1/2"></div>
                      </div>
                    </div>
                    <div className="w-1/2">
                      <div className={`h-8 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg mb-2`}></div>
                      <div className={`h-10 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg overflow-hidden`}>
                        <div className="h-full w-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-50"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Plant */}
                <div className="absolute left-0 bottom-0">
                  <div className="w-4 h-4 bg-blue-300 rounded-full"></div>
                  <div className="w-1 h-6 bg-blue-400 mx-auto -mt-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right side */}
        <div className={`w-full md:w-1/2 p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} flex flex-col justify-start`}>
          {/* Header with logo and theme toggle */}
          <div className="mb-8 flex justify-between items-center">
            <div className="flex items-center">
            </div>
            
            {/* Nav icon moved to right with dropdown menu */}
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
                  <div className={`px-4 py-2 text-sm font-medium border-b ${theme === 'dark' ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-blue-600 font-semibold'}`}>Theme</div>
                  <button
                    onClick={() => toggleTheme('light')}
                    className={`w-full text-left block px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-blue-700 hover:bg-blue-50'}`}
                  >
                    Light Mode
                  </button>
                  <button
                    onClick={() => toggleTheme('dark')}
                    className={`w-full text-left block px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-blue-700 hover:bg-blue-50'}`}
                  >
                    Dark Mode
                  </button>
                  
                  <div className={`px-4 py-2 text-sm font-medium border-b border-t ${theme === 'dark' ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-blue-700 font-semibold'} mt-2`}>Language</div>
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
          
          {/* Headline */}
          <h1 className="text-4xl font-bold mb-2">{translations.title}</h1>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-8`}>{translations.subtitle}</p>
          
          <button
  onClick={handleGoogleSignIn}
  className={`flex items-center justify-center w-full border ${
    theme === 'dark'
      ? 'border-gray-600 text-gray-200 bg-gray-700'
      : 'border-blue-200 text-blue-700 bg-blue-50'
  } rounded-md py-2 px-4 mb-4 hover:opacity-90 transition-opacity`}
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24">
    <path
      d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
      fill="#4285F4"
    />
  </svg>
  {translations.googleSignIn}
</button>
          
          <div className="flex items-center justify-center my-4">
            <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} flex-grow`}></div>
            <span className={`px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{translations.or}</span>
            <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} flex-grow`}></div>
          </div>
          
          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                {translations.name}<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                className={`w-full p-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-md`}
                placeholder="Enter name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                {translations.email}<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                className={`w-full p-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-md`}
                placeholder="Enter your mail"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                {translations.password}<span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                className={`w-full p-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-md`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            
            <button 
              type="submit" 
              className={`w-full ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 rounded-md font-medium transition-colors`}
            >
              {translations.loginAccount}
            </button>
          </form>

          <div className="mt-2 text-center">
  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        navigate('/forgot-password');
      }}
      className="text-blue-600 font-medium"
    >
      {translations.forgotPassword}
    </a>
  </p>
</div>
          
          <div className="mt-4 text-center">
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              {translations.donotHaveAccount}{' '}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault(); // Prevent default anchor behavior
                  navigate('/signup'); // Navigate to /signup
                }}
                className="text-blue-600 font-medium"
              >
                {translations.signupHere}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;