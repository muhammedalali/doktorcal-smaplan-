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

  return (
    <>
      {/* 🌫️ خلفية ضبابية خفيفة عالية النقاء ومطابقة لشاشة التحميل الرئيسية */}
      <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950/65 dark:bg-slate-950/75 backdrop-blur-md sm:backdrop-blur-lg transition-all duration-300 animate-fadeIn select-none pointer-events-auto text-slate-100 antialiased">
        
        {/* 🚀 رمز التحميل العصري (Ultra-Modern Dual-Ring Neon Spinner) */}
        <div className="relative flex flex-col items-center justify-center transform-gpu">
          
          {/* وهج نيون ناعم يبرز الرمز بدقة عالية */}
          <div className="absolute w-36 h-36 rounded-full blur-2xl pointer-events-none bg-gradient-to-r from-cyan-500/25 to-emerald-500/25 shadow-[0_0_60px_rgba(34,211,238,0.25)] transition-all duration-700 ease-in-out" />

          {/* الحاوية الدائرية للرمز العصري */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-6">
            
            {/* الحلقة الخارجية المتوهجة (Outer Rotating Gradient Ring) */}
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-emerald-400 dark:border-t-cyan-300 dark:border-r-emerald-300 animate-[spin_1.2s_linear_infinite] transform-gpu shadow-[0_0_15px_rgba(34,211,238,0.5)]" />

            {/* الحلقة الداخلية للدوران العكسي (Inner Counter-Rotating Neon Ring) */}
            <div className="absolute inset-2 sm:inset-2.5 rounded-full border-2 border-transparent border-b-sky-400 border-l-teal-300 dark:border-b-sky-300 dark:border-l-teal-200 animate-[spin_1.8s_linear_infinite_reverse] transform-gpu opacity-90 shadow-[0_0_12px_rgba(20,184,166,0.4)]" />

            {/* النواة المركزية المضيئة (Glowing Orbiting Core) */}
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-cyan-500/30 shadow-inner">
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-cyan-400 dark:bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,1)] animate-ping duration-1000" />
            </div>

          </div>

          {/* 🔤 النص بحجم مصغر وأنيق جداً وبدقة عالية UHD */}
          <div className="z-10 flex items-center justify-center gap-0.5 subpixel-antialiased">
            <h3 className="text-xs sm:text-sm font-black tracking-[0.3em] uppercase font-sans text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-teal-200 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
              {message}
            </h3>
            <span className="w-4 text-left font-mono font-black text-xs sm:text-sm text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
              {dots}
            </span>
          </div>

        </div>

      </div>
    </>
  );
}