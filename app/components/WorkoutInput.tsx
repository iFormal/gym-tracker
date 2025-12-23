"use client";

import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/navigation";

export default function WorkoutInput() {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalNote = notes.trim() === "" ? "Went to the Gym" : notes;

    const { error } = await supabase.from("gym-session").insert([
      {
        notes: finalNote,
        date: new Date().toISOString(),
      },
    ]);

    if (error) {
      alert("Error adding workout");
      console.error(error);
    } else {
      setNotes("");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <textarea
          className="w-full p-4 border-0 focus:ring-0 focus:outline-none text-slate-900 placeholder:text-slate-400 resize-none"
          rows={3}
          placeholder="What did you do today? (e.g., Bench 5×5, Squat 3×5, or just hit 'Log' for a quick entry)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="px-4 pb-4 pt-2 bg-slate-50 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-200"
          >
            {loading ? "Saving..." : "Log Workout"}
          </button>
        </div>
      </div>
    </form>
  );
}
