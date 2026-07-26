import React, { useState } from 'react';
import { X, Calculator } from 'lucide-react';
import { MONTH_OPTIONS, getDefaultMonthValue } from '../../constants/calendarConstants';
import { 
  calculateVam,
  calculateCardiacDrift,
  calculateHrr,
  calculateIsometricEndurance,
  calculateAcwr
} from '../../utils/metricsCalculator';

export default function MetricFormModal({ metric, onClose, onSubmit }) {
  const [selectedMonthValue, setSelectedMonthValue] = useState(getDefaultMonthValue);
  const selectedMonthObj = MONTH_OPTIONS.find(m => m.value === selectedMonthValue) || MONTH_OPTIONS[0];
  const label = selectedMonthObj.label;

  // VAM state
  const [vamMin, setVamMin] = useState('');
  const [vamSec, setVamSec] = useState('0');
  const [vamFc, setVamFc] = useState('');
  const [vamSac, setVamSac] = useState('10');

  // Cardiac Drift state
  const [fc1, setFc1] = useState('');
  const [fc2, setFc2] = useState('');

  // HRR state
  const [fcPeak, setFcPeak] = useState('');
  const [fc1min, setFc1min] = useState('');
  const [fc2min, setFc2min] = useState('');

  // Isometric state
  const [gainageMin, setGainageMin] = useState('');
  const [gainageSec, setGainageSec] = useState('0');
  const [chaiseMin, setChaiseMin] = useState('');
  const [chaiseSec, setChaiseSec] = useState('0');

  // ACWR state
  const [chargeAigue, setChargeAigue] = useState('');
  const [chargeChronique, setChargeChronique] = useState('');

  // Handlers
  const handleVamSubmit = (e) => {
    e.preventDefault();
    const res = calculateVam(vamMin, vamSec, vamFc, vamSac);
    if (!res) return;
    onSubmit('vam', res.vam, label, {
      date: selectedMonthValue,
      efficiencyIndex: res.efficiencyIndex,
      fcMoy: res.fcMoy,
      poidsSac: res.poidsSac,
      tempsTotal: res.tempsTotal
    });
  };

  const handleDriftSubmit = (e) => {
    e.preventDefault();
    const res = calculateCardiacDrift(fc1, fc2);
    if (!res) return;
    onSubmit('cardiacDrift', res.driftPct, label, { date: selectedMonthValue, fc1: res.fc1, fc2: res.fc2 });
  };

  const handleHrrSubmit = (e) => {
    e.preventDefault();
    const res = calculateHrr(fcPeak, fc1min, fc2min);
    onSubmit('hrr', res.delta1, label, { date: selectedMonthValue, fcPeak: res.fcPeak, fc1min: res.fc1min, fc2min: res.fc2min, delta2min: res.delta2 });
  };

  const handleIsoSubmit = (e) => {
    e.preventDefault();
    const res = calculateIsometricEndurance(gainageMin, gainageSec, chaiseMin, chaiseSec);
    onSubmit('isometricEndurance', res.totalGainage, label, {
      date: selectedMonthValue,
      tempsGainageSec: res.tempsGainageSec,
      tempsChaiseSec: res.tempsChaiseSec
    });
  };

  const handleAcwrSubmit = (e) => {
    e.preventDefault();
    const res = calculateAcwr(chargeAigue, chargeChronique);
    if (!res) return;
    onSubmit('acwr', res.acwr, label, { date: selectedMonthValue, chargeAigue: res.chargeAigue, chargeChronique: res.chargeChronique });
  };

  // Preview computations
  const getPreviewText = () => {
    if (metric.key === 'vam') {
      const res = calculateVam(vamMin, vamSec, vamFc, vamSac);
      if (res) {
        return `VAM calculée : ${res.vam} m/h | Indice d'efficacité : ${res.efficiencyIndex}`;
      }
    } else if (metric.key === 'cardiacDrift') {
      const res = calculateCardiacDrift(fc1, fc2);
      if (res) {
        return `Dérive cardiaque calculée : ${res.driftPct}%`;
      }
    } else if (metric.key === 'hrr') {
      const res = calculateHrr(fcPeak, fc1min, fc2min);
      if (res.fcPeak > 0 && res.fc1min > 0) {
        return `Delta 1 min = -${res.delta1} bpm${res.fc2min > 0 ? ` | Delta 2 min = -${res.delta2} bpm` : ''}`;
      }
    } else if (metric.key === 'isometricEndurance') {
      const res = calculateIsometricEndurance(gainageMin, gainageSec, chaiseMin, chaiseSec);
      if (res.totalGainage > 0 || res.totalChaise > 0) {
        return `Gainage: ${Math.floor(res.totalGainage/60)}m ${res.totalGainage%60}s (${res.totalGainage}s) | Chaise: ${Math.floor(res.totalChaise/60)}m ${res.totalChaise%60}s (${res.totalChaise}s)`;
      }
    } else if (metric.key === 'acwr') {
      const res = calculateAcwr(chargeAigue, chargeChronique);
      if (res) {
        return `ACWR calculé : ${res.acwr}`;
      }
    }
    return null;
  };

  const preview = getPreviewText();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-emerald-950 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-emerald-800 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-emerald-900/60">
          <div>
            <h3 className="text-base font-extrabold font-display text-slate-900 dark:text-white">
              Saisir les données brutes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">
              {metric.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Mois de la mesure (Juillet 2026 — Juillet 2027)
          </label>
          <select
            value={selectedMonthValue}
            onChange={(e) => setSelectedMonthValue(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold cursor-pointer"
          >
            {MONTH_OPTIONS.map(m => (
              <option key={m.value} value={m.value}>
                {m.fullLabel} ({m.label})
              </option>
            ))}
          </select>
        </div>


        {/* 1. VAM FORM */}
        {metric.key === 'vam' && (
          <form onSubmit={handleVamSubmit} className="space-y-4">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-emerald-900/60 space-y-3">
              <span className="block text-xs font-extrabold text-emerald-800 dark:text-emerald-400">
                ⏱️ Chrono pour 500m D+ (15% d'inclinaison)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Minutes
                  </label>
                  <input
                    type="number"
                    placeholder="ex: 48"
                    value={vamMin}
                    onChange={(e) => setVamMin(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Secondes
                  </label>
                  <input
                    type="number"
                    placeholder="ex: 0"
                    value={vamSec}
                    onChange={(e) => setVamSec(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  FC Moyenne (bpm)
                </label>
                <input
                  type="number"
                  placeholder="ex: 152"
                  value={vamFc}
                  onChange={(e) => setVamFc(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Poids du sac (kg)
                </label>
                <input
                  type="number"
                  placeholder="10"
                  value={vamSac}
                  onChange={(e) => setVamSac(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {preview && (
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-xs font-extrabold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>{preview}</span>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-emerald-900/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-800 dark:bg-emerald-600 text-white hover:bg-emerald-900 dark:hover:bg-emerald-500"
              >
                Calculer & Enregistrer
              </button>
            </div>
          </form>
        )}

        {/* 2. CARDIAC DRIFT FORM */}
        {metric.key === 'cardiacDrift' && (
          <form onSubmit={handleDriftSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                FC_1 : FC moyenne tranche 0 à 15 min (bpm)
              </label>
              <input
                type="number"
                placeholder="ex: 140"
                value={fc1}
                onChange={(e) => setFc1(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                FC_2 : FC moyenne tranche 30 à 45 min (bpm)
              </label>
              <input
                type="number"
                placeholder="ex: 148"
                value={fc2}
                onChange={(e) => setFc2(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {preview && (
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-xs font-extrabold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>{preview}</span>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-emerald-900/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-800 dark:bg-emerald-600 text-white hover:bg-emerald-900 dark:hover:bg-emerald-500"
              >
                Calculer & Enregistrer
              </button>
            </div>
          </form>
        )}

        {/* 3. HRR FORM */}
        {metric.key === 'hrr' && (
          <form onSubmit={handleHrrSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                FC_peak : Fréquence maximale avant arrêt (bpm)
              </label>
              <input
                type="number"
                placeholder="ex: 175"
                value={fcPeak}
                onChange={(e) => setFcPeak(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  FC_1min (bpm)
                </label>
                <input
                  type="number"
                  placeholder="ex: 130"
                  value={fc1min}
                  onChange={(e) => setFc1min(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  FC_2min (bpm)
                </label>
                <input
                  type="number"
                  placeholder="ex: 115"
                  value={fc2min}
                  onChange={(e) => setFc2min(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {preview && (
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-xs font-extrabold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>{preview}</span>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-emerald-900/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-800 dark:bg-emerald-600 text-white hover:bg-emerald-900 dark:hover:bg-emerald-500"
              >
                Calculer & Enregistrer
              </button>
            </div>
          </form>
        )}

        {/* 4. ISOMETRIC ENDURANCE FORM */}
        {metric.key === 'isometricEndurance' && (
          <form onSubmit={handleIsoSubmit} className="space-y-4">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-emerald-900/60 space-y-2">
              <span className="block text-xs font-extrabold text-emerald-800 dark:text-emerald-400">
                🧘 Temps Gainage Ventral (Plank)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Minutes
                  </label>
                  <input
                    type="number"
                    placeholder="ex: 3"
                    value={gainageMin}
                    onChange={(e) => setGainageMin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Secondes
                  </label>
                  <input
                    type="number"
                    placeholder="ex: 0"
                    value={gainageSec}
                    onChange={(e) => setGainageSec(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-emerald-900/60 space-y-2">
              <span className="block text-xs font-extrabold text-emerald-800 dark:text-emerald-400">
                🪑 Temps Chaise Murale 90°
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Minutes
                  </label>
                  <input
                    type="number"
                    placeholder="ex: 2"
                    value={chaiseMin}
                    onChange={(e) => setChaiseMin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Secondes
                  </label>
                  <input
                    type="number"
                    placeholder="ex: 30"
                    value={chaiseSec}
                    onChange={(e) => setChaiseSec(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {preview && (
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-xs font-extrabold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>{preview}</span>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-emerald-900/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-800 dark:bg-emerald-600 text-white hover:bg-emerald-900 dark:hover:bg-emerald-500"
              >
                Enregistrer le bilan
              </button>
            </div>
          </form>
        )}

        {/* 5. ACWR FORM */}
        {metric.key === 'acwr' && (
          <form onSubmit={handleAcwrSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Charge Aiguë (Cumul de la semaine en cours : Durée x RPE)
              </label>
              <input
                type="number"
                placeholder="ex: 1100"
                value={chargeAigue}
                onChange={(e) => setChargeAigue(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Charge Chronique (Moyenne des 4 semaines précédentes)
              </label>
              <input
                type="number"
                placeholder="ex: 1000"
                value={chargeChronique}
                onChange={(e) => setChargeChronique(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {preview && (
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-xs font-extrabold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>{preview}</span>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-emerald-900/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-800 dark:bg-emerald-600 text-white hover:bg-emerald-900 dark:hover:bg-emerald-500"
              >
                Calculer & Enregistrer
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
