/**
 * Intro Modal Component
 * One-time introduction for new users
 */
export class IntroModal {
  constructor({ onComplete }) {
    this.onComplete = onComplete;
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

    wrapper.innerHTML = `
      <div class="max-w-md mx-auto text-center">
        <!-- Icon -->
        <div class="text-7xl mb-6">🔥</div>

        <!-- Title -->
        <h1 class="text-3xl font-bold mb-6">
          Welcome
        </h1>

        <!-- Message -->
        <div class="space-y-4 text-lg mb-8 text-left max-w-sm mx-auto">
          <p>
            Write freely.
          </p>
          <p>
            When finished, your words burn forever.
          </p>
          <p>
            Only you will ever see them.
          </p>
        </div>

        <!-- Start Button -->
        <button id="start-btn" class="btn-primary w-full max-w-sm">
          Start Journaling
        </button>
      </div>
    `;

    this.container.appendChild(wrapper);
  }

  attachEventListeners() {
    document.getElementById('start-btn')?.addEventListener('click', () => {
      this.onComplete();
    });
  }
}
