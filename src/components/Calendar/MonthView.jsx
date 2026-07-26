import React from 'react';
import { Plus, CheckCircle2, Circle } from 'lucide-react';
import { DAYS_OF_WEEK } from '../../constants/calendarConstants';
import { getTypeConfig } from '../../constants/sessionTypes';
import { getExerciseLines, formatDateStr } from '../../utils/sessionUtils';

const MonthView = React.memo(({
  startDayIndex,
  totalDaysInMonth,
  year,
  month,
  sessionsByDate,
  selectedFilter,
  selectedDateStr,
  handleDayClick,
  onAddSession,
  onToggleSession
}) => {
  return (
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
  );
});

export default MonthView;
