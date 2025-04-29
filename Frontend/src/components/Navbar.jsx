import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBox from "./Chat";
import { MessageSquare } from 'lucide-react';
const Navbar = () => {
    const navigate = useNavigate();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [theme, setTheme] = useState('light');
    const menuRef = useRef(null);
    const [translations, setTranslations] = useState({
      theme: "Theme",
      lightMode: "Light Mode",
      darkMode: "Dark Mode",
      language: "Language",
      logout: "Logout"
    });
    
    // Load theme from localStorage on component mount
    useEffect(() => {
      const storedTheme = localStorage.getItem('mode');
      if (storedTheme) {
        setTheme(storedTheme);
        // Apply theme to document body
        document.body.classList.toggle('dark-mode', storedTheme === 'dark');
      }
      
      // Load language and translate if needed
      const storedLanguage = localStorage.getItem('language');
      if (storedLanguage && storedLanguage !== 'english') {
        translateContent(storedLanguage);
      }
      
      // Add click event listener to close menu when clicking outside
      document.addEventListener('mousedown', handleClickOutside);
      
      // Listen for page loaded events to handle translation requests
      const handlePageLoaded = (event) => {
        if (event.detail && event.detail.needsTranslation) {
          translateContent(event.detail.language || localStorage.getItem('language'));
        }
      };
      
      window.addEventListener('pageLoaded', handlePageLoaded);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('pageLoaded', handlePageLoaded);
      };
    }, []);
    
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    const handleCloseChat = () => {
      setIsChatOpen(false);
    };
    const toggleTheme = (newTheme) => {
      setTheme(newTheme);
      localStorage.setItem('mode', newTheme); // Save to localStorage
      document.body.classList.toggle('dark-mode', newTheme === 'dark');
      
      // Dispatch a custom event for other components to detect
      window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
      
      setShowMenu(false);
    };
    
    const translateContent = async (targetLanguage) => {
      try {
        const apiKey = import.meta.env.VITE_API_GOOGLE;
        if (!apiKey) {
          console.error('Google Translate API key not found');
          return;
        }
        
        // Get current page translations from current page component
        const currentPageTranslationKeys = window.currentPageTranslationKeys || [];
        
        // Common navbar translations that are always needed
        const navbarKeys = ["theme", "lightMode", "darkMode", "language", "logout"];
        
        // Combine all keys that need translation for this request
        const allKeys = [...navbarKeys, ...currentPageTranslationKeys];
        
        // Get the corresponding English texts
        const sourceTexts = allKeys.map(key => {
          // Check if the key is from navbar
          if (navbarKeys.includes(key)) {
            const navbarDefaultTexts = {
              theme: "Theme",
              lightMode: "Light Mode",
              darkMode: "Dark Mode",
              language: "Language",
              logout: "Logout"
            };
            return navbarDefaultTexts[key];
          } 
          // Otherwise, get the text from the current page's default texts
          else if (window.currentPageDefaultTexts && window.currentPageDefaultTexts[key]) {
            return window.currentPageDefaultTexts[key];
          }
          return key; // Fallback to using the key itself
        });
        
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
          
          // Create new translations object with translated text for navbar
          const navbarTranslations = {};
          
          navbarKeys.forEach((key, index) => {
            navbarTranslations[key] = translatedTexts[index];
          });
          
          // Update navbar translations
          setTranslations(navbarTranslations);
          
          // Create page-specific translations
          if (currentPageTranslationKeys.length > 0) {
            const pageTranslations = {};
            
            currentPageTranslationKeys.forEach((key, index) => {
              const translationIndex = navbarKeys.length + index;
              if (translationIndex < translatedTexts.length) {
                pageTranslations[key] = translatedTexts[translationIndex];
              }
            });
    
            
            // Dispatch a custom event for language change with page translations
            console.log("Dispatching page translations:", pageTranslations);
            window.dispatchEvent(new CustomEvent('languageChange', {
              detail: { 
                language: targetLanguage,
                translations: pageTranslations
              }
            }));
          }
        }
      } catch (error) {
        console.error('Translation error:', error);
        // Fallback to English if translation fails
        alert(`Translation failed. Defaulting to English. Error: ${error.message}`);
      }
    };
    
    const changeLanguage = (language) => {
      localStorage.setItem('language', language); // Save to localStorage
      
      if (language !== 'english') {
        translateContent(language);
      } else {
        // Reset to English
        setTranslations({
          theme: "Theme",
          lightMode: "Light Mode",
          darkMode: "Dark Mode",
          language: "Language",
          logout: "Logout"
        });
        
        // Reset page translations and maintain backward compatibility
        if (window.currentPageDefaultTexts) {
          const defaultTranslations = { ...window.currentPageDefaultTexts };
          
          // Dispatch event with default translations
          console.log("Dispatching default English translations");
          window.dispatchEvent(new CustomEvent('languageChange', {
            detail: { 
              language: 'english',
              translations: defaultTranslations
            }
          }));
        }
      }
      
      setShowMenu(false);
    };

    return (
        <nav className={`flex w-full items-center justify-between border-t border-b ${theme === 'dark' ? 'border-neutral-800 text-white' : 'border-neutral-200 text-gray-900'} bg-transparent p-2`}>
           <div className="flex items-center gap-4">
           <button
        type="button" // Explicitly set button type
        onClick={() => setIsChatOpen(true)}
        className="inline-flex items-center gap-2 text-gray-300 bg-violet-500 border-0 py-2 px-5 focus:outline-none hover:bg-green-800 hover:text-white rounded text-base"
      >
        AI Chatbot <MessageSquare size={24} />
      </button>
      
      {isChatOpen && (
        <ChatBox
          onClose={handleCloseChat}
          theme={theme === 'dark' ? 'dark' : 'light'}
        />
      )}
             <div className="flex items-center gap-2">
             <img 
  src="/Navlogo.png" 
  alt="Logo" 
  className="size-8 rounded-full object-cover transition-transform duration-300 hover:scale-125" 
/>
<h1 className="text-2xl font-bold flex items-center whitespace-nowrap" style={{ fontSize: '1.7rem', lineHeight: '1.5rem' }}>
  Vox<span className="bg-gradient-to-br from-violet-500 to-pink-500 text-transparent bg-clip-text">Biz</span>
</h1>
             </div>
           </div>
           
           <div className="relative" ref={menuRef}>
             <button 
               onClick={() => setShowMenu(!showMenu)}
               className={`${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} p-2 rounded-lg transition-colors`}
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke={theme === 'dark' ? 'white' : '#2563EB'}>
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
               </svg>
             </button>
             
             {showMenu && (
               <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} ring-1 ring-black ring-opacity-5 z-50`}>
                 {/* Theme section header */}
                 <div className={`px-4 py-2 text-xs font-medium border-b ${theme === 'dark' ? 'border-gray-700 text-gray-200' : 'border-gray-200 text-blue-600'}`}>
                   {translations.theme}
                 </div>
                 
                 {/* Light mode button */}
                 <button
                   onClick={() => toggleTheme('light')}
                   className={`w-full text-left block px-4 py-2 text-xs ${theme === 'dark' 
                     ? 'text-gray-300 hover:bg-gray-700' 
                     : 'text-blue-700 hover:bg-gray-100'
                   }`}
                 >
                   {translations.lightMode}
                 </button>
                 
                 {/* Dark mode button */}
                 <button
                   onClick={() => toggleTheme('dark')}
                   className={`w-full text-left block px-4 py-2 text-xs ${theme === 'dark' 
                     ? 'text-gray-300 hover:bg-gray-700' 
                     : 'text-blue-700 hover:bg-gray-100'
                   }`}
                 >
                   {translations.darkMode}
                 </button>
                 
                 {/* Language section header */}
                 <div className={`px-4 py-2 text-xs font-medium border-b border-t ${theme === 'dark' 
                   ? 'border-gray-700 text-gray-200' 
                   : 'border-gray-200 text-blue-600'
                 } mt-2`}>
                   {translations.language}
                 </div>
                 
                 {/* English language button */}
                 <button
                   onClick={() => changeLanguage('english')}
                   className={`w-full text-left block px-4 py-2 text-xs ${theme === 'dark' 
                     ? 'text-gray-300 hover:bg-gray-700' 
                     : 'text-blue-700 hover:bg-gray-100'
                   }`}
                 >
                   English
                 </button>
                 
                 {/* Hindi language button */}
                 <button
                   onClick={() => changeLanguage('hindi')}
                   className={`w-full text-left block px-4 py-2 text-xs ${theme === 'dark' 
                     ? 'text-gray-300 hover:bg-gray-700' 
                     : 'text-blue-700 hover:bg-gray-100'
                   }`}
                 >
                   Hindi
                 </button>
                 
                 {/* Kannada language button */}
                 <button
                   onClick={() => changeLanguage('kannada')}
                   className={`w-full text-left block px-4 py-2 text-xs ${theme === 'dark' 
                     ? 'text-gray-300 hover:bg-gray-700' 
                     : 'text-blue-700 hover:bg-gray-100'
                   }`}
                 >
                   Kannada
                 </button>
                 
                 {/* Logout divider */}
                 <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} mt-2`}></div>
                 
                 {/* Logout button */}
                 <button
                   onClick={() => {/* Logout logic would go here */}}
                   className={`w-full text-left block px-4 text-xs ${theme === 'dark' 
                     ? 'text-red-400 hover:bg-gray-700' 
                     : 'text-red-600 hover:bg-gray-100'
                   }`}
                 >
                   {translations.logout}
                 </button>
               </div>
             )}
           </div>
         </nav>
       );
};

export default Navbar;
