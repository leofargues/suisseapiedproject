export const getExerciseLines = (exercises) => {
  if (!exercises) return [];
  if (Array.isArray(exercises)) {
    return exercises.map(ex => (typeof ex === 'string' ? ex.trim() : '')).filter(Boolean);
  }
  if (typeof exercises === 'string') {
    return exercises.split('\n').map(ex => ex.trim()).filter(Boolean);
  }
  return [];
};

export const parseInitialExercises = (session) => {
  if (!session || !session.exercises) return [''];
  if (Array.isArray(session.exercises)) {
    return session.exercises.length > 0 ? session.exercises : [''];
  }
  if (typeof session.exercises === 'string') {
    const lines = session.exercises.split('\n').map(s => s.trim()).filter(Boolean);
    return lines.length > 0 ? lines : [''];
  }
  return [''];
};

export const parseDurationComponents = (durationStr) => {
  if (!durationStr) return { hours: 1, minutes: 0 };
  const lower = durationStr.toLowerCase().trim();
  if (lower.includes('h')) {
    const parts = lower.split('h');
    const hours = parseInt(parts[0], 10) || 0;
    const mins = parseInt(parts[1], 10) || 0;
    return { hours, minutes: mins };
  }
  if (lower.includes('m')) {
    const mins = parseInt(lower.replace(/[^0-9]/g, ''), 10) || 0;
    return { hours: 0, minutes: mins };
  }
  const match = lower.match(/\d+/);
  const totalMins = match ? parseInt(match[0], 10) : 60;
  return { hours: Math.floor(totalMins / 60), minutes: totalMins % 60 };
};

export const calculateTotalElevation = (sessions) => {
  if (!Array.isArray(sessions)) return 0;
  return sessions
    .filter(s => s && s.completed)
    .reduce((acc, curr) => {
      if (curr.hikeElevationPlus) {
        return acc + (parseInt(curr.hikeElevationPlus, 10) || 0);
      }
      if (curr.elevation) {
        const match = curr.elevation.match(/D\+\s*:\s*(\d+)m/) || curr.elevation.match(/(\d+)m\s*D\+/);
        if (match) return acc + (parseInt(match[1], 10) || 0);
        if (curr.elevation.includes('m D+')) {
          const val = parseInt(curr.elevation.replace(/[^0-9]/g, ''), 10);
          return acc + (isNaN(val) ? 0 : val);
        }
      }
      return acc;
    }, 0);
};

export const formatDateStr = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};
