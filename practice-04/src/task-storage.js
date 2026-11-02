export const STORAGE_VERSION = 1;

// Все функции принимают объект storage явно, чтобы их можно было проверить
// без обращения к глобальному window.localStorage.

export function isValidTaskList(value) {
    if (!Array.isArray(value)) {
    return false;
  }

  const ids = new Set();

  for (const task of value) {
    if (typeof task !== "object" || task === null) {
      return false;
    }

    if (
      typeof task.id !== "number" ||
      !Number.isSafeInteger(task.id) ||
      task.id <= 0
    ) {
      return false;
    }

    if (ids.has(task.id)) {
      return false;
    }

    ids.add(task.id);

    if (typeof task.title !== "string") {
      return false;
    }

    const cleanTitle = task.title.trim();

    if (
      cleanTitle.length < 1 ||
      cleanTitle.length > 100 ||
      cleanTitle !== task.title
    ) {
      return false;
    }

    if (typeof task.completed !== "boolean") {
      return false;
    }

    if (!["low", "medium", "high"].includes(task.priority)) {
      return false;
    }
  }

  return true;
}
  // TODO: проверить массив задач, поля каждой задачи и уникальность id.


export function loadTasks(storage, key, fallbackTasks) {
    const fallbackCopy = fallbackTasks.map(task => ({ ...task }));

  try {
    const raw = storage.getItem(key);

    if (raw === null) {
      return {
        ok: true,
        source: "initial",
        tasks: fallbackCopy
      };
    }

    const parsed = JSON.parse(raw);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      parsed.version !== STORAGE_VERSION ||
      !isValidTaskList(parsed.tasks)
    ) {
      return {
        ok: false,
        source: "fallback",
        tasks: fallbackCopy,
        error: "Некорректные сохранённые данные"
      };
    }

    const tasksCopy = parsed.tasks.map(task => ({ ...task }));

    return {
      ok: true,
      source: "storage",
      tasks: tasksCopy
    };
  } catch (error) {
    return {
      ok: false,
      source: "fallback",
      tasks: fallbackCopy,
      error: `Ошибка чтения хранилища: ${error.message}`
    };
  }
}
  // TODO: прочитать строку, разобрать объект { version, tasks }, проверить данные.
  // Нет записи: { ok: true, source: "initial", tasks: копия fallbackTasks }.
  // Есть корректная запись: { ok: true, source: "storage", tasks: новая копия }.
  // Ошибка чтения, JSON или схемы: { ok: false, source: "fallback",
  // tasks: копия fallbackTasks, error: "понятное сообщение" }.


export function saveTasks(storage, key, tasks) {
    if (!isValidTaskList(tasks)) {
    return {
      ok: false,
      error: "Некорректный список задач"
    };
  }

  try {
    const payload = {
      version: STORAGE_VERSION,
      tasks
    };

    storage.setItem(key, JSON.stringify(payload));

    return {
      ok: true
    };
  } catch (error) {
    return {
      ok: false,
      error: `Ошибка сохранения: ${error.message}`
    };
  }
}
  // TODO: проверить задачи и сохранить JSON.stringify({ version, tasks }).
  // Вернуть { ok: true } либо { ok: false, error: "..." }; исключение не выпускать.


export function removeSavedTasks(storage, key) {
    try {
    storage.removeItem(key);

    return {
      ok: true
    };
  } catch (error) {
    return {
      ok: false,
      error: `Ошибка удаления сохранённых данных: ${error.message}`
    };
  }
}
  // TODO: удалить только переданный ключ; вернуть результат и перехватить исключение.
