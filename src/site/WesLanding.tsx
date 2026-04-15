import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Code2,
  ExternalLink,
  Github,
  Globe,
  Linkedin,
  Palette,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type TouchEventHandler,
} from "react";
import { CONTACT, CONTACT_SITE_URL } from "../contact";
import { InteractiveWebBackground } from "./InteractiveWebBackground";
import { Portfolio3D } from "./Portfolio3D";
import ContactSection from "@/components/contact/ContactSection";
import Footer from "@/components/contact/Footer";
import { assetUrl } from "../assetUrl";
import { projects, type Project } from "../data/projects";
import { technologies, type Technology } from "../data/techShowcase";

type WesLandingProps = {
  onBack: () => void;
};

const GITHUB_URL = "https://github.com/Wesley-0001";

/** Cargos em rotação — efeito estilo Typed.js (loop infinito) */
/** Uma linha por vez — evita “corte” no meio de frases ao redimensionar a janela */
const HERO_ROLES = [
  "Developer",
  "Desenvolvedor Full Stack",
  "Front-end Developer",
  "Back-end Developer",
] as const;

const STACK = [
  "React",
  "TypeScript",
  "JavaScript",
  "CSS",
  "Vite",
  "Firebase",
] as const;

const TYPE_MS = 48;
const DELETE_MS = 32;
const PAUSE_AFTER_FULL_MS = 2800;
const PAUSE_BETWEEN_ROLES_MS = 480;

const SECTION_IDS = [
  "home",
  "about",
  "work",
  "skills",
  "education",
  "contact",
] as const;

function useSectionScrollSpy(ids: readonly string[]) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const update = () => {
      const mid = window.innerHeight * 0.42;
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        const r = el.getBoundingClientRect();
        const c = r.top + r.height * 0.35;
        const d = Math.abs(c - mid);
        if (r.bottom > 80 && r.top < window.innerHeight - 80 && d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActive(best);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ids]);

  return active;
}

function scrollToSectionId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

const NAV_ITEMS = [
  { id: "home", label: "Início" },
  { id: "about", label: "Sobre mim" },
  { id: "work", label: "Ver Projetos" },
  { id: "skills", label: "Habilidades" },
  { id: "education", label: "Educação" },
  { id: "contact", label: "Contato" },
] as const;

function ProjectPaginationDots({
  active,
  totalPages,
  onSelect,
}: {
  active: number;
  totalPages: number;
  onSelect: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div
      className="mt-8 flex items-center justify-center gap-2.5"
      role="tablist"
      aria-label="Projetos em destaque"
    >
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={active === i}
          className="group relative flex h-2 w-2 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 outline-none transition-[transform] duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400/35"
          onClick={() => onSelect(i)}
          aria-label={`Projeto ${i + 1} de ${totalPages}`}
        >
          {active === i ? (
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/95 opacity-100 shadow-[0_0_12px_rgba(52,211,153,0.35)] transition-[opacity,transform] duration-300 ease-out"
            />
          ) : (
            <span
              aria-hidden
              className="pointer-events-none h-2 w-2 scale-95 rounded-full bg-white/12 opacity-50 transition-[background-color,opacity] duration-300 ease-out group-hover:bg-white/22 group-hover:opacity-80"
            />
          )}
        </button>
      ))}
    </div>
  );
}

function projectCoverClass(id: string): string {
  switch (id) {
    case "wes-portfolio":
      return "bg-gradient-to-br from-[#0c1822] via-[#0d1912] to-[#030506]";
    case "termo":
      return "bg-gradient-to-br from-[#1a1040]/90 via-[#0f172a] to-[#030506]";
    case "barbearia-da-tropa":
      return "bg-gradient-to-br from-[#2a1810] via-[#141110] to-[#030506]";
    default:
      return "bg-gradient-to-br from-neutral-900 to-black";
  }
}

