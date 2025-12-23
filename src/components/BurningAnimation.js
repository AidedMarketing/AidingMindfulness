import { HapticService } from '../services/HapticService.js';

/**
 * Burning Animation - Multiple organic burn holes spreading from edges
 * Simulates realistic fire consuming paper with multiple ignition points
 */
export class BurningAnimation {
  constructor({ text, onComplete }) {
    this.text = text;
    this.onComplete = onComplete;
    this.container = null;
    this.burnHoles = [];
  }

  show(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.render();
    this.startAnimation();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'fixed inset-0 bg-cream dark:bg-charcoal z-50 flex items-center justify-center overflow-hidden';
    wrapper.id = 'burn-wrapper';

    const escapedText = this.escapeHtml(this.text);

    // Scale text to fit viewport if it's too long
    const textLength = this.text.length;
    const fontSize = textLength > 2000 ? '14px' : textLength > 1000 ? '16px' : '18px';
    const lineHeight = textLength > 2000 ? '1.5' : '1.7';

    wrapper.innerHTML = `
      <div id="burning-stage" class="relative w-full max-w-2xl mx-auto" style="max-height: 85vh;">

        <!-- Background ash layer (final state) -->
        <div id="ash-background" class="absolute inset-0 bg-black opacity-0 transition-opacity duration-1000" style="z-index: 1;"></div>

        <!-- Paper container with burn holes mask -->
        <div id="paper-container" class="relative bg-white dark:bg-gray-100 rounded-lg shadow-2xl border-2 border-gray-200 overflow-hidden" style="z-index: 2;">

          <!-- The actual paper with text -->
          <div id="paper-content" class="relative p-8 text-gray-900 leading-relaxed whitespace-pre-wrap" style="font-size: ${fontSize}; line-height: ${lineHeight}; max-height: 85vh; overflow-y: auto;">
            ${escapedText}
          </div>

          <!-- Char layer (shows through burn holes) -->
          <div id="char-layer" class="absolute inset-0 p-8 leading-relaxed whitespace-pre-wrap opacity-0 pointer-events-none"
               style="font-size: ${fontSize}; line-height: ${lineHeight}; background: linear-gradient(135deg, #2c2416 0%, #1a1410 50%, #000 100%); color: #4a4238; z-index: 3; overflow-y: auto;">
            ${escapedText}
          </div>

          <!-- Burn holes container -->
          <div id="burn-holes" class="absolute inset-0 pointer-events-none" style="z-index: 4;">
            <!-- Burn holes will be added dynamically -->
          </div>

          <!-- Fire glow overlay -->
          <div id="fire-overlay" class="absolute inset-0 pointer-events-none opacity-0" style="z-index: 5;">
            <div class="absolute inset-0 bg-gradient-radial from-orange-400/20 via-red-500/10 to-transparent" style="filter: blur(30px);"></div>
          </div>

        </div>

        <!-- Flame particles -->
        <div id="flames-container" class="absolute inset-0 pointer-events-none opacity-0 overflow-visible" style="z-index: 6;">
          <div class="flame flame-1" style="left: 20%; bottom: 10%;"></div>
          <div class="flame flame-2" style="right: 25%; bottom: 15%;"></div>
          <div class="flame flame-3" style="left: 60%; bottom: 8%;"></div>
          <div class="flame flame-4" style="right: 45%; bottom: 12%;"></div>
          <div class="flame flame-5" style="left: 40%; bottom: 20%;"></div>
        </div>

        <!-- Ember particles -->
        <div id="ember-container" class="absolute inset-0 pointer-events-none" style="z-index: 7;"></div>

        <!-- Ash particles -->
        <div id="ash-container" class="absolute inset-0 pointer-events-none" style="z-index: 8;"></div>

        <!-- Smoke -->
        <div id="smoke-container" class="absolute inset-0 pointer-events-none opacity-0" style="z-index: 9;">
          <div class="smoke smoke-1"></div>
          <div class="smoke smoke-2"></div>
          <div class="smoke smoke-3"></div>
        </div>

      </div>
    `;

    this.container.appendChild(wrapper);
  }

