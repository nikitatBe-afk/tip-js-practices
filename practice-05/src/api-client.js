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

// Создаёт URL относительно baseUrl и добавляет непустые параметры query.
// Значения кодируются средствами URL и URLSearchParams, а не вручную.
export function buildUrl(baseUrl, path, query = {}) {
  const base = new URL(baseUrl);

  if (base.protocol !== "http:" && base.protocol !== "https:") {
    throw new Error("baseUrl должен использовать http или https");
  }

  if (base.search || base.hash) {
    throw new Error("baseUrl не должен содержать query или hash");
  }

  if (typeof path !== "string" || path.trim() === "") {
    throw new Error("path должен быть непустой строкой");
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

// fetchFn передаётся явно, чтобы модуль можно было проверить без реальной сети.
// Возвращаемый объект: { requestJson(path, { query, signal, timeoutMs } = {}) }.
export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 2000,
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
    parsedBaseUrl.protocol !== "http:" &&
    parsedBaseUrl.protocol !== "https:"
  ) {
    throw new TypeError("baseUrl должен использовать http или https");
  }

  if (parsedBaseUrl.search !== "" || parsedBaseUrl.hash !== "") {
    throw new TypeError("baseUrl не должен содержать query или hash");
  }

  if (typeof fetchFn !== "function") {
    throw new TypeError("fetchFn должен быть функцией");
  }

  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError(
      "timeoutMs должен быть положительным безопасным целым числом"
    );
  }

  const normalizedBaseUrl = parsedBaseUrl.toString().replace(/\/$/, "");

  async function requestJson(
    path,
    {
      query = {},
      signal = undefined,
      timeoutMs: requestTimeoutMs = timeoutMs,
    } = {},
  ) {
    if (!Number.isSafeInteger(requestTimeoutMs) || requestTimeoutMs <= 0) {
      throw new TypeError(
        "timeoutMs должен быть положительным безопасным целым числом"
      );
    }

    const url = buildUrl(normalizedBaseUrl, path, query);

    const timeoutSignal = AbortSignal.timeout(requestTimeoutMs);

    const combinedSignal =
      signal === undefined
        ? timeoutSignal
        : AbortSignal.any([signal, timeoutSignal]);

    let response;

    try {
      response = await fetchFn(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: combinedSignal,
      });
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

    if (!response.ok) {
      let payload = null;

      try {
        const contentType =
          response.headers.get("content-type") ?? "";

        if (contentType.includes("application/json")) {
          payload = await response.json();
        }
      } catch {
        // HTTP-статус остаётся главным даже при неверном теле.
      }

      const errorData =
        payload &&
        typeof payload === "object" &&
        payload.error &&
        typeof payload.error === "object"
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