'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { 
  User, Lock, CheckCircle, AlertCircle, 
  Eye, EyeOff, Save, Key, History, Camera,
  ChevronDown, ChevronRight, Edit3, Settings, ShieldCheck, Mail, Phone, Building, Hash, Briefcase
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  
  // Tree View States
  const [isProfilTreeOpen, setIsProfilTreeOpen] = useState(true);
  const [isIslemlerTreeOpen, setIsIslemlerTreeOpen] = useState(false);

  // Active Screen Content: 'profil-detay' | 'profil-duzenle' | 'sifre-islemleri' | 'islem-gecmisi'
  const [activeContent, setActiveContent] = useState('profil-detay');

  // App States
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Action Logs (İşlem Geçmişi)
  const [actionLogs, setActionLogs] = useState([]);

  // Profile Edit States
  const [avatarUrl, setAvatarUrl] = useState('');
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    department: '',
    workplace: '',
    jobTitle: '',
    avatarUrl: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState({ type: '', text: '' });

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState({ type: '', text: '' });

  // Helper to add log
  const addLog = (title, description, status = 'Başarılı') => {
    const newLog = {
      id: Date.now(),
      date: new Date().toLocaleDateString('tr-TR'),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      title,
      description,
      status
    };
    setActionLogs((prev) => [newLog, ...prev]);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');

    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const activeUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : null);

    if (!activeUser) {
      router.push('/');
      return;
    }

    const fetchUserData = async () => {
      try {
        const userRef = doc(db, 'users', activeUser.id);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const fullData = { id: userSnap.id, ...userSnap.data() };
          setCurrentUser(fullData);
          setAvatarUrl(fullData.avatarUrl || '');
          setEditFormData({
            fullName: fullData.fullName || fullData.name || '',
            username: fullData.username || '',
            email: fullData.email || '',
            phone: fullData.phone || '',
            department: fullData.department || '',
            workplace: fullData.workplace || '',
            jobTitle: fullData.jobTitle || '',
            avatarUrl: fullData.avatarUrl || ''
          });
        } else {
          setCurrentUser(activeUser);
        }

        addLog('OTURUM', `Kullanıcı girişi sağlandı (${activeUser.username || activeUser.fullName}).`, 'Aktif Oturum');
      } catch (err) {
        console.error('Veri çekme hatası:', err);
        setCurrentUser(activeUser);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditMessage({ type: '', text: '' });
    setEditLoading(true);

    try {
      const userRef = doc(db, 'users', currentUser.id);
      const updatedFields = {
        fullName: editFormData.fullName,
        username: editFormData.username,
        email: editFormData.email,
        phone: editFormData.phone,
        department: editFormData.department,
        workplace: editFormData.workplace,
        jobTitle: editFormData.jobTitle,
        avatarUrl: editFormData.avatarUrl
      };

      await updateDoc(userRef, updatedFields);

      const updatedUser = { ...currentUser, ...updatedFields };
      setCurrentUser(updatedUser);
      setAvatarUrl(editFormData.avatarUrl);

      if (sessionStorage.getItem('user')) sessionStorage.setItem('user', JSON.stringify(updatedUser));
      if (localStorage.getItem('user')) localStorage.setItem('user', JSON.stringify(updatedUser));

      setEditMessage({ type: 'success', text: 'Profil bilgileriniz başarıyla güncellendi.' });
      addLog('PROFİL GÜNCELLEME', 'Profil bilgileri (Çalışma yeri / Unvan dahil) güncellendi.');
    } catch (err) {
      setEditMessage({ type: 'error', text: 'Güncelleme sırasında bir hata oluştu.' });
      addLog('PROFİL GÜNCELLEME', 'Profil güncelleme işlemi başarısız oldu.', 'Hata');
    } finally {
      setEditLoading(false);
    }
  };

  // Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPassMessage({ type: '', text: '' });

    if (!newPassword || newPassword.length < 6) {
      setPassMessage({ type: 'error', text: 'Yeni şifre en az 6 karakter olmalıdır.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassMessage({ type: 'error', text: 'Şifreler birbiriyle eşleşmiyor.' });
      return;
    }

    setPassLoading(true);
    try {
      const userRef = doc(db, 'users', currentUser.id);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.password && userData.password !== currentPassword) {
          setPassMessage({ type: 'error', text: 'Mevcut şifreniz hatalı.' });
          setPassLoading(false);
          return;
        }

        await updateDoc(userRef, { password: newPassword });
        const updatedUser = { ...currentUser, password: newPassword };
        if (sessionStorage.getItem('user')) sessionStorage.setItem('user', JSON.stringify(updatedUser));
        if (localStorage.getItem('user')) localStorage.setItem('user', JSON.stringify(updatedUser));

        setCurrentUser(updatedUser);
        setPassMessage({ type: 'success', text: 'Şifreniz başarıyla güncellendi.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        addLog('ŞİFRE DEĞİŞİKLİĞİ', 'Kullanıcı şifresi başarıyla yenilendi.');
      }
    } catch (err) {
      setPassMessage({ type: 'error', text: 'İşlem sırasında bir hata oluştu.' });
      addLog('ŞİFRE DEĞİŞİKLİĞİ', 'Şifre değiştirme denemesi başarısız oldu.', 'Hata');
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-sans ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-[#f0f2f5] text-slate-800'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold opacity-70">Sistem Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen font-sans flex flex-col md:flex-row items-stretch transition-colors duration-200 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f0f2f5] text-slate-800'}`}>
      
      {/* 1. SOL AĞAÇ MENÜ (القائمة الجانبية ممتدة بالكامل) */}
      <aside className={`w-full md:w-64 min-h-full border-r shrink-0 flex flex-col justify-start select-none ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="p-3 space-y-3">
          {/* User Snapshot */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200/60 dark:border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
              {avatarUrl ? <img src={avatarUrl} alt="User" className="w-full h-full object-cover" /> : (currentUser?.fullName?.charAt(0) || 'U')}
            </div>
            <div className="overflow-hidden text-xs">
              <p className="font-bold truncate text-slate-800 dark:text-slate-200">{currentUser?.fullName || currentUser?.username}</p>
              <p className="text-[10px] text-slate-400 truncate capitalize">{currentUser?.jobTitle || currentUser?.role || 'Kullanıcı'}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1 text-xs">
            {/* Tree 1: Profil Bilgileri */}
            <div>
              <button 
                onClick={() => {
                  setIsProfilTreeOpen(!isProfilTreeOpen);
                  setActiveContent('profil-detay');
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md font-bold transition-colors ${
                  activeContent === 'profil-detay' || activeContent === 'profil-duzenle'
                    ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Profil Bilgileri</span>
                </div>
                {isProfilTreeOpen ? <ChevronDown className="w-3.5 h-3.5 opacity-60" /> : <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </button>

              {/* Sub Tree Item: Profil Bilgilerini Düzenle */}
              {isProfilTreeOpen && (
                <div className="ml-3 pl-2.5 border-l border-slate-200 dark:border-slate-800 my-1 space-y-1">
                  <button
                    onClick={() => setActiveContent('profil-duzenle')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md font-medium text-[11px] transition-colors ${
                      activeContent === 'profil-duzenle'
                        ? 'text-rose-600 bg-rose-100/50 dark:bg-rose-900/40 font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Edit3 className="w-3 h-3 text-rose-500" />
                    <span>Profil Bilgilerini Düzenle</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tree 2: İşlemlerim */}
            <div>
              <button 
                onClick={() => setIsIslemlerTreeOpen(!isIslemlerTreeOpen)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md font-bold transition-colors ${
                  activeContent === 'sifre-islemleri' || activeContent === 'islem-gecmisi'
                    ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>İşlemlerim</span>
                </div>
                {isIslemlerTreeOpen ? <ChevronDown className="w-3.5 h-3.5 opacity-60" /> : <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </button>

              {/* Sub Tree Items */}
              {isIslemlerTreeOpen && (
                <div className="ml-3 pl-2.5 border-l border-slate-200 dark:border-slate-800 my-1 space-y-1">
                  {/* Şifre İşlemleri */}
                  <button
                    onClick={() => setActiveContent('sifre-islemleri')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md font-medium text-[11px] transition-colors ${
                      activeContent === 'sifre-islemleri'
                        ? 'text-rose-600 bg-rose-100/50 dark:bg-rose-900/40 font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Key className="w-3 h-3 text-amber-500" />
                    <span>Şifre İşlemleri</span>
                  </button>

                  {/* İşlem Geçmişi */}
                  <button
                    onClick={() => setActiveContent('islem-gecmisi')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md font-medium text-[11px] transition-colors ${
                      activeContent === 'islem-gecmisi'
                        ? 'text-rose-600 bg-rose-100/50 dark:bg-rose-900/40 font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <History className="w-3 h-3 text-blue-500" />
                    <span>İşlem Geçmişi</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </aside>

      {/* 2. CENTER-RIGHT MAIN CONTENT */}
      <main className="flex-1 p-3 md:p-5 overflow-y-auto w-full">
        
        {/* VIEW 1: PROFİL BİLGİLERİ */}
        {activeContent === 'profil-detay' && (
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs p-4 space-y-4 animate-fadeIn">
            
            {/* Profile Card Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center font-extrabold text-lg overflow-hidden shadow-sm shrink-0">
                {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : (currentUser?.fullName?.charAt(0) || 'U')}
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  {currentUser?.fullName || currentUser?.username || 'Kullanıcı'}
                </h2>
                <p className="text-xs text-slate-400 font-medium">{currentUser?.email || 'E-posta tanımlanmadı'}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 rounded-full text-[10px] font-bold uppercase">
                    {currentUser?.jobTitle || currentUser?.role || 'Kullanıcı'}
                  </span>
                  {currentUser?.workplace && (
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full text-[10px] font-semibold">
                      {currentUser?.workplace}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Detail Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
                <Hash className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">Kullanıcı ID / No</p>
                  <p className="font-bold font-mono text-xs text-slate-700 dark:text-slate-200">{currentUser?.id?.toUpperCase() || 'N/A'}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
                <User className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">Kullanıcı Adı</p>
                  <p className="font-bold text-xs text-slate-700 dark:text-slate-200">{currentUser?.username || 'N/A'}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
                <Building className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">Çalışma Yeri / Kurum</p>
                  <p className="font-bold text-xs text-slate-700 dark:text-slate-200">{currentUser?.workplace || 'Belirtilmedi'}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">Görevi / Unvanı</p>
                  <p className="font-bold text-xs text-slate-700 dark:text-slate-200">{currentUser?.jobTitle || 'Belirtilmedi'}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
                <Mail className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">E-Posta Adresi</p>
                  <p className="font-bold text-xs text-slate-700 dark:text-slate-200">{currentUser?.email || 'Belirtilmedi'}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
                <Phone className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">Telefon Numarası</p>
                  <p className="font-bold text-xs text-slate-700 dark:text-slate-200">{currentUser?.phone || 'Belirtilmedi'}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">Kayıt Tarihi</p>
                  <p className="font-bold text-xs text-slate-700 dark:text-slate-200">
                    {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('tr-TR') : '09.03.2026'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: PROFİL BİLGİLERİNİ DÜZENLE */}
        {activeContent === 'profil-duzenle' && (
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs p-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-500 font-bold text-xs uppercase tracking-wider mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Edit3 className="w-4 h-4" />
              <span>PROFİL BİLGİLERİNİ DÜZENLE</span>
            </div>

            <div className="bg-[#fef8e7] dark:bg-amber-950/30 border border-[#fce8b2] dark:border-amber-800/50 text-slate-800 dark:text-amber-200 p-2.5 rounded text-xs font-medium mb-3">
              <strong>DİKKAT!</strong> Çalışma yeri ve Görevi/Unvanı bilgilerinizi girdikten sonra <strong>İçeri Aktar / Kaydet</strong> butonuna basarak profilde görünmesini sağlayabilirsiniz.
            </div>

            {editMessage.text && (
              <div className={`p-2.5 mb-3 rounded text-xs font-bold flex items-center gap-2 ${
                editMessage.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {editMessage.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {editMessage.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
              
              {/* Avatar Input */}
              <div className="flex flex-col md:flex-row md:items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-base overflow-hidden shrink-0">
                  {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : (currentUser?.fullName?.charAt(0) || 'U')}
                </div>
                <div className="flex-1 space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 text-[11px]">
                    <Camera className="w-3.5 h-3.5 text-rose-600" />
                    Profil Fotoğrafı Bağlantısı (URL)
                  </label>
                  <input 
                    type="url" 
                    value={editFormData.avatarUrl}
                    onChange={(e) => setEditFormData({ ...editFormData, avatarUrl: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-rose-600 text-xs"
                    placeholder="https://gorsel-adresi.com/foto.jpg"
                  />
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300 text-[11px]">Ad Soyad</label>
                  <input 
                    type="text" 
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-rose-600 text-xs"
                    placeholder="Ad Soyad"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300 text-[11px]">Kullanıcı Adı</label>
                  <input 
                    type="text" 
                    value={editFormData.username}
                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-rose-600 text-xs"
                    placeholder="Kullanıcı adı"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300 text-[11px]">Çalışma Yeri / Kurum</label>
                  <input 
                    type="text" 
                    value={editFormData.workplace}
                    onChange={(e) => setEditFormData({ ...editFormData, workplace: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-rose-600 text-xs"
                    placeholder="Örn: Milli Eğitim Bakanlığı / Özel Şirket"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300 text-[11px]">Görevi / Unvanı</label>
                  <input 
                    type="text" 
                    value={editFormData.jobTitle}
                    onChange={(e) => setEditFormData({ ...editFormData, jobTitle: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-rose-600 text-xs"
                    placeholder="Örn: Yazılım Uzmanı / Öğretmen"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300 text-[11px]">E-Posta Adresi</label>
                  <input 
                    type="email" 
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-rose-600 text-xs"
                    placeholder="E-posta adresi giriniz"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300 text-[11px]">Telefon Numarası</label>
                  <input 
                    type="text" 
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-rose-600 text-xs"
                    placeholder="05XX XXX XX XX"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={editLoading}
                  className="px-5 py-2 bg-[#337ab7] hover:bg-[#286090] text-white rounded font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  {editLoading ? 'İşlem Yapılıyor...' : 'İçeri Aktar / Kaydet'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 3: ŞİFRE İŞLEMLERİ */}
        {activeContent === 'sifre-islemleri' && (
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs p-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-500 font-bold text-xs uppercase tracking-wider mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Key className="w-4 h-4" />
              <span>ŞİFRE İŞLEMLERİ PANELİ</span>
            </div>

            {passMessage.text && (
              <div className={`p-2.5 mb-3 rounded text-xs font-bold flex items-center gap-2 ${
                passMessage.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {passMessage.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {passMessage.text}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-[11px]">Mevcut Şifre</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? 'text' : 'password'} 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-2 pr-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-rose-600 text-xs"
                      placeholder="Mevcut şifreniz"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-[11px]">Yeni Şifre</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? 'text' : 'password'} 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2 pr-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-rose-600 text-xs"
                      placeholder="En az 6 karakter"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-[11px]">Yeni Şifre (Tekrar)</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-rose-600 text-xs"
                    placeholder="Şifreyi tekrar giriniz"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={passLoading}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded shadow-xs transition-colors flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {passLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 4: İŞLEM GEÇMİŞİ */}
        {activeContent === 'islem-gecmisi' && (
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs p-4 animate-fadeIn space-y-3">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-500 font-bold text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
              <History className="w-4 h-4 text-blue-500" />
              <span>SİSTEM İŞLEM GEÇMİŞİ (SON HAREKETLER)</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hesabınızda gerçekleştirdiğiniz son işlemler kronolojik olarak aşağıda listelenmektedir:
            </p>

            <div className="space-y-2 text-xs">
              {actionLogs.length > 0 ? (
                actionLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 mr-2">
                        [{log.date} {log.time}] - {log.title}:
                      </span>
                      <span>{log.description}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      log.status === 'Hata' 
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400' 
                        : log.status === 'Aktif Oturum'
                        ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">Henüz kaydedilmiş bir işlem bulunmuyor.</p>
              )}
            </div>
          </div>
        )}

      </main>

    </div>
  );
}