"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Priority } from "@/types/todo";

interface TodoInputProps {
  onAdd: (text: string, priority: Priority) => void;
}

const PRIORITY_LABELS: Record<Priority, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "bg-blue-100 text-blue-700 border-blue-300",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
  high: "bg-red-100 text-red-700 border-red-300",
};

export default function TodoInput({ onAdd }: TodoInputProps) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    if (!text.trim()) return;
    onAdd(text, priority);
    setText("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {(["low", "medium", "high"] as Priority[]).map((p) => (
          <button
            key={p}
            onClick={() => setPriority(p)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-lg border transition-all ${
              priority === p
                ? PRIORITY_COLORS[p] + " ring-2 ring-offset-1 ring-current"
                : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
            }`}
          >
            優先度: {PRIORITY_LABELS[p]}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="新しいタスクを入力..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all"
          maxLength={200}
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="px-5 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95"
        >
          追加
        </button>
      </div>
    </div>
  );
}
