'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';
import {
  X, Copy, History, Delete, Check, CornerDownLeft, Volume2, VolumeX,
  Calculator as CalcIcon, FlaskConical, Ruler, Binary, Sparkles,
} from 'lucide-react';

/* ============ 🎨 PREMIUM THEMES ============ */
const THEMES: Record<string, any> = {
  auto: { name: 'Otomatik', emoji: '🌓', preview: 'linear-gradient(135deg,#64748b,#1e293b)', isAuto: true },
  aurora: {
    name: 'Kuzey Işıkları', emoji: '🌌', preview: 'linear-gradient(135deg,#06b6d4,#10b981,#8b5cf6)',
    bg: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 45%,#0c4a6e 100%)',
    displayBg: 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(6,182,212,0.15))',
    displayText: '#a7f3d0', displayExpr: 'rgba(110,231,183,0.65)',
    keyBg: 'rgba(255,255,255,0.06)', keyText: '#f1f5f9',
    opBg: 'rgba(16,185,129,0.22)', opText: '#6ee7b7',
    fnBg: 'rgba(6,182,212,0.12)', fnText: '#67e8f9',
    eqBg: 'linear-gradient(135deg,#10b981,#06b6d4)', eqText: '#fff',
    clearBg: 'rgba(244,63,94,0.18)', clearText: '#fda4af',
    border: 'rgba(16,185,129,0.25)', accent: '#34d399',
    glow: '0 25px 50px -12px rgba(16,185,129,0.4)', headerBg: 'rgba(255,255,255,0.04)',
  },
  gold: {
    name: 'Kraliyet Altını', emoji: '👑', preview: 'linear-gradient(135deg,#fbbf24,#92400e)',
    bg: 'linear-gradient(135deg,#0a0a0a 0%,#1c1917 55%,#0c0a09 100%)',
    displayBg: 'linear-gradient(135deg,rgba(251,191,36,0.1),rgba(180,83,9,0.1))',
    displayText: '#fcd34d', displayExpr: 'rgba(251,191,36,0.7)',
    keyBg: 'rgba(251,191,36,0.05)', keyText: '#fef3c7',
    opBg: 'rgba(251,191,36,0.18)', opText: '#fcd34d',
    fnBg: 'rgba(251,191,36,0.06)', fnText: '#fbbf24',
    eqBg: 'linear-gradient(135deg,#fbbf24,#b45309)', eqText: '#0a0a0a',
    clearBg: 'rgba(239,68,68,0.15)', clearText: '#fca5a5',
    border: 'rgba(251,191,36,0.15)', accent: '#fbbf24',
    glow: '0 25px 50px -12px rgba(251,191,36,0.35)', headerBg: 'rgba(251,191,36,0.03)',
  },
  cyber: {
    name: 'Siber Neon', emoji: '🌃', preview: 'linear-gradient(135deg,#ec4899,#8b5cf6,#06b6d4)',
    bg: 'linear-gradient(135deg,#0a0014 0%,#1a0033 50%,#000a1a 100%)',
    displayBg: 'linear-gradient(135deg,rgba(236,72,153,0.15),rgba(139,92,246,0.15))',
    displayText: '#f0abfc', displayExpr: 'rgba(236,72,153,0.7)',
    keyBg: 'rgba(139,92,246,0.08)', keyText: '#f5d0fe',
    opBg: 'rgba(236,72,153,0.2)', opText: '#f0abfc',
    fnBg: 'rgba(6,182,212,0.12)', fnText: '#67e8f9',
    eqBg: 'linear-gradient(135deg,#ec4899,#8b5cf6)', eqText: '#fff',
    clearBg: 'rgba(239,68,68,0.18)', clearText: '#fca5a5',
    border: 'rgba(236,72,153,0.25)', accent: '#f0abfc',
    glow: '0 25px 50px -12px rgba(236,72,153,0.4)', headerBg: 'rgba(139,92,246,0.05)',
  },
  crystal: {
    name: 'Kristal Cam', emoji: '🔮', preview: 'linear-gradient(135deg,#e0f2fe,#a5b4fc,#f0abfc)',
    bg: 'linear-gradient(135deg,#f0f9ff 0%,#e0e7ff 50%,#fdf4ff 100%)',
    displayBg: 'linear-gradient(135deg,rgba(255,255,255,0.7),rgba(224,242,254,0.5))',
    displayText: '#1e3a8a', displayExpr: 'rgba(30,58,138,0.55)',
    keyBg: 'rgba(255,255,255,0.75)', keyText: '#1e293b',
    opBg: 'rgba(99,102,241,0.15)', opText: '#4f46e5',
    fnBg: 'rgba(165,180,252,0.2)', fnText: '#4338ca',
    eqBg: 'linear-gradient(135deg,#818cf8,#c084fc)', eqText: '#fff',
    clearBg: 'rgba(244,63,94,0.12)', clearText: '#e11d48',
    border: 'rgba(99,102,241,0.2)', accent: '#6366f1',
    glow: '0 25px 50px -12px rgba(99,102,241,0.3)', headerBg: 'rgba(255,255,255,0.6)',
  },
  sakura: {
    name: 'Sakura', emoji: '🌸', preview: 'linear-gradient(135deg,#fda4af,#f9a8d4,#fecdd3)',
    bg: 'linear-gradient(135deg,#fdf2f8 0%,#fce7f3 50%,#fef2f2 100%)',
    displayBg: 'linear-gradient(135deg,rgba(252,231,243,0.6),rgba(254,205,211,0.4))',
    displayText: '#9f1239', displayExpr: 'rgba(159,18,57,0.6)',
    keyBg: 'rgba(255,255,255,0.8)', keyText: '#831843',
    opBg: 'rgba(244,114,182,0.2)', opText: '#be185d',
    fnBg: 'rgba(253,164,175,0.2)', fnText: '#9f1239',
    eqBg: 'linear-gradient(135deg,#f472b6,#fb7185)', eqText: '#fff',
    clearBg: 'rgba(225,29,72,0.12)', clearText: '#9f1239',
    border: 'rgba(244,114,182,0.25)', accent: '#ec4899',
    glow: '0 25px 50px -12px rgba(244,114,182,0.35)', headerBg: 'rgba(255,255,255,0.55)',
  },
  ocean: {
    name: 'Derin Okyanus', emoji: '🌊', preview: 'linear-gradient(135deg,#0ea5e9,#1e3a8a,#0f172a)',
    bg: 'linear-gradient(135deg,#020617 0%,#0c1445 45%,#082f49 100%)',
    displayBg: 'linear-gradient(135deg,rgba(14,165,233,0.15),rgba(59,130,246,0.15))',
    displayText: '#bae6fd', displayExpr: 'rgba(125,211,252,0.65)',
    keyBg: 'rgba(255,255,255,0.05)', keyText: '#e0f2fe',
    opBg: 'rgba(14,165,233,0.22)', opText: '#7dd3fc',
    fnBg: 'rgba(59,130,246,0.15)', fnText: '#93c5fd',
    eqBg: 'linear-gradient(135deg,#0ea5e9,#3b82f6)', eqText: '#fff',
    clearBg: 'rgba(244,63,94,0.18)', clearText: '#fda4af',
    border: 'rgba(14,165,233,0.25)', accent: '#38bdf8',
    glow: '0 25px 50px -12px rgba(14,165,233,0.4)', headerBg: 'rgba(255,255,255,0.04)',
  },
  sunset: {
    name: 'Gün Batımı', emoji: '🔥', preview: 'linear-gradient(135deg,#f97316,#f43f5e,#7c2d12)',
    bg: 'linear-gradient(135deg,#1c1917 0%,#7c2d12 45%,#450a0a 100%)',
    displayBg: 'linear-gradient(135deg,rgba(249,115,22,0.18),rgba(244,63,94,0.18))',
    displayText: '#fed7aa', displayExpr: 'rgba(253,186,116,0.7)',
    keyBg: 'rgba(251,146,60,0.06)', keyText: '#ffedd5',
    opBg: 'rgba(249,115,22,0.24)', opText: '#fdba74',
    fnBg: 'rgba(244,63,94,0.15)', fnText: '#fda4af',
    eqBg: 'linear-gradient(135deg,#f97316,#f43f5e)', eqText: '#fff',
    clearBg: 'rgba(239,68,68,0.2)', clearText: '#fecaca',
    border: 'rgba(249,115,22,0.25)', accent: '#fb923c',
    glow: '0 25px 50px -12px rgba(249,115,22,0.4)', headerBg: 'rgba(249,115,22,0.04)',
  },
  noir: {
    name: 'Gece Noir', emoji: '🖤', preview: 'linear-gradient(135deg,#525252,#171717)',
    bg: 'linear-gradient(135deg,#000000 0%,#0a0a0a 50%,#000000 100%)',
    displayBg: 'linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))',
    displayText: '#e5e5e5', displayExpr: 'rgba(163,163,163,0.7)',
    keyBg: 'rgba(255,255,255,0.04)', keyText: '#e5e5e5',
    opBg: 'rgba(255,255,255,0.08)', opText: '#a3a3a3',
    fnBg: 'rgba(255,255,255,0.03)', fnText: '#737373',
    eqBg: 'linear-gradient(135deg,#e5e5e5,#a3a3a3)', eqText: '#000000',
    clearBg: 'rgba(239,68,68,0.12)', clearText: '#f87171',
    border: 'rgba(255,255,255,0.1)', accent: '#e5e5e5',
    glow: '0 25px 50px -12px rgba(255,255,255,0.15)', headerBg: 'rgba(255,255,255,0.02)',
  },
};

