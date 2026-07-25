import React, { useState } from 'react';
import { Map, MapPin, Navigation, Mountain, ExternalLink, CheckCircle2, Circle, Clock, TrendingUp, TrendingDown, FileText, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import MapInteractive from './Map/MapInteractive';
import StageValidationModal from './Map/StageValidationModal';
import { SWISS_STAGES } from '../data/swissStages';

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
          <MapInteractive mapType={mapType} setMapType={setMapType} stageLogs={stageLogs} />
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
      <StageValidationModal
        activeModalStage={activeModalStage}
        stageLogs={stageLogs}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveStageLog}
        onDelete={handleDeleteStageLog}
        onClose={() => setActiveModalStage(null)}
      />
    </div>
  );
}
