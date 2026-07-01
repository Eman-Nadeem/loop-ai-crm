import React from "react";

interface ProgressBarProps {
  value: number; // 0 to 100
  colorClass?: string; // Tailwind color or gradient bg class
  heightClass?: string; // Tailwind height class
}

export default function ProgressBar({
  value,
  colorClass = "bg-linear-to-r from-indigo-500 to-purple-500",
  heightClass = "h-2"
}: ProgressBarProps) {
  // Clamp value between 0 and 100
  const percentage = Math.max(0, Math.min(100, value));

  return (
    <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass}`}>
      <div
        style={{ width: `${percentage}%` }}
        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
      />
    </div>
  );
}
