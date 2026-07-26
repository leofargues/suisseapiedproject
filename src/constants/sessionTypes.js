import { 
  Flame, 
  Compass, 
  Dumbbell, 
  Footprints, 
  Coffee 
} from 'lucide-react';

export const SESSION_TYPES = {
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

export const getTypeConfig = (type) => {
  if (type === 'cardio') return SESSION_TYPES.stairclimber;
  return SESSION_TYPES[type] || SESSION_TYPES.stairclimber;
};
