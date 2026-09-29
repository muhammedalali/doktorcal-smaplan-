'use client';

import { useState } from 'react';
import { useTableSettings } from '@/context/TableSettingsContext';

// Temel Renkler
const BASIC_PRIMARY_COLORS = [
  { name: 'Kömür / Siyah', key: 'text-black dark:text-white', bg: 'bg-black dark:bg-white' },
  { name: 'Saf Kırmızı', key: 'text-red-600 dark:text-red-400', bg: 'bg-red-600' },
  { name: 'Koyu Mavi', key: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-700' },
  { name: 'Canlı Yeşil', key: 'text-green-600 dark:text-green-400', bg: 'bg-green-600' },
  { name: 'Parlak Sarı', key: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500' },
  { name: 'Saf Turuncu', key: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-600' },
  { name: 'Derin Mor', key: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-700' },
  { name: 'Turkuaz', key: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500' }
];

// Genişletilmiş Renk Paleti
const EXTENDED_PALETTES = [
  { name: 'Slate / Kömür', key: 'text-slate-900 dark:text-slate-100', bg: 'bg-slate-900' },
  { name: 'Zinc / Çinko', key: 'text-zinc-800 dark:text-zinc-200', bg: 'bg-zinc-800' },
  { name: 'Neutral / Nötr', key: 'text-neutral-700 dark:text-neutral-300', bg: 'bg-neutral-700' },
  { name: 'Zümrüt Yeşili', key: 'text-emerald-800 dark:text-emerald-300', bg: 'bg-emerald-800' },
  { name: 'Teal / Deniz Yeşili', key: 'text-teal-600 dark:text-teal-300', bg: 'bg-teal-600' },
  { name: 'Limon Yeşili', key: 'text-lime-700 dark:text-lime-400', bg: 'bg-lime-600' },
  { name: 'İndigo / Çivit', key: 'text-indigo-900 dark:text-indigo-200', bg: 'bg-indigo-900' },
  { name: 'Okyanus Mavisi', key: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-600' },
  { name: 'Gök Mavisi', key: 'text-sky-600 dark:text-sky-300', bg: 'bg-sky-500' },
  { name: 'Gül Kırmızı', key: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-700' },
  { name: 'Pembe', key: 'text-pink-600 dark:text-pink-300', bg: 'bg-pink-600' },
  { name: 'Fuşya', key: 'text-fuchsia-700 dark:text-fuchsia-300', bg: 'bg-fuchsia-700' },
  { name: 'Kehribar / Altın', key: 'text-amber-800 dark:text-amber-300', bg: 'bg-amber-600' },
  { name: 'Kahverengi', key: 'text-amber-950 dark:text-amber-200', bg: 'bg-amber-900' },
  { name: 'Taş Grisi', key: 'text-stone-800 dark:text-stone-200', bg: 'bg-stone-700' }
];

// Yazı Tipleri
const FONT_OPTIONS = [
  { name: 'Modern Sans (Standart)', key: 'font-sans' },
  { name: 'Klasik Serif (Geleneksel)', key: 'font-serif' },
  { name: 'Kod / Mono (Tek Düze)', key: 'font-mono' },
  { name: 'Yuvarlatılmış (Rounded)', key: 'font-sans tracking-wide' },
  { name: 'Sıkıştırılmış (Condensed)', key: 'font-sans tracking-tighter' },
  { name: 'Geometrik (Geometric)', key: 'font-mono tracking-widest' }
];

// Yazı Kalınlıkları
const FONT_WEIGHTS = [
  { name: 'Normal', key: 'font-normal' },
  { name: 'Orta (Medium)', key: 'font-medium' },
  { name: 'Kalın (Bold)', key: 'font-bold' },
  { name: 'Ekstra Kalın (Heavy / Black)', key: 'font-black' }
];

export default function TableSettingsModal({ isOpen, onClose, onBack, isDarkMode }) {
  const {
    tableSettings,
    setTableSettings,
    selectedFont,
    setSelectedFont,
    activeColor,
    setActiveColor,
    customHexColor
  } = useTableSettings();

  const [activeTab, setActiveTab] = useState('COLORS'); // 'COLORS' | 'FONTS' | 'GRID' | 'COLUMNS'
  const [pickerHex, setPickerHex] = useState(customHexColor || '#0f172a');

  if (!isOpen) return null;

  const handleCustomColorApply = (hex) => {
    setPickerHex(hex);
    setActiveColor('CUSTOM_HEX', hex);
  };

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/80 p-3 sm:p-5 cursor-default">
      <div
        className={`w-full max-w-2xl rounded-3xl shadow-2xl border flex flex-col max-h-[92vh] overflow-hidden ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-colors"
                title="Geri Dön"
              >
                <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
            )}
            <div>
              <h3 className="text-base sm:text-lg font-black text-teal-600 dark:text-teal-400 uppercase tracking-tight flex items-center gap-2">
                <span>🎨 TABLO GÖRÜNÜM VE STİL AYARLARI</span>
              </h3>
              <p className="text-[11px] font-extrabold text-slate-400">
                Gelişmiş renk paletleri, çizgi düzeni ve yazı tipleri
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 font-black cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-1.5 gap-1 shrink-0 font-black text-xs">
          {[
            { id: 'COLORS', label: '🎨 RENKLER', desc: 'Renk Seçenekleri' },
            { id: 'FONTS', label: '🔤 YAZI TİPİ', desc: 'Stil ve Kalınlık' },
            { id: 'GRID', label: '📐 ÇİZGİ VE DÜZEN', desc: 'Izgara ve Çerçeve' },
            { id: 'COLUMNS', label: '👁️ SÜTUNLAR', desc: 'Görünürlük' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-2 rounded-2xl text-center cursor-pointer transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-lg font-black'
                  : isDarkMode
                  ? 'text-slate-400 hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <div>{tab.label}</div>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 font-black">
          
          {/* TAB 1: RENKLER */}
          {activeTab === 'COLORS' && (
            <div className="space-y-6">
              
              {/* ÖZEL RENK SEÇİCİ */}
              <div className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <label className="text-xs text-amber-500 uppercase tracking-wider block mb-3">
                  🎯 ÖZEL RENK SEÇİCİ (SERBEST RENK KODU)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={pickerHex}
                    onChange={(e) => handleCustomColorApply(e.target.value)}
                    className="w-14 h-12 rounded-2xl cursor-pointer border-0 bg-transparent"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-mono uppercase text-slate-400">SEÇİLEN HEX KODU:</span>
                    <div className="text-sm font-black font-mono tracking-wider">{pickerHex}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCustomColorApply(pickerHex)}
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
                  >
                    Rengi Uygula
                  </button>
                </div>
              </div>

              {/* TEMEL RENKLER */}
              <div className="space-y-2.5">
                <label className="text-xs text-amber-500 uppercase tracking-wider block">⭐ TEMEL VE ANA RENKLER</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BASIC_PRIMARY_COLORS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setActiveColor(c.key)}
                      className={`p-2.5 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                        activeColor === c.key && !customHexColor
                          ? 'border-amber-400 bg-amber-400/10 shadow-md font-black'
                          : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full ${c.bg} shrink-0 shadow-xs`}></span>
                      <span className="text-xs truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* GENİŞLETİLMİŞ PALET */}
              <div className="space-y-2.5">
                <label className="text-xs text-amber-500 uppercase tracking-wider block">🌈 GENİŞLETİLMİŞ RENK PALETİ</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                  {EXTENDED_PALETTES.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setActiveColor(c.key)}
                      className={`p-2.5 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                        activeColor === c.key && !customHexColor
                          ? 'border-amber-400 bg-amber-400/10 shadow-md font-black'
                          : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full ${c.bg} shrink-0 shadow-xs`}></span>
                      <span className="text-xs truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: YAZI TİPİ */}
          {activeTab === 'FONTS' && (
            <div className="space-y-6">
              
              {/* Yazı Tipi Ailesi */}
              <div className="space-y-2.5">
                <label className="text-xs text-amber-500 uppercase tracking-wider block">🔤 YAZI TİPİ STİLİ</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {FONT_OPTIONS.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setSelectedFont(f.key)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        selectedFont === f.key
                          ? 'bg-teal-600 text-white border-teal-600 font-black shadow-md'
                          : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      <span className={f.key}>{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Yazı Kalınlığı */}
              <div className="space-y-2.5">
                <label className="text-xs text-amber-500 uppercase tracking-wider block">💪 YAZI KALINLIĞI VE SIKLIĞI</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {FONT_WEIGHTS.map((w) => (
                    <button
                      key={w.key}
                      type="button"
                      onClick={() => setTableSettings({ fontWeight: w.key })}
                      className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                        tableSettings.fontWeight === w.key
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-md'
                          : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      <span className={w.key}>{w.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Satır Yüksekliği */}
              <div className="space-y-2.5">
                <label className="text-xs text-amber-500 uppercase tracking-wider block">↕️ SATIR YÜKSEKLİĞİ VE BOŞLUĞU</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { key: 'compact', name: 'Sıkışık' },
                    { key: 'normal', name: 'Normal' },
                    { key: 'spacious', name: 'Geniş' }
                  ].map((mode) => (
                    <button
                      key={mode.key}
                      type="button"
                      onClick={() => setTableSettings({ rowPadding: mode.key })}
                      className={`p-3 rounded-2xl border text-center uppercase cursor-pointer ${
                        tableSettings.rowPadding === mode.key
                          ? 'bg-teal-600 text-white border-teal-600 font-black'
                          : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      {mode.name}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ÇİZGİ VE DÜZEN */}
          {activeTab === 'GRID' && (
            <div className="space-y-6">
              
              {/* Izgara Düzeni */}
              <div className="space-y-2.5">
                <label className="text-xs text-amber-500 uppercase tracking-wider block">📐 TABLO IZGARA VE ÇİZGİ DÜZENİ</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'full', name: '▦ Tam Çerçeve (Dikey + Yatay)' },
                    { key: 'horizontal', name: '▤ Sadece Yatay Çizgiler' },
                    { key: 'vertical', name: '▥ Sadece Dikey Çizgiler' },
                    { key: 'none', name: '▢ Çerçevesiz / Çizgisiz' }
                  ].map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => setTableSettings({ gridStyle: g.key })}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        tableSettings.gridStyle === g.key
                          ? 'bg-teal-600 text-white border-teal-600 font-black shadow-md'
                          : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Çizgi Belirginliği */}
              <div className="space-y-2.5">
                <label className="text-xs text-amber-500 uppercase tracking-wider block">✏️ ÇİZGİ KOYULUĞU VE BELİRGİNLİĞİ</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { key: 'light', name: 'Hafif / İnce' },
                    { key: 'medium', name: 'Orta / Normal' },
                    { key: 'strong', name: 'Belirgin / Koyu' }
                  ].map((b) => (
                    <button
                      key={b.key}
                      type="button"
                      onClick={() => setTableSettings({ borderOpacity: b.key })}
                      className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                        tableSettings.borderOpacity === b.key
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-md'
                          : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: SÜTUNLAR */}
          {activeTab === 'COLUMNS' && (
            <div className="space-y-6">
              <label className="text-xs text-amber-500 uppercase tracking-wider block">👁️ SÜTUN GÖRÜNÜRLÜĞÜ</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: 'showClinic', label: 'Birim / Poliklinik' },
                  { key: 'showDoctorName', label: 'Doktor Adı Soyadı' },
                  { key: 'showStatus', label: 'Durum Bilgisi' }
                ].map((col) => (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => setTableSettings({ [col.key]: !tableSettings[col.key] })}
                    className={`p-4 rounded-2xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                      tableSettings[col.key]
                        ? 'bg-teal-600 text-white border-teal-600 font-black shadow-md'
                        : isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}
                  >
                    <span>{col.label}</span>
                    <span>{tableSettings[col.key] ? '✓ Açık' : '✕ Kapalı'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white rounded-2xl text-xs font-black shadow-xl cursor-pointer uppercase tracking-wide transition-all"
          >
            TÜM AYARLARI UYGULA VE KAPAT 🚀
          </button>
        </div>

      </div>
    </div>
  );
}