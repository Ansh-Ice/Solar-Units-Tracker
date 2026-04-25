"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-charcoal-700" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-solar-orange border-t-transparent animate-spin" />
          </div>
          <p className="text-charcoal-400 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return children;
}
