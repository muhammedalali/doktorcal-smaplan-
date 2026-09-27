'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const ModernIcons = {
  ArrowLeft: () => (
    <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
  Key: () => (
    <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  ShieldCheck: () => (
    <svg className="w-5 h-5 text-amber-500 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
};

const DEFAULT_PERMISSIONS = {
  canEditDoctors: false,
  canDeleteDoctors: false,
  canEditSchedule: false,
  canDeleteSchedule: false,
  canChangeStatus: false,
  canManageIssues: false
};

export default function UserDetailPage() {
  const themeContext = useTheme();
  const isDarkMode = themeContext?.isDarkMode ?? true;

  const router = useRouter();
  const params = useParams();
  const userId = params?.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // حقول كلمة المرور والتأكيد
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!userId) return;
    const fetchUserData = async () => {
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser({ id: docSnap.id, ...docSnap.data() });
        } else {
          router.push('/admin/users');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId, router]);

  // 🔄 تبديل الصلاحية وتحديثها
  const handleTogglePermission = async (permKey) => {
    if (!user) return;
    const currentPerms = user.permissions || DEFAULT_PERMISSIONS;
    const newToggleValue = !currentPerms[permKey];

    const updatedPerms = { ...currentPerms, [permKey]: newToggleValue };

    // 🔗 ربط صلاحية "Bölüm ve Doktor Yönetimi" مع الصلاحيات الفعية لتفعيل زر "Yetkili İşlemler" في الـ Dashboard
    if (permKey === 'canEditDoctors') {
      updatedPerms.canEditSchedule = newToggleValue;
    }
    if (permKey === 'canDeleteDoctors') {
      updatedPerms.canDeleteSchedule = newToggleValue;
    }

    setUser(prev => ({ ...prev, permissions: updatedPerms }));

    try {
      await updateDoc(doc(db, 'users', userId), { permissions: updatedPerms });
      setMsg('İzin Yetkisi Başarıyla Güncellendi 🟢');
      setTimeout(() => setMsg(''), 2500);
    } catch (e) {
      console.error(e);
      alert('İzin güncellenirken hata oluştu.');
    }
  };

  // 🔑 تحديث كلمة المرور مع التأكيد
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newPassword || newPassword.trim().length < 3) {
      setErrorMsg('Lütfen en az 3 karakterden oluşan geçerli bir şifre giriniz!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Girilen şifreler birbiriyle eşleşmiyor! Lütfen kontrol ediniz.');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', userId), { password: newPassword.trim() });
      setMsg('Şifre Başarıyla Güncellendi 🔑');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMsg(''), 2500);
    } catch (e) {
      setErrorMsg('Şifre güncellenirken bir hata oluştu!');
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm('Bu kullanıcıyı sistemden tamamen silmek istediğinizden emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      router.push('/admin/users');
    } catch (e) {
      alert('Silme işleminde hata oluştu!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-black text-amber-500">
        Yükleniyor...
      </div>
    );
  }

  if (!user) return null;

  const isMasterAdmin = user.username?.toUpperCase() === 'ADMIN';

  return (
    <div className={`min-h-screen w-full px-4 sm:px-8 py-6 space-y-6 font-sans ${
      isDarkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-[#f1f5f9] text-slate-900'
    }`}>
      
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-700/50">
        <button
          onClick={() => router.push('/admin/users')}
          className={`px-5 py-2.5 rounded-2xl border flex items-center gap-2 text-xs sm:text-sm font-black uppercase transition-all cursor-pointer ${
            isDarkMode 
              ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800' 
              : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
          }`}
        >
          <ModernIcons.ArrowLeft />
          <span>Kullanıcı Listesine Dön</span>
        </button>

        {!isMasterAdmin && (
          <button
            onClick={handleDeleteUser}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs sm:text-sm font-black uppercase flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
          >
            <ModernIcons.Trash />
            <span>Kullanıcıyı Sil</span>
          </button>
        )}
      </div>

      {msg && (
        <div className={`w-full p-4 border text-xs sm:text-sm font-black rounded-2xl text-center shadow-lg transition-all ${
          isDarkMode ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-emerald-100 border-emerald-400 text-emerald-900'
        }`}>
          {msg}
        </div>
      )}

      {errorMsg && (
        <div className={`w-full p-4 border text-xs sm:text-sm font-black rounded-2xl text-center shadow-lg transition-all ${
          isDarkMode ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' : 'bg-rose-100 border-rose-400 text-rose-900'
        }`}>
          {errorMsg}
        </div>
      )}

      {/* 👤 معلومات المستخدم كاملة العرض */}
      <div className={`w-full p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
      }`}>
        <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
          <h2 className="text-base sm:text-lg font-black text-amber-500 uppercase tracking-wide flex items-center gap-2">
            <span>👤</span> Kullanıcı Profil Detayları
          </h2>
          <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            ID: {user.id}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm font-bold">
          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-slate-400 block mb-1">Kullanıcı Adı / Rumuz:</span>
            <span className="text-sm sm:text-base font-mono font-black text-emerald-400">@{user.username?.toLowerCase()}</span>
          </div>

          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-slate-400 block mb-1">Telefon Numarası:</span>
            <span className="text-sm sm:text-base font-mono font-black">{user.phone || 'Girilmedi'}</span>
          </div>

          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-slate-400 block mb-1">Kayıt Tarihi:</span>
            <span className="text-xs sm:text-sm font-mono font-black">{user.createdAt ? new Date(user.createdAt).toLocaleString('tr-TR') : 'Bilinmiyor'}</span>
          </div>
        </div>
      </div>

      {/* ⚙️ قسم التحكم بالصلاحيات - بعرض الشاشة الكامل */}
      <div className={`w-full p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
      }`}>
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/50">
          <ModernIcons.ShieldCheck />
          <h3 className="text-base sm:text-lg font-black text-amber-500 uppercase tracking-wide">
            Özel Yetki ve İşlem Kontrolleri
          </h3>
        </div>

        <p className={`text-xs sm:text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Bu kullanıcının sistem içindeki yetkilerini anlık olarak yönetebilirsiniz. "Bölüm ve Doktor Yönetimi" açıldığında kullanıcı ana sayfada (Dashboard) <strong>Yetkili İşlemler</strong> butonunu görebilecektir.
        </p>

        <div className="space-y-3.5 pt-2">
          {[
            { 
              key: 'canEditDoctors', 
              label: '✏️ Bölüm ve Doktor Yönetimi Yetkisi', 
              desc: 'Ana sayfada "Yetkili İşlemler" butonunu açar, bölüm ve doktor ekleme/düzenleme imkanı sağlar' 
            },
            { 
              key: 'canDeleteDoctors', 
              label: '🗑️ Doktor ve Kayıt Silme Yetkisi', 
              desc: 'Sistemden doktor kaydı silebilme yetkisini tanımlar' 
            },
            { 
              key: 'canChangeStatus', 
              label: '🔄 Çalışma Durumu Değiştirme', 
              desc: 'Poliklinik/Nöbet/İzin durumlarını hızlıca değiştirebilme' 
            },
            { 
              key: 'canManageIssues', 
              label: '🔔 Sorun Bildirim Yönetimi', 
              desc: 'Kullanıcılardan gelen sorun bildirimlerini inceleyebilme' 
            },
          ].map((perm) => {
            const isChecked = Boolean(user.permissions?.[perm.key]);

            return (
              <div 
                key={perm.key} 
                onClick={() => !isMasterAdmin && handleTogglePermission(perm.key)}
                className={`w-full p-4 sm:p-5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 hover:border-slate-700' 
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="pr-4">
                  <span className={`text-xs sm:text-sm font-black block ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    {perm.label}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-400 font-bold block mt-1">
                    {perm.desc}
                  </span>
                </div>

                {/* Switch Toggle Button */}
                <div className={`relative w-14 h-7 rounded-full transition-colors duration-200 shrink-0 ${
                  isChecked || isMasterAdmin ? 'bg-emerald-500' : 'bg-slate-700'
                }`}>
                  <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform duration-200 shadow-md ${
                    isChecked || isMasterAdmin ? 'transform translate-x-7' : ''
                  }`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🔑 تغيير كلمة المرور وتأكيدها - بعرض كامل */}
      <div className={`w-full p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
      }`}>
        <h3 className="text-base sm:text-lg font-black text-amber-500 uppercase tracking-wide flex items-center gap-2 pb-2 border-b border-slate-800/50">
          <span>🔑</span> Şifre Değiştirme ve Onay İşlemi
        </h3>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-1.5">YENİ ŞİFRE</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Yeni şifreyi giriniz..."
                className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm font-black outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500' 
                    : 'bg-slate-100 border-slate-300 text-slate-900 focus:border-amber-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-1.5">YENİ ŞİFRE TEKRARI</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Yeni şifreyi tekrar giriniz..."
                className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm font-black outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500' 
                    : 'bg-slate-100 border-slate-300 text-slate-900 focus:border-amber-500'
                }`}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <ModernIcons.Key />
              <span>Şifreyi Onayla ve Güncelle</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}