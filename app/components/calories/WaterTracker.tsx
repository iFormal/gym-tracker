"use client";

import { Droplets, Plus, Minus, Check } from "lucide-react";

interface Props {
  currentMl: number;
  goalMl: number;
  onUpdateIntake: (newMl: number) => void;
}

export default function WaterTracker({
  currentMl,
  goalMl,
  onUpdateIntake,
}: Props) {
  const percentage = Math.min(100, Math.round((currentMl / goalMl) * 100));
  const isGoalReached = currentMl >= goalMl;

  const handleAdd = (amount: number) => {
    onUpdateIntake(Math.max(0, currentMl + amount));
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">
            <Droplets size={22} className="fill-cyan-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">
                Daily Hydration Tracker
              </h3>
              {isGoalReached && (
                <span className="text-[10px] bg-cyan-500 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check size={10} strokeWidth={3} /> Goal Hit!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {currentMl} ml / {goalMl} ml ({percentage}%)
            </p>
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAdd(-250)}
            disabled={currentMl <= 0}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed"
            title="Subtract 250ml"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => handleAdd(250)}
            className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-bold rounded-xl transition border border-cyan-200 flex items-center gap-1"
          >
            <Plus size={14} /> 250ml (Glass)
          </button>
          <button
            onClick={() => handleAdd(500)}
            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl transition shadow-sm shadow-cyan-300 flex items-center gap-1"
          >
            <Plus size={14} /> 500ml (Bottle)
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
