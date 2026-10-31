export default function EditDoctorModal({
  editingDoctor,
  setEditingDoctor,
  handleSaveEditedDoctor,
  uniqueDepartments,
  isDarkMode,
}) {
  if (!editingDoctor) return null;

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
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4"
      dir="ltr"
      onClick={() => setEditingDoctor(null)}
    >
      <div
        className={`w-full max-w-md rounded-2xl p-5 shadow-2xl ${
          isDarkMode
            ? 'bg-slate-900 ring-1 ring-slate-800'
            : 'bg-white ring-1 ring-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center gap-2 pb-3 mb-4 border-b ${
          isDarkMode ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            isDarkMode ? 'bg-amber-500/15' : 'bg-amber-100'
          }`}>
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className={`text-[10px] font-black uppercase tracking-widest ${
              isDarkMode ? 'text-slate-500' : 'text-slate-500'
            }`}>
              Düzenle
            </div>
            <h3 className={`text-sm font-black uppercase tracking-wide truncate ${
              isDarkMode ? 'text-amber-300' : 'text-amber-700'
            }`}>
              Doktor Bilgileri
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setEditingDoctor(null)}
            className={`p-1.5 rounded-lg transition-colors duration-75 cursor-pointer ${
              isDarkMode
                ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-100'
            }`}
            aria-label="Kapat"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSaveEditedDoctor} className="space-y-3">
          <div>
            <label className={labelCls}>Klinik / Bölüm</label>
            <select
              value={editingDoctor.clinic}
              onChange={(e) => setEditingDoctor({ ...editingDoctor, clinic: e.target.value })}
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
              value={editingDoctor.name}
              onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value.toLocaleUpperCase('tr-TR') })}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Dahili Tel</label>
              <input
                type="text"
                inputMode="numeric"
                value={editingDoctor.dahili || ''}
                onChange={(e) => setEditingDoctor({ ...editingDoctor, dahili: e.target.value })}
                className={inputMonoCls}
              />
            </div>
            <div>
              <label className={labelCls}>Oda No</label>
              <input
                type="text"
                inputMode="numeric"
                value={editingDoctor.roomNo || ''}
                onChange={(e) => setEditingDoctor({ ...editingDoctor, roomNo: e.target.value })}
                className={inputMonoCls}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingDoctor(null)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wide transition-colors duration-75 active:scale-[0.98] cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wide text-white bg-amber-500 hover:bg-amber-600 active:scale-[0.98] transition-colors duration-75 cursor-pointer shadow-md shadow-amber-500/20"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}