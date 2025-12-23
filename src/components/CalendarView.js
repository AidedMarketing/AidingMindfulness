import { emotions } from '../data/emotions.js';
import { getDaysInMonth, getFirstDayOfMonth, getDateString, getEffectiveDate } from '../utils/dateHelpers.js';
import { getStats } from '../utils/analytics.js';

export class CalendarView {
  constructor({ storageService, onClose }) {
    this.storageService = storageService;
    this.onClose = onClose;
    this.currentYear = new Date().getFullYear();
    this.currentMonth = new Date().getMonth();
    this.entries = [];
    this.stats = null;
    this.container = null;
  }

  async show(container) {
    this.container = container;
    await this.loadData();
    this.render();
  }

  async loadData() {
    // Load all entries for calculating stats
    const allEntries = await this.storageService.getAllEntries();
    this.stats = getStats(allEntries);

    // Load entries for current month
    this.entries = await this.storageService.getEntriesForMonth(
      this.currentYear,
      this.currentMonth
    );
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'modal-overlay animate-slide-up';
    wrapper.id = 'calendar-modal';

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    wrapper.innerHTML = `
      <div class="modal-content max-w-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <button id="prev-month" class="p-2 hover:bg-muted-text/10 rounded-lg transition-colors">
            ←
          </button>

          <h3 class="text-2xl font-semibold">
            ${monthNames[this.currentMonth]} ${this.currentYear}
          </h3>

          <button id="next-month" class="p-2 hover:bg-muted-text/10 rounded-lg transition-colors">
            →
          </button>
        </div>

        <!-- Day Labels -->
        <div class="grid grid-cols-7 gap-2 mb-3">
          ${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => `
            <div class="text-center text-sm font-medium text-muted-text dark:text-muted-dark">${day}</div>
          `).join('')}
        </div>

        <!-- Calendar Grid -->
        <div id="calendar-grid" class="grid grid-cols-7 gap-2 mb-6">
          ${this.renderCalendarDays()}
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-3 mb-6 pt-6 border-t border-muted-text/20">
          <div class="flex items-center justify-between">
            <span class="text-muted-text dark:text-muted-dark text-sm">Current</span>
            <span class="font-semibold">🔥 ${this.stats.currentStreak} days</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-text dark:text-muted-dark text-sm">Best</span>
            <span class="font-semibold">⭐ ${this.stats.longestStreak} days</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-text dark:text-muted-dark text-sm">Total</span>
            <span class="font-semibold">📝 ${this.stats.totalEntries}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-text dark:text-muted-dark text-sm">This month</span>
            <span class="font-semibold">📅 ${this.stats.entriesThisMonth}</span>
          </div>
        </div>

        <!-- Close Button -->
        <button id="close-calendar" class="btn-secondary w-full">
          Close
        </button>
      </div>
    `;

    this.container.innerHTML = '';
    this.container.appendChild(wrapper);
    this.attachEventListeners();
  }

  renderCalendarDays() {
    const daysInMonth = getDaysInMonth(this.currentYear, this.currentMonth);
    const firstDay = getFirstDayOfMonth(this.currentYear, this.currentMonth);
    const today = getEffectiveDate();

    let html = '';

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      html += '<div class="aspect-square"></div>';
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      const dateStr = getDateString(date);
      const entry = this.entries.find(e => e.date === dateStr);
      const isToday = dateStr === today;

      let content = '';
      let classes = 'calendar-day';

      if (entry) {
        classes += ' has-entry';
        // Show emotion emoji if present, otherwise show flame
        if (entry.emotion && emotions[entry.emotion]) {
          content = emotions[entry.emotion].emoji;
        } else {
          content = '🔥';
        }
      } else {
        content = day;
      }

      if (isToday) {
        classes += ' today';
      }

      html += `
        <div class="${classes}" data-date="${dateStr}">
          <div class="text-sm">${content}</div>
        </div>
      `;
    }

    return html;
  }

  attachEventListeners() {
    // Month navigation
    document.getElementById('prev-month')?.addEventListener('click', async () => {
      this.currentMonth--;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
      await this.loadData();
      this.render();
    });

    document.getElementById('next-month')?.addEventListener('click', async () => {
      this.currentMonth++;
      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
      await this.loadData();
      this.render();
    });

    // Close button
    document.getElementById('close-calendar')?.addEventListener('click', () => {
      this.close();
    });

    // Click outside to close
    document.getElementById('calendar-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'calendar-modal') {
        this.close();
      }
    });

    // Date clicks (show detail)
    document.querySelectorAll('.calendar-day.has-entry').forEach(day => {
      day.addEventListener('click', () => {
        const dateStr = day.dataset.date;
        this.showEntryDetail(dateStr);
      });
    });
  }

  showEntryDetail(dateStr) {
    const entry = this.entries.find(e => e.date === dateStr);
    if (!entry) return;

    const [year, month, day] = dateStr.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const formattedDate = `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;

    let emotionText = '';
    if (entry.emotion && emotions[entry.emotion]) {
      const emotion = emotions[entry.emotion];
      emotionText = `${emotion.emoji} ${emotion.label}`;
    } else {
      emotionText = 'No emotion recorded';
    }

    alert(`${formattedDate}\n${emotionText}`);
  }

  close() {
    const modal = document.getElementById('calendar-modal');
    if (modal) {
      modal.classList.remove('animate-slide-up');
      modal.classList.add('animate-slide-down');

      setTimeout(() => {
        if (this.onClose) {
          this.onClose();
        }
      }, 300);
    }
  }
}
