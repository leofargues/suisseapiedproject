import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, AlertTriangle, CheckCircle2, RefreshCw, X, ChevronDown, ChevronUp, Terminal, Bug } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabaseClient';

export default function SyncToast({ syncLog, onClose, onOpenDiagnostic }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!syncLog) return null;

  const isError = syncLog.type === 'error' || syncLog.type === 'warning' || syncLog.mode === 'local';
  const isSuccess = syncLog.type === 'success' && syncLog.mode === 'cloud';
  const isSyncing = syncLog.type === 'syncing';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={`rounded-2xl p-4 shadow-2xl border backdrop-blur-md transition-all ${
        isError 
          ? 'bg-rose-950/90 text-rose-100 border-rose-800/80 shadow-rose-950/50' 
          : isSuccess 
            ? 'bg-emerald-950/90 text-emerald-100 border-emerald-800/80 shadow-emerald-950/50'
            : 'bg-slate-900/90 text-slate-100 border-slate-700/80 shadow-slate-950/50'
      }`}>
        
        {/* Toast Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <div className={`p-2 rounded-xl flex items-center justify-center ${
              isError 
                ? 'bg-rose-900/60 text-rose-400' 
                : isSuccess 
                  ? 'bg-emerald-900/60 text-emerald-400'
                  : 'bg-amber-900/60 text-amber-400'
            }`}>
              {isSyncing ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : isError ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold font-display leading-tight">
                  {syncLog.title}
                </h4>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  syncLog.mode === 'cloud' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {syncLog.mode === 'cloud' ? 'Cloud Actif' : 'Mode Local'}
                </span>
              </div>
              <p className="text-xs opacity-90 mt-0.5 font-medium">
                {syncLog.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-xs flex items-center gap-1 transition-colors"
              title="Voir les détails techniques"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg text-xs transition-colors"
              title="Fermer la notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Technical Details Accordion */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-white/10 text-xs space-y-2 font-mono">
            <div className="grid grid-cols-2 gap-2 text-[11px] opacity-80">
              <div>
                <span className="font-bold block opacity-60">Action :</span>
                <span>{syncLog.action || 'sync'}</span>
              </div>
              <div>
                <span className="font-bold block opacity-60">Clé d'espace :</span>
                <span className="font-bold text-amber-300">{syncLog.syncKey}</span>
              </div>
              <div>
                <span className="font-bold block opacity-60">Supabase Config :</span>
                <span>{isSupabaseConfigured ? '✓ Oui (Variables OK)' : '❌ Non (Variables Manquantes)'}</span>
              </div>
              <div>
                <span className="font-bold block opacity-60">Horodatage :</span>
                <span>{new Date(syncLog.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>

            {syncLog.itemCount && (
              <div className="p-2 rounded-lg bg-black/30 text-[11px] text-slate-300">
                📦 Données : {syncLog.itemCount.sessions} séance(s), {syncLog.itemCount.metrics} métrique(s), {syncLog.itemCount.notes} note(s)
              </div>
            )}

            {syncLog.errorDetail && (
              <div className="p-2.5 rounded-xl bg-rose-950/90 border border-rose-700/60 text-rose-200 text-[11px] space-y-1 overflow-x-auto">
                <div className="flex items-center gap-1 font-bold text-rose-400">
                  <Bug className="h-3.5 w-3.5 shrink-0" />
                  <span>Détail de l'erreur Supabase / Système :</span>
                </div>
                <p className="font-mono break-all whitespace-pre-wrap">{syncLog.errorDetail}</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={onOpenDiagnostic}
                className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-white/15 hover:bg-white/25 transition-colors flex items-center gap-1.5"
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Ouvrir le Diagnostic Complet</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
