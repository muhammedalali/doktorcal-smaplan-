import { getStatusBadgeStyle } from '../utils/scheduleUtils';

export default function DoctorDetailCard({
  selectedDoctor,
  isDarkMode,
  handleOpenSchedule,
  setEditingDoctor,
  canDeleteDocs,
  setDeletingDoc,
  getDoctorTodayStatus
}) {
  if (!selectedDoctor) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className={`flex flex-wrap items-center justify-between gap-3 pb-4 border-b ${
        isDarkMode ? 'border-slate-800' : 'border-blue-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-3.5 border rounded-2xl shadow-lg ${
            isDarkMode 
              ? 'bg-slate-900/60 border-slate-800 shadow-cyan-500/5' 
              : 'bg-white border-blue-200 shadow-blue-900/5'
          }`}>
            <span className="text-3xl">🩺</span>
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black uppercase">{selectedDoctor.name}</h2>
            <p className="text-xs text-cyan-500 dark:text-cyan-400 font-mono font-black mt-0.5">
              Bölüm: {selectedDoctor.clinic} | ID: {selectedDoctor.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenSchedule(selectedDoctor)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 hover:opacity-95 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-cyan-500/20 cursor-pointer uppercase"
          >
            <span>📅 Çalışma Takvimi Aç</span>
          </button>

          <button
            onClick={() => setEditingDoctor(selectedDoctor)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border rounded-xl text-xs font-black transition-colors cursor-pointer uppercase ${
              isDarkMode 
                ? 'bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border-amber-500/30' 
                : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
            }`}
          >
            <span>✏️ Düzenle</span>
          </button>

          {canDeleteDocs && (
            <button
              onClick={() => setDeletingDoc(selectedDoctor)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 border rounded-xl text-xs font-black transition-colors cursor-pointer uppercase ${
                isDarkMode 
                  ? 'bg-rose-500/10 hover:bg-rose-600 text-rose-300 hover:text-white border-rose-500/30' 
                  : 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300'
              }`}
            >
              <span>🗑️ Sil</span>
            </button>
          )}
        </div>
      </div>

      <div className={`border rounded-2xl p-6 space-y-5 shadow-xl backdrop-blur-md ${
        isDarkMode 
          ? 'bg-slate-900/30 border-slate-800' 
          : 'bg-white/80 border-blue-200 shadow-blue-900/5'
      }`}>
        <h3 className="text-xs font-black text-cyan-500 dark:text-cyan-400 uppercase tracking-widest pb-2 border-b border-slate-200 dark:border-slate-800/80">
          DETAYLI DOKTOR BİLGİ KARTI
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono font-black">
          <div className={`p-4 rounded-xl border ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-blue-100'
          }`}>
            <span className="text-slate-400 block text-[10px] mb-1 uppercase">KLİNİK / BÖLÜM</span>
            <span className="font-black text-sm uppercase text-blue-900 dark:text-cyan-300">{selectedDoctor.clinic}</span>
          </div>

          <div className={`p-4 rounded-xl border ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-blue-100'
          }`}>
            <span className="text-slate-400 block text-[10px] mb-1 uppercase">DAHİLİ TELEFON</span>
            <span className="text-amber-600 dark:text-amber-400 font-black text-sm">{selectedDoctor.dahili || '-'}</span>
          </div>

          <div className={`p-4 rounded-xl border ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-blue-100'
          }`}>
            <span className="text-slate-400 block text-[10px] mb-1 uppercase">POLİKLİNİK ODA NO</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">{selectedDoctor.roomNo || '-'}</span>
          </div>

          <div className={`p-4 rounded-xl border flex flex-col justify-between ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-blue-100'
          }`}>
            <span className="text-slate-400 block text-[10px] mb-1 uppercase">BUGÜNKÜ ÇALIŞMA DURUMU</span>
            <div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase border inline-block ${getStatusBadgeStyle(getDoctorTodayStatus(selectedDoctor))}`}>
                {getDoctorTodayStatus(selectedDoctor)}
              </span>
            </div>
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-mono ${
          isDarkMode ? 'bg-cyan-500/5 border-cyan-500/20 text-cyan-300' : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}>
          <span>💡 Takvim güncellemesi için sağ üstteki <b>"Çalışma Takvimi Aç"</b> butonunu kullanabilirsiniz.</span>
        </div>
      </div>
    </div>
  );
}