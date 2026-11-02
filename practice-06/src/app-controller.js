import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}

// view — адаптер из dom-app.js. Контроллер не должен обращаться к document.
// Обязательные методы результата:
// start, applyFilters, refresh, submit, beginEdit, cancelEdit,
// toggleTask, deleteTask, resetData и destroy.
export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  if (!api || typeof api !== "object") throw new TypeError("api должен быть объектом");
  if (!view || typeof view !== "object") throw new TypeError("view должен быть объектом");
  if (typeof validateDraft !== "function") throw new TypeError("validateDraft должен быть функцией");

  const apiMethods = [
    "loadInitialData",
    "getTasks",
    "createTask",
    "updateTask",
    "setTaskCompleted",
    "deleteTask",
    "resetDemoData",
  ];

  for (const method of apiMethods) {
    if (typeof api[method] !== "function") {
      throw new TypeError(`api.${method} должен быть функцией`);
    }
  }

  const viewMethods = [
    "setCategories",
    "setTasks",
    "setTotal",
    "setListState",
    "setFormTask",
    "showFormErrors",
    "setMutationPending",
    "notify",
  ];

  for (const method of viewMethods) {
    if (typeof view[method] !== "function") {
      throw new TypeError(`view.${method} должен быть функцией`);
    }
  }

  let tasks = [];
  let categories = [];
  let filters = {};
  let editingId = null;

  let activeLoadController = null;
  let loadSequence = 0;
  let initialDataLoaded = false;

  function showTasks(result) {
    tasks = result.tasks;

    view.setTasks(tasks, categories);
    view.setTotal(result.meta.total);

    if (tasks.length === 0) {
      view.setListState("empty");
    } else {
      view.setListState("ready");
    }
  }

  async function loadCurrentTasks() {
    if (activeLoadController) {
      activeLoadController.abort();
    }

    const controller = new AbortController();
    activeLoadController = controller;

    const sequence = ++loadSequence;

    view.setListState("loading");

    try {
      if (!initialDataLoaded) {
        const result = await api.loadInitialData(filters, {
          signal: controller.signal,
        });

        if (sequence !== loadSequence) return;

        categories = result.categories;
        initialDataLoaded = true;

        view.setCategories(categories);
        showTasks(result);
        return;
      }

      const result = await api.getTasks(filters, {
        signal: controller.signal,
      });

      if (sequence !== loadSequence) return;

      showTasks(result);
    } catch (error) {
      if (sequence !== loadSequence) return;
      if (error instanceof ApiError && error.kind === "aborted") return;

      view.setListState("error", messageForError(error));
    } finally {
      if (sequence === loadSequence) {
        activeLoadController = null;
      }
    }
  }

  async function runMutation(action, successMessage) {
    view.setMutationPending(true);

    try {
      await action();

      await loadCurrentTasks();

      view.notify(successMessage, "success");

      return true;
    } catch (error) {
      view.notify(messageForError(error), "error");
      return false;
    } finally {
      view.setMutationPending(false);
    }
  }

  async function start(startFilters = {}) {
    filters = { ...startFilters };
    await loadCurrentTasks();
  }

  async function applyFilters(nextFilters = {}) {
    filters = { ...nextFilters };
    await loadCurrentTasks();
  }

  async function refresh() {
    await loadCurrentTasks();
  }

  async function submit(draft) {
    const result = validateDraft(draft, categories);

    view.showFormErrors(result.errors);

    if (!result.valid) {
      return false;
    }

    if (editingId === null) {
      const success = await runMutation(
        () => api.createTask(result.value),
        "Задача добавлена.",
      );

      if (success) {
        view.setFormTask(null);
        view.showFormErrors({});
      }

      return success;
    }

    const id = editingId;

    const success = await runMutation(
      () => api.updateTask(id, result.value),
      "Изменения сохранены.",
    );

    if (success) {
      editingId = null;
      view.setFormTask(null);
      view.showFormErrors({});
    }

    return success;
  }

  function beginEdit(id) {
    const task = tasks.find((item) => item.id === id);

    if (!task) return;

    editingId = id;

    view.showFormErrors({});
    view.setFormTask(task);
  }

  function cancelEdit() {
    editingId = null;

    view.showFormErrors({});
    view.setFormTask(null);
  }

  async function toggleTask(id) {
    const task = tasks.find((item) => item.id === id);

    if (!task) return false;

    return runMutation(
      () => api.setTaskCompleted(id, !task.completed),
      "Статус задачи изменён.",
    );
  }

  async function deleteTask(id) {
    const success = await runMutation(
      () => api.deleteTask(id),
      "Задача удалена.",
    );

    if (success && editingId === id) {
      editingId = null;
      view.setFormTask(null);
    }

    return success;
  }

  async function resetData() {
    const success = await runMutation(
      () => api.resetDemoData(),
      "Исходные данные восстановлены.",
    );

    if (success) {
      editingId = null;
      view.setFormTask(null);
    }

    return success;
  }

  function destroy() {
    if (activeLoadController) {
      activeLoadController.abort();
      activeLoadController = null;
    }

    loadSequence++;
  }

  return {
    start,
    applyFilters,
    refresh,
    submit,
    beginEdit,
    cancelEdit,
    toggleTask,
    deleteTask,
    resetData,
    destroy,
  };
}