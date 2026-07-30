import React, { useState, useEffect, useRef, useCallback, useMemo, useReducer } from 'react';
import ReactDOM from 'react-dom/client';
import {
  Sparkles, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Flame, Clock,
  Plus, Check, X, Trash2, Maximize2, Minimize2, Music, BookOpen, Palette,
  Upload, BarChart2, CloudSun, Edit2, ArrowRight, Calendar, Volume2, Settings
} from 'lucide-react';

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,600;0,800;1,400&family=Quicksand:wght@500;700&family=Caveat:wght@400;700&family=Comfortaa:wght@400;700&display=swap');`;

const MONTH_PASTEL_GRADIENTS = [
  "linear-gradient(135deg, rgba(255, 209, 220, 0.25) 0%, rgba(255, 230, 240, 0.1) 100%)",
  "linear-gradient(135deg, rgba(208, 224, 255, 0.25) 0%, rgba(230, 240, 255, 0.1) 100%)",
  "linear-gradient(135deg, rgba(210, 245, 225, 0.25) 0%, rgba(235, 255, 242, 0.1) 100%)",
  "linear-gradient(135deg, rgba(255, 224, 204, 0.25) 0%, rgba(255, 240, 230, 0.1) 100%)",
  "linear-gradient(135deg, rgba(243, 207, 255, 0.25) 0%, rgba(250, 230, 255, 0.1) 100%)",
  "linear-gradient(135deg, rgba(255, 250, 204, 0.25) 0%, rgba(255, 252, 230, 0.1) 100%)",
  "linear-gradient(135deg, rgba(204, 245, 255, 0.25) 0%, rgba(230, 252, 255, 0.1) 100%)",
  "linear-gradient(135deg, rgba(255, 218, 233, 0.25) 0%, rgba(255, 235, 245, 0.1) 100%)",
  "linear-gradient(135deg, rgba(220, 237, 210, 0.25) 0%, rgba(238, 247, 232, 0.1) 100%)",
  "linear-gradient(135deg, rgba(255, 230, 210, 0.25) 0%, rgba(255, 242, 232, 0.1) 100%)",
  "linear-gradient(135deg, rgba(225, 215, 250, 0.25) 0%, rgba(240, 235, 255, 0.1) 100%)",
  "linear-gradient(135deg, rgba(210, 235, 245, 0.25) 0%, rgba(232, 246, 252, 0.1) 100%)",
];

const MONTH_DOODLES = ["❄️", "💗", "🌱", "🌸", "🌿", "☀️", "🏖️", "🌻", "🍁", "🎃", "🍂", "🎄"];

const FONTS = {
  default: { name: "System Default", font: "sans-serif" },
  fredoka: { name: "Fredoka", font: "'Fredoka', sans-serif" },
  jakarta: { name: "Plus Jakarta Sans", font: "'Plus Jakarta Sans', sans-serif" },
  playfair: { name: "Playfair Display", font: "'Playfair Display', serif" },
  quicksand: { name: "Quicksand", font: "'Quicksand', sans-serif" },
  caveat: { name: "Caveat", font: "'Caveat', cursive" },
  comfortaa: { name: "Comfortaa", font: "'Comfortaa', sans-serif" },
};

const THEMES = {
  ghibli: {
    id: "ghibli", name: "Cosmic Ghibli", font: "'Plus Jakarta Sans', 'Fredoka', sans-serif",
    bgImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80')",
    bgColor: "#1B1726", cardBg: "rgba(42, 34, 58, 0.55)", cardBorder: "rgba(255, 235, 245, 0.2)",
    accent: "#F2C6DE", textColor: "#F3EFF8",
  },
  cat: {
    id: "cat", name: "Warm Cat 🐾", font: "'Fredoka', 'Quicksand', sans-serif",
    bgImage: "url('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1920&q=80')",
    bgColor: "#2A1F1B", cardBg: "rgba(68, 48, 40, 0.75)", cardBorder: "rgba(247, 198, 179, 0.35)",
    accent: "#F7C6B3", textColor: "#FAF0CA",
  },
  butterfly: {
    id: "butterfly", name: "Fairy Butterfly 🦋", font: "'Quicksand', sans-serif",
    bgImage: "url('https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=1920&q=80')",
    bgColor: "#1E1A2B", cardBg: "rgba(48, 38, 72, 0.7)", cardBorder: "rgba(215, 185, 255, 0.3)",
    accent: "#D7B9FF", textColor: "#F5EEFF",
  },
  raining: {
    id: "raining", name: "Cozy Rain 🌧️", font: "'Plus Jakarta Sans', sans-serif",
    bgImage: "none", bgColor: "#121A21", cardBg: "rgba(26, 38, 48, 0.65)",
    cardBorder: "rgba(160, 210, 235, 0.25)", accent: "#9CD5EC", textColor: "#E6F4F8",
  },
  custom: {
    id: "custom", name: "Custom Wallpaper ✨", font: "'Plus Jakarta Sans', sans-serif",
    bgImage: "none", bgColor: "#14111D", cardBg: "rgba(30, 25, 42, 0.65)",
    cardBorder: "rgba(255, 215, 235, 0.3)", accent: "#FFD1DC", textColor: "#FFFFFF",
  }
};

const TIME_OPTIONS_12H = (() => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      const mm = m === 0 ? '00' : '30';
      times.push(`${h12}:${mm} ${period}`);
    }
  }
  return times;
})();

// Utility: Format dates
function toKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function fromKey(k) {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(d, n) {
  const res = new Date(d);
  res.setDate(res.getDate() + n);
  return res;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatLiveClock(d) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatPomoTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function dayLabel(d) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatAudioTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
// ============ CUSTOM HOOKS ============

// useLocalStorage: Persistent state with auto-sync
function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(initialValue)); }
    catch { return initialValue; }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [state, key]);

  return [state, setState];
}

// usePomodoro: Timer logic isolated
function usePomodoro(focusHours, focusMins, breakHours, breakMins, timerType) {
  const [pomoTime, setPomoTime] = useState(() => (timerType === 'focus' ? (focusHours * 60 + focusMins) * 60 : (breakHours * 60 + breakMins) * 60));
  const [pomoActive, setPomoActive] = useState(false);
  const audioContextRef = useRef(null);

  // Timer loop
  useEffect(() => {
    let interval = null;
    if (pomoActive && pomoTime > 0) {
      interval = setInterval(() => setPomoTime((t) => t - 1), 1000);
    } else if (pomoTime === 0 && pomoActive) {
      triggerTimerAlarm();
      setPomoActive(false);
    }
    return () => clearInterval(interval);
  }, [pomoActive, pomoTime]);

  const triggerTimerAlarm = useCallback(() => {
    // Audio alarm
    try {
      const ctx = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {}

    // Vibration
    if (navigator.vibrate) {
      navigator.vibrate([300, 150, 300]);
    }
  }, []);

  const reset = useCallback((h, m, mode) => {
    setPomoActive(false);
    setPomoTime((h * 60 + m) * 60);
  }, []);

  return { pomoTime, setPomoTime, pomoActive, setPomoActive, reset };
}

// useTaskMetrics: Calculate all metrics
function useTaskMetrics(tasksByDate, viewKey) {
  return useMemo(() => {
    let totalTasks = 0, totalAchieved = 0, maxProdDays = 0, minProdDays = 0, inBetweenDays = 0;
    const maxDates = [], minDates = [], inBetweenDates = [];

    Object.keys(tasksByDate).forEach((key) => {
      const dayTasks = tasksByDate[key] || [];
      if (dayTasks.length > 0) {
        const achieved = dayTasks.filter((t) => t.status === 'achieved').length;
        const rate = achieved / dayTasks.length;
        if (rate >= 0.9) { maxProdDays++; maxDates.push(key); }
        else if (rate <= 0.5) { minProdDays++; minDates.push(key); }
        else { inBetweenDays++; inBetweenDates.push(key); }
      }
    });

    const currentTasks = tasksByDate[viewKey] || [];
    if (currentTasks.length > 0) {
      totalTasks = currentTasks.length;
      totalAchieved = currentTasks.filter((t) => t.status === 'achieved').length;
    }

    const rate = totalTasks > 0 ? Math.round((totalAchieved / totalTasks) * 100) : 0;
    return { totalTasks, totalAchieved, rate, maxProdDays, minProdDays, inBetweenDays, maxDates, minDates, inBetweenDates };
  }, [tasksByDate, viewKey]);
}

// useStreakCalculation: Calculate current streak
function useStreakCalculation(tasksByDate, today) {
  return useMemo(() => {
    const loggedKeys = Object.keys(tasksByDate).filter(key => tasksByDate[key]?.length > 0);
    if (loggedKeys.length === 0) return 0;

    let currentStreak = 0;
    let checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayStr = toKey(checkDate);

    if (!tasksByDate[todayStr]?.length) {
      checkDate = addDays(checkDate, -1);
    }

    while (true) {
      const key = toKey(checkDate);
      const dayTasks = tasksByDate[key];
      if (dayTasks?.length > 0 && dayTasks.some(t => t.status === 'achieved')) {
        currentStreak++;
        checkDate = addDays(checkDate, -1);
      } else {
        break;
      }
    }
    return currentStreak;
  }, [tasksByDate, today]);
}

// useNaamJaapStats: Calculate Jaap statistics
function useNaamJaapStats(jaapData, todayKey) {
  return useMemo(() => {
    const todayJaap = jaapData[todayKey] || 0;
    const jaapValues = Object.values(jaapData).map(v => Number(v) || 0);
    const totalAllTime = jaapValues.reduce((a, b) => a + b, 0);
    const activeDays = Object.keys(jaapData).filter(k => (jaapData[k] || 0) > 0).length;
    const highestSingleDay = jaapValues.length > 0 ? Math.max(...jaapValues, 0) : 0;
    const averagePerDay = activeDays > 0 ? Math.round(totalAllTime / activeDays) : 0;
    return { todayJaap, totalAllTime, activeDays, highestSingleDay, averagePerDay };
  }, [jaapData, todayKey]);
}

// useNaamJaapProgress: Track progress to next 108
function useNaamJaapProgress(count) {
  return useMemo(() => {
    const progress = (count % 108) / 108 * 100;
    const nextMilestone = Math.ceil(count / 108) * 108;
    return { progress, nextMilestone, completedLaps: Math.floor(count / 108) };
  }, [count]);
}

// useTapSound: Generate subtle tap sound on demand
function useTapSound() {
  const audioContextRef = useRef(null);

  const playTap = useCallback(() => {
    try {
      const ctx = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = ctx;
      
      // Soft woodblock-like sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }, []);

  return playTap;
}

// useWeather: Fetch weather data
function useWeather() {
  const [weather, setWeather] = useState({ temp: '--', icon: '🌤️', desc: 'Loading weather...' });

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const data = await res.json();
            if (data?.current_weather) {
              const code = data.current_weather.weathercode;
              let icon = '☀️';
              if (code >= 1 && code <= 3) icon = '⛅';
              else if (code >= 45 && code <= 48) icon = '🌫️';
              else if (code >= 51 && code <= 67) icon = '🌧️';
              else if (code >= 71) icon = '❄️';
              else if (code >= 95) icon = '🌩️';
              setWeather({ temp: `${Math.round(data.current_weather.temperature)}°C`, icon, desc: 'Local Weather' });
            }
          } catch {
            setWeather({ temp: '24°C', icon: '🌤️', desc: 'Sunny' });
          }
        },
        () => setWeather({ temp: '24°C', icon: '🌤️', desc: 'Sunny' })
      );
    }
  }, []);

  return weather;
}
// ============ SVG COMPONENTS ============

