import { breathingTechniques } from '../data/breathingTechniques.js';
import { HapticService } from '../services/HapticService.js';

export class BreathingVisualizer {
  constructor(options = {}) {
    this.techniqueName = options.technique;
    this.technique = breathingTechniques[this.techniqueName];
    this.onComplete = options.onComplete;
    this.onQuit = options.onQuit;
    this.container = null;
    this.currentCycle = 0;
    this.currentPhaseIndex = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.visual = null;
    this.phaseTimer = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'page-container bg-gradient-to-br from-primary/10 to-blue-100';
    container.id = 'breathing-visualizer';

    container.innerHTML = `
      <div class="w-full max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-4">
          <h2 class="text-2xl font-bold text-gray-900">${this.technique.name}</h2>
          <p class="text-gray-600">${this.technique.description}</p>
        </div>

        <!-- Progress -->
        <div class="mb-4 text-center">
          <div class="text-lg font-semibold text-gray-700">
            Cycle <span id="current-cycle">1</span> of ${this.technique.cycles}
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div id="progress-bar" class="bg-primary h-2 rounded-full transition-all duration-500" style="width: 0%"></div>
          </div>
        </div>

        <!-- Breathing Visual Container -->
        <div class="relative w-full aspect-square max-w-md mx-auto mb-6">
          <div id="breathing-visual-container" class="w-full h-full flex items-center justify-center">
            <!-- Visual will be injected here -->
          </div>

          <!-- Instruction Overlay -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div id="breathing-instruction" class="text-3xl font-bold text-gray-800 text-center px-4 py-2 bg-white/80 rounded-lg shadow-lg">
              Get ready...
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div class="flex gap-4 justify-center">
          <button id="pause-btn" class="btn-secondary px-8">
            <span id="pause-text">Pause</span>
          </button>
          <button id="quit-btn" class="btn-secondary px-8 bg-red-100 hover:bg-red-200 text-red-700">
            Quit
          </button>
        </div>

        <!-- Technique Info (collapsed) -->
        <div class="mt-6 card max-w-md mx-auto">
          <details>
            <summary class="cursor-pointer font-semibold text-gray-700">About this technique</summary>
            <p class="text-gray-600 mt-2">${this.technique.research}</p>
            <p class="text-sm text-gray-500 mt-2">Best for: ${this.technique.bestFor.join(', ')}</p>
          </details>
        </div>
      </div>
    `;

    this.container = container;
    this.attachEventListeners();
    this.initVisual();

    return container;
  }

  initVisual() {
    const visualContainer = this.container.querySelector('#breathing-visual-container');

    switch (this.technique.visualType) {
      case 'circle':
        this.visual = new CircleBreathingVisual(visualContainer, {
          color: '#4ECDC4'
        });
        break;
      case 'box':
        this.visual = new BoxBreathingVisual(visualContainer, {
          color: '#4ECDC4'
        });
        break;
      case 'wave':
        this.visual = new WaveBreathingVisual(visualContainer, {
          color: '#4ECDC4'
        });
        break;
    }
  }

  attachEventListeners() {
    const pauseBtn = this.container.querySelector('#pause-btn');
    const quitBtn = this.container.querySelector('#quit-btn');

    pauseBtn?.addEventListener('click', () => this.togglePause());
    quitBtn?.addEventListener('click', () => this.quit());
  }

  async start() {
    this.isRunning = true;
    this.currentCycle = 1;
    HapticService.trigger('sessionStart');

    await this.runSession();
  }

  async runSession() {
    while (this.currentCycle <= this.technique.cycles && this.isRunning) {
      // Update cycle display
      this.updateCycleDisplay();

      // Run all phases in this cycle
      for (let i = 0; i < this.technique.phases.length; i++) {
        if (!this.isRunning) break;

        // Wait if paused
        while (this.isPaused && this.isRunning) {
          await this.sleep(100);
        }

        if (!this.isRunning) break;

        this.currentPhaseIndex = i;
        const phase = this.technique.phases[i];

        // Trigger haptic feedback
        if (phase.haptic && phase.haptic !== 'none') {
          HapticService.trigger(phase.haptic);
        }

        // Update instruction
        this.updateInstruction(phase.instruction);

        // Animate visual
        await this.visual.animatePhase(phase);
      }

      // Cycle complete
      if (this.isRunning) {
        HapticService.trigger('cycleComplete');
        this.currentCycle++;
        this.updateProgress();
      }
    }

    // Session complete
    if (this.isRunning && this.currentCycle > this.technique.cycles) {
      this.complete();
    }
  }

