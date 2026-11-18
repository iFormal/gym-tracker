"use client";

import { useEffect, useRef, useState } from "react";
import { MealFoodItem, MealLog, MealType } from "../../types/calories";
import { classifyMealTime, getMealTypeInfo } from "../../utils/calorieCalculator";
import {
  Camera,
  Upload,
  X,
  Sparkles,
  Plus,
  Trash2,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveMeal: (meal: MealLog) => Promise<void>;
  initialDate?: string;
  initialMealType?: MealType;
  geminiApiKey?: string;
  editingMeal?: MealLog | null;
}

const MEAL_TYPES: MealType[] = [
  "breakfast",
  "lunch",
  "teabreak",
  "dinner",
  "supper",
  "snack",
];

export default function MealCaptureModal({
  isOpen,
  onClose,
  onSaveMeal,
  initialDate,
  initialMealType,
  geminiApiKey,
  editingMeal,
}: Props) {
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Form states
  const [date, setDate] = useState<string>(
    initialDate || new Date().toISOString().split("T")[0]
  );
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
  const [mealType, setMealType] = useState<MealType>(
    initialMealType || classifyMealTime(new Date())
  );
  const [autoClassifiedReason, setAutoClassifiedReason] = useState<string>("");

  const [title, setTitle] = useState("");
  const [calories, setCalories] = useState<number | "">("");
  const [protein, setProtein] = useState<number | "">("");
  const [carbs, setCarbs] = useState<number | "">("");
  const [fat, setFat] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<MealFoodItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Reset or fill when opening
  useEffect(() => {
    if (isOpen) {
      if (editingMeal) {
        setTitle(editingMeal.title);
        setCalories(editingMeal.calories);
        setProtein(editingMeal.protein);
        setCarbs(editingMeal.carbs);
        setFat(editingMeal.fat);
        setDate(editingMeal.date);
        setTime(editingMeal.time);
        setMealType(editingMeal.mealType);
        setNotes(editingMeal.notes || "");
        setPhotoUrl(editingMeal.photoUrl || "");
        setItems(editingMeal.items || []);
        setAutoClassifiedReason("");
      } else {
        const now = new Date();
        const autoType = initialMealType || classifyMealTime(now);
        const currentTimeStr = now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });

        setDate(initialDate || now.toISOString().split("T")[0]);
        setTime(currentTimeStr);
        setMealType(autoType);
        setAutoClassifiedReason(
          `Auto-detected as ${getMealTypeInfo(autoType).label} based on current time (${currentTimeStr})`
        );
        setTitle("");
        setCalories("");
        setProtein("");
        setCarbs("");
        setFat("");
        setNotes("");
        setPhotoUrl("");
        setItems([]);
        setAiNotice(null);
      }
    }
  }, [isOpen, editingMeal, initialDate, initialMealType]);

  // Compress & convert file to compact Base64
  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
        setPhotoUrl(compressedBase64);
        runAiAnalysis(compressedBase64);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  // Run AI / Heuristic Analysis
  const runAiAnalysis = async (imgBase64: string) => {
    setAnalyzing(true);
    setAiNotice(null);

    try {
      const res = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imgBase64,
          apiKey: geminiApiKey,
          mealHint: title || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to analyze image");
      }

      const data = await res.json();
      setTitle(data.title || "Identified Dish");
      setCalories(data.calories || 0);
      setProtein(data.protein || 0);
      setCarbs(data.carbs || 0);
      setFat(data.fat || 0);
      if (data.items && Array.isArray(data.items)) {
        setItems(data.items);
      }
      if (data.notes) {
        setNotes(data.notes);
      }
      if (data.apiKeyNotice) {
        setAiNotice(data.apiKeyNotice);
      }
    } catch (err: unknown) {
      console.warn("Analysis error:", err);
      // Fallback default
      if (!title) setTitle("Logged Meal");
      if (calories === "") setCalories(450);
      if (protein === "") setProtein(25);
      if (carbs === "") setCarbs(45);
      if (fat === "") setFat(15);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { name: "New Food Item", portion: "1 portion", calories: 100, protein: 5, carbs: 15, fat: 2 },
    ]);
  };

  const handleUpdateItem = <K extends keyof MealFoodItem>(
    index: number,
    field: K,
    value: MealFoodItem[K]
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);

    // Optionally recalculate totals
    const sumCals = updated.reduce((acc, i) => acc + (Number(i.calories) || 0), 0);
    const sumP = updated.reduce((acc, i) => acc + (Number(i.protein) || 0), 0);
    const sumC = updated.reduce((acc, i) => acc + (Number(i.carbs) || 0), 0);
    const sumF = updated.reduce((acc, i) => acc + (Number(i.fat) || 0), 0);

    if (sumCals > 0) setCalories(sumCals);
    if (sumP > 0) setProtein(sumP);
    if (sumC > 0) setCarbs(sumC);
    if (sumF > 0) setFat(sumF);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please provide a name for this meal.");
      return;
    }

    setSubmitting(true);
    const mealPayload: MealLog = {
      id: editingMeal ? editingMeal.id : `meal_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      date,
      time,
      mealType,
      title: title.trim(),
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      photoUrl: photoUrl || undefined,
      items: items.length > 0 ? items : undefined,
      notes: notes.trim() || undefined,
      createdAt: editingMeal ? editingMeal.createdAt : new Date().toISOString(),
    };

    try {
      await onSaveMeal(mealPayload);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error saving meal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <Camera size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingMeal ? "Edit Meal" : "Log / Snap Meal"}
              </h2>
              <p className="text-xs text-slate-500">
                Snap a photo for instant calories or enter details manually
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Photo Capture Section */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Meal Photo (AI Calorie Detection)
            </label>

            {photoUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video max-h-56 group">
                <img
                  src={photoUrl}
                  alt="Meal preview"
                  className="w-full h-full object-cover"
                />
                {analyzing && (
                  <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <span className="text-sm font-semibold flex items-center gap-1.5">
                      <Sparkles size={16} className="text-amber-400" />
                      Analyzing meal & calories...
                    </span>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => runAiAnalysis(photoUrl)}
                    disabled={analyzing}
                    className="px-3 py-1.5 bg-black/70 hover:bg-black text-white text-xs font-semibold rounded-lg backdrop-blur-sm transition flex items-center gap-1.5"
                  >
                    <Sparkles size={13} className="text-amber-400" /> Re-scan
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl("")}
                    className="p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-lg backdrop-blur-sm transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* Mobile Camera Button */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-4 bg-orange-50 hover:bg-orange-100/70 border-2 border-dashed border-orange-300 rounded-2xl flex flex-col items-center justify-center gap-2 transition group text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-orange-300">
                    <Camera size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Snap Photo
                    </span>
                    <span className="text-[10px] text-slate-500">Camera</span>
                  </div>
                </button>

                {/* Upload from Gallery / Files */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 transition group text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Upload Image
                    </span>
                    <span className="text-[10px] text-slate-500">File / Gallery</span>
                  </div>
                </button>

                {/* Hidden inputs */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {aiNotice && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-700 flex items-start gap-2">
                <Sparkles size={15} className="shrink-0 mt-0.5 text-indigo-500" />
                <span>{aiNotice}</span>
              </div>
            )}
          </div>

          {/* Meal Classification Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Meal Category
              </label>
              {autoClassifiedReason && (
                <span className="text-[11px] text-orange-600 font-medium">
                  {autoClassifiedReason}
                </span>
              )}
            </div>

            {/* Meal Type Pill Selector */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {MEAL_TYPES.map((type) => {
                const info = getMealTypeInfo(type);
                const isSelected = mealType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setMealType(type);
                      setAutoClassifiedReason("");
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-300"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-base">{info.emoji}</span>
                    <span className="text-[11px] capitalize">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time & Date selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Meal Title & Total Calories */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Meal Title / Food Description
              </label>
              <input
                type="text"
                placeholder="e.g. Grilled Chicken Salad with Rice"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            {/* Macros row */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-orange-50 p-2.5 rounded-xl border border-orange-200 text-center">
                <span className="text-[10px] font-bold uppercase text-orange-700 block">
                  Calories
                </span>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  max="10000"
                  value={calories}
                  onChange={(e) =>
                    setCalories(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full text-center font-bold text-slate-900 bg-transparent border-0 p-0 text-base focus:ring-0"
                  required
                />
                <span className="text-[10px] text-orange-600 font-medium">kcal</span>
              </div>

              <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200 text-center">
                <span className="text-[10px] font-bold uppercase text-blue-700 block">
                  Protein
                </span>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  max="1000"
                  value={protein}
                  onChange={(e) =>
                    setProtein(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full text-center font-bold text-slate-900 bg-transparent border-0 p-0 text-base focus:ring-0"
                />
                <span className="text-[10px] text-blue-600 font-medium">g</span>
              </div>

              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-center">
                <span className="text-[10px] font-bold uppercase text-amber-700 block">
                  Carbs
                </span>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  max="1000"
                  value={carbs}
                  onChange={(e) =>
                    setCarbs(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full text-center font-bold text-slate-900 bg-transparent border-0 p-0 text-base focus:ring-0"
                />
                <span className="text-[10px] text-amber-600 font-medium">g</span>
              </div>

              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-center">
                <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                  Fat
                </span>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  max="1000"
                  value={fat}
                  onChange={(e) =>
                    setFat(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full text-center font-bold text-slate-900 bg-transparent border-0 p-0 text-base focus:ring-0"
                />
                <span className="text-[10px] text-emerald-600 font-medium">g</span>
              </div>
            </div>
          </div>

          {/* Breakdown Items List */}
          {items.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Plate Items Breakdown
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs text-orange-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Add Item
                </button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(idx, "name", e.target.value)}
                      className="flex-1 font-semibold text-slate-800 bg-transparent border-0 p-0 focus:ring-0"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={item.calories}
                        onChange={(e) =>
                          handleUpdateItem(idx, "calories", Number(e.target.value) || 0)
                        }
                        className="w-14 text-right font-bold text-slate-800 bg-slate-50 p-1 rounded border border-slate-200"
                      />
                      <span className="text-[10px] text-slate-400">kcal</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Ate before workout, drank 500ml water"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Footer Submit Button */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-300 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? "Saving..." : editingMeal ? "Update Meal" : "Add to Daily Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
