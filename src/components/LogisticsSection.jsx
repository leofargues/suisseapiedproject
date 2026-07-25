import React, { useState } from 'react';
import { Backpack, Plus, Trash2, CheckSquare, Square } from 'lucide-react';

export default function LogisticsSection({ logistics, onAddElement, onToggleElement, onDeleteElement }) {
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    onAddElement({
      name: newItemName.trim(),
      quantity: parseInt(newItemQuantity, 10) || 1,
      completed: false
    });

    setNewItemName('');
    setNewItemQuantity(1);
  };

  const completedCount = logistics.filter(l => l.completed).length;
  const totalCount = logistics.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-emerald-950/40 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-emerald-800/60">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 rounded-2xl">
            <Backpack className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">Checklist de Départ</h2>
            <p className="text-sm text-slate-500 dark:text-emerald-200/70 font-medium">Préparation du matériel et logistique</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-emerald-200/80 uppercase tracking-wider">Progression</span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
              {completedCount} / {totalCount}
            </span>
          </div>
          <div className="h-3 w-full bg-slate-100 dark:bg-emerald-950 rounded-full overflow-hidden border border-slate-200 dark:border-emerald-800/50">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-300 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="Nouvel équipement..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1 min-w-0 px-4 py-3 bg-slate-50 dark:bg-emerald-900/20 border border-slate-200 dark:border-emerald-800/60 rounded-2xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
          />
          <input
            type="number"
            min="1"
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(e.target.value)}
            className="w-12 px-2 py-3 bg-slate-50 dark:bg-emerald-900/20 border border-slate-200 dark:border-emerald-800/60 rounded-2xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium text-center"
          />
          <button
            type="submit"
            disabled={!newItemName.trim()}
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-2xl font-bold transition-colors shadow-md shadow-emerald-900/20 dark:shadow-none flex items-center justify-center shrink-0"
          >
            <Plus className="h-5 w-5" />
          </button>
        </form>

        <div className="space-y-3">
          {logistics.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-emerald-200/60 text-sm font-medium">
              Votre checklist est vide. Ajoutez du matériel ci-dessus.
            </div>
          ) : (
            logistics.map(item => (
              <div 
                key={item.id}
                className={`flex items-center gap-3 p-4 rounded-2xl transition-all border ${
                  item.completed 
                    ? 'bg-slate-50 dark:bg-emerald-950/20 border-slate-200 dark:border-emerald-900/40 opacity-75' 
                    : 'bg-white dark:bg-emerald-900/20 border-slate-200 dark:border-emerald-800/60 shadow-sm'
                }`}
              >
                <button
                  onClick={() => onToggleElement(item.id)}
                  className={`shrink-0 transition-colors ${
                    item.completed ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-300 dark:text-emerald-700/50 hover:text-emerald-400'
                  }`}
                >
                  {item.completed ? <CheckSquare className="h-6 w-6" /> : <Square className="h-6 w-6" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate transition-all ${
                    item.completed ? 'text-slate-400 dark:text-emerald-200/40 line-through' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {item.name}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    item.completed 
                      ? 'bg-slate-100 text-slate-400 dark:bg-emerald-900/30 dark:text-emerald-200/40' 
                      : 'bg-slate-100 text-slate-600 dark:bg-emerald-800/40 dark:text-emerald-200'
                  }`}>
                    x {item.quantity}
                  </span>
                  <button
                    onClick={() => onDeleteElement(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
