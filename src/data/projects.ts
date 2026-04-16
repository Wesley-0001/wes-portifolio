import { WES_3D_PORTFOLIO_URL } from "../contact";

export type ProjectStatus = "live" | "in_progress";

export type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  /** Pills abaixo do slide principal (ex.: stack, tipo) */
  tags: string[];
  /** Caminho da capa em `public/` (ex.: `/screenshots/termo.gif`) */
  coverImage?: string;
  link?: string;
  status?: ProjectStatus;
  accessLabel?: string;
};

const projectsData: Project[] = [
  {
    id: "wes-portfolio",
    title: "wes — portfolio",
    description:
      "terminal-first interface. projects, stack, contact — minimal product surface.",
    category: "web",
    tags: ["PROJETO REAL", "REACT", "VITE"],
    coverImage: "/screenshots/wes-portfolio.jpg",
    link: WES_3D_PORTFOLIO_URL,
    status: "live",
  },
  {
    id: "termo",
    title: "TERMO",
    description:
      "Portuguese Wordle-style word game — React + TypeScript; ships as a standalone app alongside the portfolio.",
    category: "game",
    tags: ["PROJETO REAL", "REACT", "TYPESCRIPT"],
    coverImage: "/screenshots/termo.gif",
    status: "live",
  },
  {
    id: "barbearia-da-tropa",
    title: "Barbearia da Tropa",
    description:
      "Projeto em desenvolvimento com foco em presença digital, identidade visual e experiência moderna para barbearia.",
    category: "web",
    tags: ["EM DESENVOLVIMENTO", "WEB", "IDENTIDADE"],
    coverImage: "/screenshots/barbearia-da-tropa.png",
    status: "in_progress",
    accessLabel: "Em desenvolvimento",
  },
];

export const projects: Project[] = projectsData;
