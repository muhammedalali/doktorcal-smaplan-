'use client';

import { useMemo, useCallback, useDeferredValue, memo } from 'react';
import MedicalIcon from './MedicalIcon';

const TR_UP = (s = '') => s.toLocaleUpperCase('tr-TR');

function HighlightMatch({ text, query }) {
  if (!query || !query.trim()) return <>{text}</>;
  const q = TR_UP(query.trim());
  const t = TR_UP(text);
  const out = [];
  let i = 0;
  while (i < t.length) {
    const idx = t.indexOf(q, i);
    if (idx === -1) { out.push(text.slice(i)); break; }
    if (idx > i) out.push(text.slice(i, idx));
    out.push(
      <mark key={`${idx}-${i}`} className="bg-amber-300 text-slate-900 rounded px-0.5">
        {text.slice(idx, idx + q.length)}
      </mark>
    );
    i = idx + q.length;
  }
  return <>{out}</>;
}

function initials(name = '') {
  return name
    .replace(/^DR\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toLocaleUpperCase('tr-TR');
}

/** صف الطبيب — memoized + ألوان صحيحة حسب الوضع */
const DoctorRow = memo(function DoctorRow({ docItem, isSelected, query, onSelect, isDarkMode }) {
  // ✅ ألوان منفصلة تماماً لكل حالة — بدون تعارض
  const containerClass = isSelected
    ? (isDarkMode ? 'bg-cyan-500/20 ring-1 ring-cyan-400/40' : 'bg-blue-500/15 ring-1 ring-blue-500/40')
    : (isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-white/70');

  const textClass = isSelected
    ? (isDarkMode ? 'text-cyan-50' : 'text-blue-950')
    : (isDarkMode ? 'text-slate-100' : 'text-slate-900');

  const avatarClass = isSelected
    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
    : (isDarkMode ? 'bg-slate-800/80 text-cyan-300' : 'bg-blue-500/15 text-blue-700');

  const dotClass = isDarkMode ? 'bg-cyan-400' : 'bg-blue-500';

  return (
    <div
      onClick={() => onSelect(docItem)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(docItem);
        }
      }}
      className={`group flex items-center gap-2 py-1.5 pl-1.5 pr-2 rounded-lg cursor-pointer transition-colors duration-100 active:scale-[0.99] min-h-[42px] ${containerClass}`}
    >
      <div className={`w-7 h-7 shrink-0 rounded-md flex items-center justify-center text-[10px] font-black ${avatarClass}`}>
        {initials(docItem.name)}
      </div>

      <span className={`truncate text-xs font-black uppercase tracking-wide flex-1 ${textClass}`}>
        <HighlightMatch text={docItem.name || ''} query={query} />
      </span>

      {isSelected && <span className={`w-1.5 h-1.5 rounded-full shrink-0 animate-pulse ${dotClass}`} />}
    </div>
  );
});