// Radial Progress Circle for Naam Jaap
function RadialProgressCircle({ count, radius = 80, strokeWidth = 6, accentColor = "#F2C6DE" }) {
  const progress = (count % 108) / 108;
  const circumference = 2 * Math.PI * (radius - strokeWidth / 2);
  const offset = circumference * (1 - progress);

  return (
    <svg width={radius * 2} height={radius * 2} style={{ position: 'absolute', inset: 0 }}>
      <circle
        cx={radius}
        cy={radius}
        r={radius - strokeWidth / 2}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={radius}
        cy={radius}
        r={radius - strokeWidth / 2}
        fill="none"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.3s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
    </svg>
  );
}

// Mountain Doodle Footer
function MountainDoodle({ accentColor = "#F2C6DE", opacity = 0.3 }) {
  return (
    <svg viewBox="0 0 1200 100" preserveAspectRatio="none" style={{ width: '100%', height: 80, opacity }}>
      <defs>
        <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={accentColor} stopOpacity={opacity} />
          <stop offset="100%" stopColor={accentColor} stopOpacity={opacity * 0.2} />
        </linearGradient>
      </defs>
      
      {/* Mountain peaks */}
      <path
        d="M 0 80 L 150 30 L 280 60 L 400 20 L 550 50 L 700 25 L 850 55 L 1000 35 L 1150 65 L 1200 40 L 1200 100 L 0 100 Z"
        fill="url(#mountainGrad)"
        stroke={accentColor}
        strokeWidth="1.5"
        strokeOpacity={opacity}
      />
      
      {/* Snow caps */}
      <path d="M 150 30 L 165 45 L 135 45 Z" fill={accentColor} opacity={opacity * 1.5} />
      <path d="M 400 20 L 420 35 L 380 35 Z" fill={accentColor} opacity={opacity * 1.5} />
      <path d="M 700 25 L 720 40 L 680 40 Z" fill={accentColor} opacity={opacity * 1.5} />
    </svg>
  );
}

// Ghibli-style breathing cloud
function BreathingCloud({ accentColor = "#F2C6DE" }) {
  return (
    <svg viewBox="0 0 200 100" width="200" height="100" style={{ opacity: 0.6 }}>
      <defs>
        <keyframes id="breathe">
          <animate
            attributeName="opacity"
            values="0.3;0.8;0.3"
            dur="4s"
            repeatCount="indefinite"
          />
        </keyframes>
      </defs>
      <ellipse cx="50" cy="50" rx="40" ry="30" fill={accentColor} opacity="0.4" />
      <ellipse cx="100" cy="60" rx="50" ry="35" fill={accentColor} opacity="0.3" />
      <ellipse cx="150" cy="50" rx="40" ry="30" fill={accentColor} opacity="0.4" />
      <style>{`
        @keyframes breathe {
          0% { opacity: 0.3; }
          50% { opacity: 0.8; }
          100% { opacity: 0.3; }
        }
        svg ellipse { animation: breathe 4s ease-in-out infinite; }
      `}</style>
    </svg>
  );
}

// Soft glow pulse animation
function PulseGlow({ size = 160, accentColor = "#F2C6DE" }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <style>{`
        @keyframes pulseRing {
          0% { r: ${size / 2.2}; opacity: 0.8; }
          100% { r: ${size / 1.8}; opacity: 0; }
        }
        .pulse-ring { animation: pulseRing 1.8s ease-out infinite; }
      `}</style>
      <circle className="pulse-ring" cx={size / 2} cy={size / 2} r={size / 2.2} fill="none" stroke={accentColor} strokeWidth="2" />
      <circle className="pulse-ring" cx={size / 2} cy={size / 2} r={size / 2.2} fill="none" stroke={accentColor} strokeWidth="2" style={{ animationDelay: '0.4s' }} />
      <circle className="pulse-ring" cx={size / 2} cy={size / 2} r={size / 2.2} fill="none" stroke={accentColor} strokeWidth="2" style={{ animationDelay: '0.8s' }} />
    </svg>
  );
}
// ============ GLOBAL STYLES ============

function getGlobalStyles(activeThemeObj) {
  return `
    ${FONT_IMPORT}
    body { margin: 0; padding: 0; background: ${activeThemeObj.bgColor}; }
    
    .ghibli-card {
      background: ${activeThemeObj.cardBg};
      border: 1.5px solid ${activeThemeObj.cardBorder};
      border-radius: 28px;
      box-shadow: 0px 16px 36px rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .ghibli-btn {
      border: none;
      border-radius: 999px;
      cursor: pointer;
      font-family: inherit;
      font-weight: 700;
      transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .ghibli-btn:active {
      transform: scale(0.94);
    }
    
    @keyframes clockAura {
      0% { box-shadow: 0 0 10px ${activeThemeObj.accent}40, 0 0 20px ${activeThemeObj.accent}20; }
      50% { box-shadow: 0 0 22px ${activeThemeObj.accent}90, 0 0 32px ${activeThemeObj.accent}50; }
      100% { box-shadow: 0 0 10px ${activeThemeObj.accent}40, 0 0 20px ${activeThemeObj.accent}20; }
    }
    
    .live-clock-badge {
      animation: clockAura 2.8s infinite ease-in-out;
      border: 1.5px solid ${activeThemeObj.accent};
    }
    
    @keyframes rainDrop {
      0% { transform: translateY(-100px); opacity: 0.8; }
      100% { transform: translateY(100vh); opacity: 0.2; }
    }
    
    .rain-line {
      position: fixed;
      background: linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%);
      width: 1.5px;
      height: 50px;
      pointer-events: none;
      z-index: 1;
      animation: rainDrop 1.2s linear infinite;
    }
    
    @keyframes dynamicWaterRise {
      0% { height: 28px; }
      50% { height: 90px; }
      100% { height: 28px; }
    }
    
    @keyframes walkCatContinuous {
      0% { left: -80px; transform: scaleX(1); }
      49% { transform: scaleX(1); }
      50% { left: calc(100vw + 20px); transform: scaleX(-1); }
      99% { transform: scaleX(-1); }
      100% { left: -80px; transform: scaleX(1); }
    }
    
    @keyframes flyUpButterFly {
      0% { opacity: 1; transform: translate(-50%, -50%) scale(0.6) rotate(0deg); }
      50% { opacity: 0.9; transform: translate(-50%, -80px) scale(1.2) rotate(20deg); }
      100% { opacity: 0; transform: translate(-50%, -160px) scale(1.6) rotate(-20deg); }
    }
    
    .jaap-ring-btn {
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: radial-gradient(circle, #F7C5CC 0%, #E898AC 60%, #C4728A 100%);
      border: 6px solid rgba(255, 255, 255, 0.6);
      box-shadow: 0px 12px 30px rgba(232, 152, 172, 0.45);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #1A1221;
      cursor: pointer;
      user-select: none;
      position: relative;
    }
    
    .kw-input {
      background: rgba(24, 20, 34, 0.85);
      border: 1.5px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      padding: 12px 16px;
      color: #FFF;
      font-family: inherit;
    }
    
    .kw-select {
      background: rgba(24, 20, 34, 0.85);
      border: 1.5px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 6px 10px;
      color: #FFF;
      font-family: inherit;
    }
    
    .time-num-input {
      background: rgba(0,0,0,0.35);
      border: 1px solid rgba(255,255,255,0.22);
      color: #FFF;
      border-radius: 10px;
      width: 42px;
      padding: 4px;
      text-align: center;
      font-family: inherit;
      font-weight: 700;
      font-size: 13px;
    }
  `;
}

// ============ REUSABLE COMPONENTS ============

