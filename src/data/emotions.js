export const emotions = {
  anxious: {
    label: "Anxious",
    emoji: "😰",
    color: "#FF6B6B",
    gradient: "from-red-400 to-red-600",
    relatedEmotions: ["worried", "nervous", "overwhelmed"],
    defaultIntensity: 7,
    aiContext: "User experiencing activation, needs parasympathetic response"
  },
  stressed: {
    label: "Stressed",
    emoji: "😫",
    color: "#FFA500",
    gradient: "from-orange-400 to-orange-600",
    relatedEmotions: ["pressured", "tense", "frustrated"],
    defaultIntensity: 6,
    aiContext: "User needs grounding and mental clarity"
  },
  sad: {
    label: "Sad",
    emoji: "😔",
    color: "#6B8EFF",
    gradient: "from-blue-400 to-blue-600",
    relatedEmotions: ["down", "lonely", "disappointed"],
    defaultIntensity: 6,
    aiContext: "User needs emotional resilience building"
  },
  restless: {
    label: "Restless",
    emoji: "😤",
    color: "#FFD700",
    gradient: "from-yellow-400 to-yellow-600",
    relatedEmotions: ["agitated", "impatient", "fidgety"],
    defaultIntensity: 6,
    aiContext: "User has excess energy needing channeling"
  },
  tired: {
    label: "Tired",
    emoji: "😴",
    color: "#9B9B9B",
    gradient: "from-gray-400 to-gray-600",
    relatedEmotions: ["exhausted", "drained", "depleted"],
    defaultIntensity: 7,
    aiContext: "User needs energizing while maintaining calm"
  },
  calm: {
    label: "Calm",
    emoji: "😊",
    color: "#4ECDC4",
    gradient: "from-teal-400 to-teal-600",
    relatedEmotions: ["peaceful", "content", "balanced"],
    defaultIntensity: 3,
    aiContext: "Maintenance session, build resilience"
  }
};

export const emotionsList = Object.keys(emotions);
