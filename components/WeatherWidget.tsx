'use client';

import { useState, useEffect, useRef } from 'react';
import { Cloud, CloudRain, Sun, Moon, CloudLightning, X, MapPin, Wind, Droplets, CloudOff, CloudSun, Search, Calendar, Clock, LocateFixed, LayoutList } from 'lucide-react';

/* ==================== AUDIO SYNTHESIZER FOR THUNDER ==================== */
const playThunderSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    const bufferSize = ctx.sampleRate * 2.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.5);
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    noiseSource.start();
  } catch (e) {
    console.log('Audio playback failed', e);
  }
};

/* ==================== HELPERS ==================== */
const getWeatherType = (code: number) => {
  if (code === 0) return 'sunny';
  if (code >= 1 && code <= 3) return 'cloudy';
  if (code >= 51 && code <= 67) return 'rain';
  if (code >= 80 && code <= 82) return 'rain';
  if (code >= 95 && code <= 99) return 'thunder';
  return 'cloudy';
};

const getWeatherIcon = (type: string, size = "w-5 h-5", isDay = true) => {
  switch (type) {
    case 'sunny': return isDay ? <Sun className={`${size} text-amber-400`} /> : <Moon className={`${size} text-slate-200`} />;
    case 'rain': return <CloudRain className={`${size} text-blue-400`} />;
    case 'thunder': return <CloudLightning className={`${size} text-purple-400`} />;
    default: return <Cloud className={`${size} text-slate-300`} />;
  }
};

const getWeatherText = (type: string, isDay = true) => {
  switch (type) {
    case 'sunny': return isDay ? 'Güneşli' : 'Açık';
    case 'rain': return 'Sağanak Yağışlı';
    case 'thunder': return 'Gök Gürültülü';
    default: return 'Bulutlu';
  }
};

