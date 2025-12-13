import { createClient } from "./utils/supabaseServer";
import { redirect } from "next/navigation";
import WorkoutInput from "./components/WorkoutInput";
import MonthlyChart from "./components/MonthlyChart";
import SignOutButton from "./components/SignOutButton";

export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: workouts, error } = await supabase
    .from("gym-session")
    .select("*")
    .order("date", { ascending: false });

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-gray-50 text-black">
      <div className="w-full max-w-md flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Gym Tracker</h1>
        <SignOutButton />
      </div>

      <div className="w-full max-w-md">
        {workouts && <MonthlyChart workouts={workouts} />}
      </div>

      <WorkoutInput />

      <div className="w-full max-w-md mt-8">
        <h2 className="text-xl font-semibold mb-4">History</h2>
        {!workouts || workouts.length === 0 ? (
          <p className="text-gray-500 italic">No logs found.</p>
        ) : (
          <ul className="space-y-3">
            {workouts.map((workout) => (
              <li
                key={workout.id}
                className="bg-white p-4 rounded shadow border border-gray-200 flex justify-between items-center"
              >
                <span className="font-medium text-gray-800">
                  {workout.notes}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(workout.date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
