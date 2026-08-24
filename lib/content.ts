export type NewsItem = {
  id: string;
  title: string;
  date: string;
  people: string;
  body: string;
};

export type PaperLink = { label: string; url: string };

export type ProjectItem = {
  id: string;
  title: string;
  date: string;
  image: string;
  summary: string;
  body: string;
  people: string;
  profileImage: string;
  status: "进行中" | "已完成";
  paperLinks: PaperLink[];
};

export type SiteContent = {
  lab: { name: string; logoText: string; logoImage?: string; kicker: string; headline: string; description: string; image: string; imageFit?: "contain" | "cover"; imagePosition?: "center" | "top" | "bottom" | "left" | "right" };
  news: NewsItem[];
  projects: ProjectItem[];
  contact: { title: string; body: string; email: string };
};

export function sortNewsByDate(news: NewsItem[]): NewsItem[] {
  return [...news].sort((a, b) => b.date.localeCompare(a.date));
}

export const defaultContent: SiteContent = {
  lab: {
    name: "HAIDE Lab",
    logoText: "HAIDE",
    logoImage: "/api/media/2aa7a351-75a7-405b-b621-5f6ae2ae1ace.png",
    kicker: "HUMAN–AI INTERACTION · DESIGN ENGINEERING",
    headline: "Designing and engineering better human-agent relationships",
    description: "The Human–Computer Interaction and Design Engineering Laboratory is led by Assistant Professor Mu Tong at South China University of Technology. We conduct interdisciplinary research on relationships and mediating mechanisms between humans, intelligent agents, and robots, focusing on the design, development, and application of interactive technologies.",
    image: "/api/media/edf10d23-2467-4df0-ae7e-1d1813f7f891.png",
    imageFit: "cover",
    imagePosition: "center",
  },
  news: [
    { id: "news-1", date: "2026-08-18", title: "Lab paper receives an ACM CHI 2026 Best Paper Honorable Mention", people: "Chen Chen, Lin Yu", body: "Our study examines how people collaborate with generative AI on open-ended design tasks. We thank everyone who contributed to the research and prototype development." },
    { id: "news-2", date: "2026-07-06", title: "We are recruiting research assistants in HCI and AI", people: "The lab team", body: "We welcome students interested in human–computer interaction, artificial intelligence, and design research. Please include a CV, portfolio, and a brief statement of research interests in your email." },
    { id: "news-3", date: "2026-05-22", title: "Lab Open Day: imagining the future of people and intelligent systems", people: "Zhou He, Wang An", body: "The open day will feature recent research prototypes and conversations about human–AI co-creation, embodied intelligence, and responsible AI design." },
    { id: "news-4", date: "2026-03-11", title: "New research project explores explainable everyday AI", people: "The lab team", body: "Our new project investigates how explanations, feedback, and user control can make everyday intelligent systems easier to understand and trust." },
  ],
  projects: [
    { id: "project-1", title: "Human–AI Co-Creation Tools", date: "2026-06-12", image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=900&q=80", summary: "Exploring how generative AI can become a collaborator in the design process rather than merely an automation tool.", body: "This project studies the relationship between designers and generative AI. Through participatory research, interactive prototypes, and real design tasks, we investigate feedback and control mechanisms that preserve human creative agency.", people: "Chen Chen, Lin Yu, Zhao Ke", profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80", status: "进行中", paperLinks: [{ label: "Project paper", url: "https://dl.acm.org/" }] },
    { id: "project-2", title: "Explainable Everyday AI", date: "2026-04-03", image: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=900&q=80", summary: "Studying how people understand, control, and trust intelligent systems embedded in everyday life.", body: "Starting from users’ mental models, we explore how explanation, correction, and feedback should appear in intelligent products so that non-technical users can understand system behavior and retain final control.", people: "Zhou He, Wang An", profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80", status: "进行中", paperLinks: [] },
    { id: "project-3", title: "Embodied Interaction and Spatial Computing", date: "2025-12-18", image: "https://images.unsplash.com/photo-1592478411213-6153e4ebc696?auto=format&fit=crop&w=900&q=80", summary: "Designing more natural and embodied interactions through mixed reality and spatial sensing.", body: "Using spatial computing devices as a research medium, this project examines how bodily movement, environmental cues, and digital information can form continuous and natural interactive experiences.", people: "Shen Yan, Xu Yi, Li Xiang", profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80", status: "已完成", paperLinks: [{ label: "View publication", url: "https://dl.acm.org/" }] },
    { id: "project-4", title: "Responsible AI Design", date: "2025-10-09", image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=900&q=80", summary: "Turning fairness, transparency, and participation into practical methods for AI product design.", body: "Together with design practitioners and affected communities, we are developing early-stage design methods that make fairness, transparency, and accountability part of the process rather than post-launch checks.", people: "Gu Chen, Ye Qing", profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80", status: "进行中", paperLinks: [] },
  ],
  contact: {
    title: "Join us in shaping intelligent futures worth living in.",
    body: "We welcome students, researchers, and collaborators interested in human–computer interaction, artificial intelligence, and design. Please briefly introduce your background, research interests, and the work you hope to pursue.",
    email: "tongmu@scut.edu.cn",
  },
};

export function migrateLegacyContent(content: SiteContent): SiteContent {
  const migrated: SiteContent = JSON.parse(JSON.stringify(content));

  if (migrated.lab.headline === "我们设计人与智能系统共同生活、学习与创造的方式。") {
    migrated.lab.headline = defaultContent.lab.headline;
  }
  if (migrated.lab.description === "我们是一支跨学科研究团队，工作于人机交互、人工智能与设计的交叉地带。通过研究、原型与真实世界实验，我们探索以人为本的智能技术。") {
    migrated.lab.description = defaultContent.lab.description;
  }

  const legacyNewsTitles: Record<string, string> = {
    "news-1": "实验室论文获 ACM CHI 2026 最佳论文提名",
    "news-2": "我们正在招募人机交互与人工智能方向研究助理",
    "news-3": "实验室开放日：一起讨论人与智能系统的未来",
  };
  const legacyNews = migrated.news.every((item) => !legacyNewsTitles[item.id] || item.title === legacyNewsTitles[item.id]);
  if (legacyNews) {
    const englishNews = new Map(defaultContent.news.map((item) => [item.id, item]));
    migrated.news = migrated.news.map((item) => englishNews.has(item.id) ? { ...item, ...englishNews.get(item.id)! } : item);
    if (!migrated.news.some((item) => item.id === "news-4")) migrated.news.push(defaultContent.news[3]);
  }

  const legacyProjectTitles: Record<string, string> = {
    "project-1": "面向创造力的人机共创工具",
    "project-2": "可解释的日常智能界面",
    "project-3": "具身交互与空间计算",
    "project-4": "负责任的人工智能设计",
  };
  const englishProjects = new Map(defaultContent.projects.map((item) => [item.id, item]));
  migrated.projects = migrated.projects.map((item) => {
    if (item.title !== legacyProjectTitles[item.id]) return item;
    const english = englishProjects.get(item.id);
    return english ? { ...item, title: english.title, summary: english.summary, body: english.body, people: english.people, paperLinks: english.paperLinks } : item;
  });

  if (migrated.contact.title === "与我们一起，研究更值得生活其中的智能未来。") migrated.contact.title = defaultContent.contact.title;
  if (migrated.contact.body === "我们欢迎对人机交互、人工智能与设计研究感兴趣的学生、研究者及合作伙伴与我们联系。来信请简要介绍你的背景、研究兴趣和希望开展的工作。") migrated.contact.body = defaultContent.contact.body;

  return migrated;
}

export function isSiteContent(value: unknown): value is SiteContent {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<SiteContent>;
  return Boolean(item.lab && Array.isArray(item.news) && Array.isArray(item.projects) && item.contact);
}
