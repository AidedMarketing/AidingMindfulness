export class HapticService {
  static isSupported = 'vibrate' in navigator;
  static isEnabled = true;

  static patterns = {
    sessionStart: [100, 50, 100],
    inhaleStart: [50],
    inhaleTick: [10],
    exhaleStart: [50, 50, 50],
    phaseComplete: [30],
    cycleComplete: [50, 50, 50],
    sessionComplete: [100, 100, 100, 100, 200],
    boxCorner: [20],
    selection: [30],
    error: [100, 50, 100, 50, 100],
    none: []
  };

  static trigger(patternName) {
    if (!this.isSupported || !this.isEnabled) return;

    const pattern = this.patterns[patternName];
    if (pattern && pattern.length > 0) {
      navigator.vibrate(pattern);
    }
  }

  static enable() {
    this.isEnabled = true;
    localStorage.setItem('haptic_enabled', 'true');
  }

  static disable() {
    this.isEnabled = false;
    localStorage.setItem('haptic_enabled', 'false');
  }

  static toggle() {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.isEnabled;
  }

  static loadPreference() {
    const pref = localStorage.getItem('haptic_enabled');
    this.isEnabled = pref !== 'false';
    return this.isEnabled;
  }

  static getStatus() {
    return {
      supported: this.isSupported,
      enabled: this.isEnabled
    };
  }
}