  updateCycleDisplay() {
    const cycleEl = this.container.querySelector('#current-cycle');
    if (cycleEl) {
      cycleEl.textContent = this.currentCycle;
    }
  }

  updateProgress() {
    const progressBar = this.container.querySelector('#progress-bar');
    if (progressBar) {
      const progress = ((this.currentCycle - 1) / this.technique.cycles) * 100;
      progressBar.style.width = `${progress}%`;
    }
  }

  updateInstruction(text) {
    const instructionEl = this.container.querySelector('#breathing-instruction');
    if (instructionEl) {
      instructionEl.textContent = text;
      instructionEl.classList.add('animate-pulse');
      setTimeout(() => instructionEl.classList.remove('animate-pulse'), 500);
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const pauseText = this.container.querySelector('#pause-text');

    if (this.isPaused) {
      pauseText.textContent = 'Resume';
      this.updateInstruction('Paused');
      HapticService.trigger('selection');
    } else {
      pauseText.textContent = 'Pause';
      HapticService.trigger('selection');
    }
  }

  quit() {
    this.isRunning = false;
    this.isPaused = false;
    HapticService.trigger('selection');

    if (this.onQuit) {
      this.onQuit();
    }
  }

  complete() {
    this.isRunning = false;
    HapticService.trigger('sessionComplete');
    this.updateInstruction('Session Complete!');

    setTimeout(() => {
      if (this.onComplete) {
        this.onComplete();
      }
    }, 2000);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  show() {
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = '';
      appContainer.appendChild(this.render());
      // Start automatically after a short delay
      setTimeout(() => this.start(), 1000);
    }
  }

  destroy() {
    this.isRunning = false;
    if (this.phaseTimer) {
      clearTimeout(this.phaseTimer);
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

// Circle Breathing Visual
class CircleBreathingVisual {
  constructor(container, config) {
    this.container = container;
    this.config = config;
    this.svg = null;
    this.circle = null;
    this.init();
  }

  init() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 300 300');
    svg.setAttribute('class', 'w-full h-full');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '150');
    circle.setAttribute('cy', '150');
    circle.setAttribute('r', '50');
    circle.setAttribute('fill', this.config.color);
    circle.setAttribute('opacity', '0.7');
    circle.setAttribute('class', 'breathing-circle');

    svg.appendChild(circle);
    this.container.appendChild(svg);

    this.svg = svg;
    this.circle = circle;
  }

  async animatePhase(phase) {
    const { duration, name } = phase;

    if (name === 'inhale') {
      return this.expand(duration);
    } else if (name === 'exhale') {
      return this.contract(duration);
    } else {
      return this.hold(duration);
    }
  }

  expand(duration) {
    return new Promise(resolve => {
      this.circle.style.transition = `all ${duration}s ease-in-out`;
      this.circle.setAttribute('r', '120');
      setTimeout(resolve, duration * 1000);
    });
  }

  contract(duration) {
    return new Promise(resolve => {
      this.circle.style.transition = `all ${duration}s ease-in-out`;
      this.circle.setAttribute('r', '50');
      setTimeout(resolve, duration * 1000);
    });
  }

  hold(duration) {
    return new Promise(resolve => {
      setTimeout(resolve, duration * 1000);
    });
  }
}

// Box Breathing Visual
class BoxBreathingVisual {
  constructor(container, config) {
    this.container = container;
    this.config = config;
    this.svg = null;
    this.ball = null;
    this.box = null;
    this.init();
  }

  init() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 300 300');
    svg.setAttribute('class', 'w-full h-full');

    // Draw box outline
    const box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    box.setAttribute('x', '50');
    box.setAttribute('y', '50');
    box.setAttribute('width', '200');
    box.setAttribute('height', '200');
    box.setAttribute('fill', 'none');
    box.setAttribute('stroke', this.config.color);
    box.setAttribute('stroke-width', '4');
    box.setAttribute('opacity', '0.3');

    // Ball that moves around the box
    const ball = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ball.setAttribute('cx', '50');
    ball.setAttribute('cy', '250');
    ball.setAttribute('r', '15');
    ball.setAttribute('fill', this.config.color);

    svg.appendChild(box);
    svg.appendChild(ball);
    this.container.appendChild(svg);

    this.svg = svg;
    this.ball = ball;
    this.box = box;
  }

  async animatePhase(phase) {
    const { duration, name } = phase;

    switch (name) {
      case 'inhale':
        return this.moveUp(duration);
      case 'hold-full':
        return this.moveRight(duration);
      case 'exhale':
        return this.moveDown(duration);
      case 'hold-empty':
        return this.moveLeft(duration);
      default:
        return this.hold(duration);
    }
  }

  moveUp(duration) {
    return new Promise(resolve => {
      this.ball.style.transition = `all ${duration}s linear`;
      this.ball.setAttribute('cx', '50');
      this.ball.setAttribute('cy', '50');
      setTimeout(resolve, duration * 1000);
    });
  }

  moveRight(duration) {
    return new Promise(resolve => {
      this.ball.style.transition = `all ${duration}s linear`;
      this.ball.setAttribute('cx', '250');
      this.ball.setAttribute('cy', '50');
      setTimeout(resolve, duration * 1000);
    });
  }

  moveDown(duration) {
    return new Promise(resolve => {
      this.ball.style.transition = `all ${duration}s linear`;
      this.ball.setAttribute('cx', '250');
      this.ball.setAttribute('cy', '250');
      setTimeout(resolve, duration * 1000);
    });
  }

  moveLeft(duration) {
    return new Promise(resolve => {
      this.ball.style.transition = `all ${duration}s linear`;
      this.ball.setAttribute('cx', '50');
      this.ball.setAttribute('cy', '250');
      setTimeout(resolve, duration * 1000);
    });
  }

  hold(duration) {
    return new Promise(resolve => {
      setTimeout(resolve, duration * 1000);
    });
  }
}

// Wave Breathing Visual
class WaveBreathingVisual {
  constructor(container, config) {
    this.container = container;
    this.config = config;
    this.svg = null;
    this.wave = null;
    this.init();
  }

