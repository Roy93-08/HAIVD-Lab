"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { defaultContent, sortNewsByDate, type NewsItem, type ProjectContentBlock, type ProjectItem, type SiteContent } from "../../lib/content";

type Tab = "lab" | "news" | "projects" | "contact";
type DeleteTarget = { type: "news" | "project"; id: string; title: string };
type ItemNotice = { id: string; state: "saving" | "success" | "error"; message: string };
const tabs: { id: Tab; label: string }[] = [{ id: "lab", label: "实验室介绍" }, { id: "news", label: "新闻" }, { id: "projects", label: "研究项目" }, { id: "contact", label: "联系我们" }];
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

function upsertItem<T extends { id: string }>(items: T[], item: T, position: "start" | "end") {
  const exists = items.some((entry) => entry.id === item.id);
  if (exists) return items.map((entry) => entry.id === item.id ? item : entry);
  return position === "start" ? [item, ...items] : [...items, item];
}

async function publishContent(content: SiteContent) {
  return fetch("/admin/api/content", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(content) });
}

const MAX_SOURCE_IMAGE_BYTES = 25 * 1024 * 1024;
const TARGET_UPLOAD_BYTES = 850 * 1024;

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("图片处理失败，请换一张图片重试")), type, quality));
}

async function prepareImageUpload(file: File) {
  if (file.size > MAX_SOURCE_IMAGE_BYTES) throw new Error("原始图片不能超过 25 MB");
  if (file.size <= TARGET_UPLOAD_BYTES) return file;
  if (file.type === "image/gif") throw new Error("GIF 图片需要小于 850 KB；较大的 GIF 请先压缩后上传");

  const image = new Image();
  const objectUrl = URL.createObjectURL(file);
  try {
    await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("无法读取这张图片")); image.src = objectUrl; });
    let width = image.naturalWidth;
    let height = image.naturalHeight;
    const initialScale = Math.min(1, 2400 / Math.max(width, height));
    width = Math.max(1, Math.round(width * initialScale));
    height = Math.max(1, Math.round(height * initialScale));

    for (let scale = 1; scale >= .45; scale -= .12) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("当前浏览器无法处理图片");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [.86, .74, .62, .52]) {
        const blob = await canvasBlob(canvas, "image/webp", quality);
        if (blob.size <= TARGET_UPLOAD_BYTES) return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
      }
    }
    throw new Error("图片压缩后仍然过大，请缩小尺寸后重试");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function uploadImage(file: File) {
  const preparedFile = await prepareImageUpload(file);
  const data = new FormData(); data.append("file", preparedFile);
  const response = await fetch("/admin/api/upload", { method: "POST", body: data });
  const responseText = await response.text();
  let result: { error?: string; url?: string } = {};
  try { result = responseText ? JSON.parse(responseText) : {}; } catch { /* Some gateways return plain text for request-size errors. */ }
  if (!response.ok) {
    if (response.status === 413) throw new Error("图片文件过大，请压缩或缩小尺寸后重试");
    throw new Error(result.error || responseText || "图片上传失败");
  }
  if (!result.url) throw new Error("上传完成，但没有收到图片地址，请重试");
  return result.url as string;
}

function Field({ label, value, onChange, multiline = false, hint }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; hint?: string }) {
  return <label className="admin-field"><span>{label}</span>{hint && <small>{hint}</small>}{multiline ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={5} /> : <input value={value} onChange={(e) => onChange(e.target.value)} />}</label>;
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  return <div className="admin-field"><span>{label}</span><div className="image-field">{value && <img src={value} alt="当前图片" />}<div><input value={value} onChange={(e) => onChange(e.target.value)} placeholder="图片网址或上传图片" /><label className="upload-button">{busy ? "上传中…" : "上传图片"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; setBusy(true); try { onChange(await uploadImage(file)); } catch (error) { alert(error instanceof Error ? error.message : "上传失败"); } finally { setBusy(false); } }} /></label></div></div></div>;
}

