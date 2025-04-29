import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as d3 from "d3";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, LabelList } from "recharts";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Enhanced sample data with comparison values
const sampleData = [
  { name: "Jan", value: 120, comparison: 100 },
  { name: "Feb", value: 150, comparison: 130 },
  { name: "Mar", value: 90, comparison: 120 },
  { name: "Apr", value: 180, comparison: 150 },
  { name: "May", value: 220, comparison: 180 },
  { name: "Jun", value: 170, comparison: 190 }
];

// Sample data for query history
const initialHistoryData = [
  { 
    id: 1, 
    query: "SELECT * FROM users WHERE age > 25", 
    executionTime: 230, 
    timestamp: "2025-04-01T09:30:00", 
    userName: "Sarah Chen" 
  },
  { 
    id: 2, 
    query: "UPDATE products SET price = price * 1.05 WHERE category = 'electronics'", 
    executionTime: 150, 
    timestamp: "2025-04-01T11:45:00", 
    userName: "James Wilson" 
  },
  { 
    id: 3, 
    query: "SELECT COUNT(*) FROM orders GROUP BY status", 
    executionTime: 320, 
    timestamp: "2025-04-01T14:20:00", 
    userName: "Sarah Chen" 
  },
  { 
    id: 4, 
    query: "SELECT customer_id, SUM(total) FROM invoices GROUP BY customer_id", 
    executionTime: 450, 
    timestamp: "2025-04-02T10:15:00", 
    userName: "Maria Rodriguez" 
  },
  { 
    id: 5, 
    query: "DELETE FROM temp_logs WHERE created_at < '2025-03-15'", 
    executionTime: 180, 
    timestamp: "2025-04-02T13:30:00", 
    userName: "James Wilson" 
  },
  { 
    id: 6, 
    query: "SELECT AVG(salary) FROM employees GROUP BY department", 
    executionTime: 275, 
    timestamp: "2025-04-03T09:10:00", 
    userName: "Sarah Chen" 
  },
];

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

