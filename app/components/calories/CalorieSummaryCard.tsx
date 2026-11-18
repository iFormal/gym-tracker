"use client";

import { CalorieProfile, MealLog } from "../../types/calories";
import { AlertTriangle, Flame, ShieldAlert } from "lucide-react";

interface Props {
  profile: CalorieProfile;
  meals: MealLog[];
  onOpenGoalModal: () => void;
}

export default function CalorieSummaryCard({
  profile,
  meals,
  onOpenGoalModal,
}: Props) {
  // Aggregate totals
  const totalCalories = meals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + (Number(m.protein) || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + (Number(m.carbs) || 0), 0);
  const totalFat = meals.reduce((sum, m) => sum + (Number(m.fat) || 0), 0);

  const targetCalories = profile.targetCalories || 2000;
  const targetProtein = profile.targetProteinG || 150;
  const targetCarbs = profile.targetCarbsG || 200;
  const targetFat = profile.targetFatG || 60;

  const isOverCalories = totalCalories > targetCalories;
  const overKcal = Math.max(0, totalCalories - targetCalories);
  const remainingKcal = Math.max(0, targetCalories - totalCalories);
  const percentage = Math.min(100, Math.round((totalCalories / targetCalories) * 100));

  // Determine status
  let statusTheme: "safe" | "warning" | "danger" = "safe";
  if (isOverCalories) {
    statusTheme = "danger";
  } else if (totalCalories >= targetCalories * 0.88) {
    statusTheme = "warning";
  }

  return (
    <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8 space-y-6">
      {/* Top Banner / Goal Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <Flame size={22} className="fill-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Daily Calorie Target
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                {profile.goal === "cutting"
                  ? "✂️ Cutting Deficit"
                  : profile.goal === "bulking"
                  ? "🏋️‍♂️ Bulking Surplus"
                  : "⚖️ Dieting / Maintenance"}
              </span>
              <span className="text-xs text-slate-400">
                TDEE: {profile.tdee} kcal
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenGoalModal}
          className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100/70 px-3.5 py-2 rounded-xl transition-all"
        >
          Change Goal / Deficit
        </button>
      </div>

      {/* OVER CALORIE REMINDER ALERT BANNER */}
      {isOverCalories && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-in fade-in duration-300">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-xl shrink-0 mt-0.5">
            <ShieldAlert size={20} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-rose-900 text-sm">
                Calorie Goal Exceeded! (+{overKcal} kcal over)
              </h4>
            </div>
            <p className="text-xs text-rose-700 mt-1 leading-relaxed">
              You&apos;ve logged <strong>{totalCalories} kcal</strong> against your goal of{" "}
              <strong>{targetCalories} kcal</strong>. One day off won&apos;t ruin your consistency—stay hydrated, focus on nutrient-dense foods, and get ready to crush tomorrow!
            </p>
          </div>
        </div>
      )}

      {!isOverCalories && statusTheme === "warning" && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <span>
            <strong>Approaching Goal:</strong> You have only <strong>{remainingKcal} kcal</strong> left for today. Choose light, high-protein options if eating again.
          </span>
        </div>
      )}

      {/* Main Numbers Gauge */}
      <div className="grid grid-cols-3 gap-3 text-center bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Daily Goal
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1">
            {targetCalories}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">kcal</div>
        </div>

        <div className="border-x border-slate-200">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Consumed
          </div>
          <div
            className={`text-2xl font-black mt-1 ${
              isOverCalories ? "text-rose-600" : "text-slate-900"
            }`}
          >
            {totalCalories}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            {percentage}% of goal
          </div>
        </div>

        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {isOverCalories ? "Over Budget" : "Remaining"}
          </div>
          <div
            className={`text-2xl font-black mt-1 ${
              isOverCalories ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {isOverCalories ? `+${overKcal}` : remainingKcal}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">kcal</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2">
          <span>Daily Calorie Bar</span>
          <span>
            {totalCalories} / {targetCalories} kcal
          </span>
        </div>
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverCalories
                ? "bg-gradient-to-r from-rose-500 to-red-600"
                : statusTheme === "warning"
                ? "bg-gradient-to-r from-amber-400 to-orange-500"
                : "bg-gradient-to-r from-emerald-400 to-teal-500"
            }`}
            style={{ width: `${Math.min(100, (totalCalories / targetCalories) * 100)}%` }}
          />
        </div>
      </div>

      {/* Macros Breakdown Row */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Macronutrient Breakdown
        </h4>

        <div className="grid grid-cols-3 gap-3">
          {/* Protein */}
          <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-100">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-bold text-blue-900">Protein</span>
              <span className="text-[11px] text-blue-700 font-semibold">
                {Math.round((totalProtein / targetProtein) * 100)}%
              </span>
            </div>
            <div className="text-lg font-black text-blue-950">
              {totalProtein}g{" "}
              <span className="text-xs font-normal text-blue-600">
                / {targetProtein}g
              </span>
            </div>
            <div className="w-full h-1.5 bg-blue-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (totalProtein / targetProtein) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-100">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-bold text-amber-900">Carbs</span>
              <span className="text-[11px] text-amber-700 font-semibold">
                {Math.round((totalCarbs / targetCarbs) * 100)}%
              </span>
            </div>
            <div className="text-lg font-black text-amber-950">
              {totalCarbs}g{" "}
              <span className="text-xs font-normal text-amber-600">
                / {targetCarbs}g
              </span>
            </div>
            <div className="w-full h-1.5 bg-amber-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (totalCarbs / targetCarbs) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Fats */}
          <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-bold text-emerald-900">Fats</span>
              <span className="text-[11px] text-emerald-700 font-semibold">
                {Math.round((totalFat / targetFat) * 100)}%
              </span>
            </div>
            <div className="text-lg font-black text-emerald-950">
              {totalFat}g{" "}
              <span className="text-xs font-normal text-emerald-600">
                / {targetFat}g
              </span>
            </div>
            <div className="w-full h-1.5 bg-emerald-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (totalFat / targetFat) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
