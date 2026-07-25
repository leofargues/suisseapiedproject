import React, { useState, useEffect } from 'react';
import { Mountain, Sun, Moon, RotateCcw, MapPin, Cloud, CloudOff, RefreshCw, Key, Check, X } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { useAppContext } from '../context/AppContext';

export default function Navbar({ darkMode, setDarkMode, onOpenDiagnostic, mainAppPage, onMainAppPageChange }) {
  const { syncKey, setSyncKey, handleReset, syncStatus } = useAppContext();
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [keyInput, setKeyInput] = useState(syncKey);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setKeyInput(syncKey);
  }, [syncKey]);

  const handleKeySubmit = (e) => {
    e.preventDefault();
    setSyncKey(keyInput);
    setIsKeyModalOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200 dark:border-emerald-900/60 transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between py-3 gap-3 sm:h-20 sm:py-0">
          
          {/* Top Row / Brand & Logo */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 aspect-square shrink-0 rounded-xl bg-emerald-800 dark:bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/30 ring-2 ring-emerald-700/40">
                <Mountain className="h-5 w-5 sm:h-7 sm:w-7 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg sm:text-2xl font-black tracking-tight font-display text-slate-900 dark:text-white">
                    Suisse à pied <span className="text-emerald-700 dark:text-emerald-400">2027</span>
                  </h1>
                </div>
              </div>
            </div>
            
            {/* Mobile Actions Controls (Only on mobile to save space) */}
            <div className="flex sm:hidden items-center space-x-2">
              <button
                onClick={() => setIsKeyModalOpen(true)}
                className={`h-9 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm shrink-0 ${
                  syncStatus === 'syncing'
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900'
                    : syncStatus === 'cloud'
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                title="Gérer la clé de synchronisation multi-appareils"
                aria-label="Clé de synchronisation"
              >
                {syncStatus === 'syncing' ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-amber-600 dark:text-amber-400 shrink-0" />
                ) : syncStatus === 'cloud' ? (
                  <Cloud className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <CloudOff className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
                )}
                <Key className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              </button>

              <button 
                onClick={() => setDarkMode(!darkMode)} 
                className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-emerald-950/90 text-slate-800 dark:text-amber-300 flex items-center justify-center border border-slate-200 dark:border-emerald-800/80 shadow-sm"
                aria-label="Changer de thème"
              >
                {darkMode ? <Sun className="h-4 w-4 text-amber-400 fill-amber-400/20" /> : <Moon className="h-4 w-4 text-emerald-800" />}
              </button>
            </div>
          </div>

          {/* Main Navigation (Desktop/Tablet only) */}
          <div className="hidden sm:flex items-center space-x-1 sm:space-x-2 overflow-x-auto w-full sm:w-auto justify-center sm:justify-start pb-1 sm:pb-0">
            <button
              onClick={() => onMainAppPageChange('entrainement')}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                mainAppPage === 'entrainement'
                  ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Entraînement
            </button>
            <button
              onClick={() => onMainAppPageChange('carte')}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                mainAppPage === 'carte'
                  ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Carte
            </button>
            <button
              onClick={() => onMainAppPageChange('logistique')}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                mainAppPage === 'logistique'
                  ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Logistique
            </button>
            <button
              onClick={() => onMainAppPageChange('parametre')}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                mainAppPage === 'parametre'
                  ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Paramètres
            </button>
          </div>

          {/* Action Controls & Sync Status (Desktop) */}
          <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
            
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className={`h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm shrink-0 ${
                syncStatus === 'syncing'
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900'
                  : syncStatus === 'cloud'
                    ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
              title="Gérer la clé de synchronisation multi-appareils"
            >
              {syncStatus === 'syncing' ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="hidden sm:inline">Synchro...</span>
                </>
              ) : syncStatus === 'cloud' ? (
                <>
                  <Cloud className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="hidden sm:inline">Cloud Actif</span>
                </>
              ) : (
                <>
                  <CloudOff className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span className="hidden sm:inline">Mode Local</span>
                </>
              )}
              <Key className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 ml-0.5 shrink-0" />
            </button>

            <button
              onClick={() => {
                if (window.confirm("Réinitialiser toutes les données d'entraînement aux valeurs d'exemple ?")) {
                  handleReset();
                }
              }}
              title="Réinitialiser les données de démo"
              className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-emerald-950/80 hover:bg-slate-200 dark:hover:bg-emerald-900/80 border border-slate-200 dark:border-emerald-800/80 transition-all flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <RotateCcw className="h-4 w-4 text-slate-500 dark:text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Réinitialiser</span>
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-emerald-950/90 text-slate-800 dark:text-amber-300 hover:bg-slate-200 dark:hover:bg-emerald-900/90 border border-slate-200 dark:border-emerald-700/60 transition-all flex items-center gap-1.5 shadow-sm shrink-0"
              aria-label="Changer de thème"
            >
              {darkMode ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400 fill-amber-400/20 shrink-0" />
                  <span className="hidden sm:inline text-slate-100">Mode Clair</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-emerald-800 shrink-0" />
                  <span className="hidden sm:inline text-slate-800">Mode Sombre</span>
                </>
              )}
            </button>

          </div>
        </div>
      </header>

      {/* Sync Key Multi-device Modal (Outside header to prevent sticky container clipping on mobile) */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-emerald-950 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-emerald-800 max-h-[90vh] overflow-y-auto my-auto space-y-4 text-slate-900 dark:text-white">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-emerald-900/60">
              <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-400">
                <Cloud className="h-6 w-6 shrink-0" />
                <h3 className="text-lg font-extrabold font-display text-slate-900 dark:text-white">
                  Synchronisation Multi-Appareils
                </h3>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
                title="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Pour accéder à vos données depuis votre smartphone ou un autre navigateur hébergé sur Vercel, utilisez le même <strong>Code d'Espace de Synchro</strong> sur chaque appareil.
            </p>

            <form onSubmit={handleKeySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Clé d'Espace Partagé (Sync Key)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="ex: suisse2027_monprojet"
                    required
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(keyInput);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-3 py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1 border border-slate-300 dark:border-emerald-800 shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : "Copier"}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-emerald-900/60 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200">Statut de la connexion :</p>
                {isSupabaseConfigured ? (
                  <p className="text-emerald-700 dark:text-emerald-400 font-bold">✓ Supabase est connecté sur Vercel. Vos modifications sont sauvegardées en temps réel sur le cloud !</p>
                ) : (
                  <p className="text-amber-700 dark:text-amber-400 font-medium">⚠️ Supabase n'est pas encore configuré (Variables d'environnement Vercel VITE_SUPABASE_URL manquantes). L'application utilise le stockage local.</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-3 border-t border-slate-200 dark:border-emerald-900/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsKeyModalOpen(false);
                    if (onOpenDiagnostic) onOpenDiagnostic();
                  }}
                  className="px-3 py-2.5 text-xs font-bold rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-500/20 text-center"
                >
                  🛠️ Diagnostiquer Erreur
                </button>

                <div className="flex space-x-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsKeyModalOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  >
                    Fermer
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-800 dark:bg-emerald-600 text-white hover:bg-emerald-900 dark:hover:bg-emerald-500"
                  >
                    Appliquer la clé
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

