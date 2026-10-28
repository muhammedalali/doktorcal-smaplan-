export default function MedicalIcon({ name, className = "w-7 h-7" }) {
  const renderIcon = (iconName) => {
    switch (iconName) {

      // 🤰 قسم النسائية والتوليد: رمز امرأة حامل 3D ملون وواضح جداً تحتضن بطنها
      case 'KADIN HASTALIKLARI VE DOĞUM':
        return (
          <svg className={className} viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="kd_body" x1="5" y1="2" x2="30" y2="34">
                <stop offset="0%" stopColor="#FF65A3" />
                <stop offset="50%" stopColor="#F42A8B" />
                <stop offset="100%" stopColor="#880048" />
              </linearGradient>
              <radialGradient id="kd_belly" cx="65%" cy="50%" r="45%">
                <stop offset="0%" stopColor="#FFC2E2" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#F42A8B" stopOpacity="0" />
              </radialGradient>
              <filter id="kd_shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#5C0030" floodOpacity="0.5" />
              </filter>
            </defs>
            <g filter="url(#kd_shadow)">
              {/* الرأس 3D */}
              <circle cx="14" cy="6.5" r="4" fill="url(#kd_body)" />
              <circle cx="12.5" cy="5" r="1.3" fill="#FFFFFF" opacity="0.6" />
              {/* الجسم وجزء البطن الحامل المجسم 3D */}
              <path 
                d="M 13 11 C 11 11, 9 13, 9 16 C 9 20, 10 24, 12 30 C 13.5 32, 16.5 32, 18 30 C 20 25, 20 23, 20 21 C 25 21, 26 16, 22 13 C 19 11, 15 11, 13 11 Z" 
                fill="url(#kd_body)" 
              />
              {/* لمعان البطن البارز (Volume Highlight) */}
              <path 
                d="M 14 14 C 18 14, 24 16, 22 22 C 20 25, 16 26, 14 26 C 18 24, 21 21, 19 17 C 17 14, 14 14, 14 14 Z" 
                fill="url(#kd_belly)" 
              />
              {/* يدان تحتضنان البطن للحماية */}
              <path d="M 12 17.5 C 15 19.5, 19 19.5, 21.5 18" stroke="#FFE6F2" strokeWidth="2" strokeLinecap="round" opacity="0.95" />
              <path d="M 13 21.5 C 16 23, 19 23, 21.5 21.5" stroke="#FFE6F2" strokeWidth="2" strokeLinecap="round" opacity="0.95" />
            </g>
          </svg>
        );

      // 👶 قسم الأطفال: طفل 3D وملهية أطفال زجاجية ثلاثية الأبعاد
      case 'ÇOCUK SAĞLIĞI VE HASTALIKLARI':
        return (
          <svg className={className} viewBox="0 0 36 36" fill="none">
            <defs>
              <radialGradient id="cs_head" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#FFE066" />
                <stop offset="60%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </radialGradient>
              <linearGradient id="cs_shirt" x1="0" y1="0" x2="36" y2="36">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0369A1" />
              </linearGradient>
            </defs>
            <circle cx="18" cy="15" r="8.5" fill="url(#cs_head)" />
            <circle cx="15" cy="12" r="2.5" fill="#FFFFFF" opacity="0.4" />
            <path d="M 18 6.5 C 16 4, 18 2, 20.5 3.5" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
            <circle cx="14.5" cy="14" r="1.3" fill="#0F172A" />
            <circle cx="21.5" cy="14" r="1.3" fill="#0F172A" />
            <path d="M 15 18.5 C 16.5 20, 19.5 20, 21 18.5" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12.5" cy="16" r="1.5" fill="#F43F5E" opacity="0.5" />
            <circle cx="23.5" cy="16" r="1.5" fill="#F43F5E" opacity="0.5" />
            <path d="M 8 28 C 8 23, 12.5 21, 18 21 C 23.5 21, 28 23, 28 28 V 31 H 8 V 28 Z" fill="url(#cs_shirt)" />
          </svg>
        );

      // 🫁 قسم الصدرية: رئتان 3D واقعية للغاية مع القصبة الهوائية والتفرعات
      case 'GÖĞÜS HASTALIKLARI':
        return (
          <svg className={className} viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="gh_trachea" x1="0" y1="0" x2="0" y2="100%">
                <stop offset="0%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>
              <linearGradient id="gh_left" x1="0" y1="0" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="50%" stopColor="#0EA5E9" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
              <linearGradient id="gh_right" x1="0" y1="0" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="50%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
            <path d="M 18 3 V 14" stroke="url(#gh_trachea)" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 18 10 L 13.5 14 M 18 10 L 22.5 14" stroke="#CBD5E1" strokeWidth="2" />
            <path d="M 16 14 C 12 9, 5 10, 3.5 16 C 1.5 23, 5 30, 11 31 C 15 31.5 16 29.5 16 27 V 14 Z" fill="url(#gh_left)" />
            <path d="M 8 18 C 10 21, 12 24, 14 24" stroke="#E0F2FE" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
            <path d="M 20 14 C 24 9, 31 10, 32.5 16 C 34.5 23, 31 30, 25 31 C 21 31.5 20 29.5 20 27 V 14 Z" fill="url(#gh_right)" />
            <path d="M 28 18 C 26 21, 24 24, 22 24" stroke="#EFF6FF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
          </svg>
        );

      // 🧠 قسم المخ والأعصاب / النفسية: دماغ 3D واقعي مجسم ذو فصوص ملونة وتلافيف دقيقة
      case 'NÖROLOJİ':
      case 'PSİKİYATRİ':
        return (
          <svg className={className} viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="nr_left" x1="0" y1="0" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E9D5FF" />
                <stop offset="50%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#6B21A8" />
              </linearGradient>
              <linearGradient id="nr_right" x1="0" y1="0" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBCFE8" />
                <stop offset="50%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#9D174D" />
              </linearGradient>
            </defs>
            <path d="M 17.5 6 C 14 3.5 9 4.5 7 8.5 C 4.5 11.5 5 16.5 7.5 19 C 5.5 21.5 7.5 26.5 11.5 28 C 15 29 17.5 26.5 17.5 26.5 V 6 Z" fill="url(#nr_left)" />
            <path d="M 18.5 6 C 22 3.5 27 4.5 29 8.5 C 31.5 11.5 31 16.5 28.5 19 C 30.5 21.5 28.5 26.5 24.5 28 C 21 29 18.5 26.5 18.5 26.5 V 6 Z" fill="url(#nr_right)" />
            <path d="M 10 11.5 C 13 13, 14 16, 12 18 M 26 11.5 C 23 13, 22 16, 24 18" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
            <line x1="18" y1="4" x2="18" y2="30" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      // 🦴 قسم العظام: عظم ومفصل 3D واقعي ومجسم
      case 'ORTOPEDİ VE TRAVMATOLOJİ':
        return (
          <svg className={className} viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="or_bone" x1="0" y1="0" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF7ED" />
                <stop offset="40%" stopColor="#FB923C" />
                <stop offset="100%" stopColor="#9A3412" />
              </linearGradient>
            </defs>
            <path d="M 11 7 A 4 4 0 0 0 5.5 12.5 L 6.5 13.5 A 4 4 0 0 0 7 19 L 17 29 A 4 4 0 0 0 22.5 29.5 L 23.5 30.5 A 4 4 0 0 0 29 25 L 28 24 A 4 4 0 0 0 27.5 18.5 L 17.5 8.5 A 4 4 0 0 0 12 8 L 11 7 Z" fill="url(#or_bone)" />
            <circle cx="8.5" cy="7" r="3.5" fill="#FFEDD5" />
            <circle cx="6" cy="9.5" r="3.5" fill="#FDBA74" />
            <circle cx="27.5" cy="29" r="3.5" fill="#FFEDD5" />
            <circle cx="30" cy="26.5" r="3.5" fill="#FDBA74" />
            <line x1="12" y1="12" x2="24" y2="24" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          </svg>
        );

      // 🔪 قسم الجراحة العامة: مشرط ومقص جراحي 3D بمعدن كروم براق
      case 'GENEL CERRAHİ':
        return (
          <svg className={className} viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="gc_metal" x1="0" y1="0" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F8FAFC" />
                <stop offset="50%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
              <linearGradient id="gc_blade" x1="0" y1="0" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
            </defs>
            <path d="M 27 4 L 32 9 L 17 24 H 10 V 17 L 27 4 Z" fill="url(#gc_metal)" />
            <path d="M 25 6 L 29 10 L 19 20 H 16 V 17 L 25 6 Z" fill="url(#gc_blade)" opacity="0.85" />
            <line x1="7" y1="7" x2="29" y2="29" stroke="url(#gc_metal)" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="5" cy="5" r="3.5" stroke="#0284C7" strokeWidth="2.5" />
            <circle cx="31" cy="31" r="3.5" stroke="#0284C7" strokeWidth="2.5" />
            <circle cx="18" cy="18" r="2" fill="#38BDF8" />
          </svg>
        );

      // 🫘 قسم المسالك البولية / الكلى: كليتان 3D وجهاز بولي بلمعة زجاجية
      case 'ÜROLOJİ':
        return (
          <svg className={className} viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="ur_kLeft" x1="0" y1="0" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2DD4BF" />
                <stop offset="100%" stopColor="#0F766E" />
              </linearGradient>
              <linearGradient id="ur_kRight" x1="0" y1="0" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14B8A6" />
                <stop offset="100%" stopColor="#115E59" />
              </linearGradient>
            </defs>
            <path d="M 11 6 C 7 6 5 9.5 5 13.5 C 5 17.5 7.5 21 11.5 21 C 15.5 21 15 17.5 15 13.5 C 15 9.5 15 6 11 6 Z" fill="url(#ur_kLeft)" />
            <circle cx="9" cy="10" r="1.8" fill="#FFF" opacity="0.5" />
            <path d="M 25 6 C 29 6 31 9.5 31 13.5 C 31 17.5 28.5 21 24.5 21 C 20.5 21 21 17.5 21 13.5 C 21 9.5 21 6 25 6 Z" fill="url(#ur_kRight)" />
            <circle cx="27" cy="10" r="1.8" fill="#FFF" opacity="0.5" />
            <path d="M 11.5 21 C 11.5 26, 15 29, 18 32 M 24.5 21 C 24.5 26, 21 29, 18 32" stroke="#0D9488" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      // 🦠 قسم الأمراض الإنتانية: فيروس كروي 3D مع أشواك بروتينية مضاءة
      case 'ENFEKSİYON HASTALIKLARI':
        return (
          <svg className={className} viewBox="0 0 36 36" fill="none">
            <defs>
              <radialGradient id="eh_virus" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#A7F3D0" />
                <stop offset="40%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#047857" />
              </radialGradient>
            </defs>
            <circle cx="18" cy="18" r="9" fill="url(#eh_virus)" />
            <circle cx="14.5" cy="14.5" r="2.8" fill="#FFF" opacity="0.45" />
            <path d="M 18 2 V 9 M 18 27 V 34 M 34 18 H 27 M 9 18 H 2 M 29.3 6.7 L 24.3 11.7 M 11.7 24.3 L 6.7 29.3 M 29.3 29.3 L 24.3 24.3 M 11.7 11.7 L 6.7 6.7" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
            <circle cx="18" cy="3" r="1.8" fill="#34D399" />
            <circle cx="18" cy="33" r="1.8" fill="#34D399" />
            <circle cx="3" cy="18" r="1.8" fill="#34D399" />
            <circle cx="33" cy="18" r="1.8" fill="#34D399" />
          </svg>
        );

      // 👁️ قسم العيون: عين زجاجية 3D مع قزحية ثلاثية الطبقات
      case 'GÖZ HASTALIKLARI':
        return (
          <svg className={className} viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="gz_frame" x1="0" y1="0" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#312E81" />
              </linearGradient>
              <radialGradient id="gz_iris" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="70%" stopColor="#0284C7" />
                <stop offset="100%" stopColor="#0C4A6E" />
              </radialGradient>
            </defs>
            <path d="M 3 18 C 3 18, 9 8, 18 8 C 27 8, 33 18, 33 18 C 33 18, 27 28, 18 28 C 9 28, 3 18, 3 18 Z" fill="url(#gz_frame)" />
            <circle cx="18" cy="18" r="7" fill="#FFFFFF" />
            <circle cx="18" cy="18" r="4.5" fill="url(#gz_iris)" />
            <circle cx="18" cy="18" r="2.2" fill="#0F172A" />
            <circle cx="19.5" cy="16.5" r="1.2" fill="#FFFFFF" />
          </svg>
        );

      // 👂 قسم أذن وأنف وحنجرة (KBB): أذن وموجات صوتية 3D
      case 'KULAK BURUN BOĞAZ (KBB)':
        return (
          <svg className={className} viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="kbb_ear" x1="0" y1="0" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
            <path d="M 19 5 C 14 5 9.5 9 9.5 14 C 9.5 18 11.5 21 14 23.5 C 15.5 25 16 26.5 16 28 C 16 29.5 15 30.5 13.5 30.5" stroke="url(#kbb_ear)" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 16 12 C 14.5 12 13.5 13.5 13.5 15.5 C 13.5 17.5 15 18.5 16 18.5" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 25 11 C 27.5 13.5 27.5 17.5 25 20 M 29 7 C 34 12 34 20 29 25" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      // 🔬 قسم الأشعة والتصوير (USG): مسبار تصوير إيكو 3D وأمواج السونار
      case 'RADYOLOJİ (USG)':
        return (
          <svg className={className} viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="rad_probe" x1="0" y1="0" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#3730A3" />
              </linearGradient>
            </defs>
            <rect x="13" y="3" width="10" height="14" rx="3.5" fill="url(#rad_probe)" />
            <rect x="15" y="17" width="6" height="4" fill="#1E1B4B" />
            <path d="M 9 24 C 14.5 21, 21.5 21, 27 24 M 6 29 C 13.5 25, 22.5 25, 30 29" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      // 🔍 قسم الجلدية: عدسة مكبرة وفحص 3D على مسام الجلد
      case 'DERMATOLOJİ':
        return (
          <svg className={className} viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="der_lens" x1="0" y1="0" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6EE7B7" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
            </defs>
            <path d="M 4 26 C 8.5 23, 13.5 23, 18 26 C 22.5 29, 27.5 29, 32 26" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
            <path d="M 4 31 C 8.5 28, 13.5 28, 18 31 C 22.5 34, 27.5 34, 32 31" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
            <circle cx="17" cy="12" r="7.5" fill="url(#der_lens)" opacity="0.45" stroke="#047857" strokeWidth="3" />
            <circle cx="14.5" cy="9.5" r="2.2" fill="#FFF" opacity="0.7" />
            <path d="M 23 18 L 30 25" stroke="#047857" strokeWidth="4" strokeLinecap="round" />
          </svg>
        );

      // 🦷 قسم الأسنان: ضرس سيراميك 3D ثلاثي الأبعاد مع لمعان عالي
      case 'DİŞ HEKİMLİĞİ':
        return (
          <svg className={className} viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="dis_tooth" x1="0" y1="0" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F0F9FF" />
                <stop offset="30%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
            </defs>
            <path d="M 10 4 C 14 4 15.5 6 18 9 C 20.5 6 22 4 26 4 C 30 4 33 7 33 11.5 C 33 17 30 23.5 27.5 29.5 C 26 32.5 24 33 22.5 33 C 21 33 20 31.5 19 29 C 18 26.5 17 26.5 16 29 C 15 31.5 14 33 12.5 33 C 11 33 9 32.5 7.5 29.5 C 5 23.5 2 17 2 11.5 C 2 7 5 4 10 4 Z" fill="url(#dis_tooth)" />
            <path d="M 11 10 C 13.5 13, 16 15 18 15 C 20 15, 22.5 13, 25 10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
            <circle cx="24" cy="8" r="1.8" fill="#FFFFFF" />
          </svg>
        );

      // 🫀 قسم القلبية: قلب عالي الدقة 3D مع شريط نبض القلب
      case 'KARDİYOLOJİ':
        return (
          <svg className={className} viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="kar_heart" x1="0" y1="0" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F87171" />
                <stop offset="50%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#7F1D1D" />
              </linearGradient>
            </defs>
            <path d="M 18 32 L 15.8 30 C 8 23 3 18.2 3 12.5 C 3 7.8 6.7 4 11.4 4 C 14 4 16.5 5.2 18 7.2 C 19.5 5.2 22 4 24.6 4 C 29.3 4 33 7.8 33 12.5 C 33 18.2 28 23 20.2 30 L 18 32 Z" fill="url(#kar_heart)" />
            <path d="M 5 18 H 10 L 12.5 12 L 17 24 L 20.5 15 L 23 18 H 31" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      // 🤲 قسم الرعاية التلطيفية (Palyatif): قلب ودعم 3D
      case 'PALYATİF':
        return (
          <svg className={className} viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="pal_heart" x1="0" y1="0" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FB7185" />
                <stop offset="100%" stopColor="#BE123C" />
              </linearGradient>
            </defs>
            <path d="M 18 32 L 15.8 30 C 8 23 3 18.2 3 12.5 C 3 7.8 6.7 4 11.4 4 C 14 4 16.5 5.2 18 7.2 C 19.5 5.2 22 4 24.6 4 C 29.3 4 33 7.8 33 12.5 C 33 18.2 28 23 20.2 30 L 18 32 Z" fill="url(#pal_heart)" />
            <path d="M 9 24 C 12.5 26, 15.5 26.5 18 26.5 C 20.5 26.5 23.5 26, 27 24" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
          </svg>
        );

      // 🩺 قسم الداخلية: سماعة طبيب كروم 3D فاخرة
      case 'İÇ HASTALIKLARI (DAHİLİYE)':
      default:
        return (
          <svg className={className} viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="dah_steth" x1="0" y1="0" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#1E40AF" />
              </linearGradient>
            </defs>
            <path d="M 9 4 V 12 C 9 17, 13 21, 18 21 C 23 21, 27 17, 27 12 V 4" stroke="url(#dah_steth)" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 18 21 V 27 C 18 29.5 20.5 32 23 32 H 25 C 26.5 32 28 31 28 29.5 V 28" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="28" cy="27" r="3.5" fill="#1E40AF" stroke="#93C5FD" strokeWidth="1.8" />
            <circle cx="9" cy="4" r="1.8" fill="#1D4ED8" />
            <circle cx="27" cy="4" r="1.8" fill="#1D4ED8" />
          </svg>
        );
    }
  };

  return (
    <div className="inline-flex items-center justify-center shrink-0 drop-shadow-md transition-transform hover:scale-110">
      {renderIcon(name)}
    </div>
  );
}