"use client";

import { useState } from "react";
import {
  ActivityLevel,
  CalorieProfile,
  DeficitSurplusLevel,
  GoalType,
} from "../../types/calories";
import {
  ACTIVITY_LABELS,
  DEFICIT_OPTIONS,
  SURPLUS_OPTIONS,
  calculateProfileTargets,
} from "../../utils/calorieCalculator";
import { SUPABASE_CALORIE_SQL, saveCalorieProfile } from "../../utils/calorieStorage";
import {
  X,
  Flame,
  Database,
  Check,
  Copy,
  Key,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: CalorieProfile;
  onProfileUpdated: (newProfile: CalorieProfile) => void;
}

export default function GoalCalculatorModal({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdated,
}: Props) {
  const [activeTab, setActiveTab] = useState<"goals" | "stats" | "ai_sql">("goals");

  // Form states
  const [goal, setGoal] = useState<GoalType>(currentProfile.goal || "cutting");
  const [deficitSurplusLevel, setDeficitSurplusLevel] = useState<DeficitSurplusLevel>(
    currentProfile.deficitSurplusLevel || "moderate"
  );
  const [customOffset, setCustomOffset] = useState<number>(
    currentProfile.customCaloriesOffset || (goal === "cutting" ? -500 : 400)
  );

  const [sex, setSex] = useState<"male" | "female">(currentProfile.sex || "male");
  const [age, setAge] = useState<number>(currentProfile.age || 26);
  const [weightKg, setWeightKg] = useState<number>(currentProfile.weightKg || 72);
  const [heightCm, setHeightCm] = useState<number>(currentProfile.heightCm || 175);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    currentProfile.activityLevel || "moderate"
  );

  const [isCustomTarget, setIsCustomTarget] = useState<boolean>(
    currentProfile.isCustomTarget || false
  );
  const [customTargetCalories, setCustomTargetCalories] = useState<number>(
    currentProfile.customTargetCalories || 2000
  );
  const [geminiApiKey, setGeminiApiKey] = useState<string>(
    currentProfile.geminiApiKey || ""
  );

  const [copiedSql, setCopiedSql] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  // Live preview calculations
  const preview = calculateProfileTargets({
    sex,
    age,
    weightKg,
    heightCm,
    activityLevel,
    goal,
    deficitSurplusLevel,
    customCaloriesOffset: customOffset,
    isCustomTarget,
    customTargetCalories,
  });

  const handleSave = async () => {
    const updatedProfile: CalorieProfile = {
      ...currentProfile,
      sex,
      age,
      weightKg,
      heightCm,
      activityLevel,
      goal,
      deficitSurplusLevel,
      customCaloriesOffset: customOffset,
      isCustomTarget,
      customTargetCalories,
      bmr: preview.bmr,
      tdee: preview.tdee,
      targetCalories: preview.targetCalories,
      targetProteinG: preview.targetProteinG,
      targetCarbsG: preview.targetCarbsG,
      targetFatG: preview.targetFatG,
      waterGoalMl: preview.waterGoalMl,
      geminiApiKey: geminiApiKey.trim(),
      updatedAt: new Date().toISOString(),
    };

    await saveCalorieProfile(updatedProfile);
    onProfileUpdated(updatedProfile);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_CALORIE_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                <Flame size={20} />
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Calorie & Goal Calculator
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Personalized TDEE & macro targets for cutting, bulking or maintenance
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 gap-2 bg-white">
          <button
            onClick={() => setActiveTab("goals")}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
              activeTab === "goals"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            1. Goal & Strategy
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
              activeTab === "stats"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            2. Body & Activity
          </button>
          <button
            onClick={() => setActiveTab("ai_sql")}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
              activeTab === "ai_sql"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            3. AI & Cloud Sync
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === "goals" && (
            <div className="space-y-6">
              {/* Primary Goal Selector */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-3">
                  Select Your Current Fitness Goal
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Cutting */}
                  <button
                    type="button"
                    onClick={() => {
                      setGoal("cutting");
                      setDeficitSurplusLevel("moderate");
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      goal === "cutting"
                        ? "border-orange-500 bg-orange-50/50 ring-2 ring-orange-400/20 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">✂️</span>
                      <span className="font-bold text-slate-900">Cutting</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Calorie deficit for fat loss while preserving lean muscle mass.
                    </p>
                  </button>

                  {/* Bulking */}
                  <button
                    type="button"
                    onClick={() => {
                      setGoal("bulking");
                      setDeficitSurplusLevel("moderate");
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      goal === "bulking"
                        ? "border-orange-500 bg-orange-50/50 ring-2 ring-orange-400/20 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">🏋️‍♂️</span>
                      <span className="font-bold text-slate-900">Bulking</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Calorie surplus to maximize muscle growth and strength.
                    </p>
                  </button>

                  {/* Dieting / Maintenance */}
                  <button
                    type="button"
                    onClick={() => {
                      setGoal("dieting");
                      setDeficitSurplusLevel("moderate");
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      goal === "dieting"
                        ? "border-orange-500 bg-orange-50/50 ring-2 ring-orange-400/20 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">⚖️</span>
                      <span className="font-bold text-slate-900">Dieting / Main</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Maintenance calories for body recomposition and healthy habits.
                    </p>
                  </button>
                </div>
              </div>

              {/* Deficit / Surplus options */}
              {goal === "cutting" && (
                <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200">
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Choose Calorie Deficit Pace
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DEFICIT_OPTIONS.map((opt) => (
                      <button
                        key={opt.level}
                        type="button"
                        onClick={() => {
                          setDeficitSurplusLevel(opt.level as DeficitSurplusLevel);
                          if (opt.level !== "custom") setCustomOffset(opt.offset);
                        }}
                        className={`p-3 rounded-xl text-left border transition-all text-xs ${
                          deficitSurplusLevel === opt.level
                            ? "bg-white border-orange-500 shadow-sm font-semibold text-slate-900"
                            : "bg-white/60 border-slate-200 text-slate-700 hover:bg-white"
                        }`}
                      >
                        <div className="font-bold text-slate-800">{opt.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                      </button>
                    ))}
                  </div>

                  {deficitSurplusLevel === "custom" && (
                    <div className="mt-3 pt-3 border-t border-orange-200 flex items-center gap-3">
                      <label className="text-xs font-semibold text-slate-700">
                        Custom Deficit (kcal/day):
                      </label>
                      <input
                        type="number"
                        min="100"
                        max="1500"
                        value={Math.abs(customOffset)}
                        onChange={(e) => setCustomOffset(-Math.abs(Number(e.target.value) || 0))}
                        className="w-24 p-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold"
                      />
                      <span className="text-xs text-slate-500">kcal deficit per day</span>
                    </div>
                  )}
                </div>
              )}

              {goal === "bulking" && (
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200">
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Choose Calorie Surplus Rate
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SURPLUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.level}
                        type="button"
                        onClick={() => {
                          setDeficitSurplusLevel(opt.level as DeficitSurplusLevel);
                          if (opt.level !== "custom") setCustomOffset(opt.offset);
                        }}
                        className={`p-3 rounded-xl text-left border transition-all text-xs ${
                          deficitSurplusLevel === opt.level
                            ? "bg-white border-amber-500 shadow-sm font-semibold text-slate-900"
                            : "bg-white/60 border-slate-200 text-slate-700 hover:bg-white"
                        }`}
                      >
                        <div className="font-bold text-slate-800">{opt.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                      </button>
                    ))}
                  </div>

                  {deficitSurplusLevel === "custom" && (
                    <div className="mt-3 pt-3 border-t border-amber-200 flex items-center gap-3">
                      <label className="text-xs font-semibold text-slate-700">
                        Custom Surplus (kcal/day):
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="1500"
                        value={Math.abs(customOffset)}
                        onChange={(e) => setCustomOffset(Math.abs(Number(e.target.value) || 0))}
                        className="w-24 p-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold"
                      />
                      <span className="text-xs text-slate-500">kcal surplus per day</span>
                    </div>
                  )}
                </div>
              )}

              {/* Manual Override option */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm text-slate-800">
                      Manual Calorie Target Override
                    </span>
                    <p className="text-xs text-slate-500">
                      Bypass calculated TDEE and set a fixed calorie goal directly
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isCustomTarget}
                    onChange={(e) => setIsCustomTarget(e.target.checked)}
                    className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                  />
                </div>
                {isCustomTarget && (
                  <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-3">
                    <input
                      type="number"
                      min="1000"
                      max="6000"
                      value={customTargetCalories}
                      onChange={(e) => setCustomTargetCalories(Number(e.target.value) || 2000)}
                      className="w-32 p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                    />
                    <span className="text-xs text-slate-600 font-medium">kcal / day</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "stats" && (
            <div className="space-y-5">
              {/* Sex & Age */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Biological Sex
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSex("male")}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition ${
                        sex === "male"
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setSex("female")}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition ${
                        sex === "female"
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value) || 25)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* Weight & Height */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="250"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value) || 70)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value) || 175)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* Activity Level */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  Daily Physical Activity Level
                </label>
                <div className="space-y-2">
                  {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((level) => {
                    const info = ACTIVITY_LABELS[level];
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setActivityLevel(level)}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                          activityLevel === level
                            ? "bg-orange-50 border-orange-500 ring-1 ring-orange-400"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold text-slate-800">
                            {info.label}
                          </div>
                          <div className="text-xs text-slate-500">{info.description}</div>
                        </div>
                        {activityLevel === level && (
                          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white shrink-0">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai_sql" && (
            <div className="space-y-6">
              {/* Gemini API Key */}
              <div className="p-5 bg-gradient-to-br from-indigo-50/50 to-white rounded-2xl border border-indigo-200/80">
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Key size={18} />
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Google Gemini Vision API Key (Optional)
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Get instant AI food detection and portion calorie estimation directly from meal photos. You can get a free key at{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 underline font-medium"
                  >
                    Google AI Studio
                  </a>
                  . If empty, the app will use realistic heuristic nutrition estimation.
                </p>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Supabase SQL sync helper */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                      <Database size={18} />
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Supabase Cloud Sync Schema
                    </h3>
                  </div>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition"
                  >
                    {copiedSql ? (
                      <>
                        <Check size={14} className="text-emerald-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy SQL
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  The Calorie Tracker automatically saves data locally. To sync across your devices in Supabase, paste this SQL into your Supabase SQL Editor.
                </p>
                <div className="max-h-40 overflow-y-auto bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] leading-relaxed">
                  <pre>{SUPABASE_CALORIE_SQL}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Live Summary Card */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 rounded-2xl text-white shadow-lg shadow-orange-500/20">
            <div className="flex items-center justify-between mb-3 border-b border-white/20 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-100">
                Calculated Targets Summary
              </span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">
                {goal.toUpperCase()} • TDEE: {preview.tdee} kcal
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
                <div className="text-[10px] text-orange-100 uppercase font-semibold">
                  Daily Calories
                </div>
                <div className="text-2xl font-black">{preview.targetCalories}</div>
                <div className="text-[10px] text-orange-100">kcal/day</div>
              </div>

              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
                <div className="text-[10px] text-orange-100 uppercase font-semibold">
                  Protein
                </div>
                <div className="text-2xl font-black">{preview.targetProteinG}g</div>
                <div className="text-[10px] text-orange-100">
                  {Math.round((preview.targetProteinG * 4 * 100) / preview.targetCalories)}% kcal
                </div>
              </div>

              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
                <div className="text-[10px] text-orange-100 uppercase font-semibold">
                  Carbs
                </div>
                <div className="text-2xl font-black">{preview.targetCarbsG}g</div>
                <div className="text-[10px] text-orange-100">
                  {Math.round((preview.targetCarbsG * 4 * 100) / preview.targetCalories)}% kcal
                </div>
              </div>

              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
                <div className="text-[10px] text-orange-100 uppercase font-semibold">
                  Fats
                </div>
                <div className="text-2xl font-black">{preview.targetFatG}g</div>
                <div className="text-[10px] text-orange-100">
                  {Math.round((preview.targetFatG * 9 * 100) / preview.targetCalories)}% kcal
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md shadow-orange-300 transition-all flex items-center gap-2"
          >
            {savedSuccess ? (
              <>
                <Check size={18} /> Saved!
              </>
            ) : (
              "Apply & Save Targets"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
