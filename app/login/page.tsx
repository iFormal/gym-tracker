"use client";

import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      alert("Check your email for the login link!");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Login to Gym Tracker</h1>
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 w-full max-w-sm"
      >
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 border rounded text-black"
          required
        />
        <button
          disabled={loading}
          className="bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700"
        >
          {loading ? "Sending..." : "Send Magic Link"}
        </button>
      </form>
    </div>
  );
}
