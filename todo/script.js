// ===== 1. Constants & Helpers =====

const STORAGE_KEY_TODOS = 'todos-v1';
const STORAGE_KEY_PREFS = 'todos-prefs-v1';
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const PRIORITY_LABELS = { high: '高', medium: '中', low: '低' };

function generateId() {
  return (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff === 0) return '今日';
  if (diff === 1) return '明日';
  if (diff === -1) return '昨日';
  return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
}

function storageGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function storageSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ===== 2. Pure State Functions =====

function createTodo(text, priority, dueDate) {
  const todos = state.todos;
  const maxOrder = todos.length > 0 ? Math.max(...todos.map(t => t.order)) : -1;
  return {
    id: generateId(),
    text,
    completed: false,
    priority: priority || 'medium',
    dueDate: dueDate || null,
    createdAt: Date.now(),
    order: maxOrder + 1,
  };
}

function getFilteredSorted(todos, filter, sort) {
  let result = todos.filter(t => {
    if (filter === 'active')    return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  if (sort === 'priority') {
    result = [...result].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  } else if (sort === 'dueDate') {
    result = [...result].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  } else if (sort === 'createdAt') {
    result = [...result].sort((a, b) => b.createdAt - a.createdAt);
  } else {
    result = [...result].sort((a, b) => a.order - b.order);
  }

  return result;
}

function reorderTodos(todos, fromId, toId) {
  const fromIdx = todos.findIndex(t => t.id === fromId);
  const toIdx   = todos.findIndex(t => t.id === toId);
  if (fromIdx === -1 || toIdx === -1) return todos;

  const updated = [...todos];
  const [moved] = updated.splice(fromIdx, 1);
  updated.splice(toIdx, 0, moved);
  // Reassign dense order values
  return updated.map((t, i) => ({ ...t, order: i }));
}

// ===== 3. State =====

const state = {
  todos:     [],
  filter:    'all',
  sort:      'none',
  theme:     'light',
  editingId: null,
};

function hydrate() {
  state.todos = storageGet(STORAGE_KEY_TODOS, []);
  const prefs = storageGet(STORAGE_KEY_PREFS, null);
  if (prefs) {
    state.filter = prefs.filter || 'all';
    state.sort   = prefs.sort   || 'none';
    state.theme  = prefs.theme  || 'light';
  } else {
    state.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}

function persist() {
  storageSet(STORAGE_KEY_TODOS, state.todos);
  storageSet(STORAGE_KEY_PREFS, { filter: state.filter, sort: state.sort, theme: state.theme });
}

// ===== 4. Dispatch =====

function dispatch(action, payload) {
  switch (action) {
    case 'ADD': {
      const todo = createTodo(payload.text, payload.priority, payload.dueDate);
      state.todos = [...state.todos, todo];
      state._newId = todo.id;
      break;
    }
    case 'TOGGLE': {
      state.todos = state.todos.map(t =>
        t.id === payload ? { ...t, completed: !t.completed } : t
      );
      break;
    }
    case 'DELETE': {
      state.todos = state.todos.filter(t => t.id !== payload);
      if (state.editingId === payload) state.editingId = null;
      break;
    }
    case 'EDIT': {
      state.todos = state.todos.map(t =>
        t.id === payload.id ? { ...t, text: payload.text } : t
      );
      state.editingId = null;
      break;
    }
    case 'REORDER': {
      state.todos = reorderTodos(state.todos, payload.fromId, payload.toId);
      break;
    }
    case 'FILTER': {
      state.filter = payload;
      break;
    }
    case 'SORT': {
      state.sort = payload;
      break;
    }
    case 'CLEAR_COMPLETED': {
      state.todos = state.todos.filter(t => !t.completed);
      break;
    }
    case 'THEME': {
      state.theme = payload;
      break;
    }
  }

  persist();
  render();
}

// ===== 5. DOM References =====

const todoInput     = document.getElementById('todo-input');
const addBtn        = document.getElementById('add-btn');
const prioritySel   = document.getElementById('priority-select');
const dueDateInput  = document.getElementById('due-date-input');
const filterBtns    = document.querySelectorAll('.filter-btn');
const sortSel       = document.getElementById('sort-select');
const todoList      = document.getElementById('todo-list');
const remainingEl   = document.getElementById('remaining-count');
const clearBtn      = document.getElementById('clear-completed');
const themeToggle   = document.getElementById('theme-toggle');
const dateDisplay   = document.getElementById('date-display');

// ===== 6. Render =====

function render() {
  renderTheme();
  renderList();
  renderFilters();
  renderFooter();
}

function renderTheme() {
  document.documentElement.dataset.theme = state.theme;
  themeToggle.textContent = state.theme === 'dark' ? '☀' : '◑';
  themeToggle.setAttribute('aria-label', state.theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え');
}

function renderFilters() {
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === state.filter);
    btn.setAttribute('aria-pressed', btn.dataset.filter === state.filter);
  });
  sortSel.value = state.sort;
}

function renderFooter() {
  const active    = state.todos.filter(t => !t.completed).length;
  const completed = state.todos.filter(t =>  t.completed).length;
  remainingEl.innerHTML = `<strong>${active}</strong> 件 残り`;
  clearBtn.disabled = completed === 0;
}

function buildTodoElement(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (todo.completed ? ' completed' : '');
  li.dataset.id = todo.id;
  li.dataset.priority = todo.priority;
  li.draggable = true;
  li.setAttribute('role', 'listitem');

  const today = todayStr();
  const overdue = todo.dueDate && !todo.completed && todo.dueDate < today;

  const dueDateHtml = todo.dueDate
    ? `<span class="due-date-label${overdue ? ' overdue' : ''}">${overdue ? '⚠ ' : ''}${formatDate(todo.dueDate)}</span>`
    : '';

  li.innerHTML = `
    <span class="drag-handle" aria-hidden="true">⠿</span>
    <span class="todo-checkbox" role="checkbox" aria-checked="${todo.completed}" tabindex="0" aria-label="${todo.completed ? '未完了にする' : '完了にする'}"></span>
    <div class="todo-body">
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <input class="todo-edit-input" type="text" value="${escapeHtml(todo.text)}" aria-label="タスクを編集">
      <div class="todo-meta">
        <span class="priority-badge" data-priority="${todo.priority}">${PRIORITY_LABELS[todo.priority]}</span>
        ${dueDateHtml}
      </div>
    </div>
    <button class="delete-btn" aria-label="タスクを削除" title="削除">×</button>
  `;

  return li;
}

function renderList() {
  // Capture current rendered IDs for animation detection
  const prevIds = new Set(
    Array.from(todoList.querySelectorAll('.todo-item')).map(el => el.dataset.id)
  );

  const items = getFilteredSorted(state.todos, state.filter, state.sort);

  if (items.length === 0) {
    const messages = {
      all:       ['📋', 'タスクがありません', '上のフォームから追加してみましょう'],
      active:    ['✅', '未完了のタスクはありません', 'すべて完了しています！'],
      completed: ['🎉', '完了済みのタスクはありません', 'タスクを完了するとここに表示されます'],
    };
    const [icon, title, sub] = messages[state.filter];
    todoList.innerHTML = `
      <div class="empty-state" role="status">
        <span class="empty-icon">${icon}</span>
        <p><strong>${title}</strong></p>
        <p style="margin-top:4px;font-size:0.8rem">${sub}</p>
      </div>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();
  items.forEach(todo => {
    const li = buildTodoElement(todo);
    if (!prevIds.has(todo.id)) {
      li.classList.add('entering');
    }
    fragment.appendChild(li);
  });

  todoList.replaceChildren(fragment);

  // Remove entering class after animation completes
  requestAnimationFrame(() => {
    todoList.querySelectorAll('.entering').forEach(el => {
      el.addEventListener('animationend', () => el.classList.remove('entering'), { once: true });
    });
  });

  // Restore editing state if applicable
  if (state.editingId) {
    const li = todoList.querySelector(`[data-id="${state.editingId}"]`);
    if (li) {
      li.classList.add('editing');
      const input = li.querySelector('.todo-edit-input');
      input.focus();
    }
  }
}

// ===== 7. Add Todo =====

function addTodo() {
  const text = todoInput.value.trim();
  if (!text) {
    todoInput.focus();
    todoInput.style.borderColor = 'var(--color-danger)';
    setTimeout(() => { todoInput.style.borderColor = ''; }, 600);
    return;
  }

  dispatch('ADD', {
    text,
    priority: prioritySel.value,
    dueDate: dueDateInput.value || null,
  });

  todoInput.value = '';
  prioritySel.value = 'medium';
  dueDateInput.value = '';
  todoInput.focus();
}

// ===== 8. Edit Flow =====

function startEdit(id) {
  if (state.editingId && state.editingId !== id) {
    commitEditById(state.editingId);
    return;
  }
  state.editingId = id;
  const li = todoList.querySelector(`[data-id="${id}"]`);
  if (!li) return;
  li.classList.add('editing');
  const input = li.querySelector('.todo-edit-input');
  input.focus();
  input.select();
}

function commitEditById(id) {
  const li = todoList.querySelector(`[data-id="${id}"]`);
  if (!li) { state.editingId = null; return; }
  const input = li.querySelector('.todo-edit-input');
  commitEdit(input);
}

function commitEdit(inputEl) {
  const li = inputEl.closest('.todo-item');
  if (!li) return;
  const newText = inputEl.value.trim();
  if (newText) {
    dispatch('EDIT', { id: li.dataset.id, text: newText });
  } else {
    // Revert: just cancel
    state.editingId = null;
    li.classList.remove('editing');
  }
}

function cancelEdit(inputEl) {
  const li = inputEl.closest('.todo-item');
  if (!li) return;
  state.editingId = null;
  li.classList.remove('editing');
}

// ===== 9. Delete with Animation =====

function deleteTodoAnimated(id) {
  const li = todoList.querySelector(`[data-id="${id}"]`);
  if (!li) { dispatch('DELETE', id); return; }
  li.classList.add('removing');
  li.addEventListener('animationend', () => dispatch('DELETE', id), { once: true });
  // Fallback in case animation doesn't fire
  setTimeout(() => dispatch('DELETE', id), 400);
}

// ===== 10. Event Handlers =====

// Add button
addBtn.addEventListener('click', addTodo);

// Global keyboard
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement === todoInput) {
    addTodo();
  }
});

// Filter buttons
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => dispatch('FILTER', btn.dataset.filter));
});

// Sort
sortSel.addEventListener('change', () => dispatch('SORT', sortSel.value));

// Clear completed
clearBtn.addEventListener('click', () => dispatch('CLEAR_COMPLETED'));

// Theme toggle
themeToggle.addEventListener('click', () => {
  dispatch('THEME', state.theme === 'dark' ? 'light' : 'dark');
});

// Todo list — event delegation
todoList.addEventListener('click', e => {
  const li = e.target.closest('.todo-item');
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.closest('.todo-checkbox')) {
    dispatch('TOGGLE', id);
    return;
  }

  if (e.target.closest('.delete-btn')) {
    deleteTodoAnimated(id);
    return;
  }
});

todoList.addEventListener('dblclick', e => {
  const li = e.target.closest('.todo-item');
  if (!li) return;
  if (e.target.closest('.todo-text') || e.target.closest('.todo-body')) {
    startEdit(li.dataset.id);
  }
});

todoList.addEventListener('keydown', e => {
  if (e.target.classList.contains('todo-edit-input')) {
    if (e.key === 'Enter')  { e.preventDefault(); commitEdit(e.target); }
    if (e.key === 'Escape') { cancelEdit(e.target); }
  }
  // Checkbox keyboard activation
  if (e.target.classList.contains('todo-checkbox') && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    const li = e.target.closest('.todo-item');
    if (li) dispatch('TOGGLE', li.dataset.id);
  }
});

// Commit edit on blur (capture phase)
todoList.addEventListener('focusout', e => {
  if (e.target.classList.contains('todo-edit-input')) {
    // Defer to allow click events to process first
    setTimeout(() => commitEdit(e.target), 100);
  }
});

// ===== 11. Drag and Drop =====

let dragSrcId = null;

todoList.addEventListener('dragstart', e => {
  const li = e.target.closest('.todo-item');
  if (!li) return;
  dragSrcId = li.dataset.id;
  li.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', dragSrcId);
});

todoList.addEventListener('dragend', e => {
  todoList.querySelectorAll('.dragging, .drag-over').forEach(el =>
    el.classList.remove('dragging', 'drag-over')
  );
  dragSrcId = null;
});

todoList.addEventListener('dragover', e => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const li = e.target.closest('.todo-item');
  if (!li || li.dataset.id === dragSrcId) return;
  todoList.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  li.classList.add('drag-over');
});

todoList.addEventListener('dragleave', e => {
  const li = e.target.closest('.todo-item');
  if (li) li.classList.remove('drag-over');
});

todoList.addEventListener('drop', e => {
  e.preventDefault();
  const li = e.target.closest('.todo-item');
  if (!li || !dragSrcId || li.dataset.id === dragSrcId) return;
  dispatch('REORDER', { fromId: dragSrcId, toId: li.dataset.id });
});

// ===== 12. Date Display =====

function updateDateDisplay() {
  const now = new Date();
  const opts = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  dateDisplay.textContent = now.toLocaleDateString('ja-JP', opts);
}

// ===== 13. Initialize =====

hydrate();
updateDateDisplay();
render();