const AUTO_LIGHT: any = {
  bg: 'linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%)',
  displayBg: 'linear-gradient(135deg,rgba(255,255,255,0.9),rgba(241,245,249,0.7))',
  displayText: '#0f172a', displayExpr: 'rgba(15,23,42,0.55)',
  keyBg: 'rgba(255,255,255,0.9)', keyText: '#0f172a',
  opBg: 'rgba(14,165,233,0.12)', opText: '#0284c7',
  fnBg: 'rgba(148,163,184,0.12)', fnText: '#475569',
  eqBg: 'linear-gradient(135deg,#0ea5e9,#0284c7)', eqText: '#fff',
  clearBg: 'rgba(244,63,94,0.1)', clearText: '#e11d48',
  border: 'rgba(15,23,42,0.1)', accent: '#0ea5e9',
  glow: '0 25px 50px -12px rgba(14,165,233,0.25)', headerBg: 'rgba(255,255,255,0.8)',
};

const AUTO_DARK: any = {
  bg: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)',
  displayBg: 'linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))',
  displayText: '#f1f5f9', displayExpr: 'rgba(203,213,225,0.6)',
  keyBg: 'rgba(255,255,255,0.06)', keyText: '#f1f5f9',
  opBg: 'rgba(56,189,248,0.2)', opText: '#7dd3fc',
  fnBg: 'rgba(148,163,184,0.1)', fnText: '#94a3b8',
  eqBg: 'linear-gradient(135deg,#0ea5e9,#0284c7)', eqText: '#fff',
  clearBg: 'rgba(244,63,94,0.15)', clearText: '#fda4af',
  border: 'rgba(255,255,255,0.1)', accent: '#38bdf8',
  glow: '0 25px 50px -12px rgba(56,189,248,0.35)', headerBg: 'rgba(255,255,255,0.03)',
};

