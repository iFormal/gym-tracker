"use client";

import { supabase } from "../utils/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, Dumbbell, UtensilsCrossed } from "lucide-react";

export default function NavLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      await supabase.auth.signOut();
      router.refresh();
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  const isWorkouts = pathname === "/";
  const isCalories = pathname.startsWith("/calories");

  return (
    <div className="min-h-screen bg-white">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 z-50 px-4 md:px-8">
        <div className="max-w-5xl mx-auto h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-sm">
              G
            </div>
            <span className="font-extrabold text-xl text-slate-800 tracking-tight">
              GymTracker
            </span>
          </Link>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isWorkouts
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Dumbbell size={16} className={isWorkouts ? "text-orange-500" : ""} />
              <span>Workouts</span>
            </Link>

            <Link
              href="/calories"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isCalories
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UtensilsCrossed
                size={16}
                className={isCalories ? "text-orange-500" : ""}
              />
              <span>Calorie Tracker</span>
              <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.2 rounded-md font-bold">
                AI
              </span>
            </Link>
          </nav>

          {/* Right: Sign Out */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors text-xs font-semibold"
            title="Sign Out"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-16 pb-20 sm:pb-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 px-6 flex items-center justify-around">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 transition-colors ${
            isWorkouts ? "text-orange-600 font-bold" : "text-slate-400 font-medium"
          }`}
        >
          <Dumbbell size={20} />
          <span className="text-[10px]">Workouts</span>
        </Link>

        <Link
          href="/calories"
          className={`flex flex-col items-center gap-1 transition-colors ${
            isCalories ? "text-orange-600 font-bold" : "text-slate-400 font-medium"
          }`}
        >
          <div className="relative">
            <UtensilsCrossed size={20} />
            <span className="absolute -top-1 -right-2 w-2 h-2 bg-orange-500 rounded-full" />
          </div>
          <span className="text-[10px]">Calories (AI)</span>
        </Link>
      </div>
    </div>
  );
}
