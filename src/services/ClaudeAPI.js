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
    const prompt = `You are a compassionate journal prompt generator for a mindfulness app.

Context:
- Mood before breathing: ${context.moodBefore.emotion} (${context.moodBefore.intensity}/10)
- Mood after breathing: ${context.moodAfter.emotion} (${context.moodAfter.intensity}/10)
- Improvement: ${context.improvement} points
- Breathing technique used: ${context.technique}
- Time of day: ${context.timeOfDay}
- Recent journal themes: ${context.recentThemes.join(', ') || 'None yet'}

Generate ONE journal prompt that:
1. Acknowledges their current emotional state and progress
2. Helps them process or understand this emotion deeper
3. Is specific and actionable (not generic like "How are you feeling?")
4. Connects to their breathing practice if relevant
5. Is compassionate and non-judgmental
6. Max 20 words

Return ONLY valid JSON (no markdown):
{
  "prompt": "Your specific, compassionate prompt here",
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
