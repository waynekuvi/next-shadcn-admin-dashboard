"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function BackgroundBeams() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [beams, setBeams] = useState<{ x: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    // Generate beams only on client side to avoid hydration mismatch
    const newBeams = Array.from({ length: 5 }).map(() => ({
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
      duration: Math.random() * 2 + 2,
      delay: Math.random() * 5,
    }));
    setBeams(newBeams);

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 flex items-center justify-center bg-[#050505] overflow-hidden pointer-events-none">
      {/* Main Gradient */}
      <div 
        className="absolute w-[1000px] h-[1000px] bg-indigo-500/10 rounded-full blur-[120px] opacity-20 animate-pulse"
        style={{
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
        }}
      />
      
      {/* Secondary Gradient */}
      <div 
        className="absolute w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[100px] opacity-20"
        style={{
          top: "20%",
          left: "20%",
          transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`,
        }}
      />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Shooting Stars / Beams */}
      <div className="absolute inset-0">
        {beams.map((beam, i) => (
          <motion.div
            key={i}
            className="absolute h-[40vh] w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent opacity-0"
            initial={{ 
              x: beam.x, 
              y: -100, 
              opacity: 0 
            }}
            animate={{ 
              y: typeof window !== 'undefined' ? window.innerHeight + 100 : 1000, 
              opacity: [0, 1, 0] 
            }}
            transition={{ 
              duration: beam.duration, 
              repeat: Infinity, 
              delay: beam.delay,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  );
}
