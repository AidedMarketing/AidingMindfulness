export function calculateStreak(history) {
  if (history.length === 0) return 0;

  // Sort by date descending
  const dates = [...new Set(
    history.map(s => new Date(s.timestamp).toISOString().split('T')[0])
  )].sort((a, b) => new Date(b) - new Date(a));

  let streak = 0;
  let currentDate = new Date().toISOString().split('T')[0];

  for (let i = 0; i < dates.length; i++) {
    if (dates[i] === currentDate) {
      streak++;
      // Move to previous day
      const date = new Date(currentDate);
      date.setDate(date.getDate() - 1);
      currentDate = date.toISOString().split('T')[0];
    } else {
      break;
    }
  }

  return streak;
}

export function calculateLongestStreak(history) {
  if (history.length === 0) return 0;

  const dates = [...new Set(
    history.map(s => new Date(s.timestamp).toISOString().split('T')[0])
  )].sort();

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
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

export function calculateAverageMoodImprovement(history) {
  const completedSessions = history.filter(s => s.completed && s.moodAfter);

  if (completedSessions.length === 0) return 0;

  const totalImprovement = completedSessions.reduce(
    (sum, s) => sum + (s.moodBefore.intensity - s.moodAfter.intensity),
    0
  );

  return Math.round((totalImprovement / completedSessions.length) * 10) / 10;
}

export function getMostCommonEmotion(history) {
  if (history.length === 0) return null;

  const emotionCounts = {};
  history.forEach(session => {
    const emotion = session.moodBefore.emotion;
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });

  return Object.keys(emotionCounts).reduce((a, b) =>
    emotionCounts[a] > emotionCounts[b] ? a : b
  );
}

export function getMostEffectiveTechnique(history) {
  const techniques = {};

  history.forEach(session => {
    if (!session.completed || !session.moodAfter) return;

    const technique = session.breathingTechnique;
    if (!techniques[technique]) {
      techniques[technique] = {
        count: 0,
        totalImprovement: 0
      };
    }

    techniques[technique].count++;
    techniques[technique].totalImprovement +=
      session.moodBefore.intensity - session.moodAfter.intensity;
  });

  let bestTechnique = null;
  let bestAverage = -Infinity;

  Object.keys(techniques).forEach(technique => {
    const avg = techniques[technique].totalImprovement / techniques[technique].count;
    if (avg > bestAverage) {
      bestAverage = avg;
      bestTechnique = technique;
    }
  });

  return bestTechnique;
}

export function getSessionsByDateRange(history, startDate, endDate) {
  return history.filter(session => {
    const timestamp = new Date(session.timestamp);
    return timestamp >= startDate && timestamp <= endDate;
  });
}

export function getSessionsForMonth(history, year, month) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);
  return getSessionsByDateRange(history, startDate, endDate);
}

export function getStatsForPeriod(history, days = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const recentSessions = history.filter(s =>
    new Date(s.timestamp) >= cutoff
  );

  return {
    totalSessions: recentSessions.length,
    completedSessions: recentSessions.filter(s => s.completed).length,
    avgImprovement: calculateAverageMoodImprovement(recentSessions),
    mostCommonEmotion: getMostCommonEmotion(recentSessions),
    mostEffectiveTechnique: getMostEffectiveTechnique(recentSessions)
  };
}
