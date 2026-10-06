import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  createTask,
  findTaskById,
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./task-service.js";

console.log("ПР2. Заготовка демонстрационного сценария");
console.log("Количество задач в общем наборе:", demoTasks.length);
console.log("Номер варианта:", variantNumber);
console.log("Количество задач в индивидуальном наборе:", variantTasks.length);

let variantCurrentTasks = variantTasks;

// 1. Исходные данные и сводка
console.log("Исходные задачи:");
console.log(variantCurrentTasks);

console.log("Названия:");
console.log(getTaskTitles(variantCurrentTasks));

console.log("Невыполненные задачи:");
console.log(getPendingTasks(variantCurrentTasks));

let variantStats = getTaskStats(variantCurrentTasks);

console.log(
  `Всего: ${variantStats.total}; ` +
  `выполнено: ${variantStats.completed}; ` +
  `осталось: ${variantStats.pending}`
);

console.log(`Прогресс: ${variantStats.progress.toFixed(1)}%`);

// 2. Добавление id = 80
console.log("\n--- Добавление задачи id = 80 ---");

let result = addTask(
  variantCurrentTasks,
  80,
  "Подготовить шаблон технической документации",
  "low"
);

if (result.ok) {
  variantCurrentTasks = result.tasks;
  console.log("Задача добавлена.");
} else {
  console.error(`Ошибка: ${result.error}`);
}

variantStats = getTaskStats(variantCurrentTasks);
console.log(
  `Всего: ${variantStats.total}; ` +
  `выполнено: ${variantStats.completed}; ` +
  `осталось: ${variantStats.pending}; ` +
  `прогресс: ${variantStats.progress.toFixed(1)}%`
);

// 3. Установка completed = true для id = 11
console.log("\n--- Выполнение задачи id = 11 ---");

result = setTaskCompleted(variantCurrentTasks, 11, true);

if (result.ok) {
  variantCurrentTasks = result.tasks;
  console.log("Статус задачи изменён.");
} else {
  console.error(`Ошибка: ${result.error}`);
}

// 4. Переименование id = 23
console.log("\n--- Переименование задачи id = 23 ---");

result = renameTask(
  variantCurrentTasks,
  23,
  "Описать установку и запуск проекта"
);

if (result.ok) {
  variantCurrentTasks = result.tasks;
  console.log("Задача переименована.");
} else {
  console.error(`Ошибка: ${result.error}`);
}

// 5. Удаление id = 37
console.log("\n--- Удаление задачи id = 37 ---");

result = removeTask(variantCurrentTasks, 37);

if (result.ok) {
  variantCurrentTasks = result.tasks;
  console.log("Задача удалена.");
} else {
  console.error(`Ошибка: ${result.error}`);
}

// 6. Повторное добавление id = 80
console.log("\n--- Проверка повторного добавления id = 80 ---");

result = addTask(
  variantCurrentTasks,
  80,
  "Дубликат задачи",
  "low"
);

if (result.ok) {
  variantCurrentTasks = result.tasks;
  console.log("Неожиданно: задача добавлена.");
} else {
  console.error(`Ожидаемый отказ: ${result.error}`);
}

// 7. Итоговое состояние
console.log("\n=== Итог варианта 8 ===");

console.log("Итоговые задачи:");
console.log(variantCurrentTasks);

variantStats = getTaskStats(variantCurrentTasks);

console.log(
  `Всего: ${variantStats.total}; ` +
  `выполнено: ${variantStats.completed}; ` +
  `осталось: ${variantStats.pending}`
);

console.log(`Прогресс: ${variantStats.progress.toFixed(1)}%`);

// Проверка сохранности исходного variantTasks
console.log("\nИсходный variantTasks после всех операций:");
console.log(variantTasks);

console.log(
  "Исходный список сохранён:",
  variantTasks.length === 6 &&
  variantTasks[0].id === 11 &&
  variantTasks[1].id === 23 &&
  variantTasks[2].id === 37
);
// TODO: после реализации функций выполнить общий сценарий из раздела 6.5.
// Текущее состояние хранится в локальной переменной:
// let currentTasks = demoTasks;
// После успешной операции currentTasks получает result.tasks.
// При result.ok === false необходимо вывести ошибку, не заменяя состояние.
// Сводка выводится после каждого этапа; вычисления выполняются в task-service.js.

// TODO: выполнить отдельный сценарий для variantTasks по разделу 7.
// Общий набор demoTasks не заменяется данными варианта.

// TODO: показать хотя бы одну обработанную ошибку и неизменность исходных данных.
// Для удобного вывода объектов допустимо использовать console.table().