export const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export const DAYS_OF_WEEK = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export const MONTH_OPTIONS = [
  { value: '2026-07', label: 'Juil 26', fullLabel: 'Juillet 2026' },
  { value: '2026-08', label: 'Août 26', fullLabel: 'Août 2026' },
  { value: '2026-09', label: 'Sept 26', fullLabel: 'Septembre 2026' },
  { value: '2026-10', label: 'Oct 26', fullLabel: 'Octobre 2026' },
  { value: '2026-11', label: 'Nov 26', fullLabel: 'Novembre 2026' },
  { value: '2026-12', label: 'Déc 26', fullLabel: 'Décembre 2026' },
  { value: '2027-01', label: 'Janv 27', fullLabel: 'Janvier 2027' },
  { value: '2027-02', label: 'Févr 27', fullLabel: 'Février 2027' },
  { value: '2027-03', label: 'Mars 27', fullLabel: 'Mars 2027' },
  { value: '2027-04', label: 'Avr 27', fullLabel: 'Avril 2027' },
  { value: '2027-05', label: 'Mai 27', fullLabel: 'Mai 2027' },
  { value: '2027-06', label: 'Juin 27', fullLabel: 'Juin 2027' },
  { value: '2027-07', label: 'Juil 27', fullLabel: 'Juillet 2027' },
];

export const getDefaultMonthValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const currentYM = `${year}-${month}`;
  const found = MONTH_OPTIONS.find(m => m.value === currentYM);
  return found ? found.value : '2026-07';
};
