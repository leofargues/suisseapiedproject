import React from 'react';
import { CheckCircle2, X, Calendar, Clock, TrendingUp, TrendingDown, Trash2, Check } from 'lucide-react';

export default function StageValidationModal({
  activeModalStage,
  stageLogs,
  formData,
  setFormData,
  onSave,
  onDelete,
  onClose
}) {
  if (!activeModalStage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-emerald-800/60 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 dark:border-emerald-900/60 flex items-center justify-between bg-slate-50 dark:bg-emerald-950/30">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            {stageLogs?.[activeModalStage?.id] ? 'Modifier l\'étape' : 'Valider l\'étape'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
          <div className="mb-4 pb-4 border-b border-slate-100 dark:border-emerald-900/60">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              {activeModalStage.title}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Dénivelé prévu : <strong className="text-slate-800 dark:text-slate-200">{activeModalStage.elevationGain}</strong>
            </div>
          </div>

          <form id="stage-log-form" onSubmit={onSave} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date de départ</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="date" 
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-emerald-900/60 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Heure de départ</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="time" 
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-emerald-900/60 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date d'arrivée</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="date" 
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-emerald-900/60 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Heure d'arrivée</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="time" 
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-emerald-900/60 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">D+ Réel (m)</label>
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <input 
                    type="number" 
                    placeholder={activeModalStage.elevationGain.replace(/[^0-9]/g, '')}
                    value={formData.realDPlus}
                    onChange={(e) => setFormData({...formData, realDPlus: e.target.value})}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-emerald-900/60 rounded-xl text-sm font-bold text-emerald-700 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">D- Réel (m)</label>
                <div className="relative">
                  <TrendingDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500" />
                  <input 
                    type="number" 
                    placeholder="Ex: 800"
                    value={formData.realDMinus}
                    onChange={(e) => setFormData({...formData, realDMinus: e.target.value})}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-emerald-900/60 rounded-xl text-sm font-bold text-rose-700 dark:text-rose-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notes / État du terrain (Optionnel)</label>
              <textarea 
                rows={3}
                placeholder="Météo, fatigue, points d'eau, rencontres..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-emerald-900/60 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

          </form>
        </div>
        
        <div className="p-4 border-t border-slate-100 dark:border-emerald-900/60 bg-slate-50 dark:bg-slate-900/50">
          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-emerald-900/60 gap-3">
            {stageLogs?.[activeModalStage?.id] ? (
              <button
                type="button"
                onClick={() => onDelete(activeModalStage.id)}
                className="px-4 py-2.5 bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 rounded-xl text-sm font-bold hover:bg-rose-200 dark:hover:bg-rose-900/60 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="stage-log-form"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
