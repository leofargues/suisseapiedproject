import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

export default function AddSessionModal({ defaultDate, sessionToEdit, onClose, onSave }) {
  const isEditing = Boolean(sessionToEdit);
  const [selectedType, setSelectedType] = useState(
    isEditing ? (sessionToEdit.type === 'cardio' ? 'stairclimber' : sessionToEdit.type) : 'stairclimber'
  );

  const parseInitialExercises = (session) => {
    if (!session || !session.exercises) return [''];
    if (Array.isArray(session.exercises)) {
      return session.exercises.length > 0 ? session.exercises : [''];
    }
    if (typeof session.exercises === 'string') {
      const lines = session.exercises.split('\n').map(s => s.trim()).filter(Boolean);
      return lines.length > 0 ? lines : [''];
    }
    return [''];
  };

  const [exerciseList, setExerciseList] = useState(() => parseInitialExercises(sessionToEdit));

  const handleExerciseChange = (index, value) => {
    const updated = [...exerciseList];
    updated[index] = value;
    setExerciseList(updated);
  };

  const handleAddExercise = () => {
    setExerciseList([...exerciseList, '']);
  };

  const handleRemoveExercise = (index) => {
    if (exerciseList.length === 1) {
      setExerciseList(['']);
    } else {
      setExerciseList(exerciseList.filter((_, i) => i !== index));
    }
  };

  const parseDurationComponents = (durationStr) => {
    if (!durationStr) return { hours: 1, minutes: 0 };
    const lower = durationStr.toLowerCase().trim();
    if (lower.includes('h')) {
      const parts = lower.split('h');
      const hours = parseInt(parts[0], 10) || 0;
      const mins = parseInt(parts[1], 10) || 0;
      return { hours, minutes: mins };
    }
    if (lower.includes('m')) {
      const mins = parseInt(lower.replace(/[^0-9]/g, ''), 10) || 0;
      return { hours: 0, minutes: mins };
    }
    const match = lower.match(/\d+/);
    const totalMins = match ? parseInt(match[0], 10) : 60;
    return { hours: Math.floor(totalMins / 60), minutes: totalMins % 60 };
  };

  const initialDuration = parseDurationComponents(sessionToEdit?.duration);
  const [durationHours, setDurationHours] = useState(initialDuration.hours);
  const [durationMinutes, setDurationMinutes] = useState(initialDuration.minutes);

  const getFormattedDuration = (h, m) => {
    const hours = parseInt(h, 10) || 0;
    const mins = parseInt(m, 10) || 0;
    if (hours === 0 && mins === 0) return "30m";
    if (hours === 0) return `${mins}m`;
    return `${hours}h${String(mins).padStart(2, '0')}`;
  };

  // Parse numeric value from string e.g. "850m D+" -> "850", "180 kg" -> "180"
  const getMetricVal = (valStr) => {
    if (!valStr || valStr === '-') return '';
    return valStr.replace(/[^0-9]/g, '');
  };

  const parseTotalMinutes = (durationStr) => {
    if (!durationStr) return 0;
    const lower = durationStr.toLowerCase().trim();
    if (lower.includes('h')) {
      const parts = lower.split('h');
      const hours = parseInt(parts[0], 10) || 0;
      const mins = parseInt(parts[1], 10) || 0;
      return hours * 60 + mins;
    }
    const match = lower.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const date = formData.get('date');
    const title = formData.get('title');
    const type = formData.get('type');
    const duration = getFormattedDuration(durationHours, durationMinutes);
    const notes = formData.get('notes');

    let elevation = '-';
    let treadmillSpeed = '';
    let treadmillIncline = '';
    let treadmillAero = '';
    let treadmillAnaero = '';
    let stairDifficulty = '';
    let stairFloors = '';
    let stairAero = '';
    let stairAnaero = '';
    let stairVo2Max = '';
    let stairCalories = '';
    let hikeElevationPlus = '';
    let hikeElevationMinus = '';
    let hikeDistance = '';
    let hikeWeight = '';

    if (type === 'stairclimber' || type === 'cardio') {
      stairDifficulty = formData.get('stairDifficulty') || '';
      stairFloors = formData.get('stairFloors') || '';
      stairAero = formData.get('stairAero') || '';
      stairAnaero = formData.get('stairAnaero') || '';
      stairVo2Max = formData.get('stairVo2Max') || '';
      stairCalories = formData.get('stairCalories') || '';

      const lines = [];
      if (stairDifficulty !== '') lines.push(`Difficulté : ${stairDifficulty}/30`);
      if (stairFloors !== '') lines.push(`Étages : ${stairFloors}`);
      if (stairAero !== '') lines.push(`Temps Aérobie : ${stairAero} min`);
      if (stairAnaero !== '') lines.push(`Temps Anaérobie : ${stairAnaero} min`);
      if (stairVo2Max !== '') lines.push(`Temps VO2 max : ${stairVo2Max} min`);
      if (stairCalories !== '') lines.push(`Calories : ${stairCalories} kcal`);

      elevation = lines.length > 0 ? lines.join('\n') : '-';
    } else if (type === 'treadmill') {
      treadmillSpeed = formData.get('speed') || '';
      treadmillIncline = formData.get('incline') || '';
      treadmillAero = formData.get('aeroTime') || '';
      treadmillAnaero = formData.get('anaeroTime') || '';

      const aeroMins = parseInt(treadmillAero || '0', 10);
      const anaeroMins = parseInt(treadmillAnaero || '0', 10);
      const totalMins = parseTotalMinutes(duration) || (aeroMins + anaeroMins) || 60;

      const aeroPct = totalMins > 0 ? Math.round((aeroMins / totalMins) * 100) : 0;
      const anaeroPct = totalMins > 0 ? Math.round((anaeroMins / totalMins) * 100) : 0;

      const lines = [];
      if (treadmillSpeed) lines.push(`Vitesse : ${treadmillSpeed} km/h`);
      if (treadmillIncline) lines.push(`Pente : ${treadmillIncline}%`);
      if (aeroMins > 0) lines.push(`Zone Aérobie : ${aeroMins} min (${aeroPct}%)`);
      if (anaeroMins > 0) lines.push(`Zone Anaérobie : ${anaeroMins} min (${anaeroPct}%)`);

      elevation = lines.length > 0 ? lines.join('\n') : '-';
    } else if (type === 'hike') {
      hikeElevationPlus = formData.get('hikeElevationPlus') || '';
      hikeElevationMinus = formData.get('hikeElevationMinus') || '';
      hikeDistance = formData.get('hikeDistance') || '';
      hikeWeight = formData.get('hikeWeight') || '';

      const lines = [];
      if (hikeDistance) lines.push(`Distance : ${hikeDistance} km`);
      if (hikeElevationPlus) lines.push(`D+ : ${hikeElevationPlus}m`);
      if (hikeElevationMinus) lines.push(`D- : ${hikeElevationMinus}m`);
      if (hikeWeight) lines.push(`Lest : ${hikeWeight} kg`);

      elevation = lines.length > 0 ? lines.join('\n') : '-';
    } else {
      const metricInput = formData.get('elevation');
      if (metricInput) {
        if (type === 'strength') {
          elevation = `${metricInput} kg`;
        } else {
          elevation = `${metricInput}`;
        }
      }
    }

    const cleanedExercises = selectedType === 'strength'
      ? exerciseList.map(ex => ex.trim()).filter(ex => ex !== '')
      : [];

    onSave({
      id: isEditing ? sessionToEdit.id : "s_" + Date.now(),
      date,
      title,
      type,
      duration: duration || "1h00",
      elevation,
      treadmillSpeed,
      treadmillIncline,
      treadmillAero,
      treadmillAnaero,
      stairDifficulty,
      stairFloors,
      stairAero,
      stairAnaero,
      stairVo2Max,
      stairCalories,
      hikeElevationPlus,
      hikeElevationMinus,
      hikeDistance,
      hikeWeight,
      exercises: cleanedExercises,
      completed: isEditing ? sessionToEdit.completed : false,
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-emerald-950 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-emerald-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-emerald-900/60">
          <h3 className="text-lg font-extrabold font-display text-slate-900 dark:text-white">
            {isEditing ? "Modifier la séance d'entraînement" : "Planifier une séance d'entraînement"}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Date de la séance
            </label>
            <input
              type="date"
              name="date"
              defaultValue={isEditing ? sessionToEdit.date : (defaultDate || new Date().toISOString().slice(0, 10))}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Titre de la séance
            </label>
            <input
              type="text"
              name="title"
              defaultValue={isEditing ? sessionToEdit.title : ''}
              placeholder={
                selectedType === 'stairclimber' || selectedType === 'cardio'
                  ? "ex: Stair Climber - 150 Étages"
                  : selectedType === 'treadmill'
                    ? "ex: Tapis en pente / Bloc Z2 & Z4"
                    : selectedType === 'strength'
                      ? "ex: Séance Presse & Squat lourd"
                      : "ex: Sortie D+ Dent de Vaulion"
              }
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Type de séance
              </label>
              <select
                name="type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="stairclimber">Stair Climber</option>
                <option value="treadmill">Tapis de marche</option>
                <option value="strength">Musculation / Force</option>
                <option value="hike">Marche Lestée / Rando</option>
                <option value="rest">Repos / Mobilité</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Temps d'entraînement
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseInt(e.target.value, 10))}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Array.from({ length: 13 }).map((_, i) => (
                    <option key={i} value={i}>
                      {i} h
                    </option>
                  ))}
                </select>

                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const m = i * 5;
                    return (
                      <option key={m} value={m}>
                        {String(m).padStart(2, '0')} min
                      </option>
                    );
                  })}
                  {!Array.from({ length: 12 }).some((_, i) => i * 5 === durationMinutes) && (
                    <option value={durationMinutes}>{String(durationMinutes).padStart(2, '0')} min</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* DYNAMIC METRICS INPUT FIELDS */}
          {selectedType === 'stairclimber' || selectedType === 'cardio' ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
              <span className="block text-xs font-extrabold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                ⚡ Paramètres Stair Climber
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Difficulté (0 - 30)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    name="stairDifficulty"
                    defaultValue={isEditing ? (sessionToEdit.stairDifficulty ?? '') : ''}
                    placeholder="ex: 15"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Nombre d'étages
                  </label>
                  <input
                    type="number"
                    name="stairFloors"
                    defaultValue={isEditing ? (sessionToEdit.stairFloors ?? '') : ''}
                    placeholder="ex: 150"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-800 dark:text-slate-200 mb-1 truncate" title="Temps Aérobie">
                    Aérobie (min)
                  </label>
                  <input
                    type="number"
                    name="stairAero"
                    defaultValue={isEditing ? (sessionToEdit.stairAero ?? '') : ''}
                    placeholder="ex: 20"
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-800 dark:text-slate-200 mb-1 truncate" title="Temps Anaérobie">
                    Anaérobie (min)
                  </label>
                  <input
                    type="number"
                    name="stairAnaero"
                    defaultValue={isEditing ? (sessionToEdit.stairAnaero ?? '') : ''}
                    placeholder="ex: 10"
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-800 dark:text-slate-200 mb-1 truncate" title="Temps VO2 max">
                    VO2 max (min)
                  </label>
                  <input
                    type="number"
                    name="stairVo2Max"
                    defaultValue={isEditing ? (sessionToEdit.stairVo2Max ?? '') : ''}
                    placeholder="ex: 5"
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Calories brûlées (kcal)
                </label>
                <input
                  type="number"
                  name="stairCalories"
                  defaultValue={isEditing ? (sessionToEdit.stairCalories ?? '') : ''}
                  placeholder="ex: 450"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          ) : selectedType === 'treadmill' ? (
            <div className="p-3.5 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 space-y-3">
              <span className="block text-xs font-extrabold text-cyan-900 dark:text-cyan-300 uppercase tracking-wider">
                ⚡ Paramètres Tapis de Marche
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Vitesse (km/h)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="speed"
                    defaultValue={isEditing ? sessionToEdit.treadmillSpeed : ''}
                    placeholder="ex: 5.5"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Inclinaison (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    name="incline"
                    defaultValue={isEditing ? sessionToEdit.treadmillIncline : ''}
                    placeholder="ex: 12"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Temps Aérobie (min)
                  </label>
                  <input
                    type="number"
                    name="aeroTime"
                    defaultValue={isEditing ? sessionToEdit.treadmillAero : ''}
                    placeholder="ex: 40"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Temps Anaérobie (min)
                  </label>
                  <input
                    type="number"
                    name="anaeroTime"
                    defaultValue={isEditing ? sessionToEdit.treadmillAnaero : ''}
                    placeholder="ex: 10"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
          ) : selectedType === 'hike' ? (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-3">
              <span className="block text-xs font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                🎒 Paramètres Marche Lestée / Rando
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Dénivelé + (m D+)
                  </label>
                  <input
                    type="number"
                    name="hikeElevationPlus"
                    defaultValue={isEditing ? (sessionToEdit.hikeElevationPlus ?? getMetricVal(sessionToEdit.elevation)) : ''}
                    placeholder="ex: 850"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Dénivelé - (m D-)
                  </label>
                  <input
                    type="number"
                    name="hikeElevationMinus"
                    defaultValue={isEditing ? (sessionToEdit.hikeElevationMinus ?? '') : ''}
                    placeholder="ex: 850"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="hikeDistance"
                    defaultValue={isEditing ? (sessionToEdit.hikeDistance ?? '') : ''}
                    placeholder="ex: 14.5"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Lest / Poids sac (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    name="hikeWeight"
                    defaultValue={isEditing ? (sessionToEdit.hikeWeight ?? '') : ''}
                    placeholder="ex: 12"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                {selectedType === 'strength' ? (
                  <span>Charge maximale / Poids (kg)</span>
                ) : (
                  <span>Indicateur / Précision</span>
                )}{' '}
                <span className="text-slate-400 font-normal">(Optionnel)</span>
              </label>
              <input
                type="number"
                name="elevation"
                defaultValue={isEditing ? getMetricVal(sessionToEdit.elevation) : ''}
                placeholder={selectedType === 'strength' ? "ex: 180" : "ex: 850"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* EXERCISES SECTION - Strength sessions only */}
          {selectedType === 'strength' && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-emerald-900/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  Exercices <span className="text-slate-400 font-normal">(Optionnel)</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddExercise}
                  className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 bg-emerald-100/70 dark:bg-emerald-950 px-2 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  <span>Ajouter un exercice</span>
                </button>
              </div>

              <div className="space-y-2">
                {exerciseList.map((ex, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 w-4 text-right">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={ex}
                      onChange={(e) => handleExerciseChange(index, e.target.value)}
                      placeholder={`ex: Squat 4x10 @ 100kg`}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-emerald-800/80 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {(exerciseList.length > 1 || ex.trim() !== '') && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(index)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors shrink-0"
                        title="Supprimer l'exercice"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Notes de la séance <span className="text-slate-400 font-normal">(Optionnel)</span>
            </label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={isEditing ? sessionToEdit.notes : ''}
              placeholder="Objectifs de charge, allure ou sensations..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>

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
              {isEditing ? "Enregistrer les modifications" : "Ajouter la séance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
