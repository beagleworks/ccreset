import type { UsageResponse, ResetTimes, ResetInfo } from "./types";

/**
 * ミリ秒を人間が読める形式に変換
 * 例: 9000000 -> "2h30m"
 */
function formatDuration(ms: number): string {
  if (ms <= 0) return "0m";

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
    if (remainingHours > 0) {
      parts.push(`${remainingHours}h`);
    }
  } else if (hours > 0) {
    parts.push(`${hours}h`);
    if (remainingMinutes > 0) {
      parts.push(`${remainingMinutes}m`);
    }
  } else {
    parts.push(`${remainingMinutes}m`);
  }

  return parts.join("");
}

/**
 * リセット時刻から残り時間を計算してフォーマット
 */
function getTimeRemaining(resetAt: string | null): string {
  if (!resetAt) {
    return "-";
  }

  const resetTime = new Date(resetAt).getTime();
  const now = Date.now();
  const remaining = resetTime - now;

  if (remaining <= 0) {
    return "reset!";
  }

  return formatDuration(remaining);
}

/**
 * 使用率を取得
 */
function getUsagePercentage(utilization: number): number {
  return Math.round(utilization);
}

/**
 * APIレスポンスをフォーマット済み構造に変換
 */
export function formatResetTimes(usageResponse: UsageResponse): ResetTimes {
  return {
    fiveHour: {
      timeRemaining: getTimeRemaining(usageResponse.five_hour.resets_at),
      usage: getUsagePercentage(usageResponse.five_hour.utilization),
    },
    sevenDay: {
      timeRemaining: getTimeRemaining(usageResponse.seven_day.resets_at),
      usage: getUsagePercentage(usageResponse.seven_day.utilization),
    },
  };
}

/**
 * 最終出力形式に整形
 * 例: "5h:2h30m(16%) | 7d:3d12h(7%)"
 */
export function formatOutput(times: ResetTimes): string {
  const fiveHour = `5h:${times.fiveHour.timeRemaining}(${times.fiveHour.usage}%)`;
  const sevenDay = `7d:${times.sevenDay.timeRemaining}(${times.sevenDay.usage}%)`;
  return `${fiveHour} | ${sevenDay}`;
}

/**
 * エラー時のフォールバック出力を生成
 */
export function formatFallbackOutput(): string {
  return "5h:--(-%) | 7d:--(-%)";
}
