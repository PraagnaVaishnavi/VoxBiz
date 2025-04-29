import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import Loader from '../components/ui/Loader';
import AnimatedParticles from "../components/ScatterPoints"
const VoxBizAnimation = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [showLoader, setShowLoader] = useState(false); 
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const dataPackets = useRef([]);
  const voiceWaves = useRef([]);
  const animationTimeline = useRef(null);
  const uiTimeline = useRef(null);
  const animationFrameId = useRef(null);
  const helixGroup = useRef(null);
  const microphone = useRef(null);
  const micHead = useRef(null);
  const computerModel = useRef(null);
  const currentAnimationStage = useRef(0);
  
  // Initialize scene
  useEffect(() => {
    if (!containerRef.current) return;

const newScene = new THREE.Scene();
newScene.background = null;
    // Setup camera
    const newCamera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    newCamera.position.z = 5;

    // Setup renderer
    const newRenderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    newRenderer.setSize(window.innerWidth, window.innerHeight);
    newRenderer.setPixelRatio(window.devicePixelRatio);

    // Set states
    setScene(newScene);
    setCamera(newCamera);
    setRenderer(newRenderer);

    // Initialize Web Audio API
    const newAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(newAudioContext);

    // Initialize GSAP timelines
    animationTimeline.current = gsap.timeline();
    uiTimeline.current = gsap.timeline();

    const handleResize = () => {
      if (newCamera && newRenderer) {
        newCamera.aspect = window.innerWidth / window.innerHeight;
        newCamera.updateProjectionMatrix();
        newRenderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (newRenderer) {
        newRenderer.dispose();
      }
      if (newAudioContext) {
        newAudioContext.close();
      }
    };
  }, []);

  // Create scene elements
  useEffect(() => {
    if (!scene || !camera || !renderer) return;

    // Create ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Create directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 2);
    scene.add(directionalLight);

    // Create microphone with more futuristic design
    createMicrophone();
    
    // Create voice waves that will travel from mic to computer
    createVoiceWaves();
    
    // Create computer/database representation
    computerModel.current = createComputer();
  scene.add(computerModel.current);
    
    // Create DNA helix with data packets
    const { dnaGroup, dataPackets: packets } = createDNAHelix();
  helixGroup.current = dnaGroup;
  dataPackets.current = packets;
  scene.add(helixGroup.current);
    
    createDynamicBackground();

    // Animation loop
    const animate = () => {
        // Animate voice waves based on current animation stage
        if (currentAnimationStage.current >= 1) {
          animateVoiceWaves();
        }
        
        // Animate data packets based on current animation stage
        if (currentAnimationStage.current >= 2) {
          animateDataPackets();
        }
        
        // Ensure dynamic background is visible and subtly moving
        if (scene) {
          // Subtle camera movement to show dynamic background
          camera.position.x = Math.sin(Date.now() * 0.0001) * 0.5;
          camera.position.y = Math.cos(Date.now() * 0.0001) * 0.3;
          camera.lookAt(0, 0, 0);
        }
        
        renderer.render(scene, camera);
        animationFrameId.current = requestAnimationFrame(animate);
      };
    
    animate();

    // Start sequential animation
    startSequentialAnimation();

    // Add mouse hover effect for data packets
    setupMouseInteraction();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [scene, camera, renderer]);

  const redirectToLogin = () => {
    // Add a timeout to ensure animation completes
    setTimeout(() => {
      // Replace with your actual login URL
      window.location.href = "/login"; 
    }, 500);
  };
  const createMicrophone = () => {
    // Create microphone group
    const micGroup = new THREE.Group();
    
    // Main mic body
    const micBodyGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 16);
    const micBodyMaterial = new THREE.MeshPhongMaterial({
      color: 0x333333,
      specular: 0x999999,
      shininess: 30
    });
    const micBody = new THREE.Mesh(micBodyGeometry, micBodyMaterial);
    micBody.rotation.x = Math.PI / 2; 
    micGroup.add(micBody);
    
    const micHeadGeometry = new THREE.SphereGeometry(0.12, 24, 24);
    const micHeadMaterial = new THREE.MeshPhongMaterial({
      color: 0x666666,
      emissive: 0x222222,
      specular: 0xaaaaaa,
      shininess: 30
    });
    const head = new THREE.Mesh(micHeadGeometry, micHeadMaterial);
    head.position.set(0.15, 0, 0); 
    micGroup.add(head);
    micHead.current = head;
    
    // Add subtle glow effect
    const glowGeometry = new THREE.SphereGeometry(0.15, 24, 24);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x4466ff,
      transparent: true,
      opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    head.add(glow);
    
    // Add mic stand base
    const standBaseGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.05, 16);
    const standBaseMaterial = new THREE.MeshPhongMaterial({
      color: 0x222222,
      shininess: 20
    });
    const standBase = new THREE.Mesh(standBaseGeometry, standBaseMaterial);
    standBase.position.set(-0.2, -0.15, 0);
    micGroup.add(standBase);
    
    // Position the whole microphone group
    micGroup.position.set(-2, 0, 0);
    micGroup.visible = false;
    scene.add(micGroup);
    microphone.current = micGroup;
  }

  const createVoiceWaves = () => {
    // Create wave rings that will travel from mic to computer
    for (let i = 0; i < 7; i++) {
      // Larger rings with higher opacity
      const waveGeometry = new THREE.RingGeometry(0.1, 0.2, 32);
      const waveMaterial = new THREE.MeshBasicMaterial({
        color: 0x44ffff,
        transparent: true,
        opacity: 0.9 - i * 0.05 
      });
      const wave = new THREE.Mesh(waveGeometry, waveMaterial);
      wave.rotation.x = Math.PI / 2;
      wave.visible = false;
      // Position all waves at microphone position initially
      wave.position.set(-2, 0, 0);
      scene.add(wave);
      voiceWaves.current.push(wave);
    }
  };


  const createDynamicBackground = () => {
    const bgGroup = new THREE.Group();
    bgGroup.position.z = -6;
    
    const colors = [
      0x44aaff, 
      0xffd700, 
      0xc06a45, 
    ];

    createGraphCluster(-10, 0, bgGroup, colors);
    createGraphCluster(10, 0, bgGroup, colors);  

    
    scene.add(bgGroup);
    
    // Add subtle movement animation
    gsap.to(bgGroup.rotation, {
      y: bgGroup.rotation.y + 0.03,
      duration: 60,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    function createGraphCluster(centerX, centerY, parentGroup, colorPalette) {
      const clusterGroup = new THREE.Group();
      clusterGroup.position.set(centerX, centerY, 0);

      const nodeCount = Math.floor(Math.random() * 3) + 5;
      const nodes = [];
      
      for (let i = 0; i < nodeCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.5 + Math.random() * 2;
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.8 + 2; 
        const z = Math.random() * 1.5 - 0.75;
        
        // Create node visualization
        const dotGeometry = new THREE.SphereGeometry(0.08 + Math.random() * 0.06, 8, 8);
        const dotMaterial = new THREE.MeshBasicMaterial({
          color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
          transparent: true,
          opacity: Math.random() * 0.2 + 0.7
        });
        
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.position.set(x, y, z);
        clusterGroup.add(dot);
        
        nodes.push({
          position: new THREE.Vector3(x, y, z),
          node: dot
        });
      }
      
      // Create connections between nodes
      for (let i = 0; i < nodes.length; i++) {
        // Create 2-3 connections per node
        const connectionCount = Math.floor(Math.random() * 2) + 2;
        
        for (let c = 0; c < connectionCount; c++) {
          // Connect to another random node
          const targetIndex = Math.floor(Math.random() * nodes.length);
          if (targetIndex !== i) {
            const points = [];
            points.push(nodes[i].position.clone());
            points.push(nodes[targetIndex].position.clone());
            
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            const lineMaterial = new THREE.LineBasicMaterial({
              color: lineColor,
              transparent: true,
              opacity: Math.random() * 0.3 + 0.4
            });
            
            const line = new THREE.Line(lineGeometry, lineMaterial);
            clusterGroup.add(line);
          }
        }
      }
      
      parentGroup.add(clusterGroup);
    }
    };
  
  
 const createComputer = () => {
  const computerGroup = new THREE.Group();
  
  // Main server case - sleek rectangle with beveled edges
  const caseGeometry = new THREE.BoxGeometry(0.9, 0.5, 0.4);
  const caseMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x252532,
    metalness: 0.7,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.2
  });
  const serverCase = new THREE.Mesh(caseGeometry, caseMaterial);
  computerGroup.add(serverCase);
  
  // Add GPU-like fins on top
  for (let i = 0; i < 8; i++) {
    const finGeometry = new THREE.BoxGeometry(0.6, 0.02, 0.3);
    const finMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x666677,
      metalness: 0.9,
      roughness: 0.3
    });
    const fin = new THREE.Mesh(finGeometry, finMaterial);
    fin.position.set(0, 0.26 + i * 0.025, 0);
    computerGroup.add(fin);
  }
  
  // Add RGB lighting strips
  const stripGeometry = new THREE.PlaneGeometry(0.7, 0.05);
  const stripMaterial = new THREE.MeshBasicMaterial({
    color: 0x44aaff,
    emissive: 0x0066ff,
    transparent: true,
    opacity: 0.8
  });
  const lightStrip = new THREE.Mesh(stripGeometry, stripMaterial);
  lightStrip.position.set(0, -0.15, 0.21);
  computerGroup.add(lightStrip);
  
  // Animate RGB colors
  gsap.to(stripMaterial.color, {
    r: 0.2, g: 1.0, b: 0.8,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
  
  // Add LED screen with matrix-like data
  const screenGeometry = new THREE.PlaneGeometry(0.6, 0.2);
  const screenMaterial = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.9
  });
  const screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.position.set(0, 0.05, 0.21);
  computerGroup.add(screen);
  
  // Hide the computer initially
  computerGroup.visible = false;
  
  return computerGroup;
};
  
  const createDNAHelix = () => {
  const dnaGroup = new THREE.Group();
  const numPoints = 100;
  const radius = 0.5;
  const height = 3;
  
  // Generate points for both DNA strands
  const strand1Points = [];
  const strand2Points = [];
  const rungs = [];
  
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const angle = t * Math.PI * 8;
    
    // Create points for strand 1
    strand1Points.push(new THREE.Vector3(
      height * (t - 0.5),
      radius * Math.cos(angle),
      radius * Math.sin(angle)
    ));
    
    // Create points for strand 2 (offset by π)
    strand2Points.push(new THREE.Vector3(
      height * (t - 0.5),
      radius * Math.cos(angle + Math.PI),
      radius * Math.sin(angle + Math.PI)
    ));
    
    // Create connecting rungs (phosphate groups) every few points
    if (i % 5 === 0 && i < numPoints - 1) {
      rungs.push({
        start: strand1Points[i].clone(),
        end: strand2Points[i].clone()
      });
    }
  }
  
  // Enhance strand materials for better 3D appearance
  const strand1Material = new THREE.MeshPhongMaterial({
    color: 0x44aaff, // Match blue theme from other components
    emissive: 0x112244,
    specular: 0xffffff,
    shininess: 90,
    transparent: true,
    opacity: 0.9
  });
  
  const strand2Material = new THREE.MeshPhongMaterial({
    color: 0x44ffff, // Slight variation for visual interest
    emissive: 0x112233,
    specular: 0xffffff, 
    shininess: 90,
    transparent: true,
    opacity: 0.9
  });
  
  // Create more detailed strands with increased segments
  const strand1Geometry = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(strand1Points), 
    120,
    0.08,
    16, 
    false
  );
  
  const strand2Geometry = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(strand2Points),
    120,
    0.08,
    16,
    false
  );
  
  const strand1 = new THREE.Mesh(strand1Geometry, strand1Material);
  const strand2 = new THREE.Mesh(strand2Geometry, strand2Material);
  
  dnaGroup.add(strand1);
  dnaGroup.add(strand2);
  
  // Create rungs between strands
  const rungMaterial = new THREE.MeshPhongMaterial({
    color: 0xaaddff,
    emissive: 0x223344,
    transparent: true,
    opacity: 0.7
  });
  
  rungs.forEach(rung => {
    const rungGeometry = new THREE.CylinderGeometry(
      0.03, 0.03, 
      rung.start.distanceTo(rung.end), 
      8, 1
    );
    
    const rungMesh = new THREE.Mesh(rungGeometry, rungMaterial);
    
    // Position and rotate the rung to connect the two points
    const midpoint = new THREE.Vector3().addVectors(
      rung.start, rung.end
    ).multiplyScalar(0.5);
    
    rungMesh.position.copy(midpoint);
    
    // Orient the cylinder to point from start to end
    rungMesh.lookAt(rung.end);
    rungMesh.rotateX(Math.PI / 2);
    
    dnaGroup.add(rungMesh);
  });
  
  // Create data packets that will travel along the helix
  const dataPackets = [];
  const packetGeometry = new THREE.SphereGeometry(0.14, 24, 24);
  
  // Create 12 packets at different positions along the strands
  for (let i = 0; i < 12; i++) {
    const strand = i % 2 === 0 ? 1 : 2; 
    const t = (i / 12) * 0.8; 
    
    const packetMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x44ddff,
      emissive: 0x0066aa,
      metalness: 0.7,
      roughness: 0.3,
      reflectivity: 0.7,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2
    });
    
    const packet = new THREE.Mesh(packetGeometry, packetMaterial);
    
    // Get position based on which strand this packet is on
    const points = strand === 1 ? strand1Points : strand2Points;
    const pointIdx = Math.floor(t * points.length);
    packet.position.copy(points[pointIdx]);
    
    // Add user data for animation
    packet.userData = {
      t: t,
      strand: strand
    };
    
    // Add glow effect to the packet
    const glowGeometry = new THREE.SphereGeometry(0.2, 24, 24);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x44aaff,
      transparent: true,
      opacity: 0.4
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    packet.add(glow);
    
    dataPackets.push(packet);
    dnaGroup.add(packet);
  }
  
  // Center the helix in the scene
  dnaGroup.position.set(0, 0, 0);
  
  return { dnaGroup, dataPackets };
};