const render = () => {
  const [graphType, setGraphType] = useState("line");
  const [darkMode, setDarkMode] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [historyData, setHistoryData] = useState(initialHistoryData);
  const [historyFilter, setHistoryFilter] = useState("all");
  const [showCustomizePanel, setShowCustomizePanel] = useState(false);
  const [chartSettings, setChartSettings] = useState({
    showLegend: true,
    showGrid: true,
    showDataLabels: false,
    colorPalette: 0,
    dateRange: {
      start: null,
      end: null
    }
  });

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

  // Filter data based on date range if applicable
  const filteredData = () => {
    if (!chartSettings.dateRange.start || !chartSettings.dateRange.end) {
      return sampleData;
    }
    
    // This is just a placeholder - you would need to implement actual date filtering
    // based on your data structure if your data has date fields
    return sampleData;
  };

  // Group queries by day for history view
  const groupedByDay = historyData.reduce((acc, item) => {
    const date = new Date(item.timestamp).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

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

  // Get unique user names for filter
  const userNames = [...new Set(historyData.map(item => item.userName))];

  // Filter history data based on selected user
  const filteredHistoryData = historyFilter === "all" 
    ? historyData 
    : historyData.filter(item => item.userName === historyFilter);
  
  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} transition-all duration-300 min-h-screen`}>
      {!isFullScreen && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Advanced Data Visualization Dashboard</h1>
            <div className="flex gap-2">
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                className={`px-4 py-2 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Toggle {darkMode ? 'Light' : 'Dark'} Mode
              </button>
              <button 
                onClick={() => setShowCustomizePanel(!showCustomizePanel)} 
                className={`px-4 py-2 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              >
                Customize
              </button>
            </div>
          </div>
          
          {/* Tabs Navigation */}
          <div className="flex border-b mb-6">
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
            <button 
              className={`py-2 px-4 font-medium transition-colors ${
                activeTab === "history" 
                  ? `border-b-2 border-${darkMode ? 'blue-400' : 'blue-600'} text-${darkMode ? 'blue-400' : 'blue-600'}`
                  : `text-${darkMode ? 'gray-400' : 'gray-500'} hover:text-${darkMode ? 'gray-200' : 'gray-700'}`
              }`}
              onClick={() => setActiveTab("history")}
            >
              Query History
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
            
            <div className="mb-6">
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
            </div>
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
              <EnhancedGraphRender 
                data={filteredData()} 
                graphType={graphType} 
                darkMode={darkMode} 
                isFullScreen={isFullScreen}
                setIsFullScreen={setIsFullScreen}
                chartSettings={chartSettings}
              />
            </div>
            
            {!isFullScreen && (
              <div className="lg:col-span-1">
                <AIInsightsPanel data={filteredData()} graphType={graphType} darkMode={darkMode} />
              </div>
            )}
          </div>
        </>
      )}
      
      {/* History Tab */}
      {activeTab === "history" && !isFullScreen && (
        <div className={`rounded-lg shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Query History</h2>
            <div className="flex items-center">
              <span className={`mr-2 text-${darkMode ? 'gray-300' : 'gray-700'}`}>Filter by User:</span>
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                className={`p-2 border rounded ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
              >
                <option value="all">All Users</option>
                {userNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Performance Chart */}
          <div className={`mb-8 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`text-lg font-semibold mb-3 text-${darkMode ? 'gray-200' : 'gray-700'}`}>Query Performance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                  <XAxis dataKey="date" stroke={darkMode ? "#fff" : "#333"} tick={{ fill: darkMode ? "#fff" : "#333" }} />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{ fill: darkMode ? "#fff" : "#333" }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{ fill: darkMode ? "#fff" : "#333" }} />
                  <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                  <Legend wrapperStyle={{ color: darkMode ? "#fff" : "#333" }} />
                  <Line yAxisId="left" type="monotone" dataKey="avgExecutionTime" name="Avg. Execution Time (ms)" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line yAxisId="right" type="monotone" dataKey="queryCount" name="Query Count" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* History List */}
          <div>
            {Object.entries(groupedByDay).map(([date, queries]) => {
              const dayQueries = historyFilter === "all" ? queries : queries.filter(q => q.userName === historyFilter);
              if (dayQueries.length === 0) return null;
              
              return (
                <div key={date} className="mb-6">
                  <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded`}>{date}</h3>
                  <div className="space-y-4">
                    {dayQueries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).map(query => (
                      <div key={query.id} className={`border-l-4 border-blue-500 pl-4 py-2 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center">
                            <span className={`font-semibold text-${darkMode ? 'gray-200' : 'gray-800'}`}>
                              {new Date(query.timestamp).toLocaleTimeString()}
                            </span>
                            <span className={`ml-4 ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'} py-1 px-2 rounded text-sm`}>
                              {query.userName}
                            </span>
                          </div>
                          <span className={`text-${darkMode ? 'gray-300' : 'gray-600'}`}>
                            Execution Time: <span className="font-medium">{query.executionTime} ms</span>
                          </span>
                        </div>
                        <pre className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-3 rounded text-sm overflow-x-auto`}>
                          {query.query}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Custom tooltip component for Recharts
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
  // D3 rendering for graphs not available in Recharts
  useEffect(() => {
    if (graphType === "custom") {
      // Clear previous graph
      d3.select("#d3-graph-container").select("svg").remove();
      // Render custom D3 visualization here if needed
    }
  }, [graphType, data, darkMode]);

  const gridColor = darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const textColor = darkMode ? "#fff" : "#333";
  const currentPalette = COLOR_PALETTES[chartSettings.colorPalette].colors;

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Render data labels for charts that support them
  const renderDataLabels = () => {
    if (!chartSettings.showDataLabels) return null;
    
    if (graphType === "line" || graphType === "area") {
      return (
        <>
          <LabelList 
            dataKey="value" 
            position="top" 
            fill={textColor} 
            fontSize={12}
            formatter={(value) => value.toFixed(0)}
          />
          <LabelList 
            dataKey="comparison" 
            position="top" 
            fill={textColor} 
            fontSize={12}
            formatter={(value) => value.toFixed(0)}
          />
        </>
      );
    } else if (graphType === "bar") {
      return (
        <>
          <LabelList 
            dataKey="value" 
            position="top" 
            fill={textColor} 
            fontSize={12}
            formatter={(value) => value.toFixed(0)}
          />
          <LabelList 
            dataKey="comparison" 
            position="top" 
            fill={textColor} 
            fontSize={12}
            formatter={(value) => value.toFixed(0)}
          />
        </>
      );
    }
    return null;
  };

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
        {graphType !== "custom" ? (
          <ResponsiveContainer width="100%" height="100%">
            {graphType === "line" && (
              <LineChart data={data}>
                {chartSettings.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
                <XAxis dataKey="name" stroke={textColor} tick={{ fill: textColor }} />
                <YAxis stroke={darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"} tick={{ fill: textColor }} />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                {chartSettings.showLegend && <Legend wrapperStyle={{ color: textColor }} />}
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name="Current" 
                  stroke={currentPalette[0]} 
                  strokeWidth={3} 
                  dot={{ r: 6, strokeWidth: 2, fill: darkMode ? "#2d3748" : "#fff" }}
                  activeDot={{ r: 8, stroke: currentPalette[0], strokeWidth: 2, fill: darkMode ? "#2d3748" : "#fff" }}
                >
                  {renderDataLabels()}
                </Line>
                <Line 
                  type="monotone" 
                  dataKey="comparison" 
                  name="Previous" 
                  stroke={currentPalette[1]} 
                  strokeWidth={3} 
                  dot={{ r: 6, strokeWidth: 2, fill: darkMode ? "#2d3748" : "#fff" }}
                  activeDot={{ r: 8, stroke: currentPalette[1], strokeWidth: 2, fill: darkMode ? "#2d3748" : "#fff" }}
                >
                  {renderDataLabels()}
                </Line>
              </LineChart>
            )}
            {graphType === "area" && (
              <AreaChart data={data}>
                {chartSettings.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
                <XAxis dataKey="name" stroke={textColor} tick={{ fill: textColor }} />
                <YAxis stroke={darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"} tick={{ fill: textColor }} />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                {chartSettings.showLegend && <Legend wrapperStyle={{ color: textColor }} />}
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  name="Current" 
                  stroke={currentPalette[0]} 
                  fill={`${currentPalette[0]}80`}
                  activeDot={{ r: 8, stroke: currentPalette[0], strokeWidth: 2, fill: darkMode ? "#2d3748" : "#fff" }}
                >
                  {renderDataLabels()}
                </Area>
                <Area 
                  type="monotone" 
                  dataKey="comparison" 
                  name="Previous" 
                  stroke={currentPalette[1]} 
                  fill={`${currentPalette[1]}80`}
                  activeDot={{ r: 8, stroke: currentPalette[1], strokeWidth: 2, fill: darkMode ? "#2d3748" : "#fff" }}
                >
                  {renderDataLabels()}
                </Area>
              </AreaChart>
            )}
            {graphType === "bar" && (
              <BarChart data={data}>
                {chartSettings.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
                <XAxis dataKey="name" stroke={textColor} tick={{ fill: textColor }} />
                <YAxis stroke={darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"} tick={{ fill: textColor }} />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                {chartSettings.showLegend && <Legend wrapperStyle={{ color: textColor }} />}
                <Bar 
                  dataKey="value" 
                  name="Current" 
                  fill={currentPalette[0]} 
                  radius={[4, 4, 0, 0]}
                >
                  {renderDataLabels()}
                </Bar>
                <Bar 
                  dataKey="comparison" 
                  name="Previous" 
                  fill={currentPalette[1]} 
                  radius={[4, 4, 0, 0]}
                >
                  {renderDataLabels()}
                </Bar>
              </BarChart>
            )}
            {graphType === "pie" && (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={isFullScreen ? 180 : 100}
                  innerRadius={isFullScreen ? 120 : 60}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => chartSettings.showDataLabels ? `${name}: ${(percent * 100).toFixed(0)}%` : null}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={currentPalette[index % currentPalette.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                {chartSettings.showLegend && <Legend wrapperStyle={{ color: textColor }} />}
              </PieChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div id="d3-graph-container" className="h-full w-full flex items-center justify-center">
            <p>Custom D3 Visualization would appear here</p>
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
  const [explanation, setExplanation] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesisRef = useRef(null);
  
  useEffect(() => {
    // Clear previous insights when graph type changes
    setExplanation("");
    setSuggestions("");
    
    // Clean up speech synthesis when component unmounts
    return () => {
      if (speechSynthesisRef.current && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };  
  }, [graphType, data]);

  const fetchAIInsights = async () => {
    setLoading(true);
    try {
      // Create a more detailed prompt with specific expectations
      const prompt = `
        Analyze this dataset: ${JSON.stringify(data)} for the ${graphType} visualization.
        
        Please provide:
        1. EXPLANATION: Give me a short 5-6 lines explanation of the graph
        2. INSIGHTS: 3-5 specific business insights derived from this data
        
        Format your response with clear section headers: "EXPLANATION", "INSIGHTS", and Give the user a road map to improve his performance in the next year.
        Provide a line gap after each section.
      `;
      
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }
      );
  
      // More robust response parsing
      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const aiResponseText = response.data.candidates[0].content.parts[0].text;
        
        // Parse sections more reliably using regex
        const explanationMatch = aiResponseText.match(/EXPLANATION:?([\s\S]*?)(?=INSIGHTS:|RECOMMENDATIONS:|$)/i);
        const insightsMatch = aiResponseText.match(/INSIGHTS:?([\s\S]*?)(?=RECOMMENDATIONS:|$)/i);
        const recommendationsMatch = aiResponseText.match(/RECOMMENDATIONS:?([\s\S]*?)$/i);
        
        setExplanation(explanationMatch ? explanationMatch[1].trim() : "No explanation provided");
        
        // Combine insights and recommendations for the suggestions section
        const insightsText = insightsMatch ? insightsMatch[1].trim() : "";
        const recommendationsText = recommendationsMatch ? recommendationsMatch[1].trim() : "";
        setSuggestions(`${insightsText}\n\n${recommendationsText}`.trim() || "No insights provided");
      } else {
        throw new Error("Unable to extract content from API response");
      }
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      setExplanation("Error generating insights. Please try again.");
      setSuggestions("Check your API key and network connection.");
    }
    setLoading(false);
  };

  const handleVerbalResponse = () => {
    // Stop any existing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const textToRead = `Data Analysis: ${explanation} Insights and Recommendations: ${suggestions}`;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.5;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';
      
      // Store reference to cancel if needed
      speechSynthesisRef.current = utterance;
      
      // Handle speech events
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        console.error('Speech synthesis error');
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech not supported in your browser');
    }
  };
  
  return (
    <div className={`rounded-lg shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-all duration-300 h-full flex flex-col`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-bold">AI Data Insights</h2>
        <div className="flex items-center">
          <button 
            onClick={handleVerbalResponse}
            className={`p-2 rounded-full mr-2 ${
              isSpeaking 
                ? `bg-red-500 hover:bg-red-600 text-white` 
                : `bg-${darkMode ? 'gray-700' : 'gray-200'} hover:bg-${darkMode ? 'gray-600' : 'gray-300'} text-${darkMode ? 'white' : 'gray-800'}`
            }`}
            aria-label={isSpeaking ? "Stop speaking" : "Read insights aloud"}
            title={isSpeaking ? "Stop speaking" : "Read insights aloud"}
          >
            {isSpeaking ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.465a5 5 0 001.06-7.069m-1.06 7.07l14.849-14.85" />
              </svg>
            )}
          </button>
          <button 
            onClick={fetchAIInsights}
            className={`p-2 rounded-full ${
              loading 
                ? `bg-gray-500 cursor-not-allowed` 
                : `bg-${darkMode ? 'blue-600' : 'blue-500'} hover:bg-${darkMode ? 'blue-700' : 'blue-600'}`
            } text-white`}
            disabled={loading}
            aria-label="Generate insights"
            title="Generate insights"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      <div className="p-4 flex-grow overflow-y-auto">
        {(!explanation && !suggestions && !loading) && (
          <div className={`flex flex-col items-center justify-center h-full text-${darkMode ? 'gray-400' : 'gray-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-center">Generate AI insights to analyze your data</p>
            <button 
              onClick={fetchAIInsights}
              className={`mt-4 px-4 py-2 bg-${darkMode ? 'blue-600' : 'blue-500'} hover:bg-${darkMode ? 'blue-700' : 'blue-600'} text-white rounded`}
            >
              Generate Insights
            </button>
          </div>
        )}
        
        {loading && (
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
        )}
        
        {(explanation || suggestions) && !loading && (
          <>
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-2">Explanation</h3>
              <p className={`text-${darkMode ? 'gray-300' : 'gray-700'}`}>{explanation}</p>
            </div>
            
            <div>
              <h3 className="text-md font-semibold mb-2">Insights & Recommendations</h3>
              <div className={`text-${darkMode ? 'gray-300' : 'gray-700'} whitespace-pre-line`}>
                {suggestions.split('\n').map((line, index) => (
                  <p key={index} className={line.trim().startsWith('•') ? 'ml-4' : ''}>{line}</p>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default render;
