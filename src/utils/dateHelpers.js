/**
 * Get the effective date accounting for 4am cutoff
 * - Before 4am: counts as previous day
 * - 4am and after: counts as current day
 * @returns {string} Date in YYYY-MM-DD format
 */
export function getEffectiveDate() {
  const now = new Date();
  const hour = now.getHours();

  if (hour < 4) {
    // Before 4am - use yesterday's date
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return getDateString(yesterday);
  }

  return getDateString(now);
}

/**
 * Get date string in YYYY-MM-DD format
 * @param {Date} date
 * @returns {string}
 */
export function getDateString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD string into Date object
 * @param {string} dateString
 * @returns {Date}
 */
export function parseDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get all dates in a month as YYYY-MM-DD strings
 * @param {number} year
 * @param {number} month (0-11, JavaScript month indexing)
 * @returns {string[]}
 */
export function getDatesInMonth(year, month) {
  const dates = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
    dates.push(getDateString(date));
  }

  return dates;
}

/**
 * Get number of days in a month
 * @param {number} year
 * @param {number} month (0-11)
 * @returns {number}
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get the first day of week for a month (0 = Sunday, 6 = Saturday)
 * @param {number} year
 * @param {number} month (0-11)
 * @returns {number}
 */
export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

/**
 * Check if a date string is today (accounting for 4am cutoff)
 * @param {string} dateString - YYYY-MM-DD format
 * @returns {boolean}
 */
export function isEffectiveToday(dateString) {
  return dateString === getEffectiveDate();
}

/**
 * Get the time of day description
 * @returns {string}
 */
export function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 6) return 'late night';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

/**
 * Format a date for display
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format time for display
 * @param {string|Date} date
 * @returns {string}
 */
export function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

/**
 * Get day name from day index
 * @param {number} dayIndex (0 = Sunday)
 * @returns {string}
 */
export function getDayName(dayIndex) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
}

/**
 * Check if two dates are the same day
 * @param {string|Date} date1
 * @param {string|Date} date2
 * @returns {boolean}
 */
export function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
