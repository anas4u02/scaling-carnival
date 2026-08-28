"use client";

interface DayData {
  date: string;
  count: number;
  label: string;
  isFuture?: boolean;
}

interface WeeklyChartProps {
  days: DayData[];
}

export function WeeklyChart({ days }: WeeklyChartProps) {
  const maxCount = Math.max(...days.map((d) => d.count), 5);

  return (
    <div className="flex items-end justify-between h-36 pt-2 px-1">
      {days.map((d, index) => {
        const heightPercent = Math.min(Math.round((d.count / maxCount) * 100), 100);

        return (
          <div
            key={d.date || index}
            className={`flex flex-col items-center flex-1 ${
              d.isFuture ? "opacity-35" : ""
            }`}
          >
            <span className="text-[10px] text-gray-400 mb-1">{d.count > 0 ? d.count : ""}</span>
            <div className="w-full max-w-[28px] bg-gray-800 rounded-t-md h-24 flex items-end overflow-hidden">
              <div
                className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 transition-all duration-500 rounded-t-md"
                style={{ height: `${heightPercent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-400 mt-2">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
