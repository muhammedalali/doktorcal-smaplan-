'use client';

/* ═══════════════════════════════════════════════════════════
   أيقونة سلة حديثة صغيرة — SVG نظيف بتدرجين فقط
   حجم صغير، بدون مربع، تعمل بجانب النص
   ═══════════════════════════════════════════════════════════ */
function TrashIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="trash-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>
      </defs>

      {/* المقبض */}
      <path
        d="M9 3h6a1 1 0 0 1 1 1v1h2.5a1 1 0 1 1 0 2h-13a1 1 0 1 1 0-2H8V4a1 1 0 0 1 1-1z"
        fill="url(#trash-grad)"
      />

      {/* جسم السلة */}
      <path
        d="M6 8h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8z"
        fill="url(#trash-grad)"
      />

      {/* خطوط عمودية داخلية بيضاء */}
      <path
        d="M10 11v7M14 11v7"
        stroke="#FFFFFF"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   ConfirmModals — نافذة تأكيد مدمجة
   ═══════════════════════════════════════════════════════════ */
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
  isDarkMode,
}) {
  // ✅ بدون backdrop-blur — خلفية معتمة صريحة
  const overlay = 'fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-4';

  // ✅ مربع أصغر: max-w-sm + padding أقل
  const card = `w-full max-w-sm rounded-xl p-4 shadow-2xl ${
    isDarkMode
      ? 'bg-slate-900 ring-1 ring-slate-700'
      : 'bg-white ring-1 ring-slate-200'
  }`;

  // ✅ خطوط واضحة جداً
  const titleClass = `text-base font-black uppercase tracking-wide ${
    isDarkMode ? 'text-rose-300' : 'text-rose-600'
  }`;

  const bodyClass = `text-[13px] font-semibold leading-snug ${
    isDarkMode ? 'text-slate-200' : 'text-slate-700'
  }`;

  const nameHighlight = `font-black break-all ${
    isDarkMode ? 'text-rose-300' : 'text-rose-600'
  }`;

  const cancelBtn = `flex-1 py-2 rounded-lg font-bold text-[13px] uppercase tracking-wide transition-colors duration-75 active:scale-[0.98] cursor-pointer ${
    isDarkMode
      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
  }`;

  const dangerBtn = `flex-1 py-2 rounded-lg font-bold text-[13px] uppercase tracking-wide text-white transition-colors duration-75 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-rose-600 hover:bg-rose-700 ${
    isDarkMode ? 'hover:bg-rose-500' : ''
  }`;

  const successBtn = `flex-1 py-2 rounded-lg font-bold text-[13px] uppercase tracking-wide text-white transition-colors duration-75 active:scale-[0.98] cursor-pointer bg-emerald-600 hover:bg-emerald-700 ${
    isDarkMode ? 'hover:bg-emerald-500' : ''
  }`;

  return (
    <>
      {/* ═══ 1. حذف قسم ═══ */}
      {deletingDept && (
        <div className={overlay} dir="ltr" onClick={() => setDeletingDept(null)}>
          <div className={card} onClick={(e) => e.stopPropagation()}>
            {/* العنوان + السلة في نفس السطر */}
            <div className="flex items-center gap-2 pb-1">
              <TrashIcon className="w-5 h-5 shrink-0" />
              <h3 className={titleClass}>Bölümü Sil</h3>
            </div>

            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-3">
              Bu işlem geri alınamaz
            </p>

            <p className={`${bodyClass} mb-4`}>
              <span className={nameHighlight}>{deletingDept}</span> bölümünü silmek istediğinizden emin misiniz?
            </p>

            {!canDeleteDocs && (
              <div className={`mb-3 px-3 py-2 rounded-lg text-[11px] font-bold ${
                isDarkMode
                  ? 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30'
                  : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
              }`}>
                ⚠️ Silme yetkiniz bulunmamaktadır.
              </div>
            )}

            <div className="flex gap-2">
              <button type="button" onClick={() => setDeletingDept(null)} className={cancelBtn}>
                İptal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteDepartment}
                disabled={!canDeleteDocs}
                className={dangerBtn}
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 2. حذف طبيب ═══ */}
      {deletingDoc && (
        <div className={overlay} dir="ltr" onClick={() => setDeletingDoc(null)}>
          <div className={card} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 pb-1">
              <TrashIcon className="w-5 h-5 shrink-0" />
              <h3 className={titleClass}>Doktoru Sil</h3>
            </div>

            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-3">
              Bu işlem geri alınamaz
            </p>

            <p className={`${bodyClass} mb-4`}>
              <span className={nameHighlight}>{deletingDoc.name}</span> adlı doktoru silmek istediğinizden emin misiniz?
            </p>

            <div className="flex gap-2">
              <button type="button" onClick={() => setDeletingDoc(null)} className={cancelBtn}>
                İptal
              </button>
              <button type="button" onClick={handleConfirmDeleteDoctor} className={dangerBtn}>
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 3. إغلاق التقويم ═══ */}
      {showConfirmCloseModal && (
        <div className={overlay} dir="ltr">
          <div className={card}>
            <div className="flex items-center gap-2 pb-1">
              <span className="text-lg">💾</span>
              <h3 className={`text-base font-black uppercase tracking-wide ${
                isDarkMode ? 'text-amber-300' : 'text-amber-600'
              }`}>
                Kaydedilmemiş Değişiklikler
              </h3>
            </div>

            <p className={`${bodyClass} mb-4`}>
              Takvimde kaydedilmemiş değişiklikler var. Ne yapmak istersiniz?
            </p>

            <div className="flex gap-2">
              <button type="button" onClick={handleConfirmCloseNo} className={cancelBtn}>
                Geri Al
              </button>
              <button type="button" onClick={handleConfirmCloseYes} className={successBtn}>
                Kaydet ve Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}