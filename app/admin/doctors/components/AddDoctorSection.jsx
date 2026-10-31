export default function AddDoctorSection({
  isDarkMode,
  setOpenedFolder,
  handleAddCustomDepartment,
  newCustomDept,
  setNewCustomDept,
  handleSaveNewDoctor,
  docClinic,
  setDocClinic,
  uniqueDepartments,
  docName,
  setDocName,
  docDahili,
  setDocDahili,
  docRoomNo,
  setDocRoomNo,
}) {
  const cardBg = isDarkMode
    ? 'bg-slate-900 ring-1 ring-slate-800'
    : 'bg-white ring-1 ring-slate-200 shadow-sm';

  const labelCls = `block text-[10px] font-black uppercase tracking-wider mb-1.5 ${
    isDarkMode ? 'text-slate-400' : 'text-slate-500'
  }`;

  const inputCls = `w-full rounded-lg px-3 py-2.5 text-sm font-bold outline-none transition-all duration-75 focus:ring-2 uppercase placeholder:normal-case ${
    isDarkMode
      ? 'bg-slate-950 text-white placeholder:text-slate-600 focus:ring-cyan-500/40'
      : 'bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500/30 focus:bg-white'
  }`;

  const inputMonoCls = `${inputCls} font-mono tracking-wider`;

  return (
    <div className="max-w-5xl mx-auto space-y-4">

      {/* ═══ Header ═══ */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl shrink-0">➕</span>
          <h2 className={`text-base sm:text-lg font-black uppercase tracking-tight truncate ${
            isDarkMode ? 'text-amber-400' : 'text-amber-600'
          }`}>
            Yeni Bölüm / Doktor
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setOpenedFolder('LIST_FOLDER')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wide active:scale-[0.98] transition-all duration-75 cursor-pointer shrink-0 ${
            isDarkMode
              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
          <span>Kapat</span>
        </button>
      </div>

      {/* ═══ Grid ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ─── 1. إضافة قسم ─── */}
        <div className={`rounded-2xl p-4 sm:p-5 ${cardBg}`}>
          <div className={`flex items-center gap-2 pb-3 mb-4 border-b ${
            isDarkMode ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${
              isDarkMode ? 'bg-amber-500/15' : 'bg-amber-100'
            }`}>
              📁
            </div>
            <div className="min-w-0">
              <div className={`text-[10px] font-black uppercase tracking-widest ${
                isDarkMode ? 'text-slate-500' : 'text-slate-500'
              }`}>
                Adım 1
              </div>
              <div className={`text-sm font-black uppercase ${
                isDarkMode ? 'text-amber-300' : 'text-amber-700'
              }`}>
                Yeni Bölüm Ekle
              </div>
            </div>
          </div>

          <form onSubmit={handleAddCustomDepartment} className="space-y-3">
            <div>
              <label className={labelCls}>Bölüm Adı</label>
              <input
                type="text"
                required
                placeholder="Örn: Nöroloji"
                value={newCustomDept}
                onChange={(e) => setNewCustomDept(e.target.value.toLocaleUpperCase('tr-TR'))}
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wide text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 active:scale-[0.98] transition-all duration-75 cursor-pointer shadow-md shadow-amber-500/20"
            >
              + Bölümü Kaydet
            </button>
          </form>
        </div>

        {/* ─── 2. إضافة طبيب ─── */}
        <div className={`rounded-2xl p-4 sm:p-5 ${cardBg}`}>
          <div className={`flex items-center gap-2 pb-3 mb-4 border-b ${
            isDarkMode ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${
              isDarkMode ? 'bg-cyan-500/15' : 'bg-cyan-100'
            }`}>
              🩺
            </div>
            <div className="min-w-0">
              <div className={`text-[10px] font-black uppercase tracking-widest ${
                isDarkMode ? 'text-slate-500' : 'text-slate-500'
              }`}>
                Adım 2
              </div>
              <div className={`text-sm font-black uppercase ${
                isDarkMode ? 'text-cyan-300' : 'text-cyan-700'
              }`}>
                Yeni Doktor Ekle
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveNewDoctor} className="space-y-3">
            <div>
              <label className={labelCls}>Klinik / Bölüm Seçin</label>
              <select
                value={docClinic}
                onChange={(e) => setDocClinic(e.target.value)}
                className={inputCls}
              >
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Doktor Adı Soyadı</label>
              <input
                type="text"
                required
                placeholder="Örn: Dr. Ahmet Yılmaz"
                value={docName}
                onChange={(e) => setDocName(e.target.value.toLocaleUpperCase('tr-TR'))}
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>Dahili Tel</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1012"
                  value={docDahili}
                  onChange={(e) => setDocDahili(e.target.value)}
                  className={inputMonoCls}
                />
              </div>
              <div>
                <label className={labelCls}>Oda No</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="102"
                  value={docRoomNo}
                  onChange={(e) => setDocRoomNo(e.target.value)}
                  className={inputMonoCls}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wide text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 active:scale-[0.98] transition-all duration-75 cursor-pointer shadow-md shadow-blue-500/20"
            >
              + Doktoru Kaydet
            </button>
          </form>
        </div>

      </div>

      {/* ═══ ملاحظة سفلية ═══ */}
      <div className={`rounded-xl p-3 flex items-start gap-2 text-xs font-bold ${
        isDarkMode
          ? 'bg-blue-500/8 text-blue-300'
          : 'bg-blue-50 text-blue-700'
      }`}>
        <span className="text-base shrink-0">💡</span>
        <span className="leading-relaxed">
          Bölümü eklemeden doktor ekleyemezsiniz. Yeni bölümler otomatik olarak listenin sonuna eklenir.
        </span>
      </div>

    </div>
  );
}