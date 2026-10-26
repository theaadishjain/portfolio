import { Layers, Server, Box, Code2, Cpu, Network, Zap, Globe, Database, Shield, Sparkles, Brain, Search, Key, Eye } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Skill {
  name: string;
  context: string;
  category: string;
}

export interface TechItem {
  name: string;
  icon: LucideIcon;
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  category: string;
  color: string;
  image: string;
  tech: TechItem[];
  githubUrl: string | null;
  liveUrl: string | null;
  description: string;
}

export interface ExperienceItem {
  id: number;
  date: string;
  track: string;
  outcomeLine: string;
  narrativeLine: string;
  stack: string[];
  metric: string;
}

export const SKILLS_DATA: Skill[] = [
  // ── Languages ──────────────────────────────────────────────────────────────
  { name: "Python", context: "Core language for scripting, machine learning, and data analysis.", category: "Languages" },
  { name: "C++", context: "Systems-level programming and performance-critical applications.", category: "Languages" },
  { name: "Java", context: "Object-oriented development and data-structures work.", category: "Languages" },
  { name: "JavaScript", context: "Interactive web development and scripting.", category: "Languages" },
  { name: "SQL", context: "Relational database management and complex queries.", category: "Languages" },

  // ── Frontend ───────────────────────────────────────────────────────────────
  { name: "React.js", context: "Building complex, interactive user interfaces.", category: "Frontend" },
  { name: "Next.js", context: "App Router, server components, and full-stack React deployments.", category: "Frontend" },
  { name: "Tailwind CSS", context: "Utility-first styling for consistent, responsive design systems.", category: "Frontend" },

  // ── Backend ────────────────────────────────────────────────────────────────
  { name: "Node.js", context: "Asynchronous, event-driven server-side JavaScript.", category: "Backend" },
  { name: "Express.js", context: "Fast, unopinionated web framework for Node.js.", category: "Backend" },
  { name: "FastAPI", context: "Async Python APIs with typed validation and SSE streaming.", category: "Backend" },
  { name: "RESTful API Design", context: "Architecting scalable and stateless web services.", category: "Backend" },
  { name: "JWT Authentication", context: "Secure, stateless user authentication and authorization.", category: "Backend" },

  // ── Databases ──────────────────────────────────────────────────────────────
  { name: "MySQL", context: "Relational schema design, joins, and query optimisation.", category: "Databases" },
  { name: "MongoDB Atlas", context: "Fully-managed cloud NoSQL database service.", category: "Databases" },
  { name: "ChromaDB", context: "Vector store for embeddings and semantic retrieval.", category: "Databases" },

  // ── AI/ML ──────────────────────────────────────────────────────────────────
  { name: "Agentic AI", context: "Autonomous agents that plan, call tools, and act on results.", category: "AI/ML" },
  { name: "LangGraph", context: "Stateful graph orchestration for multi-step agent workflows.", category: "AI/ML" },
  { name: "Multi-Agent Workflows", context: "Coordinating specialised agents that hand work between them.", category: "AI/ML" },
  { name: "Vector Databases", context: "Embedding storage and similarity search powering RAG.", category: "AI/ML" },
  { name: "Machine Learning", context: "Developing algorithms that learn and make predictions from data.", category: "AI/ML" },
  { name: "Deep Learning", context: "Training multi-layered neural networks for complex pattern recognition.", category: "AI/ML" },
  { name: "Statistical Modeling", context: "Applying mathematical models to data for analysis and inference.", category: "AI/ML" },
  { name: "Data Analysis", context: "Inspecting, cleansing, and modeling data to discover useful information.", category: "AI/ML" },

  // ── AI Dev Tools ───────────────────────────────────────────────────────────
  { name: "Claude Code", context: "Agentic coding in the terminal for refactors and feature work.", category: "AI Dev Tools" },
  { name: "Cursor", context: "AI-assisted editor for fast, context-aware code changes.", category: "AI Dev Tools" },
  { name: "GitHub Copilot", context: "Inline completion and review assistance across the stack.", category: "AI Dev Tools" },

  // ── DevOps ─────────────────────────────────────────────────────────────────
  { name: "Git", context: "Version control and collaborative code management.", category: "DevOps" },
  { name: "GitHub Actions", context: "Automating software workflows directly from GitHub.", category: "DevOps" },
  { name: "CI/CD Pipelines", context: "Automated testing and continuous delivery workflows.", category: "DevOps" },
  { name: "Docker", context: "Containerized reproducible environments.", category: "DevOps" },
  { name: "Kubernetes", context: "Automating deployment, scaling, and management of containerized applications.", category: "DevOps" },
  { name: "AWS (EC2)", context: "Cloud compute provisioning and deployment.", category: "DevOps" },
  { name: "Vercel", context: "Edge deployment and preview environments for Next.js apps.", category: "DevOps" },
  { name: "Render", context: "Managed hosting for services, workers, and databases.", category: "DevOps" },
  { name: "Postman", context: "API design, testing, and collection-driven documentation.", category: "DevOps" }
];