  async startAnimation() {
    const paperContainer = document.getElementById('paper-container');
    const paperContent = document.getElementById('paper-content');
    const charLayer = document.getElementById('char-layer');
    const burnHolesContainer = document.getElementById('burn-holes');
    const fireOverlay = document.getElementById('fire-overlay');
    const flames = document.getElementById('flames-container');
    const smoke = document.getElementById('smoke-container');
    const ashBackground = document.getElementById('ash-background');
    const wrapper = document.getElementById('burn-wrapper');

    HapticService.trigger('light');
    await this.sleep(400);

    // STAGE 1: Initial ignition - create burn holes at edges (0.5s)
    const ignitionPoints = this.createIgnitionPoints(10);

    ignitionPoints.forEach((point, index) => {
      setTimeout(() => {
        this.createBurnHole(burnHolesContainer, point, index);
        if (index % 3 === 0) {
          this.generateEmbers(3);
        }
      }, index * 80);
    });

    // Show fire glow
    fireOverlay.style.transition = 'opacity 0.5s ease-in';
    fireOverlay.style.opacity = '0.7';

    // Paper starts to brown slightly
    paperContent.style.transition = 'filter 1s ease-out';
    paperContent.style.filter = 'brightness(0.95) sepia(0.1)';

    await this.sleep(1000);

    // STAGE 2: Fire spreads - burn holes grow (3s)
    HapticService.trigger('heavy');

    flames.style.transition = 'opacity 0.5s ease-in';
    flames.style.opacity = '1';

    // Char layer starts showing through
    charLayer.style.transition = 'opacity 2s ease-in';
    charLayer.style.opacity = '0.4';

    // Grow all burn holes
    this.burnHoles.forEach((hole, index) => {
      setTimeout(() => {
        hole.growth = 2.5;
        this.updateBurnHole(hole);

        if (index % 2 === 0) {
          this.generateEmbers(4);
        }
      }, index * 100);
    });

    await this.sleep(1500);

    // STAGE 3: Intense burning - holes expand rapidly (2.5s)
    HapticService.trigger('heavy');
    this.generateEmbers(25);

    charLayer.style.opacity = '0.8';
    paperContent.style.filter = 'brightness(0.8) sepia(0.3) contrast(1.1)';

    // Burn holes grow larger
    this.burnHoles.forEach((hole, index) => {
      setTimeout(() => {
        hole.growth = 5;
        this.updateBurnHole(hole);

        if (index % 3 === 0) {
          this.generateEmbers(5);
        }
      }, index * 80);
    });

    await this.sleep(1200);

    // More aggressive burning
    this.burnHoles.forEach((hole) => {
      hole.growth = 8;
      this.updateBurnHole(hole);
    });

    this.generateEmbers(30);

    await this.sleep(1300);

    // STAGE 4: Paper consumed - massive burn coverage (2s)
    charLayer.style.opacity = '1';
    charLayer.style.filter = 'blur(0.5px)';

    // Final expansion of burn holes
    this.burnHoles.forEach((hole, index) => {
      setTimeout(() => {
        hole.growth = 14;
        this.updateBurnHole(hole);
      }, index * 50);
    });

    this.generateEmbers(35);

    // Paper fades away
    paperContent.style.transition = 'opacity 2s ease-out';
    paperContent.style.opacity = '0';

    await this.sleep(2000);

    // STAGE 5: Collapse to ash (2s)
    HapticService.trigger('medium');

    // Fire fades
    fireOverlay.style.transition = 'opacity 1.5s ease-out';
    fireOverlay.style.opacity = '0.2';

    flames.style.transition = 'opacity 1s ease-out';
    flames.style.opacity = '0.3';

    // Smoke rises
    smoke.style.transition = 'opacity 1s ease-in';
    smoke.style.opacity = '0.6';

    // Char crumbles
    charLayer.style.transition = 'opacity 1.5s ease-out, filter 1.5s ease-out';
    charLayer.style.filter = 'blur(2px)';

    this.generateAsh(45);

    // Ash background visible
    ashBackground.style.opacity = '1';

    await this.sleep(2000);

    // STAGE 6: Complete destruction (1.5s)
    wrapper.style.transition = 'background-color 1.5s ease-out';
    wrapper.style.backgroundColor = '#000';

    paperContainer.style.transition = 'opacity 1.5s ease-out, transform 1.5s ease-out';
    paperContainer.style.opacity = '0';
    paperContainer.style.transform = 'scale(0.95)';

    flames.style.opacity = '0';
    smoke.style.opacity = '0';

    await this.sleep(1500);

    // Done
    this.onComplete();
  }

