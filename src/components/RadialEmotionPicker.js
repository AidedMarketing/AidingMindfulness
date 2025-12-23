import { emotions } from '../data/emotions.js';

/**
 * Radial Emotion Picker Component
 * Circular arrangement of emotions with auto-bloom animation
 */
export class RadialEmotionPicker {
  constructor({ onSelect, onSkip }) {
    this.onSelect = onSelect;
    this.onSkip = onSkip;
    this.container = null;
  }

  show(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.render();
    this.attachEventListeners();

    // Auto-bloom after brief delay
    setTimeout(() => {
      this.bloom();
    }, 100);
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'page-container';

    wrapper.innerHTML = `
      <div class="text-center mb-12">
        <h2 class="text-2xl font-medium mb-2">How do you feel now?</h2>
        <p class="text-muted-text dark:text-muted-dark">Optional</p>
      </div>

      <!-- Radial Emotion Layout -->
      <div class="relative w-80 h-80 mb-12" id="emotion-wheel">
        ${this.renderEmotions()}
      </div>

      <!-- Skip Button -->
      <button id="skip-btn" class="btn-secondary">
        Skip
      </button>
    `;

    this.container.appendChild(wrapper);
  }

  renderEmotions() {
    const emotionKeys = Object.keys(emotions);
    const total = emotionKeys.length;
    const radius = 140; // Distance from center
    const centerX = 160; // Half of container width (320px / 2)
    const centerY = 160; // Half of container height (320px / 2)

    return emotionKeys.map((key, index) => {
      const emotion = emotions[key];
      const angle = (index / total) * Math.PI * 2 - Math.PI / 2; // Start from top
      const x = centerX + radius * Math.cos(angle) - 30; // -30 for button width/2
      const y = centerY + radius * Math.sin(angle) - 30; // -30 for button height/2

      return `
        <button
          class="emotion-btn absolute opacity-0"
          data-emotion="${key}"
          style="left: ${centerX - 30}px; top: ${centerY - 30}px; width: 60px; height: 60px;"
          data-final-x="${x}"
          data-final-y="${y}"
        >
          <div class="text-3xl mb-1">${emotion.emoji}</div>
          <div class="text-xs font-medium whitespace-nowrap">${emotion.label}</div>
        </button>
      `;
    }).join('');
  }

  bloom() {
    const buttons = document.querySelectorAll('.emotion-btn');

    buttons.forEach((button, index) => {
      const finalX = parseFloat(button.dataset.finalX);
      const finalY = parseFloat(button.dataset.finalY);

      // Stagger the animation
      setTimeout(() => {
        button.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        button.style.left = `${finalX}px`;
        button.style.top = `${finalY}px`;
        button.style.opacity = '1';
      }, index * 40); // Stagger by 40ms each
    });
  }

  attachEventListeners() {
    // Emotion button clicks
    document.querySelectorAll('.emotion-btn').forEach(button => {
      button.addEventListener('click', () => {
        const emotion = button.dataset.emotion;
        this.selectEmotion(emotion);
      });
    });

    // Skip button
    document.getElementById('skip-btn')?.addEventListener('click', () => {
      this.onSkip();
    });
  }

  selectEmotion(emotionKey) {
    // Visual feedback
    const button = document.querySelector(`[data-emotion="${emotionKey}"]`);
    if (button) {
      button.style.transform = 'scale(1.2)';
      button.style.opacity = '1';

      setTimeout(() => {
        this.onSelect(emotionKey);
      }, 200);
    }
  }
}
