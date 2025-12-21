import { ClaudeAPI } from './ClaudeAPI.js';
import { getTimeOfDay, getTimeOfDayFromTimestamp, getDayName } from '../utils/dateHelpers.js';
import { emotions } from '../data/emotions.js';

export class AIRecommendationEngine {
  constructor(storageService) {
    this.storage = storageService;
  }

  getEmotionData(emotionKey) {
    return emotions[emotionKey] || {
      arousal: 'moderate',
      valence: 'negative',
      wheelCategory: 'unknown',
      aiContext: 'User needs emotional regulation'
    };
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
    const { emotion, intensity } = context.currentMood;
    const emotionData = this.getEmotionData(emotion);

    return `You are an expert breathing exercise advisor for "Aiding Mindfulness", a mindfulness app.

CURRENT USER STATE:
- Emotion: ${emotion} (${emotionData.arousal || 'moderate'} arousal, ${emotionData.valence || 'negative'} valence)
- Intensity: ${intensity}/10
- Emotion wheel category: ${emotionData.wheelCategory || 'unknown'}
- Physiological context: ${emotionData.aiContext || 'User needs regulation'}
- Time: ${context.timeOfDay} (${getDayName(context.dayOfWeek)})
- Sessions completed: ${context.totalSessions}
- Current streak: ${context.currentStreak} days
- Recent patterns: ${JSON.stringify(context.patterns, null, 2)}
- Historical effectiveness: ${JSON.stringify(context.effectiveness, null, 2)}

AVAILABLE BREATHING TECHNIQUES:

1. 4-7-8 Breathing (5 min, 8 cycles)
   Physiological Effect: Rapid parasympathetic activation, reduces heart rate & cortisol
   Best For: High arousal negative states (anxiety, panic, anger), sleep preparation
   Contraindications: May be too slow for very-low arousal states (numb, tired)
   Evidence: Reduces sympathetic activation within 4 cycles, lowers blood pressure
   Mechanism: Extended exhale (8s) activates vagus nerve → immediate calming

2. Box Breathing (5 min, 12 cycles)
   Physiological Effect: Autonomic nervous system balance, mental clarity
   Best For: Moderate arousal states (stress, frustration), focus/performance needs
   Contraindications: May feel rigid for positive states, less effective for extreme arousal
   Evidence: Navy SEAL training standard, improves concentration & decision-making
   Mechanism: Equal breath phases (4s each) create equilibrium & cognitive control

3. Coherent Breathing (10 min, 55 cycles)
   Physiological Effect: Optimizes heart rate variability (HRV), builds resilience
   Best For: Low-moderate arousal (calm, grateful, content), daily maintenance, positive states
   Contraindications: May be too long/slow for crisis states, requires patience
   Evidence: 5.5 breaths/min maximizes HRV, improves stress resilience long-term
   Mechanism: Resonant frequency breathing synchronizes cardiovascular & respiratory rhythms

EMOTION WHEEL FRAMEWORK - MATCHING GUIDE:

Fear-based (anxious, worried, overwhelmed):
→ High intensity (7+): 4-7-8 for rapid calming
→ Moderate intensity (4-6): Box for regaining control
→ Low intensity (1-3): Coherent for building confidence

Anger-based (angry, frustrated, irritated):
→ High intensity (7+): 4-7-8 to cool down first
→ Moderate intensity (4-6): Box for perspective & regulation
→ Low intensity (1-3): Coherent for processing & reflection

Sadness-based (sad, lonely, grief):
→ Very low arousal (numb, depleted): Coherent for gentle activation
→ Moderate (4-6): Box or Coherent for emotional resilience
→ Avoid: 4-7-8 may deepen low arousal states

Positive states (calm, grateful, content, hopeful):
→ Always: Coherent to deepen & savor the state
→ High positive arousal: Coherent to channel energy productively
→ Maintenance: Build HRV resilience when feeling good

Overwhelm/Dysregulation:
→ Intensity 8+: Start with 4-7-8 to stabilize
→ After stabilization: Box for control, then Coherent for integration

ADVANCED RECOMMENDATION RULES:

1. AROUSAL MATCHING:
   - High arousal (anxious, angry, overwhelmed) → downregulate with 4-7-8
   - Moderate arousal (stressed, frustrated, restless) → balance with Box
   - Low arousal (sad, tired, numb) → avoid 4-7-8, prefer Coherent or Box
   - Positive states → Coherent to deepen and build resilience

2. TIME OF DAY OPTIMIZATION:
   - Morning (calm/positive) → Coherent for daily practice
   - Morning (negative) → Box for focus & readiness
   - Afternoon (stress/overwhelm) → Box for reset
   - Evening (any negative) → 4-7-8 for wind-down
   - Night (positive) → Coherent for reflection & gratitude

3. PERSONALIZATION (Use historical data):
   - If technique has >70% success rate for this emotion → strongly favor it
   - If user does same emotion repeatedly → acknowledge pattern & recommend prevention
   - If new user → prioritize arousal matching over history
   - If experienced user (10+ sessions) → consider preferences & variety

4. INTENSITY THRESHOLDS:
   - Intensity 8-10 (crisis): 4-7-8 unless low arousal emotion (then Box)
   - Intensity 5-7 (elevated): Box for most, 4-7-8 for fear/anger
   - Intensity 3-4 (mild): Coherent unless specific need
   - Intensity 1-2 (positive/maintenance): Coherent

5. PATTERN DETECTION:
   - Same emotion same day/time → proactive recommendation
   - Declining effectiveness → suggest technique rotation
   - Positive trend → acknowledge & encourage deepening

6. AVOID:
   - Generic recommendations ignoring arousal/valence
   - Recommending same technique >3 sessions in a row (unless highly effective)
   - Ignoring intensity level
   - Toxic positivity language
   - Recommending 4-7-8 for numb/tired states

Return ONLY valid JSON (no markdown, no backticks, no explanation):
{
  "technique": "4-7-8" | "box" | "coherent",
  "reasoning": "One clear sentence explaining physiological/emotional match",
  "personalNote": "One sentence connecting to their history/patterns OR acknowledging their current state",
  "confidence": 0-100
}`;
  }

