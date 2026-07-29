// src/main.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  Plus,
  Check,
  X,
  Trash2,
  Maximize2,
  Minimize2,
  Music,
  BookOpen,
  Palette,
  Upload,
  FileText,
  CloudRain,
  Sun,
  Cloud,
  Wind,
  Thermometer
} from 'lucide-react';

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,600;0,800;1,400&family=Quicksand:wght@500;700&display=swap');`;
// Dynamic Month Gradient Backgrounds for Calendar
const MONTH_PASTEL_GRADIENTS = [
  "linear-gradient(135deg, rgba(255, 209, 220, 0.25) 0%, rgba(255, 230, 240, 0.1) 100%)", // Jan
  "linear-gradient(135deg, rgba(208, 224, 255, 0.25) 0%, rgba(230, 240, 255, 0.1) 100%)", // Feb
  "linear-gradient(135deg, rgba(210, 245, 225, 0.25) 0%, rgba(235, 255, 242, 0.1) 100%)", // Mar
  "linear-gradient(135deg, rgba(255, 224, 204, 0.25) 0%, rgba(255, 240, 230, 0.1) 100%)", // Apr
  "linear-gradient(135deg, rgba(243, 207, 255, 0.25) 0%, rgba(250, 230, 255, 0.1) 100%)", // May
  "linear-gradient(135deg, rgba(255, 250, 204, 0.25) 0%, rgba(255, 252, 230, 0.1) 100%)", // Jun
  "linear-gradient(135deg, rgba(204, 245, 255, 0.25) 0%, rgba(230, 252, 255, 0.1) 100%)", // Jul
  "linear-gradient(135deg, rgba(255, 218, 233, 0.25) 0%, rgba(255, 235, 245, 0.1) 100%)", // Aug
  "linear-gradient(135deg, rgba(220, 237, 210, 0.25) 0%, rgba(238, 247, 232, 0.1) 100%)", // Sep
  "linear-gradient(135deg, rgba(255, 230, 210, 0.25) 0%, rgba(255, 242, 232, 0.1) 100%)", // Oct
  "linear-gradient(135deg, rgba(225, 215, 250, 0.25) 0%, rgba(240, 235, 255, 0.1) 100%)", // Nov
  "linear-gradient(135deg, rgba(210, 235, 245, 0.25) 0%, rgba(232, 246, 252, 0.1) 100%)", // Dec
];

