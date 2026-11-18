"use client";

import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/navigation";
import { Edit2, Trash2 } from "lucide-react";

interface Workout {
  id: number;
  notes: string;
  date: string;
  created_at?: string;
}

export default function WorkoutItem({ workout }: { workout: Workout }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState(workout.notes);
  const [isLoading, setIsLoading] = useState(false);

  // Update function
  const handleUpdate = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from("gym-session")
      .update({ notes: editedNote })
      .eq("id", workout.id);

    if (error) {
      alert("Error updating");
    } else {
      setIsEditing(false);
      router.refresh();
    }
    setIsLoading(false);
  };

  // Delete function
  const handleDelete = async () => {
    if (!confirm("Delete this log?")) return;
    setIsLoading(true);
    const { error } = await supabase
      .from("gym-session")
      .delete()
      .eq("id", workout.id);
    if (error) alert("Error deleting");
    else router.refresh();
  };

  if (isEditing) {
    return (
      <li className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 flex flex-col gap-3">
        <textarea
          value={editedNote}
          onChange={(e) => setEditedNote(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:outline-none"
          rows={3}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setIsEditing(false)}
            className="text-sm font-semibold text-slate-600 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={isLoading}
            className="text-sm font-semibold text-white px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 flex justify-between items-start gap-4 group transition-shadow">
      <div className="flex-1 min-w-0">
        <div className="text-sm text-slate-500 font-medium mb-2">
          {new Date(workout.date).toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
        <div className="text-slate-900 whitespace-pre-wrap leading-relaxed">
          {workout.notes}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          title="Edit"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
}