  getFallbackRecommendation(context) {
    const mood = context.currentMood.emotion;
    const intensity = context.currentMood.intensity;
    const timeOfDay = context.timeOfDay;
    const emotionData = this.getEmotionData(mood);
    const arousal = emotionData.arousal;
    const valence = emotionData.valence;

    // CRISIS STATE: Very high intensity (8-10) → Rapid intervention
    if (intensity >= 8) {
      // High arousal crisis (anxious, angry, overwhelmed) → 4-7-8
      if (arousal.includes('high')) {
        return {
          technique: '4-7-8',
          reasoning: 'Intense emotions need rapid parasympathetic activation',
          personalNote: 'This technique calms your nervous system quickly',
          confidence: 90
        };
      }
      // Low arousal crisis (very sad, numb) → Box for stabilization
      return {
        technique: 'box',
        reasoning: 'Box breathing provides structure and grounding in difficult moments',
        personalNote: 'Focus on the rhythm to regain stability',
        confidence: 85
      };
    }

    // HIGH AROUSAL NEGATIVE (7+): Anxious, Angry, Overwhelmed, Restless
    if (intensity >= 7 && arousal.includes('high') && valence === 'negative') {
      // Evening → 4-7-8 for wind-down
      if (timeOfDay === 'night') {
        return {
          technique: '4-7-8',
          reasoning: 'Evening high arousal needs calming for sleep preparation',
          personalNote: 'Let the extended exhales release the tension',
          confidence: 85
        };
      }
      // Daytime → 4-7-8 for quick calming
      return {
        technique: '4-7-8',
        reasoning: 'High activation needs parasympathetic downregulation',
        personalNote: 'This will help bring you back to baseline quickly',
        confidence: 85
      };
    }

    // MODERATE AROUSAL NEGATIVE (4-7): Stressed, Frustrated
    if (intensity >= 4 && intensity < 7 && arousal.includes('moderate') && valence === 'negative') {
      return {
        technique: 'box',
        reasoning: 'Box breathing creates autonomic balance and mental clarity',
        personalNote: 'The equal rhythm helps regain control and focus',
        confidence: 80
      };
    }

    // LOW AROUSAL NEGATIVE (any intensity): Sad, Lonely, Tired, Numb
    if (arousal.includes('low') && valence === 'negative') {
      // Very low arousal (numb, tired high intensity) → Coherent for gentle activation
      if (['numb', 'tired'].includes(mood) || intensity >= 6) {
        return {
          technique: 'coherent',
          reasoning: 'Gentle rhythmic breathing provides activation without overwhelm',
          personalNote: 'This practice meets you where you are with gentleness',
          confidence: 75
        };
      }
      // Moderate sadness/loneliness → Box or Coherent
      return {
        technique: 'box',
        reasoning: 'Structured breathing builds emotional resilience',
        personalNote: 'Focus helps process difficult emotions',
        confidence: 75
      };
    }

    // POSITIVE STATES (any arousal): Calm, Grateful, Content, Hopeful
    if (valence === 'positive') {
      return {
        technique: 'coherent',
        reasoning: 'Build resilience and deepen positive states with HRV optimization',
        personalNote: 'Great time to strengthen your practice foundation',
        confidence: 85
      };
    }

    // EVENING + ANY NEGATIVE (not caught above)
    if (timeOfDay === 'night' && valence === 'negative' && intensity >= 5) {
      return {
        technique: '4-7-8',
        reasoning: 'Evening practice benefits from sleep-promoting breathing',
        personalNote: 'Perfect for transitioning into rest mode',
        confidence: 80
      };
    }

    // MORNING PRACTICE (any state, low-moderate intensity)
    if (timeOfDay === 'morning' && intensity <= 5) {
      return {
        technique: 'coherent',
        reasoning: 'Morning coherent practice sets a resilient tone for your day',
        personalNote: 'Daily practice builds long-term nervous system regulation',
        confidence: 75
      };
    }

    // DEFAULT FALLBACK → Coherent (safe for most states)
    return {
      technique: 'coherent',
      reasoning: 'Coherent breathing is versatile and builds overall resilience',
      personalNote: 'A solid foundation practice for any emotional state',
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
