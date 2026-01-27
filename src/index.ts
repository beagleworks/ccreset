#!/usr/bin/env bun

import { getAccessToken } from "./credentials";
import { fetchUsage } from "./api";
import { formatResetTimes, formatOutput, formatFallbackOutput } from "./formatter";

async function main(): Promise<void> {
  try {
    // 1. 認証情報を取得
    const accessToken = await getAccessToken();

    // 2. APIを呼び出し
    const usage = await fetchUsage(accessToken);

    // 3. フォーマットして出力
    const times = formatResetTimes(usage);
    console.log(formatOutput(times));
  } catch {
    console.log(formatFallbackOutput());
  }
}

main();
