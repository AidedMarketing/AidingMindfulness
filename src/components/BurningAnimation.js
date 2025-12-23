import { HapticService } from '../services/HapticService.js';

/**
 * Burning Animation Component - Completely Redesigned
 * Realistic fire effect with multiple visual layers
 */
export class BurningAnimation {
  constructor({ text, onComplete }) {
    this.text = text;
    this.onComplete = onComplete;
    this.container = null;
  }

  show(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.render();
    this.startAnimation();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'fixed inset-0 bg-cream z-50 flex items-center justify-center p-6';
    wrapper.id = 'burn-wrapper';

    wrapper.innerHTML = `
      <div id="burning-stage" class="max-w-2xl w-full relative">

        <!-- Flames layer (multiple animated flames) -->
        <div id="flames-container" class="absolute inset-0 pointer-events-none opacity-0 overflow-hidden">
          <div class="flame flame-1"></div>
          <div class="flame flame-2"></div>
          <div class="flame flame-3"></div>
          <div class="flame flame-4"></div>
          <div class="flame flame-5"></div>
        </div>

        <!-- Ember particles (glowing sparks) -->
        <div id="ember-container" class="absolute inset-0 pointer-events-none"></div>

        <!-- Text content (the page being burned) -->
        <div id="text-content" class="relative text-lg leading-relaxed whitespace-pre-wrap p-8 rounded-lg shadow-2xl bg-white border-2 border-gray-200">
          ${this.escapeHtml(this.text)}
        </div>

        <!-- Smoke effect -->
        <div id="smoke-container" class="absolute inset-0 pointer-events-none opacity-0">
          <div class="smoke smoke-1"></div>
          <div class="smoke smoke-2"></div>
          <div class="smoke smoke-3"></div>
        </div>

        <!-- Ash particles -->
        <div id="ash-container" class="absolute inset-0 pointer-events-none"></div>
      </div>
    `;

    this.container.appendChild(wrapper);
  }

