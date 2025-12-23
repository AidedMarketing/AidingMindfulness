import { getEffectiveDate, getDateString, parseDate } from './dateHelpers.js';

/**
 * Calculate current streak from entries
 * @param {Array} entries - Array of { date, emotion }
 * @returns {number}
 */
export function calculateStreak(entries) {
  if (entries.length === 0) return 0;

  // Get unique dates and sort descending
  const dates = [...new Set(entries.map(e => e.date))].sort((a, b) => b.localeCompare(a));

  let streak = 0;
  let currentDate = getEffectiveDate(); // Start with today (accounting for 4am cutoff)

  for (const date of dates) {
    if (date === currentDate) {
      streak++;
      // Move to previous day
      const prevDate = parseDate(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      currentDate = getDateString(prevDate);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate longest streak from entries
 * @param {Array} entries - Array of { date, emotion }
 * @returns {number}
 */
export function calculateLongestStreak(entries) {
  if (entries.length === 0) return 0;

  // Get unique dates and sort ascending
  const dates = [...new Set(entries.map(e => e.date))].sort();

  if (dates.length === 1) return 1;

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = parseDate(dates[i - 1]);
    const currDate = parseDate(dates[i]);
    const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

/**
 * Get total number of entries
 * @param {Array} entries
 * @returns {number}
 */
export function getTotalEntries(entries) {
  return entries.length;
}

/**
 * Get entries for current month
 * @param {Array} entries
 * @returns {number}
 */
export function getEntriesThisMonth(entries) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  return entries.filter(entry => {
    const [year, month] = entry.date.split('-').map(Number);
    return year === currentYear && month === currentMonth;
  }).length;
}

/**
 * Get most common emotion from entries
 * @param {Array} entries
 * @returns {string|null}
 */
export function getMostCommonEmotion(entries) {
  if (entries.length === 0) return null;

  const emotionCounts = {};
  entries.forEach(entry => {
    if (entry.emotion) {
      emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
    }
  });

  if (Object.keys(emotionCounts).length === 0) return null;

  return Object.keys(emotionCounts).reduce((a, b) =>
    emotionCounts[a] > emotionCounts[b] ? a : b
  );
}

/**
 * Get stats for display
 * @param {Array} entries
 * @returns {Object}
 */
export function getStats(entries) {
  return {
    currentStreak: calculateStreak(entries),
    longestStreak: calculateLongestStreak(entries),
    totalEntries: getTotalEntries(entries),
    entriesThisMonth: getEntriesThisMonth(entries),
    mostCommonEmotion: getMostCommonEmotion(entries)
  };
}
