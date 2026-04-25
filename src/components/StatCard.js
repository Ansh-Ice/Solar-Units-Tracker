"use client";

export default function StatCard({ title, value, unit, icon, accentClass, subtitle }) {
  return (
    <div className={`card ${accentClass} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-charcoal-400 text-xs font-medium uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-charcoal-100">
              {value}
            </span>
            {unit && (
              <span className="text-sm text-charcoal-400 font-medium">
                {unit}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-charcoal-500 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="text-2xl opacity-60">{icon}</div>
        )}
      </div>
    </div>
  );
}