const createSmokeEffect = () => {
  const smokeParticles = [];
  const smokeGroup = new THREE.Group();

  // Load smoke texture
  const smokeTexture = new THREE.TextureLoader().load('/smoke.png', () => {
    console.log('Smoke texture loaded successfully');
  }, undefined, (error) => {
    console.error('Error loading smoke texture:', error);
  });

  const smokeMaterial = new THREE.MeshBasicMaterial({
    map: smokeTexture,
    transparent: true,
    opacity: 0.2,
    blending: THREE.NormalBlending, 
    depthWrite: false,
  });

  for (let i = 0; i < 10; i++) {
    const smokeGeometry = new THREE.PlaneGeometry(1.5, 1.5);
    const smokeMesh = new THREE.Mesh(smokeGeometry, smokeMaterial.clone());

    // Random positions around the helix
    smokeMesh.position.set(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );
    smokeMesh.rotation.z = Math.random() * Math.PI * 2;

    smokeGroup.add(smokeMesh);
    smokeParticles.push(smokeMesh);
  }

  return { smokeGroup, smokeParticles };
};

  const createLogoPopup = () => {
    // plane for the logo
    const logoGeometry = new THREE.PlaneGeometry(2, 2);
    const logoTexture = new THREE.TextureLoader().load('/voxlogo3.png');
    const logoMaterial = new THREE.MeshBasicMaterial({
      map: logoTexture,
      transparent: true,
      opacity: 0,
    });
  
    const logoMesh = new THREE.Mesh(logoGeometry, logoMaterial);
    logoMesh.position.set(0, 0, 1);
    logoMesh.rotation.set(0, 0, 0); 
    logoMesh.scale.set(1.5, 1.5, 1.5); 
    logoMesh.visible = false;
  
    scene.add(logoMesh);
    return logoMesh;
  };
  
  const animateVoiceWaves = () => {
    // Only animate when in wave animation stage
    if (currentAnimationStage.current !== 1) return;
    
    voiceWaves.current.forEach((wave, index) => {
      if (wave.visible) {
        // More pronounced pulsing effect
        const pulse = 0.2 * Math.sin(Date.now() / 200 + index);
        // Use Object3D methods to scale correctly
        wave.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
        
        // Higher base opacity with strong pulsing
        wave.material.opacity = Math.max(0.7 + 0.3 * Math.sin(Date.now() / 300 + index), 0.6);
        
        // Add color pulsing for more visibility
        const hue = Math.sin(Date.now() / 500 + index) * 0.1 + 0.6; 
        wave.material.color.setHSL(hue, 1, 0.7);
      }
    });
  };
  

