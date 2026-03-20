"use client";

import { useTodos } from "@/hooks/useTodos";
import TodoInput from "./TodoInput";
import TodoItem from "./TodoItem";
import TodoFilter from "./TodoFilter";

export default function TodoApp() {
  const {
    todos,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    changePriority,
    clearCompleted,
    toggleAll,
    activeCount,
    completedCount,
    totalCount,
    initialized,
  } = useTodos();

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <TodoInput onAdd={addTodo} />

      <TodoFilter
        filter={filter}
        onFilterChange={setFilter}
        activeCount={activeCount}
        completedCount={completedCount}
        onClearCompleted={clearCompleted}
        onToggleAll={toggleAll}
        totalCount={totalCount}
      />

      <div className="flex flex-col gap-2">
        {todos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">
              {filter === "completed" ? "🎉" : filter === "active" ? "✅" : "📝"}
            </div>
            <p className="text-sm">
              {filter === "completed"
                ? "完了済みのタスクはありません"
                : filter === "active"
                ? "未完了のタスクはありません"
                : "タスクを追加してください"}
            </p>
          </div>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
              onChangePriority={changePriority}
            />
          ))
        )}
      </div>

      {totalCount > 0 && (
        <p className="text-center text-xs text-gray-400">
          {activeCount} 件のタスクが残っています
          {completedCount > 0 && ` / ${completedCount} 件完了`}
        </p>
      )}
    </div>
  );
}
