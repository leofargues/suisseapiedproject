import React from 'react';
import { Plus, CheckCircle2, Circle, Eye, Edit2, Trash2 } from 'lucide-react';
import { getTypeConfig } from '../../constants/sessionTypes';
import { getExerciseLines, formatDateStr } from '../../utils/sessionUtils';

const ThreeDaysView = React.memo(({
  currentDate,
  sessionsByDate,
  selectedFilter,
  onAddSession,
  onToggleSession,
  setDetailModalSession,
  onEditSession,
  onDeleteSession
}) => {
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
});

export default ThreeDaysView;