const animateDataPackets = () => {
  dataPackets.current.forEach(packet => {
    // Regular packet movement along DNA
    if (!packet.userData.exploded) {
      packet.userData.t += 0.001;
      if (packet.userData.t > 1) packet.userData.t = 0;
      
      const radius = 0.5;
      const height = 3;
      const angle = packet.userData.t * Math.PI * 4;
      
      // Horizontal orientation position calculation
      const x = height * (packet.userData.t - 0.5);
      const y = radius * Math.cos(angle + (packet.userData.strand === 1 ? 0 : Math.PI));
      const z = radius * Math.sin(angle + (packet.userData.strand === 1 ? 0 : Math.PI));
      packet.position.set(x, y, z);
      
      // Pulsing effect
      const pulseFactor = 0.15 * Math.sin(Date.now() / 300 + packet.userData.t * 10);
      packet.scale.set(1 + pulseFactor, 1 + pulseFactor, 1 + pulseFactor);
      
      // Color cycling
      if (Math.random() < 0.01) {
        gsap.to(packet.material.color, {
          r: Math.random() * 0.5 + 0.3,
          g: Math.random() * 0.5 + 0.5,
          b: Math.random() * 0.3 + 0.7,
          duration: 0.5,
          ease: "power1.out"
        });
      }
      
      // Data trail effect
      if (Math.random() < 0.05) {
        const trailGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const trailMaterial = new THREE.MeshBasicMaterial({
          color: packet.material.color.clone(),
          transparent: true,
          opacity: 0.7
        });
        const trail = new THREE.Mesh(trailGeometry, trailMaterial);
        trail.position.copy(packet.position);
        helixGroup.current.add(trail);
        
        // Fade and shrink trail
        gsap.to(trail.scale, {
          x: 0.1, y: 0.1, z: 0.1,
          duration: 1,
          ease: "power1.out",
          onComplete: () => {
            helixGroup.current.remove(trail);
            trail.geometry.dispose();
            trail.material.dispose();
          }
        });
        gsap.to(trail.material, {
          opacity: 0,
          duration: 1,
          ease: "power1.out"
        });
      }
    }
  });
}

