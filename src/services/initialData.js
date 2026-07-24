export const DEPARTURE_DATE = "2027-08-01T08:00:00";
export const PREP_START_DATE = "2026-01-01T00:00:00";

export const INITIAL_SESSIONS = [
  // Juillet 2026
  {
    id: "s1",
    date: "2026-07-02",
    title: "Force Bas du corps & Stabilité",
    type: "strength",
    duration: "1h15",
    elevation: "-",
    completed: true,
    notes: "Focus presse à cuisses 4x8 à 175kg + fentes lestées."
  },
  {
    id: "s2",
    date: "2026-07-05",
    title: "Stair Climber - 120 Étages",
    type: "stairclimber",
    duration: "1h00",
    elevation: "Difficulté : 15/30\nÉtages : 120\nTemps Aérobie : 35 min\nTemps Anaérobie : 15 min\nTemps VO2 max : 5 min\nCalories : 520 kcal",
    stairDifficulty: "15",
    stairFloors: "120",
    stairAero: "35",
    stairAnaero: "15",
    stairVo2Max: "5",
    stairCalories: "520",
    completed: true,
    notes: "Fréquence cardiaque moyenne 152 bpm. Excellent contrôle respiratoire."
  },
  {
    id: "s3",
    date: "2026-07-08",
    title: "Marche Lestée Sac 15kg",
    type: "hike",
    duration: "3h30",
    elevation: "920m D+",
    completed: true,
    notes: "Boucle de 14km. Test des nouvelles chaussures de rando."
  },
  {
    id: "s4",
    date: "2026-07-10",
    title: "Récupération & Mobilité Hanches",
    type: "rest",
    duration: "45m",
    elevation: "-",
    completed: true,
    notes: "Auto-massages au rouleau et étirements psoas / mollets."
  },
  {
    id: "s5",
    date: "2026-07-14",
    title: "Bilan Mensuel & Test Planche",
    type: "strength",
    duration: "1h00",
    elevation: "-",
    completed: true,
    notes: "Test planche tenue 3m35s. Nouveau record personnel !"
  },
  {
    id: "s6",
    date: "2026-07-18",
    title: "Stair Climber - Intensive Session",
    type: "stairclimber",
    duration: "2h45",
    elevation: "Difficulté : 18/30\nÉtages : 250\nTemps Aérobie : 90 min\nTemps Anaérobie : 45 min\nTemps VO2 max : 15 min\nCalories : 1250 kcal",
    stairDifficulty: "18",
    stairFloors: "250",
    stairAero: "90",
    stairAnaero: "45",
    stairVo2Max: "15",
    stairCalories: "1250",
    completed: true,
    notes: "Test du rythme de montée avec bâtons. Excellent rythme."
  },
  {
    id: "s7",
    date: "2026-07-21",
    title: "Force & Gainage Lourd",
    type: "strength",
    duration: "1h20",
    elevation: "-",
    completed: true,
    notes: "Presse 180kg 1RM atteint. Gainage latéral 1m30 par côté."
  },
  {
    id: "s8",
    date: "2026-07-25",
    title: "Rando Test Endurance Sac 16kg",
    type: "hike",
    duration: "5h00",
    elevation: "1350m D+",
    completed: false,
    notes: "Objectif 20km en moyenne montagne."
  },
  {
    id: "s9",
    date: "2026-07-28",
    title: "Stair Climber - Intervals VO2 Max",
    type: "stairclimber",
    duration: "1h05",
    elevation: "Difficulté : 22/30\nÉtages : 140\nTemps Aérobie : 30 min\nTemps Anaérobie : 20 min\nTemps VO2 max : 10 min\nCalories : 610 kcal",
    stairDifficulty: "22",
    stairFloors: "140",
    stairAero: "30",
    stairAnaero: "20",
    stairVo2Max: "10",
    stairCalories: "610",
    completed: false,
    notes: "Travail de la VO2 Max."
  },

  // Août 2026
  {
    id: "s10",
    date: "2026-08-02",
    title: "Grande Sortie Massif du Jura",
    type: "hike",
    duration: "6h30",
    elevation: "1600m D+",
    completed: false,
    notes: "Test autonomie nourriture 24h."
  },
  {
    id: "s11",
    date: "2026-08-05",
    title: "Force Réactive & Plyométrie",
    type: "strength",
    duration: "1h10",
    elevation: "-",
    completed: false,
    notes: "Renforcement genoux et cheville pour amorti des descentes."
  }
];

