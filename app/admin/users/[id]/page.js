'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';

const ModernIcons = {
  Back: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
  UserShield: () => (
    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  Save: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  Search: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  FolderClosed: () => (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
      <path d="M3 7C3 5.89543 3.89543 5 5 5H9.58579C10.1162 5 10.6249 5.21071 11 5.58579L12.4142 7H19C20.1046 7 21 7.89543 21 9V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z" fill="url(#win11_folder_grad_closed)" />
      <path d="M3 9.5C3 8.67157 3.67157 8 4.5 8H19.5C20.3284 8 21 8.67157 21 9.5V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V9.5Z" fill="#FCD34D" fillOpacity="0.9" />
      <defs>
        <linearGradient id="win11_folder_grad_closed" x1="3" y1="5" x2="21" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>
    </svg>
  ),
  FolderOpen: () => (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
      <path d="M3 7C3 5.89543 3.89543 5 5 5H9.58579C10.1162 5 10.6249 5.21071 11 5.58579L12.4142 7H19C20.1046 7 21 7.89543 21 9V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z" fill="#D97706" />
      <path d="M3.5 10.5C3.22386 10.5 3 10.7239 3.05263 10.9952L4.21053 16.9952C4.30397 17.4782 4.72651 17.8333 5.21842 17.8333H19.7816C20.2735 17.8333 20.696 17.4782 20.7895 16.9952L21.9474 10.9952C22 10.7239 21.7761 10.5 21.5 10.5H3.5Z" fill="#FBBF24" />
      <path d="M7 10V8H17V10H7Z" fill="#FFFFFF" fillOpacity="0.7" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  ),
  UserItem: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
};

const SPECIFIC_PERMISSIONS = [
  { key: 'bölüm ve doktor yönetimi', label: 'Bölüm ve Doktor Yönetimi' },
  { key: 'bölüm ve doktor düzeltme yetkisi', label: 'Bölüm ve Doktor Düzeltme' },
  { key: 'bölüm ve doktor silme yetkisi', label: 'Bölüm ve Doktor Silme' },
  { key: 'çalışma durumu değiştirme', label: 'Çalışma Durumu Değiştirme' },
  { key: 'kullanıcı ekleme ve yetkilendirme', label: 'Kullanıcı Ekleme/Yetki' },
  { key: 'kullanıcı düzenleme yetkisi', label: 'Kullanıcı Düzenleme' },
  { key: 'kullanıcı silme yetkisi', label: 'Kullanıcı Silme' },
  { key: 'sorun bildirme yönetimi', label: 'Arıza / Sorun Yönetimi' }
];

export default function EditUserPage({ params }) {
  const unwrappedParams = use(params);
  const userId = unwrappedParams?.id;

  const { isDarkMode } = useTheme();
  const { checkPermission, users: contextUsers = [], setUsers: setContextUsers } = useData();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // 🌲 حالة الشجرة الهرمية
  const [allUsersList, setAllUsersList] = useState([]);
  const [treeSearch, setTreeSearch] = useState('');
  const [expandedNodes, setExpandedNodes] = useState({
    YÖNETİCİ: false,
    DOKTOR: false,
    PERSONEL: false
  });

  // Form State
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PERSONEL');
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

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

  // 📡 جلب قائمة كل المستخدمين لبناء الشجرة
  useEffect(() => {
    if (!mounted) return;
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const uList = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setAllUsersList(uList);
    });
    return () => unsub();
  }, [mounted]);

  // 📡 جلب بيانات المستخدم المحدد حالياً
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
          const userRole = data.role || 'PERSONEL';
          setRole(userRole);
          setPermissions(data.permissions || {});

          // 🎯 فتح مجلد المستخدم الحالي تلقائياً ليظل واضحاً ومفتوحاً
          const normRole = userRole.toLocaleUpperCase('tr-TR');
          const groupKey = (normRole === 'ADMIN' || normRole === 'YÖNETİCİ')
            ? 'YÖNETİCİ'
            : (normRole === 'DOKTOR' ? 'DOKTOR' : 'PERSONEL');

          setExpandedNodes(prev => ({
            ...prev,
            [groupKey]: true
          }));

        } else {
          const localUser = contextUsers.find(u => u.id === userId);
          if (localUser) {
            setName(localUser.name || '');
            setSurname(localUser.surname || '');
            setUsername(localUser.username || '');
            setPassword(localUser.password || '');
            const userRole = localUser.role || 'PERSONEL';
            setRole(userRole);
            setPermissions(localUser.permissions || {});

            const normRole = userRole.toLocaleUpperCase('tr-TR');
            const groupKey = (normRole === 'ADMIN' || normRole === 'YÖNETİCİ')
              ? 'YÖNETİCİ'
              : (normRole === 'DOKTOR' ? 'DOKTOR' : 'PERSONEL');

            setExpandedNodes(prev => ({
              ...prev,
              [groupKey]: true
            }));
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
  }, [userId, canAccessPage, router, mounted, contextUsers]);

  // 🌲 تقسيم المستخدمين في الشجرة حسب الأدوار
  const treeGroups = useMemo(() => {
    const groups = {
      YÖNETİCİ: [],
      DOKTOR: [],
      PERSONEL: []
    };

    const query = treeSearch.toLowerCase().trim();

    allUsersList.forEach(u => {
      const uRole = (u.role || 'PERSONEL').toLocaleUpperCase('tr-TR');
      const matchesSearch = !query || 
        (u.username && u.username.toLowerCase().includes(query)) ||
        (u.name && u.name.toLowerCase().includes(query)) ||
        (u.surname && u.surname.toLowerCase().includes(query));

      if (matchesSearch) {
        if (uRole === 'YÖNETİCİ' || uRole === 'ADMIN') {
          groups.YÖNETİCİ.push(u);
        } else if (uRole === 'DOKTOR') {
          groups.DOKTOR.push(u);
        } else {
          groups.PERSONEL.push(u);
        }
      }
    });

    return groups;
  }, [allUsersList, treeSearch]);

  // 🎯 فتح وإغلاق المجلد بشكل مستقل تماماً ودون إغلاق المجلدات الأخرى
  const toggleNode = (groupKey) => {
    setExpandedNodes(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // 🎨 تنسيق ألوان وشارات أعداد المستخدمين للحصول على وضوح عالي ومثالي بالوضعين
  const getBadgeStyle = (catKey) => {
    if (catKey === 'YÖNETİCİ') {
      return isDarkMode
        ? 'bg-rose-500/30 text-rose-200 border-rose-500/50 font-black'
        : 'bg-rose-100 text-rose-900 border-rose-400 font-black';
    }
    if (catKey === 'DOKTOR') {
      return isDarkMode
        ? 'bg-amber-500/30 text-amber-200 border-amber-500/50 font-black'
        : 'bg-amber-100 text-amber-950 border-amber-400 font-black';
    }
    return isDarkMode
      ? 'bg-emerald-500/30 text-emerald-200 border-emerald-500/50 font-black'
      : 'bg-emerald-100 text-emerald-950 border-emerald-400 font-black';
  };

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

      if (setContextUsers) {
        setContextUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedData, id: userId } : u));
      }

      triggerToast('Kullanıcı başarıyla güncellendi!');
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
      if (setContextUsers) {
        setContextUsers(prev => prev.filter(u => u.id !== userId));
      }
      triggerToast('Kullanıcı silindi.');
      setTimeout(() => {
        router.push('/admin/users');
      }, 500);
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
      <div className="fixed inset-0 bg-[#020617] text-slate-100 flex items-center justify-center font-black cursor-default z-50">
        <div className="flex items-center gap-2 text-amber-500">
          <span className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
          <span className="text-xs uppercase">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 h-dvh w-dvw max-h-dvh max-w-dvw overflow-hidden select-none transition-colors duration-300 font-sans cursor-default flex flex-col ${
      isDarkMode ? 'bg-[#020617] text-slate-100' : 'bg-[#edf4ff] text-slate-900'
    }`}>
      
      {/* 🏙️ الخلفية الهندسيّة ثلاثية الأبعاد */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[120vw] h-[60vh] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${
          isDarkMode 
            ? 'bg-gradient-to-b from-amber-500/10 via-slate-900/10 to-transparent' 
            : 'bg-gradient-to-b from-blue-200/20 via-slate-200/10 to-transparent'
        }`} />

        <div 
          className={`absolute inset-0 transition-all duration-300 ${
            isDarkMode ? 'opacity-25' : 'opacity-35'
          }`}
          style={{
            backgroundImage: isDarkMode
              ? `
                linear-gradient(to right, rgba(148, 163, 184, 0.2) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(148, 163, 184, 0.2) 1px, transparent 1px)
              `
              : `
                linear-gradient(to right, rgba(71, 85, 105, 0.25) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(71, 85, 105, 0.25) 1px, transparent 1px)
              `,
            backgroundSize: '20px 20px',
            transform: 'perspective(500px) rotateX(20deg) scale(1.2)',
            transformOrigin: 'top center'
          }}
        />
        
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617]' 
            : 'bg-gradient-to-b from-transparent via-[#edf4ff]/50 to-[#edf4ff]'
        }`} />
      </div>

      {/* 🚀 Header Controls (الشريط العلوي) */}
      <div className={`relative z-20 w-full px-4 py-2 border-b flex justify-between items-center shrink-0 transition-colors ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 backdrop-blur-md' : 'bg-white/90 border-slate-200 text-slate-900 backdrop-blur-md'
      }`}>
        
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.push('/admin/users')}
            className={`px-3 py-1.5 rounded-xl border font-black text-xs uppercase transition-all flex items-center gap-1.5 cursor-default ${
              isDarkMode 
                ? 'bg-slate-950 border-slate-800 text-amber-400 hover:bg-amber-500/10' 
                : 'bg-white border-slate-300 text-amber-600 hover:bg-amber-50'
            }`}
          >
            <ModernIcons.Back />
            <span>Kullanıcı Listesi</span>
          </button>

          <div className="flex items-center gap-1.5 border-l pl-2.5 border-slate-700/50">
            <ModernIcons.UserShield />
            <h1 className="text-xs font-black text-amber-500 uppercase tracking-wide">
              Kullanıcı Yönetim Paneli
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/30 rounded-xl text-xs font-black transition-all cursor-default flex items-center gap-1.5"
        >
          <ModernIcons.Trash />
          <span>Kullanıcıyı Sil</span>
        </button>
      </div>

      {/* 📐 Main Split Container (شجرة اليسار + نموذج التعديل) */}
      <div className="relative z-10 flex-1 min-h-0 w-full flex overflow-hidden p-2 gap-2 pb-11 cursor-default">
        
        {/* 🌲 1. Left Tree View Panel (شجرة المستخدمين) */}
        <div className={`w-64 sm:w-72 shrink-0 flex flex-col rounded-xl border backdrop-blur-md overflow-hidden ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}>
          {/* Tree Header & Search */}
          <div className="p-2 border-b border-slate-800/60 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-black uppercase text-amber-500">
              <span>Kullanıcı Hiyerarşisi</span>
              <span className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded border ${
                isDarkMode ? 'bg-slate-950 text-slate-200 border-slate-800' : 'bg-slate-100 text-slate-800 border-slate-300'
              }`}>
                Toplam: {allUsersList.length}
              </span>
            </div>
            
            <div className="relative">
              <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <ModernIcons.Search />
              </div>
              <input
                type="text"
                value={treeSearch}
                onChange={(e) => setTreeSearch(e.target.value)}
                placeholder="Ağaçta ara..."
                className={`w-full pl-8 pr-2 py-1 rounded-lg border text-[11px] font-bold outline-none transition-colors ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Tree Content (Nodes) */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1 text-xs font-bold scrollbar-thin">
            
            {[
              { key: 'YÖNETİCİ', label: '👑 Yöneticiler', list: treeGroups.YÖNETİCİ },
              { key: 'DOKTOR', label: '🩺 Doktorlar', list: treeGroups.DOKTOR },
              { key: 'PERSONEL', label: '👤 Personeller', list: treeGroups.PERSONEL },
            ].map(cat => {
              const isExpanded = Boolean(expandedNodes[cat.key]) || Boolean(treeSearch.trim());
              return (
                <div key={cat.key} className="space-y-0.5">
                  {/* Parent Folder Header */}
                  <div 
                    onClick={() => toggleNode(cat.key)}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-lg border cursor-default transition-colors ${
                      isDarkMode ? 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50' : 'bg-slate-100/80 border-slate-200 hover:bg-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {isExpanded ? <ModernIcons.ChevronDown /> : <ModernIcons.ChevronRight />}
                      {isExpanded ? <ModernIcons.FolderOpen /> : <ModernIcons.FolderClosed />}
                      <span className="font-black text-[11px] uppercase tracking-wide">{cat.label}</span>
                    </div>

                    {/* 🌟 عداد بوضوح ممتاز ومقروء في النهار والليل */}
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getBadgeStyle(cat.key)}`}>
                      {cat.list.length}
                    </span>
                  </div>

                  {/* Child Users List */}
                  {isExpanded && (
                    <div className="pl-4 space-y-0.5 border-l-2 ml-3 my-0.5 border-slate-700/40">
                      {cat.list.length > 0 ? (
                        cat.list.map(u => {
                          const isSelected = u.id === userId;
                          return (
                            <div
                              key={u.id}
                              onClick={() => router.push(`/admin/users/${u.id}`)}
                              className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all cursor-default text-[11px] font-bold ${
                                isSelected
                                  ? isDarkMode
                                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-black'
                                    : 'bg-amber-100 border border-amber-500 text-amber-950 font-black'
                                  : isDarkMode
                                  ? 'text-slate-300 hover:bg-slate-800/60'
                                  : 'text-slate-800 hover:bg-slate-200/60'
                              }`}
                            >
                              <ModernIcons.UserItem />
                              <span className="truncate">{u.username || u.name}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-[10px] text-slate-500 italic py-0.5 pl-1">Kayıt yok</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        </div>

        {/* 📝 2. Right Form Panel (نموذج التعديل) */}
        <div className={`flex-1 min-w-0 flex flex-col rounded-xl border backdrop-blur-md overflow-hidden ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}>
          
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 scrollbar-thin">
            
            <form onSubmit={handleSaveUser} className="space-y-3.5">
              
              {/* 1. Account Info Section */}
              <div className={`p-3 rounded-xl border space-y-2.5 ${
                isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
                  <span className="text-xs font-black text-emerald-500 uppercase tracking-wider">1. HESAP BİLGİLERİ</span>
                  <span className="text-[10px] font-mono text-slate-400">ID: {userId?.substring(0, 8)}...</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-bold text-xs">
                  <div>
                    <label className="block text-[10px] mb-1 text-slate-400 uppercase">İsim</label>
                    <input
                      type="text"
                      disabled={!canEditUser}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="İsim..."
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold outline-none transition-colors focus:bg-[#ffff00] focus:text-slate-950 focus:border-[#ffff00] ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                      } ${!canEditUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] mb-1 text-slate-400 uppercase">Soyadı</label>
                    <input
                      type="text"
                      disabled={!canEditUser}
                      value={surname}
                      onChange={(e) => setSurname(e.target.value.toLocaleUpperCase('tr-TR'))}
                      placeholder="Soyadı..."
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold outline-none transition-colors uppercase focus:bg-[#ffff00] focus:text-slate-950 focus:border-[#ffff00] ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                      } ${!canEditUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-bold text-xs">
                  <div>
                    <label className="block text-[10px] mb-1 text-slate-400 uppercase">Kullanıcı Adı</label>
                    <input
                      type="text"
                      required
                      disabled={!canEditUser}
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLocaleUpperCase('tr-TR'))}
                      placeholder="Kullanıcı Adı..."
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold outline-none transition-colors uppercase focus:bg-[#ffff00] focus:text-slate-950 focus:border-[#ffff00] ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                      } ${!canEditUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] mb-1 text-slate-400 uppercase">Parola</label>
                    <input
                      type="text"
                      required
                      disabled={!canEditUser}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Parola..."
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold outline-none transition-colors focus:bg-[#ffff00] focus:text-slate-950 focus:border-[#ffff00] ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                      } ${!canEditUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] mb-1 text-slate-400 uppercase">Hesap Rolü</label>
                    <select
                      value={role}
                      disabled={!canEditUser}
                      onChange={(e) => setRole(e.target.value)}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs font-black outline-none transition-colors cursor-default ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-amber-400' : 'bg-white border-slate-300 text-amber-600'
                      } ${!canEditUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <option value="PERSONEL">PERSONEL</option>
                      <option value="DOKTOR">DOKTOR</option>
                      <option value="YÖNETİCİ">YÖNETİCİ (ADMIN)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Permissions Section */}
              <div className={`p-3 rounded-xl border space-y-2.5 ${
                isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-800/60">
                  <span className="text-xs font-black text-amber-500 uppercase tracking-wider">2. SİSTEM VE MODÜL YETKİLERİ</span>

                  {canEditUser && role !== 'ADMIN' && role !== 'YÖNETİCİ' && (
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={handleSelectAllPermissions}
                        className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded text-[10px] font-black transition-all cursor-default"
                      >
                        Tümünü Seç
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllPermissions}
                        className="px-2 py-0.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded text-[10px] font-black transition-all cursor-default"
                      >
                        Temizle
                      </button>
                    </div>
                  )}
                </div>

                {role === 'ADMIN' || role === 'YÖNETİCİ' ? (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-xs text-center uppercase">
                    👑 YÖNETİCİ (ADMIN) ROLÜNDEKİ KULLANICILAR TÜM YETKİLERE SAHİPTİR.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-bold">
                    {SPECIFIC_PERMISSIONS.map((perm) => {
                      const isChecked = Boolean(permissions[perm.key]);
                      return (
                        <div
                          key={perm.key}
                          onClick={() => canEditUser && handlePermissionChange(perm.key, !isChecked)}
                          className={`p-2.5 rounded-lg border transition-all cursor-default flex items-center justify-between gap-2 ${
                            isChecked
                              ? isDarkMode
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                                : 'bg-emerald-50 border-emerald-400 text-emerald-950'
                              : isDarkMode
                              ? 'bg-slate-950/80 border-slate-800/80 text-slate-400 hover:border-slate-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          } ${!canEditUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <span className="text-[11px] tracking-wide truncate">{perm.label}</span>
                          
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isChecked 
                              ? 'bg-emerald-500 border-emerald-400 text-white' 
                              : isDarkMode ? 'bg-slate-900 border-slate-800 text-transparent' : 'bg-slate-100 border-slate-300 text-transparent'
                          }`}>
                            <ModernIcons.Check />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              {canEditUser && (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-default active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <ModernIcons.Save />
                      <span>Güncellemeleri Kaydet</span>
                    </>
                  )}
                </button>
              )}

            </form>

          </div>
        </div>

      </div>

      {/* Modal: Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-xl border p-5 shadow-2xl text-center space-y-3 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <h3 className="text-sm font-black text-rose-500 uppercase tracking-wide">🗑️ Kullanıcıyı Sil</h3>
            <p className="text-xs font-bold text-slate-400 leading-relaxed">
              <span className="text-amber-400 font-black">{username}</span> isimli kullanıcı hesabını silmek istediğinize emin misiniz?
            </p>
            <div className="flex gap-2 font-black pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className={`flex-1 py-2 rounded-lg text-xs uppercase cursor-default ${
                  isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                }`}
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-black shadow-md cursor-default transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className="bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-2xl border border-emerald-400 text-xs font-black flex items-center gap-2">
            <ModernIcons.Check />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

    </div>
  );
}