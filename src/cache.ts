import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type {
  UsageCache,
  UsageLimit,
  UsageResponse,
} from "./types.js";

export const SUCCESS_CACHE_TTL_MS = 60 * 1000;
export const STALE_CACHE_TTL_MS = 30 * 60 * 1000;
export const RATE_LIMIT_BACKOFF_MS = 5 * 60 * 1000;

function createEmptyCache(): UsageCache {
  return {
    version: 1,
    lastSuccess: null,
    rateLimitUntil: null,
  };
}

function getCacheDirectory(): string {
  const xdgCacheHome = process.env.XDG_CACHE_HOME?.trim();
  return xdgCacheHome || join(homedir(), ".cache");
}

export function getCachePath(): string {
  return join(getCacheDirectory(), "ccreset", "cache.json");
}

function isUsageLimit(value: unknown): value is UsageLimit {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const usageLimit = value as Partial<UsageLimit>;
  return (
    typeof usageLimit.utilization === "number" &&
    (typeof usageLimit.resets_at === "string" || usageLimit.resets_at === null)
  );
}

function isUsageResponse(value: unknown): value is UsageResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const usage = value as Partial<UsageResponse>;
  return (
    isUsageLimit(usage.five_hour) &&
    isUsageLimit(usage.seven_day) &&
    (usage.seven_day_oauth_apps === null ||
      isUsageLimit(usage.seven_day_oauth_apps)) &&
    (usage.seven_day_opus === null || isUsageLimit(usage.seven_day_opus))
  );
}

function normalizeCache(value: unknown): UsageCache {
  if (typeof value !== "object" || value === null) {
    return createEmptyCache();
  }

  const cache = value as Partial<UsageCache>;
  const lastSuccess =
    typeof cache.lastSuccess === "object" &&
    cache.lastSuccess !== null &&
    typeof cache.lastSuccess.fetchedAt === "number" &&
    isUsageResponse(cache.lastSuccess.usage)
      ? {
          fetchedAt: cache.lastSuccess.fetchedAt,
          usage: cache.lastSuccess.usage,
        }
      : null;
  const rateLimitUntil =
    typeof cache.rateLimitUntil === "number" ? cache.rateLimitUntil : null;

  return {
    version: 1,
    lastSuccess,
    rateLimitUntil,
  };
}

export async function loadCache(): Promise<UsageCache> {
  try {
    const content = await readFile(getCachePath(), "utf8");
    return normalizeCache(JSON.parse(content) as unknown);
  } catch {
    return createEmptyCache();
  }
}

export async function saveCache(cache: UsageCache): Promise<void> {
  const cachePath = getCachePath();
  await mkdir(dirname(cachePath), { recursive: true });
  await writeFile(cachePath, JSON.stringify(cache), "utf8");
}

export function getFreshUsage(
  cache: UsageCache,
  now: number = Date.now(),
): UsageResponse | null {
  if (!cache.lastSuccess) {
    return null;
  }

  if (now - cache.lastSuccess.fetchedAt > SUCCESS_CACHE_TTL_MS) {
    return null;
  }

  return cache.lastSuccess.usage;
}

export function getStaleUsage(
  cache: UsageCache,
  now: number = Date.now(),
): UsageResponse | null {
  if (!cache.lastSuccess) {
    return null;
  }

  if (now - cache.lastSuccess.fetchedAt > STALE_CACHE_TTL_MS) {
    return null;
  }

  return cache.lastSuccess.usage;
}

export function isRateLimitBlocked(
  cache: UsageCache,
  now: number = Date.now(),
): boolean {
  return (
    typeof cache.rateLimitUntil === "number" && cache.rateLimitUntil > now
  );
}

export function withSuccess(
  usage: UsageResponse,
  now: number = Date.now(),
): UsageCache {
  return {
    version: 1,
    lastSuccess: {
      fetchedAt: now,
      usage,
    },
    rateLimitUntil: null,
  };
}

export function withRateLimit(
  cache: UsageCache,
  now: number = Date.now(),
): UsageCache {
  return {
    version: 1,
    lastSuccess: cache.lastSuccess,
    rateLimitUntil: now + RATE_LIMIT_BACKOFF_MS,
  };
}
