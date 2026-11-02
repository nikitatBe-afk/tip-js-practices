import { demoTasks } from "./123.js";

export function getPendingTasks(tasks) {
  return tasks.filter(task => task.completed === false);
}

console.log("Результат для demoTasks:");
console.log(getPendingTasks(demoTasks));

console.log("Результат для пустого массива:");
console.log(getPendingTasks([]));