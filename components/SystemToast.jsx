'use client';

import React, { useEffect, useRef, useState } from 'react';

/* ============================================================
   🌟 الشعار — كما هو (لم يتغيّر)
   ============================================================ */
export function UltraLuxuryLogo() {
  return (
    <div className="relative flex items-center justify-center w-14 h-14 shrink-0 rounded-2xl bg-slate-950/90 p-2.5 border border-cyan-400/50 shadow-[0_0_30px_rgba(0,242,254,0.35)] group overflow-hidden">
      <div className="absolute inset-[-100%] animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(0,242,254,0.6)_360deg)] opacity-70" />
      <div className="absolute inset-[1px] bg-slate-950/90 rounded-[15px] backdrop-blur-xl z-0" />
      <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_3s_infinite] z-10" />
      <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-20 drop-shadow-[0_0_15px_rgba(0,242,254,0.9)] transition-transform duration-500 group-hover:scale-110">
        <defs>
          <linearGradient id="cyberCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F2FE" />
            <stop offset="50%" stopColor="#4FACFE" />
            <stop offset="100%" stopColor="#0052D4" />
          </linearGradient>
          <linearGradient id="cyberRoseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF0844" />
            <stop offset="100%" stopColor="#FF4E50" />
          </linearGradient>
          <filter id="ultraGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d="M256 40 L416 110 V270 C416 370 256 460 256 460 C256 460 96 370 96 270 V110 Z" fill="rgba(0, 242, 254, 0.06)" stroke="url(#cyberCyanGrad)" strokeWidth="16" strokeLinejoin="round" />
        <g filter="url(#ultraGlowFilter)">
          <path d="M165 210 L125 256 L165 302" stroke="url(#cyberCyanGrad)" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M347 210 L387 256 L347 302" stroke="url(#cyberCyanGrad)" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M175 256 H215 L235 185 L265 325 L295 220 L315 256 H337" stroke="url(#cyberRoseGrad)" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="265" cy="185" r="12" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
}

/* ============================================================
   🔔 النافذة — أخضر زمردي حقيقي + كتابة واضحة + بدون وميض
   ============================================================ */
export default function SystemToastNotification({ toast, onDismiss }) {
  const duration = toast.duration || 5000;
  const [progress, setProgress] = useState(100);
  const [mounted, setMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // ref ثابت لتجنّب إعادة تشغيل الـ effects عند تغيّر مرجع onDismiss
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  // 1) أنيميشن الدخول — يُشغَّل مرة واحدة بعد mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // 2) عدّاد تقدّم مبني على الوقت الفعلي (أدق وأثبت)
  useEffect(() => {
    const startTime = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(intervalId);
    }, 40);
    return () => clearInterval(intervalId);
  }, [duration]);

  // 3) الخروج — مرة واحدة فقط
  useEffect(() => {
    if (progress <= 0 && !isExiting) {
      setIsExiting(true);
      const t = setTimeout(() => onDismissRef.current(toast.id), 220);
      return () => clearTimeout(t);
    }
  }, [progress, isExiting, toast.id]);

  const isNegative = toast.type === 'error' || toast.type === 'delete';

  /* تحريك عبر style مباشر — لا وميض، لا snap-back */
  const containerStyle = {
    transform: isExiting
      ? 'translateY(10px) scale(0.96)'
      : mounted
      ? 'translateY(0) scale(1)'
      : 'translateY(10px) scale(0.96)',
    opacity: isExiting ? 0 : mounted ? 1 : 0,
    transition: isExiting
      ? 'opacity 200ms ease-in, transform 200ms ease-in'
      : 'opacity 300ms cubic-bezier(0.16,1,0.3,1), transform 300ms cubic-bezier(0.16,1,0.3,1)',
    willChange: 'opacity, transform',
  };

  return (
    <div
      dir="ltr"
      style={containerStyle}
      className={`relative w-full max-w-xs overflow-hidden rounded-xl select-none mb-2.5 backdrop-blur-sm ${
        isNegative
          ? 'bg-gradient-to-br from-[#be123c] via-[#9f1239] to-[#7f1d1d] border border-rose-300/60 shadow-[0_8px_28px_-6px_rgba(190,18,60,0.55)]'
          : 'bg-gradient-to-br from-[#10b981] via-[#059669] to-[#047857] border border-emerald-300/70 shadow-[0_8px_28px_-6px_rgba(5,150,105,0.55)]'
      }`}
    >
      {/* شريط جانبي رفيع */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[3px] ${
          isNegative
            ? 'bg-gradient-to-b from-rose-200 via-rose-300/60 to-transparent'
            : 'bg-gradient-to-b from-emerald-100 via-emerald-200/70 to-transparent'
        }`}
      />

      {/* لمعة كريستالية علوية */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

      <div className="flex items-start gap-3 px-3.5 py-3 pl-4">
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4
              className={`text-[10px] font-extrabold uppercase mb-1 tracking-[0.18em] ${
                isNegative ? 'text-rose-50' : 'text-emerald-50'
              }`}
            >
              {toast.title}
            </h4>
          )}

          {/* رسالة واضحة جدًا: أبيض نقي + semibold + ظلّ نص خفيف */}
          <p className="text-[14px] font-semibold leading-snug tracking-[0.005em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.3)] break-words">
            {toast.message}
          </p>
        </div>

        {/* زر إغلاق واضح — أبيض صريح مع ✕ داكنة */}
        <button
          onClick={() => onDismissRef.current(toast.id)}
          aria-label="Close notification"
          className="mt-0.5 w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-extrabold shrink-0 transition-all duration-200 cursor-pointer active:scale-90 bg-white/95 hover:bg-white text-slate-800 shadow-sm"
        >
          ✕
        </button>
      </div>

      {/* شريط تقدّم */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/20">
        <div
          className={`h-full transition-[width] duration-[40ms] ease-linear ${
            isNegative
              ? 'bg-gradient-to-r from-rose-100 to-white'
              : 'bg-gradient-to-r from-emerald-100 to-white'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}