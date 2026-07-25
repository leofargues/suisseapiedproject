import React, { useState } from 'react';
import { Map, MapPin, Navigation, Compass, Mountain, ShieldAlert, Layers, ExternalLink, CheckCircle2, Circle } from 'lucide-react';

const SWISS_STAGES = [
  {
    id: 1,
    title: "Étape 1 : Vaduz / Sargans ➔ Elm",
    distance: "36 km",
    elevationGain: "+2 150 m",
    elevationLoss: "-1 900 m",
    difficulty: "Difficile",
    region: "Suisse orientale (Glaris)",
    highlights: "Col du Foopass (2223m), arènes tectoniques du Sardona",
    completed: true,
  },
  {
    id: 2,
    title: "Étape 2 : Elm ➔ Altdorf",
    distance: "42 km",
    elevationGain: "+2 600 m",
    elevationLoss: "-2 800 m",
    difficulty: "Très difficile",
    region: "Suisse centrale (Uri)",
    highlights: "Col du Klausenpass (1948m), Vallée de Schächen",
    completed: false,
  },
  {
    id: 3,
    title: "Étape 3 : Altdorf ➔ Engelberg",
    distance: "29 km",
    elevationGain: "+1 850 m",
    elevationLoss: "-1 100 m",
    difficulty: "Moyen",
    region: "Titlis / Obwald",
    highlights: "Surenenpass (2291m), Vue panoramique sur les Spannort",
    completed: false,
  },
  {
    id: 4,
    title: "Étape 4 : Engelberg ➔ Meiringen",
    distance: "34 km",
    elevationGain: "+1 950 m",
    elevationLoss: "-2 200 m",
    difficulty: "Moyen",
    region: "Oberland Bernois",
    highlights: "Jochpass (2207m), Lac de Engstlen",
    completed: false,
  },
  {
    id: 5,
    title: "Étape 5 : Meiringen ➔ Grindelwald / Lauterbrunnen",
    distance: "38 km",
    elevationGain: "+2 400 m",
    elevationLoss: "-2 100 m",
    difficulty: "Difficile",
    region: "Eiger / Jungfrau",
    highlights: "Grosse Scheidegg (1962m), Face nord de l'Eiger",
    completed: false,
  },
  {
    id: 6,
    title: "Étape 6 : Lauterbrunnen ➔ Kandersteg",
    distance: "33 km",
    elevationGain: "+2 100 m",
    elevationLoss: "-1 800 m",
    difficulty: "Difficile",
    region: "Oberland Bernois",
    highlights: "Sefinenfurgge (2612m), Hohtürli (2778m), Lac d'Oeschinen",
    completed: false,
  },
  {
    id: 7,
    title: "Étape 7 : Kandersteg ➔ Montreux (Lac Léman)",
    distance: "48 km",
    elevationGain: "+2 700 m",
    elevationLoss: "-3 400 m",
    difficulty: "Très difficile",
    region: "Valais / Vaud",
    highlights: "Rochers de Naye, Arrivée majestueuse au Lac Léman",
    completed: false,
  }
];

export default function MapSection() {
  const [selectedStage, setSelectedStage] = useState(SWISS_STAGES[0]);
  const [mapType, setMapType] = useState('topo'); // 'topo' or 'standard'

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-emerald-950/40 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-emerald-800/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 rounded-2xl shrink-0">
              <Map className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                Carte du Parcours & Itinéraire Suisse 2027
              </h2>
              <p className="text-sm text-slate-500 dark:text-emerald-200/70 font-medium">
                Traversée alpine du Nord-Est au Lac Léman (Via Alpina Route 1)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <a
              href="https://map.geo.admin.ch"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-slate-100 dark:bg-emerald-900/60 hover:bg-slate-200 dark:hover:bg-emerald-900 text-slate-800 dark:text-emerald-200 rounded-2xl text-xs font-bold transition-all border border-slate-200 dark:border-emerald-700/60 flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Ouvrir Swisstopo</span>
            </a>
          </div>
        </div>

        {/* Global Route Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-emerald-900/40">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-200 dark:border-emerald-800/40">
            <div className="text-[11px] font-bold text-slate-500 dark:text-emerald-300/70 uppercase tracking-wider">Distance Totale</div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white font-display mt-0.5">~390 km</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-200 dark:border-emerald-800/40">
            <div className="text-[11px] font-bold text-slate-500 dark:text-emerald-300/70 uppercase tracking-wider">Dénivelé Positif</div>
            <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 font-display mt-0.5">+23 600 m</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-200 dark:border-emerald-800/40">
            <div className="text-[11px] font-bold text-slate-500 dark:text-emerald-300/70 uppercase tracking-wider">Nombre d'Étapes</div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white font-display mt-0.5">20 cols alpins</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-200 dark:border-emerald-800/40">
            <div className="text-[11px] font-bold text-slate-500 dark:text-emerald-300/70 uppercase tracking-wider">Altitude Max</div>
            <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400 font-display mt-0.5">2 778 m</div>
          </div>
        </div>
      </div>

      {/* Main Map + Stage details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Map Frame */}
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
            <div className="relative w-full h-[380px] sm:h-[480px] rounded-2xl overflow-hidden border border-slate-200 dark:border-emerald-900/60 bg-slate-100 dark:bg-slate-900">
              <iframe
                title="Carte Suisse à Pied"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src="https://www.openstreetmap.org/export/embed.html?bbox=5.9559,45.8180,10.4921,47.8084&amp;layer=mapnik"
                className="w-full h-full filter saturate-[0.95] contrast-[1.02]"
              ></iframe>

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

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {SWISS_STAGES.map((stage) => {
                const isSelected = selectedStage.id === stage.id;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setSelectedStage(stage)}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all border ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700/80 shadow-xs'
                        : 'bg-slate-50/60 dark:bg-emerald-950/20 border-slate-200 dark:border-emerald-900/40 hover:bg-slate-100 dark:hover:bg-emerald-900/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                        {stage.title}
                      </div>
                      {stage.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600 dark:text-emerald-200/80 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-emerald-600" />
                        {stage.distance}
                      </span>
                      <span>D+ {stage.elevationGain}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        stage.difficulty === 'Difficile' || stage.difficulty === 'Très difficile'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {stage.difficulty}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Stage Detail Card */}
          {selectedStage && (
            <div className="bg-emerald-900 text-white rounded-3xl p-5 shadow-lg border border-emerald-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-700">
                  {selectedStage.region}
                </span>
                <span className="text-xs font-semibold text-emerald-200">
                  Étape #{selectedStage.id}
                </span>
              </div>

              <h4 className="text-base font-extrabold font-display leading-snug">
                {selectedStage.title}
              </h4>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800/60">
                  <div className="text-[10px] text-emerald-300/80 font-bold">Distance</div>
                  <div className="text-sm font-extrabold">{selectedStage.distance}</div>
                </div>
                <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800/60">
                  <div className="text-[10px] text-emerald-300/80 font-bold">Dénivelé + / -</div>
                  <div className="text-sm font-extrabold">{selectedStage.elevationGain} / {selectedStage.elevationLoss}</div>
                </div>
              </div>

              <div className="text-xs text-emerald-100/90 pt-1 space-y-1">
                <p className="font-bold text-emerald-300 text-[11px] uppercase tracking-wider">Points forts & Passages :</p>
                <p className="leading-relaxed text-emerald-100">{selectedStage.highlights}</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
