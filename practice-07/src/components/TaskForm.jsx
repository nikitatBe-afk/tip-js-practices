import { useState } from 'react';
import { validateTaskDraft } from '../domain/task-service.js';

function createDraft(initialTask, categories) {
  if (initialTask) {
    return {
      title: initialTask.title,
      priority: initialTask.priority,
      categoryId: String(initialTask.categoryId)
    };
  }

  return {
    title: '',
    priority: 'medium',
    categoryId: categories.length > 0
      ? String(categories[0].id)
      : ''
  };
}

export default function TaskForm({
  categories,
  initialTask = null,
  onSave,
  onCancel
}) {
  const [draft, setDraft] = useState(() =>
    createDraft(initialTask, categories)
  );

  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;

    setDraft(previous => ({
      ...previous,
      [name]: value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const result = validateTaskDraft(draft, categories);

    setErrors(result.errors);
    setSaveError('');

    if (!result.valid) {
      return;
    }

    const saved = onSave(result.value);

    if (!saved) {
      setSaveError('Не удалось сохранить задачу.');
      return;
    }

    if (!initialTask) {
      setDraft(createDraft(null, categories));
      setErrors({});
    }
  }

  function handleCancel() {
    setErrors({});
    setSaveError('');
    onCancel();
  }

  return (
    <section aria-label="Форма задачи">
      <h2>
        {initialTask ? 'Редактирование задачи' : 'Новая задача'}
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="task-title">
            Название
          </label>

          <input
            id="task-title"
            name="title"
            type="text"
            value={draft.title}
            onChange={handleChange}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={
              errors.title ? 'task-title-error' : undefined
            }
          />

          {errors.title && (
            <p id="task-title-error">
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="task-priority">
            Приоритет
          </label>

          <select
            id="task-priority"
            name="priority"
            value={draft.priority}
            onChange={handleChange}
            aria-invalid={Boolean(errors.priority)}
            aria-describedby={
              errors.priority
                ? 'task-priority-error'
                : undefined
            }
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>

          {errors.priority && (
            <p id="task-priority-error">
              {errors.priority}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="task-category">
            Категория
          </label>

          <select
            id="task-category"
            name="categoryId"
            value={draft.categoryId}
            onChange={handleChange}
            aria-invalid={Boolean(errors.categoryId)}
            aria-describedby={
              errors.categoryId
                ? 'task-category-error'
                : undefined
            }
          >
            {categories.map(category => (
              <option
                key={category.id}
                value={String(category.id)}
              >
                {category.name}
              </option>
            ))}
          </select>

          {errors.categoryId && (
            <p id="task-category-error">
              {errors.categoryId}
            </p>
          )}
        </div>

        {saveError && (
          <p role="alert">
            {saveError}
          </p>
        )}

        <button type="submit">
          {initialTask ? 'Сохранить изменения' : 'Создать задачу'}
        </button>

        {initialTask && (
          <button
            type="button"
            onClick={handleCancel}
          >
            Отмена
          </button>
        )}
      </form>
    </section>
  );
}