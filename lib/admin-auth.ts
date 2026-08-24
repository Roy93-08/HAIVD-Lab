import { headers } from "next/headers";
import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../app/chatgpt-auth";

type AdminEnvironment = { ADMIN_EMAIL?: string };

export type AdminIdentity = {
  email: string;
  displayName: string;
  provider: "cloudflare-access" | "chatgpt" | "local";
};

function configuredAdminEmail() {
  return ((env as unknown as AdminEnvironment).ADMIN_EMAIL ?? "").trim().toLowerCase();
}

export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "";
  const localHost = host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
  if (import.meta.env.DEV && localHost) {
    return { email: "local@haide.test", displayName: "本地管理员", provider: "local" };
  }

  const adminEmail = configuredAdminEmail();
  if (!adminEmail) return null;

  const accessAssertion = requestHeaders.get("cf-access-jwt-assertion");
  const accessEmail = accessAssertion
    ? requestHeaders.get("cf-access-authenticated-user-email")?.trim().toLowerCase()
    : null;
  if (accessEmail === adminEmail) {
    return { email: accessEmail, displayName: accessEmail, provider: "cloudflare-access" };
  }

  const chatGPTUser = await getChatGPTUser();
  if (chatGPTUser?.email.trim().toLowerCase() === adminEmail) {
    return { email: adminEmail, displayName: chatGPTUser.displayName, provider: "chatgpt" };
  }

  return null;
}

export async function isAdminRequest() {
  return Boolean(await getAdminIdentity());
}
