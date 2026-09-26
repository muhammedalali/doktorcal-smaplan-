'use client';

import './globals.css';
import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { DataProvider } from '@/context/DataContext';
import { useRouter, usePathname } from 'next/navigation';

interface TabItem {
  id: string;
  title: string;
  path: string;
}

// 📌 شريط التبويبات السفلي المخصص للصفحات الرئيسية فقط (دون النوافذ المنبثقة)
function GlobalBottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode } = useTheme();

  // قائمة التبويبات المفتوحة تلقائياً
  const [openTabs, setOpenTabs] = useState<TabItem[]>([
    { id: 'home', title: 'anasayfa', path: '/dashboard' }
  ]);

  // تحديث قائمة التبويبات واستثناء النوافذ المنبثقة/الصفحات الفرعية
  useEffect(() => {
    if (pathname === '/' || pathname === '/login') return;

    let tabTitle = '';

    // 🎯 تحديد الصفحات المسموح لها فقط بإنشاء تبويب سفلي:
    if (pathname === '/dashboard') {
      tabTitle = 'anasayfa';
    } else if (pathname === '/admin/doctors') {
      tabTitle = 'Bölüm ve Doktor yönetimi';
    } else if (pathname === '/admin/users') {
      tabTitle = 'Kullanıcı Yönetimi';
    } else if (pathname === '/schedule') {
      tabTitle = 'Doktor Çalışma Planları';
    } else if (pathname === '/phonebook') {
      tabTitle = 'Telefon Rehberi';
    } else {
      // ❌ استثناء النوافذ المنبثقة مثل /report و /notifications و /profile
      return;
    }

    setOpenTabs((prevTabs) => {
      const exists = prevTabs.some((tab) => tab.path === pathname);
      if (!exists && tabTitle) {
        return [...prevTabs, { id: pathname, title: tabTitle, path: pathname }];
      }
      return prevTabs;
    });
  }, [pathname]);

  if (pathname === '/' || pathname === '/login') return null;

  // دالة إغلاق تبويب معين
  const handleCloseTab = (e: React.MouseEvent, tabPath: string) => {
    e.stopPropagation();

    const filteredTabs = openTabs.filter((tab) => tab.path !== tabPath);
    setOpenTabs(filteredTabs);

    if (pathname === tabPath) {
      const nextTab = filteredTabs[filteredTabs.length - 1] || { path: '/dashboard' };
      router.push(nextTab.path, { scroll: false });
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 h-10 border-t flex items-center px-2 gap-1.5 z-[9999] select-none cursor-default shadow-lg ${
      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-300 border-slate-400'
    }`}>
      {openTabs.map((tab) => {
        const isActive = pathname === tab.path;

        return (
          <div
            key={tab.id}
            onClick={() => router.push(tab.path, { scroll: false })}
            className={`h-8 px-4 rounded-t-lg border-t border-x flex items-center gap-2 cursor-default transition-none antialiased shadow-sm ${
              isActive 
                ? (isDarkMode 
                    ? 'bg-sky-600 border-sky-400 text-white font-black text-xs border-t-2 shadow-md' 
                    : 'bg-sky-600 border-sky-800 text-white font-black text-xs border-t-2 shadow-md'
                  )
                : (isDarkMode 
                    ? 'bg-slate-900 border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800 font-bold text-xs' 
                    : 'bg-slate-200 border-slate-300 text-slate-800 hover:bg-slate-100 hover:text-black font-bold text-xs')
            }`}
          >
            <span className="tracking-wide uppercase font-extrabold text-[12px]">{tab.title}</span>

            {tab.path !== '/dashboard' && (
              <button
                type="button"
                onClick={(e) => handleCloseTab(e, tab.path)}
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold cursor-default ml-1 transition-colors ${
                  isActive
                    ? 'text-white hover:bg-rose-600'
                    : (isDarkMode ? 'text-slate-300 hover:bg-rose-600 hover:text-white' : 'text-slate-700 hover:bg-rose-600 hover:text-white')
                }`}
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
  // 🎯 ضبط عنوان التبويب في المتصفح إلى Poliklinik Çalışma Planı
  useEffect(() => {
    document.title = "Poliklinik Çalışma Planı";
  }, []);

  return (
    <html lang="tr">
      <body className="cursor-default pb-10">
        <ThemeProvider>
          <DataProvider>
            {children}
            <GlobalBottomTabBar />
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}