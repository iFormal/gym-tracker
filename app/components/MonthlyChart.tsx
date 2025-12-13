"use client";

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
  const sessionsByMonth = workouts.reduce((acc, session) => {
    const date = new Date(session.date);
    const monthKey = date.toLocaleDateString("en-US", { month: "short" });

    acc[monthKey] = (acc[monthKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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

  const data = monthsOrder.map((month) => ({
    name: month,
    visits: sessionsByMonth[month] || 0,
  }));

  return (
    <div className="w-full h-64 bg-white p-4 rounded shadow mb-8 border border-gray-200">
      <h3 className="text-gray-500 text-sm font-bold mb-4 uppercase">
        Monthly Consistency
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="visits"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4, fill: "#2563eb" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
