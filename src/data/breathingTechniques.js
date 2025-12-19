export const breathingTechniques = {
  "4-7-8": {
    name: "4-7-8 Breathing",
    shortName: "4-7-8",
    duration: 300, // 5 minutes in seconds
    cycles: 8,
    description: "Activates your parasympathetic nervous system",
    bestFor: ["anxiety", "sleep", "acute stress"],
    instructions: "Breathe in for 4, hold for 7, exhale for 8",
    phases: [
      { name: "inhale", duration: 4, instruction: "Inhale through nose", haptic: "inhaleStart" },
      { name: "hold", duration: 7, instruction: "Hold your breath", haptic: "none" },
      { name: "exhale", duration: 8, instruction: "Exhale through mouth", haptic: "exhaleStart" }
    ],
    visualType: "circle", // expanding/contracting circle
    research: "Shown to reduce heart rate and activate relaxation response within 4 cycles"
  },

  box: {
    name: "Box Breathing",
    shortName: "Box",
    duration: 300, // 5 minutes
    cycles: 12,
    description: "Creates balance and mental clarity",
    bestFor: ["stress", "focus", "performance"],
    instructions: "Breathe in 4, hold 4, breathe out 4, hold 4",
    phases: [
      { name: "inhale", duration: 4, instruction: "Breathe in", haptic: "boxCorner" },
      { name: "hold-full", duration: 4, instruction: "Hold", haptic: "boxCorner" },
      { name: "exhale", duration: 4, instruction: "Breathe out", haptic: "boxCorner" },
      { name: "hold-empty", duration: 4, instruction: "Hold", haptic: "boxCorner" }
    ],
    visualType: "box", // ball moving in square pattern
    research: "Used by Navy SEALs for stress management and focus"
  },

  coherent: {
    name: "Coherent Breathing",
    shortName: "Coherent",
    duration: 600, // 10 minutes
    cycles: 55,
    description: "Builds HRV and long-term stress resilience",
    bestFor: ["daily practice", "resilience", "mood"],
    instructions: "Breathe in 5.5, breathe out 5.5",
    phases: [
      { name: "inhale", duration: 5.5, instruction: "Breathe in", haptic: "inhaleStart" },
      { name: "exhale", duration: 5.5, instruction: "Breathe out", haptic: "exhaleStart" }
    ],
    visualType: "wave", // sine wave rising and falling
    research: "Optimizes heart rate variability at ~5.5 breaths per minute"
  }
};

export const techniquesList = Object.keys(breathingTechniques);
