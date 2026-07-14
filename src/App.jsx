import { useState, useEffect, useRef } from 'react';

export default function App() {
  // CONFIGURATION INTERVALS
  const [workTime, setWorkTime] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);
  
  // POMODORO CORE STATES
  const [currentMode, setCurrentMode] = useState('work'); // 'work' | 'short' | 'long'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const timerRef = useRef(null);
  // Keep a persistent reference to the AudioContext once unlocked
  const audioCtxRef = useRef(null);

  // Sync timer when intervals are updated or when changing modes manually
  useEffect(() => {
    if (currentMode === 'work') setTimeLeft(workTime * 60);
    if (currentMode === 'short') setTimeLeft(shortBreak * 60);
    if (currentMode === 'long') setTimeLeft(longBreak * 60);
    setIsRunning(false);
  }, [workTime, shortBreak, longBreak, currentMode]);

  // Sync dark theme root mutations
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // AUDIO UNLOCK & SYNTHESIZER
  const initAudioContext = () => {
    // Initializes and unlocks the browser's audio state on user action (Start click)
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    // If suspended by browser autoplay guards, resume it
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playAlarmSound = () => {
    try {
      initAudioContext();
      const ctx = audioCtxRef.current;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime); // Crisp, clean notification pitch
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.35); // 350ms duration
    } catch (e) {
      console.warn("Audio synthesizer failed to trigger:", e);
    }
  };

  // TIMER TICK ENGINE
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playAlarmSound();

            // Handle transition states
            setCurrentMode((prevMode) => {
              if (prevMode === 'work') {
                setCompletedSessions((prevCount) => prevCount + 1);
                const isFourthSession = (completedSessions + 1) % 4 === 0;
                return isFourthSession ? 'long' : 'short';
              } else {
                return 'work';
              }
            });

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, completedSessions]);

  // ACTION CONTROLLERS
  const toggleTimer = () => {
    // Unlock the Audio Context during this click event
    initAudioContext();
    setIsRunning(!isRunning);
  };
  
  const resetTimer = () => {
    setIsRunning(false);
    if (currentMode === 'work') setTimeLeft(workTime * 60);
    if (currentMode === 'short') setTimeLeft(shortBreak * 60);
    if (currentMode === 'long') setTimeLeft(longBreak * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="min-h-screen w-full bg-mono-light-base dark:bg-mono-dark-base text-mono-light-950 dark:text-mono-dark-950 flex flex-col justify-between font-sans transition-colors duration-200">
      
      {/* 1. APP NAVBAR HEADER */}
      <header className="border-b border-mono-light-200 dark:border-mono-dark-200 px-4 sm:px-6 py-4 bg-mono-light-50 dark:bg-mono-dark-50 z-30 w-full">
        <div className="max-w-xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black uppercase tracking-tight">FocusLog</h1>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-mono-light-900 text-mono-light-base dark:bg-mono-dark-900 dark:text-mono-dark-base tracking-widest whitespace-nowrap">
                {completedSessions} COMPLETED
              </span>
            </div>
            
            <div className="flex items-center gap-2 sm:hidden">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="border border-mono-light-300 dark:border-mono-dark-300 text-[8px] uppercase font-bold tracking-widest px-2 py-1 rounded-lg hover:border-mono-light-900 dark:hover:border-mono-dark-950 cursor-pointer transition-colors"
              >
                Config
              </button>
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                className="border border-mono-light-300 dark:border-mono-dark-300 text-[8px] uppercase font-bold tracking-widest px-2 py-1 rounded-lg hover:border-mono-light-900 dark:hover:border-mono-dark-950 cursor-pointer transition-colors"
              >
                {darkMode ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="border border-mono-light-300 dark:border-mono-dark-300 text-[9px] uppercase font-bold tracking-widest px-2.5 py-1.5 rounded-lg hover:border-mono-light-900 dark:hover:border-mono-dark-950 cursor-pointer transition-colors"
            >
              Config
            </button>
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="border border-mono-light-300 dark:border-mono-dark-300 text-[9px] uppercase font-bold tracking-widest px-2.5 py-1.5 rounded-lg hover:border-mono-light-900 dark:hover:border-mono-dark-950 cursor-pointer transition-colors"
            >
              {darkMode ? 'Light' : 'Dark'}
            </button>
          </div>

        </div>
      </header>

      {/* 2. CENTRAL WORKSPACE TIMER */}
      <main className="grow flex flex-col items-center p-4 sm:p-6 max-w-md w-full mx-auto justify-center space-y-8">
        
        {/* MODE SELECTOR TABS */}
        <div className="w-full grid grid-cols-3 gap-1 p-1 bg-mono-light-100 dark:bg-mono-dark-100 rounded-xl border border-mono-light-200 dark:border-mono-dark-200">
          {[['work', 'Work'], ['short', 'Short Break'], ['long', 'Long Break']].map(([modeKey, label]) => {
            const isActive = currentMode === modeKey;
            return (
              <button
                key={modeKey}
                onClick={() => setCurrentMode(modeKey)}
                className={`py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
                  isActive 
                    ? 'bg-mono-light-900 text-mono-light-base dark:bg-mono-dark-950 dark:text-mono-dark-base shadow-sm' 
                    : 'opacity-50 hover:opacity-100 text-mono-light-950 dark:text-mono-dark-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* CLOCK DISPLAY */}
        <div className="text-center space-y-2">
          <h2 className="text-7xl sm:text-8xl font-black tracking-tighter tabular-nums select-none">
            {formatTime(timeLeft)}
          </h2>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">
            {currentMode === 'work' ? 'Stay Focused' : 'Rest Up'}
          </p>
        </div>

        {/* PRIMARY CONTROLS */}
        <div className="w-full flex justify-center items-center gap-4">
          <button
            onClick={toggleTimer}
            className="px-8 py-3 bg-mono-light-900 text-mono-light-base dark:bg-mono-dark-900 dark:text-mono-dark-base text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-mono-light-800 dark:hover:bg-mono-dark-800 transition-colors cursor-pointer shadow"
          >
            {isRunning ? 'Stop' : 'Start'}
          </button>
          
          <button
            onClick={resetTimer}
            className="p-3 border border-mono-light-200 dark:border-mono-dark-200 hover:border-mono-light-900 dark:hover:border-mono-dark-950 rounded-xl transition-colors cursor-pointer text-mono-light-900 dark:text-mono-dark-950"
            title="Reset Clock"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>

        {/* CONFIG PANEL */}
        {showSettings && (
          <div className="w-full border border-mono-light-200 dark:border-mono-dark-200 p-4 bg-mono-light-50 dark:bg-mono-dark-50 rounded-2xl space-y-4 shadow-inner">
            <h4 className="text-[10px] font-black uppercase tracking-widest border-b border-mono-light-200 dark:border-mono-dark-200 pb-1.5">Interval Configuration (Mins)</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-bold uppercase tracking-wider opacity-60">Work Session</label>
                <input 
                  type="number" 
                  min="1" 
                  value={workTime} 
                  onChange={(e) => setWorkTime(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full border border-mono-light-200 dark:border-mono-dark-200 p-2 rounded-xl text-xs bg-mono-light-base dark:bg-mono-dark-base focus:outline-none font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold uppercase tracking-wider opacity-60">Short Break</label>
                <input 
                  type="number" 
                  min="1" 
                  value={shortBreak} 
                  onChange={(e) => setShortBreak(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full border border-mono-light-200 dark:border-mono-dark-200 p-2 rounded-xl text-xs bg-mono-light-base dark:bg-mono-dark-base focus:outline-none font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold uppercase tracking-wider opacity-60">Long Break</label>
                <input 
                  type="number" 
                  min="1" 
                  value={longBreak} 
                  onChange={(e) => setLongBreak(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full border border-mono-light-200 dark:border-mono-dark-200 p-2 rounded-xl text-xs bg-mono-light-base dark:bg-mono-dark-base focus:outline-none font-bold"
                />
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 3. SYSTEM TERMINAL FOOTER */}
      <footer className="border-t border-mono-light-200 dark:border-mono-dark-200 px-4 py-4 text-center text-[9px] tracking-widest uppercase opacity-40 bg-mono-light-50 dark:bg-mono-dark-50 w-full">
        Pomodoro Core Framework Module • Vite Deploy Specification
      </footer>
    </div>
  );
}