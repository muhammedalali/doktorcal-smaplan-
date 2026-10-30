'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import {
  X, Activity, Printer, Menu, User, Calendar, Ruler, Weight,
  ChevronDown, Check, Info, Baby, Heart, Stethoscope, Settings, 
  Copy, ClipboardCheck, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, 
  ShieldAlert, Stethoscope as StethoIcon, Moon, Sun, Monitor,
  HelpCircle, Droplets, ChevronLeft, ChevronRight, FileText, Save, Hash
} from 'lucide-react';

/* ==================== CUSTOM MODERN DATE PICKER ==================== */
const DAYS_TR = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];
const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const ModernDatePicker = ({ value, onChange, isDark }: { value: string, onChange: (val: string) => void, isDark: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (y: number, m: number) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };

  const days = [];
  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDay(viewDate.getFullYear(), viewDate.getMonth());
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const selectedDay = value ? new Date(value).getDate() : null;
  const selectedMonth = value ? new Date(value).getMonth() : null;
  const selectedYear = value ? new Date(value).getFullYear() : null;

  return (
    <div className="relative w-full" ref={containerRef}>
      <button onClick={() => setIsOpen(!isOpen)} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-300 bg-white text-slate-900'} text-sm font-medium outline-none focus:border-blue-500`}>
        <span className={!value ? 'text-slate-400' : ''}>{value ? `${selectedDay}/${selectedMonth! + 1}/${selectedYear}` : 'GG/AA/YYYY'}</span>
        <Calendar className="w-4 h-4 text-slate-400" />
      </button>
      {isOpen && (
        <div className={`absolute top-full left-0 mt-2 z-[100] p-4 rounded-2xl shadow-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} w-72 animate-in fade-in zoom-in-95`}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronLeft className="w-4 h-4" /></button>
            <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{MONTHS_TR[viewDate.getMonth()]} {viewDate.getFullYear()}</div>
            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_TR.map(d => <div key={d} className="text-[10px] font-black text-center text-slate-400 uppercase">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const isSel = day === selectedDay && viewDate.getMonth() === selectedMonth && viewDate.getFullYear() === selectedYear;
              return (
                <button key={day} onClick={() => { onChange(new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toISOString().split('T')[0]); setIsOpen(false); }}
                  className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${isSel ? 'bg-red-600 text-white shadow-md scale-110' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ==================== HELPERS & MATH ==================== */
const calculateAge = (birth: string, exam: string) => {
  if (!birth || !exam) return null;
  const days = Math.floor((new Date(exam).getTime() - new Date(birth).getTime()) / (1000 * 60 * 60 * 24));
  return { days: Math.max(0, days), display: days === 0 ? '0 gün' : `${days} gün (${(days / 365.25).toFixed(3)} yıl)` };
};
const calcZ = (val: number, L: number, M: number, S: number) => {
  if (val <= 0) return 0;
  return L === 0 ? Math.log(val / M) / S : (Math.pow(val / M, L) - 1) / (L * S);
};
const toPercentile = (z: number) => Math.max(0.01, Math.min(99.99, 0.5 * (1 + Math.tanh(z * 0.7978845608)) * 100)).toFixed(2);

/* ==================== MAIN COMPONENT ==================== */
export default function MedicalSuite({ onClose }: { onClose: () => void }) {
  const { isDarkMode } = useTheme();
  const [activeMenu, setActiveMenu] = useState('buyume');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  // State for Büyüme
  const [birthDate, setBirthDate] = useState('');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [gender, setGender] = useState<'male'|'female'>('male');

  // State for APGAR
  const [apgar, setApgar] = useState({ appearance: 2, pulse: 2, grimace: 2, activity: 2, respiration: 2 });

  // State for Diyabet
  const [hba1c, setHba1c] = useState<string>('7');

  // State for Kardiyoloji
  const [qt, setQt] = useState<string>('400');
  const [rr, setRr] = useState<string>('800');

  // Calculations
  const ageInfo = useMemo(() => calculateAge(birthDate, examDate), [birthDate, examDate]);
  const h = parseFloat(height) || 0; const w = parseFloat(weight) || 0;
  const bmi = (h > 0 && w > 0) ? w / Math.pow(h / 100, 2) : 0;
  const bsa = (h > 0 && w > 0) ? Math.sqrt((h * w) / 3600).toFixed(3) : '—';

  const results = useMemo(() => {
    if (h <= 0 || w <= 0) return null;
    const wZ = calcZ(w, -0.5, 10, 0.1), hZ = calcZ(h, 1, 75, 0.04), bZ = calcZ(bmi, -1, 16, 0.08);
    return { weight: { z: wZ.toFixed(2), p: toPercentile(wZ) }, height: { z: hZ.toFixed(2), p: toPercentile(hZ) }, bmi: { z: bZ.toFixed(2), p: toPercentile(bZ) } };
  }, [h, w, bmi]);

  const apgarTotal = Object.values(apgar).reduce((a, b) => a + b, 0);
  const eAG = Math.round(28.7 * (parseFloat(hba1c) || 0) - 46.7);
  const qtc = Math.round((parseFloat(qt) || 0) / Math.sqrt((parseFloat(rr) || 1) / 1000));

  const handleCopy = () => {
    if (activeMenu === 'buyume' && results && ageInfo) {
      const txt = `Yaş: ${ageInfo.display}\nAğırlık: ${w}kg (SDS:${results.weight.z})\nBoy: ${h}cm (SDS:${results.height.z})\nVKİ: ${bmi.toFixed(2)} (SDS:${results.bmi.z})`;
      navigator.clipboard.writeText(txt);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }
  };

  const t = isDarkMode ? { bg: 'bg-[#0B1120]', panel: 'bg-[#111827]', border: 'border-slate-800', text: 'text-slate-100', muted: 'text-slate-400', input: 'bg-slate-900/50' } : { bg: 'bg-[#f3f4f6]', panel: 'bg-white', border: 'border-slate-200', text: 'text-slate-900', muted: 'text-slate-500', input: 'bg-slate-50' };

  const MENU = [
    { id: 'buyume', label: 'Büyüme', icon: TrendingUp, color: 'bg-blue-500' },
    { id: 'yenidogan', label: 'Yenidoğan', icon: Baby, color: 'bg-purple-500' },
    { id: 'kardiyoloji', label: 'Kardiyoloji', icon: StethoIcon, color: 'bg-rose-500' },
    { id: 'diyabet', label: 'Diyabet', icon: Droplets, color: 'bg-orange-500' },
  ];

  return (
    <div className={`fixed inset-0 z-[500] flex w-full h-full ${t.bg} font-sans overflow-hidden`}>
      
      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} h-full flex flex-col border-r ${t.border} ${t.panel} transition-all duration-300 shrink-0 z-50`}>
        <div className={`h-16 flex items-center justify-between px-4 border-b ${t.border}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black">Ç</div>
            {isSidebarOpen && <span className={`font-black ${t.text}`}>ÇEDD Çözüm</span>}
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {MENU.map(item => (
            <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${activeMenu === item.id ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : `${t.muted} hover:bg-slate-50 dark:hover:bg-slate-800`}`}>
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      </aside>

      {/* MAIN CONTENT (Split into Form and Results) */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {/* HEADER */}
        <header className={`h-16 flex items-center justify-between px-4 lg:px-8 border-b ${t.border} ${t.panel} shrink-0`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-lg ${t.input} ${t.muted}`}><Menu className="w-5 h-5" /></button>
            <h2 className={`text-lg font-black hidden sm:block ${t.text}`}>{MENU.find(m => m.id === activeMenu)?.label}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className={`p-2 rounded-lg ${t.input} border ${t.border} ${t.muted} hover:text-blue-500`} title="Kopyala">
              {copied ? <ClipboardCheck className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
            </button>
            <button onClick={() => window.print()} className={`p-2 rounded-lg ${t.input} border ${t.border} ${t.muted} hover:text-blue-500`} title="Yazdır"><Printer className="w-5 h-5" /></button>
            <button onClick={onClose} className="p-2 ml-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"><X className="w-5 h-5" /></button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* LEFT: FORMS */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className={`max-w-2xl mx-auto p-6 rounded-3xl border ${t.border} ${t.panel}`}>
              
              {/* 1. BÜYÜME FORM */}
              {activeMenu === 'buyume' && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="flex items-center gap-4">
                    <label className={`w-28 text-sm font-bold ${t.text}`}>Cinsiyet</label>
                    <div className={`flex-1 flex p-1 rounded-xl ${t.input} border ${t.border}`}>
                      <button onClick={() => setGender('male')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${gender === 'male' ? 'bg-blue-500 text-white shadow' : t.muted}`}>Erkek</button>
                      <button onClick={() => setGender('female')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${gender === 'female' ? 'bg-pink-500 text-white shadow' : t.muted}`}>Kız</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className={`w-28 text-sm font-bold ${t.text}`}>Doğum Tarihi</label>
                    <div className="flex-1"><ModernDatePicker value={birthDate} onChange={setBirthDate} isDark={isDarkMode} /></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className={`w-28 text-sm font-bold ${t.text}`}>Muayene Tarihi</label>
                    <div className="flex-1"><ModernDatePicker value={examDate} onChange={setExamDate} isDark={isDarkMode} /></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className={`w-28 text-sm font-bold ${t.text}`}>Ağırlık</label>
                    <div className="flex-1 relative">
                      <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={`w-full px-4 py-2.5 rounded-xl border ${t.border} ${t.input} ${t.text} font-bold outline-none focus:border-blue-500`} />
                      <span className={`absolute right-4 top-2.5 text-xs font-bold ${t.muted}`}>kg</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className={`w-28 text-sm font-bold ${t.text}`}>Boy</label>
                    <div className="flex-1 relative">
                      <input type="number" value={height} onChange={e => setHeight(e.target.value)} className={`w-full px-4 py-2.5 rounded-xl border ${t.border} ${t.input} ${t.text} font-bold outline-none focus:border-blue-500`} />
                      <span className={`absolute right-4 top-2.5 text-xs font-bold ${t.muted}`}>cm</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. YENİDOĞAN FORM */}
              {activeMenu === 'yenidogan' && (
                <div className="space-y-5 animate-in fade-in">
                  <h3 className={`font-black text-lg mb-4 ${t.text}`}>APGAR Skoru</h3>
                  {Object.entries(apgar).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className={`text-sm font-bold capitalize ${t.text}`}>{key}</span>
                      <div className={`flex p-1 rounded-xl ${t.input} border ${t.border}`}>
                        {[0,1,2].map(n => (
                          <button key={n} onClick={() => setApgar(p => ({...p, [key]: n}))} className={`w-10 py-1.5 rounded-lg text-sm font-bold ${val === n ? 'bg-blue-500 text-white' : t.muted}`}>{n}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. DİYABET FORM */}
              {activeMenu === 'diyabet' && (
                <div className="space-y-5 animate-in fade-in">
                  <h3 className={`font-black text-lg mb-4 ${t.text}`}>HbA1c Dönüştürücü</h3>
                  <div>
                    <label className={`text-sm font-bold mb-2 block ${t.text}`}>HbA1c Değeri (%)</label>
                    <input type="number" step="0.1" value={hba1c} onChange={e => setHba1c(e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${t.border} ${t.input} ${t.text} font-black text-lg outline-none focus:border-blue-500`} />
                  </div>
                </div>
              )}

              {/* 4. KARDİYOLOJİ FORM */}
              {activeMenu === 'kardiyoloji' && (
                <div className="space-y-5 animate-in fade-in">
                  <h3 className={`font-black text-lg mb-4 ${t.text}`}>QTc Hesaplama</h3>
                  <div>
                    <label className={`text-sm font-bold mb-2 block ${t.text}`}>QT Süresi (ms)</label>
                    <input type="number" value={qt} onChange={e => setQt(e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${t.border} ${t.input} ${t.text} font-black text-lg outline-none`} />
                  </div>
                  <div>
                    <label className={`text-sm font-bold mb-2 block ${t.text}`}>RR Süresi (ms)</label>
                    <input type="number" value={rr} onChange={e => setRr(e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${t.border} ${t.input} ${t.text} font-black text-lg outline-none`} />
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className={`w-full lg:w-[400px] xl:w-[450px] shrink-0 border-t lg:border-t-0 lg:border-l ${t.border} ${t.panel} overflow-y-auto p-6`}>
            <h3 className={`text-lg font-black mb-6 ${t.text}`}>Sonuçlar</h3>
            
            {/* Büyüme Sonuçları */}
            {activeMenu === 'buyume' && (
              results && ageInfo ? (
                <div className="animate-in slide-in-from-right-4 space-y-4">
                  <div className={`p-4 rounded-xl border ${t.border} flex justify-between items-center`}>
                    <span className={`text-sm font-bold ${t.muted}`}>Yaş</span>
                    <span className={`font-black ${t.text}`}>{ageInfo.display}</span>
                  </div>
                  <div className={`rounded-xl border ${t.border} overflow-hidden`}>
                    <table className="w-full text-left text-sm">
                      <thead className={`${t.input} border-b ${t.border} text-xs font-black text-slate-400`}>
                        <tr><th className="px-4 py-3">Değer</th><th className="px-4 py-3 text-right">SDS</th><th className="px-4 py-3 text-right">P</th></tr>
                      </thead>
                      <tbody className={`divide-y ${t.border}`}>
                        <tr><td className={`px-4 py-3 font-bold ${t.text}`}>Ağırlık</td><td className={`px-4 py-3 text-right font-bold ${t.text}`}>{w} kg</td><td className="px-4 py-3 text-right font-bold text-blue-500">{results.weight.z}</td><td className="px-4 py-3 text-right text-xs text-slate-400">{results.weight.p}</td></tr>
                        <tr><td className={`px-4 py-3 font-bold ${t.text}`}>Boy</td><td className={`px-4 py-3 text-right font-bold ${t.text}`}>{h} cm</td><td className="px-4 py-3 text-right font-bold text-blue-500">{results.height.z}</td><td className="px-4 py-3 text-right text-xs text-slate-400">{results.height.p}</td></tr>
                        <tr><td className={`px-4 py-3 font-bold ${t.text}`}>VKİ</td><td className={`px-4 py-3 text-right font-bold ${t.text}`}>{bmi.toFixed(1)}</td><td className="px-4 py-3 text-right font-bold text-blue-500">{results.bmi.z}</td><td className="px-4 py-3 text-right text-xs text-slate-400">{results.bmi.p}</td></tr>
                        <tr><td className={`px-4 py-3 font-bold ${t.text}`}>BSA</td><td className={`px-4 py-3 text-right font-bold ${t.text}`}>{bsa} m²</td><td className="px-4 py-3 text-right text-slate-400">—</td><td className="px-4 py-3 text-right text-slate-400">—</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className={`text-sm font-bold text-center mt-10 ${t.muted}`}>Veri bekleniyor...</p>
              )
            )}

            {/* APGAR Sonuçları */}
            {activeMenu === 'yenidogan' && (
              <div className={`p-6 rounded-2xl text-center border ${t.border} ${t.input} animate-in slide-in-from-right-4`}>
                <div className={`text-6xl font-black ${apgarTotal >= 7 ? 'text-emerald-500' : apgarTotal >= 4 ? 'text-amber-500' : 'text-rose-500'}`}>{apgarTotal}</div>
                <div className={`text-xs font-bold mt-2 uppercase ${t.muted}`}>APGAR SKORU</div>
                <div className={`mt-4 text-sm font-bold ${t.text}`}>{apgarTotal >= 7 ? 'Normal (Sağlıklı)' : apgarTotal >= 4 ? 'Orta Depresyon' : 'Ciddi Depresyon'}</div>
              </div>
            )}

            {/* Diyabet Sonuçları */}
            {activeMenu === 'diyabet' && (
              <div className={`p-6 rounded-2xl text-center border ${t.border} ${t.input} animate-in slide-in-from-right-4`}>
                <div className="text-6xl font-black text-cyan-500">{eAG}</div>
                <div className={`text-xs font-bold mt-2 uppercase ${t.muted}`}>eAG (mg/dL)</div>
                <div className={`mt-4 text-sm font-bold ${t.text}`}>Tahmini Ortalama Glukoz</div>
              </div>
            )}

            {/* Kardiyoloji Sonuçları */}
            {activeMenu === 'kardiyoloji' && (
              <div className={`p-6 rounded-2xl text-center border ${t.border} ${t.input} animate-in slide-in-from-right-4`}>
                <div className={`text-6xl font-black ${qtc > 450 ? 'text-rose-500' : 'text-emerald-500'}`}>{qtc}</div>
                <div className={`text-xs font-bold mt-2 uppercase ${t.muted}`}>QTc (ms)</div>
                <div className={`mt-4 text-sm font-bold ${t.text}`}>{qtc > 450 ? 'Uzamış QT (Riskli)' : 'Normal Sınırlarda'}</div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}