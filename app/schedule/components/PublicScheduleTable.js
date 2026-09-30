'use client'; 

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'; 
import { useRouter } from 'next/navigation'; 
import { useTheme } from '@/context/ThemeContext'; 
import { useData } from '@/context/DataContext';
import { TableSettingsProvider, useTableSettings } from '@/context/TableSettingsContext';
import TableSettingsModal from '@/components/TableSettingsModal';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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

const DAY_NAMES = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ'];

const generateFullMonthSchedule = (year = 2026, month = 8) => {
  const days = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    const dayNum = String(i).padStart(2, '0');
    const monthNum = String(month + 1).padStart(2, '0');
    const isoDateStr = `${year}-${monthNum}-${dayNum}`;
    const dateObj = new Date(year, month, i);
    const dayIndex = dateObj.getDay();
    const dayName = DAY_NAMES[dayIndex];
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
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
  }
  if (item.fullDateObj) {
    const d = new Date(item.fullDateObj);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
};

const getStatusStyles = (status, isPast = false) => {
  if (isPast) return 'bg-slate-600 text-white font-black tracking-wide';

  switch (status) {
    case 'POLİKLİNİK':
    case 'POLİK':
      return 'bg-emerald-600 text-white font-black tracking-wide';
    case 'AMELİYATTA':
      return 'bg-purple-600 text-white font-black tracking-wide';
    case 'RESMİ TATİL':
      return 'bg-indigo-600 text-white font-black tracking-wide';
    case 'HAFTA SONU':
      return 'bg-red-600 text-white font-black tracking-wide';
    case 'YILLIK İZİN':
      return 'bg-sky-500 text-white font-black tracking-wide';
    case 'RAPORLU':
      return 'bg-amber-600 text-white font-black tracking-wide';
    case 'NÖBET SONRASI İZİN':
      return 'bg-teal-600 text-white font-black tracking-wide';
    case 'ASKERLİK':
      return 'bg-stone-700 text-white font-black tracking-wide';
    case 'ŞUA İZNİ':
      return 'bg-cyan-600 text-white font-black tracking-wide';
    case 'KONGRE/SEMİNER':
      return 'bg-blue-600 text-white font-black tracking-wide';
    default:
      return 'bg-slate-700 text-white font-black tracking-wide';
  }
};

const getDateTextColor = (status, dayName, isPast, isDarkMode) => {
  if (isPast) {
    return isDarkMode ? 'text-slate-400 font-extrabold' : 'text-slate-600 font-extrabold';
  }

  if (dayName === 'CUMARTESİ' || dayName === 'PAZAR' || status === 'HAFTA SONU') {
    return 'text-red-500 dark:text-red-400 font-black';
  }

  switch (status) {
    case 'POLİKLİNİK':
    case 'POLİK':
      return 'text-emerald-500 dark:text-emerald-400 font-black';
    case 'AMELİYATTA':
      return 'text-purple-500 dark:text-purple-300 font-black';
    case 'RESMİ TATİL':
      return 'text-indigo-500 dark:text-indigo-400 font-black';
    case 'HAFTA SONU':
      return 'text-red-500 dark:text-red-400 font-black';
    case 'YILLIK İZİN':
      return 'text-sky-500 dark:text-sky-400 font-black';
    case 'RAPORLU':
      return 'text-amber-500 dark:text-amber-400 font-black';
    case 'NÖBET SONRASI İZİN':
      return 'text-teal-500 dark:text-teal-400 font-black';
    case 'ASKERLİK':
      return 'text-stone-400 dark:text-stone-300 font-black';
    case 'ŞUA İZNİ':
      return 'text-cyan-500 dark:text-cyan-400 font-black';
    case 'KONGRE/SEMİNER':
      return 'text-blue-500 dark:text-blue-400 font-black';
    default:
      return isDarkMode ? 'text-slate-100 font-black' : 'text-slate-950 font-black';
  }
};

// ⚡ DOCTOR ROW COMPONENT
const DoctorRow = memo(function DoctorRow({ doc, index, isSelected, isDarkMode, activeStatusToday, rowPaddingClass, tableSettings, onClick }) {
  const borderClasses = useMemo(() => {
    const { gridStyle, borderOpacity } = tableSettings;
    
    let opacityClass = 'border-slate-200 dark:border-slate-800/80';
    if (borderOpacity === 'light') opacityClass = 'border-slate-100 dark:border-slate-800/40';
    if (borderOpacity === 'strong') opacityClass = 'border-slate-400 dark:border-slate-600 stroke-[2]';

    let rightBorder = '';
    if (gridStyle === 'full' || gridStyle === 'vertical') {
      rightBorder = `border-r ${opacityClass}`;
    }

    return { rightBorder };
  }, [tableSettings]);

  return (
    <tr                        
      onClick={() => onClick(doc)}
      className={`cursor-default select-none transition-colors duration-150 ${                         
        isSelected
          ? isDarkMode
            ? 'bg-amber-500/20 text-amber-300 font-black'
            : 'bg-emerald-100/90 text-emerald-950 font-black'
          : isDarkMode                            
          ? index % 2 === 0                              
            ? 'bg-slate-900 hover:bg-slate-800/40'                              
            : 'bg-slate-950 hover:bg-slate-800/40'                           
          : index % 2 === 0                              
            ? 'bg-white hover:bg-slate-100/60'                              
            : 'bg-slate-50/80 hover:bg-slate-100/60'                       
      }`}                     
    >                       
      <td className={`${rowPaddingClass} ${borderClasses.rightBorder} text-center text-inherit`}>
        {index + 1}
      </td>

      {tableSettings.showClinic && (
        <td className={`${rowPaddingClass} ${borderClasses.rightBorder}`}>                         
          <span className="break-words">{doc.clinic}</span>                       
        </td>                       
      )}

      {tableSettings.showDoctorName && (
        <td className={`${rowPaddingClass} ${borderClasses.rightBorder}`}>                         
          <span className="break-words">{doc.name}</span>                       
        </td>                       
      )}

      {tableSettings.showStatus && (
        <td className={`${rowPaddingClass} text-center`}>                         
          <div className="flex justify-center">
            <span className={`inline-flex items-center justify-center min-w-[110px] sm:min-w-[140px] px-2.5 py-1.5 rounded-xl text-xs font-black shadow-xs ${getStatusStyles(activeStatusToday)}`}>                           
              <span className="w-2 h-2 rounded-full bg-white mr-1.5 animate-pulse shrink-0"></span>                           
              <span className="truncate">{activeStatusToday}</span>
            </span>                       
          </div>
        </td>                       
      )}
    </tr>
  );
});

