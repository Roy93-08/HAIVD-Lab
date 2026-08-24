import { getAdminIdentity } from "../../lib/admin-auth";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await getAdminIdentity();
  if (!admin) {
    return <main className="admin-access-denied"><div><p className="eyebrow">ADMIN ACCESS</p><h1>Access restricted</h1><p>Please sign in through the laboratory&apos;s Cloudflare Access page with the authorized administrator email.</p><a href="/">Return to website</a></div></main>;
  }
  return <AdminClient userName={admin.displayName} />;
}
