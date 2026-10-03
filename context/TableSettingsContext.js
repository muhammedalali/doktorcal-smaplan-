'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const TableSettingsContext = createContext(null);

export function TableSettingsProvider({ children }) {
  const [tableSettings, setTableSettingsState] = useState({
    showClinic: true,
    showDoctorName: true,
    showStatus: true,
    showPhone: true,
    showRoomNo: true,
    gridStyle: 'full',
    borderOpacity: 'strong',
    rowPadding: 'normal',
    fontWeight: 'font-black' // Ekstra Kalın
  });

  const [selectedFont, setSelectedFontState] = useState('font-inter');
  const [activeColor, setActiveColorState] = useState('text-slate-950 dark:text-white');
  const [customHexColor, setCustomHexColorState] = useState('');

  // 🔤 تحويل خيارات الخطوط إلى عائلات خطوط حقيقية
  const getFontStyles = (fontKey) => {
    switch (fontKey) {
      case 'font-inter': return { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" };
      case 'font-roboto': return { fontFamily: "'Roboto', sans-serif" };
      case 'font-poppins': return { fontFamily: "'Poppins', sans-serif" };
      case 'font-montserrat': return { fontFamily: "'Montserrat', sans-serif" };
      case 'font-opensans': return { fontFamily: "'Open Sans', sans-serif" };
      case 'font-lato': return { fontFamily: "'Lato', sans-serif" };
      case 'font-raleway': return { fontFamily: "'Raleway', sans-serif" };
      case 'font-rubik': return { fontFamily: "'Rubik', sans-serif" };
      case 'font-oswald': return { fontFamily: "'Oswald', sans-serif" };
      case 'font-rounded': return { fontFamily: "'Nunito', sans-serif" };
      case 'font-condensed': return { fontFamily: "'Roboto Condensed', sans-serif", letterSpacing: '-0.02em' };
      case 'font-serif': return { fontFamily: "'Playfair Display', serif" };
      case 'font-mono': return { fontFamily: "'Fira Code', monospace" };
      default: return { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" };
    }
  };

  // 💪 تحديد درجة وزن الخط بقيم صريحة وعريضة جداً
  const getFontWeightStyle = (weightKey) => {
    switch (weightKey) {
      case 'font-normal': return '500';
      case 'font-medium': return '700';
      case 'font-bold': return '800';
      case 'font-black': return '900'; // Ekstra Kalın
      default: return '900';
    }
  };

  // 🔄 استدعاء جميع الخطوط بجميع أوزانها الحقيقية
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700;900&family=Inter:wght@400;700;900&family=Lato:wght@400;700;900&family=Montserrat:wght@400;700;900&family=Nunito:wght@400;700;900&family=Open+Sans:wght@400;700;800&family=Oswald:wght@500;700&family=Playfair+Display:wght@400;700;900&family=Poppins:wght@400;700;900&family=Raleway:wght@400;700;900&family=Roboto+Condensed:wght@400;700;900&family=Roboto:wght@400;700;900&family=Rubik:wght@400;700;900&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    try {
      const savedSettings = localStorage.getItem('app_table_custom_settings');
      if (savedSettings) setTableSettingsState((prev) => ({ ...prev, ...JSON.parse(savedSettings) }));

      const savedFont = localStorage.getItem('app_table_font');
      if (savedFont) setSelectedFontState(savedFont);

      const savedColor = localStorage.getItem('app_table_color');
      if (savedColor) setActiveColorState(savedColor);

      const savedCustomColor = localStorage.getItem('app_table_custom_hex');
      if (savedCustomColor) setCustomHexColorState(savedCustomColor);
    } catch (e) {
      console.error('LocalStorage load error:', e);
    }
  }, []);

  // ⚡ المحرك الشامل المحدث - تم اصلاح عزل ألوان وتأثيرات التمرير الهيدر والأزرار
  useEffect(() => {
    try {
      const fontObj = getFontStyles(selectedFont);
      const weightVal = getFontWeightStyle(tableSettings.fontWeight);

      document.documentElement.style.setProperty('--global-table-font', fontObj.fontFamily);
      document.documentElement.style.setProperty('--global-table-weight', weightVal);

      let styleTag = document.getElementById('dynamic-table-font-style');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'dynamic-table-font-style';
        document.head.appendChild(styleTag);
      }

      const isEkstraKalin = tableSettings.fontWeight === 'font-black';

      styleTag.innerHTML = `
        /* 🚀 تطبيق الخط والوزن على عناصر الجدول فقط بدون المودال أو الهيدر الثابت */
        table, table td, table tr, table span, table div, table a,
        .table-header, .table-title {
          font-family: var(--global-table-font) !important;
          font-weight: var(--global-table-weight) !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
          text-rendering: optimizeLegibility !important;
        }

        /* 👑 تغميق عناوين الجدول بدون التأثير على خلفية أزرار النافذة */
        table th, thead tr, thead th {
          font-family: var(--global-table-font) !important;
          font-weight: ${isEkstraKalin ? '900' : '800'} !important;
          letter-spacing: 0.02em !important;
          -webkit-font-smoothing: antialiased !important;
        }

        /* ✨ عند اختيار Ekstra Kalın: تغميق نصوص الجدول فقط */
        ${isEkstraKalin ? `
          table td, table td span, table td div {
            font-weight: 900 !important;
            letter-spacing: 0.01em !important;
          }
        ` : ''}

        /* 🛡️ حماية تامة لأزرار التحكم في المودال لمنع باهتية أو تغير الألوان أثناء السكرول */
        button[title="Kapat"], 
        button[title="Tam Ekran Yap"], 
        button[title="Eski Boyuta Getir"], 
        button[title="Simge Durumuna Küçült"] {
          font-weight: 900 !important;
          opacity: 1 !important;
          backdrop-filter: none !important;
          -webkit-text-stroke: 0px transparent !important;
          text-shadow: none !important;
        }

        /* 🔒 حماية الخلفيات المصمتة والمعتمة للهيدر وأزرار التمرير */
        .z-30, .z-50, .fixed, .sticky {
          isolation: isolate;
        }
      `;
    } catch (e) {
      console.error('Global styling apply error:', e);
    }
  }, [selectedFont, tableSettings.fontWeight]);

  const setTableSettings = (newSettings) => {
    setTableSettingsState((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('app_table_custom_settings', JSON.stringify(updated));
      } catch (e) {
        console.error('LocalStorage save error:', e);
      }
      return updated;
    });
  };

  const setSelectedFont = (fontKey) => {
    setSelectedFontState(fontKey);
    try {
      localStorage.setItem('app_table_font', fontKey);
    } catch (e) {
      console.error('LocalStorage font save error:', e);
    }
  };

  const setActiveColor = (colorKey, customHex = '') => {
    if (colorKey === 'CUSTOM_HEX') {
      setActiveColorState('CUSTOM_HEX');
      setCustomHexColorState(customHex);
      try {
        localStorage.setItem('app_table_color', 'CUSTOM_HEX');
        localStorage.setItem('app_table_custom_hex', customHex);
      } catch (e) {
        console.error('LocalStorage hex save error:', e);
      }
    } else {
      setActiveColorState(colorKey);
      setCustomHexColorState('');
      try {
        localStorage.setItem('app_table_color', colorKey);
        localStorage.removeItem('app_table_custom_hex');
      } catch (e) {
        console.error('LocalStorage color save error:', e);
      }
    }
  };

  return (
    <TableSettingsContext.Provider
      value={{
        tableSettings,
        setTableSettings,
        selectedFont,
        setSelectedFont,
        activeColor,
        setActiveColor,
        customHexColor,
        getFontStyles,
        getFontWeightStyle
      }}
    >
      {children}
    </TableSettingsContext.Provider>
  );
}

export const useTableSettings = () => {
  const context = useContext(TableSettingsContext);
  if (!context) {
    return {
      tableSettings: {
        showClinic: true,
        showDoctorName: true,
        showStatus: true,
        showPhone: true,
        showRoomNo: true,
        gridStyle: 'full',
        borderOpacity: 'strong',
        rowPadding: 'normal',
        fontWeight: 'font-black'
      },
      setTableSettings: () => {},
      selectedFont: 'font-inter',
      setSelectedFont: () => {},
      activeColor: 'text-slate-950 dark:text-white',
      setActiveColor: () => {},
      customHexColor: '',
      getFontStyles: () => ({ fontFamily: "'Inter', sans-serif" }),
      getFontWeightStyle: () => '900'
    };
  }
  return context;
};