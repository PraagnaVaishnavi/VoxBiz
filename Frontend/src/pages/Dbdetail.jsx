import React, { useState, useEffect } from 'react';
import Loader from '../components/ui/Loader';
// Import icons
import { Mic, Edit, Save, Database, Key, Lock, Cog, Send, MessageSquare } from 'lucide-react';
import Navbar from '../components/Navbar';
import VoiceSearchModal from '../components/VoiceSearchModal';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const DatabaseDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dbInfo = location.state?.dbInfo;
  // Static database data for testing
  const [database, setDatabase] = useState({
    id: '',
    name: '',
    type: '',
    status: '',
    lastAccessed: '',
  });
  const [credentials, setCredentials] = useState({
    connectionString: '',
    permissions: 'readOnly'
  });
  const [queryContext, setQueryContext] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [processingVoice, setProcessingVoice] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [darkMode, setDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [translations, setTranslations] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  
  // New state variables for text query and interactive capabilities
  const [textQuery, setTextQuery] = useState('');
  const [conversation, setConversation] = useState([]);
  const [awaitingClarification, setAwaitingClarification] = useState(false);
  const [clarificationQuestion, setClarificationQuestion] = useState('');
  const [tempQuery, setTempQuery] = useState('');

  useEffect(() => {
    console.log("Database Info:", dbInfo);
      setDatabase({
        id: dbInfo?.id || '123',
        name: dbInfo?.name || 'Production MySQL',
        type: dbInfo?.type || 'MySQL',
        status: dbInfo?.status || 'Connected',
        lastAccessed: dbInfo?.lastAccessed || '2025-04-01'
      });
      
      setCredentials({
        connectionString: dbInfo?.connectionString || 'mysql://user:pass@localhost:3306/mydb',
        permissions: dbInfo?.permissions || 'readOnly'
      });
   
  }, [dbInfo]);

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
  
  useEffect(() => {
    // Register this page's translation keys
    window.currentPageTranslationKeys = [
      'title', 'createButton', 'connectButton', 'noData', 'dbName',
      'dbType', 'accessLevel', 'lastAccessed', 'readOnly', 'readWrite', 'actions', 
      'queryDatabase', 'voiceSearch', 'dbCredentials',
      'connectionString', 'permissions', 'save', 'cancel', 'editCredentials',
      'queryPrompt', 'interactions', 'totalQueries', 'successRate', 'avgResponseTime',
      'ruleManager', 'manageRules', 'processing', 'textQuery', 'sendQuery',
      'clarifyPrompt', 'conversationHistory', 'typeQuery'
    ];
    
    // Set default English texts
    const defaultTexts = {
      title: 'Database Details',
      createButton: 'Create Tables',
      connectButton: 'Connect Database',
      noData: 'No database found',
      dbName: 'Database Name',
      dbType: 'Type',
      accessLevel: 'Access Level',
      lastAccessed: 'Last Accessed',
      readOnly: 'Read Only',
      readWrite: 'Read & Write',
      voiceSearch: "Search by voice",
      processing: "Processing...",
      actions: "Actions",
      Query: "Query database with your voice",
      dbCredentials: "Database Credentials",
      connectionString: "Connection String",
      permissions: "Permissions",
      save: "Save",
      cancel: "Cancel",
      editCredentials: "Edit Credentials",
      queryPrompt: "Click the mic to ask a question in any language or type your query below",
      interactions: "Interactions",
      totalQueries: "Total Queries",
      successRate: "Success Rate",
      avgResponseTime: "Avg Response Time",
      manageRules: "Manage Database Rules",
      textQuery: "Text Query",
      sendQuery: "Send Query",
      clarifyPrompt: "I need more information to process your query:",
      conversationHistory: "Conversation History",
      typeQuery: "Type your database query here..."
    };
    
    setTranslations(defaultTexts);
    window.currentPageDefaultTexts = defaultTexts;
    
    // Handle translations loading
    const handleTranslationsLoaded = (event) => {
      if (event.detail && event.detail.translations) {
        setTranslations(prev => ({...prev, ...event.detail.translations}));
      }
    };
    
    window.addEventListener('translationsLoaded', handleTranslationsLoaded);
    
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
      window.removeEventListener('translationsLoaded', handleTranslationsLoaded);
    };
  }, []);

  const handleCredentialChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleVoiceInput = () => {
    setShowVoiceModal(true);
  };

  const handleNavigateToRuleManager = () => {
    // Navigate to rule manager page
    window.location.href = `/rulemanage`;
  };
  const analyzeQueryForClarification = async (query) => {
    // First check if query is very short (likely incomplete)
    if (query.split(' ').length < 3) {
      return { 
        needsClarification: true, 
        question: 'Your query seems brief. Could you provide more details about what you want to know?' 
      };
    }
  
    // Define areas that commonly need clarification
    const ambiguityTypes = [
      { pattern: /show|display|get/i, aspect: 'time period' },
      { pattern: /sales|revenue|amount/i, aspect: 'product specificity' },
      { pattern: /customer|customers/i, aspect: 'customer segmentation' },
      { pattern: /compare|comparison/i, aspect: 'comparison metrics' },
      { pattern: /top|best|highest/i, aspect: 'result count and ranking criteria' },
      { pattern: /join/i, aspect: 'join relationships' },
      { pattern: /average|avg|mean/i, aspect: 'grouping and calculation method' },
      { pattern: /duplicate|duplicates/i, aspect: 'duplicate handling' }
    ];
  
    // Add specific patterns for join operations
    const joinPatterns = [
      { pattern: /inner\s+join|join/i, type: 'inner join' },
      { pattern: /left\s+join/i, type: 'left join' },
      { pattern: /right\s+join/i, type: 'right join' },
      { pattern: /full\s+join|full\s+outer\s+join/i, type: 'full join' },
      { pattern: /cross\s+join/i, type: 'cross join' }
    ];
  
    const lowercaseQuery = query.toLowerCase();
    
    // Special handling for join operations
    for (const { pattern, type } of joinPatterns) {
      if (pattern.test(lowercaseQuery)) {
        try {
          // We'll use a specific join clarification function for join queries
          const joinClarification = await getJoinClarification(query, type);
          return { 
            needsClarification: true, 
            question: joinClarification,
            joinType: type
          };
        } catch (error) {
          console.error("Error getting join clarification:", error);
          return {
            needsClarification: true,
            question: `I noticed you want to perform a ${type}. Could you specify which tables you want to join and on which columns?`,
            joinType: type
          };
        }
      }
    }
    
    // Check for generic duplicates handling
    if (/duplicate|duplicates/i.test(lowercaseQuery)) {
      return {
        needsClarification: true,
        question: "I noticed your query might involve duplicate data. Would you like to include or exclude duplicates in the results?",
        duplicateHandling: true
      };
    }
    
    // Check for other ambiguities that might need clarification
    for (const { pattern, aspect } of ambiguityTypes) {
      if (pattern.test(lowercaseQuery)) {
        try {
          // Call Gemini API to generate a contextual clarification question
          const clarificationQuestion = await callGeminiAPI(query, aspect);
          return { 
            needsClarification: true, 
            question: clarificationQuestion 
          };
        } catch (error) {
          console.error("Error calling Gemini API:", error);
          // Fallback to a generic question about this aspect
          return {
            needsClarification: true,
            question: `Could you provide more details about the ${aspect} in your query?`
          };
        }
      }
    }
  
    // If no specific ambiguities were found, check with Gemini if clarification is needed anyway
    try {
      const API_KEY = process.env.GEMINI_API_KEY;
      const needsGeneralClarification = await checkGeneralClarificationNeeded(query, API_KEY);
      if (needsGeneralClarification.needed) {
        return {
          needsClarification: true,
          question: needsGeneralClarification.question
        };
      }
    } catch (error) {
      console.error("Error during general clarification check:", error);
    }
  
    return { needsClarification: false };
  };

  const getJoinClarification = async (query, joinType) => {
    const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";
  
    const API_KEY = process.env.GEMINI_API_KEY;
    
    const prompt = `
      Given this database query in a data analytics context: "${query}"
      
      The user wants to perform a ${joinType}. As a helpful assistant, generate a follow-up question to clarify:
      
      1. Which specific tables they want to join
      2. Which columns to use for the join condition
      3. How to handle potential duplicate data
      
      Keep your question conversational, helpful, and focused on getting the exact information needed for the join operation.
      Format the response as a single clarification question without any additional text or explanations.
    `;
    
    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 150
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const result = await response.json();
    // Extract the generated question from the response
    return result.candidates[0].content.parts[0].text.trim();
  };
  
  
  /**
   * Call Gemini API to generate a contextual clarification question
   * @param {string} query - The original user query
   * @param {string} aspect - The aspect of the query that needs clarification
   * @returns {Promise<string>} - A clarification question
   */
  const callGeminiAPI = async (query, aspect) => {
    const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

    const API_KEY = process.env.GEMINI_API_KEY;
    
    const prompt = `
      Given this user query in a data analytics context: "${query}"
      
      Generate a natural, conversational follow-up question to clarify the "${aspect}" aspect of their request.
      The question should:
      - Be specific to the query content
      - Be phrased in a helpful, concise way
      - Not make assumptions about what the user wants
      - Focus only on the "${aspect}" aspect
      - Return only the follow-up question with no additional explanation or context
    `;
    
    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 100
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const result = await response.json();
    // Extract the generated question from the response
    return result.candidates[0].content.parts[0].text.trim();
  };
  
  /**
   * Check if a query needs general clarification even if no specific ambiguity was detected
   * @param {string} query - The original user query
   * @returns {Promise<{needed: boolean, question: string}>} - Whether clarification is needed and what question to ask
   */
  const checkGeneralClarificationNeeded = async (query, apiKey) => {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Given this user query in a data analytics context: "${query}"
            
  First, determine if this query is ambiguous or lacks important context needed to provide an accurate response.
  If it does need clarification, generate ONE concise follow-up question that would help clarify the user's intent.
            
  Return your response in this JSON format:
  {
    "needs_clarification": true/false,
    "question": "Your follow-up question here (only if needs_clarification is true)"
  }`
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 150
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const result = await response.json();
    const clarificationResult = JSON.parse(result.candidates[0].content.parts[0].text);
    
    return {
      needed: clarificationResult.needs_clarification,
      question: clarificationResult.question || "Could you provide more details about your request?"
    };
  };

  const generateEnhancedJoinQuery = async (originalQuery, clarification, joinType) => {
    const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";
  
    const API_KEY = process.env.GEMINI_API_KEY;
    
    const prompt = `
      Original query: "${originalQuery}"
      User clarification: "${clarification}"
      Join type: ${joinType}
      
      Based on the original query and the user's clarification, generate a complete, well-formed SQL query that:
      1. Implements the ${joinType} between the specified tables
      2. Uses the correct JOIN syntax
      3. Handles duplicate data according to the user's preference (if mentioned)
      
      Return only the SQL query without any additional explanations or markdown formatting.
    `;
    
    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 500
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const result = await response.json();
    return result.candidates[0].content.parts[0].text.trim();
  };
  
  
  // Example usage:
  // const result = await checkGeneralClarificationNeeded("show sales data", "YOUR_API_KEY_HERE");
  // console.log(result);
  
  // Example usage
  // const result = await analyzeQueryForClarification("show sales data");
  // if (result.needsClarification) {
  //   console.log("Clarification needed:", result.question);
  // } else {
  //   console.log("Query is clear enough to proceed");
  // }
  const generateDuplicateHandlingQuery = async (originalQuery, clarification) => {
    const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";
  
    const API_KEY = process.env.GEMINI_API_KEY;
    
    const prompt = `
      Original query: "${originalQuery}"
      User clarification about duplicates: "${clarification}"
      
      Based on the original query and the user's clarification about handling duplicates, generate a complete, well-formed SQL query that:
      1. Implements the user's preference for handling duplicates (DISTINCT, GROUP BY, etc.)
      2. Maintains the original intent of the query
      3. Is optimized for performance
      
      Return only the SQL query without any additional explanations or markdown formatting.
    `;
    
    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 500
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const result = await response.json();
    return result.candidates[0].content.parts[0].text.trim();
  };
  const executeQuery = (finalQuery) => {
    setProcessingVoice(true);
    const dbId = localStorage.getItem('dbId');
    if (!dbId) {
      console.error("Database ID not found in local storage");
      setProcessingVoice(false);
      setErrorMessage('Database ID not found. Please try again.');
      
      setConversation(prev => {
        const newConversation = [...prev];
        newConversation[newConversation.length - 1] = { 
          type: 'system', 
          text: 'Database ID not found. Please try again.' 
        };
        return newConversation;
      });
      
      return;
    }
  
    // Check if query is empty
    if (!finalQuery) {
      console.error("Query is empty");
      setProcessingVoice(false);
      setErrorMessage('Query cannot be empty. Please try again.');
      
      setConversation(prev => {
        const newConversation = [...prev];
        newConversation[newConversation.length - 1] = { 
          type: 'system', 
          text: 'Query cannot be empty. Please try again.' 
        };
        return newConversation;
      });
      
      return;
    }
  
    // Make an API call to the backend database service
    console.log("Executing query:", finalQuery);
    fetch(`http://localhost:3000/api/query/process/${dbId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',        
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({ transcript: finalQuery }) 
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
        
        // Check if response indicates duplicate data that needs handling
        if (response.data.hasDuplicates) {
          // Ask user how to handle duplicates
          handleDuplicateDataResponse(finalQuery, response.data);
          return;
        }
        
        // Update conversation with success
        setConversation(prev => {
          const newConversation = [...prev];
          newConversation[newConversation.length - 1] = { 
            type: 'system', 
            text: 'Query processed successfully! Redirecting to results...' 
          };
          return newConversation;
        });
        
        // Save the data to sessionStorage
        try {
          sessionStorage.setItem('visualizationData', JSON.stringify(response.data));
          console.log("Data saved to sessionStorage successfully");
        } catch (err) {
          console.error("Error saving to sessionStorage:", err);
        }
        
        // Reset the text query field
        setTextQuery('');
        
        // On success, navigate to the choice page
        navigate('/table', { state: { visualizationData: response.data } });
      })
      .catch(error => {
        console.error("Error processing database query:", error);
        setProcessingVoice(false);
        
        // Show failure message
        setErrorMessage('Database query failed. Please try again.');
        
        // Update conversation with error
        setConversation(prev => {
          const newConversation = [...prev];
          newConversation[newConversation.length - 1] = { 
            type: 'system', 
            text: 'Database query failed. Please try again.' 
          };
          return newConversation;
        });
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          setErrorMessage('');
        }, 5000);
      });
  };
  const handleDuplicateDataResponse = (query, data) => {
    // Get clarification on how to handle duplicates
    handleDuplicateDataClarification(query).then(clarificationQuestion => {
      setTempQuery(query);
      setAwaitingClarification(true);
      setClarificationQuestion(clarificationQuestion);
      setQueryContext({ duplicateHandling: true, originalData: data });
      
      // Add the question to conversation
      setConversation(prev => [
        ...prev,
        { 
          type: 'system', 
          text: `I found ${data.duplicateCount || 'some'} duplicate rows in the results. ${clarificationQuestion}` 
        }
      ]);
    }).catch(error => {
      console.error("Error getting duplicate clarification:", error);
      // Fallback question
      const fallbackQuestion = "I noticed there are duplicate entries in the results. Would you like to keep all duplicates, remove them, or handle them in a specific way?";
      
      setTempQuery(query);
      setAwaitingClarification(true);
      setClarificationQuestion(fallbackQuestion);
      setQueryContext({ duplicateHandling: true, originalData: data });
      
      // Add the question to conversation
      setConversation(prev => [
        ...prev,
        { 
          type: 'system', 
          text: `I found duplicate rows in the results. ${fallbackQuestion}` 
        }
      ]);
    });
  };

  const handleClarificationResponse = (clarificationResponse, queryContext) => {
    // Clear clarification state
    setAwaitingClarification(false);
    setClarificationQuestion('');
    
    // Add to conversation history
    setConversation(prev => [
      ...prev,
      { type: 'user', text: clarificationResponse },
      { type: 'system', text: 'Processing your clarified query...' }
    ]);
    
    // Combine original query with clarification
    const originalQuery = tempQuery;
    
    // For join operations, generate an enhanced query
    if (queryContext.joinType) {
      generateEnhancedJoinQuery(originalQuery, clarificationResponse, queryContext.joinType)
        .then(enhancedQuery => {
          console.log("Enhanced join query:", enhancedQuery);
          executeQuery(enhancedQuery);
        })
        .catch(error => {
          console.error("Error generating enhanced join query:", error);
          // Fallback to using original query + clarification
          executeQuery(`${originalQuery} (Clarification: ${clarificationResponse})`);
        });
    } 
    // For duplicate handling
    else if (queryContext.duplicateHandling) {
      generateDuplicateHandlingQuery(originalQuery, clarificationResponse)
        .then(enhancedQuery => {
          console.log("Enhanced duplicate handling query:", enhancedQuery);
          executeQuery(enhancedQuery);
        })
        .catch(error => {
          console.error("Error generating duplicate handling query:", error);
          // Fallback to using original query + clarification
          executeQuery(`${originalQuery} (Clarification: ${clarificationResponse})`);
        });
    }
    // For other types of clarification
    else {
      executeQuery(`${originalQuery} (Clarification: ${clarificationResponse})`);
    }
  };

  const processDatabaseQuery = (query, isClarification = false, queryContext = {}) => {
    // If not a clarification, analyze the query first
    if (!isClarification) {
      // Here we make this an async operation
      analyzeQueryForClarification(query).then(analysis => {
        // If query needs clarification, save temp query and ask for clarification
        if (analysis.needsClarification) {
          setTempQuery(query);
          setAwaitingClarification(true);
          setClarificationQuestion(analysis.question);
          
          // Save additional context if this is a join operation or duplicate handling
          if (analysis.joinType) {
            setQueryContext(prev => ({ ...prev, joinType: analysis.joinType }));
          }
          
          if (analysis.duplicateHandling) {
            setQueryContext(prev => ({ ...prev, duplicateHandling: true }));
          }
          
          // Add the question to conversation
          setConversation(prev => [
            ...prev,
            { type: 'user', text: query },
            { type: 'system', text: analysis.question }
          ]);
          
          return;
        } else {
          // If no clarification needed, proceed with the query
          executeQuery(query);
        }
      }).catch(error => {
        console.error("Error analyzing query:", error);
        // Handle error and add to conversation
        setConversation(prev => [
          ...prev,
          { type: 'user', text: query },
          { type: 'system', text: 'Error analyzing your query. Please try again.' }
        ]);
      });
    } else {
      // We're processing a clarification response
      handleClarificationResponse(query, queryContext);
    }
  };



  const handleDuplicateDataClarification = async (query) => {
    const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";
  
    const API_KEY = process.env.GEMINI_API_KEY;
    
    const prompt = `
      Given this database query in a data analytics context: "${query}"
      
      The user might need to handle duplicate data. Generate a follow-up question that:
      1. Asks if they want to include or exclude duplicates
      2. Suggests possible handling methods (DISTINCT, GROUP BY, etc.)
      3. Asks which columns they consider when identifying duplicates
      
      Keep your question conversational, helpful, and focused on clarifying duplicate data handling.
      Format the response as a single clarification question without any additional text or explanations.
    `;
    
    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 150
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const result = await response.json();
    return result.candidates[0].content.parts[0].text.trim();
  };

  // Handle text query submission
  const handleTextQuerySubmit = (e) => {
    e.preventDefault();
    if (awaitingClarification) {
      processDatabaseQuery(textQuery, true, queryContext);
    } else {
      processDatabaseQuery(textQuery, false);
    }
    setTextQuery('');
  };

  // Handle voice query from voice modal
  const handleDatabaseQuery = (query) => {
    processDatabaseQuery(query, false);
  };

  const getSuggestionForJoin = async (query) => {
    const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";
  
    const API_KEY = process.env.GEMINI_API_KEY;
    
    const prompt = `
      Given this database query: "${query}"
      
      Generate 3 possible join suggestions that the user might want to perform, considering:
      1. The tables mentioned or implied in the query
      2. Common join operations that would make sense in this context
      3. Different types of joins (INNER, LEFT, RIGHT, FULL) that might be appropriate
      
      Format your response as a JSON array of suggestions, each with:
      - joinType: the type of join (INNER, LEFT, RIGHT, FULL)
      - description: a brief, user-friendly explanation of what this join would do
      - tables: which tables would be joined
      - conditions: suggested join conditions
    `;
    
    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
          responseFormat: { type: "JSON" }
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const result = await response.json();
    const suggestions = JSON.parse(result.candidates[0].content.parts[0].text);
    return suggestions;
  };
  
  // Enhance the VoiceSearchModal component to provide additional interactive features
  // This is a sketch of additional features you could add to the VoiceSearchModal component
  
  /*
  const EnhancedVoiceSearchModal = ({ darkMode, onClose, onQuery }) => {
    const [transcript, setTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [processing, setProcessing] = useState(false);
    
    // Use speech recognition
    useEffect(() => {
      // Speech recognition code here
    }, []);
    
    // Get suggestions when transcript changes
    useEffect(() => {
      if (transcript && transcript.toLowerCase().includes('join')) {
        setProcessing(true);
        getSuggestionForJoin(transcript)
          .then(joinSuggestions => {
            setSuggestions(joinSuggestions);
            setProcessing(false);
          })
          .catch(error => {
            console.error("Error getting join suggestions:", error);
            setProcessing(false);
          });
      }
    }, [transcript]);
    
    // Handle selection of a suggestion
    const handleSelectSuggestion = (suggestion) => {
      // Modify the transcript with the selected suggestion
      const enhancedTranscript = `${transcript} using ${suggestion.joinType} JOIN between ${suggestion.tables.join(' and ')} on ${suggestion.conditions}`;
      setTranscript(enhancedTranscript);
    };
    
    return (
      // Modal UI with suggestions display and selection
    );
  };
  */
  
  // Example of how we'd modify the database query interaction flow
  // Inside the processDatabaseQuery function:
  
  /*
    // After performing initial analysis...
    if (analysis.needsClarification && joinRelated) {
      // Get join suggestions
      getSuggestionForJoin(query)
        .then(suggestions => {
          // Store suggestions in state
          setJoinSuggestions(suggestions);
          
          // Display them to the user
          setConversation(prev => [
            ...prev,
            { type: 'user', text: query },
            { 
              type: 'system', 
              text: analysis.question,
              suggestions: suggestions.map(s => ({
                text: `${s.joinType} JOIN between ${s.tables.join(' and ')}`,
                value: JSON.stringify(s)
              }))
            }
          ]);
        })
        .catch(error => {
          console.error("Error getting join suggestions:", error);
          // Fall back to regular clarification without suggestions
        });
    }
  */

  const saveCredentials = async () => {
    try {
      // Simulate API request with timeout
      setTimeout(() => {
        // Update database state with new credentials
        setDatabase(prev => ({
          ...prev,
          ...credentials
        }));
        setIsEditing(false);
        console.log("Credentials updated:", credentials);
      }, 500);
    } catch (err) {
      console.error('Error updating credentials:', err);
      // Show error notification if needed
    }
  };

  // Get translated text with fallback to default
  const getText = (key) => {
    if (!key) return ""; // Return empty string if key is undefined/null
    return translations[key] || window.currentPageDefaultTexts?.[key] || key;
  };
  
  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="flex justify-center items-center h-screen">
          <Loader />
        </div>
      </div>
    );
  }

  if (error || !database) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">{error || getText('noData')}</h2>
            <p>{getText('noData')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:px-6 lg:flex">
        {/* Left Sidebar - 40% width with background image */}
        <div className="lg:w-2/5 mb-6 lg:mb-0 lg:pr-6 relative">
          <div className="rounded-xl overflow-hidden h-full flex items-center justify-center">
            <img 
              src="/detail-bg.png" 
              alt="Database visualization" 
              className="w-full h-full object-contain p-4" 
            />
            <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-6 ${darkMode ? 'bg-slate-900/60' : 'bg-white/40'}`}>
              <h2 className="text-2xl font-bold mb-2">{database.name}</h2>
              <p className="text-lg mb-4">{database.type} Database</p>
              <div className={`px-4 py-2 rounded-full ${darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                {database.status || 'Connected'}
              </div>
              
              {/* Rule Manager Button - Only show if user has read-write permissions */}
              <button
                onClick={handleNavigateToRuleManager}
                className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center"
              >
                <Cog className="h-5 w-5 mr-2" />
                {translations.manageRules}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Right side */}
        <div className="lg:w-3/5">
          {/* Database Name Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{database.name}</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {database.type} • {database.lastAccessed}
              </p>
            </div>
          </div>

          {/* Voice Query Section */}
          <div className={`mb-8 p-6 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-white shadow'}`}>
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold mr-2">{translations.queryDatabase}</h2>
              <Mic className="h-5 w-5 text-indigo-500" />
            </div>
            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {translations.queryPrompt}
            </p>
            
            {/* Display error message if present */}
            {errorMessage && (
              <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {errorMessage}
              </div>
            )}
            
            {/* Voice search button */}
            <button
              onClick={handleVoiceInput}
              disabled={processingVoice}
              className={`w-full text-white py-4 rounded-lg flex items-center justify-center mb-4 ${
                processingVoice 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
              }`}
            >
              <Mic className="h-6 w-6 mr-2" />
              {processingVoice ? translations.processing : translations.voiceSearch}
            </button>
            
            {/* Text query input */}
            <form onSubmit={handleTextQuerySubmit} className="relative mt-4">
              <input
                type="text"
                value={textQuery}
                onChange={(e) => setTextQuery(e.target.value)}
                placeholder={awaitingClarification ? clarificationQuestion : getText('typeQuery')}
                className={`w-full p-3 pr-12 rounded-lg border ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 placeholder-gray-500'
                } ${awaitingClarification ? 'border-indigo-500 ring-2 ring-indigo-200' : ''}`}
                disabled={processingVoice}
              />
              <button
                type="submit"
                disabled={processingVoice || !textQuery.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-500 hover:text-indigo-600 disabled:text-gray-400"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
            
            {/* Conversation History */}
            {conversation.length > 0 && (
              <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-100'} max-h-64 overflow-y-auto`}>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {getText('conversationHistory')}
                </h3>
                <div className="space-y-2">
                  {conversation.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`p-2 rounded-lg text-sm ${
                        msg.type === 'user' 
                          ? darkMode 
                            ? 'bg-indigo-500 text-white ml-8' 
                            : 'bg-indigo-100 text-indigo-800 ml-8'
                          : darkMode 
                            ? 'bg-slate-600 text-gray-200 mr-8' 
                            : 'bg-white text-gray-800 mr-8 border border-gray-200'
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Performance Analytics Card */}
          {dbInfo && (
            <div className="group relative flex w-full mb-8 flex-col rounded-xl bg-slate-950 p-4 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/20">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
              <div className="absolute inset-px rounded-[11px] bg-slate-950" />
              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-white">Interactions</h3>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Live
                  </span>
                </div>

                <div className="mb-4 grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-slate-900/50 p-3">
                    <p className="text-xs font-medium text-slate-400">Total Queries</p>
                    <p className="text-lg font-semibold text-white">{dbInfo.totalQueries}</p>
                  </div>
                  <div className="rounded-lg bg-slate-900/50 p-3">
                    <p className="text-xs font-medium text-slate-400">Success Rate</p>
                    <p className="text-lg font-semibold text-white">{dbInfo.successRate}</p>
                  </div>
                  <div className="rounded-lg bg-slate-900/50 p-3">
                    <p className="text-xs font-medium text-slate-400">Avg Response Time</p>
                    <p className="text-lg font-semibold text-white">{dbInfo.avgResponseTime}</p>
                  </div>
                </div>

                <div className="mb-4 h-24 w-full overflow-hidden rounded-lg bg-slate-900/50 p-3">
                  <div className="flex h-full w-full items-end justify-between gap-1">
                    {dbInfo.queryFrequency?.map((count, index) => {
                      const max = Math.max(...dbInfo.queryFrequency);
                      const height = (count / max) * 100;
                      return (
                        <div key={index} className="w-3 rounded-sm bg-indigo-500/30">
                          <div
                            className="w-full rounded-sm bg-indigo-500 transition-all duration-300"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Last 7 days</span>
                  <button className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-xs font-medium text-white transition-all duration-300 hover:from-indigo-600 hover:to-purple-600">
                    View Details
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {processingVoice && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <Loader />
            </div>
          )}

          {/* Database Credentials Section */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white shadow'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{translations.dbCredentials}</h2>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className={`flex items-center gap-1 px-3 py-1 rounded ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <Edit className="h-4 w-4" />
                  <span>{translations.editCredentials}</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className={`px-3 py-1 rounded ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {translations.cancel}
                  </button>
                  <button 
                    onClick={saveCredentials} 
                    className="flex items-center gap-1 px-3 py-1 rounded bg-indigo-500 hover:bg-indigo-600 text-white"
                  >
                    <Save className="h-4 w-4" />
                    <span>{translations.save}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {translations.connectionString}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="connectionString"
                    value={credentials.connectionString}
                    onChange={handleCredentialChange}
                    className={`w-full p-2 rounded border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                ) : (
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm font-mono">{credentials.connectionString}</span>
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {translations.permissions}
                </label>
                {isEditing ? (
                  <select
                    name="permissions"
                    value={credentials.permissions}
                    onChange={handleCredentialChange}
                    className={`w-full p-2 rounded border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="readOnly">{translations.readOnly}</option>
                    <option value="readWrite">{translations.readWrite}</option>
                  </select>
                ) : (
                  <div className={`inline-flex items-center px-2 py-1 rounded ${
                    credentials.permissions === 'readWrite' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {translations[credentials.permissions === 'readWrite' ? 'readWrite' : 'readOnly']}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showVoiceModal && (
        <VoiceSearchModal 
          darkMode={darkMode}
          onClose={() => setShowVoiceModal(false)}
          onQuery={handleDatabaseQuery}
        />
      )}
      <footer className="mt-auto py-4 text-center backdrop-blur-sm bg-white/30 dark:bg-black/30">
        <p className="text-sm">© 2025 Data Visualization Platform</p>
      </footer>
    </div>
  );
};

export default DatabaseDetailsPage;