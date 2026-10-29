'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { 
  Search, Phone, Check, Plus, Edit3, Trash2, 
  Printer, ArrowLeft, Settings2, X,
  Download, Sparkles
} from 'lucide-react';

const initialPhonebookData = [
  {
    id: 'zemin-pol',
    title: "ZEMİN KAT POLİKLİNİKLER",
    floor: "ZEMİN KAT",
    items: [
      { id: '1', name: "Güvenlik", dahili: "1000 / 1001" },
      { id: '2', name: "Santral – Danışma", dahili: "0 / 1174" },
      { id: '3', name: "Çocuk, Enfeksiyon Hst Desk", dahili: "1171" },
      { id: '4', name: "Vezne", dahili: "1984" },
      { id: '5', name: "Çocuk Hst. Dr.Arif CANAN", dahili: "1109" },
      { id: '6', name: "Çocuk Hst. Dr.Cem ÖZDEMİR", dahili: "1103" },
      { id: '7', name: "Çocuk Hst. Dr.Özlem ÖZ", dahili: "1102" },
      { id: '8', name: "Dermatoloji Pol. Dr.Serap KARATAŞ", dahili: "1124" },
      { id: '9', name: "Diş Pol Dt.Balkıs BAŞAK ERSOY", dahili: "1168" },
      { id: '10', name: "Diş Pol Dt.Halenur YONTAN", dahili: "1133" },
      { id: '11', name: "Diş Pol Dt.Umut BEDEL", dahili: "1138" },
      { id: '12', name: "Diş Pol Dt.Yusuf Fatih AKYÜZ", dahili: "1137" },
      { id: '13', name: "EEG", dahili: "1136" },
      { id: '14', name: "Efor – Sft", dahili: "1118" },
      { id: '15', name: "Enfeksiyon Hst. Pol.", dahili: "1110" },
      { id: '16', name: "Evde Sağlık Kurumu", dahili: "1117" },
      { id: '17', name: "Ftr Pol Dr. ELÇİN ERGEZ LATİFOĞLU", dahili: "1128" },
      { id: '18', name: "Genel Cerrahi Dr.Oğuzhan YAZICI", dahili: "1172" },
      { id: '19', name: "Genel Cerrahi Pol Dr. Mehmet PETEK", dahili: "1123" },
      { id: '20', name: "Göğüs Hast. Dr. Merve FİDAN AŞIK", dahili: "1112" },
      { id: '21', name: "GÖZ Pol. Dr.Merve Bahar TUFANOĞLU", dahili: "1130" },
      { id: '22', name: "GÖZ Pol. Dr.Ozan AKPUNAR", dahili: "1126" },
      { id: '23', name: "GÖZ Pol. Dr.Selim KOCAPINAR", dahili: "1129" },
      { id: '24', name: "Hasta Hakları", dahili: "1139" },
      { id: '25', name: "Hastane Polisi", dahili: "1175" },
      { id: '26', name: "Kadın Doğum Pol. Dr. Ünal Kaan KILIÇ", dahili: "1121" },
      { id: '27', name: "Kadın Doğum Pol. Dr.Özden ÖZTÜRK", dahili: "1116" },
      { id: '28', name: "Kardiyoloji Pol.", dahili: "1127" },
      { id: '29', name: "KBB Pol.", dahili: "1125" },
      { id: '30', name: "Nöroloji Pol.", dahili: "1132" },
      { id: '31', name: "Ortopedi Dr. Ahmet Fahrettin ÖZHAN", dahili: "1113" },
      { id: '32', name: "Ortopedi Dr. Ali ÇINAR", dahili: "1122" },
      { id: '33', name: "Psikiyatri POL.", dahili: "1131" },
      { id: '34', name: "Psikolog", dahili: "1163" },
      { id: '35', name: "Üroloji Dr. Hüseyin Buğra KARAKAŞ", dahili: "1114" }
    ]
  },
  {
    id: 'zemin-acil',
    title: "ZEMİN KAT ACİL",
    floor: "ZEMİN KAT",
    items: [
      { id: '36', name: "Acil Doktor Dinlenme Odası", dahili: "1143" },
      { id: '37', name: "Acil İlk Kayıt", dahili: "1119" },
      { id: '38', name: "Acil Röntgen", dahili: "1140" },
      { id: '39', name: "Acil Röntgen Teknisyen Odası", dahili: "1142" },
      { id: '40', name: "Acil Sorumlu Hemşire Odası", dahili: "1161" },
      { id: '41', name: "Genel Yoğun Bakım Zemin kat", dahili: "1173" },
      { id: '42', name: "İzolasyon", dahili: "1154" },
      { id: '43', name: "Müşahede", dahili: "1147" },
      { id: '44', name: "Travma", dahili: "1162" },
      { id: '45', name: "Yeşil Alan 1", dahili: "1145" },
      { id: '46', name: "Yeşil Alan 2", dahili: "1141" },
      { id: '47', name: "Yeşil Alan 3", dahili: "1146" },
      { id: '48', name: "Yeşil Alan 4", dahili: "1145" }
    ]
  },
  {
    id: 'kat-1',
    title: "1. KAT",
    floor: "1. KAT",
    items: [
      { id: '49', name: "Ayniyat Depo", dahili: "1265" },
      { id: '50', name: "Başhekim", dahili: "1247" },
      { id: '51', name: "Başhekim Sekreteri", dahili: "1246" },
      { id: '52', name: "Başhekim Yardımcısı", dahili: "1245" },
      { id: '53', name: "Fatura", dahili: "1253 / 1254" },
      { id: '54', name: "İdari ve Mali İşler Müdür Yrd.", dahili: "1242" },
      { id: '55', name: "İdari ve Mali işler Müdürü", dahili: "1244" },
      { id: '56', name: "Kalite Birimi", dahili: "1831" },
      { id: '57', name: "Kat Sekreteri – Sağlık Kurulu", dahili: "1224-1225" },
      { id: '58', name: "Muhasebe", dahili: "1255 / 1256" },
      { id: '59', name: "Mutemet 4.D KHK.", dahili: "1241" },
      { id: '60', name: "Mutemet Memur", dahili: "1249" },
      { id: '61', name: "Palyatif Servisi", dahili: "1259" },
      { id: '62', name: "Sağlık Bakım hizmetleri müdürü", dahili: "1243" },
      { id: '63', name: "Satın Alma", dahili: "1251" },
      { id: '64', name: "Sicil – Özlük Birimi", dahili: "1250" },
      { id: '65', name: "TİG – Mustafa KÜNVER", dahili: "1257" },
      { id: '66', name: "Yemekhane", dahili: "1235" },
      { id: '67', name: "Yoğun Bakım 1. Basamak", dahili: "1261" },
      { id: '68', name: "Yoğun Bakım 2. Basamak", dahili: "1263" }
    ]
  },
  {
    id: 'kat-e1',
    title: "- 1 KAT",
    floor: "- 1 KAT",
    items: [
      { id: '69', name: "Arşiv", dahili: "1896/1065" },
      { id: '70', name: "Bilgi İşlem", dahili: "1005" },
      { id: '71', name: "Diyetisyen", dahili: "1043" },
      { id: '72', name: "Eczane Sarf Depo", dahili: "1003" },
      { id: '73', name: "Eğitim Birimi - Diyabet Hemşiresi", dahili: "1042" },
      { id: '74', name: "Ftr Ünitesi Kayıt", dahili: "1915" },
      { id: '75', name: "Ftr Ünitesi 1", dahili: "1049" },
      { id: '76', name: "Ftr Ünitesi 2", dahili: "1056" },
      { id: '77', name: "İÇ Hst . Uzm.Dr.Emre DÖKMETAŞ", dahili: "1038" },
      { id: '78', name: "İÇ Hst . Uzm.Dr.Eren CAN ÖZTÜRK", dahili: "1041" },
      { id: '79', name: "İÇ Hst . Uzm.Dr.İsmail ASKER", dahili: "1037" },
      { id: '80', name: "İÇ Hst . Uzm.Dr.Lütfi USLUER", dahili: "1258" },
      { id: '81', name: "İÇ Hst . Uzm.Dr.Öykü BALKAYA CAN", dahili: "1044" },
      { id: '82', name: "İÇ Hst . Uzm.Dr.Sezgin ÇELİK", dahili: "1040" },
      { id: '83', name: "İşitme Testi", dahili: "1039" },
      { id: '84', name: "Kan Ünitesi", dahili: "1028" },
      { id: '85', name: "Lab .Dr", dahili: "1030" },
      { id: '86', name: "Lab Teknisyen Odası", dahili: "1023" },
      { id: '87', name: "Laboratuvar Kayıt", dahili: "1033" },
      { id: '88', name: "Röntgen", dahili: "1013" },
      { id: '89', name: "Röntgen Teknisyen Odası", dahili: "1010" },
      { id: '90', name: "Sivil Savunma", dahili: "1018" },
      { id: '91', name: "Teknik Servis – Biyomedikal", dahili: "1401 / 1066" },
      { id: '92', name: "Tomografi", dahili: "1014" },
      { id: '93', name: "USG – 1", dahili: "1015" },
      { id: '94', name: "USG – 2", dahili: "1017" }
    ]
  },
  {
    id: 'kat-2',
    title: "2. KAT",
    floor: "2. KAT",
    items: [
      { id: '95', name: "Ameliyathane Dr. Odası", dahili: "1352" },
      { id: '96', name: "Ameliyathane Hemşire Odası", dahili: "1351" },
      { id: '97', name: "Anestezi Polk.", dahili: "1301" },
      { id: '98', name: "Anestezi Tek. Odası", dahili: "1353" },
      { id: '99', name: "Cerrahi Karma Servisi", dahili: "1324" },
      { id: '100', name: "Doğumhane Desk", dahili: "1345" },
      { id: '101', name: "Eczane", dahili: "1337" },
      { id: '102', name: "Endoskopi", dahili: "1331" },
      { id: '103', name: "Karma Servisi ( Günübirlik )", dahili: "1323" },
      { id: '104', name: "Sosyal Hizmetler Uzmanı Erol TAŞ", dahili: "1363" },
      { id: '105', name: "Sterilizasyon", dahili: "1354" },
      { id: '106', name: "Süpervizor", dahili: "1351" },
      { id: '107', name: "Yoğun Bakım 2", dahili: "1334 / 1333" }
    ]
  }
];

