import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = { title: "Contact · Human Intelligence Lab", description: "Contact the lab about research, collaboration, and opportunities to join us." };
export default function ContactPage() { return <ContactClient />; }
