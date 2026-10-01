'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { db } from '@/lib/firebase';
import { addDoc, deleteDoc, doc, updateDoc, collection } from 'firebase/firestore';

// 🏥 مكون الأيقونات الطبية
const MedicalIcon = ({ name, className = "w-4 h-4" }) => {
  const getSvgPath = (iconName) => {
    switch (iconName) {
      case 'PALYATİF':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />;
      case 'ÇOCUK SAĞLIĞI VE HASTALIKLARI':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />;
      case 'ENFEKSİYON HASTALIKLARI':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />;
      case 'GENEL CERRAHİ':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.828 2.828a1 1 0 01-1.414 0L3 10.121a1 1 0 010-1.414L8.707 3a1 1 0 011.414 0l4 4a1 1 0 010 1.414L11.293 11.29" />;
      case 'GÖĞÜS HASTALIKLARI':
      case 'RADYOLOJİ (USG)':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m16-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />;
      case 'ORTOPEDİ VE TRAVMATOLOJİ':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z" />;
      case 'ÜROLOJİ':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />;
      case 'KADIN HASTALIKLARI VE DOĞUM':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />;
      case 'DERMATOLOJİ':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />;
      case 'KULAK BURUN BOĞAZ (KBB)':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />;
      case 'GÖZ HASTALIKLARI':
        return (
          <>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </>
        );
      case 'KARDİYOLOJİ':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />;
      case 'PSİKİYATRİ':
      case 'NÖROLOJİ':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />;
      case 'DİŞ HEKİMLİĞİ':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
      case 'İÇ HASTALIKLARI (DAHİLİYE)':
      default:
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />;
    }
  };

  return (
    <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 backdrop-blur-md flex items-center justify-center shrink-0 shadow-xs">
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {getSvgPath(name)}
      </svg>
    </div>
  );
};

const defaultDepartments = [
  'PALYATİF',
  'ÇOCUK SAĞLIĞI VE HASTALIKLARI',
  'ENFEKSİYON HASTALIKLARI',
  'GENEL CERRAHİ',
  'GÖĞÜS HASTALIKLARI',
  'ORTOPEDİ VE TRAVMATOLOJİ',
  'ÜROLOJİ',
  'KADIN HASTALIKLARI VE DOĞUM',
  'DERMATOLOJİ',
  'KULAK BURUN BOĞAZ (KBB)',
  'GÖZ HASTALIKLARI',
  'KARDİYOLOJİ',
  'PSİKİYATRİ',
  'NÖROLOJİ',
  'DİŞ HEKİMLİĞİ',
  'İÇ HASTALIKLARI (DAHİLİYE)',
  'RADYOLOJİ (USG)'
];

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

// 🗓️ توليد الجدول تلقائياً مع الشهر والسنة الحاليين
const generateFullMonthSchedule = (year = new Date().getFullYear(), month = new Date().getMonth()) => {
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

// 🌟 تنسيق الشارات ليشمل جميع الحالات بما فيها PALYATİF[cite: 7]
const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'POLİKLİNİK':
    case 'POLİK':
      return 'bg-emerald-600 text-white border-emerald-500 shadow-xs';
    case 'AMELİYATTA':
      return 'bg-purple-600 text-white border-purple-500 shadow-xs';
    case 'PALYATİF':
      return 'bg-pink-600 text-white border-pink-400 shadow-xs font-black';
    case 'İŞLEM GÜNÜ':
      return 'bg-teal-600 text-white border-teal-400 shadow-xs font-black';
    case 'YARIM GÜN':
      return 'bg-orange-500 text-slate-950 font-black border-orange-400 shadow-xs';
    case 'SAATLİK İZİN':
      return 'bg-amber-600 text-white border-amber-400 shadow-xs font-black';
    case 'RESMİ TATİL':
      return 'bg-indigo-700 text-white border-indigo-500 shadow-xs font-black';
    case 'HAFTA SONU':
      return 'bg-rose-600 text-white border-rose-400 shadow-xs';
    case 'YILLIK İZİN':
    case 'RAPORLU':
      return 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-xs';
    case 'NÖBET SONRASI İZİN':
      return 'bg-sky-600 text-white border-sky-500 shadow-xs';
    case 'ASKERLİK':
      return 'bg-slate-800 text-slate-300 border-slate-600 shadow-xs font-black';
    case 'ŞUA İZNİ':
      return 'bg-cyan-600 text-white border-cyan-400 shadow-xs font-black';
    case 'KONGRE/SEMİNER':
      return 'bg-blue-600 text-white border-blue-400 shadow-xs font-black';
    default:
      return 'bg-slate-700 text-white border-slate-500';
  }
};

