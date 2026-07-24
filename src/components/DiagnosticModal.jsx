import React, { useState } from 'react';
import { X, Cloud, CloudOff, Terminal, RefreshCw, Copy, Check, AlertTriangle, ShieldCheck, Database, Key } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import { getSyncKey } from '../services/storage';

export default function DiagnosticModal({ isOpen, onClose, syncLogs, onForceSync }) {
  const [copied, setCopied] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const currentKey = getSyncKey();

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      if (!isSupabaseConfigured || !supabase) {
        setTestResult({
          success: false,
          message: "Variables Vercel manquantes : VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY n'est pas défini."
        });
        setTestingConnection(false);
        return;
      }

      // 1. Test SELECT
      const { data: selectData, error: selectErr } = await supabase
        .from('suisse_prep_data')
        .select('sync_key, updated_at')
        .eq('sync_key', currentKey)
        .maybeSingle();

      let msg = "";
      if (selectErr) {
        msg += `❌ Erreur SELECT (Lecture) : ${selectErr.message}\n`;
      } else if (!selectData) {
        msg += `✅ SELECT réussi (Aucune donnée pour la clé '${currentKey}').\n`;
      } else {
        msg += `✅ SELECT réussi (Ligne trouvée, maj: ${new Date(selectData.updated_at).toLocaleTimeString()}).\n`;
      }

      // 2. Test UPSERT (Écriture)
      const { error: upsertErr } = await supabase
        .from('suisse_prep_data')
        .upsert({
          sync_key: currentKey,
          updated_at: new Date().toISOString()
        }, { onConflict: 'sync_key' });

      if (upsertErr) {
        msg += `❌ Erreur UPSERT (Écriture) : ${upsertErr.message}\n(Code: ${upsertErr.code}, Details: ${upsertErr.details})`;
        setTestResult({ success: false, message: msg });
      } else {
        msg += `✅ UPSERT réussi (Écriture confirmée sans erreur par Supabase !)`;
        setTestResult({ success: true, message: msg });
      }

    } catch (err) {
      setTestResult({
        success: false,
        message: `Exception inattendue : ${err.message || String(err)}`
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const sqlCode = `-- ERREUR 23505 (Conflit de Clé Primaire "id" vs "sync_key")
-- La table actuelle a une mauvaise structure (probablement une colonne 'id' en conflit).
-- Exécutez ce script pour la supprimer et la recréer correctement (aucune donnée locale ne sera perdue) :

DROP TABLE IF EXISTS suisse_prep_data CASCADE;

CREATE TABLE suisse_prep_data (
  sync_key TEXT PRIMARY KEY DEFAULT 'suisse2027_default',
  sessions JSONB NOT NULL DEFAULT '[]'::jsonb,
  metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE suisse_prep_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON suisse_prep_data FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON suisse_prep_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON suisse_prep_data FOR UPDATE USING (true);
`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Terminal className="h-6 w-6" />
            <h3 className="text-xl font-black font-display tracking-tight text-white">
              Console de Diagnostic Synchronisation
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* System Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className={`p-4 rounded-2xl border ${
            isSupabaseConfigured 
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300' 
              : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
          }`}>
            <div className="flex items-center gap-2 font-bold mb-1">
              <Database className="h-4 w-4" />
              <span>Configuration Supabase</span>
            </div>
            <p className="text-[11px] opacity-90">
              {isSupabaseConfigured 
                ? '✓ Variables Vercel détectées et configurées.' 
                : '❌ Variables VITE_SUPABASE_URL manquantes sur Vercel.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl border bg-slate-800/80 border-slate-700 text-slate-200">
            <div className="flex items-center gap-2 font-bold mb-1">
              <Key className="h-4 w-4 text-amber-400" />
              <span>Clé d'espace active</span>
            </div>
            <p className="text-[11px] font-bold text-amber-300">
              {currentKey}
            </p>
          </div>
        </div>

        {/* Live Test Button */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-slate-300">Test en direct de la table Supabase</span>
            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {testingConnection ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              <span>Tester la connexion</span>
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl text-xs font-mono border ${
              testResult.success 
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200' 
                : 'bg-rose-950/80 border-rose-800 text-rose-200'
            }`}>
              {testResult.message}
            </div>
          )}
        </div>

        {/* Log History Stack */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            📜 Historique Récent des Événements ({syncLogs.length})
          </h4>

          {syncLogs.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono italic">Aucun événement de synchronisation enregistré pour l'instant.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {syncLogs.map((log, i) => (
                <div key={log.id || i} className={`p-3 rounded-xl text-xs font-mono border ${
                  log.type === 'error' || log.mode === 'local'
                    ? 'bg-rose-950/40 border-rose-900/60 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}>
                  <div className="flex items-center justify-between text-[11px] mb-1 font-bold opacity-80">
                    <span>[{new Date(log.timestamp).toLocaleTimeString()}] {log.title}</span>
                    <span className="uppercase text-[10px]">{log.mode}</span>
                  </div>
                  <p className="text-[11px]">{log.message}</p>
                  {log.errorDetail && (
                    <p className="text-[10px] text-rose-400 mt-1 bg-black/40 p-1.5 rounded break-all">
                      ⚠️ {log.errorDetail}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SQL Schema Copy Script */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              🛠️ Script SQL Supabase (schema.sql)
            </h4>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sqlCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 font-mono border border-slate-700"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copié !' : 'Copier SQL'}</span>
            </button>
          </div>
          <pre className="p-3 bg-black/60 rounded-xl text-[10px] font-mono text-emerald-400 overflow-x-auto border border-slate-800 max-h-36">
            {sqlCode}
          </pre>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800">
          <button
            onClick={onForceSync}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Forcer la re-synchronisation</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}
