export default function EditDoctorModal({
  editingDoctor,
  setEditingDoctor,
  handleSaveEditedDoctor,
  uniqueDepartments,
  isDarkMode
}) {
  if (!editingDoctor) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="ltr">
      <div className={`w-full max-w-md border rounded-3xl p-5 shadow-2xl space-y-4 animate-fadeIn ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-blue-200 text-slate-900'
      }`}>
        <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>DOKTOR BİLGİLERİNİ DÜZENLE</span>
          </h3>
          <button onClick={() => setEditingDoctor(null)} className="text-slate-400 hover:text-rose-500 text-base font-black">✕</button>
        </div>
        
        <form onSubmit={handleSaveEditedDoctor} className="space-y-3 font-black text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-300 mb-1 uppercase">KLİNİK / BÖLÜM</label>
            <select
              value={editingDoctor.clinic}
              onChange={(e) => setEditingDoctor({ ...editingDoctor, clinic: e.target.value })}
              className={`w-full border rounded-xl px-3 py-2 text-xs font-black outline-none ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-blue-200 text-slate-900'
              }`}
            >
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-300 mb-1 uppercase">DOKTOR ADI SOYADI</label>
            <input
              type="text"
              required
              value={editingDoctor.name}
              onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value.toLocaleUpperCase('tr-TR') })}
              className={`w-full border rounded-xl px-3 py-2 text-xs font-black outline-none uppercase ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-blue-200 text-slate-900'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 mb-1 uppercase">DAHİLİ TEL</label>
              <input
                type="text"
                value={editingDoctor.dahili || ''}
                onChange={(e) => setEditingDoctor({ ...editingDoctor, dahili: e.target.value })}
                className={`w-full border rounded-xl px-3 py-2 font-mono font-black text-xs outline-none ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-blue-200 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 mb-1 uppercase">ODA NO</label>
              <input
                type="text"
                value={editingDoctor.roomNo || ''}
                onChange={(e) => setEditingDoctor({ ...editingDoctor, roomNo: e.target.value })}
                className={`w-full border rounded-xl px-3 py-2 font-mono font-black text-xs outline-none ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-blue-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingDoctor(null)}
              className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-black rounded-xl text-xs transition-colors uppercase cursor-pointer"
            >
              İptal
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-colors uppercase shadow-md cursor-pointer"
            >
              💾 Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}