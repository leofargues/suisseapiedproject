import { useState, useMemo } from 'react';

export function useMetrics(metrics = [], darkMode = false) {
  const [selectedMetricKey, setSelectedMetricKey] = useState(metrics[0]?.key || 'vam');
  const [activeModalMetric, setActiveModalMetric] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const activeMetric = useMemo(() => {
    if (!metrics || metrics.length === 0) return null;
    return metrics.find(m => m.key === selectedMetricKey) || metrics[0];
  }, [metrics, selectedMetricKey]);

  const history = useMemo(() => activeMetric?.history || [], [activeMetric]);

  const chartLabels = useMemo(() => history.map(h => h.label), [history]);
  const chartValues = useMemo(() => history.map(h => h.value), [history]);

  const firstValue = history[0]?.value || (activeMetric ? activeMetric.currentValue : 0);
  const latestValue = activeMetric ? activeMetric.currentValue : 0;
  const diff = latestValue - firstValue;
  const pctChange = firstValue ? ((diff / firstValue) * 100).toFixed(1) : 0;

  const chartData = useMemo(() => ({
    labels: chartLabels,
    datasets: [
      {
        label: activeMetric?.title || '',
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
  }), [chartLabels, chartValues, activeMetric?.title, darkMode]);

  const chartOptions = useMemo(() => ({
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
          label: (context) => ` ${context.parsed.y} ${activeMetric?.unit || ''}`
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
  }), [darkMode, activeMetric?.unit]);

  return {
    selectedMetricKey,
    setSelectedMetricKey,
    activeModalMetric,
    setActiveModalMetric,
    deleteTarget,
    setDeleteTarget,
    activeMetric,
    history,
    firstValue,
    latestValue,
    diff,
    pctChange,
    chartData,
    chartOptions
  };
}
