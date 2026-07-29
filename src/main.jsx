import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReactDOM from "react-dom/client";
import {
  Check, X, Plus, ChevronLeft, ChevronRight, Flame, Trash2, Clock, Maximize2,
  Minimize2, Snowflake, Heart, Wind, Umbrella, Sun, Zap, Cloud, Feather, Coffee,
  Moon, Star, Compass, Play, Pause, RotateCcw, Settings, Sparkles, Volume2, Award
} from "lucide-react";

if (!window.storage) {
  window.storage = {
    get: async (key) => {
      const val = localStorage.getItem(key);
      return val !== null ? { value: val } : null;
    },
    set: async (key, val) => {
      localStorage.setItem(key, val);
    },
    list: async (prefix) => {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(prefix));
      return { keys };
    },
  };
}

const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Dancing+Script:wght@600;700&family=Fredoka:wght@400;500;600&display=swap');
`;

// Helper Web Audio API Chime (Ghibli Soft Sound)
const playSoftChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.7);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.75);
    });
  } catch (e) {
    console.error("Audio playback error", e);
  }
};

function toKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function fromKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function isSameDay(a, b) {
  return toKey(a) === toKey(b);
}
function dayLabel(date) {
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const TIME_OPTIONS_12H = [];
for (let i = 0; i < 24; i++) {
  for (let j = 0; j < 60; j += 30) {
    const hour12 = i % 12 === 0 ? 12 : i % 12;
    const ampm = i < 12 ? "AM" : "PM";
    const mm = String(j).padStart(2, "0");
    const hh = String(hour12).padStart(2, "0");
    TIME_OPTIONS_12H.push(`${hh}:${mm} ${ampm}`);
  }
}

const MONTH_DOODLES = [
  <Snowflake size={18} strokeWidth={1.5} />,
  <Heart size={18} strokeWidth={1.5} />,
  <Wind size={18} strokeWidth={1.5} />,
  <Umbrella size={18} strokeWidth={1.5} />,
  <Sun size={18} strokeWidth={1.5} />,
  <Zap size={18} strokeWidth={1.5} />,
  <Cloud size={18} strokeWidth={1.5} />,
  <Feather size={18} strokeWidth={1.5} />,
  <Coffee size={18} strokeWidth={1.5} />,
  <Moon size={18} strokeWidth={1.5} />,
  <Star size={18} strokeWidth={1.5} />,
  <Compass size={18} strokeWidth={1.5} />
];
function StudyLedger() {
  const [viewDate, setViewDate] = useState(new Date());
  const [targetsByDay, setTargetsByDay] = useState({});
  const [notes, setNotes] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [crossedDates, setCrossedDates] = useState({});
  const [newTaskText, setNewTaskText] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [now, setNow] = useState(new Date());

  // NAAM JAAP STATE
  const [showJaapModal, setShowJaapModal] = useState(false);
  const [jaapData, setJaapData] = useState({});

  // Last 7 Days Anchor Date State
  const [sevenDaysAnchor, setSevenDaysAnchor] = useState(new Date());

  // Pomodoro Timer State
  const [timerType, setTimerType] = useState("focus");
  const [focusHours, setFocusHours] = useState(0);
  const [focusMins, setFocusMins] = useState(25);
  const [breakHours, setBreakHours] = useState(0);
  const [breakMins, setBreakMins] = useState(5);

  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [pomoActive, setPomoActive] = useState(false);

  // Calendar View State
  const [calendarView, setCalendarView] = useState(new Date(now.getFullYear(), now.getMonth(), 1));

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const triggerVibrationAndChime = () => {
    playSoftChime();
    if (typeof window !== "undefined" && "navigator" in window && navigator.vibrate) {
      navigator.vibrate([300, 150, 300, 150, 500]);
    }
  };

  useEffect(() => {
    let timer = null;
    if (pomoActive && pomoTime > 0) {
      timer = setInterval(() => setPomoTime((prev) => prev - 1), 1000);
    } else if (pomoTime === 0 && pomoActive) {
      setPomoActive(false);
      triggerVibrationAndChime();
    }
    return () => clearInterval(timer);
  }, [pomoActive, pomoTime]);

  const switchTimerMode = (type) => {
    setTimerType(type);
    setPomoActive(false);
    if (type === "focus") {
      const sec = (parseInt(focusHours || 0, 10) * 3600) + (parseInt(focusMins || 0, 10) * 60);
      setPomoTime(sec);
    } else {
      const sec = (parseInt(breakHours || 0, 10) * 3600) + (parseInt(breakMins || 0, 10) * 60);
      setPomoTime(sec);
    }
  };

  const updateFocusTime = (h, m) => {
    setFocusHours(h);
    setFocusMins(m);
    if (timerType === "focus") {
      const sec = (parseInt(h || 0, 10) * 3600) + (parseInt(m || 0, 10) * 60);
      setPomoTime(sec);
      setPomoActive(false);
    }
  };

  const updateBreakTime = (h, m) => {
    setBreakHours(h);
    setBreakMins(m);
    if (timerType === "break") {
      const sec = (parseInt(h || 0, 10) * 3600) + (parseInt(m || 0, 10) * 60);
      setPomoTime(sec);
      setPomoActive(false);
    }
  };

  const formatPomoTime = (totalSec) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const formatLiveClock = (date) => {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true
    });
  };

  const today = useMemo(() => new Date(), [now.toDateString()]);
  const viewKey = toKey(viewDate);
  const todayKey = toKey(today);
  const isToday = isSameDay(viewDate, today);

  // Load Saved Data
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const notesRes = await window.storage.get("notes").catch(() => null);
        if (!cancelled && notesRes && typeof notesRes.value === "string") setNotes(notesRes.value);
      } catch (e) {}
      try {
        const crossedRes = await window.storage.get("crossed-dates").catch(() => null);
        if (!cancelled && crossedRes && crossedRes.value) setCrossedDates(JSON.parse(crossedRes.value));
      } catch (e) {}
      try {
        const jaapRes = await window.storage.get("naam-jaap-data").catch(() => null);
        if (!cancelled && jaapRes && jaapRes.value) setJaapData(JSON.parse(jaapRes.value));
      } catch (e) {}
      try {
        const listRes = await window.storage.list("targets:").catch(() => null);
        if (listRes && listRes.keys && listRes.keys.length) {
          const entries = await Promise.all(
            listRes.keys.map(async (k) => {
              try {
                const r = await window.storage.get(k);
                return [k.replace("targets:", ""), r ? JSON.parse(r.value) : []];
              } catch {
                return [k.replace("targets:", ""), []];
              }
            })
          );
          if (!cancelled) {
            const map = {};
            entries.forEach(([day, val]) => { map[day] = val; });
            setTargetsByDay(map);
          }
        }
      } catch (e) {}
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const saveDay = useCallback(async (key, tasks) => {
    try { await window.storage.set(`targets:${key}`, JSON.stringify(tasks)); } catch (e) {}
  }, []);

  const saveNotes = useCallback(async (text) => {
    try { await window.storage.set("notes", text); } catch (e) {}
  }, []);

  const saveJaap = useCallback(async (data) => {
    try { await window.storage.set("naam-jaap-data", JSON.stringify(data)); } catch (e) {}
  }, []);

  const addJaapCount = (amount = 1) => {
    setJaapData((prev) => {
      const current = prev[todayKey] || 0;
      const updated = { ...prev, [todayKey]: Math.max(0, current + amount) };
      saveJaap(updated);
      return updated;
    });
    if (navigator.vibrate) navigator.vibrate(25);
  };

  const handleCrossDate = useCallback((date, key) => {
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (date > todayStart) return;
    setCrossedDates((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      window.storage.set("crossed-dates", JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, [today]);

  const currentTasks = targetsByDay[viewKey] || [];

  function updateDay(key, updater) {
    setTargetsByDay((prev) => {
      const next = { ...prev, [key]: updater(prev[key] || []) };
      saveDay(key, next[key]);
      return next;
    });
  }

  function addTask() {
    const text = newTaskText.trim();
    if (!text) return;
    updateDay(viewKey, (tasks) => [
      ...tasks,
      { id: uid(), text, status: "pending", start: newStart || null, end: newEnd || null },
    ]);
    setNewTaskText("");
    setNewStart("");
    setNewEnd("");
  }

  function setStatus(id, status) {
    updateDay(viewKey, (tasks) =>
      tasks.map((t) => (t.id === id ? { ...t, status: t.status === status ? "pending" : status } : t))
    );
  }

  function removeTask(id) {
    updateDay(viewKey, (tasks) => tasks.filter((t) => t.id !== id));
  }

  // Dynamic Streak Logic
  const streak = useMemo(() => {
    let count = 0;
    let cursor = new Date(today);
    for (let i = 0; i < 3650; i++) {
      const key = toKey(cursor);
      const tasks = targetsByDay[key];
      if (tasks && tasks.length > 0) {
        count += 1;
      } else {
        if (isSameDay(cursor, today)) {
          count += 1;
        } else {
          break;
        }
      }
      cursor = addDays(cursor, -1);
    }
    return count;
  }, [targetsByDay, today]);

  // Last 7 Days Array
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(sevenDaysAnchor, -i);
      const key = toKey(d);
      days.push({ key, date: d });
    }
    return days;
  }, [sevenDaysAnchor]);

  // Naam Jaap Weekly Stats Calculation
  const jaapStats = useMemo(() => {
    let weekTotal = 0;
    const weekDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(today, -i);
      const k = toKey(d);
      const count = jaapData[k] || 0;
      weekTotal += count;
      weekDays.push({ key: k, dayLabel: d.toLocaleDateString(undefined, { weekday: "narrow" }), count });
    }
    const maxDayCount = Math.max(...weekDays.map((w) => w.count), 1);
    const totalAllTime = Object.values(jaapData).reduce((a, b) => a + b, 0);
    const avgPerDay = Math.round(weekTotal / 7);

    return { weekTotal, weekDays, maxDayCount, totalAllTime, avgPerDay };
  }, [jaapData, today]);

  const overall = useMemo(() => {
    let maxProdDays = 0, inBetweenDays = 0, minProdDays = 0;
    Object.entries(targetsByDay).forEach(([key, tasks]) => {
      if (!tasks || tasks.length === 0) return;
      if (fromKey(key) > today) return;
      const dayTotal = tasks.length;
      const dayAchieved = tasks.filter((t) => t.status === "achieved").length;
      const rate = dayTotal > 0 ? (dayAchieved / dayTotal) * 100 : 0;
      if (rate >= 90) maxProdDays += 1;
      else if (rate > 50 && rate < 90) inBetweenDays += 1;
      else if (rate <= 50) minProdDays += 1;
    });

    const activeTasks = targetsByDay[viewKey] || [];
    const todayTotal = activeTasks.length;
    const todayAchieved = activeTasks.filter((t) => t.status === "achieved").length;
    const todayRate = todayTotal > 0 ? Math.round((todayAchieved / todayTotal) * 100) : 0;

    return { rate: todayRate, maxProdDays, inBetweenDays, minProdDays };
  }, [targetsByDay, today, viewKey]);

  const climberPct = Math.min(100, Math.max(0, overall.rate));

  const calendarDays = useMemo(() => {
    const startOfMonth = new Date(calendarView.getFullYear(), calendarView.getMonth(), 1);
    const endOfMonth = new Date(calendarView.getFullYear(), calendarView.getMonth() + 1, 0);
    const days = [];
    const startDayOfWeek = startOfMonth.getDay();
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= endOfMonth.getDate(); d++) {
      days.push(new Date(calendarView.getFullYear(), calendarView.getMonth(), d));
    }
    return days;
  }, [calendarView]);
  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', 'Fredoka', sans-serif",
      backgroundColor: "#1B1726",
      minHeight: "100vh",
      color: "#F3EFF8",
      position: "relative",
      overflowX: "hidden",
    }}>
      <style>{`
        ${FONT_IMPORT}
        body { margin: 0; padding: 0; background: #1B1726; }
        
        .ghibli-card {
          background: rgba(42, 34, 58, 0.55);
          border: 1.5px solid rgba(255, 235, 245, 0.2);
          border-radius: 28px;
          box-shadow: 0px 16px 36px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .ghibli-card-soft {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 24px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
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
        .jaap-ring-btn {
          width: 170px;
          height: 170px;
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
          transition: transform 0.1s ease, box-shadow 0.15s ease;
          user-select: none;
        }
        .jaap-ring-btn:active {
          transform: scale(0.92);
          box-shadow: 0px 6px 16px rgba(232, 152, 172, 0.3);
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

      {/* Dreamy Soft Background */}
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "brightness(0.75) saturate(1.1)",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(38, 28, 52, 0.35) 0%, rgba(25, 18, 36, 0.65) 50%, rgba(18, 14, 26, 0.96) 100%)",
        }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* HERO / TIMER SECTION */}
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "24px 16px 40px", boxSizing: "border-box" }}>

          {/* TOP BAR WITH NAAM JAAP BUTTON */}
          <div style={{ width: "100%", maxWidth: 460, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 20,
              padding: "6px 16px",
              fontSize: 13,
              fontWeight: 700,
              color: "#F2C6DE",
              backdropFilter: "blur(8px)"
            }}>
              {formatLiveClock(now)}
            </div>

            <button
              onClick={() => setShowJaapModal(true)}
              className="ghibli-btn"
              style={{
                background: "linear-gradient(135deg, #F7C5CC 0%, #D2C4FB 100%)",
                color: "#1B1726",
                padding: "8px 16px",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0px 4px 16px rgba(247, 197, 204, 0.3)"
              }}
            >
              <Sparkles size={14} color="#1B1726" /> Naam Jaap ({jaapData[todayKey] || 0})
            </button>
          </div>

          {/* TIMER CARD */}
          <div style={{ width: "100%", maxWidth: 460 }}>
            <div className="ghibli-card-soft" style={{ width: "100%", padding: "20px 20px", textAlign: "center", boxSizing: "border-box" }}>

              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 14 }}>
                <button
                  onClick={() => switchTimerMode("focus")}
                  className="ghibli-btn"
                  style={{
                    background: timerType === "focus" ? "#F2C6DE" : "rgba(0,0,0,0.25)",
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
                    background: timerType === "focus" ? "#F2C6DE" : "#99E3B4",
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

          {/* CALENDAR */}
          <div className="ghibli-card" style={{ width: "100%", maxWidth: 360, padding: 22, margin: "20px 0", boxSizing: "border-box" }}>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <button 
                onClick={() => setCalendarView(new Date(calendarView.getFullYear(), calendarView.getMonth() - 1, 1))} 
                style={{ background: "none", border: "none", color: "#FFF", cursor: "pointer", opacity: 0.7 }}
              >
                <ChevronLeft size={20} />
              </button>

              <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: 28, fontWeight: 700, color: "#F7EBE8" }}>
                {calendarView.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>

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
                      background: isTodayDate ? "#F2C6DE" : "rgba(255,255,255,0.06)",
                      color: isTodayDate ? "#161521" : (isFuture ? "rgba(255,255,255,0.3)" : "#FFF"),
                      border: isTodayDate ? "2px solid #FFF" : "1px solid rgba(255,255,255,0.1)",
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

              <div style={{ position: "absolute", bottom: 4, right: 8, opacity: 0.25, pointerEvents: "none", color: "#FFF" }}>
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
                  background: "#F2C6DE",
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
            {/* NOTES CARD PREVIEW */}
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
                    background: "#F2C6DE",
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
              onBlur={() => saveNotes(notes)}
              placeholder="Write your study notes, thoughts, or goals here..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", resize: "none", color: "#FFF", fontFamily: "inherit", fontSize: 15, lineHeight: 1.6 }}
            />
          </div>
        </div>
      )}

      {/* NAAM JAAP MODAL & STATS WINDOW */}
      {showJaapModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "rgba(18, 14, 26, 0.92)",
          backdropFilter: "blur(20px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          overflowY: "auto"
        }}>
          <div className="ghibli-card" style={{
            width: "100%",
            maxWidth: 480,
            padding: "24px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxSizing: "border-box",
            position: "relative",
            background: "linear-gradient(180deg, rgba(46, 36, 62, 0.9) 0%, rgba(28, 22, 40, 0.95) 100%)"
          }}>
            {/* Header */}
            <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={18} color="#F7C5CC" />
                <span style={{ fontSize: 18, fontWeight: 800, color: "#FFF" }}>Naam Jaap</span>
              </div>
              <button
                onClick={() => setShowJaapModal(false)}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#FFF", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Tap Counter Ring */}
            <div style={{ margin: "16px 0 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                className="jaap-ring-btn"
                onClick={() => addJaapCount(1)}
              >
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", opacity: 0.8, textTransform: "uppercase" }}>
                  Tap Count
                </span>
                <span style={{ fontSize: 44, fontWeight: 800, margin: "2px 0" }}>
                  {jaapData[todayKey] || 0}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.8 }}>
                  Today
                </span>
              </div>

              {/* Quick Multi-Add & Decrement Buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button
                  onClick={() => addJaapCount(1)}
                  className="ghibli-btn"
                  style={{ background: "rgba(255,255,255,0.12)", color: "#FFF", padding: "8px 14px", fontSize: 12, border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  +1
                </button>
                <button
                  onClick={() => addJaapCount(11)}
                  className="ghibli-btn"
                  style={{ background: "rgba(255,255,255,0.12)", color: "#FFF", padding: "8px 14px", fontSize: 12, border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  +11
                </button>
                <button
                  onClick={() => addJaapCount(108)}
                  className="ghibli-btn"
                  style={{ background: "linear-gradient(135deg, #F7C5CC 0%, #D2C4FB 100%)", color: "#161521", padding: "8px 16px", fontSize: 12 }}
                >
                  +108
                </button>
                <button
                  onClick={() => addJaapCount(-1)}
                  className="ghibli-btn"
                  style={{ background: "rgba(255,255,255,0.06)", color: "#E86F88", padding: "8px 12px", fontSize: 12, border: "1px solid rgba(232, 111, 136, 0.3)" }}
                >
                  -1
                </button>
              </div>
            </div>

            {/* WEEKLY STATS BAR CHART */}
            <div style={{ width: "100%", background: "rgba(0,0,0,0.25)", borderRadius: 20, padding: 16, boxSizing: "border-box", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, letterSpacing: "0.05em" }}>LAST 7 DAYS JAAP</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#F7C5CC" }}>This Week: {jaapStats.weekTotal}</span>
              </div>

              {/* Bar Chart Visual */}
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 90, gap: 8, padding: "0 4px" }}>
                {jaapStats.weekDays.map((w) => {
                  const barHeightPct = Math.max(10, Math.round((w.count / jaapStats.maxDayCount) * 100));
                  const isTodayBar = w.key === todayKey;

                  return (
                    <div key={w.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: 9, opacity: 0.7, fontWeight: 600 }}>{w.count > 0 ? w.count : ""}</span>
                      <div style={{
                        width: "100%",
                        maxWidth: 24,
                        height: `${barHeightPct}%`,
                        background: isTodayBar ? "linear-gradient(180deg, #F7C5CC 0%, #E898AC 100%)" : "rgba(255,255,255,0.2)",
                        borderRadius: 6,
                        transition: "height 0.4s ease"
                      }} />
                      <span style={{ fontSize: 10, opacity: isTodayBar ? 1 : 0.5, fontWeight: isTodayBar ? 800 : 500 }}>{w.dayLabel}</span>
                    </div>
                  );
                })}
              </div>

              {/* All time & Average Footer */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>Daily Average</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#FFF", marginTop: 2 }}>{jaapStats.avgPerDay}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>All-Time Total</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#99E3B4", marginTop: 2 }}>{jaapStats.totalAllTime}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StudyLedger />
  </React.StrictMode>
);

export default StudyLedger;
