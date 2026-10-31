'use client';

import { useState, useEffect, useRef, useCallback, useMemo, useDeferredValue } from 'react';
import { useRouter } from 'next/navigation';

import { useTheme, CustomToastLogo } from '@/context/ThemeContext';
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
  const { isDarkMode, triggerToast } = useTheme();
  const { doctors = [], setDoctors, checkPermission, loading, currentUser } = useData();

  const [openedFolder, setOpenedFolder] = useState('LIST_FOLDER');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);

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

  const [winPos, setWinPos] = useState({ x: 0, y: 0 });
  const [winSize, setWinSize] = useState({ width: 850, height: 600 });

  const currentDate = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());

  const [deletingDept, setDeletingDept] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(null);

  const [docName, setDocName] = useState('');
  const [docClinic, setDocClinic] = useState(defaultDepartments[0] || 'GENEL');
  const [docDahili, setDocDahili] = useState('');
  const [docRoomNo, setDocRoomNo] = useState('');

  const todayRef = useRef(null);
  const modalBoxRef = useRef(null);
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
      try {
        const raw = localStorage.getItem('app_departments');
        if (raw === null) {
          localStorage.setItem('app_departments', JSON.stringify(defaultDepartments));
          setDepartments(defaultDepartments);
        } else {
          const savedDepts = JSON.parse(raw);
          if (Array.isArray(savedDepts)) setDepartments(savedDepts);
          else {
            localStorage.setItem('app_departments', JSON.stringify(defaultDepartments));
            setDepartments(defaultDepartments);
          }
        }
      } catch (err) {
        console.error('LocalStorage Read Error:', err);
        setDepartments(defaultDepartments);
      }
      setExpandedDepts({});
      initializedRef.current = true;
    }
  }, [canManageDocs, loading, currentUser, router]);

  useEffect(() => {
    if (!selectedDoctor) return;
    const stillExists = doctors.some((d) => d.id === selectedDoctor.id);
    if (!stillExists) {
      setSelectedDoctor(null);
      setEditingDoctor(null);
      setShowScheduleModal(false);
      setDeletingDoc(null);
      setOriginalDoctorBackup(null);
      setHasUnsavedChanges(false);
      setOpenedFolder('LIST_FOLDER');
    }
  }, [doctors, selectedDoctor]);

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

  const toggleDeptExpand = useCallback((deptName) => {
    setExpandedDepts((prev) => (prev[deptName] ? {} : { [deptName]: true }));
  }, []);

  const handlePointerDownHeader = useCallback((e) => {
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
        modal.style.transform = `translate(${initialX + deltaX}px, ${initialY + deltaY}px)`;
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
  }, [isMaximized, winPos]);

  const handlePointerDownResize = useCallback((e) => {
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
        const newWidth = Math.max(340, initialWidth + (moveEvent.clientX - startX));
        const newHeight = Math.max(400, initialHeight + (moveEvent.clientY - startY));
        modal.style.width = `${newWidth}px`;
        modal.style.height = `${newHeight}px`;
      });
    };

    const handlePointerUp = (upEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      const newWidth = Math.max(340, initialWidth + (upEvent.clientX - startX));
      const newHeight = Math.max(400, initialHeight + (upEvent.clientY - startY));
      setWinSize({ width: newWidth, height: newHeight });
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
  }, [winSize]);

  const handleOpenSchedule = useCallback((docItem) => {
    setSelectedDoctor(docItem);
    setOriginalDoctorBackup(JSON.parse(JSON.stringify(docItem)));
    setHasUnsavedChanges(false);
    setIsMinimized(false);
    setIsMaximized(false);
    setWinPos({ x: 0, y: 0 });

    if (typeof window !== 'undefined') {
      const w = Math.min(850, window.innerWidth - 40);
      const h = Math.min(600, window.innerHeight - 80);
      setWinSize({ width: Math.floor(w), height: Math.floor(h) });
    } else {
      setWinSize({ width: 850, height: 600 });
    }

    setShowScheduleModal(true);
  }, []);

  const handleDoctorClickFromTree = useCallback((docItem) => {
    if (selectedDoctor?.id === docItem.id) {
      handleOpenSchedule(docItem);
    } else {
      setSelectedDoctor(docItem);
      setOpenedFolder('LIST_FOLDER');
    }
  }, [selectedDoctor?.id, handleOpenSchedule]);

  const handleTransferToEditDoctor = useCallback((docItem) => {
    setEditingDoctor(docItem);
  }, []);

  const handleSaveChangesDirectly = async () => {
    if (!selectedDoctor) return;
    if (!canChangeStatus) {
      triggerToast('Çalışma durumunu değiştirme yetkiniz bulunmamaktadır!', 'error');
      return;
    }
    try {
      await updateDoc(doc(db, 'doctors', selectedDoctor.id), {
        scheduleDays: selectedDoctor.scheduleDays,
        updatedAt: Date.now(),
      });
      if (setDoctors) {
        setDoctors((prev) => prev.map((d) => (d.id === selectedDoctor.id ? selectedDoctor : d)));
      }
      setOriginalDoctorBackup(JSON.parse(JSON.stringify(selectedDoctor)));
      setHasUnsavedChanges(false);
      triggerToast(`Takvim başarıyla kaydedildi: ${selectedDoctor.name}`, 'success');
    } catch (e) {
      console.error('Takvim güncelleme hatası:', e);
      triggerToast('Takvim güncellenirken bir hata oluştu!', 'error');
    }
  };

  const handleDiscardChanges = useCallback(() => {
    if (originalDoctorBackup && setDoctors && selectedDoctor) {
      setSelectedDoctor(JSON.parse(JSON.stringify(originalDoctorBackup)));
      setDoctors((prev) => prev.map((d) => (d.id === selectedDoctor.id ? JSON.parse(JSON.stringify(originalDoctorBackup)) : d)));
    }
    setHasUnsavedChanges(false);
    triggerToast('Değişiklikler geri alındı.', 'success');
  }, [originalDoctorBackup, selectedDoctor, setDoctors, triggerToast]);

  const handleRequestCloseScheduleModal = useCallback(() => {
    if (hasUnsavedChanges) setShowConfirmCloseModal(true);
    else setShowScheduleModal(false);
  }, [hasUnsavedChanges]);

  const handleConfirmCloseYes = async () => {
    await handleSaveChangesDirectly();
    setShowConfirmCloseModal(false);
    setShowScheduleModal(false);
  };

  const handleConfirmCloseNo = useCallback(() => {
    handleDiscardChanges();
    setShowConfirmCloseModal(false);
    setShowScheduleModal(false);
  }, [handleDiscardChanges]);

  const handleRegenerateMonth = useCallback((year, month) => {
    if (!selectedDoctor) return;
    const newSchedule = generateFullMonthSchedule(year, month);
    setSelectedDoctor({ ...selectedDoctor, scheduleDays: newSchedule });
    setHasUnsavedChanges(true);
    triggerToast('Aylık takvim yeniden oluşturuldu.', 'success');
  }, [selectedDoctor, triggerToast]);

  const handleDayStatusChange = useCallback((index, newStatus) => {
    if (!canChangeStatus) {
      triggerToast('Çalışma durumunu değiştirme yetkiniz bulunmamaktadır!', 'error');
      return;
    }
    if (!selectedDoctor) return;
    const updatedSchedule = [...selectedDoctor.scheduleDays];
    updatedSchedule[index] = { ...updatedSchedule[index], status: newStatus };
    setSelectedDoctor({ ...selectedDoctor, scheduleDays: updatedSchedule });
    setHasUnsavedChanges(true);
  }, [canChangeStatus, selectedDoctor, triggerToast]);

  const handleAddCustomDepartment = (e) => {
    e.preventDefault();
    if (!canManageDocs) {
      triggerToast('Bölüm ekleme yetkiniz bulunmamaktadır!', 'error');
      return;
    }
    if (!newCustomDept.trim()) return;

    const deptUpper = newCustomDept.trim().toLocaleUpperCase('tr-TR');

    if (departments.includes(deptUpper)) {
      triggerToast('Bu bölüm zaten mevcut!', 'error');
      setNewCustomDept('');
      return;
    }

    const updated = Array.from(new Set([...departments, deptUpper]));
    setDepartments(updated);
    localStorage.setItem('app_departments', JSON.stringify(updated));
    setExpandedDepts((prev) => ({ ...prev, [deptUpper]: true }));

    triggerToast(`Bölüm başarıyla eklendi: ${deptUpper}`, 'success');
    setNewCustomDept('');
  };

  const handleConfirmDeleteDepartment = () => {
    if (!canDeleteDocs) {
      triggerToast('Bölüm silme yetkiniz bulunmamaktadır!', 'error');
      setDeletingDept(null);
      return;
    }
    if (!deletingDept) return;

    try {
      const deletedDept = deletingDept;
      const updatedDepts = departments.filter((d) => d !== deletedDept);

      if (updatedDepts.length === departments.length) {
        triggerToast(`Bölüm bulunamadı: ${deletedDept}`, 'error');
        setDeletingDept(null);
        return;
      }

      setDepartments(updatedDepts);
      localStorage.setItem('app_departments', JSON.stringify(updatedDepts));

      setExpandedDepts((prev) => {
        const next = { ...prev };
        delete next[deletedDept];
        return next;
      });

      if (selectedDoctor?.clinic === deletedDept) {
        setSelectedDoctor(null);
        setEditingDoctor(null);
        setShowScheduleModal(false);
        setDeletingDoc(null);
        setOriginalDoctorBackup(null);
        setHasUnsavedChanges(false);
        setOpenedFolder('LIST_FOLDER');
      }
      if (editingDoctor?.clinic === deletedDept) setEditingDoctor(null);
      if (deletingDoc?.clinic === deletedDept) setDeletingDoc(null);

      triggerToast(`Bölüm silindi: ${deletedDept}`, 'delete');
    } catch (err) {
      console.error('Bölüm silme hatası:', err);
      triggerToast('Bölüm silinirken bir hata oluştu!', 'error');
    } finally {
      setDeletingDept(null);
    }
  };

  const handleConfirmDeleteDoctor = async () => {
    if (!canDeleteDocs) {
      triggerToast('Doktor silme yetkiniz bulunmamaktadır!', 'error');
      setDeletingDoc(null);
      return;
    }
    if (!deletingDoc) return;

    const deletedId = deletingDoc.id;
    const deletedName = deletingDoc.name;

    try {
      await deleteDoc(doc(db, 'doctors', deletedId));
      if (setDoctors) setDoctors((prev) => prev.filter((d) => d.id !== deletedId));

      if (selectedDoctor?.id === deletedId) {
        setSelectedDoctor(null);
        setEditingDoctor(null);
        setShowScheduleModal(false);
        setOriginalDoctorBackup(null);
        setHasUnsavedChanges(false);
        setOpenedFolder('LIST_FOLDER');
      }
      if (editingDoctor?.id === deletedId) setEditingDoctor(null);

      triggerToast(`Doktor silindi: ${deletedName}`, 'delete');
      setDeletingDoc(null);
    } catch (e) {
      console.error('Doktor silme hatası:', e);
      triggerToast('Doktor silinirken bir hata oluştu.', 'error');
    }
  };

  const handleSaveNewDoctor = async (e) => {
    e.preventDefault();
    if (!canManageDocs) {
      triggerToast('Doktor ekleme yetkiniz bulunmamaktadır!', 'error');
      return;
    }
    if (!docName) {
      triggerToast('Lütfen doktor adını giriniz!', 'error');
      return;
    }
    const now = Date.now();
    const newDoc = {
      name: docName.trim().toLocaleUpperCase('tr-TR'),
      clinic: docClinic.trim().toLocaleUpperCase('tr-TR'),
      status: 'POLİKLİNİK',
      dahili: docDahili || '',
      roomNo: docRoomNo || '',
      scheduleDays: generateFullMonthSchedule(selectedYear, selectedMonth),
      createdAt: now,
      updatedAt: now,
    };
    try {
      const docRef = await addDoc(collection(db, 'doctors'), newDoc);
      const createdObj = { id: docRef.id, ...newDoc };
      if (setDoctors) setDoctors((prev) => [...prev, createdObj]);
      setDocName('');
      setDocDahili('');
      setDocRoomNo('');
      triggerToast(`Doktor başarıyla eklendi: ${newDoc.name}`, 'success');
      setOpenedFolder('LIST_FOLDER');
      setSelectedDoctor(createdObj);
    } catch (e) {
      console.error('Doktor ekleme hatası:', e);
      triggerToast('Doktor eklenirken hata oluştu.', 'error');
    }
  };

  const handleSaveEditedDoctor = async (e) => {
    e.preventDefault();
    if (!canEditDocs) {
      triggerToast('Doktor bilgilerini düzeltme yetkiniz bulunmamaktadır!', 'error');
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
        updatedAt: Date.now(),
      };
      await updateDoc(doc(db, 'doctors', editingDoctor.id), updatedData);
      if (setDoctors) {
        setDoctors((prev) => prev.map((d) => (d.id === editingDoctor.id ? { ...d, ...updatedData } : d)));
      }
      if (selectedDoctor?.id === editingDoctor.id) {
        setSelectedDoctor((prev) => ({ ...prev, ...updatedData }));
      }
      setEditingDoctor(null);
      triggerToast(`Doktor bilgileri güncellendi: ${editingDoctor.name}`, 'success');
    } catch (e) {
      console.error('Doktor güncelleme hatası:', e);
      triggerToast('Bilgiler güncellenirken hata oluştu.', 'error');
    }
  };

  const doctorsByDeptIndex = useMemo(() => {
    const index = new Map();
    for (const d of doctors) {
      const key = d.clinic?.trim().toLocaleUpperCase('tr-TR');
      if (!key) continue;
      let bucket = index.get(key);
      if (!bucket) {
        bucket = [];
        index.set(key, bucket);
      }
      bucket.push(d);
    }
    return index;
  }, [doctors]);

  const getDoctorsByDept = useCallback((deptName) => {
    const cleanDept = deptName.trim().toLocaleUpperCase('tr-TR');
    let filtered = doctorsByDeptIndex.get(cleanDept) || [];

    if (filtered.length > 1) {
      const uniqueMap = new Map();
      filtered.forEach((d) => uniqueMap.set(d.id || d.name, d));
      filtered = Array.from(uniqueMap.values());
    }

    if (deferredSearchQuery.trim()) {
      const q = deferredSearchQuery.trim().toLocaleUpperCase('tr-TR');
      if (cleanDept.includes(q)) return filtered;
      filtered = filtered.filter((d) =>
        d.name?.toLocaleUpperCase('tr-TR').includes(q) ||
        d.dahili?.toLocaleUpperCase('tr-TR').includes(q) ||
        d.roomNo?.toLocaleUpperCase('tr-TR').includes(q)
      );
    }

    return filtered;
  }, [doctorsByDeptIndex, deferredSearchQuery]);

  const uniqueDepartments = useMemo(() => Array.from(new Set(departments)), [departments]);

  const stats = useMemo(() => ({
    totalDeps: uniqueDepartments.length,
    totalDocs: doctors.length,
  }), [doctors, uniqueDepartments]);

  const getDoctorTodayStatus = useCallback((docItem) => {
    if (!docItem?.scheduleDays || docItem.scheduleDays.length === 0) return 'POLİKLİNİK';
    const todayStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
    const todaySchedule = docItem.scheduleDays.find((s) => s.date === todayStr);
    return todaySchedule ? todaySchedule.status : 'POLİKLİNİK';
  }, [today]);

  // ✅ تحديث حساب الإحصائيات ليتعرف على AMELİYAT
  const monthScheduleStats = useMemo(() => {
    if (!selectedDoctor?.scheduleDays) return { poliklinik: 0, ameliyat: 0, izin: 0 };
    let poliklinik = 0, ameliyat = 0, izin = 0;
    for (const d of selectedDoctor.scheduleDays) {
      if (d.status === 'POLİKLİNİK' || d.status === 'POLİK') poliklinik++;
      else if (d.status === 'AMELİYAT' || d.status === 'AMELİYATTA') ameliyat++;
      else if (d.status !== 'HAFTA SONU' && d.status !== 'RESMİ TATİL') izin++;
    }
    return { poliklinik, ameliyat, izin };
  }, [selectedDoctor?.scheduleDays]);

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center h-dvh w-full space-y-4 font-black ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}>
        <CustomToastLogo />
        <p className="text-xs text-cyan-500 uppercase tracking-widest font-black animate-pulse">SİSTEM YÜKLENİYOR...</p>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 flex flex-col lg:flex-row h-dvh max-h-dvh w-full overflow-hidden select-none transition-colors duration-200 relative cursor-default ${
      isDarkMode ? 'bg-[#020617] text-white' : 'bg-[#edf4ff] text-slate-900'
    }`} dir="ltr">

      <div className={`lg:hidden flex items-center justify-between p-3 border-b shrink-0 z-30 ${
        isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-blue-200'
      }`}>
        <div className="flex items-center gap-2">
          <CustomToastLogo />
          <span className="text-cyan-500 dark:text-cyan-400 font-black text-xs uppercase tracking-wider">
            DOKTOR YÖNETİMİ
          </span>
        </div>
        <button
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer"
        >
          {showMobileSidebar ? '✕ Kapat' : '📁 Bölüm Gezgini'}
        </button>
      </div>

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

      <main className={`flex-1 flex flex-col h-full min-w-0 overflow-hidden w-full transition-all duration-200 ${
        isDarkMode ? 'bg-[#020617] text-white' : 'bg-[#edf4ff] text-slate-900'
      }`} dir="ltr">

        <div className={`h-11 border-b flex items-center px-3 sm:px-4 gap-2 overflow-x-auto select-none shrink-0 scrollbar-none ${
          isDarkMode ? 'bg-slate-950/60 border-slate-800/60' : 'bg-white/60 border-blue-200/60'
        }`}>
          {isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black border transition-colors duration-75 cursor-pointer ${
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
              <button onClick={() => setOpenedFolder('LIST_FOLDER')} className="hover:bg-slate-200 dark:hover:bg-slate-800 p-0.5 rounded text-slate-400 hover:text-rose-500 font-black cursor-pointer">✕</button>
            </div>
          ) : selectedDoctor ? (
            <div className={`flex items-center gap-2 px-3 py-1.5 border-t-2 text-xs font-mono font-black rounded-t-xl shrink-0 ${
              isDarkMode
                ? 'bg-slate-900 border-cyan-500 text-cyan-300'
                : 'bg-white border-blue-600 text-blue-900 shadow-2xs'
            }`}>
              <span className="truncate max-w-[200px]">🩺 {selectedDoctor.name}</span>
              <button onClick={() => setSelectedDoctor(null)} className="hover:bg-slate-200 dark:hover:bg-slate-800 p-0.5 rounded text-slate-400 hover:text-rose-500 font-black cursor-pointer">✕</button>
            </div>
          ) : (
            <div className="text-xs text-slate-400 dark:text-slate-500 font-black italic truncate">
              Doktor detayları ve takvim yönetimi
            </div>
          )}
        </div>

        <div className={`flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 overscroll-contain custom-scrollbar ${
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
            <div className="h-full min-h-[50vh] flex flex-col items-center justify-center text-slate-400 space-y-4 py-16 select-none text-center">
              <CustomToastLogo />
              <p className="text-xs sm:text-sm font-mono font-black uppercase tracking-wider text-cyan-500/80">
                Bir doktor seçerek detaylarını inceleyin
              </p>
            </div>
          )}
        </div>
      </main>

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