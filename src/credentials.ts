import { homedir } from "node:os";
import { join } from "node:path";
import { readFile } from "node:fs/promises";
import type { Credentials } from "./types.js";

const CREDENTIALS_PATH = join(homedir(), ".claude", ".credentials.json");

/**
 * Claude Code の認証情報からアクセストークンを取得
 */
export async function getAccessToken(): Promise<string> {
  let content: string;
  try {
    content = await readFile(CREDENTIALS_PATH, "utf-8");
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(
        `認証情報ファイルが見つかりません: ${CREDENTIALS_PATH}\n` +
          "Claude Codeにログインしてください。"
      );
    }
    throw error;
  }

  const credentials: Credentials = JSON.parse(content) as Credentials;

  const accessToken = credentials.claudeAiOauth?.accessToken?.trim();
  if (!accessToken) {
    throw new Error(
      "アクセストークンが見つかりません。再度ログインしてください。"
    );
  }

  return accessToken;
}