function HeroImageDisplay({ image, fit, position, onFit, onPosition }: { image: string; fit: "contain" | "cover"; position: "center" | "top" | "bottom" | "left" | "right"; onFit: (v: "contain" | "cover") => void; onPosition: (v: "center" | "top" | "bottom" | "left" | "right") => void }) {
  return <div className="hero-image-settings"><div className="form-grid two"><label className="admin-field"><span>主图显示方式</span><small>“完整显示”保留整张图片；“填满裁剪”会充满画框。</small><select value={fit} onChange={(e) => onFit(e.target.value as "contain" | "cover")}><option value="contain">完整显示（推荐）</option><option value="cover">填满画框并裁剪</option></select></label><label className="admin-field"><span>裁剪焦点</span><small>仅在“填满裁剪”时生效。</small><select value={position} onChange={(e) => onPosition(e.target.value as "center" | "top" | "bottom" | "left" | "right")}><option value="center">居中</option><option value="top">顶部</option><option value="bottom">底部</option><option value="left">左侧</option><option value="right">右侧</option></select></label></div><div><p className="preview-label">网站主图实时预览</p><div className="hero-crop-preview"><img src={image} alt="主图预览" style={{ objectFit: fit, objectPosition: position }} /></div><small className="upload-note">支持 JPG、PNG、WebP、GIF；较大的照片会在浏览器中自动优化后上传，原始图片最大 25MB。建议长边不少于 1200px。</small></div></div>;
}

function editableProjectBlocks(project: ProjectItem): ProjectContentBlock[] {
  if (project.contentBlocks?.length) return project.contentBlocks;
  return [{ id: `${project.id}-legacy-body`, type: "text", text: project.body }];
}

function ProjectContentEditor({ project, onChange }: { project: ProjectItem; onChange: (patch: Partial<ProjectItem>) => void }) {
  const blocks = editableProjectBlocks(project);
  const commit = (next: ProjectContentBlock[]) => onChange({ contentBlocks: next, body: next.filter((block) => block.type === "text").map((block) => block.text).join("\n\n") });
  const patchBlock = (id: string, patch: Partial<ProjectContentBlock>) => commit(blocks.map((block) => block.id === id ? { ...block, ...patch } as ProjectContentBlock : block));
  const moveBlock = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  };
  return <section className="rich-editor">
    <div className="rich-editor-heading"><div><strong>项目图文正文</strong><small>按展示顺序添加文字与图片；现有纯文字内容已自动保留。</small></div><div><button className="secondary-button" type="button" onClick={() => commit([...blocks, { id: uid("text"), type: "text", text: "" }])}>＋ 文字</button><button className="secondary-button" type="button" onClick={() => commit([...blocks, { id: uid("image"), type: "image", url: "", caption: "", alt: "" }])}>＋ 图片</button></div></div>
    <div className="rich-block-list">{blocks.map((block, index) => <div className="rich-block" key={block.id}>
      <div className="rich-block-toolbar"><span>{block.type === "text" ? `文字 ${index + 1}` : `图片 ${index + 1}`}</span><div><button type="button" disabled={index === 0} onClick={() => moveBlock(index, -1)} aria-label="上移">↑</button><button type="button" disabled={index === blocks.length - 1} onClick={() => moveBlock(index, 1)} aria-label="下移">↓</button><button className="danger-button" type="button" onClick={() => commit(blocks.filter((item) => item.id !== block.id))}>删除</button></div></div>
      {block.type === "text" ? <textarea value={block.text} rows={7} placeholder="输入正文段落…" onChange={(event) => patchBlock(block.id, { text: event.target.value })} /> : <ProjectContentImageBlock block={block} onChange={(patch) => patchBlock(block.id, patch)} />}
    </div>)}</div>
  </section>;
}

