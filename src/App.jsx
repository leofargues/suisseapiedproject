import React, { useState, useEffect, useRef, useCallback } from 'react';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import Navbar from './components/Navbar';
import CountdownWidget from './components/CountdownWidget';
import TrainingCalendar from './components/TrainingCalendar';
import MetricsTracker from './components/MetricsTracker';
import NotesSection from './components/NotesSection';
import AddSessionModal from './components/AddSessionModal';
import DiagnosticModal from './components/DiagnosticModal';
import LogisticsSection from './components/LogisticsSection';
import MapSection from './components/MapSection';

import { useAppContext } from './context/AppContext';
import { Calendar, BarChart3, NotebookPen, LayoutDashboard, Download, Upload, HardDrive, AlertTriangle, X, Activity, Backpack, Settings, Map } from 'lucide-react';

export default function App() {
  const { handleExportData, handleImportDataContent } = useAppContext();

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('suisse2027_theme');
    return saved ? saved === 'dark' : false;
  });

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
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('suisse2027_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('suisse2027_theme', 'light');
    }
  }, [darkMode]);

  const handleImportData = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        await handleImportDataContent(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleOpenDiagnostic = useCallback(() => setIsDiagnosticOpen(true), []);
  
  const handleMainAppPageChange = useCallback((page) => setMainAppPage(page), []);
  
  const handleAddSession = useCallback((date) => {
    setEditingSession(null);
    setAddSessionDate(date);
    setIsAddSessionOpen(true);
  }, []);
  
  const handleEditSession = useCallback((session) => {
    setEditingSession(session);
    setIsAddSessionOpen(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors pb-24 sm:pb-0">
      
      <Navbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        onOpenDiagnostic={handleOpenDiagnostic}
        mainAppPage={mainAppPage}
        onMainAppPageChange={handleMainAppPageChange}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {mainAppPage === 'entrainement' && (
          <>
            <CountdownWidget />

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

            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <TrainingCalendar 
                  onAddSession={handleAddSession}
                  onEditSession={handleEditSession}
                />
                <MetricsTracker darkMode={darkMode} />
                <NotesSection />
              </div>
            )}

            {activeTab === 'calendar' && (
              <TrainingCalendar 
                onAddSession={handleAddSession}
                onEditSession={handleEditSession}
              />
            )}

            {activeTab === 'metrics' && (
              <MetricsTracker darkMode={darkMode} />
            )}

            {activeTab === 'notes' && (
              <NotesSection />
            )}
          </>
        )}

        {mainAppPage === 'carte' && (
          <div className="max-w-7xl mx-auto py-2">
            <GlobalErrorBoundary>
              <MapSection />
            </GlobalErrorBoundary>
          </div>
        )}

        {mainAppPage === 'logistique' && (
          <div className="max-w-4xl mx-auto py-6">
            <LogisticsSection />
          </div>
        )}

        {mainAppPage === 'parametre' && (
          <div className="max-w-4xl mx-auto py-6 space-y-6">
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Paramètres</h2>
            
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

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportData}
        className="hidden"
      />

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

      {isImportWarningOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-emerald-950 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-emerald-800 text-slate-900 dark:text-white space-y-4">
            
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

      {isAddSessionOpen && (
        <AddSessionModal 
          defaultDate={addSessionDate}
          sessionToEdit={editingSession}
          onClose={() => {
            setIsAddSessionOpen(false);
            setEditingSession(null);
          }}
        />
      )}

      <DiagnosticModal 
        isOpen={isDiagnosticOpen} 
        onClose={() => setIsDiagnosticOpen(false)} 
      />

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
