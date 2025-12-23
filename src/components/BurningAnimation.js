import { HapticService } from '../services/HapticService.js';

/**
 * Burning Animation Component
 * Shows page curl & burn effect with sound and haptic feedback
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

    wrapper.innerHTML = `
      <div id="burning-content" class="max-w-2xl w-full burning-page">
        <div class="text-lg leading-relaxed whitespace-pre-wrap">
          ${this.escapeHtml(this.text)}
        </div>
      </div>
    `;

    this.container.appendChild(wrapper);
  }

  async startAnimation() {
    const content = document.getElementById('burning-content');
    if (!content) return;

    // Play burning sound (if available)
    this.playBurningSound();

    // Start haptic feedback
    this.startHapticPattern();

    // Animation sequence
    await this.sleep(300);

    // Step 1: Curl (0.5s)
    content.classList.add('animate-burn-curl');
    await this.sleep(1000);

    // Step 2: Ignite (1.5s)
    content.style.filter = 'sepia(0.5) brightness(1.2)';
    await this.sleep(1500);

    // Step 3: Burn and fade (2s)
    content.style.transition = 'all 2s ease-out';
    content.style.opacity = '0';
    content.style.filter = 'blur(2px) brightness(0.5)';
    await this.sleep(2000);

    // Complete
    this.stopAudio();
    this.onComplete();
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  playBurningSound() {
    try {
      // Create audio context for burning sound
      // For now, we'll skip actual audio file and just trigger haptic
      // You can add an actual fire crackling sound file later
      this.audio = null; // Placeholder for audio element
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
    // Gentle pulsing haptic pattern during burn
    const pattern = [
      { duration: 200 },
      { wait: 300 },
      { duration: 200 },
      { wait: 500 },
      { duration: 300 },
      { wait: 400 },
      { duration: 200 }
    ];

    let delay = 0;
    pattern.forEach(step => {
      if (step.duration) {
        setTimeout(() => {
          HapticService.trigger('medium');
        }, delay);
        delay += step.duration;
      }
      if (step.wait) {
        delay += step.wait;
      }
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