export default function DoctorsSidebar({
  isDarkMode,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  showMobileSidebar,
  setShowMobileSidebar,
  canManageDocs,
  canDeleteDocs,
  setOpenedFolder,
  setSelectedDoctor,
  searchQuery,
  setSearchQuery,
  uniqueDepartments,
  expandedDepts,
  toggleDeptExpand,
  getDoctorsByDept,
  selectedDoctor,
  handleDoctorClickFromTree,
  setDeletingDept,
  stats,
}) {
  const deferredQuery = useDeferredValue(searchQuery);
  const hasQuery = deferredQuery.trim().length > 0;

  const matchCount = useMemo(() => {
    if (!hasQuery) return 0;
    let n = 0;
    uniqueDepartments.forEach((dept) => {
      if (TR_UP(dept).includes(TR_UP(deferredQuery))) n += 1;
      n += getDoctorsByDept(dept).length;
    });
    return n;
  }, [hasQuery, deferredQuery, uniqueDepartments, getDoctorsByDept]);

  const handleSelectDoctor = useCallback((docItem) => {
    handleDoctorClickFromTree(docItem);
    setShowMobileSidebar(false);
  }, [handleDoctorClickFromTree, setShowMobileSidebar]);

  // ✅ تأكيد تسجيل النقر على زر الحذف (مفيد للتصحيح)
  const handleDeleteDeptClick = useCallback((e, dept) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('[SIDEBAR] Delete requested for department:', dept);
    setDeletingDept(dept);
  }, [setDeletingDept]);

  const asideBg = isDarkMode
    ? 'bg-gradient-to-b from-slate-950/85 via-slate-950/70 to-slate-950/85 backdrop-blur-xl'
    : 'bg-gradient-to-b from-white/85 via-blue-50/65 to-white/85 backdrop-blur-xl';

  return (
    <aside
      className={`w-full lg:w-[300px] xl:w-[320px] flex flex-col shrink-0 select-none transition-all duration-300 relative cursor-default ${
        isSidebarCollapsed ? 'lg:-ml-[300px] xl:-ml-[320px]' : 'lg:ml-0'
      } ${asideBg} ${
        showMobileSidebar
          ? `flex fixed inset-0 z-40 top-[52px] ${isDarkMode ? 'bg-[#020617]' : 'bg-[#f5f8ff]'}`
          : 'hidden lg:flex'
      }`}
    >
      {/* Header */}
      <div className="p-2.5 flex items-center justify-between gap-2 shrink-0">
        {canManageDocs ? (
          <button
            onClick={() => {
              setOpenedFolder('ADD_FOLDER');
              setSelectedDoctor(null);
              setShowMobileSidebar(false);
            }}
            className="group flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 hover:opacity-95 active:scale-[0.98] text-white rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/25 cursor-pointer"
          >
            <svg className="w-4 h-4 transition-transform group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>YENİ EKLE</span>
          </button>
        ) : (
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2">
            🏥 Bölüm Gezgini
          </span>
        )}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`hidden lg:flex p-2 rounded-lg transition-all active:scale-95 cursor-pointer items-center justify-center ${
            isDarkMode ? 'bg-slate-800/50 hover:bg-cyan-500/20 text-cyan-400' : 'bg-white/60 hover:bg-blue-100/70 text-blue-600'
          }`}
          title={isSidebarCollapsed ? 'Gezgini Göster' : 'Gezgini Gizle'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
            <path strokeWidth="2" strokeLinecap="round" d="M9 3v18" />
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M14 15l-3-3 3-3" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="px-2.5 pb-2.5 shrink-0">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            inputMode="search"
            placeholder="Doktor / bölüm ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full font-bold text-xs pl-10 pr-9 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 uppercase cursor-text ${
              isDarkMode
                ? 'bg-slate-800/50 focus:bg-slate-800/70 text-white focus:ring-cyan-500/50 placeholder:text-slate-500 placeholder:normal-case'
                : 'bg-white/60 focus:bg-white/90 text-slate-900 focus:ring-blue-500/40 placeholder:text-slate-400 placeholder:normal-case'
            } backdrop-blur-sm`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {hasQuery && (
          <div className={`mt-1.5 px-1 text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
            {matchCount} sonuç
          </div>
        )}
      </div>

      {/* Tree */}
      <div
        className="flex-1 overflow-y-auto px-2 pb-2 space-y-1 text-sm font-black overscroll-contain custom-scrollbar"
        style={{ contain: 'layout style paint' }}
      >
        {uniqueDepartments.length === 0 && (
          <div className={`p-4 text-center text-[11px] italic rounded-xl ${
            isDarkMode ? 'text-slate-500 bg-slate-800/30' : 'text-slate-400 bg-white/40'
          } backdrop-blur-sm`}>
            Henüz bölüm yok.
          </div>
        )}

        {uniqueDepartments.map((dept) => {
          const isExpanded = expandedDepts[dept] || hasQuery;
          const deptDocs = getDoctorsByDept(dept);
          const deptMatchesQuery = hasQuery && TR_UP(dept).includes(TR_UP(deferredQuery));
          if (hasQuery && deptDocs.length === 0 && !deptMatchesQuery) return null;

          return (
            <div key={dept} className="space-y-0.5">
              {/* صف القسم */}
              <div
                onClick={() => toggleDeptExpand(dept)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleDeptExpand(dept);
                  }
                }}
                className={`group relative flex items-center justify-between py-1.5 pl-1.5 pr-2 rounded-xl cursor-pointer transition-colors duration-100 active:scale-[0.99] min-h-[48px] ${
                  isExpanded
                    ? (isDarkMode ? 'bg-cyan-500/12' : 'bg-blue-500/12')
                    : (isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-white/70')
                } backdrop-blur-sm`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  <svg
                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                      isExpanded ? 'rotate-90 text-cyan-500 dark:text-cyan-400' : 'text-slate-400'
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                  <MedicalIcon name={dept} className="w-9 h-9 shrink-0" />
                  <span className={`truncate text-[13px] uppercase font-black tracking-wide ${
                    isDarkMode ? 'text-slate-100' : 'text-slate-900'
                  }`}>
                    <HighlightMatch text={dept} query={deferredQuery} />
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className={`text-[11px] px-2 py-0.5 rounded-md font-mono font-black ${
                    isExpanded
                      ? (isDarkMode ? 'bg-cyan-500/25 text-cyan-100' : 'bg-blue-500/15 text-blue-800')
                      : (isDarkMode ? 'bg-slate-800/60 text-slate-300' : 'bg-slate-200/70 text-slate-700')
                  }`}>
                    {deptDocs.length}
                  </span>

                  {/* ✅ زر الحذف — مرئي دائماً على الهاتف + clickable */}
                  {canDeleteDocs && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteDeptClick(e, dept)}
                      className={`opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 rounded-md cursor-pointer touch-manipulation ${
                        isDarkMode
                          ? 'hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-400'
                          : 'hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-500'
                      }`}
                      title="Bölümü Sil"
                      aria-label={`${dept} bölümünü sil`}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14M10 11v6M14 11v6" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* الأطباء */}
              {isExpanded && (
                <div className="ml-4 pl-3 space-y-0.5">
                  {deptDocs.length === 0 ? (
                    <div className={`py-2 px-2 text-[11px] italic rounded-lg ${
                      isDarkMode ? 'text-slate-500 bg-slate-800/30' : 'text-slate-400 bg-white/40'
                    } backdrop-blur-sm`}>
                      Bu bölümde doktor yok.
                    </div>
                  ) : (
                    deptDocs.map((docItem) => (
                      <DoctorRow
                        key={docItem.id}
                        docItem={docItem}
                        isSelected={selectedDoctor?.id === docItem.id}
                        query={deferredQuery}
                        onSelect={handleSelectDoctor}
                        isDarkMode={isDarkMode}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className={`px-2.5 py-2 flex items-center justify-between text-[11px] font-mono font-black shrink-0 ${
        isDarkMode ? 'text-slate-400 bg-slate-900/40' : 'text-slate-600 bg-white/40'
      } backdrop-blur-sm`}>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>BÖLÜM <b className="text-blue-600 dark:text-blue-400">{stats.totalDeps}</b></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          <span>DOKTOR <b className="text-cyan-600 dark:text-cyan-400">{stats.totalDocs}</b></span>
        </div>
      </div>
    </aside>
  );
}