import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = { title: "Contact · HAIDE Lab", description: "Contact HAIDE Lab about research, collaboration, and opportunities to join us." };
export default function ContactPage() { return <ContactClient />; }
