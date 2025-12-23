import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";

interface Workout {
  date: string;
}

export default function StatsDashboard({ workouts }: { workouts: Workout[] }) {
  const now = new Date();

  const thisWeekCount = workouts.filter((w) => {
    const workoutDate = startOfDay(new Date(w.date));
    const weekStart = startOfDay(startOfWeek(now, { weekStartsOn: 1 }));
    const weekEnd = endOfDay(endOfWeek(now, { weekStartsOn: 1 }));
    return isWithinInterval(workoutDate, { start: weekStart, end: weekEnd });
  }).length;

  const thisMonthCount = workouts.filter((w) => {
    const workoutDate = startOfDay(new Date(w.date));
    const monthStart = startOfDay(startOfMonth(now));
    const monthEnd = endOfDay(endOfMonth(now));
    return isWithinInterval(workoutDate, { start: monthStart, end: monthEnd });
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 mb-10">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Total Workouts
        </div>
        <div className="text-3xl font-bold text-slate-900">
          {workouts.length}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
          This Week
        </div>
        <div className="text-3xl font-bold text-slate-900">{thisWeekCount}</div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
          This Month
        </div>
        <div className="text-3xl font-bold text-slate-900">
          {thisMonthCount}
        </div>
      </div>
    </div>
  );
}
