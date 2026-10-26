'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

const phonebookData = {
  leftColumn: [
    {
      title: "ZEMİN KAT POLİKLİNİKLER",
      items: [
        { name: "Güvenlik", dahili: "1000 / 1001" },
        { name: "Santral – Danışma", dahili: "0 / 1174" },
        { name: "Çocuk, Enfeksiyon Hst Desk", dahili: "1171" },
        { name: "Vezne", dahili: "1984" },
        { name: "Çocuk Hst. Dr.Arif CANAN", dahili: "1109" },
        { name: "Çocuk Hst. Dr.Cem ÖZDEMİR", dahili: "1103" },
        { name: "Çocuk Hst. Dr.Özlem ÖZ", dahili: "1102" },
        { name: "Dermatoloji Pol. Dr.Serap KARATAŞ", dahili: "1124" },
        { name: "Diş Pol Dt.Balkıs BAŞAK ERSOY", dahili: "1168" },
        { name: "Diş Pol Dt.Halenur YONTAN", dahili: "1133" },
        { name: "Diş Pol Dt.Umut BEDEL", dahili: "1138" },
        { name: "Diş Pol Dt.Yusuf Fatih AKYÜZ", dahili: "1137" },
        { name: "EEG", dahili: "1136" },
        { name: "Efor – Sft", dahili: "1118" },
        { name: "Enfeksiyon Hst. Pol.", dahili: "1110" },
        { name: "Evde Sağlık Kurumu", dahili: "1117" },
        { name: "Ftr Pol Dr. ELÇİN ERGEZ LATİFOĞLU", dahili: "1128" },
        { name: "Genel Cerrahi Dr.Oğuzhan YAZICI", dahili: "1172" },
        { name: "Genel Cerrahi Pol Dr. Mehmet PETEK", dahili: "1123" },
        { name: "Göğüs Hast. Dr. Merve FİDAN AŞIK", dahili: "1112" },
        { name: "GÖZ Pol. Dr.Merve Bahar TUFANOĞLU", dahili: "1130" },
        { name: "GÖZ Pol. Dr.Ozan AKPUNAR", dahili: "1126" },
        { name: "GÖZ Pol. Dr.Selim KOCAPINAR", dahili: "1129" },
        { name: "Hasta Hakları", dahili: "1139" },
        { name: "Hastane Polisi", dahili: "1175" },
        { name: "Kadın Doğum Pol. Dr. Ünal Kaan KILIÇ", dahili: "1121" },
        { name: "Kadın Doğum Pol. Dr.Özden ÖZTÜRK", dahili: "1116" },
        { name: "Kardiyoloji Pol.", dahili: "1127" },
        { name: "KBB Pol.", dahili: "1125" },
        { name: "Nöroloji Pol.", dahili: "1132" },
        { name: "Ortopedi Dr. Ahmet Fahrettin ÖZHAN", dahili: "1113" },
        { name: "Ortopedi Dr. Ali ÇINAR", dahili: "1122" },
        { name: "Psikiyatri POL.", dahili: "1131" },
        { name: "Psikolog", dahili: "1163" },
        { name: "Üroloji Dr. Hüseyin Buğra KARAKAŞ", dahili: "1114" }
      ]
    },
    {
      title: "1.KAT",
      items: [
        { name: "Ayniyat Depo", dahili: "1265" },
        { name: "Başhekim", dahili: "1247" },
        { name: "Başhekim Sekreteri", dahili: "1246" },
        { name: "Başhekim Yardımcısı", dahili: "1245" },
        { name: "Fatura", dahili: "1253 / 1254" },
        { name: "İdari ve Mali İşler Müdür Yrd.", dahili: "1242" },
        { name: "İdari ve Mali işler Müdürü", dahili: "1244" },
        { name: "Kalite Birimi", dahili: "1831" },
        { name: "Kat Sekreteri – Sağlık Kurulu", dahili: "1224-1225" },
        { name: "Muhasebe", dahili: "1255 / 1256" },
        { name: "Mutemet 4.D KHK.", dahili: "1241" },
        { name: "Mutemet Memur", dahili: "1249" },
        { name: "Palyatif Servisi", dahili: "1259" },
        { name: "Sağlık Bakım hizmetleri müdürü", dahili: "1243" },
        { name: "Satın Alma", dahili: "1251" },
        { name: "Sicil – Özlük Birimi", dahili: "1250" },
        { name: "TİG – Mustafa KÜNVER", dahili: "1257" },
        { name: "Yemekhane", dahili: "1235" },
        { name: "Yoğun Bakım 1. Basamak", dahili: "1261" },
        { name: "Yoğun Bakım 2. Basamak", dahili: "1263" }
      ]
    }
  ],
  rightColumn: [
    {
      title: "ZEMİN KAT ACİL",
      items: [
        { name: "Acil Doktor Dinlenme Odası", dahili: "1143" },
        { name: "Acil İlk Kayıt", dahili: "1119" },
        { name: "Acil Röntgen", dahili: "1140" },
        { name: "Acil Röntgen Teknisyen Odası", dahili: "1142" },
        { name: "Acil Sorumlu Hemşire Odası", dahili: "1161" },
        { name: "Genel Yoğun Bakım Zemin kat", dahili: "1173" },
        { name: "İzolasyon", dahili: "1154" },
        { name: "Müşahede", dahili: "1147" },
        { name: "Travma", dahili: "1162" },
        { name: "Yeşil Alan 1", dahili: "1145" },
        { name: "Yeşil Alan 2", dahili: "1141" },
        { name: "Yeşil Alan 3", dahili: "1146" },
        { name: "Yeşil Alan 4", dahili: "1145" }
      ]
    },
    {
      title: "- 1 KAT",
      items: [
        { name: "Arşiv", dahili: "1896/1065" },
        { name: "Bilgi İşlem", dahili: "1005" },
        { name: "Diyetisyen", dahili: "1043" },
        { name: "Eczane Sarf Depo", dahili: "1003" },
        { name: "Eğitim Birimi - Diyabet Hemşiresi", dahili: "1042" },
        { name: "Ftr Ünitesi Kayıt", dahili: "1915" },
        { name: "Ftr Ünitesi 1", dahili: "1049" },
        { name: "Ftr Ünitesi 2", dahili: "1056" },
        { name: "İÇ Hst . Uzm.Dr.Emre DÖKMETAŞ", dahili: "1038" },
        { name: "İÇ Hst . Uzm.Dr.Eren CAN ÖZTÜRK", dahili: "1041" },
        { name: "İÇ Hst . Uzm.Dr.İsmail ASKER", dahili: "1037" },
        { name: "İÇ Hst . Uzm.Dr.Lütfi USLUER", dahili: "1258" },
        { name: "İÇ Hst . Uzm.Dr.Öykü BALKAYA CAN", dahili: "1044" },
        { name: "İÇ Hst . Uzm.Dr.Sezgin ÇELİK", dahili: "1040" },
        { name: "İşitme Testi", dahili: "1039" },
        { name: "Kan Ünitesi", dahili: "1028" },
        { name: "Lab .Dr", dahili: "1030" },
        { name: "Lab Teknisyen Odası", dahili: "1023" },
        { name: "Laboratuvar Kayıt", dahili: "1033" },
        { name: "Röntgen", dahili: "1013" },
        { name: "Röntgen Teknisyen Odası", dahili: "1010" },
        { name: "Sivil Savunma", dahili: "1018" },
        { name: "Teknik Servis – Biyomedikal", dahili: "1401 / 1066" },
        { name: "Tomografi", dahili: "1014" },
        { name: "USG – 1", dahili: "1015" },
        { name: "USG – 2", dahili: "1017" }
      ]
    },
    {
      title: "2.KAT",
      items: [
        { name: "Ameliyathane Dr. Odası", dahili: "1352" },
        { name: "Ameliyathane Hemşire Odası", dahili: "1351" },
        { name: "Anestezi Polk.", dahili: "1301" },
        { name: "Anestezi Tek. Odası", dahili: "1353" },
        { name: "Cerrahi Karma Servisi", dahili: "1324" },
        { name: "Doğumhane Desk", dahili: "1345" },
        { name: "Eczane", dahili: "1337" },
        { name: "Endoskopi", dahili: "1331" },
        { name: "Karma Servisi ( Günübirlik )", dahili: "1323" },
        { name: "Sosyal Hizmetler Uzmanı Erol TAŞ", dahili: "1363" },
        { name: "Sterilizasyon", dahili: "1354" },
        { name: "Süpervizor", dahili: "1351" },
        { name: "Yoğun Bakım 2", dahili: "1334 / 1333" }
      ]
    }
  ]
};

