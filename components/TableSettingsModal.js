'use client';

import { useState } from 'react';
import { useTableSettings } from '@/context/TableSettingsContext';

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

const EXTENDED_PALETTES = [
  { name: 'Slate / Kömür', key: 'text-slate-950 dark:text-white', bg: 'bg-slate-950' },
  { name: 'Zinc / Çinko', key: 'text-zinc-900 dark:text-zinc-100', bg: 'bg-zinc-900' },
  { name: 'Neutral / Nötr', key: 'text-neutral-900 dark:text-neutral-100', bg: 'bg-neutral-900' },
  { name: 'Zümrüt Yeşili', key: 'text-emerald-900 dark:text-emerald-300', bg: 'bg-emerald-900' },
  { name: 'Teal / Deniz Yeşili', key: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-700' },
  { name: 'Limon Yeşili', key: 'text-lime-800 dark:text-lime-300', bg: 'bg-lime-700' },
  { name: 'İndigo / Çivit', key: 'text-indigo-950 dark:text-indigo-200', bg: 'bg-indigo-950' },
  { name: 'Okyanus Mavisi', key: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-700' },
  { name: 'Gök Mavisi', key: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-600' },
  { name: 'Gül Kırmızı', key: 'text-rose-800 dark:text-rose-300', bg: 'bg-rose-800' },
  { name: 'Pembe', key: 'text-pink-700 dark:text-pink-300', bg: 'bg-pink-700' },
  { name: 'Fuşya', key: 'text-fuchsia-800 dark:text-fuchsia-300', bg: 'bg-fuchsia-800' },
  { name: 'Kehribar / Altın', key: 'text-amber-900 dark:text-amber-300', bg: 'bg-amber-700' },
  { name: 'Kahverengi', key: 'text-amber-950 dark:text-amber-200', bg: 'bg-amber-950' },
  { name: 'Taş Grisi', key: 'text-stone-900 dark:text-stone-100', bg: 'bg-stone-800' }
];

const FONT_OPTIONS = [
  { name: 'Inter (Modern Kurumsal)', key: 'font-inter', fontFamily: "'Inter', sans-serif" },
  { name: 'Roboto (Google UI)', key: 'font-roboto', fontFamily: "'Roboto', sans-serif" },
  { name: 'Poppins (Geometrik Net)', key: 'font-poppins', fontFamily: "'Poppins', sans-serif" },
  { name: 'Montserrat (Geniş İletişim)', key: 'font-montserrat', fontFamily: "'Montserrat', sans-serif" },
  { name: 'Open Sans (Yüksek Okunabilirlik)', key: 'font-opensans', fontFamily: "'Open Sans', sans-serif" },
  { name: 'Lato (Dengeli Minimal)', key: 'font-lato', fontFamily: "'Lato', sans-serif" },
  { name: 'Raleway (Zarif Vurgulu)', key: 'font-raleway', fontFamily: "'Raleway', sans-serif" },
  { name: 'Rubik (Yumuşak Köşeli)', key: 'font-rubik', fontFamily: "'Rubik', sans-serif" },
  { name: 'Oswald (Başlık Sıkı)', key: 'font-oswald', fontFamily: "'Oswald', sans-serif" },
  { name: 'Nunito (Yuvarlatılmış Soft)', key: 'font-rounded', fontFamily: "'Nunito', sans-serif" },
  { name: 'Roboto Condensed (Dar Tablo)', key: 'font-condensed', fontFamily: "'Roboto Condensed', sans-serif" },
  { name: 'Playfair Display (Klasik Serif)', key: 'font-serif', fontFamily: "'Playfair Display', serif" },
  { name: 'Fira Code (Yazılım / Mono)', key: 'font-mono', fontFamily: "'Fira Code', monospace" }
];

const FONT_WEIGHTS = [
  { name: 'Normal / Dengeli', key: 'font-normal', fontWeight: '500' },
  { name: 'Orta (Medium)', key: 'font-medium', fontWeight: '700' },
  { name: 'Kalın (Bold)', key: 'font-bold', fontWeight: '800' },
  { name: 'Ekstra Kalın (Black)', key: 'font-black', fontWeight: '900' }
];

export default function TableSettingsModal({ isOpen, onClose, onBack, isDarkMode }) {
  const {
    tableSettings,
    setTableSettings,
    selectedFont,
    setSelectedFont,
    activeColor,
    setActiveColor,
    customHexColor,
    getFontStyles,
    getFontWeightStyle
  } = useTableSettings();

  const [activeTab, setActiveTab] = useState('COLORS');
  const [pickerHex, setPickerHex] = useState(customHexColor || '#000000');

  if (!isOpen) return null;

  const handleCustomColorApply = (hex) => {
    setPickerHex(hex);
    if (setActiveColor) {
      setActiveColor('CUSTOM_HEX', hex);
    }
  };

  const currentFontStyle = getFontStyles(selectedFont);
  const currentFontWeight = getFontWeightStyle(tableSettings?.fontWeight);

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/80 p-3 sm:p-5 cursor-default backdrop-blur-none">
      <div
        className={`w-full max-w-2xl rounded-3xl shadow-2xl border-4 flex flex-col max-h-[92vh] overflow-hidden ${
          isDarkMode 
            ? 'bg-slate-950 border-slate-700 text-white' 
            : 'bg-white border-slate-900 text-slate-950'
        }`}
        style={{ fontFamily: currentFontStyle.fontFamily }}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b-2 flex justify-between items-center shrink-0 z-30 ${isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-100'}`}>
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200 text-slate-900'}`}
                title="Geri Dön"
              >
                <svg className="w-5 h-5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
            )}
            <div>
              <h3 className="text-base sm:text-lg text-teal-600 dark:text-teal-400 uppercase tracking-tight flex items-center gap-2 font-black">
                <span>🎨 TABLO VE GÖRÜNÜM AYARLARI</span>
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-rose-500 text-white hover:bg-rose-600 transition-colors font-black text-lg shadow-md"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex border-b-2 p-1.5 gap-1 shrink-0 text-xs font-black z-20 ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-100'}`}>
          {[
            { id: 'COLORS', label: '🎨 RENKLER' },
            { id: 'FONTS', label: '🔤 YAZI TİPİ VE KOYULUK' },
            { id: 'GRID', label: '📐 ÇİZGİ VE DÜZEN' },
            { id: 'COLUMNS', label: '👁️ SÜTUNLAR' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-2 rounded-2xl text-center cursor-pointer transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-700 text-white shadow-lg font-black scale-[1.02]'
                  : isDarkMode
                  ? 'text-slate-300 hover:bg-slate-800'
                  : 'text-slate-900 hover:bg-slate-200'
              }`}
              style={{ fontWeight: currentFontWeight }}
            >
              <div>{tab.label}</div>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 font-black relative z-10">
          
          {/* TAB 1: RENKLER */}
          {activeTab === 'COLORS' && (
            <div className="space-y-6">
              <div className={`p-4 rounded-3xl border-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
                <label className="text-xs text-amber-500 uppercase tracking-wider block mb-3 font-black">
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
                    <span className={`text-xs font-mono uppercase block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>SEÇİLEN HEX KODU:</span>
                    <div className="text-sm font-mono tracking-wider font-black">{pickerHex}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCustomColorApply(pickerHex)}
                    className="px-5 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs shadow-md cursor-pointer font-black"
                  >
                    Rengi Uygula
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs text-amber-500 uppercase tracking-wider block font-black">⭐ TEMEL VE ANA RENKLER</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BASIC_PRIMARY_COLORS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setActiveColor && setActiveColor(c.key)}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 cursor-pointer transition-all ${
                        activeColor === c.key && !customHexColor
                          ? 'border-amber-400 bg-amber-400/20 text-slate-950 dark:text-white font-black'
                          : isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-950'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full ${c.bg} shrink-0 shadow-xs`}></span>
                      <span className="text-xs truncate font-black">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs text-amber-500 uppercase tracking-wider block font-black">🌈 GENİŞLETİLMİŞ RENK PALETİ</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                  {EXTENDED_PALETTES.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setActiveColor && setActiveColor(c.key)}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 cursor-pointer transition-all ${
                        activeColor === c.key && !customHexColor
                          ? 'border-amber-400 bg-amber-400/20 text-slate-950 dark:text-white font-black'
                          : isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-950'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full ${c.bg} shrink-0 shadow-xs`}></span>
                      <span className="text-xs truncate font-black">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: YAZI TİPİ VE KOYULUK */}
          {activeTab === 'FONTS' && (
            <div className="space-y-6">
              <div className={`p-4 rounded-3xl border-2 space-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
                <label className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider block font-black">
                  🔤 MODERN FONT KATALOĞU (AŞAĞI AÇILIR MENÜ)
                </label>
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className={`w-full p-4 rounded-2xl border-2 text-sm font-black transition-all cursor-pointer outline-none ${
                    isDarkMode 
                      ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500' 
                      : 'bg-white border-slate-400 text-slate-950 focus:border-blue-700'
                  }`}
                  style={{ fontFamily: currentFontStyle.fontFamily }}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option 
                      key={f.key} 
                      value={f.key}
                      className={isDarkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-950'}
                      style={{ fontFamily: f.fontFamily, fontWeight: '700' }}
                    >
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs text-amber-500 uppercase tracking-wider block font-black">💪 YAZI KOYULUĞU SEVİYESİ</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {FONT_WEIGHTS.map((w) => {
                    const isSelected = tableSettings?.fontWeight === w.key;
                    return (
                      <button
                        key={w.key}
                        type="button"
                        onClick={() => setTableSettings({ fontWeight: w.key })}
                        className={`p-3.5 rounded-2xl border-2 text-center cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-600 font-black shadow-md scale-[1.02]'
                            : isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-950'
                        }`}
                      >
                        <span style={{ fontWeight: w.fontWeight }}>{w.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs text-amber-500 uppercase tracking-wider block font-black">↕ SATIR YÜKSEKLİĞİ VE BOŞLUĞU</label>
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
                      className={`p-3 rounded-2xl border-2 text-center uppercase cursor-pointer ${
                        tableSettings?.rowPadding === mode.key
                          ? 'bg-blue-700 text-white border-blue-800 font-black'
                          : isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-950'
                      }`}
                      style={{ fontWeight: currentFontWeight }}
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
              <div className="space-y-2.5">
                <label className="text-xs text-amber-500 uppercase tracking-wider block font-black">📐 TABLO IZGARA DÜZENİ</label>
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
                      className={`p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                        tableSettings?.gridStyle === g.key
                          ? 'bg-blue-700 text-white border-blue-800 font-black shadow-md'
                          : isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-950'
                      }`}
                      style={{ fontWeight: currentFontWeight }}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs text-amber-500 uppercase tracking-wider block font-black">✏️ ÇİZGİ BELİRGİNLİĞİ</label>
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
                      className={`p-3 rounded-2xl border-2 text-center cursor-pointer transition-all ${
                        tableSettings?.borderOpacity === b.key
                          ? 'bg-amber-500 text-slate-950 border-amber-600 font-black shadow-md'
                          : isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-950'
                      }`}
                      style={{ fontWeight: currentFontWeight }}
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
              <label className="text-xs text-amber-500 uppercase tracking-wider block font-black">👁️ SÜTUN GÖRÜNÜRLÜĞÜ</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'showRowNumbers', label: 'Sıra No (#)' },
                  { key: 'showClinic', label: 'Birim / Poliklinik' },
                  { key: 'showDoctorName', label: 'Doktor Adı Soyadı' },
                  { key: 'showPhone', label: 'Telefon No' },
                  { key: 'showRoomNo', label: 'Oda No' },
                  { key: 'showStatus', label: 'Durum Bilgisi' }
                ].map((col) => {
                  const isVisible = tableSettings?.[col.key] !== false;
                  return (
                    <button
                      key={col.key}
                      type="button"
                      onClick={() => setTableSettings({ [col.key]: !isVisible })}
                      className={`p-4 rounded-2xl border-2 text-xs flex items-center justify-between cursor-pointer transition-all ${
                        isVisible
                          ? 'bg-blue-700 text-white border-blue-800 font-black shadow-md'
                          : isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'
                      }`}
                      style={{ fontWeight: currentFontWeight }}
                    >
                      <span>{col.label}</span>
                      <span>{isVisible ? '✓ Açık' : '✕ Kapalı'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className={`p-4 border-t-2 shrink-0 z-30 ${isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-100'}`}>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl text-xs shadow-xl cursor-pointer uppercase tracking-wide transition-all font-black"
          >
            TÜM AYARLARI UYGULA VE KAPAT 🚀
          </button>
        </div>

      </div>
    </div>
  );
}