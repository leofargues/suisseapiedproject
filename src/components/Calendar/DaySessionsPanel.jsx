import React from 'react';
import { Plus, CheckCircle2, Circle, Eye, Edit2, Trash2, X } from 'lucide-react';
import { getTypeConfig } from '../../constants/sessionTypes';
import { getExerciseLines } from '../../utils/sessionUtils';

const DaySessionsPanel = React.memo(({
  selectedDateStr,
  setSelectedDateStr,
  selectedDaySessions,
  onAddSession,
  onToggleSession,
  setDetailModalSession,
  onEditSession,
  onDeleteSession
}) => {
  return (
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
                      className="px-3.5 py-2 text-xs font-bold rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-900 border border-cyan-300 dark:border-cyan-700/80 transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Voir plus</span>
                    </button>
                    <button
                      onClick={() => onEditSession(session)}
                      className="p-2 text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
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
  );
});

export default DaySessionsPanel;
