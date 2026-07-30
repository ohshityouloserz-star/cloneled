import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- Web Audio API Helpers (Low Latency) ---
const playTone = (freq, type, duration) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) { console.error("Audio block", e); }
};

const playTap = () => playTone(600, 'sine', 0.1); // Subtle soft woodblock-like tap
const playAlarm = () => {
  playTone(880, 'triangle', 0.5);
  setTimeout(() => playTone(880, 'triangle', 0.5), 600);
};

export default function App() {
  // Global Audio Permission Trigger
  const [audioEnabled, setAudioEnabled] = useState(false);
  const enableAudio = () => {
    if (!audioEnabled) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctx.resume().then(() => setAudioEnabled(true));
    }
  };
  // --- Global Date Context ---
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // --- Theme State ---
  const [theme, setTheme] = useState({
    bgColor: '#f4efe6',
    panelBg: '#ffffff',
    accentMain: '#7a907c',
    fontMain: "'Quicksand', sans-serif"
  });

  const applyTheme = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.style.setProperty('--bg-color', newTheme.bgColor);
    document.documentElement.style.setProperty('--panel-bg', newTheme.panelBg);
    document.documentElement.style.setProperty('--accent-main', newTheme.accentMain);
    document.documentElement.style.setProperty('--font-main', newTheme.fontMain);
  };

  const resetTheme = () => {
    applyTheme({ bgColor: '#f4efe6', panelBg: '#ffffff', accentMain: '#7a907c', fontMain: "'Quicksand', sans-serif" });
  };

  // --- Local Storage Helpers for Syncing ---
  const useSyncedState = (key, initialValue) => {
    const [state, setState] = useState(() => {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    });
    useEffect(() => { localStorage.setItem(key, JSON.stringify(state)); }, [key, state]);
    return [state, setState];
  };

  const [notes, setNotes] = useSyncedState('ledger_notes', {});
  const [tasks, setTasks] = useSyncedState('ledger_tasks', {});
  // --- Pomodoro State ---
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerMode, setTimerMode] = useState('focus'); // focus | break

  useEffect(() => {
    let interval = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      playAlarm();
      if ("vibrate" in navigator) navigator.vibrate([300, 150, 300]);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const toggleTimer = () => {
    enableAudio();
    setIsTimerActive(!isTimerActive);
  };

  const switchMode = (mode) => {
    setTimerMode(mode);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
    setIsTimerActive(false);
  };

  const formatTime = (sec) => `${Math.floor(sec/60).toString().padStart(2,'0')}:${(sec%60).toString().padStart(2,'0')}`;
  // --- Naam Jaap (Mala Counter) State ---
  const [malaData, setMalaData] = useSyncedState('ledger_mala', {});
  const [justCompleted108, setJustCompleted108] = useState(false);

  // Auto-reset daily logic handled by selectedDate key
  const currentMalaCount = malaData[selectedDate] || 0;

  const incrementMala = (amount) => {
    enableAudio();
    playTap();
    const newCount = currentMalaCount + amount;
    
    // Check for 108 threshold crossing
    if (Math.floor(newCount / 108) > Math.floor(currentMalaCount / 108)) {
      setJustCompleted108(true);
      setTimeout(() => setJustCompleted108(false), 1500);
    }
    
    setMalaData({ ...malaData, [selectedDate]: newCount });
  };

  // Progress Bar Math (Stroke Dasharray for SVG Circle of r=54 is ~339.29)
  const malaCircumference = 2 * Math.PI * 54;
  const malaProgress = (currentMalaCount % 108) / 108;
  const malaDashoffset = malaCircumference - (malaProgress * malaCircumference);
  return (
    <div className="app-container" onClick={enableAudio}>
      
      {/* Theme & Customizer */}
      <div className="card">
        <h3 className="card-title">Aesthetic Themes</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <select 
            value={theme.fontMain} 
            onChange={(e) => applyTheme({...theme, fontMain: e.target.value})}
            style={{ padding: '4px', borderRadius: '4px' }}
          >
            <option value="'Quicksand', sans-serif">Quicksand (Default)</option>
            <option value="'Caveat', cursive">Caveat</option>
            <option value="'Comfortaa', sans-serif">Comfortaa</option>
            <option value="'Playfair Display', serif">Playfair Display</option>
          </select>
          <input type="color" value={theme.bgColor} onChange={(e) => applyTheme({...theme, bgColor: e.target.value})} title="Background" />
          <input type="color" value={theme.accentMain} onChange={(e) => applyTheme({...theme, accentMain: e.target.value})} title="Accent" />
          <button className="btn-primary" onClick={resetTheme} style={{fontSize: '0.8rem'}}>Reset</button>
        </div>
      </div>

      {/* Global Calendar Sync */}
      <div className="card">
        <h3 className="card-title">Date Context</h3>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: '8px', width: '100%', borderRadius: '8px', border: '1px solid var(--panel-border)' }}
        />
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          Currently viewing data for: {selectedDate === todayStr ? 'Today' : selectedDate}
        </p>
      </div>
      {/* Ghibli ADHD-Friendly Pomodoro */}
      <div className="card breathing-element" style={{ background: 'linear-gradient(135deg, var(--panel-bg), #e9f0ea)', textAlign: 'center' }}>
        <h3 className="card-title" style={{justifyContent: 'center', gap: '10px'}}>
          ☁️ Sky Focus
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '10px 0' }}>
          <button onClick={() => switchMode('focus')} style={{ fontWeight: timerMode === 'focus' ? 'bold' : 'normal', background: 'none', color: 'var(--text-main)' }}>Focus</button>
          <button onClick={() => switchMode('break')} style={{ fontWeight: timerMode === 'break' ? 'bold' : 'normal', background: 'none', color: 'var(--text-main)' }}>Break</button>
        </div>
        
        <div style={{ fontSize: '3.5rem', fontWeight: '300', margin: '20px 0', color: 'var(--accent-main)' }}>
          {formatTime(timeLeft)}
        </div>
        
        <button className="btn-primary" onClick={toggleTimer} style={{ width: '120px', borderRadius: '30px', padding: '12px' }}>
          {isTimerActive ? 'Pause' : 'Start Journey'}
        </button>
      </div>
      {/* Naam Jaap Counter */}
      <div className="card" style={{ textAlign: 'center' }}>
        <h3 className="card-title" style={{justifyContent: 'center'}}>Mala Counter</h3>
        
        <div style={{ position: 'relative', width: '150px', height: '150px', margin: '20px auto' }}>
          {/* Background Track */}
          <svg width="150" height="150" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
            <circle cx="75" cy="75" r="54" stroke="var(--panel-border)" strokeWidth="6" fill="none" />
            {/* Progress Track */}
            <circle 
              cx="75" cy="75" r="54" 
              stroke="var(--accent-secondary)" 
              strokeWidth="6" 
              fill="none" 
              strokeDasharray={malaCircumference}
              strokeDashoffset={malaDashoffset}
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
          </svg>
          
          {/* Main Tap Target */}
          <button 
            className={justCompleted108 ? 'ring-glow' : ''}
            onClick={() => incrementMala(1)}
            style={{
              position: 'absolute', top: '15px', left: '15px', width: '120px', height: '120px',
              borderRadius: '50%', background: 'var(--panel-bg)', border: '2px solid var(--accent-secondary)',
              fontSize: '2rem', color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {currentMalaCount}
          </button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <button className="btn-primary" onClick={() => incrementMala(1)}>+ 1</button>
          <button className="btn-primary" onClick={() => incrementMala(11)}>+ 11</button>
        </div>
      </div>
      {/* Date-Synced Notes */}
      <div className="card">
        <h3 className="card-title">Journal ({selectedDate})</h3>
        <textarea 
          rows="4" 
          value={notes[selectedDate] || ''}
          onChange={(e) => setNotes({...notes, [selectedDate]: e.target.value})}
          placeholder="A thought, a small win..."
          style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', resize: 'none', fontFamily: 'inherit' }}
        />
      </div>
      {/* Audio Player */}
      <div className="card">
        <h3 className="card-title">Background Audio</h3>
        <input 
          type="file" 
          accept="audio/*" 
          onChange={(e) => {
            if(e.target.files[0]) {
              const url = URL.createObjectURL(e.target.files[0]);
              document.getElementById('bg-audio').src = url;
            }
          }}
          style={{ marginBottom: '10px', fontSize: '0.8rem' }}
        />
        
        <audio 
          id="bg-audio" 
          onLoadedMetadata={(e) => document.getElementById('audio-dur').innerText = formatTime(e.target.duration)}
          onTimeUpdate={(e) => {
            document.getElementById('audio-prog').value = e.target.currentTime;
            document.getElementById('audio-prog').max = e.target.duration;
            document.getElementById('audio-cur').innerText = formatTime(e.target.currentTime);
          }}
        />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}>
          <button className="btn-primary" onClick={() => document.getElementById('bg-audio').play()}>▶</button>
          <button className="btn-primary" onClick={() => document.getElementById('bg-audio').pause()}>❚❚</button>
          <span id="audio-cur">00:00</span>
          <input 
            type="range" 
            id="audio-prog" 
            defaultValue="0"
            onChange={(e) => document.getElementById('bg-audio').currentTime = e.target.value}
          />
          <span id="audio-dur">00:00</span>
        </div>
      </div>
      {/* PDF Library Manager */}
      <div className="card">
        <h3 className="card-title">Study Library (PDFs)</h3>
        <input 
          type="file" 
          accept="application/pdf"
          onChange={(e) => {
            if(e.target.files[0]) {
              const newFile = { name: e.target.files[0].name, url: URL.createObjectURL(e.target.files[0]), id: Date.now() };
              const currentPdfs = JSON.parse(localStorage.getItem('ledger_pdfs') || '[]');
              localStorage.setItem('ledger_pdfs', JSON.stringify([...currentPdfs, newFile]));
              window.dispatchEvent(new Event('storage')); // Force re-render trick for simple state
            }
          }}
          style={{ marginBottom: '15px', fontSize: '0.8rem' }}
        />
        
        <div>
          {(JSON.parse(localStorage.getItem('ledger_pdfs') || '[]')).map((pdf) => (
            <div key={pdf.id} className="list-item">
              <span style={{ fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{pdf.name}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => window.open(pdf.url, '_blank')}>View</button>
                <button 
                  className="btn-primary" 
                  style={{ padding: '4px 8px', fontSize: '0.7rem', background: '#d9534f' }}
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete ${pdf.name}?`)) {
                      const updated = JSON.parse(localStorage.getItem('ledger_pdfs')).filter(p => p.id !== pdf.id);
                      localStorage.setItem('ledger_pdfs', JSON.stringify(updated));
                      window.dispatchEvent(new Event('storage')); // trigger refresh
                    }
                  }}
                >
                  Trash
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Footer & Mountain Doodle */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>"a climber only fails when they stop climbing"</p>
        
        <svg className="mountain-doodle" viewBox="0 0 200 50">
          <path d="M10,45 Q20,30 30,40 T50,20 T70,35 T90,15 T110,25 T130,5 T150,30 T170,20 T190,45" />
          <path d="M40,30 L50,20 L60,25" />
          <path d="M115,15 L130,5 L145,20" />
        </svg>
      </div>

    </div>
  );
}
