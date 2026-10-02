'use client'; 

import { useState, useEffect, useRef } from 'react'; 
import { useRouter } from 'next/navigation'; 
import { db } from '@/lib/firebase';
import { doc, collection, onSnapshot, updateDoc, setDoc, query, orderBy } from 'firebase/firestore';
import { useTheme } from '@/context/ThemeContext';

// 🩺 شاشة التحميل بنمط نبض النيون الأخضر Soft Luxe
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

      if (pos >= 0.15 && pos < 0.22) return midY - Math.sin((pos - 0.15) / 0.07 * Math.PI) * 3;
      if (pos >= 0.25 && pos < 0.28) return midY + 4;
      if (pos >= 0.28 && pos < 0.33) return midY - (Math.sin(((pos - 0.28) / 0.05) * Math.PI) * (height * 0.42));
      if (pos >= 0.33 && pos < 0.37) return midY + (Math.sin(((pos - 0.33) / 0.04) * Math.PI) * (height * 0.30));
      if (pos >= 0.37 && pos < 0.40) return midY - 3;
      if (pos >= 0.45 && pos < 0.58) return midY - Math.sin((pos - 0.45) / 0.13 * Math.PI) * 6;
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
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fadeIn select-none pointer-events-none">
      <div className={`flex flex-col items-center text-center gap-4 max-w-sm w-full p-6 rounded-3xl shadow-2xl border ${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white/90 border-emerald-100 text-slate-800'}`}>
        <div className={`w-full h-14 relative overflow-hidden rounded-2xl p-2 border ${isDarkMode ? 'bg-slate-950/70 border-emerald-900/40' : 'bg-emerald-50/80 border-emerald-200'}`}>
          <canvas ref={canvasRef} className="w-full h-full block bg-transparent" />
        </div>
        <h2 className={`text-xs font-black tracking-wider uppercase ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
          {title}
        </h2>
      </div>
    </div>
  );
}

// ✨ مكون الشعار الديناميكي
function AnimatedTypewriterLogo({ isDarkMode, logoConfig }) {
  const fullText = "DOKTORSYS";
  const [displayedLength, setDisplayedLength] = useState(0);
  const [phase, setPhase] = useState('TYPING');

  const isEnabled = logoConfig?.isEnabled ?? true;

  const getMs = (val, unit) => {
    const value = Number(val) || 5;
    if (unit === 'HOURS') return value * 3600 * 1000;
    if (unit === 'MINUTES') return value * 60 * 1000;
    return value * 1000;
  };

  const visibleTime = getMs(logoConfig?.visibleValue, logoConfig?.visibleUnit);
  const hiddenTime = getMs(logoConfig?.hiddenValue, logoConfig?.hiddenUnit);

  useEffect(() => {
    if (!isEnabled) {
      setDisplayedLength(fullText.length);
      return;
    }

    let timer;

    if (phase === 'TYPING') {
      if (displayedLength < fullText.length) {
        timer = setTimeout(() => {
          setDisplayedLength((prev) => prev + 1);
        }, 110);
      } else {
        setPhase('VISIBLE_PAUSE');
      }
    } else if (phase === 'VISIBLE_PAUSE') {
      timer = setTimeout(() => {
        setPhase('DELETING');
      }, visibleTime);
    } else if (phase === 'DELETING') {
      if (displayedLength > 0) {
        timer = setTimeout(() => {
          setDisplayedLength((prev) => prev - 1);
        }, 75);
      } else {
        setPhase('HIDDEN_PAUSE');
      }
    } else if (phase === 'HIDDEN_PAUSE') {
      timer = setTimeout(() => {
        setPhase('TYPING');
      }, hiddenTime);
    }

    return () => clearTimeout(timer);
  }, [displayedLength, phase, isEnabled, visibleTime, hiddenTime]);

  const visibleLetters = fullText.slice(0, displayedLength);

  const darkStyle = logoConfig?.darkColor || 'from-emerald-400 via-teal-300 to-cyan-400';
  const lightStyle = logoConfig?.lightColor || 'from-emerald-700 via-teal-600 to-cyan-700';

  const activeColorClasses = isDarkMode ? darkStyle : lightStyle;

  return (
    <div className="flex items-center h-full my-auto select-none pointer-events-none">
      <div className={`font-black text-xs sm:text-base tracking-[0.18em] bg-clip-text text-transparent uppercase flex items-center transition-all duration-300 bg-gradient-to-r ${activeColorClasses} ${
        isDarkMode ? 'drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'drop-shadow-[0_2px_8px_rgba(5,150,105,0.15)] font-extrabold'
      }`}>
        {visibleLetters.split('').map((char, index) => (
          <span 
            key={index}
            className="inline-block transition-all duration-200 animate-fadeIn transform translate-y-0"
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {   
  const [currentUser, setCurrentUser] = useState(null);   
  const [showExitModal, setShowExitModal] = useState(false);

  const { isDarkMode, toggleTheme } = useTheme();

  const [isOtherOperationsOpen, setIsOtherOperationsOpen] = useState(false);
  const [isModulesOpen, setIsModulesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [showLogoConfigModal, setShowLogoConfigModal] = useState(false);
  const [logoConfig, setLogoConfig] = useState({
    isEnabled: true,
    visibleValue: 5,
    visibleUnit: 'SECONDS',
    hiddenValue: 5,
    hiddenUnit: 'SECONDS',
    darkColor: 'from-emerald-400 via-teal-300 to-cyan-400',
    lightColor: 'from-emerald-700 via-teal-600 to-cyan-700'
  });

  const [notifications, setNotifications] = useState([]);

  const [isEcgLoading, setIsEcgLoading] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState('YÜKLENİYOR...');

  const notificationsRef = useRef(null);
  const otherOperationsRef = useRef(null);
  const modulesRef = useRef(null);
  const profileRef = useRef(null);
  const router = useRouter();   

  const clearSessionAndLogout = () => {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;';
    document.cookie = 'user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;';
    document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;';
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;';
    
    sessionStorage.clear();
    localStorage.removeItem('user');
    localStorage.removeItem('login_lock_until');

    window.location.replace('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
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
      clearSessionAndLogout();
      return;
    }

    setCurrentUser(activeUser);   

    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      clearSessionAndLogout();
    };
    window.addEventListener('popstate', handlePopState);

    let unsubscribeUser = () => {};
    // 🎯 حماية الأدمن المباشر والحسابات الافتراضية من الطرد من الفايربيس
    if (activeUser.id && activeUser.id !== 'admin-default') {
      unsubscribeUser = onSnapshot(doc(db, 'users', activeUser.id), (docSnap) => {
        if (docSnap.exists()) {
          const freshData = { id: docSnap.id, ...docSnap.data() };
          setCurrentUser(freshData);
          sessionStorage.setItem('user', JSON.stringify(freshData));
          if (localUser) localStorage.setItem('user', JSON.stringify(freshData));
        }
      });
    }

    const unsubscribeLogoConfig = onSnapshot(doc(db, 'settings', 'logo_config'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLogoConfig(prev => ({
          ...prev,
          isEnabled: data.isEnabled ?? prev.isEnabled,
          darkColor: data.darkColor ?? prev.darkColor,
          lightColor: data.lightColor ?? prev.lightColor,
          visibleValue: data.visibleValue ?? data.visibleTime ?? prev.visibleValue,
          visibleUnit: data.visibleUnit ?? 'SECONDS',
          hiddenValue: data.hiddenValue ?? data.hiddenTime ?? prev.hiddenValue,
          hiddenUnit: data.hiddenUnit ?? 'SECONDS',
        }));
      }
    });

    const qReports = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribeReports = onSnapshot(qReports, (snapshot) => {
      const fetchedReports = snapshot.docs.map(doc => {
        const data = doc.data();
        let formattedDate = '';
        if (data.createdAt) {
          const dateObj = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          formattedDate = dateObj.toLocaleString('tr-TR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          });
        }
        return {
          id: doc.id,
          ...data,
          formattedDate
        };
      });

      setNotifications(fetchedReports);
    }, (err) => {
      console.error("Firestore Reports Listen Error:", err);
    });

    return () => {
      window.removeEventListener('popstate', handlePopState);
      unsubscribeUser();
      unsubscribeLogoConfig();
      unsubscribeReports();
    };
  }, [router]);   

  // 🔐 فحص الصلاحيات الديناميكية للمستخدم الحالي
  const rawUName = currentUser?.username ? currentUser.username.trim() : '';   
  const normalizedUName = rawUName.toUpperCase().replace(/İ/g, 'I');
  const isGlobalAdmin = normalizedUName === 'ADMIN' || currentUser?.role === 'YÖNETİCİ' || currentUser?.role === 'ADMIN';   

  const checkPermission = (permKey) => {
    if (isGlobalAdmin) return true;
    if (!currentUser) return false;

    if (Array.isArray(currentUser.permissions)) {
      return currentUser.permissions.includes(permKey);
    }

    if (typeof currentUser.permissions === 'object' && currentUser.permissions !== null) {
      return Boolean(currentUser.permissions[permKey]);
    }

    return false;
  };

  const canManageDoctors = checkPermission('bölüm ve doktor yönetimi') || checkPermission('canEditDoctors');
  const canManageReports = checkPermission('sorun bildirme yönetimi') || checkPermission('canManageReports');

  const hasAuthorizedModules = isGlobalAdmin || canManageDoctors || canManageReports;

  // 🔔 فلترة الإشعارات
  const visibleNotifications = notifications.filter(n => {
    if (canManageReports) return true;
    return n.createdBy === currentUser?.username;
  });

  const unreadNotifications = visibleNotifications.filter(n => !n.isRead && n.status !== 'ÇÖZÜLDÜ');

  const handleNotificationClick = async (notificationItem) => {
    setIsNotificationsOpen(false);
    
    try {
      const reportRef = doc(db, 'reports', notificationItem.id);
      await updateDoc(reportRef, {
        isRead: true
      });
    } catch (e) {
      console.error("Error updating notification status:", e);
    }

    const targetPath = canManageReports ? `/admin/reports?id=${notificationItem.id}` : `/report?id=${notificationItem.id}`;
    handleOpenModule(targetPath, 'ARİZA / SORUN BİLDİRİMLERİ');
  };

  const handleSaveLogoConfig = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'logo_config'), logoConfig, { merge: true });
      setShowLogoConfigModal(false);
    } catch (err) {
      console.error("Logo config save error:", err);
    }
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    setLoadingTitle('SİSTEMDEN ÇIKIŞ YAPILIYOR...');
    setIsEcgLoading(true);

    setTimeout(() => {
      clearSessionAndLogout();
    }, 400);
  };

  const handleOpenModule = (path, title) => {
    setIsOtherOperationsOpen(false);
    setIsModulesOpen(false);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
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

  const otherOperationsList = [
    { id: 'schedule', title: 'DOKTOR ÇALIŞMA PLANLARI', path: '/schedule', show: true },
    { id: 'phonebook', title: 'TELEFON REHBERİ', path: '/phonebook', show: true },
  ];

  const presetGradients = [
    { name: 'Emerald Luxe', dark: 'from-emerald-400 via-teal-300 to-cyan-400', light: 'from-emerald-700 via-teal-600 to-cyan-700' },
    { name: 'Cyber Blue', dark: 'from-blue-400 via-indigo-300 to-cyan-400', light: 'from-blue-700 via-indigo-600 to-cyan-700' },
    { name: 'Neon Purple', dark: 'from-purple-400 via-pink-300 to-rose-400', light: 'from-purple-700 via-pink-600 to-rose-700' },
    { name: 'Sunset Gold', dark: 'from-amber-400 via-orange-300 to-yellow-400', light: 'from-amber-700 via-orange-600 to-yellow-700' },
    { name: 'Rose Red', dark: 'from-rose-400 via-red-300 to-pink-400', light: 'from-rose-700 via-red-600 to-pink-700' }
  ];

  const softLuxeBtnStyle = `h-9 sm:h-10 px-2.5 sm:px-4 rounded-xl flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-black transition-all duration-200 cursor-pointer border shadow-xs active:scale-95 backdrop-blur-md ${
    isDarkMode 
      ? 'bg-slate-900/60 border-slate-800 text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800/80 hover:text-emerald-400 shadow-black/40' 
      : 'bg-white/70 border-slate-200 text-slate-800 hover:border-emerald-400 hover:bg-emerald-50/60 hover:text-emerald-700 shadow-slate-200/50'
  }`;

  const displayUsername = rawUName ? rawUName.toUpperCase() : 'KULLANICI';

  return (     
    <div className={`h-[100dvh] w-[100vw] fixed inset-0 overflow-hidden flex flex-col font-sans antialiased transition-colors duration-200 select-none ${isDarkMode ? 'bg-[#030712] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>              
      
      {/* 🩺 شاشة التحميل */}
      {isEcgLoading && <SeamlessECGLoader title={loadingTitle} isDarkMode={isDarkMode} />}

      {/* 🔵 الشريط العلوي */}
      <header className={`w-full border-b shrink-0 px-2 sm:px-6 py-2.5 flex items-center justify-between flex-wrap lg:flex-nowrap gap-2 transition-colors duration-200 z-30 ${isDarkMode ? 'bg-[#030712]/90 border-slate-800/80 backdrop-blur-md' : 'bg-white/90 border-slate-200/80 backdrop-blur-md'}`}>
        
        {/* ✨ الشعار وزر التعديل الفائق للأدمن */}
        <div className="flex items-center gap-2 h-full my-auto shrink-0">
          <AnimatedTypewriterLogo isDarkMode={isDarkMode} logoConfig={logoConfig} />
          
          {isGlobalAdmin && (
            <button
              onClick={() => setShowLogoConfigModal(true)}
              className="p-1 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer text-xs"
              title="Logo Animasyon ve Renk Ayarları"
            >
              ⚙
            </button>
          )}
        </div>

        {/* أزرار الهيدر */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap justify-end">
          
          {/* 🔔 الإشعارات المفلترة حسب الصلاحية */}
          <div className="relative shrink-0" ref={notificationsRef}>
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl border flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-md shrink-0 ${
                isDarkMode 
                  ? 'bg-slate-900/60 border-slate-800 text-emerald-400 hover:bg-slate-800' 
                  : 'bg-white/70 border-slate-200 text-emerald-600 hover:bg-emerald-50'
              }`}
              title="Bildirimler"
            >
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-[10px] text-white font-black px-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse shadow-md">
                  {unreadNotifications.length}
                </span>
              )}
              <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {/* 📋 نافذة الإشعارات */}
            {isNotificationsOpen && (
              <div className={`absolute right-0 top-full mt-2 w-80 sm:w-88 border rounded-2xl shadow-2xl overflow-hidden z-[150] font-sans backdrop-blur-xl animate-fadeIn ${
                isDarkMode ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white/95 border-slate-200 text-slate-800'
              }`}>
                <div className={`px-4 py-3 border-b flex justify-between items-center ${
                  isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-500">BİLDİRİMLER</span>
                  </div>
                  {unreadNotifications.length > 0 && (
                    <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                      {unreadNotifications.length}
                    </span>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/30">
                  {unreadNotifications.length > 0 ? (
                    unreadNotifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-3.5 flex flex-col gap-1.5 cursor-pointer transition-all ${
                          isDarkMode 
                            ? 'hover:bg-slate-800/80 bg-slate-950/20' 
                            : 'hover:bg-emerald-50/60 bg-emerald-50/10'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-xs text-amber-500 truncate uppercase">
                            👤 {item.senderName || item.createdBy || 'Kullanıcı'}
                          </span>
                          <span className="text-[10px] font-mono opacity-60 shrink-0">
                            {item.formattedDate}
                          </span>
                        </div>

                        <p className="font-bold text-[11px] text-slate-300 dark:text-slate-200 line-clamp-2 leading-relaxed">
                          {item.title || item.message || item.description || 'Yeni bir sorun/arıza bildirimi gönderildi.'}
                        </p>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[9px] bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded-md font-mono font-black uppercase">
                            {item.category || item.type || 'ARIZA'}
                          </span>
                          <span className="text-[10px] text-emerald-500 font-black">
                            Detay ➔
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 px-4 text-center space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto text-lg shadow-inner">
                        🔔
                      </div>
                      <p className="text-xs font-black text-slate-400 dark:text-slate-400 tracking-wide">
                        okunmamış yeni bildirim yok
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          <button 
            onClick={toggleFullScreen}
            className={`hidden sm:flex h-10 w-10 rounded-xl border items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-md shrink-0 ${
              isDarkMode 
                ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800' 
                : 'bg-white/70 border-slate-200 text-slate-600 hover:bg-slate-100'
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
            className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl border flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-md shrink-0 ${
              isDarkMode 
                ? 'bg-slate-900/60 border-slate-800 text-amber-400 hover:bg-slate-800' 
                : 'bg-white/70 border-slate-200 text-amber-600 hover:bg-amber-50'
            }`}
            title={isDarkMode ? 'Gündüz Modu' : 'Gece Modu'}
          >
            {isDarkMode ? (
              <svg className="w-4 h-4 text-amber-400 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-slate-700 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Diğer İşlemler */}
          <div className="relative shrink-0" ref={otherOperationsRef}>
            <button onClick={() => setIsOtherOperationsOpen(!isOtherOperationsOpen)} className={softLuxeBtnStyle}>
              <svg className="w-4 h-4 text-sky-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="hidden md:inline tracking-tight">Diğer İşlemler</span>
              <svg className={`w-3.5 h-3.5 stroke-[2] opacity-70 transition-transform duration-200 ${isOtherOperationsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOtherOperationsOpen && (
              <div className={`absolute right-0 top-full mt-2 w-56 border rounded-2xl shadow-xl py-2 z-[120] text-xs font-bold backdrop-blur-md ${isDarkMode ? 'bg-slate-900/95 border-slate-800 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-700'}`}>
                {otherOperationsList.filter(m => m.show).map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => handleOpenModule(mod.path, mod.title)}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors ${isDarkMode ? 'hover:bg-slate-800 hover:text-emerald-400' : 'hover:bg-emerald-50 hover:text-emerald-700'}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{mod.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Yetkili İşlemler */}
          {hasAuthorizedModules && (
            <div className="relative shrink-0" ref={modulesRef}>
              <button onClick={() => setIsModulesOpen(!isModulesOpen)} className={softLuxeBtnStyle}>
                <svg className="w-4 h-4 text-sky-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="hidden md:inline tracking-tight">Yetkili İşlemler</span>
                <svg className={`w-3.5 h-3.5 stroke-[2] opacity-70 transition-transform duration-200 ${isModulesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isModulesOpen && (
                <div className={`absolute right-0 top-full mt-2 w-64 border rounded-2xl shadow-xl py-2 z-[120] text-xs font-bold backdrop-blur-md ${isDarkMode ? 'bg-slate-900/95 border-slate-800 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-700'}`}>
                  {isGlobalAdmin && (
                    <button
                      onClick={() => handleOpenModule('/admin/users', 'Kullanıcı Yönetimi')}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors ${isDarkMode ? 'hover:bg-slate-800 hover:text-emerald-400' : 'hover:bg-emerald-50 hover:text-emerald-700'}`}
                    >
                      <svg className="w-4 h-4 text-emerald-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Kullanıcı Yönetimi</span>
                    </button>
                  )}

                  {canManageDoctors && (
                    <button
                      onClick={() => handleOpenModule('/admin/doctors', 'Bölüm ve Doktor Yönetimi')}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors ${isDarkMode ? 'hover:bg-slate-800 hover:text-emerald-400' : 'hover:bg-emerald-50 hover:text-emerald-700'}`}
                    >
                      <svg className="w-4 h-4 text-emerald-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Bölüm ve Doktor Yönetimi</span>
                    </button>
                  )}

                  {canManageReports && (
                    <button
                      onClick={() => handleOpenModule('/admin/reports', 'Arıza / Sorun Bildirimleri')}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors ${isDarkMode ? 'hover:bg-slate-800 hover:text-amber-400' : 'hover:bg-amber-50 hover:text-amber-700'}`}
                    >
                      <svg className="w-4 h-4 text-amber-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Arıza / Sorun Bildirimleri</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Profil */}
          <div className="relative shrink-0" ref={profileRef}>
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className={softLuxeBtnStyle}>
              <svg className="w-4 h-4 text-emerald-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="tracking-tight max-w-[80px] sm:max-w-none truncate">{displayUsername}</span>
              <svg className={`w-3.5 h-3.5 stroke-[2] opacity-70 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isProfileOpen && (
              <div className={`absolute right-0 top-full mt-2 w-60 border rounded-2xl shadow-xl py-2 z-[120] text-xs font-bold backdrop-blur-md ${isDarkMode ? 'bg-slate-900/95 border-slate-800 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-700'}`}>
                <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/70'}`}>
                  <p className="font-black text-sm text-emerald-500">{displayUsername}</p>
                  <p className="text-[11px] opacity-70 font-bold">{currentUser?.role || 'Kullanıcı'}</p>
                </div>

                <div className="py-1">
                  <button onClick={() => handleOpenModule('/profile', 'Profil Bilgileri')} className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors ${isDarkMode ? 'hover:bg-slate-800 hover:text-emerald-400' : 'hover:bg-emerald-50 hover:text-emerald-700'}`}>
                    <svg className="w-4 h-4 text-emerald-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profil Bilgileri</span>
                  </button>

                  <button onClick={() => handleOpenModule('/profile', 'Şifre Değiştir')} className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors ${isDarkMode ? 'hover:bg-slate-800 hover:text-emerald-400' : 'hover:bg-emerald-50 hover:text-emerald-700'}`}>
                    <svg className="w-4 h-4 text-emerald-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span>Şifre Değiştir</span>
                  </button>

                  <button onClick={() => handleOpenModule('/report', 'Arıza Bildir')} className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors ${isDarkMode ? 'hover:bg-amber-950/40 text-amber-400' : 'hover:bg-amber-50 text-amber-700'}`}>
                    <svg className="w-4 h-4 text-amber-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Arıza Bildir</span>
                  </button>

                  <button onClick={() => { setIsProfileOpen(false); setShowExitModal(true); }} className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors border-t font-black ${isDarkMode ? 'border-slate-800 hover:bg-rose-950/40 text-rose-400' : 'border-slate-100 hover:bg-rose-50 text-rose-600'}`}>
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
      <main className="p-3 sm:p-6 w-full flex-1 flex flex-col justify-start max-w-7xl mx-auto overflow-hidden">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 w-full">
          
          {/* Card 1: DOKTOR ÇALIŞMA PLANLARI */}
          <div 
            onClick={() => handleOpenModule('/schedule', 'DOKTOR ÇALIŞMA PLANLARI')}
            className={`group rounded-2xl p-4 sm:p-5 border cursor-pointer transition-all duration-200 flex items-center justify-between shadow-sm hover:shadow-xl active:scale-[0.98] backdrop-blur-md ${
              isDarkMode 
                ? 'bg-slate-900/50 border-slate-800 hover:border-emerald-500/60 hover:bg-slate-800/80 shadow-black/40' 
                : 'bg-white/80 border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/40 shadow-slate-200/60'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-xl border transition-all duration-200 shrink-0 ${
                isDarkMode 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950' 
                  : 'bg-emerald-50 border-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
              }`}>
                <svg className="w-5 h-5 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <span className={`text-xs sm:text-sm font-black tracking-tight transition-colors ${
                isDarkMode ? 'text-slate-200 group-hover:text-emerald-400' : 'text-slate-800 group-hover:text-emerald-700'
              }`}>
                DOKTOR ÇALIŞMA PLANLARI
              </span>
            </div>

            <div className={`p-1.5 rounded-lg transition-all duration-200 group-hover:translate-x-1 ${
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
            className={`group rounded-2xl p-4 sm:p-5 border cursor-pointer transition-all duration-200 flex items-center justify-between shadow-sm hover:shadow-xl active:scale-[0.98] backdrop-blur-md ${
              isDarkMode 
                ? 'bg-slate-900/50 border-slate-800 hover:border-cyan-500/60 hover:bg-slate-800/80 shadow-black/40' 
                : 'bg-white/80 border-slate-200/80 hover:border-cyan-400 hover:bg-cyan-50/40 shadow-slate-200/60'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-xl border transition-all duration-200 shrink-0 ${
                isDarkMode 
                  ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950' 
                  : 'bg-cyan-50 border-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white'
              }`}>
                <svg className="w-5 h-5 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.826-1.47-5.11-3.754-6.58-6.58l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <span className={`text-xs sm:text-sm font-black tracking-tight transition-colors ${
                isDarkMode ? 'text-slate-200 group-hover:text-cyan-400' : 'text-slate-800 group-hover:text-cyan-700'
              }`}>
                TELEFON REHBERİ
              </span>
            </div>

            <div className={`p-1.5 rounded-lg transition-all duration-200 group-hover:translate-x-1 ${
              isDarkMode ? 'text-cyan-400 group-hover:bg-cyan-500/10' : 'text-cyan-600 group-hover:bg-cyan-50'
            }`}>
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </div>
          </div>

        </div>

      </main>

      {/* ⚙️ نافذة إعدادات الشعار المتقدمة */}
      {showLogoConfigModal && isGlobalAdmin && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-4 backdrop-blur-xl max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-slate-900/95 border-slate-800 text-white' : 'bg-white/95 border-slate-100 text-slate-800'
          }`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-xs font-black text-emerald-500 uppercase tracking-wider">⚙️ LOGO ANIMASYON VE RENK AYARLARI</h3>
              <button onClick={() => setShowLogoConfigModal(false)} className="text-slate-400 hover:text-white font-black text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveLogoConfig} className="space-y-4 text-xs font-bold">
              <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-800 bg-slate-950/40">
                <span>Animasyonlu Yazı:</span>
                <button
                  type="button"
                  onClick={() => setLogoConfig(prev => ({ ...prev, isEnabled: !prev.isEnabled }))}
                  className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase transition-all ${
                    logoConfig.isEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {logoConfig.isEnabled ? 'AÇIK' : 'KAPALI'}
                </button>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1.5">Hazır Renk Şablonları</label>
                <div className="flex flex-wrap gap-1.5">
                  {presetGradients.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLogoConfig(prev => ({ ...prev, darkColor: p.dark, lightColor: p.light }))}
                      className="px-2.5 py-1 rounded-lg text-[9px] font-black bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-amber-400 uppercase mb-1">Gece Modu Renk Gradyanı (Tailwind)</label>
                <input
                  type="text"
                  value={logoConfig.darkColor ?? ''}
                  onChange={(e) => setLogoConfig(prev => ({ ...prev, darkColor: e.target.value }))}
                  placeholder="from-emerald-400 via-teal-300 to-cyan-400"
                  className={`w-full px-3 py-2 rounded-xl border font-mono outline-none text-[11px] ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] text-emerald-500 uppercase mb-1">Gündüz Modu Renk Gradyanı (Tailwind)</label>
                <input
                  type="text"
                  value={logoConfig.lightColor ?? ''}
                  onChange={(e) => setLogoConfig(prev => ({ ...prev, lightColor: e.target.value }))}
                  placeholder="from-emerald-700 via-teal-600 to-cyan-700"
                  className={`w-full px-3 py-2 rounded-xl border font-mono outline-none text-[11px] ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Ekranda Kalma Süresi</label>
                  <input
                    type="number"
                    min="1"
                    value={logoConfig.visibleValue ?? 5}
                    onChange={(e) => setLogoConfig(prev => ({ ...prev, visibleValue: e.target.value === '' ? '' : Number(e.target.value) }))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Birim</label>
                  <select
                    value={logoConfig.visibleUnit ?? 'SECONDS'}
                    onChange={(e) => setLogoConfig(prev => ({ ...prev, visibleUnit: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="SECONDS">Saniye</option>
                    <option value="MINUTES">Dakika</option>
                    <option value="HOURS">Saat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Gizli Kalma Süresi</label>
                  <input
                    type="number"
                    min="1"
                    value={logoConfig.hiddenValue ?? 5}
                    onChange={(e) => setLogoConfig(prev => ({ ...prev, hiddenValue: e.target.value === '' ? '' : Number(e.target.value) }))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Birim</label>
                  <select
                    value={logoConfig.hiddenUnit ?? 'SECONDS'}
                    onChange={(e) => setLogoConfig(prev => ({ ...prev, hiddenUnit: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="SECONDS">Saniye</option>
                    <option value="MINUTES">Dakika</option>
                    <option value="HOURS">Saat</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoConfigModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-black cursor-pointer"
                >
                  İPTAL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all uppercase"
                >
                  KAYDET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⚠️ نافذة تأكيد الخروج */}
      {showExitModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border space-y-4 text-center backdrop-blur-xl ${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white/90 border-slate-100 text-slate-800'}`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
              <svg className="w-6 h-6 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black">SİSTEMDEN ÇIKIŞ YAPILSIN MI?</h3>
              <p className="text-xs font-bold opacity-70 mt-1">Oturumunuz sonlandırılacaktır.</p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-all active:scale-95 cursor-pointer ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                İPTAL
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-600/20 transition-all active:scale-95 cursor-pointer"
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