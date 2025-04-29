import React, { useState, useEffect, useRef } from "react";
import axios from "axios";  
import Navbar from './Navbar';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, LabelList, ScatterChart,
  Scatter } from "recharts";
import { useLocation } from "react-router-dom";
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Sample data for query history (will be replaced with actual data from backend)
const initialHistoryData = [];

// Material-inspired theme colors
const primaryColor = "#3f51b5";
const secondaryColor = "#f50057";
const accentColor = "#00bcd4";

// Color palette options
const COLOR_PALETTES = [
  { name: "Default", colors: ['#3f51b5', '#f50057', '#00bcd4', '#4caf50', '#ff9800'] },
  { name: "Vibrant", colors: ['#ff5722', '#9c27b0', '#2196f3', '#ffeb3b', '#8bc34a'] },
  { name: "Pastel", colors: ['#a5d6a7', '#90caf9', '#f48fb1', '#ffe082', '#b39ddb'] },
  { name: "Earth", colors: ['#8d6e63', '#78909c', '#a1887f', '#bcaaa4', '#d7ccc8'] },
  { name: "Dark", colors: ['#424242', '#616161', '#757575', '#9e9e9e', '#bdbdbd'] }
];

// API base URL - make sure this is defined
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const Graphrender = () => {
  const location = useLocation();
  
  // Initialize graphType from location state if available
  const [graphType, setGraphType] = useState(
    "bar"
  );
  const [darkMode, setDarkMode] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [historyData, setHistoryData] = useState([]);

  const [chartData, setChartData] = useState([]);
  const [historyFilter, setHistoryFilter] = useState("all");
  const [showCustomizePanel, setShowCustomizePanel] = useState(false);
  const [loading, setLoading] = useState({
    chart: true,
    history: true
  });
  const [error, setError] = useState({
    chart: null,
    history: null
  });
  const [chartSettings, setChartSettings] = useState({
    showLegend: false,
    showGrid: true,
    showDataLabels: false,
    colorPalette: 0,
    dateRange: {
      start: null,
      end: null
    }
  });

  // Fetch chart data from location state or session storage as fallback
  const fetchChartData = () => {
    try {
      setLoading(prev => ({ ...prev, chart: true }));
      setError(prev => ({ ...prev, chart: null }));
      
      let data = null;
      
      // First check if location state has data
      if (location.state && location.state.visualizationData) {
        data = location.state.visualizationData;
        console.log("Data loaded from location state:", data);
      } 
      // If not, try to get from session storage
      else {
        const storedData = sessionStorage.getItem('visualizationData');
        if (storedData) {
          data = JSON.parse(storedData);
          console.log("Data loaded from session storage:", data);
          
        
        } else {
          console.warn("No visualization data found in location state or session storage");
          setError(prev => ({ ...prev, chart: "No data available for visualization" }));
        }
      }
      
      // Process and set the data if we have it
      if (data) {
        // Make sure data is in the right format before setting it
        if (Array.isArray(data)) {
          setChartData(data);
          console.log("Chart data set:", data);
        } else if (typeof data === 'object') {
          // If data is an object but not an array, convert it to an array
          setChartData([data]);
          console.log("Chart data set from object:", [data]);
        } else {
          console.error("Visualization data is in an unexpected format:", data);
          setError(prev => ({ ...prev, chart: "Invalid data format" }));
        }
      }
    } catch (err) {
      console.error("Error processing chart data:", err);
      setError(prev => ({ ...prev, chart: "Failed to load chart data" }));
    } finally {
      setLoading(prev => ({ ...prev, chart: false }));
    }
  };

  // Fetch query history from backend
 // Simplified fetchQueryHistory function
const fetchQueryHistory = async () => {
  try {
    setLoading(prev => ({ ...prev, history: true }));
    setError(prev => ({ ...prev, history: null }));
    
    const storageKey = 'queryHistory';
    
    // First check if data exists in session storage
    const storedHistoryData = sessionStorage.getItem(storageKey);
    
    if (storedHistoryData) {
      // Use data from session storage if available
      const parsedData = JSON.parse(storedHistoryData);
      console.log('Query history loaded from session storage');
      setHistoryData(parsedData); 
    } else {
      // If no data in storage, set empty array or fetch from your API endpoint
      // If using API:
      // const response = await axios.get(`${API_BASE_URL}/history`);
      // setHistoryData(response.data);
      // sessionStorage.setItem(storageKey, JSON.stringify(response.data));
      
      setHistoryData([]); // Default to empty if no data
    }
  } catch (err) {
    console.error("Error fetching query history:", err);
    setError(prev => ({ ...prev, history: "Failed to load query history" }));
  } finally {
    setLoading(prev => ({ ...prev, history: false }));
  }
};

// Simplified clearQueryHistory function
const clearQueryHistory = async () => {
  try {
    setLoading(prev => ({ ...prev, history: true }));
    
    const storageKey = 'queryHistory';
    
    // Clear from session storage
    sessionStorage.removeItem(storageKey);
    
    // Reset the history data in state
    setHistoryData([]);
    
    console.log('Query history has been cleared');
  } catch (err) {
    console.error("Error clearing query history:", err);
    setError(prev => ({ ...prev, history: "Failed to clear query history" }));
  } finally {
    setLoading(prev => ({ ...prev, history: false }));
  }
};

  // Fetch data on component mount
  useEffect(() => {
    console.log("Location state on mount:", location.state);
    fetchChartData();
    
    // Optionally fetch history data if needed
    // fetchQueryHistory();
  }, []); // Only run once on mount

  // Separate effect to update graph type when location state changes
  useEffect(() => {
    if (location.state?.selectedGraphType) {
      // Convert the first letter to lowercase for proper graph type matching
      const graphTypeValue = location.state.selectedGraphType;
      console.log("Location Graph sent:", graphTypeValue);
      
      // Convert first letter to lowercase (e.g., "Bar" becomes "bar")
      const formattedGraphType = graphTypeValue.charAt(0).toLowerCase() + graphTypeValue.slice(1);
      setGraphType(formattedGraphType);
    }
  }, [location.state]);

  // Separate effect for date range filters
  useEffect(() => {
    if (chartData.length > 0) {
      // Apply date range filtering if needed
      // This could be implemented here
    }
  }, [chartSettings.dateRange.start, chartSettings.dateRange.end, chartData]);

  useEffect(() => {
    fetchQueryHistory();
  }, [historyFilter]);

  // Update chart settings
  const handleSettingChange = (setting, value) => {
    setChartSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Update color palette
  const handleColorPaletteChange = (index) => {
    setChartSettings(prev => ({
      ...prev,
      colorPalette: index
    }));
  };

  useEffect(() => {
      // Theme from localStorage
      const storedMode = localStorage.getItem('mode');
      if (storedMode) {
        setDarkMode(storedMode === 'dark');
      }
      const handleThemeChange = (event) => {
        const newTheme = event.detail.theme;
        setDarkMode(newTheme === 'dark');
      };
      window.addEventListener('themeChange', handleThemeChange);
      
      return () => {
        window.removeEventListener('themeChange', handleThemeChange);
      };
    }, []);
  // Group queries by day for history view
  const groupedByDay = Array.isArray(historyData)
  ? historyData.reduce((acc, item) => {
      const date = new Date(item.timestamp).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {})
  : {};

  // Prepare data for performance chart in history view
  const historyChartData = Object.entries(groupedByDay).map(([date, queries]) => {
    const avgExecutionTime = queries.reduce((sum, q) => sum + q.executionTime, 0) / queries.length;
    const queryCount = queries.length;
    return {
      date: date,
      avgExecutionTime: Math.round(avgExecutionTime),
      queryCount: queryCount
    };
  });

  return (
    <div className={`App p-6 min-h-screen w-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <Navbar darkMode={darkMode} />
      {!isFullScreen && (
        <>
    
          
          {/* Tabs Navigation */}
          <div className="flex border-b mb-6 pt-4">
            <button 
              className={`py-2 px-4 font-medium transition-colors ${
                activeTab === "dashboard" 
                  ? `border-b-2 border-${darkMode ? 'blue-400' : 'blue-600'} text-${darkMode ? 'blue-400' : 'blue-600'}`
                  : `text-${darkMode ? 'gray-400' : 'gray-500'} hover:text-${darkMode ? 'gray-200' : 'gray-700'}`
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>
            {/* <button 
              className={`py-2 px-4 font-medium transition-colors ${
                activeTab === "history" 
                  ? `border-b-2 border-${darkMode ? 'blue-400' : 'blue-600'} text-${darkMode ? 'blue-400' : 'blue-600'}`
                  : `text-${darkMode ? 'gray-400' : 'gray-500'} hover:text-${darkMode ? 'gray-200' : 'gray-700'}`
              }`}
              onClick={() => setActiveTab("history")}
            >
              Query History
            </button> */}
            <button 
              className={`py-2 px-4 font-medium transition-colors ${
                activeTab === "" 
                  ? `border-b-2 border-${darkMode ? 'blue-400' : 'blue-600'} text-${darkMode ? 'blue-400' : 'blue-600'}`
                  : `text-${darkMode ? 'gray-400' : 'gray-500'} hover:text-${darkMode ? 'gray-200' : 'gray-700'}`
              }`}
              onClick={() => setShowCustomizePanel(!showCustomizePanel)} 
            >
              Customize
            </button>
          </div>
        </>
      )}
      
      {/* Customize Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-${darkMode ? 'gray-800' : 'white'} shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${showCustomizePanel ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Chart Customization</h2>
            <button 
              onClick={() => setShowCustomizePanel(false)}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto">
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Display Options</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={chartSettings.showLegend}
                    onChange={(e) => handleSettingChange('showLegend', e.target.checked)}
                    className="rounded"
                  />
                  <span>Show Legend</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={chartSettings.showGrid}
                    onChange={(e) => handleSettingChange('showGrid', e.target.checked)}
                    className="rounded"
                  />
                  <span>Show Grid</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={chartSettings.showDataLabels}
                    onChange={(e) => handleSettingChange('showDataLabels', e.target.checked)}
                    className="rounded"
                  />
                  <span>Show Data Labels</span>
                </label>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Color Palette</h3>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTES.map((palette, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorPaletteChange(index)}
                    className={`p-2 rounded border ${chartSettings.colorPalette === index ? 'border-blue-500' : darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                    title={palette.name}
                  >
                    <div className="flex h-4">
                      {palette.colors.map((color, i) => (
                        <div key={i} className="w-4 h-full" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* <div className="mb-6">
              <h3 className="font-semibold mb-2">Date Range</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm mb-1">Start Date</label>
                  <input
                    type="date"
                    className={`w-full p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    onChange={(e) => handleSettingChange('dateRange', {
                      ...chartSettings.dateRange,
                      start: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">End Date</label>
                  <input
                    type="date"
                    className={`w-full p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    onChange={(e) => handleSettingChange('dateRange', {
                      ...chartSettings.dateRange,
                      end: e.target.value
                    })}
                  />
                </div>
              </div>
            </div> */}
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowCustomizePanel(false)}
              className={`w-full py-2 px-4 rounded font-medium ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
      
      {/* Dashboard Tab */}
      {(activeTab === "dashboard" || isFullScreen) && (
        <>
          {!isFullScreen && (
            <div className="relative mb-6">
              <select
                value={graphType}
                onChange={(e) => setGraphType(e.target.value)}
                className={`w-full md:w-64 p-3 pr-10 rounded appearance-none border-b-2 border-blue-500 focus:outline-none focus:border-pink-500 transition-colors ${
                  darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                <option value="line">Line Chart</option>
                <option value="area">Area Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="scatter">Scatter Chart</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}

          <div className={`grid ${isFullScreen ? '' : 'grid-cols-1 lg:grid-cols-3'} gap-6`}>
            <div className={`${isFullScreen ? 'w-full h-screen' : 'lg:col-span-2'} rounded-lg shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} transition-all duration-300`}>
              {loading.chart ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg className="animate-spin h-12 w-12 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4">loading chart data...</p>
                  </div>
                </div>
              ) : error.chart ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="mt-2">{error.chart}</p>
                    <button 
                      onClick={fetchChartData}
                      className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : (
                <EnhancedGraphRender 
                  data={chartData} 
                  graphType={graphType} 
                  darkMode={darkMode} 
                  isFullScreen={isFullScreen}
                  setIsFullScreen={setIsFullScreen}
                  chartSettings={chartSettings}
                />
              )}
            </div>
            
            {!isFullScreen && (
              <div className="lg:col-span-1">
                <AIInsightsPanel 
                  data={chartData} 
                  graphType={graphType} 
                  darkMode={darkMode} 
                  loading={loading.chart}
                  error={error.chart}
                />
              </div>
            )}
          </div>
        </>
      )}
      
     

{/* History Tab */}
{/* {activeTab === "history" && !isFullScreen && (
  <div className={`rounded-lg shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold">Query History</h2>
      <button 
        onClick={() => clearQueryHistory()}
        className={`px-4 py-2 ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white rounded-md flex items-center`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Clear History
      </button>
    </div>

    {loading.history ? (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4">Loading query history...</p>
        </div>
      </div>
    ) : error.history ? (
      <div className="flex items-center justify-center h-64">
        <div className="text-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="mt-2">{error.history}</p>
          <button 
            onClick={fetchQueryHistory}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    ) : (
      <div>
        {historyData.length === 0 ? (
          <div className="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 text-gray-500">No query history available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {historyData.map((query, index) => (
              <div key={index} className={`border-l-4 border-blue-500 pl-4 py-2 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-semibold text-${darkMode ? 'gray-200' : 'gray-800'}`}>
                    {new Date(query.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <pre className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-3 rounded text-sm overflow-x-auto`}>
                  {query.query}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>
)} */}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, darkMode }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`p-3 rounded shadow-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-300 text-gray-800'
      }`}>
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const EnhancedGraphRender = ({ data, graphType, darkMode, isFullScreen, setIsFullScreen, chartSettings }) => {
  // Check if data is valid and determine possible graph types
  const [error, setError] = React.useState(null);
  const [possibleGraphTypes, setPossibleGraphTypes] = React.useState([]);
  
  // Transform data to match expected format based on graphType
  const transformedData = React.useMemo(() => {
    if (!data || data.length === 0) {
      setError("No data available");
      return [];
    }
    
    try {
      // Determine structure of data
      const firstItem = data[0];
      const keys = Object.keys(firstItem);
      
      // Determine which fields can be used as categories and values
      const categoryKeys = keys.filter(k => 
        typeof firstItem[k] === 'string' || 
        firstItem[k] instanceof Date
      );
      
      const valueKeys = keys.filter(k => 
        !isNaN(parseFloat(firstItem[k])) && 
        isFinite(firstItem[k])
      );
      
      // Determine possible graph types based on data structure
      const possible = [];
      if (categoryKeys.length >= 1 && valueKeys.length >= 1) {
        possible.push("bar", "line", "area", "pie");
      }
      if (valueKeys.length >= 2) {
        possible.push("scatter");
      }
      
      setPossibleGraphTypes(possible);
      
      if (!possible.includes(graphType)) {
        setError(`The selected graph type "${graphType}" is not compatible with this data structure`);
      } else {
        setError(null);
      }
      
      // Get the first categorical and numerical keys for default mapping
      const categoryKey = categoryKeys[0] || "name";
      const valueKey = valueKeys[0] || "value";
      
      // Transform the data based on the structure
      if (graphType === "scatter") {
        // For scatter charts, we need at least two numerical values
        const xKey = valueKeys[0] || "x";
        const yKey = valueKeys[1] || valueKeys[0] || "y";
        
        return data.map((item, index) => ({
          name: item[categoryKey] || `Point ${index + 1}`,
          x: parseFloat(item[xKey] || 0),
          y: parseFloat(item[yKey] || 0),
          z: parseFloat(item[valueKeys[2] || valueKeys[0] || "z"] || 50),
          series: item.series || "current"
        }));
      } else {
        // For other chart types
        return data.map((item) => ({
          name: item[categoryKey] || "Unnamed",
          value: parseFloat(item[valueKey] || 0),
          // Include all numerical values for flexibility
          ...valueKeys.reduce((acc, key) => {
            acc[key] = parseFloat(item[key] || 0);
            return acc;
          }, {})
        }));
      }
    } catch (err) {
      console.error("Error transforming data:", err);
      setError("Could not process data for visualization");
      return [];
    }
  }, [data, graphType]);

  const gridColor = darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const textColor = darkMode ? "#fff" : "#333";
  
  // Handle undefined chartSettings gracefully
  const colorPalette = chartSettings?.colorPalette || 'default';
  const currentPalette = (COLOR_PALETTES[colorPalette]?.colors) || 
    ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Determine which numerical fields to display based on the data
  const getDataKeys = () => {
    if (!data || data.length === 0) return [];
    
    const firstItem = data[0];
    return Object.keys(firstItem).filter(key => 
      !isNaN(parseFloat(firstItem[key])) && 
      isFinite(firstItem[key])
    );
  };
  
  const dataKeys = getDataKeys();
  
  // Render data labels for charts that support them
  const renderDataLabels = (dataKey) => {
    if (!chartSettings?.showDataLabels) return null;
    
    return (
      <LabelList 
        dataKey={dataKey} 
        position="top" 
        fill={textColor} 
        fontSize={12}
        formatter={(value) => value?.toFixed(0)}
      />
    );
  };

  if (error) {
    return (
      <div className="p-4 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Data Visualization</h2>
        </div>
        <div className={`${isFullScreen ? 'h-[calc(100vh-8rem)]' : 'h-80'} w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg`}>
          <div className="text-center p-4">
            <p className="text-red-500 font-bold mb-2">{error}</p>
            {possibleGraphTypes.length > 0 && (
              <p>Try one of these compatible chart types: {possibleGraphTypes.join(', ')}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Data Visualization</h2>
        <button 
          onClick={toggleFullScreen}
          className={`text-${darkMode ? 'white' : 'gray-800'} hover:text-${darkMode ? 'blue-300' : 'blue-600'} transition-colors p-2 rounded-full hover:bg-${darkMode ? 'gray-700' : 'gray-200'}`}
          aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
        >
          {isFullScreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          )}
        </button>
      </div>
      
      <div className={`${isFullScreen ? 'h-[calc(100vh-8rem)]' : 'h-80'} w-full transition-all duration-300`}>
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {graphType === "line" && (
              <LineChart data={transformedData}>
                {chartSettings?.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
                <XAxis dataKey="name" stroke={textColor} tick={{ fill: textColor }} />
                <YAxis stroke={darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"} tick={{ fill: textColor }} />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                {chartSettings?.showLegend && <Legend wrapperStyle={{ color: textColor }} />}
                {dataKeys.slice(0, 3).map((key, index) => (
                  <Line 
                    key={key}
                    type="monotone" 
                    dataKey={key} 
                    name={key} 
                    stroke={currentPalette[index % currentPalette.length]} 
                    strokeWidth={3} 
                    dot={{ r: 6, strokeWidth: 2, fill: darkMode ? "#2d3748" : "#fff" }}
                    activeDot={{ r: 8, stroke: currentPalette[index % currentPalette.length], strokeWidth: 2, fill: darkMode ? "#2d3748" : "#fff" }}
                  >
                    {renderDataLabels(key)}
                  </Line>
                ))}
              </LineChart>
            )}
            {graphType === "area" && (
              <AreaChart data={transformedData}>
                {chartSettings?.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
                <XAxis dataKey="name" stroke={textColor} tick={{ fill: textColor }} />
                <YAxis stroke={darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"} tick={{ fill: textColor }} />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                {chartSettings?.showLegend && <Legend wrapperStyle={{ color: textColor }} />}
                {dataKeys.slice(0, 3).map((key, index) => (
                  <Area 
                    key={key}
                    type="monotone" 
                    dataKey={key} 
                    name={key} 
                    stroke={currentPalette[index % currentPalette.length]} 
                    fill={`${currentPalette[index % currentPalette.length]}80`}
                    activeDot={{ r: 8, stroke: currentPalette[index % currentPalette.length], strokeWidth: 2, fill: darkMode ? "#2d3748" : "#fff" }}
                  >
                    {renderDataLabels(key)}
                  </Area>
                ))}
              </AreaChart>
            )}
            {graphType === "bar" && (
              <BarChart data={transformedData}>
                {chartSettings?.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
                <XAxis dataKey="name" stroke={textColor} tick={{ fill: textColor }} />
                <YAxis stroke={darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"} tick={{ fill: textColor }} />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                {chartSettings?.showLegend && <Legend wrapperStyle={{ color: textColor }} />}
                {dataKeys.slice(0, 3).map((key, index) => (
                  <Bar 
                    key={key}
                    dataKey={key} 
                    name={key} 
                    fill={currentPalette[index % currentPalette.length]} 
                    radius={[4, 4, 0, 0]}
                  >
                    {renderDataLabels(key)}
                  </Bar>
                ))}
              </BarChart>
            )}
            {graphType === "scatter" && (
              <ScatterChart>
                {chartSettings?.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
                <XAxis 
                  dataKey="x" 
                  name="X" 
                  stroke={textColor} 
                  tick={{ fill: textColor }} 
                />
                <YAxis 
                  dataKey="y" 
                  name="Y" 
                  stroke={darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"} 
                  tick={{ fill: textColor }} 
                />
                <ZAxis 
                  dataKey="z" 
                  range={[60, 300]} 
                  name="Size" 
                />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                {chartSettings?.showLegend && <Legend wrapperStyle={{ color: textColor }} />}
                {["current", "comparison"].map((series, index) => {
                  const seriesData = transformedData.filter(item => item.series === series);
                  if (seriesData.length === 0) return null;
                  
                  return (
                    <Scatter 
                      key={series}
                      name={series.charAt(0).toUpperCase() + series.slice(1)} 
                      data={seriesData}
                      fill={currentPalette[index % currentPalette.length]} 
                      shape="circle"
                      stroke={currentPalette[index % currentPalette.length]}
                      strokeWidth={2}
                      fillOpacity={0.8}
                    >
                      {chartSettings?.showDataLabels && seriesData.map((entry, idx) => (
                        <LabelList 
                          key={`label-${idx}`} 
                          dataKey="name" 
                          position="top" 
                          style={{ fill: textColor }} 
                        />
                      ))}
                    </Scatter>
                  );
                })}
              </ScatterChart>
            )}
            {graphType === "pie" && (
              <PieChart>
                <Pie
                  data={transformedData}
                  cx="50%"
                  cy="50%"
                  labelLine={chartSettings?.showDataLabels}
                  outerRadius={isFullScreen ? 180 : 100}
                  innerRadius={isFullScreen ? 120 : 60}
                  paddingAngle={5}
                  dataKey={dataKeys[0] || "value"}
                  nameKey="name"
                  label={({ name, percent }) => chartSettings?.showDataLabels ? `${name}: ${(percent * 100).toFixed(0)}%` : null}
                >
                  {transformedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={currentPalette[index % currentPalette.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                {chartSettings?.showLegend && <Legend wrapperStyle={{ color: textColor }} />}
              </PieChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500">No data available to display</p>
          </div>
        )}
      </div>
      
      {isFullScreen && (
        <div className="absolute bottom-4 right-4">
          <button 
            onClick={toggleFullScreen}
            className={`bg-${darkMode ? 'gray-700' : 'gray-300'} hover:bg-${darkMode ? 'gray-600' : 'gray-400'} text-${darkMode ? 'white' : 'gray-800'} p-2 rounded-full shadow-lg transition-colors`}
            aria-label="Exit full screen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

const AIInsightsPanel = ({ data, graphType, darkMode }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [industryHistory, setIndustryHistory] = useState([]);
  const [goalsHistory, setGoalsHistory] = useState([]);
  const [challengesHistory, setChallengesHistory] = useState([]);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showGoalsDropdown, setShowGoalsDropdown] = useState(false);
  const [showChallengesDropdown, setShowChallengesDropdown] = useState(false);
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [businessInfo, setBusinessInfo] = useState({
    industry: '',
    stage: 'startup',
    revenue: '',
    employees: '',
    goals: '',
    challenges: ''
  });

  // Process data for insights
  useEffect(() => {
    if (!data || data.length === 0) {
      setInsights([]);
      setLoading(false);
      return;
    }
  }, [data, graphType]);

  useEffect(() => {
    try {
      // Load history from localStorage
      const storedIndustryHistory = localStorage.getItem('industryHistory');
      const storedGoalsHistory = localStorage.getItem('goalsHistory');
      const storedChallengesHistory = localStorage.getItem('challengesHistory');
      
      // Parse and set history (if exists)
      if (storedIndustryHistory) {
        setIndustryHistory(JSON.parse(storedIndustryHistory));
      }
      
      if (storedGoalsHistory) {
        setGoalsHistory(JSON.parse(storedGoalsHistory));
      }
      
      if (storedChallengesHistory) {
        setChallengesHistory(JSON.parse(storedChallengesHistory));
      }
    } catch (error) {
      console.error("Error loading history from localStorage:", error);
    }
  }, []);
  
  const saveInputToHistory = (type, value) => {
    if (!value.trim()) return; // Don't save empty values
    
    try {
      switch (type) {
        case 'industry':
          // Add to industry history if not already there
          if (!industryHistory.includes(value)) {
            const updatedIndustryHistory = [value, ...industryHistory].slice(0, 5); // Keep only latest 5
            setIndustryHistory(updatedIndustryHistory);
            localStorage.setItem('industryHistory', JSON.stringify(updatedIndustryHistory));
          }
          break;
          
        case 'goals':
          // Add to goals history if not already there
          if (!goalsHistory.includes(value)) {
            const updatedGoalsHistory = [value, ...goalsHistory].slice(0, 5); // Keep only latest 5
            setGoalsHistory(updatedGoalsHistory);
            localStorage.setItem('goalsHistory', JSON.stringify(updatedGoalsHistory));
          }
          break;
          
        case 'challenges':
          // Add to challenges history if not already there
          if (!challengesHistory.includes(value)) {
            const updatedChallengesHistory = [value, ...challengesHistory].slice(0, 5); // Keep only latest 5
            setChallengesHistory(updatedChallengesHistory);
            localStorage.setItem('challengesHistory', JSON.stringify(updatedChallengesHistory));
          }
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error(`Error saving ${type} to history:`, error);
    }
  };
  

  // Handle onboarding input changes
  const handleInputChange = (field, value) => {
    setBusinessInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Modified function to handle dropdown item selection
  const handleHistoryItemClick = (field, value) => {
    // Update the input field
    handleInputChange(field, value);
    
    // Close the dropdown
    switch (field) {
      case 'industry':
        setShowIndustryDropdown(false);
        break;
      case 'goals':
        setShowGoalsDropdown(false);
        break;
      case 'challenges':
        setShowChallengesDropdown(false);
        break;
      default:
        break;
    }
  };

  // Generate AI insights using Gemini API with business context
  const generateInsights = async (data, chartType, businessContext) => {
    try {
      const dataContext = JSON.stringify(data.slice(0, 10));
      console.log(dataContext)
  
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Based on this chart data: ${dataContext} 
                  
                  Business Context:
                  Industry: ${businessContext.industry}
                  Business Stage: ${businessContext.stage}
                  Current Revenue: ${businessContext.revenue}
                  Number of Employees: ${businessContext.employees}
                  Business Goals: ${businessContext.goals}
                  Current Challenges: ${businessContext.challenges}
                  
                  The chart type is ${chartType}.
                  
                  First, provide a brief explanation of what the chart is showing.
                  
                  Then, generate 3-4 business insights and recommendations based on the data and business context.
                  
                  Finally, create a 6-month strategic roadmap with specific actionable steps for each month.
                  
                  Format the response as JSON with this structure:
                  {
                    "chartExplanation": "Brief explanation of what the chart is showing and key patterns",
                    "insights": [
                      {
                        "title": "Insight title",
                        "description": "Detailed insight and recommendation",
                        "type": "trend|anomaly|opportunity|risk"
                      }
                    ],
                    "roadmap": {
                      "month1": {
                        "title": "Month 1: [Focus Area]",
                        "actions": ["Action 1", "Action 2", "Action 3"]
                      },
                      "month2": {
                        "title": "Month 2: [Focus Area]",
                        "actions": ["Action 1", "Action 2", "Action 3"]
                      },
                      "month3": {
                        "title": "Month 3: [Focus Area]",
                        "actions": ["Action 1", "Action 2", "Action 3"]
                      },
                      "month4": {
                        "title": "Month 4: [Focus Area]",
                        "actions": ["Action 1", "Action 2", "Action 3"]
                      },
                      "month5": {
                        "title": "Month 5: [Focus Area]",
                        "actions": ["Action 1", "Action 2", "Action 3"]
                      },
                      "month6": {
                        "title": "Month 6: [Focus Area]",
                        "actions": ["Action 1", "Action 2", "Action 3"]
                      }
                    }
                  }`
                }
              ]
            }
          ]
        }
      );
  
      const generatedText = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
  
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        chartExplanation: "Unable to analyze the chart data.",
        insights: [],
        roadmap: {}
      };
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw error;
    }
  };

  // Process AI response and update states
  const processAIResponse = (response) => {
    if (response) {
      // Set chart explanation
      setExplanation(response.chartExplanation || "");
      
      // Set insights
      setInsights(response.insights || []);
      
      // Convert insights to bullet-point suggestions
      const suggestionsText = (response.insights || []).map(insight => 
        `• ${insight.title}: ${insight.description}`
      ).join('\n\n');
      
      setSuggestions(suggestionsText);
      
      // Set roadmap
      setRoadmap(response.roadmap || null);
    }
  };

  // Function to fetch insights with business context
  const fetchAIInsights = () => {
    setLoading(true);
    setError(null);
    
    generateInsights(data, graphType, businessInfo)
      .then(response => {
        processAIResponse(response);
        setShowOnboarding(false); // Close onboarding after processing
        setLoading(false);
      })
      .catch(err => {
        console.error("Error generating insights:", err);
        setError("Failed to generate AI insights. Please try again later.");
        setLoading(false);
      });
  };

  // Start onboarding
  const startOnboarding = () => {
    setShowOnboarding(true);
    setOnboardingStep(0);
  };

  // Handle onboarding completion
  const completeOnboarding = () => {
    // Save current inputs to history
    if (businessInfo.industry) saveInputToHistory('industry', businessInfo.industry);
    if (businessInfo.goals) saveInputToHistory('goals', businessInfo.goals);
    if (businessInfo.challenges) saveInputToHistory('challenges', businessInfo.challenges);
    
    // Continue with existing functionality
    fetchAIInsights();
  };

  // Handle text-to-speech for insights
  const speakInsight = (insight, index) => {
    // Stop any current speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    if (isSpeaking && currentInsightIndex === index) {
      // Toggle off if already speaking this insight
      setIsSpeaking(false);
      setCurrentInsightIndex(null);
      window.speechSynthesis.cancel();
    } else {
      // Speak the new insight
      const textToSpeak = `${insight.title}. ${insight.description}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Configure speech settings
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Get available voices and try to select a good one
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Female') || 
        voice.name.includes('US English')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Set speaking state
      setIsSpeaking(true);
      setCurrentInsightIndex(index);
      
      // Handle speech end
      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentInsightIndex(null);
      };
      
      // Start speaking
      window.speechSynthesis.speak(utterance);
    }
  };

  // Get icon for insight type
  const getInsightIcon = (type) => {
    switch (type) {
      case 'trend':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'anomaly':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'opportunity':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'risk':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  // Get color for insight type
  const getInsightColor = (type) => {
    switch (type) {
      case 'trend':
        return darkMode ? 'blue-500' : 'blue-600';
      case 'anomaly':
        return darkMode ? 'yellow-400' : 'yellow-500';
      case 'opportunity':
        return darkMode ? 'green-400' : 'green-500';
      case 'risk':
        return darkMode ? 'red-400' : 'red-500';
      case 'error':
        return darkMode ? 'red-400' : 'red-500';
      default:
        return darkMode ? 'purple-400' : 'purple-500';
    }
  };
  
  // Modified input with history component that properly handles dropdown selection
  const renderInputWithHistory = (field, value, placeholder, historyItems, showDropdown, setShowDropdown) => {
    return (
      <div className="relative">
        <input
          type="text"
          className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          onFocus={() => setShowDropdown(true)}
        />
        
        {/* History dropdown - removed onBlur event that was causing the issue */}
        {showDropdown && historyItems.length > 0 && (
          <div className={`absolute z-10 mt-1 w-full border rounded shadow-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
            {historyItems.map((item, index) => (
              <div
                key={index}
                className={`p-2 cursor-pointer ${darkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-gray-100 text-gray-800'}`}
                // Use mousedown instead of click to ensure it fires before blur
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent focus loss
                  handleHistoryItemClick(field, item);
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Onboarding form components based on current step
  const renderOnboardingStep = () => {
    switch (onboardingStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About Your Business</h3>
            <div>
              <label className={`block mb-1 font-medium text-${darkMode ? 'gray-300' : 'gray-700'}`}>
                Industry
              </label>
              {renderInputWithHistory(
                'industry',
                businessInfo.industry,
                "e.g. SaaS, E-commerce, Health Tech",
                industryHistory,
                showIndustryDropdown,
                setShowIndustryDropdown
              )}
            </div>
            <div>
              <label className={`block mb-1 font-medium text-${darkMode ? 'gray-300' : 'gray-700'}`}>
                Business Stage
              </label>
              <select
                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                value={businessInfo.stage}
                onChange={(e) => handleInputChange('stage', e.target.value)}
              >
                <option value="startup">Startup</option>
                <option value="growth">Growth</option>
                <option value="established">Established</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setOnboardingStep(1)}
                className={`px-4 py-2 bg-${darkMode ? 'blue-600' : 'blue-500'} hover:bg-${darkMode ? 'blue-700' : 'blue-600'} text-white rounded`}
              >
                Next
              </button>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Business Details</h3>
            <div>
              <label className={`block mb-1 font-medium text-${darkMode ? 'gray-300' : 'gray-700'}`}>
                Current Revenue
              </label>
              <input
                type="text"
                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="e.g. $100K annually, $10K monthly"
                value={businessInfo.revenue}
                onChange={(e) => handleInputChange('revenue', e.target.value)}
              />
            </div>
            <div>
              <label className={`block mb-1 font-medium text-${darkMode ? 'gray-300' : 'gray-700'}`}>
                Number of Employees
              </label>
              <input
                type="text"
                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="e.g. 5, 20-50, 100+"
                value={businessInfo.employees}
                onChange={(e) => handleInputChange('employees', e.target.value)}
              />
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setOnboardingStep(0)}
                className={`px-4 py-2 bg-${darkMode ? 'gray-600' : 'gray-300'} hover:bg-${darkMode ? 'gray-700' : 'gray-400'} text-${darkMode ? 'white' : 'gray-800'} rounded`}
              >
                Back
              </button>
              <button
                onClick={() => setOnboardingStep(2)}
                className={`px-4 py-2 bg-${darkMode ? 'blue-600' : 'blue-500'} hover:bg-${darkMode ? 'blue-700' : 'blue-600'} text-white rounded`}
              >
                Next
              </button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Business Goals & Challenges</h3>
            <div>
              <label className={`block mb-1 font-medium text-${darkMode ? 'gray-300' : 'gray-700'}`}>
                Business Goals
              </label>
              {/* Modified textarea with history implementation */}
              <div className="relative">
                <textarea
                  className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="e.g. Increase customer retention, Expand to new markets"
                  rows={3}
                  value={businessInfo.goals}
                  onChange={(e) => handleInputChange('goals', e.target.value)}
                  onFocus={() => setShowGoalsDropdown(true)}
                />
                
                {/* History dropdown for goals - modified to use mousedown */}
                {showGoalsDropdown && goalsHistory.length > 0 && (
                  <div className={`absolute z-10 mt-1 w-full border rounded shadow-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                    {goalsHistory.map((item, index) => (
                      <div
                        key={index}
                        className={`p-2 cursor-pointer ${darkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-gray-100 text-gray-800'}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleHistoryItemClick('goals', item);
                        }}
                      >
                        {item.length > 50 ? item.substring(0, 50) + '...' : item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className={`block mb-1 font-medium text-${darkMode ? 'gray-300' : 'gray-700'}`}>
                Current Challenges
              </label>
              {/* Modified textarea with history implementation */}
              <div className="relative">
                <textarea
                  className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="e.g. High customer acquisition cost, Seasonal sales fluctuations"
                  rows={3}
                  value={businessInfo.challenges}
                  onChange={(e) => handleInputChange('challenges', e.target.value)}
                  onFocus={() => setShowChallengesDropdown(true)}
                />
                
                {/* History dropdown for challenges - modified to use mousedown */}
                {showChallengesDropdown && challengesHistory.length > 0 && (
                  <div className={`absolute z-10 mt-1 w-full border rounded shadow-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                    {challengesHistory.map((item, index) => (
                      <div
                        key={index}
                        className={`p-2 cursor-pointer ${darkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-gray-100 text-gray-800'}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleHistoryItemClick('challenges', item);
                        }}
                      >
                        {item.length > 50 ? item.substring(0, 50) + '...' : item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setOnboardingStep(1)}
                className={`px-4 py-2 bg-${darkMode ? 'gray-600' : 'gray-300'} hover:bg-${darkMode ? 'gray-700' : 'gray-400'} text-${darkMode ? 'white' : 'gray-800'} rounded`}
              >
                Back
              </button>
              <button
                onClick={completeOnboarding}
                className={`px-4 py-2 bg-${darkMode ? 'green-600' : 'green-500'} hover:bg-${darkMode ? 'green-700' : 'green-600'} text-white rounded`}
              >
                Generate Insights & Roadmap
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  }
  
  // Render business roadmap
  const renderRoadmap = () => {
    if (!roadmap) return null;
    
    const months = ['month1', 'month2', 'month3', 'month4', 'month5', 'month6'];
    
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Your 6-Month Strategic Roadmap</h3>
        <div className="space-y-6">
          {months.map((month, index) => {
            if (!roadmap[month]) return null;
            
            return (
              <div 
                key={month} 
                className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}
              >
                <h4 className={`font-medium text-${darkMode ? 'blue-400' : 'blue-600'} mb-2`}>
                  {roadmap[month].title}
                </h4>
                <ul className="list-disc pl-5 space-y-1">
                  {roadmap[month].actions.map((action, actionIndex) => (
                    <li key={actionIndex} className={`text-${darkMode ? 'gray-300' : 'gray-700'}`}>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`rounded-lg shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-all duration-300 h-full flex flex-col`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-bold">AI Business Insights</h2>
        <div className="flex items-center">
          <button 
            onClick={() => {
              // Only if there are insights to speak
              if (insights.length > 0) {
                speakInsight(insights[0], 0);
              }
            }}
            className={`p-2 rounded-full mr-2 ${
              isSpeaking 
                ? `bg-red-500 hover:bg-red-600 text-white` 
                : `bg-${darkMode ? 'gray-700' : 'gray-200'} hover:bg-${darkMode ? 'gray-600' : 'gray-300'} text-${darkMode ? 'white' : 'gray-800'}`
            }`}
            aria-label={isSpeaking ? "Stop speaking" : "Read insights aloud"}
            title={isSpeaking ? "Stop speaking" : "Read insights aloud"}
            disabled={loading || error || !explanation}
          >
            {isSpeaking ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5h14M5 19h14" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
          <button 
            onClick={startOnboarding}
            className={`p-2 rounded-full ${
              loading
                ? `bg-gray-500 cursor-not-allowed` 
                : `bg-${darkMode ? 'blue-600' : 'blue-500'} hover:bg-${darkMode ? 'blue-700' : 'blue-600'}`
            } text-white`}
            disabled={loading}
            aria-label="Generate insights"
            title="Generate insights"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-4 flex-grow overflow-y-auto">
        {showOnboarding ? (
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-750' : 'bg-white'}`}>
            {renderOnboardingStep()}
          </div>
        ) : error ? (
          <div className={`flex flex-col items-center justify-center h-full text-${darkMode ? 'red-400' : 'red-600'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-center">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <div className="animate-pulse flex flex-col items-center">
              <div className={`h-4 bg-${darkMode ? 'gray-700' : 'gray-300'} rounded w-3/4 mb-4`}></div>
              <div className={`h-4 bg-${darkMode ? 'gray-700' : 'gray-300'} rounded w-2/3 mb-4`}></div>
              <div className={`h-4 bg-${darkMode ? 'gray-700' : 'gray-300'} rounded w-1/2 mb-8`}></div>
              
              <div className={`h-4 bg-${darkMode ? 'gray-700' : 'gray-300'} rounded w-full mb-2`}></div>
              <div className={`h-4 bg-${darkMode ? 'gray-700' : 'gray-300'} rounded w-full mb-2`}></div>
              <div className={`h-4 bg-${darkMode ? 'gray-700' : 'gray-300'} rounded w-3/4`}></div>
            </div>
          </div>
        ) : (!explanation && !suggestions) ? (
          <div className={`flex flex-col items-center justify-center h-full text-${darkMode ? 'gray-400' : 'gray-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-center">Generate AI insights and a strategic roadmap for your business</p>
            <button 
              onClick={startOnboarding}
              className={`mt-4 px-4 py-2 bg-${darkMode ? 'blue-600' : 'blue-500'} hover:bg-${darkMode ? 'blue-700' : 'blue-600'} text-white rounded`}
            >
              Get Started
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-2">Chart Analysis</h3>
              <p className={`text-${darkMode ? 'gray-300' : 'gray-700'}`}>{explanation}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-2">Business Insights & Recommendations</h3>
              <div className={`text-${darkMode ? 'gray-300' : 'gray-700'} whitespace-pre-line`}>
                {suggestions.split('\n').map((line, index) => (
                  <p key={index} className={line.trim().startsWith('•') ? 'ml-4 mb-3' : ''}>{line}</p>
                ))}
              </div>
            </div>
            
            {renderRoadmap()}
          </>
        )}
      </div>
    </div>
  );
};
export default Graphrender;