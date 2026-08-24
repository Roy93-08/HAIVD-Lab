import { headers } from "next/headers";
import { getChatGPTUser, requireChatGPTUser } from "../chatgpt-auth";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "";
  const local = host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
  const user = await getChatGPTUser();
  if (!user && !local) await requireChatGPTUser("/admin");
  return <AdminClient userName={user?.displayName ?? "本地管理员"} />;
}
