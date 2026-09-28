'use client'; 

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'; 
import { useRouter } from 'next/navigation'; 
import { useTheme } from '@/context/ThemeContext'; 
import { useData } from '@/context/DataContext';
import { db } from '@/lib/firebase';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';

const TURKEY_OFFICIAL_HOLIDAYS_2026 = {   
  '2026-01-01': 'Yılbaşı',
  '2026-03-20': 'Ramazan Bayramı Arifesi',
  '2026-03-21': 'Ramazan Bayramı 1. Gün',
  '2026-03-22': 'Ramazan Bayramı 2. Gün',
  '2026-03-23': 'Ramazan Bayramı 3. Gün',
  '2026-04-23': 'Ulusal Egemenlik ve Çocuk Bayramı',
  '2026-05-01': 'Emek ve Dayanışma Günü',
  '2026-05-19': 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı',
  '2026-05-26': 'Kurban Bayramı Arifesi',
  '2026-05-27': 'Kurban Bayramı 1. Gün',
  '2026-05-28': 'Kurban Bayramı 2. Gün',
  '2026-05-29': 'Kurban Bayramı 3. Gün',
  '2026-05-30': 'Kurban Bayramı 4. Gün',
  '2026-07-15': 'Demokrasi ve Milli Birlik Günü',
  '2026-08-30': 'Zafer Bayramı',
  '2026-10-29': 'Cumhuriyet Bayramı' 
};

const generateFullMonthSchedule = (year = 2026, month = 8) => {
  const days = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNames = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ'];

  for (let i = 1; i <= daysInMonth; i++) {
    const dayNum = String(i).padStart(2, '0');
    const monthNum = String(month + 1).padStart(2, '0');
    const isoDateStr = `${year}-${monthNum}-${dayNum}`;
    const dateObj = new Date(year, month, i);
    const dayIndex = dateObj.getDay();
    const dayName = dayNames[dayIndex];
    const isWeekend = dayIndex === 0 || dayIndex === 6;
    const holidayName = TURKEY_OFFICIAL_HOLIDAYS_2026[isoDateStr];

    let initialStatus = 'POLİKLİNİK';
    if (holidayName) {
      initialStatus = 'RESMİ TATİL';
    } else if (isWeekend) {
      initialStatus = 'HAFTA SONU';
    }

    days.push({
      dayNumber: i,
      fullDateObj: dateObj.toISOString(),
      date: `${dayNum}.${monthNum}.${year}`,
      day: dayName,
      status: initialStatus,
      holidayName: holidayName || null
    });
  }
  return days;
};

