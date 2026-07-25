import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  loadData, 
  syncData, 
  subscribeToCloudChanges, 
  getSyncKey 
} from '../services/syncService';
import { 
  getStoredSessions,
  getStoredMetrics,
  getStoredNotes,
  getStoredLogistics,
  getStoredStageLogs,
  resetAllData,
  exportDataToJson,
  importDataFromJson
} from '../services/storage';
import { isSupabaseConfigured } from '../services/supabaseClient';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [syncKey, setSyncKey] = useState(getSyncKey);
  const [sessions, setSessions] = useState(() => getStoredSessions(syncKey));
  const [metrics, setMetrics] = useState(() => getStoredMetrics(syncKey));
  const [notes, setNotes] = useState(() => getStoredNotes(syncKey));
  const [logistics, setLogistics] = useState(() => getStoredLogistics(syncKey));
  const [stageLogs, setStageLogs] = useState(() => getStoredStageLogs(syncKey));
  const [syncStatus, setSyncStatus] = useState(isSupabaseConfigured ? 'cloud' : 'local');
  const [syncLogs, setSyncLogs] = useState([]);

  const addSyncLog = useCallback((logEntry) => {
    const entry = {
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      syncKey,
      ...logEntry
    };
    setSyncLogs(prev => [entry, ...prev.slice(0, 49)]);
  }, [syncKey]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setSyncStatus('syncing');
      const loaded = await loadData(syncKey);
      if (isMounted) {
        setSessions(loaded.sessions || []);
        setMetrics(loaded.metrics || []);
        setNotes(loaded.notes || []);
        setLogistics(loaded.logistics || []);
        setStageLogs(loaded.stageLogs || {});
        const mode = loaded.source === 'cloud' ? 'cloud' : 'local';
        setSyncStatus(mode);

        if (loaded.error) {
          addSyncLog({
            type: 'error',
            mode: 'local',
            action: 'loadData',
            title: 'Échec de Synchronisation Cloud',
            message: `Erreur lors de la lecture sur la clé '${syncKey}'.`,
            errorDetail: loaded.error,
            itemCount: { sessions: loaded.sessions?.length || 0, metrics: loaded.metrics?.length || 0, notes: loaded.notes?.length || 0, logistics: loaded.logistics?.length || 0 }
          });
        } else if (loaded.source === 'cloud') {
          addSyncLog({
            type: 'success',
            mode: 'cloud',
            action: 'loadData',
            title: 'Synchronisation Cloud Réussie',
            message: `Données téléchargées depuis la clé '${syncKey}'.`,
            itemCount: { sessions: loaded.sessions?.length || 0, metrics: loaded.metrics?.length || 0, notes: loaded.notes?.length || 0, logistics: loaded.logistics?.length || 0 }
          });
        } else {
          addSyncLog({
            type: 'warning',
            mode: 'local',
            action: 'loadData',
            title: 'Mode Local Actif',
            message: isSupabaseConfigured 
              ? `Lecture locale pour la clé '${syncKey}'.` 
              : `Supabase non configuré (Variables Vercel VITE_SUPABASE_URL manquantes).`,
            itemCount: { sessions: loaded.sessions?.length || 0, metrics: loaded.metrics?.length || 0, notes: loaded.notes?.length || 0, logistics: loaded.logistics?.length || 0 }
          });
        }
      }
    };
    init();
    return () => { isMounted = false; };
  }, [syncKey, addSyncLog]);

  useEffect(() => {
    const unsubscribe = subscribeToCloudChanges((remoteData) => {
      if (remoteData.sessions) setSessions(remoteData.sessions);
      if (remoteData.metrics) setMetrics(remoteData.metrics);
      if (remoteData.notes) setNotes(remoteData.notes);
      if (remoteData.logistics) setLogistics(remoteData.logistics);
      if (remoteData.stageLogs) setStageLogs(remoteData.stageLogs);
      setSyncStatus('cloud');
      addSyncLog({
        type: 'success',
        mode: 'cloud',
        action: 'realtime',
        title: 'Mise à Jour Temps Réel',
        message: `Mise à jour reçue depuis un autre appareil sur la clé '${syncKey}'.`,
        itemCount: { sessions: remoteData.sessions?.length || 0, metrics: remoteData.metrics?.length || 0, notes: remoteData.notes?.length || 0, logistics: remoteData.logistics?.length || 0 }
      });
    }, syncKey);

    return () => unsubscribe();
  }, [syncKey, addSyncLog]);

  const handlePersist = async (newSessions, newMetrics, newNotes, newLogistics) => {
    setSessions(newSessions);
    setMetrics(newMetrics);
    setNotes(newNotes);
    setLogistics(newLogistics);

    setSyncStatus('syncing');
    const result = await syncData(newSessions, newMetrics, newNotes, newLogistics, stageLogs, syncKey);
    const mode = result.mode === 'cloud' ? 'cloud' : 'local';
    setSyncStatus(mode);

    if (result.error) {
      addSyncLog({
        type: 'error',
        mode: 'local',
        action: 'syncData (Sauvegarde)',
        title: 'Erreur de Sauvegarde Cloud',
        message: `Impossible d'enregistrer sur la clé '${syncKey}'.`,
        errorDetail: result.error,
        itemCount: { sessions: newSessions.length, metrics: newMetrics.length, notes: newNotes.length, logistics: newLogistics.length }
      });
    } else if (result.mode === 'cloud') {
      addSyncLog({
        type: 'success',
        mode: 'cloud',
        action: 'syncData (Sauvegarde)',
        title: 'Séance Publiée sur le Cloud',
        message: `Données enregistrées en temps réel sur la clé '${syncKey}'.`,
        itemCount: { sessions: newSessions.length, metrics: newMetrics.length, notes: newNotes.length, logistics: newLogistics.length }
      });
    } else {
      addSyncLog({
        type: 'warning',
        mode: 'local',
        action: 'syncData (Sauvegarde)',
        title: 'Sauvegardé en Local',
        message: result.reason || `Supabase non configuré (Variables Vercel manquantes). Enregistré localement.`,
        itemCount: { sessions: newSessions.length, metrics: newMetrics.length, notes: newNotes.length, logistics: newLogistics.length }
      });
    }
  };

  const handleReset = async () => {
    const fresh = resetAllData(syncKey);
    await handlePersist(fresh.sessions, fresh.metrics, fresh.notes, fresh.logistics);
  };

  const handleExportData = () => {
    const result = exportDataToJson(sessions, metrics, notes, logistics, syncKey);
    addSyncLog({
      type: 'success',
      mode: 'local',
      action: 'exportData',
      title: 'Données Exportées en Local',
      message: `Fichier JSON '${result.fileName}' téléchargé et sauvegardé dans le navigateur.`,
      itemCount: { sessions: result.sessionsCount, metrics: result.metricsCount, notes: result.notesCount, logistics: result.logisticsCount }
    });
  };

  const handleImportDataContent = async (content) => {
    const res = importDataFromJson(content, syncKey);
    if (res.success) {
      await handlePersist(res.sessions, res.metrics, res.notes, res.logistics);
      addSyncLog({
        type: 'success',
        mode: 'local',
        action: 'importData',
        title: 'Restauration Réussie',
        message: `Données importées depuis le fichier JSON.`,
        itemCount: { sessions: res.sessions.length, metrics: res.metrics.length, notes: res.notes.length, logistics: res.logistics.length }
      });
      return true;
    } else {
      addSyncLog({
        type: 'error',
        mode: 'local',
        action: 'importData',
        title: 'Échec de l\'Importation',
        message: res.error || 'Fichier JSON non valide',
        itemCount: { sessions: sessions.length, metrics: metrics.length, notes: notes.length, logistics: logistics.length }
      });
      return false;
    }
  };

  const handleSaveSession = (session) => {
    const exists = sessions.some(s => s.id === session.id);
    let updated;
    if (exists) {
      updated = sessions.map(s => s.id === session.id ? session : s);
    } else {
      updated = [session, ...sessions];
    }
    handlePersist(updated, metrics, notes, logistics);
  };

  const handleToggleSession = (id) => {
    const updated = sessions.map(s => s.id === id ? { ...s, completed: !s.completed } : s);
    handlePersist(updated, metrics, notes, logistics);
  };

  const handleDeleteSession = (id) => {
    const updated = sessions.filter(s => s.id !== id);
    handlePersist(updated, metrics, notes, logistics);
  };

  const handleAddMetricTest = (key, val, label, extraData = {}) => {
    const updatedMetrics = metrics.map(m => {
      if (m.key === key) {
        const record = {
          date: extraData.date || new Date().toISOString().slice(0, 7),
          value: val,
          label,
          ...extraData
        };

        const newHistory = [...(m.history || []), record];
        return {
          ...m,
          currentValue: val,
          history: newHistory
        };
      }
      return m;
    });
    handlePersist(sessions, updatedMetrics, notes, logistics);
  };

  const handleDeleteMetricTest = (key, index) => {
    const updatedMetrics = metrics.map(m => {
      if (m.key === key) {
        const newHistory = (m.history || []).filter((_, i) => i !== index);
        const latestRecord = newHistory[newHistory.length - 1];
        return {
          ...m,
          currentValue: latestRecord ? latestRecord.value : 0,
          secondaryCurrentValue: latestRecord?.fcRecup !== undefined ? latestRecord.fcRecup : m.secondaryCurrentValue,
          history: newHistory
        };
      }
      return m;
    });
    handlePersist(sessions, updatedMetrics, notes, logistics);
  };

  const handleAddNote = (note) => {
    const updatedNotes = [{ ...note, id: "n_" + Date.now() }, ...notes];
    handlePersist(sessions, metrics, updatedNotes, logistics);
  };

  const handleDeleteNote = (id) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    handlePersist(sessions, metrics, updatedNotes, logistics);
  };

  const handleAddLogisticsElement = (element) => {
    const newElement = { ...element, id: "l_" + Date.now() };
    const updatedLogistics = [...logistics, newElement];
    handlePersist(sessions, metrics, notes, updatedLogistics);
  };

  const handleToggleLogisticsElement = (id) => {
    const updatedLogistics = logistics.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    handlePersist(sessions, metrics, notes, updatedLogistics);
  };

  const handleDeleteLogisticsElement = (id) => {
    const updatedLogistics = logistics.filter(item => item.id !== id);
    handlePersist(sessions, metrics, notes, updatedLogistics);
  };

  const handlePersistStageLogs = async (newStageLogs) => {
    setStageLogs(newStageLogs);
    setSyncStatus('syncing');
    try {
      const result = await syncData(sessions, metrics, notes, logistics, newStageLogs, syncKey);
      const mode = result.mode === 'cloud' ? 'cloud' : 'local';
      setSyncStatus(mode);
    } catch (err) {
      setSyncStatus('local');
    }
  };

  const forceSync = async () => {
    setSyncStatus('syncing');
    const loaded = await loadData(syncKey);
    setSessions(loaded.sessions || []);
    setMetrics(loaded.metrics || []);
    setNotes(loaded.notes || []);
    setLogistics(loaded.logistics || []);
    setStageLogs(loaded.stageLogs || {});
    setSyncStatus(loaded.source === 'cloud' ? 'cloud' : 'local');
  };

  return (
    <AppContext.Provider value={{
      syncKey, setSyncKey,
      sessions, setSessions,
      metrics, setMetrics,
      notes, setNotes,
      logistics, setLogistics,
      stageLogs, setStageLogs,
      syncStatus, setSyncStatus,
      syncLogs, setSyncLogs,
      handleReset,
      handleExportData,
      handleImportDataContent,
      handleSaveSession,
      handleToggleSession,
      handleDeleteSession,
      handleAddMetricTest,
      handleDeleteMetricTest,
      handleAddNote,
      handleDeleteNote,
      handleAddLogisticsElement,
      handleToggleLogisticsElement,
      handleDeleteLogisticsElement,
      handlePersistStageLogs,
      forceSync
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
