'use client'; 
import { useState, useEffect, useRef } from 'react'; 
import { useRouter } from 'next/navigation'; 
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useTheme } from '@/context/ThemeContext';

// 🩺 شاشة التحميل بنمط نبض النيون الأخضر الطبي Soft Luxe
function SeamlessECGLoader({ title = "YÜKLENİYOR...", isDarkMode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let x = 0;
    const speed = 2.8;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 320;
      canvas.height = 60;
    };
    resize();
    window.addEventListener('resize', resize);

    const getECGPoint = (xPos, width, height) => {
      const midY = height / 2;
      const cycleLength = width * 0.45; 
      const pos = (xPos % cycleLength) / cycleLength;

      if (pos >= 0.15 && pos < 0.22) {
        return midY - Math.sin((pos - 0.15) / 0.07 * Math.PI) * 3;
      }
      if (pos >= 0.25 && pos < 0.28) {
        return midY + 4;
      }
      if (pos >= 0.28 && pos < 0.33) {
        const t = (pos - 0.28) / 0.05;
        return midY - (Math.sin(t * Math.PI) * (height * 0.42));
      }
      if (pos >= 0.33 && pos < 0.37) {
        const t = (pos - 0.33) / 0.04;
        return midY + (Math.sin(t * Math.PI) * (height * 0.30));
      }
      if (pos >= 0.37 && pos < 0.40) {
        return midY - 3;
      }
      if (pos >= 0.45 && pos < 0.58) {
        return midY - Math.sin((pos - 0.45) / 0.13 * Math.PI) * 6;
      }
      return midY;
    };

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      ctx.beginPath();
      ctx.strokeStyle = isDarkMode ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.3)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < width; i++) {
        const y = getECGPoint(i, width, height);
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      const tailLength = 90;
      for (let i = 0; i < tailLength; i++) {
        const currentX = (x - i + width) % width;
        const currentY = getECGPoint(currentX, width, height);
        const alpha = Math.pow(1 - i / tailLength, 1.5);

        ctx.strokeStyle = isDarkMode 
          ? `rgba(16, 185, 129, ${alpha})` 
          : `rgba(5, 150, 105, ${alpha})`;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = isDarkMode ? '#10b981' : '#059669';
        ctx.shadowBlur = i < 15 ? 6 : 1;

        ctx.beginPath();
        const prevX = (currentX - 1 + width) % width;
        const prevY = getECGPoint(prevX, width, height);
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      x = (x + speed) % width;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isDarkMode]);

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fadeIn select-none pointer-events-none">
      <div className={`flex flex-col items-center text-center gap-4 max-w-sm w-full p-6 rounded-3xl shadow-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-emerald-100 text-slate-800'}`}>
        <div className={`w-full h-14 relative overflow-hidden rounded-2xl p-2 border ${isDarkMode ? 'bg-slate-950/70 border-emerald-900/40' : 'bg-emerald-50/80 border-emerald-200'}`}>
          <canvas ref={canvasRef} className="w-full h-full block bg-transparent" />
        </div>
        <h2 className={`text-xs font-bold tracking-wider uppercase ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
          {title}
        </h2>
      </div>
    </div>
  );
}

// 💓 مكون الشعار المدمج
function HeaderECGLogo({ isDarkMode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let x = 0;
    const speed = 1.6;

    const resize = () => {
      canvas.width = 135;
      canvas.height = 16;
    };
    resize();

    const getECGPoint = (xPos, width, height) => {
      const midY = height / 2;
      const cycleLength = width * 0.48;
      const pos = (xPos % cycleLength) / cycleLength;

      if (pos >= 0.12 && pos < 0.20) {
        return midY - Math.sin((pos - 0.12) / 0.08 * Math.PI) * 1.2;
      }
      if (pos >= 0.22 && pos < 0.25) {
        return midY + 2;
      }
      if (pos >= 0.25 && pos < 0.30) {
        const t = (pos - 0.25) / 0.05;
        return midY - (Math.sin(t * Math.PI) * (height * 0.40));
      }
      if (pos >= 0.30 && pos < 0.35) {
        const t = (pos - 0.30) / 0.05;
        return midY + (Math.sin(t * Math.PI) * (height * 0.35));
      }
      if (pos >= 0.35 && pos < 0.38) {
        return midY - 1.5;
      }
      if (pos >= 0.45 && pos < 0.60) {
        return midY - Math.sin((pos - 0.45) / 0.15 * Math.PI) * 2.5;
      }
      return midY;
    };

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      ctx.beginPath();
      ctx.strokeStyle = isDarkMode ? 'rgba(16, 185, 129, 0.25)' : 'rgba(5, 150, 105, 0.3)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < width; i++) {
        const y = getECGPoint(i, width, height);
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      const tailLength = 50;
      for (let i = 0; i < tailLength; i++) {
        const currentX = (x - i + width) % width;
        const currentY = getECGPoint(currentX, width, height);
        const alpha = Math.pow(1 - i / tailLength, 1.3);

        ctx.strokeStyle = isDarkMode 
          ? `rgba(16, 185, 129, ${alpha})`
          : `rgba(5, 150, 105, ${alpha})`;
        ctx.lineWidth = 1.8;

        ctx.beginPath();
        const prevX = (currentX - 1 + width) % width;
        const prevY = getECGPoint(prevX, width, height);
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
      }

      const headY = getECGPoint(x, width, height);
      ctx.beginPath();
      ctx.arc(x, headY, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = isDarkMode ? '#34d399' : '#047857';
      ctx.shadowColor = isDarkMode ? '#10b981' : '#059669';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      x = (x + speed) % width;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isDarkMode]);

  return <canvas ref={canvasRef} className="w-[135px] h-[16px] block bg-transparent" />;
}

export default function DashboardPage() {   
  const [currentUser, setCurrentUser] = useState(null);   
  const [showExitModal, setShowExitModal] = useState(false);

  const { isDarkMode, toggleTheme } = useTheme();

  const [isOtherOperationsOpen, setIsOtherOperationsOpen] = useState(false);
  const [isModulesOpen, setIsModulesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [isEcgLoading, setIsEcgLoading] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState('YÜKLENİYOR...');

  const otherOperationsRef = useRef(null);
  const modulesRef = useRef(null);
  const profileRef = useRef(null);
  const router = useRouter();   

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (otherOperationsRef.current && !otherOperationsRef.current.contains(event.target)) {
        setIsOtherOperationsOpen(false);
      }
      if (modulesRef.current && !modulesRef.current.contains(event.target)) {
        setIsModulesOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {     
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const activeUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : null);

    if (!activeUser || !activeUser.username) {
      router.push('/');
      return;
    }
    setCurrentUser(activeUser);   

    let unsubscribeUser = () => {};
    if (activeUser.id) {
      unsubscribeUser = onSnapshot(doc(db, 'users', activeUser.id), (docSnap) => {
        if (docSnap.exists()) {
          const freshData = { id: docSnap.id, ...docSnap.data() };
          setCurrentUser(freshData);
          sessionStorage.setItem('user', JSON.stringify(freshData));
          if (localUser) localStorage.setItem('user', JSON.stringify(freshData));
        }
      });
    }

    return () => unsubscribeUser();
  }, [router]);   

  const handleConfirmExit = () => {
    setShowExitModal(false);
    setLoadingTitle('SİSTEMDEN ÇIKIŞ YAPILIYOR...');
    setIsEcgLoading(true);
    setTimeout(() => {
      sessionStorage.removeItem('user');
      localStorage.removeItem('user');
      router.push('/');
    }, 600);
  };

  const handleOpenModule = (path, title) => {
    setIsOtherOperationsOpen(false);
    setIsModulesOpen(false);
    setIsProfileOpen(false);
    setLoadingTitle(title.toUpperCase());
    setIsEcgLoading(true);

    setTimeout(() => {
      router.push(path);
    }, 250);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const uName = currentUser?.username ? currentUser.username.toLocaleUpperCase('tr-TR') : '';   
  const isGlobalAdmin = uName === 'ADMIN' || currentUser?.role === 'YÖNETİCİ' || currentUser?.role === 'ADMIN';   

  // 🔗 تحديث صلاحية الوصول المباشر والربط مع صفحة الإدارة
  const canManageDoctors = 
    isGlobalAdmin || 
    Boolean(currentUser?.permissions?.canEditDoctors) || 
    Boolean(currentUser?.permissions?.canEditSchedule) || 
    Boolean(currentUser?.permissions?.canDeleteDoctors) || 
    Boolean(currentUser?.permissions?.canDeleteSchedule);

  const hasAuthorizedModules = isGlobalAdmin || canManageDoctors;

  const otherOperationsList = [
    { id: 'schedule', title: 'DOKTOR ÇALIŞMA PLANLARI', path: '/schedule', show: true },
    { id: 'phonebook', title: 'TELEFON REHBERİ', path: '/phonebook', show: true },
  ];

  const softLuxeBtnStyle = `h-10 px-4 rounded-xl flex items-center gap-2 text-xs font-bold transition-all duration-150 cursor-pointer border shadow-xs active:scale-95 ${
    isDarkMode 
      ? 'bg-slate-800/80 border-slate-700/80 text-slate-100 hover:bg-slate-800 hover:border-emerald-500/50 hover:text-emerald-400' 
      : 'bg-slate-50/90 border-slate-200/90 text-slate-800 hover:bg-emerald-50/60 hover:border-emerald-300 hover:text-emerald-700'
  }`;

  const statsData = [
    { label: 'TOPLAM', value: 128, color: '#10b981' },
    { label: 'POLİKLİNİK', value: 84, color: '#06b6d4' },
    { label: 'İZİN', value: 8, color: '#6366f1' },
    { label: 'AMELİYAT', value: 12, color: '#f43f5e' },
    { label: 'RAPOR', value: 14, color: '#f59e0b' },
    { label: 'DİĞER', value: 10, color: '#a855f7' },
  ];

  return (     
    <div className={`h-screen overflow-hidden flex flex-col font-sans antialiased transition-colors duration-150 ${isDarkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>              
      
      {/* 🩺 شاشة التحميل */}
      {isEcgLoading && <SeamlessECGLoader title={loadingTitle} isDarkMode={isDarkMode} />}

      {/* 🔵 الشريط العلوي العصري */}
      <header className={`w-full border-b shrink-0 px-4 py-2 flex items-center justify-between transition-colors duration-150 ${isDarkMode ? 'bg-[#0b0f19] border-slate-800/80' : 'bg-white border-slate-200/80'}`}>
        
        {/* ✨ الشعار */}
        <div className="flex items-center gap-2 select-none pointer-events-none cursor-default">
          <div className="flex flex-col relative items-center">
            <span className={`font-black text-sm sm:text-base tracking-[0.15em] bg-clip-text text-transparent uppercase ${
              isDarkMode 
                ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400' 
                : 'bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-700 font-extrabold'
            }`}>
              DOKTORSYS
            </span>
            <div className="-mt-0.5 opacity-90">
              <HeaderECGLogo isDarkMode={isDarkMode} />
            </div>
          </div>
        </div>

        {/* أزرار الهيدر */}
        <div className="flex items-center gap-2">
          
          <button 
            onClick={() => handleOpenModule('/notifications', 'BİLDİRİMLER')}
            className={`relative h-10 w-10 rounded-xl border flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800/80 border-slate-700/80 text-emerald-400 hover:bg-slate-800' 
                : 'bg-slate-50/90 border-slate-200/90 text-emerald-600 hover:bg-emerald-50/80'
            }`}
            title="Bildirimler"
          >
            <span className="absolute -top-1 -right-1 bg-rose-500 text-[10px] text-white font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">1</span>
            <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          <button 
            onClick={toggleFullScreen}
            className={`h-10 w-10 rounded-xl border flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800' 
                : 'bg-slate-50/90 border-slate-200/90 text-slate-600 hover:bg-slate-100'
            }`}
            title="Tam Ekran"
          >
            <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className={`h-10 w-10 rounded-xl border flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800/80 border-slate-700/80 text-amber-400 hover:bg-slate-800' 
                : 'bg-slate-50/90 border-slate-200/90 text-slate-700 hover:bg-amber-50'
            }`}
            title={isDarkMode ? 'Gündüz Modu' : 'Gece Modu'}
          >
            {isDarkMode ? (
              <svg className="w-4.5 h-4.5 text-amber-400 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4.5 h-4.5 text-slate-700 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Diğer İşlemler */}
          <div className="relative" ref={otherOperationsRef}>
            <button
              onClick={() => setIsOtherOperationsOpen(!isOtherOperationsOpen)}
              className={softLuxeBtnStyle}
            >
              <svg className="w-4 h-4 text-sky-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="hidden md:inline tracking-tight">Diğer İşlemler</span>
              <svg className={`w-3.5 h-3.5 stroke-[2] opacity-70 transition-transform duration-150 ${isOtherOperationsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOtherOperationsOpen && (
              <div className={`absolute right-0 top-full mt-2 w-56 border rounded-2xl shadow-lg py-2 z-[120] text-xs font-semibold ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                {otherOperationsList.filter(m => m.show).map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => handleOpenModule(mod.path, mod.title)}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors ${
                      isDarkMode ? 'hover:bg-slate-700 hover:text-emerald-400' : 'hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{mod.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* yetkili İşlemler */}
          {hasAuthorizedModules && (
            <div className="relative" ref={modulesRef}>
              <button
                onClick={() => setIsModulesOpen(!isModulesOpen)}
                className={softLuxeBtnStyle}
              >
                <svg className="w-4 h-4 text-sky-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="hidden md:inline tracking-tight">yetkili İşlemler</span>
                <svg className={`w-3.5 h-3.5 stroke-[2] opacity-70 transition-transform duration-150 ${isModulesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isModulesOpen && (
                <div className={`absolute right-0 top-full mt-2 w-64 border rounded-2xl shadow-lg py-2 z-[120] text-xs font-semibold ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                }`}>
                  {isGlobalAdmin && (
                    <button
                      onClick={() => handleOpenModule('/admin/users', 'Kullanıcı Yönetimi')}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors font-semibold ${
                        isDarkMode ? 'hover:bg-slate-700 hover:text-emerald-400' : 'hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <svg className="w-4 h-4 text-emerald-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Kullanıcı Yönetimi</span>
                    </button>
                  )}

                  {canManageDoctors && (
                    <button
                      onClick={() => handleOpenModule('/admin/doctors', 'Bölüm ve Doktor yönetimi')}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors font-semibold ${
                        isDarkMode ? 'hover:bg-slate-700 hover:text-emerald-400' : 'hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <svg className="w-4 h-4 text-emerald-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Bölüm ve Doktor yönetimi</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Profil */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={softLuxeBtnStyle}
            >
              <svg className="w-4 h-4 text-emerald-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="tracking-tight">Profil ({uName || 'KULLANICI'})</span>
              <svg className={`w-3.5 h-3.5 stroke-[2] opacity-70 transition-transform duration-150 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isProfileOpen && (
              <div className={`absolute right-0 top-full mt-2 w-60 border rounded-2xl shadow-lg py-2 z-[120] text-xs font-semibold ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-100 bg-slate-50/70'}`}>
                  <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{uName || 'Kullanıcı'}</p>
                  <p className="text-[11px] opacity-70 font-normal">{currentUser?.role || 'Kullanıcı'}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => handleOpenModule('/profile', 'Profil Bilgileri')}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors ${
                      isDarkMode ? 'hover:bg-slate-700 hover:text-emerald-400' : 'hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <svg className="w-4 h-4 text-emerald-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profil Bilgileri</span>
                  </button>

                  <button
                    onClick={() => handleOpenModule('/profile', 'Şifre Değiştir')}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors ${
                      isDarkMode ? 'hover:bg-slate-700 hover:text-emerald-400' : 'hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <svg className="w-4 h-4 text-emerald-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span>Şifre Değiştir</span>
                  </button>

                  <button
                    onClick={() => handleOpenModule('/report', 'Arıza Bildir')}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors ${
                      isDarkMode ? 'hover:bg-amber-950/40 text-amber-400' : 'hover:bg-amber-50 text-amber-700'
                    }`}
                  >
                    <svg className="w-4 h-4 text-amber-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Arıza Bildir</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setShowExitModal(true);
                    }}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors border-t font-semibold ${
                      isDarkMode ? 'border-slate-700 hover:bg-rose-950/40 text-rose-400' : 'border-slate-100 hover:bg-rose-50 text-rose-600'
                    }`}
                  >
                    <svg className="w-4 h-4 text-rose-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 📄 المحتوى الرئيسي */}
      <main className="px-6 py-4 w-full flex-1 flex flex-col justify-between max-w-7xl mx-auto">
        
        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 w-full">
          
          {/* Card 1: DOKTOR ÇALIŞMA PLANLARI */}
          <div 
            onClick={() => handleOpenModule('/schedule', 'DOKTOR ÇALIŞMA PLANLARI')}
            className={`group rounded-2xl px-3.5 py-2.5 max-w-[270px] w-full border cursor-pointer transition-all duration-200 flex items-center justify-between shadow-xs hover:shadow-md ${
              isDarkMode 
                ? 'bg-slate-900/80 border-slate-800/80 hover:border-emerald-500/60 hover:bg-slate-800/90' 
                : 'bg-white/90 border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/30'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl border transition-all duration-200 shrink-0 ${
                isDarkMode 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950' 
                  : 'bg-emerald-50 border-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
              }`}>
                <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <span className={`text-xs font-black tracking-tight whitespace-nowrap transition-colors ${
                isDarkMode ? 'text-slate-200 group-hover:text-emerald-400' : 'text-slate-800 group-hover:text-emerald-700'
              }`}>
                DOKTOR ÇALIŞMA PLANLARI
              </span>
            </div>

            <div className={`p-1 rounded-lg transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
              isDarkMode ? 'text-emerald-400 group-hover:bg-emerald-500/10' : 'text-emerald-600 group-hover:bg-emerald-50'
            }`}>
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </div>
          </div>

          {/* Card 2: TELEFON REHBERİ */}
          <div 
            onClick={() => handleOpenModule('/phonebook', 'TELEFON REHBERİ')}
            className={`group rounded-2xl px-3.5 py-2.5 max-w-[270px] w-full border cursor-pointer transition-all duration-200 flex items-center justify-between shadow-xs hover:shadow-md ${
              isDarkMode 
                ? 'bg-slate-900/80 border-slate-800/80 hover:border-cyan-500/60 hover:bg-slate-800/90' 
                : 'bg-white/90 border-slate-200/80 hover:border-cyan-400 hover:bg-cyan-50/30'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl border transition-all duration-200 shrink-0 ${
                isDarkMode 
                  ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950' 
                  : 'bg-cyan-50 border-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white'
              }`}>
                <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.826-1.47-5.11-3.754-6.58-6.58l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <span className={`text-xs font-black tracking-tight whitespace-nowrap transition-colors ${
                isDarkMode ? 'text-slate-200 group-hover:text-cyan-400' : 'text-slate-800 group-hover:text-cyan-700'
              }`}>
                TELEFON REHBERİ
              </span>
            </div>

            <div className={`p-1 rounded-lg transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
              isDarkMode ? 'text-cyan-400 group-hover:bg-cyan-500/10' : 'text-cyan-600 group-hover:bg-cyan-50'
            }`}>
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </div>
          </div>

        </div>

        {/* 📊 الإحصائيات */}
        <div className="w-full my-auto pt-4">
          <div className="flex items-center gap-2 mb-4 px-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h3 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              GENEL CANLI DURUM İSTATİSTİKLERİ
            </h3>
          </div>

          <div className="w-full px-2">
            <div className="h-44 sm:h-52 flex items-end justify-between gap-4 sm:gap-8 w-full">
              {statsData.map((item) => {
                const maxVal = 128;
                const heightPercent = Math.max((item.value / maxVal) * 100, 8);

                return (
                  <div key={item.label} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-xs sm:text-sm font-mono font-black mb-2 transition-transform group-hover:scale-110" style={{ color: item.color }}>
                      {item.value}
                    </span>
                    
                    <div 
                      className="w-full max-w-[36px] sm:max-w-[42px] rounded-t-xl transition-all duration-300 group-hover:brightness-125 shadow-md" 
                      style={{ 
                        height: `${heightPercent}%`, 
                        backgroundColor: item.color,
                        boxShadow: isDarkMode ? `0 0 12px ${item.color}40` : 'none'
                      }} 
                    />

                    <span className={`text-[11px] sm:text-xs font-black uppercase tracking-wider mt-2.5 text-center whitespace-nowrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </main>

      {/* ⚠️ نافذة تأكيد الخروج */}
      {showExitModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border space-y-4 text-center ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 mx-auto flex items-center justify-center">
              <svg className="w-6 h-6 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold">SİSTEMDEN ÇIKIŞ YAPILSIN MI?</h3>
              <p className="text-xs opacity-70 mt-1">Oturumunuz sonlandırılacaktır.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                İPTAL
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition-colors"
              >
                ÇIKIŞ YAP
              </button>
            </div>
          </div>
        </div>
      )}

    </div>   
  ); 
}