export default function AdminDoctorsPage() {
  const { isDarkMode, activeColor } = useTheme();
  const { doctors = [], setDoctors, checkPermission, loading, user } = useData();
  
  const [openedFolder, setOpenedFolder] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');

  const [departments, setDepartments] = useState(defaultDepartments);
  const [newCustomDept, setNewCustomDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const [activeDept, setActiveDept] = useState(null);

  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [winPos, setWinPos] = useState({ x: 0, y: 0 });
  const [winSize, setWinSize] = useState({ width: 850, height: 600 });
  
  // 🕒 تعيين الشهر والسنة الحاليين ديناميكياً
  const currentDate = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [deletingDept, setDeletingDept] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(null);

  const [docName, setDocName] = useState('');
  const [docClinic, setDocClinic] = useState(defaultDepartments[0]);
  const [docDahili, setDocDahili] = useState('');
  const [docRoomNo, setDocRoomNo] = useState('');

  const todayRef = useRef(null);
  const modalBoxRef = useRef(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const isFirstOpenRef = useRef(false);
  const isScheduleDirtyRef = useRef(false);

  const router = useRouter();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // 🛡️ فحص الصلاحيات الموحد
  const canManageDocs = checkPermission ? checkPermission('bölüm ve doktor yönetimi') : true;
  const canEditDocs = checkPermission ? checkPermission('bölüm ve doktor düzeltme yetkisi') : true;
  const canDeleteDocs = checkPermission ? checkPermission('bölüm ve doktor silme yetkisi') : true;
  const canChangeStatus = checkPermission ? checkPermission('çalışma durumu değiştirme') : true;

  const triggerToast = useCallback((msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  // 🔒 إدارة الانتقال السريع ودون الحاجة لإعادة تحميل الصفحة (F5)
  useEffect(() => {
    if (loading) return; // عدم اتخاذ أي قرار حتى اكتمال جلب جلسة المستخدم وصلاحياته
    
    if (!canManageDocs && !user) {
      router.replace('/dashboard');
      return;
    }

    const savedDepts = JSON.parse(localStorage.getItem('app_departments') || '[]');
    if (savedDepts.length > 0) {
      setDepartments(Array.from(new Set(savedDepts)));
    } else {
      setDepartments(defaultDepartments);
      localStorage.setItem('app_departments', JSON.stringify(defaultDepartments));
    }
  }, [canManageDocs, loading, user, router]);

  useEffect(() => {
    if ((showScheduleModal && !isMinimized) || editingDoctor || deletingDept || deletingDoc) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showScheduleModal, isMinimized, editingDoctor, deletingDept, deletingDoc]);

  const handleMouseDownHeader = (e) => {
    if (isMaximized) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - winPos.x, y: e.clientY - winPos.y };

    const handleMouseMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      setWinPos({ x: moveEvent.clientX - dragStartRef.current.x, y: moveEvent.clientY - dragStartRef.current.y });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDownResize = (e) => {
    e.stopPropagation();
    isResizingRef.current = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = winSize.width;
    const startHeight = winSize.height;

    const handleMouseMove = (moveEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = Math.max(500, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(350, startHeight + (moveEvent.clientY - startY));
      setWinSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleOpenSchedule = (docItem) => {
    setSelectedDoctor(docItem);
    isFirstOpenRef.current = true;
    isScheduleDirtyRef.current = false;
    setIsMinimized(false);
    setIsMaximized(false);
    setWinPos({ x: 0, y: 0 });
    setShowScheduleModal(true);
  };

  const handleCloseScheduleModal = async () => {
    if (selectedDoctor && isScheduleDirtyRef.current) {
      if (!canChangeStatus) {
        alert('Çalışma durumunu değiştirme yetkiniz bulunmamaktadır!');
        setShowScheduleModal(false);
        return;
      }
      try {
        await updateDoc(doc(db, 'doctors', selectedDoctor.id), {
          scheduleDays: selectedDoctor.scheduleDays,
          updatedAt: Date.now()
        });
        if (setDoctors) {
          setDoctors(prev => prev.map(d => d.id === selectedDoctor.id ? selectedDoctor : d));
        }
        triggerToast(`Takvim güncellendi: ${selectedDoctor.name}`);
      } catch (e) {
        console.error('Takvim güncelleme hatası:', e);
      }
    }
    isScheduleDirtyRef.current = false;
    setShowScheduleModal(false);
  };

  const handleRegenerateMonth = (year, month) => {
    if (!selectedDoctor) return;
    const newSchedule = generateFullMonthSchedule(year, month);
    const updatedDoc = { ...selectedDoctor, scheduleDays: newSchedule };
    setSelectedDoctor(updatedDoc);
    isScheduleDirtyRef.current = true;
  };

  const handleDayStatusChange = (index, newStatus) => {
    if (!canChangeStatus) {
      alert('Çalışma durumunu değiştirme yetkiniz bulunmamaktadır!');
      return;
    }
    if (!selectedDoctor) return;
    const updatedSchedule = [...selectedDoctor.scheduleDays];
    updatedSchedule[index].status = newStatus;
    const updatedDoc = { ...selectedDoctor, scheduleDays: updatedSchedule };
    setSelectedDoctor(updatedDoc);
    isScheduleDirtyRef.current = true;
  };

  const handleAddCustomDepartment = (e) => {
    e.preventDefault();
    if (!canManageDocs) {
      alert('Bölüm ekleme yetkiniz bulunmamaktadır!');
      return;
    }
    if (!newCustomDept.trim()) return;
    const deptUpper = newCustomDept.trim().toLocaleUpperCase('tr-TR');
    if (!departments.includes(deptUpper)) {
      const updated = Array.from(new Set([...departments, deptUpper]));
      setDepartments(updated);
      localStorage.setItem('app_departments', JSON.stringify(updated));
      triggerToast(`Bölüm başarıyla eklendi: ${deptUpper}`);
    }
    setNewCustomDept('');
  };

  const handleConfirmDeleteDepartment = () => {
    if (!canDeleteDocs) {
      alert('Bölüm silme yetkiniz bulunmamaktadır!');
      setDeletingDept(null);
      return;
    }
    if (!deletingDept) return;
    const updatedDepts = departments.filter(d => d !== deletingDept);
    setDepartments(updatedDepts);
    localStorage.setItem('app_departments', JSON.stringify(updatedDepts));
    triggerToast(`Bölüm silindi: ${deletingDept}`);
    setDeletingDept(null);
  };

  const handleConfirmDeleteDoctor = async () => {
    if (!canDeleteDocs) {
      alert('Doktor silme yetkiniz bulunmamaktadır!');
      setDeletingDoc(null);
      return;
    }
    if (!deletingDoc) return;
    try {
      await deleteDoc(doc(db, 'doctors', deletingDoc.id));
      if (setDoctors) {
        setDoctors(prev => prev.filter(d => d.id !== deletingDoc.id));
      }
      triggerToast(`Doktor silindi: ${deletingDoc.name}`);
      setDeletingDoc(null);
    } catch (e) {
      console.error('Doktor silme hatası:', e);
    }
  };

  const handleSaveNewDoctor = async (e) => {
    e.preventDefault();
    if (!canManageDocs) {
      alert('Doktor ekleme yetkiniz bulunmamaktadır!');
      return;
    }
    if (!docName) return;
    const now = Date.now();
    const newDoc = {
      name: docName.trim().toLocaleUpperCase('tr-TR'),
      clinic: docClinic.trim().toLocaleUpperCase('tr-TR'),
      status: 'POLİKLİNİK',
      dahili: docDahili || '',
      roomNo: docRoomNo || '',
      scheduleDays: generateFullMonthSchedule(selectedYear, selectedMonth),
      createdAt: now,
      updatedAt: now
    };
    try {
      const docRef = await addDoc(collection(db, 'doctors'), newDoc);
      if (setDoctors) {
        setDoctors(prev => [...prev, { id: docRef.id, ...newDoc }]);
      }
      setDocName(''); setDocDahili(''); setDocRoomNo('');
      triggerToast(`Doktor eklendi: ${newDoc.name}`);
    } catch (e) {
      console.error('Doktor ekleme hatası:', e);
    }
  };

  const handleSaveEditedDoctor = async (e) => {
    e.preventDefault();
    if (!canEditDocs) {
      alert('Doktor bilgilerini düzeltme yetkiniz bulunmamaktadır!');
      setEditingDoctor(null);
      return;
    }
    if (!editingDoctor) return;
    try {
      const updatedData = {
        name: editingDoctor.name.trim().toLocaleUpperCase('tr-TR'),
        clinic: editingDoctor.clinic.trim().toLocaleUpperCase('tr-TR'),
        dahili: editingDoctor.dahili || '',
        roomNo: editingDoctor.roomNo || '',
        updatedAt: Date.now()
      };
      await updateDoc(doc(db, 'doctors', editingDoctor.id), updatedData);
      if (setDoctors) {
        setDoctors(prev => prev.map(d => d.id === editingDoctor.id ? { ...d, ...updatedData } : d));
      }
      setEditingDoctor(null);
      triggerToast(`Doktor bilgileri güncellendi: ${editingDoctor.name}`);
    } catch (e) {
      console.error('Doktor güncelleme hatası:', e);
    }
  };

  const getDoctorsByDept = useCallback((deptName) => {
    const cleanDept = deptName.trim().toLocaleUpperCase('tr-TR');
    let filtered = doctors.filter(d => d.clinic?.trim().toLocaleUpperCase('tr-TR') === cleanDept);

    const uniqueMap = new Map();
    filtered.forEach(d => uniqueMap.set(d.id || d.name, d));
    filtered = Array.from(uniqueMap.values());

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLocaleUpperCase('tr-TR');
      filtered = filtered.filter(d => 
        d.name?.includes(q) || 
        d.dahili?.includes(q) || 
        d.roomNo?.includes(q)
      );
    }

    return filtered;
  }, [doctors, searchQuery]);

  const toggleDept = (deptName) => {
    setActiveDept(prev => prev === deptName ? null : deptName);
  };

  const uniqueDepartments = useMemo(() => Array.from(new Set(departments)), [departments]);

  // ⏳ عرض مؤشر التحميل لحين اكتمال تجهيز الجلسة والصلاحيات
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3 font-black">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 uppercase tracking-widest">YÜKLENİYOR...</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 w-full max-w-[100vw] mx-auto space-y-5 min-h-screen overflow-x-hidden">

      {/* 🔮 المربعين الرئيسيين عند فتح الصفحة */}
      {!openedFolder && (
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 py-12 animate-fadeIn">
          
          <div
            onClick={() => setOpenedFolder('ADD_FOLDER')}
            className={`group relative w-full sm:w-64 p-5 rounded-2xl border cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 active:scale-95 shadow-md hover:shadow-xl overflow-hidden ${
              isDarkMode 
                ? 'bg-slate-900/80 border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900' 
                : 'bg-white/90 border-slate-200/80 hover:border-amber-500 hover:bg-amber-50/30'
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center justify-between mb-3">
              <MedicalIcon name="GENEL CERRAHİ" className="w-4 h-4" />
              <span className="text-amber-500 text-xs font-black tracking-widest group-hover:translate-x-1 transition-transform">
                GO ➔
              </span>
            </div>

            <h2 className="text-xs sm:text-sm font-black text-amber-500 uppercase tracking-wide">
              Bölüm ve Doktor Ekle
            </h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1">
              Yeni poliklinik veya doktor oluşturun
            </p>
          </div>

          <div
            onClick={() => setOpenedFolder('LIST_FOLDER')}
            className={`group relative w-full sm:w-64 p-5 rounded-2xl border cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 active:scale-95 shadow-md hover:shadow-xl overflow-hidden ${
              isDarkMode 
                ? 'bg-slate-900/80 border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-900' 
                : 'bg-white/90 border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/30'
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-80 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center justify-between mb-3">
              <MedicalIcon name="İÇ HASTALIKLARI (DAHİLİYE)" className="w-4 h-4" />
              <span className="text-emerald-500 text-xs font-black tracking-widest group-hover:translate-x-1 transition-transform">
                GO ➔
              </span>
            </div>

            <h2 className="text-xs sm:text-sm font-black text-emerald-500 uppercase tracking-wide">
              Eklenen Bölüm ve Doktorlar
            </h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1">
              Mevcut listeyi ve takvimleri inceleyin
            </p>
          </div>

        </div>
      )}

      {/* ↩️ شريط العودة وحقل البحث */}
      {openedFolder && (
        <div className="space-y-4 animate-fadeIn">
          
          <div className="flex justify-between items-center max-w-xl mx-auto pt-1">
            <button
              onClick={() => {
                setOpenedFolder(null);
                setSearchQuery('');
              }}
              className="px-3.5 py-1.5 rounded-xl border-2 text-xs font-black flex items-center gap-2 cursor-pointer transition-all active:scale-95 bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-slate-950 shadow-xs"
            >
              <span>←</span>
              <span>ANA MENÜYE DÖN</span>
            </button>
          </div>

          {openedFolder === 'LIST_FOLDER' && (
            <div className="flex justify-center items-center w-full max-w-xl mx-auto">
              <div className={`relative w-full rounded-2xl border-2 transition-all shadow-md hover:shadow-lg ${
                isDarkMode ? 'bg-slate-900/90 border-slate-800 focus-within:border-emerald-500' : 'bg-white border-slate-200 focus-within:border-emerald-500'
              }`}>
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Doktor Ara (İsim, Dahili, Oda No)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent font-black text-xs outline-none tracking-wide"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 font-black text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ADD FOLDER VIEW */}
      {openedFolder === 'ADD_FOLDER' && (
        <div className="space-y-5 animate-fadeIn max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className={`p-5 sm:p-6 rounded-3xl border-2 shadow-xl space-y-4 ${
              isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-3 pb-3 border-b border-slate-700/50">
                <MedicalIcon name="GENEL CERRAHİ" className="w-4 h-4" />
                <h3 className="text-xs sm:text-sm font-black text-amber-500 uppercase tracking-wider">1. BÖLÜM / KLİNİK EKLE</h3>
              </div>

              <form onSubmit={handleAddCustomDepartment} className="space-y-4 font-black">
                <div>
                  <label className="block text-[11px] mb-1.5 text-slate-400 uppercase tracking-wider">BÖLÜM ADI</label>
                  <input
                    type="text"
                    required
                    placeholder="ÖRNEK: NÖROLOJİ"
                    value={newCustomDept}
                    onChange={(e) => setNewCustomDept(e.target.value.toLocaleUpperCase('tr-TR'))}
                    className={`w-full px-4 py-3 rounded-2xl border-2 font-black text-xs uppercase outline-none focus:border-amber-500 transition-all ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl text-xs cursor-pointer shadow-lg transition-all uppercase tracking-wider active:scale-98"
                >
                  + BÖLÜMÜ KAYDET
                </button>
              </form>
            </div>

            <div className={`p-5 sm:p-6 rounded-3xl border-2 shadow-xl space-y-4 ${
              isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-3 pb-3 border-b border-slate-700/50">
                <MedicalIcon name="ÇOCUK SAĞLIĞI VE HASTALIKLARI" className="w-4 h-4" />
                <h3 className="text-xs sm:text-sm font-black text-emerald-500 uppercase tracking-wider">2. DOKTOR VE TAKVİM EKLE</h3>
              </div>

              <form onSubmit={handleSaveNewDoctor} className="space-y-3.5 font-black">
                <div>
                  <label className="block text-[11px] mb-1.5 text-slate-400 uppercase tracking-wider">KLİNİK / BÖLÜM SEÇİN</label>
                  <select
                    value={docClinic}
                    onChange={(e) => setDocClinic(e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl border-2 font-black text-xs outline-none cursor-pointer ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    {uniqueDepartments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] mb-1.5 text-slate-400 uppercase tracking-wider">DOKTOR ADI SOYADI</label>
                  <input
                    type="text"
                    required
                    placeholder="ÖRNEK: DR. AHMET YILMAZ"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value.toLocaleUpperCase('tr-TR'))}
                    className={`w-full px-4 py-3 rounded-2xl border-2 font-black text-xs focus:border-emerald-500 outline-none uppercase transition-all ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] mb-1 text-amber-500 uppercase tracking-wider">DAHİLİ TEL</label>
                    <input
                      type="text"
                      placeholder="1012"
                      value={docDahili}
                      onChange={(e) => setDocDahili(e.target.value)}
                      className={`w-full px-4 py-3 rounded-2xl border-2 font-mono text-xs focus:border-amber-500 outline-none transition-all ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] mb-1 text-emerald-500 uppercase tracking-wider">ODA NO</label>
                    <input
                      type="text"
                      placeholder="102"
                      value={docRoomNo}
                      onChange={(e) => setDocRoomNo(e.target.value)}
                      className={`w-full px-4 py-3 rounded-2xl border-2 font-mono text-xs focus:border-emerald-500 outline-none transition-all ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl text-xs shadow-lg transition-all uppercase tracking-wider cursor-pointer active:scale-98"
                >
                  + DOKTORU SİSTEME KAYDET
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* LIST FOLDER VIEW */}
      {openedFolder === 'LIST_FOLDER' && (
        <div className="space-y-4 animate-fadeIn w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start w-full">
            {uniqueDepartments.map((dept) => {
              const deptDocs = getDoctorsByDept(dept);
              const isOpen = activeDept === dept || (searchQuery.trim().length > 0 && deptDocs.length > 0);

              if (searchQuery.trim() && deptDocs.length === 0) return null;

              return (
                <div key={dept} className={`rounded-2xl border-2 overflow-hidden shadow-sm transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}>
                  
                  <div 
                    onClick={() => toggleDept(dept)}
                    className={`p-3.5 flex justify-between items-center cursor-pointer select-none transition-colors ${
                      isOpen 
                        ? isDarkMode ? 'bg-slate-950 border-b border-slate-800' : 'bg-slate-100/90 border-b border-slate-200' 
                        : isDarkMode ? 'bg-slate-900/50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <MedicalIcon name={dept} className="w-4 h-4" />
                      <span className={`text-xs font-black uppercase tracking-wider truncate ${activeColor}`}>
                        {dept}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-black">
                        {deptDocs.length} DOKTOR
                      </span>
                      
                      {canDeleteDocs && (
                        <button
                          onClick={() => setDeletingDept(dept)}
                          className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                          title="Bölümü Sil"
                        >
                          🗑️
                        </button>
                      )}

                      <button
                        onClick={() => toggleDept(dept)}
                        className="p-1 text-amber-400 hover:bg-amber-500/10 rounded-lg text-xs transition-all cursor-pointer"
                      >
                        {isOpen ? '▲' : '▼'}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="p-3 space-y-2 animate-fadeIn">
                      {deptDocs.length > 0 ? (
                        deptDocs.map((docItem) => (
                          <div 
                            key={docItem.id} 
                            onClick={() => handleOpenSchedule(docItem)}
                            className={`p-3 rounded-xl border-2 flex justify-between items-center cursor-pointer transition-all hover:scale-[1.01] ${
                              isDarkMode 
                                ? 'bg-slate-950/70 border-slate-800/90 hover:border-amber-500/50' 
                                : 'bg-slate-50 border-slate-200 hover:border-amber-500'
                            }`}
                          >
                            <div className="space-y-1 min-w-0 pr-2">
                              <div className={`font-black text-xs uppercase tracking-wide truncate ${activeColor}`}>
                                {docItem.name}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 text-[9px] font-mono font-black px-1.5 py-0.5 rounded-md">
                                  TEL: {docItem.dahili || '-'}
                                </span>
                                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-mono font-black px-1.5 py-0.5 rounded-md">
                                  ODA: {docItem.roomNo || '-'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {canEditDocs && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingDoctor(docItem);
                                  }}
                                  className="p-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-slate-950 rounded-lg border border-amber-500/30 text-[11px] font-black cursor-pointer transition-all"
                                  title="Doktoru Düzenle"
                                >
                                  ✏️
                                </button>
                              )}
                              {canDeleteDocs && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingDoc(docItem);
                                  }}
                                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg border border-rose-500/30 text-[11px] font-black cursor-pointer transition-all"
                                  title="Doktoru Sil"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-slate-500 font-black p-3 text-center border-2 border-dashed border-slate-800/80 rounded-xl">
                          Bu bölümde doktor kaydı bulunmuyor.
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal - Doctor Info Edit */}
      {editingDoctor && canEditDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className={`w-full max-w-md rounded-2xl border-2 p-5 shadow-2xl ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700">
              <h3 className="text-xs font-black text-amber-500 uppercase tracking-wider">✏️ DOKTOR BİLGİSİ DÜZENLE</h3>
              <button onClick={() => setEditingDoctor(null)} className="text-slate-400 hover:text-white font-black text-xl cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveEditedDoctor} className="space-y-3.5 font-black">
              <div>
                <label className="block text-[11px] mb-1 text-slate-400 uppercase tracking-wider">KLİNİK / BÖLÜM</label>
                <select
                  value={editingDoctor.clinic}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, clinic: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-xl border-2 font-black text-xs outline-none cursor-pointer ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] mb-1 text-slate-400 uppercase tracking-wider">DOKTOR ADI SOYADI</label>
                <input
                  type="text"
                  required
                  value={editingDoctor.name}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value.toLocaleUpperCase('tr-TR') })}
                  className={`w-full px-3 py-2.5 rounded-xl border-2 font-black text-xs outline-none uppercase ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] mb-1 text-amber-500 uppercase tracking-wider">DAHİLİ TEL</label>
                  <input
                    type="text"
                    value={editingDoctor.dahili || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, dahili: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border-2 font-mono text-xs outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] mb-1 text-emerald-500 uppercase tracking-wider">ODA NO</label>
                  <input
                    type="text"
                    value={editingDoctor.roomNo || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, roomNo: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border-2 font-mono text-xs outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md cursor-pointer transition-all uppercase tracking-wider active:scale-98">
                GÜNCELLEMELERİ KAYDET
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Delete Department */}
      {deletingDept && canDeleteDocs && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className={`w-full max-w-xs rounded-2xl border-2 p-5 shadow-2xl text-center ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-base font-black mb-1 text-rose-500">🗑️ BÖLÜMÜ SİL</h3>
            <p className="text-[11px] font-bold text-slate-400 mb-5">
              <span className="text-amber-400 font-black">{deletingDept}</span> bölümünü silmek istediğinize emin misiniz?
            </p>
            <div className="flex gap-2.5 font-black">
              <button onClick={() => setDeletingDept(null)} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer">İPTAL</button>
              <button onClick={handleConfirmDeleteDepartment} className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs shadow-md cursor-pointer">EVET, SİL</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Delete Doctor */}
      {deletingDoc && canDeleteDocs && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className={`w-full max-w-xs rounded-2xl border-2 p-5 shadow-2xl text-center ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-base font-black mb-1 text-rose-500">🗑️ DOKTORU SİL</h3>
            <p className="text-[11px] font-bold text-slate-400 mb-5">
              <span className="text-amber-400 font-black">{deletingDoc.name}</span> isimli doktoru silmek istediğinize emin misiniz?
            </p>
            <div className="flex gap-2.5 font-black">
              <button onClick={() => setDeletingDoc(null)} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer">İPTAL</button>
              <button onClick={handleConfirmDeleteDoctor} className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs shadow-md cursor-pointer">EVET, SİL</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Schedule Table */}
      {showScheduleModal && selectedDoctor && (
        <>
          {!isMinimized && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-5"
              onClick={(e) => {
                if (!isMaximized && modalBoxRef.current && !modalBoxRef.current.contains(e.target)) {
                  handleCloseScheduleModal();
                }
              }}
            >
              <div 
                ref={modalBoxRef}
                style={{
                  transform: !isMaximized ? `translate(${winPos.x}px, ${winPos.y}px)` : 'none',
                  width: !isMaximized ? `${winSize.width}px` : '100%',
                  height: !isMaximized ? `${winSize.height}px` : '100%'
                }}
                className={`flex flex-col relative shadow-2xl border-2 overflow-hidden transition-all duration-75 ${
                  isMaximized 
                    ? 'w-full h-full max-w-none max-h-none rounded-none' 
                    : 'rounded-2xl max-w-[95vw] max-h-[95vh]'
                } ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
              >
                
                <div 
                  onMouseDown={handleMouseDownHeader}
                  className={`p-3.5 sm:p-4 border-b-2 flex justify-between items-center select-none ${
                    isMaximized ? 'cursor-default' : 'cursor-move'
                  } ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}
                >
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-amber-500 uppercase tracking-wide">{selectedDoctor.name}</h3>
                    <p className="text-[11px] font-black text-emerald-500 dark:text-emerald-400 mt-0.5">
                      {selectedDoctor.clinic} • DAHİLİ: <span className="font-mono text-amber-400">{selectedDoctor.dahili || '-'}</span> • ODA NO: <span className="font-mono text-emerald-400">{selectedDoctor.roomNo || '-'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1 font-mono">
                    <button 
                      onClick={() => setIsMinimized(true)}
                      className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-black text-sm transition-all flex items-center justify-center cursor-pointer"
                      title="Simge Durumuna Küçült"
                    >
                      🗕
                    </button>
                    <button 
                      onClick={() => setIsMaximized(!isMaximized)}
                      className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white font-black text-sm transition-all flex items-center justify-center cursor-pointer"
                      title={isMaximized ? "Eski Boyuta Getir" : "Ekranı Kapla"}
                    >
                      {isMaximized ? '🗗' : '🗖'}
                    </button>
                    <button 
                      onClick={handleCloseScheduleModal}
                      className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-black text-sm transition-all flex items-center justify-center cursor-pointer"
                      title="Kapat"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className={`px-5 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[11px] font-black text-amber-500 uppercase tracking-wider">📅 AYLIK ÇALIŞMA TAKVİMİ:</span>
                  <div className="flex gap-2 font-black">
                    <select 
                      value={selectedMonth} 
                      onChange={(e) => {
                        const m = parseInt(e.target.value);
                        setSelectedMonth(m);
                        handleRegenerateMonth(selectedYear, m);
                      }} 
                      className={`px-2.5 py-1 rounded-lg border-2 text-[11px] font-black outline-none cursor-pointer ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      {['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'].map((mName, idx) => (
                        <option key={idx} value={idx}>{mName}</option>
                      ))}
                    </select>
                    <select 
                      value={selectedYear} 
                      onChange={(e) => {
                        const y = parseInt(e.target.value);
                        setSelectedYear(y);
                        handleRegenerateMonth(y, selectedMonth);
                      }} 
                      className={`px-2.5 py-1 rounded-lg border-2 text-[11px] font-black outline-none cursor-pointer ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                      <option value={2028}>2028</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-2 font-black">
                  {selectedDoctor.scheduleDays && selectedDoctor.scheduleDays.map((sd, idx) => {
                    const itemDate = parseItemDate(sd);
                    let isPast = false;
                    let isToday = false;

                    if (itemDate) {
                      itemDate.setHours(0, 0, 0, 0);
                      isPast = itemDate.getTime() < today.getTime();
                      isToday = itemDate.getTime() === today.getTime();
                    }

                    return (
                      <div 
                        key={idx} 
                        ref={isToday ? todayRef : null}
                        className={`flex justify-between items-center p-3 rounded-xl border-2 transition-all ${
                          isPast 
                            ? 'opacity-35 grayscale-[40%] bg-slate-950/30 border-slate-800/80 text-slate-500' 
                            : isToday 
                            ? 'border-amber-400 bg-amber-500/15 shadow-md scale-[1.002] text-amber-300' 
                            : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 text-xs">
                          <span className={`font-black font-mono ${isToday ? 'text-amber-400 text-sm' : ''}`}>{sd.date}</span>
                          
                          <span className={`text-[11px] font-black uppercase tracking-wide ${isToday ? 'text-amber-400' : 'text-slate-300'}`}>
                            {sd.day}
                          </span>
                          
                          {isPast && (
                            <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-sans font-bold">
                              GEÇMİŞ
                            </span>
                          )}

                          {isToday && (
                            <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded font-sans uppercase tracking-wider">
                              BUGÜN
                            </span>
                          )}

                          {sd.holidayName && (
                            <span className="text-[9px] bg-purple-600 text-white font-black px-2 py-0.5 rounded font-sans">
                              🇹🇷 {sd.holidayName}
                            </span>
                          )}
                        </div>

                        {/* 🌟 القائمة المنسدلة المحدثة تشمل خيار PALYATİF وجميع الحالات[cite: 7] */}
                        <select
                          value={sd.status}
                          disabled={isPast || !canChangeStatus}
                          onChange={(e) => handleDayStatusChange(idx, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg border-2 text-[11px] font-black outline-none transition-all cursor-pointer ${getStatusBadgeStyle(sd.status)} ${
                            isPast || !canChangeStatus ? 'cursor-not-allowed opacity-60' : ''
                          }`}
                        >
                          <option value="POLİKLİNİK" className="bg-emerald-600 text-white">POLİKLİNİK</option>
                          <option value="AMELİYATTA" className="bg-purple-600 text-white">AMELİYATTA</option>
                          <option value="PALYATİF" className="bg-pink-600 text-white">PALYATİF</option>
                          <option value="İŞLEM GÜNÜ" className="bg-teal-600 text-white">İŞLEM GÜNÜ</option>
                          <option value="YARIM GÜN" className="bg-orange-500 text-slate-950">YARIM GÜN</option>
                          <option value="SAATLİK İZİN" className="bg-amber-600 text-white">SAATLİK İZİN</option>
                          <option value="ŞUA İZNİ" className="bg-cyan-600 text-white">ŞUA İZNİ</option>
                          <option value="KONGRE/SEMİNER" className="bg-blue-600 text-white">KONGRE / SEMİNER</option>
                          <option value="RESMİ TATİL" className="bg-indigo-700 text-white">RESMİ TATİL</option>
                          <option value="HAFTA SONU" className="bg-rose-600 text-white">HAFTA SONU</option>
                          <option value="YILLIK İZİN" className="bg-amber-500 text-slate-950">YILLIK İZİN</option>
                          <option value="RAPORLU" className="bg-amber-500 text-slate-950">RAPORLU</option>
                          <option value="NÖBET SONRASI İZİN" className="bg-sky-600 text-white">NÖBET SONRASI İZİN</option>
                          <option value="ASKERLİK" className="bg-slate-800 text-white">ASKERLİK</option>
                        </select>
                      </div>
                    );
                  })}
                </div>

                {!isMaximized && (
                  <div 
                    onMouseDown={handleMouseDownResize}
                    className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize flex items-center justify-center opacity-40 hover:opacity-100"
                    title="Boyutu Değiştir"
                  >
                    <span className="text-[10px] font-mono font-black">◢</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {isMinimized && (
            <div className="fixed bottom-4 right-4 z-[250]">
              <div 
                onClick={() => setIsMinimized(false)}
                className={`p-3 px-4 rounded-xl border-2 shadow-xl flex items-center gap-3 cursor-pointer hover:scale-105 transition-all ${
                  isDarkMode ? 'bg-slate-900 border-amber-500/50 text-slate-100' : 'bg-white border-amber-500 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 font-black text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>📅 {selectedDoctor.name} (TAKVİM)</span>
                </div>
                
                <div className="flex items-center gap-1 font-mono">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }} 
                    className="px-2 py-0.5 bg-amber-500/20 text-amber-500 rounded text-[11px] font-black hover:bg-amber-500 hover:text-slate-950"
                  >
                    🗖 BÜYÜT
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleCloseScheduleModal(); }} 
                    className="px-2 py-0.5 bg-rose-500/20 text-rose-500 rounded text-[11px] font-black hover:bg-rose-500 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-[200]">
          <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl border-2 border-emerald-400 text-xs font-black flex items-center gap-2 animate-fadeIn">
            <span>✅</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}