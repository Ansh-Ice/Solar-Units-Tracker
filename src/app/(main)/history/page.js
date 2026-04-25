"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getEntries, deleteEntry, formatDateStr } from "@/lib/firestore";
import EntryForm from "@/components/EntryForm";
import toast from "react-hot-toast";

export default function HistoryPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState(null);

  const loadData = async () => {
    if (!user) return;
    try {
      const data = await getEntries(user.uid);
      setEntries(data);
    } catch (error) {
      console.error("Failed to load history:", error);
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    
    try {
      await deleteEntry(id);
      toast.success("Entry deleted");
      setEntries(entries.filter(e => e.id !== id));
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete entry");
    }
  };

  // Check for missing days (simple check for the last 7 days)
  const isDateMissing = (dateStr) => {
    const today = new Date();
    const d = new Date(dateStr);
    
    // Don't check days in the future
    if (d > today) return false;
    
    // Don't flag days older than 7 days as prominently missing
    const diffTime = Math.abs(today - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 7) return false;

    return !entries.some(e => e.dateStr === dateStr);
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 max-w-lg mx-auto w-full">
        <div className="h-8 w-40 skeleton mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  // Generate last 7 days for missing days check
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return formatDateStr(d);
  });

  const missingDays = last7Days.filter(dateStr => 
    !entries.some(e => e.dateStr === dateStr)
  );

  return (
    <main className="flex-1 p-4 md:p-6 pb-24 md:pb-24 max-w-lg mx-auto w-full">
      <header className="mb-6 animate-fade-in flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">History</h1>
          <p className="text-charcoal-400 text-sm">
            Past readings and adjustments
          </p>
        </div>
      </header>

      {editingEntry ? (
        <div className="card animate-slide-up mb-6 border-solar-amber">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-charcoal-800">
            <h2 className="font-semibold text-white">Edit Entry</h2>
            <button 
              onClick={() => setEditingEntry(null)}
              className="text-charcoal-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
          <EntryForm 
            initialData={editingEntry} 
            onSuccess={() => {
              setEditingEntry(null);
              loadData();
            }} 
          />
        </div>
      ) : (
        <div className="space-y-4">
          {missingDays.length > 0 && (
            <div className="card missing-day p-4 animate-fade-in mb-6">
              <div className="flex items-start gap-3">
                <span className="text-xl">📅</span>
                <div>
                  <h3 className="font-semibold text-solar-red mb-1">Missing Entries</h3>
                  <p className="text-sm text-charcoal-300">
                    You missed {missingDays.length} reading{missingDays.length > 1 ? 's' : ''} in the last 7 days.
                  </p>
                </div>
              </div>
            </div>
          )}

          {entries.length === 0 ? (
            <div className="text-center py-12 text-charcoal-500">
              No entries found.
            </div>
          ) : (
            entries.map((entry, index) => {
              const d = new Date(entry.date);
              const dateDisplay = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
              
              return (
                <div 
                  key={entry.id} 
                  className={`card p-4 animate-slide-up hover:border-charcoal-600 transition-colors`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-charcoal-800">
                    <div className="font-medium text-white">{dateDisplay}</div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingEntry(entry)}
                        className="p-1.5 text-charcoal-400 hover:text-solar-amber rounded-lg hover:bg-charcoal-800 transition-colors"
                        title="Edit"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 text-charcoal-400 hover:text-solar-red rounded-lg hover:bg-charcoal-800 transition-colors"
                        title="Delete"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Generated</p>
                      <p className="font-semibold text-solar-orange">{entry.generated.toFixed(1)} u</p>
                    </div>
                    <div>
                      <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Consumed</p>
                      <p className="font-semibold text-solar-green">{entry.consumed.toFixed(1)} u</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </main>
  );
}
