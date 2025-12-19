import './styles/main.css';
import { StorageService } from './services/StorageService.js';
import { HapticService } from './services/HapticService.js';
import { ClaudeAPI } from './services/ClaudeAPI.js';
import { AIRecommendationEngine } from './services/AIRecommendationEngine.js';
import { EmotionPicker } from './components/EmotionPicker.js';
import { BreathingVisualizer } from './components/BreathingVisualizer.js';
import { JournalPrompt } from './components/JournalPrompt.js';
import { CalendarView } from './components/CalendarView.js';
import { UpdateNotifier } from './components/UpdateNotifier.js';
import { breathingTechniques } from './data/breathingTechniques.js';
import { emotions } from './data/emotions.js';
import { getTimeOfDay } from './utils/dateHelpers.js';
import { calculateStreak, calculateAverageMoodImprovement } from './utils/analytics.js';

class AidingMindfulnessApp {
  constructor() {
    this.storage = new StorageService();
    this.currentSession = null;
    this.currentView = 'home';
    this.initialized = false;
  }

  async init() {
    try {
      // Initialize storage
      await this.storage.init();

      // Load preferences
      HapticService.loadPreference();
      ClaudeAPI.loadApiKey();

      // Check for first-time user
      const hasSeenOnboarding = await this.storage.getSetting('onboarding_complete', false);
      if (!hasSeenOnboarding) {
        this.showOnboarding();
      } else {
        this.showHome();
      }

      this.initialized = true;

      // Register service worker
      this.registerServiceWorker();

    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Failed to initialize app. Please refresh the page.');
    }
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');

        // Check for updates on page load
        registration.update();

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          newWorker.addEventListener('statechange', () => {
            // When the new service worker is installed and waiting to activate
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is waiting to take over
              console.log('New service worker available');

              // Show update notification
              const updateNotifier = new UpdateNotifier();
              updateNotifier.show(registration);
            }
          });
        });

        // Also check if there's already a waiting service worker
        if (registration.waiting) {
          const updateNotifier = new UpdateNotifier();
          updateNotifier.show(registration);
        }

        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour

      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  }

  showHome() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50';

    container.innerHTML = `
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-5xl font-bold text-gray-900 mb-2">
            🧘 Aiding Mindfulness
          </h1>
          <p class="text-xl text-gray-600">
            AI-powered breathing & journaling
          </p>
        </header>

        <!-- Stats Card -->
        <div class="max-w-md mx-auto mb-8">
          <div class="card">
            <div id="stats-container" class="text-center">
              <div class="animate-pulse">Loading stats...</div>
            </div>
          </div>
        </div>

        <!-- Start Session Button -->
        <div class="max-w-md mx-auto mb-8">
          <button id="start-session-btn" class="btn-primary w-full text-xl py-4">
            Start Session
          </button>
        </div>

        <!-- Calendar -->
        <div class="max-w-2xl mx-auto mb-8">
          <div id="calendar-container"></div>
        </div>

        <!-- Quick Actions -->
        <div class="max-w-md mx-auto grid grid-cols-2 gap-4 mb-8">
          <button id="settings-btn" class="btn-secondary">
            ⚙️ Settings
          </button>
          <button id="history-btn" class="btn-secondary">
            📊 History
          </button>
        </div>
      </div>
    `;

    app.appendChild(container);

    // Load stats and calendar
    this.loadHomeStats();
    this.loadHomeCalendar();

    // Attach event listeners
    document.getElementById('start-session-btn')?.addEventListener('click', () => {
      this.startSession();
    });

    document.getElementById('settings-btn')?.addEventListener('click', () => {
      this.showSettings();
    });

    document.getElementById('history-btn')?.addEventListener('click', () => {
      this.showHistory();
    });

    this.currentView = 'home';
  }

  async loadHomeStats() {
    const container = document.getElementById('stats-container');
    if (!container) return;

    try {
      const sessions = await this.storage.getAllSessions();
      const streak = calculateStreak(sessions);
      const avgImprovement = calculateAverageMoodImprovement(sessions);
      const totalSessions = sessions.filter(s => s.completed).length;

      container.innerHTML = `
        <div class="grid grid-cols-3 gap-4">
          <div>
            <div class="text-3xl font-bold text-primary">${streak}</div>
            <div class="text-sm text-gray-600">Day Streak</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-primary">${totalSessions}</div>
            <div class="text-sm text-gray-600">Sessions</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-primary">${avgImprovement > 0 ? '+' : ''}${avgImprovement}</div>
            <div class="text-sm text-gray-600">Avg Change</div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Failed to load stats:', error);
      container.innerHTML = '<div class="text-gray-500">No sessions yet</div>';
    }
  }

  async loadHomeCalendar() {
    const container = document.getElementById('calendar-container');
    if (!container) return;

    const calendar = new CalendarView({
      storageService: this.storage
    });

    await calendar.show(container);
  }

  async startSession() {
    HapticService.trigger('selection');

    // Reset session state
    this.currentSession = {
      id: null,
      timestamp: new Date().toISOString(),
      moodBefore: null,
      breathingTechnique: null,
      recommendation: null,
      completed: false,
      moodAfter: null,
      improvement: 0,
      journalPrompt: null,
      journalEntry: null
    };

    // Step 1: Mood Check-In (Before)
    await this.getMoodInput(false);
  }

  getMoodInput(isAfter = false) {
    return new Promise((resolve) => {
      const emotionPicker = new EmotionPicker({
        isAfterSession: isAfter,
        onComplete: async (mood) => {
          if (isAfter) {
            this.currentSession.moodAfter = mood;
            this.currentSession.improvement =
              this.currentSession.moodBefore.intensity - mood.intensity;
            await this.getJournalPrompt();
          } else {
            this.currentSession.moodBefore = mood;
            await this.getRecommendation();
          }
          resolve(mood);
        }
      });
      emotionPicker.show();
    });
  }

  async getRecommendation() {
    this.showLoading('Getting your personalized recommendation...');

    try {
      const engine = new AIRecommendationEngine(this.storage);
      const recommendation = await engine.getRecommendation(
        this.currentSession.moodBefore
      );

      this.currentSession.recommendation = recommendation;
      this.showRecommendation(recommendation);

    } catch (error) {
      console.error('Failed to get recommendation:', error);
      this.showError('Failed to get recommendation. Please try again.');
    }
  }

  showRecommendation(recommendation) {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const technique = breathingTechniques[recommendation.technique];

    const container = document.createElement('div');
    container.className = 'page-container bg-gradient-to-br from-teal-50 to-blue-50';

    container.innerHTML = `
      <div class="w-full max-w-2xl mx-auto">
        <div class="card">
          <div class="text-center mb-6">
            <div class="text-6xl mb-4">🎯</div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">
              Recommended: ${technique.name}
            </h2>
            <p class="text-lg text-gray-600 mb-4">
              ${recommendation.reasoning}
            </p>
            <p class="text-primary font-semibold">
              ${recommendation.personalNote}
            </p>
          </div>

          <div class="mb-6 p-4 bg-teal-50 rounded-lg">
            <h3 class="font-semibold text-gray-900 mb-2">What to expect:</h3>
            <ul class="space-y-2 text-gray-700">
              <li>⏱️ Duration: ${Math.floor(technique.duration / 60)} minutes</li>
              <li>🔄 ${technique.cycles} breathing cycles</li>
              <li>📖 ${technique.instructions}</li>
            </ul>
          </div>

          <div class="flex gap-4">
            <button id="start-breathing-btn" class="btn-primary flex-1">
              Start Breathing
            </button>
            <button id="choose-different-btn" class="btn-secondary flex-1">
              Choose Different
            </button>
          </div>
        </div>
      </div>
    `;

    app.appendChild(container);

    document.getElementById('start-breathing-btn')?.addEventListener('click', () => {
      this.currentSession.breathingTechnique = recommendation.technique;
      this.startBreathingSession();
    });

    document.getElementById('choose-different-btn')?.addEventListener('click', () => {
      this.showTechniqueSelector();
    });
  }

  showTechniqueSelector() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'page-container bg-gradient-to-br from-teal-50 to-blue-50';

    const techniquesList = Object.keys(breathingTechniques);

    container.innerHTML = `
      <div class="w-full max-w-2xl mx-auto">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Technique
          </h2>
          <p class="text-gray-600">Select a breathing technique to begin</p>
        </div>

        <div class="space-y-4">
          ${techniquesList.map(key => {
            const technique = breathingTechniques[key];
            return `
              <div class="card hover:shadow-xl transition-shadow cursor-pointer technique-card" data-technique="${key}">
                <h3 class="text-xl font-bold text-gray-900 mb-2">${technique.name}</h3>
                <p class="text-gray-600 mb-3">${technique.description}</p>
                <div class="flex gap-4 text-sm text-gray-500">
                  <span>⏱️ ${Math.floor(technique.duration / 60)} min</span>
                  <span>🔄 ${technique.cycles} cycles</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    app.appendChild(container);

    // Attach click handlers
    container.querySelectorAll('.technique-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const technique = e.currentTarget.dataset.technique;
        this.currentSession.breathingTechnique = technique;
        this.startBreathingSession();
      });
    });
  }

  startBreathingSession() {
    HapticService.trigger('sessionStart');

    const visualizer = new BreathingVisualizer({
      technique: this.currentSession.breathingTechnique,
      onComplete: () => {
        this.currentSession.completed = true;
        this.getMoodInput(true);
      },
      onQuit: async () => {
        this.currentSession.completed = false;
        await this.storage.saveSession(this.currentSession);
        this.showHome();
      }
    });

    visualizer.show();
  }

  async getJournalPrompt() {
    this.showLoading('Generating journal prompt...');

    try {
      const context = {
        moodBefore: this.currentSession.moodBefore,
        moodAfter: this.currentSession.moodAfter,
        improvement: this.currentSession.improvement,
        technique: this.currentSession.breathingTechnique,
        timeOfDay: getTimeOfDay(),
        recentThemes: await this.getRecentJournalThemes()
      };

      let promptData;

      if (ClaudeAPI.isConfigured()) {
        promptData = await ClaudeAPI.generateJournalPrompt(context);
      } else {
        promptData = this.getFallbackJournalPrompt();
      }

      this.currentSession.journalPrompt = promptData.prompt;
      this.showJournalPrompt(promptData);

    } catch (error) {
      console.error('Failed to generate journal prompt:', error);
      const promptData = this.getFallbackJournalPrompt();
      this.currentSession.journalPrompt = promptData.prompt;
      this.showJournalPrompt(promptData);
    }
  }

  getFallbackJournalPrompt() {
    const emotion = this.currentSession.moodBefore.emotion;

    const prompts = {
      anxious: "What triggered this anxiety? What's one thing in your control?",
      stressed: "What's the most important thing right now? What can wait?",
      sad: "What would you tell a friend feeling this way?",
      restless: "What's your body trying to tell you?",
      tired: "What's draining your energy? How can you be gentle with yourself?",
      calm: "What are you grateful for today?"
    };

    return {
      prompt: prompts[emotion] || "How are you feeling after this practice?",
      isOptional: true
    };
  }

  async getRecentJournalThemes() {
    const sessions = await this.storage.getAllSessions();
    const recentSessions = sessions.slice(-5);

    const entries = recentSessions
      .map(s => s.journalEntry)
      .filter(e => e && e.length > 0)
      .join(' ');

    if (entries.length === 0) return [];

    // Basic keyword extraction
    const words = entries.toLowerCase().split(/\s+/);
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'i', 'my', 'me'];
    const keywords = words.filter(w => w.length > 4 && !commonWords.includes(w));

    return [...new Set(keywords)].slice(0, 5);
  }

  showJournalPrompt(promptData) {
    const journalPrompt = new JournalPrompt({
      prompt: promptData.prompt,
      isOptional: promptData.isOptional,
      onComplete: async (entry) => {
        this.currentSession.journalEntry = entry;
        await this.completeSession();
      }
    });

    journalPrompt.show();
  }

  async completeSession() {
    // Save session
    await this.storage.saveSession(this.currentSession);

    // Show completion screen
    this.showCompletion();
  }

  showCompletion() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const improvement = this.currentSession.improvement;
    const moodBefore = emotions[this.currentSession.moodBefore.emotion];
    const moodAfter = this.currentSession.moodAfter
      ? emotions[this.currentSession.moodAfter.emotion]
      : null;

    const container = document.createElement('div');
    container.className = 'page-container bg-gradient-to-br from-green-50 to-teal-50';

    const message = improvement > 0
      ? `Great work! You reduced your ${moodBefore.label.toLowerCase()} by ${improvement} points.`
      : improvement < 0
      ? `You completed your session. Remember, every practice builds resilience.`
      : `You completed your session. Great job showing up for yourself!`;

    container.innerHTML = `
      <div class="w-full max-w-2xl mx-auto">
        <div class="card text-center">
          <div class="text-7xl mb-6">🎉</div>
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Session Complete!
          </h2>

          <div class="mb-6 p-6 bg-white rounded-lg">
            <div class="flex items-center justify-center gap-6 mb-4">
              <div class="text-center">
                <div class="text-5xl mb-2">${moodBefore.emoji}</div>
                <div class="text-sm text-gray-600">Before</div>
                <div class="text-lg font-semibold">${this.currentSession.moodBefore.intensity}/10</div>
              </div>

              <div class="text-3xl text-primary">→</div>

              ${moodAfter ? `
                <div class="text-center">
                  <div class="text-5xl mb-2">${moodAfter.emoji}</div>
                  <div class="text-sm text-gray-600">After</div>
                  <div class="text-lg font-semibold">${this.currentSession.moodAfter.intensity}/10</div>
                </div>
              ` : ''}
            </div>

            <p class="text-lg text-gray-700">
              ${message}
            </p>
          </div>

          <button id="home-btn" class="btn-primary w-full">
            Return Home
          </button>
        </div>
      </div>
    `;

    app.appendChild(container);

    document.getElementById('home-btn')?.addEventListener('click', () => {
      HapticService.trigger('selection');
      this.showHome();
    });

    // Auto-navigate after 5 seconds
    setTimeout(() => {
      this.showHome();
    }, 5000);
  }

  showSettings() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'page-container bg-gradient-to-br from-purple-50 to-pink-50';

    const hapticStatus = HapticService.getStatus();
    const hasApiKey = ClaudeAPI.isConfigured();

    container.innerHTML = `
      <div class="w-full max-w-2xl mx-auto">
        <div class="card">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Settings</h2>

          <!-- Haptic Feedback -->
          <div class="mb-6 pb-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-gray-900">Haptic Feedback</h3>
                <p class="text-sm text-gray-600">
                  ${hapticStatus.supported ? 'Vibrate during breathing phases' : 'Not supported on this device'}
                </p>
              </div>
              ${hapticStatus.supported ? `
                <button id="haptic-toggle" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hapticStatus.enabled ? 'bg-primary' : 'bg-gray-200'}">
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hapticStatus.enabled ? 'translate-x-6' : 'translate-x-1'}"></span>
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Claude API Key -->
          <div class="mb-6 pb-6 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-3">Claude API Key</h3>
            <p class="text-sm text-gray-600 mb-3">
              ${hasApiKey ? '✅ API key configured' : '❌ No API key (using fallback recommendations)'}
            </p>
            <div class="flex gap-2">
              <input
                type="password"
                id="api-key-input"
                placeholder="sk-ant-..."
                class="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                value="${hasApiKey ? '••••••••••••••••' : ''}"
              />
              <button id="save-api-key" class="btn-primary">
                Save
              </button>
            </div>
          </div>

          <!-- Data Management -->
          <div class="mb-6">
            <h3 class="font-semibold text-gray-900 mb-3">Data Management</h3>
            <div class="space-y-2">
              <button id="export-data" class="btn-secondary w-full">
                📥 Export Data
              </button>
              <button id="clear-data" class="btn-secondary w-full bg-red-50 hover:bg-red-100 text-red-700">
                🗑️ Clear All Data
              </button>
            </div>
          </div>

          <button id="back-btn" class="btn-secondary w-full">
            ← Back to Home
          </button>
        </div>
      </div>
    `;

    app.appendChild(container);

    // Haptic toggle
    document.getElementById('haptic-toggle')?.addEventListener('click', () => {
      const newState = HapticService.toggle();
      HapticService.trigger('selection');
      // Refresh settings
      this.showSettings();
    });

    // API key save
    document.getElementById('save-api-key')?.addEventListener('click', () => {
      const input = document.getElementById('api-key-input');
      const key = input.value.trim();

      if (key && key !== '••••••••••••••••') {
        ClaudeAPI.setApiKey(key);
        HapticService.trigger('selection');
        alert('API key saved successfully!');
        this.showSettings();
      }
    });

    // Export data
    document.getElementById('export-data')?.addEventListener('click', async () => {
      const data = await this.storage.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aiding-mindfulness-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      HapticService.trigger('selection');
    });

    // Clear data
    document.getElementById('clear-data')?.addEventListener('click', async () => {
      if (confirm('Are you sure? This will delete all your sessions and cannot be undone.')) {
        await this.storage.clearAllSessions();
        HapticService.trigger('selection');
        alert('All data cleared.');
        this.showHome();
      }
    });

    // Back button
    document.getElementById('back-btn')?.addEventListener('click', () => {
      HapticService.trigger('selection');
      this.showHome();
    });
  }

  showHistory() {
    // Placeholder - could be expanded with detailed history view
    alert('History view - coming soon! For now, check the calendar on the home screen.');
    HapticService.trigger('selection');
  }

  showOnboarding() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'page-container bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50';

    container.innerHTML = `
      <div class="w-full max-w-2xl mx-auto">
        <div class="card text-center">
          <div class="text-7xl mb-6">🧘</div>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Aiding Mindfulness
          </h1>

          <div class="text-left space-y-4 mb-8">
            <div class="flex gap-4">
              <div class="text-3xl">🎯</div>
              <div>
                <h3 class="font-semibold text-gray-900">AI-Powered Recommendations</h3>
                <p class="text-gray-600">Get personalized breathing techniques based on your mood and history</p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="text-3xl">🫁</div>
              <div>
                <h3 class="font-semibold text-gray-900">Guided Breathing Sessions</h3>
                <p class="text-gray-600">Beautiful visualizations and haptic feedback guide your practice</p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="text-3xl">✍️</div>
              <div>
                <h3 class="font-semibold text-gray-900">Reflective Journaling</h3>
                <p class="text-gray-600">AI-generated prompts help you process your emotions</p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="text-3xl">📊</div>
              <div>
                <h3 class="font-semibold text-gray-900">Track Your Progress</h3>
                <p class="text-gray-600">Calendar view and streak tracking keep you motivated</p>
              </div>
            </div>
          </div>

          <div class="p-4 bg-teal-50 rounded-lg mb-6">
            <p class="text-sm text-gray-700">
              🔒 Your data stays private - everything is stored locally on your device
            </p>
          </div>

          <button id="get-started-btn" class="btn-primary w-full text-xl py-4">
            Get Started
          </button>
        </div>
      </div>
    `;

    app.appendChild(container);

    document.getElementById('get-started-btn')?.addEventListener('click', async () => {
      await this.storage.saveSetting('onboarding_complete', true);
      HapticService.trigger('selection');
      this.showHome();
    });
  }

  showLoading(message = 'Loading...') {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'page-container';

    container.innerHTML = `
      <div class="text-center">
        <div class="spinner mx-auto mb-4"></div>
        <p class="text-gray-600">${message}</p>
      </div>
    `;

    app.appendChild(container);
  }

  showError(message) {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'page-container';

    container.innerHTML = `
      <div class="card max-w-md mx-auto text-center">
        <div class="text-6xl mb-4">⚠️</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Error</h2>
        <p class="text-gray-600 mb-6">${message}</p>
        <button id="home-btn" class="btn-primary w-full">
          Return Home
        </button>
      </div>
    `;

    app.appendChild(container);

    document.getElementById('home-btn')?.addEventListener('click', () => {
      this.showHome();
    });
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const app = new AidingMindfulnessApp();
  await app.init();

  // Make app globally available for debugging
  window.app = app;
});
