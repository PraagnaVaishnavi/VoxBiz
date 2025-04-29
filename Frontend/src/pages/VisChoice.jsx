import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { PreviewOption } from '../components/ui/link-preview';
import { useLocation , useNavigate } from 'react-router-dom';

function VisualizationChoicePage() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();
  const [translations, setTranslations] = useState({
    pageTitle: 'Choose Visualization Type',
    tableCard: 'Table View',
    graphCard: 'Graph View',
    tableDescription: 'Structured rows and columns for detailed data analysis',
    graphDescription: 'Visual representation of data relationships and trends with comparative inights',
    chooseButton: 'Select',
    tablePreview: 'Table Preview',
    graphPreview: 'Graph Preview'
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const { queryResponse } = location.state || {};
    console.log("Query Response:", queryResponse);
    if (queryResponse) {
      setData(queryResponse);
    }
  }, [location.state]);
  



  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (event) => {
      const newTheme = event.detail.theme;
      setDarkMode(newTheme === 'dark');
    };
    
    window.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (event) => {
      if (event.detail && event.detail.translations) {
        console.log("Language change detected:", event.detail);
        setTranslations(current => ({...current, ...event.detail.translations}));
      }
    };
    
    window.addEventListener('languageChange', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);
  
  // Register this page's translation keys
  useEffect(() => {
    // Register this page's translation keys
    window.currentPageTranslationKeys = [
      'pageTitle', 'tableCard', 'graphCard', 'tableDescription', 'graphDescription',
      'chooseButton', 'tablePreview', 'graphPreview'
    ];
    
    // Set default English texts
    window.currentPageDefaultTexts = {
      pageTitle: 'Choose Visualization Type',
      tableCard: 'Table View',
      graphCard: 'Graph View',
      tableDescription: 'Structured rows and columns for detailed data analysis',
      graphDescription: 'Visual representation of data relationships and trends',
      chooseButton: 'Select',
      tablePreview: 'Table Preview',
      graphPreview: 'Graph Preview'
    };
    
    // If there's a stored language, trigger a translation
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage && storedLanguage !== 'english') {
      // Inform navbar that we need translations by triggering a custom event
      window.dispatchEvent(new CustomEvent('pageLoaded', { 
        detail: { needsTranslation: true, language: storedLanguage } 
      }));
    }
    
    // Clean up when component unmounts
    return () => {
      delete window.currentPageTranslationKeys;
      delete window.currentPageDefaultTexts;
    };
  }, []);

  // Navigate to table view with data
  const navigateToTableView = () => {
    navigate("/table", { state: { visualizationData: data } });
  };

  // Navigate to graph view with data
  const navigateToGraphView = () => {
    navigate("/selectgraph", { state: { visualizationData: data } });
  };

  return (
    <div className={`min-h-screen w-screen flex flex-col ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}
         style={{
           backgroundImage: `url('/choice-bg.png')`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}>
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-12 backdrop-blur-sm py-2 rounded">
          {translations.pageTitle}
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 max-w-4xl mx-auto">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Table Visualization Card */}
          {/* Table Visualization Card */}
          <div className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-6 flex flex-col hover:shadow-xl transition-all">
  <h2 className="text-2xl font-bold mb-3">{translations.tableCard}</h2>
  <p className="text-gray-700 dark:text-gray-300 mb-6">{translations.tableDescription}</p>
  
  <div className="flex-grow flex items-center justify-center mb-6">
    <PreviewOption title={translations.tablePreview} imageSrc="/table-preview.png" />
  </div>
  
  <button 
    className={`w-full py-2 px-4 rounded-lg transition-colors ${
      loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
    }`}
    onClick={navigateToTableView}
    disabled={loading}
  >
    {loading ? 'Loading...' : translations.chooseButton}
  </button>
</div>

{/* Graph Visualization Card */}
<div className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-6 flex flex-col hover:shadow-xl transition-all">
  <h2 className="text-2xl font-bold mb-3">{translations.graphCard}</h2>
  <p className="text-gray-700 dark:text-gray-300 mb-6">{translations.graphDescription}</p>
  
  <div className="flex-grow flex items-center justify-center mb-6">
    <PreviewOption title={translations.graphPreview} imageSrc="/graph-preview.png" />
  </div>
  
  <button 
    className={`w-full py-2 px-4 rounded-lg transition-colors ${
      loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
    }`}
    onClick={navigateToGraphView}
    disabled={loading}
  >
    {loading ? 'Loading...' : translations.chooseButton}
  </button>
</div>
        </div>
      </main>
      
      <footer className="mt-auto py-4 text-center backdrop-blur-sm bg-white/30 dark:bg-black/30">
        <p className="text-sm">© 2025 Data Visualization Platform</p>
      </footer>
    </div>
  );
};

export default VisualizationChoicePage;
