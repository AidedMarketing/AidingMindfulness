# 🧘 Aiding Mindfulness

An AI-powered Progressive Web App (PWA) for breathing exercises and reflective journaling that helps users manage their emotional state.

## ✨ Features

### Core Functionality
- **🎯 AI-Powered Recommendations**: Personalized breathing technique recommendations based on your mood, history, and time of day
- **🫁 Guided Breathing Sessions**: Beautiful visual animations (circle, box, wave) with haptic feedback
- **✍️ Reflective Journaling**: AI-generated journal prompts to help process emotions
- **📊 Progress Tracking**: Calendar view, streak tracking, and mood improvement analytics
- **🔒 Privacy-First**: All data stored locally using IndexedDB - nothing leaves your device

### Breathing Techniques
1. **4-7-8 Breathing** (5 min, 8 cycles)
   - Activates parasympathetic nervous system
   - Best for: anxiety, sleep preparation, acute stress

2. **Box Breathing** (5 min, 12 cycles)
   - Creates autonomic balance and mental clarity
   - Best for: stress management, focus, performance

3. **Coherent Breathing** (10 min, 55 cycles)
   - Optimizes heart rate variability
   - Best for: daily practice, building resilience

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development
The app will be available at `http://localhost:3000` (or the port shown in your terminal).

## 🔧 Configuration

### Claude API Key (Optional)
The app works perfectly fine without an API key using intelligent fallback logic. However, for enhanced AI-powered recommendations and journal prompts:

1. Open Settings in the app
2. Enter your Claude API key (get one at https://console.anthropic.com/)
3. Click Save

Without an API key, the app uses rule-based recommendations that are still highly effective.

## 📱 Installing as PWA

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Name it "Mindfulness" and tap "Add"

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home Screen"
4. Confirm the installation

### Desktop (Chrome/Edge)
1. Look for the install icon in the address bar
2. Click "Install"
3. The app will open in its own window

## 🎨 Tech Stack

- **Framework**: Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Storage**: IndexedDB
- **AI Integration**: Anthropic Claude API
- **PWA**: Service Workers + Web Manifest

## 📖 User Flow

1. **Mood Check-In**: Select your current emotion and rate intensity (1-10)
2. **AI Recommendation**: Get a personalized breathing technique recommendation
3. **Breathing Session**: Follow the visual guide for 5-10 minutes
4. **Post-Session Check**: Rate your mood again
5. **Journal Prompt**: Optional reflective journaling with AI-generated prompt
6. **Complete**: View your progress and mood improvement

## 🔐 Privacy & Data

- **100% Local Storage**: All data stored in your browser's IndexedDB
- **No Tracking**: No analytics, no cookies, no third-party scripts (except Claude API if configured)
- **Export Anytime**: Export your data as JSON from Settings
- **Offline-First**: Works completely offline once installed

## 📁 Project Structure

```
aiding-mindfulness/
├── index.html              # Main HTML entry point
├── src/
│   ├── main.js            # App controller and orchestration
│   ├── styles/
│   │   └── main.css       # Tailwind CSS styles
│   ├── components/
│   │   ├── EmotionPicker.js       # Mood selection UI
│   │   ├── BreathingVisualizer.js # Breathing animations
│   │   ├── JournalPrompt.js       # Journal entry UI
│   │   └── CalendarView.js        # Calendar & history
│   ├── services/
│   │   ├── StorageService.js      # IndexedDB wrapper
│   │   ├── ClaudeAPI.js           # Claude API integration
│   │   ├── AIRecommendationEngine.js # Recommendation logic
│   │   └── HapticService.js       # Haptic feedback
│   ├── utils/
│   │   ├── dateHelpers.js         # Date utilities
│   │   └── analytics.js           # Stats calculations
│   └── data/
│       ├── emotions.js            # Emotion definitions
│       └── breathingTechniques.js # Technique definitions
├── public/
│   ├── manifest.json      # PWA manifest
│   ├── sw.js             # Service worker
│   └── icons/            # App icons
└── package.json
```

## 🧪 Testing Locally

1. **Start Dev Server**: `npm run dev`
2. **Open Browser**: Navigate to the localhost URL
3. **Test Session Flow**:
   - Complete onboarding
   - Start a session
   - Select emotion
   - Follow breathing exercise
   - Complete journal prompt
4. **Check PWA Features**:
   - Test offline mode (disconnect internet)
   - Install to home screen
   - Test haptic feedback (mobile only)

## 🐛 Known Limitations

- Haptic feedback only works on mobile devices with vibration support
- Claude API requires internet connection (falls back to local logic when offline)
- Icons are SVG placeholders (can be replaced with proper PNGs)

## 🚢 Deployment

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### GitHub Pages
```bash
npm run build
# Deploy the dist/ folder to gh-pages branch
```

## 📊 Future Enhancements

- [ ] Dark mode
- [ ] Export journal entries as PDF
- [ ] More breathing techniques (Wim Hof, Alternate Nostril)
- [ ] Background sounds during breathing
- [ ] Integration with Apple Health / Google Fit
- [ ] Notification reminders
- [ ] Advanced pattern detection and insights

## 🤝 Contributing

This is a personal mindfulness tool, but suggestions and bug reports are welcome!

## 📄 License

MIT License - feel free to use this code for your own mindfulness practice.

## 🙏 Acknowledgments

- Breathing techniques based on research by Dr. Andrew Weil (4-7-8), Navy SEALs (Box Breathing), and heart rate variability studies (Coherent Breathing)
- Powered by Anthropic's Claude API
- Built with love for mental health and well-being

---

**Made with 🧘 for mindful living**
