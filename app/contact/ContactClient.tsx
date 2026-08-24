"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { defaultContent, type SiteContent } from "../../lib/content";

export default function ContactClient() {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  useEffect(() => { fetch("/api/content").then((r) => r.ok ? r.json() : Promise.reject()).then(setContent).catch(() => undefined); }, []);
  return <main className="contact-page">
    <header className="site-header"><Link className="brand" href="/"><img className="brand-logo" src={content.lab.logoImage || "/logo-mark.png"} alt="" /><span>{content.lab.name}</span></Link><Link className="contact-link" href="/">Back home ←</Link></header>
    <section className="contact-hero"><p className="eyebrow">CONTACT</p><h1>{content.contact.title}</h1><div className="contact-copy"><p>{content.contact.body}</p><a href={`mailto:${content.contact.email}`}>{content.contact.email} <span>↗</span></a></div></section>
  </main>;
}