export default function PhonebookPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const { isDarkMode } = useTheme();

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 15, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 15, 60));
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  const handlePrint = () => {
    window.print();
  };

  const filterItems = (items) => {
    if (!searchTerm) return items;
    const term = searchTerm.toLocaleUpperCase('tr-TR');
    return items.filter(
      item =>
        item.name.toLocaleUpperCase('tr-TR').includes(term) ||
        item.dahili.includes(term)
    );
  };

  const renderGroup = (group) => {
    const filtered = filterItems(group.items);
    if (filtered.length === 0 && searchTerm) return null;

    return (
      <div key={group.title} className="w-full border-b border-black dark:border-slate-700 last:border-b-0 print:border-black">
        <div className="bg-[#1d72b8] text-white text-center font-black text-xs sm:text-sm py-1 border-b border-black uppercase tracking-wider print:bg-[#1d72b8] print:text-white print:text-[11px] print:py-0.5">
          {group.title}
        </div>
        <table className="w-full text-left border-collapse text-[11px] sm:text-xs print:text-[9.5px]">
          <tbody>
            {filtered.map((item, idx) => (
              <tr 
                key={idx} 
                className="border-b border-gray-300 dark:border-slate-800 last:border-b-0 hover:bg-sky-50 dark:hover:bg-slate-800/50 transition-colors print:border-gray-400"
              >
                <td className="py-1 px-2 font-bold text-slate-900 dark:text-slate-100 border-r border-gray-300 dark:border-slate-800 print:text-black print:border-gray-400 print:py-0.5">
                  {item.name}
                </td>
                <td className="py-1 px-2 font-mono font-black text-slate-900 dark:text-amber-400 text-right w-24 sm:w-32 whitespace-nowrap print:text-black print:py-0.5">
                  {item.dahili}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      {/* 🖨️ تنسيق الطباعة المباشرة لـ A4 */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm 6mm 8mm;
          }
          body {
            background-color: white !important;
            color: black !important;
            zoom: 100% !important;
            font-size: 10px !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            padding-top: 0 !important;
            margin: 0 !important;
            zoom: 100% !important;
          }
          .print-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 6px !important;
            page-break-inside: avoid !important;
          }
          .print-header {
            background-color: #1d72b8 !important;
            color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            padding: 3px !important;
            margin-bottom: 6px !important;
          }
        }
      `}</style>

      {/* 📌 شريط التحكم العلوي المرتفع والثابت بوضوح فوق كل العناصر */}
      <div className={`sticky top-0 z-[999] w-full px-4 py-2.5 border-b shadow-md print:hidden transition-colors ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          {/* 🔍 مربع البحث المصغر */}
          <div className="relative max-w-xs w-full sm:w-60">
            <input
              type="text"
              placeholder="ARAMA (BİRİM VEYA DAHİLİ)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-3 py-1.5 rounded-lg border text-xs font-black uppercase outline-none focus:border-blue-500 transition-colors ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* 🎛️ أزرار التحكم بالتكبير والطباعة */}
          <div className="flex items-center gap-2">
            
            <div className={`flex items-center rounded-lg border p-0.5 shadow-inner ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'
            }`}>
              <button
                onClick={handleZoomOut}
                className="px-2 py-1 text-xs font-black rounded hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
                title="Küçült"
              >
                ➖
              </button>
              
              <span className="px-2 text-[11px] font-mono font-black text-blue-600 dark:text-cyan-400 min-w-[42px] text-center">
                %{zoomLevel}
              </span>

              <button
                onClick={handleZoomIn}
                className="px-2 py-1 text-xs font-black rounded hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
                title="Büyüt (Maksimum %200)"
              >
                ➕
              </button>

              {zoomLevel !== 100 && (
                <button
                  onClick={handleZoomReset}
                  className="px-1.5 py-1 text-[10px] font-black text-rose-500 hover:text-rose-400 cursor-pointer border-l dark:border-slate-800 ml-0.5"
                  title="Sıfırla (%100)"
                >
                  🔄
                </button>
              )}
            </div>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#1d72b8] hover:bg-blue-600 text-white rounded-lg text-xs font-black shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
              title="Yazdır veya PDF Oluştur"
            >
              <span>🖨️</span>
              <span>YAZDIR</span>
            </button>

          </div>

        </div>
      </div>

      {/* 📦 حاوية الجدول الرئيسية بمسافة علوية كافية وآمنة جداً (mt-3 / space-y-3) */}
      <div className="p-2 sm:p-4 md:p-6 w-full max-w-full space-y-3 font-sans select-none antialiased print-container mt-1">

        {/* 📜 العنوان الرئيسي للجدول (Dahili Telefon Numaraları) مع هامش علوي ممتاز */}
        <div className="bg-[#1d72b8] text-white text-center py-2 px-4 border-2 border-black rounded-lg shadow-sm w-full print-header">
          <h1 className="text-sm sm:text-base md:text-lg font-black tracking-widest uppercase">Dahili Telefon Numaraları</h1>
        </div>

        {/* 📐 شبكة الجدول المزدوج مع التحكم بالتكبير */}
        <div 
          style={{ zoom: `${zoomLevel}%` }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3.5 w-full transition-all duration-200 print-grid"
        >
          
          {/* 👈 العمود الأيسر (ZEMİN KAT POLİKLİNİKLER & 1.KAT) */}
          <div className={`border-2 border-black dark:border-slate-700 rounded-lg overflow-hidden shadow-xl flex flex-col w-full print:border-black print:shadow-none ${
            isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
          }`}>
            {phonebookData.leftColumn.map(group => renderGroup(group))}
          </div>

          {/* 👉 العمود الأيمن (ZEMİN KAT ACİL, - 1 KAT, 2.KAT) */}
          <div className={`border-2 border-black dark:border-slate-700 rounded-lg overflow-hidden shadow-xl flex flex-col w-full print:border-black print:shadow-none ${
            isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
          }`}>
            {phonebookData.rightColumn.map(group => renderGroup(group))}
          </div>

        </div>

      </div>
    </>
  );
}