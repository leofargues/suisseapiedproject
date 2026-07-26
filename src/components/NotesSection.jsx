import React, { useState, useMemo } from 'react';
import { NotebookPen, Plus, Flame, Calendar, Trash2, Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const CATEGORIES = ["Tous", "Fatigue", "Équipement", "Sensations", "Nutrition", "Météo"];

const NotesSection = React.memo(() => {
  const { notes, handleAddNote: onAddNote, handleDeleteNote: onDeleteNote } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredNotes = useMemo(() => notes.filter(note => {
    const matchesCategory = selectedCategory === "Tous" || note.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [notes, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      
      <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-emerald-900/60">
          <div>
            <div className="flex items-center space-x-2">
              <NotebookPen className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
              <h3 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                Carnet de Terrain & Fatigue
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 mt-1 font-medium">
              Consignez vos retours d'entraînement, réglages du sac, sensations physiques et état de forme.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start sm:self-auto px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle note</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-800 dark:bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-emerald-950/60 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-emerald-800/80 hover:bg-slate-200 dark:hover:bg-emerald-900/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400" />
            <input
              type="text"
              placeholder="Rechercher une note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredNotes.length > 0 ? (
            filteredNotes.map(note => (
              <div
                key={note.id}
                className="p-5 rounded-2xl bg-white dark:bg-emerald-950/80 border border-slate-200 dark:border-emerald-900/80 shadow-sm hover:border-emerald-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      {note.category}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-300 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      {note.date}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                    {note.title}
                  </h4>

                  <p className="text-xs text-slate-700 dark:text-slate-200 font-medium mt-2 leading-relaxed whitespace-pre-line">
                    {note.content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-emerald-900/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Fatigue :</span>
                    <div className="flex items-center space-x-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Flame 
                          key={i} 
                          className={`h-3.5 w-3.5 ${i < (note.fatigue || 3) ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-800'}`} 
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                    title="Supprimer la note"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-sm text-slate-500 dark:text-slate-400 italic font-medium">
              Aucune note ne correspond à vos critères. Cliquez sur « Nouvelle note » pour ajouter un retour de terrain.
            </div>
          )}
        </div>

      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-emerald-950 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-emerald-800">
            <h3 className="text-lg font-extrabold font-display text-slate-900 dark:text-white mb-1">
              Ajouter une note de terrain
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-300 mb-4 font-medium">
              Consignez vos observations physiques, techniques ou logistiques.
            </p>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                onAddNote({
                  title: formData.get('title'),
                  category: formData.get('category'),
                  fatigue: parseInt(formData.get('fatigue'), 10),
                  content: formData.get('content'),
                  date: new Date().toISOString().slice(0, 10)
                });
                setIsModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Titre de la note
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="ex: Réglage bretelles sac à dos 15kg"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Catégorie
                  </label>
                  <select
                    name="category"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Équipement">Équipement</option>
                    <option value="Fatigue">Fatigue</option>
                    <option value="Sensations">Sensations</option>
                    <option value="Nutrition">Nutrition</option>
                    <option value="Météo">Météo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Niveau de fatigue (1 à 5)
                  </label>
                  <select
                    name="fatigue"
                    defaultValue="3"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="1">1 - Très frais</option>
                    <option value="2">2 - Fatigue légère</option>
                    <option value="3">3 - Fatigue modérée</option>
                    <option value="4">4 - Fatigue soutenue</option>
                    <option value="5">5 - Épuisement total</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Contenu du retour de terrain
                </label>
                <textarea
                  name="content"
                  rows={4}
                  placeholder="Détaillez vos observations, ressentis physiques ou ajustements matériel..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-emerald-900/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-800 dark:bg-emerald-600 text-white hover:bg-emerald-900 dark:hover:bg-emerald-500"
                >
                  Enregistrer la note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
});

export default NotesSection;
