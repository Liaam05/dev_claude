"use client";

import { FilterType } from "@/types/todo";

interface TodoFilterProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  activeCount: number;
  completedCount: number;
  onClearCompleted: () => void;
  onToggleAll: () => void;
  totalCount: number;
}

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "active", label: "未完了" },
  { value: "completed", label: "完了済み" },
];

export default function TodoFilter({
  filter,
  onFilterChange,
  activeCount,
  completedCount,
  onClearCompleted,
  onToggleAll,
  totalCount,
}: TodoFilterProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Filter tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              filter === value
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
            {value === "active" && activeCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-600 rounded-full">
                {activeCount}
              </span>
            )}
            {value === "completed" && completedCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">
                {completedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      {totalCount > 0 && (
        <div className="flex justify-between items-center px-1">
          <button
            onClick={onToggleAll}
            className="text-xs text-gray-500 hover:text-indigo-600 transition-colors"
          >
            {activeCount === 0 ? "すべて未完了にする" : "すべて完了にする"}
          </button>
          {completedCount > 0 && (
            <button
              onClick={onClearCompleted}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              完了済みを削除 ({completedCount})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
