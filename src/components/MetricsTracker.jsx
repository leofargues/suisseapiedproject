import React, { useState } from 'react';
import { 
  HeartPulse, 
  Mountain, 
  ShieldCheck, 
  Dumbbell, 
  Footprints, 
  TrendingUp, 
  Plus, 
  Target,
  BarChart3,
  Calendar,
  Trash2,
  AlertTriangle,
  X,
  Calculator
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const METRIC_ICONS = {
  HeartPulse: HeartPulse,
  Mountain: Mountain,
  ShieldCheck: ShieldCheck,
  Dumbbell: Dumbbell,
  Footprints: Footprints,
  TrendingUp: TrendingUp
};

const calculateMetricProgress = (metric) => {
  if (!metric) return 0;
  const current = parseFloat(metric.currentValue) || 0;
  const target = parseFloat(metric.targetNumericValue) || 0;

  if (metric.key === 'cardiacDrift') {
    if (current <= 0) return 0;
    if (target <= 0) return 100;
    if (current <= target) return 100;
    return Math.min(100, Math.max(0, Math.round((target / current) * 100)));
  }

  if (metric.key === 'acwr') {
    if (current >= 0.8 && current <= 1.3) return 100;
    if (current < 0.8 && current > 0) return Math.min(100, Math.max(0, Math.round((current / 0.8) * 100)));
    if (current > 1.3) return Math.min(100, Math.max(0, Math.round((1.3 / current) * 100)));
    return 0;
  }

  if (target <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((current / target) * 100)));
};

