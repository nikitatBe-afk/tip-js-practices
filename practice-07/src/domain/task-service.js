// Чистые функции: без React, DOM, сети, случайных значений и изменения аргументов.
// Точные контракты и допустимые входы приведены в методичке.

export function validateTaskDraft(draft, categories) {
  const errors = {};

  const title =
    typeof draft.title === 'string'
      ? draft.title.trim()
      : '';

  if (title.length < 1 || title.length > 100) {
    errors.title = 'Название должно содержать от 1 до 100 символов';
  }

  const allowedPriorities = ['low', 'medium', 'high'];

  if (!allowedPriorities.includes(draft.priority)) {
    errors.priority = 'Выберите допустимый приоритет';
  }

  const categoryId = Number(draft.categoryId);

  const categoryExists =
    Number.isInteger(categoryId) &&
    categories.some(category => category.id === categoryId);

  if (!categoryExists) {
    errors.categoryId = 'Выберите существующую категорию';
  }

  const valid = Object.keys(errors).length === 0;

  return {
    valid,
    value: {
      title,
      priority: draft.priority,
      categoryId
    },
    errors
  };
}

export function selectTasks(tasks, filters) {
  return tasks.filter(task => {
    const matchesQuery =
      filters.q === '' ||
      task.title
        .toLowerCase()
        .includes(filters.q.trim().toLowerCase());

    const matchesCompleted =
      filters.completed === '' ||
      task.completed === (filters.completed === 'true');

    const matchesPriority =
      filters.priority === '' ||
      task.priority === filters.priority;

    const matchesCategory =
      filters.categoryId === '' ||
      task.categoryId === Number(filters.categoryId);

    return (
      matchesQuery &&
      matchesCompleted &&
      matchesPriority &&
      matchesCategory
    );
  });
}

export function getTaskStats(tasks) {
  const total = tasks.length;

  const completed = tasks.filter(
    task => task.completed
  ).length;

  const active = total - completed;

  return {
    total,
    completed,
    active
  };
}

export function addTask(tasks, value, id) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Некорректный id');
  }

  if (tasks.some(task => task.id === id)) {
    throw new Error('Задача с таким id уже существует');
  }

  const newTask = {
    id,
    title: value.title,
    completed: false,
    priority: value.priority,
    categoryId: value.categoryId
  };

  return [...tasks, newTask];
}

export function updateTask(tasks, id, value) {
  return tasks.map(task =>
    task.id === id
      ? {
          ...task,
          title: value.title,
          priority: value.priority,
          categoryId: value.categoryId
        }
      : task
  );
}

export function toggleTask(tasks, id) {
  return tasks.map(task =>
    task.id === id
      ? {
          ...task,
          completed: !task.completed
        }
      : task
  );
}

export function removeTask(tasks, id) {
  return tasks.filter(task => task.id !== id);
}