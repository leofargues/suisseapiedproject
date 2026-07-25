import React, { useState, useEffect } from 'react';
import { Flag, Activity, TrendingUp, Compass, Maximize2, Minimize2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { DEPARTURE_DATE } from '../services/storage';

export default function CountdownWidget() {
  const { sessions, metrics } = useAppContext();
  const departureDate = DEPARTURE_DATE;
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('suisse2027_countdown_compact') === 'true';
    }
    return false;
  });

  const toggleCompact = () => {
    setIsCompact(prev => {
      const next = !prev;
      try {
        localStorage.setItem('suisse2027_countdown_compact', String(next));
      } catch (err) {
        // ignore
      }
      return next;
    });
  };

  useEffect(() => {
    const target = new Date(departureDate).getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [departureDate]);

  // Calculate global plan progress based on metrics progression
  const calculateGlobalProgress = () => {
    if (!metrics || metrics.length === 0) return '0.0';

    const totalProgress = metrics.reduce((acc, m) => {
      const current = parseFloat(m.currentValue) || 0;
      let target = parseFloat(m.targetNumericValue);
      if (isNaN(target) || target <= 0) {
        const match = String(m.targetValue || '').match(/([0-9]+(?:\.[0-9]+)?)/);
        target = match ? parseFloat(match[1]) : 0;
      }
      if (target <= 0) return acc;
      const pct = Math.min(100, Math.max(0, (current / target) * 100));
      return acc + pct;
    }, 0);

    const avg = totalProgress / metrics.length;
    return Number.isInteger(avg) ? avg.toString() : avg.toFixed(1);
  };

  const progressPercent = calculateGlobalProgress();

  // Statistics from sessions
  const completedSessions = sessions.filter(s => s.completed);
  const totalCompletedCount = completedSessions.length;
  
  // Calculate total elevation (D+)
  const totalElevation = completedSessions.reduce((acc, curr) => {
    if (curr.elevation && curr.elevation.includes('m D+')) {
      const val = parseInt(curr.elevation.replace(/[^0-9]/g, ''), 10);
      return acc + (isNaN(val) ? 0 : val);
    }
    return acc;
  }, 0);

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-800/40 transition-all duration-300 ${
      isCompact ? 'p-4 sm:p-8' : 'p-6 sm:p-8'
    }`}>
      
      {/* Topo background decorative lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none topo-pattern"></div>
      
      {/* Ambient gradient glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* --- MOBILE REDUCED VIEW (Visible on mobile when isCompact === true) --- */}
      {isCompact && (
        <div className="sm:hidden relative z-10 space-y-3">
          {/* Header row: badge, progress badge & expand toggle button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-800/70 text-emerald-200 border border-emerald-700/50 backdrop-blur-md">
                <Flag className="h-3.5 w-3.5 text-emerald-400" />
                <span>Objectif : 1er Août 2027</span>
              </div>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                {progressPercent}%
              </span>
            </div>

            {/* Toggle button on mobile to return to base size */}
            <button
              onClick={toggleCompact}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/60 shadow-sm transition-all active:scale-95 shrink-0"
              title="Agrandir le widget (taille de base)"
              aria-label="Agrandir le widget"
            >
              <Maximize2 className="h-3.5 w-3.5 text-emerald-300" />
              <span>Agrandir</span>
            </button>
          </div>

          {/* Compact timer grid */}
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="bg-emerald-900/50 backdrop-blur-md rounded-xl p-2 border border-emerald-700/40 flex flex-col items-center justify-center">
              <span className="text-lg font-black font-display text-white leading-tight">
                {timeLeft.days}
              </span>
              <span className="text-[9px] font-semibold text-emerald-300 uppercase tracking-tight">
                Jours
              </span>
            </div>

            <div className="bg-emerald-900/50 backdrop-blur-md rounded-xl p-2 border border-emerald-700/40 flex flex-col items-center justify-center">
              <span className="text-lg font-black font-display text-white leading-tight">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-semibold text-emerald-300 uppercase tracking-tight">
                Heures
              </span>
            </div>

            <div className="bg-emerald-900/50 backdrop-blur-md rounded-xl p-2 border border-emerald-700/40 flex flex-col items-center justify-center">
              <span className="text-lg font-black font-display text-white leading-tight">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-semibold text-emerald-300 uppercase tracking-tight">
                Min
              </span>
            </div>

            <div className="bg-emerald-900/50 backdrop-blur-md rounded-xl p-2 border border-emerald-700/40 flex flex-col items-center justify-center">
              <span className="text-lg font-black font-display text-emerald-400 leading-tight">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-semibold text-emerald-300 uppercase tracking-tight">
                Sec
              </span>
            </div>
          </div>

          {/* Progress bar line */}
          <div className="w-full bg-emerald-950/80 rounded-full h-1.5 overflow-hidden border border-emerald-800/40">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* --- DESKTOP VIEW & MOBILE BASE VIEW (Visible on desktop always, or on mobile when isCompact === false) --- */}
      <div className={`relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${isCompact ? 'hidden sm:grid' : 'grid'}`}>
        
        {/* Left Column: Title & Target info */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-800/60 text-emerald-200 border border-emerald-700/50 backdrop-blur-md">
              <Flag className="h-3.5 w-3.5 text-emerald-400" />
              <span>Objectif départ : 1er Août 2027</span>
            </div>

            {/* Toggle button on mobile to reduce size */}
            <button
              onClick={toggleCompact}
              className="sm:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/60 shadow-sm transition-all active:scale-95 shrink-0"
              title="Réduire la taille du widget"
              aria-label="Réduire la taille du widget"
            >
              <Minimize2 className="h-3.5 w-3.5 text-emerald-300" />
              <span>Réduire</span>
            </button>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-emerald-50">
            Compte à rebours vers la Suisse
          </h2>
          <p className="text-sm text-emerald-200/80 leading-relaxed">
            Traversée en autonomie totale. Suivi en temps réel de la préparation physique, du dénivelé accumulé et des métriques de résistance.
          </p>

          {/* Timeline progress bar */}
          <div className="pt-2 space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-emerald-200/90">
              <span>Progression du plan global</span>
              <span className="font-bold text-emerald-300">{progressPercent}% accompli</span>
            </div>
            <div className="h-2.5 w-full bg-emerald-950/80 rounded-full overflow-hidden p-0.5 border border-emerald-800/50">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 shadow-sm shadow-emerald-400/50"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right Column: Countdown Timer Display */}
        <div className="lg:col-span-7">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
            
            {/* Days */}
            <div className="bg-emerald-900/40 backdrop-blur-md rounded-2xl p-3 sm:p-5 border border-emerald-700/40 flex flex-col justify-center items-center">
              <span className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white drop-shadow-sm">
                {timeLeft.days}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-300 uppercase tracking-wider mt-1">
                Jours
              </span>
            </div>

            {/* Hours */}
            <div className="bg-emerald-900/40 backdrop-blur-md rounded-2xl p-3 sm:p-5 border border-emerald-700/40 flex flex-col justify-center items-center">
              <span className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white drop-shadow-sm">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-300 uppercase tracking-wider mt-1">
                Heures
              </span>
            </div>

            {/* Minutes */}
            <div className="bg-emerald-900/40 backdrop-blur-md rounded-2xl p-3 sm:p-5 border border-emerald-700/40 flex flex-col justify-center items-center">
              <span className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white drop-shadow-sm">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-300 uppercase tracking-wider mt-1">
                Minutes
              </span>
            </div>

            {/* Seconds */}
            <div className="bg-emerald-900/40 backdrop-blur-md rounded-2xl p-3 sm:p-5 border border-emerald-700/40 flex flex-col justify-center items-center">
              <span className="text-3xl sm:text-5xl font-black font-display tracking-tight text-emerald-400 drop-shadow-sm">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-300 uppercase tracking-wider mt-1">
                Secondes
              </span>
            </div>

          </div>

          {/* Quick Metrics Bar below Countdown */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-emerald-800/40">
            <div className="flex items-center gap-2.5 text-xs text-emerald-200">
              <div className="p-1.5 rounded-lg bg-emerald-800/50 text-emerald-300">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-400 font-semibold uppercase">Séances effectuées</p>
                <p className="font-bold text-white text-sm">{totalCompletedCount} séances</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-emerald-200">
              <div className="p-1.5 rounded-lg bg-emerald-800/50 text-emerald-300">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-400 font-semibold uppercase">Dénivelé total (D+)</p>
                <p className="font-bold text-white text-sm">+{totalElevation.toLocaleString()} m</p>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5 text-xs text-emerald-200">
              <div className="p-1.5 rounded-lg bg-emerald-800/50 text-emerald-300">
                <Compass className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-400 font-semibold uppercase">Objectif D+ cible</p>
                <p className="font-bold text-white text-sm">45 000 m D+</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

