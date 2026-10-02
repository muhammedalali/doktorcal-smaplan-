'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useTheme } from '@/context/ThemeContext';

export default function NotificationsPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [notificationsList, setNotificationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // 🔐 جلب بيانات المستخدم وجلسة العمل
  useEffect(() => {
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const activeUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : null);
    
    if (activeUser) {
      setCurrentUser(activeUser);
    }
  }, []);

  // 🔔 المزامنة اللحظية لجلب كل البلاغات والإشعارات الحقيقية من Firestore
  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReports = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let formattedDate = 'Aزينة';
        
        if (data.createdAt) {
          const dateObj = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          formattedDate = dateObj.toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }

        return {
          id: docSnap.id,
          ...data,
          formattedDate
        };
      });

      setNotificationsList(fetchedReports);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Notifications Fetch Error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🖱️ عند النقر على إشعار محدد: تمكينه كـ مقروء والتوجيه لصفحة البلاغ
  const handleNotificationClick = async (item) => {
    try {
      const reportRef = doc(db, 'reports', item.id);
      await updateDoc(reportRef, {
        isRead: true
      });
    } catch (error) {
      console.error("Error updating notification status:", error);
    }

    const uName = currentUser?.username ? currentUser.username.toLocaleUpperCase('tr-TR') : '';
    const isGlobalAdmin = uName === 'ADMIN' || currentUser?.role === 'YÖNETİCİ' || currentUser?.role === 'ADMIN';
    const canManageReports = isGlobalAdmin || (currentUser?.permissions && currentUser.permissions.includes('sorun bildirme yönetimi'));

    const targetPath = canManageReports ? `/admin/reports?id=${item.id}` : `/report?id=${item.id}`;
    router.push(targetPath);
  };

  return (
    <div className={`min-h-screen font-sans p-4 sm:p-6 transition-colors duration-200 select-none ${
      isDarkMode ? 'bg-[#030712] text-white' : 'bg-slate-100 text-slate-800'
    }`}>
      <div className="max-w-3xl mx-auto space-y-5">
        
        {/* زر العودة للوحة التحكم */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-2 active:scale-95 ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-emerald-400' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            <span>←</span>
            <span>Panele Dön</span>
          </button>

          <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">
            BİLDİRİM MERKEZİ
          </span>
        </div>

        {/* بطاقة الإشعارات الرئيسية */}
        <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/40">
            <h1 className="text-base sm:text-lg font-black text-emerald-500 uppercase tracking-wider flex items-center gap-2">
              <span>🔔</span>
              <span>GELEN BİLDİRİMLER VE ARIZALAR</span>
            </h1>
            <span className="text-xs font-mono font-black opacity-60">
              TOPLAM: {notificationsList.length}
            </span>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-xs font-black text-slate-400 animate-pulse">
              BİLDİRİMLER YÜKLENİYOR...
            </div>
          ) : notificationsList.length > 0 ? (
            <div className="space-y-3">
              {notificationsList.map((item) => {
                const isUnread = !item.isRead;

                return (
                  <div 
                    key={item.id} 
                    onClick={() => handleNotificationClick(item)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] ${
                      isUnread
                        ? isDarkMode
                          ? 'bg-slate-950 border-emerald-500/50 text-slate-100 shadow-md'
                          : 'bg-emerald-50/60 border-emerald-300 text-slate-900 shadow-sm'
                        : isDarkMode
                          ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {isUnread && (
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                        )}
                        <span className="font-black text-xs text-amber-500 uppercase">
                          👤 {item.senderName || item.createdBy || 'Bilinmeyen Kullanıcı'}
                        </span>
                      </div>
                      
                      <span className="text-[10px] font-mono opacity-70">
                        🕒 {item.formattedDate}
                      </span>
                    </div>

                    <p className="text-xs font-bold leading-relaxed mb-3">
                      {item.title || item.message || item.description || 'Yeni bir sorun/arıza bildirimi gönderildi.'}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/20">
                      <span className="text-[9px] bg-rose-500/15 text-rose-500 border border-rose-500/30 px-2 py-0.5 rounded-md font-mono font-black uppercase">
                        {item.category || item.type || 'ARIZA BİLDİRİMİ'}
                      </span>

                      <span className="text-[11px] font-black text-emerald-500 flex items-center gap-1">
                        Detayları İncele ➔
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 font-black text-xs space-y-2">
              <div className="text-3xl">📭</div>
              <p>Sistemde henüz kayıtlı bir bildirim bulunmuyor.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}