const createDataVisualizations = () => {
  const visualizations = [];
  const vizGroup = new THREE.Group();
  scene.add(vizGroup);

  // Bar Chart with futuristic design
  const createBarChart = () => {
    const barChart = new THREE.Group();

    const barCount = 4;
    const barWidth = 0.2;
    const barSpacing = 0.3;
    const barHeights = [0.6, 0.8, 0.5, 0.7];
    const bars = [];
    
    // Add base platform for futuristic look
    const baseGeometry = new THREE.BoxGeometry(barCount * barSpacing, 0.03, 0.15);
    const baseMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x222233,
      emissive: 0x112233,
      shininess: 80,
      transparent: true,
      opacity: 0.9
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set((barCount-1) * barSpacing / 2, -0.02, 0);
    barChart.add(base);
    
    for (let i = 0; i < barCount; i++) {
      // Create neon-like glowing bars
      const barGeometry = new THREE.BoxGeometry(barWidth, barHeights[i], 0.1);
      const barMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x44aaff, 
        emissive: 0x1155aa,
        shininess: 100,
        transparent: true,
        opacity: 0.8
      });
      const bar = new THREE.Mesh(barGeometry, barMaterial);
      bar.position.set(i * barSpacing, barHeights[i] / 2, 0);
      
      // Add highlight effect on top of each bar
      const highlightGeometry = new THREE.BoxGeometry(barWidth, 0.05, 0.1);
      const highlightMaterial = new THREE.MeshBasicMaterial({
        color: 0xaaddff,
        transparent: true,
        opacity: 0.9
      });
      const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
      highlight.position.y = barHeights[i] - 0.025;
      bar.add(highlight);
      
      // Store reference for animation
      bars.push(bar);
      barChart.add(bar);
    }
    
    // Add animation function to the bar chart
    barChart.animate = (time) => {
      for (let i = 0; i < bars.length; i++) {
        // Animate height with sin wave
        const newHeight = barHeights[i] + Math.sin(time * 2 + i) * 0.2;
        bars[i].scale.y = newHeight / barHeights[i];
        bars[i].position.y = newHeight / 2;
        // Adjust highlight position
        bars[i].children[0].position.y = barHeights[i] * (bars[i].scale.y) - 0.025;
      }
      
      // Add pulsing glow effect to base
      base.material.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.2;
    };

    // Position bar chart with more space to the left
    barChart.position.set(-3.2, 0, 0);
    barChart.scale.set(0.9, 0.9, 0.9);
    vizGroup.add(barChart);

    return barChart;
  };

  // Line Chart with futuristic design
  const createLineChart = () => {
    const lineChart = new THREE.Group();

    // Create wavy line chart with glowing effect
    const linePoints = [];
    const pointCount = 12; 
    
    for (let i = 0; i < pointCount; i++) {
      const x = (i / (pointCount - 1)) * 4 - 2;
      const y = Math.sin(i * 0.8) * 0.4;
      linePoints.push(new THREE.Vector3(x, y, 0));
    }
    
    // Create glowing outer line
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x66eeff,
      transparent: true,
      opacity: 0.8,
      linewidth: 2
    });
    
    const line = new THREE.Line(lineGeometry, lineMaterial);
    lineChart.add(line);
    
    // Add brighter inner line for glow effect
    const innerLineMaterial = new THREE.LineBasicMaterial({ 
      color: 0xaaffff,
      transparent: true,
      opacity: 0.6
    });
    const innerLine = new THREE.Line(lineGeometry.clone(), innerLineMaterial);
    innerLine.scale.set(0.98, 0.98, 0.98);
    lineChart.add(innerLine);
    
    // Add futuristic data points
    const pointsGroup = new THREE.Group();
    const pointMaterial = new THREE.MeshPhongMaterial({
      color: 0x66eeff,
      emissive: 0x33aaff,
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });
    
    const dataPoints = [];
    for (let i = 0; i < pointCount; i += 2) { 
      const pointGeometry = new THREE.SphereGeometry(0.05, 12, 12);
      const point = new THREE.Mesh(pointGeometry, pointMaterial);
      point.position.copy(linePoints[i]);
      pointsGroup.add(point);
      dataPoints.push(point);
    }
    lineChart.add(pointsGroup);

    lineChart.points = linePoints;
    lineChart.lineGeometry = lineGeometry;
    lineChart.dataPoints = dataPoints;
    
    lineChart.animate = (time) => {
      for (let i = 0; i < lineChart.points.length; i++) {
        lineChart.points[i].y = Math.sin(i * 0.8 + time * 3) * 0.4;
      }
      // Update geometry
      lineChart.lineGeometry.setFromPoints(lineChart.points);
      lineGeometry.attributes.position.needsUpdate = true;
      innerLine.geometry.setFromPoints(lineChart.points);
      innerLine.geometry.attributes.position.needsUpdate = true;
      
      // data points position
      let pointIndex = 0;
      for (let i = 0; i < pointCount; i += 2) {
        if (pointIndex < dataPoints.length) {
          dataPoints[pointIndex].position.copy(lineChart.points[i]);
          const pulseFactor = 1 + Math.sin(time * 5 + i) * 0.2;
          dataPoints[pointIndex].scale.set(pulseFactor, pulseFactor, pulseFactor);
          pointIndex++;
        }
      }
      
      // Pulse the glow intensity
      lineMaterial.opacity = 0.7 + Math.sin(time * 2) * 0.2;
      innerLineMaterial.opacity = 0.5 + Math.sin(time * 2.5) * 0.3;
      
      //pulsing glow effect to base
      base.material.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.2;
    };

    // Position line chart with more space to the right
    lineChart.position.set(3.2, 0.3, 0);
    lineChart.rotation.x = -0.2;
    lineChart.scale.set(0.7, 0.7, 0.7);
    vizGroup.add(lineChart);

    return lineChart;
  };

  visualizations.push(createBarChart());
  visualizations.push(createLineChart());

  // Add animation function to the group
  vizGroup.animate = (time) => {
    // Animate each visualization
    visualizations.forEach(viz => {
      if (viz.animate) viz.animate(time);
    });
    
    // Gentle floating movement for the entire group
    vizGroup.position.y = Math.sin(time * 0.8) * 0.05;
    vizGroup.rotation.z = Math.sin(time * 0.5) * 0.08;
  };

  return { visualizations, vizGroup };
};

