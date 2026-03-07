import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";
import { run } from "../dist/index.js";

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