export const PROJECT_DATA: Project[] = [
  {
    id: 1,
    slug: "athena",
    title: "Athena",
    category: "AI",
    color: "#a855f7",
    image: "/images/project-atlas.jpg",
    description: "Multi-agent academic assistant — six specialists behind one chat box, with memory that outlives the session",
    tech: [
      { name: "LangGraph", icon: Network },
      { name: "FastAPI", icon: Zap },
      { name: "Next.js", icon: Globe },
      { name: "ChromaDB", icon: Database },
      { name: "Clerk", icon: Shield },
      { name: "Gemini", icon: Sparkles }
    ],
    githubUrl: "https://github.com/theaadishjain/Athena",
    liveUrl: "https://athena-lemon-five.vercel.app"
  },
  {
    id: 2,
    slug: "f1gpt",
    title: "F1GPT",
    category: "AI",
    color: "#ef4444",
    image: "/images/project-f1gpt.png",
    description: "Retrieval-augmented F1 chatbot built on scraped race data and embeddings that cost nothing to generate",
    tech: [
      { name: "Next.js", icon: Globe },
      { name: "Gemini", icon: Sparkles },
      { name: "LangChain", icon: Brain },
      { name: "Astra DB", icon: Database },
      { name: "Transformers.js", icon: Cpu },
      { name: "Puppeteer", icon: Search }
    ],
    githubUrl: "https://github.com/theaadishjain/nextjs-f1chatbot",
    liveUrl: "https://f1gpt-five.vercel.app"
  },
  {
    id: 3,
    slug: "stayease",
    title: "StayEase",
    category: "Web",
    color: "#3b82f6",
    image: "/images/project-stayease.png",
    description: "Server-rendered stay-listing platform — Express 5, nested reviews, and error handling that never leaks a stack trace",
    tech: [
      { name: "Express 5", icon: Server },
      { name: "EJS", icon: Code2 },
      { name: "Mongoose", icon: Database },
      { name: "MongoDB", icon: Database },
      { name: "Joi", icon: Shield }
    ],
    githubUrl: "https://github.com/theaadishjain/StayEase",
    liveUrl: null
  },
  {
    id: 4,
    slug: "she-guardian",
    title: "She-Guardian",
    category: "Web",
    color: "#ec4899",
    image: "/images/project-sheguardian.png",
    description: "Safety companion that classifies threat level first and asks permission before it ever shares your location",
    tech: [
      { name: "FastAPI", icon: Zap },
      { name: "React", icon: Code2 },
      { name: "Gemini", icon: Sparkles },
      { name: "Twilio", icon: Network },
      { name: "SQLAlchemy", icon: Database },
      { name: "JWT", icon: Key }
    ],
    githubUrl: "https://github.com/theaadishjain/she-guardian",
    liveUrl: null
  },
  {
    id: 5,
    slug: "diabetic-foot-ulcer-detection",
    title: "Diabetic Foot Ulcer Detection",
    category: "AI",
    color: "#8b5cf6",
    image: "/images/project-dfu.jpg",
    description: "Thermal-image classifier pairing a Siamese network with a spatial transformer — AUROC 0.94, paper under review",
    tech: [
      { name: "PyTorch", icon: Cpu },
      { name: "STN", icon: Box },
      { name: "Siamese Networks", icon: Layers },
      { name: "OpenCV", icon: Eye }
    ],
    githubUrl: null,
    liveUrl: null
  }
];

