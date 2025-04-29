import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const GraphSelector = ({ data, fullData, onSelectGraph }) => {
  const [recommendedGraph, setRecommendedGraph] = useState(null);
  const [graphOptions, setGraphOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  console.log("Data received:", fullData);
  
  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      fetchGraphRecommendation();
    } else {
      setError("No data available for analysis. Please provide valid data.");
    }
  }, [data]);

  const fetchGraphRecommendation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dataDescription = JSON.stringify(data, null, 2);
      const prompt = `
  Data sample:
  ${dataDescription}
  Based on this dataset, recommend the best graph type for visualization.
  First, provide your primary recommendation as "Primary: [graph type]".
  Then, list 2-3 DIFFERENT alternative graph types as "Alternative: [graph type]".
  Choose only from these exact graph types (do not modify or combine them): bar, line, pie, area, scatter, heatmap
  `;
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        }
      );
      if (response.data.candidates?.length > 0) {
        const aiText = response.data.candidates[0].content.parts[0].text.trim();
        console.log("Raw AI response:", aiText);
        
        // Extract primary recommendation
        const primaryMatch = aiText.match(/Primary:\s*(bar|line|pie|area|scatter|heatmap)/i);
        const alternativeMatches = aiText.match(/Alternative:\s*(bar|line|pie|area|scatter|heatmap)/gi);
        
        if (primaryMatch) {
          // Capitalize first letter of primary recommendation
          const primaryType = primaryMatch[1].trim();
          const capitalizedPrimary = primaryType.charAt(0).toUpperCase() + primaryType.slice(1);
          setRecommendedGraph(capitalizedPrimary);
        }
        
        if (alternativeMatches) {
          // Extract and capitalize alternative options
          const alternatives = alternativeMatches.map(match => {
            const graphType = match.match(/(bar|line|pie|area|scatter|heatmap)/i);
            if (graphType) {
              const type = graphType[0].trim();
              // Capitalize first letter
              return type.charAt(0).toUpperCase() + type.slice(1);
            }
            return null;
          }).filter(Boolean);
          
          // Filter out the primary recommendation from alternatives
          const primaryLower = recommendedGraph?.toLowerCase();
          const uniqueAlternatives = alternatives.filter(
            alt => alt && alt.toLowerCase() !== primaryLower
          );
          
          setGraphOptions(uniqueAlternatives);
        }
      } else {
        setError("No recommendations received from AI. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to get graph recommendations. Please try again.");
    }
    setLoading(false);
  };

  const handleUseGraph = (graphType) => {
    // Get the visualization data to pass
    const visualizationData = fullData || data;
    
    // Ensure we have the correct graph type
    const selectedGraph = graphType || recommendedGraph;
    
    // Notify parent component of selection if callback exists
    if (onSelectGraph && typeof onSelectGraph === 'function') {
      onSelectGraph(selectedGraph);
    }
    
    // Store data in sessionStorage as backup
    sessionStorage.setItem('chartData', JSON.stringify(visualizationData));
    sessionStorage.setItem('graphType', selectedGraph);
    
    console.log("Navigating with data:", {
      visualizationData,
      selectedGraphType: selectedGraph
    });
    
    // Navigate to render graph page with visualization data
    navigate("/rendergraph", { 
      state: { 
        visualizationData,
        selectedGraphType: selectedGraph
      }
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background Image with lower opacity */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 z-0"
        style={{
          backgroundImage: "url('/history-bg.png')"
        }}
      />
  
      {/* Foreground UI box */}
      <div className="relative z-10 bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-lg shadow-2xl max-w-3xl w-full mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">📊 AI-Recommended Graph</h2>
  
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            <span className="ml-4 text-gray-700 font-medium text-lg">Loading recommendations...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 text-lg">
            <p>{error}</p>
            <button
              className="mt-6 bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 text-lg"
              onClick={fetchGraphRecommendation}
            >
              Retry
            </button>
          </div>
        ) : recommendedGraph ? (
          <div className="py-2">
            <p className="mb-4 text-xl">
              <span className="font-semibold text-green-700">Recommended Graph:</span>{" "}
              <span className="text-gray-800">{recommendedGraph}</span>
            </p>
            <button
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition text-lg"
              onClick={() => handleUseGraph(recommendedGraph)}
            >
              Use This Graph
            </button>
  
            {graphOptions.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-gray-800 mb-3 text-xl">Alternative Options:</h3>
                <div className="flex flex-wrap gap-3">
                  {graphOptions.map((graph, index) => (
                    <button
                      key={index}
                      className="bg-gray-200 text-gray-800 px-5 py-2 rounded hover:bg-gray-300 text-lg"
                      onClick={() => handleUseGraph(graph)}
                    >
                      {graph}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4">
            <p className="text-gray-700 mb-5 text-lg">Click the button below to get graph suggestions from AI.</p>
            <button
              className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 text-lg"
              onClick={fetchGraphRecommendation}
            >
              Analyze Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GraphSelector;