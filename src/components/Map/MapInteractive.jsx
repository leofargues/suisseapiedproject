import React from 'react';
import { MapPin, Compass } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { START_COORD, SWISS_STAGES } from '../../data/swissStages';

// Fix Leaflet icons with robust CDN URLs for React & Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapInteractive({ mapType, setMapType, stageLogs }) {
  return (
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
  );
}
