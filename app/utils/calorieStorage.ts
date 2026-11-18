"use client";

import { CalorieProfile, MealLog } from "../types/calories";
import { DEFAULT_CALORIE_PROFILE } from "./calorieCalculator";
import { supabase } from "./supabaseClient";

const PROFILE_KEY = "gym_tracker_calorie_profile";
const MEALS_KEY = "gym_tracker_meals";
const WATER_KEY = "gym_tracker_water";

export const SUPABASE_CALORIE_SQL = `-- Run this in your Supabase SQL Editor to enable cloud sync for the Calorie Tracker:

CREATE TABLE IF NOT EXISTS public.meals (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  title TEXT NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein NUMERIC NOT NULL DEFAULT 0,
  carbs NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC NOT NULL DEFAULT 0,
  photo_url TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.calorie_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.calorie_water (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  date TEXT NOT NULL,
  intake_ml INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calorie_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calorie_water ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own data
CREATE POLICY "Users can manage own meals" ON public.meals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own calorie profile" ON public.calorie_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own water logs" ON public.calorie_water
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
`;

/**
 * Load user's calorie profile
 */
export async function loadCalorieProfile(): Promise<CalorieProfile> {
  if (typeof window === "undefined") return DEFAULT_CALORIE_PROFILE;

  // 1. Try local storage first for fast response
  let localData: CalorieProfile | null = null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      localData = JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Failed to read profile from localStorage", err);
  }

  // 2. Try Supabase if user is logged in
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      const { data, error } = await supabase
        .from("calorie_profiles")
        .select("data")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (!error && data?.data) {
        const remoteProfile = data.data as CalorieProfile;
        // Cache to local
        localStorage.setItem(PROFILE_KEY, JSON.stringify(remoteProfile));
        return remoteProfile;
      }
    }
  } catch {
    // Supabase table may not exist yet; ignore and fallback to local
  }

  return localData || DEFAULT_CALORIE_PROFILE;
}

/**
 * Save user's calorie profile
 */
export async function saveCalorieProfile(profile: CalorieProfile): Promise<void> {
  if (typeof window === "undefined") return;

  // 1. Save locally
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error("Failed to save profile locally", err);
  }

  // 2. Sync to Supabase if possible
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      await supabase.from("calorie_profiles").upsert(
        {
          user_id: authData.user.id,
          data: profile,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    }
  } catch {
    // ignore remote error
  }
}

/**
 * Load meals for a specific date (YYYY-MM-DD) or all meals
 */
export async function loadMeals(dateFilter?: string): Promise<MealLog[]> {
  if (typeof window === "undefined") return [];

  let localMeals: MealLog[] = [];
  try {
    const raw = localStorage.getItem(MEALS_KEY);
    if (raw) {
      localMeals = JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Failed to load meals from local storage", err);
  }

  // Try Supabase sync
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      let query = supabase
        .from("meals")
        .select("*")
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: true });

      if (dateFilter) {
        query = query.eq("date", dateFilter);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const mappedRemote: MealLog[] = data.map((row) => ({
          id: row.id,
          userId: row.user_id,
          date: row.date,
          time: row.time,
          mealType: row.meal_type,
          title: row.title,
          calories: Number(row.calories) || 0,
          protein: Number(row.protein) || 0,
          carbs: Number(row.carbs) || 0,
          fat: Number(row.fat) || 0,
          photoUrl: row.photo_url || undefined,
          items: row.items || [],
          notes: row.notes || undefined,
          createdAt: row.created_at || new Date().toISOString(),
        }));

        // Merge into local meals
        const mergedMap = new Map<string, MealLog>();
        localMeals.forEach((m) => mergedMap.set(m.id, m));
        mappedRemote.forEach((m) => mergedMap.set(m.id, m));
        const merged = Array.from(mergedMap.values());
        localStorage.setItem(MEALS_KEY, JSON.stringify(merged));

        return dateFilter ? merged.filter((m) => m.date === dateFilter) : merged;
      }
    }
  } catch {
    // Supabase table does not exist or network unavailable
  }

  if (dateFilter) {
    return localMeals.filter((m) => m.date === dateFilter);
  }
  return localMeals;
}

/**
 * Save or update a single meal
 */
export async function saveMeal(meal: MealLog): Promise<void> {
  if (typeof window === "undefined") return;

  // 1. Update local storage
  try {
    const existing = await loadMeals();
    const index = existing.findIndex((m) => m.id === meal.id);
    let updated: MealLog[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = meal;
    } else {
      updated = [meal, ...existing];
    }
    localStorage.setItem(MEALS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save meal locally", err);
  }

  // 2. Sync to Supabase
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      await supabase.from("meals").upsert({
        id: meal.id,
        user_id: authData.user.id,
        date: meal.date,
        time: meal.time,
        meal_type: meal.mealType,
        title: meal.title,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        photo_url: meal.photoUrl || null,
        items: meal.items || [],
        notes: meal.notes || null,
        created_at: meal.createdAt,
      });
    }
  } catch {
    // Ignore error
  }
}

/**
 * Delete a meal
 */
export async function deleteMeal(id: string): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const existing = await loadMeals();
    const filtered = existing.filter((m) => m.id !== id);
    localStorage.setItem(MEALS_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Failed to delete meal locally", err);
  }

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      await supabase.from("meals").delete().eq("id", id).eq("user_id", authData.user.id);
    }
  } catch {
    // Ignore error
  }
}

/**
 * Load water intake for a date
 */
export async function loadWaterIntake(date: string): Promise<number> {
  if (typeof window === "undefined") return 0;

  let localMl = 0;
  try {
    const raw = localStorage.getItem(`${WATER_KEY}_${date}`);
    if (raw) localMl = Number(raw) || 0;
  } catch {
    // Ignore
  }

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      const { data, error } = await supabase
        .from("calorie_water")
        .select("intake_ml")
        .eq("user_id", authData.user.id)
        .eq("date", date)
        .maybeSingle();

      if (!error && data?.intake_ml !== undefined) {
        localMl = Number(data.intake_ml) || 0;
        localStorage.setItem(`${WATER_KEY}_${date}`, String(localMl));
      }
    }
  } catch {
    // Ignore
  }

  return localMl;
}

/**
 * Save water intake for a date
 */
export async function saveWaterIntake(date: string, intakeMl: number): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(`${WATER_KEY}_${date}`, String(intakeMl));
  } catch (err) {
    console.error("Failed to save water intake", err);
  }

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      await supabase.from("calorie_water").upsert({
        user_id: authData.user.id,
        date: date,
        intake_ml: intakeMl,
      });
    }
  } catch {
    // Ignore
  }
}
