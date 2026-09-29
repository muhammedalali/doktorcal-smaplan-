'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { 
  CalendarDays, 
  LogIn, 
  Sun,
  Moon
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // إحداثيات الماوس للبطاقات التفاعلية (Spotlight Effect)
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });

  // 🔄 فحص تلقائي للتوجيه السريع إذا كان المستخدم مسجلاً
  useEffect(() => {
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const activeUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : null);

    if (activeUser && activeUser.username) {
      router.replace('/dashboard');
    }
  }, [router]);

  // 🌐 شبكة ثلاثية الأبعاد متكيفة ذكياً مع كافة أبعاد الكمبيوتر والهواتف
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // حساب متكيف لكثافة الشبكة بناءً على أبعاد الشاشة الحالية
    let isMobile = width < 640;
    let isLargeScreen = width > 1440;
    let rows = isMobile ? 24 : (isLargeScreen ? 48 : 36);
    let cols = isMobile ? 24 : (isLargeScreen ? 48 : 36);

    let mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      isMobile = width < 640;
      isLargeScreen = width > 1440;
      rows = isMobile ? 24 : (isLargeScreen ? 48 : 36);
      cols = isMobile ? 24 : (isLargeScreen ? 48 : 36);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        setMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const render = () => {
      mouse.x += (mouse.targetX - mouse.x) * 0.25;
      mouse.y += (mouse.targetY - mouse.y) * 0.25;

      ctx.clearRect(0, 0, width, height);

      const strokeColor = isDarkMode ? 'rgba(56, 189, 248, ' : 'rgba(2, 132, 199, ';
      const dotColor = isDarkMode ? 'rgba(125, 211, 252, ' : 'rgba(3, 105, 161, ';

      // متكيف ديناميكياً مع نسبة البعد البؤري للشاشات
      const fov = isMobile ? 380 : (isLargeScreen ? 620 : 500);
      const centerY = height * 0.12;
      const centerX = width * 0.5;

      const spacing = isMobile ? 65 : (isLargeScreen ? 95 : 80); 
      const craterRadius = isMobile ? 80 : 110;

      const points: { x: number; y: number; alpha: number }[][] = [];

      for (let r = 0; r <= rows; r++) {
        points[r] = [];
        const z = (r / rows) * 750 + 100;
        const scale = fov / z;

        for (let c = 0; c <= cols; c++) {
          const worldX = (c - cols / 2) * spacing;
          const worldY = 90; 

          const projX = centerX + worldX * scale;
          const projY = centerY + worldY * scale;

          const distToMouse = Math.hypot(projX - mouse.x, projY - mouse.y);
          
          let craterDepth = 0;
          if (distToMouse < craterRadius) {
            const factor = distToMouse / craterRadius;
            craterDepth = (1 + Math.cos(factor * Math.PI)) * (isMobile ? 8 : 12); 
          }

          const alpha = Math.min(1, Math.max(0, (z - 50) / 750)) * (isDarkMode ? 0.5 : 0.75);

          points[r][c] = { 
            x: projX, 
            y: projY + craterDepth, 
            alpha
          };
        }
      }

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const pt = points[r][c];

          if (c < cols) {
            const ptNext = points[r][c + 1];
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(ptNext.x, ptNext.y);
            ctx.strokeStyle = `${strokeColor}${pt.alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          if (r < rows) {
            const ptDown = points[r + 1][c];
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(ptDown.x, ptDown.y);
            ctx.strokeStyle = `${strokeColor}${pt.alpha * 0.8})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          if (r % 2 === 0 && c % 2 === 0) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, isDarkMode ? 1.2 : 1.6, 0, Math.PI * 2);
            ctx.fillStyle = `${dotColor}${pt.alpha * 1.1})`;
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  return (
    <div className={`h-screen w-screen overflow-hidden fixed inset-0 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-300 font-sans ${
      isDarkMode ? 'bg-[#020617] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* 🌐 خلفية الكانفاس الحية ملء الشاشة 100% */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <div className={`absolute inset-0 transition-opacity duration-300 ${
          isDarkMode 
            ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/60 via-[#020617] to-[#020617]' 
            : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-slate-50 to-white'
        }`} />

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0" />

        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[600px] h-[350px] rounded-full blur-[140px] pointer-events-none transition-all duration-300 ${
          isDarkMode ? 'bg-cyan-500/10' : 'bg-sky-400/20'
        }`} />
      </div>

      {/* 📍 الهيدر العلوي الشفاف والمتكيف */}
      <div className="w-full px-4 py-3 sm:px-8 sm:py-5 flex justify-between items-center z-30 relative bg-transparent select-none">
        
        {/* العنوان الرئيسي */}
        <h1 className={`font-black text-[11px] sm:text-xs md:text-sm tracking-widest uppercase transition-colors duration-300 ${
          isDarkMode 
            ? 'text-cyan-300 drop-shadow-[0_2px_10px_rgba(34,211,238,0.3)]' 
            : 'text-blue-950 drop-shadow-sm'
        }`}>
          DOKTOR ÇALIŞMA PLANI
        </h1>

        {/* 🌙 / ☀️ زر التبديل - أيقونة عصرية مع استجابة سريعة */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className={`group relative p-2 sm:p-2.5 rounded-2xl border transition-all duration-300 active:scale-90 flex items-center justify-center cursor-pointer shadow-lg backdrop-blur-md overflow-hidden transform-gpu ${
            isDarkMode 
              ? 'bg-slate-900/40 border-cyan-500/30 text-amber-300 hover:border-amber-400 hover:shadow-amber-500/20 hover:bg-slate-900/80' 
              : 'bg-white/50 border-blue-300/80 text-blue-700 hover:border-blue-600 hover:shadow-blue-500/20 hover:bg-white/90 shadow-slate-200/60'
          }`}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/0 via-cyan-400/20 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {isDarkMode ? (
            <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 transition-transform duration-500 ease-out group-hover:rotate-180 group-hover:scale-125 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          ) : (
            <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700 transition-transform duration-500 ease-out group-hover:-rotate-45 group-hover:scale-125 drop-shadow-[0_0_8px_rgba(29,78,216,0.5)]" />
          )}
        </button>
      </div>

      {/* 🎯 المحتوى الرئيسي: حقول شفافة ومجهزة للاستجابة الحركية والمرئية الكاملة */}
      <main className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto z-10 w-full flex-1 flex items-center justify-center p-4 sm:p-6 select-none">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
          
          {/* المربع الأول: Doktor Çalışma Listesi */}
          <div 
            onClick={() => router.push('/schedule')}
            className={`group relative cursor-pointer rounded-2xl p-5 sm:p-7 border border-transparent transition-all duration-200 ease-out transform-gpu hover:-translate-y-1.5 active:scale-[0.98] flex flex-col items-center justify-center text-center overflow-hidden space-y-3.5 sm:space-y-4 ${
              isDarkMode 
                ? 'bg-[#020617]/5 backdrop-blur-[2px] hover:border-cyan-400/40 hover:bg-slate-950/20 hover:shadow-cyan-500/10 hover:shadow-2xl' 
                : 'bg-white/5 backdrop-blur-[2px] hover:border-blue-400/60 hover:bg-white/20 hover:shadow-blue-500/10 hover:shadow-2xl'
            }`}
          >
            {/* Spotlight الضوئي المتتبع للماوس */}
            <div 
              className="pointer-events-none absolute -inset-px transition-opacity duration-200 opacity-0 group-hover:opacity-100"
              style={{
                background: `radial-gradient(220px circle at ${mousePos.x}px ${mousePos.y}px, ${
                  isDarkMode ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.12)'
                }, transparent 80%)`
              }}
            />

            <div className={`absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500' 
                : 'bg-gradient-to-r from-blue-700 to-sky-600'
            }`} />

            {/* الرمز متكيف مع حجم الشاشات */}
            <div className={`w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl border flex items-center justify-center transition-all duration-200 shadow-md ${
              isDarkMode
                ? 'border-cyan-400/30 bg-cyan-950/30 text-cyan-300 group-hover:border-cyan-400 group-hover:bg-cyan-400 group-hover:text-slate-950 group-hover:scale-110 group-hover:shadow-cyan-500/30 group-hover:shadow-lg'
                : 'border-blue-400/50 bg-blue-50/80 text-blue-900 group-hover:border-blue-700 group-hover:bg-blue-700 group-hover:text-white group-hover:scale-110 group-hover:shadow-blue-500/30 group-hover:shadow-lg'
            }`}>
              <CalendarDays className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 transition-transform duration-200 stroke-[2.2]" />
            </div>

            {/* النص: سطر واحد فقط محمي ومناسب للهواتف والكمبيوتر */}
            <h2 className={`text-[11px] sm:text-xs md:text-sm font-black tracking-normal whitespace-nowrap transition-all duration-200 ${
              isDarkMode 
                ? 'text-white group-hover:text-cyan-300 group-hover:scale-105 group-hover:drop-shadow-[0_2px_8px_rgba(34,211,238,0.4)]' 
                : 'text-slate-950 group-hover:text-blue-950 group-hover:scale-105 group-hover:drop-shadow-sm'
            }`}>
              Doktor Çalışma Listesi
            </h2>
          </div>

          {/* المربع الثاني: Sisteme Giriş Yap */}
          <div 
            onClick={() => router.push('/login')}
            className={`group relative cursor-pointer rounded-2xl p-5 sm:p-7 border border-transparent transition-all duration-200 ease-out transform-gpu hover:-translate-y-1.5 active:scale-[0.98] flex flex-col items-center justify-center text-center overflow-hidden space-y-3.5 sm:space-y-4 ${
              isDarkMode 
                ? 'bg-[#020617]/5 backdrop-blur-[2px] hover:border-sky-400/40 hover:bg-slate-950/20 hover:shadow-sky-500/10 hover:shadow-2xl' 
                : 'bg-white/5 backdrop-blur-[2px] hover:border-sky-400/60 hover:bg-white/20 hover:shadow-sky-500/10 hover:shadow-2xl'
            }`}
          >
            {/* Spotlight الضوئي المتتبع للماوس */}
            <div 
              className="pointer-events-none absolute -inset-px transition-opacity duration-200 opacity-0 group-hover:opacity-100"
              style={{
                background: `radial-gradient(220px circle at ${mousePos.x}px ${mousePos.y}px, ${
                  isDarkMode ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.12)'
                }, transparent 80%)`
              }}
            />

            <div className={`absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-400' 
                : 'bg-gradient-to-r from-sky-700 to-blue-700'
            }`} />

            {/* الرمز متكيف مع حجم الشاشات */}
            <div className={`w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl border flex items-center justify-center transition-all duration-200 shadow-md ${
              isDarkMode
                ? 'border-sky-400/30 bg-sky-950/30 text-sky-300 group-hover:border-sky-400 group-hover:bg-sky-400 group-hover:text-slate-950 group-hover:scale-110 group-hover:shadow-sky-500/30 group-hover:shadow-lg'
                : 'border-sky-400/50 bg-sky-50/80 text-sky-900 group-hover:border-sky-700 group-hover:bg-sky-700 group-hover:text-white group-hover:scale-110 group-hover:shadow-sky-500/30 group-hover:shadow-lg'
            }`}>
              <LogIn className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 transition-transform duration-200 stroke-[2.2]" />
            </div>

            {/* النص: سطر واحد فقط محمي ومناسب للهواتف والكمبيوتر */}
            <h2 className={`text-[11px] sm:text-xs md:text-sm font-black tracking-normal whitespace-nowrap transition-all duration-200 ${
              isDarkMode 
                ? 'text-white group-hover:text-sky-300 group-hover:scale-105 group-hover:drop-shadow-[0_2px_8px_rgba(56,189,248,0.4)]' 
                : 'text-slate-950 group-hover:text-sky-950 group-hover:scale-105 group-hover:drop-shadow-sm'
            }`}>
              Sisteme Giriş Yap
            </h2>
          </div>

        </div>
      </main>

    </div>
  );
}