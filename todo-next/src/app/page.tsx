import TodoApp from "@/components/TodoApp";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 tracking-tight">
            Todo
          </h1>
          <p className="text-gray-400 text-sm">タスクを管理して、生産性を高めましょう</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
          <TodoApp />
        </div>
      </div>
    </main>
  );
}
