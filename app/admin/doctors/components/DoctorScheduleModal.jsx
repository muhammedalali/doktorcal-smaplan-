import { useEffect } from 'react';
import { parseItemDate, getStatusBadgeStyle } from '../utils/scheduleUtils';

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
  handleMouseDownResize
}) {
  // 🎯 التمرير التلقائي لتاريخ اليوم فور فتح النافذة أو عند إلغاء التصغير
  useEffect(() => {
    if (showScheduleModal && !isMinimized && todayRef.current) {
      const timer = setTimeout(() => {
        todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [showScheduleModal, isMinimized, selectedMonth, selectedYear, todayRef]);

  if (!showScheduleModal || !selectedDoctor) return null;

  return (
    <>
      {!isMinimized && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-5"
          dir="ltr"
          onClick={(e) => {
            if (!isMaximized && modalBoxRef.current && !modalBoxRef.current.contains(e.target)) {
              handleRequestCloseScheduleModal();
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
            } ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-blue-200 text-slate-900'
            }`}
          >
            {/* Desktop Window Title Bar */}
            <div 
              onMouseDown={handleMouseDownHeader}
              className={`p-3.5 sm:p-4 border-b-2 flex flex-wrap justify-between items-center select-none gap-2 ${
                isMaximized ? 'cursor-default' : 'cursor-move'
              } ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-blue-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-sm sm:text-base font-black text-amber-500 uppercase">{selectedDoctor.name}</h3>
                    
                    <button
                      onClick={() => handleTransferToEditDoctor(selectedDoctor)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-lg shadow-md border border-amber-300 transition-all transform hover:scale-105 active:scale-95 cursor-default uppercase tracking-wider"
                      title="Doktor Bilgilerini Düzenle"
                    >
                      <svg className="w-3.5 h-3.5 text-slate-950 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span>BİLGİLERİ DÜZENLE</span>
                    </button>
                  </div>
                  
                  <p className="text-[11px] font-black text-cyan-500 dark:text-cyan-400 mt-1 uppercase">
                    {selectedDoctor.clinic} • DAHİLİ: <span className="font-mono text-amber-500">{selectedDoctor.dahili || '-'}</span> • ODA NO: <span className="font-mono text-emerald-500">{selectedDoctor.roomNo || '-'}</span>
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 font-mono font-black">
                <button 
                  onClick={() => setIsMinimized(true)}
                  className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-black text-sm transition-all flex items-center justify-center cursor-default"
                  title="Simge Durumuna Küçült"
                >
                  🗕
                </button>
                <button 
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white font-black text-sm transition-all flex items-center justify-center cursor-default"
                  title={isMaximized ? "Eski Boyuta Getir" : "Ekranı Kapla"}
                >
                  {isMaximized ? '🗗' : '🗖'}
                </button>
                <button 
                  onClick={handleRequestCloseScheduleModal}
                  className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-black text-sm transition-all flex items-center justify-center cursor-default"
                  title="Kapat (ESC)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Sub-Header Month Picker */}
            <div className={`px-5 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 ${
              isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-blue-100'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-black text-amber-500 uppercase tracking-wider">📅 TAKVİM:</span>
                
                <div className="flex items-center gap-2 text-[10px] font-black font-mono">
                  <span className={`px-2 py-0.5 rounded border ${
                    isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}>
                    🏥 Poliklinik: {monthScheduleStats.poliklinik} Gün
                  </span>
                  {monthScheduleStats.ameliyat > 0 && (
                    <span className={`px-2 py-0.5 rounded border ${
                      isDarkMode ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-purple-100 text-purple-900 border-purple-300'
                    }`}>
                      🔪 Ameliyat: {monthScheduleStats.ameliyat} Gün
                    </span>
                  )}
                  {monthScheduleStats.izin > 0 && (
                    <span className={`px-2 py-0.5 rounded border ${
                      isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      🏖️ İzin: {monthScheduleStats.izin} Gün
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 font-black">
                <select 
                  value={selectedMonth} 
                  onChange={(e) => {
                    const m = parseInt(e.target.value);
                    setSelectedMonth(m);
                    handleRegenerateMonth(selectedYear, m);
                  }} 
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-black outline-none cursor-default ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-blue-200 text-slate-900'
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
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-black outline-none cursor-default ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-blue-200 text-slate-900'
                  }`}
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                  <option value={2028}>2028</option>
                </select>
              </div>
            </div>

            {/* Days Scrollable List */}
            <div className={`flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-2 font-black pb-20 ${
              isDarkMode ? 'bg-slate-900' : 'bg-slate-50'
            }`}>
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
                        ? (isDarkMode ? 'opacity-40 bg-slate-950/40 border-slate-800 text-slate-400' : 'opacity-50 bg-slate-200 border-slate-300 text-slate-500')
                        : isToday 
                        ? (isDarkMode ? 'border-amber-400 bg-amber-500/15 text-amber-300 ring-2 ring-amber-400/30' : 'border-blue-600 bg-blue-100 text-blue-950 shadow-md ring-2 ring-blue-500/30')
                        : (isDarkMode ? 'bg-slate-950 border-slate-800/80 text-slate-200' : 'bg-white border-blue-100 text-slate-900')
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-xs">
                      <span className={`font-mono font-black ${isToday ? 'text-amber-500 text-sm font-black' : ''}`}>{sd.date}</span>
                      <span className={`text-[11px] uppercase font-black ${isToday ? 'text-amber-500 font-black' : 'text-slate-600 dark:text-slate-300'}`}>
                        {sd.day}
                      </span>
                      
                      {isPast && (
                        <span className="text-[9px] bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-400 px-2 py-0.5 rounded font-mono font-black uppercase">GEÇMİŞ</span>
                      )}

                      {isToday && (
                        <span className="text-[9px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black uppercase animate-pulse">BUGÜN</span>
                      )}

                      {sd.holidayName && (
                        <span className="text-[9px] bg-purple-600 text-white px-2 py-0.5 rounded font-black uppercase">🇹🇷 {sd.holidayName}</span>
                      )}
                    </div>

                    <select
                      value={sd.status}
                      disabled={isPast || !canChangeStatus}
                      onChange={(e) => handleDayStatusChange(idx, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg border text-[11px] font-black outline-none cursor-default uppercase ${getStatusBadgeStyle(sd.status)} ${
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

            {/* Floating Save Toolbar */}
            {hasUnsavedChanges && (
              <div className="absolute bottom-3 left-3 right-3 z-[100] animate-fadeIn">
                <div className={`p-3 px-4 rounded-xl border-2 shadow-2xl flex items-center justify-between gap-3 ${
                  isDarkMode ? 'bg-slate-950 border-cyan-500/80' : 'bg-white border-blue-500'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                    <span className="text-xs font-black text-cyan-500 uppercase">DEĞİŞİKLİKLER KAYDETMEYE HAZIR</span>
                  </div>

                  <div className="flex items-center gap-2 font-black text-xs">
                    <button
                      onClick={handleDiscardChanges}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 uppercase cursor-default"
                    >
                      ✕ VAZGEÇ
                    </button>
                    <button
                      onClick={handleSaveChangesDirectly}
                      className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md uppercase cursor-default"
                    >
                      💾 DEĞİŞİKLİKLERİ KAYDET
                    </button>
                  </div>
                </div>
              </div>
            )}

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
        <div className="fixed bottom-4 right-4 z-[250]" dir="ltr">
          <div 
            onClick={() => setIsMinimized(false)}
            className={`p-3 px-4 border-2 rounded-2xl shadow-2xl flex items-center gap-3 cursor-default hover:scale-105 transition-all ${
              isDarkMode ? 'bg-slate-900 border-cyan-500 text-white' : 'bg-white border-blue-500 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 font-black text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>📅 {selectedDoctor.name} (TAKVİM)</span>
            </div>
            
            <div className="flex items-center gap-1 font-mono font-black text-xs">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }} 
                className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500 hover:text-slate-950 font-black cursor-default"
              >
                🗖 BÜYÜT
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleRequestCloseScheduleModal(); }} 
                className="px-2 py-0.5 bg-rose-500/20 text-rose-500 rounded hover:bg-rose-500 hover:text-white font-black cursor-default"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}