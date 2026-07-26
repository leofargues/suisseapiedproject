import { useState, useMemo } from 'react';
import { MONTH_NAMES } from '../constants/calendarConstants';
import { getMonday, calculateTotalElevation } from '../utils/sessionUtils';

export function useCalendar(sessions = []) {
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 6, 1));
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | '3days'
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [detailModalSession, setDetailModalSession] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else if (viewMode === '3days') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 3);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else if (viewMode === '3days') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 3);
      setCurrentDate(d);
    }
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleSelectViewMode = (mode) => {
    setViewMode(mode);
    if (mode === 'week' || mode === '3days') {
      setCurrentDate(new Date());
    }
  };

  const dateRangeText = useMemo(() => {
    if (viewMode === 'month') {
      return `${MONTH_NAMES[month]} ${year}`;
    }
    if (viewMode === 'week') {
      const monday = getMonday(currentDate);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      if (monday.getMonth() === sunday.getMonth()) {
        return `${monday.getDate()} - ${sunday.getDate()} ${MONTH_NAMES[monday.getMonth()]} ${monday.getFullYear()}`;
      }
      return `${monday.getDate()} ${MONTH_NAMES[monday.getMonth()].slice(0, 3)}. - ${sunday.getDate()} ${MONTH_NAMES[sunday.getMonth()].slice(0, 3)}. ${sunday.getFullYear()}`;
    }
    if (viewMode === '3days') {
      const day1 = new Date(currentDate);
      const day3 = new Date(currentDate);
      day3.setDate(day1.getDate() + 2);
      if (day1.getMonth() === day3.getMonth()) {
        return `${day1.getDate()} - ${day3.getDate()} ${MONTH_NAMES[day1.getMonth()]} ${day1.getFullYear()}`;
      }
      return `${day1.getDate()} ${MONTH_NAMES[day1.getMonth()].slice(0, 3)}. - ${day3.getDate()} ${MONTH_NAMES[day3.getMonth()].slice(0, 3)}. ${day3.getFullYear()}`;
    }
    return '';
  }, [viewMode, currentDate, month, year]);

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  let startDayIndex = firstDayOfMonth.getDay() - 1;
  if (startDayIndex === -1) startDayIndex = 6;

  const totalDaysInMonth = lastDayOfMonth.getDate();

  const sessionsByDate = useMemo(() => {
    const map = {};
    sessions.forEach(session => {
      if (!map[session.date]) {
        map[session.date] = [];
      }
      map[session.date].push(session);
    });
    return map;
  }, [sessions]);

  const selectedDaySessions = selectedDateStr ? (sessionsByDate[selectedDateStr] || []) : [];

  const monthSessions = useMemo(() => sessions.filter(s => {
    const sDate = new Date(s.date);
    return sDate.getFullYear() === year && sDate.getMonth() === month;
  }), [sessions, year, month]);

  const monthCompletedCount = useMemo(() => monthSessions.filter(s => s.completed).length, [monthSessions]);

  const monthDPlus = useMemo(() => calculateTotalElevation(monthSessions), [monthSessions]);

  const handleDayClick = (dayNumber) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    setSelectedDateStr(dateStr);
  };

  return {
    currentDate,
    viewMode,
    selectedFilter,
    setSelectedFilter,
    selectedDateStr,
    setSelectedDateStr,
    detailModalSession,
    setDetailModalSession,
    year,
    month,
    dateRangeText,
    startDayIndex,
    totalDaysInMonth,
    sessionsByDate,
    selectedDaySessions,
    monthSessions,
    monthCompletedCount,
    monthDPlus,
    handlePrev,
    handleNext,
    handleToday,
    handleSelectViewMode,
    handleDayClick
  };
}
