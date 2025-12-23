"use client";

import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";

export default function ImportWorkouts() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const parseAndImport = async () => {
    setError("");
    setLoading(true);

    try {
      const lines = importText.split("\n").filter((line) => line.trim());
      const allDates: Date[] = [];

      for (const line of lines) {
        const match = line.match(/([A-Za-z]+)(?:\s+(\d{4}))?\s*-\s*([\d,\s]+)/);
        if (!match) {
          setError(
            `Invalid format in line: "${line}". Use format: "Nov - 8,9,10" or "Nov 2024 - 8,9,10"`
          );
          setLoading(false);
          return;
        }

        const monthStr = match[1].trim();
        const yearStr = match[2];
        const daysStr = match[3].trim();
        const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();
        const days = daysStr.split(",").map((d) => parseInt(d.trim()));

        const monthNames = [
          "jan",
          "feb",
          "mar",
          "apr",
          "may",
          "jun",
          "jul",
          "aug",
          "sep",
          "oct",
          "nov",
          "dec",
        ];
        const monthIndex = monthNames.findIndex((m) =>
          monthStr.toLowerCase().startsWith(m)
        );

        if (monthIndex === -1) {
          setError(`Invalid month: "${monthStr}"`);
          setLoading(false);
          return;
        }

        for (const day of days) {
          if (isNaN(day) || day < 1 || day > 31) {
            setError(`Invalid day: ${day}`);
            setLoading(false);
            return;
          }
          const date = new Date(year, monthIndex, day);
          allDates.push(date);
        }
      }

      const records = allDates.map((date) => ({
        notes: "Went to the Gym",
        date: date.toISOString(),
      }));

      const { error: dbError } = await supabase
        .from("gym-session")
        .insert(records);

      if (dbError) {
        setError("Error saving to database");
        console.error(dbError);
      } else {
        setImportText("");
        setIsOpen(false);
        router.refresh();
      }
    } catch (err) {
      setError("Failed to parse import text");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-600 transition-colors"
      >
        <Upload size={16} />
        Import
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Import Workouts
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Format:{" "}
              <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                Nov - 8,9,10
              </code>{" "}
              or{" "}
              <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                Nov 2024 - 8,9,10
              </code>
              <br />
              One per line. Multiple months/years supported.
            </p>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Nov - 8,9,10&#10;Dec 2024 - 1,5,12"
              className="w-full p-3 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:outline-none mb-4"
              rows={6}
            />

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={parseAndImport}
                disabled={loading || !importText.trim()}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Importing..." : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
