import { ApiError } from './errors.js';

// raw: строка; результат: безопасное положительное целое либо null.
export function parsePositiveId(raw) {
  if (typeof raw !== 'string') {
    return null;
  }

  if (!/^[1-9]\d*$/.test(raw)) {
    return null;
  }

  const value = Number(raw);

  if (!Number.isSafeInteger(value)) {
    return null;
  }

  return value;
}

// URLSearchParams -> {
//   completed: boolean|null,
//   priority: string|null,
//   categoryId: number|null,
//   q: string
// }
export function parseFilters(searchParams) {
  const allowedNames = [
    'completed',
    'priority',
    'categoryId',
    'q'
  ];

  for (const name of searchParams.keys()) {
    if (!allowedNames.includes(name)) {
      throw new ApiError(
        400,
        'INVALID_QUERY',
        `Неизвестный параметр: ${name}`
      );
    }
  }

  for (const name of allowedNames) {
    if (searchParams.getAll(name).length > 1) {
      throw new ApiError(
        400,
        'INVALID_QUERY',
        `Параметр ${name} указан несколько раз`
      );
    }
  }

  let completed = null;
  let priority = null;
  let categoryId = null;
  let q = '';

  if (searchParams.has('completed')) {
    const raw = searchParams.get('completed');

    if (raw !== 'true' && raw !== 'false') {
      throw new ApiError(
        400,
        'INVALID_QUERY',
        'Некорректное значение completed'
      );
    }

    completed = raw === 'true';
  }

  if (searchParams.has('priority')) {
    const raw = searchParams.get('priority');

    if (!['low', 'medium', 'high'].includes(raw)) {
      throw new ApiError(
        400,
        'INVALID_QUERY',
        'Некорректное значение priority'
      );
    }

    priority = raw;
  }

  if (searchParams.has('categoryId')) {
    const raw = searchParams.get('categoryId');
    const parsed = parsePositiveId(raw);

    if (parsed === null) {
      throw new ApiError(
        400,
        'INVALID_QUERY',
        'Некорректное значение categoryId'
      );
    }

    categoryId = parsed;
  }

  if (searchParams.has('q')) {
    q = searchParams.get('q').trim();

    if (q.length > 100) {
      throw new ApiError(
        400,
        'INVALID_QUERY',
        'Поисковая строка слишком длинная'
      );
    }
  }

  return {
    completed,
    priority,
    categoryId,
    q
  };
}