"use client";

import { useState } from "react";
import { MealLog, MealType } from "../../types/calories";
import { getMealTypeInfo } from "../../utils/calorieCalculator";
import {
  Clock,
  Edit2,
  Plus,
  Trash2,
  Utensils,
  X,
} from "lucide-react";

interface Props {
  meals: MealLog[];
  onEditMeal: (meal: MealLog) => void;
  onDeleteMeal: (id: string) => void;
  onAddMealUnderCategory: (type: MealType) => void;
}

const ORDERED_CATEGORIES: MealType[] = [
  "breakfast",
  "lunch",
  "teabreak",
  "dinner",
  "supper",
  "snack",
];

export default function MealList({
  meals,
  onEditMeal,
  onDeleteMeal,
  onAddMealUnderCategory,
}: Props) {
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  // Group meals by mealType
  const groupedMeals: Record<MealType, MealLog[]> = {
    breakfast: [],
    lunch: [],
    teabreak: [],
    dinner: [],
    supper: [],
    snack: [],
  };

  meals.forEach((m) => {
    if (groupedMeals[m.mealType]) {
      groupedMeals[m.mealType].push(m);
    } else {
      groupedMeals.snack.push(m);
    }
  });

  const totalMealCount = meals.length;

  if (totalMealCount === 0) {
    return (
      <div className="p-12 text-center bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🥗</span>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">
          No meals logged for this day yet
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          Snap a quick photo of your plate or log your meal manually to track your calories and hit your goals!
        </p>
        <button
          onClick={() => onAddMealUnderCategory("lunch")}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-300 transition-all inline-flex items-center gap-2 text-sm"
        >
          <Plus size={18} /> Log First Meal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Photo Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden bg-slate-900 border border-slate-700">
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition"
            >
              <X size={20} />
            </button>
            <img
              src={lightboxPhoto}
              alt="Meal enlarged"
              className="w-full h-full object-contain max-h-[85vh]"
            />
          </div>
        </div>
      )}

      {ORDERED_CATEGORIES.map((catKey) => {
        const catMeals = groupedMeals[catKey];
        const info = getMealTypeInfo(catKey);
        const catCalories = catMeals.reduce(
          (sum, m) => sum + (Number(m.calories) || 0),
          0
        );

        // Always show categories that have meals, or Breakfast, Lunch, Dinner even if empty
        const isCommonCategory = ["breakfast", "lunch", "dinner"].includes(catKey);
        if (catMeals.length === 0 && !isCommonCategory) {
          return null;
        }

        return (
          <div
            key={catKey}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs"
          >
            {/* Category Header */}
            <div className="p-4 px-6 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{info.emoji}</span>
                <div>
                  <h3 className="font-bold text-slate-800 text-base capitalize">
                    {info.label}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {info.timeWindow}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
                  {catCalories} kcal
                </span>
                <button
                  onClick={() => onAddMealUnderCategory(catKey)}
                  className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                  title={`Add ${info.label}`}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Meals under category */}
            {catMeals.length === 0 ? (
              <div className="p-4 px-6 text-center text-xs text-slate-400 flex items-center justify-between">
                <span>Nothing logged yet</span>
                <button
                  onClick={() => onAddMealUnderCategory(catKey)}
                  className="text-xs text-orange-600 font-semibold hover:underline"
                >
                  + Add {info.label}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {catMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group"
                  >
                    {/* Left: Photo Thumbnail + Details */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {meal.photoUrl ? (
                        <button
                          type="button"
                          onClick={() => setLightboxPhoto(meal.photoUrl || null)}
                          className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-200 group-hover:shadow-md transition-all relative"
                          title="Click to view photo"
                        >
                          <img
                            src={meal.photoUrl}
                            alt={meal.title}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-400 flex items-center justify-center shrink-0 border border-orange-100">
                          <Utensils size={24} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-900 text-base truncate">
                            {meal.title}
                          </h4>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                            <Clock size={12} /> {meal.time}
                          </span>
                        </div>

                        {/* Macros badges */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                            {meal.calories} kcal
                          </span>
                          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 font-medium">
                            P: {meal.protein}g
                          </span>
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 font-medium">
                            C: {meal.carbs}g
                          </span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-medium">
                            F: {meal.fat}g
                          </span>
                        </div>

                        {/* Items breakdown or notes */}
                        {meal.notes && (
                          <p className="text-xs text-slate-500 mt-2 line-clamp-1 italic">
                            &quot;{meal.notes}&quot;
                          </p>
                        )}

                        {meal.items && meal.items.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {meal.items.map((item, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                              >
                                {item.name} ({item.calories} kcal)
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditMeal(meal)}
                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                        title="Edit meal"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteMeal(meal.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete meal"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
