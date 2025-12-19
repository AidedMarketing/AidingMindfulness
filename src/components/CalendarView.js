import { emotions } from '../data/emotions.js';
import { getDaysInMonth, getFirstDayOfMonth, isToday, getDateString } from '../utils/dateHelpers.js';

export class CalendarView {
  constructor(options = {}) {
    this.storageService = options.storageService;
    this.onDateClick = options.onDateClick;
    this.currentYear = new Date().getFullYear();
    this.currentMonth = new Date().getMonth();
    this.sessions = [];
    this.container = null;
  }

  async loadSessions() {
    this.sessions = await this.storageService.getSessionsForMonth(
      this.currentYear,
      this.currentMonth
    );
  }

  render() {
    const container = document.createElement('div');
    container.className = 'w-full';
    container.id = 'calendar-view';

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    container.innerHTML = `
      <div class="card">
        <!-- Calendar Header -->
        <div class="flex items-center justify-between mb-4">
          <button id="prev-month" class="p-2 hover:bg-gray-100 rounded-lg">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h3 class="text-xl font-bold text-gray-900">
            ${monthNames[this.currentMonth]} ${this.currentYear}
          </h3>

          <button id="next-month" class="p-2 hover:bg-gray-100 rounded-lg">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Day Labels -->
        <div class="grid grid-cols-7 gap-2 mb-2">
          ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => `
            <div class="text-center text-sm font-semibold text-gray-600">${day}</div>
          `).join('')}
        </div>

        <!-- Calendar Grid -->
        <div id="calendar-grid" class="grid grid-cols-7 gap-2">
          ${this.renderCalendarDays()}
        </div>

        <!-- Legend -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center justify-center gap-4 flex-wrap text-sm">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-primary"></div>
              <span class="text-gray-600">Session completed</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-gray-300"></div>
              <span class="text-gray-600">Session started</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.container = container;
    this.attachEventListeners();

    return container;
  }

  renderCalendarDays() {
    const daysInMonth = getDaysInMonth(this.currentYear, this.currentMonth);
    const firstDay = getFirstDayOfMonth(this.currentYear, this.currentMonth);

    let html = '';

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      html += '<div class="aspect-square"></div>';
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      const dateStr = getDateString(date);
      const daySessions = this.sessions.filter(s =>
        getDateString(s.timestamp) === dateStr
      );

      const isCurrentDay = isToday(date);
      const hasSession = daySessions.length > 0;
      const hasCompletedSession = daySessions.some(s => s.completed);

      let dayClass = 'aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all';

      if (isCurrentDay) {
        dayClass += ' ring-2 ring-primary font-bold';
      }

      if (hasSession) {
        dayClass += ' hover:bg-gray-50';
      }

      html += `
        <div
          class="${dayClass}"
          data-date="${dateStr}"
          data-has-session="${hasSession}"
        >
          <div class="text-sm ${isCurrentDay ? 'text-primary' : 'text-gray-700'}">
            ${day}
          </div>
          ${hasSession ? `
            <div class="flex gap-1 mt-1">
              ${daySessions.map(s => `
                <div
                  class="w-2 h-2 rounded-full ${s.completed ? 'bg-primary' : 'bg-gray-300'}"
                  title="${emotions[s.moodBefore.emotion].label} → ${s.breathingTechnique}"
                ></div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }

    return html;
  }

  attachEventListeners() {
    const prevBtn = this.container.querySelector('#prev-month');
    const nextBtn = this.container.querySelector('#next-month');
    const calendarGrid = this.container.querySelector('#calendar-grid');

    prevBtn?.addEventListener('click', async () => {
      this.currentMonth--;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
      await this.refresh();
    });

    nextBtn?.addEventListener('click', async () => {
      this.currentMonth++;
      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
      await this.refresh();
    });

    calendarGrid?.addEventListener('click', (e) => {
      const dayCell = e.target.closest('[data-date]');
      if (dayCell && dayCell.dataset.hasSession === 'true') {
        const date = dayCell.dataset.date;
        this.handleDateClick(date);
      }
    });
  }

  handleDateClick(dateStr) {
    const daySessions = this.sessions.filter(s =>
      getDateString(s.timestamp) === dateStr
    );

    if (this.onDateClick) {
      this.onDateClick(dateStr, daySessions);
    } else {
      // Show session details in modal
      this.showSessionDetails(dateStr, daySessions);
    }
  }

  showSessionDetails(dateStr, sessions) {
    // Simple implementation - could be enhanced with a modal
    const details = sessions.map(s => {
      const improvement = s.moodAfter
        ? (s.moodBefore.intensity - s.moodAfter.intensity)
        : 'N/A';

      return `
        ${emotions[s.moodBefore.emotion].emoji} ${emotions[s.moodBefore.emotion].label} (${s.moodBefore.intensity}/10)
        → ${s.breathingTechnique}
        ${s.completed ? `→ Improvement: ${improvement} points` : '(incomplete)'}
      `;
    }).join('\n\n');

    alert(`Sessions on ${dateStr}:\n\n${details}`);
  }

  async refresh() {
    await this.loadSessions();
    const grid = this.container.querySelector('#calendar-grid');
    if (grid) {
      grid.innerHTML = this.renderCalendarDays();
    }

    // Update month/year display
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const header = this.container.querySelector('h3');
    if (header) {
      header.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
    }
  }

  async show(containerEl) {
    await this.loadSessions();
    const rendered = this.render();
    if (containerEl) {
      containerEl.appendChild(rendered);
    }
    return rendered;
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
