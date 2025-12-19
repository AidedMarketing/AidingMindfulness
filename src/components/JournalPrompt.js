import { HapticService } from '../services/HapticService.js';

export class JournalPrompt {
  constructor(options = {}) {
    this.prompt = options.prompt;
    this.isOptional = options.isOptional !== false;
    this.onComplete = options.onComplete;
    this.onSkip = options.onSkip;
    this.container = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'page-container bg-gradient-to-br from-purple-50 to-pink-50';
    container.id = 'journal-prompt';

    container.innerHTML = `
      <div class="w-full max-w-2xl mx-auto">
        <div class="card">
          <div class="text-center mb-6">
            <div class="text-5xl mb-4">✍️</div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Reflect</h2>
            <p class="text-gray-600">
              ${this.isOptional ? 'Optional: Take a moment to journal your thoughts' : 'Take a moment to journal your thoughts'}
            </p>
          </div>

          <div class="mb-6">
            <label class="block text-lg font-semibold text-gray-700 mb-3">
              ${this.prompt}
            </label>
            <textarea
              id="journal-input"
              rows="6"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none resize-none"
              placeholder="Write your thoughts here..."
            ></textarea>
            <div class="text-right text-sm text-gray-500 mt-1">
              <span id="char-count">0</span> characters
            </div>
          </div>

          <div class="flex gap-4">
            ${this.isOptional ? `
              <button id="skip-btn" class="btn-secondary flex-1">
                Skip
              </button>
            ` : ''}
            <button id="save-btn" class="btn-primary flex-1">
              ${this.isOptional ? 'Save & Continue' : 'Continue'}
            </button>
          </div>

          <div class="mt-4 p-4 bg-teal-50 rounded-lg">
            <p class="text-sm text-gray-600 text-center">
              💡 Your journal entries are private and stored only on your device
            </p>
          </div>
        </div>
      </div>
    `;

    this.container = container;
    this.attachEventListeners();

    return container;
  }

  attachEventListeners() {
    const input = this.container.querySelector('#journal-input');
    const charCount = this.container.querySelector('#char-count');
    const saveBtn = this.container.querySelector('#save-btn');
    const skipBtn = this.container.querySelector('#skip-btn');

    // Character counter
    input?.addEventListener('input', (e) => {
      charCount.textContent = e.target.value.length;
    });

    // Auto-focus
    setTimeout(() => input?.focus(), 100);

    // Save button
    saveBtn?.addEventListener('click', () => {
      const entry = input.value.trim();
      this.handleSave(entry);
    });

    // Skip button
    skipBtn?.addEventListener('click', () => {
      this.handleSkip();
    });

    // Enter key with Ctrl/Cmd to submit
    input?.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const entry = input.value.trim();
        this.handleSave(entry);
      }
    });
  }

  handleSave(entry) {
    HapticService.trigger('selection');

    if (this.onComplete) {
      this.onComplete(entry || null);
    }
  }

  handleSkip() {
    HapticService.trigger('selection');

    if (this.onSkip) {
      this.onSkip();
    } else if (this.onComplete) {
      this.onComplete(null);
    }
  }

  show() {
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = '';
      appContainer.appendChild(this.render());
    }
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
