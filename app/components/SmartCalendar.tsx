"use client";

import { useState } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isSameMonth,
} from "date-fns";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";

interface Workout {
  date: string;
}

export default function SmartCalendar({ workouts }: { workouts: Workout[] }) {
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const calculateWeeklyStreak = () => {
    let streak = 0;
    let checkDate = new Date();

    while (true) {
      const start = startOfWeek(checkDate, { weekStartsOn: 1 });
      const end = endOfWeek(checkDate, { weekStartsOn: 1 });

      const hasWorkout = workouts.some((w) => {
        const d = new Date(w.date);
        return d >= start && d <= end;
      });

      if (hasWorkout) {
        streak++;
        checkDate = subWeeks(checkDate, 1);
      } else {
        if (isSameDay(start, startOfWeek(new Date(), { weekStartsOn: 1 }))) {
          checkDate = subWeeks(checkDate, 1);
          continue;
        }
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateWeeklyStreak();

  const generateDays = () => {
    if (viewMode === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(monthStart);
      const start = startOfWeek(monthStart, { weekStartsOn: 1 });
      const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    }
  };

  const days = generateDays();
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

  const handlePrev = () =>
    viewMode === "week"
      ? setCurrentDate(subWeeks(currentDate, 1))
      : setCurrentDate(subMonths(currentDate, 1));
  const handleNext = () =>
    viewMode === "week"
      ? setCurrentDate(addWeeks(currentDate, 1))
      : setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-end mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-full">
            <Flame className="text-orange-500 fill-orange-500" size={24} />
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-900 block leading-none">
              {currentStreak}
            </span>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">
              Week Streak
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-xs font-semibold text-slate-600 hover:text-orange-600 transition-colors"
            title="Jump to today"
          >
            Today
          </button>
          <button
            onClick={() => setViewMode(viewMode === "week" ? "month" : "week")}
            className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
          >
            {viewMode === "week" ? "View Month" : "View Week"}
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handlePrev}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            {viewMode === "week" ? (
              <h2 className="font-bold text-gray-800 text-base">
                {format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d")}{" "}
                -{" "}
                {format(
                  endOfWeek(currentDate, { weekStartsOn: 1 }),
                  "MMM d, yyyy"
                )}
              </h2>
            ) : (
              <>
                <h2 className="font-bold text-gray-800 text-base">
                  {format(currentDate, "MMMM yyyy")}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {format(startOfMonth(currentDate), "MMM d")} -{" "}
                  {format(endOfMonth(currentDate), "MMM d")}
                </p>
              </>
            )}
          </div>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-3 mb-2">
          {weekDays.map((d, i) => (
            <div
              key={i}
              className="flex items-center justify-center text-center"
            >
              <span className="text-[10px] font-bold text-gray-400">{d}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-3">
          {days.map((day: Date) => {
            const isWorkoutDay = workouts.some((w) =>
              isSameDay(new Date(w.date), day)
            );
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={day.toISOString()}
                className="flex items-center justify-center"
              >
                <div
                  className={clsx(
                    "w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-all text-center", // Fixed size circle
                    !isCurrentMonth && viewMode === "month"
                      ? "text-slate-200"
                      : "text-slate-600",

                    isToday &&
                      !isWorkoutDay &&
                      "bg-slate-100 text-slate-900 font-bold border border-slate-300",

                    isWorkoutDay &&
                      "bg-orange-500 text-white shadow-md shadow-orange-200",

                    !isWorkoutDay && isCurrentMonth && "hover:bg-slate-50"
                  )}
                >
                  <span>{format(day, "d")}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