  init() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 300 300');
    svg.setAttribute('class', 'w-full h-full');

    // Create sine wave path
    const wave = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    wave.setAttribute('d', this.getSinePath(150));
    wave.setAttribute('stroke', this.config.color);
    wave.setAttribute('stroke-width', '8');
    wave.setAttribute('fill', 'none');
    wave.setAttribute('stroke-linecap', 'round');

    svg.appendChild(wave);
    this.container.appendChild(svg);

    this.svg = svg;
    this.wave = wave;
  }

  getSinePath(y) {
    const amplitude = 50;
    const frequency = 2;
    const points = [];

    for (let x = 0; x <= 300; x += 2) {
      const yPos = y + amplitude * Math.sin((x / 300) * Math.PI * frequency);
      points.push(`${x},${yPos}`);
    }

    return 'M' + points.join(' L');
  }

  async animatePhase(phase) {
    const { duration, name } = phase;

    if (name === 'inhale') {
      return this.riseWave(duration);
    } else if (name === 'exhale') {
      return this.lowerWave(duration);
    } else {
      return this.hold(duration);
    }
  }

  riseWave(duration) {
    return new Promise(resolve => {
      this.wave.style.transition = `all ${duration}s ease-in-out`;
      this.wave.setAttribute('d', this.getSinePath(100));
      setTimeout(resolve, duration * 1000);
    });
  }

  lowerWave(duration) {
    return new Promise(resolve => {
      this.wave.style.transition = `all ${duration}s ease-in-out`;
      this.wave.setAttribute('d', this.getSinePath(200));
      setTimeout(resolve, duration * 1000);
    });
  }

  hold(duration) {
    return new Promise(resolve => {
      setTimeout(resolve, duration * 1000);
    });
  }
}