// ⚡ MODAL DETAIL COMPONENT
const DoctorDetailModal = memo(function DoctorDetailModal({
  selectedDoctorDetail,
  isDarkMode,
  isMaximized,
  setIsMaximized,
  setIsMinimized,
  setSelectedDoctorDetail,
  todayTimestamp,
  todayFormattedStr
}) {
  const modalBoxRef = useRef(null);
  const modalScrollContainerRef = useRef(null);
  const todayRef = useRef(null);

  const [showScrollToTodayTop, setShowScrollToTodayTop] = useState(false);
  const [showScrollToTodayBottom, setShowScrollToTodayBottom] = useState(false);

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
    requestAnimationFrame(() => {
      scrollToTodayInstant();
    });
  }, [scrollToTodayInstant]);   

  const handleModalScroll = useCallback((e) => {
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
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-2 sm:p-6 cursor-default" 
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
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 border-b-2 flex justify-between items-center select-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>                   
          <div>                     
            <h3 className="text-base sm:text-xl font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-tight">{selectedDoctorDetail.name}</h3>                     
            <p className="text-xs sm:text-sm font-black text-slate-500 dark:text-slate-400 mt-0.5 uppercase">                       
              BİRİM: <span className="text-emerald-600 dark:text-emerald-400 font-black">{selectedDoctorDetail.clinic}</span>                  
            </p>                   
          </div>                   
          
          <div className="flex items-center gap-2 font-mono">                     
            <button 
              onClick={() => setIsMinimized(true)} 
              className={`w-10 h-10 rounded-2xl border font-black text-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 ${
                isDarkMode 
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-slate-950' 
                  : 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-500 hover:text-white'
              }`}
              title="Simge Durumuna Küçült"
            >
              🗕
            </button>                     
            
            <button 
              onClick={() => setIsMaximized(!isMaximized)} 
              className={`w-10 h-10 rounded-2xl border font-black text-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 ${
                isDarkMode 
                  ? 'bg-sky-500/10 border-sky-500/40 text-sky-400 hover:bg-sky-500 hover:text-white' 
                  : 'bg-sky-50 border-sky-300 text-sky-600 hover:bg-sky-500 hover:text-white'
              }`}
              title={isMaximized ? "Eski Boyuta Getir" : "Tam Ekran Yap"}
            >
              {isMaximized ? '🗗' : '🗖'}
            </button>                     
            
            <button 
              onClick={() => setSelectedDoctorDetail(null)} 
              className={`w-10 h-10 rounded-2xl border font-black text-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 ${
                isDarkMode 
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 hover:bg-rose-600 hover:text-white' 
                  : 'bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-600 hover:text-white'
              }`}
              title="Kapat"
            >
              ✕
            </button>                   
          </div>                 
        </div>                 

        <div className={`px-6 py-3 border-b ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>                   
          <h4 className="text-xs font-black text-amber-500 dark:text-amber-400 uppercase tracking-wider">                       
            📅 DETAYLI ÇALIŞMA VE İZİN TAKVİMİ                 
          </h4>                 
        </div>                 

        <div className="relative flex-1 overflow-hidden">
          {showScrollToTodayTop && (
            <button
              onClick={scrollToTodaySmooth}
              className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full font-black text-xs shadow-2xl border flex items-center gap-2.5 cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                isDarkMode
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-white border-emerald-600 text-emerald-900'
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
              className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full font-black text-xs shadow-2xl border flex items-center gap-2.5 cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                isDarkMode
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-white border-emerald-600 text-emerald-900'
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
                  const itemTime = itemDate.getTime();
                  isPast = itemTime < todayTimestamp;
                  isToday = itemTime === todayTimestamp;
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
                        <span className="text-[11px] sm:text-xs text-rose-500 dark:text-rose-400 font-black tracking-wide uppercase">
                          GEÇMİŞ TARİH
                        </span>
                      )}                             
                      
                      {isToday && (
                        <span className="text-xs sm:text-sm bg-amber-400 text-slate-950 font-black px-3.5 py-1 rounded-xl uppercase shadow-lg border border-amber-300 tracking-wider">
                          BUGÜN
                        </span>
                      )}                             
                      
                      {holidayName && (
                        <span className="text-xs bg-purple-600 text-white font-black px-2.5 py-1 rounded-lg uppercase">
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
              <div className="p-8 text-center text-slate-400 font-bold border-2 border-dashed rounded-2xl uppercase">                       
                Bu doktor için detaylı takvim bulunmamaktadır.                     
              </div>                   
            )}                 
          </div>                 
        </div>

      </div>             
    </div> 
  );
});

function PublicScheduleTableContent() {   
  const { doctors: rawDoctors } = useData(); 
  const { isDarkMode, toggleTheme } = useTheme(); 
  const { tableSettings, selectedFont, activeColor, customHexColor } = useTableSettings();

  const [filter, setFilter] = useState('HEPSİ');   
  const [searchTerm, setSearchTerm] = useState('');   
  const [sortBy, setSortBy] = useState('NEWEST');   
  const [doctors, setDoctors] = useState([]);   
  const [selectedDoctorDetail, setSelectedDoctorDetail] = useState(null);   
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);   
  const [isMinimized, setIsMinimized] = useState(false);   
  const [showPrintModal, setShowPrintModal] = useState(false);   
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [tableZoom, setTableZoom] = useState(100);
  const holdIntervalRef = useRef(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [showGeneralAppSettingsModal, setShowGeneralAppSettingsModal] = useState(false);
  const [showTableSettingsCustomModal, setShowTableSettingsCustomModal] = useState(false);

  const [reportText, setReportText] = useState('');
  const [reportCategory, setReportCategory] = useState('SİSTEM_HATASI');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const [toastNotification, setToastNotification] = useState({ show: false, leaving: false });

  const searchInputRef = useRef(null);
  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const menuDropdownRef = useRef(null);

  const router = useRouter();   

  useEffect(() => {
    const savedZoom = localStorage.getItem('app_table_zoom');
    if (savedZoom) setTableZoom(Number(savedZoom));
  }, []);

  const updateTableZoom = useCallback((delta) => {
    setTableZoom((prevZoom) => {
      const clamped = Math.min(140, Math.max(70, prevZoom + delta));
      localStorage.setItem('app_table_zoom', clamped.toString());
      return clamped;
    });
  }, []);

  const startZoomHold = useCallback((delta) => {
    updateTableZoom(delta);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = setInterval(() => {
      updateTableZoom(delta);
    }, 60); 
  }, [updateTableZoom]);

  const stopZoomHold = useCallback(() => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopZoomHold();
  }, [stopZoomHold]);

  const todayTimestamp = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const todayFormattedStr = useMemo(() => {
    const d = new Date(todayTimestamp);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  }, [todayTimestamp]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback((e) => {
    e.currentTarget.blur();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Tam Ekran Hatası: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

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
    const isModalActive = showPrintModal || (selectedDoctorDetail && !isMinimized) || showReportModal || showGeneralAppSettingsModal || showTableSettingsCustomModal;     
    document.body.style.overflow = isModalActive ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };   
  }, [showPrintModal, selectedDoctorDetail, isMinimized, showReportModal, showGeneralAppSettingsModal, showTableSettingsCustomModal]);   

  const getCurrentDayStatus = useCallback((doc) => {
    if (!doc.scheduleDays || doc.scheduleDays.length === 0) return doc.status || 'POLİKLİNİK';
    const todaySchedule = doc.scheduleDays.find(sd => sd.date === todayFormattedStr);
    if (todaySchedule) {
      return todaySchedule.status === 'POLİK' ? 'POLİKLİNİK' : todaySchedule.status;
    }
    const dayIndex = new Date(todayTimestamp).getDay();
    if (dayIndex === 0 || dayIndex === 6) return 'HAFTA SONU';
    return doc.status === 'POLİK' ? 'POLİKLİNİK' : doc.status;
  }, [todayFormattedStr, todayTimestamp]);

  useEffect(() => {     
    const savedSort = localStorage.getItem('app_table_sort');     
    if (savedSort) setSortBy(savedSort);   
  }, []);

  useEffect(() => {
    if (rawDoctors && rawDoctors.length > 0) {
      const defaultMonthSchedule = generateFullMonthSchedule(2026, 8);
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
        }) : defaultMonthSchedule;

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

  const handleRowClick = useCallback((doc) => {     
    if (selectedDoctorId === doc.id) {
      setSelectedDoctorDetail(doc);     
      setIsMinimized(false);     
      setIsMaximized(false);
    } else {
      setSelectedDoctorId(doc.id);
    }
  }, [selectedDoctorId]);   

  const handleSortChange = useCallback((newSort) => {     
    setSortBy(newSort);     
    localStorage.getItem('app_table_sort') !== newSort && localStorage.setItem('app_table_sort', newSort);   
  }, []);   

  const filteredAndSortedDoctors = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    
    return doctors     
      .filter((doc) => {       
        const currentStatus = getCurrentDayStatus(doc);
        const matchesFilter = filter === 'HEPSİ' || currentStatus === filter || (filter === 'POLİKLİNİK' && (currentStatus === 'POLİKLİNİK' || currentStatus === 'POLİK'));       
        const matchesSearch = !searchLower || doc.name.toLowerCase().includes(searchLower) || doc.clinic.toLowerCase().includes(searchLower);       
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

  // 🛠️ دالة التعامل مع اختصارات لوحة المفاتيح دون التأثير على أدوات الإدخال
  const handleKeyDown = useCallback((e) => {
    const activeElement = document.activeElement;
    const isInputActive = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT');
    
    if (isInputActive) return;

    if (filteredAndSortedDoctors.length === 0) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedDoctorId(prevId => {
        const currentIndex = filteredAndSortedDoctors.findIndex(d => d.id === prevId);
        if (e.key === 'ArrowDown') {
          return currentIndex < filteredAndSortedDoctors.length - 1 ? filteredAndSortedDoctors[currentIndex + 1].id : filteredAndSortedDoctors[0].id;
        } else {
          return currentIndex > 0 ? filteredAndSortedDoctors[currentIndex - 1].id : filteredAndSortedDoctors[filteredAndSortedDoctors.length - 1].id;
        }
      });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedDoctorId(prevId => {
        const currentDoc = filteredAndSortedDoctors.find(d => d.id === prevId);
        if (currentDoc) {
          setSelectedDoctorDetail(currentDoc);
          setIsMinimized(false);
          setIsMaximized(false);
        }
        return prevId;
      });
    }
  }, [filteredAndSortedDoctors]);

  const handleSendReport = async (e) => {
    e.preventDefault();
    if (!reportText.trim()) return;

    setIsSubmittingReport(true);

    try {
      await addDoc(collection(db, 'reports'), {
        category: reportCategory,
        title: reportCategory.replace(/_/g, ' '),
        description: reportText.trim(),
        reporterName: 'ZİYARETÇİ / ZİYARETÇİ TABLOSU',
        status: 'BEKLEYEN',
        source: 'PUBLIC_SCHEDULE_TABLE',
        createdAt: serverTimestamp()
      });

      setShowReportModal(false);
      setReportText('');

      setToastNotification({ show: true, leaving: false });

      setTimeout(() => {
        setToastNotification((prev) => ({ ...prev, leaving: true }));
      }, 2500);

      setTimeout(() => {
        setToastNotification({ show: false, leaving: false });
      }, 3000);

    } catch (err) {
      console.error('Report submission error:', err);
      alert('Hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const exportToExcel = useCallback(() => {     
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
  }, [filteredAndSortedDoctors, getCurrentDayStatus, todayFormattedStr]);

  const rowPaddingClass = useMemo(() => {
    if (tableSettings.rowPadding === 'compact') return 'py-1.5 px-3 sm:px-4';
    if (tableSettings.rowPadding === 'spacious') return 'py-4 px-5 sm:px-6';
    return 'py-2.5 px-4 sm:px-5';
  }, [tableSettings.rowPadding]);

  const statusFilterList = useMemo(() => [
    { label: 'HEPSİ', key: 'HEPSİ' },
    { label: 'POLİKLİNİK', key: 'POLİKLİNİK' },
    { label: 'AMELİYATTA', key: 'AMELİYATTA' },
    { label: 'YILLIK İZİN', key: 'YILLIK İZİN' },
    { label: 'RAPORLU', key: 'RAPORLU' },
    { label: 'NÖBET SONRASI İZİN', key: 'NÖBET SONRASI İZİN' },
  ], []);

  const sortOptionsList = useMemo(() => [
    { label: 'En Yeni Eklenenler', key: 'NEWEST' },
    { label: 'En Eski Eklenenler', key: 'OLDEST' },
    { label: 'Doktor Adına Göre (A-Z)', key: 'NAME_ASC' },
    { label: 'Doktor Adına Göre (Z-A)', key: 'NAME_DESC' },
    { label: 'Bölüme Göre (A-Z)', key: 'CLINIC_ASC' },
  ], []);

  const getSortLabel = useCallback((key) => {
    const found = sortOptionsList.find(item => item.key === key);
    return found ? found.label : 'Sıralama';
  }, [sortOptionsList]);

  return (     
    <div 
      dir="ltr" 
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`min-h-screen relative pt-[52px] pb-0 p-0 w-full max-w-[100vw] overflow-x-hidden cursor-default ${selectedFont} ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} outline-none`}
    >              
      <style jsx global>{`         
        @media print {           
          body * { visibility: hidden !important; }           
          #printableA4Area, #printableA4Area * { visibility: visible !important; }           
          #printableA4Area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; }           
        }

        .hardware-accelerated {
          will-change: transform, opacity;
          transform: translateZ(0);
          contain: content;
        }

        @keyframes toastSlideIn {
          0% {
            opacity: 0;
            transform: translate(-50%, -40px);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes toastSlideRightOut {
          0% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          100% {
            opacity: 0;
            transform: translate(100vw, 0);
          }
        }

        .animate-toast-in {
          animation: toastSlideIn 0.25s ease-out forwards;
        }

        .animate-toast-out {
          animation: toastSlideRightOut 0.35s ease-in forwards;
        }
      `}</style>

      {/* 🔔 Toast Notification */}
      {toastNotification.show && (
        <div className={`fixed top-4 left-1/2 z-[300] -translate-x-1/2 px-6 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 hardware-accelerated ${
          toastNotification.leaving ? 'animate-toast-out' : 'animate-toast-in'
        } ${
          isDarkMode 
            ? 'bg-slate-900 border-emerald-500/50 text-emerald-400 shadow-emerald-950/50' 
            : 'bg-white border-emerald-400 text-emerald-800 shadow-emerald-100'
        }`}>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 stroke-[2.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <span className="text-xs sm:text-sm font-black tracking-wide uppercase">
            Başarıyla gönderilmiştir!
          </span>
        </div>
      )}

      {/* 🌟 HEADER */}
      <div className={`no-print fixed top-0 left-0 right-0 z-50 h-[52px] px-3 sm:px-6 shadow-sm cursor-default flex items-center ${
        isDarkMode 
          ? 'bg-slate-950 border-b border-slate-800' 
          : 'bg-white border-b border-slate-200'
      }`}>                      
        
        <div className="w-full flex flex-row items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">                          
          
          <div className="flex items-center shrink-0">
            <button
              onClick={() => router.push('/')}
              className={`p-2 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-110 active:scale-95 ${
                isDarkMode 
                  ? 'text-amber-400 hover:bg-amber-400/10' 
                  : 'text-emerald-600 hover:bg-emerald-50'
              }`}
              title="Ana Sayfaya Dön"
            >
              <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
          </div>

          <div className="flex-1 flex justify-center mx-auto">               
            <div 
              onClick={() => searchInputRef.current?.focus()}
              className={`relative flex items-center w-full max-w-[170px] sm:max-w-[220px] focus-within:max-w-[280px] sm:focus-within:max-w-[360px] rounded-full py-1 px-3 shadow-xs cursor-text ${
                isDarkMode 
                  ? 'bg-slate-900 border border-slate-800' 
                  : 'bg-slate-100 border border-slate-200'
              }`}
            >
              <input 
                ref={searchInputRef}                
                type="text"                 
                placeholder="Doktor veya Birim Ara..."                 
                value={searchTerm}                 
                onChange={(e) => setSearchTerm(e.target.value)}                 
                className="w-full bg-transparent text-xs font-extrabold outline-none tracking-wide text-center focus:text-left placeholder-slate-400 cursor-text uppercase"
              />             

              {searchTerm && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm('');
                  }}
                  className="p-1 text-slate-400 hover:text-rose-500 font-black text-xs shrink-0 ml-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* 🔍 ➕ Büyüt */}
            <button
              onMouseDown={() => startZoomHold(3)}
              onMouseUp={stopZoomHold}
              onMouseLeave={stopZoomHold}
              onTouchStart={() => startZoomHold(3)}
              onTouchEnd={stopZoomHold}
              className={`p-2 rounded-full flex items-center justify-center outline-none cursor-pointer select-none transition-all duration-200 transform hover:scale-110 active:scale-90 ${
                isDarkMode 
                  ? 'text-sky-400 hover:bg-sky-400/10' 
                  : 'text-sky-600 hover:bg-sky-50'
              }`}
              title="Görünümü Büyüt (+)"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>

            {/* 🔍 ➖ Küçült */}
            <button
              onMouseDown={() => startZoomHold(-3)}
              onMouseUp={stopZoomHold}
              onMouseLeave={stopZoomHold}
              onTouchStart={() => startZoomHold(-3)}
              onTouchEnd={stopZoomHold}
              className={`p-2 rounded-full flex items-center justify-center outline-none cursor-pointer select-none transition-all duration-200 transform hover:scale-110 active:scale-90 ${
                isDarkMode 
                  ? 'text-sky-400 hover:bg-sky-400/10' 
                  : 'text-sky-600 hover:bg-sky-50'
              }`}
              title="Görünümü Küçült (-)"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>

            {/* ⛶ Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-full flex items-center justify-center outline-none cursor-pointer transition-all duration-200 transform hover:scale-110 active:scale-90 ${
                isDarkMode 
                  ? 'text-sky-400 hover:bg-sky-400/10' 
                  : 'text-sky-600 hover:bg-sky-50'
              }`}
              title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
            >
              {isFullscreen ? (
                <svg className="w-5 h-5 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
                </svg>
              ) : (
                <svg className="w-5 h-5 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              )}
            </button>

            {/* 🌙 / ☀️ Mode Switcher */}
            <button
              onClick={(e) => {
                toggleTheme();
                e.currentTarget.blur();
              }}
              className={`p-2 rounded-full flex items-center justify-center outline-none cursor-pointer transition-all duration-300 transform hover:scale-110 hover:translate-y-1 active:scale-90 ${
                isDarkMode 
                  ? 'text-amber-400 hover:bg-amber-400/10' 
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
              title={isDarkMode ? 'Gündüz Moduna Geç' : 'Gece Moduna Geç'}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 stroke-[2.2] transition-transform duration-300 hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m8.966-8.966h-2.25m-13.5 0H3m15.364-6.364l-1.591 1.591M6.343 17.657l-1.592 1.592m12.728 0l-1.591-1.592M6.343 6.05L4.75 4.75M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 stroke-[2.2] transition-transform duration-300 -rotate-12 hover:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>

            {/* 🔻 Filter Dropdown */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={() => { setShowFilterDropdown(!showFilterDropdown); setShowSortDropdown(false); setShowMenuDropdown(false); }}
                className={`px-1.5 py-1 rounded-lg font-black text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                  isDarkMode 
                    ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10' 
                    : 'text-slate-800 hover:text-slate-950 hover:bg-slate-200/60'
                }`}
                title="Durum Filtresi"
              >
                <svg className="w-3.5 h-3.5 stroke-[2.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h18l-7 8v6l-4 2v-8l-7-8z" />
                </svg>
                <span className="font-black uppercase tracking-wide text-[11px] sm:text-xs">{filter}</span>
              </button>

              {showFilterDropdown && (
                <div className={`absolute right-0 mt-3 w-56 rounded-3xl border p-2.5 shadow-2xl z-50 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}>
                  <div className="flex justify-between items-center pb-2 px-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">DURUM SEÇİN</span>
                    <button onClick={() => setShowFilterDropdown(false)} className="w-5 h-5 rounded-full font-black text-[10px] flex items-center justify-center cursor-pointer">✕</button>
                  </div>
                  <div className="space-y-1 mt-2 font-black">
                    {statusFilterList.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => {
                          setFilter(item.key);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full p-2.5 rounded-2xl text-xs flex items-center justify-between cursor-pointer ${
                          filter === item.key
                            ? 'bg-emerald-600 text-white font-black shadow-md'
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

            {/* 🔻 Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => { setShowSortDropdown(!showSortDropdown); setShowFilterDropdown(false); setShowMenuDropdown(false); }}
                className={`px-1.5 py-1 rounded-lg font-black text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                  isDarkMode 
                    ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10' 
                    : 'text-slate-800 hover:text-slate-950 hover:bg-slate-200/60'
                }`}
                title="Sıralama Seçenekleri"
              >
                <svg className="w-3.5 h-3.5 stroke-[2.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5-3L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                </svg>
                <span className="font-black uppercase tracking-wide text-[11px] sm:text-xs">{getSortLabel(sortBy)}</span>
              </button>

              {showSortDropdown && (
                <div className={`absolute right-0 mt-3 w-60 rounded-3xl border p-2.5 shadow-2xl z-50 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}>
                  <div className="flex justify-between items-center pb-2 px-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">SIRALAMA SEÇENEKLERİ</span>
                    <button onClick={() => setShowSortDropdown(false)} className="w-5 h-5 rounded-full font-black text-[10px] flex items-center justify-center cursor-pointer">✕</button>
                  </div>
                  <div className="space-y-1 mt-2 font-black">
                    {sortOptionsList.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => {
                          handleSortChange(item.key);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full p-2.5 rounded-2xl text-xs flex items-center justify-between cursor-pointer ${
                          sortBy === item.key
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md'
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

            {/* Print Trigger */}
            <div className="flex items-center">
              <button
                onClick={() => setShowPrintModal(true)}
                className={`p-2 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-110 active:scale-90 ${
                  isDarkMode 
                    ? 'text-emerald-400 hover:bg-emerald-400/10' 
                    : 'text-emerald-600 hover:bg-emerald-50'
                }`}
                title="İndir ve Yazdır"
              >
                <svg className="w-5 h-5 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2" />
                </svg>
              </button>
            </div>

            {/* ☰ MENU BUTTON */}
            <div className="relative" ref={menuDropdownRef}>
              <button
                onClick={() => {
                  setShowMenuDropdown(!showMenuDropdown);
                  setShowFilterDropdown(false);
                  setShowSortDropdown(false);
                }}
                className="group relative p-2 rounded-full flex items-center justify-center outline-none cursor-pointer transition-all duration-300 transform hover:scale-110 hover:translate-y-1 active:scale-90"
                title="Menü"
              >
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <svg 
                  className={`w-6 h-6 stroke-[2.2] transition-transform duration-300 ease-out group-hover:rotate-90 ${
                    isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>

              {showMenuDropdown && (
                <div className={`absolute right-0 mt-3 w-56 rounded-3xl border p-2 shadow-2xl z-50 font-black text-xs ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}>
                  <button
                    onClick={() => {
                      setShowMenuDropdown(false);
                      setShowReportModal(true);
                    }}
                    className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-colors ${
                      isDarkMode ? 'hover:bg-slate-800 text-rose-400' : 'hover:bg-rose-50 text-rose-600'
                    }`}
                  >
                    <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span>Sorun Bildir</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMenuDropdown(false);
                      setShowGeneralAppSettingsModal(true);
                    }}
                    className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-colors ${
                      isDarkMode ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-amber-50 text-amber-600'
                    }`}
                  >
                    <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 012.6-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Genel Ayarlar</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>         
      </div>         

      {/* 📊 TABLE CONTAINER */}         
      <div className="w-full space-y-4 px-0 select-none mt-0 hardware-accelerated">
        <div className={`w-full rounded-none overflow-hidden shadow-2xl border-x-0 border-t-0 border-b ${           
          isDarkMode 
            ? 'bg-slate-900 border-slate-800' 
            : 'bg-white border-slate-200'         
        }`}>           
          <div 
            style={{ zoom: `${tableZoom}%` }} 
            className="overflow-x-auto w-full relative"
          >             
            <table className={`w-full text-left border-collapse ${selectedFont} ${tableSettings.fontWeight}`}>               
              
              <thead>                 
                <tr className={`text-xs sm:text-sm font-black uppercase select-none ${                   
                  isDarkMode                      
                    ? 'bg-slate-950 text-amber-400 border-b border-slate-800'                      
                    : 'bg-slate-900 text-white border-b border-slate-800'                 
                }`}>                   
                  <th className={`${rowPaddingClass} border-r border-slate-700/60 dark:border-slate-800/80 font-black tracking-wider text-xs sm:text-sm text-center w-12 sm:w-16 shrink-0`}>
                    #
                  </th>

                  {tableSettings.showClinic && (
                    <th className={`${rowPaddingClass} border-r border-slate-700/60 dark:border-slate-800/80 font-black tracking-wider text-xs sm:text-sm w-1/3`}>
                      BİRİM
                    </th>                   
                  )}

                  {tableSettings.showDoctorName && (
                    <th className={`${rowPaddingClass} border-r border-slate-700/60 dark:border-slate-800/80 font-black tracking-wider text-xs sm:text-sm w-1/3`}>
                      DOKTOR ADI SOYADI
                    </th>                   
                  )}

                  {tableSettings.showStatus && (
                    <th className={`${rowPaddingClass} font-black text-center tracking-wider text-xs sm:text-sm w-1/3`}>
                      DURUM
                    </th>                   
                  )}
                </tr>               
              </thead>               
              
              <tbody 
                style={customHexColor ? { color: customHexColor } : {}}
                className={`text-xs sm:text-sm md:text-base ${!customHexColor ? activeColor : ''} ${
                  tableSettings.gridStyle === 'full' || tableSettings.gridStyle === 'horizontal' 
                    ? tableSettings.borderOpacity === 'strong'
                      ? 'divide-y-2 divide-slate-400 dark:divide-slate-600'
                      : 'divide-y divide-slate-200 dark:divide-slate-800/80'
                    : 'divide-y-0'
                }`}
              >                 
                {filteredAndSortedDoctors.length > 0 ? (                   
                  filteredAndSortedDoctors.map((doc, index) => (
                    <DoctorRow
                      key={doc.id}
                      doc={doc}
                      index={index}
                      isSelected={selectedDoctorId === doc.id}
                      isDarkMode={isDarkMode}
                      activeStatusToday={getCurrentDayStatus(doc)}
                      rowPaddingClass={rowPaddingClass}
                      tableSettings={tableSettings}
                      onClick={handleRowClick}
                    />
                  ))                 
                ) : (                   
                  <tr>                     
                    <td colSpan={4} className="p-12 text-center text-slate-400 font-black border-dashed text-base uppercase">                         
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

      {/* ⚙️ MODAL: GENEL UYGULAMA AYARLARI */}
      {showGeneralAppSettingsModal && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/70 p-4 cursor-default">
          <div className={`w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border space-y-6 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <svg className="w-5 h-5 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 012.6-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-sm sm:text-base font-black text-orange-500 tracking-tight uppercase">
                  GENEL UYGULAMA AYARLARI
                </h3>
              </div>
              <button 
                onClick={() => setShowGeneralAppSettingsModal(false)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Option Box 1: Tablo Görünüm Ayarlarını Aç */}
            <div 
              onClick={() => {
                setShowGeneralAppSettingsModal(false);
                setShowTableSettingsCustomModal(true);
              }}
              className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] active:scale-95 ${
                isDarkMode 
                  ? 'bg-slate-950 border-slate-800 hover:bg-slate-800/60' 
                  : 'bg-slate-50 border-slate-200 shadow-xs hover:border-orange-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400">
                  <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-black text-orange-500 uppercase tracking-tight">
                    TABLO GÖRÜNÜM AYARLARINI AÇ
                  </h4>
                  <p className="text-[10px] font-extrabold text-slate-400 mt-0.5">
                    Sütunlar, renkler, yazı tipi ve kalınlık ayarları
                  </p>
                </div>
              </div>
              <svg className="w-4 h-4 stroke-[3] text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>

            {/* Option Box 2: Ekran Zumu */}
            <div className={`p-4 rounded-2xl border space-y-3.5 ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
            }`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                  </svg>
                  <span className="text-xs font-black text-orange-500 uppercase tracking-tight">
                    TABLO ZUMU (ZOOM SCALE)
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-teal-600 dark:text-teal-400 font-mono px-2 py-0.5 rounded-lg bg-teal-500/10">
                    %{tableZoom}
                  </span>
                  {tableZoom !== 100 && (
                    <button
                      type="button"
                      onClick={() => {
                        setTableZoom(100);
                        localStorage.setItem('app_table_zoom', '100');
                      }}
                      className="text-[10px] font-black text-slate-400 hover:text-orange-500 underline uppercase cursor-pointer"
                      title="Varsayılan Boyuta Dön"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>
              </div>

              {/* Slider & Buttons */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => updateTableZoom(-5)}
                  className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black flex items-center justify-center cursor-pointer transition-transform active:scale-90 select-none"
                  title="Küçült"
                >
                  <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                  </svg>
                </button>

                <input
                  type="range"
                  min="70"
                  max="140"
                  step="5"
                  value={tableZoom}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTableZoom(val);
                    localStorage.setItem('app_table_zoom', val.toString());
                  }}
                  className="w-full accent-orange-500 cursor-pointer h-2 rounded-lg bg-slate-200 dark:bg-slate-800"
                />

                <button
                  type="button"
                  onClick={() => updateTableZoom(5)}
                  className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black flex items-center justify-center cursor-pointer transition-transform active:scale-90 select-none"
                  title="Büyüt"
                >
                  <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex justify-between items-center gap-2 pt-1 font-mono text-[10px] font-black">
                <button 
                  type="button"
                  onClick={() => {
                    setTableZoom(100);
                    localStorage.setItem('app_table_zoom', '100');
                  }} 
                  className={`flex-1 py-1.5 rounded-lg border transition-all ${tableZoom === 100 ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'}`}
                >
                  %100 Normal
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setTableZoom(115);
                    localStorage.setItem('app_table_zoom', '115');
                  }} 
                  className={`flex-1 py-1.5 rounded-lg border transition-all ${tableZoom === 115 ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'}`}
                >
                  %115 Büyük
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setTableZoom(130);
                    localStorage.setItem('app_table_zoom', '130');
                  }} 
                  className={`flex-1 py-1.5 rounded-lg border transition-all ${tableZoom === 130 ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'}`}
                >
                  %130 Çok Büyük
                </button>
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowGeneralAppSettingsModal(false)}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white rounded-2xl text-xs font-black shadow-lg cursor-pointer uppercase tracking-wide transition-all"
              >
                AYARLARI KAYDET VE KAPAT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🎨 MODAL: TABLO GÖRÜNÜM AYARLARI */}
      <TableSettingsModal 
        isOpen={showTableSettingsCustomModal}
        onClose={() => setShowTableSettingsCustomModal(false)}
        onBack={() => {
          setShowTableSettingsCustomModal(false);
          setShowGeneralAppSettingsModal(true);
        }}
        isDarkMode={isDarkMode}
      />

      {/* ⚠️ MODAL: SORUN BİLDİR (منع انتشار الأحداث لضمان استخدام المسطرة وسائر المفاتيح) */}
      {showReportModal && (
        <div 
          onKeyDown={(e) => e.stopPropagation()} 
          className="fixed inset-0 z-[180] flex items-center justify-center bg-black/80 p-4 cursor-default"
        >
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <h3 className="text-base font-black text-rose-500 uppercase">SORUN BİLDİR</h3>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white font-black text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSendReport} className="space-y-4 font-black">
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">KATEGORİ</label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className={`w-full p-3 rounded-xl border text-xs font-black outline-none cursor-pointer ${
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
                <label className="block text-xs text-slate-400 mb-1 uppercase">SORUN AÇIKLAMASI</label>
                <textarea
                  required
                  rows="4"
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Lütfen yaşadığınız sorunu detaylıca açıklayın..."
                  className={`w-full p-3 rounded-xl border text-xs font-black outline-none cursor-text ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-black hover:bg-slate-700 cursor-pointer"
                >
                  İPTAL
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReport ? 'GÖNDERİLİYOR...' : 'BİLDİRİMİ GÖNDER 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📥 PRINTABLE A4 MODAL */}       
      {showPrintModal && (         
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 p-3 cursor-default">           
          <div className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl p-6 shadow-2xl max-h-[95vh] overflow-y-auto border border-slate-300">             
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 gap-2">               
              <div className="flex items-center gap-2">                 
                <span className="text-2xl">🖨️</span>                
                <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">                   
                  DOKTOR ÇALIŞMA LİSTESİ İNDİR VE YAZDIR                
                </h2>               
              </div>               
              <div className="flex items-center gap-2">                 
                <button onClick={exportToExcel} className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer">                   
                  <span>📊</span> EXCEL İNDİR                 
                </button>                 
                <button onClick={() => window.print()} className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer">                   
                  <span>🖨️️</span> YAZDIR / PDF               
                </button>                 
                <button onClick={() => setShowPrintModal(false)} className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded-xl text-xs cursor-pointer">                   
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
                    {filteredAndSortedDoctors.map((doc, i) => {                       
                      const activeStatusToday = getCurrentDayStatus(doc);
                      return (
                        <tr key={doc.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>                         
                          <td className="py-2 px-2.5 border-r border-slate-300 font-black text-center text-slate-950">{i + 1}</td>
                          <td className="py-2 px-2.5 border-r border-slate-300 uppercase text-slate-900 font-extrabold">{doc.clinic}</td>                         
                          <td className="py-2 px-2.5 border-r border-slate-300 uppercase text-slate-950 font-black">{doc.name}</td>                         
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

      {/* 📅 MODAL DETAIL */}
      {selectedDoctorDetail && (         
        <>           
          {isMinimized ? (
            <div className="fixed bottom-4 right-4 sm:right-6 z-[170]">
              <div 
                onClick={() => setIsMinimized(false)}
                className={`p-3.5 px-5 rounded-2xl shadow-2xl border-2 flex items-center gap-4 cursor-pointer transition-transform hover:scale-105 ${
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
                    className="p-1.5 hover:bg-amber-500/20 rounded-lg text-amber-500 font-black text-sm cursor-pointer"
                    title="Aç"
                  >
                    🗖
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedDoctorDetail(null); }} 
                    className="p-1.5 hover:bg-rose-500/20 rounded-lg text-rose-500 font-black text-sm cursor-pointer"
                    title="Kapat"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <DoctorDetailModal
              selectedDoctorDetail={selectedDoctorDetail}
              isDarkMode={isDarkMode}
              isMaximized={isMaximized}
              setIsMaximized={setIsMaximized}
              setIsMinimized={setIsMinimized}
              setSelectedDoctorDetail={setSelectedDoctorDetail}
              todayTimestamp={todayTimestamp}
              todayFormattedStr={todayFormattedStr}
            />
          )}          
        </>       
      )}       

    </div>   
  ); 
}

// 🛡️ التصدير التلقائي المغلف بـ Provider
export default function PublicScheduleTable() {
  return (
    <TableSettingsProvider>
      <PublicScheduleTableContent />
    </TableSettingsProvider>
  );
}