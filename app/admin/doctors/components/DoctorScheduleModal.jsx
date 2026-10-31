import { useEffect, useRef, useState, memo, useCallback } from 'react';
import { parseItemDate, getStatusBadgeStyle } from '../utils/scheduleUtils';

/* ═══════ صف اليوم — memoized ═══════ */
const DayRow = memo(function DayRow({
  sd, idx, isPast, isToday, isChanged, canChangeStatus,
  onStatusChange, isDarkMode, todayRef,
}) {
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div
      ref={isToday ? todayRef : null}
      className={`flex justify-between items-center gap-2 p-2.5 rounded-lg transition-all duration-200 ${
        isChanged
          ? (isDarkMode
              ? 'ring-2 ring-emerald-400 bg-emerald-500/15 scale-[1.01]'
              : 'ring-2 ring-emerald-500 bg-emerald-50 scale-[1.01]')
          : isPast
            ? (isDarkMode ? 'opacity-40 bg-slate-900/40 text-slate-500' : 'opacity-50 bg-slate-200/70 text-slate-500')
            : isToday
              ? (isDarkMode ? 'bg-amber-500/15 text-amber-200 ring-2 ring-amber-400/40' : 'bg-amber-50 text-amber-900 ring-2 ring-amber-400/60')
              : (isDarkMode ? 'bg-slate-900 text-slate-200 hover:bg-slate-800/60' : 'bg-white text-slate-900 ring-1 ring-slate-200 hover:ring-slate-300')
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-wrap">
        <span className={`font-mono font-bold text-xs ${isToday ? 'text-amber-600 dark:text-amber-300 text-sm' : ''}`}>
          {sd.date}
        </span>
        <span className={`text-[10px] uppercase font-bold ${isToday ? 'text-amber-600 dark:text-amber-300' : textMuted}`}>
          {sd.day}
        </span>

        {isPast && (
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
            isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-300 text-slate-700'
          }`}>
            Geçmiş
          </span>
        )}
        {isToday && (
          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-amber-500 text-white animate-pulse">
            Bugün
          </span>
        )}
        {sd.holidayName && (
          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-purple-600 text-white">
            {sd.holidayName}
          </span>
        )}
        {isChanged && (
          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-emerald-500 text-white flex items-center gap-1">
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            OK
          </span>
        )}
      </div>

      {/* ✅ القائمة المنسدلة المحدثة */}
      <select
        value={sd.status}
        disabled={isPast || !canChangeStatus}
        onChange={(e) => onStatusChange(idx, e.target.value)}
        className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold outline-none uppercase transition-all duration-200 max-w-[170px] truncate ${getStatusBadgeStyle(sd.status)} ${
          isChanged ? 'scale-105' : 'scale-100'
        } ${isPast || !canChangeStatus ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <option value="POLİKLİNİK" className="bg-emerald-600 text-white">POLİKLİNİK</option>
        <option value="AMELİYAT" className="bg-purple-600 text-white">AMELİYAT</option>
        <option value="PALYATİF" className="bg-pink-600 text-white">PALYATİF</option>
        <option value="İŞLEM GÜNÜ" className="bg-teal-600 text-white">İŞLEM GÜNÜ</option>
        
        {/* ✅ الحالات الجديدة والمعدلة */}
        <option value="08:00 - 12:00 KADAR" className="bg-orange-500 text-white">08:00 - 12:00 KADAR</option>
        <option value="13:00 - 16:00 KADAR" className="bg-blue-500 text-white">13:00 - 16:00 KADAR</option>
        <option value="SAATLİK İZİN" className="bg-amber-600 text-white">SAATLİK İZİN</option>
        <option value="KONGRE/SEMİNER" className="bg-blue-600 text-white">KONGRE / SEMİNER</option>
        
        {/* ✅ الحالات الثابتة */}
        <option value="RESMİ TATİL" className="bg-indigo-700 text-white">RESMİ TATİL</option>
        <option value="HAFTA SONU" className="bg-rose-600 text-white">HAFTA SONU</option>
        <option value="YILLIK İZİN" className="bg-amber-500 text-slate-950">YILLIK İZİN</option>
        <option value="RAPORLU" className="bg-amber-500 text-slate-950">RAPORLU</option>
        <option value="NÖBET SONRASI" className="bg-sky-600 text-white">NÖBET SONRASI</option>
        <option value="ASKERLİK" className="bg-slate-800 text-white">ASKERLİK</option>
        
        {/* ❌ تم حذف ŞUA İZNİ نهائياً */}
      </select>
    </div>
  );
});

