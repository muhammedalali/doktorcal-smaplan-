'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PublicScheduleTable from './components/PublicScheduleTable';
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

export default function SchedulePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // جلب بيانات المستخدم المسجل
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const activeUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : null);
    
    if (activeUser) {
      setCurrentUser(activeUser);
    }

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

  // 🛡️ دالة الحذف الآمنة مع التحقق الخلفي من الصلاحية
  const handleDeleteDoctor = async (doctorId) => {
    const uName = currentUser?.username ? currentUser.username.toLocaleUpperCase('tr-TR') : '';
    const isGlobalAdmin = uName === 'ADMIN' || currentUser?.role === 'YÖNETİCİ' || currentUser?.role === 'ADMIN';
    const canDelete = isGlobalAdmin || currentUser?.permissions?.canDeleteDoctors || currentUser?.permissions?.canDeleteSchedule;

    if (!canDelete) {
      alert('Bu işlemi yapmak için yetkiniz bulunmamaktadır!');
      return;
    }

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

  // ✏️ دالة التعديل والتوجيه للوحة التعديل
  const handleEditDoctor = (doctor) => {
    const uName = currentUser?.username ? currentUser.username.toLocaleUpperCase('tr-TR') : '';
    const isGlobalAdmin = uName === 'ADMIN' || currentUser?.role === 'YÖNETİCİ' || currentUser?.role === 'ADMIN';
    const canEdit = isGlobalAdmin || currentUser?.permissions?.canEditDoctors || currentUser?.permissions?.canEditSchedule;

    if (!canEdit) {
      alert('Bu işlemi yapmak için yetkiniz bulunmamaktadır!');
      return;
    }

    // التوجيه إلى صفحة إدارة الطبيب للتعديل
    router.push(`/admin/doctors?editId=${doctor.id}`);
  };

  return (
    <PublicScheduleTable 
      onEditDoctor={handleEditDoctor}
      onDeleteDoctor={handleDeleteDoctor}
    />
  );
}