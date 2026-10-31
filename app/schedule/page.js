'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PublicScheduleTable from './components/PublicScheduleTable';
import AdminScheduleTable from './components/AdminScheduleTable';
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { useTheme } from '@/context/ThemeContext';

export default function SchedulePage() {
  const router = useRouter();
  const { isDarkMode, triggerToast } = useTheme();

  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDoctorId, setDeleteDoctorId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // جلب بيانات المستخدم المسجل إن وجدت
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const activeUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : null);
    
    if (activeUser) {
      setCurrentUser(activeUser);
    }
    setIsLoading(false);

    // اعتراض زر المتصفح للرجوع الذكي
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (e) => {
      e.preventDefault();

      if (activeUser && activeUser.username) {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  // 🗑️ دالة فتح مودال تأكيد الحذف
  const handleDeleteDoctorRequest = (doctorId) => {
    setDeleteDoctorId(doctorId);
  };

  // 🗑️ تنفيذ الحذف الفعلي للأدمن
  const confirmDeleteDoctor = async () => {
    if (!deleteDoctorId) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'doctors', deleteDoctorId));
      triggerToast('Doktor kaydı başarıyla silindi.', 'delete');
    } catch (error) {
      console.error('Silme işleminde hata:', error);
      triggerToast('Silme işlemi sırasında bir hata oluştu.', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteDoctorId(null);
    }
  };

  // ✏️ دالة التعديل الخاصة بالأدمن
  const handleEditDoctor = (doctor) => {
    triggerToast('Doktor düzenleme sayfasına yönlendiriliyorsunuz...', 'info');
    router.push(`/admin/doctors?editId=${doctor.id}`);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#020617] text-slate-100 flex items-center justify-center font-black cursor-default z-50">
        <div className="flex items-center gap-2 text-amber-500">
          <span className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
          <span className="text-xs uppercase">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* 🔒 إذا كان المستخدم مسجلاً (أدمن/موظف)، نعرض جدول الأدمن مع خيارات التعديل والحذف */}
      {currentUser ? (
        <AdminScheduleTable 
          onEditDoctor={handleEditDoctor}
          onDeleteDoctor={handleDeleteDoctorRequest}
        />
      ) : (
        /* 🌐 للزوار العاديين، نعرض الجدول العام النظيف بدون أي أزرار تعديل أو حذف */
        <PublicScheduleTable />
      )}

      {/* 🗑️ مودال التأكيد الفاخر لإجراء الحذف */}
      {deleteDoctorId && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm select-none">
          <div className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl text-center space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center border border-rose-500/20">
              <svg className="w-7 h-7 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>

            <div>
              <h3 className="text-sm font-black text-rose-500 uppercase tracking-wide">Doktor Kaydını Sil</h3>
              <p className="text-xs font-bold text-slate-400 mt-1 leading-relaxed">
                Bu doktor kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2 font-black">
              <button
                type="button"
                onClick={() => setDeleteDoctorId(null)}
                className={`flex-1 py-2.5 rounded-xl text-xs uppercase transition-all ${
                  isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                }`}
              >
                İptal
              </button>
              <button
                type="button"
                onClick={confirmDeleteDoctor}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}