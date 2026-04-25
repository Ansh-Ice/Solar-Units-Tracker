"use client";

export default function WarningAlert({ type, field, currentValue, previousValue }) {
  const diff = Math.abs(currentValue - previousValue);

  if (diff <= 50) return null;

  const isStrong = diff > 100;

  return (
    <div
      className={`rounded-xl p-3.5 mt-2 animate-fade-in ${
        isStrong ? "warning-strong" : "warning-mild"
      }`}
      role="alert"
      id={`warning-${field}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">{isStrong ? "🚨" : "⚠️"}</span>
        <div className="flex-1">
          <p className="font-semibold text-sm">
            {isStrong ? "Large Discrepancy Detected!" : "Unusual Reading"}
          </p>
          <p className="text-xs mt-1 opacity-80">
            {field === "generated" ? "Units Generated" : "Units Consumed"} changed by{" "}
            <strong>{diff.toFixed(1)}</strong> units from previous entry
            (was {previousValue.toFixed(1)}, now {currentValue.toFixed(1)}).
            {isStrong
              ? " Please verify this reading is correct."
              : " This is a notable change."}
          </p>
        </div>
      </div>
    </div>
  );
}
