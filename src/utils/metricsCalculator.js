export const calculateMetricProgress = (metric) => {
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

export const calculateGlobalProgress = (metrics) => {
  if (!metrics || metrics.length === 0) return '0.0';

  const totalProgress = metrics.reduce((acc, m) => {
    const current = parseFloat(m.currentValue) || 0;
    let target = parseFloat(m.targetNumericValue);
    if (isNaN(target) || target <= 0) {
      const match = String(m.targetValue || '').match(/([0-9]+(?:\.[0-9]+)?)/);
      target = match ? parseFloat(match[1]) : 0;
    }
    if (target <= 0) return acc;
    const pct = Math.min(100, Math.max(0, (current / target) * 100));
    return acc + pct;
  }, 0);

  const avg = totalProgress / metrics.length;
  return Number.isInteger(avg) ? avg.toString() : avg.toFixed(1);
};

export const calculateVam = (minStr, secStr, fcStr, sacStr) => {
  const min = parseFloat(minStr) || 0;
  const sec = parseFloat(secStr) || 0;
  const totalHours = (min + sec / 60) / 60;
  const fc = parseFloat(fcStr) || 0;
  const sac = parseFloat(sacStr) || 0;

  if (totalHours <= 0) return null;

  const vam = Math.round(500 / totalHours);
  const efficiencyIndex = fc > 0 ? (vam / fc).toFixed(2) : '0';

  return {
    vam,
    efficiencyIndex,
    fcMoy: fc,
    poidsSac: sac,
    tempsTotal: `${min}m ${sec}s`
  };
};

export const calculateCardiacDrift = (fc1Str, fc2Str) => {
  const f1 = parseFloat(fc1Str) || 0;
  const f2 = parseFloat(fc2Str) || 0;
  if (f1 <= 0) return null;
  const driftPct = parseFloat((((f2 - f1) / f1) * 100).toFixed(1));
  return {
    driftPct,
    fc1: f1,
    fc2: f2
  };
};

export const calculateHrr = (fcPeakStr, fc1minStr, fc2minStr) => {
  const peak = parseFloat(fcPeakStr) || 0;
  const f1 = parseFloat(fc1minStr) || 0;
  const f2 = parseFloat(fc2minStr) || 0;
  const delta1 = peak - f1;
  const delta2 = peak - f2;
  return {
    delta1,
    delta2,
    fcPeak: peak,
    fc1min: f1,
    fc2min: f2
  };
};

export const calculateIsometricEndurance = (gMinStr, gSecStr, cMinStr, cSecStr) => {
  const gMin = parseFloat(gMinStr) || 0;
  const gSec = parseFloat(gSecStr) || 0;
  const cMin = parseFloat(cMinStr) || 0;
  const cSec = parseFloat(cSecStr) || 0;
  const totalGainage = gMin * 60 + gSec;
  const totalChaise = cMin * 60 + cSec;
  return {
    totalGainage,
    totalChaise,
    tempsGainageSec: totalGainage,
    tempsChaiseSec: totalChaise
  };
};

export const calculateAcwr = (chargeAigueStr, chargeChroniqueStr) => {
  const aigue = parseFloat(chargeAigueStr) || 0;
  const chronique = parseFloat(chargeChroniqueStr) || 0;
  if (chronique <= 0) return null;
  const acwr = parseFloat((aigue / chronique).toFixed(2));
  return {
    acwr,
    chargeAigue: aigue,
    chargeChronique: chronique
  };
};
