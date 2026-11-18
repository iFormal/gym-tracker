"use client";

import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-2xl mb-6 shadow-lg">
            <span className="text-white font-bold text-4xl">G</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-3">GymTracker</h1>
          <p className="text-slate-600 text-lg">
            Track your fitness journey, one day at a time
          </p>
        </div>

        {!sent ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
              Sign In
            </h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  required
                />
              </div>
              <button
                disabled={loading}
                className="w-full bg-orange-500 text-white p-4 rounded-xl font-semibold hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed transition-colors shadow-lg shadow-orange-200"
              >
                {loading ? "Sending..." : "Send Login Link"}
              </button>
            </form>
            <p className="text-sm text-slate-500 text-center mt-6">
              We&apos;ll email you a login link. No passwords required!
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">
              Check Your Email
            </h2>
            <p className="text-slate-600 mb-6">
              We&apos;ve sent your login link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-slate-500">
              Click the link in the email to sign in. You can close this page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
