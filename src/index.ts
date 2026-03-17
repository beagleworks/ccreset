import { getAccessToken } from "./credentials.js";
import { fetchUsage, isUsageApiError } from "./api.js";
import {
  getFreshUsage,
  getStaleUsage,
  isRateLimitBlocked,
  loadCache,
  saveCache,
  withRateLimit,
  withSuccess,
} from "./cache.js";
import {
  formatResetTimes,
  formatOutput,
  formatFallbackOutput,
  formatRateLimitOutput,
} from "./formatter.js";
import type { UsageCache } from "./types.js";

interface RunDependencies {
  getAccessTokenFn?: typeof getAccessToken;
  fetchUsageFn?: typeof fetchUsage;
  loadCacheFn?: typeof loadCache;
  saveCacheFn?: typeof saveCache;
  log?: (message: string) => void;
}

async function persistCache(
  saveCacheFn: typeof saveCache,
  cache: UsageCache,
): Promise<void> {
  try {
    await saveCacheFn(cache);
  } catch {
    // キャッシュ保存の失敗で本来の表示を壊さない
  }
}

export async function run({
  getAccessTokenFn = getAccessToken,
  fetchUsageFn = fetchUsage,
  loadCacheFn = loadCache,
  saveCacheFn = saveCache,
  log = console.log,
}: RunDependencies = {}): Promise<void> {
  const cache = await loadCacheFn();
  const freshUsage = getFreshUsage(cache);

  if (freshUsage) {
    log(formatOutput(formatResetTimes(freshUsage)));
    return;
  }

  if (isRateLimitBlocked(cache)) {
    log(formatRateLimitOutput());
    return;
  }

  try {
    // 1. 認証情報を取得
    const accessToken = await getAccessTokenFn();

    // 2. APIを呼び出し
    const usage = await fetchUsageFn(accessToken);
    await persistCache(saveCacheFn, withSuccess(usage));

    // 3. フォーマットして出力
    const times = formatResetTimes(usage);
    log(formatOutput(times));
  } catch (error) {
    if (isUsageApiError(error) && error.status === 429) {
      await persistCache(saveCacheFn, withRateLimit(cache));
      log(formatRateLimitOutput());
      return;
    }

    const staleUsage = getStaleUsage(cache);
    if (staleUsage) {
      log(formatOutput(formatResetTimes(staleUsage)));
      return;
    }

    log(formatFallbackOutput());
  }
}
