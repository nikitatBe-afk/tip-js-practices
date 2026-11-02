import { demoTasks } from "./123.js";

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

const result1 = setTaskCompleted(demoTasks, 4, true);

console.log("Проверка 1:");
console.log(
  "Статус в исходном массиве:",
  demoTasks.find(task => task.id === 4).completed
);
console.log(
  "Статус в новом массиве:",
  result1.tasks.find(task => task.id === 4).completed
);

const result2 = setTaskCompleted(demoTasks, 777, true);

console.log("Проверка 2:");
console.log("Результат:", result2);