export const INITIAL_METRICS = [
  {
    key: "vam",
    title: "1. Test de Puissance Verticale Standardisé (VAM)",
    shortTitle: "VAM (500m D+)",
    unit: "m/h",
    currentValue: 500,
    targetValue: ">= 600 m/h (Sac 10kg)",
    targetNumericValue: 600,
    protocol: "Sur un segment raide ou tapis à 15%, chronométrez le temps pour gravir 500m D+ à rythme soutenu et fixe. À répéter tous les mois (même sac).",
    description: "Mesure l'évolution de votre puissance aérobie ascensionnelle brute sur une charge de travail fixe (500 m D+).",
    iconName: "Mountain",
    history: [
      { date: "2026-07", value: 500, label: "Juil 26", tempsTotal: "60m 00s", fcMoy: 155, poidsSac: 10, efficiencyIndex: "3.23" }
    ]
  },
  {
    key: "cardiacDrift",
    title: "2. Test de Dérive Cardiaque (Endurance Longue)",
    shortTitle: "Dérive Cardiaque",
    unit: "%",
    currentValue: 8.0,
    targetValue: "< 5.0 %",
    targetNumericValue: 5,
    protocol: "Effort continu de 45 minutes à allure/puissance strictement constante (ex: tapis 10%). Enregistrez la FC continue.",
    description: "Quantifie l'amélioration de votre endurance fondamentale et de votre seuil aérobie sur un effort long (45 min).",
    iconName: "HeartPulse",
    history: [
      { date: "2026-07", value: 8.0, label: "Juil 26", fc1: 140, fc2: 151 }
    ]
  },
  {
    key: "hrr",
    title: "3. Protocole de Récupération Cardiaque (HRR)",
    shortTitle: "Récupération Cardiaque",
    unit: "bpm",
    currentValue: 35,
    targetValue: ">= 45 bpm (à 1 min)",
    targetNumericValue: 45,
    protocol: "À la fin d'un effort intense, arrêtez-vous net et restez totalement immobile pendant 2 minutes sans bouger.",
    description: "Mesure l'efficacité de votre système nerveux autonome et l'optimisation de votre condition cardiovasculaire globale.",
    iconName: "HeartPulse",
    history: [
      { date: "2026-07", value: 35, label: "Juil 26", fcPeak: 175, fc1min: 140, fc2min: 120, delta2min: 55 }
    ]
  },
  {
    key: "isometricEndurance",
    title: "4. Test d'Endurance Musculaire Isométrique",
    shortTitle: "Gainage & Chaise",
    unit: "sec",
    currentValue: 120,
    targetValue: "180s Gainage / 150s Chaise",
    targetNumericValue: 180,
    protocol: "Test de gainage ventral sur coudes (Plank) et chaise murale à 90°. Maintenez la position jusqu'à rupture de posture.",
    description: "Suit l'évolution de la sangle abdominale et des muscles stabilisateurs profonds indispensables pour porter le sac à dos.",
    iconName: "ShieldCheck",
    history: [
      { date: "2026-07", value: 120, label: "Juil 26", tempsGainageSec: 120, tempsChaiseSec: 100 }
    ]
  },
  {
    key: "acwr",
    title: "5. Ratio de Charge d'Entraînement (ACWR)",
    shortTitle: "ACWR",
    unit: "ratio",
    currentValue: 1.1,
    targetValue: "0.8 - 1.3 (Zone Sécurité)",
    targetNumericValue: 1.3,
    protocol: "Multipliez la durée de chaque séance (min) par le RPE (1-10). Charge Aiguë = somme de la semaine. Charge Chronique = moyenne des 4 dernières semaines.",
    description: "Permet d'éviter le surentraînement ou la blessure sur les 12 mois en mesurant l'acceptation de la charge.",
    iconName: "TrendingUp",
    history: [
      { date: "2026-07", value: 1.1, label: "Juil 26", chargeAigue: 1100, chargeChronique: 1000 }
    ]
  }
];

export const CLEAN_EMPTY_METRICS = INITIAL_METRICS.map(m => ({
  ...m,
  currentValue: 0,
  secondaryCurrentValue: 0,
  history: []
}));

export const INITIAL_NOTES = [
  {
    id: "n1",
    date: "2026-07-18",
    title: "Ajustement charge sac à dos & rappel de charge",
    category: "Équipement",
    fatigue: 3,
    content: "Sortie de 1150m D+ au Dent de Vaulion avec 15kg. Les bretelles se comportent très bien. Légère tension dans le bas du dos à partir de 900m D+. Resserrement des ségles de rappel de charge efficace."
  },
  {
    id: "n2",
    date: "2026-07-14",
    title: "Nouveau record gainage & sensations physiques",
    category: "Sensations",
    fatigue: 2,
    content: "Planche tenue 3m35s. Aucune douleur lombaire. Le travail hebdomadaire sur le transverse et les oblique porte ses fruits."
  },
  {
    id: "n3",
    date: "2026-07-05",
    title: "Test stratégie d'hydratation & glucides",
    category: "Nutrition",
    fatigue: 2,
    content: "Validation de 50g glucides/heure en montée soutenue. Digestibilité parfaite des barres d'avoine maison. Pas de coup de barre thermique."
  }
];

export const INITIAL_LOGISTICS = [
  {
    id: "l1",
    name: "Sac à dos 40L",
    quantity: 1,
    completed: false
  },
  {
    id: "l2",
    name: "Tente ultra-légère",
    quantity: 1,
    completed: false
  },
  {
    id: "l3",
    name: "Barres énergétiques",
    quantity: 10,
    completed: false
  }
];