const explodePacketsIntoVisualizations = () => {
  const { visualizations, vizGroup } = createDataVisualizations();

  // Mark all packets as exploded
  dataPackets.current.forEach(packet => {
    packet.userData.exploded = true;

    // Explode animation with more dynamic movement
    gsap.to(packet.position, {
      x: Math.random() * 1.0 - 0.5,
      y: Math.random() * 1.0 + 0.5,
      z: Math.random() * 1.0 - 0.5,
      duration: 1.2,
      ease: "power3.out"
    });

    // Add rotation during explosion
    gsap.to(packet.rotation, {
      x: Math.random() * Math.PI * 2,
      y: Math.random() * Math.PI * 2,
      z: Math.random() * Math.PI * 2,
      duration: 1.2,
      ease: "power2.out"
    });

    // Fade out packet with glow effect
    gsap.to(packet.material, {
      opacity: 0,
      emissiveIntensity: 2,
      duration: 0.8,
      delay: 0.5,
      ease: "power1.in",
      onComplete: () => {
        helixGroup.current.remove(packet);
        packet.geometry.dispose();
        packet.material.dispose();
      }
    });
  });

  // Position visualizations further apart with more dramatic entrance
  const specificLocations = [
    new THREE.Vector3(-2, 1.5, 0),
    new THREE.Vector3(2, 1.7, 0)
  ];

  visualizations.slice(0, 2).forEach((viz, index) => {
    const targetLocation = specificLocations[index];

    // Initial position (start from above)
    viz.position.set(targetLocation.x, targetLocation.y + 3, targetLocation.z);
    viz.scale.set(0.1, 0.1, 0.1);
    viz.rotation.z = index === 0 ? -0.3 : 0.3; // Slight tilt
    viz.rotation.x = index === 1 ? -0.2 : 0;
    // Move visualization to the target location with bounce effect
    gsap.to(viz.position, {
      x: targetLocation.x,
      y: targetLocation.y,
      z: targetLocation.z,
      duration: 1.8,
      ease: "bounce.out",
      delay: 0.2 + index * 0.2
    });

    // Scale up visualization with elastic effect
    gsap.to(viz.scale, {
      x: index === 1 ? 0.8 : 1,
  y: index === 1 ? 0.8 : 1,
  z: index === 1 ? 0.8 : 1,
      duration: 1.5,
      ease: "elastic.out(1.2, 0.5)",
      delay: 0.2 + index * 0.2
    });

    // Rotate to proper orientation
    gsap.to(viz.rotation, {
      z: 0,
      duration: 1.5,
      ease: "elastic.out(1, 0.5)",
      delay: 0.4 + index * 0.2
    });

    // Fade in visualization with glow effect
    viz.children.forEach(child => {
      if (child.material) {
        // Start with zero opacity
        child.material.opacity = 0;
        
        // Fade in
        gsap.to(child.material, {
          opacity: child.material.userData?.targetOpacity || 0.8,
          duration: 1,
          delay: 0.6 + index * 0.2,
          ease: "power2.inOut"
        });
      }
    });
  });

  return vizGroup;
};
  const setupMouseInteraction = () => {
    // Add mouse hover effect for data packets
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event) => {
      // Only process when in DNA helix stage
      if (currentAnimationStage.current < 2) return;
      
      // Calculate mouse position in normalized device coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      // Update the raycaster
      raycaster.setFromCamera(mouse, camera);
      
      // Find intersections with data packets
      const intersects = raycaster.intersectObjects(dataPackets.current);
      
      // Reset all packets to original color
      dataPackets.current.forEach(packet => {
        packet.material.color.copy(packet.userData.originalColor);
        packet.material.emissive.set(0x663300);
      });
      
      // Change color of intersected packets
      if (intersects.length > 0) {
        intersects[0].object.material.color.copy(intersects[0].object.userData.activeColor);
        intersects[0].object.material.emissive.set(0x006633);
        
        // Scale up the hovered packet for emphasis
        gsap.to(intersects[0].object.scale, {
          x: 1.3,
          y: 1.3,
          z: 1.3,
          duration: 0.2,
          ease: "power2.out"
        });
      }
    };

    window.addEventListener('mousemove', onMouseMove);
  };
  
  // Start the sequential animation flow
  const startSequentialAnimation = () => {
    let vizAnimationId;
    if (!animationTimeline.current) return;
    const { smokeGroup, smokeParticles } = createSmokeEffect();
    const logoMesh = createLogoPopup();
    let vizGroup;
  

    animationTimeline.current
      // Stage 1: Microphone and Voice Animation
      .to([microphone.current, micHead.current], {
        visible: true,
        duration: 0,
        onStart: () => {
          currentAnimationStage.current = 0;
        },
      })
      .fromTo(
        micHead.current.position,
        { y: -0.5 },
        { y: 0, duration: 0.5, ease: "power2.out" }
      )
      .to(micHead.current.material, {
        emissive: new THREE.Color(0x4444ff),
        duration: 0.3,
        repeat: 2,
        yoyo: true,
        onComplete: () => {
          currentAnimationStage.current = 1;
          voiceWaves.current.forEach((wave) => {
            wave.visible = true;
            wave.position.set(-2, 0, 0);
          });
        },
      })
      .to(
        voiceWaves.current.map((wave) => wave.position),
        {
          x: 2,
          duration: 0.8,
          stagger: 0.05,
          ease: "power1.inOut",
        }
      )
      .to([microphone.current, micHead.current], {
        visible: false,
        duration: 0,
        delay: 0.2,
      })
      .to(voiceWaves.current, {
        visible: false,
        duration: 0.2,
        stagger: 0.03,
        onComplete: () => {
          voiceWaves.current.forEach((wave) => {
            wave.visible = false;
          });
        },
      })
      .to(computerModel.current, {
        visible: true,
        duration: 0,
      })
      .to(computerModel.current.position, {
        y: 0.2,
        duration: 0.5,
        repeat: 1,
        yoyo: true,
        ease: "power2.inOut",
      })
      .to(computerModel.current, {
        visible: false,
        duration: 0,
        delay: 0.2,
      })
      .to(helixGroup.current, {
        visible: true,
        duration: 0,
        onStart: () => {
          currentAnimationStage.current = 2;
        },
      })
      .fromTo(
        helixGroup.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1, duration: 0.8, ease: "back.out(1.7)" }
      )
      .to(helixGroup.current.rotation, {
        y: helixGroup.current.rotation.y + Math.PI * 0.5,
        duration: 2,
        ease: "sine.inOut",
      })
      .call(() => {
        scene.add(smokeGroup);
      })
      .to(
        smokeParticles.map((p) => p.material),
        {
          opacity: 0.3,
          duration: 0.4,
          stagger: 0.02,
          ease: "power1.in",
        }
      )
      .to(
        smokeParticles.map((p) => p.scale),
        {
          x: 2.5,
          y: 2.5,
          z: 2.5,
          duration: 0.8,
          stagger: 0.03,
          ease: "power1.out",
        },
        "<"
    )
  
