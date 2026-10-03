'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { CalendarDays, LogIn, Sun, Moon } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ⏳ حالة التحميل عند الضغط على البطاقات (1 للبطاقة الأولى، 2 للثانية)
  const [loadingCard, setLoadingCard] = useState<number | null>(null);

  // زوايا الإمالة وإحداثيات البؤرة الضوئية للبطاقتين
  const [card1Style, setCard1Style] = useState({ transform: '', spotX: '50%', spotY: '50%' });
  const [card2Style, setCard2Style] = useState({ transform: '', spotX: '50%', spotY: '50%' });

  // 🛡️ حارس الصفحة الرئيسية: منع الخروج بالرجوع وإبقاء المستخدم في الصفحة الرئيسية دائماً
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.history.pushState({ page: 'home_guard' }, '', window.location.href);

    const handlePopState = () => {
      window.history.pushState({ page: 'home_guard' }, '', window.location.href);
      // إظهار رمز التحميل الفاخر فوراً عند استخدام زر الرجوع
      setLoadingCard(1);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // 🔄 فحص التوجيه للوحة التحكم إن كان المستخدم مسجل الدخول بالفعل
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const activeUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : null);

    if (activeUser && activeUser.username) {
      const isNavigatingBack = window.performance && 
        window.performance.getEntriesByType('navigation')[0]?.type === 'back_forward';

      if (!isNavigatingBack) {
        router.replace('/dashboard');
      }
    }
  }, [router]);

  // 🚀 دالة التعامل مع النقر مع إظهار الرمز العصري فقط
  const handleCardClick = (cardNum: number, path: string) => {
    if (loadingCard !== null) return;
    setLoadingCard(cardNum);

    setTimeout(() => {
      router.replace(path);
    }, 380);
  };

  // ⚡ متابعة حركة الماوس
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || window.innerWidth < 640) return;
    const { clientX, clientY } = e;
    
    containerRef.current.style.setProperty('--mouse-x', `${clientX}px`);
    containerRef.current.style.setProperty('--mouse-y', `${clientY}px`);
  };

  // 💎 حساب الإمالة ثلاثية الأبعاد
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardNum: number) => {
    if (window.innerWidth < 640 || loadingCard !== null) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    const spotX = `${(x / rect.width) * 100}%`;
    const spotY = `${(y / rect.height) * 100}%`;

    const transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    if (cardNum === 1) {
      setCard1Style({ transform, spotX, spotY });
    } else {
      setCard2Style({ transform, spotX, spotY });
    }
  };

  const resetCardTilt = (cardNum: number) => {
    if (window.innerWidth < 640) return;
    const resetState = { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)', spotX: '50%', spotY: '50%' };
    if (cardNum === 1) setCard1Style(resetState);
    else setCard2Style(resetState);
  };

  // 🎨 رسم الجزيئات المضيئة
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const setupCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    setupCanvasSize();

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(setupCanvasSize, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    const particleCount = width < 640 ? 20 : 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: isDarkMode ? Math.random() * 0.6 + 0.2 : Math.random() * 0.5 + 0.35
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const particleColor = isDarkMode ? '#38bdf8' : '#0284c7';

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = particleColor;
        
        ctx.shadowColor = particleColor;
        ctx.shadowBlur = isDarkMode ? 4 : 3;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`h-screen w-screen overflow-hidden fixed inset-0 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-500 font-sans overscroll-none touch-none select-none ${
        isDarkMode ? 'bg-[#030712] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
      }`}
      style={{
        '--mouse-x': '-1000px',
        '--mouse-y': '-1000px',
      } as React.CSSProperties}
    >
      {/* 🌐 خلفية الأورورا الضوئية */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <div className={`absolute top-[-25%] left-[-15%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full blur-[140px] pointer-events-none ${
          isDarkMode ? 'bg-cyan-600/15' : 'bg-sky-400/25'
        }`} />

        <div className={`absolute bottom-[-25%] right-[-15%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full blur-[140px] pointer-events-none ${
          isDarkMode ? 'bg-blue-700/15' : 'bg-indigo-300/30'
        }`} />

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0 transform-gpu" />

        <div 
          className={`hidden sm:block absolute w-[450px] h-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-75 pointer-events-none transform-gpu transition-opacity duration-300 ${
            isDarkMode ? 'bg-cyan-400/15' : 'bg-sky-400/30'
          }`}
          style={{
            left: 'var(--mouse-x)',
            top: 'var(--mouse-y)',
          }}
        />
      </div>

      {/* 📍 الهيدر العلوي */}
      <div className="w-full px-5 py-4 sm:px-10 sm:py-6 flex justify-end items-center z-30 relative bg-transparent select-none">
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className={`group relative flex items-center w-20 h-10 sm:w-22 sm:h-11 rounded-full p-1 border transition-all duration-500 cursor-pointer shadow-2xl backdrop-blur-2xl overflow-hidden transform-gpu active:scale-95 ${
            isDarkMode 
              ? 'bg-slate-900/80 border-cyan-500/30 shadow-cyan-950/50 hover:border-cyan-400/60' 
              : 'bg-white/80 border-slate-300/80 shadow-slate-300/60 hover:border-blue-400'
          }`}
        >
          <div className={`absolute inset-0 transition-opacity duration-500 rounded-full blur-sm -z-10 ${
            isDarkMode ? 'bg-cyan-500/20 opacity-100' : 'bg-amber-400/20 opacity-100'
          }`} />

          <div 
            className={`absolute top-1 bottom-1 w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-lg transform-gpu ${
              isDarkMode 
                ? 'translate-x-10 sm:translate-x-11 bg-gradient-to-tr from-cyan-950 to-slate-900 border border-cyan-400/50 shadow-cyan-500/40' 
                : 'translate-x-0 bg-gradient-to-tr from-amber-400 to-amber-300 border border-amber-200/80 shadow-amber-400/50'
            }`}
          />

          <div className="relative z-10 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9">
            <Sun className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-all duration-500 ${
              isDarkMode 
                ? 'text-slate-500 opacity-40 scale-75 rotate-45' 
                : 'text-slate-950 opacity-100 scale-100 rotate-0 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]'
            }`} />
          </div>

          <div className="relative z-10 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 ml-2 sm:ml-2.5">
            <Moon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-all duration-500 ${
              isDarkMode 
                ? 'text-cyan-300 opacity-100 scale-100 rotate-0 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' 
                : 'text-slate-400 opacity-40 scale-75 -rotate-45'
            }`} />
          </div>
        </button>
      </div>

      {/* 🎯 المحتوى الرئيسي */}
      <main className="max-w-lg sm:max-w-xl md:max-w-2xl mx-auto z-10 w-full flex-1 flex items-center justify-center p-4 sm:p-6 select-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 md:gap-10 w-full">
          
          {/* 1️⃣ البطاقة الأولى: Doktor Çalışma Listesi */}
          <div 
            onClick={() => handleCardClick(1, '/schedule')}
            onMouseMove={(e) => handleCardMouseMove(e, 1)}
            onMouseLeave={() => resetCardTilt(1)}
            style={{
              transform: card1Style.transform,
              transition: card1Style.transform.includes('0deg') ? 'all 0.4s ease-out' : 'none'
            }}
            className={`group relative cursor-pointer flex flex-col items-center justify-center text-center p-5 sm:p-6 md:p-7 rounded-[2rem] border transition-all duration-500 transform-gpu overflow-hidden active:scale-95 ${
              loadingCard === 1
                ? isDarkMode 
                  ? 'bg-slate-900/90 border-cyan-400/90 shadow-2xl shadow-cyan-950/60 scale-95' 
                  : 'bg-white/95 border-sky-500 shadow-2xl shadow-sky-200 scale-95'
                : isDarkMode
                ? 'bg-transparent border-transparent sm:hover:bg-slate-900/60 sm:hover:border-cyan-400/90 sm:hover:backdrop-blur-2xl sm:hover:shadow-2xl sm:hover:shadow-cyan-950/40'
                : 'bg-transparent border-transparent sm:hover:bg-white/85 sm:hover:border-sky-500 sm:hover:backdrop-blur-2xl sm:hover:shadow-2xl sm:hover:shadow-slate-300/80'
            }`}
          >
            <div 
              className="hidden sm:block pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2rem]"
              style={{
                background: `radial-gradient(280px circle at ${card1Style.spotX} ${card1Style.spotY}, ${
                  isDarkMode ? 'rgba(56, 189, 248, 0.22)' : 'rgba(2, 132, 199, 0.18)'
                }, transparent 80%)`
              }}
            />

            <div className="relative mb-3 sm:mb-4">
              <div className={`hidden sm:block absolute -inset-3 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                isDarkMode ? 'bg-cyan-400/50' : 'bg-sky-400/40'
              }`} />

              <div className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-3xl border transition-all duration-300 flex items-center justify-center shadow-lg ${
                loadingCard === 1
                  ? isDarkMode
                    ? 'border-cyan-400 bg-slate-950/90 text-cyan-300 shadow-[0_0_35px_rgba(34,211,238,0.7)]'
                    : 'border-sky-500 bg-white text-sky-600 shadow-[0_0_35px_rgba(2,132,199,0.35)]'
                  : isDarkMode
                  ? 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300 sm:group-hover:border-cyan-300 sm:group-hover:bg-cyan-400 sm:group-hover:text-slate-950 sm:group-hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]'
                  : 'border-sky-300/70 bg-white/90 text-sky-900 sm:group-hover:border-sky-600 sm:group-hover:bg-sky-600 sm:group-hover:text-white sm:group-hover:shadow-[0_0_30px_rgba(2,132,199,0.4)]'
              }`}>
                {loadingCard === 1 ? (
                  /* ⚛️ الرمز الدوار المزدوج المتقن والعصري (واضح تماماً في النهار والليل وبدون أي كتابة) */
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                    {/* الحلقة الخارجية المتدرجة النيونية */}
                    <div className={`absolute inset-0 rounded-full p-[2.5px] animate-[spin_1.3s_linear_infinite] ${
                      isDarkMode 
                        ? 'bg-gradient-to-tr from-cyan-400 via-teal-300 to-emerald-400 shadow-[0_0_18px_rgba(34,211,238,0.7)]' 
                        : 'bg-gradient-to-tr from-sky-600 via-teal-500 to-emerald-600 shadow-[0_0_15px_rgba(2,132,199,0.4)]'
                    }`}>
                      <div className={`w-full h-full rounded-full ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}></div>
                    </div>

                    {/* الحلقة الداخلية المعاكسة */}
                    <div className={`absolute inset-1.5 rounded-full p-[2px] animate-[spin_0.85s_linear_infinite_reverse] ${
                      isDarkMode 
                        ? 'bg-gradient-to-bl from-emerald-400 via-teal-400 to-cyan-400' 
                        : 'bg-gradient-to-bl from-emerald-600 via-sky-500 to-blue-600'
                    }`}>
                      <div className={`w-full h-full rounded-full ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}></div>
                    </div>

                    {/* النواة المضيئة المركزية */}
                    <span className={`w-3 h-3 rounded-full animate-ping ${
                      isDarkMode ? 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,1)]' : 'bg-sky-600 shadow-[0_0_10px_rgba(2,132,199,0.8)]'
                    }`} />
                  </div>
                ) : (
                  <CalendarDays className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 transition-transform duration-300 stroke-[2.3] sm:group-hover:scale-110 sm:group-hover:rotate-3 subpixel-antialiased" />
                )}
              </div>
            </div>

            <h2 className={`text-sm sm:text-base md:text-lg font-black tracking-wide whitespace-nowrap transition-all duration-300 ${
              isDarkMode 
                ? 'text-slate-100 sm:group-hover:text-cyan-300 sm:group-hover:drop-shadow-[0_1px_8px_rgba(34,211,238,0.8)]' 
                : 'text-slate-950 sm:group-hover:text-sky-950 font-extrabold'
            }`}>
              Doktor Çalışma Listesi
            </h2>
          </div>

          {/* 2️⃣ البطاقة الثانية: Sisteme Giriş Yap */}
          <div 
            onClick={() => handleCardClick(2, '/login')}
            onMouseMove={(e) => handleCardMouseMove(e, 2)}
            onMouseLeave={() => resetCardTilt(2)}
            style={{
              transform: card2Style.transform,
              transition: card2Style.transform.includes('0deg') ? 'all 0.4s ease-out' : 'none'
            }}
            className={`group relative cursor-pointer flex flex-col items-center justify-center text-center p-5 sm:p-6 md:p-7 rounded-[2rem] border transition-all duration-500 transform-gpu overflow-hidden active:scale-95 ${
              loadingCard === 2
                ? isDarkMode 
                  ? 'bg-slate-900/90 border-blue-400/90 shadow-2xl shadow-blue-950/60 scale-95' 
                  : 'bg-white/95 border-blue-600 shadow-2xl shadow-blue-200 scale-95'
                : isDarkMode
                ? 'bg-transparent border-transparent sm:hover:bg-slate-900/60 sm:hover:border-blue-400/90 sm:hover:backdrop-blur-2xl sm:hover:shadow-2xl sm:hover:shadow-blue-950/40'
                : 'bg-transparent border-transparent sm:hover:bg-white/85 sm:hover:border-blue-600 sm:hover:backdrop-blur-2xl sm:hover:shadow-2xl sm:hover:shadow-slate-300/80'
            }`}
          >
            <div 
              className="hidden sm:block pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2rem]"
              style={{
                background: `radial-gradient(280px circle at ${card2Style.spotX} ${card2Style.spotY}, ${
                  isDarkMode ? 'rgba(99, 102, 241, 0.22)' : 'rgba(37, 99, 235, 0.18)'
                }, transparent 80%)`
              }}
            />

            <div className="relative mb-3 sm:mb-4">
              <div className={`hidden sm:block absolute -inset-3 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                isDarkMode ? 'bg-blue-400/50' : 'bg-blue-500/40'
              }`} />

              <div className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-3xl border transition-all duration-300 flex items-center justify-center shadow-lg ${
                loadingCard === 2
                  ? isDarkMode
                    ? 'border-blue-400 bg-slate-950/90 text-blue-300 shadow-[0_0_35px_rgba(96,165,250,0.7)]'
                    : 'border-blue-600 bg-white text-blue-600 shadow-[0_0_35px_rgba(37,99,235,0.35)]'
                  : isDarkMode
                  ? 'border-blue-500/30 bg-blue-950/40 text-blue-300 sm:group-hover:border-blue-300 sm:group-hover:bg-blue-400 sm:group-hover:text-slate-950 sm:group-hover:shadow-[0_0_30px_rgba(96,165,250,0.6)]'
                  : 'border-blue-300/70 bg-white/90 text-blue-900 sm:group-hover:border-blue-600 sm:group-hover:bg-blue-600 sm:group-hover:text-white sm:group-hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]'
              }`}>
                {loadingCard === 2 ? (
                  /* ⚛️ الرمز الدوار المزدوج المتقن والعصري (واضح تماماً في النهار والليل وبدون أي كتابة) */
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                    {/* الحلقة الخارجية المتدرجة النيونية */}
                    <div className={`absolute inset-0 rounded-full p-[2.5px] animate-[spin_1.3s_linear_infinite] ${
                      isDarkMode 
                        ? 'bg-gradient-to-tr from-blue-400 via-indigo-300 to-cyan-400 shadow-[0_0_18px_rgba(96,165,250,0.7)]' 
                        : 'bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                    }`}>
                      <div className={`w-full h-full rounded-full ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}></div>
                    </div>

                    {/* الحلقة الداخلية المعاكسة */}
                    <div className={`absolute inset-1.5 rounded-full p-[2px] animate-[spin_0.85s_linear_infinite_reverse] ${
                      isDarkMode 
                        ? 'bg-gradient-to-bl from-cyan-400 via-blue-400 to-indigo-500' 
                        : 'bg-gradient-to-bl from-cyan-600 via-blue-600 to-indigo-700'
                    }`}>
                      <div className={`w-full h-full rounded-full ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}></div>
                    </div>

                    {/* النواة المضيئة المركزية */}
                    <span className={`w-3 h-3 rounded-full animate-ping ${
                      isDarkMode ? 'bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,1)]' : 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)]'
                    }`} />
                  </div>
                ) : (
                  <LogIn className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 transition-transform duration-300 stroke-[2.3] sm:group-hover:scale-110 sm:group-hover:translate-x-0.5 subpixel-antialiased" />
                )}
              </div>
            </div>

            <h2 className={`text-sm sm:text-base md:text-lg font-black tracking-wide whitespace-nowrap transition-all duration-300 ${
              isDarkMode 
                ? 'text-slate-100 sm:group-hover:text-blue-300 sm:group-hover:drop-shadow-[0_1px_8px_rgba(96,165,250,0.8)]' 
                : 'text-slate-950 sm:group-hover:text-blue-950 font-extrabold'
            }`}>
              Sisteme Giriş Yap
            </h2>
          </div>

        </div>
      </main>

    </div>
  );
}