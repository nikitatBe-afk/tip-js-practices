export function getVisibleTasks(tasks, filter = "all") {
  if (filter === "pending") {
    return tasks.filter((task) => task.completed === false);
  }

  if (filter === "completed") {
    return tasks.filter((task) => task.completed === true);
  }

  return [...tasks];
  // TODO: all — копия массива, pending — невыполненные, completed — выполненные.
}