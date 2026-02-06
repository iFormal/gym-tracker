"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Workout {
  date: string;
}

export default function MonthlyChart({ workouts }: { workouts: Workout[] }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const currentYear = new Date().getFullYear();

  const sessionsByMonth = workouts.reduce(
    (acc, session) => {
      const date = new Date(session.date);
      const year = date.getFullYear();

      // Only count workouts from the current year
      if (year === currentYear) {
        const monthKey = date.toLocaleDateString("en-US", { month: "short" });
        acc[monthKey] = (acc[monthKey] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const monthsOrder = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const allData = monthsOrder.map((month) => ({
    name: month,
    visits: sessionsByMonth[month] || 0,
  }));

  const currentMonth = new Date().getMonth();
  const data = isMobile
    ? allData.slice(Math.max(0, currentMonth - 4), currentMonth + 1)
    : allData;

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">
        Monthly Consistency
      </h3>
      <div className="h-64 min-h-[256px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={256}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              interval={0}
              stroke="#94a3b8"
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              stroke="#94a3b8"
              width={40}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                padding: "8px 12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="visits"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ r: 4, fill: "#f97316" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
