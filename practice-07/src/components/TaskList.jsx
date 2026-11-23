import TaskItem from './TaskItem.jsx';

export default function TaskList({
  tasks,
  categories,
  onToggle,
  onEdit,
  onDelete
}) {
  return (
    <section aria-label="Список задач">
      <h2>Задачи</h2>

      <p>Найдено: {tasks.length}</p>

      {tasks.length === 0 ? (
        <p>Задачи не найдены.</p>
      ) : (
        <ul className="task-list">
          {tasks.map(task => {
            const category = categories.find(
              item => item.id === task.categoryId
            );

            const categoryName = category
              ? category.name
              : 'Неизвестная категория';

            return (
              <TaskItem
                key={task.id}
                task={task}
                categoryName={categoryName}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}