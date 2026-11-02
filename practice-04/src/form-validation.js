const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// Чистая проверка данных формы. DOM и показ сообщений выполняются в main.js.
// draft: { id, title, priority }; editingId: null либо id редактируемой задачи.
export function validateTaskDraft(draft, tasks, editingId = null) {
    const errors = {};

  let id;

  if (editingId === null) {
    if (draft.id === "") {
      errors.id = "id не должен быть пустым";
    } else {
      id = Number(draft.id);

      if (!Number.isSafeInteger(id) || id <= 0) {
        errors.id = "id должен быть положительным безопасным целым числом";
      } else if (tasks.some(task => task.id === id)) {
        errors.id = "Задача с таким id уже существует";
      }
    }
  } else {
    id = editingId;

    if (!Number.isSafeInteger(id) || id <= 0) {
      errors.id = "Некорректный id редактируемой задачи";
    } else if (!tasks.some(task => task.id === id)) {
      errors.id = "Редактируемая задача не найдена";
    }
  }

  let cleanTitle = "";

  if (typeof draft.title !== "string") {
    errors.title = "title должен быть строкой";
  } else {
    cleanTitle = draft.title.trim();

    if (cleanTitle.length < 1 || cleanTitle.length > 100) {
      errors.title = "Название должно содержать от 1 до 100 символов";
    }
  }

  if (!ALLOWED_PRIORITIES.has(draft.priority)) {
    errors.priority = 'Приоритет должен быть "low", "medium" или "high"';
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      errors
    };
  }

  return {
    ok: true,
    value: {
      id,
      title: cleanTitle,
      priority: draft.priority
    }
  };
}
  // TODO: нормализовать и проверить id, title и priority.
  // В режиме создания id должен быть уникальным.
  // В режиме редактирования используется editingId и проверяется наличие задачи.
  // Успех: { ok: true, value: { id, title, priority } }.
  // Отказ: { ok: false, errors: { id?: "...", title?: "...", priority?: "..." } }.
  // ALLOWED_PRIORITIES можно использовать при проверке приоритета.
