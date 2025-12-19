import { ClaudeAPI } from './ClaudeAPI.js';
import { getTimeOfDay, getTimeOfDayFromTimestamp, getDayName } from '../utils/dateHelpers.js';

export class AIRecommendationEngine {
  constructor(storageService) {
    this.storage = storageService;
  }

  async getRecommendation(currentMood) {
    // Gather context
    const context = await this.gatherContext(currentMood);

    // Try AI recommendation first
    try {
      const aiRec = await this.getAIRecommendation(context);
      return aiRec;
    } catch (error) {
      console.warn('AI recommendation failed, using fallback', error);
      return this.getFallbackRecommendation(context);
    }
  }

  async gatherContext(currentMood) {
    const history = await this.storage.getAllSessions();

    return {
      currentMood: currentMood,
      timeOfDay: getTimeOfDay(),
      dayOfWeek: new Date().getDay(),
      recentSessions: this.getRecentSessions(history, 7),
      effectiveness: this.calculateEffectiveness(history),
      patterns: this.analyzePatterns(history),
      totalSessions: history.length,
      currentStreak: this.calculateStreak(history)
    };
  }

  async getAIRecommendation(context) {
    const prompt = this.buildPrompt(context);
    const response = await ClaudeAPI.getRecommendation(prompt);
    return JSON.parse(response);
  }

  buildPrompt(context) {
    return `You are a breathing exercise advisor for a mindfulness app called "Aiding Mindfulness".

Current Context:
- Mood: ${context.currentMood.emotion} (intensity: ${context.currentMood.intensity}/10)
- Time: ${context.timeOfDay} (${getDayName(context.dayOfWeek)})
- Sessions completed: ${context.totalSessions}
- Current streak: ${context.currentStreak} days
- Recent patterns: ${JSON.stringify(context.patterns, null, 2)}
- What's worked before: ${JSON.stringify(context.effectiveness, null, 2)}

Available Techniques:
1. 4-7-8 Breathing (5 min, 8 cycles)
   - Best for: acute anxiety, sleep preparation, panic management
   - Mechanism: Activates parasympathetic nervous system
   - Evidence: Reduces heart rate within 4 cycles

2. Box Breathing (5 min, 12 cycles)
   - Best for: stress management, focus, performance situations
   - Mechanism: Creates autonomic balance and mental clarity
   - Evidence: Used by Navy SEALs, improves concentration

3. Coherent Breathing (10 min, 55 cycles)
   - Best for: daily maintenance, building HRV, long-term resilience
   - Mechanism: Optimizes heart rate variability at 5.5 breaths/min
   - Evidence: Improves cognitive function and stress resilience

Recommendation Rules:
- Consider their current emotional state AND intensity
- Factor in time of day (e.g., coherent better for morning routine, 4-7-8 for bedtime)
- Use past effectiveness data - if box breathing consistently works for them when stressed, prioritize it
- Detect patterns (e.g., "stressed every Monday afternoon" → proactive recommendation)
- Balance variety and what works (don't always recommend same technique)
- For first-time users, start with technique that matches mood best
- For experienced users, consider their preferences and history

Return ONLY valid JSON (no markdown, no explanation):
{
  "technique": "4-7-8" | "box" | "coherent",
  "reasoning": "One clear sentence why this is best right now",
  "personalNote": "One sentence connecting to their history or patterns (or encouraging note for first session)",
  "confidence": 0-100
}`;
  }

