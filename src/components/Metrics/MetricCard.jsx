import React from 'react';
import { Target, TrendingUp } from 'lucide-react';
import { METRIC_ICONS } from '../../constants/metricsConstants';
import { calculateMetricProgress } from '../../utils/metricsCalculator';

export const MetricCardMobile = React.memo(({ activeMetric }) => {
  if (!activeMetric) return null;
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
});

export const MetricCardDesktop = React.memo(({ metric, isSelected, onSelect }) => {
  const IconComponent = METRIC_ICONS[metric.iconName] || TrendingUp;

  const mHistory = metric.history || [];
  const first = mHistory[0]?.value || metric.currentValue;
  const cardDiff = (metric.currentValue - first).toFixed(1);
  const isPositive = cardDiff >= 0;
  const progress = calculateMetricProgress(metric);

  return (
    <div
      onClick={() => onSelect(metric.key)}
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
});
