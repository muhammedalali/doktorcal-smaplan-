'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const TableSettingsContext = createContext(null);

export function TableSettingsProvider({ children }) {
  const [tableSettings, setTableSettingsState] = useState({
    showClinic: true,
    showDoctorName: true,
    showStatus: true,
    gridStyle: 'full',      // 'none' | 'horizontal' | 'vertical' | 'full'
    borderOpacity: 'medium', // 'light' | 'medium' | 'strong'
    rowPadding: 'normal',   // 'compact' | 'normal' | 'spacious'
    fontWeight: 'font-bold' // 'font-normal' | 'font-medium' | 'font-bold' | 'font-black'
  });

  const [selectedFont, setSelectedFontState] = useState('font-sans');
  const [activeColor, setActiveColorState] = useState('text-slate-900 dark:text-slate-100');
  const [customHexColor, setCustomHexColorState] = useState('');

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('app_table_custom_settings');
      if (savedSettings) setTableSettingsState(JSON.parse(savedSettings));

      const savedFont = localStorage.getItem('app_table_font');
      if (savedFont) setSelectedFontState(savedFont);

      const savedColor = localStorage.getItem('app_table_color');
      if (savedColor) setActiveColorState(savedColor);

      const savedCustomColor = localStorage.getItem('app_table_custom_hex');
      if (savedCustomColor) setCustomHexColorState(savedCustomColor);
    } catch (e) {
      console.error('Error loading settings from localStorage', e);
    }
  }, []);

  const setTableSettings = (newSettings) => {
    setTableSettingsState((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('app_table_custom_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const setSelectedFont = (fontKey) => {
    setSelectedFontState(fontKey);
    localStorage.setItem('app_table_font', fontKey);
  };

  const setActiveColor = (colorKey, customHex = '') => {
    setActiveColorState(colorKey);
    setCustomHexColorState(customHex);
    localStorage.setItem('app_table_color', colorKey);
    if (customHex) {
      localStorage.setItem('app_table_custom_hex', customHex);
    } else {
      localStorage.removeItem('app_table_custom_hex');
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
        customHexColor
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
        gridStyle: 'full',
        borderOpacity: 'medium',
        rowPadding: 'normal',
        fontWeight: 'font-bold'
      },
      setTableSettings: () => {},
      selectedFont: 'font-sans',
      setSelectedFont: () => {},
      activeColor: 'text-slate-900 dark:text-slate-100',
      setActiveColor: () => {},
      customHexColor: ''
    };
  }
  return context;
};