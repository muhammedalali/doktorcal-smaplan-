import { getStatusBadgeStyle } from '../utils/scheduleUtils';

export default function DoctorDetailCard({
  selectedDoctor,
  isDarkMode,
  handleOpenSchedule,
  setEditingDoctor,
  canDeleteDocs,
  setDeletingDoc,
  getDoctorTodayStatus,
}) {
  if (!selectedDoctor) return null;

  const todayStatus = getDoctorTodayStatus(selectedDoctor);

  // أنماط مشتركة
  const cardBg = isDarkMode
    ? 'bg-slate-900 ring-1 ring-slate-800'
    : 'bg-white ring-1 ring-slate-200 shadow-sm';

  const infoBox = `rounded-xl p-4 ${
    isDarkMode ? 'bg-slate-950/60' : 'bg-slate-50'
  }`;

  const labelCls = `text-[10px] font-bold uppercase tracking-wider mb-1 ${
    isDarkMode ? 'text-slate-500' : 'text-slate-500'
  }`;

  const valueCls = `text-sm font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`;

  return (
    <div className="max-w-4xl mx-auto space-y-4">

      {/* ═══ 1. رأس الصفحة: الصورة + الاسم + الأزرار ═══ */}
      <div className={`rounded-2xl p-4 sm:p-5 ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">

          {/* Avatar كبير + المعلومات */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black ${
              isDarkMode
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                : 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
            }`}>
              🩺
            </div>

            <div className="min-w-0 flex-1">
              <h2 className={`text-lg sm:text-2xl font-black uppercase tracking-tight leading-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {selectedDoctor.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className={`inline-flex items-center gap-1 text-[11px] font-black uppercase px-2 py-0.5 rounded-md ${
                  isDarkMode
                    ? 'bg-cyan-500/15 text-cyan-300'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  🏥 {selectedDoctor.clinic}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-black uppercase ${getStatusBadgeStyle(todayStatus)}`}>
                  {todayStatus}
                </span>
              </div>
            </div>
          </div>

          {/* الأزرار */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenSchedule(selectedDoctor)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wide text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 active:scale-[0.98] transition-all duration-75 cursor-pointer shadow-md shadow-blue-500/20"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M8 3v4M16 3v4M3 11h18" />
              </svg>
              <span>Takvim</span>
            </button>

            <button
              type="button"
              onClick={() => setEditingDoctor(selectedDoctor)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wide active:scale-[0.98] transition-all duration-75 cursor-pointer ${
                isDarkMode
                  ? 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              <span>Düzenle</span>
            </button>

            {canDeleteDocs && (
              <button
                type="button"
                onClick={() => setDeletingDoc(selectedDoctor)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wide active:scale-[0.98] transition-all duration-75 cursor-pointer ${
                  isDarkMode
                    ? 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25'
                    : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
                </svg>
                <span>Sil</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ═══ 2. بطاقات المعلومات ═══ */}
      <div className={`rounded-2xl p-4 sm:p-5 ${cardBg}`}>
        <h3 className={`text-[11px] font-black uppercase tracking-widest pb-2 mb-3 border-b ${
          isDarkMode ? 'text-cyan-400 border-slate-800' : 'text-blue-600 border-slate-200'
        }`}>
          Doktor Bilgileri
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* القسم */}
          <div className={infoBox}>
            <div className={labelCls}>Klinik / Bölüm</div>
            <div className={`${valueCls} text-cyan-600 dark:text-cyan-400`}>
              {selectedDoctor.clinic || '-'}
            </div>
          </div>

          {/* الهاتف الداخلي */}
          <div className={infoBox}>
            <div className={labelCls}>Dahili Telefon</div>
            <div className={`${valueCls} font-mono text-amber-600 dark:text-amber-400`}>
              {selectedDoctor.dahili || '-'}
            </div>
          </div>

          {/* رقم الغرفة */}
          <div className={infoBox}>
            <div className={labelCls}>Oda No</div>
            <div className={`${valueCls} font-mono text-emerald-600 dark:text-emerald-400`}>
              {selectedDoctor.roomNo || '-'}
            </div>
          </div>

          {/* الحالة اليومية */}
          <div className={infoBox}>
            <div className={labelCls}>Bugünkü Durum</div>
            <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-black uppercase ${getStatusBadgeStyle(todayStatus)}`}>
              {todayStatus}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ 3. شريط الملاحظة ═══ */}
      <div className={`rounded-xl p-3 flex items-center gap-2 text-xs font-bold ${
        isDarkMode
          ? 'bg-cyan-500/8 text-cyan-300'
          : 'bg-blue-50 text-blue-700'
      }`}>
        <span className="text-base shrink-0">💡</span>
        <span className="leading-relaxed">
          Takvim güncellemesi için üstteki <b className="uppercase">Takvim</b> butonunu kullanabilirsiniz.
        </span>
      </div>

    </div>
  );
}