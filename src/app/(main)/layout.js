"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";

export default function MainLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex-1 flex flex-col pb-20">
        {children}
      </div>
      <BottomNav />
    </ProtectedRoute>
  );
}
