"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { addEntry, updateEntry, getPreviousEntry, formatDateStr } from "@/lib/firestore";
import WarningAlert from "./WarningAlert";
import toast from "react-hot-toast";

export default function EntryForm({ initialData, onSuccess }) {
  const { user } = useAuth();
  
  const [dateStr, setDateStr] = useState(
    initialData?.dateStr || formatDateStr(new Date())
  );
  const [generated, setGenerated] = useState(
    initialData ? initialData.generated.toString() : ""
  );
  const [consumed, setConsumed] = useState(
    initialData ? initialData.consumed.toString() : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousEntry, setPreviousEntry] = useState(null);

  const isEditing = !!initialData;

  useEffect(() => {
    async function loadPrevious() {
      if (!user) return;
      try {
        const prev = await getPreviousEntry(user.uid);
        if (prev && (!initialData || prev.id !== initialData.id)) {
          setPreviousEntry(prev);
          
          // Auto-fill previous values if we're adding a new entry and fields are empty
          if (!isEditing) {
             if (!generated && prev.generated) setGenerated(prev.generated.toString());
             if (!consumed && prev.consumed) setConsumed(prev.consumed.toString());
          }
        }
      } catch (err) {
        console.error("Failed to load previous entry:", err);
      }
    }
    loadPrevious();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isEditing, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!dateStr || generated === "" || consumed === "") {
      toast.error("Please fill in all fields");
      return;
    }

    const genNum = parseFloat(generated);
    const conNum = parseFloat(consumed);

    if (isNaN(genNum) || isNaN(conNum) || genNum < 0 || conNum < 0) {
      toast.error("Please enter valid positive numbers");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        date: dateStr,
        generated: Number(genNum.toFixed(1)),
        consumed: Number(conNum.toFixed(1)),
      };

      if (isEditing) {
        await updateEntry(initialData.id, data);
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

  const genNum = parseFloat(generated);
  const conNum = parseFloat(consumed);
  const hasValidGen = !isNaN(genNum);
  const hasValidCon = !isNaN(conNum);

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
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal-300 mb-1.5" htmlFor="generated">
            Units Generated
          </label>
          <input
            id="generated"
            type="number"
            step="0.1"
            min="0"
            value={generated}
            onChange={(e) => setGenerated(e.target.value)}
            placeholder="e.g. 15.5"
            required
            className="w-full"
          />
          {hasValidGen && previousEntry && previousEntry.generated !== undefined && (
            <WarningAlert 
              type="generated" 
              field="generated"
              currentValue={genNum} 
              previousValue={previousEntry.generated} 
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal-300 mb-1.5" htmlFor="consumed">
            Units Consumed
          </label>
          <input
            id="consumed"
            type="number"
            step="0.1"
            min="0"
            value={consumed}
            onChange={(e) => setConsumed(e.target.value)}
            placeholder="e.g. 12.0"
            required
            className="w-full"
          />
          {hasValidCon && previousEntry && previousEntry.consumed !== undefined && (
            <WarningAlert 
              type="consumed" 
              field="consumed"
              currentValue={conNum} 
              previousValue={previousEntry.consumed} 
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
