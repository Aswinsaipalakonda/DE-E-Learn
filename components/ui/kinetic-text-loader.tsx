"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface KineticTextLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  dotColorClass?: string;
  textColorClass?: string;
}

export function KineticTextLoader({ 
  className, 
  text = "Loading", 
  dotColorClass = "bg-primary",
  textColorClass = "text-slate-900",
  ...props 
}: KineticTextLoaderProps) {
  const letters = text.split("");

  return (
    <div 
      className={cn("relative flex items-center justify-center font-light", className)} 
      style={{ fontFamily: "'Roboto', sans-serif" }}
      {...props}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap');
        
        @keyframes ktl-dotMove {
          0%, 100% { transform: rotate(180deg) translate(-80px, -10px) rotate(-180deg); }
          50% { transform: rotate(0deg) translate(-81px, 10px) rotate(0deg); }
        }
        @keyframes ktl-letterStretch {
          0%, 100% { transform: scale(1, 0.35); transform-origin: 100% 75%; }
          8%, 28% { transform: scale(1, 1.4); transform-origin: 100% 67%; }
          37% { transform: scale(1, 0.875); transform-origin: 100% 75%; }
          46% { transform: scale(1, 1.03); transform-origin: 100% 75%; }
          50%, 97% { transform: scale(1); transform-origin: 100% 75%; }
        }
        @keyframes ktl-l-bounce {
          0%, 45%, 70%, 100% { transform: scaleY(1.11); }
          49% { transform: scaleY(0.31); }
          50% { transform: scaleY(0.16); }
          53% { transform: scaleY(0.63); }
          60% { transform: scaleY(1.275); }
          68% { transform: scaleY(1.04); }
        }
      `}</style>
      
      <div className="relative scale-80 md:scale-95 lg:scale-100">
        {/* The moving dot */}
        <div 
          className={cn("absolute z-10 top-[40px] left-[85px] w-[7px] h-[7px] rounded-full shadow-xs", dotColorClass)}
          style={{ animation: "ktl-dotMove 1800ms cubic-bezier(0.25,0.25,0.75,0.75) infinite" }}
        />
        
        <p className={cn("relative m-0 whitespace-nowrap text-[3.25rem] sm:text-[3.75rem] font-light tracking-wide", textColorClass)} aria-label={text}>
          {letters.map((char, index) => {
            if (index === 0 && char.toUpperCase() === 'L') {
              return (
                <span 
                  key={index} 
                  className="inline-block relative tracking-[8px] transform origin-[100%_70%]"
                  style={{ animation: "ktl-l-bounce 1800ms cubic-bezier(0.25,0.25,0.75,0.75) infinite" }}
                >
                  {char}
                </span>
              );
            }
            
            if (index === 4 && char.toLowerCase() === 'i') {
              return (
                <span 
                  key={index} 
                  className="inline-block relative tracking-[8px] transform origin-[100%_70%]"
                  style={{ animation: "ktl-letterStretch 1800ms cubic-bezier(0.25,0.23,0.73,0.75) infinite" }}
                >
                  {char === 'i' ? 'ı' : char}
                </span>
              );
            }

            return (
              <span key={index} className="inline-block relative tracking-[8px]">
                {char}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}

export default KineticTextLoader;
