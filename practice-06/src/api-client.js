export class ApiError extends Error {
  constructor(message, {
    kind,
    status = null,
    code = null,
    details = null,
    url = null,
    cause,
  } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

// Соединяет абсолютный baseUrl, путь и непустые query-параметры.
export function buildUrl(baseUrl, path, query = {}) {
  const base = new URL(baseUrl);

  if (base.protocol !== "http:" && base.protocol !== "https:") {
    throw new TypeError("baseUrl должен использовать http или https");
  }

  if (base.search || base.hash) {
    throw new TypeError("baseUrl не должен содержать query или hash");
  }

  if (typeof path !== "string" || path.trim() === "") {
    throw new TypeError("path должен быть непустой строкой");
  }

  if (
    query === null
    || Array.isArray(query)
    || typeof query !== "object"
  ) {
    throw new TypeError("query должен быть объектом");
  }

  const baseText = base.toString().replace(/\/$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  const url = new URL(`${baseText}/${cleanPath}`);

  for (const [name, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    url.searchParams.set(name, String(value));
  }

  return url.toString();
}

// requestJson(path, { method, query, body, signal, timeoutMs } = {})
// поддерживает GET, POST, PATCH и DELETE; ответ 204 преобразуется в null.
export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 3000,
} = {}) {
  if (typeof baseUrl !== "string" || baseUrl.trim() === "") {
    throw new TypeError("baseUrl должен быть непустой строкой");
  }

  let parsedBaseUrl;

  try {
    parsedBaseUrl = new URL(baseUrl);
  } catch {
    throw new TypeError("baseUrl должен быть абсолютным URL");
  }

  if (
    parsedBaseUrl.protocol !== "http:"
    && parsedBaseUrl.protocol !== "https:"
  ) {
    throw new TypeError("baseUrl должен использовать http или https");
  }

  if (parsedBaseUrl.search || parsedBaseUrl.hash) {
    throw new TypeError("baseUrl не должен содержать query или hash");
  }

  if (typeof fetchFn !== "function") {
    throw new TypeError("fetchFn должен быть функцией");
  }

  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError(
      "timeoutMs должен быть положительным безопасным целым числом",
    );
  }

  const normalizedBaseUrl = parsedBaseUrl.toString().replace(/\/$/, "");

  async function requestJson(
    path,
    {
      method = "GET",
      query = {},
      body = undefined,
      signal = undefined,
      timeoutMs: requestTimeoutMs = timeoutMs,
    } = {},
  ) {
    if (typeof method !== "string") {
      throw new TypeError("method должен быть строкой");
    }

    const normalizedMethod = method.toUpperCase();

    const allowedMethods = new Set([
      "GET",
      "POST",
      "PATCH",
      "DELETE",
    ]);

    if (!allowedMethods.has(normalizedMethod)) {
      throw new TypeError("Недопустимый HTTP-метод");
    }

    if (normalizedMethod === "GET" && body !== undefined) {
      throw new TypeError("GET-запрос не должен содержать body");
    }

    if (
      !Number.isSafeInteger(requestTimeoutMs)
      || requestTimeoutMs <= 0
    ) {
      throw new TypeError(
        "timeoutMs должен быть положительным безопасным целым числом",
      );
    }

    const url = buildUrl(normalizedBaseUrl, path, query);

    const timeoutSignal = AbortSignal.timeout(requestTimeoutMs);

    const combinedSignal =
      signal === undefined
        ? timeoutSignal
        : AbortSignal.any([signal, timeoutSignal]);

    const headers = {
      Accept: "application/json",
    };

    const options = {
      method: normalizedMethod,
      headers,
      signal: combinedSignal,
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    let response;

    try {
      response = await fetchFn(url, options);
    } catch (error) {
      if (signal?.aborted) {
        throw new ApiError("Запрос отменён", {
          kind: "aborted",
          url,
          cause: error,
        });
      }

      if (timeoutSignal.aborted) {
        throw new ApiError("Превышено время ожидания запроса", {
          kind: "timeout",
          url,
          cause: error,
        });
      }

      throw new ApiError("Сетевая ошибка", {
        kind: "network",
        url,
        cause: error,
      });
    }

    if (!(response instanceof Response)) {
      throw new ApiError("Получен некорректный ответ", {
        kind: "invalid-response",
        url,
      });
    }

    // Сначала обязательно HTTP-ошибка.
    if (!response.ok) {
      let payload = null;

      try {
        const contentType =
          response.headers.get("content-type") ?? "";

        if (contentType.includes("application/json")) {
          payload = await response.json();
        }
      } catch {
        // Даже если тело ошибки повреждено,
        // тип остаётся http.
      }

      const errorData =
        payload
        && typeof payload === "object"
        && payload.error
        && typeof payload.error === "object"
          ? payload.error
          : null;

      throw new ApiError(
        errorData?.message ?? `HTTP ${response.status}`,
        {
          kind: "http",
          status: response.status,
          code: errorData?.code ?? null,
          details: errorData?.details ?? null,
          url,
        },
      );
    }

    // DELETE часто возвращает 204 без тела.
    if (response.status === 204) {
      return null;
    }

    const contentType =
      response.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      throw new ApiError("Ожидался JSON-ответ", {
        kind: "invalid-response",
        url,
      });
    }

    try {
      return await response.json();
    } catch (error) {
      throw new ApiError("Не удалось разобрать JSON", {
        kind: "invalid-response",
        url,
        cause: error,
      });
    }
  }

  return {
    requestJson,
  };
}
