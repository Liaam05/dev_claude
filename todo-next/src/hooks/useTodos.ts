"use client";

import { useState, useEffect, useCallback } from "react";
import { Todo, FilterType, Priority } from "@/types/todo";

const STORAGE_KEY = "todo-next-items";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTodos(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // ignore storage errors
    }
  }, [todos, initialized]);

  const addTodo = useCallback((text: string, priority: Priority = "medium") => {
    const now = Date.now();
    setTodos((prev) => [
      {
        id: generateId(),
        text: text.trim(),
        completed: false,
        priority,
        createdAt: now,
        updatedAt: now,
      },
      ...prev,
    ]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed, updatedAt: Date.now() }
          : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const editTodo = useCallback((id: string, text: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, text: text.trim(), updatedAt: Date.now() }
          : todo
      )
    );
  }, []);

  const changePriority = useCallback((id: string, priority: Priority) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, priority, updatedAt: Date.now() } : todo
      )
    );
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  }, []);

  const toggleAll = useCallback(() => {
    const allCompleted = todos.every((t) => t.completed);
    setTodos((prev) =>
      prev.map((todo) => ({
        ...todo,
        completed: !allCompleted,
        updatedAt: Date.now(),
      }))
    );
  }, [todos]);

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  return {
    todos: filteredTodos,
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
    totalCount: todos.length,
    initialized,
  };
}
