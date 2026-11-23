export default function TaskItem({
  task,
  categoryName,
  onToggle,
  onEdit,
  onDelete
}) {
  const priorityNames = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий'
  };

  return (
    <li className="task-card">
      <h3>{task.title}</h3>

      <p>
        Статус: {task.completed ? 'Выполнена' : 'В работе'}
      </p>

      <p>
        Приоритет: {priorityNames[task.priority]}
      </p>

      <p>
        Категория: {categoryName}
      </p>

      <div className="task-actions">
        <button
          type="button"
          onClick={() => onToggle(task.id)}
        >
          {task.completed ? 'Вернуть в работу' : 'Завершить'}
        </button>

        <button
          type="button"
          onClick={() => onEdit(task.id)}
        >
          Редактировать
        </button>

        <button
          type="button"
          onClick={() => onDelete(task.id)}
        >
          Удалить
        </button>
      </div>
    </li>
  );
}