/* ============ 📏 CONVERTER DATA ============ */
const CONVERTERS: Record<string, { label: string; units: Record<string, { label: string; factor: number }> }> = {
  length: {
    label: 'Uzunluk',
    units: {
      m: { label: 'Metre (m)', factor: 1 }, km: { label: 'Kilometre (km)', factor: 1000 },
      cm: { label: 'Santimetre (cm)', factor: 0.01 }, mm: { label: 'Milimetre (mm)', factor: 0.001 },
      mi: { label: 'Mil (mi)', factor: 1609.344 }, yd: { label: 'Yarda (yd)', factor: 0.9144 },
      ft: { label: 'Fit (ft)', factor: 0.3048 }, in: { label: 'İnç (in)', factor: 0.0254 },
    },
  },
  weight: {
    label: 'Ağırlık',
    units: {
      kg: { label: 'Kilogram (kg)', factor: 1 }, g: { label: 'Gram (g)', factor: 0.001 },
      mg: { label: 'Miligram (mg)', factor: 0.000001 }, ton: { label: 'Ton', factor: 1000 },
      lb: { label: 'Pound (lb)', factor: 0.45359237 }, oz: { label: 'Ons (oz)', factor: 0.028349523 },
    },
  },
  temperature: {
    label: 'Sıcaklık',
    units: {
      C: { label: 'Celsius (°C)', factor: 1 },
      F: { label: 'Fahrenheit (°F)', factor: 1 },
      K: { label: 'Kelvin (K)', factor: 1 },
    },
  },
  currency: {
    label: 'Döviz (≈)',
    units: {
      TRY: { label: 'Türk Lirası (₺)', factor: 1 }, USD: { label: 'Dolar ($)', factor: 34.5 },
      EUR: { label: 'Euro (€)', factor: 37.2 }, GBP: { label: 'Sterlin (£)', factor: 43.8 },
      SAR: { label: 'Riyal (﷼)', factor: 9.2 },
    },
  },
};

const fmt = (v: number): string => {
  if (isNaN(v)) return 'Hata';
  if (!isFinite(v)) return v > 0 ? '∞' : '-∞';
  if (Math.abs(v) >= 1e15 || (Math.abs(v) < 1e-9 && v !== 0)) return v.toExponential(6);
  return String(Math.round(v * 1e10) / 1e10);
};

const convertTemperature = (v: number, from: string, to: string): number => {
  const c = from === 'C' ? v : from === 'F' ? ((v - 32) * 5) / 9 : v - 273.15;
  return to === 'C' ? c : to === 'F' ? (c * 9) / 5 + 32 : c + 273.15;
};

const playClick = () => {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 900;
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.start(); osc.stop(ctx.currentTime + 0.04);
  } catch {}
};

