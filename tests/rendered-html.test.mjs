import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the public research lab homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="en">/i);
  assert.match(html, /<title>Human Intelligence Lab<\/title>/i);
  assert.match(html, /alt="About the lab"/);
  assert.match(html, /We design how people live, learn, and create with intelligent systems/);
  assert.match(html, />NEWS</);
  assert.match(html, />PROJECTS</);
  assert.match(html, /Human–AI Co-Creation Tools/);
  assert.match(html, /og:image/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("includes the editable content system, administrator protection, and storage bindings", async () => {
  const [admin, contentRoute, uploadRoute, adminAuth, hosting, schema] = await Promise.all([
    readFile(new URL("../app/admin/AdminClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/content/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/upload/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/admin-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
  ]);
  assert.match(admin, /实验室介绍/);
  assert.match(admin, /添加新闻/);
  assert.match(admin, /添加项目/);
  assert.match(admin, /保存这条新闻/);
  assert.match(admin, /保存这个项目/);
  assert.match(admin, /确认删除/);
  assert.match(contentRoute, /export async function PUT/);
  assert.match(contentRoute, /isAdminRequest/);
  assert.match(uploadRoute, /isAdminRequest/);
  assert.match(adminAuth, /ADMIN_EMAIL/);
  assert.match(adminAuth, /cf-access-jwt-assertion/);
  assert.match(adminAuth, /cf-access-authenticated-user-email/);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(hosting, /"r2": "MEDIA"/);
  assert.match(schema, /site_content/);
});