  getFallbackRecommendation(context) {
    const mood = context.currentMood.emotion;
    const intensity = context.currentMood.intensity;
    const timeOfDay = context.timeOfDay;

    // High-intensity emotions → 4-7-8
    if (intensity >= 7 && ['anxious', 'stressed'].includes(mood)) {
      return {
        technique: '4-7-8',
        reasoning: 'High intensity requires quick parasympathetic activation',
        personalNote: 'This technique works fast for intense feelings',
        confidence: 85
      };
    }

    // Evening + any negative emotion → 4-7-8
    if (timeOfDay === 'night' && intensity > 5) {
      return {
        technique: '4-7-8',
        reasoning: 'Evening session benefits from sleep-promoting breathing',
        personalNote: 'Perfect for winding down before rest',
        confidence: 80
      };
    }

    // Stressed/restless + daytime → Box
    if (['stressed', 'restless'].includes(mood) && timeOfDay !== 'night') {
      return {
        technique: 'box',
        reasoning: 'Box breathing brings focus and grounding',
        personalNote: 'Great for regaining control and clarity',
        confidence: 80
      };
    }

    // Morning or calm state → Coherent
    if (timeOfDay === 'morning' || mood === 'calm' || intensity <= 4) {
      return {
        technique: 'coherent',
        reasoning: 'Daily coherent practice builds long-term resilience',
        personalNote: 'Excellent for maintaining balance',
        confidence: 75
      };
    }

    // Default → Coherent
    return {
      technique: 'coherent',
      reasoning: 'Coherent breathing is excellent for overall well-being',
      personalNote: 'A solid choice for most situations',
      confidence: 70
    };
  }

  calculateEffectiveness(history) {
    const techniques = ['4-7-8', 'box', 'coherent'];
    const effectiveness = {};

    techniques.forEach(tech => {
      const sessions = history.filter(s => s.breathingTechnique === tech && s.completed);

      if (sessions.length === 0) {
        effectiveness[tech] = null;
        return;
      }

      const improvements = sessions.map(s =>
        s.moodBefore.intensity - s.moodAfter.intensity
      );

      const avgImprovement = improvements.reduce((a, b) => a + b, 0) / improvements.length;
      const successRate = improvements.filter(i => i > 0).length / sessions.length;

      effectiveness[tech] = {
        timesUsed: sessions.length,
        avgImprovement: Math.round(avgImprovement * 10) / 10,
        successRate: Math.round(successRate * 100),
        lastUsed: sessions[sessions.length - 1].timestamp
      };
    });

    return effectiveness;
  }

  analyzePatterns(history) {
    if (history.length < 3) return {};

    // Group sessions by day of week
    const byDayOfWeek = {};
    history.forEach(session => {
      const day = new Date(session.timestamp).getDay();
      if (!byDayOfWeek[day]) byDayOfWeek[day] = [];
      byDayOfWeek[day].push(session);
    });

    // Find most common emotion per day
    const emotionsByDay = {};
    Object.keys(byDayOfWeek).forEach(day => {
      const emotions = byDayOfWeek[day].map(s => s.moodBefore.emotion);
      emotionsByDay[day] = this.mostCommon(emotions);
    });

    // Group by time of day
    const byTimeOfDay = {};
    history.forEach(session => {
      const time = getTimeOfDayFromTimestamp(session.timestamp);
      if (!byTimeOfDay[time]) byTimeOfDay[time] = [];
      byTimeOfDay[time].push(session);
    });

    return {
      emotionsByDay,
      preferredTimeOfDay: this.mostCommon(Object.keys(byTimeOfDay)),
      mostUsedTechnique: this.mostCommon(history.map(s => s.breathingTechnique))
    };
  }

  getRecentSessions(history, days) {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return history
      .filter(s => new Date(s.timestamp) > cutoff)
      .map(s => ({
        date: new Date(s.timestamp).toISOString().split('T')[0],
        emotion: s.moodBefore.emotion,
        technique: s.breathingTechnique,
        improvement: s.moodBefore.intensity - s.moodAfter?.intensity || 0,
        completed: s.completed
      }));
  }

  calculateStreak(history) {
    if (history.length === 0) return 0;

    // Sort by date descending
    const sorted = history
      .map(s => new Date(s.timestamp).toISOString().split('T')[0])
      .sort((a, b) => new Date(b) - new Date(a));

    // Remove duplicates
    const uniqueDates = [...new Set(sorted)];

    let streak = 0;
    let currentDate = new Date().toISOString().split('T')[0];

    for (let i = 0; i < uniqueDates.length; i++) {
      if (uniqueDates[i] === currentDate) {
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

  mostCommon(arr) {
    if (arr.length === 0) return null;
    const counts = {};
    arr.forEach(item => counts[item] = (counts[item] || 0) + 1);
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }
}