export default function WeatherWidget({ isDarkMode }: { isDarkMode: boolean }) {
  const [weather, setWeather] = useState<any>(null);
  const [locationName, setLocationName] = useState('Konum Aranıyor...');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  // Loading States
  const [loading, setLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // View State (Hourly, Daily, Weekly)
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily' | 'weekly'>('weekly');
  const [showTabsMenu, setShowTabsMenu] = useState(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch Weather
  const fetchData = async (lat: number, lon: number, isGps = false) => {
    try {
      if (isGps) setIsLocating(true);
      else setLoading(true);

      const [weatherRes, geoRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`),
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=tr`)
      ]);

      if (!weatherRes.ok) throw new Error("Weather API failed");

      const weatherData = await weatherRes.json();
      const geoData = geoRes.ok ? await geoRes.json() : {};

      setLocationName(geoData.city || geoData.locality || geoData.principalSubdivision || 'Mevcut Konum');

      setWeather({
        temp: Math.round(weatherData.current.temperature_2m),
        humidity: weatherData.current.relative_humidity_2m,
        wind: Math.round(weatherData.current.wind_speed_10m),
        type: getWeatherType(weatherData.current.weather_code),
        isDay: weatherData.current.is_day === 1,
        hourly: weatherData.hourly,
        daily: weatherData.daily
      });
    } catch (err) {
      console.error("Veri çekme hatası:", err);
      // Fallback weather data if API fails
      if (!weather) {
        setWeather({
          temp: 20, humidity: 50, wind: 10, type: 'cloudy', isDay: true,
          hourly: { time: Array(24).fill(new Date().toISOString()), temperature_2m: Array(24).fill(20), weather_code: Array(24).fill(3) },
          daily: { time: Array(7).fill(new Date().toISOString()), weather_code: Array(7).fill(3), temperature_2m_max: Array(7).fill(22), temperature_2m_min: Array(7).fill(15) }
        });
        setLocationName('Varsayılan Konum');
      }
    } finally {
      setIsLocating(false);
      setLoading(false);
    }
  };

  // 🚀 1. عند فتح الصفحة: استخدام موقع افتراضي (إسطنبول) لمنع تجميد المتصفح
  useEffect(() => {
    fetchData(41.0082, 28.9784);
  }, []);

  // 📍 2. طلب الموقع الحقيقي فقط عند الضغط على الزر
  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchData(pos.coords.latitude, pos.coords.longitude, true);
        },
        (err) => {
          console.error("Konum hatası:", err);
          setIsLocating(false);
          // إظهار رسالة واضحة للمستخدم إذا كان الموقع غير مفعل في النظام
          if (err.code === err.PERMISSION_DENIED) {
            alert("Konum izni verilmedi! Lütfen tarayıcı veya işletim sistemi ayarlarından konum iznini açın.");
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            alert("Konum bilgisi kullanılamıyor. Lütfen cihazınızın konum servislerini açın.");
          } else if (err.code === err.TIMEOUT) {
            alert("Konum alınamadı (Zaman aşımı). Lütfen tekrar deneyin.");
          } else {
            alert("Konum alınamadı. Lütfen tekrar deneyin.");
          }
        },
        { timeout: 10000, enableHighAccuracy: false } // timeout after 10s
      );
    } else {
      alert("Tarayıcınız konum özelliğini desteklemiyor.");
    }
  };

  // Click Outside (Search & Tabs Menu)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
        setShowTabsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fast Search Logic
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) { setSearchResults([]); setIsSearching(false); return; }
    
    setIsSearching(true);
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${searchQuery}&count=5&language=tr&format=json`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (e) {}
      setIsSearching(false);
    }, 400);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // Thunder Sound
  useEffect(() => {
    if (isExpanded && weather?.type === 'thunder') {
      playThunderSound();
      const interval = setInterval(playThunderSound, 8000);
      return () => clearInterval(interval);
    }
  }, [isExpanded, weather]);

  // Prevent background scrolling
  useEffect(() => {
    if (isExpanded) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isExpanded]);

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)} 
        className="absolute top-4 left-1/2 -translate-x-1/2 z-50 group flex items-center gap-2 p-2 rounded-full hover:bg-white/10 transition-all overflow-hidden"
      >
        <CloudSun className="w-5 h-5 text-slate-500 group-hover:text-blue-500 transition-colors" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 transition-all duration-300">
          Hava durumu göster
        </span>
      </button>
    );
  }

  if (loading) return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full z-50 bg-white/20 dark:bg-slate-800/50 backdrop-blur-md">
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Yükleniyor...</span>
    </div>
  );

  if (!weather) return null;

  /* ==================== CHART RENDERER ==================== */
  const renderChart = () => {
    if (!weather.daily.time || weather.daily.time.length === 0) return null;
    
    const days = weather.daily.time.slice(0, 7);
    const maxTemps = weather.daily.temperature_2m_max.slice(0, 7);
    const minTemps = weather.daily.temperature_2m_min.slice(0, 7);
    
    const width = 600;
    const height = 160;
    const paddingX = 40;
    const paddingY = 30;
    
    const maxVal = Math.max(...maxTemps) + 2;
    const minVal = Math.min(...minTemps) - 2;
    const range = maxVal - minVal || 1;
    
    const getX = (index: number) => paddingX + (index * ((width - paddingX * 2) / (days.length - 1)));
    const getY = (temp: number) => height - paddingY - ((temp - minVal) / range) * (height - paddingY * 2);

    const maxPath = maxTemps.map((t: number, i: number) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(t)}`).join(' ');
    const minPath = minTemps.map((t: number, i: number) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(t)}`).join(' ');

    return (
      <div className="w-full flex justify-center mt-2">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" preserveAspectRatio="xMidYMid meet">
          <path d={maxPath} fill="none" stroke="#a3e635" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={minPath} fill="none" stroke="#65a30d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          
          {days.map((day: string, i: number) => {
            const dateObj = new Date(day);
            const dayName = i === 0 ? 'Bugün' : i === 1 ? 'Yarın' : dateObj.toLocaleDateString('tr-TR', { weekday: 'short' });
            const wType = getWeatherType(weather.daily.weather_code[i]);
            
            return (
              <g key={i}>
                <text x={getX(i)} y={15} textAnchor="middle" className="text-[11px] font-bold fill-white/70">{dayName}</text>
                <foreignObject x={getX(i) - 12} y={25} width="24" height="24">
                  <div className="flex justify-center">{getWeatherIcon(wType, "w-5 h-5", true)}</div>
                </foreignObject>

                <circle cx={getX(i)} cy={getY(maxTemps[i])} r="4" fill="#a3e635" stroke="#1e293b" strokeWidth="2" />
                <text x={getX(i)} y={getY(maxTemps[i]) - 10} textAnchor="middle" className="text-[12px] font-black fill-white">{Math.round(maxTemps[i])}°</text>
                
                <circle cx={getX(i)} cy={getY(minTemps[i])} r="4" fill="#65a30d" stroke="#1e293b" strokeWidth="2" />
                <text x={getX(i)} y={getY(minTemps[i]) + 18} textAnchor="middle" className="text-[12px] font-black fill-white/50">{Math.round(minTemps[i])}°</text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <>
      {/* MINIMAL WIDGET */}
      <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ${isExpanded ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
        <div 
          onClick={() => setIsExpanded(true)}
          role="button"
          tabIndex={0}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-transparent hover:bg-white/10 dark:hover:bg-slate-800/30 transition-all active:scale-95 cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            {getWeatherIcon(weather.type, "w-5 h-5", weather.isDay)}
            <div className="absolute -inset-1 bg-current opacity-20 blur-md rounded-full group-hover:opacity-40 transition-opacity" />
          </div>
          <div className="text-sm font-black text-slate-800 dark:text-white leading-none">{weather.temp}°C</div>
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
          <button 
            onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
            className="p-1 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-500 z-10 transition-colors"
          >
            <CloudOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FULL IMMERSIVE WEATHER MODAL */}
      {isExpanded && (
        <div className="fixed inset-0 z-[9999] w-screen h-[100dvh] overflow-hidden flex flex-col font-sans bg-black">
          
          {/* ==================== REALISTIC DYNAMIC BACKGROUND ==================== */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden transition-colors duration-1000">
            
            {/* Sky Gradient */}
            <div className={`absolute inset-0 transition-colors duration-1000 ${
              weather.isDay ? (
                weather.type === 'sunny' ? 'bg-gradient-to-b from-[#4ba3e3] via-[#1e6d9e] to-[#0c121e]' :
                weather.type === 'rain' ? 'bg-gradient-to-b from-[#64748b] via-[#334155] to-[#0f172a]' :
                'bg-gradient-to-b from-[#94a3b8] via-[#475569] to-[#1e293b]'
              ) : (
                weather.type === 'sunny' ? 'bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#000000]' :
                weather.type === 'rain' ? 'bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#000000]' :
                'bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#000000]'
              )
            }`} />

            {/* Stars (Only at Night if Sunny/Partly Cloudy) */}
            {!weather.isDay && weather.type !== 'rain' && weather.type !== 'thunder' && (
              <div className="absolute inset-0">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute bg-white rounded-full animate-[twinkle_3s_ease-in-out_infinite]"
                    style={{ 
                      width: `${Math.random() * 2 + 1}px`, 
                      height: `${Math.random() * 2 + 1}px`,
                      top: `${Math.random() * 60}%`, 
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`,
                      opacity: Math.random() * 0.8 + 0.2
                    }} 
                  />
                ))}
              </div>
            )}

            {/* Sun / Moon Glow */}
            {(weather.type === 'sunny' || weather.type === 'partly-cloudy') && (
              <div className={`absolute top-[5%] right-[10%] w-[50vw] h-[50vw] max-w-[400px] max-h-[400px] rounded-full blur-[100px] opacity-60 animate-pulse ${
                weather.isDay ? 'bg-yellow-300' : 'bg-slate-300'
              }`} />
            )}

            {/* Realistic Volumetric Clouds */}
            {weather.type !== 'sunny' && (
              <div className="absolute inset-0">
                <div className="absolute top-[-10%] left-[-20%] w-[80vw] h-[50vh] rounded-full blur-[120px] animate-[moveCloud_60s_linear_infinite]" 
                     style={{ backgroundColor: weather.isDay ? '#94a3b8' : '#1e293b', opacity: 0.4 }} />
                
                <div className="absolute top-[20%] right-[-30%] w-[90vw] h-[40vh] rounded-full blur-[100px] animate-[moveCloud_80s_linear_infinite_reverse]" 
                     style={{ backgroundColor: weather.isDay ? '#cbd5e1' : '#334155', opacity: 0.5 }} />
                
                {(weather.type === 'rain' || weather.type === 'thunder') && (
                  <div className="absolute bottom-[0%] left-[-10%] w-[70vw] h-[40vh] rounded-full blur-[90px] animate-[moveCloud_50s_linear_infinite]" 
                       style={{ backgroundColor: '#0f172a', opacity: 0.6 }} />
                )}
              </div>
            )}

            {/* Rain Animation */}
            {(weather.type === 'rain' || weather.type === 'thunder') && (
              <div className="absolute inset-0 opacity-40">
                {Array.from({ length: 80 }).map((_, i) => (
                  <div key={i} className="absolute w-[1.5px] bg-gradient-to-b from-transparent via-white to-transparent animate-[rainDrop_linear_infinite]" 
                       style={{ 
                         left: `${Math.random() * 100}%`, 
                         height: `${20 + Math.random() * 30}px`, 
                         animationDuration: `${0.4 + Math.random() * 0.4}s`, 
                         animationDelay: `${Math.random() * 2}s` 
                       }} />
                ))}
              </div>
            )}
          </div>

          {/* ==================== TOP BAR ==================== */}
          <div className="relative z-20 w-full flex justify-between items-start p-6 pt-10 shrink-0">
            
            {/* Location Info */}
            <div className="text-white drop-shadow-md flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-black tracking-wide flex items-center gap-2">{locationName}</h1>
                <p className="text-white/80 text-sm font-medium mt-1">
                  {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <button 
                onClick={handleGetLocation} 
                disabled={isLocating} 
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all border border-white/10 group" 
                title="Mevcut Konumu Güncelle"
              >
                <LocateFixed className={`w-4 h-4 text-white ${isLocating ? 'animate-[spin_2s_linear_infinite]' : 'group-hover:scale-110'}`} />
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 relative" ref={searchRef}>
              
              {/* Menu (Tabs) Button */}
              <button 
                onClick={() => { setShowTabsMenu(!showTabsMenu); setShowSearch(false); }} 
                className={`p-2.5 rounded-full backdrop-blur-md text-white transition-all border border-white/10 ${showTabsMenu ? 'bg-white/30' : 'bg-black/20 hover:bg-black/40'}`}
                title="Tahmin Seçenekleri"
              >
                <LayoutList className="w-5 h-5" />
              </button>

              {/* Tabs Dropdown */}
              {showTabsMenu && (
                <div className="absolute top-full right-20 mt-3 w-40 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 flex flex-col gap-1">
                  <button onClick={() => { setActiveTab('hourly'); setShowTabsMenu(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'hourly' ? 'bg-blue-500 text-white' : 'text-white/80 hover:bg-white/10'}`}>Saatlik (24s)</button>
                  <button onClick={() => { setActiveTab('daily'); setShowTabsMenu(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'daily' ? 'bg-blue-500 text-white' : 'text-white/80 hover:bg-white/10'}`}>Günlük</button>
                  <button onClick={() => { setActiveTab('weekly'); setShowTabsMenu(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'weekly' ? 'bg-blue-500 text-white' : 'text-white/80 hover:bg-white/10'}`}>Haftalık</button>
                </div>
              )}

              {/* Search Button */}
              <button 
                onClick={() => { setShowSearch(!showSearch); setShowTabsMenu(false); }} 
                className={`p-2.5 rounded-full backdrop-blur-md text-white transition-all border border-white/10 ${showSearch ? 'bg-white/30' : 'bg-black/20 hover:bg-black/40'}`}
              >
                <Search className="w-5 h-5" />
              </button>
              
              {/* Close Button */}
              <button 
                onClick={() => setIsExpanded(false)} 
                className="p-2.5 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white transition-all border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Search Dropdown */}
              {showSearch && (
                <div className="absolute top-full right-0 mt-3 w-72 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
                  <div className="relative">
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Şehir ara..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-black/40 text-white rounded-xl text-sm outline-none border border-white/10 placeholder-white/40"
                    />
                    <Search className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                    {isSearching && <div className="absolute right-3 top-3 w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />}
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-2 max-h-48 overflow-y-auto scrollbar-none">
                      {searchResults.map((res: any) => (
                        <button 
                          key={res.id} 
                          onClick={() => { fetchData(res.latitude, res.longitude); setSearchResults([]); setSearchQuery(''); setShowSearch(false); }}
                          className="w-full text-left px-3 py-2.5 text-sm text-white/90 hover:bg-white/10 rounded-lg transition-colors border-b border-white/5 last:border-0 flex justify-between items-center"
                        >
                          <span>{res.name}</span>
                          <span className="text-white/40 text-xs">{res.country}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ==================== MAIN CONTENT ==================== */}
          <div className="relative z-20 flex-1 flex flex-col justify-between overflow-hidden max-w-5xl mx-auto w-full px-4 pb-6">
            
            {/* HUGE TEMPERATURE */}
            <div className="flex-1 flex flex-col items-center justify-center pt-4">
              <div className="flex items-start justify-center">
                <h2 className="text-[7rem] md:text-[10rem] font-thin text-white leading-none tracking-tighter drop-shadow-2xl">
                  {weather.temp}
                </h2>
                <span className="text-5xl md:text-6xl font-thin text-white mt-4 md:mt-6 drop-shadow-xl">°</span>
              </div>
              <p className="text-lg md:text-xl text-white font-semibold drop-shadow-md text-center">
                {getWeatherText(weather.type, weather.isDay)} 
                <span className="text-white/70 ml-2">{Math.round(weather.daily.temperature_2m_max[0])}° / {Math.round(weather.daily.temperature_2m_min[0])}°</span>
              </p>
            </div>

            {/* BOTTOM FORECAST CARD */}
            <div className="w-full bg-black/30 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-2xl shrink-0 h-[180px] flex flex-col">
              
              <div className="flex justify-between items-center mb-2 px-2">
                <h3 className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                  {activeTab === 'hourly' && '24 Saatlik Tahmin'}
                  {activeTab === 'daily' && 'Günlük Tahmin'}
                  {activeTab === 'weekly' && '7 Günlük Tahmin'}
                </h3>
              </div>

              {/* Tabs Content */}
              <div className="flex-1 overflow-y-auto scrollbar-none px-2">
                
                {/* WEEKLY */}
                {activeTab === 'weekly' && (
                  <div className="h-full flex flex-col justify-center animate-in fade-in">
                    {renderChart()}
                  </div>
                )}

                {/* HOURLY */}
                {activeTab === 'hourly' && (
                  <div className="flex gap-4 overflow-x-auto scrollbar-none items-center h-full animate-in fade-in">
                    {weather.hourly.time.slice(0, 24).map((t: string, i: number) => (
                      <div key={i} className="flex flex-col items-center justify-center min-w-[50px] p-2 rounded-xl hover:bg-white/10 transition-colors">
                        <span className="text-[10px] font-bold text-white/60">{new Date(t).getHours()}:00</span>
                        <div className="my-2">{getWeatherIcon(getWeatherType(weather.hourly.weather_code[i]), "w-5 h-5", true)}</div>
                        <span className="text-xs font-black text-white">{Math.round(weather.hourly.temperature_2m[i])}°</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* DAILY */}
                {activeTab === 'daily' && (
                  <div className="space-y-2 animate-in fade-in h-full overflow-y-auto">
                    {weather.hourly.time.slice(0, 10).map((t: string, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white/60 w-12">{new Date(t).getHours()}:00</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full mx-3 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-400 via-green-400 to-amber-400 rounded-full" style={{ width: `${Math.max(10, (weather.hourly.temperature_2m[i] / 40) * 100)}%` }} />
                        </div>
                        <span className="text-[11px] font-black text-white w-8 text-right">{Math.round(weather.hourly.temperature_2m[i])}°</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* GLOBAL CSS FOR ANIMATIONS */}
      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes moveCloud {
          0% { transform: translateX(0); }
          100% { transform: translateX(50vw); }
        }
        @keyframes rainDrop {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </>
  );
}