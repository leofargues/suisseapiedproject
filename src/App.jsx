import React, { useState, useEffect, useRef } from 'react';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("GlobalErrorBoundary Caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-100 text-red-900 rounded-xl m-4 border-2 border-red-500">
          <h2 className="font-bold text-xl mb-4">💥 Crash de l'application !</h2>
          <p className="mb-2 text-sm font-semibold">Le composant a planté avec l'erreur suivante :</p>
          <pre className="bg-red-50 p-4 rounded text-xs overflow-auto border border-red-200">
            {this.state.error && this.state.error.toString()}
            <br/><br/>
            {this.state.error && this.state.error.stack}
          </pre>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Réessayer de charger
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

import Navbar from './components/Navbar';
import CountdownWidget from './components/CountdownWidget';
import TrainingCalendar from './components/TrainingCalendar';
import MetricsTracker from './components/MetricsTracker';
import NotesSection from './components/NotesSection';
import AddSessionModal from './components/AddSessionModal';
import DiagnosticModal from './components/DiagnosticModal';
import LogisticsSection from './components/LogisticsSection';
import MapSection from './components/MapSection';


import { 
  loadData, 
  syncData, 
  subscribeToCloudChanges, 
  getSyncKey 
} from './services/syncService';

import { 
  getStoredSessions,
  getStoredMetrics,
  getStoredNotes,
  getStoredLogistics,
  getStoredStageLogs,
  resetAllData,
  exportDataToJson,
  importDataFromJson,
  DEPARTURE_DATE,
  PREP_START_DATE
} from './services/storage';

import { isSupabaseConfigured } from './services/supabaseClient';
import { Calendar, BarChart3, NotebookPen, LayoutDashboard, Download, Upload, HardDrive, AlertTriangle, X, Activity, Backpack, Settings, Map } from 'lucide-react';



export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('suisse2027_theme');
    return saved ? saved === 'dark' : false;
  });

  const [syncKey, setSyncKey] = useState(getSyncKey);
  const [sessions, setSessions] = useState(() => getStoredSessions(syncKey));
  const [metrics, setMetrics] = useState(() => getStoredMetrics(syncKey));
  const [notes, setNotes] = useState(() => getStoredNotes(syncKey));
  const [logistics, setLogistics] = useState(() => getStoredLogistics(syncKey));
  const [stageLogs, setStageLogs] = useState(() => getStoredStageLogs(syncKey));
  const [syncStatus, setSyncStatus] = useState(isSupabaseConfigured ? 'cloud' : 'local');

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return 'calendar';
    }
    return 'dashboard';
  });
  const [mainAppPage, setMainAppPage] = useState('entrainement');
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [addSessionDate, setAddSessionDate] = useState(null);
  const [editingSession, setEditingSession] = useState(null);

  const [isImportWarningOpen, setIsImportWarningOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Diagnostic Logs & Toasts State

  const [syncLogs, setSyncLogs] = useState([]);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);

  const addSyncLog = (logEntry) => {
    const entry = {
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      syncKey,
      ...logEntry
    };
    setSyncLogs(prev => [entry, ...prev.slice(0, 49)]);
  };

  // Initial load from Cloud or LocalStorage for the current syncKey
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
  }, [syncKey]);

  // Subscribe to realtime updates from other devices for the active syncKey
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
  }, [syncKey]);

  // Apply dark mode class to html document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('suisse2027_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('suisse2027_theme', 'light');
    }
  }, [darkMode]);

  // Save changes to Cloud + LocalStorage
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

  // Reset Handler
  const handleReset = async () => {
    const fresh = resetAllData(syncKey);
    await handlePersist(fresh.sessions, fresh.metrics, fresh.notes, fresh.logistics);
  };

  // Export & Import Data Handlers
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

  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
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
        } else {
          addSyncLog({
            type: 'error',
            mode: 'local',
            action: 'importData',
            title: 'Échec de l\'Importation',
            message: res.error || 'Fichier JSON non valide',
            itemCount: { sessions: sessions.length, metrics: metrics.length, notes: notes.length, logistics: logistics.length }
          });
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };


  // Action Handlers
  const handleSaveSession = (session) => {
    const exists = sessions.some(s => s.id === session.id);
    let updated;
    if (exists) {
      updated = sessions.map(s => s.id === session.id ? session : s);
    } else {
      updated = [session, ...sessions];
    }
    handlePersist(updated, metrics, notes, logistics);
    setEditingSession(null);
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

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors pb-24 sm:pb-0">
      
      {/* Navbar */}
      <Navbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        onResetData={handleReset} 
        syncStatus={syncStatus}
        onKeyChange={(newKey) => setSyncKey(newKey)}
        onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
        mainAppPage={mainAppPage}
        onMainAppPageChange={setMainAppPage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {mainAppPage === 'entrainement' && (
          <>
            {/* Countdown Header Banner */}
        <CountdownWidget 
          departureDate={DEPARTURE_DATE}
          prepStartDate={PREP_START_DATE}
          sessions={sessions}
          metrics={metrics}
        />

        {/* Section Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 border-b border-slate-200 dark:border-emerald-900/60 pb-2 overflow-x-auto">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold font-display transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-emerald-800 dark:bg-emerald-600 text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-950/60'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Vue globale</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold font-display transition-all whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-emerald-800 dark:bg-emerald-600 text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-950/60'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Calendrier d'entraînement</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold font-display transition-all whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'bg-emerald-800 dark:bg-emerald-600 text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-950/60'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>5 Métriques Physiques</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold font-display transition-all whitespace-nowrap ${
              activeTab === 'notes'
                ? 'bg-emerald-800 dark:bg-emerald-600 text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-950/60'
            }`}
          >
            <NotebookPen className="h-4 w-4" />
            <span>Carnet de Terrain</span>
          </button>

        </div>

        {/* Tab Content Render */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <TrainingCalendar 
              sessions={sessions}
              onAddSession={(date) => {
                setEditingSession(null);
                setAddSessionDate(date);
                setIsAddSessionOpen(true);
              }}
              onEditSession={(session) => {
                setEditingSession(session);
                setIsAddSessionOpen(true);
              }}
              onToggleSession={handleToggleSession}
              onDeleteSession={handleDeleteSession}
            />

            <MetricsTracker 
              metrics={metrics}
              onAddMetricTest={handleAddMetricTest}
              onDeleteMetricTest={handleDeleteMetricTest}
              darkMode={darkMode}
            />

            <NotesSection 
              notes={notes}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
            />
          </div>
        )}

        {activeTab === 'calendar' && (
          <TrainingCalendar 
            sessions={sessions}
            onAddSession={(date) => {
              setEditingSession(null);
              setAddSessionDate(date);
              setIsAddSessionOpen(true);
            }}
            onEditSession={(session) => {
              setEditingSession(session);
              setIsAddSessionOpen(true);
            }}
            onToggleSession={handleToggleSession}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {activeTab === 'metrics' && (
          <MetricsTracker 
            metrics={metrics}
            onAddMetricTest={handleAddMetricTest}
            onDeleteMetricTest={handleDeleteMetricTest}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'notes' && (
          <NotesSection 
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
        )}
          </>
        )}

        {mainAppPage === 'carte' && (
          <div className="max-w-7xl mx-auto py-2">
            <GlobalErrorBoundary>
              <MapSection 
                stageLogs={stageLogs}
                onUpdateStageLogs={handlePersistStageLogs}
              />
            </GlobalErrorBoundary>
          </div>
        )}

        {mainAppPage === 'logistique' && (
          <div className="max-w-4xl mx-auto py-6">
            <LogisticsSection
              logistics={logistics}
              onAddElement={handleAddLogisticsElement}
              onToggleElement={handleToggleLogisticsElement}
              onDeleteElement={handleDeleteLogisticsElement}
            />
          </div>
        )}

        {mainAppPage === 'parametre' && (
          <div className="max-w-4xl mx-auto py-6 space-y-6">
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Paramètres</h2>
            
            {/* Export & Local Backup Banner */}
            <div className="p-6 rounded-3xl bg-white/90 dark:bg-emerald-950/90 border border-slate-200 dark:border-emerald-800/80 text-slate-900 dark:text-white shadow-xl shadow-slate-200/60 dark:shadow-emerald-950/50 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-emerald-800 dark:text-emerald-400 shrink-0 shadow-sm">
                  <HardDrive className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold font-display text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Exportation & Sauvegarde Locale</span>
                    <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300 font-extrabold border border-emerald-300 dark:border-emerald-500/30">JSON Local</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-emerald-200/80 mt-0.5 leading-relaxed font-medium">
                    Sauvegardez l'ensemble de vos données (séances, métriques physiques et carnet de terrain) directement sur votre appareil.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 justify-stretch md:justify-end">
                <button
                  onClick={handleExportData}
                  className="flex-1 md:flex-none px-5 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs sm:text-sm font-extrabold font-display transition-all shadow-md shadow-emerald-900/20 dark:shadow-emerald-950/50 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
                  title="Télécharger le fichier JSON et forcer la sauvegarde locale"
                >
                  <Download className="h-4 w-4" />
                  <span>Exporter en local (.JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsImportWarningOpen(true)}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-900 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold transition-all border border-slate-300 dark:border-emerald-700/60 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  title="Avertissement : L'importation remplace les données existantes"
                >
                  <Upload className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Importer</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>


      {/* Hidden File Input for Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportData}
        className="hidden"
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-emerald-900/60 py-6 text-center text-xs text-slate-600 dark:text-slate-400 mt-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1 font-semibold">
            <span>🇨🇭 Suisse à pied 2027</span>
            <span>• Synchronisé multi-appareils</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Conçu pour Vercel, GitHub et les grandes randonnées alpines
          </p>
        </div>
      </footer>


      {/* Import Warning Modal */}
      {isImportWarningOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-emerald-950 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-emerald-800 text-slate-900 dark:text-white space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-900/60 pb-3">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="p-2.5 bg-rose-100 dark:bg-rose-950/80 rounded-2xl shrink-0">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold font-display text-slate-900 dark:text-white">
                    Attention : Remplacement des données
                  </h3>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">
                    Avertissement d'importation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportWarningOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-2">
              <p className="text-xs text-rose-900 dark:text-rose-200 font-semibold leading-relaxed">
                ⚠️ <strong>L'importation d'un fichier de sauvegarde écrasera et remplacera définitivement l'ensemble des données existantes</strong> sur cet appareil :
              </p>
              <ul className="text-[11px] text-rose-800 dark:text-rose-300 list-disc list-inside space-y-0.5 font-medium pl-1">
                <li>Séances du calendrier d'entraînement</li>
                <li>Historique des 5 métriques physiques</li>
                <li>Carnet de terrain et notes</li>
                <li>Checklist de départ (logistique)</li>
              </ul>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Assurez-vous d'avoir exporté une copie de vos données actuelles si vous souhaitez les conserver.
            </p>

            {/* Footer / Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-emerald-900/60">
              <button
                type="button"
                onClick={() => setIsImportWarningOpen(false)}
                className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsImportWarningOpen(false);
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
                className="px-4 py-2.5 text-xs font-extrabold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md shadow-rose-950/40 flex items-center justify-center gap-2 active:scale-95"
              >
                <Upload className="h-4 w-4" />
                <span>Continuer et choisir le fichier</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit Session Modal */}
      {isAddSessionOpen && (
        <AddSessionModal 
          defaultDate={addSessionDate}
          sessionToEdit={editingSession}
          onClose={() => {
            setIsAddSessionOpen(false);
            setEditingSession(null);
          }}
          onSave={handleSaveSession}
        />
      )}

      <DiagnosticModal 
        isOpen={isDiagnosticOpen} 
        onClose={() => setIsDiagnosticOpen(false)} 
        syncLogs={syncLogs}
        onForceSync={async () => {
          setSyncStatus('syncing');
          const loaded = await loadData(syncKey);
          setSessions(loaded.sessions || []);
          setMetrics(loaded.metrics || []);
          setNotes(loaded.notes || []);
          setLogistics(loaded.logistics || []);
          setSyncStatus(loaded.source === 'cloud' ? 'cloud' : 'local');
        }}
      />

      {/* Mobile Fixed Floating Bottom Navigation Bar (Main Pages) */}
      <nav className="sm:hidden fixed bottom-6 left-4 right-4 z-50 max-w-[400px] mx-auto bg-white/55 dark:bg-slate-900/60 backdrop-blur-md border border-white/80 dark:border-white/15 p-1.5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] ring-1 ring-black/5 dark:ring-white/10 transition-all">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => setMainAppPage('entrainement')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-full transition-all duration-200 ${
              mainAppPage === 'entrainement'
                ? 'text-emerald-900 dark:text-emerald-300 bg-emerald-500/20 dark:bg-emerald-400/20 font-extrabold shadow-xs border border-emerald-500/30 dark:border-emerald-400/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-white/5 font-medium border border-transparent'
            }`}
          >
            <Activity className={`h-5 w-5 ${mainAppPage === 'entrainement' ? 'scale-110' : ''} transition-transform duration-200`} />
            <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight truncate">Entraînement</span>
          </button>

          <button
            onClick={() => setMainAppPage('carte')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-full transition-all duration-200 ${
              mainAppPage === 'carte'
                ? 'text-emerald-900 dark:text-emerald-300 bg-emerald-500/20 dark:bg-emerald-400/20 font-extrabold shadow-xs border border-emerald-500/30 dark:border-emerald-400/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-white/5 font-medium border border-transparent'
            }`}
          >
            <Map className={`h-5 w-5 ${mainAppPage === 'carte' ? 'scale-110' : ''} transition-transform duration-200`} />
            <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight truncate">Carte</span>
          </button>

          <button
            onClick={() => setMainAppPage('logistique')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-full transition-all duration-200 ${
              mainAppPage === 'logistique'
                ? 'text-emerald-900 dark:text-emerald-300 bg-emerald-500/20 dark:bg-emerald-400/20 font-extrabold shadow-xs border border-emerald-500/30 dark:border-emerald-400/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-white/5 font-medium border border-transparent'
            }`}
          >
            <Backpack className={`h-5 w-5 ${mainAppPage === 'logistique' ? 'scale-110' : ''} transition-transform duration-200`} />
            <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight truncate">Logistique</span>
          </button>

          <button
            onClick={() => setMainAppPage('parametre')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-full transition-all duration-200 ${
              mainAppPage === 'parametre'
                ? 'text-emerald-900 dark:text-emerald-300 bg-emerald-500/20 dark:bg-emerald-400/20 font-extrabold shadow-xs border border-emerald-500/30 dark:border-emerald-400/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-white/5 font-medium border border-transparent'
            }`}
          >
            <Settings className={`h-5 w-5 ${mainAppPage === 'parametre' ? 'scale-110' : ''} transition-transform duration-200`} />
            <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight truncate">Paramètres</span>
          </button>
        </div>
      </nav>

    </div>
  );
}