export default function CalculatorModal({ onClose }: { onClose: () => void }) {
  const { isDarkMode } = useTheme();
  const [theme, setTheme] = useState<string>('auto');
  const [mode, setMode] = useState<'standard' | 'scientific' | 'converter' | 'programmer'>('standard');
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [memory, setMemory] = useState(0);
  const [hasMemory, setHasMemory] = useState(false);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [copied, setCopied] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [showThemes, setShowThemes] = useState(false);

  // ✅ Converter state — القيم الافتراضية مبنية على وحدات 'length' الفعلية
  const [convCat, setConvCat] = useState<keyof typeof CONVERTERS>('length');
  const [convFrom, setConvFrom] = useState('m');
  const [convTo, setConvTo] = useState('km');
  const [convValue, setConvValue] = useState('1');

  const t = theme === 'auto' ? (isDarkMode ? AUTO_DARK : AUTO_LIGHT) : THEMES[theme];

  // Persist
  useEffect(() => {
    const s = localStorage.getItem('calc_theme');
    if (s && (THEMES[s] || s === 'auto')) setTheme(s);
    const h = localStorage.getItem('calc_history');
    if (h) { try { setHistory(JSON.parse(h)); } catch {} }
    const snd = localStorage.getItem('calc_sound');
    if (snd !== null) setSoundOn(snd === 'true');
  }, []);

  useEffect(() => { localStorage.setItem('calc_theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('calc_history', JSON.stringify(history.slice(0, 50))); }, [history]);
  useEffect(() => { localStorage.setItem('calc_sound', String(soundOn)); }, [soundOn]);

  // ✅ عند تغيير الفئة — استبدل الوحدات فقط إذا كانت غير صالحة
  useEffect(() => {
    const units = CONVERTERS[convCat].units;
    const keys = Object.keys(units);
    setConvFrom((prev) => (units[prev] ? prev : keys[0]));
    setConvTo((prev) => (units[prev] ? prev : (keys[1] || keys[0])));
  }, [convCat]);

  const click = useCallback(() => { if (soundOn) playClick(); }, [soundOn]);
  const flash = (k: string) => { setPressedKey(k); setTimeout(() => setPressedKey(null), 120); };

  /* ---- Input handlers ---- */
  const inputDigit = (d: string) => {
    click(); flash(d);
    if (waitingForOperand) { setDisplay(d); setWaitingForOperand(false); return; }
    if (display === '0') setDisplay(d);
    else if (display.length < 18) setDisplay(display + d);
  };
  const inputDot = () => {
    click(); flash('.');
    if (waitingForOperand) { setDisplay('0.'); setWaitingForOperand(false); return; }
    if (!display.includes('.')) setDisplay(display + '.');
  };
  const clearAll = () => {
    click(); flash('AC');
    setDisplay('0'); setExpression(''); setPrevValue(null); setOperator(null); setWaitingForOperand(false);
  };
  const backspace = () => {
    click(); flash('⌫');
    if (waitingForOperand) return;
    setDisplay((p) => (p.length <= 1 || (p.length === 2 && p.startsWith('-')) ? '0' : p.slice(0, -1)));
  };

  const calc = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? NaN : a / b;
      case '^': return Math.pow(a, b);
      default: return b;
    }
  };

  const performOp = (op: string) => {
    click(); flash(op);
    const v = parseFloat(display); if (isNaN(v)) return;
    if (prevValue === null) { setPrevValue(v); setExpression(`${display} ${op}`); }
    else if (operator) {
      const r = calc(prevValue, v, operator);
      setPrevValue(r); setDisplay(fmt(r)); setExpression(`${fmt(r)} ${op}`);
    }
    setWaitingForOperand(true); setOperator(op);
  };

  const equals = () => {
    click(); flash('=');
    if (operator === null || prevValue === null) return;
    const v = parseFloat(display); if (isNaN(v)) return;
    const r = calc(prevValue, v, operator);
    const expr = `${fmt(prevValue)} ${operator} ${fmt(v)}`;
    const res = fmt(r);
    setHistory((h) => [{ expr, result: res }, ...h].slice(0, 50));
    setExpression(`${expr} =`);
    setDisplay(res);
    setPrevValue(null); setOperator(null); setWaitingForOperand(true);
  };

  const unary = (fn: string) => {
    click(); flash(fn);
    const v = parseFloat(display); if (isNaN(v)) return;
    const rad = angleMode === 'deg' ? (v * Math.PI) / 180 : v;
    let r = v;
    switch (fn) {
      case 'sqrt': r = Math.sqrt(v); break;
      case 'sqr': r = v * v; break;
      case 'inv': r = 1 / v; break;
      case 'neg': r = -v; break;
      case 'sin': r = Math.sin(rad); break;
      case 'cos': r = Math.cos(rad); break;
      case 'tan': r = Math.tan(rad); break;
      case 'log': r = Math.log10(v); break;
      case 'ln': r = Math.log(v); break;
      case 'abs': r = Math.abs(v); break;
      case 'fact': {
        if (v < 0 || !Number.isInteger(v) || v > 170) { r = NaN; }
        else { let x = 1; for (let i = 2; i <= v; i++) x *= i; r = x; }
        break;
      }
    }
    setDisplay(fmt(r)); setWaitingForOperand(true);
  };

  const memOp = (op: string) => {
    click(); flash(op);
    const v = parseFloat(display) || 0;
    if (op === 'MC') { setMemory(0); setHasMemory(false); }
    else if (op === 'MR') { if (hasMemory) { setDisplay(fmt(memory)); setWaitingForOperand(true); } }
    else if (op === 'M+') { setMemory(memory + v); setHasMemory(true); }
    else if (op === 'M-') { setMemory(memory - v); setHasMemory(true); }
    else if (op === 'MS') { setMemory(v); setHasMemory(true); }
  };

  const copyResult = async () => {
    try { await navigator.clipboard.writeText(display); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  /* ---- Keyboard ---- */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
      else if (e.key === '.') inputDot();
      else if (e.key === '+') performOp('+');
      else if (e.key === '-') performOp('−');
      else if (e.key === '*') performOp('×');
      else if (e.key === '/') { e.preventDefault(); performOp('÷'); }
      else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); equals(); }
      else if (e.key === 'Escape') clearAll();
      else if (e.key === 'Backspace') { e.preventDefault(); backspace(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  /* ---- ✅ Converter calculation (defensive) ---- */
  const convertResult = (() => {
    const v = parseFloat(convValue) || 0;
    const units = CONVERTERS[convCat].units;
    const keys = Object.keys(units);

    // حماية: إذا لم تكن الوحدة موجودة في الفئة الجديدة، استخدم أول وحدة متاحة
    const safeFrom = units[convFrom] ? convFrom : keys[0];
    const safeTo = units[convTo] ? convTo : (keys[1] || keys[0]);

    if (convCat === 'temperature') {
      return fmt(convertTemperature(v, safeFrom, safeTo));
    }

    const from = units[safeFrom].factor;
    const to = units[safeTo].factor;
    return fmt((v * from) / to);
  })();

  /* ---- Button styles ---- */
  const btnStyle = (variant: 'num' | 'op' | 'fn' | 'eq' | 'clear'): React.CSSProperties => {
    const base: React.CSSProperties = { color: t.keyText, background: t.keyBg, border: `1px solid ${t.border}` };
    if (variant === 'op') return { ...base, color: t.opText, background: t.opBg };
    if (variant === 'fn') return { ...base, color: t.fnText, background: t.fnBg };
    if (variant === 'eq') return { ...base, color: t.eqText, background: t.eqBg, border: 'none' };
    if (variant === 'clear') return { ...base, color: t.clearText, background: t.clearBg };
    return base;
  };

  // Button sub-component — fills grid cell
  const Btn = ({ label, onClick, variant = 'num', span = 1, fontSize = 'text-base sm:text-lg' }: any) => (
    <button
      onClick={onClick}
      className={`h-full w-full min-h-0 rounded-lg sm:rounded-xl lg:rounded-2xl font-bold ${fontSize} select-none cursor-pointer active:scale-95 hover:brightness-125 transition-all flex items-center justify-center ${pressedKey === label ? 'ring-2 ring-white/40 scale-95' : ''}`}
      style={{ ...btnStyle(variant), gridColumn: span > 1 ? `span ${span}` : undefined }}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-3" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full h-[100dvh] sm:h-[96vh] sm:max-h-[96vh] max-w-6xl rounded-none sm:rounded-[1.75rem] border-0 sm:border shadow-2xl overflow-hidden flex flex-col"
        style={{ background: t.bg, borderColor: t.border, boxShadow: t.glow }}
      >
        {/* ═══ HEADER ═══ */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b shrink-0" style={{ borderColor: t.border, background: t.headerBg }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: t.eqBg }}>
              <CalcIcon className="w-4 h-4" style={{ color: t.eqText }} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black tracking-wide" style={{ color: t.displayText }}>Hesap Makinası</h3>
              <p className="text-[9px] sm:text-[10px] font-medium" style={{ color: t.displayExpr }}>{THEMES[theme]?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setSoundOn(!soundOn)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center cursor-pointer hover:brightness-125" style={{ background: t.fnBg, color: t.fnText }}>
              {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => setShowThemes(!showThemes)} className="h-7 sm:h-8 px-2 rounded-lg flex items-center gap-1 text-[10px] font-black cursor-pointer hover:brightness-125" style={{ background: showThemes ? t.opBg : t.fnBg, color: showThemes ? t.opText : t.fnText }}>
              <Sparkles className="w-3 h-3" /> TEMA
            </button>
            <button onClick={() => setShowHistory(!showHistory)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center cursor-pointer hover:brightness-125" style={{ background: showHistory ? t.opBg : t.fnBg, color: showHistory ? t.opText : t.fnText }}>
              <History className="w-3.5 h-3.5" />
            </button>
            <button onClick={onClose} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center cursor-pointer hover:brightness-125" style={{ background: t.clearBg, color: t.clearText }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ═══ THEME SELECTOR ═══ */}
        {showThemes && (
          <div className="px-3 sm:px-4 py-2 border-b shrink-0 overflow-x-auto" style={{ borderColor: t.border, background: t.headerBg }}>
            <div className="flex gap-2">
              {Object.entries(THEMES).map(([key, th]: any) => (
                <button key={key} onClick={() => { setTheme(key); click(); }} className={`flex-shrink-0 flex flex-col items-center gap-0.5 p-1 rounded-lg cursor-pointer transition-all ${theme === key ? 'scale-105' : 'hover:scale-105'}`} style={{ background: theme === key ? t.opBg : 'transparent' }} title={th.name}>
                  <div className="w-8 h-8 rounded-md shadow" style={{ background: th.preview, border: `2px solid ${theme === key ? t.accent : 'transparent'}` }} />
                  <span className="text-[8px] font-black whitespace-nowrap" style={{ color: theme === key ? t.accent : t.fnText }}>{th.emoji}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ MODE TABS ═══ */}
        <div className="flex gap-1 px-2 sm:px-3 pt-2 shrink-0">
          {[
            { id: 'standard', label: 'Standart', icon: CalcIcon },
            { id: 'scientific', label: 'Bilimsel', icon: FlaskConical },
            { id: 'converter', label: 'Dönüştürücü', icon: Ruler },
            { id: 'programmer', label: 'Programcı', icon: Binary },
          ].map((m) => (
            <button key={m.id} onClick={() => { setMode(m.id as any); click(); }} className="flex-1 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all" style={{ background: mode === m.id ? t.opBg : 'transparent', color: mode === m.id ? t.opText : t.fnText, border: `1px solid ${mode === m.id ? t.border : 'transparent'}` }}>
              <m.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>

        {/* ═══ DISPLAY ═══ */}
        <div className="mx-2 sm:mx-3 mt-2 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border shrink-0" style={{ background: t.displayBg, borderColor: t.border }}>
          <div className="flex justify-between items-center mb-0.5">
            <div className="flex items-center gap-1">
              {hasMemory && <span className="text-[8px] font-black px-1 py-0.5 rounded" style={{ background: t.opBg, color: t.opText }}>M</span>}
              {mode === 'scientific' && (
                <button onClick={() => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg')} className="text-[8px] font-black px-1 py-0.5 rounded cursor-pointer" style={{ background: t.opBg, color: t.opText }}>
                  {angleMode.toUpperCase()}
                </button>
              )}
            </div>
            <button onClick={copyResult} className="text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 cursor-pointer hover:brightness-125" style={{ color: copied ? t.accent : t.fnText }}>
              {copied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
              {copied ? 'OK' : 'Kopyala'}
            </button>
          </div>
          <div className="text-right truncate text-[10px] sm:text-xs font-mono h-3.5" style={{ color: t.displayExpr }} dir="ltr">{expression || '\u00A0'}</div>
          <div className="text-right font-black tabular-nums tracking-tight overflow-x-auto whitespace-nowrap leading-none" style={{ color: t.displayText, fontSize: display.length > 14 ? '1.4rem' : display.length > 9 ? '2rem' : '2.5rem', scrollbarWidth: 'none' }} dir="ltr">{display}</div>
        </div>

        {/* ═══ BODY ═══ */}
        <div className={`flex-1 min-h-0 flex ${showHistory ? 'flex-col lg:flex-row' : ''} gap-1.5 sm:gap-2 p-2 sm:p-3 pt-2`}>
          <div className={`flex-1 min-h-0 min-w-0 ${showHistory ? 'hidden lg:block' : ''}`}>

            {/* STANDARD MODE — 5 equal rows */}
            {mode === 'standard' && (
              <div className="grid grid-cols-4 grid-rows-5 gap-1 sm:gap-1.5 h-full min-h-[260px]">
                <Btn label="AC" onClick={clearAll} variant="clear" />
                <Btn label="⌫" onClick={backspace} variant="clear" />
                <Btn label="±" onClick={() => unary('neg')} variant="fn" />
                <Btn label="÷" onClick={() => performOp('÷')} variant="op" fontSize="text-xl" />

                <Btn label="7" onClick={() => inputDigit('7')} />
                <Btn label="8" onClick={() => inputDigit('8')} />
                <Btn label="9" onClick={() => inputDigit('9')} />
                <Btn label="×" onClick={() => performOp('×')} variant="op" fontSize="text-xl" />

                <Btn label="4" onClick={() => inputDigit('4')} />
                <Btn label="5" onClick={() => inputDigit('5')} />
                <Btn label="6" onClick={() => inputDigit('6')} />
                <Btn label="−" onClick={() => performOp('−')} variant="op" fontSize="text-xl" />

                <Btn label="1" onClick={() => inputDigit('1')} />
                <Btn label="2" onClick={() => inputDigit('2')} />
                <Btn label="3" onClick={() => inputDigit('3')} />
                <Btn label="+" onClick={() => performOp('+')} variant="op" fontSize="text-xl" />

                <Btn label="0" onClick={() => inputDigit('0')} span={2} />
                <Btn label="." onClick={inputDot} fontSize="text-xl" />
                <Btn label="=" onClick={equals} variant="eq" fontSize="text-2xl" />
              </div>
            )}

            {/* SCIENTIFIC MODE */}
            {mode === 'scientific' && (
              <div className="flex flex-col gap-1 sm:gap-1.5 h-full min-h-[320px]">
                <div className="grid grid-cols-5 gap-1 flex-[0.7] min-h-[28px]">
                  {['MC','MR','M+','M-','MS'].map((b) => (
                    <button key={b} onClick={() => memOp(b)} className="h-full rounded-md sm:rounded-lg text-[10px] font-black cursor-pointer active:scale-95 hover:brightness-125" style={btnStyle('fn')}>{b}</button>
                  ))}
                </div>
                <div className="grid grid-cols-6 gap-1 flex-[0.9] min-h-[32px]">
                  {[
                    { l: 'sin', f: () => unary('sin') }, { l: 'cos', f: () => unary('cos') }, { l: 'tan', f: () => unary('tan') },
                    { l: 'log', f: () => unary('log') }, { l: 'ln', f: () => unary('ln') }, { l: '|x|', f: () => unary('abs') },
                  ].map((b) => (
                    <button key={b.l} onClick={b.f} className="h-full rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-black cursor-pointer active:scale-95 hover:brightness-125" style={btnStyle('fn')}>{b.l}</button>
                  ))}
                </div>
                <div className="grid grid-cols-6 gap-1 flex-[0.9] min-h-[32px]">
                  {[
                    { l: '√', f: () => unary('sqrt') }, { l: 'x²', f: () => unary('sqr') }, { l: 'xʸ', f: () => performOp('^') },
                    { l: '1/x', f: () => unary('inv') }, { l: '!', f: () => unary('fact') }, { l: 'π', f: () => { setDisplay(String(Math.PI)); setWaitingForOperand(true); click(); } },
                  ].map((b) => (
                    <button key={b.l} onClick={b.f} className="h-full rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-black cursor-pointer active:scale-95 hover:brightness-125" style={btnStyle('fn')}>{b.l}</button>
                  ))}
                </div>
                <div className="grid grid-cols-4 grid-rows-5 gap-1 sm:gap-1.5 flex-[5] min-h-0">
                  <Btn label="AC" onClick={clearAll} variant="clear" />
                  <Btn label="⌫" onClick={backspace} variant="clear" />
                  <Btn label="±" onClick={() => unary('neg')} variant="fn" />
                  <Btn label="÷" onClick={() => performOp('÷')} variant="op" fontSize="text-xl" />
                  <Btn label="7" onClick={() => inputDigit('7')} />
                  <Btn label="8" onClick={() => inputDigit('8')} />
                  <Btn label="9" onClick={() => inputDigit('9')} />
                  <Btn label="×" onClick={() => performOp('×')} variant="op" fontSize="text-xl" />
                  <Btn label="4" onClick={() => inputDigit('4')} />
                  <Btn label="5" onClick={() => inputDigit('5')} />
                  <Btn label="6" onClick={() => inputDigit('6')} />
                  <Btn label="−" onClick={() => performOp('−')} variant="op" fontSize="text-xl" />
                  <Btn label="1" onClick={() => inputDigit('1')} />
                  <Btn label="2" onClick={() => inputDigit('2')} />
                  <Btn label="3" onClick={() => inputDigit('3')} />
                  <Btn label="+" onClick={() => performOp('+')} variant="op" fontSize="text-xl" />
                  <Btn label="0" onClick={() => inputDigit('0')} span={2} />
                  <Btn label="." onClick={inputDot} fontSize="text-xl" />
                  <Btn label="=" onClick={equals} variant="eq" fontSize="text-2xl" />
                </div>
              </div>
            )}

            {/* CONVERTER MODE */}
            {mode === 'converter' && (
              <div className="h-full flex flex-col gap-2 overflow-y-auto">
                <div className="grid grid-cols-4 gap-1.5 shrink-0">
                  {(Object.keys(CONVERTERS) as Array<keyof typeof CONVERTERS>).map((k) => (
                    <button key={k} onClick={() => { setConvCat(k); click(); }} className="h-9 rounded-lg text-[10px] sm:text-[11px] font-black cursor-pointer active:scale-95" style={convCat === k ? btnStyle('op') : btnStyle('fn')}>
                      {CONVERTERS[k].label.split(' ')[0]}
                    </button>
                  ))}
                </div>
                <div className="rounded-xl p-3 border space-y-2.5" style={{ background: t.displayBg, borderColor: t.border }}>
                  <div>
                    <label className="text-[10px] font-black uppercase" style={{ color: t.fnText }}>Değer</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={convValue}
                      onChange={(e) => setConvValue(e.target.value.replace(/[^0-9.\-]/g, ''))}
                      className="w-full mt-1 px-3 py-2 rounded-lg text-sm font-bold outline-none"
                      style={{ background: t.keyBg, color: t.keyText, border: `1px solid ${t.border}` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black uppercase" style={{ color: t.fnText }}>Kaynak</label>
                      <select value={convFrom} onChange={(e) => setConvFrom(e.target.value)} className="w-full mt-1 px-2 py-2 rounded-lg text-xs font-bold cursor-pointer outline-none" style={{ background: t.keyBg, color: t.keyText, border: `1px solid ${t.border}` }}>
                        {Object.entries(CONVERTERS[convCat].units).map(([u, d]: any) => (
                          <option key={u} value={u} style={{ color: '#000' }}>{d.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase" style={{ color: t.fnText }}>Hedef</label>
                      <select value={convTo} onChange={(e) => setConvTo(e.target.value)} className="w-full mt-1 px-2 py-2 rounded-lg text-xs font-bold cursor-pointer outline-none" style={{ background: t.keyBg, color: t.keyText, border: `1px solid ${t.border}` }}>
                        {Object.entries(CONVERTERS[convCat].units).map(([u, d]: any) => (
                          <option key={u} value={u} style={{ color: '#000' }}>{d.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="pt-2 border-t" style={{ borderColor: t.border }}>
                    <div className="text-[10px] font-black uppercase" style={{ color: t.fnText }}>Sonuç</div>
                    <div className="text-2xl sm:text-3xl font-black tabular-nums truncate" style={{ color: t.accent }} dir="ltr">{convertResult}</div>
                  </div>
                </div>
                {convCat === 'currency' && (
                  <p className="text-[10px] text-center font-bold shrink-0" style={{ color: t.fnText }}>⚠️ Yaklaşık kurlar — gerçek zamanlı değildir</p>
                )}
              </div>
            )}

            {/* PROGRAMMER MODE */}
            {mode === 'programmer' && (
              <div className="h-full flex flex-col gap-1.5 min-h-[320px]">
                <div className="rounded-xl p-2 border flex flex-col gap-0.5 shrink-0" style={{ background: t.displayBg, borderColor: t.border }}>
                  {(() => {
                    const n = Math.trunc(parseFloat(display) || 0);
                    const items = [
                      { base: 'HEX', val: n < 0 ? '-' + Math.abs(n).toString(16).toUpperCase() : n.toString(16).toUpperCase() },
                      { base: 'DEC', val: String(n) },
                      { base: 'OCT', val: n < 0 ? '-' + Math.abs(n).toString(8) : n.toString(8) },
                      { base: 'BIN', val: n < 0 ? '-' + Math.abs(n).toString(2) : n.toString(2) },
                    ];
                    return items.map((it) => (
                      <button key={it.base} onClick={() => navigator.clipboard.writeText(it.val).catch(() => {})} className="text-left flex items-center gap-2 px-1.5 py-1 rounded hover:brightness-125 cursor-pointer" style={{ color: t.keyText }}>
                        <span className="text-[9px] font-black w-8" style={{ color: t.accent }}>{it.base}</span>
                        <span className="text-xs font-mono font-bold truncate" dir="ltr">{it.val}</span>
                      </button>
                    ));
                  })()}
                </div>
                <div className="grid grid-cols-4 grid-rows-5 gap-1 sm:gap-1.5 flex-1 min-h-0">
                  <Btn label="AC" onClick={clearAll} variant="clear" />
                  <Btn label="⌫" onClick={backspace} variant="clear" />
                  <Btn label="±" onClick={() => unary('neg')} variant="fn" />
                  <Btn label="÷" onClick={() => performOp('÷')} variant="op" fontSize="text-xl" />
                  <Btn label="7" onClick={() => inputDigit('7')} />
                  <Btn label="8" onClick={() => inputDigit('8')} />
                  <Btn label="9" onClick={() => inputDigit('9')} />
                  <Btn label="×" onClick={() => performOp('×')} variant="op" fontSize="text-xl" />
                  <Btn label="4" onClick={() => inputDigit('4')} />
                  <Btn label="5" onClick={() => inputDigit('5')} />
                  <Btn label="6" onClick={() => inputDigit('6')} />
                  <Btn label="−" onClick={() => performOp('−')} variant="op" fontSize="text-xl" />
                  <Btn label="1" onClick={() => inputDigit('1')} />
                  <Btn label="2" onClick={() => inputDigit('2')} />
                  <Btn label="3" onClick={() => inputDigit('3')} />
                  <Btn label="+" onClick={() => performOp('+')} variant="op" fontSize="text-xl" />
                  <Btn label="0" onClick={() => inputDigit('0')} span={2} />
                  <Btn label="." onClick={inputDot} fontSize="text-xl" />
                  <Btn label="=" onClick={equals} variant="eq" fontSize="text-2xl" />
                </div>
              </div>
            )}
          </div>

          {/* HISTORY */}
          {showHistory && (
            <div className="flex-1 lg:flex-none lg:w-60 xl:w-72 min-h-0 overflow-y-auto rounded-xl p-2 sm:p-3 border" style={{ background: t.displayBg, borderColor: t.border }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase" style={{ color: t.fnText }}>Geçmiş ({history.length})</span>
                {history.length > 0 && (
                  <button onClick={() => { setHistory([]); localStorage.removeItem('calc_history'); }} className="text-[10px] font-black px-2 py-0.5 rounded" style={{ background: t.clearBg, color: t.clearText }}>Temizle</button>
                )}
              </div>
              {history.length === 0 ? (
                <div className="text-center py-8 text-[11px] font-bold" style={{ color: t.fnText }}>Henüz işlem yok</div>
              ) : (
                <div className="space-y-1.5">
                  {history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => { setDisplay(h.result); setExpression(h.expr + ' ='); setWaitingForOperand(true); click(); setShowHistory(false); }}
                      className="w-full text-right p-2 rounded-lg cursor-pointer hover:brightness-125"
                      style={{ background: t.keyBg, color: t.keyText }}
                    >
                      <div className="text-[10px] font-mono truncate opacity-70" dir="ltr">{h.expr}</div>
                      <div className="text-sm font-black" style={{ color: t.accent }} dir="ltr">= {h.result}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-3 py-1.5 border-t text-center text-[9px] sm:text-[10px] font-mono flex items-center justify-center gap-1.5 shrink-0" style={{ borderColor: t.border, color: t.fnText }}>
          <CornerDownLeft className="w-3 h-3" />
          <span>Enter = eşittir · Esc = temizle · ⌫ = sil</span>
        </div>
      </div>
    </div>
  );
}