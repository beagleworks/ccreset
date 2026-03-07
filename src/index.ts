import { getAccessToken } from "./credentials.js";
import { fetchUsage } from "./api.js";
import {
  formatResetTimes,
  formatOutput,
  formatFallbackOutput,
} from "./formatter.js";

interface RunDependencies {
  getAccessTokenFn?: typeof getAccessToken;
  fetchUsageFn?: typeof fetchUsage;
  log?: (message: string) => void;
}

export async function run({
  getAccessTokenFn = getAccessToken,
  fetchUsageFn = fetchUsage,
  log = console.log,
}: RunDependencies = {}): Promise<void> {
  try {
    // 1. 認証情報を取得
    const accessToken = await getAccessTokenFn();

    // 2. APIを呼び出し
    const usage = await fetchUsageFn(accessToken);

    // 3. フォーマットして出力
    const times = formatResetTimes(usage);
    log(formatOutput(times));
  } catch {
    log(formatFallbackOutput());
  }
}
