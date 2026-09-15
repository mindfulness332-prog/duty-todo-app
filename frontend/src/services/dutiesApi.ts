import { env } from "../config/env";
import type { Duty } from "../types/duty";
import { ApiError, type ApiErrorDetail } from "./ApiError";

interface ApiErrorResponseBody {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

interface ApiSuccessResponseBody<T> {
  data: T;
}

// Only trusts the body enough to read `error.code`/`error.message` if both
// are actually present as strings — an upstream proxy or an unrelated 502
// won't have our `{ error: {...} }` shape at all, and reaching into `.error`
// without checking it exists first throws a TypeError that would otherwise
// mask the real HTTP status behind a confusing "Something went wrong".
function extractApiError(body: unknown): ApiErrorResponseBody["error"] | undefined {
  if (typeof body !== "object" || body === null || !("error" in body)) {
    return undefined;
  }
  const { error } = body as { error: unknown };
  if (
    typeof error !== "object" ||
    error === null ||
    typeof (error as { code?: unknown }).code !== "string" ||
    typeof (error as { message?: unknown }).message !== "string"
  ) {
    return undefined;
  }
  return error as ApiErrorResponseBody["error"];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Could not reach the server. Check your connection and try again.");
  }

  if (!response.ok) {
    let rawBody: unknown;
    try {
      rawBody = await response.json();
    } catch {
      rawBody = undefined;
    }
    const apiError = extractApiError(rawBody);
    throw new ApiError(
      response.status,
      apiError?.code ?? "UNKNOWN_ERROR",
      apiError?.message ?? "Something went wrong. Please try again.",
      apiError?.details,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json()) as ApiSuccessResponseBody<T>;
  return body.data;
}

export function getDuties(): Promise<Duty[]> {
  return request<Duty[]>("/duties");
}

export function createDuty(name: string): Promise<Duty> {
  return request<Duty>("/duties", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function updateDuty(id: string, name: string): Promise<Duty> {
  return request<Duty>(`/duties/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}

export function deleteDuty(id: string): Promise<void> {
  return request<void>(`/duties/${id}`, { method: "DELETE" });
}
