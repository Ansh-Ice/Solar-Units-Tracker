"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getRecentEntries } from "@/lib/firestore";
import StatCard from "@/components/StatCard";
import TrendChart from "@/components/TrendChart";
import ComparisonChart from "@/components/ComparisonChart";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("trend");

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const data = await getRecentEntries(user.uid, 7);
        setEntries(data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 p-6 flex flex-col gap-6">
        <header className="mb-2">
          <div className="h-8 w-40 skeleton mb-2" />
          <div className="h-4 w-60 skeleton" />
        </header>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 skeleton" />
          <div className="h-24 skeleton" />
          <div className="h-24 skeleton col-span-2" />
        </div>
        <div className="h-64 skeleton mt-4" />
      </div>
    );
  }

  const hasData = entries.length > 0;
  
  // Calculate stats based on today's entry (or the most recent one if today is missing)
  const todayEntry = hasData ? entries[0] : null;
  const isToday = todayEntry && new Date(todayEntry.dateStr).toDateString() === new Date().toDateString();
  
  const totalGen = entries.reduce((sum, e) => sum + e.generated, 0);
  const totalCon = entries.reduce((sum, e) => sum + e.consumed, 0);

  return (
    <main className="flex-1 p-4 md:p-6 pb-24 md:pb-24 max-w-4xl mx-auto w-full">
      <header className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-charcoal-400 text-sm">
          {isToday ? "Today's summary" : "Recent summary"}
        </p>
      </header>

      {hasData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="stagger-1">
              <StatCard
                title={isToday ? "Today Gen" : "Latest Gen"}
                value={todayEntry.generated.toFixed(1)}
                unit="u"
                accentClass="accent-orange"
                subtitle="Generated"
              />
            </div>
            <div className="stagger-2">
              <StatCard
                title={isToday ? "Today Con" : "Latest Con"}
                value={todayEntry.consumed.toFixed(1)}
                unit="u"
                accentClass="accent-green"
                subtitle="Consumed"
              />
            </div>
            <div className="col-span-2 stagger-3">
              <StatCard
                title="Daily Net"
                value={Math.abs(todayEntry.generated - todayEntry.consumed).toFixed(1)}
                unit="u"
                accentClass={todayEntry.generated >= todayEntry.consumed ? "accent-amber" : "accent-red"}
                subtitle={todayEntry.generated >= todayEntry.consumed ? "Surplus Energy" : "Deficit Energy"}
              />
            </div>
          </div>

          <div className="card gradient-border mt-8 p-1 stagger-4">
            <div className="bg-charcoal-900 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">7-Day Analysis</h2>
                <div className="flex bg-charcoal-950 p-1 rounded-xl">
                  <button
                    className={`tab ${activeTab === "trend" ? "active" : ""}`}
                    onClick={() => setActiveTab("trend")}
                  >
                    Trend
                  </button>
                  <button
                    className={`tab ${activeTab === "compare" ? "active" : ""}`}
                    onClick={() => setActiveTab("compare")}
                  >
                    Compare
                  </button>
                </div>
              </div>

              <div className="mt-2">
                {activeTab === "trend" ? (
                  <TrendChart entries={entries} />
                ) : (
                  <ComparisonChart entries={entries} />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-charcoal-800">
                <div>
                  <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">7d Total Gen</p>
                  <p className="text-xl font-bold text-solar-orange">{totalGen.toFixed(1)}<span className="text-sm font-normal text-charcoal-500 ml-1">u</span></p>
                </div>
                <div>
                  <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">7d Total Con</p>
                  <p className="text-xl font-bold text-solar-green">{totalCon.toFixed(1)}<span className="text-sm font-normal text-charcoal-500 ml-1">u</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12 animate-fade-in stagger-2">
          <div className="w-16 h-16 rounded-full bg-charcoal-800 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-charcoal-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No data yet</h3>
          <p className="text-charcoal-400 text-sm mb-6 max-w-xs mx-auto">
            Start tracking your solar energy by adding your first daily reading.
          </p>
          <Link href="/entry" className="btn btn-primary">
            Add First Entry
          </Link>
        </div>
      )}
    </main>
  );
}
