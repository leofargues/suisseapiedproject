import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Plus, 
  CheckCircle2, 
  Circle, 
  Calendar as CalendarIcon,
  Flame,
  Dumbbell,
  Footprints,
  Coffee,
  Compass,
  Trash2,
  Edit2,
  Eye,
  X
} from 'lucide-react';
import SessionDetailModal from './SessionDetailModal';

const SESSION_TYPES = {
  stairclimber: {
    label: "Stair Climber",
    color: "bg-emerald-600 dark:bg-emerald-500 text-white",
    badge: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
    icon: Flame
  },
  treadmill: {
    label: "Tapis de marche",
    color: "bg-cyan-600 dark:bg-cyan-500 text-white",
    badge: "bg-cyan-100 text-cyan-950 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700",
    icon: Compass
  },
  strength: {
    label: "Musculation / Force",
    color: "bg-slate-700 dark:bg-slate-400 text-white dark:text-slate-950",
    badge: "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700",
    icon: Dumbbell
  },
  hike: {
    label: "Marche Lestée / Rando",
    color: "bg-amber-600 dark:bg-amber-500 text-white",
    badge: "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700",
    icon: Footprints
  },
  rest: {
    label: "Repos / Mobilité",
    color: "bg-teal-600 dark:bg-teal-500 text-white",
    badge: "bg-teal-100 text-teal-950 dark:bg-teal-950 dark:text-teal-300 border-teal-300 dark:border-teal-700",
    icon: Coffee
  }
};

const getTypeConfig = (type) => {
  if (type === 'cardio') return SESSION_TYPES.stairclimber;
  return SESSION_TYPES[type] || SESSION_TYPES.stairclimber;
};

const getExerciseLines = (exercises) => {
  if (!exercises) return [];
  if (Array.isArray(exercises)) {
    return exercises.map(ex => (typeof ex === 'string' ? ex.trim() : '')).filter(Boolean);
  }
  if (typeof exercises === 'string') {
    return exercises.split('\n').map(ex => ex.trim()).filter(Boolean);
  }
  return [];
};

