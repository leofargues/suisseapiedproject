# Suisse à Pied Tracker

Application de suivi de randonnée ("Suisse à Pied") avec tableau de bord interactif. Ce projet utilise React, Vite, Tailwind CSS, et Supabase.

## Fonctionnalités

- **Tableau de bord interactif :** Visualisation des données avec Chart.js.
- **Interface moderne :** Stylisée avec Tailwind CSS et des icônes Lucide.
- **Backend & Base de données :** Intégration avec Supabase.
- **Performances optimales :** Propulsé par Vite et React.

## Prérequis

- [Node.js](https://nodejs.org/) (version 18+ recommandée)
- Un compte [Supabase](https://supabase.com/) (si vous avez besoin de recréer l'environnement backend)

## Installation et Setup

1. **Cloner le projet** (si ce n'est pas déjà fait) et naviguer dans le dossier du projet :
   ```bash
   cd "Suisse à Pied Tracker"
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Configuration des variables d'environnement :**
   Copiez le fichier `.env.example` (s'il existe) vers un nouveau fichier `.env` et ajoutez vos clés Supabase.
   ```bash
   cp .env.example .env
   ```
   *Assurez-vous de remplir `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.*

4. **Lancer le serveur de développement :**
   ```bash
   npm run dev
   ```
   L'application sera accessible (généralement) sur `http://localhost:5173`.

## Scripts Disponibles

- `npm run dev` : Lance le serveur de développement local.
- `npm run build` : Compile le projet pour la production.
- `npm run preview` : Permet de prévisualiser la version de production en local.
- `npm run lint` : Vérifie la qualité du code avec oxlint.

## Technologies

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)
- [Lucide React](https://lucide.dev/)
