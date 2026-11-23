import { Router } from 'express';

import { ApiError } from './errors.js';
import { parsePositiveId, parseFilters } from './validation.js';

export function createRouter(store) {
  const router = Router({ caseSensitive: true });

  // GET /api/health
  router.get('/health', (req, res) => {
    return res.json({
      data: {
        status: 'ok'
      }
    });
  });

  // GET /api/categories
  router.get('/categories', (req, res) => {
    const categories = store.listCategories();

    return res.json({
      data: categories,
      meta: {
        total: categories.length
      }
    });
  });

  // GET /api/tasks
  router.get('/tasks', (req, res) => {
    const url = new URL(
      req.originalUrl,
      'http://localhost'
    );

    const filters = parseFilters(
      url.searchParams
    );

    const tasks = store.listTasks(filters);

    return res.json({
      data: tasks,
      meta: {
        total: tasks.length,
        filters
      }
    });
  });

  // GET /api/tasks/:id
  router.get('/tasks/:id', (req, res) => {
    const id = parsePositiveId(
      req.params.id
    );

    if (id === null) {
      throw new ApiError(
        400,
        'INVALID_ID',
        'Некорректный идентификатор задачи.'
      );
    }

    const task = store.getTask(id);

    if (!task) {
      throw new ApiError(
        404,
        'TASK_NOT_FOUND',
        'Задача не найдена.',
        { id }
      );
    }

    return res.json({
      data: task
    });
  });

  function methodNotAllowed(req, res) {
    res.set(
      'Allow',
      'GET, HEAD, OPTIONS'
    );

    throw new ApiError(
      405,
      'METHOD_NOT_ALLOWED',
      'Метод не поддерживается.'
    );
  }

  // Важно: эти обработчики идут ПОСЛЕ GET.
  router.all('/health', methodNotAllowed);
  router.all('/categories', methodNotAllowed);
  router.all('/tasks', methodNotAllowed);
  router.all('/tasks/:id', methodNotAllowed);

  return router;
}