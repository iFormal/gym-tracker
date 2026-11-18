import { createClient } from "./utils/supabaseServer";
import { redirect } from "next/navigation";
import WorkoutInput from "./components/WorkoutInput";
import WorkoutItem from "./components/WorkoutItem";
import SmartCalendar from "./components/SmartCalendar";
import StatsDashboard from "./components/StatsDashboard";
import MonthlyChart from "./components/MonthlyChart";
import ImportWorkouts from "./components/ImportWorkouts";
import TodayCalorieWidget from "./components/TodayCalorieWidget";

export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch workouts
  const { data: workouts, error } = await supabase
    .from("gym-session")
    .select("*, created_at")
    .order("date", { ascending: false });

  const safeWorkouts = workouts || [];

  return (
    <div className="pb-20 pt-6 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600 text-lg">
          Track your consistency, one day at a time.
        </p>
      </header>

      {/* Today's Calories Overview */}
      <TodayCalorieWidget />

      <SmartCalendar workouts={safeWorkouts} />
      <StatsDashboard workouts={safeWorkouts} />
      <MonthlyChart workouts={safeWorkouts} />

      <div className="mt-10 mb-12">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Log Session
          </h3>
          <ImportWorkouts />
        </div>
        <WorkoutInput />
      </div>

      <div className="mt-14">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
          Recent Activity
        </h3>

        {safeWorkouts.length === 0 ? (
          <div className="p-12 text-center bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💪</span>
            </div>
            <p className="text-slate-600 font-medium mb-1">
              No workouts logged yet
            </p>
            <p className="text-sm text-slate-400">
              Start your fitness journey by logging your first session above
            </p>
          </div>
        ) : (
          <ul className="grid gap-3">
            {safeWorkouts.map((workout) => (
              <WorkoutItem key={workout.id} workout={workout} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