function ProjectContentImageBlock({ block, onChange }: { block: Extract<ProjectContentBlock, { type: "image" }>; onChange: (patch: Partial<ProjectContentBlock>) => void }) {
  const [busy, setBusy] = useState(false);
  return <div className="rich-image-block">{block.url ? <img src={block.url} alt="正文图片预览" /> : <div className="rich-image-placeholder">尚未上传图片</div>}<div className="rich-image-fields"><input value={block.url} placeholder="图片网址或上传图片" onChange={(event) => onChange({ url: event.target.value })} /><input value={block.caption} placeholder="图片说明（可选）" onChange={(event) => onChange({ caption: event.target.value })} /><input value={block.alt} placeholder="无障碍替代文字（可选）" onChange={(event) => onChange({ alt: event.target.value })} /><label className="upload-button">{busy ? "上传中…" : "上传正文图片"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setBusy(true); try { onChange({ url: await uploadImage(file), alt: block.alt || file.name.replace(/\.[^.]+$/, "") }); } catch (error) { alert(error instanceof Error ? error.message : "上传失败"); } finally { setBusy(false); } }} /></label></div></div>;
}

export default function AdminClient({ userName }: { userName: string }) {
  const [tab, setTab] = useState<Tab>("lab");
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [itemSaving, setItemSaving] = useState<string | null>(null);
  const [itemNotice, setItemNotice] = useState<ItemNotice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => { fetch("/admin/api/content").then((r) => r.json()).then(setContent).finally(() => setLoading(false)); }, []);
  const patchLab = (key: keyof SiteContent["lab"], value: string) => setContent((c) => ({ ...c, lab: { ...c.lab, [key]: value } }));
  const patchContact = (key: keyof SiteContent["contact"], value: string) => setContent((c) => ({ ...c, contact: { ...c.contact, [key]: value } }));
  const patchNews = (id: string, patch: Partial<NewsItem>) => { setItemNotice((value) => value?.id === id ? null : value); setContent((c) => ({ ...c, news: c.news.map((item) => item.id === id ? { ...item, ...patch } : item) })); };
  const patchProject = (id: string, patch: Partial<ProjectItem>) => { setItemNotice((value) => value?.id === id ? null : value); setContent((c) => ({ ...c, projects: c.projects.map((item) => item.id === id ? { ...item, ...patch } : item) })); };
  const save = async () => { setSaving(true); setNotice(""); const response = await publishContent(content); setSaving(false); setNotice(response.ok ? "所有更改已发布" : "保存失败，请稍后重试"); };
  const saveItem = async (type: "news" | "project", id: string) => {
    setItemSaving(id); setItemNotice({ id, state: "saving", message: "正在保存…" }); setNotice("");
    try {
      const currentResponse = await fetch("/admin/api/content");
      if (!currentResponse.ok) throw new Error();
      const current = await currentResponse.json() as SiteContent;
      const next = type === "news"
        ? { ...current, news: upsertItem(current.news, content.news.find((item) => item.id === id)!, "start") }
        : { ...current, projects: upsertItem(current.projects, content.projects.find((item) => item.id === id)!, "end") };
      const response = await publishContent(next);
      if (!response.ok) throw new Error();
      const message = type === "news" ? "这条新闻已发布" : "这个项目已发布";
      setItemNotice({ id, state: "success", message }); setNotice(message);
    } catch {
      setItemNotice({ id, state: "error", message: "保存失败，请重试" }); setNotice("保存失败，请稍后重试");
    } finally {
      setItemSaving(null);
    }
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setItemSaving(deleteTarget.id); setNotice("");
    try {
      const currentResponse = await fetch("/admin/api/content");
      if (!currentResponse.ok) throw new Error();
      const current = await currentResponse.json() as SiteContent;
      const next = deleteTarget.type === "news"
        ? { ...current, news: current.news.filter((item) => item.id !== deleteTarget.id) }
        : { ...current, projects: current.projects.filter((item) => item.id !== deleteTarget.id) };
      const response = await publishContent(next);
      if (!response.ok) throw new Error();
      setContent((value) => deleteTarget.type === "news"
        ? { ...value, news: value.news.filter((item) => item.id !== deleteTarget.id) }
        : { ...value, projects: value.projects.filter((item) => item.id !== deleteTarget.id) });
      setNotice(deleteTarget.type === "news" ? "新闻已删除" : "项目已删除");
      setDeleteTarget(null);
    } catch {
      setNotice("删除失败，内容仍已保留");
    } finally {
      setItemSaving(null);
    }
  };

  return <main className="admin-shell">
    <aside className="admin-sidebar"><Link className="admin-brand" href="/"><img className="brand-logo" src={content.lab.logoImage || "/logo-mark.png"} alt="" /><span>内容管理</span></Link><nav>{tabs.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>{item.label}<span>→</span></button>)}</nav><div className="admin-account"><small>当前管理员</small><p>{userName}</p><Link href="/">查看网站 ↗</Link></div></aside>
    <section className="admin-main"><header className="admin-topbar"><div><p className="eyebrow">CONTENT MANAGEMENT</p><h1>{tabs.find((item) => item.id === tab)?.label}</h1></div><div className="save-area">{notice && <span>{notice}</span>}<button className="primary-button" onClick={save} disabled={saving || loading}>{saving ? "保存中…" : "保存并发布"}</button></div></header>
      {loading ? <p className="loading-copy">正在读取内容…</p> : <div className="admin-content">
        {tab === "lab" && <div className="form-panel"><div className="form-grid"><Field label="实验室名称" value={content.lab.name} onChange={(v) => patchLab("name", v)} /><ImageField label="实验室 Logo" value={content.lab.logoImage || "/logo-mark.png"} onChange={(v) => patchLab("logoImage", v)} /><Field label="研究方向标签" value={content.lab.kicker} onChange={(v) => patchLab("kicker", v)} /><Field label="首页大标题" value={content.lab.headline} onChange={(v) => patchLab("headline", v)} multiline /><Field label="介绍正文" value={content.lab.description} onChange={(v) => patchLab("description", v)} multiline hint="建议控制在 100–180 字，支持自然分段。" /><ImageField label="介绍图片" value={content.lab.image} onChange={(v) => patchLab("image", v)} /><HeroImageDisplay image={content.lab.image} fit={content.lab.imageFit || "contain"} position={content.lab.imagePosition || "center"} onFit={(v) => patchLab("imageFit", v)} onPosition={(v) => patchLab("imagePosition", v)} /></div></div>}
        {tab === "news" && <div className="editor-list">
          <div className="editor-intro"><p>首页只展示日期最新的 4 条新闻，其余内容会保留在后台。</p><button className="secondary-button" onClick={() => setContent((c) => ({ ...c, news: [{ id: uid("news"), title: "新新闻标题", date: new Date().toISOString().slice(0,10), people: "", body: "" }, ...c.news] }))}>＋ 添加新闻</button></div>
          {sortNewsByDate(content.news).map((item, index) => <details className="editor-card" key={item.id} open={index === 0}>
            <summary><div><small>{item.date}</small><strong>{item.title}</strong></div><span>编辑</span></summary>
            <div className="editor-card-body">
              <div className="form-grid two"><Field label="标题" value={item.title} onChange={(v) => patchNews(item.id, { title: v })} /><Field label="日期" value={item.date} onChange={(v) => patchNews(item.id, { date: v })} /><Field label="相关者姓名" value={item.people} onChange={(v) => patchNews(item.id, { people: v })} /></div>
              <Field label="正文" value={item.body} onChange={(v) => patchNews(item.id, { body: v })} multiline hint="初版采用简洁的分段正文，而不是复杂图文编辑器，内容更统一，也更易维护。" />
              <div className="editor-actions"><div className="item-save-area"><button className="primary-button" disabled={itemSaving === item.id} onClick={() => saveItem("news", item.id)}>{itemSaving === item.id ? "保存中…" : itemNotice?.id === item.id && itemNotice.state === "success" ? "已保存 ✓" : "保存这条新闻"}</button>{itemNotice?.id === item.id && <span className={`item-save-notice ${itemNotice.state}`} role="status">{itemNotice.message}</span>}</div><button className="danger-button" onClick={() => setDeleteTarget({ type: "news", id: item.id, title: item.title })}>删除这条新闻</button></div>
            </div>
          </details>)}
        </div>}
        {tab === "projects" && <div className="editor-list">
          <div className="editor-intro"><p>项目会按当前顺序在前台每排四张展示，可持续向下增加。</p><button className="secondary-button" onClick={() => setContent((c) => ({ ...c, projects: [...c.projects, { id: uid("project"), title: "新研究项目", date: new Date().toISOString().slice(0,10), image: "", summary: "", body: "", contentBlocks: [], people: "", profileImage: "", status: "进行中", paperLinks: [] }] }))}>＋ 添加项目</button></div>
          {content.projects.map((item, index) => <details className="editor-card" key={item.id} open={index === 0}>
            <summary><div><small>{item.status} · {item.date}</small><strong>{item.title}</strong></div><span>编辑</span></summary>
            <div className="editor-card-body">
              <div className="form-grid two"><Field label="标题" value={item.title} onChange={(v) => patchProject(item.id, { title: v })} /><Field label="日期" value={item.date} onChange={(v) => patchProject(item.id, { date: v })} /><label className="admin-field"><span>状态</span><select value={item.status} onChange={(e) => patchProject(item.id, { status: e.target.value as ProjectItem["status"] })}><option>进行中</option><option>已完成</option></select></label><Field label="相关者姓名" value={item.people} onChange={(v) => patchProject(item.id, { people: v })} /></div>
              <div className="form-grid two"><ImageField label="项目首图" value={item.image} onChange={(v) => patchProject(item.id, { image: v })} /><ImageField label="本人照片" value={item.profileImage} onChange={(v) => patchProject(item.id, { profileImage: v })} /></div>
              <Field label="卡片内容简述" value={item.summary} onChange={(v) => patchProject(item.id, { summary: v })} multiline />
              <ProjectContentEditor project={item} onChange={(patch) => patchProject(item.id, patch)} />
              <Field label="论文 / 研究成果链接" value={item.paperLinks.map((l) => `${l.label} | ${l.url}`).join("\n")} onChange={(v) => patchProject(item.id, { paperLinks: v.split("\n").map((line) => { const [label, url] = line.split("|").map((part) => part.trim()); return { label, url }; }).filter((l) => l.label && l.url) })} multiline hint="每行一个，格式：链接名称 | https://...；为空时前台不显示“研究成果”。" />
              <div className="editor-actions"><div className="item-save-area"><button className="primary-button" disabled={itemSaving === item.id} onClick={() => saveItem("project", item.id)}>{itemSaving === item.id ? "保存中…" : itemNotice?.id === item.id && itemNotice.state === "success" ? "已保存 ✓" : "保存这个项目"}</button>{itemNotice?.id === item.id && <span className={`item-save-notice ${itemNotice.state}`} role="status">{itemNotice.message}</span>}</div><button className="danger-button" onClick={() => setDeleteTarget({ type: "project", id: item.id, title: item.title })}>删除这个项目</button></div>
            </div>
          </details>)}
        </div>}
        {tab === "contact" && <div className="form-panel"><div className="form-grid"><Field label="页面大标题" value={content.contact.title} onChange={(v) => patchContact("title", v)} multiline /><Field label="联系说明" value={content.contact.body} onChange={(v) => patchContact("body", v)} multiline /><Field label="联系人姓名" value={content.contact.name || "Dr. Tong Mu"} onChange={(v) => patchContact("name", v)} /><Field label="联系邮箱" value={content.contact.email} onChange={(v) => patchContact("email", v)} /></div></div>}
      </div>}
    </section>
    {deleteTarget && <div className="admin-confirm-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !itemSaving && setDeleteTarget(null)}>
      <section className="admin-confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="delete-confirm-title" aria-describedby="delete-confirm-description">
        <p className="eyebrow">安全确认</p>
        <h2 id="delete-confirm-title">确认删除{deleteTarget.type === "news" ? "这条新闻" : "这个项目"}？</h2>
        <p id="delete-confirm-description">“{deleteTarget.title}”将从网站和后台中删除。此操作无法撤销。</p>
        <div className="admin-confirm-actions"><button className="secondary-button" disabled={Boolean(itemSaving)} onClick={() => setDeleteTarget(null)}>取消</button><button className="confirm-danger-button" disabled={Boolean(itemSaving)} onClick={confirmDelete}>{itemSaving ? "正在删除…" : "确认删除"}</button></div>
      </section>
    </div>}
  </main>;
}