function ProjectSlideCover({
  project,
  emphasis,
}: {
  project: Project;
  emphasis: "center" | "side";
}) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [project.id]);

  const hasCover =
    typeof project.coverImage === "string" && project.coverImage.length > 0;
  const showPhoto = hasCover && !imgFailed;

  const border =
    emphasis === "center"
      ? "border-white/[0.08] shadow-[0_12px_44px_rgba(0,0,0,0.32),0_0_32px_rgba(56,189,248,0.04)]"
      : "border-white/[0.06] opacity-[0.44] transition duration-300 hover:opacity-[0.62]";
  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-[1.35rem] border ${border}`}
    >
      {showPhoto ? (
        <img
          key={project.coverImage}
          src={assetUrl(project.coverImage)}
          alt=""
          className="absolute inset-0 z-[1] h-full w-full object-cover object-center"
          loading="lazy"
          decoding="async"
          sizes={
            emphasis === "center"
              ? "(max-width: 768px) min(92vw, 640px), min(600px, 45vw)"
              : "(max-width: 768px) 0px, min(240px, 22vw)"
          }
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div
          className={`absolute inset-0 z-0 ${projectCoverClass(project.id)}`}
          aria-hidden
        />
      )}
      {!showPhoto ? (
        <div
          className="pointer-events-none absolute inset-0 z-[2] opacity-[0.11]"
          style={{
            backgroundImage: `radial-gradient(1px 1px at 18% 28%, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 78% 72%, rgba(255,255,255,0.75), transparent)`,
            backgroundSize: "38px 38px",
          }}
          aria-hidden
        />
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-black/60 via-black/15 to-transparent"
        aria-hidden
      />
      <p
        className={`absolute bottom-0 left-0 right-0 z-[4] px-4 pb-3.5 pt-10 text-left font-semibold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] ${
          emphasis === "center"
            ? "text-base sm:text-lg md:text-[1.35rem]"
            : "text-[0.65rem] leading-snug sm:text-[0.72rem]"
        }`}
      >
        {project.title}
      </p>
    </div>
  );
}

function WorkFeaturedCarousel({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (i: number) => void;
}) {
  const n = projects.length;
  const prev = () => onSelect((active - 1 + n) % n);
  const next = () => onSelect((active + 1) % n);
  const ix = (delta: number) => (active + delta + n * 100) % n;
  const pLeft = projects[ix(-1)];
  const pCenter = projects[active];
  const pRight = projects[ix(1)];
  const openCode = (id: string) =>
    String(projects.findIndex((x) => x.id === id) + 1).padStart(2, "0");
  const inProgress = pCenter.status === "in_progress";

  const touchStartX = useRef<number | null>(null);

  const onTouchStart: TouchEventHandler<HTMLDivElement> = (e) => {
    touchStartX.current = e.targetTouches[0]?.clientX ?? null;
  };

  const onTouchEnd: TouchEventHandler<HTMLDivElement> = (e) => {
    if (touchStartX.current == null || n <= 1) return;
    const endX = e.changedTouches[0]?.clientX;
    if (endX === undefined) return;
    const dx = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 52) return;
    if (dx < 0) next();
    else prev();
  };

  return (
    <div
      className="mt-10"
      role="region"
      aria-roledescription="carousel"
      aria-label="Projetos em destaque"
    >
      <div
        className="relative px-2 pb-1 pt-0 [touch-action:pan-y] sm:px-14 md:px-[4.25rem]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          type="button"
          onClick={prev}
          disabled={n <= 1}
          className="absolute left-0 top-1/2 z-30 flex h-11 min-h-[44px] w-11 min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-neutral-900 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition hover:bg-neutral-100 active:scale-95 disabled:pointer-events-none disabled:opacity-0 sm:left-0 sm:h-10 sm:min-h-0 sm:w-10 sm:min-w-0"
          aria-label="Projeto anterior"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={next}
          disabled={n <= 1}
          className="absolute right-0 top-1/2 z-30 flex h-11 min-h-[44px] w-11 min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-neutral-900 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition hover:bg-neutral-100 active:scale-95 disabled:pointer-events-none disabled:opacity-0 sm:right-0 sm:h-10 sm:min-h-0 sm:w-10 sm:min-w-0"
          aria-label="Próximo projeto"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>

        <div className="flex items-center justify-center gap-3 md:gap-5 lg:gap-8">
          <button
            type="button"
            onClick={() => onSelect(ix(-1))}
            className="hidden w-[min(30vw,200px)] shrink-0 scale-[0.92] md:block md:w-[min(22vw,220px)] md:scale-[0.88] lg:w-[240px]"
            aria-label={`Ver projeto: ${pLeft.title}`}
          >
            <div className="aspect-[16/10] w-full">
              <ProjectSlideCover project={pLeft} emphasis="side" />
            </div>
          </button>

          <div className="relative z-20 w-full max-w-[min(92vw,600px)] shrink-0 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <div className="aspect-[16/10] w-full">
              <div className="h-full w-full">
                <ProjectSlideCover project={pCenter} emphasis="center" />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelect(ix(1))}
            className="hidden w-[min(30vw,200px)] shrink-0 scale-[0.92] md:block md:w-[min(22vw,220px)] md:scale-[0.88] lg:w-[240px]"
            aria-label={`Ver projeto: ${pRight.title}`}
          >
            <div className="aspect-[16/10] w-full">
              <ProjectSlideCover project={pRight} emphasis="side" />
            </div>
          </button>
        </div>
      </div>

      <div className="mx-auto mt-9 max-w-2xl px-1 text-center sm:mt-10">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {pCenter.tags.map((tag) => (
            <span
              key={tag}
              className="wes-label-mono rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-[0.62rem] font-medium tracking-[0.12em] text-neutral-300/95"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
          {pCenter.title}
        </h3>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-neutral-500 md:text-[0.95rem]">
          {pCenter.description}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          {pCenter.link ? (
            <a
              href={pCenter.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400/95 transition hover:text-emerald-300"
            >
              Abrir projeto
              <ArrowUpRight size={16} aria-hidden />
            </a>
          ) : inProgress ? (
            <p className="wes-label-mono text-[0.72rem] text-neutral-500">
              {pCenter.accessLabel ?? "Disponível em breve"}
            </p>
          ) : (
            <p className="wes-label-mono text-[0.72rem] text-neutral-600">
              Acesso pelo terminal:{" "}
              <span className="text-neutral-400">
                open {openCode(pCenter.id)}
              </span>
            </p>
          )}
        </div>
      </div>

      <ProjectPaginationDots
        active={active}
        totalPages={n}
        onSelect={onSelect}
      />
    </div>
  );
}

function useHeroTypedRoles(roles: readonly string[], enabled: boolean) {
  const [text, setText] = useState("");
  const idxRef = useRef(0);
  const charRef = useRef(0);
  const phaseRef = useRef<"typing" | "pause" | "deleting">("typing");
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) {
      setText(roles[0] ?? "");
      return;
    }

    let cancelled = false;

    const clear = () => {
      if (tRef.current != null) {
        clearTimeout(tRef.current);
        tRef.current = null;
      }
    };

    const schedule = (fn: () => void, ms: number) => {
      clear();
      tRef.current = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const tick = () => {
      if (cancelled) return;
      const full = roles[idxRef.current % roles.length] ?? "";
      if (phaseRef.current === "typing") {
        if (charRef.current < full.length) {
          charRef.current += 1;
          setText(full.slice(0, charRef.current));
          schedule(tick, TYPE_MS);
        } else {
          phaseRef.current = "pause";
          schedule(() => {
            phaseRef.current = "deleting";
            tick();
          }, PAUSE_AFTER_FULL_MS);
        }
      } else if (phaseRef.current === "deleting") {
        if (charRef.current > 0) {
          charRef.current -= 1;
          setText(full.slice(0, charRef.current));
          schedule(tick, DELETE_MS);
        } else {
          idxRef.current = (idxRef.current + 1) % roles.length;
          phaseRef.current = "typing";
          schedule(tick, PAUSE_BETWEEN_ROLES_MS);
        }
      }
    };

    charRef.current = 0;
    phaseRef.current = "typing";
    idxRef.current = 0;
    setText("");
    tick();

    return () => {
      cancelled = true;
      clear();
    };
  }, [enabled, roles]);

  return text;
}

function TechIconImg({
  slug,
  hex,
  className,
  title,
}: {
  slug: string;
  hex: string;
  className?: string;
  title?: string;
}) {
  const [loadFailed, setLoadFailed] = useState(false);
  const src = `https://cdn.simpleicons.org/${slug}/${hex}`;

  useEffect(() => {
    setLoadFailed(false);
  }, [slug, hex]);

  if (loadFailed) {
    return (
      <span
        className={`inline-flex items-center justify-center text-white/40 ${className ?? ""}`}
        title={title ?? slug}
        aria-hidden
      >
        <Code2 className="h-[55%] w-[55%] shrink-0" strokeWidth={1.35} />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      title={title}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setLoadFailed(true)}
    />
  );
}

