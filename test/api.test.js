import assert from "node:assert/strict";
import test from "node:test";
import { fetchUsage } from "../dist/api.js";

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("fetchUsage returns parsed usage data and sends required headers", async () => {
  const expected = {
    five_hour: {
      utilization: 16,
      resets_at: "2026-01-01T02:30:00.000Z",
    },
    seven_day: {
      utilization: 7,
      resets_at: "2026-01-04T12:00:00.000Z",
    },
    seven_day_oauth_apps: null,
    seven_day_opus: null,
  };

  let requestUrl;
  let requestInit;

  globalThis.fetch = async (url, init) => {
    requestUrl = url;
    requestInit = init;

    return {
      ok: true,
      json: async () => expected,
    };
  };

  const actual = await fetchUsage("test-access-token");

  assert.deepEqual(actual, expected);
  assert.equal(requestUrl, "https://api.anthropic.com/api/oauth/usage");
  assert.equal(requestInit.method, "GET");
  assert.equal(
    requestInit.headers.Authorization,
    "Bearer test-access-token",
  );
  assert.equal(requestInit.headers["anthropic-beta"], "oauth-2025-04-20");
  assert.ok(requestInit.signal instanceof AbortSignal);
});

test("fetchUsage throws response details when the API returns an error", async () => {
  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    text: async () => "unauthorized",
  });

  await assert.rejects(
    fetchUsage("expired-token"),
    /API呼び出しに失敗しました \(401\): unauthorized/,
  );
});

test("fetchUsage aborts requests that exceed the timeout", async () => {
  const fetchImpl = (_url, init) =>
    new Promise((_resolve, reject) => {
      init.signal.addEventListener(
        "abort",
        () => {
          const abortError = new Error("aborted");
          abortError.name = "AbortError";
          reject(abortError);
        },
        { once: true },
      );
    });

  await assert.rejects(
    fetchUsage("slow-token", { fetchImpl, timeoutMs: 1 }),
    (error) => error instanceof Error && error.name === "AbortError",
  );
});
