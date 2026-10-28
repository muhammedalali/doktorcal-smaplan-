export default function ConfirmModals({
  deletingDept,
  canDeleteDocs,
  setDeletingDept,
  handleConfirmDeleteDepartment,
  deletingDoc,
  setDeletingDoc,
  handleConfirmDeleteDoctor,
  showConfirmCloseModal,
  handleConfirmCloseNo,
  handleConfirmCloseYes,
  isDarkMode
}) {
  return (
    <>
      {/* Delete Department Modal */}
      {deletingDept && canDeleteDocs && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="ltr">
          <div className={`w-full max-w-xs border rounded-2xl p-5 shadow-2xl text-center space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-blue-200 text-slate-900'
          }`}>
            <h3 className="text-sm font-black text-rose-500 uppercase">🗑️ BÖLÜMÜ SİL</h3>
            <p className="text-xs font-black">
              <span className="text-amber-500 font-black">{deletingDept}</span> bölümünü silmek istediğinize emin misiniz?
            </p>
            <div className="flex gap-2 font-black text-xs pt-2">
              <button onClick={() => setDeletingDept(null)} className="flex-1 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded-xl uppercase cursor-pointer">İPTAL</button>
              <button onClick={handleConfirmDeleteDepartment} className="flex-1 py-2 bg-rose-600 text-white rounded-xl uppercase cursor-pointer">EVET, SİL</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Doctor Modal */}
      {deletingDoc && canDeleteDocs && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="ltr">
          <div className={`w-full max-w-xs border rounded-2xl p-5 shadow-2xl text-center space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-blue-200 text-slate-900'
          }`}>
            <h3 className="text-sm font-black text-rose-500 uppercase">🗑️ DOKTORU SİL</h3>
            <p className="text-xs font-black">
              <span className="text-amber-500 font-black">{deletingDoc.name}</span> isimli doktoru silmek istediğinize emin misiniz?
            </p>
            <div className="flex gap-2 font-black text-xs pt-2">
              <button onClick={() => setDeletingDoc(null)} className="flex-1 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded-xl uppercase cursor-pointer">İPTAL</button>
              <button onClick={handleConfirmDeleteDoctor} className="flex-1 py-2 bg-rose-600 text-white rounded-xl uppercase cursor-pointer">EVET, SİL</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Save On Close Modal */}
      {showConfirmCloseModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="ltr">
          <div className={`w-full max-w-sm border border-amber-500/50 rounded-2xl p-5 shadow-2xl text-center space-y-4 ${
            isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
          }`}>
            <div className="text-3xl">⚠️</div>
            <div>
              <h3 className="text-xs font-black text-amber-500 uppercase">KAYDETMEDEN ÇIKIYORSUNUZ</h3>
              <p className="text-xs font-black mt-1">Yaptığınız değişiklikleri kaydetmek istiyor musunuz?</p>
            </div>
            
            <div className="flex gap-2 font-black text-xs pt-2">
              <button 
                onClick={handleConfirmCloseNo} 
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl uppercase cursor-pointer"
              >
                HAYIR (İPTAL ET)
              </button>
              <button 
                onClick={handleConfirmCloseYes} 
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl uppercase cursor-pointer"
              >
                EVET (KAYDET)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}