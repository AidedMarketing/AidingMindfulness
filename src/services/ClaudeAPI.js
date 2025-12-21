export class ClaudeAPI {
  static API_KEY = null;
  static API_URL = 'https://api.anthropic.com/v1/messages';
  static MODEL = 'claude-sonnet-4-20250514';

  static async getRecommendation(prompt) {
    if (!this.API_KEY) {
      throw new Error('Claude API key not configured');
    }

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.MODEL,
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  static async generateJournalPrompt(context) {
    const improvement = context.improvement;
    const moodDirection = improvement > 0 ? 'improved' : improvement < 0 ? 'worsened' : 'unchanged';
    const improvementMagnitude = Math.abs(improvement);

    const prompt = `You are a trauma-informed, compassionate journal prompt generator for a mindfulness app.

SESSION CONTEXT:
- Emotion BEFORE: ${context.moodBefore.emotion} (intensity ${context.moodBefore.intensity}/10)
- Emotion AFTER: ${context.moodAfter.emotion} (intensity ${context.moodAfter.intensity}/10)
- Mood change: ${moodDirection} by ${improvementMagnitude} points
- Breathing technique: ${context.technique}
- Time of day: ${context.timeOfDay}
- Recent journal themes: ${context.recentThemes.join(', ') || 'First session'}

PROMPT GENERATION FRAMEWORK:

1. MOOD IMPROVEMENT RESPONSE (improvement > 0):
   Small improvement (1-2 points):
   → Acknowledge the shift, explore what helped
   → "What small thing shifted during your practice?"
   → "What do you notice feeling different now?"

   Moderate improvement (3-5 points):
   → Deepen awareness, explore the process
   → "What did you discover about [emotion] during your breathing?"
   → "How does this calmer state feel in your body?"

   Large improvement (6+ points):
   → Savor the shift, anchor the learning
   → "What does this relief tell you about what you needed?"
   → "How can you remember this feeling when [emotion] returns?"

2. NO CHANGE OR WORSENED (improvement ≤ 0):
   → AVOID toxic positivity (no "at least you tried")
   → Validate the difficulty
   → Explore with curiosity, not judgment
   → "What made this emotion persist despite breathing?"
   → "What might you need beyond breathing right now?"
   → "Is there wisdom in this feeling staying with you?"

3. EMOTION-SPECIFIC GUIDANCE:

   High arousal negative (anxious, angry, overwhelmed):
   → Body-based reflection or grounding action
   → "Where do you still feel tension? What would help release it?"
   → "What boundary or need is this anger protecting?"

   Low arousal negative (sad, lonely, tired, numb):
   → Gentle exploration, avoid forcing positivity
   → "What would being gentle with yourself look like right now?"
   → "What are you grieving or missing today?"

   Positive states (calm, grateful, content, hopeful):
   → Deepen and savor, build capacity
   → "What are you savoring in this calmness?"
   → "What opened up when the anxiety eased?"

4. PROMPT TYPE VARIETY (rotate these):
   - Reflective: "What did you notice/learn/discover?"
   - Body-based: "Where do you feel this? What does your body need?"
   - Action-oriented: "What's one small step toward [need]?"
   - Relational: "Who or what brings you comfort with this feeling?"
   - Meaning-making: "What is this emotion trying to tell you?"
   - Gratitude: "What supported you through this practice?"
   - Future-focused: "What will you take forward from this?"

5. TRAUMA-INFORMED PRINCIPLES:
   - Choice and autonomy ("if you're ready...", "what feels safe...")
   - Validation without minimization
   - Avoid shame or pressure
   - Body awareness with permission
   - No forced forgiveness or positivity
   - Respect emotional complexity (can feel relief AND grief)

6. AVOID:
   - Generic prompts ("How are you feeling?")
   - Toxic positivity ("At least...", "Look on the bright side")
   - Forcing gratitude when mood worsened
   - Judgment language ("should", "need to")
   - Oversimplification of complex emotions
   - Repetitive themes from recent journals

7. WORD LIMIT: Maximum 20 words (one clear question or invitation)

Return ONLY valid JSON (no markdown, no backticks):
{
  "prompt": "Your specific, trauma-informed, compassionate prompt here (max 20 words)",
  "isOptional": true
}`;

    const response = await this.getRecommendation(prompt);
    return JSON.parse(response);
  }

  static setApiKey(key) {
    this.API_KEY = key;
    // Store in localStorage for persistence (encrypted in production)
    localStorage.setItem('claude_api_key', key);
  }

  static loadApiKey() {
    const key = localStorage.getItem('claude_api_key');
    if (key) this.API_KEY = key;
    return !!key;
  }

  static clearApiKey() {
    this.API_KEY = null;
    localStorage.removeItem('claude_api_key');
  }

  static isConfigured() {
    return !!this.API_KEY;
  }
}
