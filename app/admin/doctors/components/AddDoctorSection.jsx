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
  setDocRoomNo
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className={`flex justify-between items-center pb-3 border-b ${
        isDarkMode ? 'border-slate-800' : 'border-blue-200'
      }`}>
        <h2 className="text-sm sm:text-base font-black text-amber-500 uppercase tracking-wider">
          ➕ YENİ BÖLÜM VE DOKTOR EKLENME PANELİ
        </h2>
        <button 
          onClick={() => setOpenedFolder('LIST_FOLDER')} 
          className={`px-3 py-1.5 rounded-xl text-xs font-black ${
            isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-white hover:bg-slate-200 text-slate-800 border border-slate-300'
          }`}
        >
          ✕ Kapat
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Add Department */}
        <div className={`border rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md ${
          isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white/80 border-blue-200'
        }`}>
          <div className={`flex items-center gap-2 pb-2 border-b ${
            isDarkMode ? 'border-slate-800' : 'border-blue-100'
          }`}>
            <span className="text-lg">📁</span>
            <h3 className="text-xs font-black text-amber-500 uppercase">1. YENİ BÖLÜM EKLE</h3>
          </div>

          <form onSubmit={handleAddCustomDepartment} className="space-y-3 font-black text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 mb-1 uppercase">BÖLÜM ADI</label>
              <input
                type="text"
                required
                placeholder="ÖRNEK: NÖROLOJİ"
                value={newCustomDept}
                onChange={(e) => setNewCustomDept(e.target.value.toLocaleUpperCase('tr-TR'))}
                className={`w-full border rounded-xl px-3 py-2 text-xs font-black outline-none uppercase ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500 placeholder:text-slate-600' 
                    : 'bg-white border-blue-200 text-slate-900 focus:border-amber-600 placeholder:text-slate-400'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-colors uppercase shadow-md cursor-pointer"
            >
              + Bölümü Kaydet
            </button>
          </form>
        </div>

        {/* 2. Add Doctor */}
        <div className={`border rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md ${
          isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white/80 border-blue-200'
        }`}>
          <div className={`flex items-center gap-2 pb-2 border-b ${
            isDarkMode ? 'border-slate-800' : 'border-blue-100'
          }`}>
            <span className="text-lg">🩺</span>
            <h3 className="text-xs font-black text-cyan-500 uppercase">2. YENİ DOKTOR EKLE</h3>
          </div>

          <form onSubmit={handleSaveNewDoctor} className="space-y-3 font-black text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 mb-1 uppercase">KLİNİK / BÖLÜM SEÇİN</label>
              <select
                value={docClinic}
                onChange={(e) => setDocClinic(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-xs font-black outline-none ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-cyan-500' 
                    : 'bg-white border-blue-200 text-slate-900 focus:border-blue-600'
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
                placeholder="ÖRNEK: DR. AHMET YILMAZ"
                value={docName}
                onChange={(e) => setDocName(e.target.value.toLocaleUpperCase('tr-TR'))}
                className={`w-full border rounded-xl px-3 py-2 text-xs font-black outline-none uppercase ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-cyan-500 placeholder:text-slate-600' 
                    : 'bg-white border-blue-200 text-slate-900 focus:border-blue-600 placeholder:text-slate-400'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 uppercase">DAHİLİ TEL</label>
                <input
                  type="text"
                  placeholder="1012"
                  value={docDahili}
                  onChange={(e) => setDocDahili(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 font-mono font-black text-xs outline-none ${
                    isDarkMode 
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-cyan-500 placeholder:text-slate-600' 
                      : 'bg-white border-blue-200 text-slate-900 focus:border-blue-600 placeholder:text-slate-400'
                  }`}
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 uppercase">ODA NO</label>
                <input
                  type="text"
                  placeholder="102"
                  value={docRoomNo}
                  onChange={(e) => setDocRoomNo(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 font-mono font-black text-xs outline-none ${
                    isDarkMode 
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-cyan-500 placeholder:text-slate-600' 
                      : 'bg-white border-blue-200 text-slate-900 focus:border-blue-600 placeholder:text-slate-400'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black rounded-xl text-xs transition-colors uppercase shadow-md cursor-pointer"
            >
              + Doktoru Sisteme Kaydet
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}