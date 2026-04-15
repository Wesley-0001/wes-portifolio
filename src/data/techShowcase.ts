/**
 * Habilidades — um único array para edição (textos + barra).
 * iconSlug / brandHex: Simple Icons (https://simpleicons.org) para CDN.
 */
export type Technology = {
  id: string;
  name: string;
  /** Chave legível (identificação) */
  icon: string;
  iconSlug: string;
  brandHex: string;
  description: string;
  tags: readonly string[];
  experience: string;
  knowledge: number;
};

export const technologies: readonly Technology[] = [
  {
    id: "react",
    name: "React",
    icon: "react",
    iconSlug: "react",
    brandHex: "61DAFB",
    description:
      "Interfaces declarativas, componentização e SPA com hooks e ecossistema moderno para produtos web.",
    tags: ["Componentes", "Hooks", "SPA", "UI"],
    experience: "2 anos",
    knowledge: 88,
  },
  {
    id: "typescript",
    name: "TypeScript",
    icon: "typescript",
    iconSlug: "typescript",
    brandHex: "3178C6",
    description:
      "Uso avançado do TypeScript para tipagem segura e escalável em aplicações frontend e backend.",
    tags: ["React", "Node.js", "NestJS"],
    experience: "2 anos",
    knowledge: 86,
  },
  {
    id: "javascript",
    name: "JavaScript",
    icon: "javascript",
    iconSlug: "javascript",
    brandHex: "F7DF1E",
    description:
      "Linguagem base da web: lógica no browser e no Node, APIs modernas e integração com o ecossistema.",
    tags: ["ES6+", "Web", "Front-end", "Node"],
    experience: "2 anos",
    knowledge: 87,
  },
  {
    id: "html",
    name: "HTML",
    icon: "html",
    iconSlug: "html5",
    brandHex: "E34F26",
    description:
      "Estrutura semântica de páginas, acessibilidade e base sólida para qualquer interface web.",
    tags: ["Semântica", "Acessibilidade", "Markup", "Web"],
    experience: "2 anos",
    knowledge: 85,
  },
  {
    id: "css",
    name: "CSS",
    icon: "css",
    iconSlug: "css",
    brandHex: "1572B6",
    description:
      "Estilização, layout responsivo, animações e design systems alinhados ao produto.",
    tags: ["Layout", "Responsivo", "Animações", "Design"],
    experience: "2 anos",
    knowledge: 86,
  },
  {
    id: "node",
    name: "Node.js",
    icon: "node",
    iconSlug: "nodedotjs",
    brandHex: "339933",
    description:
      "Runtime JavaScript no servidor: APIs, tooling e automações com o mesmo ecossistema do front.",
    tags: ["APIs", "Backend", "Tooling", "npm"],
    experience: "2 anos",
    knowledge: 82,
  },
  {
    id: "firebase",
    name: "Firebase",
    icon: "firebase",
    iconSlug: "firebase",
    brandHex: "FFCA28",
    description:
      "Auth, Firestore, hosting e serviços gerenciados para acelerar MVPs e apps em produção.",
    tags: ["Auth", "Firestore", "Hosting", "BaaS"],
    experience: "2 anos",
    knowledge: 80,
  },
  {
    id: "github",
    name: "GitHub",
    icon: "github",
    iconSlug: "github",
    brandHex: "FFFFFF",
    description:
      "Repositórios, revisão de código, Actions e fluxo de trabalho colaborativo em projetos reais.",
    tags: ["Git", "Actions", "PRs", "Colaboração"],
    experience: "2 anos",
    knowledge: 83,
  },
  {
    id: "python",
    name: "Python",
    icon: "python",
    iconSlug: "python",
    brandHex: "3776AB",
    description:
      "Scripts, automações e peças de backend quando a clareza e a produtividade são prioridade.",
    tags: ["Scripts", "Automação", "APIs", "Produtividade"],
    experience: "2 anos",
    knowledge: 81,
  },
] as const;
