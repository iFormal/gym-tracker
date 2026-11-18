export type MealType =
  | "breakfast"
  | "lunch"
  | "teabreak"
  | "dinner"
  | "supper"
  | "snack";

export type GoalType = "cutting" | "bulking" | "dieting";

export type DeficitSurplusLevel = "mild" | "moderate" | "aggressive" | "custom";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "very_active"
  | "extra_active";

export interface CalorieProfile {
  sex: "male" | "female";
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: GoalType;
  deficitSurplusLevel: DeficitSurplusLevel;
  customCaloriesOffset: number; // e.g. -500 for deficit, +300 for surplus
  isCustomTarget: boolean;
  customTargetCalories: number;
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  waterGoalMl: number;
  geminiApiKey?: string;
  updatedAt: string;
}

export interface MealFoodItem {
  name: string;
  portion?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealLog {
  id: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  mealType: MealType;
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  photoUrl?: string; // base64 or storage url
  items?: MealFoodItem[];
  notes?: string;
  createdAt: string;
}

export interface DailyWaterLog {
  date: string; // YYYY-MM-DD
  intakeMl: number;
}
