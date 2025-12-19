import { emotions, emotionsList } from '../data/emotions.js';
import { HapticService } from '../services/HapticService.js';

export class EmotionPicker {
  constructor(options = {}) {
    this.isAfterSession = options.isAfterSession || false;
    this.onComplete = options.onComplete;
    this.selectedEmotion = null;
    this.selectedIntensity = null;
    this.container = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'page-container bg-gradient-to-br from-teal-50 to-blue-50';
    container.id = 'emotion-picker';

    const title = this.isAfterSession
      ? 'How are you feeling now?'
      : 'How are you feeling?';

    const subtitle = this.isAfterSession
      ? 'Rate your current emotional state'
      : 'Select your current emotion';

    container.innerHTML = `
      <div class="w-full max-w-2xl mx-auto">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">${title}</h1>
          <p class="text-lg text-gray-600">${subtitle}</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8" id="emotion-grid">
          ${emotionsList.map(key => this.renderEmotionCard(key)).join('')}
        </div>

        <div id="intensity-slider-container" class="hidden">
          <div class="card">
            <h3 class="text-xl font-semibold mb-4 text-center">
              How intense is this feeling?
            </h3>
            <div class="mb-6">
              <input
                type="range"
                min="1"
                max="10"
                value="5"
                class="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                id="intensity-slider"
              />
              <div class="flex justify-between text-sm text-gray-600 mt-2">
                <span>1 - Mild</span>
                <span id="intensity-value" class="text-2xl font-bold text-primary">5</span>
                <span>10 - Intense</span>
              </div>
            </div>
            <button
              id="continue-btn"
              class="btn-primary w-full"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    `;

    this.container = container;
    this.attachEventListeners();

    return container;
  }

  renderEmotionCard(emotionKey) {
    const emotion = emotions[emotionKey];
    return `
      <div
        class="emotion-card bg-gradient-to-br ${emotion.gradient}"
        data-emotion="${emotionKey}"
        role="button"
        tabindex="0"
        aria-label="${emotion.label}"
      >
        <div class="text-6xl mb-2">${emotion.emoji}</div>
        <div class="text-white font-semibold text-lg">${emotion.label}</div>
      </div>
    `;
  }

  attachEventListeners() {
    // Emotion card click handlers
    const emotionCards = this.container.querySelectorAll('.emotion-card');
    emotionCards.forEach(card => {
      card.addEventListener('click', (e) => this.handleEmotionSelect(e));
      card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          this.handleEmotionSelect(e);
        }
      });
    });

    // Intensity slider
    const slider = this.container.querySelector('#intensity-slider');
    const valueDisplay = this.container.querySelector('#intensity-value');
    if (slider && valueDisplay) {
      slider.addEventListener('input', (e) => {
        valueDisplay.textContent = e.target.value;
        this.selectedIntensity = parseInt(e.target.value);
      });
    }

    // Continue button
    const continueBtn = this.container.querySelector('#continue-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => this.handleContinue());
    }
  }

  handleEmotionSelect(e) {
    const emotionKey = e.currentTarget.dataset.emotion;
    this.selectedEmotion = emotionKey;

    HapticService.trigger('selection');

    // Remove previous selections
    const allCards = this.container.querySelectorAll('.emotion-card');
    allCards.forEach(card => {
      card.classList.remove('ring-4', 'ring-white', 'scale-105');
    });

    // Highlight selected card
    e.currentTarget.classList.add('ring-4', 'ring-white', 'scale-105');

    // Show intensity slider
    this.showIntensitySlider(emotionKey);
  }

  showIntensitySlider(emotionKey) {
    const emotion = emotions[emotionKey];
    const sliderContainer = this.container.querySelector('#intensity-slider-container');
    const slider = this.container.querySelector('#intensity-slider');
    const valueDisplay = this.container.querySelector('#intensity-value');

    // Set default intensity for this emotion
    const defaultIntensity = emotion.defaultIntensity;
    slider.value = defaultIntensity;
    valueDisplay.textContent = defaultIntensity;
    this.selectedIntensity = defaultIntensity;

    // Show with animation
    sliderContainer.classList.remove('hidden');
    setTimeout(() => {
      sliderContainer.classList.add('animate-fade-in');
    }, 10);

    // Scroll to slider
    sliderContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  handleContinue() {
    if (!this.selectedEmotion || !this.selectedIntensity) {
      return;
    }

    HapticService.trigger('selection');

    const moodData = {
      emotion: this.selectedEmotion,
      intensity: this.selectedIntensity,
      timestamp: new Date().toISOString()
    };

    if (this.onComplete) {
      this.onComplete(moodData);
    }
  }

  show() {
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = '';
      appContainer.appendChild(this.render());
    }
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
