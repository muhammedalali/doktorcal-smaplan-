'use client'; 

import { useState, useEffect, useRef, memo, useCallback } from 'react'; 
import { useRouter } from 'next/navigation'; 
import { db } from '@/lib/firebase';
import { doc, collection, onSnapshot, updateDoc, setDoc, query, orderBy } from 'firebase/firestore';
import { useTheme } from '@/context/ThemeContext';

// 💫 شاشة تحميل عصرية
function RadialDotsLoader({ title = "YÜKLENİYOR", isDarkMode }) {
  const [dots, setDots] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [showNetworkWarning, setShowNetworkWarning] = useState(false);
  const [isRedAlert, setIsRedAlert] = useState(false);
  const [animSpeed, setAnimSpeed] = useState(1.0);

  useEffect(() => {
    let offlineTimer = null;

    const updateNetworkSpeed = () => {
      if (!navigator.onLine) {
        setAnimSpeed(2.5);
        return;
      }

      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        const type = connection.effectiveType;
        if (type === '4g') setAnimSpeed(0.6);
        else if (type === '3g') setAnimSpeed(1.2);
        else if (type === '2g' || type === 'slow-2g') setAnimSpeed(2.0);
        else setAnimSpeed(1.0);
      } else {
        setAnimSpeed(1.0);
      }
    };

    const handleOfflineProcess = () => {
      setIsOnline(false);
      setShowNetworkWarning(true);
      setIsRedAlert(false);
      updateNetworkSpeed();

      if (offlineTimer) clearTimeout(offlineTimer);
      
      offlineTimer = setTimeout(() => {
        setIsRedAlert(true);
      }, 10000);
    };

    const handleOnlineProcess = () => {
      setIsOnline(true);
      setShowNetworkWarning(false);
      setIsRedAlert(false);
      updateNetworkSpeed();
      if (offlineTimer) clearTimeout(offlineTimer);
    };

    if (!navigator.onLine) {
      handleOfflineProcess();
    } else {
      setIsOnline(true);
      updateNetworkSpeed();
    }

    const handleOnline = () => handleOnlineProcess();
    const handleOffline = () => handleOfflineProcess();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.connection) {
      navigator.connection.addEventListener('change', updateNetworkSpeed);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', updateNetworkSpeed);
      }
      if (offlineTimer) clearTimeout(offlineTimer);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {showNetworkWarning && (
        <div className="fixed top-0 left-0 right-0 z-[100000] bg-rose-600 text-white text-center py-2 px-4 text-xs font-bold tracking-wide shadow-xl animate-pulse flex items-center justify-center gap-2 antialiased">
          <span>⚠ İNTERNET BAĞLANTISI KESİLDİ - YENİDEN BAĞLANILIYOR{dots}</span>
        </div>
      )}

      <div className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center transition-all duration-300 animate-fadeIn select-none pointer-events-auto antialiased ${
        isDarkMode ? 'bg-slate-950/80 text-slate-100 backdrop-blur-md' : 'bg-slate-900/60 text-slate-900 backdrop-blur-md'
      }`}>
        
        <div className="relative flex flex-col items-center justify-center transform-gpu">
          <div className={`absolute w-40 h-40 rounded-full blur-3xl pointer-events-none transition-all duration-700 ease-in-out ${
            !isRedAlert 
              ? (isDarkMode 
                  ? 'bg-gradient-to-r from-cyan-500/30 to-emerald-500/30' 
                  : 'bg-gradient-to-r from-teal-600/30 to-cyan-600/30') 
              : 'bg-rose-500/40'
          }`} />

          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center mb-8">
            <div 
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-emerald-400 dark:border-t-cyan-300 dark:border-r-emerald-300 animate-[spin_1.2s_linear_infinite] transform-gpu"
              style={{ animationDuration: `${animSpeed}s` }}
            />
            <div 
              className="absolute inset-3 sm:inset-3.5 rounded-full border-2 border-transparent border-b-sky-400 border-l-teal-300 dark:border-b-sky-300 dark:border-l-teal-200 animate-[spin_1.8s_linear_infinite_reverse] transform-gpu opacity-90"
              style={{ animationDuration: `${animSpeed * 1.5}s` }}
            />
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-white/5 dark:bg-slate-900/60 border border-white/10 dark:border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full animate-ping duration-1000 ${
                !isRedAlert 
                  ? (isDarkMode ? 'bg-cyan-400' : 'bg-teal-600')
                  : 'bg-rose-500'
              }`} />
            </div>
          </div>

          <div className="z-10 flex flex-col items-center justify-center gap-2 subpixel-antialiased">
            <div className="flex items-center justify-center gap-1">
              <h3 className={`text-sm sm:text-base font-bold tracking-[0.2em] uppercase transition-colors duration-300 ${
                !isRedAlert 
                  ? (isDarkMode 
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-teal-200 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' 
                      : 'text-slate-900 font-bold') 
                  : 'text-rose-500 dark:text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]'
              }`}>
                {title}
              </h3>
              <span className={`w-5 text-left font-mono font-bold text-sm sm:text-base ${
                !isRedAlert 
                  ? (isDarkMode ? 'text-cyan-300' : 'text-teal-800') 
                  : 'text-rose-500 dark:text-rose-400'
              }`}>
                {dots}
              </span>
            </div>

            {!isOnline && (
              <span className="text-[10px] sm:text-xs font-bold tracking-wide text-rose-500 dark:text-rose-400 uppercase animate-pulse mt-1">
                {isRedAlert ? 'BAĞLANTI BAŞARISIZ' : `İNTERNETE BAĞLANIYOR${dots}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// 🔤 شعار النظام المطور بحماية الهيدريشن والتحميل الآمن
const AnimatedTypewriterLogo = memo(function AnimatedTypewriterLogo({ isDarkMode, logoConfig }) {
  const fullText = "DOKTORSYS";
  const [displayedLength, setDisplayedLength] = useState(0);
  const [phase, setPhase] = useState('TYPING');

  const isEnabled = logoConfig?.isEnabled ?? true;
  const darkStyle = logoConfig?.darkColor || 'from-emerald-400 via-teal-300 to-cyan-400';
  const lightStyle = logoConfig?.lightColor || 'from-emerald-800 via-teal-700 to-cyan-800';
  const activeColorClasses = isDarkMode ? darkStyle : lightStyle;

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

  if (!isEnabled) {
    return (
      <div className="flex items-center h-full my-auto select-none pointer-events-none">
        <div className={`font-bold text-xs sm:text-sm tracking-[0.15em] bg-clip-text text-transparent uppercase flex items-center transition-all duration-300 bg-gradient-to-r ${activeColorClasses} drop-shadow-sm`}>
          {fullText}
        </div>
      </div>
    );
  }

  const visibleLetters = fullText.slice(0, displayedLength);

  return (
    <div className="flex items-center h-full my-auto select-none pointer-events-none">
      <div className={`font-bold text-xs sm:text-sm tracking-[0.15em] bg-clip-text text-transparent uppercase flex items-center transition-all duration-300 bg-gradient-to-r ${activeColorClasses} drop-shadow-sm`}>
        {visibleLetters.split('').map((char, index) => (
          <span key={index} className="inline-block transition-all duration-200 animate-fadeIn transform translate-y-0">
            {char}
          </span>
        ))}
      </div>
    </div>
  );
});

export default function DashboardPage() {   
  const [currentUser, setCurrentUser] = useState(null);   
  const [showExitModal, setShowExitModal] = useState(false);

  // 🌟 جلب triggerToast الموحدة من الثيم العام
  const { isDarkMode, toggleTheme, triggerToast } = useTheme();

  const [isOtherOperationsOpen, setIsOtherOperationsOpen] = useState(false);
  const [isModulesOpen, setIsModulesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showLogoConfigModal, setShowLogoConfigModal] = useState(false);

  const [showExitLogo, setShowExitLogo] = useState(false);
  const [displaySuccessName, setDisplaySuccessName] = useState('');

  useEffect(() => {
    const shouldAnimate = sessionStorage.getItem('dashboard_logo_exit_anim');
    const storedName = sessionStorage.getItem('logged_username_display');

    if (shouldAnimate === 'true') {
      const activeUser = sessionStorage.getItem('user');
      let fallbackName = 'KULLANICI';
      if (storedName) {
        fallbackName = storedName;
      } else if (activeUser) {
        try {
          fallbackName = (JSON.parse(activeUser).username || 'KULLANICI').toUpperCase();
        } catch (e) {}
      }

      setDisplaySuccessName(fallbackName);
      setShowExitLogo(true);

      const timer = setTimeout(() => {
        setShowExitLogo(false);
        sessionStorage.removeItem('dashboard_logo_exit_anim');
        sessionStorage.removeItem('logged_username_display');
      }, 2300);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const [logoConfig, setLogoConfig] = useState({
    isEnabled: true,
    visibleValue: 5,
    visibleUnit: 'SECONDS',
    hiddenValue: 5,
    hiddenUnit: 'SECONDS',
    darkColor: 'from-emerald-400 via-teal-300 to-cyan-400',
    lightColor: 'from-emerald-800 via-teal-700 to-cyan-800'
  });

  const [notifications, setNotifications] = useState([]);
  const [isEcgLoading, setIsEcgLoading] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState('YÜKLENİYOR');

  const notificationsRef = useRef(null);
  const otherOperationsRef = useRef(null);
  const modulesRef = useRef(null);
  const profileRef = useRef(null);
  const router = useRouter();   

  const clearSessionAndLogout = useCallback(() => {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;';
    document.cookie = 'user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;';
    document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;';
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;';
    
    sessionStorage.clear();
    localStorage.removeItem('user');
    localStorage.removeItem('login_lock_until');

    window.location.replace('/');
  }, []);

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
    const cached = localStorage.getItem('doktorsys_logo_config');
    if (cached) {
      try {
        setLogoConfig(JSON.parse(cached));
      } catch (e) {}
    }
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

    const handlePopState = () => clearSessionAndLogout();
    window.addEventListener('popstate', handlePopState);

    let unsubscribeUser = () => {};
    if (activeUser.id && activeUser.id !== 'admin-default') {
      unsubscribeUser = onSnapshot(doc(db, 'users', activeUser.id), (docSnap) => {
        if (docSnap.exists()) {
          const freshData = { id: docSnap.id, ...docSnap.data() };
          setCurrentUser(freshData);
          sessionStorage.setItem('user', JSON.stringify(freshData));
        }
      });
    }

    const unsubscribeLogoConfig = onSnapshot(doc(db, 'settings', 'logo_config'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const freshConfig = {
          isEnabled: data.isEnabled ?? true,
          darkColor: data.darkColor ?? 'from-emerald-400 via-teal-300 to-cyan-400',
          lightColor: data.lightColor ?? 'from-emerald-800 via-teal-700 to-cyan-800',
          visibleValue: data.visibleValue ?? data.visibleTime ?? 5,
          visibleUnit: data.visibleUnit ?? 'SECONDS',
          hiddenValue: data.hiddenValue ?? data.hiddenTime ?? 5,
          hiddenUnit: data.hiddenUnit ?? 'SECONDS',
        };
        setLogoConfig(freshConfig);
        localStorage.setItem('doktorsys_logo_config', JSON.stringify(freshConfig));
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
        return { id: doc.id, ...data, formattedDate };
      });
      setNotifications(fetchedReports);
    });

    return () => {
      window.removeEventListener('popstate', handlePopState);
      unsubscribeUser();
      unsubscribeLogoConfig();
      unsubscribeReports();
    };
  }, [router, clearSessionAndLogout]);   

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
      await updateDoc(reportRef, { isRead: true });
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
      localStorage.setItem('doktorsys_logo_config', JSON.stringify(logoConfig));
      setShowLogoConfigModal(false);
      triggerToast('Logo ve renk ayarları başarıyla kaydedildi.', 'success');
    } catch (err) {
      console.error("Logo config save error:", err);
      triggerToast('Logo ayarları kaydedilirken hata oluştu!', 'error');
    }
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    setLoadingTitle('YÜKLENİYOR');
    setIsEcgLoading(true);
    triggerToast('Oturum sonlandırılıyor...', 'info');
    setTimeout(() => clearSessionAndLogout(), 400);
  };

  const handleOpenModule = (path, title = 'YÜKLENİYOR') => {
    setIsOtherOperationsOpen(false);
    setIsModulesOpen(false);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    setLoadingTitle('YÜKLENİYOR');
    setIsEcgLoading(true);
    setTimeout(() => router.push(path), 250);
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
    { name: 'Emerald Luxe', dark: 'from-emerald-400 via-teal-300 to-cyan-400', light: 'from-emerald-800 via-teal-700 to-cyan-800' },
    { name: 'Cyber Blue', dark: 'from-blue-400 via-indigo-300 to-cyan-400', light: 'from-blue-800 via-indigo-700 to-cyan-800' },
    { name: 'Neon Purple', dark: 'from-purple-400 via-pink-300 to-rose-400', light: 'from-purple-800 via-pink-700 to-rose-800' },
    { name: 'Sunset Gold', dark: 'from-amber-400 via-orange-300 to-yellow-400', light: 'from-amber-800 via-orange-700 to-yellow-800' },
    { name: 'Rose Red', dark: 'from-rose-400 via-red-300 to-pink-400', light: 'from-rose-800 via-red-700 to-pink-800' }
  ];

  const displayUsername = rawUName ? rawUName.toUpperCase() : 'KULLANICI';

  const unifiedHeaderPillStyle = isDarkMode
    ? 'bg-slate-900/60 border-slate-700/60 text-slate-100 backdrop-blur-2xl shadow-lg shadow-black/20'
    : 'bg-white/60 border-slate-200/80 text-slate-900 backdrop-blur-2xl shadow-lg shadow-slate-200/50';

  return (     
    <div 
      className={`fixed inset-0 pb-10 sm:pb-11 h-dvh w-dvw max-h-dvh max-w-dvw overflow-hidden flex flex-col antialiased transition-colors duration-300 select-none cursor-default ${isDarkMode ? 'bg-[#020617] text-white' : 'bg-[#edf4ff] text-black'}`}
    >              
      {/* 🎯 كود CSS عام لفرض الخط الواضح وإزالة تأثيرات التمرير */}
      <style jsx global>{`
        * {
          font-family: 'Georgia', 'Times New Roman', Times, serif !important;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        /* إزالة أي تأثير تمرير من أي زر أو قائمة في الصفحة بالكامل */
        button, a, div[role="button"], select, input {
          transition: none !important;
        }
        button:hover, a:hover, div[role="button"]:hover {
          background-color: inherit !important;
          color: inherit !important;
          transform: none !important;
          box-shadow: none !important;
        }
      `}</style>

      {isEcgLoading && <RadialDotsLoader title={loadingTitle} isDarkMode={isDarkMode} />}

      {/* 🏙️ خلفية هندسية ثلاثية الأبعاد */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[120vw] h-[60vh] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${
          isDarkMode 
            ? 'bg-gradient-to-b from-slate-800/20 via-slate-900/10 to-transparent' 
            : 'bg-gradient-to-b from-blue-200/20 via-slate-200/10 to-transparent'
        }`} />

        <div 
          className={`absolute inset-0 transition-all duration-300 ${isDarkMode ? 'opacity-25' : 'opacity-35'}`}
          style={{
            backgroundImage: isDarkMode
              ? `linear-gradient(to right, rgba(148, 163, 184, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.2) 1px, transparent 1px)`
              : `linear-gradient(to right, rgba(71, 85, 105, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(71, 85, 105, 0.25) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            transform: 'perspective(500px) rotateX(20deg) scale(1.2)',
            transformOrigin: 'top center'
          }}
        />
        
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617]' 
            : 'bg-gradient-to-b from-transparent via-[#edf4ff]/50 to-[#edf4ff]'
        }`} />
      </div>

      {/* 🚀 الهيدر العلوي */}
      <header className="w-full shrink-0 px-3 sm:px-6 py-3 flex items-center justify-between flex-wrap lg:flex-nowrap gap-2 z-30 relative bg-transparent border-b border-white/5">
        <div className="flex items-center gap-3 h-full my-auto shrink-0">
          <AnimatedTypewriterLogo isDarkMode={isDarkMode} logoConfig={logoConfig} />
          {isGlobalAdmin && (
            <button
              onClick={() => setShowLogoConfigModal(true)}
              className={`p-1.5 rounded-lg border border-transparent cursor-pointer text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
              title="Logo Animasyon ve Renk Ayarları"
            >
              ⚙
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
          
          {/* زر التنبيهات */}
          <div className="relative shrink-0" ref={notificationsRef}>
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`relative h-10 w-10 rounded-2xl border flex items-center justify-center cursor-pointer shrink-0 ${unifiedHeaderPillStyle}`}
              title="Bildirimler"
            >
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-[10px] text-white font-bold px-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                  {unreadNotifications.length}
                </span>
              )}
              <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {isNotificationsOpen && (
              <div className={`absolute right-0 top-full mt-3 w-80 sm:w-88 border rounded-3xl shadow-2xl overflow-hidden z-[150] backdrop-blur-3xl ${
                isDarkMode ? 'bg-slate-900/95 border-slate-700/50 text-white' : 'bg-white/95 border-slate-200 text-black'
              }`}>
                <div className={`px-5 py-4 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-700/50 bg-slate-950/40' : 'border-slate-200 bg-slate-50/50'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">BİLDİRİMLER</span>
                  </div>
                  {unreadNotifications.length > 0 && (
                    <span className="bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      {unreadNotifications.length}
                    </span>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-700/20 scrollbar-none">
                  {unreadNotifications.length > 0 ? (
                    unreadNotifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-4 flex flex-col gap-2 cursor-pointer ${
                          isDarkMode ? 'bg-slate-950/20' : 'bg-white/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-amber-700 dark:text-amber-500 truncate uppercase">
                            👤 {item.senderName || item.createdBy || 'Kullanıcı'}
                          </span>
                          <span className="text-[10px] font-mono font-bold opacity-80 shrink-0 bg-slate-200/50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded">
                            {item.formattedDate}
                          </span>
                        </div>
                        <p className="font-bold text-[11px] leading-relaxed">
                          {item.title || item.message || item.description || 'Yeni bir sorun/arıza bildirimi gönderildi.'}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[9px] bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-md font-mono font-bold uppercase">
                            {item.category || item.type || 'ARIZA'}
                          </span>
                          <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-bold flex items-center gap-1">
                            Detay ➔
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 px-4 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto text-xl shadow-inner">
                        🔔
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide">
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
            className={`hidden sm:flex h-10 w-10 rounded-2xl border items-center justify-center cursor-pointer shrink-0 ${unifiedHeaderPillStyle}`}
            title="Tam Ekran"
          >
            <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className={`h-10 w-10 rounded-2xl border flex items-center justify-center cursor-pointer shrink-0 ${unifiedHeaderPillStyle}`}
            title={isDarkMode ? 'Gündüz Modu' : 'Gece Modu'}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5 text-amber-400 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-800 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* زر Diğer İşlemler */}
          <div className="relative shrink-0" ref={otherOperationsRef}>
            <button 
              onClick={() => setIsOtherOperationsOpen(!isOtherOperationsOpen)} 
              className={`h-10 px-4 rounded-2xl flex items-center gap-2 text-xs font-bold cursor-pointer border ${unifiedHeaderPillStyle}`}
            >
              <svg className="w-4 h-4 text-sky-700 dark:text-cyan-400 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="hidden md:inline tracking-wide font-bold">Diğer İşlemler</span>
              <svg className={`w-3.5 h-3.5 stroke-[2.5] opacity-80 transition-transform duration-300 ${isOtherOperationsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOtherOperationsOpen && (
              <div className={`absolute right-0 top-full mt-3 w-60 border rounded-2xl shadow-2xl py-2 z-[120] text-xs font-bold backdrop-blur-3xl ${isDarkMode ? 'bg-slate-900/95 border-slate-700/50 text-white' : 'bg-white/95 border-slate-200 text-black'}`}>
                {otherOperationsList.filter(m => m.show).map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => handleOpenModule(mod.path)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                    <span>{mod.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* زر Yetkili İşlemler */}
          {hasAuthorizedModules && (
            <div className="relative shrink-0" ref={modulesRef}>
              <button 
                onClick={() => setIsModulesOpen(!isModulesOpen)} 
                className={`h-10 px-4 rounded-2xl flex items-center gap-2 text-xs font-bold cursor-pointer border ${unifiedHeaderPillStyle}`}
              >
                <svg className="w-4 h-4 text-sky-700 dark:text-cyan-400 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="hidden md:inline tracking-wide font-bold">Yetkili İşlemler</span>
                <svg className={`w-3.5 h-3.5 stroke-[2.5] opacity-80 transition-transform duration-300 ${isModulesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isModulesOpen && (
                <div className={`absolute right-0 top-full mt-3 w-64 border rounded-2xl shadow-2xl py-2 z-[120] text-xs font-bold backdrop-blur-3xl ${isDarkMode ? 'bg-slate-900/95 border-slate-700/50 text-white' : 'bg-white/95 border-slate-200 text-black'}`}>
                  {isGlobalAdmin && (
                    <button
                      onClick={() => handleOpenModule('/admin/stats')}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer`}
                    >
                      <svg className="w-4 h-4 text-purple-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                      <span>Sistem İstatistikleri</span>
                    </button>
                  )}

                  {isGlobalAdmin && (
                    <button
                      onClick={() => handleOpenModule('/admin/users')}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer`}
                    >
                      <svg className="w-4 h-4 text-cyan-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Kullanıcı Yönetimi</span>
                    </button>
                  )}

                  {canManageDoctors && (
                    <button
                      onClick={() => handleOpenModule('/admin/doctors')}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer`}
                    >
                      <svg className="w-4 h-4 text-cyan-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Bölüm ve Doktor Yönetimi</span>
                    </button>
                  )}

                  {canManageReports && (
                    <button
                      onClick={() => handleOpenModule('/admin/reports')}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer`}
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

          {/* زر Profile / ADMIN */}
          <div className="relative shrink-0" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)} 
              className={`h-10 px-3 sm:px-4 rounded-2xl flex items-center gap-2.5 text-xs font-bold cursor-pointer border ${unifiedHeaderPillStyle}`}
            >
              <div className="relative flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white text-[10px] shadow-[0_0_10px_rgba(6,182,212,0.5)] border border-white/20">
                  {displayUsername.charAt(0)}
                </div>
              </div>
              <span className="tracking-wide font-bold max-w-[60px] sm:max-w-[100px] truncate hidden sm:block">{displayUsername}</span>
              <svg className={`w-3.5 h-3.5 stroke-[2.5] opacity-80 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isProfileOpen && (
              <div className={`absolute right-0 top-full mt-3 w-64 border rounded-3xl shadow-2xl py-2 z-[120] text-xs font-bold backdrop-blur-3xl ${isDarkMode ? 'bg-slate-900/95 border-slate-700/50 text-white' : 'bg-white/95 border-slate-200 text-black'}`}>
                <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-slate-700/50 bg-slate-950/40' : 'border-slate-200 bg-slate-50/50'}`}>
                  <p className="font-bold text-sm text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400">{displayUsername}</p>
                  <p className="text-[11px] opacity-90 font-bold mt-0.5">{currentUser?.role || 'Kullanıcı'}</p>
                </div>

                <div className="py-2">
                  <button onClick={() => handleOpenModule('/profile')} className={`w-full text-left px-5 py-3 flex items-center gap-3 cursor-pointer`}>
                    <svg className="w-4 h-4 text-cyan-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profil Bilgileri</span>
                  </button>

                  <button onClick={() => handleOpenModule('/report')} className={`w-full text-left px-5 py-3 flex items-center gap-3 cursor-pointer`}>
                    <svg className="w-4 h-4 text-amber-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Arıza Bildir</span>
                  </button>

                  <button onClick={() => { setIsProfileOpen(false); setShowExitModal(true); }} className={`w-full text-left px-5 py-3 flex items-center gap-3 border-t font-bold cursor-pointer ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
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
      <main className="p-4 sm:p-8 w-full flex-1 flex flex-col items-start justify-start max-w-7xl mx-auto overflow-hidden relative z-10 pt-6 sm:pt-10 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl">
          {/* 💎 بطاقة DOKTOR ÇALIŞMA LİSTESİ */}
          <div 
            onClick={() => handleOpenModule('/schedule')}
            className={`relative rounded-2xl p-4 sm:p-5 border cursor-pointer flex items-center justify-between overflow-hidden backdrop-blur-xl ${
              isDarkMode 
                ? 'bg-slate-900/80 border-cyan-400/80 text-white' 
                : 'bg-slate-200/70 border-slate-300/90 text-black shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3.5 z-10">
              <div className={`p-3 rounded-xl border shrink-0 ${
                isDarkMode 
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300' 
                  : 'bg-slate-900 border-slate-950 text-cyan-300'
              }`}>
                <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <span className={`text-sm sm:text-base font-bold tracking-wide`}>
                DOKTOR ÇALIŞMA LİSTESİ
              </span>
            </div>

            <div className={`z-10 p-2 rounded-full border ${
              isDarkMode 
                ? 'border-cyan-400/60 bg-slate-950/80 text-cyan-300' 
                : 'border-slate-400 bg-slate-300/80 text-slate-900'
            }`}>
              <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>

          {/* 💎 بطاقة TELEFON REHBERİ */}
          <div 
            onClick={() => handleOpenModule('/phonebook')}
            className={`relative rounded-2xl p-4 sm:p-5 border cursor-pointer flex items-center justify-between overflow-hidden backdrop-blur-xl ${
              isDarkMode 
                ? 'bg-slate-900/80 border-cyan-400/80 text-white' 
                : 'bg-slate-200/70 border-slate-300/90 text-black shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3.5 z-10">
              <div className={`p-3 rounded-xl border shrink-0 ${
                isDarkMode 
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300' 
                  : 'bg-slate-900 border-slate-950 text-cyan-300'
              }`}>
                <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.826-1.47-5.11-3.754-6.58-6.58l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <span className={`text-sm sm:text-base font-bold tracking-wide`}>
                TELEFON REHBERİ
              </span>
            </div>

            <div className={`z-10 p-2 rounded-full border ${
              isDarkMode 
                ? 'border-cyan-400/60 bg-slate-950/80 text-cyan-300' 
                : 'border-slate-400 bg-slate-300/80 text-slate-900'
            }`}>
              <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>
        </div>
      </main>

      {/* 💎 الشعار الشفاف متموضع بأمان أعلى شريط التبويبات السفلي */}
      {showExitLogo && (
        <div className="fixed bottom-14 sm:bottom-16 right-6 sm:right-10 z-[999999] flex items-center gap-3 select-none pointer-events-none">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.3)] backdrop-blur-md border border-emerald-500/30">
            <svg className="w-6 h-6 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className={`text-sm sm:text-base font-bold tracking-wider uppercase ${
              isDarkMode ? 'text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'text-emerald-950'
            }`}>
              {displaySuccessName}
            </span>
            <span className={`text-xs font-bold tracking-widest uppercase ${
              isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
            }`}>
              GİRİŞ BAŞARILI
            </span>
          </div>
        </div>
      )}

      {showLogoConfigModal && isGlobalAdmin && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xl">
          <div className={`w-full max-w-md rounded-[2rem] p-6 shadow-2xl border space-y-5 max-h-[90vh] overflow-y-auto scrollbar-none ${
            isDarkMode ? 'bg-slate-900/90 border-slate-700/50 text-white' : 'bg-white/90 border-slate-200 text-black'
          }`}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-700/30">
              <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                LOGO ANIMASYON VE RENK AYARLARI
              </h3>
              <button onClick={() => setShowLogoConfigModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveLogoConfig} className="space-y-5 text-xs font-bold">
              <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                <span>Animasyonlu Yazı:</span>
                <button
                  type="button"
                  onClick={() => setLogoConfig(prev => ({ ...prev, isEnabled: !prev.isEnabled }))}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase shadow-sm ${
                    logoConfig.isEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {logoConfig.isEnabled ? 'AÇIK' : 'KAPALI'}
                </button>
              </div>

              <div>
                <label className="block text-[10px] text-slate-600 uppercase mb-2 tracking-wider font-bold">Hazır Renk Şablonları</label>
                <div className="flex flex-wrap gap-2">
                  {presetGradients.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLogoConfig(prev => ({ ...prev, darkColor: p.dark, lightColor: p.light }))}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border ${
                        isDarkMode ? 'bg-slate-800 text-slate-200 border-slate-600' : 'bg-slate-100 text-slate-800 border-slate-300'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-amber-600 uppercase mb-1.5 tracking-wider font-bold">Gece Modu Renk Gradyanı</label>
                <input
                  type="text"
                  value={logoConfig.darkColor ?? ''}
                  onChange={(e) => setLogoConfig(prev => ({ ...prev, darkColor: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border font-mono outline-none focus:ring-2 focus:ring-amber-500/50 text-[11px] ${
                    isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-black'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] text-sky-600 uppercase mb-1.5 tracking-wider font-bold">Gündüz Modu Renk Gradyanı</label>
                <input
                  type="text"
                  value={logoConfig.lightColor ?? ''}
                  onChange={(e) => setLogoConfig(prev => ({ ...prev, lightColor: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border font-mono outline-none focus:ring-2 focus:ring-sky-500/50 text-[11px] ${
                    isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-black'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-600 uppercase mb-1.5 tracking-wider font-bold">Ekranda Kalma Süresi</label>
                  <input
                    type="number"
                    min="1"
                    value={logoConfig.visibleValue ?? 5}
                    onChange={(e) => setLogoConfig(prev => ({ ...prev, visibleValue: e.target.value === '' ? '' : Number(e.target.value) }))}
                    className={`w-full px-4 py-2.5 rounded-xl border font-mono outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                      isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-black'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 uppercase mb-1.5 tracking-wider font-bold">Birim</label>
                  <select
                    value={logoConfig.visibleUnit ?? 'SECONDS'}
                    onChange={(e) => setLogoConfig(prev => ({ ...prev, visibleUnit: e.target.value }))}
                    className={`w-full px-4 py-2.5 rounded-xl border font-mono outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                      isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-black'
                    }`}
                  >
                    <option value="SECONDS">Saniye</option>
                    <option value="MINUTES">Dakika</option>
                    <option value="HOURS">Saat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-600 uppercase mb-1.5 tracking-wider font-bold">Gizli Kalma Süresi</label>
                  <input
                    type="number"
                    min="1"
                    value={logoConfig.hiddenValue ?? 5}
                    onChange={(e) => setLogoConfig(prev => ({ ...prev, hiddenValue: e.target.value === '' ? '' : Number(e.target.value) }))}
                    className={`w-full px-4 py-2.5 rounded-xl border font-mono outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                      isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-black'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 uppercase mb-1.5 tracking-wider font-bold">Birim</label>
                  <select
                    value={logoConfig.hiddenUnit ?? 'SECONDS'}
                    onChange={(e) => setLogoConfig(prev => ({ ...prev, hiddenUnit: e.target.value }))}
                    className={`w-full px-4 py-2.5 rounded-xl border font-mono outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                      isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-black'
                    }`}
                  >
                    <option value="SECONDS">Saniye</option>
                    <option value="MINUTES">Dakika</option>
                    <option value="HOURS">Saat</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLogoConfigModal(false)}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold ${
                    isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-black'
                  }`}
                >
                  İPTAL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  KAYDET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExitModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xl">
          <div className={`w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border space-y-5 text-center ${isDarkMode ? 'bg-slate-900/90 border-slate-700/50 text-white' : 'bg-white/90 border-slate-200 text-black'}`}>
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center shadow-inner border border-rose-500/20">
              <svg className="w-8 h-8 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-wide">SİSTEMDEN ÇIKIŞ YAPILSIN MI?</h3>
              <p className={`text-xs font-bold mt-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Oturumunuz güvenli bir şekilde sonlandırılacaktır.</p>
            </div>
            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setShowExitModal(false)}
                className={`flex-1 py-3 text-xs font-bold rounded-xl ${
                  isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-black'
                }`}
              >
                İPTAL
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white text-xs font-bold rounded-xl uppercase tracking-wider"
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