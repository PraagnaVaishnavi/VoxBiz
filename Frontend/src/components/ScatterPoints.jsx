"use client";
import React, { useId } from "react";
import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { cn } from "../lib/utils";
import { motion, useAnimation } from "framer-motion";

export const AnimatedParticles = (props) => {
  const {
    id,
    className,
    background = "#0d0d0d",
    particleColor = "#ffffff",
    particleDensity = 80,
    minSize = 1,
    maxSize = 3,
    speed = 4
  } = props;
  
  const [init, setInit] = useState(false);
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);
  
  const controls = useAnimation();

  const particlesLoaded = async (container) => {
    if (container) {
      controls.start({
        opacity: 1,
        transition: {
          duration: 1,
        },
      });
    }
  };

  const generatedId = useId();
  
  return (
    <motion.div 
      animate={controls} 
      className={cn("opacity-0 relative", className)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "60%",
        background: background,
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)"
      }}
    >
      {init && (
        <Particles
          id={id || generatedId}
          className={cn("h-full w-full")}
          particlesLoaded={particlesLoaded}
          options={{
            background: {
              color: {
                value: background,
              },
              opacity: 1
            },
            fullScreen: {
              enable: false,
              zIndex: 1,
            },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: {
                  enable: true,
                  mode: "push",
                },
                onHover: {
                  enable: true,
                  mode: "repulse",
                },
                resize: true,
              },
              modes: {
                push: {
                  quantity: 4,
                },
                repulse: {
                  distance: 100,
                  duration: 0.4,
                },
              },
            },
            particles: {
              color: {
                value: particleColor,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: {
                  default: "bounce",
                },
                random: false,
                speed: {
                  min: 0.1,
                  max: 1,
                },
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                  width: 400,
                  height: 400,
                },
                value: particleDensity,
              },
              opacity: {
                value: {
                  min: 0.1,
                  max: 0.8,
                },
                animation: {
                  enable: true,
                  speed: speed,
                  sync: false,
                  startValue: "random",
                },
              },
              shape: {
                type: "circle",
              },
              size: {
                value: {
                  min: minSize,
                  max: maxSize,
                },
              },
            },
            detectRetina: true,
          }}
        />
      )}
    </motion.div>
  );
};

export default AnimatedParticles;