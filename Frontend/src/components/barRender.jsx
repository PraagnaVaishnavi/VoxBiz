import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList
} from 'recharts';

// Sample data with drill-down capability
// Each main category has subcategories that will be shown when a bar is clicked
const sampleData = [
  {
    name: 'Q1 2024',
    value: 4000,
    drillDown: [
      { name: 'January', value: 1200 },
      { name: 'February', value: 1300 },
      { name: 'March', value: 1500 }
    ]
  },
  {
    name: 'Q2 2024',
    value: 3000,
    drillDown: [
      { name: 'April', value: 900 },
      { name: 'May', value: 1100 },
      { name: 'June', value: 1000 }
    ]
  },
  {
    name: 'Q3 2024',
    value: 2000,
    drillDown: [
      { name: 'July', value: 700 },
      { name: 'August', value: 500 },
      { name: 'September', value: 800 }
    ]
  },
  {
    name: 'Q4 2024',
    value: 2780,
    drillDown: [
      { name: 'October', value: 900 },
      { name: 'November', value: 880 },
      { name: 'December', value: 1000 }
    ]
  }
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, darkMode = false }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`p-3 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-lg rounded-md border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <p className="font-bold">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="flex items-center">
            <span className="w-3 h-3 inline-block mr-2" style={{ backgroundColor: entry.color }}></span>
            {`${entry.name}: ${entry.value.toLocaleString()}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const BarRender = ({ darkMode = false }) => {
  const [drillDownData, setDrillDownData] = useState(null);
  const [selectedBar, setSelectedBar] = useState(null);
  const [showDrillDown, setShowDrillDown] = useState(false);

  const handleBarClick = (data) => {
    setDrillDownData(data.drillDown);
    setSelectedBar(data.name);
    setShowDrillDown(true);
  };

  const handleBackClick = () => {
    setShowDrillDown(false);
    setDrillDownData(null);
    setSelectedBar(null);
  };

  const textColor = darkMode ? "#fff" : "#333";
  const gridColor = darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const backgroundColor = darkMode ? "#1f2937" : "#f9fafb";
  const buttonBgColor = darkMode ? "#4b5563" : "#e5e7eb";
  const buttonTextColor = darkMode ? "#fff" : "#374151";
  const barColor = darkMode ? "#60a5fa" : "#3b82f6";
  const drillDownBarColor = darkMode ? "#34d399" : "#10b981";

  return (
    <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {showDrillDown ? `${selectedBar} Breakdown` : 'Quarterly Revenue (2024)'}
        </h2>
        {showDrillDown && (
          <button
            onClick={handleBackClick}
            className={`px-4 py-2 rounded bg-${buttonBgColor} text-${buttonTextColor} hover:opacity-90 transition-opacity flex items-center`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Overview
          </button>
        )}
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {!showDrillDown ? (
            <BarChart
              data={sampleData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" stroke={textColor} tick={{ fill: textColor }} />
              <YAxis stroke={textColor} tick={{ fill: textColor }} />
              <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
              <Legend wrapperStyle={{ color: textColor }} />
              <Bar 
                dataKey="value" 
                name="Revenue" 
                fill={barColor} 
                radius={[4, 4, 0, 0]} 
                onClick={handleBarClick}
                cursor="pointer"
              >
                <LabelList dataKey="value" position="top" fill={textColor} formatter={(value) => `$${value.toLocaleString()}`} />
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={drillDownData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" stroke={textColor} tick={{ fill: textColor }} />
              <YAxis stroke={textColor} tick={{ fill: textColor }} />
              <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
              <Legend wrapperStyle={{ color: textColor }} />
              <Bar 
                dataKey="value" 
                name={`${selectedBar} Revenue`} 
                fill={drillDownBarColor} 
                radius={[4, 4, 0, 0]}
              >
                <LabelList dataKey="value" position="top" fill={textColor} formatter={(value) => `$${value.toLocaleString()}`} />
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-center text-sm">
        {!showDrillDown && <p>Click on any bar to see detailed breakdown</p>}
      </div>
    </div>
  );
};

export default BarRender;