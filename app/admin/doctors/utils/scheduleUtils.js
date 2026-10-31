import { TURKEY_OFFICIAL_HOLIDAYS_2026 } from '../constants/departmentsData';

export const generateFullMonthSchedule = (year = new Date().getFullYear(), month = new Date().getMonth()) => {
  const days = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNames = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ'];

  for (let i = 1; i <= daysInMonth; i++) {
    const dayNum = String(i).padStart(2, '0');
    const monthNum = String(month + 1).padStart(2, '0');
    const isoDateStr = `${year}-${monthNum}-${dayNum}`;
    const dateObj = new Date(year, month, i);
    const dayIndex = dateObj.getDay();
    const dayName = dayNames[dayIndex];
    const isWeekend = dayIndex === 0 || dayIndex === 6;
    const holidayName = TURKEY_OFFICIAL_HOLIDAYS_2026[isoDateStr];

    let initialStatus = 'POLİKLİNİK';
    if (holidayName) {
      initialStatus = 'RESMİ TATİL';
    } else if (isWeekend) {
      initialStatus = 'HAFTA SONU';
    }

    days.push({
      dayNumber: i,
      fullDateObj: dateObj.toISOString(),
      date: `${dayNum}.${monthNum}.${year}`,
      day: dayName,
      status: initialStatus,
      holidayName: holidayName || null
    });
  }
  return days;
};

export const parseItemDate = (item) => {
  if (!item) return null;
  if (typeof item.date === 'string' && item.date.includes('.')) {
    const parts = item.date.split('.');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
  }
  if (item.fullDateObj) {
    const d = new Date(item.fullDateObj);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
};

// ═══════════════════════════════════════════════════════════
// دالة الألوان (بالألوان القديمة الجميلة + التعديلات المطلوبة)
// ═══════════════════════════════════════════════════════════
export const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'POLİKLİNİK':
    case 'POLİK':
      return 'bg-emerald-600 text-white border-emerald-500 font-extrabold shadow-xs';
    
    case 'AMELİYAT':       // ✅ تم التعديل من AMELİYATTA
    case 'AMELİYATTA':     // دعم البيانات القديمة
      return 'bg-purple-600 text-white border-purple-500 font-extrabold shadow-xs';
    
    case 'PALYATİF':
      return 'bg-pink-600 text-white border-pink-400 font-extrabold shadow-xs';
    
    case 'İŞLEM GÜNÜ':
      return 'bg-teal-600 text-white border-teal-400 font-extrabold shadow-xs';
    
    case '08:00 - 12:00 KADAR':  // ✅ بديل YARIM GÜN
      return 'bg-orange-500 text-slate-950 font-extrabold border-orange-400 shadow-xs';
    
    case '13:00 - 16:00 KADAR':  // ✅ حالة جديدة
      return 'bg-blue-500 text-white border-blue-400 font-extrabold shadow-xs';
    
    case 'SAATLİK İZİN':
      return 'bg-amber-600 text-white border-amber-400 font-extrabold shadow-xs';
    
    case 'RESMİ TATİL':
      return 'bg-indigo-700 text-white border-indigo-500 font-extrabold shadow-xs';
    
    case 'HAFTA SONU':
      return 'bg-rose-600 text-white border-rose-400 font-extrabold shadow-xs';
    
    case 'YILLIK İZİN':
    case 'RAPORLU':
      return 'bg-amber-500 text-slate-950 font-extrabold border-amber-400 shadow-xs';
    
    case 'NÖBET SONRASI':
    case 'NÖBET SONRASI İZİN': // دعم البيانات القديمة
      return 'bg-sky-600 text-white border-sky-500 font-extrabold shadow-xs';
    
    case 'ASKERLİK':
      return 'bg-slate-800 text-slate-100 border-slate-600 font-extrabold shadow-xs';
    
    case 'KONGRE/SEMİNER':
      return 'bg-blue-600 text-white border-blue-400 font-extrabold shadow-xs';
    
    // ❌ تم حذف ŞUA İZNİ نهائياً
    
    default:
      return 'bg-slate-700 text-white border-slate-500 font-extrabold';
  }
};