// Все фильтры объединяются через И. Исходный массив не изменяется.
export function selectTasks(tasks, filters) {
  const {
    completed,
    priority,
    categoryId,
    q
  } = filters;

  const normalizedQuery = q.toLocaleLowerCase('ru-RU');

  return tasks.filter(task => {
    const matchesCompleted =
      completed === null ||
      task.completed === completed;

    const matchesPriority =
      priority === null ||
      task.priority === priority;

    const matchesCategory =
      categoryId === null ||
      task.categoryId === categoryId;

    const matchesQuery =
      normalizedQuery === '' ||
      task.title
        .toLocaleLowerCase('ru-RU')
        .includes(normalizedQuery);

    return (
      matchesCompleted &&
      matchesPriority &&
      matchesCategory &&
      matchesQuery
    );
  });
}

// Поиск по полю id, не по индексу. Возвращает задачу или null.
export function findTask(tasks, id) {
  return tasks.find(task => task.id === id) ?? null;
}