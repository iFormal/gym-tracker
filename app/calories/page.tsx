"use client";

import { useEffect, useState } from "react";
import { format, addDays, subDays, isToday, parseISO } from "date-fns";
import { CalorieProfile, MealLog, MealType } from "../types/calories";
import { DEFAULT_CALORIE_PROFILE } from "../utils/calorieCalculator";
import {
  deleteMeal,
  loadCalorieProfile,
  loadMeals,
  loadWaterIntake,
  saveMeal,
  saveWaterIntake,
} from "../utils/calorieStorage";
import CalorieSummaryCard from "../components/calories/CalorieSummaryCard";
import MealList from "../components/calories/MealList";
import MealCaptureModal from "../components/calories/MealCaptureModal";
import GoalCalculatorModal from "../components/calories/GoalCalculatorModal";
import WaterTracker from "../components/calories/WaterTracker";
import WeeklyCalorieChart from "../components/calories/WeeklyCalorieChart";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings2,
  Calendar as CalendarIcon,
} from "lucide-react";

export default function CaloriesPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [profile, setProfile] = useState<CalorieProfile>(DEFAULT_CALORIE_PROFILE);
  const [allMeals, setAllMeals] = useState<MealLog[]>([]);
  const [waterIntake, setWaterIntake] = useState<number>(0);

  // Modals state
  const [isMealModalOpen, setIsMealModalOpen] = useState<boolean>(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [editingMeal, setEditingMeal] = useState<MealLog | null>(null);
  const [modalInitialCategory, setModalInitialCategory] = useState<MealType | undefined>(undefined);

  // Initial load
  useEffect(() => {
    async function initData() {
      try {
        const loadedProfile = await loadCalorieProfile();
        setProfile(loadedProfile);

        const loadedMeals = await loadMeals();
        setAllMeals(loadedMeals);

        const loadedWater = await loadWaterIntake(selectedDate);
        setWaterIntake(loadedWater);
      } catch (err) {
        console.error("Error loading calorie data:", err);
      }
    }
    initData();
  }, [selectedDate]);

  // Reload water whenever selectedDate changes
  useEffect(() => {
    async function fetchWater() {
      const w = await loadWaterIntake(selectedDate);
      setWaterIntake(w);
    }
    fetchWater();
  }, [selectedDate]);

  // Filter meals for the selected date
  const dayMeals = allMeals.filter((m) => m.date === selectedDate);

  // Date Navigation handlers
  const handlePrevDay = () => {
    const prev = subDays(parseISO(selectedDate), 1);
    setSelectedDate(format(prev, "yyyy-MM-dd"));
  };

  const handleNextDay = () => {
    const next = addDays(parseISO(selectedDate), 1);
    setSelectedDate(format(next, "yyyy-MM-dd"));
  };

  const handleJumpToday = () => {
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
  };

  // Meal operations
  const handleSaveMeal = async (meal: MealLog) => {
    await saveMeal(meal);
    const updatedMeals = await loadMeals();
    setAllMeals(updatedMeals);
  };

  const handleDeleteMeal = async (id: string) => {
    if (confirm("Delete this meal entry?")) {
      await deleteMeal(id);
      const updatedMeals = await loadMeals();
      setAllMeals(updatedMeals);
    }
  };

  const handleEditMeal = (meal: MealLog) => {
    setEditingMeal(meal);
    setModalInitialCategory(meal.mealType);
    setIsMealModalOpen(true);
  };

  const handleAddMealUnderCategory = (type: MealType) => {
    setEditingMeal(null);
    setModalInitialCategory(type);
    setIsMealModalOpen(true);
  };

  const handleUpdateWater = async (newMl: number) => {
    setWaterIntake(newMl);
    await saveWaterIntake(selectedDate, newMl);
  };

  // Formatted date string for display
  const currentDateObj = parseISO(selectedDate);
  const isCurrentDayToday = isToday(currentDateObj);
  const formattedDateTitle = isCurrentDayToday
    ? `Today, ${format(currentDateObj, "MMMM d")}`
    : format(currentDateObj, "EEEE, MMMM d, yyyy");

  return (
    <div className="pb-24 pt-4 animate-in fade-in duration-500">
      {/* Top Header & Date Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Calorie Tracker</span>
            <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
              AI Vision
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Smart nutrition tracking with automatic photo identification & diet goals
          </p>
        </div>

        {/* Date Navigator Bar */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs self-start md:self-auto">
          <button
            onClick={handlePrevDay}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition"
            title="Previous Day"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="px-3 flex items-center gap-2">
            <CalendarIcon size={16} className="text-orange-500" />
            <span className="text-xs font-bold text-slate-800 whitespace-nowrap">
              {formattedDateTitle}
            </span>
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition"
            title="Next Day"
          >
            <ChevronRight size={18} />
          </button>

          {!isCurrentDayToday && (
            <button
              onClick={handleJumpToday}
              className="ml-1 text-[11px] font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-2.5 py-1.5 rounded-lg transition"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {/* Snap Photo Button */}
        <button
          onClick={() => {
            setEditingMeal(null);
            setModalInitialCategory(undefined);
            setIsMealModalOpen(true);
          }}
          className="p-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl shadow-md shadow-orange-300 flex items-center justify-center gap-2.5 font-bold text-sm transition-all active:scale-[0.98]"
        >
          <Camera size={20} />
          <span>Snap Meal Photo</span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md uppercase font-semibold">
            AI Scan
          </span>
        </button>

        {/* Manual Log Button */}
        <button
          onClick={() => {
            setEditingMeal(null);
            setModalInitialCategory(undefined);
            setIsMealModalOpen(true);
          }}
          className="p-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl shadow-2xs flex items-center justify-center gap-2 font-bold text-sm transition-all"
        >
          <Plus size={18} className="text-orange-500" />
          <span>Manual Food Log</span>
        </button>

        {/* Goal / Deficit Settings */}
        <button
          onClick={() => setIsGoalModalOpen(true)}
          className="p-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl shadow-2xs flex items-center justify-center gap-2 font-bold text-sm transition-all"
        >
          <Settings2 size={18} className="text-slate-500" />
          <span>Goal & Diet Settings</span>
        </button>
      </div>

      {/* Daily Calorie Summary (with over-calorie reminder and macro gauges) */}
      <CalorieSummaryCard
        profile={profile}
        meals={dayMeals}
        onOpenGoalModal={() => setIsGoalModalOpen(true)}
      />

      {/* Hydration Tracker */}
      <WaterTracker
        currentMl={waterIntake}
        goalMl={profile.waterGoalMl || 2500}
        onUpdateIntake={handleUpdateWater}
      />

      {/* 7-Day Consistency Chart */}
      <WeeklyCalorieChart
        meals={allMeals}
        targetCalories={profile.targetCalories || 2000}
      />

      {/* Meal Breakdown by Category */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Meals Logged For {isCurrentDayToday ? "Today" : format(currentDateObj, "MMM d")}
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            {dayMeals.length} {dayMeals.length === 1 ? "meal" : "meals"}
          </span>
        </div>

        <MealList
          meals={dayMeals}
          onEditMeal={handleEditMeal}
          onDeleteMeal={handleDeleteMeal}
          onAddMealUnderCategory={handleAddMealUnderCategory}
        />
      </div>

      {/* Modals */}
      <MealCaptureModal
        isOpen={isMealModalOpen}
        onClose={() => {
          setIsMealModalOpen(false);
          setEditingMeal(null);
        }}
        onSaveMeal={handleSaveMeal}
        initialDate={selectedDate}
        initialMealType={modalInitialCategory}
        geminiApiKey={profile.geminiApiKey}
        editingMeal={editingMeal}
      />

      <GoalCalculatorModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        currentProfile={profile}
        onProfileUpdated={(newProfile) => setProfile(newProfile)}
      />
    </div>
  );
}