  async startAnimation() {
    const textContent = document.getElementById('text-content');
    const flamesContainer = document.getElementById('flames-container');
    const smokeContainer = document.getElementById('smoke-container');
    const wrapper = document.getElementById('burn-wrapper');

    if (!textContent || !flamesContainer) return;

    HapticService.trigger('light');

    // STAGE 1: Paper starts to char (1s)
    await this.sleep(200);
    textContent.style.transition = 'all 1s ease-out';
    textContent.style.borderColor = '#D2B48C';
    textContent.style.backgroundColor = '#FFFEF9';
    textContent.style.boxShadow = 'inset 0 0 30px rgba(139, 69, 19, 0.1)';
    await this.sleep(1000);

    // STAGE 2: Edges start to brown and curl (1.2s)
    HapticService.trigger('medium');
    textContent.style.transition = 'all 1.2s ease-out';
    textContent.style.borderColor = '#8B4513';
    textContent.style.backgroundColor = '#FFF8DC';
    textContent.style.boxShadow = 'inset 0 0 60px rgba(139, 69, 19, 0.3), 0 0 20px rgba(139, 69, 19, 0.2)';
    textContent.style.filter = 'sepia(0.3)';
    textContent.style.transform = 'scale(0.99) rotate(0.3deg)';
    await this.sleep(1200);

    // STAGE 3: Fire ignites! (2s) - DRAMATIC
    HapticService.trigger('heavy');

    // Show flames
    flamesContainer.style.transition = 'opacity 0.5s ease-in';
    flamesContainer.style.opacity = '1';

    // Generate embers
    this.generateEmbers(15);

    // Text burns
    textContent.style.transition = 'all 2s ease-out';
    textContent.style.borderColor = '#FF4500';
    textContent.style.borderWidth = '4px';
    textContent.style.backgroundColor = '#FFE4B5';
    textContent.style.boxShadow = `
      inset 0 0 100px rgba(255, 69, 0, 0.6),
      0 0 60px rgba(255, 69, 0, 0.5),
      0 0 100px rgba(255, 140, 0, 0.3)
    `;
    textContent.style.filter = 'sepia(0.6) brightness(1.2) saturate(1.8)';
    textContent.style.transform = 'scale(0.97) rotate(0.8deg)';

    await this.sleep(1000);

    // More embers mid-burn
    this.generateEmbers(20);
    HapticService.trigger('heavy');

    await this.sleep(1000);

    // STAGE 4: Intense burning (1.5s)
    textContent.style.transition = 'all 1.5s ease-out';
    textContent.style.borderColor = '#FF6347';
    textContent.style.backgroundColor = '#CD853F';
    textContent.style.boxShadow = `
      inset 0 0 150px rgba(255, 69, 0, 0.9),
      0 0 80px rgba(255, 69, 0, 0.7),
      0 0 120px rgba(255, 140, 0, 0.5)
    `;
    textContent.style.filter = 'sepia(0.9) brightness(1.1) saturate(2) contrast(1.3)';
    textContent.style.transform = 'scale(0.94) rotate(1.2deg)';

    // Generate more embers and start ash
    this.generateEmbers(25);
    this.generateAsh(10);

    await this.sleep(1500);

    // STAGE 5: Collapse to ash (2s)
    HapticService.trigger('medium');

    // Fade flames
    flamesContainer.style.transition = 'opacity 1s ease-out';
    flamesContainer.style.opacity = '0.3';

    // Show smoke
    smokeContainer.style.transition = 'opacity 1s ease-in';
    smokeContainer.style.opacity = '0.6';

    // Text turns to ash
    textContent.style.transition = 'all 2s ease-out';
    textContent.style.borderColor = '#696969';
    textContent.style.backgroundColor = '#2F2F2F';
    textContent.style.color = '#4A4A4A';
    textContent.style.boxShadow = 'inset 0 0 100px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 0, 0, 0.5)';
    textContent.style.filter = 'brightness(0.2) saturate(0) blur(2px)';
    textContent.style.opacity = '0.4';
    textContent.style.transform = 'scale(0.90) rotate(1.5deg)';

    // Lots of ash
    this.generateAsh(30);

    await this.sleep(2000);

    // STAGE 6: Complete destruction - fade to black (1.5s)
    wrapper.style.transition = 'background-color 1.5s ease-out';
    wrapper.style.backgroundColor = '#000';

    textContent.style.transition = 'all 1.5s ease-out';
    textContent.style.opacity = '0';
    textContent.style.transform = 'scale(0.85) rotate(2deg)';

    flamesContainer.style.opacity = '0';
    smokeContainer.style.opacity = '0';

    await this.sleep(1500);

    // Done
    this.onComplete();
  }

  generateEmbers(count) {
    const container = document.getElementById('ember-container');
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const ember = document.createElement('div');
      ember.className = 'ember';

      const left = 10 + Math.random() * 80;
      const bottom = 10 + Math.random() * 80;
      const size = 2 + Math.random() * 4;
      const delay = Math.random() * 300;
      const duration = 1500 + Math.random() * 1000;

      ember.style.cssText = `
        position: absolute;
        left: ${left}%;
        bottom: ${bottom}%;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, #FFA500, #FF4500);
        border-radius: 50%;
        box-shadow: 0 0 ${size * 2}px #FF6347;
        animation: ember-float ${duration}ms ease-out ${delay}ms forwards;
        pointer-events: none;
        opacity: 0;
      `;

      container.appendChild(ember);

      setTimeout(() => ember.remove(), duration + delay + 100);
    }
  }

  generateAsh(count) {
    const container = document.getElementById('ash-container');
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const ash = document.createElement('div');
      ash.className = 'ash-particle';

      const left = Math.random() * 100;
      const delay = Math.random() * 500;
      const duration = 2000 + Math.random() * 1500;
      const size = 3 + Math.random() * 5;

      ash.style.cssText = `
        position: absolute;
        left: ${left}%;
        bottom: 0;
        width: ${size}px;
        height: ${size}px;
        background: rgba(60, 60, 60, ${0.5 + Math.random() * 0.4});
        border-radius: 50%;
        animation: ash-float ${duration}ms ease-out ${delay}ms forwards;
        pointer-events: none;
      `;

      container.appendChild(ash);

      setTimeout(() => ash.remove(), duration + delay + 100);
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
