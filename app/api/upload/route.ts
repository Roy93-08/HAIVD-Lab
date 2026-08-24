import { env } from "cloudflare:workers";
import { isAdminRequest } from "../../../lib/admin-auth";

const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!env.MEDIA) return Response.json({ error: "Media storage unavailable" }, { status: 500 });
  const data = await request.formData();
  const file = data.get("file");
  if (!(file instanceof File) || !allowed.has(file.type)) return Response.json({ error: "Please choose a JPG, PNG, WebP or GIF image" }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return Response.json({ error: "Image must be under 8 MB" }, { status: 400 });
  const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
  const key = `${crypto.randomUUID()}.${extension}`;
  await env.MEDIA.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  return Response.json({ url: `/api/media/${key}` });
}
