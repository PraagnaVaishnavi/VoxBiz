"use client";

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from "motion/react";
import { FlipWords } from "../components/ui/flip-words";
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import Navbar from '../components/Navbar';

export function MainPage() {
  const navigate = useNavigate();
  const features = [
    "AI-powered",
    "Collaborative",
    "Real-time",
    "Multilingual",
    "Intuitive"
  ];
  const [darkMode, setDarkMode] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Check for system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Check for stored preference (localStorage)
    const storedTheme = localStorage.getItem('theme');
    
    // Set initial theme based on stored preference or system preference
    if (storedTheme) {
      setDarkMode(storedTheme === 'dark');
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      setDarkMode(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);
  React.useEffect(() => {
    const handleScroll = () => {
      // Calculate which viewport (page) the user is on
      const viewportIndex = Math.floor(window.scrollY / window.innerHeight);
      // Rotate the background 0° on even viewports and 180° on odd viewports
      setRotation(viewportIndex % 2 === 0 ? 0 : 180);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [rotation, setRotation] = React.useState(0);
  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (event) => {
      const newTheme = event.detail.theme;
      setDarkMode(newTheme === 'dark');
      
      // Update document class for Tailwind dark mode
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      
      // Store preference
      localStorage.setItem('theme', newTheme);
    };
    
    window.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);
  
  // Languages with their native scripts
  const languages = [
    { name: "English", native: "English" },
    { name: "Hindi", native: "हिन्दी" },
    { name: "Kannada", native: "ಕನ್ನಡ" },
    { name: "Tamil", native: "தமிழ்" },
    { name: "Telugu", native: "తెలుగు" },
    { name: "Malayalam", native: "മലയാളം" }
  ];

  const scrollToDemo = () => {
    // Find the demo element and scroll to it
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleButtonClick = () => {
    setShowVideo(true);
    // Wait for state update and DOM to render before playing
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play();
      }
    }, 100);
  };
  
  // Handle visibility change
  const handleVisibilityChange = (isVisible) => {
    if (videoRef.current) {
      if (isVisible) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  // For FlipWords component, we need just the native scripts
  const nativeScripts = languages.map(lang => lang.native);

  // Ref for query animation section
  const queryAnimationRef = useRef(null);
  
  const queries = [
    "SELECT * FROM speech WHERE language='Kannada' AND confidence > 0.8",
    "ANALYZE sentiment GROUPBY speaker ORDER BY positivity DESC",
    "VISUALIZE word_frequency ACROSS languages LIMIT 15"
  ];

  return (
    <div className={`flex flex-col w-screen min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Add theme toggle button to Navbar */}
      <Navbar />
      
      <div className="flex-grow relative">
        {/* Background image with similar styling to the second page */}
        <div
  className="fixed inset-0 "
  style={{
    backgroundImage: 'url("/main-page-bg.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transform: `rotate(${rotation}deg) scale(0.95)`,
    opacity: darkMode ? 0.6 : 0.7,
    transition: 'transform 0.5s ease, opacity 0.3s ease'
  }}
/>
   
        <div className="container mx-auto px-4 py-10 md:py-20 relative z-10">
          <h1 className="mx-auto max-w-4xl text-center text-2xl font-bold md:text-4xl lg:text-7xl">
            {"Transform Speech into Visual Data".split(" ").map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <div className="mx-auto max-w-2xl py-8 text-center text-2xl font-normal">
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, delay: 0.8 }}
    className="flex flex-wrap items-center justify-center"
  >
    Your <FlipWords words={features} darkMode={darkMode} />visualization platform
  </motion.div>
</div>

<motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, delay: 0.8 }}
    className="flex flex-wrap items-center justify-center"
  >
    Your <FlipWords words={features} darkMode={darkMode} />visualization platform
  </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.5 }}
            className="mx-auto max-w-xl py-6 text-center text-lg font-normal"
          >
            Convert spoken words into dynamic visualizations instantly. Our platform understands multiple languages and creates meaningful visual representations in real-time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.8 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <button 
              className={`w-60 transform rounded-lg px-6 py-2 font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              onClick={() => navigate('/dblist')}
            >
              Start Visualizing
            </button>
            <button 
              onClick={scrollToDemo}
              className={`w-60 transform rounded-lg px-6 py-2 font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                darkMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              View Demo
            </button>
          </motion.div>

          {/* Query Animation Section */}
          <div ref={queryAnimationRef} className="relative z-10 mt-32 mb-32">
  <motion.h2 
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: false, margin: "-100px" }}
    className={`text-center text-4xl font-bold mb-16 ${
      darkMode ? 'text-slate-300' : 'text-slate-800'
    }`}
  >
    Powerful Query Visualization
  </motion.h2>
  <div className="relative bg-slate-900 rounded-xl p-6 overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
    {queries.map((query, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ 
          duration: 0.5, 
          delay: index * 0.3, 
          ease: "easeOut" 
        }}
        className="font-mono mb-6 last:mb-0"
      >
        <div className="flex items-start">
          <span className="text-green-400 mr-2">{'>'}</span>
          <div className="relative overflow-hidden">
          <span className="text-green-300 whitespace-nowrap block">
  {query}
</span>
            <motion.div 
              initial={{ width: "100%" }}
              whileInView={{ width: "0%" }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ 
                duration: 1.2, 
                delay: 0.2 + index * 0.3, 
                ease: "easeInOut" 
              }}
              className="absolute top-0 left-0 h-full bg-slate-900"
              style={{ zIndex: 1 }}
            />
          </div>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ 
            duration: 0.5, 
            delay: 1 + index * 0.3, 
            ease: "easeOut" 
          }}
          className="ml-6 mt-2 h-3 bg-gradient-to-r from-green-400/50 to-blue-400/50 rounded-full"
          style={{ width: `${65 - index * 10}%` }}
        />
      </motion.div>
    ))}
  </div>
</div>

          <motion.div
            id="demo-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 2.1 }}
            className={`relative z-10 mt-20 rounded-3xl border p-4 shadow-md ${
              darkMode 
                ? 'border-neutral-800 bg-neutral-900' 
                : 'border-neutral-200 bg-neutral-100'
            }`}
          >
            <div className={`w-full overflow-hidden rounded-xl border ${
              darkMode ? 'border-gray-700' : 'border-gray-300'
            }`}>
              <div className="aspect-[16/9] h-auto w-full bg-gradient-to-br from-blue-500 to-purple-600 p-8">
                <div className={`flex h-full flex-col items-center justify-center text-white ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-900'
                } p-8 rounded-xl`}>
                  <div className="text-3xl font-bold mb-6">Speech Visualization Demo</div>
                  
                  {!showVideo ? (
                    <>
                      <p className="text-gray-300 mb-6">Click any button below to start the demo</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
                        {["Welcome", "नमस्ते", "ಸ್ವಾಗತ", "স্বাগতম", "வணக்கம்", "స్వాగతం"].map((word, index) => (
                          <div
                            key={index}
                            onClick={handleButtonClick}
                            className="bg-indigo-900/50 hover:bg-indigo-800/70 backdrop-blur-sm rounded-lg p-4 text-center cursor-pointer transition-colors duration-200 shadow-lg"
                          >
                            {word}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex-grow flex items-center justify-center">
                      <div className="w-full h-full max-w-2xl">
                        <video 
                          ref={videoRef}
                          src="/demo.mp4" 
                          className="w-full h-full object-contain rounded-lg" 
                          controls
                          onPlay={() => {
                            if (videoRef.current) {
                              const observer = new IntersectionObserver(
                                ([entry]) => {
                                  handleVisibilityChange(entry.isIntersecting);
                                },
                                { threshold: 0.5 }
                              );
                              observer.observe(videoRef.current);
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <footer className="mt-auto py-4 text-center backdrop-blur-sm bg-white/30 dark:bg-black/30">
        <p className="text-sm">© 2025 Data Visualization Platform</p>
      </footer>
    </div>
  );
}