  /**
   * Create random ignition points around the edges
   */
  createIgnitionPoints(count) {
    const points = [];
    const edges = ['top', 'right', 'bottom', 'left'];

    for (let i = 0; i < count; i++) {
      const edge = edges[i % edges.length];
      let x, y;

      switch (edge) {
        case 'top':
          x = 10 + Math.random() * 80;
          y = Math.random() * 15;
          break;
        case 'right':
          x = 85 + Math.random() * 15;
          y = 10 + Math.random() * 80;
          break;
        case 'bottom':
          x = 10 + Math.random() * 80;
          y = 85 + Math.random() * 15;
          break;
        case 'left':
          x = Math.random() * 15;
          y = 10 + Math.random() * 80;
          break;
      }

      points.push({ x, y, edge });
    }

    return points;
  }

  /**
   * Create a single burn hole element
   */
  createBurnHole(container, point, index) {
    const hole = document.createElement('div');
    hole.className = 'burn-hole';
    hole.id = `burn-hole-${index}`;

    const baseSize = 30 + Math.random() * 20;

    hole.style.cssText = `
      position: absolute;
      left: ${point.x}%;
      top: ${point.y}%;
      width: ${baseSize}px;
      height: ${baseSize}px;
      transform: translate(-50%, -50%);
      pointer-events: none;
    `;

    // Inner black hole (the actual burn)
    const innerHole = document.createElement('div');
    innerHole.style.cssText = `
      position: absolute;
      inset: 0;
      background: radial-gradient(circle, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 60%, transparent 100%);
      border-radius: 50%;
      filter: blur(2px);
    `;

    // Char ring (brown/dark around burn)
    const charRing = document.createElement('div');
    charRing.style.cssText = `
      position: absolute;
      inset: -20%;
      background: radial-gradient(circle, transparent 40%, rgba(60,40,20,0.8) 60%, rgba(100,60,30,0.4) 80%, transparent 100%);
      border-radius: 50%;
      filter: blur(3px);
    `;

    // Fire glow (orange glow at edge)
    const fireGlow = document.createElement('div');
    fireGlow.style.cssText = `
      position: absolute;
      inset: -40%;
      background: radial-gradient(circle, transparent 50%, rgba(255,120,0,0.3) 70%, rgba(255,80,0,0.2) 85%, transparent 100%);
      border-radius: 50%;
      filter: blur(8px);
      animation: burn-pulse 0.8s ease-in-out infinite alternate;
    `;

    hole.appendChild(charRing);
    hole.appendChild(fireGlow);
    hole.appendChild(innerHole);
    container.appendChild(hole);

    // Store reference for later updates
    this.burnHoles.push({
      element: hole,
      x: point.x,
      y: point.y,
      baseSize,
      growth: 1,
      index
    });
  }

  /**
   * Update burn hole size as it grows
   */
  updateBurnHole(hole) {
    const newSize = hole.baseSize * hole.growth;
    hole.element.style.transition = 'width 0.8s ease-out, height 0.8s ease-out';
    hole.element.style.width = `${newSize}px`;
    hole.element.style.height = `${newSize}px`;
  }

  generateEmbers(count) {
    const container = document.getElementById('ember-container');
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const ember = document.createElement('div');

      const left = 10 + Math.random() * 80;
      const bottom = 5 + Math.random() * 80;
      const size = 2 + Math.random() * 4;
      const delay = Math.random() * 300;
      const duration = 1200 + Math.random() * 800;

      ember.style.cssText = `
        position: absolute;
        left: ${left}%;
        bottom: ${bottom}%;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, #FFD700, #FF6347);
        border-radius: 50%;
        box-shadow: 0 0 ${size * 2}px rgba(255, 100, 0, 0.6);
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
      const delay = Math.random() * 500;
      const duration = 2000 + Math.random() * 1500;
      const size = 3 + Math.random() * 5;

      ash.style.cssText = `
        position: absolute;
        left: ${left}%;
        bottom: 10%;
        width: ${size}px;
        height: ${size}px;
        background: rgba(50, 50, 50, ${0.5 + Math.random() * 0.3});
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