// Modal Wrapper
function Modal({ isOpen, onClose, title, children, maxWidth = 480, theme }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(18, 14, 26, 0.92)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="ghibli-card" style={{ width: "100%", maxWidth, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{title}</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#FFF", borderRadius: "50%", width: 32, height: 32, cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Button Group Selector
function ButtonGroup({ options, selected, onChange, accentColor }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 14 }}>
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className="ghibli-btn"
          style={{
            background: selected === opt.id ? accentColor : "rgba(0,0,0,0.25)",
            color: selected === opt.id ? "#161521" : "#FFF",
            border: "1px solid rgba(255,255,255,0.2)",
            padding: "7px 18px",
            fontSize: 12,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// Input with Label
function LabeledInput({ label, value, onChange, placeholder, type = "text", className }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 700, opacity: 0.7, display: "block", marginBottom: 6 }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        style={{ width: "100%", boxSizing: "border-box" }}
      />
    </div>
  );
}

// Stat Card
function StatCard({ label, value, icon: Icon, onClick, color = "#FFE885" }) {
  return (
    <div
      className="ghibli-card"
      onClick={onClick}
      style={{ padding: 16, cursor: onClick ? "pointer" : "default" }}
    >
      <div style={{ fontSize: 10, letterSpacing: "0.05em", fontWeight: 700, opacity: 0.7, display: "flex", alignItems: "center", gap: 4 }}>
        {Icon && <Icon size={14} />} {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}
// ============ NAAM JAAP COUNTER COMPONENT ============

function NaamJaapCounter({ 
  isOpen, onClose, jaapData, setJaapData, todayKey, today, 
  selectedDate, tasksByDate, activeThemeObj 
}) {
  const jaapStats = useNaamJaapStats(jaapData, todayKey);
  const progress = useNaamJaapProgress(jaapStats.todayJaap);
  const playTap = useTapSound();
  const [showPulse, setShowPulse] = useState(false);

  const addJaapCount = useCallback((amt) => {
    const current = jaapData[todayKey] || 0;
    const nextVal = Math.max(0, current + amt);

    // Trigger pulse on 108 completion
    if (nextVal > 0 && Math.floor(nextVal / 108) > Math.floor(current / 108)) {
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 1800);
    }

    playTap();
    setJaapData((prev) => ({ ...prev, [todayKey]: nextVal }));
  }, [jaapData, todayKey, setJaapData, playTap]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Naam Jaap & Meditation" maxWidth={480} theme={activeThemeObj}>
      {/* Radial Counter with Progress */}
      <div style={{ display: "flex", justifyContent: "center", position: "relative", marginBottom: 30 }}>
        <div style={{ position: "relative", width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <RadialProgressCircle 
            count={jaapStats.todayJaap} 
            radius={80} 
            accentColor={activeThemeObj.accent} 
          />
          
          {/* Center button */}
          <button
            onClick={() => addJaapCount(1)}
            style={{
              position: "relative",
              zIndex: 2,
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${activeThemeObj.accent} 0%, rgba(242, 198, 222, 0.8) 60%)`,
              border: `4px solid rgba(255, 255, 255, 0.8)`,
              boxShadow: `0px 12px 30px rgba(232, 152, 172, 0.45)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#1A1221",
              cursor: "pointer",
              userSelect: "none",
              fontSize: 48,
              fontWeight: 800,
              transition: "transform 0.1s ease"
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {jaapStats.todayJaap}
          </button>

          {/* Pulse on 108 */}
          {showPulse && <PulseGlow size={160} accentColor={activeThemeObj.accent} />}
        </div>
      </div>

      {/* Progress text */}
      <div style={{ textAlign: "center", marginBottom: 20, fontSize: 13, opacity: 0.7 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Progress to next lap: {Math.round(progress.progress)}%</div>
        <div>Completed laps: <span style={{ fontWeight: 800, color: activeThemeObj.accent }}>{progress.completedLaps}</span></div>
      </div>

      {/* Quick add buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: 22, justifyContent: "center", flexWrap: "wrap" }}>
        <button 
          onClick={() => addJaapCount(1)} 
          className="ghibli-btn" 
          style={{ background: "rgba(255,255,255,0.12)", color: "#FFF", padding: "8px 14px", fontSize: 12 }}
        >
          +1
        </button>
        <button 
          onClick={() => addJaapCount(11)} 
          className="ghibli-btn" 
          style={{ background: "rgba(255,255,255,0.12)", color: "#FFF", padding: "8px 14px", fontSize: 12 }}
        >
          +11
        </button>
        <button 
          onClick={() => addJaapCount(-1)} 
          className="ghibli-btn" 
          style={{ background: "rgba(255,255,255,0.06)", color: "#E86F88", padding: "8px 12px", fontSize: 12 }}
        >
          -1
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{
        background: "rgba(0,0,0,0.3)",
        borderRadius: 20,
        padding: 16,
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", opacity: 0.7, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <BarChart2 size={14} color={activeThemeObj.accent} /> STATISTICS
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ background: "rgba(255,255,255,0.06)", padding: "10px 12px", borderRadius: 12 }}>
            <div style={{ fontSize: 10, opacity: 0.6 }}>Total All-Time</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#FFE885", marginTop: 2 }}>{jaapStats.totalAllTime}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", padding: "10px 12px", borderRadius: 12 }}>
            <div style={{ fontSize: 10, opacity: 0.6 }}>Active Days</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#99E3B4", marginTop: 2 }}>{jaapStats.activeDays}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", padding: "10px 12px", borderRadius: 12 }}>
            <div style={{ fontSize: 10, opacity: 0.6 }}>Highest Day</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#F7C6B3", marginTop: 2 }}>{jaapStats.highestSingleDay}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", padding: "10px 12px", borderRadius: 12 }}>
            <div style={{ fontSize: 10, opacity: 0.6 }}>Daily Avg</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#D7B9FF", marginTop: 2 }}>{jaapStats.averagePerDay}</div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
// ============ POMODORO TIMER COMPONENT ============

function PomodoroTimer({ 
  focusHours, setFocusHours, focusMins, setFocusMins,
  breakHours, setBreakHours, breakMins, setBreakMins,
  timerType, setTimerType, pomoActive, setPomoActive, pomoTime, setPomoTime,
  activeThemeObj
}) {
  const updateFocusTime = (h, m) => {
    setFocusHours(h);
    setFocusMins(m);
    if (timerType === 'focus') { 
      setPomoActive(false); 
      setPomoTime((h * 60 + m) * 60); 
    }
  };

  const updateBreakTime = (h, m) => {
    setBreakHours(h);
    setBreakMins(m);
    if (timerType === 'break') { 
      setPomoActive(false); 
      setPomoTime((h * 60 + m) * 60); 
    }
  };

  const switchTimerMode = (mode) => {
    setTimerType(mode);
    setPomoActive(false);
    if (mode === 'focus') setPomoTime((focusHours * 60 + focusMins) * 60);
    else setPomoTime((breakHours * 60 + breakMins) * 60);
  };

  return (
    <div className="ghibli-card" style={{ width: "100%", padding: "24px 20px", textAlign: "center", boxSizing: "border-box", marginBottom: 20 }}>
      {/* Mode selector with Ghibli theming */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 14 }}>
        <button
          onClick={() => switchTimerMode("focus")}
          className="ghibli-btn"
          style={{
            background: timerType === "focus" ? activeThemeObj.accent : "rgba(0,0,0,0.25)",
            color: timerType === "focus" ? "#161521" : "#FFF",
            border: "1px solid rgba(255,255,255,0.2)",
            padding: "7px 18px",
            fontSize: 12,
          }}
        >
          🌤️ Focus Session
        </button>
        <button
          onClick={() => switchTimerMode("break")}
          className="ghibli-btn"
          style={{
            background: timerType === "break" ? "#99E3B4" : "rgba(0,0,0,0.25)",
            color: timerType === "break" ? "#161521" : "#FFF",
            border: "1px solid rgba(255,255,255,0.2)",
            padding: "7px 18px",
            fontSize: 12,
          }}
        >
          ☕ Break Time
        </button>
      </div>

      {/* Time input section */}
      {timerType === "focus" ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.9 }}>Set Focus:</span>
          <input
            type="number" min="0" max="24" value={focusHours}
            onChange={(e) => updateFocusTime(Math.max(0, parseInt(e.target.value || 0, 10)), focusMins)}
            className="time-num-input"
          />
          <span style={{ fontSize: 10, opacity: 0.8 }}>h</span>
          <input
            type="number" min="0" max="59" value={focusMins}
            onChange={(e) => updateFocusTime(focusHours, Math.max(0, parseInt(e.target.value || 0, 10)))}
            className="time-num-input"
          />
          <span style={{ fontSize: 10, opacity: 0.8 }}>m</span>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.9 }}>Set Break:</span>
          <input
            type="number" min="0" max="24" value={breakHours}
            onChange={(e) => updateBreakTime(Math.max(0, parseInt(e.target.value || 0, 10)), breakMins)}
            className="time-num-input"
          />
          <span style={{ fontSize: 10, opacity: 0.8 }}>h</span>
          <input
            type="number" min="0" max="59" value={breakMins}
            onChange={(e) => updateBreakTime(breakHours, Math.max(0, parseInt(e.target.value || 0, 10)))}
            className="time-num-input"
          />
          <span style={{ fontSize: 10, opacity: 0.8 }}>m</span>
        </div>
      )}

      {/* Breathing cloud animation behind timer */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <BreathingCloud accentColor={activeThemeObj.accent} />
        <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)" }}>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: "0.04em", fontFamily: "monospace", textShadow: "0px 4px 20px rgba(0,0,0,0.6)", color: "#FFF" }}>
            {formatPomoTime(pomoTime)}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <button
          onClick={() => setPomoActive(!pomoActive)}
          className="ghibli-btn"
          style={{
            background: timerType === "focus" ? activeThemeObj.accent : "#99E3B4",
            color: "#161521",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0px 4px 16px rgba(0,0,0,0.4)"
          }}
        >
          {pomoActive ? <Pause size={20} fill="#161521" /> : <Play size={20} fill="#161521" style={{ marginLeft: 2 }} />}
        </button>
        <button
          onClick={() => switchTimerMode(timerType)}
          className="ghibli-btn"
          style={{
            background: "rgba(0,0,0,0.3)",
            color: "#FFF",
            border: "1px solid rgba(255,255,255,0.2)",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Affirmation text */}
      <div style={{ fontSize: 11, opacity: 0.6, marginTop: 16, fontStyle: "italic" }}>
        {timerType === "focus" ? "🌿 Focus with intention, breathe with peace" : "✨ Rest restores the spirit"}
      </div>
    </div>
  );
}
// ============ MUSIC PLAYER COMPONENT ============

function MusicPlayerModal({ 
  isOpen, onClose, playlist, setPlaylist, currentTrackIdx, setCurrentTrackIdx,
  isPlayingMusic, setIsPlayingMusic, activeThemeObj
}) {
  const audioRef = useRef(null);
  const [editingTrackIdx, setEditingTrackIdx] = useState(null);
  const [editingTrackName, setEditingTrackName] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleAudioUpload = (e) => {
    const files = Array.from(e.target.files);
    const newTracks = files.map((file) => ({
      name: file.name.replace(/\.[^/.]+$/, ""),
      url: URL.createObjectURL(file)
    }));
    setPlaylist((prev) => [...prev, ...newTracks]);
  };

  const togglePlayMusic = useCallback(() => {
    if (!audioRef.current || playlist.length === 0) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        console.log("Autoplay blocked. Click play button to start.");
      });
    }
    setIsPlayingMusic(!isPlayingMusic);
  }, [isPlayingMusic, playlist.length, setIsPlayingMusic]);

  const nextTrack = () => {
    if (playlist.length === 0) return;
    const nextIdx = (currentTrackIdx + 1) % playlist.length;
    setCurrentTrackIdx(nextIdx);
    setCurrentTime(0);
    setIsPlayingMusic(true);
  };

  const prevTrack = () => {
    if (playlist.length === 0) return;
    const prevIdx = (currentTrackIdx - 1 + playlist.length) % playlist.length;
    setCurrentTrackIdx(prevIdx);
    setCurrentTime(0);
    setIsPlayingMusic(true);
  };

  const saveTrackRename = (idx) => {
    if (!editingTrackName.trim()) return;
    setPlaylist((prev) => prev.map((t, i) => i === idx ? { ...t, name: editingTrackName.trim() } : t));
    setEditingTrackIdx(null);
    setEditingTrackName('');
  };

  const handleScrub = (e) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = (x / rect.width) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎵 Study Playlist" maxWidth={440} theme={activeThemeObj}>
      {playlist.length > 0 && (
        <audio
          ref={audioRef}
          src={playlist[currentTrackIdx]?.url}
          onEnded={nextTrack}
          onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
          onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        />
      )}

      {/* Now Playing */}
      <div style={{ padding: 16, background: "rgba(0,0,0,0.3)", borderRadius: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
          {playlist.length > 0 ? playlist[currentTrackIdx]?.name : "No tracks uploaded"}
        </div>
        <div style={{ fontSize: 11, opacity: 0.6 }}>
          {playlist.length > 0 ? `Track ${currentTrackIdx + 1} of ${playlist.length}` : "Upload audio files"}
        </div>
      </div>

      {/* Duration display */}
      {playlist.length > 0 && (
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
          <span>{formatAudioTime(currentTime)}</span>
          <span>{formatAudioTime(duration)}</span>
        </div>
      )}

      {/* Scrub bar */}
      {playlist.length > 0 && (
        <div
          onClick={handleScrub}
          style={{
            height: 6,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 999,
            marginBottom: 16,
            cursor: "pointer",
            overflow: "hidden",
            position: "relative"
          }}
        >
          <div
            style={{
              height: "100%",
              background: activeThemeObj.accent,
              width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
              transition: "width 0.1s linear"
            }}
          />
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 20 }}>
        <button onClick={prevTrack} className="ghibli-btn" style={{ background: "rgba(255,255,255,0.15)", color: "#FFF", width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChevronLeft size={20} />
        </button>

        <button onClick={togglePlayMusic} className="ghibli-btn" style={{ background: activeThemeObj.accent, color: "#161521", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isPlayingMusic ? <Pause size={24} fill="#161521" /> : <Play size={24} fill="#161521" style={{ marginLeft: 2 }} />}
        </button>

        <button onClick={nextTrack} className="ghibli-btn" style={{ background: "rgba(255,255,255,0.15)", color: "#FFF", width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Playlist */}
      <div style={{ maxHeight: 160, overflowY: "auto", marginBottom: 20, display: "flex", flexDirection: "column", gap: 6 }}>
        {playlist.map((track, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: idx === currentTrackIdx ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)", padding: "6px 12px", borderRadius: 10 }}>
            {editingTrackIdx === idx ? (
              <div style={{ display: "flex", gap: 6, flex: 1, marginRight: 8 }}>
                <input
                  value={editingTrackName}
                  onChange={(e) => setEditingTrackName(e.target.value)}
                  className="kw-input"
                  style={{ padding: "4px 8px", fontSize: 12, flex: 1 }}
                />
                <button onClick={() => saveTrackRename(idx)} className="ghibli-btn" style={{ background: activeThemeObj.accent, color: "#000", padding: "4px 10px", fontSize: 11 }}>Save</button>
              </div>
            ) : (
              <span
                onClick={() => { setCurrentTrackIdx(idx); setIsPlayingMusic(true); }}
                style={{ fontSize: 13, cursor: "pointer", fontWeight: idx === currentTrackIdx ? 700 : 400, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {idx + 1}. {track.name}
              </span>
            )}
            <button
              onClick={() => { setEditingTrackIdx(idx); setEditingTrackName(track.name); }}
              style={{ background: "none", border: "none", color: "#FFF", opacity: 0.6, cursor: "pointer", padding: 2 }}
            >
              <Edit2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Upload */}
      <label className="ghibli-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", color: "#FFF", padding: "10px 18px", fontSize: 13, cursor: "pointer", width: "100%", justifyContent: "center" }}>
        <Upload size={16} /> Upload Audio Files
        <input type="file" accept="audio/*" multiple onChange={handleAudioUpload} style={{ display: "none" }} />
      </label>
    </Modal>
  );
}


  
// ============ PDF LIBRARY COMPONENT ============

function PDFLibraryModal({ 
  isOpen, onClose, books, setBooks, activeThemeObj
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handlePdfUpload = (e) => {
    const files = Array.from(e.target.files);
    const newBooks = files.map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      title: file.name.replace(/\.[^/.]+$/, ""),
      url: URL.createObjectURL(file),
      currentPage: 0,
      totalPages: 100
    }));
    setBooks((prev) => [...prev, ...newBooks]);
  };

  const openPdfInNativeTab = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  const updateBookPages = (id, delta) => {
    setBooks((prev) => prev.map((b) => {
      if (b.id === id) {
        const nextPg = Math.max(0, b.currentPage + delta);
        return { ...b, currentPage: nextPg };
      }
      return b;
    }));
  };

  const updateBookTotalPages = (id, total) => {
    setBooks((prev) => prev.map((b) => b.id === id ? { ...b, totalPages: Math.max(1, total) } : b));
  };

  const deleteBook = (id) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    setDeleteConfirm(null);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(28, 22, 18, 0.95)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="ghibli-card" style={{
        width: "100%", maxWidth: 640, maxHeight: "85vh", padding: 24,
        background: "#2A211B", border: "2px solid #5C4838",
        color: "#F2E8DC", fontFamily: "'Playfair Display', serif",
        display: "flex", flexDirection: "column", boxSizing: "border-box"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 22, fontWeight: 800, fontStyle: "italic" }}>📖 Vintage Library</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#FFF", borderRadius: "50%", width: 32, height: 32, cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: 18, textAlign: "right" }}>
          <label className="ghibli-btn" style={{ background: "#C49A6C", color: "#1E140C", padding: "8px 16px", fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Upload size={14} /> Add PDF Book
            <input type="file" accept="application/pdf" multiple onChange={handlePdfUpload} style={{ display: "none" }} />
          </label>
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          {books.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, opacity: 0.6, fontFamily: "sans-serif", fontSize: 13 }}>
              No books added yet. Upload PDFs to track your reading!
            </div>
          ) : (
            books.map((b) => {
              const pct = Math.min(100, Math.round((b.currentPage / b.totalPages) * 100));
              return (
                <div key={b.id} style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 16, border: "1px solid #4A3A2C" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, flex: 1 }}>{b.title}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => openPdfInNativeTab(b.url)}
                        style={{ background: "#C49A6C", color: "#1E140C", border: "none", padding: "4px 10px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 11 }}
                      >
                        Open ↗
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(b.id)}
                        style={{ background: "#C4736C", color: "#1E140C", border: "none", padding: "4px 10px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 11 }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Delete confirmation */}
                  {deleteConfirm === b.id && (
                    <div style={{ background: "rgba(196, 115, 108, 0.2)", padding: 8, borderRadius: 8, marginBottom: 8, fontSize: 12 }}>
                      <div style={{ marginBottom: 6 }}>Delete "{b.title}"?</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => deleteBook(b.id)}
                          style={{ background: "#C4736C", color: "#FFF", border: "none", padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          style={{ background: "rgba(255,255,255,0.1)", color: "#FFF", border: "none", padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Page tracker */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, opacity: 0.8, marginBottom: 8, fontFamily: "sans-serif" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span>Pages:</span>
                      <button onClick={() => updateBookPages(b.id, -1)} style={{ background: "#4A3A2C", color: "#FFF", border: "none", borderRadius: 4, width: 22, height: 22, cursor: "pointer" }}>-</button>
                      <span style={{ fontWeight: 700, color: "#FFE885" }}>{b.currentPage}</span>
                      <button onClick={() => updateBookPages(b.id, 1)} style={{ background: "#4A3A2C", color: "#FFF", border: "none", borderRadius: 4, width: 22, height: 22, cursor: "pointer" }}>+</button>
                      <span>of</span>
                      <input
                        type="number"
                        value={b.totalPages}
                        onChange={(e) => updateBookTotalPages(b.id, parseInt(e.target.value || 1, 10))}
                        style={{ width: 44, background: "rgba(0,0,0,0.4)", border: "1px solid #5C4838", color: "#FFF", borderRadius: 4, padding: "2px 4px", fontSize: 11 }}
                      />
                    </div>
                    <div>{pct}% Read</div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 6, background: "rgba(0,0,0,0.5)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "#C49A6C", transition: "width 0.3s ease" }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
// ============ THEME CUSTOMIZER COMPONENT ============

function ThemeCustomizerModal({ 
  isOpen, onClose, currentTheme, setCurrentTheme, customWallpaper, 
  setCustomWallpaper, selectedFont, setSelectedFont, activeThemeObj
}) {
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [customColors, setCustomColors] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mori_custom_colors') || '{}'); }
    catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('mori_custom_colors', JSON.stringify(customColors));
  }, [customColors]);

  const handleCustomBgUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64Img = evt.target.result;
        setCustomWallpaper(base64Img);
        setCurrentTheme('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const updateCustomColor = (key, value) => {
    setCustomColors((prev) => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✨ Aesthetic Customization" maxWidth={520} theme={activeThemeObj}>
      {/* Theme Selector */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7, marginBottom: 10 }}>SELECT THEME</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {Object.values(THEMES).map((t) => (
            <button
              key={t.id}
              onClick={() => setCurrentTheme(t.id)}
              style={{
                background: t.bgColor,
                color: t.textColor,
                border: currentTheme === t.id ? `2px solid ${t.accent}` : "1px solid rgba(255,255,255,0.2)",
                borderRadius: 18,
                padding: 16,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 6
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800 }}>{t.name}</span>
              <div style={{ width: 24, height: 6, background: t.accent, borderRadius: 999 }} />
            </button>
          ))}
        </div>
      </div>

      {/* Font Selector */}
      <div style={{ marginBottom: 20, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7, marginBottom: 10 }}>FONT STYLE</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {Object.entries(FONTS).map(([key, font]) => (
            <button
              key={key}
              onClick={() => setSelectedFont(key)}
              style={{
                fontFamily: font.font,
                background: selectedFont === key ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
                border: selectedFont === key ? `1px solid ${activeThemeObj.accent}` : "1px solid rgba(255,255,255,0.1)",
                color: "#FFF",
                padding: "10px 12px",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700
              }}
            >
              {font.name}
            </button>
          ))}
        </div>
      </div>

      {/* Color Customizer */}
      <div style={{ marginBottom: 20, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7, marginBottom: 10 }}>CUSTOM COLORS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, opacity: 0.7 }}>Accent Color</label>
            <input
              type="color"
              value={customColors.accent || activeThemeObj.accent}
              onChange={(e) => updateCustomColor('accent', e.target.value)}
              style={{ width: "100%", height: 40, border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, cursor: "pointer" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, opacity: 0.7 }}>Card Background</label>
            <input
              type="color"
              value={customColors.cardBg || activeThemeObj.bgColor}
              onChange={(e) => updateCustomColor('cardBg', e.target.value)}
              style={{ width: "100%", height: 40, border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, cursor: "pointer" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, opacity: 0.7 }}>Text Color</label>
            <input
              type="color"
              value={customColors.text || activeThemeObj.textColor}
              onChange={(e) => updateCustomColor('text', e.target.value)}
              style={{ width: "100%", height: 40, border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, cursor: "pointer" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, opacity: 0.7 }}>Border Color</label>
            <input
              type="color"
              value={customColors.border || "rgba(255,255,255,0.2)"}
              onChange={(e) => updateCustomColor('border', e.target.value)}
              style={{ width: "100%", height: 40, border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, cursor: "pointer" }}
            />
          </div>
        </div>
      </div>

      {/* Custom Wallpaper Uploader */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16 }}>
        <label className="ghibli-btn" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: activeThemeObj.accent, color: "#161521", padding: "12px", fontSize: 13, cursor: "pointer", boxSizing: "border-box", marginBottom: 10 }}>
          <Upload size={16} /> Upload Custom Background
          <input type="file" accept="image/*" onChange={handleCustomBgUpload} style={{ display: "none" }} />
        </label>
        <button
          onClick={() => {
            setCustomWallpaper('');
            localStorage.removeItem('mori_custom_bg');
          }}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.1)",
            color: "#FFF",
            border: "1px solid rgba(255,255,255,0.2)",
            padding: "8px",
            borderRadius: 10,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700
          }}
        >
          Reset to Default Background
        </button>
      </div>
    </Modal>
  );
}
// ============ TASK MANAGEMENT COMPONENT ============

function TaskManagementSection({
  currentTasks, viewKey, selectedDate, tasksByDate, setTasksByDate,
  newTaskText, setNewTaskText, newStart, setNewStart, newEnd, setNewEnd,
  activeThemeObj, onNavigateDate
}) {
  const addTask = useCallback(() => {
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      start: newStart,
      end: newEnd,
      status: 'pending'
    };
    setTasksByDate((prev) => ({
      ...prev,
      [viewKey]: [...(prev[viewKey] || []), newTask]
    }));
    setNewTaskText('');
    setNewStart('');
    setNewEnd('');
  }, [newTaskText, newStart, newEnd, viewKey, setTasksByDate, setNewTaskText, setNewStart, setNewEnd]);

  const setStatus = useCallback((id, status) => {
    setTasksByDate((prev) => {
      const list = prev[viewKey] || [];
      const updated = list.map((t) => (t.id === id ? { ...t, status: t.status === status ? 'pending' : status } : t));
      return { ...prev, [viewKey]: updated };
    });
  }, [viewKey, setTasksByDate]);

  const removeTask = useCallback((id) => {
    setTasksByDate((prev) => ({
      ...prev,
      [viewKey]: (prev[viewKey] || []).filter((t) => t.id !== id)
    }));
  }, [viewKey, setTasksByDate]);

  const rolloverTaskToTomorrow = useCallback((task) => {
    const tomorrowKey = toKey(addDays(fromKey(viewKey), 1));
    setTasksByDate((prev) => {
      const currentList = (prev[viewKey] || []).filter((t) => t.id !== task.id);
      const tomorrowList = prev[tomorrowKey] || [];
      const movedTask = { ...task, status: 'pending' };
      return {
        ...prev,
        [viewKey]: currentList,
        [tomorrowKey]: [...tomorrowList, movedTask]
      };
    });
  }, [viewKey, setTasksByDate]);

  return (
    <>
      {/* Task Input */}
      <div className="ghibli-card" style={{ padding: 18, marginBottom: 20 }}>
        <input
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="📝 Add a task or goal..."
          className="kw-input"
          style={{ width: "100%", marginBottom: 14, boxSizing: "border-box", fontSize: 14 }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Clock size={16} opacity={0.7} />
            <select value={newStart} onChange={(e) => setNewStart(e.target.value)} className="kw-select" style={{ fontSize: 12 }}>
              <option value="">Start</option>
              {TIME_OPTIONS_12H.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <span style={{ fontSize: 12, opacity: 0.6 }}>–</span>
            <select value={newEnd} onChange={(e) => setNewEnd(e.target.value)} className="kw-select" style={{ fontSize: 12 }}>
              <option value="">End</option>
              {TIME_OPTIONS_12H.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button
            onClick={addTask}
            className="ghibli-btn"
            style={{
              background: activeThemeObj.accent,
              color: "#161521",
              padding: "10px 18px",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Task List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 30 }}>
        {currentTasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: 30, opacity: 0.5, fontSize: 14 }}>
            No tasks for this day. Time to plan ahead! 🌱
          </div>
        ) : (
          currentTasks.map((t, index) => (
            <div key={t.id} className="ghibli-card" style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <button
                  onClick={() => setStatus(t.id, "achieved")}
                  style={{ background: t.status === "achieved" ? "#99E3B4" : "transparent", border: "2px solid #FFF", borderRadius: 8, width: 24, height: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {t.status === "achieved" && <Check size={16} color="#FFF" />}
                </button>
                <button
                  onClick={() => setStatus(t.id, "missed")}
                  style={{ background: t.status === "missed" ? "#E86F88" : "transparent", border: "2px solid #FFF", borderRadius: 8, width: 24, height: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {t.status === "missed" && <X size={16} color="#FFF" />}
                </button>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, textDecoration: t.status === "achieved" ? "line-through" : "none", opacity: t.status === "achieved" ? 0.6 : 1 }}>
                    <span style={{ opacity: 0.5, marginRight: 6 }}>{index + 1}.</span>
                    {t.text}
                  </div>
                  {(t.start || t.end) && (
                    <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                      {t.start && t.end ? `${t.start} – ${t.end}` : t.start || t.end}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {t.status !== "achieved" && (
                  <button
                    onClick={() => rolloverTaskToTomorrow(t)}
                    className="ghibli-btn"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      color: activeThemeObj.accent,
                      border: "1px solid rgba(255,255,255,0.2)",
                      padding: "6px 12px",
                      fontSize: 11,
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}
                    title="Rollover to Tomorrow"
                  >
                    <ArrowRight size={12} /> Rollover
                  </button>
                )}
                <button onClick={() => removeTask(t.id)} style={{ background: "none", border: "none", opacity: 0.5, cursor: "pointer", color: "inherit" }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ textAlign: "center", fontSize: 12, opacity: 0.5, fontStyle: "italic" }}>
        "Progress, not perfection, is the goal" ~ Mori
      </div>
    </>
  );
}

// ============ CALENDAR & DASHBOARD HEADER ============

function CalendarSection({
  calendarView, setCalendarView, viewDate, setViewDate, today,
  tasksByDate, crossedDates, setCrossedDates, activeThemeObj,
  onShowMonthGoals
}) {
  // Calendar construction
  const year = calendarView.getFullYear();
  const month = calendarView.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(new Date(year, month, d));

  const handleCrossDate = (d, key) => {
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (d > todayStart) return;
    setCrossedDates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="ghibli-card" style={{
      width: "100%", maxWidth: 380, padding: 22, margin: "20px 0",
      boxSizing: "border-box", background: MONTH_PASTEL_GRADIENTS[calendarView.getMonth()],
      transition: "background 0.5s ease", position: "relative"
    }}>
      {/* Month header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button
          onClick={() => setCalendarView(new Date(calendarView.getFullYear(), calendarView.getMonth() - 1, 1))}
          style={{ background: "none", border: "none", color: "#FFF", cursor: "pointer", opacity: 0.7 }}
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={onShowMonthGoals}
          style={{
            background: "none", border: "none", fontFamily: "'Playfair Display', serif",
            fontSize: 26, fontWeight: 700, color: "#F7EBE8", cursor: "pointer"
          }}
        >
          {calendarView.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </button>

        <button
          onClick={() => setCalendarView(new Date(calendarView.getFullYear(), calendarView.getMonth() + 1, 1))}
          style={{ background: "none", border: "none", color: "#FFF", cursor: "pointer", opacity: 0.7 }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, textAlign: "center", fontSize: 10, fontWeight: 700, opacity: 0.5, marginBottom: 10 }}>
        <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
      </div>

      {/* Calendar grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, position: "relative" }}>
        {calendarDays.map((d, idx) => {
          if (!d) return <div key={`pad-${idx}`} />;
          const key = toKey(d);
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isPast = d < todayStart;
          const isFuture = d > todayStart;
          const isCrossed = crossedDates[key] || (isPast && crossedDates[key] !== false);
          const isTodayDate = isSameDay(d, today);
          const isSelected = isSameDay(d, viewDate);

          return (
            <button
              key={key}
              onClick={() => { handleCrossDate(d, key); setViewDate(d); }}
              style={{
                aspectRatio: "1/1",
                background: isTodayDate ? activeThemeObj.accent : (isSelected ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)"),
                color: isTodayDate ? "#161521" : (isFuture ? "rgba(255,255,255,0.3)" : "#FFF"),
                border: isTodayDate ? "2px solid #FFF" : (isSelected ? "1px solid " + activeThemeObj.accent : "1px solid rgba(255,255,255,0.12)"),
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 700,
                cursor: isFuture ? "default" : "pointer",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0
              }}
            >
              {d.getDate()}
              {isCrossed && !isFuture && (
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#E86F88", fontSize: 16, fontWeight: 900 }}>✕</span>
              )}
            </button>
          );
        })}

        <div style={{ position: "absolute", bottom: 4, right: 8, opacity: 0.35, pointerEvents: "none", fontSize: 18 }}>
          {MONTH_DOODLES[calendarView.getMonth()]}
        </div>
      </div>
    </div>
  );
}

function DashboardMetrics({
  streak, overall, climberPct, activeThemeObj,
  onClickMetric
}) {
  return (
    <>
      {/* Streak & Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div className="ghibli-card" style={{ padding: 18, gridColumn: "span 2" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.05em", fontWeight: 700, opacity: 0.7, display: "flex", alignItems: "center", gap: 4 }}>
            <Flame size={14} color="#E59866" /> STREAK
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: "#FFE885" }}>{streak}d</div>
        </div>

        <div
          className="ghibli-card"
          onClick={() => onClickMetric('max')}
          style={{ padding: 16, cursor: "pointer" }}
        >
          <div style={{ fontSize: 10, letterSpacing: "0.05em", fontWeight: 700, opacity: 0.7 }}>MAX 🐢</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#99E3B4", marginTop: 4 }}>{overall.maxProdDays}</div>
          <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>≥ 90%</div>
        </div>

        <div
          className="ghibli-card"
          onClick={() => onClickMetric('inBetween')}
          style={{ padding: 16, cursor: "pointer" }}
        >
          <div style={{ fontSize: 10, letterSpacing: "0.05em", fontWeight: 700, opacity: 0.7 }}>BETWEEN 🐧</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#F3C68F", marginTop: 4 }}>{overall.inBetweenDays}</div>
          <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>50-90%</div>
        </div>

        <div
          className="ghibli-card"
          onClick={() => onClickMetric('min')}
          style={{ padding: 16, gridColumn: "span 2", cursor: "pointer" }}
        >
          <div style={{ fontSize: 10, letterSpacing: "0.05em", fontWeight: 700, opacity: 0.7 }}>MIN 🐇</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#E86F88", marginTop: 4 }}>{overall.minProdDays}</div>
          <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>≤ 50%</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="ghibli-card" style={{ padding: 18, marginBottom: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.05em", fontWeight: 700, opacity: 0.7, marginBottom: 24 }}>TODAY'S CLIMB</div>
        <div style={{ position: "relative", height: 18, background: "rgba(12, 10, 18, 0.7)", borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.15)", marginBottom: 28 }}>
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${climberPct}%`,
            background: activeThemeObj.accent,
            borderRadius: 999,
            transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
          }}>
            {climberPct === 100 ? (
              <div style={{ position: "absolute", right: -10, top: -16, fontSize: 22 }}>🚩</div>
            ) : (
              <div style={{ position: "absolute", right: -12, top: -16, fontSize: 22, zIndex: 2 }}>
                🧗🏻‍♀️
                <div style={{
                  fontSize: 12, fontWeight: 800, color: "#FFE885",
                  textAlign: "center", position: "absolute", top: 24,
                  left: "50%", transform: "translateX(-50%)",
                  whiteSpace: "nowrap", textShadow: "0px 2px 4px rgba(0,0,0,0.9)"
                }}>
                  {overall.rate}%
                </div>
              </div>
            )}
          </div>
          {climberPct < 100 && (
            <div style={{ position: "absolute", right: 2, top: -16, fontSize: 22, opacity: 0.8, zIndex: 1 }}>🏔️</div>
          )}
        </div>
      </div>
    </>
  );
}

function Last7Days({
  last7Days, viewKey, setViewDate, activeThemeObj, sevenDaysAnchor, setSevenDaysAnchor
}) {
  return (
    <div className="ghibli-card" style={{ padding: 18, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.05em", fontWeight: 700, opacity: 0.7 }}>LAST 7 DAYS</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setSevenDaysAnchor((d) => addDays(d, -7))}
            style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#FFF", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setSevenDaysAnchor((d) => addDays(d, 7))}
            style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#FFF", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
        {last7Days.map((d) => {
          const isSelected = d.key === viewKey;
          return (
            <button
              key={d.key}
              onClick={() => setViewDate(fromKey(d.key))}
              style={{
                background: isSelected ? "#FFF" : "rgba(32, 27, 44, 0.8)",
                color: isSelected ? "#161521" : "#FFF",
                border: isSelected ? "1px solid #FFF" : "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12, aspectRatio: "1/1", width: "100%",
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", fontSize: 12, fontWeight: 700,
                cursor: "pointer", padding: 0
              }}
            >
              <span style={{ fontSize: 9, opacity: isSelected ? 0.8 : 0.5, marginBottom: 2 }}>
                {d.date.toLocaleDateString(undefined, { weekday: "narrow" })}
              </span>
              {d.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
// ============ NOTES & MODALS ============

function NotesModal({ 
  isOpen, onClose, notes, setNotes, activeThemeObj 
}) {
  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99, background: "rgba(20, 16, 28, 0.9)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="ghibli-card" style={{ width: "100%", maxWidth: 600, height: "80vh", display: "flex", flexDirection: "column", padding: 24, boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>📝 Daily Notes & Reflections</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#FFF", cursor: "pointer" }}>
            <Minimize2 size={20} />
          </button>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => localStorage.setItem('mori_notes', notes)}
          placeholder="Reflect on your day, jot thoughts, or plan tomorrow..."
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", resize: "none", color: "#FFF", fontFamily: "inherit", fontSize: 15, lineHeight: 1.6 }}
        />
      </div>
    </div>
  );
}

function MonthGoalsModal({
  isOpen, onClose, monthGoals, setMonthGoals, calendarView, activeThemeObj,
  newGoalText, setNewGoalText
}) {
  if (!isOpen) return null;

  const currentMonthKey = `${calendarView.getFullYear()}-${String(calendarView.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthGoals = monthGoals[currentMonthKey] || [];

  const addMonthGoal = () => {
    if (!newGoalText.trim()) return;
    const item = { id: Date.now().toString(), text: newGoalText.trim(), done: false };
    setMonthGoals((prev) => ({
      ...prev,
      [currentMonthKey]: [...(prev[currentMonthKey] || []), item]
    }));
    setNewGoalText('');
  };

  const toggleMonthGoal = (id) => {
    setMonthGoals((prev) => ({
      ...prev,
      [currentMonthKey]: (prev[currentMonthKey] || []).map((g) => g.id === id ? { ...g, done: !g.done } : g)
    }));
  };

  const deleteMonthGoal = (id) => {
    setMonthGoals((prev) => ({
      ...prev,
      [currentMonthKey]: (prev[currentMonthKey] || []).filter((g) => g.id !== id)
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Goals for ${calendarView.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`} maxWidth={480} theme={activeThemeObj}>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <input
          value={newGoalText}
          onChange={(e) => setNewGoalText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addMonthGoal()}
          placeholder="Add monthly target..."
          className="kw-input"
          style={{ flex: 1, fontSize: 13 }}
        />
        <button onClick={addMonthGoal} className="ghibli-btn" style={{ background: activeThemeObj.accent, color: "#161521", padding: "0 18px", fontSize: 13 }}>
          <Plus size={16} />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 300, overflowY: "auto" }}>
        {currentMonthGoals.length === 0 ? (
          <div style={{ opacity: 0.5, textAlign: "center", padding: 20, fontSize: 13 }}>No goals yet. Set ambitious targets! 🎯</div>
        ) : (
          currentMonthGoals.map((g, idx) => (
            <div key={g.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.06)", padding: "10px 14px", borderRadius: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, opacity: 0.6, fontWeight: 700 }}>{idx + 1}.</span>
                <button
                  onClick={() => toggleMonthGoal(g.id)}
                  style={{ background: g.done ? "#99E3B4" : "transparent", border: "1.5px solid #FFF", borderRadius: 6, width: 20, height: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {g.done && <Check size={14} color="#FFF" />}
                </button>
                <span style={{ fontSize: 14, textDecoration: g.done ? "line-through" : "none", opacity: g.done ? 0.6 : 1 }}>
                  {g.text}
                </span>
              </div>
              <button onClick={() => deleteMonthGoal(g.id)} style={{ background: "none", border: "none", color: "#E86F88", cursor: "pointer", opacity: 0.7 }}>
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}

function MetricDetailModal({
  isOpen, metricType, onClose, overall, tasksByDate, activeThemeObj
}) {
  const [selectedDrillDate, setSelectedDrillDate] = useState(null);

  if (!isOpen) return null;

  const dates = metricType === 'max' ? overall.maxDates : (metricType === 'inBetween' ? overall.inBetweenDates : overall.minDates);
  const title = metricType === 'max' ? 'Max Productivity (≥ 90%) 🐢' : (metricType === 'inBetween' ? 'In Between (50-90%) 🐧' : 'Min Productivity (≤ 50%) 🐇');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={500} theme={activeThemeObj}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {dates.length === 0 ? (
          <div style={{ opacity: 0.5, padding: 20, textAlign: "center" }}>No recorded days in this tier yet.</div>
        ) : (
          dates.map((dateKey) => {
            const dObj = fromKey(dateKey);
            const isSelected = selectedDrillDate === dateKey;
            const dayTasks = tasksByDate[dateKey] || [];
            const achievedCount = dayTasks.filter(t => t.status === 'achieved').length;

            return (
              <div key={dateKey} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
                <button
                  onClick={() => setSelectedDrillDate(isSelected ? null : dateKey)}
                  style={{
                    width: "100%", padding: "12px 16px", background: "none", border: "none",
                    color: "#FFF", display: "flex", alignItems: "center",
                    justifyContent: "space-between", cursor: "pointer",
                    fontFamily: "inherit", fontSize: 14, fontWeight: 700
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Calendar size={15} color={activeThemeObj.accent} />
                    <span>{dayLabel(dObj)}</span>
                  </div>
                  <span style={{ fontSize: 12, opacity: 0.7 }}>{achievedCount} / {dayTasks.length}</span>
                </button>

                {isSelected && (
                  <div style={{ padding: "0 16px 14px", borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, margin: "10px 0 6px" }}>TASKS:</div>
                    {dayTasks.map((t, idx) => (
                      <div key={t.id || idx} style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <span>{t.status === 'achieved' ? '✅' : (t.status === 'missed' ? '❌' : '⏳')}</span>
                        <span style={{ textDecoration: t.status === 'achieved' ? 'line-through' : 'none', opacity: t.status === 'achieved' ? 0.7 : 1 }}>
                          {t.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}
// ============ THEME EFFECTS & ANIMATIONS ============

function ThemeEffects({ currentTheme, activeThemeObj, butterflies, onContainerClick }) {
  return (
    <>
      {/* RAIN THEME: Dynamic water level */}
      {currentTheme === 'raining' && (
        <>
          {[...Array(30)].map((_, i) => (
            <div
              key={`rain-${i}`}
              className="rain-line"
              style={{
                left: `${(i * 3.4) % 100}%`,
                animationDelay: `${(i * 0.17) % 1.2}s`,
                animationDuration: `${0.8 + (i % 5) * 0.15}s`
              }}
            />
          ))}

          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            background: "linear-gradient(180deg, rgba(156,213,236,0.55) 0%, rgba(26,38,48,0.96) 100%)",
            backdropFilter: "blur(8px)", zIndex: 2, pointerEvents: "none",
            borderTop: "2px solid rgba(160, 210, 235, 0.8)",
            boxShadow: "0px -12px 35px rgba(156,213,236,0.4)",
            animation: "dynamicWaterRise 16s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate",
            display: "flex", alignItems: "flex-start", justifyContent: "space-around", paddingTop: 6,
            height: "auto"
          }}>
            <span style={{ fontSize: 13, opacity: 0.8 }}>🌊</span>
            <span style={{ fontSize: 13, opacity: 0.8 }}>💧</span>
            <span style={{ fontSize: 13, opacity: 0.8 }}>🌊</span>
            <span style={{ fontSize: 13, opacity: 0.8 }}>☔</span>
          </div>
        </>
      )}

      {/* CAT THEME: Walking cat */}
      {currentTheme === 'cat' && (
        <div style={{
          position: "fixed", bottom: 10, zIndex: 10, pointerEvents: "none",
          fontSize: 34, animation: "walkCatContinuous 22s linear infinite"
        }}>
          🐈‍⬛ <span style={{ fontSize: 16 }}>🐾 🐾</span>
        </div>
      )}

      {/* BUTTERFLY THEME: Interactive butterflies */}
      {currentTheme === 'butterfly' && butterflies.map((bf) => (
        <div
          key={bf.id}
          style={{
            position: "fixed", left: bf.x, top: bf.y, pointerEvents: "none",
            zIndex: 999, fontSize: 28, animation: "flyUpButterFly 1.8s ease-out forwards"
          }}
        >
          {bf.icon}
        </div>
      ))}

      {/* Dynamic background overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: activeThemeObj.bgImage,
        backgroundSize: "cover", backgroundPosition: "center",
        filter: "brightness(0.75) saturate(1.1)",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(180deg, ${activeThemeObj.bgColor}55 0%, ${activeThemeObj.bgColor}dd 100%)`,
        }} />
      </div>
    </>
  );
}

function TopNavBar({
  now, weather, jaapData, todayKey, showJaapModal, setShowJaapModal,
  showMusicModal, setShowMusicModal, showBooksModal, setShowBooksModal,
  showThemeModal, setShowThemeModal, activeThemeObj
}) {
  return (
    <div style={{ width: "100%", maxWidth: 480, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
      {/* Clock & Weather */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div className="live-clock-badge" style={{
          background: "rgba(0,0,0,0.35)", borderRadius: 20, padding: "6px 14px",
          fontSize: 13, fontWeight: 700, color: activeThemeObj.accent,
          backdropFilter: "blur(12px)", letterSpacing: "0.05em"
        }}>
          {formatLiveClock(now)}
        </div>

        <div style={{
          background: "rgba(0,0,0,0.35)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.2)",
          padding: "6px 12px", fontSize: 12, fontWeight: 700, color: "#FFF",
          display: "flex", alignItems: "center", gap: 5, backdropFilter: "blur(12px)"
        }}>
          <span>{weather.icon}</span>
          <span>{weather.temp}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={() => setShowJaapModal(true)}
          className="ghibli-btn"
          style={{
            background: `linear-gradient(135deg, ${activeThemeObj.accent} 0%, #D2C4FB 100%)`,
            color: "#1B1726", padding: "8px 14px", fontSize: 13,
            display: "flex", alignItems: "center", gap: 6,
            boxShadow: "0px 4px 16px rgba(0,0,0,0.3)"
          }}
        >
          <Sparkles size={15} color="#1B1726" /> ({jaapData[todayKey] || 0})
        </button>

        <button
          onClick={() => setShowMusicModal(true)}
          className="ghibli-btn"
          style={{
            background: "rgba(255,255,255,0.15)", color: "#FFF", border: "1px solid rgba(255,255,255,0.25)",
            padding: "8px 12px", fontSize: 13, display: "flex", alignItems: "center"
          }}
        >
          <Music size={15} />
        </button>

        <button
          onClick={() => setShowBooksModal(true)}
          className="ghibli-btn"
          style={{
            background: "rgba(255,255,255,0.15)", color: "#FFF", border: "1px solid rgba(255,255,255,0.25)",
            padding: "8px 12px", fontSize: 13, display: "flex", alignItems: "center"
          }}
        >
          <BookOpen size={15} />
        </button>

        <button
          onClick={() => setShowThemeModal(true)}
          className="ghibli-btn"
          style={{
            background: "rgba(255,255,255,0.15)", color: "#FFF", border: "1px solid rgba(255,255,255,0.25)",
            padding: "8px 12px", fontSize: 13, display: "flex", alignItems: "center"
          }}
        >
          <Palette size={15} />
        </button>
      </div>
    </div>
  );
}

function FooterDoodle({ activeThemeObj }) {
  return (
    <div style={{ position: "relative", width: "100%", height: 80, marginTop: 40 }}>
      <MountainDoodle accentColor={activeThemeObj.accent} opacity={0.25} />
      <div style={{ textAlign: "center", fontSize: 12, opacity: 0.5, marginTop: 12, fontStyle: "italic" }}>
        ✨ Every day is a new opportunity to climb higher ✨
      </div>
    </div>
  );
}
// ============ STATE MANAGEMENT & INITIALIZATION ============

function useAppState() {
  const today = new Date();
  const todayKey = toKey(today);

  // Core Data
  const [tasksByDate, setTasksByDate] = useLocalStorage('mori_tasks', {});
  const [crossedDates, setCrossedDates] = useLocalStorage('mori_crossed', {});
  const [jaapData, setJaapData] = useLocalStorage('mori_jaap', {});
  const [notes, setNotes] = useLocalStorage('mori_notes', '');
  const [monthGoals, setMonthGoals] = useLocalStorage('mori_month_goals', {});
  const [books, setBooks] = useLocalStorage('mori_books', []);
  const [playlist, setPlaylist] = useLocalStorage('mori_playlist_meta', []);

  // UI State
  const [viewDate, setViewDate] = useState(today);
  const viewKey = toKey(viewDate);

  const [now, setNow] = useState(new Date());
  const [calendarView, setCalendarView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [sevenDaysAnchor, setSevenDaysAnchor] = useState(today);
  const [butterflies, setButterflies] = useState([]);

  // Theme & Font
  const [currentTheme, setCurrentTheme] = useLocalStorage('mori_theme', 'ghibli');
  const [customWallpaper, setCustomWallpaper] = useLocalStorage('mori_custom_bg', '');
  const [selectedFont, setSelectedFont] = useLocalStorage('mori_font', 'default');

  // Modals
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showJaapModal, setShowJaapModal] = useState(false);
  const [showMonthGoalsModal, setShowMonthGoalsModal] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showBooksModal, setShowBooksModal] = useState(false);
  const [metricDetailModal, setMetricDetailModal] = useState(null);

  // Task input
  const [newTaskText, setNewTaskText] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  // Pomodoro
  const [timerType, setTimerType] = useState('focus');
  const [focusHours, setFocusHours] = useState(0);
  const [focusMins, setFocusMins] = useState(25);
  const [breakHours, setBreakHours] = useState(0);
  const [breakMins, setBreakMins] = useState(5);
  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [pomoActive, setPomoActive] = useState(false);

  // Music player
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Month goals input
  const [newGoalText, setNewGoalText] = useState('');

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Pomodoro timer
  useEffect(() => {
    let interval = null;
    if (pomoActive && pomoTime > 0) {
      interval = setInterval(() => setPomoTime((t) => t - 1), 1000);
    } else if (pomoTime === 0 && pomoActive) {
      setPomoActive(false);
      // Audio alarm handled in hook
    }
    return () => clearInterval(interval);
  }, [pomoActive, pomoTime]);

  const weather = useWeather();

  // Build active theme
  const activeThemeObj = useMemo(() => {
    if (currentTheme === 'custom') {
      return {
        id: "custom", name: "Custom", font: `'${FONTS[selectedFont]?.font || FONTS.default.font}'`,
        bgImage: customWallpaper ? `url('${customWallpaper}')` : "none",
        bgColor: "#14111D", cardBg: "rgba(30, 25, 42, 0.65)",
        cardBorder: "rgba(255, 215, 235, 0.3)", accent: "#FFD1DC", textColor: "#FFFFFF"
      };
    }
    const base = THEMES[currentTheme] || THEMES.ghibli;
    return { ...base, font: `'${FONTS[selectedFont]?.font || base.font}'` };
  }, [currentTheme, customWallpaper, selectedFont]);

  // Metrics
  const currentTasks = tasksByDate[viewKey] || [];
  const overall = useTaskMetrics(tasksByDate, viewKey);
  const streak = useStreakCalculation(tasksByDate, today);
  const climberPct = overall.rate;

  // 7-day strip
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(sevenDaysAnchor, -i);
      days.push({ date: d, key: toKey(d) });
    }
    return days;
  }, [sevenDaysAnchor]);

  // Click handler for butterfly theme
  const handleContainerClick = useCallback((e) => {
    if (currentTheme !== 'butterfly') return;
    const butterflyIcons = ['🦋', '✨', '🌸', '🦋', '🌿'];
    const newBf = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
      icon: butterflyIcons[Math.floor(Math.random() * butterflyIcons.length)]
    };
    setButterflies((prev) => [...prev.slice(-15), newBf]);
  }, [currentTheme]);

  return {
    // Data
    tasksByDate, setTasksByDate, crossedDates, setCrossedDates, jaapData, setJaapData,
    notes, setNotes, monthGoals, setMonthGoals, books, setBooks, playlist, setPlaylist,

    // UI
    viewDate, setViewDate, viewKey, today, todayKey, now,
    calendarView, setCalendarView, sevenDaysAnchor, setSevenDaysAnchor,
    butterflies, currentTheme, setCurrentTheme, customWallpaper, setCustomWallpaper,
    selectedFont, setSelectedFont,

    // Modals
    showNotesModal, setShowNotesModal, showJaapModal, setShowJaapModal,
    showMonthGoalsModal, setShowMonthGoalsModal, showMusicModal, setShowMusicModal,
    showThemeModal, setShowThemeModal, showBooksModal, setShowBooksModal,
    metricDetailModal, setMetricDetailModal,

    // Tasks
    newTaskText, setNewTaskText, newStart, setNewStart, newEnd, setNewEnd,
    currentTasks,

    // Pomodoro
    timerType, setTimerType, focusHours, setFocusHours, focusMins, setFocusMins,
    breakHours, setBreakHours, breakMins, setBreakMins, pomoTime, setPomoTime,
    pomoActive, setPomoActive,

    // Music
    currentTrackIdx, setCurrentTrackIdx, isPlayingMusic, setIsPlayingMusic,

    // Goals
    newGoalText, setNewGoalText,

    // Computed
    activeThemeObj, weather, overall, streak, climberPct, last7Days,
    handleContainerClick
  };
}
// ============ MAIN STUDY LEDGER COMPONENT ============

export function StudyLedger() {
  const state = useAppState();

  return (
    <div 
      onClick={state.handleContainerClick}
      style={{
        fontFamily: FONTS[state.selectedFont]?.font || "sans-serif",
        backgroundColor: state.activeThemeObj.bgColor,
        minHeight: "100vh",
        color: state.activeThemeObj.textColor,
        position: "relative",
        overflowX: "hidden",
        transition: "background-color 0.4s ease, color 0.4s ease, font-family 0.3s ease"
      }}
    >
      <style>{getGlobalStyles(state.activeThemeObj)}</style>

      {/* Theme Effects (Rain, Cat, Butterfly, Background) */}
      <ThemeEffects 
        currentTheme={state.currentTheme} 
        activeThemeObj={state.activeThemeObj}
        butterflies={state.butterflies}
        onContainerClick={state.handleContainerClick}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* TOP SECTION: Clock, Weather, Action Buttons */}
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "24px 16px 40px", boxSizing: "border-box" }}>

          {/* Top Navbar */}
          <TopNavBar
            now={state.now}
            weather={state.weather}
            jaapData={state.jaapData}
            todayKey={state.todayKey}
            showJaapModal={state.showJaapModal}
            setShowJaapModal={state.setShowJaapModal}
            showMusicModal={state.showMusicModal}
            setShowMusicModal={state.setShowMusicModal}
            showBooksModal={state.showBooksModal}
            setShowBooksModal={state.setShowBooksModal}
            showThemeModal={state.showThemeModal}
            setShowThemeModal={state.setShowThemeModal}
            activeThemeObj={state.activeThemeObj}
          />

          {/* Pomodoro Timer */}
          <PomodoroTimer
            focusHours={state.focusHours}
            setFocusHours={state.setFocusHours}
            focusMins={state.focusMins}
            setFocusMins={state.setFocusMins}
            breakHours={state.breakHours}
            setBreakHours={state.setBreakHours}
            breakMins={state.breakMins}
            setBreakMins={state.setBreakMins}
            timerType={state.timerType}
            setTimerType={state.setTimerType}
            pomoActive={state.pomoActive}
            setPomoActive={state.setPomoActive}
            pomoTime={state.pomoTime}
            setPomoTime={state.setPomoTime}
            activeThemeObj={state.activeThemeObj}
          />

          {/* Calendar */}
          <CalendarSection
            calendarView={state.calendarView}
            setCalendarView={state.setCalendarView}
            viewDate={state.viewDate}
            setViewDate={state.setViewDate}
            today={state.today}
            tasksByDate={state.tasksByDate}
            crossedDates={state.crossedDates}
            setCrossedDates={state.setCrossedDates}
            activeThemeObj={state.activeThemeObj}
            onShowMonthGoals={() => state.setShowMonthGoalsModal(true)}
          />

          <div style={{ height: 10 }}></div>
        </div>

        {/* DASHBOARD SECTION */}
        <div style={{
          background: "rgba(20, 16, 28, 0.95)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          minHeight: "100vh",
          padding: "40px 16px 80px",
          boxSizing: "border-box",
          boxShadow: "0px -10px 40px rgba(0,0,0,0.5)"
        }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>

            {/* Metrics & Streak */}
            <DashboardMetrics
              streak={state.streak}
              overall={state.overall}
              climberPct={state.climberPct}
              activeThemeObj={state.activeThemeObj}
              onClickMetric={(type) => state.setMetricDetailModal(type)}
            />

            {/* Last 7 Days */}
            <Last7Days
              last7Days={state.last7Days}
              viewKey={state.viewKey}
              setViewDate={state.setViewDate}
              activeThemeObj={state.activeThemeObj}
              sevenDaysAnchor={state.sevenDaysAnchor}
              setSevenDaysAnchor={state.setSevenDaysAnchor}
            />

            {/* Notes Preview */}
            <div className="ghibli-card" style={{ padding: 18, marginBottom: 20, cursor: "pointer" }} onClick={() => state.setShowNotesModal(true)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7 }}>Daily Notes</div>
                <Maximize2 size={14} opacity={0.6} />
              </div>
              <div style={{ fontSize: 13, opacity: state.notes ? 0.9 : 0.4, whiteSpace: "pre-wrap", maxHeight: 50, overflow: "hidden" }}>
                {state.notes || "Click to add notes..."}
              </div>
            </div>

            {/* Day Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <button onClick={() => state.setViewDate((d) => addDays(d, -1))} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
                <ChevronLeft size={24} />
              </button>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {isSameDay(state.viewDate, state.today) ? "Today" : dayLabel(state.viewDate)}
              </div>
              <button onClick={() => state.setViewDate((d) => addDays(d, 1))} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Task Management */}
            <TaskManagementSection
              currentTasks={state.currentTasks}
              viewKey={state.viewKey}
              selectedDate={state.viewDate}
              tasksByDate={state.tasksByDate}
              setTasksByDate={state.setTasksByDate}
              newTaskText={state.newTaskText}
              setNewTaskText={state.setNewTaskText}
              newStart={state.newStart}
              setNewStart={state.setNewStart}
              newEnd={state.newEnd}
              setNewEnd={state.setNewEnd}
              activeThemeObj={state.activeThemeObj}
              onNavigateDate={state.setViewDate}
            />

            {/* Footer Doodle */}
            <FooterDoodle activeThemeObj={state.activeThemeObj} />
          </div>
        </div>
      </div>

      {/* ============ MODALS ============ */}

      {/* Notes Modal */}
      <NotesModal
        isOpen={state.showNotesModal}
        onClose={() => state.setShowNotesModal(false)}
        notes={state.notes}
        setNotes={state.setNotes}
        activeThemeObj={state.activeThemeObj}
      />

      {/* Naam Jaap Modal */}
      <NaamJaapCounter
        isOpen={state.showJaapModal}
        onClose={() => state.setShowJaapModal(false)}
        jaapData={state.jaapData}
        setJaapData={state.setJaapData}
        todayKey={state.todayKey}
        today={state.today}
        selectedDate={state.viewDate}
        tasksByDate={state.tasksByDate}
        activeThemeObj={state.activeThemeObj}
      />

      {/* Music Player Modal */}
      <MusicPlayerModal
        isOpen={state.showMusicModal}
        onClose={() => state.setShowMusicModal(false)}
        playlist={state.playlist}
        setPlaylist={state.setPlaylist}
        currentTrackIdx={state.currentTrackIdx}
        setCurrentTrackIdx={state.setCurrentTrackIdx}
        isPlayingMusic={state.isPlayingMusic}
        setIsPlayingMusic={state.setIsPlayingMusic}
        activeThemeObj={state.activeThemeObj}
      />

      {/* PDF Library Modal */}
      <PDFLibraryModal
        isOpen={state.showBooksModal}
        onClose={() => state.setShowBooksModal(false)}
        books={state.books}
        setBooks={state.setBooks}
        activeThemeObj={state.activeThemeObj}
      />

      {/* Theme Customizer Modal */}
      <ThemeCustomizerModal
        isOpen={state.showThemeModal}
        onClose={() => state.setShowThemeModal(false)}
        currentTheme={state.currentTheme}
        setCurrentTheme={state.setCurrentTheme}
        customWallpaper={state.customWallpaper}
        setCustomWallpaper={state.setCustomWallpaper}
        selectedFont={state.selectedFont}
        setSelectedFont={state.setSelectedFont}
        activeThemeObj={state.activeThemeObj}
      />

      {/* Month Goals Modal */}
      <MonthGoalsModal
        isOpen={state.showMonthGoalsModal}
        onClose={() => state.setShowMonthGoalsModal(false)}
        monthGoals={state.monthGoals}
        setMonthGoals={state.setMonthGoals}
        calendarView={state.calendarView}
        activeThemeObj={state.activeThemeObj}
        newGoalText={state.newGoalText}
        setNewGoalText={state.setNewGoalText}
      />

      {/* Metric Detail Modal */}
      <MetricDetailModal
        isOpen={state.metricDetailModal !== null}
        metricType={state.metricDetailModal}
        onClose={() => state.setMetricDetailModal(null)}
        overall={state.overall}
        tasksByDate={state.tasksByDate}
        activeThemeObj={state.activeThemeObj}
      />
    </div>
  );
}

// ============ REACT DOM RENDER ============

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StudyLedger />
  </React.StrictMode>
);

export default StudyLedger;

          
              
        
        
