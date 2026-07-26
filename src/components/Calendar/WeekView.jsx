import React from 'react';
import { Plus, CheckCircle2, Circle, Eye, Edit2, Trash2 } from 'lucide-react';
import { getTypeConfig } from '../../constants/sessionTypes';
import { getExerciseLines, formatDateStr, getMonday } from '../../utils/sessionUtils';

const WeekView = React.memo(({
  currentDate,
  sessionsByDate,
  selectedFilter,
  onAddSession,
  onToggleSession,
  setDetailModalSession,
  onEditSession,
  onDeleteSession
}) => {
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
});

export default WeekView;
