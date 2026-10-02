'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

// 🛡️ هيكل الصلاحيات الشامل الموحد
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

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState('');
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const { isDarkMode } = useTheme();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  
  const lockIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🛡️ فحص الجلسة السابقة عند التحميل
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const activeUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : null);

    const isNavigatingBack = window.performance && 
      window.performance.getEntriesByType('navigation')[0]?.type === 'back_forward';

    if (activeUser && activeUser.username && !isNavigatingBack) {
      router.replace('/dashboard');
    }
  }, [router]);

  // 🌐 الكانفاس المائل Background
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

      const strokeColor = isDarkMode ? 'rgba(56, 189, 248, ' : 'rgba(14, 165, 233, ';
      const dotColor = isDarkMode ? 'rgba(125, 211, 252, ' : 'rgba(56, 189, 248, ';

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

          points[rIndex][c + 3] = {
            x: rotatedX + shiftX,
            y: rotatedY + shiftY
          };
        }
      }

      ctx.lineWidth = 0.85;

      for (let r = 0; r < points.length; r++) {
        for (let c = 0; c < points[r].length; c++) {
          const pt = points[r][c];
          const baseAlpha = isDarkMode ? 0.22 : 0.18;

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
            ctx.arc(pt.x, pt.y, isDarkMode ? 1.2 : 1.4, 0, Math.PI * 2);
            ctx.fillStyle = `${dotColor}${baseAlpha * 1.4})`;
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
    const storedLockTime = localStorage.getItem('login_lock_until');
    if (storedLockTime) {
      const lockUntil = parseInt(storedLockTime, 10);
      const now = Date.now();
      if (lockUntil > now) {
        const remaining = Math.ceil((lockUntil - now) / 1000);
        setIsLocked(true);
        setLockTimer(remaining);
        startLockCountdown(remaining);
      } else {
        localStorage.removeItem('login_lock_until');
      }
    }

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

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setShowUserDropdown(true);

    const cleanInput = value.trim().toUpperCase().replace(/İ/g, 'I');
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

  const startLockCountdown = (seconds: number) => {
    if (lockIntervalRef.current) clearInterval(lockIntervalRef.current);
    let current = seconds;

    lockIntervalRef.current = setInterval(() => {
      current -= 1;
      setLockTimer(current);
      if (current <= 0) {
        if (lockIntervalRef.current) clearInterval(lockIntervalRef.current);
        setIsLocked(false);
        setFailedAttempts(0);
        setError('');
        localStorage.removeItem('login_lock_until');
      }
    }, 1000);
  };

  // ⚡ تسجيل الدخول والتوجيه القسري المستقر
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const rawInputUsername = username.trim();
    const cleanInputUsername = rawInputUsername.toUpperCase().replace(/İ/g, 'I');
    const cleanPassword = password.trim();

    let foundUser: any = null;

    // 1️⃣ البحث في Firestore
    foundUser = allUsers.find((u: any) => {
      const uName = (u.username || '').toString().trim().toUpperCase().replace(/İ/g, 'I');
      return uName === cleanInputUsername && u.password === cleanPassword;
    });

    // 2️⃣ مطابقة الأدمن الافتراضي
    if (!foundUser && cleanInputUsername === 'ADMIN' && cleanPassword === 'admin1233') {
      foundUser = { 
        id: 'admin-default',
        username: 'ADMİN', 
        role: 'YÖNETİCİ',
        permissions: DEFAULT_PERMISSIONS
      };
    }

    if (foundUser) {
      setError('');
      setFailedAttempts(0);

      const uNameNormalized = (foundUser.username || '').toString().trim().toUpperCase().replace(/İ/g, 'I');
      const isUserAdmin = foundUser.role === 'YÖNETİCİ' || foundUser.role === 'ADMIN' || uNameNormalized === 'ADMIN';
      
      const userPermissions = isUserAdmin 
        ? DEFAULT_PERMISSIONS 
        : (foundUser.permissions || {});

      const nowIso = new Date().toISOString();

      const sessionUserObj = {
        id: foundUser.id || 'admin-default',
        username: foundUser.username || rawInputUsername,
        role: isUserAdmin ? 'YÖNETİCİ' : (foundUser.role || 'PERSONEL'),
        permissions: userPermissions,
        lastLogin: nowIso
      };

      // 🕒 تحديث وقت الدخول في Firestore
      if (foundUser.id && foundUser.id !== 'admin-default') {
        try {
          await updateDoc(doc(db, 'users', foundUser.id), {
            lastLogin: nowIso
          });
        } catch (err) {
          console.error('Son giriş güncelleme hatası:', err);
        }
      }

      const exactDisplayUsername = foundUser.username ? foundUser.username.toUpperCase() : rawInputUsername.toUpperCase();
      setLoggedInUser(exactDisplayUsername);
      setIsAdminUser(isUserAdmin);
      setShowSuccessToast(true);

      // 💾 حفظ Storage
      sessionStorage.setItem('user', JSON.stringify(sessionUserObj));
      localStorage.setItem('user', JSON.stringify(sessionUserObj));

      // 🍪 حفظ الكوكيز بوضوح وصراحة مع مسار Root `/`
      const cookieValue = encodeURIComponent(JSON.stringify(sessionUserObj));
      document.cookie = `auth_token=valid_token_${Date.now()}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `user_session=${cookieValue}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `user_role=${isUserAdmin ? 'ADMIN' : 'USER'}; path=/; max-age=604800; SameSite=Lax`;

      window.dispatchEvent(new Event('userSessionUpdated'));

      // 🚀 الانتقال القسري عبر نافذة المتصفح لتحديث الكوكيز لدى السيرفر
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 25;
        setLoadingProgress(Math.min(100, progress));
        if (progress >= 100) {
          clearInterval(progressInterval);
          setShowSuccessToast(false);
          // 🛑 استخدام window.location بدلاً من router لمنع الرفض الفوري من الـ Middleware
          window.location.href = '/dashboard';
        }
      }, 120);

    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 3) {
        setIsLocked(true);
        const lockDurationSeconds = 1800;
        const lockUntil = Date.now() + lockDurationSeconds * 1000;
        localStorage.setItem('login_lock_until', lockUntil.toString());
        setLockTimer(lockDurationSeconds);
        startLockCountdown(lockDurationSeconds);
        setError('Çok sayıda hatalı deneme! Hesabınız 30 dakika süreyle kilitlenmiştir.');
      } else {
        setError(`Kullanıcı adı veya şifre hatalı! (Kalan Hak: ${3 - newAttempts})`);
      }
    }
  };

  const formatLockTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
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
    <div className={`h-screen w-screen overflow-hidden fixed inset-0 flex items-center justify-center transition-colors duration-500 font-sans ${
      isDarkMode ? 'bg-[#020617] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>

      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <div className={`absolute inset-0 transition-opacity duration-500 ${
          isDarkMode 
            ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/40 via-[#020617] to-[#020617]' 
            : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-200/50 via-slate-100/80 to-[#f8fafc]'
        }`} />

        <canvas ref={gridCanvasRef} className="absolute inset-0 w-full h-full block z-0" />

        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] max-w-[550px] h-[320px] rounded-full blur-[130px] pointer-events-none transition-all duration-300 ${
          isDarkMode ? 'bg-cyan-500/10' : 'bg-sky-400/25'
        }`} />
      </div>

      {showSuccessToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="flex flex-col items-center text-center gap-6 max-w-sm w-full relative z-10">

            <div className="space-y-2 w-full">
              <div className="flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
                  {isAdminUser ? 'ADMİN GİRİŞİ BAŞARILI' : 'GİRİŞ BAŞARILI'}
                </span>
              </div>

              <h2 className="text-3xl font-black text-white tracking-tight">
                HOŞ GELDİNİZ
              </h2>

              <p className="text-base font-black text-emerald-400 uppercase tracking-wide">
                {loggedInUser}
              </p>
            </div>

            <div className="w-full space-y-2.5 max-w-xs">
              <div className="flex justify-between items-center text-xs font-mono font-black text-slate-300">
                <span>YÖNLENDİRİLİYOR...</span>
                <span className="text-emerald-400 text-sm">{loadingProgress}%</span>
              </div>
              
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-emerald-500/30">
                <div 
                  style={{ width: `${loadingProgress}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 ease-out"
                ></div>
              </div>
            </div>

          </div>
        </div>
      )}

      <div className={`max-w-md w-full border border-transparent rounded-3xl p-7 sm:p-8 shadow-xl transition-all duration-300 z-10 relative select-none ${
        isDarkMode 
          ? 'bg-[#020617]/10 backdrop-blur-[2px] hover:border-cyan-400/40 hover:bg-slate-950/20 hover:shadow-cyan-500/10 hover:shadow-2xl' 
          : 'bg-white/20 backdrop-blur-[2px] hover:border-blue-400/50 hover:bg-white/40 hover:shadow-sky-500/10 hover:shadow-2xl'
      }`}>
        <div className="text-center mb-6 flex flex-col items-center">
          <h2 className={`text-xl sm:text-2xl font-black uppercase tracking-wider transition-colors duration-300 ${
            isDarkMode 
              ? 'text-cyan-300 drop-shadow-[0_2px_10px_rgba(34,211,238,0.3)]' 
              : 'text-blue-950 drop-shadow-sm'
          }`}>
            SİSTEME GİRİŞ YAP
          </h2>
        </div>

        {error && (
          <div className={`mb-6 p-4 rounded-2xl border-2 backdrop-blur-md transition-all duration-300 ${
            isLocked 
              ? 'bg-rose-500/15 border-rose-500/60 text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.3)]' 
              : 'bg-amber-500/15 border-amber-500/50 text-amber-400'
          }`}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-500 shrink-0">
                <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-rose-400">
                  {isLocked ? 'GÜVENLİK KİLİDİ AKTİF' : 'GİRİŞ BAŞARISIZ'}
                </h4>
                <p className="text-sm font-bold leading-tight">
                  {error}
                </p>
                {isLocked && (
                  <div className="mt-2 pt-2 border-t border-rose-500/30 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-300">TEKRAR DENEME SÜRESİ:</span>
                    <span className="text-base font-mono font-black text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded-lg border border-rose-500/40">
                      ⏱️ {formatLockTime(lockTimer)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative" ref={dropdownRef}>
            <label className={`block text-xs sm:text-sm font-black mb-1.5 uppercase tracking-wide ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              Kullanıcı Adı
            </label>
            <input
              type="text"
              required
              disabled={isLocked}
              value={username}
              onFocus={() => setShowUserDropdown(true)}
              onChange={(e) => handleUsernameChange(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 font-black uppercase outline-none transition-all duration-200 ${
                isLocked
                  ? 'opacity-50 cursor-not-allowed bg-slate-900 border-slate-800'
                  : isDarkMode 
                    ? 'bg-slate-950/60 border-slate-800/80 text-slate-100 focus:border-cyan-400 focus:bg-slate-900/90' 
                    : 'bg-white/80 border-slate-300/80 text-slate-900 focus:border-blue-600 focus:bg-white'
              }`}
              placeholder="Kullanıcı Adı"
              autoComplete="off"
            />

            {showUserDropdown && filteredUsers.length > 0 && !isLocked && (
              <div className={`absolute left-0 right-0 mt-2 max-h-48 overflow-y-auto rounded-xl border-2 shadow-xl z-40 ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
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
                    className={`flex justify-between items-center p-3 cursor-pointer transition-colors duration-150 text-sm font-black border-b last:border-b-0 ${
                      isDarkMode 
                        ? 'hover:bg-cyan-950/40 border-slate-800 text-slate-200 hover:text-cyan-300' 
                        : 'hover:bg-blue-50 border-slate-100 text-slate-800 hover:text-blue-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full font-black flex items-center justify-center text-xs ${
                        isDarkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.username ? u.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span>{u.username?.toUpperCase()}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">@{u.username?.toLowerCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className={`block text-xs sm:text-sm font-black mb-1.5 uppercase tracking-wide ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              Şifre
            </label>
            <div className="relative">
              <input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLocked}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 font-black outline-none transition-all duration-200 pr-12 ${
                  isLocked
                    ? 'opacity-50 cursor-not-allowed bg-slate-900 border-slate-800'
                    : isDarkMode 
                      ? 'bg-slate-950/60 border-slate-800/80 text-slate-100 focus:border-cyan-400 focus:bg-slate-900/90' 
                      : 'bg-white/80 border-slate-300/80 text-slate-900 focus:border-blue-600 focus:bg-white'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                disabled={isLocked}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer p-1"
                title={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5 opacity-80 hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 opacity-80 hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.02 10.02 0 013.98-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-6.182-1.928a3 3 0 01-4.243-4.243" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLocked}
            className={`w-full py-3.5 px-4 font-black rounded-xl text-base transition-all duration-200 shadow-lg cursor-pointer mt-2 flex items-center justify-center gap-2 active:scale-[0.98] ${
              isLocked
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                : isDarkMode
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black shadow-cyan-500/20'
                  : 'bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-800 hover:to-sky-700 text-white font-black shadow-blue-500/20'
            }`}
          >
            {isLocked ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>SİSTEM KİLİTLİ ({formatLockTime(lockTimer)})</span>
              </>
            ) : (
              <span>GİRİŞ YAP</span>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}