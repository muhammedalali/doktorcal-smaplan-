'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';

export default function Navbar() {
  const pathname = usePathname();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🙈 إخفاء الهيدر وشريط الملاحة كلياً في لوحة التحكم وصفحة دليل الهواتف
  if (pathname === '/dashboard' || pathname === '/phonebook') {
    return null;
  }

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Çalışma Listesi', href: '/schedule', icon: '📅' },
    { name: 'Telefon Rehberi', href: '/phonebook', icon: '📞' },
    { name: 'Arıza / Sorun Bildir', href: '/report', icon: '⚠️' },
  ];

  // إظهار روابط الصلاحيات الإدارية فقط للأدمن
  if (user?.role === 'admin' || user?.role === 'YÖNETİCİ' || user?.username?.toUpperCase() === 'ADMIN') {
    navLinks.push({ name: 'İstatistikler', href: '/admin/stats', icon: '📈' });
    navLinks.push({ name: 'Doktor Yönetimi', href: '/admin/doctors', icon: '👨‍⚕️' });
    navLinks.push({ name: 'Kullanıcılar', href: '/admin/users', icon: '👥' });
  }

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* الشعار واسم النظام */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
                🩺
              </div>
              <div className="flex flex-col">
                <span className="font-black text-base sm:text-lg bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 dark:from-cyan-400 dark:via-teal-300 dark:to-emerald-400 bg-clip-text text-transparent uppercase tracking-wider">
                  DOKTORSYS
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 -mt-1 font-bold tracking-wide">
                  Doktor Çalışma Planı
                </span>
              </div>
            </Link>
          </div>

          {/* روابط التنقل الرئيسية للشاشات الكبيرة */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 shadow-sm border border-cyan-200 dark:border-cyan-800/50'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="text-sm">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>

          {/* زر الثيم ومعلومات المستخدم */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
              title={isDarkMode ? 'Gündüz Modu' : 'Gece Modu'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">
                  {user?.name || user?.username || 'KULLANICI'}
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {user?.role === 'admin' || user?.role === 'YÖNETİCİ' ? 'Sistem Yöneticisi' : (user?.role || 'Kullanıcı')}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="px-3 py-1.5 text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors border border-rose-200 dark:border-rose-900/50 cursor-pointer"
              >
                Çıkış Yap
              </button>
            </div>
          </div>

          {/* زر القائمة للشاشات الصغيرة */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* القائمة المنسدلة للأجهزة المحمولة */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black ${
                isActive(link.href)
                  ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-sm">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          ))}
          
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">
              {user?.name || user?.username || 'KULLANICI'}
            </span>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/50"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </header>
  );
}