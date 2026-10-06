// Заготовка модуля. throw ниже отмечает отсутствие реализации,
// а не способ обработки некорректных данных в готовом решении.
// Для предусмотренных ошибок необходимо возвращать { ok: false, error: "..." }.
// console.log(), prompt(), document и чтение внешнего состояния здесь не нужны.

export function createTask(id, title, priority = "medium") {
  // Проверка типов
  if (typeof id !== "number") {
    return { ok: false, error: "id должен быть числом" };
  }

  if (typeof title !== "string") {
    return { ok: false, error: "title должен быть строкой" };
  }

  if (typeof priority !== "string") {
    return { ok: false, error: "priority должен быть строкой" };
  }

  // Проверка ограничений
  if (!Number.isSafeInteger(id) || id <= 0) {
    return {
      ok: false,
      error: "id должен быть положительным безопасным целым числом"
    };
  }

  const cleanTitle = title.trim();

  if (cleanTitle.length < 1 || cleanTitle.length > 100) {
    return {
      ok: false,
      error: "title после trim() должен иметь длину от 1 до 100 символов"
    };
  }

  if (!["low", "medium", "high"].includes(priority)) {
    return {
      ok: false,
      error: 'priority должен быть "low", "medium" или "high"'
    };
  }

  return {
    ok: true,
    task: {
      id,
      title: cleanTitle,
      completed: false,
      priority
    }
  };
}

export function findTaskById(tasks, id) {
  return tasks.find(task => task.id === id);
}

export function getPendingTasks(tasks) {
  return tasks.filter(task => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map(task => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed === true).length;
  const pending = total - completed;
  const progress = total > 0 ? (completed / total) * 100 : 0;
  return { total, completed, pending, progress };
}

export function addTask(tasks, id, title, priority = "medium") {
  const result = createTask(id, title, priority);

  if (!result.ok) {
    return result;
  }

  if (tasks.some(task => task.id === id)) {
    return {
      ok: false,
      error: "Задача с таким id уже существует"
    };
  }

  return {
    ok: true,
    tasks: [...tasks, result.task]
  };
}

export function setTaskCompleted(tasks, id, completed) {
  if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
    return {
      ok: false,
      error: "id должен быть положительным безопасным целым числом"
    };
  }

  if (completed !== true && completed !== false) {
    return {
      ok: false,
      error: "completed должен быть логическим значением"
    };
  }

  let found = false;

  const newTasks = tasks.map(task => {
    if (task.id !== id) {
      return task;
    }

    found = true;

    return {
      ...task,
      completed
    };
  });

  if (!found) {
    return {
      ok: false,
      error: "Задача с таким id не найдена"
    };
  }

  return {
    ok: true,
    tasks: newTasks
  };
}

export function renameTask(tasks, id, title) {
  if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
    return {
      ok: false,
      error: "id должен быть положительным безопасным целым числом"
    };
  }

  if (typeof title !== "string") {
    return {
      ok: false,
      error: "title должен быть строкой"
    };
  }

  const cleanTitle = title.trim();

  if (cleanTitle.length < 1 || cleanTitle.length > 100) {
    return {
      ok: false,
      error: "title после trim() должен иметь длину от 1 до 100 символов"
    };
  }

  let found = false;

  const newTasks = tasks.map(task => {
    if (task.id !== id) {
      return task;
    }

    found = true;

    return {
      ...task,
      title: cleanTitle
    };
  });

  if (!found) {
    return {
      ok: false,
      error: "Задача с таким id не найдена"
    };
  }

  return {
    ok: true,
    tasks: newTasks
  };
}

export function removeTask(tasks, id) {
  if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
    return {
      ok: false,
      error: "id должен быть положительным безопасным целым числом"
    };
  }

  const found = tasks.some(task => task.id === id);

  if (!found) {
    return {
      ok: false,
      error: "Задача с таким id не найдена"
    };
  }

  return {
    ok: true,
    tasks: tasks.filter(task => task.id !== id)
  };
}
