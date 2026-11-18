import {
  ActivityLevel,
  CalorieProfile,
  MealType,
} from "../types/calories";

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, { label: string; description: string }> = {
  sedentary: {
    label: "Sedentary",
    description: "Desk job, little to no regular exercise",
  },
  light: {
    label: "Lightly Active",
    description: "Light exercise or gym 1–3 days/week",
  },
  moderate: {
    label: "Moderately Active",
    description: "Moderate gym workouts 3–5 days/week",
  },
  very_active: {
    label: "Very Active",
    description: "Heavy exercise or sports 6–7 days/week",
  },
  extra_active: {
    label: "Extremely Active",
    description: "Very intense physical training or physical job",
  },
};

export const DEFICIT_OPTIONS = [
  { level: "mild", label: "Mild Deficit", offset: -300, desc: "-300 kcal (slow, easy fat loss)" },
  { level: "moderate", label: "Moderate Deficit (Recommended)", offset: -500, desc: "-500 kcal (~0.5 kg loss/week)" },
  { level: "aggressive", label: "Aggressive Deficit", offset: -750, desc: "-750 kcal (~0.75 kg loss/week)" },
  { level: "custom", label: "Custom Deficit", offset: -500, desc: "Set your own calorie deficit" },
] as const;

export const SURPLUS_OPTIONS = [
  { level: "mild", label: "Lean Bulk", offset: 250, desc: "+250 kcal (minimal fat gain)" },
  { level: "moderate", label: "Standard Bulk (Recommended)", offset: 400, desc: "+400 kcal (steady muscle hypertrophy)" },
  { level: "aggressive", label: "Aggressive Bulk", offset: 600, desc: "+600 kcal (faster mass gain)" },
  { level: "custom", label: "Custom Surplus", offset: 350, desc: "Set your own calorie surplus" },
] as const;

/**
 * Classify meal type based on hour and minute of the day:
 * 05:00 - 10:59: Breakfast
 * 11:00 - 14:29: Lunch
 * 14:30 - 17:29: Teabreak
 * 17:30 - 21:29: Dinner
 * 21:30 - 04:59: Supper
 */
export function classifyMealTime(date: Date = new Date()): MealType {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  if (timeInMinutes >= 5 * 60 && timeInMinutes < 11 * 60) {
    return "breakfast";
  } else if (timeInMinutes >= 11 * 60 && timeInMinutes < 14 * 60 + 30) {
    return "lunch";
  } else if (timeInMinutes >= 14 * 60 + 30 && timeInMinutes < 17 * 60 + 30) {
    return "teabreak";
  } else if (timeInMinutes >= 17 * 60 + 30 && timeInMinutes < 21 * 60 + 30) {
    return "dinner";
  } else {
    return "supper";
  }
}

export function getMealTypeInfo(type: MealType): { label: string; emoji: string; timeWindow: string } {
  switch (type) {
    case "breakfast":
      return { label: "Breakfast", emoji: "🍳", timeWindow: "5:00 AM – 11:00 AM" };
    case "lunch":
      return { label: "Lunch", emoji: "🥗", timeWindow: "11:00 AM – 2:30 PM" };
    case "teabreak":
      return { label: "Teabreak", emoji: "☕", timeWindow: "2:30 PM – 5:30 PM" };
    case "dinner":
      return { label: "Dinner", emoji: "🍽️", timeWindow: "5:30 PM – 9:30 PM" };
    case "supper":
      return { label: "Supper", emoji: "🌙", timeWindow: "9:30 PM – 5:00 AM" };
    case "snack":
      return { label: "Snack", emoji: "🍎", timeWindow: "Anytime" };
  }
}

/**
 * Calculate Mifflin-St Jeor Basal Metabolic Rate (BMR)
 */
export function calculateBmr(
  sex: "male" | "female",
  weightKg: number,
  heightCm: number,
  age: number
): number {
  if (sex === "male") {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 */
export function calculateTdee(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Full calculation of profile metrics
 */
export function calculateProfileTargets(
  profile: Pick<
    CalorieProfile,
    | "sex"
    | "age"
    | "weightKg"
    | "heightCm"
    | "activityLevel"
    | "goal"
    | "deficitSurplusLevel"
    | "customCaloriesOffset"
    | "isCustomTarget"
    | "customTargetCalories"
  >
): {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  waterGoalMl: number;
} {
  const bmr = calculateBmr(profile.sex, profile.weightKg, profile.heightCm, profile.age);
  const tdee = calculateTdee(bmr, profile.activityLevel);

  let targetCalories = tdee;

  if (profile.isCustomTarget && profile.customTargetCalories > 500) {
    targetCalories = Math.round(profile.customTargetCalories);
  } else {
    let offset = 0;
    if (profile.goal === "cutting") {
      if (profile.deficitSurplusLevel === "mild") offset = -300;
      else if (profile.deficitSurplusLevel === "moderate") offset = -500;
      else if (profile.deficitSurplusLevel === "aggressive") offset = -750;
      else offset = profile.customCaloriesOffset || -500;
    } else if (profile.goal === "bulking") {
      if (profile.deficitSurplusLevel === "mild") offset = 250;
      else if (profile.deficitSurplusLevel === "moderate") offset = 400;
      else if (profile.deficitSurplusLevel === "aggressive") offset = 600;
      else offset = profile.customCaloriesOffset || 350;
    } else {
      offset = 0; // dieting / maintenance
    }
    targetCalories = Math.max(1200, Math.round(tdee + offset));
  }

  // Macronutrient split:
  // 1g Protein = 4 kcal, 1g Carb = 4 kcal, 1g Fat = 9 kcal
  let proteinPerKg = 2.0;
  let fatPercent = 0.25;

  if (profile.goal === "cutting") {
    proteinPerKg = 2.2; // Higher protein for muscle retention during deficit
    fatPercent = 0.25;
  } else if (profile.goal === "bulking") {
    proteinPerKg = 2.0;
    fatPercent = 0.25;
  } else {
    // Dieting / Maintenance
    proteinPerKg = 1.8;
    fatPercent = 0.28;
  }

  const targetProteinG = Math.round(Math.max(60, profile.weightKg * proteinPerKg));
  const proteinKcal = targetProteinG * 4;

  const fatKcal = targetCalories * fatPercent;
  const targetFatG = Math.round(Math.max(30, fatKcal / 9));

  const remainingKcal = Math.max(0, targetCalories - proteinKcal - (targetFatG * 9));
  const targetCarbsG = Math.round(remainingKcal / 4);

  // Daily water recommendation: ~35ml per kg bodyweight
  const waterGoalMl = Math.round((profile.weightKg * 35) / 250) * 250;

  return {
    bmr,
    tdee,
    targetCalories,
    targetProteinG,
    targetCarbsG,
    targetFatG,
    waterGoalMl: Math.max(2000, waterGoalMl),
  };
}

export const DEFAULT_CALORIE_PROFILE: CalorieProfile = {
  sex: "male",
  age: 26,
  weightKg: 72,
  heightCm: 175,
  activityLevel: "moderate",
  goal: "cutting",
  deficitSurplusLevel: "moderate",
  customCaloriesOffset: -500,
  isCustomTarget: false,
  customTargetCalories: 2000,
  bmr: 1675,
  tdee: 2596,
  targetCalories: 2096,
  targetProteinG: 158,
  targetCarbsG: 228,
  targetFatG: 58,
  waterGoalMl: 2500,
  updatedAt: new Date().toISOString(),
};
