'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PublicScheduleTable from './components/PublicScheduleTable';
import AdminScheduleTable from './components/AdminScheduleTable';
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

export default function SchedulePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // 🗑️ دالة الحذف الخاصة بالأدمن
  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm('Bu doktor kaydını silmek istediğinize emin misiniz?')) {
      try {
        await deleteDoc(doc(db, 'doctors', doctorId));
        alert('Doktor kaydı başarıyla silindi.');
      } catch (error) {
        console.error('Silme işleminde hata:', error);
        alert('Silme işlemi sırasında bir hata oluştu.');
      }
    }
  };

  // ✏️ دالة التعديل الخاصة بالأدمن
  const handleEditDoctor = (doctor) => {
    router.push(`/admin/doctors?editId=${doctor.id}`);
  };

  if (isLoading) {
    return null; // أو يمكنك وضع مؤشر تحضير بسيط
  }

  // 🔒 إذا كان المستخدم مسجلاً (أدمن/موظف)، نعرض جدول الأدمن مع خيارات التعديل والحذف
  if (currentUser) {
    return (
      <AdminScheduleTable 
        onEditDoctor={handleEditDoctor}
        onDeleteDoctor={handleDeleteDoctor}
      />
    );
  }

  // 🌐 للزوار العاديين، نعرض الجدول العام النظيف بدون أي أزرار تعديل أو حذف
  return <PublicScheduleTable />;
}