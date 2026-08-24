import { isSiteContent } from "../../../lib/content";
import { isAdminRequest } from "../../../lib/admin-auth";
import { readContent, writeContent } from "../../../lib/server-content";

export async function GET() {
  try {
    return Response.json(await readContent());
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to read content" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminRequest())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await request.json();
  if (!isSiteContent(payload)) return Response.json({ error: "Invalid content" }, { status: 400 });
  await writeContent(payload);
  return Response.json({ ok: true });
}
