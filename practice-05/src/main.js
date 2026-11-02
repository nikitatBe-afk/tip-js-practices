import { ApiError, createApiClient } from "./api-client.js";
import { createTaskApi } from "./task-api.js";
import { variantFilters, variantNumber } from "./variant.js";

const baseUrl = process.env.API_URL ?? "http://127.0.0.1:5505/api";

function describeError(error) {
  if (!(error instanceof ApiError)) {
    return `Неожиданная ошибка: ${error.message}`;
  }

  const parts = [`Тип: ${error.kind}`, error.message];
  if (error.status !== null) parts.push(`HTTP ${error.status}`);
  if (error.code !== null) parts.push(`Код API: ${error.code}`);
  return parts.join(" · ");
}

try {
  const client = createApiClient({ baseUrl, timeoutMs: 2000 });
  const api = createTaskApi(client);
  const filters = variantNumber === null
    ? { completed: false, priority: "high" }
    : variantFilters;

  const startedAt = performance.now();
  const { tasks, categories, meta } = await api.loadInitialData(filters);
  const elapsedMs = performance.now() - startedAt;
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));

  console.log(
    variantNumber === null
      ? "Общий контрольный запрос"
      : `Индивидуальный вариант ${variantNumber}`,
  );
  console.log("Фильтры:", meta.filters);
  console.log(`Получено задач: ${meta.total}; время: ${elapsedMs.toFixed(1)} мс`);
  console.table(tasks.map((task) => ({
    id: task.id,
    title: task.title,
    completed: task.completed,
    priority: task.priority,
    category: categoryNames.get(task.categoryId) ?? "Неизвестно",
  })));

  try {
    await api.getTaskById(999);
  } catch (error) {
    console.log("Контрольная ошибка 404:", describeError(error));
  }
  console.log("\nПроверка тайм-аута:");

try {
  await client.requestJson("/debug/delay", {
    query: { ms: 150 },
    timeoutMs: 20,
  });
} catch (error) {
  console.log("kind:", error.kind);
  console.log("message:", error.message);
}

console.log("\nПроверка внешней отмены:");

const controller = new AbortController();

const pending = client.requestJson("/debug/delay", {
  query: { ms: 150 },
  signal: controller.signal,
  timeoutMs: 1000,
});

controller.abort();

try {
  await pending;
} catch (error) {
  console.log("kind:", error.kind);
  console.log("message:", error.message);
}
} catch (error) {
  console.error(describeError(error));
  console.error(`Проверяемый адрес API: ${baseUrl}`);
  process.exitCode = 1;
}

const API_URL = "http://127.0.0.1:5505/api";

async function delayRequest(ms) {
  const response = await fetch(`${API_URL}/debug/delay?ms=${ms}`);
  return response.json();
}

async function runExperiment() {
  console.log("Последовательный вариант:");

  for (let i = 1; i <= 3; i++) {
    const start = performance.now();

    await delayRequest(150);
    await delayRequest(150);

    const end = performance.now();

    console.log(
      `Попытка ${i}: ${Math.round(end - start)} мс`
    );
  }

  console.log("\nПараллельный вариант:");

  for (let i = 1; i <= 3; i++) {
    const start = performance.now();

    await Promise.all([
      delayRequest(150),
      delayRequest(150),
    ]);

    const end = performance.now();

    console.log(
      `Попытка ${i}: ${Math.round(end - start)} мс`
    );
  }
}

//runExperiment();