export default function PhonebookPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  // 🛡️ حل مشكلة Hydration: إعداد حالة الجاهزية على المتصفح
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState(initialPhonebookData);
  const [favorites, setFavorites] = useState(['1', '2', '37', '50']);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [isEditMode, setIsEditMode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Modal States
  const [modalType, setModalType] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [itemFormData, setItemFormData] = useState({ id: '', name: '', dahili: '' });
  const [groupTitleInput, setGroupTitleInput] = useState('');

  // 🔒 تحميل بيانات localStorage بأمان تام بعد بناء الواجهة
  useEffect(() => {
    setIsMounted(true);

    try {
      const savedData = localStorage.getItem('doktorsys_phonebook');
      if (savedData) {
        setData(JSON.parse(savedData));
      }

      const savedFavs = localStorage.getItem('doktorsys_favorites');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
    } catch (e) {
      console.error("Localstorage load error:", e);
    }
  }, []);

  // حفظ التغييرات عند التحديث
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('doktorsys_phonebook', JSON.stringify(data));
  }, [data, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('doktorsys_favorites', JSON.stringify(favorites));
  }, [favorites, isMounted]);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const allItems = useMemo(() => {
    return data.flatMap(group => 
      group.items.map(item => ({ ...item, groupTitle: group.title, floor: group.floor, groupId: group.id }))
    );
  }, [data]);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLocaleUpperCase('tr-TR').trim();

    return data.map(group => {
      if (selectedFloor !== 'ALL' && group.floor !== selectedFloor) {
        return { ...group, items: [] };
      }

      if (!term) return group;

      const filteredItems = group.items.filter(item => 
        item.name.toLocaleUpperCase('tr-TR').includes(term) ||
        item.dahili.includes(term)
      );

      return { ...group, items: filteredItems };
    }).filter(group => group.items.length > 0);
  }, [data, searchTerm, selectedFloor]);

  const favoriteItems = useMemo(() => {
    return allItems.filter(item => favorites.includes(item.id));
  }, [allItems, favorites]);

  const totalCount = useMemo(() => allItems.length, [allItems]);

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Bölüm,Birim/Kişi,Dahili\n";
    allItems.forEach(item => {
      csvContent += `"${item.groupTitle}","${item.name}","${item.dahili}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Telefon_Rehberi_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenAddItem = (group) => {
    setActiveGroup(group);
    setItemFormData({ id: '', name: '', dahili: '' });
    setModalType('ADD_ITEM');
  };

  const handleOpenEditItem = (group, item) => {
    setActiveGroup(group);
    setItemFormData(item);
    setModalType('EDIT_ITEM');
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!itemFormData.name.trim() || !itemFormData.dahili.trim()) return;

    if (modalType === 'ADD_ITEM') {
      const newItem = {
        id: Date.now().toString(),
        name: itemFormData.name.trim(),
        dahili: itemFormData.dahili.trim()
      };
      setData(prev => prev.map(g => g.id === activeGroup.id ? { ...g, items: [...g.items, newItem] } : g));
    } else if (modalType === 'EDIT_ITEM') {
      setData(prev => prev.map(g => g.id === activeGroup.id ? {
        ...g,
        items: g.items.map(i => i.id === itemFormData.id ? { ...i, name: itemFormData.name.trim(), dahili: itemFormData.dahili.trim() } : i)
      } : g));
    }

    setModalType(null);
  };

  const handleDeleteItem = (groupId, itemId) => {
    if (confirm('Bu numarayı silmek istediğinizden emin misiniz?')) {
      setData(prev => prev.map(g => g.id === groupId ? { ...g, items: g.items.filter(i => i.id !== itemId) } : g));
    }
  };

  const handleAddGroup = (e) => {
    e.preventDefault();
    if (!groupTitleInput.trim()) return;

    const newGroup = {
      id: Date.now().toString(),
      title: groupTitleInput.trim().toUpperCase(),
      floor: "GENEL",
      items: []
    };

    setData(prev => [...prev, newGroup]);
    setGroupTitleInput('');
    setModalType(null);
  };

  const floors = ['ALL', 'ZEMİN KAT', '1. KAT', '2. KAT', '- 1 KAT'];

  return (
    <div className={`min-h-screen w-full font-sans select-none pb-16 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#020617] text-slate-100' : 'bg-[#f1f5f9] text-slate-900'
    }`}>

      <style jsx global>{`
        @media print {
          @page { size: A4 portrait; margin: 6mm 8mm 6mm 8mm; }
          body { background-color: white !important; color: black !important; font-size: 10px !important; }
          .no-print { display: none !important; }
          .print-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .print-card { border: 1.5px solid #000 !important; background: white !important; page-break-inside: avoid !important; }
        }
      `}</style>

      {/* Toast Notification */}
      {copiedCode && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Check className="w-5 h-5 stroke-[3]" />
          <span className="text-xs sm:text-sm">Kopyalandı: <strong className="font-mono text-base">{copiedCode}</strong></span>
        </div>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-2xl transition-colors no-print ${
        isDarkMode ? 'bg-slate-950/90 border-slate-800 text-white' : 'bg-white/90 border-slate-300 text-slate-900 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className={`px-3 py-2 rounded-2xl border font-black text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-cyan-400 hover:border-cyan-500/50 hover:bg-slate-800' 
                  : 'bg-slate-100 border-slate-300 text-slate-800 hover:border-blue-500 hover:bg-white'
              }`}
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">GERİ DÖN</span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                <Phone className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="font-black text-sm sm:text-base tracking-widest uppercase bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
                  TELEFON REHBERİ
                </h1>
                <p className="text-[10px] font-extrabold text-slate-400 -mt-0.5">
                  Toplam {totalCount} Dahili Numara
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Birim veya dahili no ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-9 py-2.5 rounded-2xl border text-xs font-black outline-none transition-all ${
                isDarkMode 
                  ? 'bg-slate-900/90 border-slate-800 text-slate-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20' 
                  : 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
              }`}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3 py-2 rounded-2xl border font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                isEditMode 
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-400/20' 
                  : isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700' 
                  : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
              }`}
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden md:inline">{isEditMode ? 'Düzenleme Açık' : 'Düzenle'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className={`p-2 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-emerald-400 hover:bg-slate-800' : 'bg-slate-100 border-slate-300 text-emerald-700 hover:bg-slate-200'
              }`}
              title="Excel / CSV İndir"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-500/20 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">YAZDIR</span>
            </button>

          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-black uppercase text-slate-400 shrink-0">Kat:</span>
          {floors.map((flr) => (
            <button
              key={flr}
              onClick={() => setSelectedFloor(flr)}
              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                selectedFloor === flr
                  ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                  : isDarkMode
                  ? 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {flr === 'ALL' ? 'TÜM KATLAR' : flr}
            </button>
          ))}

          {isEditMode && (
            <button
              onClick={() => setModalType('ADD_GROUP')}
              className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Bölüm Ekle</span>
            </button>
          )}
        </div>
      </header>

      {/* 🚀 قسم المفضلة السريعة (محمي من مشكلة Hydration) */}
      {isMounted && !searchTerm && selectedFloor === 'ALL' && favoriteItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-4 no-print">
          <div className={`p-4 rounded-3xl border shadow-lg ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-cyan-400">Hızlı Erişim & Favoriler</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {favoriteItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleCopy(item.dahili)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02] ${
                    isDarkMode 
                      ? 'bg-slate-950/80 border-slate-800 hover:border-cyan-400/50' 
                      : 'bg-slate-50 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  <span className="text-xs font-black truncate text-slate-300 dark:text-slate-200">{item.name}</span>
                  <span className="text-sm font-mono font-black text-cyan-400 mt-2">{item.dahili}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 📦 قائمة الجداول والأرقام */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        {filteredData.length === 0 ? (
          <div className="text-center py-20">
            <Phone className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
            <h3 className="text-base font-black text-slate-400">Aranan kriterlere uygun numara bulunamadı.</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-grid">
            {filteredData.map((group) => (
              <div 
                key={group.id} 
                className={`rounded-3xl border overflow-hidden shadow-xl print-card ${
                  isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white px-5 py-3 flex items-center justify-between">
                  <span className="text-xs font-black tracking-widest uppercase">{group.title}</span>
                  <span className="text-[10px] bg-black/20 px-2.5 py-0.5 rounded-full font-black">{group.items.length} Numara</span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleCopy(item.dahili)}
                      className={`px-5 py-3 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                        isDarkMode ? 'hover:bg-cyan-500/5' : 'hover:bg-sky-50'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                        {item.name}
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-black text-xs sm:text-sm text-sky-600 dark:text-cyan-400 bg-sky-500/10 dark:bg-cyan-400/10 border border-sky-500/20 dark:border-cyan-400/20 px-3 py-1 rounded-xl tracking-wider">
                          {item.dahili}
                        </span>

                        {isEditMode && (
                          <div className="flex items-center gap-1 ml-2 no-print" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleOpenEditItem(group, item)} className="p-1 text-slate-400 hover:text-amber-400">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteItem(group.id, item.id)} className="p-1 text-slate-400 hover:text-rose-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal إضافة/تعديل */}
      {(modalType === 'ADD_ITEM' || modalType === 'EDIT_ITEM') && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-sm uppercase text-cyan-400">
                {modalType === 'ADD_ITEM' ? `Yeni Numara (${activeGroup?.title})` : 'Numarayı Düzenle'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-rose-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Birim / Kişi Adı</label>
                <input
                  type="text"
                  required
                  value={itemFormData.name}
                  onChange={(e) => setItemFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs font-bold outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-100 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Dahili No</label>
                <input
                  type="text"
                  required
                  value={itemFormData.dahili}
                  onChange={(e) => setItemFormData(prev => ({ ...prev, dahili: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs font-mono font-bold outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-100 border-slate-300'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button type="button" onClick={() => setModalType(null)} className="w-1/2 py-2.5 rounded-2xl border border-slate-700 text-xs font-black">
                  İptal
                </button>
                <button type="submit" className="w-1/2 py-2.5 rounded-2xl bg-cyan-400 text-slate-950 text-xs font-black">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal إضافة قسم */}
      {modalType === 'ADD_GROUP' && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-sm uppercase text-emerald-400">Yeni Bölüm Ekle</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-rose-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGroup} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Bölüm Başlığı</label>
                <input
                  type="text"
                  required
                  value={groupTitleInput}
                  onChange={(e) => setGroupTitleInput(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs font-bold outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-100 border-slate-300'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button type="button" onClick={() => setModalType(null)} className="w-1/2 py-2.5 rounded-2xl border border-slate-700 text-xs font-black">
                  İptal
                </button>
                <button type="submit" className="w-1/2 py-2.5 rounded-2xl bg-emerald-400 text-slate-950 text-xs font-black">
                  Bölüm Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}