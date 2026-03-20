"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Todo, Priority } from "@/types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onChangePriority: (id: string, priority: Priority) => void;
}

const PRIORITY_DOT: Record<Priority, string> = {
  low: "bg-blue-400",
  medium: "bg-yellow-400",
  high: "bg-red-400",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
  onChangePriority,
}: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      editRef.current?.focus();
      editRef.current?.select();
    }
  }, [editing]);

  function handleEditSubmit() {
    if (editText.trim()) {
      onEdit(todo.id, editText);
    } else {
      setEditText(todo.text);
    }
    setEditing(false);
  }

  function handleEditKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleEditSubmit();
    if (e.key === "Escape") {
      setEditText(todo.text);
      setEditing(false);
    }
  }

  return (
    <div
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
        todo.completed
          ? "bg-gray-50 border-gray-100 opacity-60"
          : "bg-white border-gray-200 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          todo.completed
            ? "bg-indigo-500 border-indigo-500"
            : "border-gray-300 hover:border-indigo-400"
        }`}
        aria-label={todo.completed ? "未完了にする" : "完了にする"}
      >
        {todo.completed && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Priority indicator */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setShowPriorityMenu(!showPriorityMenu)}
          className={`w-3 h-3 rounded-full ${PRIORITY_DOT[todo.priority]} hover:scale-125 transition-transform`}
          title={`優先度: ${PRIORITY_LABELS[todo.priority]}`}
        />
        {showPriorityMenu && (
          <div className="absolute left-0 top-5 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[80px]">
            {(["high", "medium", "low"] as Priority[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  onChangePriority(todo.id, p);
                  setShowPriorityMenu(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-gray-50 ${
                  todo.priority === p ? "font-semibold" : ""
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${PRIORITY_DOT[p]}`} />
                {PRIORITY_LABELS[p]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Text / Edit */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={editRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={handleEditSubmit}
            className="w-full px-2 py-0.5 rounded border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-800"
            maxLength={200}
          />
        ) : (
          <span
            onDoubleClick={() => !todo.completed && setEditing(true)}
            className={`block truncate text-sm ${
              todo.completed ? "line-through text-gray-400" : "text-gray-800"
            }`}
            title={todo.text}
          >
            {todo.text}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {!todo.completed && (
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 text-gray-400 hover:text-indigo-500 rounded-lg hover:bg-indigo-50 transition-all"
            aria-label="編集"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
        <button
          onClick={() => onDelete(todo.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
          aria-label="削除"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