const MONTH_DOODLES = ["❄️", "💗", "🌱", "🌸", "🌿", "☀️", "🏖️", "🌻", "🍁", "🎃", "🍂", "🎄"];
// Themes Configuration
// - Cat: prepared for animated cats over calendar + walking cat at page end
// - Butterfly: prepared for vintage butterflies + click-to-spawn flying butterfly
// - Rain: will add rising water level animation
// - Custom: new theme with user-uploaded background + pastel gradient overlays
const THEMES = {
  ghibli: {
    id: "ghibli",
    name: "Cosmic Ghibli",
    font: "'Plus Jakarta Sans', 'Fredoka', sans-serif",
    bgImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80')",
    bgColor: "#1B1726",
    cardBg: "rgba(42, 34, 58, 0.55)",
    cardBorder: "rgba(255, 235, 245, 0.2)",
    accent: "#F2C6DE",
    textColor: "#F3EFF8",
  },
  cat: {
    id: "cat",
    name: "Warm Cat 🐾",
    font: "'Fredoka', 'Quicksand', sans-serif",
    bgImage: "url('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1920&q=80')", // cat background
    bgColor: "#2C221E",
    cardBg: "rgba(68, 52, 45, 0.65)",
    cardBorder: "rgba(247, 202, 179, 0.25)",
    accent: "#F7C6B3",
    textColor: "#FAF0CA",
  },
  butterfly: {
    id: "butterfly",
    name: "Fairy Butterfly 🦋",
    font: "'Quicksand', sans-serif",
    bgImage: "url('https://images.unsplash.com/photo-1509214624648-28e7a9a78e4a?auto=format&fit=crop&w=1920&q=80')", // vintage butterfly-ish
    bgColor: "#1E1A2B",
    cardBg: "rgba(48, 40, 72, 0.6)",
    cardBorder: "rgba(215, 185, 255, 0.25)",
    accent: "#D7B9FF",
    textColor: "#F5EEFF",
  },
  raining: {
    id: "raining",
    name: "Cozy Rain 🌧️",
    font: "'Plus Jakarta Sans', sans-serif",
    bgImage: "none",
    bgColor: "#121A21",
    cardBg: "rgba(26, 38, 48, 0.65)",
    cardBorder: "rgba(160, 210, 235, 0.25)",
    accent: "#9CD5EC",
    textColor: "#E6F4F8",
  },
  custom: {
    id: "custom",
    name: "Custom 🖼️",
    font: "'Plus Jakarta Sans', 'Fredoka', sans-serif",
    bgImage: "none", // will be set via user upload
    bgColor: "#1B1726",
    cardBg: "rgba(42, 34, 58, 0.55)",
    cardBorder: "rgba(255, 235, 245, 0.2)",
    accent: "#F2C6DE",
    textColor: "#F3EFF8",
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
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
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
export function StudyLedger() {
  const today = new Date();
  const todayKey = toKey(today);

  // Core State
  const [viewDate, setViewDate] = useState(today);
  const viewKey = toKey(viewDate);
  const isToday = isSameDay(viewDate, today);

  const [now, setNow] = useState(new Date());

  const [tasksByDate, setTasksByDate] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mori_tasks') || '{}'); } catch { return {}; }
  });

  const [crossedDates, setCrossedDates] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mori_crossed') || '{}'); } catch { return {}; }
  });

  const [jaapData, setJaapData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mori_jaap') || '{}'); } catch { return {}; }
  });

  const [notes, setNotes] = useState(() => localStorage.getItem('mori_notes') || '');

  // Month Goals
  const [monthGoals, setMonthGoals] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mori_month_goals') || '{}'); } catch { return {}; }
  });

  // Books / PDF Tracker
  const [books, setBooks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mori_books') || '[]'); } catch { return []; }
  });

  // Theme State (supports new 'custom' theme)
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('mori_theme') || 'ghibli');

  // Custom theme background (user-uploaded image URL stored in localStorage)
  const [customBgImage, setCustomBgImage] = useState(() => localStorage.getItem('mori_custom_bg') || '');

  // Input States
  const [newTaskText, setNewTaskText] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  // Calendar View
  const [calendarView, setCalendarView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // 7-day strip
  const [sevenDaysAnchor, setSevenDaysAnchor] = useState(today);

  // Modals
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showJaapModal, setShowJaapModal] = useState(false);
  const [showMonthGoalsModal, setShowMonthGoalsModal] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showBooksModal, setShowBooksModal] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);

  // For productivty date clicks: which date’s tasks to show below metrics
  const [selectedProductivityDateKey, setSelectedProductivityDateKey] = useState(null);

  // Pomodoro
  const [timerType, setTimerType] = useState('focus'); // 'focus' | 'break'
  const [focusHours, setFocusHours] = useState(0);
  const [focusMins, setFocusMins] = useState(25);
  const [breakHours, setBreakHours] = useState(0);
  const [breakMins, setBreakMins] = useState(5);
  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [pomoActive, setPomoActive] = useState(false);

  // Music Player
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef(null);

  // New Month Goal Input
  const [newGoalText, setNewGoalText] = useState('');
  // Pomodoro Timer
  useEffect(() => {
    let interval = null;
    if (pomoActive && pomoTime > 0) {
      interval = setInterval(() => setPomoTime((t) => t - 1), 1000);
    } else if (pomoTime === 0) {
      setPomoActive(false);
    }
    return () => clearInterval(interval);
  }, [pomoActive, pomoTime]);
  // Streak Logic:
  // If no tasks exist for today, streak falls back to 0.
  // Otherwise, counts all distinct logged days that have at least one task.
  const calculateStreak = () => {
    const loggedKeys = Object.keys(tasksByDate).filter(key => tasksByDate[key] && tasksByDate[key].length > 0);
    if (loggedKeys.length === 0) return 0;

    const hasTodayTasks = tasksByDate[todayKey] && tasksByDate[todayKey].length > 0;
    if (!hasTodayTasks) return 0;

    const sortedKeys = Array.from(new Set(loggedKeys)).sort();
    return sortedKeys.length;
  };

  const streak = calculateStreak();

  // Metrics
  const calculateMetrics = () => {
    let totalTasks = 0;
    let totalAchieved = 0;
    let maxProdDays = 0;
    let minProdDays = 0;
    let inBetweenDays = 0;

    Object.keys(tasksByDate).forEach((key) => {
      const dayTasks = tasksByDate[key] || [];
      if (dayTasks.length > 0) {
        const achieved = dayTasks.filter((t) => t.status === 'achieved').length;
        const rate = achieved / dayTasks.length;
        if (rate >= 0.9) maxProdDays++;
        else if (rate <= 0.5) minProdDays++;
        else inBetweenDays++;
      }
    });

    const currentTasks = tasksByDate[viewKey] || [];
    if (currentTasks.length > 0) {
      totalTasks = currentTasks.length;
      totalAchieved = currentTasks.filter((t) => t.status === 'achieved').length;
    }

    const rate = totalTasks > 0 ? Math.round((totalAchieved / totalTasks) * 100) : 0;
    return { totalTasks, totalAchieved, rate, maxProdDays, minProdDays, inBetweenDays };
  };

  const overall = calculateMetrics();
  const climberPct = overall.rate;

  // Task Actions
  const currentTasks = tasksByDate[viewKey] || [];

  const addTask = () => {
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
  };

  const setStatus = (id, status) => {
    setTasksByDate((prev) => {
      const list = prev[viewKey] || [];
      const updated = list.map((t) => (t.id === id ? { ...t, status: t.status === status ? 'pending' : status } : t));
      return { ...prev, [viewKey]: updated };
    });
  };

  const removeTask = (id) => {
    setTasksByDate((prev) => ({
      ...prev,
      [viewKey]: (prev[viewKey] || []).filter((t) => t.id !== id)
    }));
  };

  const handleCrossDate = (d, key) => {
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (d > todayStart) return;
    setCrossedDates((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const addJaapCount = (amt) => {
    setJaapData((prev) => ({
      ...prev,
      [todayKey]: Math.max(0, (prev[todayKey] || 0) + amt)
    }));
  };

  // Switch Timer Mode
  const switchTimerMode = (mode) => {
    setTimerType(mode);
    setPomoActive(false);
    if (mode === 'focus') setPomoTime((focusHours * 60 + focusMins) * 60);
    else setPomoTime((breakHours * 60 + breakMins) * 60);
  };

  const updateFocusTime = (h, m) => {
    setFocusHours(h);
    setFocusMins(m);
    if (timerType === 'focus') { setPomoActive(false); setPomoTime((h * 60 + m) * 60); }
  };

  const updateBreakTime = (h, m) => {
    setBreakHours(h);
    setBreakMins(m);
    if (timerType === 'break') { setPomoActive(false); setPomoTime((h * 60 + m) * 60); }
  };

  // Calendar Construction
  const year = calendarView.getFullYear();
  const month = calendarView.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(new Date(year, month, d));

  // 7 Days Navigation
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(sevenDaysAnchor, -i);
    last7Days.push({ date: d, key: toKey(d) });
  }

  // Month Goals Actions
  const currentMonthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
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

  // Audio Upload & Navigation
  const handleAudioUpload = (e) => {
    const files = Array.from(e.target.files);
    const newTracks = files.map((file) => ({
      name: file.name.replace(/.[^/.]+$/, ""),
      url: URL.createObjectURL(file)
    }));
    setPlaylist((prev) => [...prev, ...newTracks]);
  };

  const togglePlayMusic = () => {
    if (!audioRef.current || playlist.length === 0) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlayingMusic(!isPlayingMusic);
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;
    const nextIdx = (currentTrackIdx + 1) % playlist.length;
    setCurrentTrackIdx(nextIdx);
    setIsPlayingMusic(true);
  };

  const prevTrack = () => {
    if (playlist.length === 0) return;
    const prevIdx = (currentTrackIdx - 1 + playlist.length) % playlist.length;
    setCurrentTrackIdx(prevIdx);
    setIsPlayingMusic(true);
  };

  // Book / PDF Upload
  const handlePdfUpload = (e) => {
    const files = Array.from(e.target.files);
    const newBooks = files.map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      title: file.name.replace(/.[^/.]+$/, ""),
      url: URL.createObjectURL(file),
      currentPage: 0,
      totalPages: 100
    }));
    setBooks((prev) => [...prev, ...newBooks]);
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

  // Open PDF in browser’s native reader (new tab)
  const openPdfInBrowser = (url) => {
    window.open(url, '_blank');
  };

  const activeThemeObj = THEMES[currentTheme] || THEMES.ghibli;
  return (
    <div style={{
      fontFamily: activeThemeObj.font,
      backgroundColor: activeThemeObj.bgColor,
      minHeight: "100vh",
      color: activeThemeObj.textColor,
      position: "relative",
      overflowX: "hidden",
      transition: "background-color 0.4s ease, color 0.4s ease"
    }}>
      <style>{`
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
        
        /* Pulse Animation for Live Clock */
        @keyframes clockAura {
          0% { box-shadow: 0 0 10px ${activeThemeObj.accent}40, 0 0 20px ${activeThemeObj.accent}20; }
          50% { box-shadow: 0 0 22px ${activeThemeObj.accent}90, 0 0 32px ${activeThemeObj.accent}50; }
          100% { box-shadow: 0 0 10px ${activeThemeObj.accent}40, 0 0 20px ${activeThemeObj.accent}20; }
        }
        .live-clock-badge {
          animation: clockAura 2.8s infinite ease-in-out;
          border: 1.5px solid ${activeThemeObj.accent};
        }

        /* Rain Animation */
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

        /* Rising water level for rain theme */
        @keyframes waterRise {
          0% { transform: translateY(100%); opacity: 0; }
          10% { opacity: 0.6; }
          100% { transform: translateY(0); opacity: 0.25; }
        }
        .water-layer {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          height: 40vh;
          background: linear-gradient(0deg, rgba(156, 213, 236, 0.6) 0%, rgba(156, 213, 236, 0.15) 60%, rgba(156, 213, 236, 0) 100%);
          pointer-events: none;
          z-index: 2;
          animation: waterRise 6s ease-in-out infinite;
        }

        /* Cat theme: walking cat at bottom */
        @keyframes catWalk {
          0% { transform: translateX(-10vw); }
          100% { transform: translateX(110vw); }
        }
        .walking-cat {
          position: fixed;
          bottom: 2vh;
          font-size: 40px;
          pointer-events: none;
          z-index: 5;
          animation: catWalk 18s linear infinite;
        }

        /* Butterfly theme: flying butterfly on click */
        @keyframes butterflyFly {
          0% { transform: translate(0, 0) scale(0.8); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translate(var(--fly-dx, 100px), var(--fly-dy, -150px)) scale(1.1); opacity: 0; }
        }
        .click-butterfly {
          position: fixed;
          font-size: 22px;
          pointer-events: none;
          z-index: 6;
          animation: butterflyFly 2.2s ease-out forwards;
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
      `}</style>

      {/* RAIN ANIMATION OVERLAY FOR RAIN THEME + RISING WATER */}
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
          <div className="water-layer" />
        </>
      )}

      {/* WALKING CAT FOR CAT THEME */}
      {currentTheme === 'cat' && (
        <div className="walking-cat">🐱</div>
      )}
      {/* DYNAMIC BACKGROUND */}
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        backgroundImage: currentTheme === 'custom' && customBgImage
          ? `url('${customBgImage}')`
          : activeThemeObj.bgImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "brightness(0.75) saturate(1.1)",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, ${activeThemeObj.bgColor}55 0%, ${activeThemeObj.bgColor}dd 100%)`,
        }} />
      </div>

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* TOP NAVBAR / UTILITIES */}
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "24px 16px 40px", boxSizing: "border-box" }}>

          <div style={{ width: "100%", maxWidth: 480, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>

            {/* LIVE CLOCK WITH WEATHER SIGN */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="live-clock-badge" style={{
                background: "rgba(0,0,0,0.35)",
                borderRadius: 20,
                padding: "6px 16px",
                fontSize: 13,
                fontWeight: 700,
                color: activeThemeObj.accent,
                backdropFilter: "blur(12px)",
                letterSpacing: "0.05em"
              }}>
                {formatLiveClock(now)}
              </div>

              {/* Simple weather sign (static placeholder; can be replaced with API later) */}
              <div style={{
                background: "rgba(0,0,0,0.35)",
                borderRadius: 16,
                padding: "6px 10px",
                fontSize: 13,
                fontWeight: 700,
                color: "#FFF",
                backdropFilter: "blur(12px)",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}>
                <Sun size={14} color="#FFD56A" /> 28°C
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* TOP BAR NAAM JAAP BUTTON - ONLY SPARKLES SYMBOL & COUNT */}
              <button
                onClick={() => setShowJaapModal(true)}
                className="ghibli-btn"
                style={{
                  background: `linear-gradient(135deg, ${activeThemeObj.accent} 0%, #D2C4FB 100%)`,
                  color: "#1B1726",
                  padding: "8px 14px",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0px 4px 16px rgba(0,0,0,0.3)"
                }}
              >
                <Sparkles size={15} color="#1B1726" /> ({jaapData[todayKey] || 0})
              </button>

              {/* MUSIC PLAYER BUTTON */}
              <button
                onClick={() => setShowMusicModal(true)}
                className="ghibli-btn"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#FFF",
                  border: "1px solid rgba(255,255,255,0.25)",
                  padding: "8px 12px",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <Music size={15} />
              </button>

              {/* BOOKS BUTTON */}
              <button
                onClick={() => setShowBooksModal(true)}
                className="ghibli-btn"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#FFF",
                  border: "1px solid rgba(255,255,255,0.25)",
                  padding: "8px 12px",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <BookOpen size={15} />
              </button>

              {/* THEME SWITCHER BUTTON */}
              <button
                onClick={() => setShowThemeModal(true)}
                className="ghibli-btn"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#FFF",
                  border: "1px solid rgba(255,255,255,0.25)",
                  padding: "8px 12px",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <Palette size={15} />
              </button>
            </div>
          </div>
          {/* TIMER CARD */}
          <div style={{ width: "100%", maxWidth: 460 }}>
            <div style={{ width: "100%", padding: "20px 20px", textAlign: "center", boxSizing: "border-box" }}>

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
                  Focus Session
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
                  Break Time
                </button>
              </div>

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

              <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: "0.04em", fontFamily: "monospace", textShadow: "0px 4px 20px rgba(0,0,0,0.6)", color: "#FFF" }}>
                {formatPomoTime(pomoTime)}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 12 }}>
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
            </div>
          </div>
          {/* CALENDAR - BACKGROUND GRADIENT CHANGES PER MONTH */}
          <div className="ghibli-card" style={{
            width: "100%",
            maxWidth: 380,
            padding: 22,
            margin: "20px 0",
            boxSizing: "border-box",
            background: MONTH_PASTEL_GRADIENTS[calendarView.getMonth()],
            transition: "background 0.5s ease"
          }}>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <button
                onClick={() => setCalendarView(new Date(calendarView.getFullYear(), calendarView.getMonth() - 1, 1))}
                style={{ background: "none", border: "none", color: "#FFF", cursor: "pointer", opacity: 0.7 }}
              >
                <ChevronLeft size={20} />
              </button>

              {/* MONTH TITLE CLICK OPENS MONTH GOALS MODAL */}
              <button
                onClick={() => setShowMonthGoalsModal(true)}
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#F7EBE8",
                  cursor: "pointer",
                  textDecoration: "underline text-decoration-color: rgba(255,255,255,0.3)"
                }}
                title="Click to view/add Goals for this Month"
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, textAlign: "center", fontSize: 10, fontWeight: 700, opacity: 0.5, marginBottom: 10 }}>
              <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, position: "relative" }}>
              {calendarDays.map((d, idx) => {
                if (!d) return <div key={`pad-${idx}`} />;
                const key = toKey(d);
                const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const isPast = d < todayStart;
                const isFuture = d > todayStart;
                const isCrossed = crossedDates[key] || (isPast && crossedDates[key] !== false);
                const isTodayDate = isSameDay(d, today);

                return (
                  <button
                    key={key}
                    onClick={() => handleCrossDate(d, key)}
                    style={{
                      aspectRatio: "1/1",
                      background: isTodayDate ? activeThemeObj.accent : "rgba(255,255,255,0.08)",
                      color: isTodayDate ? "#161521" : (isFuture ? "rgba(255,255,255,0.3)" : "#FFF"),
                      border: isTodayDate ? "2px solid #FFF" : "1px solid rgba(255,255,255,0.12)",
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

          <div style={{ height: 10 }}></div>
        </div>
        {/* DASHBOARD SECTION */}
        <div style={{
          background: "rgba(20, 16, 28, 0.95)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          minHeight: "100vh",
          padding: "40px 16px 80px",
          boxShadow: "0px -10px 40px rgba(0,0,0,0.5)"
        }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>

            {/* STREAK & METRICS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              <div className="ghibli-card" style={{ padding: 18, gridColumn: "span 2" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.05em", fontWeight: 700, opacity: 0.7, display: "flex", alignItems: "center", gap: 4 }}>
                  <Flame size={14} color="#E59866" /> STREAK
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: "#FFE885" }}>{streak}d</div>
              </div>

              <div className="ghibli-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.05em", fontWeight: 700, opacity: 0.7 }}>MAX PRODUCTIVITY 🐢</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#99E3B4", marginTop: 4 }}>{overall.maxProdDays}</div>
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>≥ 90% completed</div>
              </div>

              <div className="ghibli-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.05em", fontWeight: 700, opacity: 0.7 }}>IN BETWEEN 🐧</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#F3C68F", marginTop: 4 }}>{overall.inBetweenDays}</div>
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>&gt; 50% &amp; &lt; 90%</div>
              </div>

              <div className="ghibli-card" style={{ padding: 16, gridColumn: "span 2" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.05em", fontWeight: 700, opacity: 0.7 }}>MIN PRODUCTIVITY 🐇</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#E86F88", marginTop: 4 }}>{overall.minProdDays}</div>
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>≤ 50% completed</div>
              </div>
            </div>
            {/* PROGRESS BAR */}
            <div className="ghibli-card" style={{ padding: 18, marginBottom: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.05em", fontWeight: 700, opacity: 0.7, marginBottom: 24 }}>TODAY'S CLIMB</div>
              <div style={{ position: "relative", height: 18, background: "rgba(12, 10, 18, 0.7)", borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.15)", marginBottom: 28 }}>

                <div style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
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
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#FFE885",
                        textAlign: "center",
                        position: "absolute",
                        top: 24,
                        left: "50%",
                        transform: "translateX(-50%)",
                        whiteSpace: "nowrap",
                        textShadow: "0px 2px 4px rgba(0,0,0,0.9)"
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
            {/* LAST 7 DAYS */}
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

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 8,
                justifyContent: "center",
                alignItems: "center"
              }}>
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
                        borderRadius: 12,
                        aspectRatio: "1/1",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        padding: 0
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
            {/* NOTES PREVIEW */}
            <div className="ghibli-card" style={{ padding: 18, marginBottom: 20, cursor: "pointer" }} onClick={() => setShowNotesModal(true)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7 }}>Notes</div>
                <Maximize2 size={14} opacity={0.6} />
              </div>
              <div style={{ fontSize: 13, opacity: notes ? 0.9 : 0.4, whiteSpace: "pre-wrap", maxHeight: 50, overflow: "hidden" }}>
                {notes || "Click to expand notes view..."}
              </div>
            </div>

            {/* DAY HEADER */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <button onClick={() => setViewDate((d) => addDays(d, -1))} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
                <ChevronLeft size={24} />
              </button>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {isToday ? "Today" : dayLabel(viewDate)}
              </div>
              <button onClick={() => setViewDate((d) => addDays(d, 1))} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
                <ChevronRight size={24} />
              </button>
            </div>
            {/* TASK INPUT */}
            <div className="ghibli-card" style={{ padding: 18, marginBottom: 20 }}>
              <input
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="hurry up set your targets MORIKO!"
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
            {/* TASK LIST */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 30 }}>
              {currentTasks.map((t, index) => (
                <div key={t.id} className="ghibli-card" style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                  <button onClick={() => removeTask(t.id)} style={{ background: "none", border: "none", opacity: 0.5, cursor: "pointer", color: "inherit" }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", fontSize: 12, opacity: 0.5, fontStyle: "italic" }}>
              "a climber only fails when he stops climbing" ~ Mori
            </div>
          </div>
        </div>
      </div>
      {/* NOTES MODAL */}
      {showNotesModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99, background: "rgba(20, 16, 28, 0.9)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="ghibli-card" style={{ width: "100%", maxWidth: 600, height: "80vh", display: "flex", flexDirection: "column", padding: 24, boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Notes</div>
              <button onClick={() => setShowNotesModal(false)} style={{ background: "none", border: "none", color: "#FFF", cursor: "pointer" }}>
                <Minimize2 size={20} />
              </button>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => localStorage.setItem('mori_notes', notes)}
              placeholder="Write your study notes, thoughts, or goals here..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", resize: "none", color: "#FFF", fontFamily: "inherit", fontSize: 15, lineHeight: 1.6 }}
            />
          </div>
        </div>
      )}
      {/* NAAM JAAP MODAL */}
      {showJaapModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(18, 14, 26, 0.92)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="ghibli-card" style={{ width: "100%", maxWidth: 440, padding: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={18} color="#F7C5CC" />
                <span style={{ fontSize: 18, fontWeight: 800 }}>Naam Jaap</span>
              </div>
              <button onClick={() => setShowJaapModal(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#FFF", borderRadius: "50%", width: 32, height: 32, cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div className="jaap-ring-btn" onClick={() => addJaapCount(1)} style={{ margin: "20px 0" }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", opacity: 0.8 }}>TAP COUNT</span>
              <span style={{ fontSize: 44, fontWeight: 800 }}>{jaapData[todayKey] || 0}</span>
              <span style={{ fontSize: 11, opacity: 0.8 }}>Today</span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => addJaapCount(1)} className="ghibli-btn" style={{ background: "rgba(255,255,255,0.12)", color: "#FFF", padding: "8px 14px", fontSize: 12 }}>+1</button>
              <button onClick={() => addJaapCount(11)} className="ghibli-btn" style={{ background: "rgba(255,255,255,0.12)", color: "#FFF", padding: "8px 14px", fontSize: 12 }}>+11</button>
              <button onClick={() => addJaapCount(108)} className="ghibli-btn" style={{ background: activeThemeObj.accent, color: "#161521", padding: "8px 16px", fontSize: 12 }}>+108</button>
              <button onClick={() => addJaapCount(-1)} className="ghibli-btn" style={{ background: "rgba(255,255,255,0.06)", color: "#E86F88", padding: "8px 12px", fontSize: 12 }}>-1</button>
            </div>
          </div>
        </div>
      )}
      {/* MONTH GOALS MODAL */}
      {showMonthGoalsModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(18, 14, 26, 0.92)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="ghibli-card" style={{ width: "100%", maxWidth: 480, padding: 24, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
                Goals for {calendarView.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <button onClick={() => setShowMonthGoalsModal(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#FFF", borderRadius: "50%", width: 32, height: 32, cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              <input
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addMonthGoal()}
                placeholder="Add new monthly target..."
                className="kw-input"
                style={{ flex: 1, fontSize: 13 }}
              />
              <button onClick={addMonthGoal} className="ghibli-btn" style={{ background: activeThemeObj.accent, color: "#161521", padding: "0 18px", fontSize: 13 }}>
                <Plus size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 300, overflowY: "auto" }}>
              {currentMonthGoals.length === 0 ? (
                <div style={{ opacity: 0.5, textAlign: "center", padding: 20, fontSize: 13 }}>No goals set for this month yet.</div>
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
          </div>
        </div>
      )}
      {/* MUSIC PLAYER MODAL */}
      {showMusicModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(18, 14, 26, 0.92)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="ghibli-card" style={{ width: "100%", maxWidth: 420, padding: 24, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Music size={18} color={activeThemeObj.accent} />
                <span style={{ fontSize: 18, fontWeight: 800 }}>Study Playlist</span>
              </div>
              <button onClick={() => setShowMusicModal(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#FFF", borderRadius: "50%", width: 32, height: 32, cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {playlist.length > 0 && (
              <audio
                ref={audioRef}
                src={playlist[currentTrackIdx]?.url}
                onEnded={nextTrack}
                preload="auto"
              />
            )}

            <div style={{ padding: 20, background: "rgba(0,0,0,0.3)", borderRadius: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                {playlist.length > 0 ? playlist[currentTrackIdx]?.name : "No tracks uploaded"}
              </div>
              <div style={{ fontSize: 11, opacity: 0.6 }}>
                {playlist.length > 0 ? `Track ${currentTrackIdx + 1} of ${playlist.length}` : "Upload MP3 or audio files from storage"}
              </div>
            </div>

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
            <label className="ghibli-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", color: "#FFF", padding: "10px 18px", fontSize: 13, cursor: "pointer" }}>
              <Upload size={16} /> Upload Audio Files
              <input type="file" accept="audio/*" multiple onChange={handleAudioUpload} style={{ display: "none" }} />
            </label>
          </div>
        </div>
      )}
      {/* THEMES MODAL */}
      {showThemeModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(18, 14, 26, 0.92)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="ghibli-card" style={{ width: "100%", maxWidth: 440, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Choose Aesthetic Theme</div>
              <button onClick={() => setShowThemeModal(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#FFF", borderRadius: "50%", width: 32, height: 32, cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {Object.values(THEMES).map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setCurrentTheme(t.id); setShowThemeModal(false); }}
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

            {/* Custom theme background uploader */}
            {currentTheme === 'custom' && (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Custom Background</div>
                <label className="ghibli-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", color: "#FFF", padding: "8px 14px", fontSize: 12, cursor: "pointer" }}>
                  <Upload size={14} /> Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = URL.createObjectURL(file);
                      setCustomBgImage(url);
                    }}
                    style={{ display: "none" }}
                  />
                </label>
                {customBgImage && (
                  <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                    Background set. You can re-upload to change it.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* VINTAGE BOOKS & PDF TRACKER MODAL */}
      {showBooksModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(28, 22, 18, 0.95)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="ghibli-card" style={{
            width: "100%",
            maxWidth: 640,
            maxHeight: "85vh",
            padding: 24,
            background: "#2A211B",
            border: "2px solid #5C4838",
            color: "#F2E8DC",
            fontFamily: "'Playfair Display', serif",
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 22, fontWeight: 800, fontStyle: "italic" }}>📖 Vintage Library</div>
              <button onClick={() => setShowBooksModal(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#FFF", borderRadius: "50%", width: 32, height: 32, cursor: "pointer" }}>
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
                  No books added yet. Upload PDFs to track your reading journey!
                </div>
              ) : (
                books.map((b) => {
                  const pct = Math.min(100, Math.round((b.currentPage / b.totalPages) * 100));
                  return (
                    <div key={b.id} style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 16, border: "1px solid #4A3A2C" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{b.title}</div>
                        <button
                          onClick={() => openPdfInBrowser(b.url)}
                          style={{ background: "none", border: "none", color: "#C49A6C", cursor: "pointer", textDecoration: "underline", fontSize: 13 }}
                        >
                          Open PDF
                        </button>
                      </div>

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
      )}
      {/* PRODUCTIVITY DATE DRILL-DOWN (below dashboard) */}
      {selectedProductivityDateKey && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 90,
          background: "rgba(18, 14, 26, 0.96)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.15)",
          padding: 16,
          maxHeight: "40vh",
          overflowY: "auto"
        }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>
                Tasks on {fromKey(selectedProductivityDateKey).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <button
                onClick={() => setSelectedProductivityDateKey(null)}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#FFF", borderRadius: "50%", width: 28, height: 28, cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(tasksByDate[selectedProductivityDateKey] || []).map((t, i) => (
                <div key={t.id} style={{
                  background: "rgba(255,255,255,0.06)",
                  padding: 10,
                  borderRadius: 12
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, textDecoration: t.status === 'achieved' ? 'line-through' : 'none' }}>
                    <span style={{ opacity: 0.5, marginRight: 6 }}>{i + 1}.</span>
                    {t.text}
                  </div>
                  {(t.start || t.end) && (
                    <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
                      {t.start && t.end ? `${t.start} – ${t.end}` : t.start || t.end}
                    </div>
                  )}
                </div>
              ))}
              {(tasksByDate[selectedProductivityDateKey] || []).length === 0 && (
                <div style={{ fontSize: 12, opacity: 0.5, textAlign: "center", padding: 12 }}>
                  No tasks logged for this date.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      // Helper: get arrays of dates for each productivity category
      const getProdDates = () => {
        const maxDates = [];
        const minDates = [];
        const inBetweenDates = [];

        Object.keys(tasksByDate).forEach((key) => {
          const dayTasks = tasksByDate[key] || [];
          if (dayTasks.length === 0) return;
          const achieved = dayTasks.filter((t) => t.status === 'achieved').length;
          const rate = achieved / dayTasks.length;
          if (rate >= 0.9) maxDates.push(key);
          else if (rate <= 0.5) minDates.push(key);
          else inBetweenDates.push(key);
        });

        return { maxDates, minDates, inBetweenDates };
      };

      const prodDates = getProdDates();
            {/* STREAK & METRICS (ENHANCED WITH DATE DRILL-DOWN) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              <div className="ghibli-card" style={{ padding: 18, gridColumn: "span 2" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.05em", fontWeight: 700, opacity: 0.7, display: "flex", alignItems: "center", gap: 4 }}>
                  <Flame size={14} color="#E59866" /> STREAK
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: "#FFE885" }}>{streak}d</div>
              </div>

              <div className="ghibli-card" style={{ padding: 16, cursor: "pointer" }}
                onClick={() => setSelectedProductivityDateKey(prodDates.maxDates[0] || null)}>
                <div style={{ fontSize: 10, letterSpacing: "0.05em", fontWeight: 700, opacity: 0.7 }}>MAX PRODUCTIVITY 🐢</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#99E3B4", marginTop: 4 }}>
                  {overall.maxProdDays}
                </div>
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>
                  ≥ 90% completed {prodDates.maxDates.length > 0 && `• ${prodDates.maxDates.length} day${prodDates.maxDates.length > 1 ? 's' : ''}`}
                </div>
              </div>

              <div className="ghibli-card" style={{ padding: 16, cursor: "pointer" }}
                onClick={() => setSelectedProductivityDateKey(prodDates.inBetweenDates[0] || null)}>
                <div style={{ fontSize: 10, letterSpacing: "0.05em", fontWeight: 700, opacity: 0.7 }}>IN BETWEEN 🐧</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#F3C68F", marginTop: 4 }}>
                  {overall.inBetweenDays}
                </div>
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>
                  &gt; 50% &amp; &lt; 90% {prodDates.inBetweenDates.length > 0 && `• ${prodDates.inBetweenDates.length} day${prodDates.inBetweenDates.length > 1 ? 's' : ''}`}
                </div>
              </div>

              <div className="ghibli-card" style={{ padding: 16, gridColumn: "span 2", cursor: "pointer" }}
                onClick={() => setSelectedProductivityDateKey(prodDates.minDates[0] || null)}>
                <div style={{ fontSize: 10, letterSpacing: "0.05em", fontWeight: 700, opacity: 0.7 }}>MIN PRODUCTIVITY 🐇</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#E86F88", marginTop: 4 }}>
                  {overall.minProdDays}
                </div>
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>
                  ≤ 50% completed {prodDates.minDates.length > 0 && `• ${prodDates.minDates.length} day${prodDates.minDates.length > 1 ? 's' : ''}`}
                </div>
              </div>
            </div>
      // Butterfly theme: click to spawn flying butterflies
      const [butterflies, setButterflies] = useState([]);

      useEffect(() => {
        if (currentTheme !== 'butterfly') return;
        const handleClick = (e) => {
          // Ignore clicks inside modals/buttons to avoid clutter
          if (e.target.closest('button') || e.target.closest('.ghibli-card')) return;
          const id = Date.now() + Math.random();
          const dx = (Math.random() * 200 - 100) + 'px';
          const dy = (Math.random() * -200 - 100) + 'px';
          setButterflies((prev) => [
            ...prev,
            { id, x: e.clientX, y: e.clientY, dx, dy }
          ]);
          // Remove after animation
          setTimeout(() => {
            setButterflies((prev) => prev.filter((b) => b.id !== id));
          }, 2200);
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
      }, [currentTheme]);
      {/* BUTTERFLY CLICK-TO-SPAWN OVERLAY (only in butterfly theme) */}
      {currentTheme === 'butterfly' && butterflies.map((b) => (
        <div
          key={b.id}
          className="click-butterfly"
          style={{
            left: b.x,
            top: b.y,
            '--fly-dx': b.dx,
            '--fly-dy': b.dy
          }}
        >
          🦋
        </div>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StudyLedger />
  </React.StrictMode>
);

export default StudyLedger;
  // Mala 108-count audio/haptic cue
  const lastJaapCountRef = useRef(0);
  const bowlAudioRef = useRef(null);

  useEffect(() => {
    // Create a short, soft bowl/chime sound (royalty-free example URL)
    const BOWL_SOUND_URL = 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_07e2a5c827.mp3?filename=meditation-bell-11126.mp3';
    bowlAudioRef.current = new Audio(BOWL_SOUND_URL);
    bowlAudioRef.current.volume = 0.5;
    bowlAudioRef.current.preload = 'auto';
  }, []);

  useEffect(() => {
    const currentCount = jaapData[todayKey] || 0;
    const lastCount = lastJaapCountRef.current;

    // Trigger on every 108 counts crossed (e.g., 108, 216, 324, ...)
    if (currentCount > 0 && currentCount !== lastCount) {
      const prevMod = Math.floor(lastCount / 108);
      const currMod = Math.floor(currentCount / 108);
      if (currMod > prevMod) {
        // Play soft bowl sound
        if (bowlAudioRef.current) {
          bowlAudioRef.current.currentTime = 0;
          bowlAudioRef.current.play().catch(() => {});
        }
        // Mobile vibration (if supported)
        if (navigator.vibrate) {
          navigator.vibrate([150, 80, 150]);
        }
      }
      lastJaapCountRef.current = currentCount;
    }
  }, [jaapData, todayKey]);
  const addTask = () => {
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      start: newStart,
      end: newEnd,
      status: 'pending',
      rollover: false,        // new field
      sourceDate: null        // new field (key of original day, if rolled over)
    };
    setTasksByDate((prev) => ({
      ...prev,
      [viewKey]: [...(prev[viewKey] || []), newTask]
    }));
    setNewTaskText('');
    setNewStart('');
    setNewEnd('');
  };
            {/* TASK LIST WITH ROLLOVER */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 30 }}>
              {currentTasks.map((t, index) => {
                const canRollover = t.status !== 'achieved';
                return (
                  <div key={t.id} className="ghibli-card" style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {canRollover && (
                        <button
                          onClick={() => {
                            const tomorrowKey = toKey(addDays(viewDate, 1));
                            const rolledTask = {
                              ...t,
                              id: Date.now().toString(),
                              status: 'pending',
                              rollover: true,
                              sourceDate: viewKey
                            };
                            setTasksByDate((prev) => ({
                              ...prev,
                              [tomorrowKey]: [...(prev[tomorrowKey] || []), rolledTask]
                            }));
                          }}
                          className="ghibli-btn"
                          style={{
                            background: "rgba(255,255,255,0.12)",
                            color: "#FFF",
                            border: "1px solid rgba(255,255,255,0.2)",
                            padding: "6px 10px",
                            fontSize: 11
                          }}
                        >
                          Rollover to Tomorrow
                        </button>
                      )}
                      <button onClick={() => removeTask(t.id)} style={{ background: "none", border: "none", opacity: 0.5, cursor: "pointer", color: "inherit" }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          {/* CAT THEME: ANIMATED CATS OVER CALENDAR */}
          {currentTheme === 'cat' && (
            <div style={{ position: "relative", marginTop: -10, marginBottom: 10, pointerEvents: "none" }}>
              <div style={{ position: "absolute", top: -10, left: "10%", fontSize: 28, opacity: 0.9 }}>🐱</div>
              <div style={{ position: "absolute", top: -20, right: "15%", fontSize: 24, opacity: 0.8 }}>🐾</div>
              <div style={{ position: "absolute", bottom: -5, left: "25%", fontSize: 22, opacity: 0.7 }}>🧶</div>
            </div>
          )}
      {/* BUTTERFLY THEME: VINTAGE BUTTERFLY BACKGROUND OVERLAY */}
      {currentTheme === 'butterfly' && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          backgroundImage: "url('https://images.unsplash.com/photo-1509214624648-28e7a9a78e4a?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.08,
          filter: "sepia(0.6) contrast(1.1)"
        }} />
      )}
{/* 100% COMPLETION CELEBRATION FALLING CONFETTI / STARS */}
{overall.rate === 100 && currentTasks.length > 0 && (
  <>
    {[...Array(24)].map((_, i) => (
      <div
        key={`confetti-${i}`}
        className="confetti-piece"
        style={{
          left: `${(i * 4.2) % 100}%`,
          animationDelay: `${(i * 0.15) % 2.5}s`,
          fontSize: `${16 + (i % 3) * 6}px`
        }}
      >
        {["✨", "⭐", "🎉", "🌟", "💖", "🌸"][i % 6]}
      </div>
    ))}
  </>
)}