export default function MetricsTracker({ metrics = [], onAddMetricTest, onDeleteMetricTest, darkMode }) {
  const [selectedMetricKey, setSelectedMetricKey] = useState(metrics[0]?.key || 'vam');
  const [activeModalMetric, setActiveModalMetric] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  if (!metrics || metrics.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-8 text-center text-slate-500 font-medium">
        Aucune métrique disponible.
      </div>
    );
  }

  const activeMetric = metrics.find(m => m.key === selectedMetricKey) || metrics[0];
  const history = activeMetric?.history || [];

  const chartLabels = history.map(h => h.label);
  const chartValues = history.map(h => h.value);

  const firstValue = history[0]?.value || activeMetric.currentValue;
  const latestValue = activeMetric.currentValue;
  const diff = latestValue - firstValue;
  const pctChange = firstValue ? ((diff / firstValue) * 100).toFixed(1) : 0;

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: activeMetric.title,
        data: chartValues,
        borderColor: darkMode ? '#46a463' : '#1b4929',
        backgroundColor: darkMode ? 'rgba(70, 164, 99, 0.2)' : 'rgba(27, 73, 41, 0.1)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: darkMode ? '#46a463' : '#1b4929',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: darkMode ? '#0e1b12' : '#ffffff',
        titleColor: darkMode ? '#f8fafc' : '#0f172a',
        bodyColor: darkMode ? '#46a463' : '#1b4929',
        borderColor: darkMode ? '#1c3624' : '#cbd5e1',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context) => ` ${context.parsed.y} ${activeMetric.unit}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: darkMode ? '#cbd5e1' : '#64748b',
          font: { family: 'Plus Jakarta Sans', weight: 600 }
        }
      },
      y: {
        grid: {
          color: darkMode ? 'rgba(46, 90, 58, 0.35)' : 'rgba(226, 232, 240, 0.8)'
        },
        ticks: {
          color: darkMode ? '#cbd5e1' : '#64748b',
          font: { family: 'Plus Jakarta Sans' }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-emerald-900/60">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
              <h3 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                Suivi des 5 Métriques Physiques
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 mt-1 font-medium">
              Saisie des données brutes avec calculs automatiques (VAM, Dérive Cardiaque, HRR, Gainage, ACWR).
            </p>
          </div>

          <button
            onClick={() => setActiveModalMetric(activeMetric)}
            className="self-start sm:self-auto px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Saisir un nouveau test</span>
          </button>
        </div>

        {/* Mobile Dropdown Metric Selector */}
        <div className="sm:hidden mt-6 space-y-2">
          <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Sélectionner la métrique à consulter :
          </label>
          <select
            value={selectedMetricKey}
            onChange={(e) => setSelectedMetricKey(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-emerald-950 text-slate-900 dark:text-white font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            {metrics.map(m => (
              <option key={m.key} value={m.key}>
                {m.shortTitle}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile Single Card Display (Only selected card) */}
        <div className="sm:hidden mt-4">
          {activeMetric && (() => {
            const IconComponent = METRIC_ICONS[activeMetric.iconName] || TrendingUp;
            const mHistory = activeMetric.history || [];
            const first = mHistory[0]?.value || activeMetric.currentValue;
            const cardDiff = activeMetric.currentValue - first;
            const isPositive = cardDiff >= 0;
            const progress = calculateMetricProgress(activeMetric);

            return (
              <div className="p-5 rounded-2xl bg-emerald-100 dark:bg-emerald-900/80 border border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-600/50 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-emerald-800 text-white">
                      <IconComponent className="h-6 w-6" />
                    </div>

                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                      isPositive 
                        ? 'bg-emerald-200 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                        : 'bg-rose-200 text-rose-950 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    }`}>
                      {isPositive ? `+${cardDiff}` : cardDiff} {activeMetric.unit}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-3">
                    {activeMetric.title}
                  </h4>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-black font-display text-slate-900 dark:text-white">
                        {activeMetric.key === 'isometricEndurance' 
                          ? `${Math.floor(activeMetric.currentValue / 60)}m ${activeMetric.currentValue % 60}s`
                          : activeMetric.currentValue
                        }
                      </span>
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                        {activeMetric.unit}
                      </span>
                    </div>
                    
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1">
                      <Target className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span>{activeMetric.targetValue}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 pt-2.5 border-t border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">Objectif atteint</span>
                      <span className="text-emerald-900 dark:text-emerald-300 font-extrabold">{progress}%</span>
                    </div>
                    <div className="w-full bg-emerald-200/80 dark:bg-emerald-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-emerald-300 dark:border-emerald-800">
                      <div 
                        className="bg-emerald-700 dark:bg-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Desktop / Tablet 5 Cards Grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          {metrics.map(metric => {
            const IconComponent = METRIC_ICONS[metric.iconName] || TrendingUp;
            const isSelected = metric.key === selectedMetricKey;

            const mHistory = metric.history || [];
            const first = mHistory[0]?.value || metric.currentValue;
            const cardDiff = (metric.currentValue - first).toFixed(1);
            const isPositive = cardDiff >= 0;
            const progress = calculateMetricProgress(metric);

            return (
              <div
                key={metric.key}
                onClick={() => setSelectedMetricKey(metric.key)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? 'bg-emerald-100 dark:bg-emerald-900/80 border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-600/50 shadow-sm'
                    : 'bg-white dark:bg-emerald-950/40 border-slate-200 dark:border-emerald-900/60 hover:border-emerald-600 hover:bg-slate-50 dark:hover:bg-emerald-900/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-emerald-800 text-white' : 'bg-slate-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>

                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isPositive 
                        ? 'bg-emerald-200 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                        : 'bg-rose-200 text-rose-950 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    }`}>
                      {isPositive ? `+${cardDiff}` : cardDiff} {metric.unit}
                    </span>
                  </div>

                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mt-3 line-clamp-2">
                    {metric.shortTitle}
                  </h4>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-200 dark:border-emerald-900/60 space-y-2">
                  <div>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-black font-display text-slate-900 dark:text-white">
                        {metric.key === 'isometricEndurance' 
                          ? `${Math.floor(metric.currentValue / 60)}m ${metric.currentValue % 60}s`
                          : metric.currentValue
                        }
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                        {metric.unit}
                      </span>
                    </div>
                    
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 flex items-center gap-1 truncate">
                      <Target className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="truncate">Cible: {metric.targetValue}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-2 border-t border-slate-200/80 dark:border-emerald-900/60 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-500 dark:text-slate-400">Objectif</span>
                      <span className="text-emerald-800 dark:text-emerald-300 font-extrabold">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-emerald-950/90 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-emerald-800/60">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isSelected 
                            ? 'bg-emerald-700 dark:bg-emerald-400' 
                            : 'bg-emerald-600 dark:bg-emerald-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>


        {/* Detailed Graph & Analysis */}
        {activeMetric && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-emerald-900/60 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            <div className="lg:col-span-8 bg-white dark:bg-emerald-950/80 p-5 rounded-2xl border border-slate-200 dark:border-emerald-900/80 shadow-inner flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-extrabold font-display text-slate-900 dark:text-white">
                    Courbe de progression : {activeMetric.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">
                    Évolution sur les derniers bilans mensuels enregistrés.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <TrendingUp className="h-4 w-4" />
                  <span>{pctChange >= 0 ? `+${pctChange}%` : `${pctChange}%`} global</span>
                </div>
              </div>

              <div className="flex-1 min-h-[300px] sm:min-h-[380px] w-full relative">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-100 dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-900/80 space-y-3">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Objectif & Description</span>
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {activeMetric.description}
                </p>

                {activeMetric.protocol && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed">
                    <strong className="text-emerald-900 dark:text-emerald-300 block mb-0.5">📋 Protocole de test :</strong>
                    {activeMetric.protocol}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 dark:border-emerald-900/80">
                  <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Cible 1er août 2027</span>
                  <p className="text-sm font-extrabold text-emerald-800 dark:text-emerald-400 mt-0.5">
                    {activeMetric.targetValue}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-emerald-950 border border-slate-200 dark:border-emerald-900/80 space-y-3">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                    Historique des bilans
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">{history.length} tests</span>
                </h4>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {history.slice().reverse().map((record, revIdx) => {
                    const originalIndex = history.length - 1 - revIdx;

                    let formattedDisplay = `${record.value} ${activeMetric.unit}`;
                    let extraDetail = null;

                    if (activeMetric.key === 'vam') {
                      formattedDisplay = `${record.value} m/h`;
                      if (record.efficiencyIndex || record.fcMoy) {
                        extraDetail = `Indice eff: ${record.efficiencyIndex || '-'} | FC moy: ${record.fcMoy || '-'} bpm | Sac: ${record.poidsSac || '-'} kg`;
                      }
                    } else if (activeMetric.key === 'cardiacDrift') {
                      formattedDisplay = `${record.value}%`;
                      if (record.fc1 && record.fc2) {
                        extraDetail = `FC1 (0-15m): ${record.fc1} bpm ➔ FC2 (30-45m): ${record.fc2} bpm`;
                      }
                    } else if (activeMetric.key === 'hrr') {
                      formattedDisplay = `-${record.value} bpm (1 min)`;
                      if (record.fcPeak) {
                        extraDetail = `Peak: ${record.fcPeak} ➔ 1min: ${record.fc1min}${record.fc2min ? ` | 2min: ${record.fc2min} (-${record.delta2min || (record.fcPeak - record.fc2min)} bpm)` : ''}`;
                      }
                    } else if (activeMetric.key === 'isometricEndurance') {
                      formattedDisplay = `Gainage: ${Math.floor(record.value / 60)}m ${record.value % 60}s`;
                      if (record.tempsChaiseSec !== undefined) {
                        extraDetail = `Chaise murale: ${Math.floor(record.tempsChaiseSec / 60)}m ${record.tempsChaiseSec % 60}s (${record.tempsChaiseSec}s)`;
                      }
                    } else if (activeMetric.key === 'acwr') {
                      formattedDisplay = `Ratio: ${record.value}`;
                      if (record.chargeAigue && record.chargeChronique) {
                        extraDetail = `Charge Aiguë: ${record.chargeAigue} | Charge Chronique: ${record.chargeChronique}`;
                      }
                    }

                    return (
                      <div 
                        key={revIdx}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-emerald-900/60 flex flex-col gap-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{record.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold font-mono text-emerald-800 dark:text-emerald-400">
                              {formattedDisplay}
                            </span>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({
                                metricKey: activeMetric.key,
                                index: originalIndex,
                                label: record.label,
                                valueDisplay: formattedDisplay,
                                unit: activeMetric.unit
                              })}
                              className="p-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                              title="Supprimer la mesure"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        {extraDetail && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            {extraDetail}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {activeModalMetric && (
        <MetricFormModal 
          metric={activeModalMetric}
          onClose={() => setActiveModalMetric(null)}
          onSubmit={(key, val, label, extraData) => {
            onAddMetricTest(key, val, label, extraData);
            setActiveModalMetric(null);
          }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-emerald-950 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-emerald-800 text-slate-900 dark:text-white space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 bg-rose-100 dark:bg-rose-950/80 rounded-2xl shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                  Confirmer la suppression
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  Action destructive
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              Êtes-vous sûr de vouloir supprimer la mesure <strong className="text-slate-900 dark:text-white font-extrabold">{deleteTarget.label}</strong> ({deleteTarget.valueDisplay}) ? Cette action est irréversible.
            </p>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-emerald-900/60">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteMetricTest) {
                    onDeleteMetricTest(deleteTarget.metricKey, deleteTarget.index);
                  }
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const MONTH_OPTIONS = [
  { value: '2026-07', label: 'Juil 26', fullLabel: 'Juillet 2026' },
  { value: '2026-08', label: 'Août 26', fullLabel: 'Août 2026' },
  { value: '2026-09', label: 'Sept 26', fullLabel: 'Septembre 2026' },
  { value: '2026-10', label: 'Oct 26', fullLabel: 'Octobre 2026' },
  { value: '2026-11', label: 'Nov 26', fullLabel: 'Novembre 2026' },
  { value: '2026-12', label: 'Déc 26', fullLabel: 'Décembre 2026' },
  { value: '2027-01', label: 'Janv 27', fullLabel: 'Janvier 2027' },
  { value: '2027-02', label: 'Févr 27', fullLabel: 'Février 2027' },
  { value: '2027-03', label: 'Mars 27', fullLabel: 'Mars 2027' },
  { value: '2027-04', label: 'Avr 27', fullLabel: 'Avril 2027' },
  { value: '2027-05', label: 'Mai 27', fullLabel: 'Mai 2027' },
  { value: '2027-06', label: 'Juin 27', fullLabel: 'Juin 2027' },
  { value: '2027-07', label: 'Juil 27', fullLabel: 'Juillet 2027' },
];

const getDefaultMonthValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const currentYM = `${year}-${month}`;
  const found = MONTH_OPTIONS.find(m => m.value === currentYM);
  return found ? found.value : '2026-07';
};

function MetricFormModal({ metric, onClose, onSubmit }) {
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
    const min = parseFloat(vamMin) || 0;
    const sec = parseFloat(vamSec) || 0;
    const totalHours = (min + sec / 60) / 60;
    const fc = parseFloat(vamFc) || 0;
    const sac = parseFloat(vamSac) || 0;
    if (totalHours <= 0) return;
    const vam = Math.round(500 / totalHours);
    const efficiencyIndex = fc > 0 ? (vam / fc).toFixed(2) : '0';

    onSubmit('vam', vam, label, {
      date: selectedMonthValue,
      efficiencyIndex,
      fcMoy: fc,
      poidsSac: sac,
      tempsTotal: `${min}m ${sec}s`
    });
  };

  const handleDriftSubmit = (e) => {
    e.preventDefault();
    const f1 = parseFloat(fc1) || 0;
    const f2 = parseFloat(fc2) || 0;
    if (f1 <= 0) return;
    const driftPct = parseFloat((((f2 - f1) / f1) * 100).toFixed(1));
    onSubmit('cardiacDrift', driftPct, label, { date: selectedMonthValue, fc1: f1, fc2: f2 });
  };

  const handleHrrSubmit = (e) => {
    e.preventDefault();
    const peak = parseFloat(fcPeak) || 0;
    const f1 = parseFloat(fc1min) || 0;
    const f2 = parseFloat(fc2min) || 0;
    const delta1 = peak - f1;
    const delta2 = peak - f2;
    onSubmit('hrr', delta1, label, { date: selectedMonthValue, fcPeak: peak, fc1min: f1, fc2min: f2, delta2min: delta2 });
  };

  const handleIsoSubmit = (e) => {
    e.preventDefault();
    const gMin = parseFloat(gainageMin) || 0;
    const gSec = parseFloat(gainageSec) || 0;
    const cMin = parseFloat(chaiseMin) || 0;
    const cSec = parseFloat(chaiseSec) || 0;
    const totalGainage = gMin * 60 + gSec;
    const totalChaise = cMin * 60 + cSec;
    onSubmit('isometricEndurance', totalGainage, label, {
      date: selectedMonthValue,
      tempsGainageSec: totalGainage,
      tempsChaiseSec: totalChaise
    });
  };

  const handleAcwrSubmit = (e) => {
    e.preventDefault();
    const aigue = parseFloat(chargeAigue) || 0;
    const chronique = parseFloat(chargeChronique) || 0;
    if (chronique <= 0) return;
    const acwr = parseFloat((aigue / chronique).toFixed(2));
    onSubmit('acwr', acwr, label, { date: selectedMonthValue, chargeAigue: aigue, chargeChronique: chronique });
  };

  // Preview computations
  const getPreviewText = () => {
    if (metric.key === 'vam') {
      const min = parseFloat(vamMin) || 0;
      const sec = parseFloat(vamSec) || 0;
      const totalHours = (min + sec / 60) / 60;
      const fc = parseFloat(vamFc) || 0;
      if (totalHours > 0) {
        const vam = Math.round(500 / totalHours);
        const eff = fc > 0 ? (vam / fc).toFixed(2) : '-';
        return `VAM calculée : ${vam} m/h | Indice d'efficacité : ${eff}`;
      }
    } else if (metric.key === 'cardiacDrift') {
      const f1 = parseFloat(fc1) || 0;
      const f2 = parseFloat(fc2) || 0;
      if (f1 > 0 && f2 > 0) {
        const drift = (((f2 - f1) / f1) * 100).toFixed(1);
        return `Dérive cardiaque calculée : ${drift}%`;
      }
    } else if (metric.key === 'hrr') {
      const peak = parseFloat(fcPeak) || 0;
      const f1 = parseFloat(fc1min) || 0;
      const f2 = parseFloat(fc2min) || 0;
      if (peak > 0 && f1 > 0) {
        const d1 = peak - f1;
        const d2 = f2 > 0 ? peak - f2 : null;
        return `Delta 1 min = -${d1} bpm${d2 !== null ? ` | Delta 2 min = -${d2} bpm` : ''}`;
      }
    } else if (metric.key === 'isometricEndurance') {
      const gMin = parseFloat(gainageMin) || 0;
      const gSec = parseFloat(gainageSec) || 0;
      const cMin = parseFloat(chaiseMin) || 0;
      const cSec = parseFloat(chaiseSec) || 0;
      const tG = gMin * 60 + gSec;
      const tC = cMin * 60 + cSec;
      if (tG > 0 || tC > 0) {
        return `Gainage: ${Math.floor(tG/60)}m ${tG%60}s (${tG}s) | Chaise: ${Math.floor(tC/60)}m ${tC%60}s (${tC}s)`;
      }
    } else if (metric.key === 'acwr') {
      const aigue = parseFloat(chargeAigue) || 0;
      const chronique = parseFloat(chargeChronique) || 0;
      if (chronique > 0) {
        const ratio = (aigue / chronique).toFixed(2);
        return `ACWR calculé : ${ratio}`;
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
