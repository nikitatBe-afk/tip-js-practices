import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

export function isTask(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1
    && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId),
  );
}

export function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

// Методы результата:
// getTasks, getTaskById, getCategories, loadInitialData, createTask, updateTask,
// setTaskCompleted, deleteTask и resetDemoData.
// Последний аргумент каждого метода данных — { signal }.
export function createTaskApi(client) {
  if (!client || typeof client !== "object" || typeof client.requestJson !== "function") {
    throw new TypeError("client.requestJson должен быть функцией");
  }

  function withSignal(options = {}) {
    if (options === null || Array.isArray(options) || typeof options !== "object") {
      throw new TypeError("options должен быть объектом");
    }

    if (options.signal === undefined) {
      return {};
    }

    return { signal: options.signal };
  }

  function normalizeFilters(filters = {}) {
    if (filters === null || Array.isArray(filters) || typeof filters !== "object") {
      throw new TypeError("filters должен быть объектом");
    }

    for (const key of Object.keys(filters)) {
      if (!ALLOWED_FILTERS.has(key)) {
        throw new TypeError(`Неизвестный фильтр: ${key}`);
      }
    }

    const query = {};

    if ("completed" in filters) {
      if (typeof filters.completed !== "boolean") {
        throw new TypeError("completed должен быть boolean");
      }

      query.completed = filters.completed;
    }

    if ("priority" in filters) {
      if (!ALLOWED_PRIORITIES.has(filters.priority)) {
        throw new TypeError("Некорректный priority");
      }

      query.priority = filters.priority;
    }

    if ("categoryId" in filters) {
      if (!isPositiveSafeInteger(filters.categoryId)) {
        throw new TypeError("categoryId должен быть положительным безопасным целым числом");
      }

      query.categoryId = filters.categoryId;
    }

    if ("q" in filters) {
      if (typeof filters.q !== "string") {
        throw new TypeError("q должен быть строкой");
      }

      const cleanQ = filters.q.trim();

      if (cleanQ.length > 100) {
        throw new TypeError("q должен быть длиной не более 100 символов");
      }

      if (cleanQ !== "") {
        query.q = cleanQ;
      }
    }

    return query;
  }

  function validateTaskCollection(payload) {
    if (!payload || typeof payload !== "object" || !Array.isArray(payload.data) || !payload.meta || typeof payload.meta !== "object") {
      throw invalidResponse("Некорректный ответ со списком задач");
    }

    if (!payload.data.every(isTask)) {
      throw invalidResponse("Получены некорректные данные задач");
    }

    const ids = new Set();

    for (const task of payload.data) {
      if (ids.has(task.id)) {
        throw invalidResponse("В коллекции задач есть повторяющиеся id");
      }

      ids.add(task.id);
    }

    if (!Number.isSafeInteger(payload.meta.total) || payload.meta.total < 0 || payload.meta.total !== payload.data.length) {
      throw invalidResponse("meta.total не соответствует количеству задач");
    }

    return {
      tasks: payload.data,
      meta: payload.meta,
    };
  }

  function validateSingleTask(payload) {
    if (!payload || typeof payload !== "object" || !isTask(payload.data)) {
      throw invalidResponse("Некорректный ответ с задачей");
    }

    return payload.data;
  }

  function validateCategories(payload) {
    if (!payload || typeof payload !== "object" || !Array.isArray(payload.data) || !payload.meta || typeof payload.meta !== "object") {
      throw invalidResponse("Некорректный ответ с категориями");
    }

    if (!payload.data.every(isCategory)) {
      throw invalidResponse("Получены некорректные категории");
    }

    const ids = new Set();

    for (const category of payload.data) {
      if (ids.has(category.id)) {
        throw invalidResponse("В категориях есть повторяющиеся id");
      }

      ids.add(category.id);
    }

    if (!Number.isSafeInteger(payload.meta.total) || payload.meta.total < 0 || payload.meta.total !== payload.data.length) {
      throw invalidResponse("meta.total не соответствует количеству категорий");
    }

    return payload.data;
  }

  function validateId(id) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError("id должен быть положительным безопасным целым числом");
    }
  }

  async function getTasks(filters = {}, options = {}) {
    const query = normalizeFilters(filters);

    const payload = await client.requestJson("/tasks", {
      query,
      ...withSignal(options),
    });

    return validateTaskCollection(payload);
  }

  async function getTaskById(id, options = {}) {
    validateId(id);

    const payload = await client.requestJson(`/tasks/${id}`, {
      ...withSignal(options),
    });

    return validateSingleTask(payload);
  }

  async function getCategories(options = {}) {
    const payload = await client.requestJson("/categories", {
      ...withSignal(options),
    });

    return validateCategories(payload);
  }

  async function loadInitialData(filters = {}, options = {}) {
    const tasksPromise = getTasks(filters, options);
    const categoriesPromise = getCategories(options);

    const [taskResult, categories] = await Promise.all([
      tasksPromise,
      categoriesPromise,
    ]);

    return {
      tasks: taskResult.tasks,
      categories,
      meta: taskResult.meta,
    };
  }

  async function createTask(draft, options = {}) {
    const payload = await client.requestJson("/tasks", {
      method: "POST",
      body: draft,
      ...withSignal(options),
    });

    return validateSingleTask(payload);
  }

  async function updateTask(id, changes, options = {}) {
    validateId(id);

    const payload = await client.requestJson(`/tasks/${id}`, {
      method: "PATCH",
      body: changes,
      ...withSignal(options),
    });

    return validateSingleTask(payload);
  }

  async function setTaskCompleted(id, completed, options = {}) {
    validateId(id);

    if (typeof completed !== "boolean") {
      throw new TypeError("completed должен быть boolean");
    }

    const payload = await client.requestJson(`/tasks/${id}`, {
      method: "PATCH",
      body: { completed },
      ...withSignal(options),
    });

    return validateSingleTask(payload);
  }

  async function deleteTask(id, options = {}) {
    validateId(id);

    const result = await client.requestJson(`/tasks/${id}`, {
      method: "DELETE",
      ...withSignal(options),
    });

    if (result !== null) {
      throw invalidResponse("DELETE должен возвращать ответ без тела");
    }

    return null;
  }

  async function resetDemoData(options = {}) {
    const payload = await client.requestJson("/debug/reset", {
      method: "POST",
      ...withSignal(options),
    });

    if (!payload || typeof payload !== "object" || !payload.data || typeof payload.data !== "object" || payload.data.reset !== true || !Number.isSafeInteger(payload.data.total) || payload.data.total < 0) {
      throw invalidResponse("Некорректный ответ восстановления данных");
    }

    return payload.data;
  }

  return {
    getTasks,
    getTaskById,
    getCategories,
    loadInitialData,
    createTask,
    updateTask,
    setTaskCompleted,
    deleteTask,
    resetDemoData,
  };
}