// Based on Plutchik's Emotion Wheel + Mindfulness-Relevant States
// Organized by arousal level and valence for better AI recommendations

export const emotions = {
  // HIGH AROUSAL NEGATIVE (Fight/Flight States)
  anxious: {
    label: "Anxious",
    emoji: "😰",
    color: "#FF6B6B",
    gradient: "from-red-400 to-red-600",
    relatedEmotions: ["worried", "nervous", "fearful"],
    defaultIntensity: 7,
    wheelCategory: "fear",
    arousal: "high",
    valence: "negative",
    aiContext: "High arousal fear state - needs parasympathetic activation and grounding"
  },
  angry: {
    label: "Angry",
    emoji: "😠",
    color: "#DC143C",
    gradient: "from-red-500 to-red-700",
    relatedEmotions: ["furious", "enraged", "mad"],
    defaultIntensity: 7,
    wheelCategory: "anger",
    arousal: "high",
    valence: "negative",
    aiContext: "High arousal anger state - needs cooling, regulation, and perspective"
  },
  frustrated: {
    label: "Frustrated",
    emoji: "😤",
    color: "#FF8C42",
    gradient: "from-orange-500 to-red-500",
    relatedEmotions: ["annoyed", "irritated", "blocked"],
    defaultIntensity: 6,
    wheelCategory: "anger",
    arousal: "moderate-high",
    valence: "negative",
    aiContext: "Moderate anger from blocked goals - needs perspective shift and grounding"
  },
  overwhelmed: {
    label: "Overwhelmed",
    emoji: "😵",
    color: "#9B59B6",
    gradient: "from-purple-400 to-purple-600",
    relatedEmotions: ["swamped", "overloaded", "flooded"],
    defaultIntensity: 8,
    wheelCategory: "fear-surprise",
    arousal: "very-high",
    valence: "negative",
    aiContext: "Cognitive/emotional overload - needs simplification, breaks, and regulation"
  },
  restless: {
    label: "Restless",
    emoji: "😣",
    color: "#E67E22",
    gradient: "from-orange-400 to-orange-600",
    relatedEmotions: ["agitated", "impatient", "fidgety"],
    defaultIntensity: 6,
    wheelCategory: "anticipation",
    arousal: "high",
    valence: "negative",
    aiContext: "Excess unfocused energy - needs channeling and grounding"
  },

  // LOW AROUSAL NEGATIVE (Withdrawal/Depression States)
  sad: {
    label: "Sad",
    emoji: "😔",
    color: "#6B8EFF",
    gradient: "from-blue-400 to-blue-600",
    relatedEmotions: ["down", "blue", "unhappy"],
    defaultIntensity: 6,
    wheelCategory: "sadness",
    arousal: "low",
    valence: "negative",
    aiContext: "Low arousal sadness - needs gentle activation and emotional resilience"
  },
  lonely: {
    label: "Lonely",
    emoji: "😞",
    color: "#5DADE2",
    gradient: "from-blue-300 to-blue-500",
    relatedEmotions: ["isolated", "disconnected", "alone"],
    defaultIntensity: 6,
    wheelCategory: "sadness",
    arousal: "low",
    valence: "negative",
    aiContext: "Social pain and disconnection - needs self-compassion and reconnection"
  },
  tired: {
    label: "Tired",
    emoji: "😴",
    color: "#95A5A6",
    gradient: "from-gray-400 to-gray-600",
    relatedEmotions: ["exhausted", "drained", "depleted"],
    defaultIntensity: 7,
    wheelCategory: "low-energy",
    arousal: "very-low",
    valence: "negative",
    aiContext: "Physical/mental fatigue - needs gentle energizing or permission to rest"
  },
  numb: {
    label: "Numb",
    emoji: "😶",
    color: "#BDC3C7",
    gradient: "from-gray-300 to-gray-500",
    relatedEmotions: ["empty", "detached", "disconnected"],
    defaultIntensity: 5,
    wheelCategory: "dissociation",
    arousal: "very-low",
    valence: "negative",
    aiContext: "Emotional disconnection/avoidance - needs gentle reconnection and safety"
  },

  // MODERATE AROUSAL NEGATIVE (Mixed/Complex States)
  stressed: {
    label: "Stressed",
    emoji: "😫",
    color: "#FFA500",
    gradient: "from-orange-400 to-orange-600",
    relatedEmotions: ["pressured", "tense", "burdened"],
    defaultIntensity: 7,
    wheelCategory: "fear-pressure",
    arousal: "moderate-high",
    valence: "negative",
    aiContext: "Pressure and demands exceeding resources - needs mental clarity and grounding"
  },

  // LOW AROUSAL POSITIVE (Rest/Digest States)
  calm: {
    label: "Calm",
    emoji: "😊",
    color: "#4ECDC4",
    gradient: "from-teal-400 to-teal-600",
    relatedEmotions: ["peaceful", "relaxed", "serene"],
    defaultIntensity: 3,
    wheelCategory: "trust",
    arousal: "low",
    valence: "positive",
    aiContext: "Parasympathetic state - maintenance practice to deepen and build resilience"
  },
  content: {
    label: "Content",
    emoji: "☺️",
    color: "#52C77D",
    gradient: "from-green-400 to-green-600",
    relatedEmotions: ["satisfied", "at-ease", "comfortable"],
    defaultIntensity: 3,
    wheelCategory: "joy",
    arousal: "low",
    valence: "positive",
    aiContext: "Mild positive state - opportunity for gratitude practice and deepening"
  },
  grateful: {
    label: "Grateful",
    emoji: "🙏",
    color: "#F39C12",
    gradient: "from-yellow-400 to-orange-400",
    relatedEmotions: ["thankful", "appreciative", "blessed"],
    defaultIntensity: 2,
    wheelCategory: "joy",
    arousal: "low-moderate",
    valence: "positive",
    aiContext: "Positive reflective state - deepen with awareness and savoring practices"
  },

  // HIGH AROUSAL POSITIVE (Activation States)
  hopeful: {
    label: "Hopeful",
    emoji: "🌟",
    color: "#FFD700",
    gradient: "from-yellow-300 to-yellow-500",
    relatedEmotions: ["optimistic", "encouraged", "inspired"],
    defaultIntensity: 4,
    wheelCategory: "anticipation",
    arousal: "moderate",
    valence: "positive",
    aiContext: "Positive anticipation - channel energy constructively and build momentum"
  }
};

export const emotionsList = Object.keys(emotions);
