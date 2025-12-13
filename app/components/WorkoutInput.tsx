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
    <form onSubmit={handleSubmit} className="w-full max-w-md mb-8">
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Add New Session
        </label>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
          rows={3}
          placeholder="Paste your workout here... (e.g. Bench 5x5, Squat 3x5)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Saving..." : "Log Workout"}
      </button>
    </form>
  );
}
