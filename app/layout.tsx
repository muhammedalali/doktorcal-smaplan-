'use client';

import './globals.css';
import { useEffect, useRef, useState } from 'react';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { DataProvider } from '@/context/DataContext';
import { useRouter, usePathname } from 'next/navigation';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

interface TabItem {
  id: string;
  title: string;
  path: string;
}

// ⏱️ مكون مراقبة الخمول وتسجيل الخروج التلقائي
function AutoLogoutHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const INACTIVITY_TIME = 15 * 60 * 1000; // 15 دقيقة

  useEffect(() => {
    if (
      pathname === '/' || 
      pathname === '/login' || 
      pathname === '/schedule' || 
      pathname === '/public-schedule' ||
      pathname === '/phonebook'
    ) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const performLogout = () => {
      sessionStorage.removeItem('user');
      localStorage.removeItem('user');
      router.push('/');
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(performLogout, INACTIVITY_TIME);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [pathname, router]);

  return null;
}

// 🌟 شريط التبويبات التفاعلي السفلي (Bottom Multi-Tab Bar)
function BottomMultiTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode } = useTheme();

  // قائمة الصفحات المفتوحة - البداية بالصفحة الرئيسية
  const [openTabs, setOpenTabs] = useState<TabItem[]>([
    { id: '/dashboard', title: 'ANASAYFA', path: '/dashboard' }
  ]);

  // حفظ الصفحات المفتوحة تلقائياً (مع استثناء دليل الهواتف /phonebook)
  useEffect(() => {
    if (
      pathname === '/' || 
      pathname === '/login' || 
      pathname === '/schedule' || 
      pathname === '/public-schedule' ||
      pathname === '/phonebook' // 🚫 منع إضافة صفحة دليل الهواتف للتبويبات
    ) return;

    let tabTitle = '';
    if (pathname === '/dashboard') tabTitle = 'ANASAYFA';
    else if (pathname === '/admin/stats') tabTitle = 'Sistem İstatistikleri';
    else if (pathname === '/admin/doctors') tabTitle = 'Bölüm ve Doktor Yönetimi';
    else if (pathname === '/admin/users') tabTitle = 'Kullanıcı Yönetimi';
    else if (pathname === '/admin/reports') tabTitle = 'Arıza Bildirimleri';
    else if (pathname === '/report' || pathname === '/reports') tabTitle = 'Arıza Bildir';
    else if (pathname === '/profile') tabTitle = 'Profil Bilgileri';
    else return;

    setOpenTabs((prev) => {
      const exists = prev.some((tab) => tab.path === pathname);
      if (!exists && tabTitle) {
        return [...prev, { id: pathname, title: tabTitle, path: pathname }];
      }
      return prev;
    });
  }, [pathname]);

  // 🙈 إخفاء شريط التبويبات السفلي تماماً في صفحة دليل الهواتف والصفحات العامة
  if (
    pathname === '/' || 
    pathname === '/login' || 
    pathname === '/schedule' || 
    pathname === '/public-schedule' ||
    pathname === '/phonebook' // 🚫 عدم عرض الشريط السفلي عند التواجد في /phonebook
  ) {
    return null;
  }

  // إغلاق التبويب وإدارته
  const handleCloseTab = (e: React.MouseEvent, tabPath: string) => {
    e.stopPropagation();

    const filtered = openTabs.filter((tab) => tab.path !== tabPath);
    setOpenTabs(filtered);

    // الانتقال للتبويب الأخير إذا كانت الصفحة المغلقة هي الحالية
    if (pathname === tabPath) {
      const lastTab = filtered[filtered.length - 1] || { path: '/dashboard' };
      router.push(lastTab.path);
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 h-10 sm:h-11 border-t px-2 sm:px-4 flex items-end justify-start gap-1.5 overflow-x-auto scrollbar-none z-50 select-none cursor-default ${
      isDarkMode 
        ? 'bg-slate-950 border-slate-800' 
        : 'bg-slate-100 border-slate-300'
    }`}>
      {openTabs.map((tab) => {
        const isActive = pathname === tab.path;

        return (
          <div
            key={tab.id}
            onClick={() => router.push(tab.path)}
            className={`flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-t-lg border-t border-x text-xs font-black uppercase tracking-wider transition-all duration-150 shrink-0 cursor-default ${
              isActive
                ? (isDarkMode 
                    ? 'bg-blue-600 border-blue-500 text-white font-black' 
                    : 'bg-blue-600 border-blue-700 text-white font-black')
                : (isDarkMode 
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200' 
                    : 'bg-slate-200/90 border-slate-300 text-slate-700 hover:bg-white hover:text-slate-900')
            }`}
          >
            {/* اسم التبويب بخط واضح ومميز */}
            <span className="truncate max-w-[150px] sm:max-w-[220px] text-[11px] sm:text-xs font-black">
              {tab.title}
            </span>

            {/* زر الإغلاق ✕ */}
            {isActive && tab.path !== '/dashboard' && (
              <button
                type="button"
                onClick={(e) => handleCloseTab(e, tab.path)}
                className="ml-1 w-4 h-4 rounded flex items-center justify-center text-[10px] font-black hover:bg-rose-600 hover:text-white transition-colors cursor-default bg-black/20 text-white shrink-0"
                title="Kapat"
              >
                ✕
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.title = "Poliklinik Çalışma Planı";
  }, []);

  return (
    <html lang="tr" className={cn("font-sans", geist.variable)}>
      <body className="cursor-default min-h-screen overflow-x-hidden antialiased pb-11">
        <ThemeProvider>
          <DataProvider>
            <AutoLogoutHandler />
            {children}
            <BottomMultiTabBar />
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}