/** Converte hex Simple Icons (sem #) para rgba — anéis e brilhos da seção skills */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function WesSkillsShowcase() {
  const [selected, setSelected] = useState<Technology>(technologies[0]);
  const [detailVisible, setDetailVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );
  const [skillsInView, setSkillsInView] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );
  const skillsSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = skillsSectionRef.current;
    if (!el) return;
    if (reducedMotion) {
      setSkillsInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setSkillsInView(true);
      },
      {
        root: null,
        rootMargin: "100px 0px 120px 0px",
        threshold: [0, 0.08, 0.18],
      }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion]);

  const swapMs = reducedMotion ? 0 : 320;

  const selectTech = (item: Technology) => {
    if (item.id === selected.id) return;
    if (reducedMotion) {
      setSelected(item);
      return;
    }
    setDetailVisible(false);
    window.setTimeout(() => {
      setSelected(item);
      setDetailVisible(true);
    }, swapMs);
  };

  const brandRgb = hexToRgb(selected.brandHex);
  const lightBrand =
    brandRgb.r > 248 && brandRgb.g > 248 && brandRgb.b > 248;

  return (
    <section
      ref={skillsSectionRef}
      id="skills"
      className={`wes-skills-section relative isolate mt-12 min-h-[min(92svh,880px)] scroll-mt-28 border-t border-white/[0.05] pt-[clamp(5rem,11vw,7.5rem)] pb-[clamp(5.5rem,12vw,9rem)] md:mt-16 md:pt-[clamp(6rem,12vw,8.5rem)] md:pb-[clamp(6rem,11vw,9.5rem)] ${
        skillsInView ? "wes-skills-section--inview" : ""
      }`}
      aria-labelledby="wes-skills-title"
    >
      <div
        className="wes-skills-section-pattern pointer-events-none absolute inset-0 z-[1]"
        aria-hidden
      />
      <div className="wes-skills-inner relative z-10 -mx-[clamp(0.75rem,4vw,2.5rem)] px-[clamp(1rem,4vw,2.25rem)] sm:-mx-[clamp(1rem,5vw,3rem)] sm:px-[clamp(1.25rem,4.5vw,3rem)] lg:-mx-[clamp(1.5rem,6vw,4.5rem)] lg:px-[clamp(1.75rem,5vw,4rem)]">
      <header className="wes-skills-header relative z-10 mx-auto max-w-[min(100%,44rem)] text-center">
        <p className="wes-skills-eyebrow wes-label-mono text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-neutral-500">
          Tecnologias que uso
        </p>
        <h2
          id="wes-skills-title"
          className="mt-4 text-[clamp(1.9rem,4.2vw,2.75rem)] font-semibold tracking-[-0.038em] text-white"
        >
          Habilidades e Tecnologias
        </h2>
        <p className="wes-skills-subtitle mx-auto mt-5 max-w-[36rem] text-[0.9375rem] leading-snug text-neutral-500 md:mt-6 md:text-[0.97rem] md:leading-relaxed">
          Aqui estão algumas das tecnologias que tenho experiência e conhecimento.
          Clique em cada uma delas para ver mais detalhes.
        </p>
      </header>

      <div className="wes-skills-grid relative z-10 mt-[clamp(3.25rem,7.5vw,5rem)] w-full min-w-0">
        {/* Palco — vitrine + faixa de ícones */}
        <div
          className="flex w-full min-w-0 flex-col items-center justify-center justify-self-center xl:justify-self-stretch"
          aria-live="polite"
          aria-label={`Tecnologia em destaque: ${selected.name}`}
        >
          <div
            className={`flex w-full max-w-[min(100%,960px)] flex-col items-center justify-center ${
              reducedMotion ? "" : "wes-skills-float-wrap"
            }`}
          >
            <div className="wes-skills-stage relative w-full overflow-hidden rounded-[2.5rem] px-7 pb-6 pt-8 sm:rounded-[2.65rem] sm:px-9 sm:pb-7 sm:pt-9 md:px-10 md:pb-7 md:pt-9">
              <div
                className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-[0.14]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 38%)",
                }}
                aria-hidden
              />
              <div className="relative z-[1] flex min-h-0 w-full flex-1 flex-col justify-between">
                <div className="relative flex min-h-0 w-full flex-1 flex-col items-center justify-center pb-2">
                  <div className="group wes-skills-hero-wrap relative z-[1] flex h-[132px] w-[132px] shrink-0 items-center justify-center sm:h-[140px] sm:w-[140px]">
                    <div
                      className={`flex h-full w-full items-center justify-center rounded-[1.35rem] p-[1.35rem] shadow-[0_16px_48px_rgba(0,0,0,0.45)] wes-skills-hero-surface ${
                        detailVisible
                          ? "wes-skills-hero-surface--on"
                          : "wes-skills-hero-surface--off"
                      }`}
                      style={{
                        backgroundColor: lightBrand
                          ? "rgb(30 41 59)"
                          : `#${selected.brandHex}`,
                      }}
                    >
                      <TechIconImg
                        slug={selected.iconSlug}
                        hex={lightBrand ? selected.brandHex : "FFFFFF"}
                        className={`wes-skills-hero-icon h-full w-full origin-center object-contain ${
                          !reducedMotion && detailVisible
                            ? "wes-skills-hero-icon--breathe"
                            : ""
                        }`}
                        title={selected.name}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="wes-skills-stage-tabs w-full shrink-0 border-t border-white/[0.08] pt-4 sm:pt-5"
                  role="tablist"
                  aria-label="Selecionar tecnologia"
                >
                  <div className="wes-skills-tab-row mx-auto flex w-full max-w-full flex-nowrap items-center justify-center gap-2.5 overflow-x-auto overflow-y-visible py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-3 md:gap-3.5 [&::-webkit-scrollbar]:hidden">
                    {technologies.map((t) => {
                      const isOn = t.id === selected.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          role="tab"
                          aria-selected={isOn}
                          aria-controls="wes-skills-detail"
                          id={`wes-skill-tab-${t.id}`}
                          onClick={() => selectTech(t)}
                          className={`wes-skills-tab flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.65rem] border border-transparent bg-transparent transition-[opacity,transform,box-shadow,background-color,border-color,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400/35 sm:h-10 sm:w-10 ${
                            isOn
                              ? "wes-skills-tab--active opacity-100"
                              : "opacity-[0.34] hover:border-white/[0.06] hover:bg-white/[0.04] hover:opacity-[0.58] active:opacity-[0.72]"
                          }`}
                          title={t.name}
                        >
                          <TechIconImg
                            slug={t.iconSlug}
                            hex={t.brandHex}
                            className={`h-[1.12rem] w-[1.12rem] object-contain sm:h-[1.2rem] sm:w-[1.2rem] ${
                              reducedMotion ? "" : "wes-skills-tab-icon"
                            }`}
                          />
                          <span className="sr-only">{t.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Painel de detalhes — vitrine editorial */}
        <div
          id="wes-skills-detail"
          role="tabpanel"
          aria-labelledby={`wes-skill-tab-${selected.id}`}
          className="flex min-w-0 w-full flex-col justify-center border-0 bg-transparent px-0.5 py-1 text-center sm:px-1 xl:max-w-none xl:min-w-0 xl:px-0 xl:text-left"
        >
          <div
            className={`wes-skills-detail-inner flex flex-col gap-0 ${
              detailVisible ? "wes-skills-detail-inner--on" : "wes-skills-detail-inner--off"
            }`}
          >
            <h3 className="text-[clamp(1.85rem,2.8vw,2.45rem)] font-semibold tracking-[-0.042em] text-white">
              {selected.name}
            </h3>
            <p className="mx-auto mt-5 max-w-[26rem] text-[0.96rem] leading-[1.75] text-neutral-400/95 xl:mx-0 xl:mt-6 xl:max-w-[28rem] xl:text-[1.01rem] xl:leading-[1.82]">
              {selected.description}
            </p>
            <ul
              className="mt-8 flex flex-wrap justify-center gap-2 md:mt-9 md:gap-2.5 xl:mt-10 xl:justify-start"
              aria-label="Tags relacionadas"
            >
              {selected.tags.map((tag) => (
                <li key={tag}>
                  <span className="wes-skills-tag wes-label-mono">{tag}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 border-t border-white/[0.06] pt-9 md:mt-11 md:pt-10">
              <div className="flex flex-col gap-8 md:gap-9">
                <p className="text-[0.98rem] leading-snug text-neutral-400 md:text-[1.02rem]">
                  <span className="text-neutral-500">Experiência:</span>{" "}
                  <span className="font-semibold tracking-[-0.02em] text-neutral-50">
                    {selected.experience}
                  </span>
                </p>
                <div className="w-full min-w-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="wes-label-mono text-[0.58rem] font-medium uppercase tracking-[0.22em] text-neutral-500/85">
                      Conhecimento
                    </span>
                    <span className="wes-label-mono text-[0.74rem] tabular-nums tracking-tight text-neutral-300/95">
                      {selected.knowledge}%
                    </span>
                  </div>
                  <div
                    className="wes-skills-bar-track mt-5 h-[2px] w-full overflow-hidden rounded-full bg-white/[0.06] sm:h-[3px]"
                    role="progressbar"
                    aria-valuenow={selected.knowledge}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Conhecimento em ${selected.name}: ${selected.knowledge} por cento`}
                  >
                    <div
                      className="wes-skills-bar-fill h-full max-w-full rounded-full"
                      style={{
                        width: `${selected.knowledge}%`,
                        transition: reducedMotion
                          ? "none"
                          : "width 0.65s cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}

export default function WesLanding({ onBack }: WesLandingProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const typedRole = useHeroTypedRoles(HERO_ROLES, !prefersReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const onChange = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const handleBack = () => {
    if (exiting) return;
    setExiting(true);
    window.setTimeout(() => onBack(), 280);
  };

  const [projectSlide, setProjectSlide] = useState(0);

  const [alternateBg, setAlternateBg] = useState(false);
  const activeSection = useSectionScrollSpy(SECTION_IDS);

  return (
    <div
      className={`wes-landing-root relative min-h-screen w-full text-neutral-100 transition-[opacity,background-color] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] will-change-[opacity] ${
        alternateBg ? "bg-[#05070d]" : "bg-black"
      } ${visible && !exiting ? "opacity-100" : "opacity-0"}`}
    >
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap");
        .wes-landing-root {
          font-family: "DM Sans", ui-sans-serif, system-ui, sans-serif;
          font-size: 16px;
        }
        .wes-top-nav {
          font-family: "DM Sans", ui-sans-serif, system-ui, sans-serif;
        }
        .wes-label-mono {
          font-family: "IBM Plex Mono", ui-monospace, monospace;
        }
        @keyframes wes-hero-line {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .wes-hero-enter {
          animation: wes-hero-line 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes wes-hero-name-in {
          0% {
            opacity: 0;
            transform: translateY(0.5rem);
            filter: blur(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
        .wes-hero-name-gradient {
          display: inline-block;
          max-width: 100%;
          background-image: linear-gradient(
            118deg,
            #f8fafc 0%,
            #e8edf2 28%,
            #cbd5e1 58%,
            #94a3b8 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: wes-hero-name-in 1s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: 0.12s;
        }
        @keyframes wes-hero-orbit {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -2px, 0); }
        }
        .wes-hero-orbit-card {
          animation: wes-hero-orbit 7s ease-in-out infinite;
        }
        @keyframes wes-hero-monitor {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -2px, 0); }
        }
        .wes-hero-monitor-wrap {
          animation: wes-hero-monitor 9s ease-in-out infinite;
        }
        @keyframes wes-hero-glow {
          0%, 100% { opacity: 0.75; transform: scale(1); }
          50% { opacity: 0.92; transform: scale(1.02); }
        }
        .wes-hero-monitor-glow-inner {
          animation: wes-hero-glow 10s ease-in-out infinite;
          transform-origin: center center;
        }
        /* Seção skills — véu suave + padrão local mais discreto */
        .wes-skills-section-pattern {
          background-image:
            radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.09) 1px, transparent 0),
            linear-gradient(rgba(255, 255, 255, 0.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.028) 1px, transparent 1px);
          background-size:
            32px 32px,
            100% 56px,
            56px 100%;
          background-position: 0 0, 0 0, 0 0;
          opacity: 0.35;
          mask-image: radial-gradient(
            ellipse 85% 70% at 50% 45%,
            #000 20%,
            transparent 72%
          );
          -webkit-mask-image: radial-gradient(
            ellipse 85% 70% at 50% 45%,
            #000 20%,
            transparent 72%
          );
        }
        .wes-skills-section::before {
          content: "";
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: -4rem;
          bottom: -5rem;
          width: min(132%, 100vw);
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(
              ellipse 88% 72% at 50% 42%,
              rgba(5, 7, 13, 0.42) 0%,
              rgba(5, 7, 13, 0.18) 48%,
              transparent 78%
            );
        }
        /* Ponte visual com a seção anterior — sem “corte seco” */
        .wes-skills-section::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: min(28vh, 220px);
          z-index: 0;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            rgba(5, 7, 13, 0.22) 0%,
            rgba(5, 7, 13, 0) 100%
          );
        }
        .wes-skills-section:not(.wes-skills-section--inview) {
          opacity: 0;
          transform: translate3d(0, 32px, 0);
        }
        .wes-skills-section--inview {
          opacity: 1;
          transform: translate3d(0, 0, 0);
          transition:
            opacity 0.95s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.95s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes wes-skills-stage-float {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -6px, 0);
          }
        }
        .wes-skills-grid {
          display: grid;
          grid-template-columns: 1fr;
          align-items: center;
          justify-items: center;
          gap: clamp(2.75rem, 7vw, 4.25rem);
          width: 100%;
          max-width: min(1320px, 100%);
          margin-left: auto;
          margin-right: auto;
        }
        @media (min-width: 1280px) {
          .wes-skills-grid {
            grid-template-columns: minmax(0, 1.12fr) minmax(300px, 0.88fr);
            gap: clamp(2.25rem, 3.8vw, 3.75rem);
            align-items: center;
            justify-items: stretch;
            max-width: min(1120px, 100%);
          }
        }
        .wes-skills-float-wrap {
          width: 100%;
          max-width: min(100%, 960px);
          animation: wes-skills-stage-float 5.5s ease-in-out infinite;
          will-change: transform;
        }
        @keyframes wes-skills-tab-icon-sway {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -2px, 0);
          }
        }
        .wes-skills-tab-icon {
          display: block;
          animation: wes-skills-tab-icon-sway 4.4s ease-in-out infinite;
        }
        .wes-skills-tab:nth-child(3n + 1) .wes-skills-tab-icon {
          animation-delay: 0s;
        }
        .wes-skills-tab:nth-child(3n + 2) .wes-skills-tab-icon {
          animation-delay: 0.4s;
        }
        .wes-skills-tab:nth-child(3n + 3) .wes-skills-tab-icon {
          animation-delay: 0.8s;
        }
        /* Palco — fundo mate (sem halo de marca atrás do hero) */
        .wes-skills-stage {
          --wes-skills-stage-max: 960px;
          display: flex;
          flex-direction: column;
          aspect-ratio: 1.4 / 1;
          max-width: min(100%, var(--wes-skills-stage-max));
          min-height: 0;
          width: 100%;
          margin-left: auto;
          margin-right: auto;
          background: radial-gradient(
            ellipse 92% 80% at 50% 26%,
            rgba(72, 80, 96, 0.24) 0%,
            rgba(34, 40, 54, 0.52) 46%,
            rgba(12, 16, 26, 0.92) 100%
          );
          border: 1px solid rgba(255, 255, 255, 0.032);
          box-shadow:
            0 56px 128px -32px rgba(0, 0, 0, 0.62),
            0 26px 64px -22px rgba(0, 0, 0, 0.42),
            0 0 0 0.5px rgba(255, 255, 255, 0.018),
            inset 0 1px 0 rgba(255, 255, 255, 0.048),
            inset 0 -22px 56px -28px rgba(0, 0, 0, 0.38);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .wes-skills-hero-wrap {
          width: 132px;
          height: 132px;
        }
        @media (min-width: 640px) {
          .wes-skills-hero-wrap {
            width: 140px;
            height: 140px;
          }
        }
        .wes-skills-stage-tabs {
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }
        .wes-skills-hero-icon {
          filter: brightness(0.9) saturate(1.08) contrast(1.03)
            drop-shadow(0 10px 28px rgba(0, 0, 0, 0.42));
          transition: transform 0.4s ease, filter 0.4s ease;
        }
        @keyframes wes-skills-hero-icon-breathe {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.012);
          }
        }
        .wes-skills-hero-icon--breathe {
          animation: wes-skills-hero-icon-breathe 3.5s ease-in-out infinite;
        }
        .group:hover .wes-skills-hero-icon {
          animation: none;
          transform: scale(1.02);
          filter: brightness(0.94) saturate(1.1) contrast(1.04)
            drop-shadow(0 12px 32px rgba(0, 0, 0, 0.45));
        }
        .wes-skills-tab--active {
          transform: scale(1.03);
          background: rgba(255, 255, 255, 0.06) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07);
        }
        .wes-skills-tab:not(.wes-skills-tab--active) .wes-skills-tab-icon {
          filter: grayscale(1) brightness(0.72) saturate(0.85) contrast(0.96);
        }
        .wes-skills-tab--active .wes-skills-tab-icon {
          filter: none;
        }
        .wes-skills-bar-fill {
          background: linear-gradient(90deg, #6ba3ff, #8ec8ff);
        }
        /* Vitrine: card fixo — só o conteúdo interno faz fade + leve translateY/scale (sem loop, sem rotate) */
        .wes-skills-hero-surface {
          transition: opacity 0.32s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .wes-skills-hero-surface--off {
          opacity: 0;
          transform: translateY(4px) scale(0.985);
        }
        .wes-skills-hero-surface--on {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .wes-skills-detail-inner {
          transition: opacity 0.32s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .wes-skills-detail-inner--off {
          opacity: 0;
          transform: translateY(4px) scale(0.985);
        }
        .wes-skills-detail-inner--on {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .wes-skills-tag {
          display: inline-flex;
          align-items: center;
          min-height: 1.85rem;
          padding: 0.4rem 0.85rem;
          border-radius: 0.45rem;
          font-size: 0.65625rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: rgba(214, 223, 235, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.07);
          background: rgba(8, 12, 22, 0.55);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }
        .wes-skills-bar-track {
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.045);
        }
        .wes-skills-subtitle {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }
        @media (prefers-reduced-motion: reduce) {
          .wes-hero-orbit-card,
          .wes-hero-monitor-wrap,
          .wes-hero-monitor-glow-inner {
            animation: none !important;
          }
          .wes-skills-float-wrap {
            animation: none !important;
          }
          .wes-skills-tab-icon {
            animation: none !important;
          }
          .wes-skills-section:not(.wes-skills-section--inview),
          .wes-skills-section--inview {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          .wes-skills-hero-icon--breathe {
            animation: none !important;
          }
          .group:hover .wes-skills-hero-icon {
            transform: none !important;
          }
          .wes-skills-tab--active {
            transform: none !important;
          }
          .wes-skills-hero-surface,
          .wes-skills-detail-inner {
            transition: none !important;
          }
          .wes-hero-name-gradient {
            animation: none !important;
            filter: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div
        className="pointer-events-none fixed inset-0 z-0 h-full min-h-screen w-full overflow-hidden"
        aria-hidden
      >
        {alternateBg ? (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(61,184,196,0.09),transparent_50%),radial-gradient(ellipse_70%_50%_at_100%_30%,rgba(123,181,49,0.06),transparent_45%),radial-gradient(ellipse_60%_40%_at_0%_80%,rgba(160,75,115,0.05),transparent_40%)]" />
        ) : null}
        <InteractiveWebBackground
          alternateBg={alternateBg}
          className="absolute inset-0 h-full w-full opacity-[0.55]"
        />
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            alternateBg ? "opacity-25" : "opacity-[0.18]"
          }`}
          style={{
            backgroundImage: `
              radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.45) 0, transparent 1px),
              radial-gradient(1px 1px at 72% 55%, rgba(255,255,255,0.35) 0, transparent 1px),
              radial-gradient(1px 1px at 40% 88%, rgba(255,255,255,0.3) 0, transparent 1px),
              radial-gradient(1px 1px at 88% 12%, rgba(255,255,255,0.28) 0, transparent 1px),
              radial-gradient(1px 1px at 25% 65%, rgba(255,255,255,0.25) 0, transparent 1px),
              radial-gradient(1px 1px at 55% 30%, rgba(255,255,255,0.22) 0, transparent 1px)
            `,
            backgroundSize: "100% 100%",
          }}
        />
        <div
          className={`pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.034)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_88%_72%_at_48%_38%,black,transparent)] blur-[0.35px] transition-opacity duration-500 ${
            alternateBg ? "opacity-[0.22]" : "opacity-0"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
      </div>

      <button
        type="button"
        onClick={handleBack}
        className="wes-label-mono fixed top-4 right-4 z-[60] px-4 py-2 text-sm font-medium tracking-wide rounded-full border border-white/10 bg-white/[0.06] backdrop-blur-md text-neutral-200/95 shadow-sm transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out hover:bg-white/10 hover:border-white/18 hover:shadow-md active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400/30 sm:top-7 sm:right-7 sm:px-5 sm:py-2.5"
      >
        ⌘ terminal
      </button>

      <nav
        className="wes-top-nav fixed top-4 left-1/2 z-50 w-[min(100%,calc(100vw-7rem))] max-w-4xl -translate-x-1/2 px-3 sm:top-6 sm:w-[min(100%,calc(100vw-5rem))]"
        aria-label="Navegação principal"
      >
        <div className="flex flex-wrap items-center justify-center gap-1 rounded-full border border-white/[0.12] bg-white/[0.06] px-1.5 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md sm:gap-0 sm:px-2 sm:py-1.5">
          {NAV_ITEMS.map((item, i) => {
            const active = activeSection === i;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSectionId(item.id);
                }}
                className={`rounded-full px-2.5 py-1.5 text-[0.7rem] font-medium transition-colors duration-200 sm:px-3 sm:text-[0.78rem] ${
                  active
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-200/90 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {item.label}
              </a>
            );
          })}
          <button
            type="button"
            onClick={() => setAlternateBg((v) => !v)}
            className="ml-0.5 inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-[0.68rem] font-medium text-neutral-400/95 transition-colors hover:bg-white/[0.07] hover:text-neutral-100 sm:px-2.5 sm:text-[0.76rem]"
            aria-pressed={alternateBg}
            title="Alternar fundo"
          >
            <Palette className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
            <span className="hidden sm:inline">Mudar fundo</span>
          </button>
        </div>
      </nav>

      <div className="relative z-[1] mx-auto flex w-full flex-col pb-24">
        {/* Hero — duas colunas: texto à esquerda + slot visual à direita (troque o conteúdo por WebGL/3D) */}
        <section
          id="home"
          className="hero wes-hero w-full scroll-mt-28 text-left pt-[clamp(4.5rem,10vw,6rem)]"
          aria-labelledby="wes-hero-name"
        >
          <div className="hero-container">
          <div className="wes-hero-enter wes-hero-text-col order-1 min-w-0 w-full lg:shrink-0">
            <p className="wes-hero-hello-badge wes-label-mono inline-flex items-center rounded-full border border-white/[0.09] bg-[#0a1018]/80 px-3 py-1 text-[0.6875rem] font-medium tracking-[0.02em] text-neutral-400/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              Hello!
            </p>
            <h1
              id="wes-hero-name"
              className="wes-hero-title mt-6 max-w-[min(100%,28rem)] text-[clamp(2rem,4.6vw,3.45rem)] leading-[1.1] tracking-[-0.038em] sm:max-w-none md:mt-7 md:text-[clamp(2.1rem,3.8vw,3.5rem)]"
            >
              <span className="wes-hero-name-gradient">Wesley Cruz</span>
            </h1>
            <p
              className="wes-hero-role mt-6 min-h-[3.15rem] max-w-[min(100%,28rem)] text-[clamp(1.05rem,1.2vw+0.8rem,1.28rem)] leading-[1.5] tracking-[-0.014em] text-neutral-400/95 sm:min-h-[2.85rem] sm:max-w-[32rem] md:mt-7"
              aria-live="polite"
            >
              <span className="inline break-words align-middle font-medium text-neutral-200/88">
                {typedRole}
              </span>
              {!prefersReducedMotion ? (
                <span
                  className="cursor-blink ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.06em] align-middle bg-emerald-400/55"
                  aria-hidden
                />
              ) : null}
            </p>

            <div className="mt-11 flex flex-wrap items-center gap-3 md:mt-12 md:gap-3">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="wes-hero-social wes-label-mono inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-[1.15rem] text-[0.78rem] font-medium tracking-[0.03em] text-neutral-300/95 transition-[background-color,border-color,color] duration-200 ease-out hover:border-white/[0.16] hover:bg-white/[0.055] hover:text-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/18"
              >
                <Github size={16} aria-hidden />
                GitHub
                <ExternalLink size={11} className="opacity-35" aria-hidden />
              </a>
              <a
                href={CONTACT.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="wes-hero-social wes-label-mono inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-[1.15rem] text-[0.78rem] font-medium tracking-[0.03em] text-neutral-300/95 transition-[background-color,border-color,color] duration-200 ease-out hover:border-white/[0.16] hover:bg-white/[0.055] hover:text-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/18"
              >
                <Linkedin size={16} aria-hidden />
                LinkedIn
                <ExternalLink size={11} className="opacity-35" aria-hidden />
              </a>
              <a
                href={CONTACT_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="wes-hero-social wes-label-mono inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-[1.15rem] text-[0.78rem] font-medium tracking-[0.03em] text-neutral-300/95 transition-[background-color,border-color,color] duration-200 ease-out hover:border-white/[0.16] hover:bg-white/[0.055] hover:text-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/18"
              >
                <Globe size={16} aria-hidden />
                Portfolio BBS
                <ExternalLink size={11} className="opacity-35" aria-hidden />
              </a>
            </div>
          </div>

          <div className="order-2 flex w-full min-w-0 justify-center self-stretch lg:order-2 lg:justify-end lg:pl-2 xl:pl-4">
            <div
              className="wes-hero-visual-slot relative flex w-full min-w-0 flex-col items-stretch lg:max-w-none lg:items-end"
              data-wes-hero-visual=""
            >
              <div className="hero-interact">
                <span>Interaja aqui ↓</span>
              </div>
              <Portfolio3D />
            </div>
          </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-[min(100%,92rem)] px-[clamp(1.25rem,5vw,3.5rem)] lg:px-[clamp(2rem,6vw,4rem)]">
        <section
          id="about"
          className="about scroll-mt-28 border-t border-white/[0.07]"
          aria-labelledby="wes-about-title"
        >
          <div className="about-header">
            <span className="about-header-label">Sobre mim</span>
            <h2 id="wes-about-title" className="about-header-name">
              Wesley <span>Vitor Souza</span> Cruz
            </h2>
            <p className="about-header-tagline">
              Desenvolvedor Full Stack • Transformando ideias em código
            </p>
          </div>

          <div className="about-content">
            <div className="about-card">
              <img
                src={assetUrl("/textures/eu.jpg")}
                alt="Foto de perfil de Wesley"
                width={360}
                height={480}
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="about-text">
              <p>
                Prazer! Sou desenvolvedor full stack e atuo na fronteira entre
                código e interface: construo telas e sistemas com intenção de
                produto — da estrutura visual à clareza dos dados.
              </p>
              <p>
                Minha jornada como desenvolvedor é focada em experiências que
                sejam bonitas de usar, fáceis de manter e alinhadas com quem está
                do outro lado da tela. Trabalho com{" "}
                <span className="text-neutral-200/95">{STACK.join(", ")}</span>
                — a mesma stack que sustenta os projetos deste portfólio.
              </p>
              <p>
                Se você está procurando um desenvolvedor para dar forma a uma
                ideia, evoluir um produto ou entregar interfaces sólidas e
                consistentes, ficarei feliz em conversar.
              </p>
            </div>
          </div>
        </section>

        {/* Projetos em destaque */}
        <section
          id="work"
          className="relative mt-20 scroll-mt-28 border-t border-white/[0.07] pt-16 md:mt-24 md:pt-20"
          aria-labelledby="wes-work-title"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.28),0_0_28px_rgba(56,189,248,0.05)] backdrop-blur-[8px] md:p-10">
            <div className="relative">
              <p className="wes-label-mono text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-neutral-500">
                Navegue pelos destaques
              </p>
              <h2
                id="wes-work-title"
                className="mt-3 text-[1.65rem] font-semibold tracking-tight text-white md:text-3xl"
              >
                Projetos em destaque
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-neutral-500 md:text-[0.95rem]">
                Confira uma seleção dos principais projetos — um por vez, com a
                mesma identidade e rigor de entrega.{" "}
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-neutral-300/95 underline decoration-white/20 underline-offset-4 transition hover:text-white hover:decoration-white/40"
                >
                  Ver todos
                </a>
              </p>

              <WorkFeaturedCarousel
                active={projectSlide}
                onSelect={setProjectSlide}
              />
            </div>
          </div>
        </section>

        <WesSkillsShowcase />

        <section
          id="education"
          className="mt-20 scroll-mt-28 border-t border-white/[0.07] pt-16 md:mt-24 md:pt-20"
          aria-labelledby="wes-education-title"
        >
          <div className="mx-auto max-w-3xl text-center md:text-left">
            <p className="wes-label-mono text-[0.68rem] font-medium uppercase tracking-[0.38em] text-neutral-500">
              Formação
            </p>
            <h2
              id="wes-education-title"
              className="mt-3 text-[1.65rem] font-semibold tracking-tight text-white md:text-3xl"
            >
              Educação
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-500 md:text-[0.95rem]">
              Cursos e formação acadêmica que sustentam a base técnica por trás
              dos projetos — atualize esta seção com instituição, curso e
              período.
            </p>
          </div>
        </section>

        <ContactSection />
        </div>

        <Footer />
      </div>
    </div>
  );
}