export const EXPERIENCE_DATA: ExperienceItem[] = [
  // ── Builds ─────────────────────────────────────────────────────────────────
  {
    id: 1,
    date: "2025.04 - 2025.06",
    track: "Builds",
    outcomeLine: "shipped F1GPT racing chatbot",
    narrativeLine: "First retrieval-augmented build — a plain HTML/CSS front end, no framework, wired to a RAG pipeline: it pulls F1 race and driver data from across different websites, stores it as vector embeddings, then retrieves the chunks relevant to a question and hands them to the LLM to generate the answer.",
    stack: ["HTML/CSS", "JavaScript", "OpenAI API", "RAG", "Vector Embeddings"],
    metric: "End-to-end RAG: embedding, retrieval, and streamed generation",
  },
  {
    id: 2,
    date: "2025.07 - 2025.09",
    track: "Builds",
    outcomeLine: "shipped She-Guardian safety platform",
    narrativeLine: "Safety-focused web app pairing a React client with a FastAPI backend, with JWT-secured authentication guarding every protected route.",
    stack: ["FastAPI", "React", "SQLite", "JWT"],
    metric: "Stateless JWT auth across the full API surface",
  },
  {
    id: 3,
    date: "2025.10 - 2025.12",
    track: "Builds",
    outcomeLine: "deployed StayEase booking platform to AWS",
    narrativeLine: "Full-stack booking platform on the MERN stack, containerised with Docker and shipped to AWS EC2 behind a pipeline that builds and deploys on every merge to main.",
    stack: ["React", "Node.js", "MongoDB", "Docker", "AWS EC2", "CI/CD"],
    metric: "Containerised deploys to EC2 on every merge",
  },
  {
    id: 4,
    date: "2025.11 - 2026.01",
    track: "Builds",
    outcomeLine: "built Diabetic Foot Ulcer detection model",
    narrativeLine: "Medical imaging pipeline using Siamese Networks with Spatial Transformer Networks to classify diabetic foot ulcers from thermal images.",
    stack: ["PyTorch", "Siamese Networks", "STN", "OpenCV"],
    metric: "AUROC 0.94 on the clinical dataset",
  },
  {
    id: 5,
    date: "2026.01 - 2026.04",
    track: "Builds",
    outcomeLine: "shipped Athena multi-agent academic assistant",
    narrativeLine: "Architected a LangGraph-orchestrated system of six specialised agents for student academic workflows, with JWT-protected SSE streaming so answers render token by token.",
    stack: ["LangGraph", "FastAPI", "Next.js", "ChromaDB", "Clerk", "Gemini"],
    metric: "6 specialised agents · JWT-protected SSE streaming",
  },

  // ── Academic & Research ────────────────────────────────────────────────────
  {
    id: 6,
    date: "2026.02",
    track: "Academic & Research",
    outcomeLine: "submitted DFU detection paper for publication",
    narrativeLine: "Wrote up the Siamese + Spatial Transformer approach to thermal-image ulcer classification and submitted it for peer review.",
    stack: ["PyTorch", "Medical Imaging", "Research Writing"],
    metric: "Under review — not yet published",
  },

  // ── Prep & Competitive ─────────────────────────────────────────────────────
  {
    id: 7,
    date: "2023.07",
    track: "Prep & Competitive",
    outcomeLine: "ranked 48 in SRMJEEE",
    narrativeLine: "Placed 48th nationally in the SRM Joint Engineering Entrance Examination, earning admission to the Computer Science programme.",
    stack: ["Mathematics", "Physics", "Chemistry"],
    metric: "Rank 48, SRMJEEE 2023",
  },
  {
    id: 8,
    date: "2025.06",
    track: "Prep & Competitive",
    outcomeLine: "awarded Top Performer at COSC Hackween",
    narrativeLine: "Recognised as a Top Performer at COSC Hackween, building and presenting under hackathon time pressure.",
    stack: ["Rapid Prototyping", "Full-Stack"],
    metric: "Top Performer — COSC Hackween 2025",
  },
  {
    id: 9,
    date: "2026.01",
    track: "Prep & Competitive",
    outcomeLine: "reached Google Arcade Champion tier",
    narrativeLine: "Completed the Google Cloud Arcade programme through to Champion tier, working through hands-on labs across cloud services.",
    stack: ["Google Cloud", "Hands-on Labs"],
    metric: "Champion tier — Google Cloud Arcade",
  },
  {
    id: 10,
    date: "ongoing",
    track: "Prep & Competitive",
    outcomeLine: "solved 400+ problems on LeetCode",
    narrativeLine: "Sustained data-structures and algorithms practice, working through 400+ problems across arrays, graphs, dynamic programming and trees.",
    stack: ["C++", "Python", "DSA"],
    metric: "400+ problems solved",
  },
];

export const ACTIVE_STATUS = ["Open Source", "Building"];

export const NAV_ITEMS = [
  { label: 'Home', id: 'home' },
  { label: 'Projects', id: 'projects' },
  { label: 'Experience', id: 'experience' },
  { label: 'Skills', id: 'skills' },
  { label: 'Contact', id: 'contact' },
] as const;
