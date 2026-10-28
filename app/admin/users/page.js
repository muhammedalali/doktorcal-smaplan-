'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';

const ModernIcons = {
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  UserPlus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
};

const DEFAULT_PERMISSIONS = {
  'bölüm ve doktor yönetimi': false,
  'bölüm ve doktor düzeltme yetkisi': false,
  'bölüm ve doktor silme yetkisi': false,
  'çalışma durumu değiştirme': false,
  'kullanıcı ekleme ve yetkilendirme': false,
  'kullanıcı düzenleme yetkisi': false,
  'kullanıcı silme yetkisi': false,
  'sorun bildirme yönetimi': false,
};

export default function AdminUsersPage() {
  const themeContext = useTheme();
  const isDarkMode = themeContext?.isDarkMode ?? true;

  const { checkPermission, currentUser } = useData();

  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 🎯 حالة أبعاد الأعمدة الديناميكية (Excel Column Resizing)
  const [columnWidths, setColumnWidths] = useState({
    userNumber: 170,
    username: 230,
    role: 130,
    phone: 160,
    lastLogin: 190,
    lastLogout: 190,
    status: 120,
  });

  const resizingRef = useRef(null);

  // Form State
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('KULLANICI');

  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeUser = mounted ? (currentUser || (typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}') : {})) : {};
  const nameStr = activeUser.username ? activeUser.username.toLocaleUpperCase('tr-TR') : '';
  const isGlobalAdmin = nameStr === 'ADMIN' || activeUser.role === 'YÖNETİCİ';
  const hasUserPermission = checkPermission ? checkPermission('kullanıcı ekleme ve yetkilendirme') : false;

  const canAccessUsersPage = isGlobalAdmin || hasUserPermission;

  useEffect(() => {
    if (!mounted) return;

    if (!canAccessUsersPage) {
      router.push('/dashboard');
      return;
    }

    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setUsers(usersData);
    });

    return () => unsubscribeUsers();
  }, [mounted, canAccessUsersPage, router]);

  const filteredUsers = useMemo(() => {
    const uniqueMap = new Map();
    users.forEach(u => {
      if (u.id) uniqueMap.set(u.id, u);
    });
    const uniqueList = Array.from(uniqueMap.values());

    return uniqueList.filter(u => 
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.surname && u.surname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.phone && u.phone.includes(searchTerm)) ||
      (u.userNumber && String(u.userNumber).includes(searchTerm))
    );
  }, [users, searchTerm]);

  const formatDate = (dateVal) => {
    if (!dateVal) return 'Kayıt yok';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'Kayıt yok';
    return d.toLocaleString('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  // 📐 إدارة سحب العمود لليمين واليسار (Excel Drag Resize)
  const handleMouseDownResize = (e, colKey) => {
    e.preventDefault();
    e.stopPropagation();

    resizingRef.current = {
      colKey,
      startX: e.clientX,
      startWidth: columnWidths[colKey]
    };

    const handleMouseMove = (moveEvent) => {
      if (!resizingRef.current) return;
      const deltaX = moveEvent.clientX - resizingRef.current.startX;
      const newWidth = Math.max(90, resizingRef.current.startWidth + deltaX);

      setColumnWidths(prev => ({
        ...prev,
        [resizingRef.current.colKey]: newWidth
      }));
    };

    const handleMouseUp = () => {
      resizingRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // ⚡ الضغط المزدوج للتوسيع التلقائي بحسب المحتوى (Double Click to Auto Fit)
  const handleDoubleClickAutoFit = (e, colKey) => {
    e.preventDefault();
    e.stopPropagation();

    let maxLen = 10;

    filteredUsers.forEach(u => {
      let val = '';
      if (colKey === 'userNumber') val = String(u.userNumber || '1000');
      else if (colKey === 'username') val = u.username || '';
      else if (colKey === 'role') val = u.role || 'KULLANICI';
      else if (colKey === 'phone') val = u.phone || '—';
      else if (colKey === 'lastLogin') val = formatDate(u.lastLogin);
      else if (colKey === 'lastLogout') val = formatDate(u.lastLogout);

      if (val.length > maxLen) maxLen = val.length;
    });

    const fittedWidth = Math.min(450, Math.max(120, maxLen * 11 + 35));

    setColumnWidths(prev => ({
      ...prev,
      [colKey]: fittedWidth
    }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!name || !surname || !username || !password || !confirmPassword) {
      alert('Lütfen tüm zorunlu alanları doldurun!');
      return;
    }

    if (password !== confirmPassword) {
      alert('Şifreler eşleşmiyor! Lütfen kontrol edin.');
      return;
    }

    const cleanName = name.trim();
    const cleanSurname = surname.trim().toLocaleUpperCase('tr-TR');
    const cleanUsername = username.trim().toLocaleUpperCase('tr-TR');
    const customUserNumber = Math.floor(1000 + Math.random() * 9000);

    const newUserObj = {
      userNumber: customUserNumber,
      name: cleanName,
      surname: cleanSurname,
      username: cleanUsername,
      fullName: `${cleanName} ${cleanSurname}`,
      phone: phone || '05555555555',
      password: password,
      role: role,
      permissions: role === 'YÖNETİCİ' || role === 'ADMIN'
        ? {
            'bölüm ve doktor yönetimi': true,
            'bölüm ve doktor düzeltme yetkisi': true,
            'bölüm ve doktor silme yetkisi': true,
            'çalışma durumu değiştirme': true,
            'kullanıcı ekleme ve yetkilendirme': true,
            'kullanıcı düzenleme yetkisi': true,
            'kullanıcı silme yetkisi': true,
            'sorun bildirme yönetimi': true,
          }
        : DEFAULT_PERMISSIONS,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'users'), newUserObj);
      
      setName('');
      setSurname('');
      setUsername('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setIsAddModalOpen(false);

      setToastMessage('Kullanıcı başarıyla kaydedildi!');
      setTimeout(() => {
        setToastMessage('');
      }, 3500);

    } catch (error) {
      alert(`Hata: ${error.message}`);
    }
  };

  const handleRowClick = (userId) => {
    if (!userId) {
      alert('Kullanıcı ID bilgisi bulunamadı!');
      return;
    }
    router.push(`/admin/users/${userId}`);
  };

  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-[#020617] text-slate-100 flex items-center justify-center font-black cursor-default">
        <div className="flex items-center gap-2 text-amber-500">
          <span className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
          <span>Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!canAccessUsersPage) {
    return null;
  }

  return (
    <div className={`fixed inset-0 h-dvh w-dvw max-h-dvh max-w-dvw overflow-hidden select-none transition-colors duration-300 font-sans cursor-default flex flex-col ${
      isDarkMode ? 'bg-[#020617] text-slate-100' : 'bg-[#edf4ff] text-slate-900'
    }`}>
      
      {/* 🏙️ خلفية هندسية ثلاثية الأبعاد */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[120vw] h-[60vh] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${
          isDarkMode 
            ? 'bg-gradient-to-b from-slate-800/20 via-slate-900/10 to-transparent' 
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

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-bounce transition-all duration-500">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-black text-xs uppercase flex items-center gap-3 border-2 border-emerald-400">
            <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 🚀 Header Controls (الشريط العلوي الملتصق) */}
      <div className={`relative z-20 w-full px-4 py-2 border-b flex flex-col sm:flex-row justify-between items-center gap-2 shrink-0 transition-colors ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 backdrop-blur-md' : 'bg-white/90 border-slate-200 text-slate-900 backdrop-blur-md'
      }`}>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase transition-all shadow-sm cursor-default flex items-center gap-1.5"
          >
            <ModernIcons.UserPlus />
            <span>Yeni Kullanıcı Ekle</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-85 relative">
          <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <ModernIcons.Search />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Kullanıcı adı, telefon veya numara ile ara..."
            className={`w-full pl-10 pr-3 py-1.5 rounded-xl border text-xs font-bold outline-none transition-colors focus:bg-[#ffff00] focus:text-slate-950 focus:border-[#ffff00] ${
              isDarkMode 
                ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-400' 
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
            }`}
          />
        </div>
      </div>

      {/* 📊 Excel Grid Table Container */}
      <div className="relative z-10 flex-1 min-h-0 w-full overflow-hidden p-0 m-0 pb-11 cursor-default">
        <div className="w-full h-full border-0 overflow-hidden flex flex-col cursor-default">
          
          <div className="overflow-x-auto overflow-y-auto flex-1 scrollbar-thin overscroll-contain w-full select-none cursor-default">
            <table className={`w-full text-left border-collapse border table-fixed cursor-default ${
              isDarkMode ? 'border-slate-800' : 'border-slate-300'
            }`}>
              <thead>
                <tr className={`border-b text-xs uppercase tracking-wider font-black sticky top-0 z-20 cursor-default ${
                  isDarkMode ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-300 bg-slate-200 text-slate-900'
                }`}>
                  
                  {/* Kullanıcı Numarası */}
                  <th style={{ width: `${columnWidths.userNumber}px` }} className={`relative py-3 px-4 border-r border-b cursor-default ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                    <span>Kullanıcı Numarası</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'userNumber')}
                      onDoubleClick={(e) => handleDoubleClickAutoFit(e, 'userNumber')}
                      title="Sürükle veya çift tıkla (Otomatik Sığdır)"
                      className="absolute right-0 top-0 bottom-0 w-2 hover:bg-cyan-500/80 cursor-col-resize z-30 transition-colors"
                    />
                  </th>

                  {/* Kullanıcı Adı */}
                  <th style={{ width: `${columnWidths.username}px` }} className={`relative py-3 px-4 border-r border-b cursor-default ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                    <span>Kullanıcı Adı</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'username')}
                      onDoubleClick={(e) => handleDoubleClickAutoFit(e, 'username')}
                      title="Sürükle veya çift tıkla (Otomatik Sığdır)"
                      className="absolute right-0 top-0 bottom-0 w-2 hover:bg-cyan-500/80 cursor-col-resize z-30 transition-colors"
                    />
                  </th>

                  {/* Rol */}
                  <th style={{ width: `${columnWidths.role}px` }} className={`relative py-3 px-4 border-r border-b cursor-default ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                    <span>Rol</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'role')}
                      onDoubleClick={(e) => handleDoubleClickAutoFit(e, 'role')}
                      title="Sürükle veya çift tıkla (Otomatik Sığdır)"
                      className="absolute right-0 top-0 bottom-0 w-2 hover:bg-cyan-500/80 cursor-col-resize z-30 transition-colors"
                    />
                  </th>

                  {/* Telefon */}
                  <th style={{ width: `${columnWidths.phone}px` }} className={`relative py-3 px-4 border-r border-b cursor-default ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                    <span>Telefon</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'phone')}
                      onDoubleClick={(e) => handleDoubleClickAutoFit(e, 'phone')}
                      title="Sürükle veya çift tıkla (Otomatik Sığdır)"
                      className="absolute right-0 top-0 bottom-0 w-2 hover:bg-cyan-500/80 cursor-col-resize z-30 transition-colors"
                    />
                  </th>

                  {/* Son Giriş */}
                  <th style={{ width: `${columnWidths.lastLogin}px` }} className={`relative py-3 px-4 border-r border-b cursor-default ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                    <span>Son Giriş</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'lastLogin')}
                      onDoubleClick={(e) => handleDoubleClickAutoFit(e, 'lastLogin')}
                      title="Sürükle veya çift tıkla (Otomatik Sığdır)"
                      className="absolute right-0 top-0 bottom-0 w-2 hover:bg-cyan-500/80 cursor-col-resize z-30 transition-colors"
                    />
                  </th>

                  {/* Son Çıkış */}
                  <th style={{ width: `${columnWidths.lastLogout}px` }} className={`relative py-3 px-4 border-r border-b cursor-default ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                    <span>Son Çıkış</span>
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, 'lastLogout')}
                      onDoubleClick={(e) => handleDoubleClickAutoFit(e, 'lastLogout')}
                      title="Sürükle veya çift tıkla (Otomatik Sığdır)"
                      className="absolute right-0 top-0 bottom-0 w-2 hover:bg-cyan-500/80 cursor-col-resize z-30 transition-colors"
                    />
                  </th>

                  {/* Durum */}
                  <th style={{ width: `${columnWidths.status}px` }} className={`relative py-3 px-4 text-center border-b cursor-default ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                    <span>Durum</span>
                  </th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold cursor-default">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u, idx) => {
                    const loginTime = u.lastLogin ? new Date(u.lastLogin).getTime() : 0;
                    const logoutTime = u.lastLogout ? new Date(u.lastLogout).getTime() : 0;
                    const isOnline = Boolean(loginTime && loginTime > logoutTime);

                    return (
                      <tr 
                        key={u.id || idx} 
                        onDoubleClick={() => handleRowClick(u.id)}
                        title="Detaylar ve işlemler için çift tıklayın"
                        className={`transition-all duration-150 border-b cursor-default ${
                          isDarkMode 
                            ? 'bg-[#090d16] border-slate-800/90 text-slate-100 hover:bg-slate-800 hover:text-cyan-300' 
                            : 'bg-white border-slate-300 text-slate-900 hover:bg-blue-100 hover:text-blue-950'
                        }`}
                      >
                        <td className={`py-2.5 px-4 font-mono text-xs font-black truncate border-r cursor-default ${isDarkMode ? 'border-slate-800 text-amber-400' : 'border-slate-300 text-amber-600'}`}>
                          {u.userNumber || '1000'}
                        </td>

                        <td className={`py-2.5 px-4 truncate border-r cursor-default ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                          <span className="font-black text-xs block truncate cursor-default">
                            {u.username}
                          </span>
                        </td>

                        <td className={`py-2.5 px-4 truncate border-r cursor-default ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider border inline-block cursor-default ${
                            u.role === 'YÖNETİCİ' || u.username === 'ADMIN'
                              ? isDarkMode ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-rose-100 text-rose-800 border-rose-300'
                              : isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}>
                            {u.role || 'KULLANICI'}
                          </span>
                        </td>

                        <td className={`py-2.5 px-4 font-mono text-xs font-black truncate border-r cursor-default ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                          {u.phone || '—'}
                        </td>

                        <td className={`py-2.5 px-4 font-mono text-xs font-black truncate border-r cursor-default ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                          {formatDate(u.lastLogin)}
                        </td>

                        <td className={`py-2.5 px-4 font-mono text-xs font-black truncate border-r cursor-default ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                          {formatDate(u.lastLogout)}
                        </td>

                        <td className="py-2.5 px-4 text-center cursor-default">
                          <div className="flex items-center justify-center gap-1.5 cursor-default">
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border cursor-default ${
                              isOnline
                                ? isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : isDarkMode ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}>
                              {isOnline ? 'Aktif' : 'Pasif'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className={`py-12 text-center font-black uppercase text-xs border-b cursor-default ${
                      isDarkMode ? 'bg-[#090d16] text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-300'
                    }`}>
                      Kullanıcı bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className={`max-w-xl w-full rounded-2xl border p-6 space-y-4 shadow-2xl ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className={`flex justify-between items-center pb-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className="text-base font-black text-amber-500 uppercase tracking-wide">Yeni Kullanıcı Ekle</h3>
              <button onClick={() => setIsAddModalOpen(false)} className={`p-1.5 rounded-lg cursor-default ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-black'}`}>
                <ModernIcons.Close />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5 font-bold text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block mb-1.5 uppercase text-xs font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>İsim</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="İsim giriniz..."
                    className={`w-full px-3.5 py-2.5 border rounded-xl outline-none font-bold transition-colors focus:bg-[#ffff00] focus:text-slate-950 focus:border-[#ffff00] ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block mb-1.5 uppercase text-xs font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>Soyadı</label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value.toLocaleUpperCase('tr-TR'))}
                    placeholder="Soyadı giriniz..."
                    className={`w-full px-3.5 py-2.5 border rounded-xl outline-none font-bold transition-colors focus:bg-[#ffff00] focus:text-slate-950 focus:border-[#ffff00] ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block mb-1.5 uppercase text-xs font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>Kullanıcı Adı</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Kullanıcı adı giriniz..."
                    className={`w-full px-3.5 py-2.5 border rounded-xl outline-none font-bold transition-colors focus:bg-[#ffff00] focus:text-slate-950 focus:border-[#ffff00] ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block mb-1.5 uppercase text-xs font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>Telefon</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    className={`w-full px-3.5 py-2.5 border rounded-xl outline-none font-bold transition-colors focus:bg-[#ffff00] focus:text-[#000] focus:border-[#ffff00] ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block mb-1.5 uppercase text-xs font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>Şifre</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-3.5 py-2.5 border rounded-xl outline-none font-bold transition-colors focus:bg-[#ffff00] focus:text-slate-950 focus:border-[#ffff00] ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block mb-1.5 uppercase text-xs font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>Şifre Tekrarı</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-3.5 py-2.5 border rounded-xl outline-none font-bold transition-colors focus:bg-[#ffff00] focus:text-slate-950 focus:border-[#ffff00] ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block mb-1.5 uppercase text-xs font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>Rol</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-xl outline-none font-bold transition-colors focus:bg-[#ffff00] focus:text-slate-950 focus:border-[#ffff00] ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="KULLANICI">KULLANICI</option>
                  <option value="YÖNETİCİ">YÖNETİCİ</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`flex-1 py-3 font-black rounded-xl uppercase text-xs cursor-default ${
                    isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                  }`}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl uppercase text-xs shadow-md cursor-default"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}