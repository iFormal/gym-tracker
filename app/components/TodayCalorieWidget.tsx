"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CalorieProfile, MealLog } from "../types/calories";
import { DEFAULT_CALORIE_PROFILE } from "../utils/calorieCalculator";
import { loadCalorieProfile, loadMeals } from "../utils/calorieStorage";
import { Camera, ChevronRight, AlertTriangle, Utensils } from "lucide-react";

export default function TodayCalorieWidget() {
  const [profile, setProfile] = useState<CalorieProfile>(DEFAULT_CALORIE_PROFILE);
  const [todayMeals, setTodayMeals] = useState<MealLog[]>([]);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    async function loadData() {
      try {
        const p = await loadCalorieProfile();
        setProfile(p);
        const meals = await loadMeals(todayStr);
        setTodayMeals(meals);
      } catch (err) {
        console.error("Widget load error:", err);
      }
    }
    loadData();
  }, [todayStr]);

  const totalCalories = todayMeals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
  const targetCalories = profile.targetCalories || 2000;
  const isOver = totalCalories > targetCalories;
  const percentage = Math.min(100, Math.round((totalCalories / targetCalories) * 100));

  return (
    <div className="bg-gradient-to-br from-white to-orange-50/40 rounded-3xl p-6 border border-slate-200 shadow-xs mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <Utensils size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-base">
                Today&apos;s Calories &amp; Nutrition
              </h3>
              <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full uppercase">
                {profile.goal}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {totalCalories} / {targetCalories} kcal ({percentage}%) • {todayMeals.length} {todayMeals.length === 1 ? "meal" : "meals"} logged
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/calories"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs shadow-orange-300 transition-all flex items-center gap-1.5"
          >
            <Camera size={15} />
            <span>Snap Meal / Track</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Over calories notice if applicable */}
      {isOver && (
        <div className="p-2.5 px-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 mb-3 flex items-center gap-2">
          <AlertTriangle size={15} className="text-rose-500 shrink-0" />
          <span>
            <strong>Reminder:</strong> Over daily goal by +{totalCalories - targetCalories} kcal.
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOver
              ? "bg-rose-500"
              : percentage > 85
              ? "bg-amber-500"
              : "bg-emerald-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
