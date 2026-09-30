'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useTheme } from '@/context/ThemeContext';
import { 
  Search, Filter, ShieldAlert, Clock, CheckCircle2, 
  XCircle, Globe, MapPin, User, Mail, Laptop, Calendar,
  FileText, AlertTriangle, RefreshCw, Trash2, X,
  Maximize2, Printer, Smartphone
} from 'lucide-react';

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const { isDarkMode } = useTheme();
  const router = useRouter();

  // 🔄 جلب البيانات وتحديثها فورياً من Firestore
  const fetchReports = useCallback(() => {
    setRefreshing(true);
    const q = query(collection(db, 'reports'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // ترتيب البلاغات من الأحدث إلى الأقدم
      reportsData.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      setReports(reportsData);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
      setRefreshing(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsub = fetchReports();
    return () => unsub && unsub();
  }, [fetchReports]);

  // تحديث حالة البلاغ
  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, { status: newStatus });
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Durum güncellenirken hata oluştu:', error);
      alert('Durum güncellenirken bir hata oluştu!');
    }
  };

  // حذف البلاغ نهائياً
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Bu bildirimi kalıcı olarak silmek istediğinize emin misiniz?')) return;

    try {
      await deleteDoc(doc(db, 'reports', reportId));
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Bildirim silinirken bir hata oluştu.');
    }
  };

  // 💡 دالة استخراج نوع الجهاز والنظام من نص User Agent الحقيقي
  const parseUserAgent = (ua) => {
    if (!ua) return 'Belirtilmedi / Web';
    let os = 'Bilinmeyen Sistem';
    let browser = 'Bilinmeyen Tarayıcı';

    if (ua.includes('Win')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('like Mac')) os = 'iOS';

    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edg')) browser = 'Edge';

    return `${os} • ${browser}`;
  };

  // فلترة البلاغات
  const filteredReports = reports.filter(report => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      report.title?.toLowerCase().includes(searchLower) ||
      report.senderName?.toLowerCase().includes(searchLower) ||
      report.reporterName?.toLowerCase().includes(searchLower) ||
      report.description?.toLowerCase().includes(searchLower) ||
      report.category?.toLowerCase().includes(searchLower) ||
      report.ipAddress?.includes(searchLower) ||
      report.id?.toLowerCase().includes(searchLower);
    
    const matchesStatus = 
      statusFilter === 'ALL' || 
      report.status === statusFilter || 
      (statusFilter === 'BEKLEYEN' && (!report.status || report.status === 'PENDING' || report.status === 'BEKLEYEN'));

    return matchesSearch && matchesStatus;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
      case 'YÜKSEK':
        return <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">Yüksek</span>;
      case 'MEDIUM':
      case 'ORTA':
        return <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">Orta</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">Normal</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
      case 'TAMAMLANDI':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"><CheckCircle2 size={13}/> Tamamlandı</span>;
      case 'IN_PROGRESS':
      case 'İŞLEMDE':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30"><Clock size={13}/> İşlemde</span>;
      case 'REJECTED':
      case 'REDDEDİLDİ':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-xl bg-rose-500/15 text-rose-500 border border-rose-500/30"><XCircle size={13}/> Reddedildi</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-xl bg-blue-500/15 text-blue-500 border border-blue-500/30"><AlertTriangle size={13}/> Yeni Bildirim</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="animate-spin rounded-full h-11 w-11 border-b-2 border-emerald-500"></div>
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Sistem Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 sm:p-8 transition-colors duration-150 font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`} dir="ltr">
      
      {/* 🌟 Header Panel */}
      <div className={`p-5 rounded-2xl border shadow-xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <ShieldAlert size={26} className="stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase">Bildirim ve Rapor Yönetim Sistemi</h1>
            <p className="text-xs font-bold text-slate-400 mt-0.5">Sistem ID: <span className="font-mono text-emerald-500">SYS-RPT-2026</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchReports}
            disabled={refreshing}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95 border ${
              isDarkMode 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
            }`}
            title="Verileri Yenile"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'YÜKLENİYOR...' : 'LİSTELE / YENİLE'}</span>
          </button>
        </div>
      </div>

      {/* 📊 KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-md ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Toplam Bildirimler</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">{reports.length}</p>
            <FileText className="text-slate-400 opacity-40" size={24} />
          </div>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border shadow-md ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs font-black text-amber-500 uppercase tracking-wider">Bekleyenler</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-2xl sm:text-3xl font-black text-amber-500">
              {reports.filter(r => !r.status || r.status === 'PENDING' || r.status === 'BEKLEYEN').length}
            </p>
            <Clock className="text-amber-500 opacity-40" size={24} />
          </div>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border shadow-md ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs font-black text-emerald-500 uppercase tracking-wider">Çözülenler</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-2xl sm:text-3xl font-black text-emerald-500">
              {reports.filter(r => r.status === 'RESOLVED' || r.status === 'TAMAMLANDI').length}
            </p>
            <CheckCircle2 className="text-emerald-500 opacity-40" size={24} />
          </div>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border shadow-md ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs font-black text-rose-500 uppercase tracking-wider">Yüksek Öncelik</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-2xl sm:text-3xl font-black text-rose-500">
              {reports.filter(r => r.priority === 'HIGH' || r.priority === 'YÜKSEK').length}
            </p>
            <AlertTriangle className="text-rose-500 opacity-40" size={24} />
          </div>
        </div>
      </div>

      {/* 🔍 Search & Filter Control Panel */}
      <div className={`p-4 rounded-2xl border shadow-md mb-6 flex flex-col md:flex-row gap-3 justify-between items-center ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Gönderen adı, başlık, kategori veya IP ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 text-xs font-black rounded-xl border outline-none tracking-wide uppercase transition-all ${
              isDarkMode 
                ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' 
                : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
            }`}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter size={17} className="text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`w-full md:w-48 py-2.5 px-3.5 text-xs font-black rounded-xl border outline-none cursor-pointer uppercase ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            <option value="ALL">TÜM DURUMLAR</option>
            <option value="BEKLEYEN">YENİ / BEKLEYEN</option>
            <option value="IN_PROGRESS">İŞLEMDE</option>
            <option value="RESOLVED">TAMAMLANDI</option>
            <option value="REJECTED">REDDEDİLDİ</option>
          </select>
        </div>
      </div>

      {/* 📋 Data Table */}
      <div className={`rounded-2xl border shadow-xl overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-black">
            <thead>
              <tr className={`border-b text-[11px] uppercase tracking-wider ${
                isDarkMode ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-900 text-white border-slate-800'
              }`}>
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4">BİLDİRİM / BAŞLIK</th>
                <th className="p-4">GÖNDEREN KİŞİ</th>
                <th className="p-4">KATEGORİ / KAYNAK</th>
                <th className="p-4">ÖNCELİK</th>
                <th className="p-4">DURUM</th>
                <th className="p-4">TARİH & SAAT</th>
                <th className="p-4 text-center">İŞLEMLER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-12 text-slate-400 uppercase font-black tracking-wider">
                    Arama kriterlerinize uygun bildirim kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report, idx) => (
                  <tr 
                    key={report.id} 
                    onClick={() => setSelectedReport(report)}
                    className={`cursor-pointer transition-colors duration-150 ${
                      selectedReport?.id === report.id 
                        ? (isDarkMode ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-950') 
                        : (isDarkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50')
                    }`}
                  >
                    <td className="p-4 text-center font-mono text-slate-500">{idx + 1}</td>
                    
                    <td className="p-4">
                      <div className="font-black text-sm uppercase">{report.title || report.category || 'BAŞLIKSIZ BİLDİRİM'}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[220px] mt-0.5">
                        {report.description || report.message || 'Detay açıklaması yok.'}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-black uppercase text-xs">
                        <User size={13} className="text-emerald-500 shrink-0" />
                        <span>{report.reporterName || report.senderName || report.name || 'ZİYARETÇİ'}</span>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-[11px]">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 uppercase">
                        {report.source || 'PUBLIC_PANEL'}
                      </span>
                    </td>

                    <td className="p-4">{getPriorityBadge(report.priority)}</td>

                    <td className="p-4">{getStatusBadge(report.status)}</td>

                    <td className="p-4 text-[11px] font-mono text-slate-500 whitespace-nowrap">
                      {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleString('tr-TR') : 'ŞİMDİ'}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => setSelectedReport(report)}
                          className="p-2 rounded-xl bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white transition-all cursor-pointer"
                          title="Detaylı İncele"
                        >
                          <Maximize2 size={15} />
                        </button>

                        <button 
                          onClick={() => handleDeleteReport(report.id)}
                          className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-black text-slate-400">
          <span>SİSTEM KAYITLARI: {filteredReports.length} ADET</span>
          <span>DURUM: AKTİF DİNLEME</span>
        </div>
      </div>

      {/* 🖥 FULL-SCREEN DETAILED MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-6 cursor-default">
          <div className={`w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl border flex flex-col overflow-hidden ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            
            {/* Modal Top Bar */}
            <div className={`p-4 sm:p-6 border-b flex items-center justify-between select-none ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                  <FileText size={22} />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-black uppercase tracking-tight text-emerald-500 dark:text-emerald-400">
                    BİLDİRİM VE RAPOR DETAY PANELSİ
                  </h2>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">ID: {selectedReport.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 font-black text-xs flex items-center gap-2 cursor-pointer"
                  title="Yazdır"
                >
                  <Printer size={16} />
                  <span className="hidden sm:inline">YAZDIR</span>
                </button>

                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-600 hover:text-white font-black text-lg flex items-center justify-center cursor-pointer transition-all"
                  title="Kapat"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Main Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 font-black text-xs sm:text-sm">
              
              {/* Header Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 uppercase">Mevcut Durum:</span>
                  {getStatusBadge(selectedReport.status)}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 uppercase">Öncelik Seviyesi:</span>
                  {getPriorityBadge(selectedReport.priority)}
                </div>

                <div className="flex items-center gap-2 font-mono text-slate-400">
                  <Calendar size={15} />
                  <span>{selectedReport.createdAt?.toDate ? selectedReport.createdAt.toDate().toLocaleString('tr-TR') : 'ŞİMDİ'}</span>
                </div>
              </div>

              {/* Grid: Sender & True System Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Gönderen Bilgileri */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
                  <h3 className="text-xs font-black text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                    <User size={15} /> GÖNDEREN VE KİMLİK BİLGİLERİ
                  </h3>

                  <div className="space-y-2 font-mono">
                    <div className="flex justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400">Ad Soyad / Unvan:</span>
                      <span className="font-black text-slate-900 dark:text-slate-100 uppercase">
                        {selectedReport.reporterName || selectedReport.senderName || selectedReport.name || 'ZİYARETÇİ'}
                      </span>
                    </div>

                    <div className="flex justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400">E-Posta / İletişim:</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        {selectedReport.senderEmail || selectedReport.email || selectedReport.phone || 'Belirtilmedi'}
                      </span>
                    </div>

                    <div className="flex justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400">Kaynak Panel:</span>
                      <span className="font-black uppercase">{selectedReport.source || 'PUBLIC_SCHEDULE_TABLE'}</span>
                    </div>
                  </div>
                </div>

                {/* الحقول الحقيقية للجهاز والـ IP */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
                  <h3 className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-2">
                    <Laptop size={15} /> TEKNİK CİHAZ VE GÜVENLİK VERİLERİ
                  </h3>

                  <div className="space-y-2 font-mono">
                    <div className="flex justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1"><Globe size={13}/> IP Adresi:</span>
                      <span className="font-bold text-sky-500">
                        {selectedReport.ipAddress || selectedReport.ip || 'Belirtilmedi'}
                      </span>
                    </div>

                    <div className="flex justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1"><MapPin size={13}/> Konum:</span>
                      <span className="font-bold">
                        {selectedReport.location || selectedReport.city || 'Belirtilmedi'}
                      </span>
                    </div>

                    <div className="flex justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1"><Smartphone size={13}/> Tarayıcı / Cihaz:</span>
                      <span className="font-bold text-xs truncate max-w-[210px]" title={selectedReport.userAgent || ''}>
                        {parseUserAgent(selectedReport.userAgent)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Description Content Box */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={15} /> BİLDİRİM İÇERİĞİ VE AÇIKLAMA
                </h3>
                <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 leading-relaxed font-bold">
                  {selectedReport.description || selectedReport.message || 'Bu bildirim için detaylı bir açıklama girilmemiş.'}
                </div>
              </div>

              {/* Action Buttons Section */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">DURUMU GÜNCELLE VE EYLEM AL</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button 
                    onClick={() => handleStatusChange(selectedReport.id, 'RESOLVED')}
                    className="py-3 px-4 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg cursor-pointer transition-transform active:scale-95 uppercase"
                  >
                    ✓ Tamamlandı Yap
                  </button>

                  <button 
                    onClick={() => handleStatusChange(selectedReport.id, 'IN_PROGRESS')}
                    className="py-3 px-4 rounded-xl font-black text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-lg cursor-pointer transition-transform active:scale-95 uppercase"
                  >
                    ⏳ İşleme Al
                  </button>

                  <button 
                    onClick={() => handleStatusChange(selectedReport.id, 'REJECTED')}
                    className="py-3 px-4 rounded-xl font-black text-xs bg-slate-700 hover:bg-slate-800 text-white shadow-lg cursor-pointer transition-transform active:scale-95 uppercase"
                  >
                    ✕ Reddet
                  </button>

                  <button 
                    onClick={() => handleDeleteReport(selectedReport.id)}
                    className="py-3 px-4 rounded-xl font-black text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-lg cursor-pointer transition-transform active:scale-95 uppercase"
                  >
                    🗑️ Bildirimi Sil
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}