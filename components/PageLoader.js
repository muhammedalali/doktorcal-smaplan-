'use client';

import { useState, useEffect } from 'react';

export default function PageLoader({ show, message = 'YÜKLENİYOR' }) {
  const [dots, setDots] = useState('');

  // أنيميشن النقاط المتحركة (...)
  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 300);

    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  const dotCount = 12;
  const dotsArray = Array.from({ length: dotCount });

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950/80 dark:bg-slate-950/85 backdrop-blur-2xl transition-all duration-300 animate-fadeIn select-none pointer-events-auto">
      
      {/* 🔮 الحاوية المركزية */}
      <div className="relative flex flex-col items-center text-center max-w-xs w-full">
        
        {/* وهج نيون ناعم خلف الرمز */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-cyan-500/15 dark:bg-cyan-500/20 blur-3xl pointer-events-none animate-pulse" />

        {/* 💫 الرمز الدائري بحجم أكبر ودقة عالية جداً (High-DPI Ultra-Sharp Radial Dots) */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-6">
          
          {/* محرك دوران الدوائر بتقنية حادة ودقيقة */}
          <div className="relative w-full h-full animate-[spin_1.1s_steps(12)_infinite] transform-gpu">
            {dotsArray.map((_, index) => {
              const angle = (index * 360) / dotCount;
              const opacity = (index + 1) / dotCount;

              return (
                <div
                  key={index}
                  className="absolute top-0 left-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 -ml-1.75 sm:-ml-2 origin-[50%_48px] sm:origin-[50%_56px]"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    opacity: opacity,
                  }}
                >
                  <span className="block w-full h-full rounded-full bg-gradient-to-tr from-cyan-400 via-teal-300 to-sky-400 dark:from-cyan-300 dark:to-emerald-400 shadow-[0_0_12px_rgba(34,211,238,0.95)] subpixel-antialiased" />
                </div>
              );
            })}
          </div>

        </div>

        {/* 📝 كتابة YÜKLENİYOR... بحجم مصغر وأنيق جداً */}
        <div className="z-10 flex items-center justify-center gap-0.5">
          <h3 className="text-xs sm:text-sm font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-teal-300 dark:from-cyan-200 dark:via-white dark:to-emerald-300 uppercase font-sans">
            {message}
          </h3>
          <span className="w-4 text-left text-cyan-400 font-mono font-black text-xs sm:text-sm">
            {dots}
          </span>
        </div>

      </div>

    </div>
  );
}