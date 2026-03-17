import assert from "node:assert/strict";
import test from "node:test";
import {
  formatFallbackOutput,
  formatOutput,
  formatRateLimitOutput,
  formatResetTimes,
} from "../dist/formatter.js";

const originalDateNow = Date.now;

test.afterEach(() => {
  Date.now = originalDateNow;
});

test("formatResetTimes formats remaining windows and rounds usage", () => {
  const now = Date.UTC(2026, 0, 1, 0, 0, 0);
  Date.now = () => now;

  const actual = formatResetTimes({
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
  });

  assert.deepEqual(actual, {
    fiveHour: {
      timeRemaining: "2h30m",
      usage: 16,
    },
    sevenDay: {
      timeRemaining: "3d12h",
      usage: 7,
    },
  });
});

test("formatResetTimes returns reset marker and unlimited marker for edge cases", () => {
  const now = Date.UTC(2026, 0, 1, 0, 0, 0);
  Date.now = () => now;

  const actual = formatResetTimes({
    five_hour: {
      utilization: 0,
      resets_at: new Date(now - 1).toISOString(),
    },
    seven_day: {
      utilization: 0,
      resets_at: null,
    },
    seven_day_oauth_apps: null,
    seven_day_opus: null,
  });

  assert.deepEqual(actual, {
    fiveHour: {
      timeRemaining: "reset!",
      usage: 0,
    },
    sevenDay: {
      timeRemaining: "-",
      usage: 0,
    },
  });
});

test("formatResetTimes throws on invalid reset timestamps", () => {
  assert.throws(
    () =>
      formatResetTimes({
        five_hour: {
          utilization: 1,
          resets_at: "invalid-timestamp",
        },
        seven_day: {
          utilization: 2,
          resets_at: null,
        },
        seven_day_oauth_apps: null,
        seven_day_opus: null,
      }),
    /不正なリセット時刻です: invalid-timestamp/,
  );
});

test("formatOutput and formatFallbackOutput keep the statusline shape", () => {
  assert.equal(
    formatOutput({
      fiveHour: { timeRemaining: "2h30m", usage: 16 },
      sevenDay: { timeRemaining: "3d12h", usage: 7 },
    }),
    "5h:2h30m(16%) | 7d:3d12h(7%)",
  );

  assert.equal(formatFallbackOutput(), "5h:--(-%) | 7d:--(-%)");
  assert.equal(formatRateLimitOutput(), "[429 error]");
});
