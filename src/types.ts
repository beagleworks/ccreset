/**
 * APIレスポンスの型定義
 */
export interface UsageResponse {
  five_hour: UsageLimit;
  seven_day: UsageLimit;
  seven_day_oauth_apps: UsageLimit | null;
  seven_day_opus: UsageLimit | null;
}

export interface UsageLimit {
  /** 使用率（%）。100 - utilization = 残量 */
  utilization: number;
  /** リセット時刻（ISO 8601形式）。nullの場合は制限なし */
  resets_at: string | null;
}

/**
 * 認証情報の型定義
 */
export interface Credentials {
  claudeAiOauth: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    scopes: string[];
    subscriptionType: string;
    rateLimitTier: string;
  };
}

/**
 * フォーマット済みリセット情報
 */
export interface ResetInfo {
  /** 残り時間（フォーマット済み） */
  timeRemaining: string;
  /** 使用量（%） */
  usage: number;
}

export interface ResetTimes {
  fiveHour: ResetInfo;
  sevenDay: ResetInfo;
}
