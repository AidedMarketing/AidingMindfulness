import { HapticService } from '../services/HapticService.js';

/**
 * Burning Animation Component
 * Dramatic page burning effect with visible fire
 */
export class BurningAnimation {
  constructor({ text, onComplete }) {
    this.text = text;
    this.onComplete = onComplete;
    this.container = null;
    this.audio = null;
  }

  show(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.render();
    this.startAnimation();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'fixed inset-0 bg-cream dark:bg-charcoal z-50 flex items-center justify-center p-6';
    wrapper.id = 'burn-wrapper';

    wrapper.innerHTML = `
      <div id="burning-content" class="max-w-2xl w-full relative">
        <!-- Fire overlay (initially hidden) -->
        <div id="fire-overlay" class="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-orange-600 via-red-500 to-yellow-400 mix-blend-screen"></div>
        </div>

        <!-- Text content -->
        <div id="text-content" class="text-lg leading-relaxed whitespace-pre-wrap p-8 bg-cream dark:bg-charcoal rounded-lg shadow-lg relative z-10">
          ${this.escapeHtml(this.text)}
        </div>

        <!-- Ash particles container -->
        <div id="ash-container" class="absolute inset-0 pointer-events-none"></div>
      </div>

      <!-- Status text -->
      <div id="burn-status" class="fixed bottom-8 left-0 right-0 text-center text-lg font-medium opacity-0 transition-opacity">
        Burning...
      </div>
    `;

    this.container.appendChild(wrapper);
  }

  async startAnimation() {
    const content = document.getElementById('burning-content');
    const textContent = document.getElementById('text-content');
    const fireOverlay = document.getElementById('fire-overlay');
    const burnStatus = document.getElementById('burn-status');
    const wrapper = document.getElementById('burn-wrapper');

    if (!content || !textContent || !fireOverlay) return;

    // Start haptic feedback
    this.startHapticPattern();

    // Show status
    await this.sleep(300);
    burnStatus.style.opacity = '1';

    // STAGE 1: Page edges start to brown (1s)
    await this.sleep(500);
    textContent.style.transition = 'all 1s ease-out';
    textContent.style.boxShadow = 'inset 0 0 60px rgba(139, 69, 19, 0.3)';
    textContent.style.filter = 'sepia(0.2) brightness(0.95)';
    await this.sleep(1000);

    // STAGE 2: Fire ignites from edges (1.5s)
    HapticService.trigger('heavy');
    fireOverlay.style.opacity = '0.4';
    textContent.style.filter = 'sepia(0.5) brightness(1.1) saturate(1.5)';
    textContent.style.boxShadow = 'inset 0 0 80px rgba(255, 100, 0, 0.6), 0 0 40px rgba(255, 100, 0, 0.4)';

    // Create animated fire border
    textContent.style.borderColor = '#FF6B35';
    textContent.style.borderWidth = '3px';
    textContent.style.borderStyle = 'solid';

    await this.sleep(1500);

    // STAGE 3: Fire intensifies (1s)
    HapticService.trigger('heavy');
    fireOverlay.style.opacity = '0.7';
    textContent.style.filter = 'sepia(0.8) brightness(1.3) saturate(2) contrast(1.2)';
    textContent.style.boxShadow = 'inset 0 0 120px rgba(255, 80, 0, 0.9), 0 0 60px rgba(255, 80, 0, 0.6)';
    textContent.style.transform = 'scale(0.98) rotate(0.5deg)';

    // Generate ash particles
    this.generateAshParticles(8);

    await this.sleep(1000);

    // STAGE 4: Burn to ash (1.5s)
    HapticService.trigger('medium');
    fireOverlay.style.opacity = '0.9';
    textContent.style.transition = 'all 1.5s ease-out';
    textContent.style.filter = 'sepia(1) brightness(0.3) saturate(0) blur(3px)';
    textContent.style.opacity = '0.3';
    textContent.style.transform = 'scale(0.95) rotate(1deg)';
    textContent.style.color = '#333';

    this.generateAshParticles(12);

    await this.sleep(1500);

    // STAGE 5: Fade to black (1s)
    wrapper.style.transition = 'background-color 1s ease-out';
    wrapper.style.backgroundColor = '#000';
    textContent.style.opacity = '0';
    fireOverlay.style.opacity = '0';
    burnStatus.style.opacity = '0';

    await this.sleep(1000);

    // Complete
    this.stopAudio();
    this.onComplete();
  }

  generateAshParticles(count) {
    const ashContainer = document.getElementById('ash-container');
    if (!ashContainer) return;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'ash-particle';

      const left = Math.random() * 100;
      const delay = Math.random() * 500;
      const duration = 2000 + Math.random() * 1000;

      particle.style.cssText = `
        position: absolute;
        left: ${left}%;
        bottom: 0;
        width: ${4 + Math.random() * 6}px;
        height: ${4 + Math.random() * 6}px;
        background: rgba(60, 60, 60, ${0.6 + Math.random() * 0.4});
        border-radius: 50%;
        animation: float-up ${duration}ms ease-out ${delay}ms forwards;
        pointer-events: none;
      `;

      ashContainer.appendChild(particle);

      // Remove after animation
      setTimeout(() => {
        particle.remove();
      }, duration + delay + 100);
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  playBurningSound() {
    try {
      // Placeholder for audio element
      this.audio = null;
    } catch (error) {
      console.warn('Could not play burning sound:', error);
    }
  }

  stopAudio() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }

  startHapticPattern() {
    // Initial haptic
    HapticService.trigger('medium');

    // Pattern during burn
    const timings = [1500, 3000, 4500];
    timings.forEach(time => {
      setTimeout(() => {
        HapticService.trigger('heavy');
      }, time);
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
