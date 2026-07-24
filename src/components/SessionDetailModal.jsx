import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  Edit2, 
  Trash2, 
  Flame, 
  Dumbbell, 
  Footprints, 
  Coffee, 
  Compass, 
  Activity,
  Zap
} from 'lucide-react';

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

export default function SessionDetailModal({ session, onClose, onEdit, onToggle, onDelete }) {
  if (!session) return null;

  const typeConfig = getTypeConfig(session.type);
  const IconComponent = typeConfig.icon;
  const exerciseLines = getExerciseLines(session.exercises);

  const formattedDate = new Date(session.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const hasMultilineElevation = session.elevation && session.elevation !== '-' && session.elevation.includes('\n');
  const elevationLines = hasMultilineElevation ? session.elevation.split('\n') : [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-emerald-950 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-emerald-800/80 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
        
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-200 dark:border-emerald-900/60">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${typeConfig.badge}`}>
                  <IconComponent className="h-3.5 w-3.5" />
                  <span>{typeConfig.label}</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                  session.completed 
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' 
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                }`}>
                  {session.completed ? '✓ Effectuée' : '⏳ À faire'}
                </span>
              </div>

              <h3 className="text-xl font-black font-display text-slate-900 dark:text-white leading-tight">
                {session.title}
              </h3>

              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{formattedDate}</span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-900 transition-colors shrink-0"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick KPIs Grid */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-emerald-900/50 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-400 block">Durée</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{session.duration}</span>
              </div>
            </div>

            {!hasMultilineElevation && session.elevation && session.elevation !== '-' && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-400 block">Indicateur</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">{session.elevation}</span>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Parameters Grid (Stairclimber / Treadmill / Hike) */}
          {hasMultilineElevation && (
            <div className="mt-5 space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <span>Paramètres enregistrés</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {elevationLines.map((line, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200/80 dark:border-cyan-800/60 flex items-center gap-2 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400 shrink-0"></span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exercises Section */}
          {exerciseLines.length > 0 && (
            <div className="mt-5 space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Dumbbell className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Exercices de la séance ({exerciseLines.length})</span>
              </h4>
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2 font-mono text-xs text-slate-800 dark:text-slate-200">
                {exerciseLines.map((ex, i) => (
                  <div key={i} className="flex items-center gap-2.5 font-bold">
                    <span className="h-5 w-5 rounded-lg bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-center text-[10px] shrink-0 font-sans">
                      {i + 1}
                    </span>
                    <span>{ex}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes Section */}
          {session.notes && (
            <div className="mt-5 space-y-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Notes & Sensations
              </h4>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-emerald-900/60 text-xs italic text-slate-700 dark:text-slate-300 leading-relaxed">
                "{session.notes}"
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Bar */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-emerald-900/60 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              onToggle(session.id);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors ${
              session.completed
                ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-300'
                : 'bg-emerald-800 text-white dark:bg-emerald-600 hover:bg-emerald-900 dark:hover:bg-emerald-500'
            }`}
          >
            {session.completed ? <Circle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            <span>{session.completed ? 'Marquer non faite' : 'Valider la séance'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(session);
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Modifier</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onDelete(session.id);
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
