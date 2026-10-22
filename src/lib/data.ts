import { Layers, Server, Box, Code2, Cpu, Network, Zap, Globe, Database, Shield, Sparkles, Brain, Search, Cloud, RefreshCw, Key, Eye } from 'lucide-react';
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
  { name: "Python", context: "Core language for scripting, machine learning, and data analysis.", category: "Languages" },
  { name: "C++", context: "Systems-level programming and performance-critical applications.", category: "Languages" },
  { name: "Javascript", context: "Interactive web development and scripting.", category: "Languages" },
  { name: "SQL", context: "Relational database management and complex queries.", category: "Languages" },
  { name: "React.js", context: "Building complex, interactive user interfaces.", category: "Frontend" },
  { name: "Node.js", context: "Asynchronous, event-driven server-side Javascript.", category: "Backend" },
  { name: "Express.js", context: "Fast, unopinionated web framework for Node.js.", category: "Backend" },
  { name: "RESTful API Design", context: "Architecting scalable and stateless web services.", category: "Backend" },
  { name: "JWT Authentication", context: "Secure, stateless user authentication and authorization.", category: "Backend" },
  { name: "Git", context: "Version control and collaborative code management.", category: "DevOps" },
  { name: "CI/CD Pipelines", context: "Automated testing and continuous delivery workflows.", category: "DevOps" },
  { name: "Github Actions", context: "Automating software workflows directly from GitHub.", category: "DevOps" },
  { name: "AWS (EC2, ECR)", context: "Cloud infrastructure and container registry management.", category: "DevOps" },
  { name: "MongoDB Atlas", context: "Fully-managed cloud NoSQL database service.", category: "DevOps" },
  { name: "Docker", context: "Containerized reproducible environments.", category: "DevOps" },
  { name: "Kubernetes", context: "Automating deployment, scaling, and management of containerized applications.", category: "DevOps" },
  { name: "Machine Learning", context: "Developing algorithms that learn and make predictions from data.", category: "AI/ML" },
  { name: "Deep Learning", context: "Training multi-layered neural networks for complex pattern recognition.", category: "AI/ML" },
  { name: "Statistical Modeling", context: "Applying mathematical models to data for analysis and inference.", category: "AI/ML" },
  { name: "Data Analysis", context: "Inspecting, cleansing, and modeling data to discover useful information.", category: "AI/ML" }
];

export const PROJECT_DATA: Project[] = [
  {
    id: 1,
    title: "Athena",
    category: "AI",
    color: "#a855f7",
    image: "/images/project-atlas.jpg",
    description: "Multi-agent academic assistant — solo-built, six specialized agents, JWT-protected SSE streaming",
    tech: [
      { name: "LangGraph", icon: Network },
      { name: "FastAPI", icon: Zap },
      { name: "Next.js", icon: Globe },
      { name: "ChromaDB", icon: Database },
      { name: "Clerk", icon: Shield },
      { name: "Gemini", icon: Sparkles }
    ],
    githubUrl: "https://github.com/theaadishjain/Athena",
    liveUrl: null
  },
  {
    id: 2,
    title: "F1GPT",
    category: "AI",
    color: "#ef4444",
    image: "/images/project-f1gpt.png",
    description: "Next.js-based AI chatbot answering F1 racing queries",
    tech: [
      { name: "Next.js", icon: Globe },
      { name: "OpenAI/LLM API", icon: Brain },
      { name: "RAG", icon: Search }
    ],
    githubUrl: "https://github.com/theaadishjain/nextjs-f1chatbot",
    liveUrl: null
  },
  {
    id: 3,
    title: "StayEase",
    category: "Web",
    color: "#3b82f6",
    image: "/images/project-stayease.png",
    description: "Full-stack booking platform deployed on AWS with CI/CD",
    tech: [
      { name: "React", icon: Code2 },
      { name: "Node.js", icon: Server },
      { name: "MongoDB", icon: Database },
      { name: "AWS EC2", icon: Cloud },
      { name: "Docker", icon: Box },
      { name: "CI/CD", icon: RefreshCw }
    ],
    githubUrl: "https://github.com/theaadishjain/StayEase",
    liveUrl: null
  },
  {
    id: 4,
    title: "She-Guardian",
    category: "Web",
    color: "#ec4899",
    image: "/images/project-sheguardian.png",
    description: "Safety-focused web app with JWT-secured auth",
    tech: [
      { name: "FastAPI", icon: Zap },
      { name: "React", icon: Code2 },
      { name: "SQLite", icon: Database },
      { name: "JWT", icon: Key }
    ],
    githubUrl: "https://github.com/theaadishjain/she-guardian",
    liveUrl: null
  },
  {
    id: 5,
    title: "Diabetic Foot Ulcer Detection",
    category: "AI",
    color: "#8b5cf6",
    image: "/images/project-dfu.jpg",
    description: "Siamese Network + Spatial Transformer Network thermal imaging classifier, AUROC 0.94",
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
  {
    id: 1,
    date: "2025.01",
    track: "Builds",
    outcomeLine: "built Diabetic Foot Ulcer detection system",
    narrativeLine: "Developed a medical imaging pipeline using Siamese Networks with Spatial Transformer Networks for automated DFU classification, achieving strong diagnostic performance on clinical data.",
    stack: ["PyTorch", "STN", "Siamese Networks", "OpenCV"],
    metric: "Achieved AUROC of 0.94 on clinical dataset",
  },
  {
    id: 2,
    date: "2025.03",
    track: "Builds",
    outcomeLine: "shipped ATLAS multi-agent framework",
    narrativeLine: "Architected ATLAS (Academic Task and Learning Agent System), a LangGraph-based multi-agent orchestration framework designed to streamline student academic workflows.",
    stack: ["Python", "LangGraph", "Next.js", "FastAPI"],
    metric: "Multi-agent orchestration for student workflows",
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
