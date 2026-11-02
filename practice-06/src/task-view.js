const PRIORITY_LABELS = Object.freeze({
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
});

export function createTaskElement(task, category) {
  const item = document.createElement("li");
  item.className = "task-card";
  item.dataset.taskId = String(task.id);

  if (task.completed) {
    item.classList.add("is-completed");
  }

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  const status = document.createElement("div");
  status.className = "task-status";
  status.textContent = task.completed ? "Выполнено" : "В работе";

  const priority = document.createElement("div");
  priority.className = "task-priority";
  priority.textContent = `Приоритет: ${PRIORITY_LABELS[task.priority]}`;

  const categoryElement = document.createElement("div");
  categoryElement.className = "task-category";
  categoryElement.textContent = category.name;

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.dataset.action = "toggle";

  const toggleLabel = document.createElement("span");
  toggleLabel.className = "action-label";
  toggleLabel.textContent = task.completed ? "Вернуть в работу" : "Завершить";
  toggleButton.append(toggleLabel);

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.dataset.action = "edit";

  const editLabel = document.createElement("span");
  editLabel.className = "action-label";
  editLabel.textContent = "Изменить";
  editButton.append(editLabel);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";

  const deleteLabel = document.createElement("span");
  deleteLabel.className = "action-label";
  deleteLabel.textContent = "Удалить";
  deleteButton.append(deleteLabel);

  actions.append(toggleButton, editButton, deleteButton);

  item.append(
    title,
    status,
    priority,
    categoryElement,
    actions,
  );

  return item;
}

export function renderTaskList(list, tasks, categories) {
  const categoryMap = new Map(
    categories.map((category) => [category.id, category]),
  );

  const elements = tasks.map((task) => {
    const category = categoryMap.get(task.categoryId);
    return createTaskElement(task, category);
  });

  list.replaceChildren(...elements);
}