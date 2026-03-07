import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const credentialsModuleUrl = pathToFileURL(
  resolve("dist/credentials.js"),
).href;

async function loadCredentialsModule(homeDir) {
  const originalHome = process.env.HOME;
  process.env.HOME = homeDir;

  try {
    return await import(
      `${credentialsModuleUrl}?home=${encodeURIComponent(homeDir)}&ts=${Date.now()}`,
    );
  } finally {
    process.env.HOME = originalHome;
  }
}

test("getAccessToken returns the trimmed access token from Claude credentials", async () => {
  const homeDir = await mkdtemp(join(tmpdir(), "ccreset-home-"));
  const claudeDir = join(homeDir, ".claude");

  await mkdir(claudeDir, { recursive: true });
  await writeFile(
    join(claudeDir, ".credentials.json"),
    JSON.stringify({
      claudeAiOauth: {
        accessToken: "  test-access-token  ",
      },
    }),
    "utf8",
  );

  const { getAccessToken } = await loadCredentialsModule(homeDir);
  const token = await getAccessToken();

  assert.equal(token, "test-access-token");
});

test("getAccessToken throws a helpful error when the credentials file is missing", async () => {
  const homeDir = await mkdtemp(join(tmpdir(), "ccreset-home-"));
  const { getAccessToken } = await loadCredentialsModule(homeDir);

  await assert.rejects(
    getAccessToken(),
    /認証情報ファイルが見つかりません/,
  );
});

test("getAccessToken throws when the access token is empty", async () => {
  const homeDir = await mkdtemp(join(tmpdir(), "ccreset-home-"));
  const claudeDir = join(homeDir, ".claude");

  await mkdir(claudeDir, { recursive: true });
  await writeFile(
    join(claudeDir, ".credentials.json"),
    JSON.stringify({
      claudeAiOauth: {
        accessToken: "   ",
      },
    }),
    "utf8",
  );

  const { getAccessToken } = await loadCredentialsModule(homeDir);

  await assert.rejects(
    getAccessToken(),
    /アクセストークンが見つかりません。再度ログインしてください。/,
  );
});
