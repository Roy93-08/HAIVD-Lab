import { defaultContent, isSiteContent, migrateLegacyContent, type SiteContent } from "./content";

const schemaSql = `CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY NOT NULL,
  value_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
)`;

export async function ensureContentStore() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new Error("Content database is unavailable");
  await env.DB.prepare(schemaSql).run();
}

export async function readContent(): Promise<SiteContent> {
  await ensureContentStore();
  const { env } = await import("cloudflare:workers");
  const row = await env.DB.prepare("SELECT value_json FROM site_content WHERE key = ?")
    .bind("main")
    .first<{ value_json: string }>();
  if (!row) {
    await writeContent(defaultContent);
    return defaultContent;
  }
  try {
    const parsed = JSON.parse(row.value_json);
    if (!isSiteContent(parsed)) return defaultContent;
    const migrated = migrateLegacyContent(parsed);
    if (JSON.stringify(migrated) !== JSON.stringify(parsed)) await writeContent(migrated);
    return migrated;
  } catch {
    return defaultContent;
  }
}

export async function writeContent(content: SiteContent) {
  await ensureContentStore();
  const { env } = await import("cloudflare:workers");
  await env.DB.prepare(`INSERT INTO site_content (key, value_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at`)
    .bind("main", JSON.stringify(content), Date.now())
    .run();
}
