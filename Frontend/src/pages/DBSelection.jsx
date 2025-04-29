import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CreateDatabaseModal from "../components/CreateDatabaseModal";
import ConnectDatabaseModal from "../components/ConnectDatabaseModal";
import { useNavigate } from 'react-router-dom';
import VoiceSearchModal from '../components/VoiceSearchModal';
import Loader from '../components/ui/Loader';
import DbPreviewOption from '../components/ui/Db-preview';

const DatabaseDashboard = () => {
 
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [databases, setDatabases] = useState([]);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showVoiceModal1, setShowVoiceModal1] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingVoice, setProcessingVoice] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [translations, setTranslations] = useState({
    title: 'Your Databases',
    createButton: 'Create Tables',
    connectButton: 'Connect Database',
    noData: 'No databases found',
    dbName: 'Database Name',
    dbType: 'Type',
    accessLevel: 'Access Level',
    lastAccessed: 'Last Accessed',
    readOnly: 'Read Only',
    readWrite: 'Read & Write'
  });

  const fetchDatabases = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3000/api/database/list', {
        method: 'GET',
        credentials: 'include', // ✅ this is critical for cookies to be sent
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch databases: ${response.statusText}`);
      }
      
      const data = await response.json();
if (!Array.isArray(data)) {
  throw new Error('Unexpected response format');
}
setDatabases(data);
    } catch (err) {
      console.error('Error fetching databases:', err);
      setError('Failed to load databases. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch of databases on component mount
  useEffect(() => {
    fetchDatabases();
  }, []);

  // Initialize from localStorage on component mount
  useEffect(() => {
    // Check for theme
    const storedMode = localStorage.getItem('mode');
    if (storedMode) {
      setDarkMode(storedMode === 'dark');
    }
    
    // Check for translations
    const storedTranslations = localStorage.getItem('dashboardTranslations');
    if (storedTranslations) {
      try {
        const parsedTranslations = JSON.parse(storedTranslations);
        setTranslations(current => ({...current, ...parsedTranslations}));
      } catch (error) {
        console.error('Error parsing stored translations:', error);
      }
    }
  }, []);

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
      'title', 'createButton', 'connectButton', 'noData', 'dbName',
      'dbType', 'accessLevel', 'lastAccessed', 'readOnly', 'readWrite', 'actions', 'queryDatabase', 'voiceSearch'
    ];
    
    // Set default English texts
    window.currentPageDefaultTexts = {
      title: 'Your Databases',
      createButton: 'Create Database',
      connectButton: 'Connect Database',
      noData: 'No databases found',
      dbName: 'Database Name',
      dbType: 'Type',
      accessLevel: 'Access Level',
      lastAccessed: 'Last Accessed',
      readOnly: 'Read Only',
      readWrite: 'Read & Write',
      voiceSearch: "Search by voice",
      actions: "Actions",
      queryDatabase: "Query database",
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
  
  const handleCreateDatabase = () => {
    setShowCreateModal(true);
  };

  const handleConnectDatabase = () => {
    setShowConnectModal(true);
  };
  
  
  const handleVoiceSearch = () => {
    // Make sure we have databases loaded before opening the modal
    if (databases.length === 0 && !isLoading) {
      fetchDatabases().then(() => {
        setShowVoiceModal1(true);
      });
    } else {
      setShowVoiceModal1(true);
    }
  };
  const handleCloseVoiceModal = () => {
    setShowVoiceModal1(false);
  };
  // Add database refresh on modal close to update list when new database is added or connected
  const handleModalClose = () => {
    fetchDatabases();
  };
  const handleDatabaseFound = async (dbId) => {
    console.log('Database found:', dbId);
    navigateToDatabase(dbId);
  };


  const handleDbVoiceQuery = (dbId, query) => {
    setProcessingVoice(true);
  
    if (!dbId) {
      setProcessingVoice(false);
      setErrorMessage('Database ID not found. Please try again.');
      return;
    }
    // Check if query is empty
    if (!query) {
      console.error("Query is empty");
      setProcessingVoice(false);
      setErrorMessage('Query cannot be empty. Please try again.');
      return;
    }
    // Make an API call to the backend database service
    fetch(`http://localhost:3000/api/query/process/${dbId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({ transcript: query }) 
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Database query failed');
        }
        return response.json();
      })
      .then(response => {
        console.log("Database query successful:", response.data);
        setProcessingVoice(false);
        
        // Save the data to sessionStorage
        try {
          sessionStorage.setItem('visualizationData', JSON.stringify(response.data));
          console.log(sessionStorage.getItem('visualizationData'))
          console.log("Data saved to sessionStorage successfully");
        } catch (err) {
          console.error("Error saving to sessionStorage:", err);
          // If storage fails, continue with navigation anyway
        }
        
        // On success, navigate to the choice page
        navigate('/table', { state: { visualizationData: response.data } });
      })
      .catch(error => {
        console.error("Error processing database query:", error);
        setProcessingVoice(false);
        
        // Show failure message
        setErrorMessage('Database query failed. Please try again.');
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          setErrorMessage('');
        }, 5000);
      });
  };
  const navigateToDatabase = async (dbId) => {
    try {
      // Save dbId to localStorage
      localStorage.setItem('dbId', dbId);
      console.log('Selected DB ID:', dbId);
  
      // Fetch database info from the backend
      const response = await fetch(`http://localhost:3000/api/database/db-info/${dbId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch database information');
      }
  
      const dbInfo = await response.json();
      console.log('Database Info:', dbInfo);
  
      // Navigate to the database page with the database info
      navigate(`/database/${dbId}`, { state: { dbInfo } });
    } catch (error) {
      console.error('Error navigating to database:', error);
    }
  };
  const [activeDbId, setActiveDbId] = useState(null);
  const handleVoiceInput = (dbId) => {
    setActiveDbId(dbId);
    setShowVoiceModal(true);
  };
  
  // Voice Search Modal Component
  const VoiceSearchModal1 = ({ darkMode, onClose, onDatabaseFound, databases }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [message, setMessage] = useState('Click to start speaking');
    const [matchedDbs, setMatchedDbs] = useState([]);
    const recognitionRef = useRef(null);
    const latestTranscriptRef = useRef(''); // Store latest transcript for use in callbacks
    
    // Debug logging
    useEffect(() => {
      if (databases && databases.length > 0) {
        console.log('Available databases:', databases.map(db => db.name));
      }
    }, [databases]);
    
    useEffect(() => {
      // Check if browser supports SpeechRecognition
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setMessage('Voice recognition is not supported in your browser.');
        return;
      }
      
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        setMessage('Listening...');
        setMatchedDbs([]);
        latestTranscriptRef.current = ''; // Reset transcript reference
      };
      
      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript.trim();
        console.log('Transcript received:', transcriptText);
        
        // Update both state and ref
        setTranscript(transcriptText);
        latestTranscriptRef.current = transcriptText;
        
        // Find potential matches as user speaks
        if (databases && databases.length > 0) {
          const searchText = transcriptText.toLowerCase();
          const potentialMatches = databases.filter(db => 
            db.name.toLowerCase().includes(searchText) || 
            searchText.includes(db.name.toLowerCase())
          );
          
          console.log('Potential matches found:', potentialMatches.map(db => db.name));
          setMatchedDbs(potentialMatches);
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
        
        // Use the ref value instead of state to ensure we have latest transcript
        const currentTranscript = latestTranscriptRef.current;
        console.log("Recognition ended with transcript:", currentTranscript);
        console.log("Current databases available:", databases);
        
        if (currentTranscript && databases && databases.length > 0) {
          setMessage('Processing...');
          console.log('Processing final transcript:', currentTranscript);
          
          // Find exact or best match with more lenient matching
          const cleanTranscript = currentTranscript.toLowerCase().trim();
          console.log('Cleaned transcript:', cleanTranscript);
          
          // Try exact match first
          const exactMatch = databases.find(db => 
            db.name.toLowerCase() === cleanTranscript
          );
          console.log('Exact match result:', exactMatch);
          
          // Try searching for the database name in the transcript
          const includedMatch = exactMatch ? null : databases.find(db => 
            cleanTranscript.includes(db.name.toLowerCase())
          );
          console.log('Included match result:', includedMatch);
          
          // Try searching for transcript in the database name
          const reversedMatch = (!exactMatch && !includedMatch) ? databases.find(db => 
            db.name.toLowerCase().includes(cleanTranscript)
          ) : null;
          console.log('Reversed match result:', reversedMatch);
          
          const bestMatch = exactMatch || includedMatch || reversedMatch;
          console.log('Best match determined:', bestMatch);
          
          if (bestMatch) {
            console.log('Found matching database:', bestMatch.name, 'with ID:', bestMatch.id);
            setMessage(`Found database: ${bestMatch.name}`);
            
            // Short delay before closing modal and navigating
            const matchId = bestMatch.id; // Store ID locally to ensure it's available in timeout
            
            setTimeout(() => {
              console.log('Navigation timeout triggered for ID:', matchId);
              onClose();
              onDatabaseFound(matchId);
            }, 1000);
          } else {
            // Check for any potential matches from the latest state
            const currentMatches = databases.filter(db => 
              db.name.toLowerCase().includes(cleanTranscript) || 
              cleanTranscript.includes(db.name.toLowerCase())
            );
            
            if (currentMatches && currentMatches.length > 0) {
              console.log('Found similar matches:', currentMatches.map(db => `${db.name} (${db.id})`));
              setMatchedDbs(currentMatches); // Update matched DBs state
              setMessage(`Found ${currentMatches.length} similar matches. Click one to select.`);
            } else {
              console.log('No matches found for transcript:', currentTranscript);
              console.log('Available databases:', databases ? databases.map(db => `${db.name} (${db.id})`) : 'None');
              setMessage('No matching database found. Please try again.');
            }
          }
        } else {
          setMessage('Click to start speaking');
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setMessage(`Error occurred: ${event.error}`);
      };
      
      // Store recognition instance
      recognitionRef.current = recognition;
      
      // Cleanup
      return () => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (err) {
            // Ignore errors when stopping recognition on cleanup
          }
        }
      };
    }, [databases, onClose, onDatabaseFound]);
    
    // Start listening function
    const startListening = () => {
      setTranscript('');
      setMatchedDbs([]);
      latestTranscriptRef.current = '';
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.error('Failed to start recognition:', err);
          // Recreate recognition instance if there's an error
          resetRecognition();
          // Try starting again
          recognitionRef.current.start();
        }
      }
    };
    
    // Reset recognition instance
    const resetRecognition = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Set up event handlers again
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = navigator.language || 'en-US';
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setMessage('Listening...');
        latestTranscriptRef.current = '';
      };
      
      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript.trim();
        console.log('Transcript received:', transcriptText);
        setTranscript(transcriptText);
        latestTranscriptRef.current = transcriptText;
        
        // Find potential matches
        if (databases && databases.length > 0) {
          const searchText = transcriptText.toLowerCase();
          const potentialMatches = databases.filter(db => 
            db.name.toLowerCase().includes(searchText) || 
            searchText.includes(db.name.toLowerCase())
          );
          setMatchedDbs(potentialMatches);
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        const currentTranscript = latestTranscriptRef.current;
        if (currentTranscript && databases && databases.length > 0) {
          processTranscript(currentTranscript);
        } else {
          setMessage('Click to start speaking');
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setMessage(`Error occurred: ${event.error}`);
      };
    };
    
    const processTranscript = (currentTranscript) => {
      if (!currentTranscript || !databases || databases.length === 0) return;
      
      setMessage('Processing...');
      console.log('Processing transcript:', currentTranscript);
      
      // Find exact or best match with more lenient matching
      const cleanTranscript = currentTranscript.toLowerCase().trim();
      
      // Try exact match first
      const exactMatch = databases.find(db => 
        db.name.toLowerCase() === cleanTranscript
      );
      
      // Try searching for the database name in the transcript
      const includedMatch = exactMatch ? null : databases.find(db => 
        cleanTranscript.includes(db.name.toLowerCase())
      );
      
      // Try searching for transcript in the database name
      const reversedMatch = (!exactMatch && !includedMatch) ? databases.find(db => 
        db.name.toLowerCase().includes(cleanTranscript)
      ) : null;
      
      const bestMatch = exactMatch || includedMatch || reversedMatch;
      
      if (bestMatch) {
        console.log('Found matching database:', bestMatch.name);
        setMessage(`Found database: ${bestMatch.name}`);
        // Short delay before closing modal and navigating
        setTimeout(() => {
          onClose();
          console.log('Navigating to database ID:', bestMatch.id);
          onDatabaseFound(bestMatch.id);
        }, 1000);
      } else {
        // Find any potential matches
        const potentialMatches = databases.filter(db => 
          db.name.toLowerCase().includes(cleanTranscript) || 
          cleanTranscript.includes(db.name.toLowerCase())
        );
        
        if (potentialMatches.length > 0) {
          console.log('Found similar matches:', potentialMatches.map(db => db.name));
          setMatchedDbs(potentialMatches);
          setMessage(`Found ${potentialMatches.length} similar matches. Click one to select.`);
        } else {
          console.log('No matches found for:', currentTranscript);
          console.log('Available databases:', databases.map(db => db.name));
          setMessage('No matching database found. Please try again.');
        }
      }
    };
    
    const stopListening = () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Error stopping recognition:', err);
        }
      }
      setIsListening(false);
    };
    
    const toggleListening = () => {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    };
    
    const selectDatabase = (dbId) => {
      const selectedDb = databases.find(db => db.id === dbId);
      if (selectedDb) {
        console.log('User selected database:', selectedDb.name);
        setMessage(`Selected database: ${selectedDb.name}`);
        setTimeout(() => {
          onClose();
          onDatabaseFound(dbId);
        }, 500);
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`rounded-lg p-6 max-w-md w-full ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
          <h2 className="text-lg font-bold mb-4">{translations?.voiceSearch || 'Voice Database Search'}</h2>
          
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={toggleListening}
              className={`p-4 rounded-full ${
                isListening
                  ? (darkMode ? 'bg-red-600 animate-pulse' : 'bg-red-500 animate-pulse')
                  : (darkMode ? 'bg-blue-600' : 'bg-blue-500')
              } text-white`}
              aria-label={isListening ? "Stop listening" : "Start listening"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            
            <p className="text-sm">{message}</p>
            
            {transcript && (
              <div className={`mt-4 p-3 rounded-lg w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-sm font-medium">{translations?.youSaid || 'You said'}:</p>
                <p className="text-md">{transcript}</p>
              </div>
            )}
            
            {matchedDbs.length > 0 && (
              <div className={`mt-2 w-full ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <p className="text-sm font-medium mb-2">{translations?.possibleMatches || 'Possible matches'}:</p>
                <div className="max-h-40 overflow-y-auto">
                  {matchedDbs.map(db => (
                    <div 
                      key={db.id}
                      onClick={() => selectDatabase(db.id)}
                      className={`p-2 mb-1 rounded cursor-pointer ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {db.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className={`px-3 py-1 text-sm rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {translations?.cancel || 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col w-screen min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar />
      
      <div className="flex-grow relative">
        {/* Background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 animate-subtle-motion" 
          style={{ 
            backgroundImage: "url('/db-bg.png')",
            animation: "subtleFloat 15s ease-in-out infinite alternate"
          }}
        />
        
        <div className="container mx-auto px-2 py-4 relative z-10">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-lg font-bold">{translations.title}</h1>
            
            <div className="flex items-center space-x-2">
              {/* Voice Search Button */}
              <div className="relative group">
                <button
                  onClick={handleVoiceSearch}
                  className={`p-2 rounded-full ${
                    darkMode 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-purple-500 hover:bg-purple-600'
                  } text-white`}
                  title={translations.voiceSearch}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                
                {/* Tooltip that appears on hover */}
                <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'
                }`}>
                  Select database to query
                  {/* Triangle pointer */}
                  <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent ${
                    darkMode ? 'border-t-gray-700' : 'border-t-gray-800'
                  }`}></div>
                </div>
              </div>
              
              <button
                onClick={handleCreateDatabase}
                className={`px-2 py-1 text-xs rounded-lg ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                {translations.createButton}
              </button>
              
              <button
                onClick={handleConnectDatabase}
                className={`px-2 py-1 text-xs rounded-lg ${
                  darkMode 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {translations.connectButton}
              </button>
            </div>
          </div>
          
          <div className={`rounded-lg overflow-hidden shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-transparent border-b-transparent border-l-gray-300 border-r-gray-300"></div>
                <p className="mt-2 text-sm">Loading databases...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                <p>{error}</p>
                <button 
                  onClick={fetchDatabases} 
                  className="mt-2 text-sm underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            ) : databases.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-3 py-3 text-left text-xxs font-medium uppercase tracking-wider">
                      {translations.dbName}
                    </th>
                    <th className="px-3 py-3 text-left text-xxs font-medium uppercase tracking-wider">
                      {translations.accessLevel}
                    </th>
                    <th className="px-3 py-3 text-left text-xxs font-medium uppercase tracking-wider">
                      {translations.lastAccessed}
                    </th>
                    <th className="px-3 py-3 text-left text-xxs font-medium uppercase tracking-wider">
                      {translations.preview}
                    </th>
                    <th className="px-3 py-3 text-left text-xxs font-medium uppercase tracking-wider">
                      {translations.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {databases.map((db) => (
                    <tr key={db.id} className={`cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                      <td className="px-3 py-4 text-xs whitespace-nowrap">{db.name}</td>
                      <td className="px-3 py-4 text-xs whitespace-nowrap">
                        <span className={`px-1 py-0.5 inline-flex text-xxs leading-4 font-semibold rounded-full ${
                          db.accessLevel === 'read-only' 
                            ? (darkMode ? 'bg-yellow-800 text-yellow-100' : 'bg-yellow-100 text-yellow-800')
                            : (darkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800')
                        }`}>
                          {db.accessLevel === 'read-only' ? translations.readOnly : translations.readWrite}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-xs whitespace-nowrap">{new Date(db.lastAccessed).toLocaleDateString()}</td>
                      <td className="px-3 py-4 text-xs whitespace-nowrap">
                        <DbPreviewOption 
                          dbId={db.id} 
                          dbName={db.name} 
                          darkMode={darkMode} 
                        />
                      </td>
                      <td className="px-3 py-4 text-xs whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {/* Voice Query Button */}
                          <div className="relative group">
                          
<button
  onClick={() => handleVoiceInput(db.id)}  // Now it creates a function that will be called on click
  className={`p-1 rounded-full ${
    darkMode 
      ? 'bg-purple-600 hover:bg-purple-700' 
      : 'bg-purple-500 hover:bg-purple-600'
  } text-white`}
  title={translations.voiceQueryDb}
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
</button>
    

                            
                            {/* Tooltip */}
                            <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                              darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'
                            }`}>
                              Query by voice
                              {/* Triangle pointer */}
                              <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent ${
                                darkMode ? 'border-t-gray-700' : 'border-t-gray-800'
                              }`}></div>
                            </div>
                          </div>
                          
                          {/* Navigate Button */}
                          <div className="relative group">
                            <button
                              onClick={() => navigateToDatabase(db.id)}
                              className={`p-1 rounded ${
                                darkMode 
                                  ? 'bg-blue-600 hover:bg-blue-700' 
                                  : 'bg-blue-500 hover:bg-blue-600'
                              } text-white`}
                              title={translations.queryDatabase}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </button>
                            
                            {/* Tooltip */}
                            <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs rounded whitespace-nowrap hidden group-hover:block z-40 ${
                              darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'
                            }`}>
                              Use to query
                              {/* Triangle pointer */}
                              <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent ${
                                darkMode ? 'border-t-gray-700' : 'border-t-gray-800'
                              }`}></div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-3 text-xs text-center">{translations.noData}</div>
            )}
          </div>
        </div>
      </div>
      {processingVoice && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <Loader />
  </div>
)}

      {showCreateModal && (
        <CreateDatabaseModal 
          darkMode={darkMode}
          onClose={() => {
            setShowCreateModal(false);
            handleModalClose();
          }}
        />
      )}
  
      {showConnectModal && (
        <ConnectDatabaseModal 
          darkMode={darkMode}
          onClose={() => {
            setShowConnectModal(false);
            handleModalClose();
          }}
        />
      )}
  
      {/* Voice Search Modal */}
      {showVoiceModal1 && (
  <VoiceSearchModal1
    darkMode={darkMode}
    onClose={handleCloseVoiceModal}
    onDatabaseFound={handleDatabaseFound}
    databases={databases}
    translations={translations}
  />
)}
{showVoiceModal && (
        <VoiceSearchModal
          open={showVoiceModal}
          onClose={() => setShowVoiceModal(false)}
          onQuery={(transcript) => {
            setShowVoiceModal(false);
            handleDbVoiceQuery(activeDbId, transcript); // Now properly passes both parameters
          }}
        />
      )}
      <footer className="mt-auto py-4 text-center backdrop-blur-sm bg-white/30 dark:bg-black/30">
        <p className="text-sm">©️ 2025 Data Visualization Platform</p>
      </footer>
    </div>
  );
};

export default DatabaseDashboard;