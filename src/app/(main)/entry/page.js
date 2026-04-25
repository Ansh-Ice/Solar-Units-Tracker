"use client";

import EntryForm from "@/components/EntryForm";
import { useRouter } from "next/navigation";

export default function AddEntryPage() {
  const router = useRouter();

  return (
    <main className="flex-1 p-4 md:p-6 pb-24 md:pb-24 max-w-lg mx-auto w-full">
      <header className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-1">Add Entry</h1>
        <p className="text-charcoal-400 text-sm">
          Record your daily meter readings
        </p>
      </header>

      <div className="card animate-slide-up stagger-1">
        <EntryForm 
          onSuccess={() => {
            router.push("/dashboard");
          }} 
        />
      </div>
    </main>
  );
}
