/**
 * Journal Editor Component
 * Minimal text editor with auto-hiding UI
 */
export class JournalEditor {
  constructor({ onFinish }) {
    this.onFinish = onFinish;
    this.text = '';
    this.isTyping = false;
    this.topBarTimeout = null;
    this.finishBtnTimeout = null;
    this.container = null;
    this.textarea = null;
    this.topBar = null;
    this.finishButton = null;
  }

  show(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.render();
    this.attachEventListeners();

    // Focus textarea
    setTimeout(() => {
      this.textarea?.focus();
    }, 100);
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'relative w-full min-h-screen flex flex-col';

    wrapper.innerHTML = `
      <!-- Top Bar (hidden while typing) -->
      <div class="top-bar hidden" id="journal-top-bar">
        <button id="calendar-btn" class="text-2xl touch-target">📅</button>
        <div id="streak-display" class="text-lg font-medium flex items-center gap-1">
          🔥 <span id="streak-count">0</span>
        </div>
      </div>

      <!-- Journal Text Area -->
      <div class="flex-1 flex flex-col p-6 pt-20 pb-32">
        <textarea
          id="journal-textarea"
          class="flex-1 w-full bg-transparent border-none outline-none resize-none
                 text-lg leading-relaxed placeholder-muted-text dark:placeholder-muted-dark
                 scrollbar-hide"
          placeholder="This will burn. Write freely."
          style="font-size: 18px; line-height: 1.7;"
        ></textarea>
      </div>

      <!-- Finish Button (fixed to bottom, auto-hides while typing) -->
      <div id="finish-button-container" class="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-cream via-cream to-transparent dark:from-charcoal dark:via-charcoal pointer-events-none opacity-0 transition-opacity duration-300" style="padding-top: 3rem;">
        <button id="finish-btn" class="btn-primary w-full pointer-events-auto">
          <span id="finish-text">I'm Finished</span>
          <span id="word-count" class="ml-2 text-sm opacity-75"></span>
        </button>
      </div>
    `;

    this.container.appendChild(wrapper);

    // Get references
    this.textarea = document.getElementById('journal-textarea');
    this.topBar = document.getElementById('journal-top-bar');
    this.finishButton = document.getElementById('finish-btn');
    this.finishButtonContainer = document.getElementById('finish-button-container');
  }

  attachEventListeners() {
    // Typing detection
    this.textarea.addEventListener('input', () => {
      this.text = this.textarea.value;
      this.onTyping();
      this.updateWordCount();
    });

    // Finish button
    this.finishButton.addEventListener('click', () => {
      if (this.text.trim().length > 0) {
        this.onFinish(this.text);
      }
    });

    // Calendar button (will be handled by parent app)
    document.getElementById('calendar-btn')?.addEventListener('click', () => {
      this.emit('calendar');
    });
  }

  onTyping() {
    // Hide UI while typing
    this.topBar.classList.remove('visible');
    this.topBar.classList.add('hidden');
    this.finishButtonContainer.style.opacity = '0';
    this.isTyping = true;

    // Clear previous timeouts
    if (this.topBarTimeout) {
      clearTimeout(this.topBarTimeout);
    }
    if (this.finishBtnTimeout) {
      clearTimeout(this.finishBtnTimeout);
    }

    // Show top bar after 3 seconds of no typing
    this.topBarTimeout = setTimeout(() => {
      this.topBar.classList.remove('hidden');
      this.topBar.classList.add('visible');
    }, 3000);

    // Show finish button after 1.5 seconds (shorter pause)
    this.finishBtnTimeout = setTimeout(() => {
      this.isTyping = false;
      this.finishButtonContainer.style.opacity = '1';
    }, 1500);
  }

  updateWordCount() {
    const words = this.text.trim().split(/\s+/).filter(w => w.length > 0);
    const count = words.length;
    const wordCountEl = document.getElementById('word-count');

    if (wordCountEl && count > 0) {
      wordCountEl.textContent = `• ${count} word${count !== 1 ? 's' : ''}`;
    } else if (wordCountEl) {
      wordCountEl.textContent = '';
    }
  }

  setStreak(streak) {
    const streakCount = document.getElementById('streak-count');
    if (streakCount) {
      streakCount.textContent = streak;
    }
  }

  getText() {
    return this.text;
  }

  emit(event, data) {
    // Simple event emitter for calendar button
    if (event === 'calendar') {
      const customEvent = new CustomEvent('calendar-requested');
      document.dispatchEvent(customEvent);
    }
  }

  destroy() {
    if (this.topBarTimeout) {
      clearTimeout(this.topBarTimeout);
    }
    if (this.finishBtnTimeout) {
      clearTimeout(this.finishBtnTimeout);
    }
  }
}
