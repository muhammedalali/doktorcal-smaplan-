import MedicalIcon from './MedicalIcon';

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
  stats
}) {
  return (
    <aside className={`w-full lg:w-80 xl:w-88 flex flex-col shrink-0 select-none transition-all duration-300 backdrop-blur-md relative cursor-default ${
      isSidebarCollapsed ? 'lg:-ml-80 xl:-ml-88' : 'lg:ml-0'
    } ${
      isDarkMode ? 'bg-slate-950/70 border-r border-slate-800/80' : 'bg-slate-50/80 border-r border-blue-200/60'
    } ${
      showMobileSidebar 
        ? `block fixed inset-0 z-40 top-[52px] ${isDarkMode ? 'bg-[#020617]' : 'bg-[#edf4ff]'}` 
        : 'hidden lg:flex'
    }`}>
      
      {/* 1. Header Bar */}
      <div className={`p-2.5 sm:p-3 border-b flex items-center justify-between shrink-0 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800/80' : 'bg-white/90 border-blue-200/80 shadow-2xs'
      }`}>
        {canManageDocs ? (
          <button
            onClick={() => {
              setOpenedFolder('ADD_FOLDER');
              setSelectedDoctor(null);
              setShowMobileSidebar(false);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 hover:opacity-95 active:scale-95 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-default"
          >
            <span className="text-sm">➕</span>
            <span>Yeni Ekle</span>
          </button>
        ) : (
          <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">
            🏥 Bölüm Gezgini
          </span>
        )}

        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`p-2 rounded-xl border transition-all duration-150 active:scale-95 cursor-default flex items-center justify-center ${
            isDarkMode 
              ? 'bg-slate-900 hover:bg-cyan-500/20 border-slate-800 text-cyan-400 hover:border-cyan-500/40' 
              : 'bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:border-blue-400 shadow-xs'
          }`}
          title={isSidebarCollapsed ? "Gezgini Göster" : "Gezgini Gizle"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
            <path strokeWidth="2" strokeLinecap="round" d="M9 3v18" />
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M14 15l-3-3 3-3" />
          </svg>
        </button>
      </div>

      {/* 2. Fast Search Input */}
      <div className={`p-2.5 sm:p-3 border-b shrink-0 ${
        isDarkMode ? 'bg-slate-950/50 border-slate-800/60' : 'bg-blue-50/50 border-blue-200/50'
      }`}>
        <div className="relative flex items-center">
          <span className="absolute left-3 text-slate-400 text-xs font-black pointer-events-none">🔍</span>
          <input 
            type="text" 
            placeholder="Doktor veya Bölüm ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full font-black text-xs pl-8 pr-8 py-2 rounded-xl border focus:outline-none transition-all uppercase cursor-text ${
              isDarkMode 
                ? 'bg-slate-900 text-white border-slate-800 focus:border-cyan-500 placeholder:text-slate-500 shadow-inner' 
                : 'bg-white text-slate-900 border-blue-200 focus:border-blue-500 placeholder:text-slate-400 shadow-2xs'
            }`}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 text-xs font-black transition-colors cursor-default"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Slim Hierarchical Tree List */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-1.5 text-xs font-black scrollbar-thin overscroll-contain cursor-default">
        {uniqueDepartments.map((dept) => {
          const isExpanded = expandedDepts[dept] || (searchQuery.trim().length > 0);
          const deptDocs = getDoctorsByDept(dept);

          if (searchQuery.trim() && deptDocs.length === 0 && !dept.toLowerCase().includes(searchQuery.toLowerCase())) {
            return null;
          }

          return (
            <div key={dept} className="space-y-1 transition-all">
              
              {/* 🏢 Department Card Header */}
              <div 
                onClick={() => toggleDeptExpand(dept)}
                className={`group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl cursor-default transition-all duration-150 active:scale-[0.99] border shadow-2xs min-h-[44px] ${
                  isExpanded 
                    ? (isDarkMode 
                        ? 'bg-slate-900/90 border-cyan-500/70 text-white shadow-cyan-500/10' 
                        : 'bg-white border-blue-500 text-slate-900 shadow-blue-500/10')
                    : (isDarkMode 
                        ? 'bg-slate-900/50 hover:bg-slate-900 border-slate-800/80 text-slate-200 hover:border-slate-700' 
                        : 'bg-white/90 hover:bg-white border-slate-200/90 text-slate-800 hover:border-blue-300')
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 truncate pr-1">
                  <svg 
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isExpanded 
                        ? 'rotate-90 text-cyan-500 dark:text-cyan-400' 
                        : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>

                  <MedicalIcon name={dept} className="w-6 h-6 shrink-0" />
                  <span className="truncate text-[11px] sm:text-xs uppercase font-black tracking-wide">{dept}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-xl font-mono font-black border transition-colors ${
                    isExpanded
                      ? (isDarkMode 
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                          : 'bg-blue-500/10 text-blue-700 border-blue-300')
                      : (isDarkMode 
                          ? 'bg-slate-800/60 text-slate-400 border-slate-700/60' 
                          : 'bg-slate-100 text-slate-600 border-slate-200')
                  }`}>
                    {deptDocs.length}
                  </span>

                  {canDeleteDocs && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingDept(dept);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-rose-500/20 text-rose-500 rounded-lg text-xs cursor-default"
                      title="Bölümü Sil"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              {/* 🩺 Doctor Rows */}
              {isExpanded && (
                <div className={`ml-3.5 sm:ml-4 pl-3 border-l-2 space-y-1 pt-0.5 pb-0.5 transition-all ${
                  isDarkMode ? 'border-cyan-500/40' : 'border-blue-400/60'
                }`}>
                  {deptDocs.length === 0 ? (
                    <div className="py-1.5 px-3 text-[11px] text-slate-400 italic font-black bg-slate-900/20 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                      Bu bölümde henüz doktor kayıtlı değil.
                    </div>
                  ) : (
                    deptDocs.map((docItem) => {
                      const isDocSelected = selectedDoctor?.id === docItem.id;

                      return (
                        <div
                          key={docItem.id}
                          onClick={() => {
                            handleDoctorClickFromTree(docItem);
                            setShowMobileSidebar(false);
                          }}
                          className={`group flex items-center justify-between py-1.5 px-3 rounded-lg cursor-default transition-all duration-150 active:scale-[0.99] border min-h-[32px] ${
                            isDocSelected 
                              ? (isDarkMode 
                                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 font-black shadow-xs' 
                                  : 'bg-blue-100 border-blue-400 text-blue-950 font-black shadow-xs')
                              : (isDarkMode 
                                  ? 'bg-slate-900/40 hover:bg-slate-800/80 border-slate-800/80 text-slate-300 hover:border-slate-700' 
                                  : 'bg-white hover:bg-blue-50/60 border-slate-200/80 text-slate-700 hover:border-blue-300 shadow-2xs')
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isDocSelected ? 'bg-cyan-400 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'
                            }`}></span>
                            <span className="truncate text-[11px] font-black uppercase tracking-wide">{docItem.name}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* 4. Footer Summary Stats */}
      <div className={`p-2.5 sm:p-3 border-t text-[11px] flex justify-between font-mono font-black shrink-0 cursor-default ${
        isDarkMode ? 'bg-slate-950/90 border-slate-800/80 text-slate-400' : 'bg-white/90 border-blue-200/80 text-slate-700'
      }`}>
        <span>Bölüm: {stats.totalDeps}</span>
        <span className="text-cyan-500 dark:text-cyan-400 font-black">Toplam Doktor: {stats.totalDocs}</span>
      </div>
    </aside>
  );
}