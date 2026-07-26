import React from 'react';
import { TrendingUp, Target, Calendar, Trash2 } from 'lucide-react';
import { Line } from 'react-chartjs-2';

const MetricChart = React.memo(({ activeMetric, pctChange, chartData, chartOptions, history, setDeleteTarget }) => {
  return (
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
  );
});

export default MetricChart;
