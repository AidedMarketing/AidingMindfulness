/**
 * Completion Screen Component
 * Shows after burning - displays stats and motivation
 */
export class CompletionScreen {
  constructor({ stats, onCalendar, onDone }) {
    this.stats = stats;
    this.onCalendar = onCalendar;
    this.onDone = onDone;
    this.container = null;
  }

  show(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.render();
    this.attachEventListeners();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'page-container';

    const nextDay = this.stats.currentStreak + 1;

    wrapper.innerHTML = `
      <div class="max-w-md mx-auto text-center">
        <!-- Title -->
        <h2 class="text-2xl font-medium mb-8">
          Your words are released
        </h2>

        <!-- Stats -->
        <div class="space-y-3 mb-8">
          <div class="flex items-center justify-between py-3 px-4 rounded-lg bg-muted-text/5">
            <span class="text-muted-text dark:text-muted-dark">Current streak</span>
            <span class="text-xl font-semibold">🔥 ${this.stats.currentStreak} days</span>
          </div>

          <div class="flex items-center justify-between py-3 px-4 rounded-lg bg-muted-text/5">
            <span class="text-muted-text dark:text-muted-dark">Best streak</span>
            <span class="text-xl font-semibold">⭐ ${this.stats.longestStreak} days</span>
          </div>

          <div class="flex items-center justify-between py-3 px-4 rounded-lg bg-muted-text/5">
            <span class="text-muted-text dark:text-muted-dark">Total entries</span>
            <span class="text-xl font-semibold">📝 ${this.stats.totalEntries}</span>
          </div>

          <div class="flex items-center justify-between py-3 px-4 rounded-lg bg-muted-text/5">
            <span class="text-muted-text dark:text-muted-dark">This month</span>
            <span class="text-xl font-semibold">📅 ${this.stats.entriesThisMonth}</span>
          </div>
        </div>

        <!-- Buttons -->
        <div class="space-y-3">
          <button id="calendar-btn" class="btn-primary w-full">
            View Calendar
          </button>
          <button id="done-btn" class="btn-secondary w-full">
            Done
          </button>
        </div>

        <!-- Motivational message -->
        <p class="mt-6 text-muted-text dark:text-muted-dark text-sm">
          See you tomorrow for day ${nextDay}
        </p>
      </div>
    `;

    this.container.appendChild(wrapper);
  }

  attachEventListeners() {
    document.getElementById('calendar-btn')?.addEventListener('click', () => {
      this.onCalendar();
    });

    document.getElementById('done-btn')?.addEventListener('click', () => {
      this.onDone();
    });
  }
}