/* ═══════ المودال الرئيسي ═══════ */
export default function DoctorScheduleModal({
  showScheduleModal,
  selectedDoctor,
  isMinimized,
  setIsMinimized,
  isMaximized,
  setIsMaximized,
  modalBoxRef,
  winPos,
  winSize,
  isDarkMode,
  handleMouseDownHeader,
  handleTransferToEditDoctor,
  handleRequestCloseScheduleModal,
  monthScheduleStats,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  handleRegenerateMonth,
  todayRef,
  today,
  canChangeStatus,
  handleDayStatusChange,
  hasUnsavedChanges,
  handleDiscardChanges,
  handleSaveChangesDirectly,
  handleMouseDownResize,
}) {
  const [changedIdx, setChangedIdx] = useState(null);
  const changeTimer = useRef(null);

  useEffect(() => {
    if (showScheduleModal && !isMinimized && todayRef.current) {
      const timer = setTimeout(() => {
        todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [showScheduleModal, isMinimized, selectedMonth, selectedYear, todayRef]);

  useEffect(() => () => { if (changeTimer.current) clearTimeout(changeTimer.current); }, []);

  const handleStatusWithAnim = useCallback((idx, val) => {
    handleDayStatusChange(idx, val);
    setChangedIdx(idx);
    if (changeTimer.current) clearTimeout(changeTimer.current);
    changeTimer.current = setTimeout(() => setChangedIdx(null), 700);
  }, [handleDayStatusChange]);

  if (!showScheduleModal || !selectedDoctor) return null;

  // ألوان Fluent Design
  const surface = isDarkMode
    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 ring-1 ring-white/10'
    : 'bg-gradient-to-b from-white via-white to-slate-50 ring-1 ring-black/5';

  const titleBar = isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100/90 border-slate-200';
  const subtleDivider = isDarkMode ? 'border-slate-800' : 'border-slate-200';
  const textPrimary = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <>
      {!isMinimized && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4"
          dir="ltr"
          onClick={(e) => {
            if (!isMaximized && modalBoxRef.current && !modalBoxRef.current.contains(e.target)) {
              handleRequestCloseScheduleModal();
            }
          }}
        >
          <div
            ref={modalBoxRef}
            style={
              isMaximized
                ? { width: '100%', height: '100%' }
                : {
                    transform: `translate(${winPos.x}px, ${winPos.y}px)`,
                    width: `min(${winSize.width}px, 96vw)`,
                    height: `min(${winSize.height}px, 92vh)`,
                  }
            }
            className={`flex flex-col relative overflow-hidden transition-all duration-100 ${surface} ${
              isMaximized
                ? 'w-full h-full max-w-none max-h-none rounded-none sm:rounded-xl'
                : 'rounded-xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.55)]'
            }`}
          >
            {/* ═══ Title Bar ═══ */}
            <div
              onMouseDown={handleMouseDownHeader}
              className={`h-11 px-3 flex items-center justify-between border-b ${titleBar} select-none shrink-0 ${
                isMaximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                  isDarkMode ? 'bg-cyan-500/15' : 'bg-blue-500/15'
                }`}>
                  <svg className={`w-3.5 h-3.5 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
                <h3 className={`text-sm font-bold truncate ${textPrimary}`}>
                  {selectedDoctor.name}
                </h3>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleTransferToEditDoctor(selectedDoctor); }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold shrink-0 transition-colors duration-75 cursor-pointer ${
                    isDarkMode ? 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                  title="Düzenle"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                  <span className="hidden sm:inline">Düzenle</span>
                </button>
              </div>

              {/* أزرار تحكم Windows 11 */}
              <div className="flex items-center -mr-1">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
                  className={`w-10 h-10 flex items-center justify-center transition-colors duration-75 cursor-pointer rounded-md ${
                    isDarkMode ? 'hover:bg-white/8 text-slate-300' : 'hover:bg-black/5 text-slate-600'
                  }`}
                  title="Küçült"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14" /></svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); }}
                  className={`w-10 h-10 flex items-center justify-center transition-colors duration-75 cursor-pointer rounded-md ${
                    isDarkMode ? 'hover:bg-white/8 text-slate-300' : 'hover:bg-black/5 text-slate-600'
                  }`}
                  title={isMaximized ? 'Geri yükle' : 'Tam ekran'}
                >
                  {isMaximized ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="8" y="8" width="13" height="13" rx="1.5" />
                      <path d="M16 8V4.5A1.5 1.5 0 0 0 14.5 3H4.5A1.5 1.5 0 0 0 3 4.5v10A1.5 1.5 0 0 0 4.5 16H8" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="4" width="16" height="16" rx="1.5" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleRequestCloseScheduleModal(); }}
                  className="w-10 h-10 flex items-center justify-center rounded-md transition-colors duration-75 cursor-pointer text-slate-600 dark:text-slate-300 hover:bg-rose-600 hover:text-white"
                  title="Kapat"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* ═══ Info Strip ═══ */}
            <div className={`px-3 py-2 border-b ${subtleDivider} flex flex-wrap items-center gap-2 ${
              isDarkMode ? 'bg-slate-950/40' : 'bg-slate-50/80'
            }`}>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                isDarkMode ? 'bg-cyan-500/15 text-cyan-300' : 'bg-blue-100 text-blue-700'
              }`}>{selectedDoctor.clinic}</span>
              <span className={`text-[11px] font-semibold ${textMuted}`}>
                Dahili: <span className="font-mono text-amber-600 dark:text-amber-400">{selectedDoctor.dahili || '-'}</span>
              </span>
              <span className={`text-[11px] font-semibold ${textMuted}`}>
                Oda: <span className="font-mono text-emerald-600 dark:text-emerald-400">{selectedDoctor.roomNo || '-'}</span>
              </span>
            </div>

            {/* ═══ Stats + Month Picker ═══ */}
            <div className={`px-3 py-2.5 border-b ${subtleDivider} flex flex-wrap items-center justify-between gap-2 ${
              isDarkMode ? 'bg-slate-950/30' : 'bg-white'
            }`}>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isDarkMode ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-100 text-emerald-800'}`}>
                  🏥 {monthScheduleStats.poliklinik}
                </span>
                {monthScheduleStats.ameliyat > 0 && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isDarkMode ? 'bg-purple-500/15 text-purple-300' : 'bg-purple-100 text-purple-800'}`}>
                    🔪 {monthScheduleStats.ameliyat}
                  </span>
                )}
                {monthScheduleStats.izin > 0 && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isDarkMode ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-100 text-amber-800'}`}>
                    🏖️ {monthScheduleStats.izin}
                  </span>
                )}
              </div>

              <div className="flex gap-1.5">
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    const m = parseInt(e.target.value);
                    setSelectedMonth(m);
                    handleRegenerateMonth(selectedYear, m);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold outline-none cursor-pointer transition-colors duration-75 ${
                    isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
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
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold outline-none cursor-pointer transition-colors duration-75 ${
                    isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                  <option value={2028}>2028</option>
                </select>
              </div>
            </div>

            {/* ═══ Days List ═══ */}
            <div
              className={`flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-1.5 custom-scrollbar ${
                isDarkMode ? 'bg-slate-950/20' : 'bg-slate-50/50'
              }`}
              style={{ contain: 'layout style paint', paddingBottom: hasUnsavedChanges ? 90 : 12 }}
            >
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
                  <DayRow
                    key={idx}
                    sd={sd}
                    idx={idx}
                    isPast={isPast}
                    isToday={isToday}
                    isChanged={changedIdx === idx}
                    canChangeStatus={canChangeStatus}
                    onStatusChange={handleStatusWithAnim}
                    isDarkMode={isDarkMode}
                    todayRef={todayRef}
                  />
                );
              })}
            </div>

            {/* ═══ شريط الحفظ ═══ */}
            {hasUnsavedChanges && (
              <div className="absolute bottom-3 left-3 right-3 z-[100] pointer-events-none">
                <div
                  className={`pointer-events-auto p-2.5 px-3 rounded-xl shadow-2xl flex items-center justify-between gap-2 flex-wrap ${
                    isDarkMode
                      ? 'bg-slate-900 ring-1 ring-cyan-500/60'
                      : 'bg-white ring-1 ring-blue-500/70'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span className={`text-[11px] font-bold uppercase tracking-wide ${
                      isDarkMode ? 'text-cyan-400' : 'text-blue-600'
                    }`}>
                      Kaydedilmemiş Değişiklik
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleDiscardChanges}
                      className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wide transition-colors duration-75 active:scale-[0.98] cursor-pointer ${
                        isDarkMode
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Vazgeç
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveChangesDirectly}
                      className="px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wide text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 active:scale-[0.98] transition-all duration-75 cursor-pointer shadow-md"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Resize Handle */}
            {!isMaximized && (
              <div
                onMouseDown={handleMouseDownResize}
                className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity"
                title="Boyut"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 22H12l10-10v10zM22 12H2l20-20v20z" opacity="0.5" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ شريط التصغير ═══ */}
      {isMinimized && (
        <div className="fixed bottom-4 right-4 z-[250] animate-slideUp" dir="ltr">
          <div
            onClick={() => setIsMinimized(false)}
            className={`group relative overflow-hidden rounded-xl shadow-2xl cursor-pointer transition-all duration-150 hover:scale-[1.03] active:scale-[0.98] ${
              isDarkMode
                ? 'bg-gradient-to-br from-slate-900 to-slate-950 ring-1 ring-cyan-500/40'
                : 'bg-gradient-to-br from-white to-slate-50 ring-1 ring-blue-500/40'
            }`}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-500"></div>

            <div className="flex items-center gap-2.5 pl-3 pr-2 py-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isDarkMode ? 'bg-cyan-500/20' : 'bg-blue-500/15'
              }`}>
                <svg className={`w-4 h-4 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <div className={`text-xs font-bold truncate max-w-[140px] ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  {selectedDoctor.name}
                </div>
                <div className={`text-[10px] font-medium flex items-center gap-1 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Takvim açık
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
                  className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-75 cursor-pointer ${
                    isDarkMode ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-black/5 text-slate-600'
                  }`}
                  title="Geri yükle"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="8" y="8" width="13" height="13" rx="1.5" />
                    <path d="M16 8V4.5A1.5 1.5 0 0 0 14.5 3H4.5A1.5 1.5 0 0 0 3 4.5v10A1.5 1.5 0 0 0 4.5 16H8" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleRequestCloseScheduleModal(); }}
                  className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-75 cursor-pointer ${
                    isDarkMode ? 'hover:bg-rose-600 text-slate-300 hover:text-white' : 'hover:bg-rose-600 text-slate-600 hover:text-white'
                  }`}
                  title="Kapat"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}