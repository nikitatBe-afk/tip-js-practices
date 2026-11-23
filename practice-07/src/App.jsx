import { useState } from 'react';

import { tasks as initialTasks, categories } from './data.js';
import { createInitialFilters } from './variant.js';

import {
  selectTasks,
  getTaskStats,
  addTask,
  updateTask,
  toggleTask,
  removeTask
} from './domain/task-service.js';

import TaskForm from './components/TaskForm.jsx';
import TaskFilters from './components/TaskFilters.jsx';
import TaskList from './components/TaskList.jsx';
import TaskStats from './components/TaskStats.jsx';

export default function App() {
  const [tasks, setTasks] = useState(() =>
    initialTasks.map(task => ({ ...task }))
  );

  const [filters, setFilters] = useState(createInitialFilters);
  const [editingId, setEditingId] = useState(null);

  const visibleTasks = selectTasks(tasks, filters);
  const stats = getTaskStats(tasks);

  const editingTask =
    editingId === null
      ? null
      : tasks.find(task => task.id === editingId) ?? null;

  function handleSave(value) {
    if (editingId !== null) {
      if (!editingTask) {
        return false;
      }

      setTasks(previous =>
        updateTask(previous, editingId, value)
      );

      setEditingId(null);

      return true;
    }

    setTasks(previous => {
      const nextId =
        previous.length === 0
          ? 1
          : Math.max(...previous.map(task => task.id)) + 1;

      return addTask(previous, value, nextId);
    });

    return true;
  }

  function handleToggle(id) {
    setTasks(previous =>
      toggleTask(previous, id)
    );
  }

  function handleEdit(id) {
    setEditingId(id);
  }

  function handleDelete(id) {
    const confirmed = window.confirm(
      'Удалить задачу?'
    );

    if (!confirmed) {
      return;
    }

    setTasks(previous =>
      removeTask(previous, id)
    );

    if (editingId === id) {
      setEditingId(null);
    }
  }

  function handleCancel() {
    setEditingId(null);
  }

  return (
    <main>
      <h1>Задачи на React</h1>

      <p>
        ПР7: данные в памяти. Обновление страницы
        восстанавливает исходный набор.
      </p>

      <p role="status">
        В наборе {tasks.length} задач, категорий: {categories.length}.
      </p>

      <TaskStats stats={stats} />

      <TaskFilters
        filters={filters}
        categories={categories}
        onChange={setFilters}
      />

      <TaskForm
        key={editingId ?? 'new'}
        categories={categories}
        initialTask={editingTask}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <TaskList
        tasks={visibleTasks}
        categories={categories}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </main>
  );
}