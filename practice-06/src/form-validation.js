const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// Возвращает { valid, value, errors }.
// value содержит нормализованные title, priority и числовой categoryId.
export function validateTaskDraft(draft, categories) {
  const errors = {};

  const title = typeof draft.title === "string"
    ? draft.title.trim()
    : "";

  if (title.length < 1 || title.length > 100) {
    errors.title = "Название должно содержать от 1 до 100 символов.";
  }

  const priority = draft.priority;

  if (!ALLOWED_PRIORITIES.has(priority)) {
    errors.priority = "Выберите корректный приоритет.";
  }

  const categoryId = Number(draft.categoryId);

  if (!Number.isSafeInteger(categoryId) || !categories.some((category) => category.id === categoryId)) {
    errors.categoryId = "Выберите существующую категорию.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      valid: false,
      value: null,
      errors,
    };
  }

  return {
    valid: true,
    value: {
      title,
      priority,
      categoryId,
    },
    errors: {},
  };
}