"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { addEntry, updateEntry, getPreviousEntryByDate, getNextEntryByDate, formatDateStr, parseDateStr } from "@/lib/firestore";
import WarningAlert from "./WarningAlert";
import toast from "react-hot-toast";

export default function EntryForm({ initialData, onSuccess }) {
  const { user } = useAuth();
  
  const [dateStr, setDateStr] = useState(
    initialData?.dateStr || formatDateStr(new Date())
  );
  
  const [readingGenerated, setReadingGenerated] = useState(
    initialData ? (initialData.readingGenerated ?? initialData.generated ?? "").toString() : ""
  );
  const [readingConsumed, setReadingConsumed] = useState(
    initialData ? (initialData.readingConsumed ?? initialData.consumed ?? "").toString() : ""
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousEntry, setPreviousEntry] = useState(null);

  const isEditing = !!initialData;

  useEffect(() => {
    async function loadPrevious() {
      if (!user || !dateStr) return;
      try {
        const dateObj = parseDateStr(dateStr);
        const prev = await getPreviousEntryByDate(user.uid, dateObj);
        
        if (prev && (!initialData || prev.id !== initialData.id)) {
          setPreviousEntry(prev);
          
          if (!isEditing) {
             const prevGen = prev.readingGenerated ?? prev.generated;
             const prevCon = prev.readingConsumed ?? prev.consumed;
             if (!readingGenerated && prevGen !== undefined) setReadingGenerated(prevGen.toString());
             if (!readingConsumed && prevCon !== undefined) setReadingConsumed(prevCon.toString());
          }
        } else {
          setPreviousEntry(null);
        }
      } catch (err) {
        console.error("Failed to load previous entry:", err);
      }
    }
    loadPrevious();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dateStr, isEditing, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!dateStr || readingGenerated === "" || readingConsumed === "") {
      toast.error("Please fill in all fields");
      return;
    }

    const curGen = parseFloat(readingGenerated);
    const curCon = parseFloat(readingConsumed);

    if (isNaN(curGen) || isNaN(curCon) || curGen < 0 || curCon < 0) {
      toast.error("Please enter valid positive numbers");
      return;
    }

    setIsSubmitting(true);
    try {
      const dateObj = parseDateStr(dateStr);
      const prev = await getPreviousEntryByDate(user.uid, dateObj);
      
      let dailyGen = curGen;
      let dailyCon = curCon;

      if (prev) {
         const prevGen = prev.readingGenerated ?? prev.generated ?? 0;
         const prevCon = prev.readingConsumed ?? prev.consumed ?? 0;
         const diffGen = curGen - prevGen;
         const diffCon = curCon - prevCon;
         
         const daysGap = Math.max(1, Math.round((dateObj - prev.date) / (1000 * 60 * 60 * 24)));
         dailyGen = diffGen / daysGap;
         dailyCon = diffCon / daysGap;
      } else {
         dailyGen = 15;
         dailyCon = 10;
      }
      
      if (dailyGen < 0 || dailyCon < 0) {
         toast.error("Invalid readings: resulting daily value is negative.");
         setIsSubmitting(false);
         return;
      }

      const data = {
        date: dateStr,
        readingGenerated: Number(curGen.toFixed(1)),
        readingConsumed: Number(curCon.toFixed(1)),
        dailyGenerated: Number(dailyGen.toFixed(1)),
        dailyConsumed: Number(dailyCon.toFixed(1)),
      };

      if (isEditing) {
        await updateEntry(initialData.id, data);
        
        // Recalculate next entry if exists
        const next = await getNextEntryByDate(user.uid, dateObj);
        if (next) {
            const nextGen = next.readingGenerated ?? next.generated ?? 0;
            const nextCon = next.readingConsumed ?? next.consumed ?? 0;
            const diffGen = nextGen - curGen;
            const diffCon = nextCon - curCon;
            const daysGap = Math.max(1, Math.round((next.date - dateObj) / (1000 * 60 * 60 * 24)));
            
            // Just reuse next object and overwrite needed fields
            const nextData = {
               ...next,
               date: next.dateStr,
               dailyGenerated: Number((diffGen / daysGap).toFixed(1)),
               dailyConsumed: Number((diffCon / daysGap).toFixed(1)),
            };
            await updateEntry(next.id, nextData);
        }

        toast.success("Entry updated successfully");
      } else {
        await addEntry(user.uid, data);
        toast.success("Entry added successfully");
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving entry:", error);
      toast.error("Failed to save entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const curGen = parseFloat(readingGenerated);
  const curCon = parseFloat(readingConsumed);
  const hasValidGen = !isNaN(curGen);
  const hasValidCon = !isNaN(curCon);
  
  // Calculate daily for warning alert
  let currentDailyGen = curGen;
  let currentDailyCon = curCon;
  let prevDailyGen = 0;
  let prevDailyCon = 0;

  if (previousEntry) {
    const prevGen = previousEntry.readingGenerated ?? previousEntry.generated ?? 0;
    const prevCon = previousEntry.readingConsumed ?? previousEntry.consumed ?? 0;
    const dateObj = parseDateStr(dateStr);
    const daysGap = Math.max(1, Math.round((dateObj - previousEntry.date) / (1000 * 60 * 60 * 24)));
    currentDailyGen = (curGen - prevGen) / daysGap;
    currentDailyCon = (curCon - prevCon) / daysGap;
    prevDailyGen = previousEntry.dailyGenerated ?? prevGen;
    prevDailyCon = previousEntry.dailyConsumed ?? prevCon;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-charcoal-300 mb-1.5" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            required
            className="w-full"
            disabled={isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal-300 mb-1.5" htmlFor="generated">
            Meter Reading (Generated)
          </label>
          <input
            id="generated"
            type="number"
            step="0.1"
            min="0"
            value={readingGenerated}
            onChange={(e) => setReadingGenerated(e.target.value)}
            placeholder="e.g. 1500.5"
            required
            className="w-full"
          />
          {hasValidGen && previousEntry && (
            <WarningAlert 
              type="generated" 
              field="generated"
              currentValue={currentDailyGen} 
              previousValue={prevDailyGen} 
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal-300 mb-1.5" htmlFor="consumed">
            Meter Reading (Consumed)
          </label>
          <input
            id="consumed"
            type="number"
            step="0.1"
            min="0"
            value={readingConsumed}
            onChange={(e) => setReadingConsumed(e.target.value)}
            placeholder="e.g. 1200.0"
            required
            className="w-full"
          />
          {hasValidCon && previousEntry && (
            <WarningAlert 
              type="consumed" 
              field="consumed"
              currentValue={currentDailyCon} 
              previousValue={prevDailyCon} 
            />
          )}
        </div>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary w-full mt-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Saving...
          </>
        ) : (
          isEditing ? "Update Entry" : "Save Entry"
        )}
      </button>
    </form>
  );
}
