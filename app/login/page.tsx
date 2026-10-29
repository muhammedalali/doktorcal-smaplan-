'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';

const DEFAULT_PERMISSIONS = {
  'bölüm ve doktor yönetimi': true,
  'bölüm ve doktor düzeltme yetkisi': true,
  'bölüm ve doktor silme yetkisi': true,
  'çalışma durumu değiştirme': true,
  'sorun bildirme yönetimi': true,
  canEditDoctors: true,
  canDeleteDoctors: true,
  canEditSchedule: true,
  canDeleteSchedule: true,
  canChangeStatus: true,
  canManageIssues: true
};

const LOCK_DURATIONS = [300, 1200, 1800, 3600, 43200, 86400];

const getUserLockInfo = (uName: string) => {
  if (!uName) return { lockUntil: 0, lockLevel: 0, failedAttempts: 0 };
  try {
    const raw = localStorage.getItem(`user_lock_${uName.toUpperCase()}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { lockUntil: 0, lockLevel: 0, failedAttempts: 0 };
};

const setUserLockInfo = (uName: string, info: { lockUntil: number; lockLevel: number; failedAttempts: number }) => {
  if (!uName) return;
  try {
    localStorage.setItem(`user_lock_${uName.toUpperCase()}`, JSON.stringify(info));
  } catch (e) {}
};

const clearUserLockInfo = (uName: string) => {
  if (!uName) return;
  try {
    localStorage.removeItem(`user_lock_${uName.toUpperCase()}`);
  } catch (e) {}
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginStatus, setLoginStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const { isDarkMode } = useTheme();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  
  const statusRef = useRef<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const lockIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    statusRef.current = loginStatus;
  }, [loginStatus]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.clear();
    localStorage.removeItem('user');

    const handlePopState = () => {
      router.replace('/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [router]);

  // 🌐 الكانفاس التفاعلي
  useEffect(() => {
    const canvas = gridCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let isMobile = width < 640;
    const step = isMobile ? 42 : 54;

    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      isMobile = width < 640;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isMobile) return;
      if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const render = () => {
      mouse.x += (mouse.targetX - mouse.x) * 0.22;
      mouse.y += (mouse.targetY - mouse.y) * 0.22;

      ctx.clearRect(0, 0, width, height);

      let strokeColor = isDarkMode ? 'rgba(56, 189, 248, ' : 'rgba(14, 165, 233, ';
      let dotColor = isDarkMode ? 'rgba(125, 211, 252, ' : 'rgba(56, 189, 248, ';

      if (statusRef.current === 'SUCCESS') {
        strokeColor = isDarkMode ? 'rgba(34, 197, 94, ' : 'rgba(5, 150, 105, '; 
        dotColor = isDarkMode ? 'rgba(74, 222, 128, ' : 'rgba(16, 185, 129, ';
      } else if (statusRef.current === 'ERROR') {
        strokeColor = 'rgba(239, 68, 68, '; 
        dotColor = 'rgba(248, 113, 113, ';
      }

      const cols = Math.ceil(width / step) + 6;
      const rows = Math.ceil(height / step) + 6;
      const craterRadius = isMobile ? 85 : 120;

      const points: { x: number; y: number }[][] = [];
      const tiltAngle = Math.PI / 12;
      const cosA = Math.cos(tiltAngle);
      const sinA = Math.sin(tiltAngle);

      for (let r = -3; r <= rows; r++) {
        const rIndex = r + 3;
        points[rIndex] = [];

        for (let c = -3; c <= cols; c++) {
          const rawX = c * step;
          const rawY = r * step;

          const centerX = width / 2;
          const centerY = height / 2;
          const relX = rawX - centerX;
          const relY = rawY - centerY;

          const rotatedX = relX * cosA - relY * sinA + centerX;
          const rotatedY = relX * sinA + relY * cosA + centerY;

          const distToMouse = Math.hypot(rotatedX - mouse.x, rotatedY - mouse.y);
          let shiftX = 0;
          let shiftY = 0;

          if (distToMouse < craterRadius && distToMouse > 0) {
            const factor = (1 - distToMouse / craterRadius);
            const angle = Math.atan2(rotatedY - mouse.y, rotatedX - mouse.x);
            const push = factor * (isMobile ? 8 : 14);

            shiftX = Math.cos(angle) * push;
            shiftY = Math.sin(angle) * push;
          }

          points[rIndex][c + 3] = { x: rotatedX + shiftX, y: rotatedY + shiftY };
        }
      }

      ctx.lineWidth = statusRef.current === 'SUCCESS' ? 1.2 : 0.85;

      for (let r = 0; r < points.length; r++) {
        for (let c = 0; c < points[r].length; c++) {
          const pt = points[r][c];
          const baseAlpha = statusRef.current === 'SUCCESS' 
            ? (isDarkMode ? 0.35 : 0.45) 
            : (isDarkMode ? 0.25 : 0.20);

          if (c < points[r].length - 1) {
            const ptNext = points[r][c + 1];
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(ptNext.x, ptNext.y);
            ctx.strokeStyle = `${strokeColor}${baseAlpha})`;
            ctx.stroke();
          }

          if (r < points.length - 1 && points[r + 1][c]) {
            const ptDown = points[r + 1][c];
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(ptDown.x, ptDown.y);
            ctx.strokeStyle = `${strokeColor}${baseAlpha * 0.7})`;
            ctx.stroke();
          }

          if (r % 2 === 0 && c % 2 === 0) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, isDarkMode ? 1.2 : 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `${dotColor}${baseAlpha * 1.5})`;
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

  useEffect(() => {
    const unsubscribeFirestore = onSnapshot(collection(db, 'users'), (snapshot) => {
      const firestoreUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const adminExists = firestoreUsers.some((u: any) => {
        const uName = (u.username || '').toString().toUpperCase().replace(/İ/g, 'I');
        return uName === 'ADMIN';
      });

      let combined = firestoreUsers;
      if (!adminExists) {
        combined = [
          { 
            id: 'admin-default', 
            username: 'ADMİN', 
            surname: 'YÖNETİCİ', 
            phone: '05555555555',
            password: 'admin1233', 
            role: 'YÖNETİCİ',
            permissions: DEFAULT_PERMISSIONS
          },
          ...firestoreUsers
        ];
      }

      setAllUsers(combined);
      localStorage.setItem('app_users', JSON.stringify(combined));
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribeFirestore();
      document.removeEventListener('mousedown', handleClickOutside);
      if (lockIntervalRef.current) clearInterval(lockIntervalRef.current);
    };
  }, []);

  const checkAndApplyUserLock = (cleanUName: string) => {
    if (lockIntervalRef.current) clearInterval(lockIntervalRef.current);

    if (!cleanUName) {
      setIsLocked(false);
      setLockTimer(0);
      if (loginStatus === 'ERROR') {
        setLoginStatus('IDLE');
        setError('');
      }
      return;
    }

    const info = getUserLockInfo(cleanUName);
    const now = Date.now();

    if (info.lockUntil > now) {
      const remaining = Math.ceil((info.lockUntil - now) / 1000);
      setIsLocked(true);
      setLockTimer(remaining);
      setLoginStatus('ERROR');
      
      const timeText = remaining >= 3600 
        ? `${Math.floor(remaining / 3600)} saat`
        : `${Math.ceil(remaining / 60)} dakika`;

      setError(`3 hatalı deneme! '${cleanUName}' hesabı ${timeText} süreyle kilitlenmiştir.`);
      startLockCountdown(cleanUName, remaining);
    } else {
      setIsLocked(false);
      setLockTimer(0);
      if (loginStatus === 'ERROR') {
        setLoginStatus('IDLE');
        setError('');
      }
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setShowUserDropdown(true);

    const cleanInput = value.trim().toUpperCase().replace(/İ/g, 'I');
    checkAndApplyUserLock(cleanInput);

    if (cleanInput.length > 0) {
      const isExactMatch = allUsers.some((u: any) => {
        const uName = (u.username || '').toString().trim().toUpperCase().replace(/İ/g, 'I');
        return uName === cleanInput;
      });

      if (isExactMatch) {
        setShowUserDropdown(false);
        setTimeout(() => {
          passwordInputRef.current?.focus();
        }, 50);
      }
    }
  };

  const startLockCountdown = (cleanUName: string, seconds: number) => {
    if (lockIntervalRef.current) clearInterval(lockIntervalRef.current);
    let current = seconds;

    lockIntervalRef.current = setInterval(() => {
      current -= 1;
      setLockTimer(current);
      if (current <= 0) {
        if (lockIntervalRef.current) clearInterval(lockIntervalRef.current);
        setIsLocked(false);
        setLoginStatus('IDLE');
        setError('');
        clearUserLockInfo(cleanUName);
      }
    }, 1000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const rawInputUsername = username.trim();
    const cleanInputUsername = rawInputUsername.toUpperCase().replace(/İ/g, 'I');
    const cleanPassword = password.trim();

    const userLock = getUserLockInfo(cleanInputUsername);
    if (userLock.lockUntil > Date.now()) {
      checkAndApplyUserLock(cleanInputUsername);
      return;
    }

    if (typeof window !== 'undefined' && !navigator.onLine) {
      setLoginStatus('ERROR');
      setError('İnternet bağlantısı yok! Lütfen bağlantınızı kontrol ediniz.');
      return;
    }

    try {
      const userExists = allUsers.some((u: any) => {
        const uName = (u.username || '').toString().trim().toUpperCase().replace(/İ/g, 'I');
        return uName === cleanInputUsername;
      });

      let foundUser: any = allUsers.find((u: any) => {
        const uName = (u.username || '').toString().trim().toUpperCase().replace(/İ/g, 'I');
        return uName === cleanInputUsername && u.password === cleanPassword;
      });

      if (!foundUser && cleanInputUsername === 'ADMIN' && cleanPassword === 'admin1233') {
        foundUser = { 
          id: 'admin-default',
          username: 'ADMİN', 
          role: 'YÖNETİCİ',
          permissions: DEFAULT_PERMISSIONS
        };
      }

      // 🟢 الدخول بنجاح
      if (foundUser) {
        setLoginStatus('SUCCESS');
        setError('');
        clearUserLockInfo(cleanInputUsername);

        // 🌟 حفظ اسم المستخدم وتفعيل إشارة الشعار ليختفي في الـ Dashboard
        const loggedName = foundUser.username || rawInputUsername;
        sessionStorage.setItem('dashboard_logo_exit_anim', 'true');
        sessionStorage.setItem('logged_username_display', loggedName.toUpperCase());

        const uNameNormalized = (foundUser.username || '').toString().trim().toUpperCase().replace(/İ/g, 'I');
        const isUserAdmin = foundUser.role === 'YÖNETİCİ' || foundUser.role === 'ADMIN' || uNameNormalized === 'ADMIN';
        
        const userPermissions = isUserAdmin 
          ? DEFAULT_PERMISSIONS 
          : (foundUser.permissions || {});

        const nowIso = new Date().toISOString();

        const sessionUserObj = {
          id: foundUser.id || 'admin-default',
          username: loggedName,
          role: isUserAdmin ? 'YÖNETİCİ' : (foundUser.role || 'PERSONEL'),
          permissions: userPermissions,
          lastLogin: nowIso
        };

        if (foundUser.id && foundUser.id !== 'admin-default') {
          try {
            await updateDoc(doc(db, 'users', foundUser.id), {
              lastLogin: nowIso
            });
          } catch (err) {
            console.error('Son giriş güncelleme hatası:', err);
          }
        }

        sessionStorage.setItem('user', JSON.stringify(sessionUserObj));
        localStorage.setItem('user', JSON.stringify(sessionUserObj));

        const cookieValue = encodeURIComponent(JSON.stringify(sessionUserObj));
        document.cookie = `auth_token=valid_token_${Date.now()}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `user_session=${cookieValue}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `user_role=${isUserAdmin ? 'ADMIN' : 'USER'}; path=/; max-age=604800; SameSite=Lax`;

        window.dispatchEvent(new Event('userSessionUpdated'));

        setTimeout(() => {
          window.location.replace('/dashboard');
        }, 1200);

      } else {
        // 🔴 فشل تسجيل الدخول
        setLoginStatus('ERROR');
        const currentLockInfo = getUserLockInfo(cleanInputUsername);
        const newFailedAttempts = (currentLockInfo.failedAttempts || 0) + 1;

        try {
          await addDoc(collection(db, 'failed_logins'), {
            username: rawInputUsername || 'Bilinmeyen Kullanıcı',
            attemptedUser: cleanInputUsername,
            timestamp: serverTimestamp(),
            date: new Date().toLocaleString('tr-TR'),
            status: 'HATALI_PAROLA'
          });
        } catch (logErr) {
          console.error("Hatalı giriş kaydı Firestore hatası:", logErr);
        }

        if (newFailedAttempts >= 3) {
          setIsLocked(true);
          const currentLevel = currentLockInfo.lockLevel || 0;
          const nextLevel = Math.min(currentLevel + 1, LOCK_DURATIONS.length);
          const lockDurationSeconds = LOCK_DURATIONS[nextLevel - 1] || 86400;
          const lockUntil = Date.now() + lockDurationSeconds * 1000;

          setUserLockInfo(cleanInputUsername, {
            lockUntil: lockUntil,
            lockLevel: nextLevel,
            failedAttempts: 0
          });

          startLockCountdown(cleanInputUsername, lockDurationSeconds);

          const timeText = lockDurationSeconds >= 3600 
            ? `${Math.floor(lockDurationSeconds / 3600)} saat`
            : `${Math.floor(lockDurationSeconds / 60)} dakika`;

          setError(`3 hatalı deneme! '${cleanInputUsername}' hesabı ${timeText} süreyle kilitlenmiştir.`);
        } else {
          setUserLockInfo(cleanInputUsername, {
            ...currentLockInfo,
            failedAttempts: newFailedAttempts
          });

          if (!userExists && cleanInputUsername !== 'ADMIN') {
            setError(`'${rawInputUsername}' adında kullanıcı bulunamadı!`);
          } else {
            setError(`Şifre hatalı! (Kalan Hak: ${3 - newFailedAttempts})`);
          }
        }
      }
    } catch (err) {
      setLoginStatus('ERROR');
      setError('Sunucu hatası oluştu! Lütfen tekrar deneyiniz.');
    }
  };

  const formatLockTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remainingSecs = secs % 60;

    if (hours > 0) {
      return `${hours}:${mins < 10 ? '0' : ''}${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const filteredUsers = username.trim().length > 0 
    ? allUsers.filter((u: any) => {
        const uName = (u.username || '').toString().toUpperCase().replace(/İ/g, 'I');
        const inputNorm = username.trim().toUpperCase().replace(/İ/g, 'I');
        return uName.includes(inputNorm);
      })
    : [];

  return (
    <div className={`h-[100dvh] w-screen overflow-hidden fixed inset-0 overscroll-none touch-none flex items-center justify-center transition-colors duration-700 font-sans select-none ${
      isDarkMode ? 'bg-[#020617] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>

      <style jsx global>{`
        html, body {
          overflow: hidden !important;
          height: 100dvh !important;
          margin: 0 !important;
          padding: 0 !important;
          touch-action: none !important;
          overscroll-behavior: none !important;
        }
        ::-webkit-scrollbar {
          display: none !important;
          width: 0px !important;
          height: 0px !important;
        }

        @keyframes slideInFromRight {
          0% {
            transform: translateX(120%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slideInRight {
          animation: slideInFromRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* 🌌 الخلفية والوهج - لون أخضر زمردي مبهر وعصري */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <div className={`absolute inset-0 transition-opacity duration-700 ${
          loginStatus === 'SUCCESS'
            ? (isDarkMode ? 'bg-emerald-950/50' : 'bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-200')
            : loginStatus === 'ERROR'
            ? (isDarkMode ? 'bg-rose-950/30' : 'bg-rose-100/40')
            : isDarkMode 
            ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/40 via-[#020617] to-[#020617]' 
            : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-200/50 via-slate-100/80 to-[#f8fafc]'
        }`} />

        <canvas ref={gridCanvasRef} className="absolute inset-0 w-full h-full block z-0" />

        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] max-w-[500px] h-[300px] rounded-full blur-[120px] pointer-events-none transition-all duration-700 ${
          loginStatus === 'SUCCESS'
            ? 'bg-emerald-500/50 scale-125'
            : loginStatus === 'ERROR'
            ? 'bg-rose-500/25'
            : isDarkMode ? 'bg-cyan-500/10' : 'bg-sky-400/25'
        }`} />
      </div>

      {/* 📦 الحاوية الشفافة العريضة */}
      <div className={`w-[92vw] max-w-sm sm:max-w-md rounded-[2.5rem] border-0 p-7 sm:p-8 bg-transparent transition-none z-10 relative select-none transform-gpu ${
        isDarkMode ? 'text-slate-100' : 'text-slate-900'
      }`}>

        {/* 📝 عرض الأخطاء والقفل التنازلي */}
        {isLocked ? (
          <div className="mb-6 space-y-4 animate-fadeIn text-center">
            <div className="flex items-center justify-center gap-2 text-rose-500 dark:text-rose-400 font-extrabold text-xs sm:text-sm tracking-wide">
              <svg className="w-5 h-5 shrink-0 animate-pulse stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>

            <div className="pt-2 flex flex-col items-center justify-center">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.3em] text-rose-500/80 dark:text-rose-400/80 mb-1">
                KALAN SÜRE
              </span>
              <div className="text-4xl sm:text-5xl font-mono font-black tracking-widest text-rose-600 dark:text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.45)] animate-pulse">
                {formatLockTime(lockTimer)}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="mb-5 flex items-center justify-center gap-2 animate-fadeIn text-center">
            <svg className="w-5 h-5 shrink-0 animate-pulse stroke-[2.5] text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className={`text-xs sm:text-sm font-black tracking-wide leading-tight ${
              isDarkMode ? 'text-rose-400 drop-shadow-sm' : 'text-rose-600 font-extrabold'
            }`}>
              {error}
            </p>
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* حقل اسم المستخدم */}
          <div className="relative" ref={dropdownRef}>
            <label className={`block text-xs sm:text-sm font-black mb-2 uppercase tracking-wider ${
              loginStatus === 'SUCCESS'
                ? (isDarkMode ? 'text-emerald-300' : 'text-emerald-950')
                : isDarkMode ? 'text-slate-100' : 'text-slate-900'
            }`}>
              Kullanıcı Adı
            </label>
            <input
              type="text"
              required
              disabled={isLocked || loginStatus === 'SUCCESS'}
              value={username}
              onFocus={() => setShowUserDropdown(true)}
              onChange={(e) => handleUsernameChange(e.target.value)}
              className={`w-full px-4 py-3.5 sm:py-4 rounded-2xl border-2 text-sm sm:text-base font-black uppercase outline-none bg-transparent transition-colors ${
                isLocked
                  ? 'opacity-50 cursor-not-allowed border-slate-800'
                  : loginStatus === 'SUCCESS'
                  ? (isDarkMode 
                      ? 'border-emerald-400 text-emerald-200' 
                      : 'border-emerald-600 text-emerald-950 font-black')
                  : isDarkMode 
                    ? 'border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-400' 
                    : 'border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-600'
              }`}
              placeholder="KULLANICI ADI"
              autoComplete="off"
            />

            {/* قائمة المستخدمين المنسدلة */}
            {showUserDropdown && filteredUsers.length > 0 && !isLocked && loginStatus !== 'SUCCESS' && (
              <div className={`absolute left-0 right-0 mt-2 max-h-48 overflow-y-auto rounded-2xl border-2 shadow-2xl z-40 ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
              }`}>
                {filteredUsers.map((u: any, idx: number) => (
                  <div
                    key={u.id || `${u.username}-${idx}`}
                    onClick={() => {
                      setUsername(u.username || '');
                      setShowUserDropdown(false);
                      setTimeout(() => {
                        passwordInputRef.current?.focus();
                      }, 50);
                    }}
                    className={`flex justify-between items-center p-3 cursor-pointer transition-colors duration-150 text-xs sm:text-sm font-black border-b last:border-b-0 ${
                      isDarkMode 
                        ? 'hover:bg-cyan-950/60 border-slate-900 text-slate-200 hover:text-cyan-300' 
                        : 'hover:bg-sky-50 border-slate-100 text-slate-800 hover:text-sky-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full font-black flex items-center justify-center text-xs ${
                        isDarkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-sky-100 text-sky-800'
                      }`}>
                        {u.username ? u.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span>{u.username?.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* حقل كلمة السر */}
          <div>
            <label className={`block text-xs sm:text-sm font-black mb-2 uppercase tracking-wider ${
              loginStatus === 'SUCCESS'
                ? (isDarkMode ? 'text-emerald-300' : 'text-emerald-950')
                : isDarkMode ? 'text-slate-100' : 'text-slate-900'
            }`}>
              Şifre
            </label>
            <div className="relative">
              <input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLocked || loginStatus === 'SUCCESS'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3.5 sm:py-4 rounded-2xl border-2 text-sm sm:text-base font-black outline-none bg-transparent transition-colors pr-12 ${
                  isLocked
                    ? 'opacity-50 cursor-not-allowed border-slate-800'
                    : loginStatus === 'SUCCESS'
                    ? (isDarkMode 
                        ? 'border-emerald-400 text-emerald-200' 
                        : 'border-emerald-600 text-emerald-950 font-black')
                    : isDarkMode 
                      ? 'border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-400' 
                      : 'border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-600'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                disabled={isLocked || loginStatus === 'SUCCESS'}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer p-1"
                title={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.02 10.02 0 013.98-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-6.182-1.928a3 3 0 01-4.243-4.243" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* زر تسجيل الدخول */}
          {loginStatus !== 'SUCCESS' && !isLocked && (
            <button
              type="submit"
              className={`w-full py-4 px-4 font-black rounded-2xl text-sm sm:text-base tracking-widest transition-transform duration-150 cursor-pointer mt-3 flex items-center justify-center gap-2 active:scale-95 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400 text-slate-950 font-black'
                  : 'bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 text-white font-black'
              }`}
            >
              <span>GİRİŞ YAP</span>
            </button>
          )}

        </form>
      </div>

      {/* 💎 النص والرمز الجميل في أقصى اليمين بالأسفل (بدون أي مربع أو إطار) */}
      {loginStatus === 'SUCCESS' && (
        <div className="fixed bottom-8 right-8 z-[9999] flex items-center gap-3 animate-slideInRight select-none">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <svg className="w-6 h-6 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className={`text-sm sm:text-base font-black tracking-wider uppercase ${
              isDarkMode ? 'text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'text-emerald-950 font-black'
            }`}>
              {username.toUpperCase()}
            </span>
            <span className={`text-xs font-black tracking-widest uppercase ${
              isDarkMode ? 'text-emerald-400/90' : 'text-emerald-700'
            }`}>
              GİRİŞ BAŞARILI
            </span>
          </div>
        </div>
      )}

    </div>
  );
}