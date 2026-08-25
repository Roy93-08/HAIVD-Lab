import type { Metadata } from "next";
import ContactClient from "./ContactClient";
import { defaultContent } from "../../lib/content";
import { readContent } from "../../lib/server-content";

export const metadata: Metadata = { title: "Contact · HAIDE Lab", description: "Contact HAIDE Lab about research, collaboration, and opportunities to join us." };
export default async function ContactPage() {
  const initialContent = await readContent().catch(() => defaultContent);
  return <ContactClient content={initialContent} />;
}
