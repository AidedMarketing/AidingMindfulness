import './styles/main.css';
import { StorageService } from './services/StorageService.js';
import { HapticService } from './services/HapticService.js';
import { JournalEditor } from './components/JournalEditor.js';
import { BurningAnimation } from './components/BurningAnimation.js';
import { RadialEmotionPicker } from './components/RadialEmotionPicker.js';
import { CalendarView } from './components/CalendarView.js';
import { IntroModal } from './components/IntroModal.js';
import { CompletionScreen } from './components/CompletionScreen.js';
import { AlreadyJournaledScreen } from './components/AlreadyJournaledScreen.js';
import { UpdateNotifier } from './components/UpdateNotifier.js';
import { getEffectiveDate } from './utils/dateHelpers.js';
import { getStats } from './utils/analytics.js';

class BurningJournalApp {
  constructor() {
    this.storage = new StorageService();
    this.currentText = '';
    this.currentEmotion = null;
    this.stats = null;
  }

  async init() {
    try {
      // Initialize storage
      await this.storage.init();

      // Load haptic preference
      HapticService.loadPreference();

      // Setup dark mode
      this.setupDarkMode();

      // Check for first-time user
      const hasSeenIntro = await this.storage.getSetting('intro_seen', false);

      if (!hasSeenIntro) {
        this.showIntro();
      } else {
        await this.determineInitialView();
      }

      // Register service worker
      this.registerServiceWorker();

    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Failed to initialize app. Please refresh the page.');
    }
  }

  async determineInitialView() {
    // Check if user has already journaled today
    const hasJournaled = await this.storage.hasJournaledToday();

    if (hasJournaled) {
      await this.showAlreadyJournaled();
    } else {
      await this.showJournal();
    }
  }

  setupDarkMode() {
    // Default to light mode for best burning animation effect
    // Only use dark mode if user explicitly saved it
    const savedMode = localStorage.getItem('darkMode');

    if (savedMode === 'dark') {
      document.body.classList.add('dark');
    }
    // Otherwise stay in light mode (no automatic dark mode detection)
  }

  toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark ? 'dark' : 'light');
  }

  showIntro() {
    const app = document.getElementById('app');
    const intro = new IntroModal({
      onComplete: async () => {
        await this.storage.saveSetting('intro_seen', true);
        HapticService.trigger('selection');
        await this.determineInitialView();
      }
    });

    intro.show(app);
  }

  async showJournal() {
    const app = document.getElementById('app');

    // Load stats for streak display
    const allEntries = await this.storage.getAllEntries();
    this.stats = getStats(allEntries);

    const editor = new JournalEditor({
      onFinish: (text) => {
        this.currentText = text;
        this.showConfirmation();
      }
    });

    editor.show(app);
    editor.setStreak(this.stats.currentStreak);

    // Listen for calendar requests
    document.addEventListener('calendar-requested', () => {
      this.showCalendar();
    }, { once: true });
  }

  showConfirmation() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'page-container';

    wrapper.innerHTML = `
      <div class="modal-content max-w-md">
        <h2 class="text-2xl font-medium mb-4 text-center">
          Once you burn this page, it's gone forever.
        </h2>

        <p class="text-center text-lg mb-8">
          Are you ready to let it go?
        </p>

        <div class="space-y-3">
          <button id="burn-btn" class="btn-primary w-full">
            Burn It
          </button>
          <button id="keep-btn" class="btn-secondary w-full">
            Keep Writing
          </button>
        </div>
      </div>
    `;

    app.appendChild(wrapper);

    document.getElementById('burn-btn')?.addEventListener('click', () => {
      HapticService.trigger('selection');
      this.startBurning();
    });

    document.getElementById('keep-btn')?.addEventListener('click', async () => {
      HapticService.trigger('selection');
      await this.showJournal();
    });
  }

  startBurning() {
    const app = document.getElementById('app');

    const burningAnimation = new BurningAnimation({
      text: this.currentText,
      onComplete: () => {
        this.showEmotionPicker();
      }
    });

    burningAnimation.show(app);
  }

  showEmotionPicker() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const picker = new RadialEmotionPicker({
      onSelect: (emotion) => {
        this.currentEmotion = emotion;
        HapticService.trigger('selection');
        this.saveEntry();
      },
      onSkip: () => {
        this.currentEmotion = null;
        HapticService.trigger('selection');
        this.saveEntry();
      }
    });

    picker.show(app);
  }

  async saveEntry() {
    try {
      // Save entry with effective date and emotion
      const date = getEffectiveDate();
      await this.storage.saveEntry(date, this.currentEmotion);

      // Reload stats
      const allEntries = await this.storage.getAllEntries();
      this.stats = getStats(allEntries);

      // Show completion
      this.showCompletion();

    } catch (error) {
      console.error('Failed to save entry:', error);
      this.showError('Failed to save entry. Please try again.');
    }
  }

  showCompletion() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const completion = new CompletionScreen({
      stats: this.stats,
      onCalendar: () => {
        this.showCalendar();
      },
      onDone: async () => {
        HapticService.trigger('selection');
        await this.showAlreadyJournaled();
      }
    });

    completion.show(app);
  }

  async showAlreadyJournaled() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    // Load stats
    const allEntries = await this.storage.getAllEntries();
    this.stats = getStats(allEntries);

    const screen = new AlreadyJournaledScreen({
      stats: this.stats,
      onCalendar: () => {
        this.showCalendar();
      }
    });

    screen.show(app);
  }

  showCalendar() {
    const app = document.getElementById('app');

    const calendar = new CalendarView({
      storageService: this.storage,
      onClose: async () => {
        // Return to appropriate view
        const hasJournaled = await this.storage.hasJournaledToday();
        if (hasJournaled) {
          await this.showAlreadyJournaled();
        } else {
          await this.showJournal();
        }
      }
    });

    calendar.show(app);
  }

  showError(message) {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'page-container';

    wrapper.innerHTML = `
      <div class="modal-content max-w-md text-center">
        <div class="text-6xl mb-4">⚠️</div>
        <h2 class="text-2xl font-bold mb-4">Error</h2>
        <p class="text-lg mb-6">${message}</p>
        <button id="reload-btn" class="btn-primary w-full">
          Reload App
        </button>
      </div>
    `;

    app.appendChild(wrapper);

    document.getElementById('reload-btn')?.addEventListener('click', () => {
      window.location.reload();
    });
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');

        // Check for updates
        registration.update();

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker available');
              const updateNotifier = new UpdateNotifier();
              updateNotifier.show(registration);
            }
          });
        });

        // Check if there's already a waiting worker
        if (registration.waiting) {
          const updateNotifier = new UpdateNotifier();
          updateNotifier.show(registration);
        }

        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const app = new BurningJournalApp();
  await app.init();

  // Make app globally available for debugging
  window.app = app;
});
