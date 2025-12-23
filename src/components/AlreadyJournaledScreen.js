/**
 * Already Journaled Screen
 * Shows when user has already journaled today
 */
export class AlreadyJournaledScreen {
  constructor({ stats, onCalendar }) {
    this.stats = stats;
    this.onCalendar = onCalendar;
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
        <h2 class="text-2xl font-medium mb-4">
          Today's page has burned
        </h2>

        <!-- Stats -->
        <div class="space-y-3 my-8">
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
        </div>

        <!-- Calendar Button -->
        <button id="calendar-btn" class="btn-primary w-full mb-6">
          View Calendar
        </button>

        <!-- Message -->
        <p class="text-muted-text dark:text-muted-dark">
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
  }
}
