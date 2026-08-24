"use client";

import { useEffect, useState } from "react";
import { sortNewsByDate, type NewsItem, type ProjectContentBlock, type ProjectItem, type SiteContent } from "../lib/content";

type ModalState = { type: "news"; item: NewsItem } | { type: "project"; item: ProjectItem } | null;

function formatDate(date: string) {
  return date.replaceAll("-", ".");
}

function statusLabel(status: ProjectItem["status"]) {
  return status === "已完成" ? "COMPLETED" : "ONGOING";
}

function projectContentBlocks(project: ProjectItem): ProjectContentBlock[] {
  if (project.contentBlocks?.length) return project.contentBlocks;
  return project.body ? [{ id: `${project.id}-legacy-body`, type: "text", text: project.body }] : [];
}

function ProjectContent({ project }: { project: ProjectItem }) {
  return <div className="project-content">{projectContentBlocks(project).map((block) => block.type === "image" ? (
    block.url && <figure className="project-content-image" key={block.id}><img src={block.url} alt={block.alt || block.caption || "Project image"} />{block.caption && <figcaption>{block.caption}</figcaption>}</figure>
  ) : (
    block.text && <p key={block.id}>{block.text}</p>
  ))}</div>;
}

export default function LabSite({ initialContent }: { initialContent: SiteContent }) {
  const [content] = useState<SiteContent>(initialContent);
  const [modal, setModal] = useState<ModalState>(null);

  useEffect(() => {
    if (!modal) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setModal(null);
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", close); document.body.style.overflow = ""; };
  }, [modal]);

  return (
    <main className="public-site">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Lab home"><img className="brand-logo" src={content.lab.logoImage || "/logo-mark.png"} alt="" /><span>{content.lab.name}</span></a>
        <nav className="header-nav" aria-label="Main navigation"><a href="#projects">Projects</a><a className="contact-link" href="/contact">Contact <span aria-hidden="true">↗</span></a></nav>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">{content.lab.kicker}</p>
        <div className="hero-layout">
          <img className="hero-image" src={content.lab.image} alt="About the lab" style={{ objectFit: "contain", objectPosition: "left center" }} />
          <div className="hero-copy">
            <h1>{content.lab.headline}</h1>
            <p className="hero-description">{content.lab.description}</p>
          </div>
        </div>
      </section>

      <section className="section news-section">
        <div className="section-heading"><h2>NEWS</h2></div>
        <div className="news-list">{sortNewsByDate(content.news).slice(0, 4).map((item) => (
          <button className="news-row" key={item.id} type="button" onClick={() => setModal({ type: "news", item })}>
            <time>{formatDate(item.date)}</time><span>{item.title}</span><span aria-hidden="true">↗</span>
          </button>
        ))}</div>
      </section>

      <section className="section projects-section" id="projects">
        <div className="section-heading projects-heading"><h2>PROJECTS</h2></div>
        <div className="project-grid">{content.projects.map((project) => (
          <button className="project-card" key={project.id} type="button" onClick={() => setModal({ type: "project", item: project })}>
            <img src={project.image} alt="" />
            <div className="project-card-body"><h3>{project.title}</h3><span className={`status project-card-status ${project.status === "已完成" ? "complete" : ""}`}>{statusLabel(project.status)}</span><p>{project.summary}</p><span className="people-line">{project.people}</span></div>
          </button>
        ))}</div>
      </section>

      {modal && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setModal(null)}>
        <article className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <button className="modal-close" type="button" onClick={() => setModal(null)} aria-label="Close dialog">×</button>
          {modal.type === "news" ? <>
            <p className="modal-kicker">NEWS · {formatDate(modal.item.date)}</p><h2 id="modal-title">{modal.item.title}</h2><p className="modal-people">People: {modal.item.people}</p><div className="modal-body">{modal.item.body}</div>
          </> : <>
            <img className="modal-cover" src={modal.item.image} alt="" />
            <div className="modal-meta"><span>{formatDate(modal.item.date)}</span><span className={`status ${modal.item.status === "已完成" ? "complete" : ""}`}>{statusLabel(modal.item.status)}</span></div>
            <h2 id="modal-title">{modal.item.title}</h2>
            <div className="person-block"><img src={modal.item.profileImage} alt="Project researcher" /><div><small>People</small><p>{modal.item.people}</p></div></div>
            <ProjectContent project={modal.item} />
            {modal.item.paperLinks.length > 0 && <div className="research-links"><p>PUBLICATIONS</p>{modal.item.paperLinks.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label} <span>↗</span></a>)}</div>}
          </>}
        </article>
      </div>}
    </main>
  );
}