.to(
  [
    ...smokeParticles.map((p) => p.material),
    ...helixGroup.current.children.map((child) => child.material),
  ],
  {
    opacity: 0,
    duration: 1.2,
    stagger: 0.05,
    ease: "power2.out",
    onStart: () => {
      // Start fading immediately when this animation begins
      if (helixGroup.current) {
        // Pre-emptively hide all children that might be causing the black oval
        helixGroup.current.traverse((child) => {
          if (child.isMesh || child.isGroup || child.isObject3D) {
            child.visible = false;
          }
        });
      }
    },
    onComplete: () => {
      // Remove smoke group first
      if (smokeGroup && smokeGroup.parent) {
        scene.remove(smokeGroup);
        smokeParticles.forEach((p) => {
          if (p.geometry) p.geometry.dispose();
          if (p.material) {
            if (Array.isArray(p.material)) {
              p.material.forEach(mat => mat.dispose());
            } else {
              p.material.dispose();
            }
          }
        });
      }
  
      if (helixGroup.current) {
        helixGroup.current.visible = false;

        helixGroup.current.traverse((object) => {
          // Handle meshes
          if (object.isMesh) {
            object.visible = false;
            
            // Dispose geometry
            if (object.geometry) {
              object.geometry.dispose();
              object.geometry = null;
            }

            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(material => {
                  if (material.map) material.map.dispose();
                  material.dispose();
                });
              } else {
                if (object.material.map) object.material.map.dispose();
                object.material.dispose();
              }
              object.material = null;
            }
          }
          if (object.userData) object.userData = {};
        });
        
        // Remove from scene
        scene.remove(helixGroup.current);
        
            while (helixGroup.current.children.length > 0) {
          const child = helixGroup.current.children[0];
          helixGroup.current.remove(child);
        }
        
        // Clear the reference completely
        helixGroup.current = null;
      }
    
      renderer.clear();
    },
  },
  "<"
)
.call(() => {
  setTimeout(() => {
    vizGroup = explodePacketsIntoVisualizations();
    gsap.to(logoMesh, {
      visible: true,
      duration: 0,
    });
    gsap.to(logoMesh.material, {
      opacity: 1,
      duration: 1.2,
      ease: "power2.inOut",
    });
  }, 100);
}, null, "<0.3")
.call(() => {
  vizGroup = explodePacketsIntoVisualizations();
  
  // Set up animation for visualizations
  const animateVisualizations = () => {
    const time = performance.now() * 0.001;
    vizGroup.animate(time);
    vizAnimationId = requestAnimationFrame(animateVisualizations);
  };
  
  // Start the animation
  
  gsap.to(logoMesh, {
    visible: true,
    duration: 0,
  });
  gsap.to(logoMesh.material, {
    opacity: 1,
    duration: 1.2,
    ease: "power2.inOut",
  });
}, null, "<0.2")
.to({}, {
  duration: 3.0,
  onComplete: () => {
    // Cancel the animation loop when done
    if (vizAnimationId) {
      cancelAnimationFrame(vizAnimationId);
    }
    
    gsap.to(
      vizGroup.children.map((viz) =>
        viz.children.map((child) => child.material)
      ),
      {
        opacity: 0,
        duration: 0.4,
        ease: "power1.in",
      }
    );

    gsap.to(logoMesh.material, {
      opacity: 0,
      duration: 0.4,
      ease: "power1.in",
      onStart: () => {
        setShowLoader(true);
      },
      onComplete: () => {
        setTimeout(() => {
          redirectToLogin();
        }, 200);
      },
    });
        },
      });
  };
  
  const animateUIElements = () => {
    if (!uiTimeline.current) return;
    
    // Fade in title
    const titleElement = document.getElementById('voxbiz-title');
    uiTimeline.current.fromTo(
      titleElement,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1, delay: 0.5 }
    );

    // Fade in tagline
    const taglineElement = document.getElementById('voxbiz-tagline');
    uiTimeline.current.fromTo(
      taglineElement,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 1 },
      "-=0.5"
    );

    // Animate CTA button
    const ctaElement = document.getElementById('voxbiz-cta');
    uiTimeline.current.fromTo(
      ctaElement,
      { opacity: 0, scale: 0.9 },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 0.8,
        ease: "back.out(1.7)" 
      },
      "-=0.3"
    );

    // Pulse CTA button
    uiTimeline.current.to(
      ctaElement,
      { 
        boxShadow: "0 0 15px rgba(66, 220, 255, 0.8)",
        repeat: -1,
        yoyo: true,
        duration: 1.5
      }
    );
  };

  return (
    <div 
    className="voxbiz-container" 
    ref={containerRef}
    style={{ 
      backgroundImage: 'url(/background.webp)',
      backgroundPosition: 'bottom',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain'
    }}
  
  >
 <AnimatedParticles
  background="#0d0d0d"
  particleColor="rgba(255, 255, 255, 0.5)" // Adjust opacity here
  particleDensity={80}
/>

      <canvas ref={canvasRef} className="voxbiz-canvas" />
      <img 
        src="/background.webp" 
        alt="Background" 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 'auto', // Add this to maintain aspect ratio
          zIndex: -1,
          objectFit: 'contain', 
          objectPosition: 'bottom' 
        }}
      />
    {showLoader && (
      <div className="loader-overlay">
        <Loader />
      </div>
    )}
  
      
      <style>{`
        .voxbiz-container {
        position: relative;
        width: 100vw;  /* Changed from 100% to 100vw */
        max-width: 100vw;
        height: 100vh;
        overflow: hidden;
      }
        .loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
}
        
        .voxbiz-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .voxbiz-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 5vh;
          pointer-events: none;
        }
        
        .voxbiz-title {
          font-family: 'Arial', sans-serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: #ffffff;
          text-align: center;
          margin-bottom: 1rem;
          text-shadow: 0 0 10px rgba(66, 220, 255, 0.8);
          opacity: 0;
        }
        
        .voxbiz-tagline {
          font-family: 'Arial', sans-serif;
          font-size: 1.2rem;
          color: #a0ddff;
          text-align: center;
          max-width: 600px;
          margin-bottom: 2rem;
          opacity: 0;
        }
        
        .voxbiz-cta {
          font-family: 'Arial', sans-serif;
          font-size: 1.2rem;
          font-weight: 600;
          color: #ffffff;
          background: linear-gradient(135deg, #2b5dff 0%, #00b3ff 100%);
          border: none;
          border-radius: 30px;
          padding: 0.8rem 2.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: auto;
          margin-bottom: 5vh;
          box-shadow: 0 0 5px rgba(66, 220, 255, 0.5);
          pointer-events: auto;
          opacity: 0;
          position: relative;
          z-index: 10;
        }
        
        .voxbiz-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 15px rgba(66, 220, 255, 0.8);
        }
        
        .voxbiz-audio-toggle {
          position: absolute;
          bottom: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(66, 220, 255, 0.5);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          pointer-events: auto;
        }
        
        .voxbiz-audio-toggle:hover {
          background: rgba(0, 0, 0, 0.7);
          border-color: rgba(66, 220, 255, 0.8);
        }
        
        @media (max-width: 768px) {
          .voxbiz-title {
            font-size: 1.8rem;
            padding: 0 1rem;
          }
          
          .voxbiz-tagline {
            font-size: 1rem;
            padding: 0 1rem;
          }
          
          .voxbiz-cta {
            font-size: 1rem;
            padding: 0.7rem 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default VoxBizAnimation;