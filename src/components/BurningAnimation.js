import { HapticService } from '../services/HapticService.js';

/**
 * Burning Animation - Organic fire consuming from multiple edge points
 * Creates irregular burn patterns with glowing edges
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

    const escapedText = this.escapeHtml(this.text);

    wrapper.innerHTML = `
      <div id="burning-stage" class="max-w-2xl w-full relative">

        <!-- Black ash background (final state) -->
        <div id="ash-layer" class="absolute inset-0 text-lg leading-relaxed whitespace-pre-wrap p-8 rounded-lg bg-black text-gray-900 opacity-0" style="z-index: 1;">
          ${escapedText}
        </div>

        <!-- Dark charred paper layer -->
        <div id="char-layer" class="absolute inset-0 text-lg leading-relaxed whitespace-pre-wrap p-8 rounded-lg bg-gradient-to-br from-gray-800 via-gray-900 to-black text-gray-700 opacity-0" style="z-index: 2; filter: blur(0px);">
          ${escapedText}
        </div>

        <!-- White paper with burn holes -->
        <div id="paper-layer" class="relative text-lg leading-relaxed whitespace-pre-wrap p-8 rounded-lg bg-white text-gray-900 shadow-2xl border-2 border-gray-200" style="z-index: 3;">
          ${escapedText}
        </div>

        <!-- Fire glow overlay (edge lighting only) -->
        <div id="fire-glow" class="absolute inset-0 pointer-events-none opacity-0" style="z-index: 4;">
          <div class="absolute inset-0 bg-gradient-radial from-transparent via-orange-500/30 to-orange-600/50" style="filter: blur(20px);"></div>
        </div>

        <!-- Burn masks (invisible divs that create burn pattern) -->
        <div id="burn-mask-1" class="absolute rounded-full bg-transparent opacity-0" style="z-index: 5; mix-blend-mode: multiply;"></div>
        <div id="burn-mask-2" class="absolute rounded-full bg-transparent opacity-0" style="z-index: 5; mix-blend-mode: multiply;"></div>
        <div id="burn-mask-3" class="absolute rounded-full bg-transparent opacity-0" style="z-index: 5; mix-blend-mode: multiply;"></div>
        <div id="burn-mask-4" class="absolute rounded-full bg-transparent opacity-0" style="z-index: 5; mix-blend-mode: multiply;"></div>

        <!-- Flames at burning edges -->
        <div id="flames-container" class="absolute inset-0 pointer-events-none opacity-0 overflow-hidden" style="z-index: 6;">
          <div class="flame flame-1"></div>
          <div class="flame flame-2"></div>
          <div class="flame flame-3"></div>
          <div class="flame flame-4"></div>
          <div class="flame flame-5"></div>
        </div>

        <!-- Particle effects -->
        <div id="ember-container" class="absolute inset-0 pointer-events-none" style="z-index: 7;"></div>
        <div id="ash-container" class="absolute inset-0 pointer-events-none" style="z-index: 7;"></div>

        <!-- Smoke -->
        <div id="smoke-container" class="absolute inset-0 pointer-events-none opacity-0" style="z-index: 8;">
          <div class="smoke smoke-1"></div>
          <div class="smoke smoke-2"></div>
          <div class="smoke smoke-3"></div>
        </div>
      </div>
    `;

    this.container.appendChild(wrapper);
  }

  async startAnimation() {
    const paperLayer = document.getElementById('paper-layer');
    const charLayer = document.getElementById('char-layer');
    const ashLayer = document.getElementById('ash-layer');
    const fireGlow = document.getElementById('fire-glow');
    const flames = document.getElementById('flames-container');
    const smoke = document.getElementById('smoke-container');
    const wrapper = document.getElementById('burn-wrapper');

    HapticService.trigger('light');
    await this.sleep(500);

    // STAGE 1: Initial char appears at edges (1.5s)
    // Paper starts to brown and curl at edges
    paperLayer.style.transition = 'filter 1.5s ease-out, transform 1.5s ease-out';
    paperLayer.style.filter = 'brightness(0.95) sepia(0.1)';

    await this.sleep(1500);

    // STAGE 2: Fire ignites - burn from multiple points (3s)
    HapticService.trigger('heavy');

    // Show fire glow at edges
    fireGlow.style.transition = 'opacity 0.5s ease-in';
    fireGlow.style.opacity = '1';

    // Show flames
    flames.style.transition = 'opacity 0.5s ease-in';
    flames.style.opacity = '1';

    // Start burning from corners - create irregular burn pattern
    this.createBurnPattern(paperLayer, 1);
    this.generateEmbers(15);

    await this.sleep(1000);

    // Char layer starts showing through
    charLayer.style.transition = 'opacity 2s ease-in';
    charLayer.style.opacity = '0.3';

    await this.sleep(500);

    // STAGE 3: Fire spreads - more aggressive burning (2.5s)
    this.createBurnPattern(paperLayer, 2);
    this.generateEmbers(20);
    HapticService.trigger('heavy');

    await this.sleep(1000);

    charLayer.style.transition = 'opacity 1.5s ease-in';
    charLayer.style.opacity = '0.7';

    this.createBurnPattern(paperLayer, 3);
    this.generateEmbers(25);

    await this.sleep(1500);

    // STAGE 4: Paper mostly consumed (2s)
    this.createBurnPattern(paperLayer, 4);

    charLayer.style.opacity = '1';
    charLayer.style.filter = 'blur(1px)';

    paperLayer.style.transition = 'opacity 2s ease-out';
    paperLayer.style.opacity = '0';

    this.generateEmbers(20);

    await this.sleep(2000);

    // STAGE 5: Collapse to ash (2s)
    HapticService.trigger('medium');

    // Fire fades
    fireGlow.style.transition = 'opacity 1.5s ease-out';
    fireGlow.style.opacity = '0.3';

    flames.style.transition = 'opacity 1s ease-out';
    flames.style.opacity = '0.2';

    // Smoke rises
    smoke.style.transition = 'opacity 1s ease-in';
    smoke.style.opacity = '0.6';

    // Char crumbles to ash
    charLayer.style.transition = 'opacity 1.5s ease-out, filter 1.5s ease-out';
    charLayer.style.opacity = '0.5';
    charLayer.style.filter = 'blur(3px)';

    ashLayer.style.transition = 'opacity 2s ease-in';
    ashLayer.style.opacity = '1';

    this.generateAsh(40);

    await this.sleep(2000);

    // STAGE 6: Complete destruction (1.5s)
    wrapper.style.transition = 'background-color 1.5s ease-out';
    wrapper.style.backgroundColor = '#000';

    charLayer.style.opacity = '0';
    ashLayer.style.opacity = '0';
    fireGlow.style.opacity = '0';
    flames.style.opacity = '0';
    smoke.style.opacity = '0';

    await this.sleep(1500);

    // Done
    this.onComplete();
  }

  /**
   * Creates irregular burn pattern that spreads across the paper
   * Stage 1-4 represent progressive burning
   */
  createBurnPattern(paperLayer, stage) {
    const patterns = {
      1: {
        // Initial char - small irregular burns at corners
        clipPath: `polygon(
          8% 0%, 92% 0%, 100% 8%, 100% 92%, 92% 100%, 8% 100%, 0% 92%, 0% 8%
        )`,
        filter: 'brightness(0.9) sepia(0.2) contrast(1.1)',
        transform: 'scale(0.99)'
      },
      2: {
        // Fire spreading - more irregular edges
        clipPath: `polygon(
          15% 2%, 85% 3%, 97% 15%, 98% 85%, 88% 97%, 12% 98%, 3% 88%, 2% 12%
        )`,
        filter: 'brightness(0.85) sepia(0.35) contrast(1.15)',
        transform: 'scale(0.96) rotate(0.5deg)'
      },
      3: {
        // Heavy burning - jagged edges consuming inward
        clipPath: `polygon(
          25% 8%, 75% 5%, 92% 20%, 95% 80%, 82% 92%, 18% 95%, 8% 82%, 5% 18%
        )`,
        filter: 'brightness(0.75) sepia(0.5) contrast(1.2)',
        transform: 'scale(0.90) rotate(1deg)'
      },
      4: {
        // Almost consumed - small fragment remains
        clipPath: `polygon(
          35% 20%, 65% 18%, 80% 35%, 82% 65%, 68% 80%, 32% 82%, 20% 68%, 18% 32%
        )`,
        filter: 'brightness(0.6) sepia(0.7) contrast(1.3)',
        transform: 'scale(0.82) rotate(1.5deg)'
      }
    };

    const pattern = patterns[stage];
    if (!pattern) return;

    const duration = stage === 1 ? '1.5s' : stage === 2 ? '2s' : '1.8s';

    paperLayer.style.transition = `clip-path ${duration} ease-out, filter ${duration} ease-out, transform ${duration} ease-out`;
    paperLayer.style.clipPath = pattern.clipPath;
    paperLayer.style.filter = pattern.filter;
    paperLayer.style.transform = pattern.transform;
  }

  generateEmbers(count) {
    const container = document.getElementById('ember-container');
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const ember = document.createElement('div');

      const left = 10 + Math.random() * 80;
      const bottom = 10 + Math.random() * 80;
      const size = 3 + Math.random() * 5;
      const delay = Math.random() * 400;
      const duration = 1500 + Math.random() * 1000;

      ember.style.cssText = `
        position: absolute;
        left: ${left}%;
        bottom: ${bottom}%;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, #FFD700, #FF6347);
        border-radius: 50%;
        box-shadow: 0 0 ${size * 3}px rgba(255, 100, 0, 0.8);
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

      const left = Math.random() * 100;
      const delay = Math.random() * 600;
      const duration = 2500 + Math.random() * 1500;
      const size = 4 + Math.random() * 6;

      ash.style.cssText = `
        position: absolute;
        left: ${left}%;
        bottom: 10%;
        width: ${size}px;
        height: ${size}px;
        background: rgba(60, 60, 60, ${0.6 + Math.random() * 0.3});
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
