'use client'; 

import { useState, useEffect, useRef } from 'react'; 
import { useRouter } from 'next/navigation'; 
import { db } from '@/lib/firebase';
import { doc, collection, onSnapshot, updateDoc, setDoc, query, orderBy } from 'firebase/firestore';
import { useTheme } from '@/context/ThemeContext';

// 💫 شاشة التحميل الكريستالية بالنقاط الدوارة والتأخير لمدة 10 ثوانٍ لفحص الاتصال
function RadialDotsLoader({ title = "YÜKLENİYOR", isDarkMode }) {
  const [dots, setDots] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [showNetworkWarning, setShowNetworkWarning] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    let offlineTimer = null;

    const handleOnline = () => {
      setIsOnline(true);
      setShowNetworkWarning(false);
      if (offlineTimer) clearTimeout(offlineTimer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      // الانتظار لمدة 10 ثوانٍ قبل تفعيل تنبيه الهيدر
      offlineTimer = setTimeout(() => {
        setShowNetworkWarning(true);
      }, 10000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // إذا بدأ من الأساس بدون إنترنت، نبدأ العداد
    if (!navigator.onLine) {
      offlineTimer = setTimeout(() => {
        setShowNetworkWarning(true);
      }, 10000);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (offlineTimer) clearTimeout(offlineTimer);
    };
  }, []);

  // أنيميشن النقاط المتزايدة (...)
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const dotCount = 12;
  const dotsArray = Array.from({ length: dotCount });

  return (
    <>
      {/* 🚨 تنبيه الهيدر العلوي عند انقطاع الإنترنت لأكثر من 10 ثوانٍ */}
      {showNetworkWarning && (
        <div className="fixed top-0 left-0 right-0 z-[100000] bg-rose-600 text-white text-center py-2 px-4 text-xs font-black uppercase tracking-widest shadow-lg animate-pulse flex items-center justify-center gap-2">
          <span>⚠️️ İNTERNET BAĞLANTISI YOK</span>
        </div>
      )}

      <div className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center backdrop-blur-md transition-all duration-300 animate-fadeIn select-none pointer-events-auto ${
        isDarkMode ? 'bg-slate-950/30' : 'bg-slate-900/20'
      }`}>
        <div className="relative flex flex-col items-center text-center max-w-xs w-full p-6 rounded-3xl backdrop-blur-xl bg-slate-950/40 border border-slate-800/40 shadow-2xl">
          
          {/* وهج خلفي متكيف */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full blur-3xl pointer-events-none animate-pulse transition-all duration-500 ${
            isOnline ? 'bg-cyan-500/20' : 'bg-rose-500/30'
          }`} />

          {/* 🌀 الرمز الدائري */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-6">
            <div className="relative w-full h-full animate-[spin_1.2s_linear_infinite] transform-gpu">
              {dotsArray.map((_, index) => {
                const angle = (index * 360) / dotCount;
                const opacity = 0.2 + (index / dotCount) * 0.8;

                return (
                  <div
                    key={index}
                    className="absolute top-0 left-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 -ml-1.75 sm:-ml-2 origin-[50%_48px] sm:origin-[50%_56px]"
                    style={{
                      transform: `rotate(${angle}deg)`,
                      opacity: opacity,
                    }}
                  >
                    <span className={`block w-full h-full rounded-full transition-colors duration-300 ${
                      isOnline 
                        ? 'bg-gradient-to-tr from-cyan-400 via-sky-300 to-emerald-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]' 
                        : 'bg-gradient-to-tr from-rose-600 via-red-500 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.95)]'
                    }`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* النصوص أسفل الرمز */}
          <div className="z-10 flex flex-col items-center justify-center gap-1">
            <div className="flex items-center justify-center gap-0.5">
              <h3 className={`text-xs sm:text-sm font-black tracking-[0.25em] uppercase font-sans transition-colors duration-300 ${
                isOnline 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-teal-300' 
                  : 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
              }`}>
                {title}
              </h3>
              <span className={`w-4 text-left font-mono font-black text-xs sm:text-sm ${
                isOnline ? 'text-cyan-400' : 'text-rose-400'
              }`}>
                {dots}
              </span>
            </div>

            {!isOnline && (
              <span className="text-[10px] sm:text-xs font-black tracking-widest text-rose-500 uppercase animate-pulse font-mono mt-0.5">
                İNTERNETE BAĞLANIYOR{dots}
              </span>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

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
  const [loadingTitle, setLoadingTitle] = useState('YÜKLENİYOR');

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

    const handlePopState = () => {
      clearSessionAndLogout();
    };
    window.addEventListener('popstate', handlePopState);

    let unsubscribeUser = () => {};
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
    handleOpenModule(targetPath, 'YÜKLENİYOR');
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
    setLoadingTitle('YÜKLENİYOR');
    setIsEcgLoading(true);

    setTimeout(() => {
      clearSessionAndLogout();
    }, 400);
  };

  const handleOpenModule = (path, title = 'YÜKLENİYOR') => {
    setIsOtherOperationsOpen(false);
    setIsModulesOpen(false);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    setLoadingTitle('YÜKLENİYOR');
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
    { id: 'schedule', title: 'DOKTOR ÇALIŞMA LİSTESİ', path: '/schedule', show: true },
    { id: 'phonebook', title: 'TELEFON REHBERİ', path: '/phonebook', show: true },
  ];

  const presetGradients = [
    { name: 'Emerald Luxe', dark: 'from-emerald-400 via-teal-300 to-cyan-400', light: 'from-emerald-700 via-teal-600 to-cyan-700' },
    { name: 'Cyber Blue', dark: 'from-blue-400 via-indigo-300 to-cyan-400', light: 'from-blue-700 via-indigo-600 to-cyan-700' },
    { name: 'Neon Purple', dark: 'from-purple-400 via-pink-300 to-rose-400', light: 'from-purple-700 via-pink-600 to-rose-700' },
    { name: 'Sunset Gold', dark: 'from-amber-400 via-orange-300 to-yellow-400', light: 'from-amber-700 via-orange-600 to-yellow-700' },
    { name: 'Rose Red', dark: 'from-rose-400 via-red-300 to-pink-400', light: 'from-rose-700 via-red-600 to-pink-700' }
  ];

  const displayUsername = rawUName ? rawUName.toUpperCase() : 'KULLANICI';

  return (     
    <div className={`h-[100dvh] w-[100vw] fixed inset-0 overflow-hidden flex flex-col font-sans antialiased transition-colors duration-200 select-none ${isDarkMode ? 'bg-[#030712] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>              
      
      {/* 💫 شاشة التحميل */}
      {isEcgLoading && <RadialDotsLoader title={loadingTitle} isDarkMode={isDarkMode} />}

      {/* 🌌 خلفية نيون خفيفة في الوضع الداكن */}
      {isDarkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-emerald-600/10 blur-[130px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-cyan-600/10 blur-[130px] animate-pulse" />
        </div>
      )}

      <header className={`w-full border-b shrink-0 px-2 sm:px-6 py-2.5 flex items-center justify-between flex-wrap lg:flex-nowrap gap-2 transition-colors duration-200 z-30 relative ${isDarkMode ? 'bg-[#030712]/80 border-slate-800/80 backdrop-blur-xl' : 'bg-white/80 border-slate-200/80 backdrop-blur-xl'}`}>
        
        <div className="flex items-center gap-3 h-full my-auto shrink-0">
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

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap justify-end">
          
          <div className="relative shrink-0" ref={notificationsRef}>
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl border flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-md shrink-0 ${
                isDarkMode 
                  ? 'bg-slate-900/80 border-slate-700 text-emerald-400 hover:bg-slate-800 hover:border-emerald-500/50' 
                  : 'bg-white border-slate-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 shadow-xs'
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

            {isNotificationsOpen && (
              <div className={`absolute right-0 top-full mt-2 w-80 sm:w-88 border rounded-2xl shadow-2xl overflow-hidden z-[150] font-sans backdrop-blur-2xl animate-fadeIn ${
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
                ? 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800' 
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-xs'
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
                ? 'bg-slate-900/80 border-slate-700 text-amber-400 hover:bg-slate-800' 
                : 'bg-white border-slate-300 text-amber-600 hover:bg-amber-50 shadow-xs'
            }`}
            title={isDarkMode ? 'Gündüz Modu' : 'Gece Modu'}
          >
            {isDarkMode ? (
              <svg className="w-4 h-4 text-amber-400 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-slate-800 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* 🔘 زر Diğer İşlemler */}
          <div className="relative shrink-0" ref={otherOperationsRef}>
            <button 
              onClick={() => setIsOtherOperationsOpen(!isOtherOperationsOpen)} 
              className={`h-9 sm:h-10 px-3.5 sm:px-4.5 rounded-xl flex items-center gap-2 text-[11px] sm:text-xs font-black transition-all duration-200 cursor-pointer border active:scale-95 shadow-md backdrop-blur-xl ${
                isDarkMode 
                  ? 'bg-sky-950/90 border-sky-400/80 text-sky-300 hover:bg-sky-900 hover:border-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.2)]' 
                  : 'bg-sky-100 border-sky-400 text-sky-950 hover:bg-sky-200 hover:border-sky-600 font-black'
              }`}
            >
              <svg className="w-4 h-4 text-sky-400 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="hidden md:inline tracking-wide font-black">Diğer İşlemler</span>
              <svg className={`w-3.5 h-3.5 stroke-[3] opacity-90 transition-transform duration-200 ${isOtherOperationsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOtherOperationsOpen && (
              <div className={`absolute right-0 top-full mt-2 w-56 border rounded-2xl shadow-xl py-2 z-[120] text-xs font-bold backdrop-blur-md ${isDarkMode ? 'bg-slate-900/95 border-slate-800 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800'}`}>
                {otherOperationsList.filter(m => m.show).map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => handleOpenModule(mod.path)}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors ${isDarkMode ? 'hover:bg-slate-800 hover:text-emerald-400' : 'hover:bg-emerald-50 hover:text-emerald-700'}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{mod.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 🔘 زر Yetkili İşlemler */}
          {hasAuthorizedModules && (
            <div className="relative shrink-0" ref={modulesRef}>
              <button 
                onClick={() => setIsModulesOpen(!isModulesOpen)} 
                className={`h-9 sm:h-10 px-3.5 sm:px-4.5 rounded-xl flex items-center gap-2 text-[11px] sm:text-xs font-black transition-all duration-200 cursor-pointer border active:scale-95 shadow-md backdrop-blur-xl ${
                  isDarkMode 
                    ? 'bg-teal-950/90 border-teal-400/80 text-teal-300 hover:bg-teal-900 hover:border-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.2)]' 
                    : 'bg-teal-100 border-teal-400 text-teal-950 hover:bg-teal-200 hover:border-teal-600 font-black'
                }`}
              >
                <svg className="w-4 h-4 text-teal-300 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="hidden md:inline tracking-wide font-black">Yetkili İşlemler</span>
                <svg className={`w-3.5 h-3.5 stroke-[3] opacity-90 transition-transform duration-200 ${isModulesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isModulesOpen && (
                <div className={`absolute right-0 top-full mt-2 w-64 border rounded-2xl shadow-xl py-2 z-[120] text-xs font-bold backdrop-blur-md ${isDarkMode ? 'bg-slate-900/95 border-slate-800 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800'}`}>
                  {isGlobalAdmin && (
                    <button
                      onClick={() => handleOpenModule('/admin/users')}
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
                      onClick={() => handleOpenModule('/admin/doctors')}
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
                      onClick={() => handleOpenModule('/admin/reports')}
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

          {/* 🔘 زر Profile */}
          <div className="relative shrink-0" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)} 
              className={`h-9 sm:h-10 px-3.5 sm:px-4.5 rounded-xl flex items-center gap-2 text-[11px] sm:text-xs font-black transition-all duration-200 cursor-pointer border active:scale-95 shadow-md backdrop-blur-xl ${
                isDarkMode 
                  ? 'bg-emerald-950/90 border-emerald-400/80 text-emerald-300 hover:bg-emerald-900 hover:border-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.2)]' 
                  : 'bg-emerald-100 border-emerald-400 text-emerald-950 hover:bg-emerald-200 hover:border-emerald-600 font-black'
              }`}
            >
              <svg className="w-4 h-4 text-emerald-300 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="tracking-wide font-black max-w-[80px] sm:max-w-none truncate">{displayUsername}</span>
              <svg className={`w-3.5 h-3.5 stroke-[3] opacity-90 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isProfileOpen && (
              <div className={`absolute right-0 top-full mt-2 w-60 border rounded-2xl shadow-xl py-2 z-[120] text-xs font-bold backdrop-blur-md ${isDarkMode ? 'bg-slate-900/95 border-slate-800 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800'}`}>
                <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/70'}`}>
                  <p className="font-black text-sm text-emerald-500">{displayUsername}</p>
                  <p className="text-[11px] opacity-70 font-bold">{currentUser?.role || 'Kullanıcı'}</p>
                </div>

                <div className="py-1">
                  <button onClick={() => handleOpenModule('/profile')} className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors ${isDarkMode ? 'hover:bg-slate-800 hover:text-emerald-400' : 'hover:bg-emerald-50 hover:text-emerald-700'}`}>
                    <svg className="w-4 h-4 text-emerald-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profil Bilgileri</span>
                  </button>

                  <button onClick={() => handleOpenModule('/profile')} className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors ${isDarkMode ? 'hover:bg-slate-800 hover:text-emerald-400' : 'hover:bg-emerald-50 hover:text-emerald-700'}`}>
                    <svg className="w-4 h-4 text-emerald-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span>Şifre Değiştir</span>
                  </button>

                  <button onClick={() => handleOpenModule('/report')} className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors ${isDarkMode ? 'hover:bg-amber-950/40 text-amber-400' : 'hover:bg-amber-50 text-amber-700'}`}>
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

      {/* 🔮 منطقة البطاقات الرئيسية */}
      <main className="p-4 sm:p-8 w-full flex-1 flex flex-col items-start justify-start max-w-7xl mx-auto overflow-hidden relative z-10 pt-6 sm:pt-10">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl">
          
          {/* 💎 بطاقة DOKTOR ÇALIŞMA LİSTESİ */}
          <div 
            onClick={() => handleOpenModule('/schedule')}
            className={`group relative rounded-2xl p-4 sm:p-5 border cursor-pointer transition-all duration-300 flex items-center justify-between active:scale-[0.98] backdrop-blur-xl overflow-hidden shadow-lg ${
              isDarkMode 
                ? 'bg-slate-900/90 border-cyan-400/80 hover:border-cyan-300 hover:bg-slate-800/90 shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
                : 'bg-emerald-50/80 border-emerald-300/80 hover:border-emerald-500 hover:bg-emerald-100/80 shadow-emerald-100'
            }`}
          >
            <div className="flex items-center gap-3.5 z-10">
              <div className={`p-3 rounded-xl border transition-all duration-300 shrink-0 ${
                isDarkMode 
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 group-hover:bg-cyan-400 group-hover:text-slate-950' 
                  : 'bg-emerald-600 border-emerald-700 text-white group-hover:bg-emerald-700'
              }`}>
                <svg className="w-5 h-5 stroke-[2.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>

              <span className={`text-xs sm:text-sm font-black tracking-wide transition-colors ${
                isDarkMode ? 'text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)] group-hover:text-cyan-200' : 'text-emerald-950 group-hover:text-emerald-900'
              }`}>
                DOKTOR ÇALIŞMA LİSTESİ
              </span>
            </div>

            <div className={`z-10 p-2 rounded-full border transition-all duration-300 group-hover:translate-x-1 ${
              isDarkMode 
                ? 'border-cyan-400/60 bg-slate-950/80 text-cyan-300 group-hover:border-cyan-300 group-hover:bg-cyan-500/20' 
                : 'border-emerald-300 bg-white text-emerald-800 group-hover:border-emerald-500 group-hover:bg-emerald-200'
            }`}>
              <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>

          {/* 💎 بطاقة TELEFON REHBERİ */}
          <div 
            onClick={() => handleOpenModule('/phonebook')}
            className={`group relative rounded-2xl p-4 sm:p-5 border cursor-pointer transition-all duration-300 flex items-center justify-between active:scale-[0.98] backdrop-blur-xl overflow-hidden shadow-lg ${
              isDarkMode 
                ? 'bg-slate-900/90 border-cyan-400/80 hover:border-cyan-300 hover:bg-slate-800/90 shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
                : 'bg-cyan-50/80 border-cyan-300/80 hover:border-cyan-500 hover:bg-cyan-100/80 shadow-cyan-100'
            }`}
          >
            <div className="flex items-center gap-3.5 z-10">
              <div className={`p-3 rounded-xl border transition-all duration-300 shrink-0 ${
                isDarkMode 
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 group-hover:bg-cyan-400 group-hover:text-slate-950' 
                  : 'bg-cyan-600 border-cyan-700 text-white group-hover:bg-cyan-700'
              }`}>
                <svg className="w-5 h-5 stroke-[2.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.826-1.47-5.11-3.754-6.58-6.58l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>

              <span className={`text-xs sm:text-sm font-black tracking-wide transition-colors ${
                isDarkMode ? 'text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)] group-hover:text-cyan-200' : 'text-cyan-950 group-hover:text-cyan-900'
              }`}>
                TELEFON REHBERİ
              </span>
            </div>

            <div className={`z-10 p-2 rounded-full border transition-all duration-300 group-hover:translate-x-1 ${
              isDarkMode 
                ? 'border-cyan-400/60 bg-slate-950/80 text-cyan-300 group-hover:border-cyan-300 group-hover:bg-cyan-500/20' 
                : 'border-cyan-300 bg-white text-cyan-800 group-hover:border-cyan-500 group-hover:bg-cyan-200'
            }`}>
              <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>

        </div>

      </main>

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