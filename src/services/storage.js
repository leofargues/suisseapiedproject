import { INITIAL_SESSIONS, INITIAL_METRICS, CLEAN_EMPTY_METRICS, INITIAL_NOTES, INITIAL_LOGISTICS, DEPARTURE_DATE, PREP_START_DATE } from './initialData';

const SYNC_KEY_STORAGE_KEY = 'suisse2027_sync_key';
const DEFAULT_SYNC_KEY = 'suisse2027_default';

export const getSyncKey = () => {
  const k = localStorage.getItem(SYNC_KEY_STORAGE_KEY) || DEFAULT_SYNC_KEY;
  return (k || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || DEFAULT_SYNC_KEY;
};

export const setSyncKey = (key) => {
  const cleanKey = (key || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || DEFAULT_SYNC_KEY;
  localStorage.setItem(SYNC_KEY_STORAGE_KEY, cleanKey);
  return cleanKey;
};

const getKeyName = (type, syncKey) => {
  const k = syncKey || getSyncKey();
  return `suisse2027_${type}_${k}`;
};

export const getStoredSessions = (syncKey) => {
  const k = syncKey || getSyncKey();
  try {
    const data = localStorage.getItem(getKeyName('sessions', k));
    if (data) return JSON.parse(data);
    return k === DEFAULT_SYNC_KEY ? INITIAL_SESSIONS : [];
  } catch (e) {
    console.error("Error loading sessions from storage", e);
    return k === DEFAULT_SYNC_KEY ? INITIAL_SESSIONS : [];
  }
};

export const saveStoredSessions = (sessions, syncKey) => {
  try {
    localStorage.setItem(getKeyName('sessions', syncKey), JSON.stringify(sessions));
  } catch (e) {
    console.error("Error saving sessions", e);
  }
};

export const getStoredMetrics = (syncKey) => {
  const k = syncKey || getSyncKey();
  try {
    const data = localStorage.getItem(getKeyName('metrics', k));
    if (data) return JSON.parse(data);
    return k === DEFAULT_SYNC_KEY ? JSON.parse(JSON.stringify(INITIAL_METRICS)) : JSON.parse(JSON.stringify(CLEAN_EMPTY_METRICS));
  } catch (e) {
    console.error("Error loading metrics", e);
    return k === DEFAULT_SYNC_KEY ? JSON.parse(JSON.stringify(INITIAL_METRICS)) : JSON.parse(JSON.stringify(CLEAN_EMPTY_METRICS));
  }
};

export const saveStoredMetrics = (metrics, syncKey) => {
  try {
    localStorage.setItem(getKeyName('metrics', syncKey), JSON.stringify(metrics));
  } catch (e) {
    console.error("Error saving metrics", e);
  }
};

export const getStoredNotes = (syncKey) => {
  const k = syncKey || getSyncKey();
  try {
    const data = localStorage.getItem(getKeyName('notes', k));
    if (data) return JSON.parse(data);
    return k === DEFAULT_SYNC_KEY ? INITIAL_NOTES : [];
  } catch (e) {
    console.error("Error loading notes", e);
    return k === DEFAULT_SYNC_KEY ? INITIAL_NOTES : [];
  }
};

export const saveStoredNotes = (notes, syncKey) => {
  try {
    localStorage.setItem(getKeyName('notes', syncKey), JSON.stringify(notes));
  } catch (e) {
    console.error("Error saving notes", e);
  }
};

export const getStoredLogistics = (syncKey) => {
  const k = syncKey || getSyncKey();
  try {
    const data = localStorage.getItem(getKeyName('logistics', k));
    if (data) return JSON.parse(data);
    return k === DEFAULT_SYNC_KEY ? INITIAL_LOGISTICS : [];
  } catch (e) {
    console.error("Error loading logistics", e);
    return k === DEFAULT_SYNC_KEY ? INITIAL_LOGISTICS : [];
  }
};

export const saveStoredLogistics = (logistics, syncKey) => {
  try {
    localStorage.setItem(getKeyName('logistics', syncKey), JSON.stringify(logistics));
  } catch (e) {
    console.error("Error saving logistics", e);
  }
};

export const exportDataToJson = (sessions, metrics, notes, logistics, syncKey) => {
  const k = syncKey || getSyncKey();
  
  // Guarantee data is stored in localStorage
  saveStoredSessions(sessions, k);
  saveStoredMetrics(metrics, k);
  saveStoredNotes(notes, k);
  saveStoredLogistics(logistics, k);

  const payload = {
    app: "Suisse à Pied Tracker 2027",
    version: "1.0",
    exportDate: new Date().toISOString(),
    syncKey: k,
    summary: {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.completed).length,
      totalMetrics: metrics.length,
      totalNotes: notes.length,
      totalLogistics: logistics.length
    },
    data: {
      sessions,
      metrics,
      notes,
      logistics
    }
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `suisse2027_export_${dateStr}.json`;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    fileName,
    sessionsCount: sessions.length,
    metricsCount: metrics.length,
    notesCount: notes.length,
    logisticsCount: logistics.length
  };
};

export const importDataFromJson = (jsonString, syncKey) => {
  try {
    const parsed = JSON.parse(jsonString);
    const data = parsed.data || parsed;
    
    if (!data.sessions && !data.metrics && !data.notes && !data.logistics) {
      throw new Error("Format JSON non reconnu. Le fichier doit contenir les données d'entraînement.");
    }

    const importedSessions = Array.isArray(data.sessions) ? data.sessions : [];
    const importedMetrics = Array.isArray(data.metrics) ? data.metrics : [];
    const importedNotes = Array.isArray(data.notes) ? data.notes : [];
    const importedLogistics = Array.isArray(data.logistics) ? data.logistics : [];
    
    const k = syncKey || getSyncKey();
    saveStoredSessions(importedSessions, k);
    saveStoredMetrics(importedMetrics, k);
    saveStoredNotes(importedNotes, k);
    saveStoredLogistics(importedLogistics, k);

    return {
      success: true,
      sessions: importedSessions,
      metrics: importedMetrics,
      notes: importedNotes,
      logistics: importedLogistics
    };
  } catch (e) {
    console.error("Error importing JSON data", e);
    return {
      success: false,
      error: e.message
    };
  }
};

export const resetAllData = (syncKey) => {
  const k = syncKey || getSyncKey();
  const emptySessions = [];
  const emptyMetrics = JSON.parse(JSON.stringify(CLEAN_EMPTY_METRICS));
  const emptyNotes = [];
  const emptyLogistics = [];

  saveStoredSessions(emptySessions, k);
  saveStoredMetrics(emptyMetrics, k);
  saveStoredNotes(emptyNotes, k);
  saveStoredLogistics(emptyLogistics, k);

  return {
    sessions: emptySessions,
    metrics: emptyMetrics,
    notes: emptyNotes,
    logistics: emptyLogistics
  };
};

export { DEPARTURE_DATE, PREP_START_DATE };


