"use client";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };
  return (
    <button onClick={handleLogout} className="text-sm underline">
      Sign Out
    </button>
  );
}
