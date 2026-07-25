import React, { useState, useEffect } from 'react';
import { Map, MapPin, Navigation, Compass, Mountain, ShieldAlert, Layers, ExternalLink, CheckCircle2, Circle, Calendar, Clock, TrendingUp, TrendingDown, FileText, X, Trash2, Edit3, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icons with robust CDN URLs for React & Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const START_COORD = [46.4312, 6.9107];

const SWISS_STAGES = [
  { id: 1, title: "Étape 1 : Montreux ➔ Rochers de Naye", distance: "13 km", elevationGain: "1 700 m", elevationLoss: "-", difficulty: "Difficile", region: "Vaud", highlights: "Départ (Montreux) : 46.4312° N, 6.9107° E | Arrivée : 46.4339° N, 6.9856° E", completed: false, coords: [46.4339, 6.9856] },
  { id: 2, title: "Étape 2 : Rochers de Naye ➔ Rossinière", distance: "18 km", elevationGain: "250 m", elevationLoss: "-", difficulty: "Facile", region: "Vaud", highlights: "Arrivée : 46.4735° N, 7.0722° E (Étape majoritairement en descente)", completed: false, coords: [46.4735, 7.0722] },
  { id: 3, title: "Étape 3 : Rossinière ➔ L'Étivaz", distance: "15 km", elevationGain: "600 m", elevationLoss: "-", difficulty: "Moyen", region: "Vaud", highlights: "Arrivée : 46.4589° N, 7.1503° E", completed: false, coords: [46.4589, 7.1503] },
  { id: 4, title: "Étape 4 : L'Étivaz ➔ Gstaad", distance: "16 km", elevationGain: "1 000 m", elevationLoss: "-", difficulty: "Moyen", region: "Oberland bernois", highlights: "Arrivée : 46.4741° N, 7.2855° E", completed: false, coords: [46.4741, 7.2855] },
  { id: 5, title: "Étape 5 : Gstaad ➔ Lenk", distance: "21 km", elevationGain: "1 100 m", elevationLoss: "-", difficulty: "Moyen", region: "Oberland bernois", highlights: "Arrivée : 46.4568° N, 7.4475° E", completed: false, coords: [46.4568, 7.4475] },
  { id: 6, title: "Étape 6 : Lenk ➔ Adelboden", distance: "14 km", elevationGain: "1 000 m", elevationLoss: "-", difficulty: "Moyen", region: "Oberland bernois", highlights: "Arrivée : 46.4907° N, 7.5615° E", completed: false, coords: [46.4907, 7.5615] },
  { id: 7, title: "Étape 7 : Adelboden ➔ Kandersteg", distance: "16 km", elevationGain: "1 300 m", elevationLoss: "-", difficulty: "Difficile", region: "Oberland bernois", highlights: "Arrivée : 46.4975° N, 7.6705° E", completed: false, coords: [46.4975, 7.6705] },
  { id: 8, title: "Étape 8 : Kandersteg ➔ Griesalp", distance: "17 km", elevationGain: "1 700 m", elevationLoss: "-", difficulty: "Très difficile", region: "Oberland bernois", highlights: "Arrivée : 46.5413° N, 7.7854° E (Passage du Hohtürli, l'une des ascensions les plus exigeantes)", completed: false, coords: [46.5413, 7.7854] },
  { id: 9, title: "Étape 9 : Griesalp ➔ Lauterbrunnen", distance: "16 km", elevationGain: "1 300 m", elevationLoss: "-", difficulty: "Difficile", region: "Oberland bernois", highlights: "Arrivée : 46.5933° N, 7.9088° E", completed: false, coords: [46.5933, 7.9088] },
  { id: 10, title: "Étape 10 : Lauterbrunnen ➔ Grindelwald", distance: "20 km", elevationGain: "1 300 m", elevationLoss: "-", difficulty: "Difficile", region: "Oberland bernois", highlights: "Arrivée : 46.6242° N, 8.0414° E", completed: false, coords: [46.6242, 8.0414] },
  { id: 11, title: "Étape 11 : Grindelwald ➔ Meiringen", distance: "23 km", elevationGain: "1 100 m", elevationLoss: "-", difficulty: "Moyen", region: "Oberland bernois", highlights: "Arrivée : 46.7291° N, 8.1856° E", completed: false, coords: [46.7291, 8.1856] },
  { id: 12, title: "Étape 12 : Meiringen ➔ Engstlenalp", distance: "16 km", elevationGain: "1 400 m", elevationLoss: "-", difficulty: "Difficile", region: "Oberland bernois", highlights: "Arrivée : 46.7575° N, 8.3908° E", completed: false, coords: [46.7575, 8.3908] },
  { id: 13, title: "Étape 13 : Engstlenalp ➔ Engelberg", distance: "12 km", elevationGain: "400 m", elevationLoss: "-", difficulty: "Facile", region: "Suisse centrale", highlights: "Arrivée : 46.8178° N, 8.4129° E (Courte montée vers le Jochpass, puis longue descente)", completed: false, coords: [46.8178, 8.4129] },
  { id: 14, title: "Étape 14 : Engelberg ➔ Altdorf", distance: "28 km", elevationGain: "1 300 m", elevationLoss: "-", difficulty: "Difficile", region: "Suisse centrale", highlights: "Arrivée : 46.8805° N, 8.6444° E", completed: false, coords: [46.8805, 8.6444] },
  { id: 15, title: "Étape 15 : Altdorf ➔ Urner Boden", distance: "29 km", elevationGain: "1 500 m", elevationLoss: "-", difficulty: "Difficile", region: "Suisse centrale", highlights: "Arrivée : 46.8837° N, 8.9042° E", completed: false, coords: [46.8837, 8.9042] },
  { id: 16, title: "Étape 16 : Urner Boden ➔ Linthal", distance: "10 km", elevationGain: "100 m", elevationLoss: "-", difficulty: "Facile", region: "Suisse orientale", highlights: "Arrivée : 46.9248° N, 8.9982° E (Étape presque exclusivement en descente)", completed: false, coords: [46.9248, 8.9982] },
  { id: 17, title: "Étape 17 : Linthal ➔ Elm", distance: "23 km", elevationGain: "1 600 m", elevationLoss: "-", difficulty: "Difficile", region: "Suisse orientale", highlights: "Arrivée : 46.9142° N, 9.1793° E", completed: false, coords: [46.9142, 9.1793] },
  { id: 18, title: "Étape 18 : Elm ➔ Weisstannen", distance: "23 km", elevationGain: "1 300 m", elevationLoss: "-", difficulty: "Difficile", region: "Suisse orientale", highlights: "Arrivée : 46.9928° N, 9.3807° E", completed: false, coords: [46.9928, 9.3807] },
  { id: 19, title: "Étape 19 : Weisstannen ➔ Sargans", distance: "13 km", elevationGain: "150 m", elevationLoss: "-", difficulty: "Facile", region: "Suisse orientale", highlights: "Arrivée : 47.0487° N, 9.4443° E (Descente progressive vers la vallée)", completed: false, coords: [47.0487, 9.4443] },
  { id: 20, title: "Étape 20 : Sargans ➔ Gaflei (Vaduz, Liechtenstein)", distance: "18 km", elevationGain: "1 100 m", elevationLoss: "-", difficulty: "Moyen", region: "Liechtenstein", highlights: "Arrivée : 47.1353° N, 9.5361° E", completed: false, coords: [47.1353, 9.5361] }
];

export default function MapSection({ stageLogs: propStageLogs, onUpdateStageLogs }) {
  const [selectedStage, setSelectedStage] = useState(SWISS_STAGES[0]);
  const [mapType, setMapType] = useState('topo'); // 'topo' or 'standard'
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false);

  // Fallback local state if props are not provided
  const [localStageLogs, setLocalStageLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('suisse2027_stage_logs');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const stageLogs = propStageLogs || localStageLogs || {};

  const [activeModalStage, setActiveModalStage] = useState(null);
  const [formData, setFormData] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    realDPlus: '',
    realDMinus: '',
    notes: ''
  });

  const openStageModal = (stage, e) => {
    if (e) e.stopPropagation();
    const existing = stageLogs?.[stage.id];
    if (existing) {
      setFormData({
        startDate: existing.startDate || '',
        startTime: existing.startTime || '',
        endDate: existing.endDate || '',
        endTime: existing.endTime || '',
        realDPlus: existing.realDPlus || '',
        realDMinus: existing.realDMinus || '',
        notes: existing.notes || ''
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        startDate: today,
        startTime: '08:00',
        endDate: today,
        endTime: '16:00',
        realDPlus: stage.elevationGain && stage.elevationGain !== '-' ? stage.elevationGain.replace(/[^0-9]/g, '') : '',
        realDMinus: '',
        notes: ''
      });
    }
    setActiveModalStage(stage);
  };

  const handleSaveStageLog = (e) => {
    e.preventDefault();
    if (!activeModalStage) return;

    const updatedLogs = {
      ...stageLogs,
      [activeModalStage.id]: {
        completed: true,
        startDate: formData.startDate,
        startTime: formData.startTime,
        endDate: formData.endDate,
        endTime: formData.endTime,
        realDPlus: formData.realDPlus,
        realDMinus: formData.realDMinus,
        notes: formData.notes,
        updatedAt: new Date().toISOString()
      }
    };

    if (onUpdateStageLogs) {
      onUpdateStageLogs(updatedLogs);
    } else {
      setLocalStageLogs(updatedLogs);
      localStorage.setItem('suisse2027_stage_logs', JSON.stringify(updatedLogs));
    }
    setActiveModalStage(null);
  };

  const handleDeleteStageLog = (stageId) => {
    const updatedLogs = { ...stageLogs };
    delete updatedLogs[stageId];
    
    if (onUpdateStageLogs) {
      onUpdateStageLogs(updatedLogs);
    } else {
      setLocalStageLogs(updatedLogs);
      localStorage.setItem('suisse2027_stage_logs', JSON.stringify(updatedLogs));
    }
    setActiveModalStage(null);
  };

  const completedCount = Object.keys(stageLogs || {}).length;

  return (
    <div className="space-y-6 relative">
      {/* Header Banner */}
      <div className="bg-white dark:bg-emerald-950/40 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-emerald-800/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 rounded-2xl shrink-0">
              <Map className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                <span>Carte du Parcours & Itinéraire Suisse 2027</span>
                {completedCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 text-xs font-extrabold">
                    {completedCount} / {SWISS_STAGES.length} validées
                  </span>
                )}
              </h2>
              <p className="text-sm text-slate-500 dark:text-emerald-200/70 font-medium">
                Traversée alpine du Nord-Est au Lac Léman (Via Alpina Route 1)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setIsStatsCollapsed(!isStatsCollapsed)}
              className="md:hidden px-3 py-2.5 bg-slate-100 dark:bg-emerald-900/60 hover:bg-slate-200 dark:hover:bg-emerald-900 text-slate-800 dark:text-emerald-200 rounded-2xl text-xs font-bold transition-all border border-slate-200 dark:border-emerald-700/60 flex items-center gap-1.5 shadow-2xs active:scale-95"
              title={isStatsCollapsed ? "Afficher les infos de parcours" : "Réduire les infos de parcours"}
            >
              <span>{isStatsCollapsed ? "Afficher infos" : "Réduire infos"}</span>
              {isStatsCollapsed ? <ChevronDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <ChevronUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
            </button>

            <a
              href="https://map.geo.admin.ch"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-slate-100 dark:bg-emerald-900/60 hover:bg-slate-200 dark:hover:bg-emerald-900 text-slate-800 dark:text-emerald-200 rounded-2xl text-xs font-bold transition-all border border-slate-200 dark:border-emerald-700/60 flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Swisstopo</span>
            </a>
          </div>
        </div>

        {/* Global Route Stats Summary */}
        <div className={`${isStatsCollapsed ? 'hidden md:grid' : 'grid'} grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-emerald-900/40 transition-all duration-300`}>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-200 dark:border-emerald-800/40">
            <div className="text-[11px] font-bold text-slate-500 dark:text-emerald-300/70 uppercase tracking-wider">Distance Totale</div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white font-display mt-0.5">~390 km</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-200 dark:border-emerald-800/40">
            <div className="text-[11px] font-bold text-slate-500 dark:text-emerald-300/70 uppercase tracking-wider">Dénivelé Positif</div>
            <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 font-display mt-0.5">+21 200 m</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-200 dark:border-emerald-800/40">
            <div className="text-[11px] font-bold text-slate-500 dark:text-emerald-300/70 uppercase tracking-wider">Dénivelé Négatif</div>
            <div className="text-lg font-extrabold text-rose-700 dark:text-rose-400 font-display mt-0.5">-21 200 m</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-200 dark:border-emerald-800/40">
            <div className="text-[11px] font-bold text-slate-500 dark:text-emerald-300/70 uppercase tracking-wider">Point Culminant</div>
            <div className="text-lg font-extrabold text-indigo-700 dark:text-indigo-400 font-display mt-0.5">2 778 m</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-emerald-950/40 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-emerald-800/60 overflow-hidden">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                <Compass className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Carte interactive (OpenStreetMap Suisse)</span>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setMapType('topo')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    mapType === 'topo'
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-300'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Relief & Topo
                </button>
              </div>
            </div>

            {/* Embedded OSM Map centered on Switzerland */}
            <div className="relative w-full h-[380px] sm:h-[480px] rounded-2xl overflow-hidden border border-slate-200 dark:border-emerald-900/60 bg-slate-100 dark:bg-slate-900 z-0">
              <MapContainer 
                center={[46.75, 8.2]} 
                zoom={8} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%', zIndex: 0 }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url={mapType === 'topo' ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
                />
                
                {/* Ligne reliant les étapes */}
                <Polyline 
                  positions={[START_COORD, ...SWISS_STAGES.map(s => s.coords)]} 
                  color="#10b981" 
                  weight={4} 
                  opacity={0.8} 
                />
                
                {/* Marqueur de départ */}
                <Marker position={START_COORD}>
                   <Popup>
                      <strong>Départ : Montreux</strong>
                   </Popup>
                </Marker>

                {/* Marqueurs d'arrivées d'étapes */}
                {SWISS_STAGES.map(stage => {
                  const isDone = !!stageLogs?.[stage.id];
                  return (
                    <Marker key={stage.id} position={stage.coords}>
                      <Popup>
                        <strong className="text-emerald-900">{stage.title}</strong><br/>
                        <span className="text-xs text-slate-500">{stage.region}</span>
                        {isDone && (
                          <div className="mt-1 text-xs font-bold text-emerald-700">
                            ✅ Étape effectuée !
                          </div>
                        )}
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              {/* Overlay Badge */}
              <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-emerald-800/60 shadow-md flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-bounce" />
                <span>Zone d'itinéraire : Alpes Suisses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stages List & Selected Stage Detail */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-emerald-950/40 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-emerald-800/60 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-900/60 pb-3">
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                <Navigation className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Étapes Clés du Parcours</span>
              </h3>
              <span className="text-xs font-bold text-slate-500 dark:text-emerald-300/70">
                {SWISS_STAGES.length} sections
              </span>
            </div>

            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1 pb-2 custom-scrollbar">
              {SWISS_STAGES.map((stage, idx) => {
                const isCompleted = !!stageLogs?.[stage.id];
                return (
                  <button
                    key={stage.id}
                    onClick={() => setSelectedStage(stage)}
                    className={`w-full text-left p-3 rounded-2xl transition-all border ${
                      selectedStage.id === stage.id
                        ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/40 dark:border-emerald-500/50 shadow-sm'
                        : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-200 dark:hover:bg-slate-800/50 dark:hover:border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <span className={`flex items-center justify-center h-5 w-5 rounded-full text-[10px] ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="truncate">{stage.title.split(' : ')[1] || stage.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => openStageModal(stage, e)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-400 dark:hover:bg-emerald-800/80'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-emerald-600 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-emerald-400'
                          }`}
                          title={isCompleted ? "Modifier le log de l'étape" : "Valider l'étape"}
                        >
                          {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-emerald-200/60 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-emerald-600" />
                        {stage.distance}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-emerald-200/60">D+ {isCompleted && stageLogs?.[stage.id]?.realDPlus ? `${stageLogs?.[stage.id]?.realDPlus}m (réel)` : stage.elevationGain}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                          : stage.difficulty === 'Facile'
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
                          : stage.difficulty === 'Moyen'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                      }`}>
                        {isCompleted ? 'Validée' : stage.difficulty}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Selected Stage Detail Card */}
          <div className="bg-emerald-900 dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-emerald-800 dark:border-emerald-800/60 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 text-emerald-800/30 dark:text-slate-800/50 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
              <Mountain className="h-32 w-32" />
            </div>
            
            <div className="relative z-10 space-y-4">
              <div>
                <div className="text-emerald-400 font-bold text-xs mb-1 uppercase tracking-wider">{selectedStage.region}</div>
                <h3 className="text-xl font-black font-display text-white leading-tight">
                  {selectedStage.title}
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-950/40 rounded-xl p-3 border border-emerald-800/40">
                  <div className="text-[10px] font-bold text-emerald-400/80 uppercase">Distance</div>
                  <div className="text-sm font-extrabold text-white">{selectedStage.distance}</div>
                </div>
                <div className="bg-emerald-950/40 rounded-xl p-3 border border-emerald-800/40">
                  <div className="text-[10px] font-bold text-emerald-400/80 uppercase">Difficulté</div>
                  <div className="text-sm font-extrabold text-white">{selectedStage.difficulty}</div>
                </div>
              </div>

              {stageLogs?.[selectedStage?.id] && (
                <div className="bg-emerald-950/40 rounded-xl p-3 border border-emerald-500/30">
                  <div className="text-xs font-bold text-emerald-300 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> 
                    <span>Données enregistrées</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    <div>
                      <div className="text-emerald-400/80 mb-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Départ
                      </div>
                      <div className="font-bold text-white mt-0.5">
                        {stageLogs?.[selectedStage?.id]?.startDate || '-'} {stageLogs?.[selectedStage?.id]?.startTime ? `à ${stageLogs?.[selectedStage?.id]?.startTime}` : ''}
                      </div>
                    </div>
                    <div>
                      <div className="text-emerald-400/80 mb-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Arrivée
                      </div>
                      <div className="font-bold text-white mt-0.5">
                        {stageLogs?.[selectedStage?.id]?.endDate || '-'} {stageLogs?.[selectedStage?.id]?.endTime ? `à ${stageLogs?.[selectedStage?.id]?.endTime}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-emerald-400/80 mb-0.5 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-emerald-400" /> D+ Réel
                      </div>
                      <div className="font-extrabold text-white text-xs mt-0.5">
                        {stageLogs?.[selectedStage?.id]?.realDPlus ? `${stageLogs?.[selectedStage?.id]?.realDPlus} m` : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-emerald-400/80 mb-0.5 flex items-center gap-1">
                        <TrendingDown className="h-3 w-3 text-rose-400" /> D- Réel
                      </div>
                      <div className="font-extrabold text-white text-xs mt-0.5">
                        {stageLogs?.[selectedStage?.id]?.realDMinus ? `-${stageLogs?.[selectedStage?.id]?.realDMinus} m` : '-'}
                      </div>
                    </div>
                  </div>

                  {stageLogs?.[selectedStage?.id]?.notes && (
                    <div className="pt-2 border-t border-emerald-800/60 text-[11px]">
                      <div className="text-[10px] text-emerald-400/80 font-bold flex items-center gap-1 mb-0.5">
                        <FileText className="h-3 w-3" /> Note terrain :
                      </div>
                      <p className="text-emerald-100 italic bg-emerald-900/40 p-2 rounded-xl border border-emerald-800/40 leading-relaxed">
                        "{stageLogs?.[selectedStage?.id]?.notes}"
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="pt-2 border-t border-emerald-800/50">
                <button
                  onClick={(e) => openStageModal(selectedStage, e)}
                  className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {stageLogs?.[selectedStage?.id] ? (
                    <>
                      <Edit3 className="h-4 w-4" />
                      Modifier les infos
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Valider cette étape
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Validation/Edit Modal */}
      {activeModalStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-emerald-800/60 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 dark:border-emerald-900/60 flex items-center justify-between bg-slate-50 dark:bg-emerald-950/30">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                {stageLogs?.[activeModalStage?.id] ? 'Modifier l\'étape' : 'Valider l\'étape'}
              </h3>
              <button 
                onClick={() => setActiveModalStage(null)}
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

              <form id="stage-log-form" onSubmit={handleSaveStageLog} className="space-y-4">
                
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
                    onClick={() => handleDeleteStageLog(activeModalStage.id)}
                    className="px-4 py-2.5 bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 rounded-xl text-sm font-bold hover:bg-rose-200 dark:hover:bg-rose-900/60 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : <div />}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalStage(null)}
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
      )}
    </div>
  );
}
