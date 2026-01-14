import { homedir } from "node:os";
import { join } from "node:path";
import type { Credentials } from "./types";

const CREDENTIALS_PATH = join(homedir(), ".claude", ".credentials.json");

/**
 * Claude Code の認証情報からアクセストークンを取得
 */
export async function getAccessToken(): Promise<string> {
  const file = Bun.file(CREDENTIALS_PATH);

  if (!(await file.exists())) {
    throw new Error(
      `認証情報ファイルが見つかりません: ${CREDENTIALS_PATH}\n` +
        "Claude Codeにログインしてください。"
    );
  }

  const credentials: Credentials = await file.json();

  if (!credentials.claudeAiOauth?.accessToken) {
    throw new Error(
      "アクセストークンが見つかりません。再度ログインしてください。"
    );
  }

  return credentials.claudeAiOauth.accessToken;
}