function SessionMetricsCollapsible({ elevation }) {
  const [expanded, setExpanded] = useState(false);

  if (!elevation || elevation === '-') return null;

  if (!elevation.includes('\n')) {
    return <span className="font-bold text-amber-700 dark:text-amber-400">⚡ {elevation}</span>;
  }

  const lines = elevation.split('\n');
  const summaryPreview = lines.slice(0, 2).join(' • ');

  return (
    <div className="mt-2 w-full max-w-2xl">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        className="flex items-center justify-between gap-2 w-full p-2 px-3 rounded-xl bg-cyan-50/80 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-800/60 text-xs text-slate-800 dark:text-slate-200 font-semibold transition-colors text-left"
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          <span className="text-cyan-600 dark:text-cyan-400 font-bold shrink-0">⚡</span>
          <span className="font-bold text-cyan-950 dark:text-cyan-300 shrink-0">Détails séance ({lines.length}) :</span>
          <span className="truncate text-slate-600 dark:text-slate-400 text-[11px] font-mono">{summaryPreview}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 text-cyan-700 dark:text-cyan-400 font-bold text-[11px]">
          <span>{expanded ? 'Réduire' : 'Voir plus'}</span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-800/50 font-mono text-xs text-slate-800 dark:text-slate-200 w-full">
          {lines.map((line, i) => (
            <div key={i} className="flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 shrink-0"></span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const DAYS_OF_WEEK = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function TrainingCalendar({ sessions, onAddSession, onEditSession, onToggleSession, onDeleteSession }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1));
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | '3days'
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [detailModalSession, setDetailModalSession] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const formatDateStr = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else if (viewMode === '3days') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 3);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else if (viewMode === '3days') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 3);
      setCurrentDate(d);
    }
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleSelectViewMode = (mode) => {
    setViewMode(mode);
    if (mode === 'week' || mode === '3days') {
      setCurrentDate(new Date());
    }
  };

  let dateRangeText = "";
  if (viewMode === 'month') {
    dateRangeText = `${MONTH_NAMES[month]} ${year}`;
  } else if (viewMode === 'week') {
    const monday = getMonday(currentDate);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    if (monday.getMonth() === sunday.getMonth()) {
      dateRangeText = `${monday.getDate()} - ${sunday.getDate()} ${MONTH_NAMES[monday.getMonth()]} ${monday.getFullYear()}`;
    } else {
      dateRangeText = `${monday.getDate()} ${MONTH_NAMES[monday.getMonth()].slice(0, 3)}. - ${sunday.getDate()} ${MONTH_NAMES[sunday.getMonth()].slice(0, 3)}. ${sunday.getFullYear()}`;
    }
  } else if (viewMode === '3days') {
    const day1 = new Date(currentDate);
    const day3 = new Date(currentDate);
    day3.setDate(day1.getDate() + 2);
    if (day1.getMonth() === day3.getMonth()) {
      dateRangeText = `${day1.getDate()} - ${day3.getDate()} ${MONTH_NAMES[day1.getMonth()]} ${day1.getFullYear()}`;
    } else {
      dateRangeText = `${day1.getDate()} ${MONTH_NAMES[day1.getMonth()].slice(0, 3)}. - ${day3.getDate()} ${MONTH_NAMES[day3.getMonth()].slice(0, 3)}. ${day3.getFullYear()}`;
    }
  }

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  let startDayIndex = firstDayOfMonth.getDay() - 1;
  if (startDayIndex === -1) startDayIndex = 6;

  const totalDaysInMonth = lastDayOfMonth.getDate();

  const sessionsByDate = {};
  sessions.forEach(session => {
    if (!sessionsByDate[session.date]) {
      sessionsByDate[session.date] = [];
    }
    sessionsByDate[session.date].push(session);
  });

  const selectedDaySessions = selectedDateStr ? (sessionsByDate[selectedDateStr] || []) : [];

  const monthSessions = sessions.filter(s => {
    const sDate = new Date(s.date);
    return sDate.getFullYear() === year && sDate.getMonth() === month;
  });

  const monthCompletedCount = monthSessions.filter(s => s.completed).length;
  const monthDPlus = monthSessions
    .filter(s => s.completed)
    .reduce((acc, curr) => {
      if (curr.hikeElevationPlus) {
        return acc + (parseInt(curr.hikeElevationPlus, 10) || 0);
      }
      if (curr.elevation) {
        const match = curr.elevation.match(/D\+\s*:\s*(\d+)m/) || curr.elevation.match(/(\d+)m\s*D\+/);
        if (match) return acc + (parseInt(match[1], 10) || 0);
        if (curr.elevation.includes('m D+')) {
          return acc + (parseInt(curr.elevation.replace(/[^0-9]/g, ''), 10) || 0);
        }
      }
      return acc;
    }, 0);

  const handleDayClick = (dayNumber) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    setSelectedDateStr(dateStr);
  };

  return (
    <div className="space-y-6">
      
      {/* Calendar Header & Controls */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-emerald-900/60">
          <div>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
              <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
                Calendrier d'entraînement
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 mt-1 font-medium">
              Planifiez et validez vos blocs de musculation, sorties dénivelé et marches avec sac.
            </p>
          </div>

          {/* View Mode Switcher & Date Controls */}
          <div className="w-full md:w-auto flex items-center justify-between sm:justify-end gap-1.5 sm:gap-3 flex-wrap">

            {/* View Mode Toggle Bar (Mois, Semaine, 3 Jours) */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-emerald-950/90 rounded-2xl border border-slate-200 dark:border-emerald-800/80 shadow-inner shrink-0">
              <button
                onClick={() => handleSelectViewMode('month')}
                className={`px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  viewMode === 'month'
                    ? 'bg-emerald-800 dark:bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Mois
              </button>
              <button
                onClick={() => handleSelectViewMode('week')}
                className={`px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  viewMode === 'week'
                    ? 'bg-emerald-800 dark:bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Semaine
              </button>
              <button
                onClick={() => handleSelectViewMode('3days')}
                className={`px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  viewMode === '3days'
                    ? 'bg-emerald-800 dark:bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                3 Jours
              </button>
            </div>

            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              <button
                onClick={handleToday}
                className="hidden sm:block px-2.5 sm:px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-emerald-950/80 hover:bg-slate-200 dark:hover:bg-emerald-900/80 text-slate-800 dark:text-slate-200 transition-colors border border-slate-200 dark:border-emerald-800/80 whitespace-nowrap shrink-0"
              >
                Aujourd'hui
              </button>
              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-emerald-950/90 p-1 border border-slate-200 dark:border-emerald-800/80 shrink-0">
                <button
                  onClick={handlePrev}
                  className="p-1 sm:p-1.5 hover:bg-white dark:hover:bg-emerald-800/80 rounded-lg text-slate-700 dark:text-slate-200 transition-colors"
                  aria-label="Précédent"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <span className="px-1.5 sm:px-3 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-display min-w-[85px] sm:min-w-[160px] text-center whitespace-nowrap">
                  {dateRangeText}
                </span>
                <button
                  onClick={handleNext}
                  className="p-1 sm:p-1.5 hover:bg-white dark:hover:bg-emerald-800/80 rounded-lg text-slate-700 dark:text-slate-200 transition-colors"
                  aria-label="Suivant"
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Legend bar */}
        <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 overflow-hidden w-full">
          
          <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto flex-nowrap md:flex-wrap max-w-full pb-1.5 md:pb-0 scrollbar-thin">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === 'all'
                  ? 'bg-emerald-800 dark:bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-emerald-950/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-emerald-900/60 border border-slate-200 dark:border-emerald-800/60'
              }`}
            >
              Tous
            </button>

            {Object.entries(SESSION_TYPES).map(([typeKey, config]) => (
              <button
                key={typeKey}
                onClick={() => setSelectedFilter(selectedFilter === typeKey ? 'all' : typeKey)}
                className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedFilter === typeKey 
                    ? 'ring-2 ring-emerald-600 ring-offset-1 dark:ring-offset-slate-950 ' + config.badge
                    : 'bg-white dark:bg-emerald-950/40 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-emerald-800/60 hover:bg-slate-50 dark:hover:bg-emerald-900/40'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${config.color.split(' ')[0]}`}></span>
                <span>{config.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 text-xs font-bold">
            <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              ✓ {monthCompletedCount} / {monthSessions.length} effectuées
            </span>
            {monthDPlus > 0 && (
              <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                ⚡ +{monthDPlus}m D+ ce mois
              </span>
            )}
          </div>
        </div>

        {/* Month View */}
        {viewMode === 'month' && (
          <div className="mt-6 border border-slate-200 dark:border-emerald-900/80 rounded-2xl overflow-hidden bg-white dark:bg-emerald-950/60 shadow-inner">
            
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-emerald-900/80 bg-slate-100 dark:bg-emerald-950">
              {DAYS_OF_WEEK.map((day, idx) => (
                <div 
                  key={day} 
                  className={`py-2.5 text-center text-xs font-extrabold font-display uppercase tracking-wider ${
                    idx >= 5 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Matrix */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200 dark:divide-emerald-900/60">
              
              {Array.from({ length: startDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} className="min-h-[70px] sm:min-h-[120px] bg-slate-100/60 dark:bg-slate-950/60 p-1.5 sm:p-2"></div>
              ))}

              {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const daySessions = sessionsByDate[dateStr] || [];
                
                const filteredDaySessions = selectedFilter === 'all'
                  ? daySessions
                  : daySessions.filter(s => s.type === selectedFilter || (selectedFilter === 'stairclimber' && s.type === 'cardio'));

                const isToday = formatDateStr(new Date()) === dateStr;
                const isSelected = selectedDateStr === dateStr;

                return (
                  <div
                    key={dayNum}
                    onClick={() => handleDayClick(dayNum)}
                    className={`min-h-[70px] sm:min-h-[120px] p-1.5 sm:p-2 transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-emerald-100/80 dark:bg-emerald-900/60 ring-2 ring-emerald-600 ring-inset' 
                        : isToday 
                          ? 'bg-amber-50 dark:bg-amber-950/30' 
                          : 'bg-white dark:bg-emerald-950/40 hover:bg-slate-50 dark:hover:bg-emerald-900/40'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span 
                        className={`text-xs font-extrabold rounded-lg h-6 w-6 flex items-center justify-center font-display ${
                          isToday 
                            ? 'bg-emerald-700 dark:bg-emerald-500 text-white shadow-sm' 
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {dayNum}
                      </span>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddSession(dateStr);
                        }}
                        className="hidden sm:block opacity-0 group-hover:opacity-100 p-1 hover:bg-emerald-200 dark:hover:bg-emerald-800/80 rounded text-emerald-900 dark:text-emerald-300 transition-opacity"
                        title="Ajouter une séance ce jour"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1 flex-1 overflow-hidden">
                      {filteredDaySessions.map(session => {
                        const typeConfig = getTypeConfig(session.type);
                        const exerciseLines = getExerciseLines(session.exercises);

                        return (
                          <div
                            key={session.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.innerWidth >= 768) {
                                onToggleSession(session.id);
                              } else {
                                handleDayClick(dayNum);
                              }
                            }}
                            className={`group/session px-1.5 sm:px-2 py-1 rounded-lg text-[10px] sm:text-[11px] leading-tight font-bold border flex items-center justify-between gap-1 transition-all ${
                              session.completed 
                                ? 'bg-emerald-100 dark:bg-emerald-900/90 text-emerald-950 dark:text-emerald-100 border-emerald-300 dark:border-emerald-700' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 hover:opacity-100'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${typeConfig.color.split(' ')[0]}`}></span>
                              <span className={`truncate ${session.completed ? 'line-through opacity-75' : ''}`}>
                                {session.title}
                              </span>
                            </div>

                            <div className="hidden sm:flex items-center gap-1 shrink-0">
                              {exerciseLines.length > 0 && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-200 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-300 font-mono font-bold" title={`${exerciseLines.length} exercices`}>
                                  {exerciseLines.length} ex.
                                </span>
                              )}
                              {session.elevation && session.elevation !== '-' && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-200 dark:bg-amber-950 text-amber-950 dark:text-amber-300 font-mono font-bold">
                                  {session.elevation}
                                </span>
                              )}
                              {session.completed ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300 shrink-0" />
                              ) : (
                                <Circle className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        )}

        {/* Week View */}
        {viewMode === 'week' && (() => {
          const monday = getMonday(currentDate);
          const weekDays = Array.from({ length: 7 }).map((_, idx) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + idx);
            return d;
          });

          return (
            <div className="mt-6 space-y-3">
              {weekDays.map((dayDate) => {
                const dateStr = formatDateStr(dayDate);
                const daySessions = sessionsByDate[dateStr] || [];
                const filteredDaySessions = selectedFilter === 'all'
                  ? daySessions
                  : daySessions.filter(s => s.type === selectedFilter || (selectedFilter === 'stairclimber' && s.type === 'cardio'));

                const isToday = formatDateStr(new Date()) === dateStr;
                const dayName = dayDate.toLocaleDateString('fr-FR', { weekday: 'short' });
                const formattedDateLabel = dayDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

                return (
                  <div
                    key={dateStr}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                      isToday
                        ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 shadow-sm'
                        : 'bg-white dark:bg-emerald-950/60 border-slate-200 dark:border-emerald-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-emerald-900/40">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-lg ${
                          isToday ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}>
                          {dayName}
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white capitalize font-display">
                          {formattedDateLabel}
                        </span>
                        {isToday && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            Aujourd'hui
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => onAddSession(dateStr)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Ajouter</span>
                      </button>
                    </div>

                    {filteredDaySessions.length > 0 ? (
                      <div className="space-y-2 mt-2">
                        {filteredDaySessions.map((session) => {
                          const typeConfig = getTypeConfig(session.type);
                          return (
                            <div
                              key={session.id}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                                session.completed
                                  ? 'bg-emerald-50 dark:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700/60'
                                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <button
                                  onClick={() => onToggleSession(session.id)}
                                  className={`p-1.5 rounded-full shrink-0 transition-colors ${
                                    session.completed
                                      ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950'
                                      : 'text-slate-400 bg-white dark:bg-slate-800 hover:text-slate-600'
                                  }`}
                                  aria-label={session.completed ? "Décocher" : "Cocher"}
                                >
                                  {session.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                </button>
                                {(() => {
                                  const exerciseLines = getExerciseLines(session.exercises);
                                  return (
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeConfig.badge}`}>
                                          {typeConfig.label}
                                        </span>
                                        <h5 className={`text-xs sm:text-sm font-bold text-slate-900 dark:text-white ${session.completed ? 'line-through opacity-70' : ''}`}>
                                          {session.title}
                                        </h5>
                                      </div>
                                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-600 dark:text-slate-300 font-semibold flex-wrap">
                                        <span>⏱️ {session.duration}</span>
                                        {session.elevation && session.elevation !== '-' && !session.elevation.includes('\n') && (
                                          <span className="text-amber-700 dark:text-amber-400 font-bold">⚡ {session.elevation}</span>
                                        )}
                                        {exerciseLines.length > 0 && (
                                          <span className="font-bold text-emerald-700 dark:text-emerald-400">💪 {exerciseLines.length} ex.</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => setDetailModalSession(session)}
                                  className="px-2.5 py-1 text-xs font-bold rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-900 border border-cyan-300 dark:border-cyan-700/80 transition-colors flex items-center gap-1 shrink-0"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>Voir plus</span>
                                </button>
                                <button
                                  onClick={() => onEditSession(session)}
                                  className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors"
                                  title="Modifier"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => onDeleteSession(session.id)}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic py-1 text-center">
                        Aucune séance planifiée pour ce jour.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* 3 Days View */}
        {viewMode === '3days' && (() => {
          const threeDays = Array.from({ length: 3 }).map((_, idx) => {
            const d = new Date(currentDate);
            d.setDate(currentDate.getDate() + idx);
            return d;
          });

          return (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {threeDays.map((dayDate) => {
                const dateStr = formatDateStr(dayDate);
                const daySessions = sessionsByDate[dateStr] || [];
                const filteredDaySessions = selectedFilter === 'all'
                  ? daySessions
                  : daySessions.filter(s => s.type === selectedFilter || (selectedFilter === 'stairclimber' && s.type === 'cardio'));

                const isToday = formatDateStr(new Date()) === dateStr;
                const dayName = dayDate.toLocaleDateString('fr-FR', { weekday: 'short' });
                const formattedDayNum = dayDate.getDate();
                const monthShort = dayDate.toLocaleDateString('fr-FR', { month: 'short' });

                return (
                  <div
                    key={dateStr}
                    className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                      isToday
                        ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700/80 ring-2 ring-amber-400/50 shadow-sm'
                        : 'bg-white dark:bg-emerald-950/60 border-slate-200 dark:border-emerald-900/80'
                    }`}
                  >
                    <div>
                      {/* Day Header */}
                      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200 dark:border-emerald-900/60">
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs font-display ${
                            isToday
                              ? 'bg-emerald-700 dark:bg-emerald-500 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                          }`}>
                            {formattedDayNum}
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold font-display text-slate-900 dark:text-white uppercase">
                              {dayName}
                            </h4>
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 capitalize">
                              {monthShort}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onAddSession(dateStr)}
                          className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
                          title="Ajouter une séance"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Day Sessions */}
                      {filteredDaySessions.length > 0 ? (
                        <div className="space-y-2">
                          {filteredDaySessions.map((session) => {
                            const typeConfig = getTypeConfig(session.type);
                            return (
                              <div
                                key={session.id}
                                className={`p-2.5 rounded-xl border transition-all ${
                                  session.completed
                                    ? 'bg-emerald-100/90 dark:bg-emerald-900/90 border-emerald-300 dark:border-emerald-700'
                                    : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-1.5">
                                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${typeConfig.badge}`}>
                                    {typeConfig.label}
                                  </span>
                                  <button
                                    onClick={() => onToggleSession(session.id)}
                                    className="text-slate-400 hover:text-emerald-600 transition-colors"
                                  >
                                    {session.completed ? (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                                    ) : (
                                      <Circle className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                                <h5 className={`text-xs font-bold text-slate-900 dark:text-white mt-1.5 ${session.completed ? 'line-through opacity-70' : ''}`}>
                                  {session.title}
                                </h5>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-slate-600 dark:text-slate-300 font-semibold">
                                  <span>⏱️ {session.duration}</span>
                                  {session.elevation && session.elevation !== '-' && !session.elevation.includes('\n') && (
                                    <span className="text-amber-700 dark:text-amber-400 font-bold">⚡ {session.elevation}</span>
                                  )}
                                  {(() => {
                                    const exerciseLines = getExerciseLines(session.exercises);
                                    if (exerciseLines.length === 0) return null;
                                    return (
                                      <span className="font-bold text-emerald-700 dark:text-emerald-400">💪 {exerciseLines.length} ex.</span>
                                    );
                                  })()}
                                </div>
                                <div className="flex items-center justify-between gap-1 mt-2 pt-1 border-t border-slate-200/50 dark:border-emerald-900/40">
                                  <button
                                    onClick={() => setDetailModalSession(session)}
                                    className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-300 hover:bg-cyan-200 transition-colors flex items-center gap-1"
                                  >
                                    <Eye className="h-3 w-3" />
                                    <span>Voir plus</span>
                                  </button>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => onEditSession(session)}
                                      className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                      title="Modifier"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => onDeleteSession(session.id)}
                                      className="p-1 text-rose-500 hover:text-rose-700 transition-colors"
                                      title="Supprimer"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-6 text-center">
                          <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                            Pas de séance
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

      </div>

      {/* Selected Day Details Panel */}
      {selectedDateStr && (
        <>
          <div 
            onClick={() => setSelectedDateStr(null)}
            className="md:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end justify-center p-0"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-emerald-950 w-full rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto border-t border-slate-200 dark:border-emerald-800 shadow-2xl flex flex-col justify-between"
            >
              <div>
                {/* Header with Date + Close Button */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-emerald-900/60">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Séances du jour
                    </span>
                    <h4 className="text-base font-extrabold font-display text-slate-900 dark:text-white">
                      {new Date(selectedDateStr).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                    </h4>
                  </div>
                  <button
                    onClick={() => setSelectedDateStr(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg bg-slate-100 dark:bg-slate-900"
                    aria-label="Fermer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* PROMINENT "AJOUTER" BUTTON AT THE TOP */}
                <button
                  onClick={() => {
                    onAddSession(selectedDateStr);
                  }}
                  className="w-full mt-4 py-3 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter une séance ce jour</span>
                </button>

                {/* Workouts List */}
                <div className="mt-4 space-y-3">
                  {selectedDaySessions && selectedDaySessions.length > 0 ? (
                    selectedDaySessions.map(session => {
                      const typeConfig = getTypeConfig(session.type);
                      return (
                        <div
                          key={session.id}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800/60 flex items-start justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <button
                              onClick={() => onToggleSession(session.id)}
                              className={`p-2 rounded-full transition-colors flex items-center justify-center shrink-0 ${
                                session.completed 
                                  ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300' 
                                  : 'text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-500'
                              }`}
                              aria-label={session.completed ? "Décocher" : "Cocher"}
                            >
                              {session.completed ? <CheckCircle2 className="h-5.5 w-5.5" /> : <Circle className="h-5.5 w-5.5" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeConfig.badge}`}>
                                {typeConfig.label}
                              </span>
                              <h5 className={`text-sm font-bold text-slate-900 dark:text-white mt-1 ${session.completed ? 'line-through opacity-70' : ''}`}>
                                {session.title}
                              </h5>
                              <div className="flex flex-col gap-1 mt-1 text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span>⏱️ Durée : {session.duration}</span>
                                  {session.elevation && session.elevation !== '-' && !session.elevation.includes('\n') && (
                                    <span className="text-amber-700 dark:text-amber-400 font-bold">⚡ {session.elevation}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              onClick={() => setDetailModalSession(session)}
                              className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-900 border border-cyan-300 dark:border-cyan-700/80 transition-colors flex items-center gap-1 shrink-0"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Voir plus</span>
                            </button>
                            <button
                              onClick={() => onEditSession(session)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Modifier la séance"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDeleteSession(session.id)}
                              className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                              title="Supprimer la séance"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center py-4">
                      Aucune séance enregistrée pour cette date.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* DESKTOP INLINE PANEL (Hidden on Mobile) */}
          <div className="hidden md:block glass-panel rounded-3xl p-6 shadow-sm border border-emerald-800/30">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-emerald-900/60">
              <div>
                <h4 className="text-lg font-extrabold font-display text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Séances du {new Date(selectedDateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </h4>
              </div>
              <button
                onClick={() => onAddSession(selectedDateStr)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter une séance</span>
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {selectedDaySessions && selectedDaySessions.length > 0 ? (
                selectedDaySessions.map(session => {
                  const typeConfig = getTypeConfig(session.type);

                  return (
                    <div
                      key={session.id}
                      className="p-4 rounded-2xl bg-white dark:bg-emerald-950/80 border border-slate-200 dark:border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-600 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => onToggleSession(session.id)}
                          className={`p-2.5 rounded-full transition-colors flex items-center justify-center shrink-0 ${
                            session.completed 
                              ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300' 
                              : 'text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-500'
                          }`}
                          aria-label={session.completed ? "Décocher" : "Cocher"}
                        >
                          {session.completed ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${typeConfig.badge}`}>
                              {typeConfig.label}
                            </span>
                            <h5 className={`text-base font-extrabold text-slate-900 dark:text-white ${session.completed ? 'line-through text-slate-400 dark:text-slate-400' : ''}`}>
                              {session.title}
                            </h5>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold flex-wrap">
                            <span>⏱️ Durée : {session.duration}</span>
                            {session.elevation && session.elevation !== '-' && !session.elevation.includes('\n') && (
                              <span className="font-bold text-amber-700 dark:text-amber-400">⚡ {session.elevation}</span>
                            )}
                            {(() => {
                              const exerciseLines = getExerciseLines(session.exercises);
                              if (exerciseLines.length === 0) return null;
                              return (
                                <span className="font-bold text-emerald-700 dark:text-emerald-400">💪 {exerciseLines.length} ex.</span>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        <button
                          onClick={() => setDetailModalSession(session)}
                          className="px-3.5 py-2 text-xs font-extrabold rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-900 border border-cyan-300 dark:border-cyan-700/80 transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Voir plus</span>
                        </button>
                        <button
                          onClick={() => onEditSession(session)}
                          className="p-2 text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors"
                          title="Modifier la séance"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteSession(session.id)}
                          className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors"
                          title="Supprimer la séance"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic py-4 text-center">
                  Aucune séance enregistrée pour ce jour. Cliquez sur « Ajouter une séance » pour planifier.
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* DETAILED POPUP MODAL */}
      {detailModalSession && (
        <SessionDetailModal
          session={detailModalSession}
          onClose={() => setDetailModalSession(null)}
          onEdit={(session) => {
            setDetailModalSession(null);
            onEditSession(session);
          }}
          onToggle={(id) => {
            onToggleSession(id);
            setDetailModalSession(prev => prev ? { ...prev, completed: !prev.completed } : null);
          }}
          onDelete={(id) => {
            setDetailModalSession(null);
            onDeleteSession(id);
          }}
        />
      )}

    </div>
  );
}
