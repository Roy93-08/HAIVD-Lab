import Link from "next/link";
import type { SiteContent } from "../../lib/content";

export default function ContactClient({ content }: { content: SiteContent }) {
  return <main className="contact-page">
    <header className="site-header"><Link className="brand" href="/"><img className="brand-logo" src={content.lab.logoImage || "/logo-mark.png"} alt="" /><span>{content.lab.name}</span></Link><a className="contact-link" href="/">Back to home ←</a></header>
    <section className="contact-hero"><p className="eyebrow">CONTACT</p><h1>{content.contact.title}</h1><div className="contact-copy"><p>{content.contact.body}</p><div className="contact-details"><small>CONTACT US</small><strong>{content.contact.name || "Dr. Tong Mu"}</strong><a href={`mailto:${content.contact.email}`}>{content.contact.email} <span>↗</span></a></div></div></section>
  </main>;
}
