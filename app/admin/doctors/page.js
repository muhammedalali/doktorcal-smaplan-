'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { db } from '@/lib/firebase';
import { addDoc, deleteDoc, doc, updateDoc, collection } from 'firebase/firestore';

import { defaultDepartments } from './constants/departmentsData';
import { generateFullMonthSchedule } from './utils/scheduleUtils';
import DoctorsSidebar from './components/DoctorsSidebar';
import DoctorDetailCard from './components/DoctorDetailCard';
import AddDoctorSection from './components/AddDoctorSection';
import EditDoctorModal from './components/EditDoctorModal';
import DoctorScheduleModal from './components/DoctorScheduleModal';
import ConfirmModals from './components/ConfirmModals';

export default function AdminDoctorsPage() {
  // ✅ 1. استدعاء triggerToast من ThemeContext
  const { isDarkMode, triggerToast } = useTheme(); 
  const { doctors = [], setDoctors, checkPermission, loading, currentUser } = useData();
  
  const [openedFolder, setOpenedFolder] = useState('LIST_FOLDER'); 
  const [searchQuery, setSearchQuery] = useState('');

  const [departments, setDepartments] = useState(defaultDepartments);
  const [newCustomDept, setNewCustomDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [originalDoctorBackup, setOriginalDoctorBackup] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmCloseModal, setShowConfirmCloseModal] = useState(false);

  const [expandedDepts, setExpandedDepts] = useState({});
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // ✅ State للـ Position والـ Size
  const [winPos, setWinPos] = useState({ x: 0, y: 0 });
  const [winSize, setWinSize] = useState({ width: 880, height: 620 });
  
  const currentDate = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());

  const [deletingDept, setDeletingDept] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(null);

  const [docName, setDocName] = useState('');
  const [docClinic, setDocClinic] = useState(defaultDepartments[0]);
  const [docDahili, setDocDahili] = useState('');
  const [docRoomNo, setDocRoomNo] = useState('');

  const todayRef = useRef(null);
  const modalBoxRef = useRef(null);
  
  // ✅ Refs لإدارة السحب والتكبير والـ Initialization
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const initializedRef = useRef(false);

  const router = useRouter();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const canManageDocs = checkPermission ? checkPermission('bölüm ve doktor yönetimi') : true;
  const canEditDocs = checkPermission ? checkPermission('bölüm ve doktor düzeltme yetkisi') : true;
  const canDeleteDocs = checkPermission ? checkPermission('bölüm ve doktor silme yetkisi') : true;
  const canChangeStatus = checkPermission ? checkPermission('çalışma durumu değiştirme') : true;

  // ✅ 2. تم حذف دالة الإشعار الوهمية من هنا. سيتم استخدام triggerToast من useTheme.

  // 🎯 قفل التمرير الخارجي للمتصفح بالكامل لمنع نزول الهيكل العام
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!canManageDocs && !currentUser) {
      router.replace('/dashboard');
      return;
    }

    if (!initializedRef.current) {
      const savedDepts = JSON.parse(localStorage.getItem('app_departments') || '[]');
      let currentDepts = defaultDepartments;
      if (savedDepts.length > 0) {
        currentDepts = Array.from(new Set(savedDepts));
      } else {
        localStorage.setItem('app_departments', JSON.stringify(defaultDepartments));
      }
      setDepartments(currentDepts);
      setExpandedDepts({});
      initializedRef.current = true;
    }
  }, [canManageDocs, loading, currentUser, router]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (editingDoctor) setEditingDoctor(null);
        else if (showConfirmCloseModal) setShowConfirmCloseModal(false);
        else if (deletingDoc) setDeletingDoc(null);
        else if (deletingDept) setDeletingDept(null);
        else if (showScheduleModal) handleRequestCloseScheduleModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingDoctor, showConfirmCloseModal, deletingDoc, deletingDept, showScheduleModal]);

  const toggleDeptExpand = (deptName) => {
    setExpandedDepts(prev => (prev[deptName] ? {} : { [deptName]: true }));
  };

  // ✅ استخدام Pointer Events (يدعم الماوس واللمس) مع requestAnimationFrame لمنع التعليق
  const handlePointerDownHeader = (e) => {
    if (isMaximized) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    
    e.preventDefault();
    
    const modal = modalBoxRef.current;
    if (!modal) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = winPos.x;
    const initialY = winPos.y;
    let rafId = null;

    const handlePointerMove = (moveEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        const newX = initialX + deltaX;
        const newY = initialY + deltaY;
        modal.style.transform = `translate(${newX}px, ${newY}px)`;
      });
    };

    const handlePointerUp = (upEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      const deltaX = upEvent.clientX - startX;
      const deltaY = upEvent.clientY - startY;
      setWinPos({ x: initialX + deltaX, y: initialY + deltaY });
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerDownResize = (e) => {
    e.stopPropagation();
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();

    const modal = modalBoxRef.current;
    if (!modal) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialWidth = winSize.width;
    const initialHeight = winSize.height;
    let rafId = null;

    const handlePointerMove = (moveEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        
        const newWidth = Math.max(340, initialWidth + deltaX);
        const newHeight = Math.max(400, initialHeight + deltaY);

        modal.style.width = `${newWidth}px`;
        modal.style.height = `${newHeight}px`;
      });
    };

    const handlePointerUp = (upEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      const deltaX = upEvent.clientX - startX;
      const deltaY = upEvent.clientY - startY;
      
      const newWidth = Math.max(340, initialWidth + deltaX);
      const newHeight = Math.max(400, initialHeight + deltaY);

      setWinSize({ width: newWidth, height: newHeight });
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleDoctorClickFromTree = (docItem) => {
    if (selectedDoctor?.id === docItem.id) {
      handleOpenSchedule(docItem);
    } else {
      setSelectedDoctor(docItem);
      setOpenedFolder('LIST_FOLDER');
    }
  };

  const handleOpenSchedule = (docItem) => {
    setSelectedDoctor(docItem);
    setOriginalDoctorBackup(JSON.parse(JSON.stringify(docItem)));
    setHasUnsavedChanges(false);
    setIsMinimized(false);
    setIsMaximized(false);
    setWinPos({ x: 0, y: 0 });
    setShowScheduleModal(true);
  };

  const handleTransferToEditDoctor = (docItem) => {
    setShowScheduleModal(false);
    setEditingDoctor(docItem);
  };

  const handleSaveChangesDirectly = async () => {
    if (!selectedDoctor) return;
    if (!canChangeStatus) {
      alert('Çalışma durumunu değiştirme yetkiniz bulunmamaktadır!');
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
      setOriginalDoctorBackup(JSON.parse(JSON.stringify(selectedDoctor)));
      setHasUnsavedChanges(false);
      triggerToast(`Takvim başarıyla kaydedildi: ${selectedDoctor.name}`);
    } catch (e) {
      console.error('Takvim güncelleme hatası:', e);
    }
  };

  const handleDiscardChanges = () => {
    if (originalDoctorBackup && setDoctors && selectedDoctor) {
      setSelectedDoctor(JSON.parse(JSON.stringify(originalDoctorBackup)));
      setDoctors(prev => prev.map(d => d.id === selectedDoctor.id ? JSON.parse(JSON.stringify(originalDoctorBackup)) : d));
    }
    setHasUnsavedChanges(false);
  };

  const handleRequestCloseScheduleModal = () => {
    if (hasUnsavedChanges) {
      setShowConfirmCloseModal(true);
    } else {
      setShowScheduleModal(false);
    }
  };

  const handleConfirmCloseYes = async () => {
    await handleSaveChangesDirectly();
    setShowConfirmCloseModal(false);
    setShowScheduleModal(false);
  };

  const handleConfirmCloseNo = () => {
    handleDiscardChanges();
    setShowConfirmCloseModal(false);
    setShowScheduleModal(false);
  };

  const handleRegenerateMonth = (year, month) => {
    if (!selectedDoctor) return;
    const newSchedule = generateFullMonthSchedule(year, month);
    const updatedDoc = { ...selectedDoctor, scheduleDays: newSchedule };
    setSelectedDoctor(updatedDoc);
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
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
      setExpandedDepts({ [deptUpper]: true });
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
    if (selectedDoctor?.clinic === deletingDept) setSelectedDoctor(null);
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
      if (selectedDoctor?.id === deletingDoc.id) setSelectedDoctor(null);
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
      const createdObj = { id: docRef.id, ...newDoc };
      if (setDoctors) {
        setDoctors(prev => [...prev, createdObj]);
      }
      setDocName(''); setDocDahili(''); setDocRoomNo('');
      triggerToast(`Doktor eklendi: ${newDoc.name}`);
      setOpenedFolder('LIST_FOLDER');
      setSelectedDoctor(createdObj);
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
      if (selectedDoctor?.id === editingDoctor.id) {
        setSelectedDoctor(prev => ({ ...prev, ...updatedData }));
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

  const uniqueDepartments = useMemo(() => Array.from(new Set(departments)), [departments]);

  const stats = useMemo(() => {
    const totalDocs = doctors.length;
    return { totalDeps: uniqueDepartments.length, totalDocs };
  }, [doctors, uniqueDepartments]);

  const getDoctorTodayStatus = useCallback((docItem) => {
    if (!docItem?.scheduleDays || docItem.scheduleDays.length === 0) return 'POLİKLİNİK';
    const todayStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
    const todaySchedule = docItem.scheduleDays.find(s => s.date === todayStr);
    return todaySchedule ? todaySchedule.status : 'POLİKLİNİK';
  }, [today]);

  const monthScheduleStats = useMemo(() => {
    if (!selectedDoctor?.scheduleDays) return { poliklinik: 0, ameliyat: 0, izin: 0 };
    let poliklinik = 0, ameliyat = 0, izin = 0;
    selectedDoctor.scheduleDays.forEach(d => {
      if (d.status === 'POLİKLİNİK' || d.status === 'POLİK') poliklinik++;
      else if (d.status === 'AMELİYATTA') ameliyat++;
      else if (d.status !== 'HAFTA SONU' && d.status !== 'RESMİ TATİL') izin++;
    });
    return { poliklinik, ameliyat, izin };
  }, [selectedDoctor?.scheduleDays]);

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center h-dvh w-full space-y-3 font-black ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}>
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 uppercase tracking-widest font-black">SİSTEM YÜKLENİYOR...</p>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 flex flex-col lg:flex-row h-dvh max-h-dvh w-full overflow-hidden select-none transition-colors duration-300 relative cursor-default ${
      isDarkMode ? 'bg-[#020617] text-white' : 'bg-[#edf4ff] text-slate-900'
    }`} dir="ltr">

      {/* Mobile Header Toggle */}
      <div className={`lg:hidden flex items-center justify-between p-3 border-b shrink-0 z-30 ${
        isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-blue-200'
      }`}>
        <span className="text-cyan-500 dark:text-cyan-400 font-black text-xs uppercase tracking-wider">
          🏥 DOKTOR YÖNETİMİ
        </span>
        <button
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl text-xs font-black transition-all shadow-md active:scale-95 cursor-default"
        >
          {showMobileSidebar ? '✕ Kapat' : '📁 Bölüm Gezgini'}
        </button>
      </div>

      {/* Sidebar */}
      <DoctorsSidebar
        isDarkMode={isDarkMode}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        showMobileSidebar={showMobileSidebar}
        setShowMobileSidebar={setShowMobileSidebar}
        canManageDocs={canManageDocs}
        canDeleteDocs={canDeleteDocs}
        setOpenedFolder={setOpenedFolder}
        setSelectedDoctor={setSelectedDoctor}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        uniqueDepartments={uniqueDepartments}
        expandedDepts={expandedDepts}
        toggleDeptExpand={toggleDeptExpand}
        getDoctorsByDept={getDoctorsByDept}
        selectedDoctor={selectedDoctor}
        handleDoctorClickFromTree={handleDoctorClickFromTree}
        getDoctorTodayStatus={getDoctorTodayStatus}
        setDeletingDept={setDeletingDept}
        stats={stats}
      />

      {/* Main Workspace */}
      <main className={`flex-1 flex flex-col h-full min-w-0 overflow-hidden w-full transition-all duration-300 ${
        isDarkMode ? 'bg-[#020617] text-white' : 'bg-[#edf4ff] text-slate-900'
      }`} dir="ltr">
        
        {/* Workspace Breadcrumb Header */}
        <div className={`h-11 border-b flex items-center px-3 sm:px-4 gap-2 overflow-x-auto select-none shrink-0 scrollbar-none ${
          isDarkMode ? 'bg-slate-950/60 border-slate-800/60' : 'bg-white/60 border-blue-200/60'
        }`}>
          {isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black border transition-all cursor-default ${
                isDarkMode 
                  ? 'bg-slate-900 border-cyan-500/30 text-cyan-400 hover:bg-slate-800' 
                  : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50'
              }`}
              title="Gezgini Aç"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                <path strokeWidth="2" strokeLinecap="round" d="M9 3v18" />
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M11 9l3 3-3 3" />
              </svg>
              <span>Gezgin</span>
            </button>
          )}

          {openedFolder === 'ADD_FOLDER' ? (
            <div className={`flex items-center gap-2 px-3 py-1.5 border-t-2 text-xs font-mono font-black rounded-t-xl shrink-0 ${
              isDarkMode 
                ? 'bg-slate-900 border-amber-500 text-amber-300' 
                : 'bg-white border-amber-600 text-amber-900 shadow-2xs'
            }`}>
              <span>➕ Yeni Ekle (Bölüm / Doktor)</span>
              <button onClick={() => setOpenedFolder('LIST_FOLDER')} className="hover:bg-slate-200 dark:hover:bg-slate-800 p-0.5 rounded text-slate-400 hover:text-rose-500 font-black cursor-default">✕</button>
            </div>
          ) : selectedDoctor ? (
            <div className={`flex items-center gap-2 px-3 py-1.5 border-t-2 text-xs font-mono font-black rounded-t-xl shrink-0 ${
              isDarkMode 
                ? 'bg-slate-900 border-cyan-500 text-cyan-300' 
                : 'bg-white border-blue-600 text-blue-900 shadow-2xs'
            }`}>
              <span>🩺 {selectedDoctor.name}</span>
              <button onClick={() => setSelectedDoctor(null)} className="hover:bg-slate-200 dark:hover:bg-slate-800 p-0.5 rounded text-slate-400 hover:text-rose-500 font-black cursor-default">✕</button>
            </div>
          ) : (
            <div className="text-xs text-slate-400 dark:text-slate-500 font-black italic truncate">
              Doktor detayları ve takvim yönetimi
            </div>
          )}
        </div>

        {/* Scrollable Main Area */}
        <div className={`flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 overscroll-contain ${
          isDarkMode ? 'bg-[#020617] text-white' : 'bg-[#edf4ff] text-slate-900'
        }`}>
          {openedFolder === 'ADD_FOLDER' && (
            <AddDoctorSection
              isDarkMode={isDarkMode}
              setOpenedFolder={setOpenedFolder}
              handleAddCustomDepartment={handleAddCustomDepartment}
              newCustomDept={newCustomDept}
              setNewCustomDept={setNewCustomDept}
              handleSaveNewDoctor={handleSaveNewDoctor}
              docClinic={docClinic}
              setDocClinic={setDocClinic}
              uniqueDepartments={uniqueDepartments}
              docName={docName}
              setDocName={setDocName}
              docDahili={docDahili}
              setDocDahili={setDocDahili}
              docRoomNo={docRoomNo}
              setDocRoomNo={setDocRoomNo}
            />
          )}

          {selectedDoctor && openedFolder !== 'ADD_FOLDER' && (
            <DoctorDetailCard
              selectedDoctor={selectedDoctor}
              isDarkMode={isDarkMode}
              handleOpenSchedule={handleOpenSchedule}
              setEditingDoctor={setEditingDoctor}
              canDeleteDocs={canDeleteDocs}
              setDeletingDoc={setDeletingDoc}
              getDoctorTodayStatus={getDoctorTodayStatus}
            />
          )}

          {!selectedDoctor && openedFolder !== 'ADD_FOLDER' && (
            <div className="h-full min-h-[50vh] flex flex-col items-center justify-center text-slate-400 space-y-3 py-16 select-none text-center">
              <span className="text-5xl sm:text-6xl opacity-30 animate-pulse">🩺</span>
              <p className="text-xs sm:text-sm font-mono font-black uppercase">
                Bir doktor seçerek detaylarını inceleyin
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Global Modals */}
      <EditDoctorModal
        editingDoctor={editingDoctor}
        setEditingDoctor={setEditingDoctor}
        handleSaveEditedDoctor={handleSaveEditedDoctor}
        uniqueDepartments={uniqueDepartments}
        isDarkMode={isDarkMode}
      />

      <DoctorScheduleModal
        showScheduleModal={showScheduleModal}
        selectedDoctor={selectedDoctor}
        isMinimized={isMinimized}
        setIsMinimized={setIsMinimized}
        isMaximized={isMaximized}
        setIsMaximized={setIsMaximized}
        modalBoxRef={modalBoxRef}
        winPos={winPos}
        winSize={winSize}
        isDarkMode={isDarkMode}
        handleMouseDownHeader={handlePointerDownHeader}
        handleTransferToEditDoctor={handleTransferToEditDoctor}
        handleRequestCloseScheduleModal={handleRequestCloseScheduleModal}
        monthScheduleStats={monthScheduleStats}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        handleRegenerateMonth={handleRegenerateMonth}
        todayRef={todayRef}
        today={today}
        canChangeStatus={canChangeStatus}
        handleDayStatusChange={handleDayStatusChange}
        hasUnsavedChanges={hasUnsavedChanges}
        handleDiscardChanges={handleDiscardChanges}
        handleSaveChangesDirectly={handleSaveChangesDirectly}
        handleMouseDownResize={handlePointerDownResize}
      />

      <ConfirmModals
        deletingDept={deletingDept}
        canDeleteDocs={canDeleteDocs}
        setDeletingDept={setDeletingDept}
        handleConfirmDeleteDepartment={handleConfirmDeleteDepartment}
        deletingDoc={deletingDoc}
        setDeletingDoc={setDeletingDoc}
        handleConfirmDeleteDoctor={handleConfirmDeleteDoctor}
        showConfirmCloseModal={showConfirmCloseModal}
        handleConfirmCloseNo={handleConfirmCloseNo}
        handleConfirmCloseYes={handleConfirmCloseYes}
        isDarkMode={isDarkMode}
      />

    </div>
  );
}