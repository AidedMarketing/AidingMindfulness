export class UpdateNotifier {
  constructor() {
    this.container = null;
    this.registration = null;
    this.onUpdateReady = null;
  }

  show(registration) {
    this.registration = registration;

    // Remove existing notifier if present
    const existing = document.getElementById('update-notifier');
    if (existing) {
      existing.remove();
    }

    const container = document.createElement('div');
    container.id = 'update-notifier';
    container.className = 'fixed bottom-0 left-0 right-0 z-50 animate-slide-up';

    container.innerHTML = `
      <div class="bg-primary text-white px-4 py-4 shadow-lg">
        <div class="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <div>
              <div class="font-semibold">Update Available</div>
              <div class="text-sm text-white/90">A new version is ready to install</div>
            </div>
          </div>
          <div class="flex gap-2">
            <button id="update-dismiss" class="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white font-medium">
              Later
            </button>
            <button id="update-refresh" class="px-4 py-2 rounded-lg bg-white text-primary hover:bg-gray-100 transition-colors font-semibold">
              Update Now
            </button>
          </div>
        </div>
      </div>
    `;

    this.container = container;
    document.body.appendChild(container);

    // Add event listeners
    const dismissBtn = container.querySelector('#update-dismiss');
    const refreshBtn = container.querySelector('#update-refresh');

    dismissBtn?.addEventListener('click', () => this.hide());
    refreshBtn?.addEventListener('click', () => this.applyUpdate());

    return container;
  }

  applyUpdate() {
    if (!this.registration || !this.registration.waiting) {
      // Fallback: just reload
      window.location.reload();
      return;
    }

    // Tell the service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Listen for the controller change and reload
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  hide() {
    if (this.container) {
      this.container.classList.add('animate-slide-down');
      setTimeout(() => {
        if (this.container && this.container.parentNode) {
          this.container.parentNode.removeChild(this.container);
          this.container = null;
        }
      }, 300);
    }
  }

  destroy() {
    this.hide();
  }
}
