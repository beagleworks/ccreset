import type { UsageResponse } from "./types.js";

const API_ENDPOINT = "https://api.anthropic.com/api/oauth/usage";
const ANTHROPIC_BETA_HEADER = "oauth-2025-04-20";
const API_TIMEOUT_MS = 2000;

interface FetchUsageOptions {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export interface UsageApiError extends Error {
  status: number;
  responseText: string;
}

function createUsageApiError(
  status: number,
  responseText: string,
): UsageApiError {
  const error = new Error(
    `API呼び出しに失敗しました (${status}): ${responseText}`
  ) as UsageApiError;
  error.name = "UsageApiError";
  error.status = status;
  error.responseText = responseText;
  return error;
}

export function isUsageApiError(error: unknown): error is UsageApiError {
  return (
    error instanceof Error &&
    typeof (error as Partial<UsageApiError>).status === "number" &&
    typeof (error as Partial<UsageApiError>).responseText === "string"
  );
}

/**
 * Claude Code の使用量情報を取得
 */
export async function fetchUsage(
  accessToken: string,
  options: FetchUsageOptions = {},
): Promise<UsageResponse> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? API_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(API_ENDPOINT, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "anthropic-beta": ANTHROPIC_BETA_HEADER,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw createUsageApiError(response.status, errorText);
    }

    return response.json() as Promise<UsageResponse>;
  } finally {
    clearTimeout(timeoutId);
  }
}
