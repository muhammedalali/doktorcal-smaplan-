'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const SPECIFIC_PERMISSIONS = [
  { key: 'bölüm ve doktor yönetimi', label: 'Bölüm ve Doktor Yönetimi (Ekleme/Erişim)' },
  { key: 'bölüm ve doktor düzeltme yetkisi', label: 'Bölüm ve Doktor Düzeltme Yetkisi' },
  { key: 'bölüm ve doktor silme yetkisi', label: 'Bölüm ve Doktor Silme Yetkisi' },
  { key: 'çalışma durumu değiştirme', label: 'Çalışma Durumu Değiştirme (Takvim)' },
  { key: 'kullanıcı ekleme ve yetkilendirme', label: 'Kullanıcı Ekleme ve Yetkilendirme' },
  { key: 'kullanıcı düzenleme yetkisi', label: 'Kullanıcı Düzenleme Yetkisi' },
  { key: 'kullanıcı silme yetkisi', label: 'Kullanıcı Silme Yetkisi' },
  { key: 'sorun bildirme yönetimi', label: 'Arıza / Sorun Bildirimleri Yönetimi' }
];

export default function EditUserPage({ params }) {
  const unwrappedParams = use(params);
  const userId = unwrappedParams?.id;

  const { isDarkMode } = useTheme();
  const { checkPermission, users = [], setUsers } = useData();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PERSONEL');
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const canManageUsers = checkPermission ? checkPermission('kullanıcı ekleme ve yetkilendirme') : true;
  const canEditUser = checkPermission ? checkPermission('kullanıcı düzenleme yetkisi') : true;
  const canAccessPage = canManageUsers || canEditUser;

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    if (!mounted) return;

    if (!canAccessPage) {
      router.push('/dashboard');
      return;
    }

    if (!userId) {
      alert('Kullanıcı ID tanımlı değil!');
      router.push('/admin/users');
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setSurname(data.surname || '');
          setUsername(data.username || '');
          setPassword(data.password || '');
          setRole(data.role || 'PERSONEL');
          setPermissions(data.permissions || {});
        } else {
          const localUser = users.find(u => u.id === userId);
          if (localUser) {
            setName(localUser.name || '');
            setSurname(localUser.surname || '');
            setUsername(localUser.username || '');
            setPassword(localUser.password || '');
            setRole(localUser.role || 'PERSONEL');
            setPermissions(localUser.permissions || {});
          } else {
            alert('Kullanıcı bulunamadı!');
            router.push('/admin/users');
          }
        }
      } catch (e) {
        console.error('Kullanıcı verisi çekme hatası:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, canAccessPage, router, mounted, users]);

  const handlePermissionChange = (key, value) => {
    if (!canEditUser) {
      alert('Kullanıcı düzenleme yetkiniz bulunmamaktadır!');
      return;
    }
    setPermissions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSelectAllPermissions = () => {
    if (!canEditUser) return;
    const allPerms = {};
    SPECIFIC_PERMISSIONS.forEach(p => {
      allPerms[p.key] = true;
    });
    setPermissions(allPerms);
  };

  const handleClearAllPermissions = () => {
    if (!canEditUser) return;
    setPermissions({});
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!canEditUser) {
      alert('Kullanıcı düzenleme yetkiniz bulunmamaktadır!');
      return;
    }

    if (!username.trim()) {
      alert('Lütfen kullanıcı adını giriniz.');
      return;
    }

    setIsSaving(true);
    try {
      const formattedRole = role.toLocaleUpperCase('tr-TR');
      
      const finalPermissions = formattedRole === 'ADMIN' || formattedRole === 'YÖNETİCİ'
        ? SPECIFIC_PERMISSIONS.reduce((acc, p) => ({ ...acc, [p.key]: true }), {})
        : permissions;

      const updatedData = {
        name: name.trim(),
        surname: surname.trim().toLocaleUpperCase('tr-TR'),
        fullName: `${name.trim()} ${surname.trim().toLocaleUpperCase('tr-TR')}`,
        username: username.trim().toLocaleUpperCase('tr-TR'),
        password: password.trim(),
        role: formattedRole,
        permissions: finalPermissions,
        updatedAt: Date.now()
      };

      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, updatedData);

      if (setUsers) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedData, id: userId } : u));
      }

      const currentStoredUser = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
      if (currentStoredUser && currentStoredUser.id === userId) {
        const updatedLocalUser = { ...currentStoredUser, ...updatedData };
        if (sessionStorage.getItem('user')) {
          sessionStorage.setItem('user', JSON.stringify(updatedLocalUser));
        }
        if (localStorage.getItem('user')) {
          localStorage.setItem('user', JSON.stringify(updatedLocalUser));
        }
      }

      triggerToast('Kullanıcı bilgileri ve yetkileri başarıyla güncellendi!');
      setTimeout(() => {
        router.push('/admin/users');
      }, 800);
    } catch (e) {
      console.error('Kullanıcı güncelleme hatası:', e);
      alert('Güncelleme yapılırken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    const canDelete = checkPermission ? checkPermission('kullanıcı silme yetkisi') : true;
    if (!canDelete) {
      alert('Kullanıcı silme yetkiniz bulunmamaktadır!');
      setShowDeleteModal(false);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'users', userId));
      if (setUsers) {
        setUsers(prev => prev.filter(u => u.id !== userId));
      }
      triggerToast('Kullanıcı başarıyla silindi.');
      setTimeout(() => {
        router.push('/admin/users');
      }, 800);
    } catch (e) {
      console.error('Kullanıcı silme hatası:', e);
      alert('Kullanıcı silinirken bir hata oluştu.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-black">
        <div className="flex items-center gap-3 text-amber-500">
          <span className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
          <span>Kullanıcı Bilgileri Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/users')}
            className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-slate-950 transition-all font-black text-xs flex items-center gap-2 cursor-pointer"
          >
            ← GERİ DÖN
          </button>
          <h1 className="text-base sm:text-xl font-black text-amber-500 uppercase tracking-wide">
            👤 KULLANICI VE YETKİ DÜZENLEME
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/30 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-md"
        >
          🗑️ KULLANICIYI SİL
        </button>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSaveUser} className="space-y-6">
        
        {/* 1. Temel Kullanıcı Bilgileri */}
        <div className={`p-5 sm:p-6 rounded-3xl border-2 shadow-xl space-y-4 ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h2 className="text-xs font-black text-emerald-500 uppercase tracking-wider pb-2 border-b border-slate-800">
            1. HESAP BİLGİLERİ
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-black text-xs mb-3">
            <div>
              <label className="block text-[11px] mb-1.5 text-slate-400 uppercase">İSİM</label>
              <input
                type="text"
                disabled={!canEditUser}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl border-2 text-xs font-black outline-none transition-all ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-amber-500' : 'bg-slate-50 border-slate-300 focus:border-amber-500'
                } ${!canEditUser ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className="block text-[11px] mb-1.5 text-slate-400 uppercase">SOYADI</label>
              <input
                type="text"
                disabled={!canEditUser}
                value={surname}
                onChange={(e) => setSurname(e.target.value.toLocaleUpperCase('tr-TR'))}
                className={`w-full px-4 py-3 rounded-2xl border-2 text-xs font-black outline-none transition-all uppercase ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-amber-500' : 'bg-slate-50 border-slate-300 focus:border-amber-500'
                } ${!canEditUser ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-black">
            <div>
              <label className="block text-[11px] mb-1.5 text-slate-400 uppercase">KULLANICI ADI</label>
              <input
                type="text"
                required
                disabled={!canEditUser}
                value={username}
                onChange={(e) => setUsername(e.target.value.toLocaleUpperCase('tr-TR'))}
                className={`w-full px-4 py-3 rounded-2xl border-2 text-xs font-black outline-none transition-all uppercase ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-amber-500' : 'bg-slate-50 border-slate-300 focus:border-amber-500'
                } ${!canEditUser ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>

            <div>
              <label className="block text-[11px] mb-1.5 text-slate-400 uppercase">PAROLA</label>
              <input
                type="text"
                required
                disabled={!canEditUser}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl border-2 text-xs font-black outline-none transition-all ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-amber-500' : 'bg-slate-50 border-slate-300 focus:border-amber-500'
                } ${!canEditUser ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>

            <div>
              <label className="block text-[11px] mb-1.5 text-slate-400 uppercase">HESAP ROLÜ</label>
              <select
                value={role}
                disabled={!canEditUser}
                onChange={(e) => setRole(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl border-2 text-xs font-black outline-none transition-all cursor-pointer ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-amber-400' : 'bg-slate-50 border-slate-300 text-amber-600'
                } ${!canEditUser ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <option value="PERSONEL">PERSONEL</option>
                <option value="DOKTOR">DOKTOR</option>
                <option value="YÖNETİCİ">YÖNETİCİ (ADMIN)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Özel Cihaz ve Modül Yetkileri */}
        <div className={`p-5 sm:p-6 rounded-3xl border-2 shadow-xl space-y-4 ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h2 className="text-xs font-black text-amber-500 uppercase tracking-wider">
              2. SİSTEM VE MODÜL YETKİLERİ
            </h2>

            {canEditUser && role !== 'ADMIN' && role !== 'YÖNETİCİ' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllPermissions}
                  className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg text-[10px] font-black transition-all cursor-pointer"
                >
                  Tümünü Seç
                </button>
                <button
                  type="button"
                  onClick={handleClearAllPermissions}
                  className="px-2.5 py-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg text-[10px] font-black transition-all cursor-pointer"
                >
                  Temizle
                </button>
              </div>
            )}
          </div>

          {role === 'ADMIN' || role === 'YÖNETİCİ' ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-xs text-center">
              👑 YÖNETİCİ (ADMIN) ROLÜNDEKİ KULLANICILAR TÜM YETKİLERE TAM ERİŞİME SAHİPTİR.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-black">
              {SPECIFIC_PERMISSIONS.map((perm) => {
                const isChecked = Boolean(permissions[perm.key]);
                return (
                  <label
                    key={perm.key}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      isChecked
                        ? isDarkMode
                          ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                          : 'bg-emerald-50 border-emerald-500 text-emerald-950'
                        : isDarkMode
                        ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    } ${!canEditUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-xs tracking-wide pr-2">{perm.label}</span>
                    <input
                      type="checkbox"
                      disabled={!canEditUser}
                      checked={isChecked}
                      onChange={(e) => handlePermissionChange(perm.key, e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Save Button */}
        {canEditUser && (
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl transition-all uppercase tracking-wider cursor-pointer active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                <span>KAYDEDİLİYOR...</span>
              </>
            ) : (
              <span>GÜNCELLEMELERİ KAYDET 💾</span>
            )}
          </button>
        )}
      </form>

      {/* Modal: Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className={`w-full max-w-sm rounded-3xl border-2 p-6 shadow-2xl text-center space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-base font-black text-rose-500">🗑️ KULLANICIYI SİL</h3>
            <p className="text-xs font-bold text-slate-400">
              <span className="text-amber-400 font-black">{username}</span> isimli kullanıcı hesabını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3 font-black pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-2xl text-xs cursor-pointer hover:bg-slate-700 transition-all"
              >
                İPTAL
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs shadow-lg cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? 'SİLİNİYOR...' : 'EVET, SİL'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-[250]">
          <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-emerald-400 text-xs font-black flex items-center gap-2 animate-fadeIn">
            <span>✅</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

    </div>
  );
}