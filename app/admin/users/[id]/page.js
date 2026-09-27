'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const ModernIcons = {
  ArrowLeft: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
  Key: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
};

const DEFAULT_PERMISSIONS = {
  canEditDoctors: false,
  canDeleteDoctors: false,
  canEditSchedule: false,
  canDeleteSchedule: false,
  canChangeStatus: false,
  canManageIssues: false,
  canViewReports: false,
};

export default function UserDetailPage() {
  const themeContext = useTheme();
  const isDarkMode = themeContext?.isDarkMode ?? true;

  const router = useRouter();
  const params = useParams();
  const userId = params?.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');

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

  const handleTogglePermission = async (permKey) => {
    if (!user) return;
    const currentPerms = user.permissions || DEFAULT_PERMISSIONS;
    const newToggleValue = !currentPerms[permKey];

    const updatedPerms = { ...currentPerms, [permKey]: newToggleValue };
    if (permKey === 'canEditDoctors') updatedPerms.canEditSchedule = newToggleValue;
    if (permKey === 'canDeleteDoctors') updatedPerms.canDeleteSchedule = newToggleValue;

    setUser(prev => ({ ...prev, permissions: updatedPerms }));

    try {
      await updateDoc(doc(db, 'users', userId), { permissions: updatedPerms });
      setMsg('İzinler başarıyla güncellendi.');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.trim().length < 3) {
      alert('Geçerli bir şifre girin!');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', userId), { password: newPassword.trim() });
      setMsg('Şifre başarıyla güncellendi.');
      setNewPassword('');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      alert('Hتا oluştu!');
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm('Bu kullanıcıyı kalıcı olarak silmek istediğinizden emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      router.push('/admin/users');
    } catch (e) {
      alert('Silme işleminde hata oluştu!');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold">Yükleniyor...</div>;
  }

  if (!user) return null;

  return (
    <div className={`min-h-screen p-6 max-w-4xl mx-auto space-y-6 font-sans ${
      isDarkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-[#f1f5f9] text-slate-900'
    }`}>
      
      {/* زر العودة والهيدر للرئيسية */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
        <button
          onClick={() => router.push('/admin/users')}
          className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-black uppercase transition-all cursor-pointer ${
            isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
          }`}
        >
          <ModernIcons.ArrowLeft />
          <span>Kullanıcı Listesine Dön</span>
        </button>

        {user.username !== 'ADMIN' && user.username !== 'admin' && (
          <button
            onClick={handleDeleteUser}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black uppercase flex items-center gap-2 shadow-md cursor-pointer"
          >
            <ModernIcons.Trash />
            <span>Kullanıcıyı Sil</span>
          </button>
        )}
      </div>

      {msg && (
        <div className={`p-3 border text-xs font-black rounded-xl ${
          isDarkMode ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-emerald-100 border-emerald-400 text-emerald-900'
        }`}>
          {msg}
        </div>
      )}

      {/* معلومات عامة (Genel Bilgiler) */}
      <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
      }`}>
        <h2 className="text-base font-black text-amber-500 uppercase tracking-wide">
          👤 Kullanıcı Bilgileri: {user.username} {user.surname || ''}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
          <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="opacity-70 block mb-1">Kullanıcı Adı / Rumuz:</span>
            <span className="text-sm font-mono text-emerald-400">@{user.username?.toLowerCase()}</span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="opacity-70 block mb-1">Telefon Numarası:</span>
            <span className="text-sm font-mono">{user.phone || 'Yok'}</span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="opacity-70 block mb-1">Sistem Rolü (Rol):</span>
            <span className="text-sm">{user.role || 'KULLANICI'}</span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="opacity-70 block mb-1">Kayıt Tarihi:</span>
            <span className="text-xs font-mono">{user.createdAt ? new Date(user.createdAt).toLocaleString('tr-TR') : 'Bilinmiyor'}</span>
          </div>
        </div>
      </div>

      {/* قسم إدارة الصلاحيات (İşlemler / İzin Yönetimi) */}
      <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
      }`}>
        <h3 className="text-sm font-black text-amber-500 uppercase tracking-wide">
          ⚙️ Özel Yetki ve İşlem Kontrolleri
        </h3>
        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Bu kullanıcıya ait sistem içi özel yetkileri açıp kapatabilirsiniz:
        </p>

        <div className="space-y-2.5">
          {[
            { key: 'canEditDoctors', label: '✏️ Doktor / Çizelge Düzenleme Yetkisi' },
            { key: 'canDeleteDoctors', label: '🗑️ Doktor / Kayıt Silme Yetkisi' },
            { key: 'canChangeStatus', label: '🔄 Doktor Durumu Değiştirme' },
            { key: 'canManageIssues', label: '🔔 Bildirim Yönetimi' },
            { key: 'canViewReports', label: '📊 Rapor Görüntüleme' },
          ].map((perm) => {
            const isChecked = user.permissions?.[perm.key] || false;
            return (
              <div key={perm.key} className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  {perm.label}
                </span>
                <button
                  type="button"
                  onClick={() => handleTogglePermission(perm.key)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isChecked ? 'bg-emerald-500 text-slate-950 shadow-sm' : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {isChecked ? 'Açık' : 'Kapalı'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* تغيير كلمة المرور (Şifre İşlemleri) */}
      <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
      }`}>
        <h3 className="text-sm font-black text-amber-500 uppercase tracking-wide">
          🔑 Şifre Değiştirme İşlemi
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Yeni şifreyi girin..."
            className={`flex-1 px-4 py-3 rounded-xl border text-xs font-bold outline-none ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
            }`}
          />
          <button
            onClick={handleUpdatePassword}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <ModernIcons.Key />
            <span>Şifreyi Güncelle</span>
          </button>
        </div>
      </div>

    </div>
  );
}