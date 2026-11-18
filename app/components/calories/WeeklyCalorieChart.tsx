"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts";
import { format, subDays } from "date-fns";
import { MealLog } from "../../types/calories";

interface Props {
  meals: MealLog[];
  targetCalories: number;
}

export default function WeeklyCalorieChart({ meals, targetCalories }: Props) {
  const chartData = useMemo(() => {
    const today = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, "yyyy-MM-dd");
      const dayMeals = meals.filter((m) => m.date === dateStr);
      const dayCalories = dayMeals.reduce(
        (sum, m) => sum + (Number(m.calories) || 0),
        0
      );

      days.push({
        dayName: format(d, "EEE"),
        date: format(d, "MMM d"),
        calories: dayCalories,
        target: targetCalories,
        isOver: dayCalories > targetCalories,
      });
    }

    return days;
  }, [meals, targetCalories]);

  return (
    <div className="w-full bg-white p-6 rounded-3xl shadow-xs border border-slate-200 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            7-Day Calorie Consistency
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Target: {targetCalories} kcal / day
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> Within Target
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Over Target
          </span>
        </div>
      </div>

      <div className="h-60 w-full min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="dayName"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              stroke="#94a3b8"
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              stroke="#94a3b8"
              width={45}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1">
                      <div className="font-bold text-slate-300">{data.date}</div>
                      <div>
                        <strong>{data.calories}</strong> kcal logged
                      </div>
                      <div
                        className={data.isOver ? "text-rose-400 font-bold" : "text-emerald-400"}
                      >
                        {data.isOver
                          ? `+${data.calories - data.target} kcal Over Target`
                          : `${data.target - data.calories} kcal Under Target`}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={targetCalories}
              stroke="#f97316"
              strokeDasharray="4 4"
              strokeWidth={2}
            />
            <Bar dataKey="calories" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isOver ? "#f43f5e" : "#f97316"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
