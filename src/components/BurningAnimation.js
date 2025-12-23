import { HapticService } from '../services/HapticService.js';

/**
 * Burning Animation - Realistic fire consuming from edges
 * Fire spreads from edges inward, actually "eating" the paper
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

        <!-- Layer 5: Black ash (revealed last) -->
        <div class="burn-layer absolute inset-0 text-lg leading-relaxed whitespace-pre-wrap p-8 rounded-lg bg-black text-gray-800 opacity-0" style="z-index: 1;">
          ${escapedText}
        </div>

        <!-- Layer 4: Dark burned paper (revealed fourth) -->
        <div id="burn-layer-4" class="burn-layer absolute inset-0 text-lg leading-relaxed whitespace-pre-wrap p-8 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 text-gray-600" style="z-index: 2; clip-path: circle(0% at 50% 50%);">
          ${escapedText}
        </div>

        <!-- Layer 3: Active fire/orange burning (revealed third) -->
        <div id="burn-layer-3" class="burn-layer absolute inset-0 text-lg leading-relaxed whitespace-pre-wrap p-8 rounded-lg bg-gradient-to-br from-orange-500 via-red-500 to-yellow-400 text-orange-900" style="z-index: 3; clip-path: circle(0% at 50% 50%);">
          ${escapedText}
        </div>

        <!-- Layer 2: Brown charred edges (revealed second) -->
        <div id="burn-layer-2" class="burn-layer absolute inset-0 text-lg leading-relaxed whitespace-pre-wrap p-8 rounded-lg bg-gradient-to-br from-yellow-100 to-orange-200 text-brown-800" style="z-index: 4; clip-path: circle(0% at 50% 50%);">
          ${escapedText}
        </div>

        <!-- Layer 1: Original white paper (on top, gets eaten away) -->
        <div id="burn-layer-1" class="burn-layer relative text-lg leading-relaxed whitespace-pre-wrap p-8 rounded-lg bg-white text-gray-900 shadow-2xl border-2 border-gray-200" style="z-index: 5; clip-path: circle(100% at 50% 50%);">
          ${escapedText}
        </div>

        <!-- Flames overlaying the burning edge -->
        <div id="flames-container" class="absolute inset-0 pointer-events-none opacity-0 overflow-hidden" style="z-index: 6;">
          <div class="flame flame-1"></div>
          <div class="flame flame-2"></div>
          <div class="flame flame-3"></div>
          <div class="flame flame-4"></div>
          <div class="flame flame-5"></div>
        </div>

        <!-- Ember and ash particles -->
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
    const layer1 = document.getElementById('burn-layer-1'); // White paper
    const layer2 = document.getElementById('burn-layer-2'); // Brown char
    const layer3 = document.getElementById('burn-layer-3'); // Orange fire
    const layer4 = document.getElementById('burn-layer-4'); // Dark burn
    const flames = document.getElementById('flames-container');
    const smoke = document.getElementById('smoke-container');
    const wrapper = document.getElementById('burn-wrapper');

    HapticService.trigger('light');

    // STAGE 1: Paper starts to char at edges (1.5s)
    await this.sleep(300);

    // Brown edges appear - reveal from edges
    layer2.style.transition = 'clip-path 1.5s ease-out';
    layer2.style.clipPath = 'circle(30% at 50% 50%)';

    await this.sleep(1500);

    // STAGE 2: Fire ignites and spreads (2.5s)
    HapticService.trigger('heavy');

    // Show flames
    flames.style.transition = 'opacity 0.3s ease-in';
    flames.style.opacity = '1';

    // Orange fire spreads from edges
    layer3.style.transition = 'clip-path 2.5s ease-out';
    layer3.style.clipPath = 'circle(60% at 50% 50%)';

    // White paper gets eaten away
    layer1.style.transition = 'clip-path 2.5s ease-out';
    layer1.style.clipPath = 'circle(40% at 50% 50%)';

    // Generate embers
    this.generateEmbers(20);

    await this.sleep(1200);

    // More embers mid-burn
    this.generateEmbers(25);
    HapticService.trigger('heavy');

    await this.sleep(1300);

    // STAGE 3: Intense burning - fire consumes more (2s)

    // Fire spreads further
    layer3.style.transition = 'clip-path 2s ease-in-out';
    layer3.style.clipPath = 'circle(90% at 50% 50%)';

    // White paper almost gone
    layer1.style.transition = 'clip-path 2s ease-in-out';
    layer1.style.clipPath = 'circle(10% at 50% 50%)';

    // Brown char spreads
    layer2.style.transition = 'clip-path 2s ease-out';
    layer2.style.clipPath = 'circle(70% at 50% 50%)';

    this.generateEmbers(30);

    await this.sleep(2000);

    // STAGE 4: Collapse to dark ash (2s)
    HapticService.trigger('medium');

    // White paper completely gone
    layer1.style.transition = 'clip-path 1s ease-out';
    layer1.style.clipPath = 'circle(0% at 50% 50%)';

    // Fire fades, dark burn spreads
    layer4.style.transition = 'clip-path 2s ease-out';
    layer4.style.clipPath = 'circle(100% at 50% 50%)';

    layer3.style.transition = 'clip-path 2s ease-out, opacity 1s ease-out';
    layer3.style.clipPath = 'circle(100% at 50% 50%)';
    layer3.style.opacity = '0.3';

    // Flames fade
    flames.style.transition = 'opacity 1s ease-out';
    flames.style.opacity = '0.2';

    // Smoke appears
    smoke.style.transition = 'opacity 1s ease-in';
    smoke.style.opacity = '0.6';

    // Lots of ash
    this.generateAsh(35);

    await this.sleep(2000);

    // STAGE 5: Complete destruction (1.5s)

    // Everything fades to black
    wrapper.style.transition = 'background-color 1.5s ease-out';
    wrapper.style.backgroundColor = '#000';

    const allLayers = document.querySelectorAll('.burn-layer');
    allLayers.forEach(layer => {
      layer.style.transition = 'opacity 1.5s ease-out';
      layer.style.opacity = '0';
    });

    flames.style.opacity = '0';
    smoke.style.opacity = '0';

    await this.sleep(1500);

    // Done
    this.onComplete();
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
