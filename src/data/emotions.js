// Plutchik's Emotion Wheel - 8 Primary + 6 Secondary Emotions
// Simplified for the burning journal app

export const emotions = {
  // PRIMARY EMOTIONS
  joy: {
    label: "Joy",
    emoji: "😊"
  },
  trust: {
    label: "Trust",
    emoji: "💚"
  },
  fear: {
    label: "Fear",
    emoji: "😰"
  },
  surprise: {
    label: "Surprise",
    emoji: "😲"
  },
  sadness: {
    label: "Sadness",
    emoji: "😔"
  },
  disgust: {
    label: "Disgust",
    emoji: "🤢"
  },
  anger: {
    label: "Anger",
    emoji: "😡"
  },
  anticipation: {
    label: "Anticipation",
    emoji: "🤗"
  },

  // SECONDARY EMOTIONS (combinations)
  optimism: {
    label: "Optimism",
    emoji: "✨"
  },
  love: {
    label: "Love",
    emoji: "❤️"
  },
  submission: {
    label: "Submission",
    emoji: "🙏"
  },
  awe: {
    label: "Awe",
    emoji: "😮"
  },
  disappointment: {
    label: "Disappointment",
    emoji: "😞"
  },
  remorse: {
    label: "Remorse",
    emoji: "😣"
  }
};

export const emotionsList = Object.keys(emotions);
