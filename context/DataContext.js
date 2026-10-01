'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  // 1. تحميل وتحديث بيانات المستخدم الحالي فوراً وبطريقة متزامنة
  const updateCurrentUser = useCallback(() => {
    try {
      const sessionUser = sessionStorage.getItem('user');
      const localUser = localStorage.getItem('user');
      if (sessionUser) {
        setCurrentUser(JSON.parse(sessionUser));
      } else if (localUser) {
        setCurrentUser(JSON.parse(localUser));
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Kullanıcı oturum verisi okunurken hata:', err);
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    updateCurrentUser();
    
    // الاستماع لتغييرات الـ LocalStorage والـ Event المخصص لتسجيل الدخول الفوري
    window.addEventListener('storage', updateCurrentUser);
    window.addEventListener('userSessionUpdated', updateCurrentUser);
    
    return () => {
      window.removeEventListener('storage', updateCurrentUser);
      window.removeEventListener('userSessionUpdated', updateCurrentUser);
    };
  }, [updateCurrentUser]);

  // 2. الاشتراك اللحظي في Firestore لبيانات المستخدم الحالي لمنح وتجريد الصلاحيات فوراً
  useEffect(() => {
    if (!currentUser?.id) return;

    const unsubscribeLiveUser = onSnapshot(
      doc(db, 'users', currentUser.id),
      (docSnap) => {
        if (docSnap.exists()) {
          const freshUserData = { id: docSnap.id, ...docSnap.data() };
          
          // تحديث الجلسة المحلية إذا اختلفت الصلاحيات أو البيانات
          if (JSON.stringify(freshUserData.permissions) !== JSON.stringify(currentUser.permissions) ||
              freshUserData.role !== currentUser.role) {
            setCurrentUser(freshUserData);
            if (sessionStorage.getItem('user')) {
              sessionStorage.setItem('user', JSON.stringify(freshUserData));
            }
            if (localStorage.getItem('user')) {
              localStorage.setItem('user', JSON.stringify(freshUserData));
            }
          }
        }
      },
      (err) => console.error('Kullanıcı verisi güncellenirken hata:', err)
    );

    return () => unsubscribeLiveUser();
  }, [currentUser?.id, currentUser?.permissions, currentUser?.role]);

  // 3. الاشتراك اللحظي للأطباء والمستخدمين
  useEffect(() => {
    // الأطباء
    const unsubscribeDoctors = onSnapshot(
      collection(db, 'doctors'),
      (snapshot) => {
        const docsData = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setDoctors(docsData);
        setDoctorsLoading(false);
      },
      (err) => {
        console.error('Doktor Verileri Alınırken Hata Oluştu:', err);
        setDoctorsLoading(false);
      }
    );

    // المستخدمين
    const unsubscribeUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const usersData = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setUsers(usersData);
      },
      (err) => {
        console.error('Kullanıcı Verileri Alınırken Hata Oluştu:', err);
      }
    );

    return () => {
      unsubscribeDoctors();
      unsubscribeUsers();
    };
  }, []);

  // 🛡️ دالة فحص الصلاحيات الموحدة الدقيقة
  const checkPermission = useCallback((permKey) => {
    if (!currentUser) return false;

    const roleUpper = currentUser.role?.toUpperCase() || '';
    const usernameUpper = currentUser.username?.toUpperCase() || '';

    // المسؤول الرئيسي يملك كل الصلاحيات دائماً
    if (roleUpper === 'ADMIN' || roleUpper === 'YÖNETİCİ' || usernameUpper === 'ADMIN') {
      return true;
    }

    const perms = currentUser.permissions;
    if (!perms) return false;

    // 1. إذا كانت الصلاحيات محفوظة كـ Object
    if (typeof perms === 'object' && !Array.isArray(perms)) {
      return Boolean(perms[permKey]);
    }

    // 2. إذا كانت الصلاحيات محفوظة كمصفوفة Array
    if (Array.isArray(perms)) {
      return perms.includes(permKey);
    }

    return false;
  }, [currentUser]);

  // 🔑 التجميع الموحد لحالة التحميل: لا ينتهي التحميل إلا بعد تجهيز المستخدم والأطباء معا
  const isGlobalLoading = authLoading || doctorsLoading;

  return (
    <DataContext.Provider
      value={{
        doctors,
        setDoctors,
        users,
        setUsers,
        currentUser,
        setCurrentUser,
        loading: isGlobalLoading,
        checkPermission,
        updateCurrentUser
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);