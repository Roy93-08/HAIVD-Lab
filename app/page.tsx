import LabSite from "./LabSite";
import { defaultContent } from "../lib/content";
import { readContent } from "../lib/server-content";

export default async function Home() {
  const initialContent = await readContent().catch(() => defaultContent);
  return <LabSite initialContent={initialContent} />;
}
