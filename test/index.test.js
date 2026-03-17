import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";
import { run } from "../dist/index.js";
import { RATE_LIMIT_BACKOFF_MS } from "../dist/cache.js";

const execFileAsync = promisify(execFile);
const originalDateNow = Date.now;

test.afterEach(() => {
  Date.now = originalDateNow;
});

test("run outputs formatted statusline text on success", async () => {
  const logs = [];
  const now = Date.UTC(2026, 0, 1, 0, 0, 0);
  Date.now = () => now;

  await run({
    getAccessTokenFn: async () => "test-token",
    fetchUsageFn: async () => ({
      five_hour: {
        utilization: 15.6,
        resets_at: new Date(now + (2 * 60 + 30) * 60 * 1000).toISOString(),
      },
      seven_day: {
        utilization: 7.4,
        resets_at: new Date(now + (3 * 24 + 12) * 60 * 60 * 1000).toISOString(),
      },
      seven_day_oauth_apps: null,
      seven_day_opus: null,
    }),
    log: (message) => {
      logs.push(message);
    },
  });

  assert.deepEqual(logs, ["5h:2h30m(16%) | 7d:3d12h(7%)"]);
});

test("run falls back to placeholder output when dependencies fail", async () => {
  const logs = [];

  await run({
    getAccessTokenFn: async () => {
      throw new Error("boom");
    },
    log: (message) => {
      logs.push(message);
    },
  });

  assert.deepEqual(logs, ["5h:--(-%) | 7d:--(-%)"]);
});

test("run uses fresh cache and skips API calls", async () => {
  const logs = [];
  const now = Date.UTC(2026, 0, 1, 0, 0, 0);
  Date.now = () => now;
  let fetchCalled = false;
  let tokenCalled = false;

  await run({
    loadCacheFn: async () => ({
      version: 1,
      lastSuccess: {
        fetchedAt: now - 30 * 1000,
        usage: {
          five_hour: {
            utilization: 15.6,
            resets_at: new Date(now + (2 * 60 + 30) * 60 * 1000).toISOString(),
          },
          seven_day: {
            utilization: 7.4,
            resets_at: new Date(
              now + (3 * 24 + 12) * 60 * 60 * 1000,
            ).toISOString(),
          },
          seven_day_oauth_apps: null,
          seven_day_opus: null,
        },
      },
      rateLimitUntil: null,
    }),
    getAccessTokenFn: async () => {
      tokenCalled = true;
      return "unexpected";
    },
    fetchUsageFn: async () => {
      fetchCalled = true;
      throw new Error("unexpected");
    },
    log: (message) => {
      logs.push(message);
    },
  });

  assert.equal(tokenCalled, false);
  assert.equal(fetchCalled, false);
  assert.deepEqual(logs, ["5h:2h30m(16%) | 7d:3d12h(7%)"]);
});

test("run prints rate limit output without calling API during backoff", async () => {
  const logs = [];
  const now = Date.UTC(2026, 0, 1, 0, 0, 0);
  Date.now = () => now;
  let fetchCalled = false;
  let tokenCalled = false;

  await run({
    loadCacheFn: async () => ({
      version: 1,
      lastSuccess: null,
      rateLimitUntil: now + 1_000,
    }),
    getAccessTokenFn: async () => {
      tokenCalled = true;
      return "unexpected";
    },
    fetchUsageFn: async () => {
      fetchCalled = true;
      throw new Error("unexpected");
    },
    log: (message) => {
      logs.push(message);
    },
  });

  assert.equal(tokenCalled, false);
  assert.equal(fetchCalled, false);
  assert.deepEqual(logs, ["[429 error]"]);
});

test("run stores rate limit backoff and prints explicit output on 429", async () => {
  const logs = [];
  const now = Date.UTC(2026, 0, 1, 0, 0, 0);
  Date.now = () => now;
  let savedCache;

  await run({
    loadCacheFn: async () => ({
      version: 1,
      lastSuccess: null,
      rateLimitUntil: null,
    }),
    getAccessTokenFn: async () => "test-token",
    fetchUsageFn: async () => {
      const error = Object.assign(new Error("rate limited"), {
        status: 429,
        responseText: "rate limited",
      });
      throw error;
    },
    saveCacheFn: async (cache) => {
      savedCache = cache;
    },
    log: (message) => {
      logs.push(message);
    },
  });

  assert.deepEqual(logs, ["[429 error]"]);
  assert.deepEqual(savedCache, {
    version: 1,
    lastSuccess: null,
    rateLimitUntil: now + RATE_LIMIT_BACKOFF_MS,
  });
});

test("run uses stale cache when non-429 API calls fail", async () => {
  const logs = [];
  const now = Date.UTC(2026, 0, 1, 0, 0, 0);
  Date.now = () => now;

  await run({
    loadCacheFn: async () => ({
      version: 1,
      lastSuccess: {
        fetchedAt: now - 5 * 60 * 1000,
        usage: {
          five_hour: {
            utilization: 15.6,
            resets_at: new Date(now + (2 * 60 + 30) * 60 * 1000).toISOString(),
          },
          seven_day: {
            utilization: 7.4,
            resets_at: new Date(
              now + (3 * 24 + 12) * 60 * 60 * 1000,
            ).toISOString(),
          },
          seven_day_oauth_apps: null,
          seven_day_opus: null,
        },
      },
      rateLimitUntil: null,
    }),
    getAccessTokenFn: async () => "test-token",
    fetchUsageFn: async () => {
      throw new Error("boom");
    },
    log: (message) => {
      logs.push(message);
    },
  });

  assert.deepEqual(logs, ["5h:2h30m(16%) | 7d:3d12h(7%)"]);
});

test("CLI entrypoint prints fallback output when executed directly", async () => {
  const { stdout } = await execFileAsync(process.execPath, ["dist/cli.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      HOME: "/tmp/ccreset-empty-home",
    },
  });

  assert.equal(stdout.trim(), "5h:--(-%) | 7d:--(-%)");
});
