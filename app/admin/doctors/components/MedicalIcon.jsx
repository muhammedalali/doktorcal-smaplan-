'use client';

import { useId } from 'react';

/**
 * أيقونات تشريحية واقعية لأعضاء جسم الإنسان — SVG عالي التفاصيل
 * - بلا حاوية مربعة: العضو نفسه هو الأيقونة
 * - تدرجات متعددة + ظلال داخلية + لمعان = إحساس 3D
 * - viewBox 0 0 48 48 — يعمل بوضوح من 28px حتى 64px
 */
export default function MedicalIcon({ name, className = "w-9 h-9" }) {
  const uid = useId().replace(/:/g, '');

  // لوحات ألوان تشريحية
  const PAL = {
    brain:   ['#FFE0E6', '#F0A8B5', '#A34D62'],
    heart:   ['#FF8595', '#D8263B', '#6B0F1E'],
    lung:    ['#FFD5D8', '#E89AA0', '#9C5158'],
    eye:     ['#FFFFFF', '#A8C8FF', '#2E4A8C'],
    tooth:   ['#FFFEF8', '#F0E4C8', '#A89470'],
    bone:    ['#FFF6E5', '#E8CFA5', '#A58058'],
    kidney:  ['#E89090', '#A84040', '#4A1212'],
    stomach: ['#FFA8B8', '#D85A78', '#6B1E30'],
    ear:     ['#FFDCC0', '#E8B090', '#A87550'],
    preg:    ['#FFC4DA', '#EC4899', '#7A1238'],
    baby:    ['#FFE8CC', '#F4B888', '#A86B3A'],
    knife:   ['#F8FAFC', '#94A3B8', '#1E293B'],
    virus:   ['#A7F3D0', '#10B981', '#064E3B'],
    sono:    ['#BAE6FD', '#3B82F6', '#1E3A8A'],
    skin:    ['#FFE8D8', '#E8A878', '#A06030'],
    palm:    ['#FFE8B8', '#F0B840', '#8A5A0A'],
    steth:   ['#BAE6FD', '#3B82F6', '#1E40AF'],
  };

  // توليد تدرجات لونية موحدة (main + shine + shade)
  const D = (key) => {
    const [c1, c2, c3] = PAL[key];
    return (
      <defs>
        <linearGradient id={`${key}-m-${uid}`} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="55%" stopColor={c2} />
          <stop offset="100%" stopColor={c3} />
        </linearGradient>
        <radialGradient id={`${key}-s-${uid}`} cx="0.28" cy="0.22" r="0.55">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${key}-d-${uid}`} cx="0.75" cy="0.9" r="0.65">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
        </radialGradient>
        <filter id={`${key}-glow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.8" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
    );
  };

  const m = (k) => `url(#${k}-m-${uid})`;
  const s = (k) => `url(#${k}-s-${uid})`;
  const dk = (k) => PAL[k][2];

  const ICONS = {

    /* 🫀 القلب — تشريحي واقعي */
    'KARDİYOLOJİ': (
      <>
        {D('heart')}
        <g filter={`url(#heart-glow-${uid})`}>
          {/* عضلة القلب */}
          <path d="M24 42c-1.5-1-3-2.5-4.5-4C12 31 7 26 7 19.5 7 14 11 10 15.5 10c3 0 5.5 1.5 7 3.5C24 11.5 26.5 10 29.5 10 34 10 38 14 38 19.5c0 6.5-5 11.5-12.5 18.5-1.5 1.5-3 3-4.5 4z" fill={m('heart')} />
          {/* ظل داخلي */}
          <path d="M24 42c-1.5-1-3-2.5-4.5-4C12 31 7 26 7 19.5 7 14 11 10 15.5 10c3 0 5.5 1.5 7 3.5C24 11.5 26.5 10 29.5 10 34 10 38 14 38 19.5c0 6.5-5 11.5-12.5 18.5-1.5 1.5-3 3-4.5 4z" fill={dk('heart')} opacity="0.15" />
          {/* الأبهر — قوس */}
          <path d="M24 13c3-4 8-4 10 0 1 2 0 4-2 4-1 0-2-.5-2.5-1.5" stroke={dk('heart')} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.85" />
          {/* الوريد الرئوي */}
          <path d="M24 13c-3-4-8-4-10 0-1 2 0 4 2 4 1 0 2-.5 2.5-1.5" stroke={dk('heart')} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
          {/* الشريان التاجي */}
          <path d="M22 22c1 2 2 4 2 6M26 22c-1 2-2 4-2 6" stroke={dk('heart')} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.55" />
          {/* لمعان */}
          <ellipse cx="18" cy="22" rx="4" ry="3.5" fill={s('heart')} />
          <ellipse cx="30" cy="24" rx="3" ry="2.5" fill={s('heart')} opacity="0.6" />
        </g>
      </>
    ),

    /* 🧠 الدماغ — تشريحي بتلافيف واضحة */
    'NÖROLOJİ': (
      <>
        {D('brain')}
        <g filter={`url(#brain-glow-${uid})`}>
          {/* نصف الكرة الأيسر */}
          <path d="M24 7c-6 0-11 3.5-13 8.5-1 3-.5 6 1 8.5-1.2 2-1.2 4.5.3 6.5 2.2 3 5.5 3.5 8.2 2.2 1.8-.9 3-2.8 3.5-5V7z" fill={m('brain')} />
          {/* نصف الكرة الأيمن */}
          <path d="M24 7c6 0 11 3.5 13 8.5 1 3 .5 6-1 8.5 1.2 2 1.2 4.5-.3 6.5-2.2 3-5.5 3.5-8.2 2.2-1.8-.9-3-2.8-3.5-5V7z" fill={m('brain')} opacity="0.82" />
          {/* تلافيف — يسار */}
          <g stroke={dk('brain')} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.6">
            <path d="M14 14c2 1 3.5.5 4.5-1" />
            <path d="M13 20c2 1 4 1 5-.5" />
            <path d="M14 26c1.8 1 3.8.5 4.5-.5" />
            <path d="M18 31c1.5 0 3-.5 3.8-1.2" />
          </g>
          {/* تلافيف — يمين */}
          <g stroke={dk('brain')} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.55">
            <path d="M34 14c-2 1-3.5.5-4.5-1" />
            <path d="M35 20c-2 1-4 1-5-.5" />
            <path d="M34 26c-1.8 1-3.8.5-4.5-.5" />
            <path d="M30 31c-1.5 0-3-.5-3.8-1.2" />
          </g>
          {/* الشق المركزي */}
          <path d="M24 7v30" stroke={dk('brain')} strokeWidth="0.8" opacity="0.5" />
          {/* لمعان */}
          <ellipse cx="17" cy="15" rx="4" ry="3" fill={s('brain')} />
          <ellipse cx="31" cy="17" rx="3" ry="2" fill={s('brain')} opacity="0.6" />
        </g>
      </>
    ),

    /* 🧠 + 💗 النفسية — دماغ مع رمز قلب صغير */
    'PSİKİYATRİ': (
      <>
        {D('brain')}
        <g filter={`url(#brain-glow-${uid})`}>
          <path d="M13 18c-1.5 2.5-1.5 6 0 8.5.8 1.5 2.5 3 4.5 3.8 2.3.8 4.7 0 6.3-1.6 1.2-1.2 1.7-2.8 1.7-4.4V16c-1.5-2-4.5-3.5-7.5-2.8-2.3.6-4 2.4-5 4.8z" fill={m('brain')} />
          <path d="M35 18c1.5 2.5 1.5 6 0 8.5-.8 1.5-2.5 3-4.5 3.8-2.3.8-4.7 0-6.3-1.6-1.2-1.2-1.7-2.8-1.7-4.4V16c1.5-2 4.5-3.5 7.5-2.8 2.3.6 4 2.4 5 4.8z" fill={m('brain')} opacity="0.82" />
          <g stroke={dk('brain')} strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.55">
            <path d="M15 21c1.5.8 2.8.4 3.8-.8M16 28c1.2.6 2.5.4 3-.5" />
            <path d="M33 21c-1.5.8-2.8.4-3.8-.8M32 28c-1.2.6-2.5.4-3-.5" />
          </g>
          {/* قلب صغير في المركز */}
          <path d="M24 24c-1.5-1.5-4-1.2-4 1 0 1.5 1.8 3 4 4.5 2.2-1.5 4-3 4-4.5 0-2.2-2.5-2.5-4-1z" fill="#EC4899" />
          <ellipse cx="17" cy="19" rx="3" ry="2.5" fill={s('brain')} />
        </g>
      </>
    ),

    /* 🫁 الرئتان — تشريحي بشعب هوائية */
    'GÖĞÜS HASTALIKLARI': (
      <>
        {D('lung')}
        <g filter={`url(#lung-glow-${uid})`}>
          {/* القصبة الهوائية */}
          <path d="M24 5v12" stroke="#E0E0E0" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M24 5v12" stroke="#B0B0B0" strokeWidth="0.8" strokeLinecap="round" />
          {/* التفرعات */}
          <path d="M24 13l-5 4M24 13l5 4" stroke="#D8D8D8" strokeWidth="1.6" strokeLinecap="round" />
          {/* الرئة اليسرى — فصين */}
          <path d="M24 18c-4-3-8-2.5-10 1-2 3.5-1.5 9 .5 13 1.2 2.5 3.5 3 5.5 1.8 1.4-.9 2.2-2.5 3-4.5.6-1.6.8-3.5 1-5.3V18z" fill={m('lung')} />
          {/* الرئة اليمنى */}
          <path d="M24 18c4-3 8-2.5 10 1 2 3.5 1.5 9-.5 13-1.2 2.5-3.5 3-5.5 1.8-1.4-.9-2.2-2.5-3-4.5-.6-1.6-.8-3.5-1-5.3V18z" fill={m('lung')} opacity="0.82" />
          {/* تفرعات داخلية */}
          <g stroke={dk('lung')} strokeWidth="0.8" fill="none" opacity="0.55" strokeLinecap="round">
            <path d="M20 21l-2 4M18 26l-1.5 3M22 26l-1 4" />
            <path d="M28 21l2 4M30 26l1.5 3M26 26l1 4" />
          </g>
          {/* لمعان */}
          <ellipse cx="17" cy="26" rx="3" ry="4" fill={s('lung')} />
          <ellipse cx="31" cy="26" rx="3" ry="4" fill={s('lung')} opacity="0.6" />
        </g>
      </>
    ),

    /* 🫘 الكليتان — تشريحي بحالبين */
    'ÜROLOJİ': (
      <>
        {D('kidney')}
        <g filter={`url(#kidney-glow-${uid})`}>
          {/* الكلية اليسرى */}
          <path d="M16 11c-4 0-6.5 3.5-6.5 8.5 0 6 2.5 11 6.5 11 2.8 0 4.8-2 4.8-5 0-2.5-1.5-3.8-1.5-6.5 0-2.8 1.5-4.5 0-6.5-.8-1-2-1.5-3.3-1.5z" fill={m('kidney')} />
          {/* الكلية اليمنى */}
          <path d="M32 11c4 0 6.5 3.5 6.5 8.5 0 6-2.5 11-6.5 11-2.8 0-4.8-2-4.8-5 0-2.5 1.5-3.8 1.5-6.5 0-2.8-1.5-4.5 0-6.5.8-1 2-1.5 3.3-1.5z" fill={m('kidney')} opacity="0.82" />
          {/* الحوالب */}
          <path d="M17 31c0 2.5 2 4.5 4 5.5M31 31c0 2.5-2 4.5-4 5.5" stroke="#5C1A1A" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          {/* تفاصيل داخلية */}
          <circle cx="13" cy="19" r="1.4" fill={dk('kidney')} opacity="0.4" />
          <circle cx="35" cy="19" r="1.4" fill={dk('kidney')} opacity="0.4" />
          {/* لمعان */}
          <ellipse cx="14" cy="16" rx="2" ry="3" fill={s('kidney')} />
          <ellipse cx="34" cy="16" rx="2" ry="3" fill={s('kidney')} opacity="0.6" />
        </g>
      </>
    ),

    /* 👁️ العين — تشريحية بالقزحية */
    'GÖZ HASTALIKLARI': (
      <>
        {D('eye')}
        {/* بياض العين */}
        <path d="M5 24c5-8 11-12 19-12s14 4 19 12c-5 8-11 12-19 12S10 32 5 24z" fill="#FFFFFF" />
        {/* ظل الجفن العلوي */}
        <path d="M5 24c5-8 11-12 19-12s14 4 19 12" stroke="#9CA8BC" strokeWidth="1.2" fill="none" />
        {/* خطوط دقيقة للأوعية */}
        <g stroke="#F0B0B0" strokeWidth="0.4" fill="none" opacity="0.5">
          <path d="M9 22c2-1 3-2 5-1.5" />
          <path d="M39 22c-2-1-3-2-5-1.5" />
        </g>
        {/* القزحية */}
        <circle cx="24" cy="24" r="8.5" fill={m('eye')} />
        {/* خطوط القزحية */}
        <g stroke={dk('eye')} strokeWidth="0.5" opacity="0.6">
          <path d="M24 16v3M24 29v3M16 24h3M29 24h3M18.5 18.5l2 2M27.5 27.5l2 2M27.5 18.5l-2 2M18.5 27.5l2-2" />
        </g>
        {/* البؤبؤ */}
        <circle cx="24" cy="24" r="3.8" fill="#0A0A0A" />
        {/* لمعان */}
        <circle cx="26.5" cy="21" r="2" fill="#FFF" />
        <circle cx="21.5" cy="27" r="0.9" fill="#FFF" opacity="0.55" />
      </>
    ),

    /* 🦷 السن — تشريحي بجذور */
    'DİŞ HEKİMLİĞİ': (
      <>
        {D('tooth')}
        <g filter={`url(#tooth-glow-${uid})`}>
          {/* التاج والجذور */}
          <path d="M11 11c3 0 4.5 2 6.5 2 2.5 0 4.5-2 6.5-2 2.5 0 4 1.5 4.5 3.5.5 2 1.5 3 2.5 4.5 2-1.5 3.5-1.5 4.5 0 2 2 1.5 5 0 7.5-1.5 2.5-4 4.5-6.5 5.5-1.5.5-2.5-1-3-2.5-.5-1.5-1-3-2.5-4-1.5 1-2 2.5-2.5 4-.5 1.5-1.5 3-3 2.5-2.5-1-5-3-6.5-5.5-1.5-2.5-2-5.5 0-7.5 1-1.5 2.5-1.5 4.5 0 1-1.5 2-2.5 2.5-4.5C7 12.5 8.5 11 11 11z" fill={m('tooth')} />
          {/* جذور مظللة */}
          <path d="M17 32c.5 2 1 4 2 5M31 32c-.5 2-1 4-2 5" stroke={dk('tooth')} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.55" />
          {/* تفاصيل المينا */}
          <path d="M15 15c1.5 1 3 1.5 5 1M30 15c-1 1-3 1-5 1" stroke={dk('tooth')} strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.45" />
          {/* لمعان */}
          <ellipse cx="19" cy="14" rx="3" ry="1.6" fill={s('tooth')} />
          <ellipse cx="29" cy="16" rx="2" ry="1.2" fill={s('tooth')} opacity="0.7" />
        </g>
      </>
    ),

    /* 🦴 العظم — مفصل تشريحي */
    'ORTOPEDİ VE TRAVMATOLOJİ': (
      <>
        {D('bone')}
        <g filter={`url(#bone-glow-${uid})`}>
          {/* فخذ — رأس علوي */}
          <path d="M17 8c-2.5-1.5-5.5.5-5.5 3.5 0 2 1 3 2 4-1 3.5-1.5 7-1.5 11 0 4.5.5 7.5 2 10 1 1.6 3 2 4 .5 1-1.2 1-3 1-4.5 0-3.5-.5-7-.5-11.5 0-2.5.5-5 1.5-7.5.8-2 0-4.5-1.5-5.5-.7-.5-1.2-.3-1.5-1z" fill={m('bone')} />
          {/* فخذ — رأس سفلي */}
          <path d="M31 8c2.5-1.5 5.5.5 5.5 3.5 0 2-1 3-2 4 1 3.5 1.5 7 1.5 11 0 4.5-.5 7.5-2 10-1 1.6-3 2-4 .5-1-1.2-1-3-1-4.5 0-3.5.5-7 .5-11.5 0-2.5-.5-5-1.5-7.5-.8-2 0-4.5 1.5-5.5.7-.5 1.2-.3 1.5-1z" fill={m('bone')} opacity="0.82" />
          {/* مفصل */}
          <ellipse cx="24" cy="24" rx="4" ry="4.5" fill={m('bone')} />
          <ellipse cx="24" cy="24" rx="2" ry="2.5" fill={dk('bone')} opacity="0.3" />
          {/* لمعان */}
          <ellipse cx="19" cy="14" rx="2" ry="3" fill={s('bone')} />
          <ellipse cx="29" cy="14" rx="2" ry="3" fill={s('bone')} opacity="0.7" />
        </g>
      </>
    ),

    /* 🔪 المشرط الجراحي */
    'GENEL CERRAHİ': (
      <>
        {D('knife')}
        <g filter={`url(#knife-glow-${uid})`}>
          {/* المقبض */}
          <rect x="6" y="34" width="18" height="6" rx="1.5" transform="rotate(-45 6 34)" fill={m('knife')} />
          <path d="M8 38l3 3" stroke={dk('knife')} strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
          {/* الشفرة */}
          <path d="M14 30l18-18c1.5-.5 3 0 3.5 1.5l3 3c.5 1.5 0 3-1.5 3.5L19 38l-5-8z" fill={m('knife')} />
          {/* حد الشفرة اللامع */}
          <path d="M22 22l8-8" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
          {/* خط الظل */}
          <path d="M15 31l18-18" stroke={dk('knife')} strokeWidth="0.7" opacity="0.4" />
        </g>
      </>
    ),

    /* 🦠 الفيروس — تشريحي بأشواك */
    'ENFEKSİYON HASTALIKLARI': (
      <>
        {D('virus')}
        <g filter={`url(#virus-glow-${uid})`}>
          {/* أشواك */}
          <g stroke="#10B981" strokeWidth="2.2" strokeLinecap="round">
            <path d="M24 4v6M24 38v6M4 24h6M38 24h6M10 10l4.5 4.5M33.5 33.5l4.5 4.5M33.5 10l-4.5 4.5M10 33.5l4.5-4.5" />
          </g>
          {/* رؤوس الأشواك */}
          <g fill="#059669">
            <circle cx="24" cy="3" r="1.5" />
            <circle cx="24" cy="45" r="1.5" />
            <circle cx="3" cy="24" r="1.5" />
            <circle cx="45" cy="24" r="1.5" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <circle cx="39.5" cy="39.5" r="1.5" />
            <circle cx="39.5" cy="8.5" r="1.5" />
            <circle cx="8.5" cy="39.5" r="1.5" />
          </g>
          {/* جسم الفيروس */}
          <circle cx="24" cy="24" r="11" fill={m('virus')} />
          {/* حواف داخلية */}
          <circle cx="24" cy="24" r="7.5" stroke={dk('virus')} strokeWidth="0.7" fill="none" opacity="0.45" />
          {/* بروتينات داخلية */}
          <circle cx="20" cy="20" r="1.6" fill={dk('virus')} opacity="0.5" />
          <circle cx="28" cy="26" r="1.4" fill={dk('virus')} opacity="0.5" />
          <circle cx="22" cy="28" r="1" fill={dk('virus')} opacity="0.5" />
          {/* لمعان */}
          <ellipse cx="20" cy="19" rx="3.5" ry="3" fill={s('virus')} />
        </g>
      </>
    ),

    /* 👂 الأذن — تشريحية */
    'KULAK BURUN BOĞAZ (KBB)': (
      <>
        {D('ear')}
        <g filter={`url(#ear-glow-${uid})`}>
          {/* صيوان الأذن */}
          <path d="M27 8c-6-2-12 1.5-13.5 8-1 4 0 8 2 11 2 3 3 5 3 8 0 2-1 3.5-2.5 4.5-1 .7-1.8 1.5-1 2.5.7.8 1.8.3 2.5-.5 3-3 4.5-6 4.5-10 0-4-2-7-2.5-9-1-3-.5-6 1.5-7.5 2-1.5 4.5-1.5 6 .5 1 1.3 1 3 .5 4.5-.7 2-1.5 3.5-1.5 5.5 0 1 .8 1.5 1.5 1 .8-.8 1.5-2 1.5-3.5 0-2-1-3-1-5 0-3-.5-6-2.5-7.5-1-.7-2-1-3-1z" fill={m('ear')} />
          {/* الالتفاف الداخلي */}
          <path d="M27 16c-2 0-3.5 1.5-3 3.5.5 1 1 2 1 3 0 1-1 2-1 3 0 .8.8 1.2 1.5.5" stroke={dk('ear')} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
          {/* موجات صوت */}
          <path d="M35 20c1.5 2 1.5 6 0 8M40 16c4 4 4 12 0 16" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* لمعان */}
          <ellipse cx="20" cy="16" rx="2.5" ry="4" fill={s('ear')} />
        </g>
      </>
    ),

    /* 🔬 مسبار الأمواج فوق الصوتية */
    'RADYOLOJİ (USG)': (
      <>
        {D('sono')}
        <g filter={`url(#sono-glow-${uid})`}>
          {/* الرأس */}
          <rect x="20" y="5" width="8" height="18" rx="3" fill={m('sono')} />
          {/* وجه المسبار */}
          <rect x="21" y="21" width="6" height="3" rx="1" fill={dk('sono')} opacity="0.75" />
          {/* المقبض */}
          <path d="M22 24v14c0 1.5 1 2.5 2 2.5s2-1 2-2.5V24" fill={m('sono')} opacity="0.7" />
          {/* أمواج */}
          <path d="M14 33c6.5-2.5 13.5-2.5 20 0" stroke="#38BDF8" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M10 39c8-3.5 20-3.5 28 0" stroke="#38BDF8" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.7" />
          {/* لمعان */}
          <ellipse cx="22" cy="11" rx="1.8" ry="4" fill={s('sono')} />
        </g>
      </>
    ),

    /* 🧴 طبقات الجلد */
    'DERMATOLOJİ': (
      <>
        {D('skin')}
        <g filter={`url(#skin-glow-${uid})`}>
          {/* البشرة */}
          <path d="M6 11h36v8H6z" fill={m('skin')} />
          {/* الأدمة */}
          <path d="M6 19h36v10H6z" fill="#E8A878" />
          {/* الطبقة تحت الجلد */}
          <path d="M6 29h36v8H6z" fill="#C07040" />
          {/* بصيلة شعر */}
          <path d="M14 11v14" stroke="#5C2A0A" strokeWidth="1.3" fill="none" />
          <circle cx="14" cy="24" r="2.2" fill="#5C2A0A" opacity="0.6" />
          {/* غدة عرقية */}
          <path d="M32 11v18c0 2.5 2.5 2.5 2.5 0V11" stroke="#FFE8D8" strokeWidth="0.9" fill="none" opacity="0.7" />
          <circle cx="33" cy="29" r="1.5" fill="#FFE8D8" />
          {/* لمعان */}
          <ellipse cx="20" cy="13" rx="8" ry="1.5" fill="#fff" opacity="0.35" />
        </g>
      </>
    ),

    /* 🤰 امرأة حامل — صورة ظلية واقعية */
    'KADIN HASTALIKLARI VE DOĞUM': (
      <>
        {D('preg')}
        <g filter={`url(#preg-glow-${uid})`}>
          {/* الرأس */}
          <ellipse cx="22" cy="12" rx="5.5" ry="6" fill={m('preg')} />
          {/* الشعر */}
          <path d="M16.5 12c0-4.5 2.5-7.5 5.5-7.5s5.5 3 5.5 7.5c-1-2.5-2.5-3.5-5.5-3.5s-4.5 1-5.5 3.5z" fill={dk('preg')} opacity="0.75" />
          {/* جسم جانبي مع بطن */}
          <path d="M22 19c-2.5 0-4.5 1.2-5 3.5-.8 3 0 6 1 8.5 1 2 2 3.5 2 6 0 2.5.5 4.5 1.5 5.5.7.7 1.8.7 2.5 0 .8-.8 1-2.5 1-4 0-2.5 0-4.5.5-6.5 3-.5 7-1.5 9-3.5 2.5-2.5 1.5-6.5-1-8-2-1.5-5-1.5-7 .5-.8.8-1.3 1.8-1.5 3-.5.3-1.5.5-2.5.5z" fill={m('preg')} />
          {/* بطن حامل — لمعان */}
          <ellipse cx="30" cy="29" rx="5.5" ry="6.5" fill="#FBCFE8" opacity="0.6" />
          <ellipse cx="28.5" cy="27.5" rx="2" ry="2.5" fill="#fff" opacity="0.4" />
          {/* ذراع */}
          <path d="M21 23c-1.5 1.5-1 4 .5 5.5" stroke="#FBCFE8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
        </g>
      </>
    ),

    /* 👶 طفل */
    'ÇOCUK SAĞLIĞI VE HASTALIKLARI': (
      <>
        {D('baby')}
        <g filter={`url(#baby-glow-${uid})`}>
          {/* الرأس */}
          <circle cx="24" cy="19" r="10" fill={m('baby')} />
          {/* شعر */}
          <path d="M19 12c1-2.5 3.5-2.5 5-1.5 1.5-1 4-1 5 1.5" stroke={dk('baby')} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.8" />
          {/* عيون */}
          <circle cx="20.5" cy="19" r="1.6" fill="#1E293B" />
          <circle cx="27.5" cy="19" r="1.6" fill="#1E293B" />
          <circle cx="21" cy="18.5" r="0.5" fill="#fff" />
          <circle cx="28" cy="18.5" r="0.5" fill="#fff" />
          {/* خدود وردية */}
          <ellipse cx="17.5" cy="22.5" rx="2" ry="1.4" fill="#F472B6" opacity="0.45" />
          <ellipse cx="30.5" cy="22.5" rx="2" ry="1.4" fill="#F472B6" opacity="0.45" />
          {/* ابتسامة */}
          <path d="M21 24.5c1 1 5 1 6 0" stroke="#7A3F1A" strokeWidth="1.3" strokeLinecap="round" fill="none" />
          {/* جسم */}
          <path d="M15 39c0-4 4.5-7.5 9-7.5s9 3.5 9 7.5v1H15v-1z" fill={m('baby')} />
          {/* لمعان */}
          <ellipse cx="20" cy="14" rx="3" ry="2.2" fill={s('baby')} />
        </g>
      </>
    ),

    /* 🤲 الرعاية التلطيفية — يدان تحملان قلباً */
    'PALYATİF': (
      <>
        {D('palm')}
        <g filter={`url(#palm-glow-${uid})`}>
          {/* قلب */}
          <path d="M24 24c-2-2-6-1.5-6 1.5 0 2 2.5 4.5 6 6.5 3.5-2 6-4.5 6-6.5 0-3-4-3.5-6-1.5z" fill="#DC2626" />
          <ellipse cx="21" cy="26" rx="1.5" ry="1" fill="#fff" opacity="0.5" />
          {/* يد يسرى */}
          <path d="M10 33c2-2 4.5-2 6.5-.5l6 4.5c.8.7 0 1.8-.8 1.3L17 36l3 3c.8.8 0 1.8-.8 1.3L15 38l2 3c.7.8 0 1.8-.9 1.3L12 40c-2-1.5-3.5-3.5-2-7z" fill={m('palm')} />
          {/* يد يمنى */}
          <path d="M38 33c-2-2-4.5-2-6.5-.5l-6 4.5c-.8.7 0 1.8.8 1.3L31 36l-3 3c-.8.8 0 1.8.8 1.3L33 38l-2 3c-.7.8 0 1.8.9 1.3L36 40c2-1.5 3.5-3.5 2-7z" fill={m('palm')} />
        </g>
      </>
    ),

    /* 🩺 السماعة الطبية */
    'İÇ HASTALIKLARI (DAHİLİYE)': (
      <>
        {D('steth')}
        <g filter={`url(#steth-glow-${uid})`}>
          {/* الأنبوب الرئيسي */}
          <path d="M14 6v10c0 5.5 4.5 10 10 10s10-4.5 10-10V6" stroke={m('steth')} strokeWidth="2.6" strokeLinecap="round" fill="none" />
          {/* رؤوس الأذن */}
          <circle cx="14" cy="6" r="2" fill={dk('steth')} />
          <circle cx="34" cy="6" r="2" fill={dk('steth')} />
          {/* اللمعة على الرؤوس */}
          <circle cx="13.5" cy="5.5" r="0.6" fill="#fff" opacity="0.7" />
          <circle cx="33.5" cy="5.5" r="0.6" fill="#fff" opacity="0.7" />
          {/* الأنبوب السفلي */}
          <path d="M24 26v6c0 4 3 7 7 7h3c2 0 3-1.5 3-3.5v-2" stroke={m('steth')} strokeWidth="2.6" strokeLinecap="round" fill="none" />
          {/* الصدرية */}
          <circle cx="36" cy="32" r="5.5" fill={m('steth')} />
          <circle cx="36" cy="32" r="3.2" fill={dk('steth')} opacity="0.65" />
          <circle cx="36" cy="32" r="1.5" fill="#fff" opacity="0.55" />
        </g>
      </>
    ),
  };

  const content = ICONS[name] || ICONS['İÇ HASTALIKLARI (DAHİLİYE)'];

  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {content}
    </svg>
  );
}