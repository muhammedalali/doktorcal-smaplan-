'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useTheme } from '@/context/ThemeContext';
import { 
  Search, Filter, ShieldAlert, Clock, CheckCircle2, 
  XCircle, Globe, MapPin, User, Mail, Laptop, Calendar,
  MoreVertical, Eye, FileText, AlertTriangle
} from 'lucide-react';

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const { isDarkMode } = useTheme();
  const router = useRouter();

  useEffect(() => {
    // 💡 تم تبسيط الاستعلام لتفادي مشاكل الفهرسة (Indexing) عند إضافة بلاغات الزوار
    const q = query(collection(db, 'reports'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // ترتيب البلاغات من الأحدث إلى الأقدم برمجيّاً
      reportsData.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      setReports(reportsData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Bildirim durumunu güncelleme
  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, { status: newStatus });
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Durum güncellenirken hata oluştu:', error);
    }
  };

  // Bildirimleri filtreleme
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.senderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.ipAddress?.includes(searchTerm);
    
    const matchesStatus = 
      statusFilter === 'ALL' || 
      report.status === statusFilter || 
      (statusFilter === 'PENDING' && (!report.status || report.status === 'PENDING'));

    return matchesSearch && matchesStatus;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-500 border border-red-500/20">Yüksek</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">Orta</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">Normal</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-500"><CheckCircle2 size={12}/> Tamamlandı</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-500"><Clock size={12}/> İşlemde</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-rose-500/10 text-rose-500"><XCircle size={12}/> Reddedildi</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-500"><AlertTriangle size={12}/> Yeni</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 transition-colors duration-200 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`} dir="ltr">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bildirim ve Rapor Yönetim Sistemi</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Aktiviteleri izleyin, gelen bildirimleri inceleyin ve anında müdahale edin.</p>
        </div>
      </div>

      {/* İstatistik Kartları (KPI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs font-medium text-slate-500">Toplam Bildirimler</p>
          <p className="text-2xl font-bold mt-2">{reports.length}</p>
        </div>
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs font-medium text-amber-500">Bekleyenler</p>
          <p className="text-2xl font-bold mt-2">{reports.filter(r => !r.status || r.status === 'PENDING').length}</p>
        </div>
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs font-medium text-emerald-500">Çözülenler</p>
          <p className="text-2xl font-bold mt-2">{reports.filter(r => r.status === 'RESOLVED').length}</p>
        </div>
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs font-medium text-red-500">Yüksek Öncelikli Bildirimler</p>
          <p className="text-2xl font-bold mt-2">{reports.filter(r => r.priority === 'HIGH').length}</p>
        </div>
      </div>

      {/* Arama ve Filtreleme */}
      <div className={`p-4 rounded-xl border mb-6 flex flex-col md:flex-row gap-4 justify-between items-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Gönderen adı, başlık veya IP ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`py-2 px-3 text-sm rounded-lg border outline-none ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="PENDING">Yeni</option>
            <option value="IN_PROGRESS">İşlemde</option>
            <option value="RESOLVED">Tamamlandı</option>
            <option value="REJECTED">Reddedildi</option>
          </select>
        </div>
      </div>

      {/* Ana İçerik Alanı */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bildirim Tablosu / Listesi */}
        <div className={`lg:col-span-2 rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`border-b text-xs uppercase ${isDarkMode ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <tr>
                  <th className="p-4">Bildirim / Gönderen</th>
                  <th className="p-4">Kaynak / Sistem</th>
                  <th className="p-4">Öncelik</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4">Tarih</th>
                  <th className="p-4">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-slate-500">Arama kriterlerine uygun bildirim bulunamadı.</td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr 
                      key={report.id} 
                      onClick={() => setSelectedReport(report)}
                      className={`cursor-pointer transition-colors ${
                        selectedReport?.id === report.id 
                          ? (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50/60') 
                          : (isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50')
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{report.title || 'Başlıksız Bildirim'}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <User size={12}/> {report.senderName || report.name || 'Ziyaretçi'}
                        </div>
                      </td>
                      <td className="p-4 text-xs font-mono">
                        <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {report.source || 'Ziyaretçi Paneli'}
                        </span>
                      </td>
                      <td className="p-4">{getPriorityBadge(report.priority)}</td>
                      <td className="p-4">{getStatusBadge(report.status)}</td>
                      <td className="p-4 text-xs text-slate-500 font-mono">
                        {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleString('tr-TR') : 'Şimdi'}
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedReport(report); }}
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detay Paneli (Sağ Taraf) */}
        <div className={`rounded-xl border p-5 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          {selectedReport ? (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
                <h2 className="font-bold text-lg">Gelişmiş Bildirim Detayları</h2>
                {getStatusBadge(selectedReport.status)}
              </div>

              {/* Gönderen Bilgileri */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gönderen ve Kimlik Bilgileri</h3>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-xs text-slate-500 flex items-center gap-1 mb-1"><User size={12}/> Ad Soyad</div>
                    <div className="font-medium">{selectedReport.senderName || selectedReport.name || 'Ziyaretçi'}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Mail size={12}/> E-posta / İletişim</div>
                    <div className="font-medium text-xs truncate">{selectedReport.senderEmail || selectedReport.email || selectedReport.phone || 'Mevcut Değil'}</div>
                  </div>
                </div>
              </div>

              {/* Teknik Bilgiler */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Teknik ve Güvenlik Verileri</h3>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 flex items-center gap-1.5"><Globe size={14}/> IP Adresi:</span>
                    <span className="font-mono bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded font-bold">{selectedReport.ipAddress || '192.168.1.1'}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 flex items-center gap-1.5"><MapPin size={14}/> Coğrafi Konum:</span>
                    <span className="font-medium">{selectedReport.location || 'Türkiye'}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 flex items-center gap-1.5"><Laptop size={14}/> Tarayıcı / Cihaz:</span>
                    <span className="font-mono text-[11px] truncate max-w-[180px]">{selectedReport.userAgent || 'Web Client'}</span>
                  </div>
                </div>
              </div>

              {/* İçerik */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bildirim İçeriği</h3>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm leading-relaxed border border-slate-200/50 dark:border-slate-700/50">
                  {selectedReport.description || selectedReport.message || 'Bu bildirim için detaylı açıklama bulunmuyor.'}
                </div>
              </div>

              {/* Aksiyon Butonları */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Eylem Al</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => handleStatusChange(selectedReport.id, 'RESOLVED')}
                    className="py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    Onayla ve Kapat
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedReport.id, 'IN_PROGRESS')}
                    className="py-2 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                  >
                    İşleme Al
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedReport.id, 'REJECTED')}
                    className="py-2 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
                  >
                    Reddet
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-slate-400">
              <FileText size={48} className="mb-3 opacity-30" />
              <p className="text-sm">Tüm detayları görmek ve kaynağı izlemek için listeden bir bildirim seçin.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}