import { headers } from "next/headers";
import { getChatGPTUser } from "../app/chatgpt-auth";

export async function isAdminRequest() {
  if (await getChatGPTUser()) return true;
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}
