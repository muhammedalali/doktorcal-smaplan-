'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
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
  canEditDoctors: false,
  canDeleteDoctors: false,
  canEditSchedule: false,
  canDeleteSchedule: false,
  canChangeStatus: false,
  canManageIssues: false,
  canViewReports: false,
};

export default function AdminUsersPage() {
  const themeContext = useTheme();
  const isDarkMode = themeContext?.isDarkMode ?? true;

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('KULLANICI');

  const router = useRouter();

  // تجميد تمرير الصفحة خلف النافذة المنبثقة عند فتحها
  useEffect(() => {
    if (isAddModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAddModalOpen]);

  useEffect(() => {
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const currentUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : {});
    const nameStr = currentUser.username ? currentUser.username.toLocaleUpperCase('tr-TR') : '';

    if (nameStr !== 'ADMIN' && currentUser.role !== 'YÖNETİCİ' && nameStr !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setUsers(usersData);
    });

    return () => unsubscribeUsers();
  }, [router]);

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
    const cleanUsername = username.trim();
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
      permissions: DEFAULT_PERMISSIONS,
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

  return (
    <div className={`min-h-screen select-none transition-colors duration-300 font-sans ${
      isDarkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-[#f1f5f9] text-slate-900'
    }`}>
      
      {/* Toast Bildirimi */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-bounce transition-all duration-500">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-black text-xs uppercase flex items-center gap-3 border-2 border-emerald-400">
            <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`sticky top-0 z-40 w-full px-4 py-1.5 border-b flex flex-col sm:flex-row justify-between items-center gap-2 shadow-sm transition-colors ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
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
            placeholder="İsim, telefon veya kullanıcı numarası ile ara..."
            className={`w-full pl-10 pr-3 py-1.5 rounded-xl border text-xs font-bold outline-none transition-colors focus:bg-[#ffff00] focus:text-slate-950 focus:border-[#ffff00] ${
              isDarkMode 
                ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-400' 
                : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500'
            }`}
          />
        </div>
      </div>

      {/* Table - مع التعديل ليكون KULLANICI ADI, SOYADI وإظهار تاريخ الخروج الحقيقي */}
      <div className="w-full space-y-0 mt-0">
        <div className={`w-full border-b overflow-hidden shadow-none ${
          isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <div className="overflow-x-auto w-full">
            <table className={`w-full text-left border-collapse table-fixed ${
              isDarkMode ? 'border-slate-800' : 'border-slate-300'
            }`}>
              <thead>
                <tr className={`border-b text-xs uppercase tracking-wider font-black ${
                  isDarkMode ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-300 bg-slate-100 text-slate-900'
                }`}>
                  <th className={`py-2.5 px-3 pl-4 w-[12%] border-r ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>Kullanıcı Numarası</th>
                  <th className={`py-2.5 px-3 w-[24%] border-r ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>KULLANICI ADI, SOYADI</th>
                  <th className={`py-2.5 px-3 w-[10%] border-r ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>Rol</th>
                  <th className={`py-2.5 px-3 w-[14%] border-r ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>Telefon</th>
                  <th className={`py-2.5 px-3 w-[15%] border-r ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>Son Giriş</th>
                  <th className={`py-2.5 px-3 w-[15%] border-r ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>Son Çıkış</th>
                  <th className="py-2.5 px-3 w-[10%] text-center">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs font-bold">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u, idx) => {
                    const isOnline = u.lastLogin && (!u.lastLogout || new Date(u.lastLogin) > new Date(u.lastLogout));

                    return (
                      <tr 
                        key={u.id || idx} 
                        onDoubleClick={() => router.push(`/admin/users/${u.id}`)}
                        title="Detaylar ve işlemler için çift tıklayın"
                        className={`cursor-default transition-colors ${
                          isDarkMode ? 'hover:bg-slate-800/50 border-slate-800' : 'hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        {/* Kullanıcı Numarası */}
                        <td className={`py-2 px-3 pl-4 font-mono text-xs font-black truncate border-r ${isDarkMode ? 'border-slate-800 text-amber-400' : 'border-slate-200 text-amber-600'}`}>
                          {u.userNumber || '1000'}
                        </td>

                        {/* KULLANICI ADI, SOYADI */}
                        <td className={`py-2 px-3 truncate border-r ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                          <span className={`font-black text-xs block truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                            {u.name || u.username} {u.surname || ''}
                          </span>
                        </td>

                        {/* Rol */}
                        <td className={`py-2 px-3 truncate border-r ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider border inline-block ${
                            u.role === 'YÖNETİCİ' || u.username === 'ADMIN'
                              ? isDarkMode ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-rose-100 text-rose-800 border-rose-300'
                              : isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}>
                            {u.role || 'KULLANICI'}
                          </span>
                        </td>

                        {/* Telefon */}
                        <td className={`py-2 px-3 font-mono text-xs font-black truncate border-r ${isDarkMode ? 'border-slate-800 text-slate-100' : 'border-slate-200 text-slate-900'}`}>
                          {u.phone || '—'}
                        </td>

                        {/* Son Giriş */}
                        <td className={`py-2 px-3 font-mono text-xs font-black truncate border-r ${isDarkMode ? 'border-slate-800 text-slate-100' : 'border-slate-200 text-slate-900'}`}>
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleString('tr-TR') : 'Kayıt yok'}
                        </td>

                        {/* Son Çıkış (عرض الخروج الحقيقي بدقة) */}
                        <td className={`py-2 px-3 font-mono text-xs font-black truncate border-r ${isDarkMode ? 'border-slate-800 text-slate-100' : 'border-slate-200 text-slate-900'}`}>
                          {u.lastLogout ? new Date(u.lastLogout).toLocaleString('tr-TR') : 'Kayıt yok'}
                        </td>

                        {/* Durum */}
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
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
                    <td colSpan="7" className={`py-8 text-center font-black uppercase text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Kullanıcı bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Ekleme */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className={`max-w-xl w-full rounded-2xl border p-6 space-y-4 shadow-2xl ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className={`flex justify-between items-center pb-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className="text-base font-black text-amber-500 uppercase tracking-wide">Yeni Kullanıcı Ekle</h3>
              <button onClick={() => setIsAddModalOpen(false)} className={`p-1.5 rounded-lg cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-black'}`}>
                <ModernIcons.Close />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5 font-bold text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block mb-1.5 uppercase text-xs font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                    İsim
                  </label>
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
                  <label className={`block mb-1.5 uppercase text-xs font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                    Soyadı
                  </label>
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
                  <label className={`block mb-1.5 uppercase text-xs font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                    Kullanıcı Adı
                  </label>
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
                  <label className={`block mb-1.5 uppercase text-xs font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                    Telefon
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    className={`w-full px-3.5 py-2.5 border rounded-xl outline-none font-bold transition-colors focus:bg-[#ffff00] focus:text-slate-950 focus:border-[#ffff00] ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block mb-1.5 uppercase text-xs font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                    Şifre
                  </label>
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
                  <label className={`block mb-1.5 uppercase text-xs font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                    Şifre Tekrarı
                  </label>
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
                <label className={`block mb-1.5 uppercase text-xs font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                  Rol
                </label>
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
                  className={`flex-1 py-3 font-black rounded-xl uppercase text-xs cursor-pointer ${
                    isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                  }`}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl uppercase text-xs shadow-md cursor-pointer"
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