const parseItemDate = (item) => {
  if (!item) return null;
  if (typeof item.date === 'string' && item.date.includes('.')) {
    const parts = item.date.split('.');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
  }
  if (item.fullDateObj) {
    const d = new Date(item.fullDateObj);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
};

const getStatusStyles = (status, isPast = false) => {
  const textStyle = 'text-white font-black tracking-wide';

  if (isPast) {
    return `bg-slate-600 ${textStyle}`;
  }

  const colorMap = {
    'POLİKLİNİK': `bg-emerald-600 ${textStyle}`, 
    'POLİK': `bg-emerald-600 ${textStyle}`,
    'AMELİYATTA': `bg-purple-600 ${textStyle}`, 
    'RESMİ TATİL': `bg-indigo-600 ${textStyle}`, 
    'HAFTA SONU': `bg-red-600 ${textStyle}`, 
    'YILLIK İZİN': `bg-sky-500 ${textStyle}`, 
    'RAPORLU': `bg-amber-600 ${textStyle}`, 
    'NÖBET SONRASI İZİN': `bg-teal-600 ${textStyle}`, 
    'ASKERLİK': `bg-stone-700 ${textStyle}`, 
    'ŞUA İZNİ': `bg-cyan-600 ${textStyle}`,
    'KONGRE/SEMİNER': `bg-blue-600 ${textStyle}`
  };

  return colorMap[status] || `bg-slate-700 ${textStyle}`;
};

const getDateTextColor = (status, dayName, isPast, isDarkMode) => {
  if (isPast) {
    return isDarkMode ? 'text-slate-400 font-extrabold' : 'text-slate-600 font-extrabold';
  }

  if (dayName === 'CUMARTESİ' || dayName === 'PAZAR' || status === 'HAFTA SONU') {
    return 'text-red-500 dark:text-red-400 font-black';
  }

  const textColors = {
    'POLİKLİNİK': 'text-emerald-500 dark:text-emerald-400 font-black',
    'POLİK': 'text-emerald-500 dark:text-emerald-400 font-black',
    'AMELİYATTA': 'text-purple-500 dark:text-purple-300 font-black',
    'RESMİ TATİL': 'text-indigo-500 dark:text-indigo-400 font-black',
    'HAFTA SONU': 'text-red-500 dark:text-red-400 font-black',
    'YILLIK İZİN': 'text-sky-500 dark:text-sky-400 font-black',
    'RAPORLU': 'text-amber-500 dark:text-amber-400 font-black',
    'NÖBET SONRASI İZİN': 'text-teal-500 dark:text-teal-400 font-black',
    'ASKERLİK': 'text-stone-400 dark:text-stone-300 font-black',
    'ŞUA İZNİ': 'text-cyan-500 dark:text-cyan-400 font-black',
    'KONGRE/SEMİNER': 'text-blue-500 dark:text-blue-400 font-black'
  };

  return textColors[status] || (isDarkMode ? 'text-slate-100 font-black' : 'text-slate-950 font-black');
};

export default function AdminScheduleTable({ onEditDoctor, onDeleteDoctor }) {   
  const { doctors: rawDoctors, checkPermission } = useData(); 

  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState('HEPSİ');   
  const [searchTerm, setSearchTerm] = useState('');   
  const [sortBy, setSortBy] = useState('NEWEST');   
  const [doctors, setDoctors] = useState([]);   
  const [selectedDoctorDetail, setSelectedDoctorDetail] = useState(null);   
  const [isMaximized, setIsMaximized] = useState(false);   
  const [isMinimized, setIsMinimized] = useState(false);   
  const [showPrintModal, setShowPrintModal] = useState(false);   
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // حالات نافذة التعديل المباشر
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editName, setEditName] = useState('');
  const [editClinic, setEditClinic] = useState('');
  const [editRoomNo, setEditRoomNo] = useState('');
  const [editStatus, setEditStatus] = useState('POLİKLİNİK');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [showScrollToTodayTop, setShowScrollToTodayTop] = useState(false);
  const [showScrollToTodayBottom, setShowScrollToTodayBottom] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportCategory, setReportCategory] = useState('SİSTEM_HATASI');
  const [reportSuccessMsg, setReportSuccessMsg] = useState(false);

  const todayRef = useRef(null);   
  const modalBoxRef = useRef(null);
  const modalScrollContainerRef = useRef(null); // 👈 تم إضافة const هنا لتفادي خطأ ReferenceError
  const searchInputRef = useRef(null);
  
  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const menuDropdownRef = useRef(null);

  const {      
    isDarkMode,      
    toggleTheme,
    setShowTableSettingsModal,
    selectedFont = 'font-sans',      
    zoomScale = 100,      
    activeColor = 'text-slate-900 dark:text-slate-100',
    tableSettings = { 
      showClinic: true, 
      showDoctorName: true, 
      showStatus: true, 
      borderStyle: 'horizontal', 
      rowPadding: 'normal', 
      fontWeight: 'font-bold'
    }
  } = useTheme();   
  const router = useRouter();   

  const today = useRef(new Date());
  today.current.setHours(0, 0, 0, 0);
  const todayFormattedStr = `${String(today.current.getDate()).padStart(2, '0')}.${String(today.current.getMonth() + 1).padStart(2, '0')}.${today.current.getFullYear()}`;

  useEffect(() => {
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const activeUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : null);
    if (activeUser) {
      setCurrentUser(activeUser);
    }
  }, []);

  const activeUser = currentUser || (typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || 'null') : null);

  // 🔒 الفحص الدقيق للصلاحيات المطلوبة
  const canEditDocs = checkPermission ? checkPermission('bölüm ve doktor düzeltme yetkisi') : true;
  const canDeleteDocs = checkPermission ? checkPermission('bölüm ve doktor silme yetkisi') : true;
  const canChangeStatus = checkPermission ? (checkPermission('bölüm ve doktor yönetimi') || checkPermission('çalışma durumu değiştirme')) : true;

  // 👁️ عمود الإجراءات يظهر فقط في حال وجود صلاحية الحذف أو صلاحية التعديل
  const showActionsColumn = canEditDocs || canDeleteDocs;

  const handleGoBack = () => {
    if (activeUser && activeUser.username) {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = (e) => {
    e.currentTarget.blur();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Fullscreen Error: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target)) {
        setShowMenuDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, { passive: true });
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {     
    const isModalActive = showPrintModal || (selectedDoctorDetail && !isMinimized) || showReportModal || editingDoctor;     
    document.body.style.overflow = isModalActive ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };   
  }, [showPrintModal, selectedDoctorDetail, isMinimized, showReportModal, editingDoctor]);   

  const scrollToTodayInstant = useCallback(() => {
    if (todayRef.current && modalScrollContainerRef.current) {
      const container = modalScrollContainerRef.current;
      const todayElement = todayRef.current;
      const targetScrollTop = todayElement.offsetTop - (container.clientHeight / 2) + (todayElement.clientHeight / 2);
      container.scrollTop = Math.max(0, targetScrollTop);
    }
  }, []);

  const scrollToTodaySmooth = useCallback(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  useEffect(() => {     
    if (selectedDoctorDetail && !isMinimized) {       
      requestAnimationFrame(() => {
        scrollToTodayInstant();
      });
    }   
  }, [selectedDoctorDetail, isMinimized, scrollToTodayInstant]);   

  const handleModalScroll = (e) => {
    const container = e.target;
    if (!todayRef.current) return;

    const todayTop = todayRef.current.offsetTop;
    const currentScrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    if (currentScrollTop + containerHeight < todayTop - 30) {
      setShowScrollToTodayBottom(true);
      setShowScrollToTodayTop(false);
    } 
    else if (currentScrollTop > todayTop + 120) {
      setShowScrollToTodayTop(true);
      setShowScrollToTodayBottom(false);
    } 
    else {
      setShowScrollToTodayTop(false);
      setShowScrollToTodayBottom(false);
    }
  };

  const getCurrentDayStatus = useCallback((doc) => {
    if (!doc.scheduleDays || doc.scheduleDays.length === 0) return doc.status || 'POLİKLİNİK';
    const todaySchedule = doc.scheduleDays.find(sd => sd.date === todayFormattedStr);
    if (todaySchedule) {
      return todaySchedule.status === 'POLİK' ? 'POLİKLİNİK' : todaySchedule.status;
    }
    const dayIndex = today.current.getDay();
    if (dayIndex === 0 || dayIndex === 6) return 'HAFTA SONU';
    return doc.status === 'POLİK' ? 'POLİKLİNİK' : doc.status;
  }, [todayFormattedStr]);

  useEffect(() => {     
    const savedSort = localStorage.getItem('app_table_sort');     
    if (savedSort) setSortBy(savedSort);   
  }, []);

  useEffect(() => {
    if (rawDoctors && rawDoctors.length > 0) {
      const normalizedDocs = rawDoctors.map(doc => {
        const updatedDays = doc.scheduleDays ? doc.scheduleDays.map(sd => {
          let dayObj = parseItemDate(sd);
          if (dayObj) {
            const dayIdx = dayObj.getDay();
            if ((dayIdx === 0 || dayIdx === 6) && (sd.status === 'POLİK' || sd.status === 'POLİKLİNİK')) {
              return { ...sd, status: 'HAFTA SONU' };
            }
          }
          return { ...sd, status: sd.status === 'POLİK' ? 'POLİKLİNİK' : sd.status };
        }) : generateFullMonthSchedule(2026, 8);

        return {
          ...doc,
          status: doc.status === 'POLİK' ? 'POLİKLİNİK' : doc.status,
          scheduleDays: updatedDays
        };
      });
      setDoctors(normalizedDocs);
    } else {
      setDoctors([]);
    }
  }, [rawDoctors]);

  const availableClinics = useMemo(() => {
    const setClinics = new Set(doctors.map(d => d.clinic).filter(Boolean));
    return Array.from(setClinics).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [doctors]);

  const handleOpenDoctorDetail = (doc) => {     
    setSelectedDoctorDetail(doc);     
    setIsMinimized(false);     
    setIsMaximized(false);     
  };   

  // فتح نافذة التعديل المباشر
  const handleStartDirectEdit = (docItem) => {
    if (!canEditDocs) {
      alert('Bölüm ve doktor düzeltme yetkiniz bulunmamaktadır!');
      return;
    }
    setEditingDoctor(docItem);
    setEditName(docItem.name || '');
    setEditClinic(docItem.clinic || '');
    setEditRoomNo(docItem.roomNo || docItem.room || '');
    setEditStatus(getCurrentDayStatus(docItem));
  };

  // حفظ التعديل المباشر في Firebase
  const handleSaveDirectEdit = async (e) => {
    e.preventDefault();
    if (!canEditDocs) {
      alert('Bölüm ve doktor düzeltme yetkiniz bulunmamaktadır!');
      setEditingDoctor(null);
      return;
    }

    if (!editingDoctor || !editName.trim() || !editClinic.trim()) return;

    setIsSavingEdit(true);
    try {
      let updatedDays = editingDoctor.scheduleDays ? [...editingDoctor.scheduleDays] : [];
      
      const todayIndex = updatedDays.findIndex(sd => sd.date === todayFormattedStr);
      if (todayIndex !== -1) {
        updatedDays[todayIndex] = {
          ...updatedDays[todayIndex],
          status: editStatus
        };
      }

      const docRef = doc(db, 'doctors', editingDoctor.id);
      await updateDoc(docRef, {
        name: editName.trim(),
        clinic: editClinic.trim(),
        roomNo: editRoomNo.trim(),
        status: editStatus,
        scheduleDays: updatedDays
      });

      setDoctors(prev => prev.map(d => d.id === editingDoctor.id ? {
        ...d,
        name: editName.trim(),
        clinic: editClinic.trim(),
        roomNo: editRoomNo.trim(),
        status: editStatus,
        scheduleDays: updatedDays
      } : d));

      if (selectedDoctorDetail && selectedDoctorDetail.id === editingDoctor.id) {
        setSelectedDoctorDetail({
          ...selectedDoctorDetail,
          name: editName.trim(),
          clinic: editClinic.trim(),
          roomNo: editRoomNo.trim(),
          status: editStatus,
          scheduleDays: updatedDays
        });
      }

      setEditingDoctor(null);
    } catch (err) {
      console.error('Güncelleme sırasında hata:', err);
      alert('Güncelleme yapılırken bir hata oluştu.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleSortChange = (newSort) => {     
    setSortBy(newSort);     
    localStorage.setItem('app_table_sort', newSort);   
  };   

  const filteredAndSortedDoctors = useMemo(() => {
    return doctors     
      .filter((doc) => {       
        const currentStatus = getCurrentDayStatus(doc);
        const matchesFilter = filter === 'HEPSİ' || currentStatus === filter || (filter === 'POLİKLİNİK' && (currentStatus === 'POLİKLİNİK' || currentStatus === 'POLİK'));       
        const matchesSearch = doc.name.toUpperCase().includes(searchTerm.toUpperCase()) || doc.clinic.toUpperCase().includes(searchTerm.toUpperCase());       
        return matchesFilter && matchesSearch;     
      })     
      .sort((a, b) => {       
        if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name, 'tr');       
        if (sortBy === 'NAME_DESC') return b.name.localeCompare(a.name, 'tr');       
        if (sortBy === 'CLINIC_ASC') return a.clinic.localeCompare(b.clinic, 'tr');       
        if (sortBy === 'NEWEST') return (b.createdAt || b.id) - (a.createdAt || a.id);       
        if (sortBy === 'OLDEST') return (a.createdAt || a.id) - (b.createdAt || b.id);       
        return 0;     
      });
  }, [doctors, filter, searchTerm, sortBy, getCurrentDayStatus]);

  const handleSendReport = async (e) => {
    e.preventDefault();
    if (!reportText.trim()) return;

    try {
      await addDoc(collection(db, 'system_issues'), {
        category: reportCategory,
        description: reportText.trim(),
        createdAt: new Date().toISOString(),
        username: activeUser?.username || 'MİSAFİR (ZİYARETÇİ)'
      });
      setReportSuccessMsg(true);

      setTimeout(() => {
        setShowReportModal(false);
        setReportText('');
        setReportSuccessMsg(false);
      }, 2000);
    } catch (e) {
      console.error('Bildirim gönderilirken hata oluştu:', e);
    }
  };

  const exportToExcel = () => {     
    let tableCSV = 'NO;BİRİM;DOKTOR ADI SOYADI;DURUM\n';     
    filteredAndSortedDoctors.forEach((doc, idx) => {       
      const currentStatus = getCurrentDayStatus(doc);
      tableCSV += `"${idx + 1}";"${doc.clinic}";"${doc.name}";"${currentStatus}"\n`;     
    });     
    const blob = new Blob(['\uFEFF' + tableCSV], { type: 'text/csv;charset=utf-8;' });     
    const url = URL.createObjectURL(blob);     
    const a = document.createElement('a');     
    a.href = url;     
    a.download = `Doktor_Calisma_Listesi_${todayFormattedStr.replace(/\./g, '_')}.csv`;     
    a.click();   
  };

  const getRowPaddingClass = () => {
    if (tableSettings.rowPadding === 'compact') return 'py-2 px-3 sm:px-4';
    if (tableSettings.rowPadding === 'spacious') return 'py-3.5 px-5 sm:px-6';
    return 'py-2.5 px-4 sm:px-5';
  };

  const statusFilterList = [
    { label: 'HEPSİ', key: 'HEPSİ' },
    { label: 'POLİKLİNİK', key: 'POLİKLİNİK' },
    { label: 'AMELİYATTA', key: 'AMELİYATTA' },
    { label: 'YILLIK İZİN', key: 'YILLIK İZİN' },
    { label: 'RAPORLU', key: 'RAPORLU' },
    { label: 'NÖBET SONRASI İZİN', key: 'NÖBET SONRASI İZİN' },
  ];

  const sortOptionsList = [
    { label: 'En Yeni Eklenenler', key: 'NEWEST' },
    { label: 'En Eski Eklenenler', key: 'OLDEST' },
    { label: 'Doktor Adına Göre (A-Z)', key: 'NAME_ASC' },
    { label: 'Doktor Adına Göre (Z-A)', key: 'NAME_DESC' },
    { label: 'Bölüme Göre (A-Z)', key: 'CLINIC_ASC' },
  ];

  const getSortLabel = (key) => {
    const found = sortOptionsList.find(item => item.key === key);
    return found ? found.label : 'Sıralama';
  };

  return (     
    <div dir="ltr" style={{ zoom: `${zoomScale}%` }} className={`min-h-screen relative pt-[48px] pb-0 p-0 w-full max-w-[100vw] overflow-x-hidden ${selectedFont} ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>              
      
      {/* 🖨️ PRINT STYLES */}
      <style jsx global>{`         
        @media print {           
          body * { visibility: hidden !important; }           
          #printableA4Area, #printableA4Area * { visibility: visible !important; }           
          #printableA4Area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; }           
        }       
      `}</style>

      {/* 🌟 FIXED HEADER */}
      <div className={`no-print fixed top-0 left-0 right-0 z-50 h-[48px] px-3 sm:px-6 shadow-md backdrop-blur-md transition-all flex items-center ${
        isDarkMode 
          ? 'bg-slate-950/95 border-b border-slate-800' 
          : 'bg-white/95 border-b border-slate-200'
      }`}>                      
        
        <div className="w-full flex flex-row items-center justify-between gap-2 sm:gap-4">                          
          
          {/* سهم العودة */}
          <div className="flex items-center shrink-0">
            <button
              onClick={handleGoBack}
              className={`p-1.5 rounded-full transition-all duration-150 transform hover:scale-110 active:scale-90 flex items-center justify-center ${
                isDarkMode 
                  ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10' 
                  : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
              title="Geri Dön"
            >
              <svg className="w-5 h-5 stroke-[2.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
          </div>

          {/* البحث المدمج */}
          <div className="relative flex-1 max-w-lg mx-1 sm:mx-2">               
            <div 
              onClick={() => searchInputRef.current?.focus()}
              className={`relative flex items-center w-full rounded-xl transition-all py-1 px-2.5 ${
                isDarkMode 
                  ? 'bg-slate-900 hover:bg-slate-900/80 focus-within:ring-1 focus-within:ring-emerald-500/50' 
                  : 'bg-slate-100 hover:bg-slate-100/80 focus-within:ring-1 focus-within:ring-emerald-500/50'
              }`}
            >
              <div className="pr-1.5 flex items-center pointer-events-none text-emerald-500">
                <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <input 
                ref={searchInputRef}                
                type="text"                 
                placeholder="Doktor veya Birim Ara..."                 
                value={searchTerm}                 
                onChange={(e) => setSearchTerm(e.target.value)}                 
                className="w-full pl-1 pr-6 py-0.5 bg-transparent text-xs sm:text-sm font-black outline-none tracking-wide placeholder-slate-400 cursor-text"
              />             

              {searchTerm && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm('');
                  }}
                  className="absolute right-2 p-1 text-slate-400 hover:text-rose-500 font-black text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* الأزرار العلوية */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* زر ملء الشاشة */}
            <button
              onClick={toggleFullscreen}
              className={`p-1.5 rounded-xl flex items-center justify-center transition-all duration-150 transform hover:scale-110 active:scale-95 outline-none ${
                isDarkMode 
                  ? 'text-sky-400 bg-sky-400/10 border border-sky-400/20 hover:bg-sky-400/20' 
                  : 'text-sky-600 bg-sky-50 border border-sky-100 hover:bg-sky-100'
              }`}
              title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
            >
              {isFullscreen ? (
                <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
                </svg>
              ) : (
                <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              )}
            </button>

            {/* الوضع الليلي */}
            <button
              onClick={(e) => {
                toggleTheme();
                e.currentTarget.blur();
              }}
              className={`p-1.5 rounded-xl flex items-center justify-center transition-all duration-150 transform hover:scale-110 active:scale-95 outline-none ${
                isDarkMode 
                  ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20 hover:bg-amber-400/20' 
                  : 'text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100'
              }`}
              title={isDarkMode ? 'Gündüz Moduna Geç' : 'Gece Moduna Geç'}
            >
              {isDarkMode ? (
                <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m8.966-8.966h-2.25m-13.5 0H3m15.364-6.364l-1.591 1.591M6.343 17.657l-1.592 1.592m12.728 0l-1.591-1.592M6.343 6.05L4.75 4.75M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>

            <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 rounded-full"></div>

            {/* DURUM */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={() => { setShowFilterDropdown(!showFilterDropdown); setShowSortDropdown(false); setShowMenuDropdown(false); }}
                className={`px-2 py-1 rounded-lg font-black text-xs cursor-pointer flex items-center gap-1 transition-all ${
                  isDarkMode ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20' : 'text-slate-800 bg-slate-200/70 hover:bg-slate-200'
                }`}
              >
                <span className="font-extrabold uppercase tracking-tight">{filter}</span>
                <svg className="w-3 h-3 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showFilterDropdown && (
                <div className={`absolute right-0 mt-2 w-52 rounded-2xl border p-2 shadow-2xl z-50 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}>
                  <div className="flex justify-between items-center pb-1.5 px-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-black text-amber-500 uppercase">DURUM SEÇİN</span>
                    <button onClick={() => setShowFilterDropdown(false)} className="w-4 h-4 rounded-full bg-slate-800/20 font-black text-[10px] flex items-center justify-center">✕</button>
                  </div>
                  <div className="space-y-1 mt-1.5 font-black">
                    {statusFilterList.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => {
                          setFilter(item.key);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full p-2 rounded-xl text-xs flex items-center justify-between ${
                          filter === item.key
                            ? 'bg-emerald-600 text-white font-black'
                            : isDarkMode
                            ? 'text-slate-300 hover:bg-slate-800'
                            : 'text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <span>{item.label}</span>
                        {filter === item.key && <span className="font-mono text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 rounded-full"></div>

            {/* SIRALAMA */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => { setShowSortDropdown(!showSortDropdown); setShowFilterDropdown(false); setShowMenuDropdown(false); }}
                className={`px-2 py-1 rounded-lg font-black text-xs cursor-pointer flex items-center gap-1 transition-all ${
                  isDarkMode ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20' : 'text-slate-800 bg-slate-200/70 hover:bg-slate-200'
                }`}
              >
                <span className="font-extrabold uppercase tracking-tight">{getSortLabel(sortBy)}</span>
                <svg className="w-3 h-3 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showSortDropdown && (
                <div className={`absolute right-0 mt-2 w-56 rounded-2xl border p-2 shadow-2xl z-50 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}>
                  <div className="flex justify-between items-center pb-1.5 px-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-black text-amber-500 uppercase">SIRALAMA SEÇENEKLERİ</span>
                    <button onClick={() => setShowSortDropdown(false)} className="w-4 h-4 rounded-full bg-slate-800/20 font-black text-[10px] flex items-center justify-center">✕</button>
                  </div>
                  <div className="space-y-1 mt-1.5 font-black">
                    {sortOptionsList.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => {
                          handleSortChange(item.key);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full p-2 rounded-xl text-xs flex items-center justify-between ${
                          sortBy === item.key
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : isDarkMode
                            ? 'text-slate-300 hover:bg-slate-800'
                            : 'text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <span>{item.label}</span>
                        {sortBy === item.key && <span className="font-mono text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 rounded-full"></div>

            {/* YAZDIR / İNDİR */}
            <div className="flex items-center">
              <button
                onClick={() => setShowPrintModal(true)}
                className={`p-1.5 rounded-xl flex items-center justify-center transition-all ${
                  isDarkMode ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20' : 'text-slate-800 bg-slate-200/70 hover:bg-slate-200'
                }`}
                title="İndir / Yazdır"
              >
                <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2" />
                </svg>
              </button>
            </div>

            {/* MENÜ */}
            <div className="relative" ref={menuDropdownRef}>
              <button
                onClick={() => {
                  setShowMenuDropdown(!showMenuDropdown);
                  setShowFilterDropdown(false);
                  setShowSortDropdown(false);
                }}
                className={`p-1.5 rounded-xl flex items-center justify-center transition-all duration-150 transform hover:scale-110 active:scale-95 ${
                  isDarkMode 
                    ? 'bg-slate-900 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h12m-12 5.25h16.5" />
                </svg>
              </button>

              {showMenuDropdown && (
                <div className={`absolute right-0 mt-2 w-52 rounded-2xl border-2 p-2 shadow-2xl z-50 font-black text-xs ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}>
                  <button
                    onClick={() => {
                      setShowMenuDropdown(false);
                      setShowReportModal(true);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center gap-2.5 ${
                      isDarkMode ? 'hover:bg-slate-800 text-rose-400' : 'hover:bg-rose-50 text-rose-600'
                    }`}
                  >
                    <span>Sorun Bildir</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMenuDropdown(false);
                      setShowTableSettingsModal && setShowTableSettingsModal(true);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center gap-2.5 ${
                      isDarkMode ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-amber-50 text-amber-600'
                    }`}
                  >
                    <span>Genel Ayarlar</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>         
      </div>         

      {/* 📊 TABLE CONTAINER */}         
      <div className="w-full space-y-4 px-0 cursor-default select-none mt-0">
        <div className={`w-full rounded-none overflow-hidden shadow-2xl border-x-0 border-t-0 border-b transition-all ${           
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'         
        }`}>           
          <div className="overflow-x-auto w-full relative">             
            <table className={`w-full text-left border-collapse ${selectedFont} ${tableSettings.fontWeight}`}>               
              
              <thead>                 
                <tr className={`text-xs sm:text-sm font-black uppercase select-none transition-colors ${                   
                  isDarkMode                      
                    ? 'bg-slate-950 text-amber-400 border-b border-slate-800'                      
                    : 'bg-slate-900 text-white border-b border-slate-800'                 
                }`}>                   
                  <th className={`${getRowPaddingClass()} border-r border-slate-700/60 font-black text-center w-12 sm:w-16 shrink-0`}></th>

                  {tableSettings.showClinic && (
                    <th className={`${getRowPaddingClass()} border-r border-slate-700/60 font-black tracking-wider text-xs sm:text-sm ${showActionsColumn ? 'w-1/4' : 'w-1/3'}`}>
                      BİRİM
                    </th>                   
                  )}

                  {tableSettings.showDoctorName && (
                    <th className={`${getRowPaddingClass()} border-r border-slate-700/60 font-black tracking-wider text-xs sm:text-sm ${showActionsColumn ? 'w-1/4' : 'w-1/3'}`}>
                      DOKTOR ADI SOYADI
                    </th>                   
                  )}

                  {tableSettings.showStatus && (
                    <th className={`${getRowPaddingClass()} ${showActionsColumn ? 'border-r border-slate-700/60' : ''} font-black text-center tracking-wider text-xs sm:text-sm ${showActionsColumn ? 'w-1/4' : 'w-1/3'}`}>
                      DURUM
                    </th>                   
                  )}

                  {/* يظهر هذا العمود فقط وفقط إذا وُجدت صلاحية التعديل أو صلاحية الحذف */}
                  {showActionsColumn && (
                    <th className={`${getRowPaddingClass()} font-black text-center tracking-wider text-xs sm:text-sm w-1/4`}>
                      İŞLEMLER
                    </th>
                  )}
                </tr>               
              </thead>               
              
              <tbody className={`text-xs sm:text-sm md:text-base ${activeColor} divide-y divide-slate-200 dark:divide-slate-800/80`}>                 
                {filteredAndSortedDoctors.length > 0 ? (                   
                  filteredAndSortedDoctors.map((docItem, index) => {
                    const activeStatusToday = getCurrentDayStatus(docItem);
                    return (                     
                      <tr                        
                        key={docItem.id}                        
                        onClick={() => handleOpenDoctorDetail(docItem)}
                        className={`transition-all duration-150 cursor-default ${                         
                          isDarkMode                            
                            ? index % 2 === 0                              
                              ? 'bg-slate-900 hover:bg-amber-500/15 hover:text-amber-300'                              
                              : 'bg-slate-950 hover:bg-amber-500/15 hover:text-amber-300'                           
                            : index % 2 === 0                              
                              ? 'bg-white hover:bg-emerald-100/80 hover:text-emerald-950'                              
                              : 'bg-slate-50/80 hover:bg-emerald-100/80 hover:text-emerald-950'                       
                        }`}                     
                      >                       
                        <td className={`${getRowPaddingClass()} border-r border-slate-200 dark:border-slate-800/80 font-black text-center text-inherit`}>
                          {index + 1}
                        </td>

                        {tableSettings.showClinic && (
                          <td className={`${getRowPaddingClass()} border-r border-slate-200 dark:border-slate-800/80 font-black`}>                         
                            <span className="break-words">{docItem.clinic}</span>                       
                          </td>                       
                        )}

                        {tableSettings.showDoctorName && (
                          <td className={`${getRowPaddingClass()} border-r border-slate-200 dark:border-slate-800/80 font-black`}>                         
                            <span className="break-words">{docItem.name}</span>                       
                          </td>                       
                        )}

                        {tableSettings.showStatus && (
                          <td className={`${getRowPaddingClass()} ${showActionsColumn ? 'border-r border-slate-200 dark:border-slate-800/80' : ''} text-center`}>                         
                            <div className="flex justify-center">
                              <span className={`inline-flex items-center justify-center min-w-[110px] sm:min-w-[140px] px-2.5 py-1.5 rounded-xl text-xs font-black shadow-xs ${getStatusStyles(activeStatusToday)}`}>                           
                                <span className="w-2 h-2 rounded-full bg-white mr-1.5 animate-pulse shrink-0"></span>                           
                                <span className="truncate">{activeStatusToday}</span>
                              </span>                       
                            </div>
                          </td>                       
                        )}

                        {/* إظهار الأزرار المحددة بحسب الصلاحيات الممنوحة */}
                        {showActionsColumn && (
                          <td className={`${getRowPaddingClass()} text-center`} onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                              {canEditDocs && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartDirectEdit(docItem);
                                  }}
                                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-black rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md transition-all cursor-pointer"
                                >
                                  DÜZENLE
                                </button>
                              )}

                              {canDeleteDocs && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onDeleteDoctor) {
                                      onDeleteDoctor(docItem.id);
                                    }
                                  }}
                                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-black rounded-xl bg-rose-600 text-white hover:bg-rose-500 shadow-md transition-all cursor-pointer"
                                >
                                  SİL
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>                   
                    );
                  })                 
                ) : (                   
                  <tr>                     
                    <td colSpan={showActionsColumn ? 5 : 4} className="p-12 text-center text-slate-400 font-black border-dashed text-base">                         
                      Arama kriterlerinize uygun doktor kaydı bulunamadı.                     
                    </td>                   
                  </tr>                 
                )}               
              </tbody>             
            </table>           
          </div>           
          <div className="p-3 pr-6 flex justify-end items-center border-t border-slate-200 dark:border-slate-800">             
            <span className="text-xs font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">               
              TOPLAM: {filteredAndSortedDoctors.length} DOKTOR             
            </span>           
          </div>         
        </div>       
      </div>       

      {/* MODAL: النافذة المعتمة لتعديل بيانات الطبيب (تفتح فقط لمن لديه صلاحية التعديل) */}
      {editingDoctor && canEditDocs && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-3 sm:p-4 transition-all">
          <div className={`w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border ${
            isDarkMode 
              ? 'bg-slate-900 border-amber-500/40 text-slate-100 shadow-amber-500/10' 
              : 'bg-white border-emerald-500/40 text-slate-900 shadow-emerald-500/10'
          }`}>
            
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-500 font-black text-xl">
                  ✏️
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight uppercase text-amber-500 dark:text-amber-400">
                    DOKTOR BİLGİLERİNİ DÜZENLE
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400">
                    Hızlı ve anlık güncelleme paneli
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEditingDoctor(null)} 
                className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-rose-500 font-black text-sm flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDirectEdit} className="space-y-4 font-black">
              <div>
                <label className="block text-xs font-extrabold text-slate-400 uppercase mb-1.5">
                  DOKTOR ADI SOYADI
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Örn: Dr. Ahmet Yılmaz"
                  className={`w-full p-3 rounded-2xl border-2 text-xs sm:text-sm font-black outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-400 uppercase mb-1.5">
                    BİRİM / POLİKLİNİK
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      list="clinic-suggestions"
                      value={editClinic}
                      onChange={(e) => setEditClinic(e.target.value)}
                      placeholder="Birim adı yazın veya seçin..."
                      className={`w-full p-3 rounded-2xl border-2 text-xs sm:text-sm font-black outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500'
                      }`}
                    />
                    <datalist id="clinic-suggestions">
                      {availableClinics.map((clinicName, idx) => (
                        <option key={idx} value={clinicName} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-400 uppercase mb-1.5">
                    ODA NO
                  </label>
                  <input
                    type="text"
                    value={editRoomNo}
                    onChange={(e) => setEditRoomNo(e.target.value)}
                    placeholder="Örn: 102"
                    className={`w-full p-3 rounded-2xl border-2 text-xs sm:text-sm font-black outline-none transition-all text-center ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-400 uppercase mb-1.5">
                  BUGÜNKÜ ÇALIŞMA DURUMU
                </label>
                <div className="relative">
                  <select
                    value={editStatus}
                    disabled={!canChangeStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className={`w-full p-3 rounded-2xl border-2 text-xs sm:text-sm font-black outline-none transition-all appearance-none cursor-pointer ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-emerald-400 focus:border-amber-500' 
                        : 'bg-slate-50 border-slate-200 text-emerald-700 focus:border-amber-500'
                    } ${!canChangeStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="POLİKLİNİK">🟢 POLİKLİNİK</option>
                    <option value="AMELİYATTA">🟣 AMELİYATTA</option>
                    <option value="YILLIK İZİN">🔵 YILLIK İZİN</option>
                    <option value="RAPORLU">🟡 RAPORLU</option>
                    <option value="NÖBET SONRASI İZİN">🟢 NÖBET SONRASI İZİN</option>
                    <option value="KONGRE/SEMİNER">🔵 KONGRE/SEMİNER</option>
                    <option value="HAFTA SONU">🔴 HAFTA SONU</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingDoctor(null)}
                  className="flex-1 py-3.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-black cursor-pointer hover:bg-slate-300 transition-all"
                >
                  İPTAL
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 py-3.5 bg-amber-500 text-slate-950 rounded-2xl text-xs font-black shadow-lg cursor-pointer hover:bg-amber-400 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSavingEdit ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                      <span>KAYDEDİLİYOR...</span>
                    </>
                  ) : (
                    <span>KAYDET 💾</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: Sorun Bildir */}
      {showReportModal && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/85 p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <h3 className="text-base font-black text-rose-500 uppercase">SORUN BİLDİR</h3>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 font-black text-lg">✕</button>
            </div>

            {reportSuccessMsg ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-xs rounded-2xl text-center">
                Bildiriminiz yöneticiye başarıyla iletildi. Teşekkür ederiz!
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-4 font-black">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">KATEGORİ</label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-xs font-black outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    <option value="SİSTEM_HATASI">Sistem Hatası / Çalışmıyor</option>
                    <option value="YANLIS_BILGI">Hatalı Doktor Bilgisi</option>
                    <option value="ONERI">Öneri / İstek</option>
                    <option value="DIGER">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">SORUN AÇIKLAMASI</label>
                  <textarea
                    required
                    rows="4"
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Lütfen yaşadığınız sorunu detaylıca açıklayın..."
                    className={`w-full p-3 rounded-xl border text-xs font-black outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-black"
                  >
                    İPTAL
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-xs font-black shadow-lg"
                  >
                    BİLDİRİMİ GÖNDER 🚀
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Printable A4 Modal */}       
      {showPrintModal && (         
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 p-3">           
          <div className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl p-6 shadow-2xl max-h-[95vh] overflow-y-auto border border-slate-300">             
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 gap-2">               
              <div className="flex items-center gap-2">                 
                <span className="text-2xl">🖨️</span>                
                <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">                   
                  DOKTOR ÇALIŞMA LİSTESİ İNDİR VE YAZDIR                
                </h2>               
              </div>               
              <div className="flex items-center gap-2">                 
                <button onClick={exportToExcel} className="px-4 py-2 bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5">                   
                  <span>📊</span> EXCEL İNDİR                 
                </button>                 
                <button onClick={() => window.print()} className="px-4 py-2 bg-blue-900 text-white font-black rounded-xl text-xs flex items-center gap-1.5">                   
                  <span>🖨️</span> YAZDIR / PDF               
                </button>                 
                <button onClick={() => setShowPrintModal(false)} className="px-3 py-2 bg-slate-200 text-slate-800 font-black rounded-xl text-xs">                   
                  ✕                
                </button>               
              </div>             
            </div>             

            <div id="printableA4Area" className="p-4 bg-white text-slate-950 font-sans leading-tight">               
              <div className="flex justify-between items-end mb-4 pb-2 border-b-2 border-slate-900">                 
                <div>                   
                  <h1 className="text-xl font-black text-slate-950 tracking-tight uppercase">                     
                    Doktor Çalışma Çizelgesi Listesi                   
                  </h1>                 
                </div>                 
                <div className="text-right font-black font-mono text-xs text-slate-800">                   
                  <span>Tarih: {todayFormattedStr}</span>                 
                </div>               
              </div>               

              <div className="w-full">                 
                <table className="w-full text-left border-collapse text-xs">                   
                  <thead>                     
                    <tr className="bg-slate-900 text-white font-black uppercase text-[11px] border-b-2 border-slate-900">                       
                      <th className="py-2 px-2.5 border-r border-slate-700 text-center w-12">NO</th>
                      <th className="py-2 px-2.5 border-r border-slate-700">BİRİM / POLİK</th>                       
                      <th className="py-2 px-2.5 border-r border-slate-700">DOKTOR ADI SOYADI</th>                       
                      <th className="py-2 px-2.5 text-center">DURUM</th>                       
                    </tr>                   
                  </thead>                   
                  <tbody className="divide-y divide-slate-200 font-bold">                     
                    {filteredAndSortedDoctors.map((docItem, i) => {                       
                      const activeStatusToday = getCurrentDayStatus(docItem);
                      return (
                        <tr key={docItem.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>                         
                          <td className="py-2 px-2.5 border-r border-slate-300 font-black text-center text-slate-950">{i + 1}</td>
                          <td className="py-2 px-2.5 border-r border-slate-300 uppercase text-slate-900 font-extrabold">{docItem.clinic}</td>                         
                          <td className="py-2 px-2.5 border-r border-slate-300 uppercase text-slate-950 font-black">{docItem.name}</td>                         
                          <td className="py-2 px-2.5 text-center uppercase font-black text-xs">{activeStatusToday}</td>                         
                        </tr>                     
                      );
                    })}                   
                  </tbody>                 
                </table>               
              </div>               
            </div>           
          </div>         
        </div>       
      )}       

      {/* MODAL DETAIL (يسمح بتغيير الحالة اليومية لمن يملك صلاحية Yönetim) */}
      {selectedDoctorDetail && (         
        <>           
          {isMinimized ? (
            <div className="fixed bottom-4 right-4 sm:right-6 z-[170]">
              <div 
                onClick={() => setIsMinimized(false)}
                className={`p-3.5 px-5 rounded-2xl shadow-2xl border-2 flex items-center gap-4 ${
                  isDarkMode 
                    ? 'bg-slate-900 border-amber-500/50 text-slate-100' 
                    : 'bg-white border-emerald-500/50 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-tight">{selectedDoctorDetail.name}</h4>
                    <p className="text-[10px] font-extrabold text-amber-500 uppercase">{getCurrentDayStatus(selectedDoctorDetail)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-2 border-l border-slate-300 dark:border-slate-800 pl-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }} 
                    className="p-1 text-amber-500 font-black text-sm"
                  >
                    🗖
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedDoctorDetail(null); }} 
                    className="p-1 text-rose-500 font-black text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-6" 
              onClick={(e) => { if (!isMaximized && modalBoxRef.current && !modalBoxRef.current.contains(e.target)) { setSelectedDoctorDetail(null); } }}
            >               
              <div 
                ref={modalBoxRef} 
                className={`flex flex-col relative shadow-2xl border-2 overflow-hidden ${
                  isMaximized 
                    ? 'w-full h-full max-w-none max-h-none rounded-none' 
                    : 'w-full max-w-3xl h-[85vh] rounded-3xl'
                } ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >                 
                <div className={`p-4 sm:p-5 border-b-2 flex justify-between items-center select-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>                   
                  <div className="flex items-center gap-3">                     
                    <div>
                      <h3 className="text-base sm:text-xl font-black text-emerald-500 dark:text-emerald-400 uppercase">{selectedDoctorDetail.name}</h3>                     
                      <p className="text-xs sm:text-sm font-black text-slate-500 dark:text-slate-400 mt-0.5">                       
                        BİRİM: <span className="text-emerald-600 dark:text-emerald-400 font-black">{selectedDoctorDetail.clinic}</span>                  
                        {(selectedDoctorDetail.roomNo || selectedDoctorDetail.room) && (
                          <span className="ml-2 font-black text-amber-500">(Oda: {selectedDoctorDetail.roomNo || selectedDoctorDetail.room})</span>
                        )}
                      </p>
                    </div>                   
                  </div>                   
                  
                  <div className="flex items-center gap-2 font-mono">
                    {/* يظهر زر التعديل إذا توفرت صلاحية التعديل */}
                    {canEditDocs && (
                      <button
                        onClick={() => handleStartDirectEdit(selectedDoctorDetail)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 shadow-md transition-all cursor-pointer"
                      >
                        DÜZENLE
                      </button>
                    )}

                    {/* يظهر زر الحذف إذا توفرت صلاحية الحذف */}
                    {canDeleteDocs && (
                      <button
                        onClick={() => {
                          const docId = selectedDoctorDetail.id;
                          setSelectedDoctorDetail(null);
                          if (onDeleteDoctor) {
                            onDeleteDoctor(docId);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black text-xs hover:bg-rose-500 shadow-md transition-all cursor-pointer"
                      >
                        SİL
                      </button>
                    )}

                    <button 
                      onClick={() => setIsMinimized(true)} 
                      className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 font-black text-base flex items-center justify-center cursor-pointer"
                    >
                      🗕
                    </button>                     
                    <button 
                      onClick={() => setIsMaximized(!isMaximized)} 
                      className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 font-black text-base flex items-center justify-center cursor-pointer"
                    >
                      {isMaximized ? '🗗' : '🗖'}
                    </button>                     
                    <button 
                      onClick={() => setSelectedDoctorDetail(null)} 
                      className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 font-black text-base flex items-center justify-center cursor-pointer"
                    >
                      ✕
                    </button>                   
                  </div>                 
                </div>                 

                <div className={`px-6 py-3 border-b ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>                   
                  <h4 className="text-xs font-black text-amber-500 dark:text-amber-400 uppercase">                       
                    📅 DETAYLI ÇALIŞMA VE İZİN TAKVİMİ                 
                  </h4>                 
                </div>                 

                <div className="relative flex-1 overflow-hidden">

                  {showScrollToTodayTop && (
                    <button
                      onClick={scrollToTodaySmooth}
                      className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full font-black text-xs shadow-2xl border flex items-center gap-2.5 ${
                        isDarkMode
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-emerald-950'
                          : 'bg-white border-emerald-600 text-emerald-900 shadow-slate-400'
                      }`}
                    >
                      <svg className="w-4 h-4 stroke-[3] text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      <span className="tracking-wide">BUGÜNE GİT ({todayFormattedStr})</span>
                    </button>
                  )}

                  {showScrollToTodayBottom && (
                    <button
                      onClick={scrollToTodaySmooth}
                      className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full font-black text-xs shadow-2xl border flex items-center gap-2.5 ${
                        isDarkMode
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-emerald-950'
                          : 'bg-white border-emerald-600 text-emerald-900 shadow-slate-400'
                      }`}
                    >
                      <svg className="w-4 h-4 stroke-[3] text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      <span className="tracking-wide">BUGÜNE GİT ({todayFormattedStr})</span>
                    </button>
                  )}

                  <div 
                    ref={modalScrollContainerRef}
                    onScroll={handleModalScroll}
                    className="h-full overflow-y-auto p-4 sm:p-6 space-y-3 font-black cursor-default"
                  >                   
                    {selectedDoctorDetail.scheduleDays && selectedDoctorDetail.scheduleDays.length > 0 ? (                     
                      selectedDoctorDetail.scheduleDays.map((sd, idx) => {                       
                        
                        const itemDate = parseItemDate(sd);
                        let isPast = false;
                        let isToday = false;

                        if (itemDate) {
                          itemDate.setHours(0, 0, 0, 0);
                          isPast = itemDate.getTime() < today.current.getTime();
                          isToday = itemDate.getTime() === today.current.getTime();
                        }

                        const monthNum = itemDate ? String(itemDate.getMonth() + 1).padStart(2, '0') : '';                       
                        const dayNum = itemDate ? String(itemDate.getDate()).padStart(2, '0') : '';                       
                        const yearNum = itemDate ? itemDate.getFullYear() : '';                       
                        const isoDateStr = `${yearNum}-${monthNum}-${dayNum}`;                                              
                        const holidayName = TURKEY_OFFICIAL_HOLIDAYS_2026[isoDateStr];                       
                        const dateColorClass = getDateTextColor(sd.status, sd.day, isPast, isDarkMode);

                        return (                         
                          <div 
                            key={idx} 
                            ref={isToday ? todayRef : null} 
                            className={`flex justify-between items-center p-4 sm:p-5 rounded-2xl border-2 font-black ${
                              isToday 
                                ? isDarkMode
                                  ? 'border-amber-400 bg-slate-900 shadow-2xl' 
                                  : 'border-emerald-600 bg-emerald-100 shadow-2xl'
                                : isPast
                                ? isDarkMode
                                  ? 'border-slate-800 bg-slate-950 opacity-80'
                                  : 'border-slate-300 bg-slate-100 opacity-80'
                                : isDarkMode 
                                ? 'bg-slate-950 border-slate-800' 
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >                           
                            <div className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base">                             
                              <span className={`font-black tracking-tight ${dateColorClass} ${isToday ? 'text-lg sm:text-xl font-black' : 'text-sm sm:text-base'}`}>
                                {sd.date}
                              </span>                             
                              
                              <span className={`font-black uppercase ${dateColorClass} ${isToday ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
                                {sd.day}
                              </span>                             
                              
                              {isPast && (
                                <span className="text-[11px] sm:text-xs text-rose-500 dark:text-rose-400 font-black tracking-wide">
                                  GEÇMİŞ TARİH
                                </span>
                              )}                             
                              
                              {isToday && (
                                <span className="text-xs sm:text-sm bg-amber-400 text-slate-950 font-black px-3.5 py-1 rounded-xl uppercase shadow-lg border border-amber-300 tracking-wider">
                                  BUGÜN
                                </span>
                              )}                             
                              
                              {holidayName && (
                                <span className="text-xs bg-purple-600 text-white font-black px-2.5 py-1 rounded-lg font-sans">
                                  🇹🇷 {holidayName}
                                </span>
                              )}                           
                            </div>                           
                            
                            <div className="flex justify-center shrink-0">
                              <span className={`w-36 sm:w-44 h-9 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center text-center ${getStatusStyles(sd.status, isPast)}`}>                             
                                <span className="truncate px-2">{holidayName ? 'RESMİ TATİL' : sd.status}</span>
                              </span>                         
                            </div>
                          </div>                       
                        );                     
                      })                   
                    ) : (                     
                      <div className="p-8 text-center text-slate-400 font-bold border-2 border-dashed rounded-2xl">                       
                        Bu doktor için detaylı takvim bulunmamaktadır.                     
                      </div>                   
                    )}                 
                  </div>                 
                </div>

              </div>             
            </div> 
          )}          
        </>       
      )}       

    </div>   
  ); 
}