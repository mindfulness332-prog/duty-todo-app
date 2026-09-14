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
    let body: ApiErrorResponseBody | undefined;
    try {
      body = (await response.json()) as ApiErrorResponseBody;
    } catch {
      body = undefined;
    }
    throw new ApiError(
      response.status,
      body?.error.code ?? "UNKNOWN_ERROR",
      body?.error.message ?? "Something went wrong. Please try again.",
      body?.error.details,
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
