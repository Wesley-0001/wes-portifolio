import {
  Clock,
  Globe,
  HelpCircle,
  Mail,
  RefreshCw,
  Terminal as TerminalIcon,
  User,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CONTACT } from "./contact";
import { projects } from "./data/projects";
import WesLanding from "./site/WesLanding";
import VerboGame from "./games/verbo/VerboGame";

type LineVariant =
  | "normal"
  | "accent"
  | "muted"
  | "error"
  | "success"
  | "warning"
  | "info";

interface TerminalLine {
  id: string;
  text: string;
  variant?: LineVariant;
  isInstant?: boolean;
}

type QueueAction =
  | {
      type: "line";
      text: string;
      variant?: LineVariant;
      speed?: number;
      instant?: boolean;
    }
  | { type: "pause"; ms: number }
  | { type: "clear" }
  | { type: "boot_complete" }
  | { type: "switch_site" }
  | { type: "switch_termo" };

const COMMANDS = [
  "home",
  "portfolio",
  "open",
  "about",
  "uptime",
  "contact",
  "help",
  "clear",
  "theme",
  "sound",
];

const THEMES = {
  aizen: { bg: "#0b0f14", fg: "#c4cad1", accent: "#7bb531" },
  green: { bg: "#0a0e12", fg: "#00ff41", accent: "#00ff41" },
  amber: { bg: "#0b0c0e", fg: "#ffb000", accent: "#ffb000" },
  blue: { bg: "#080f18", fg: "#00d0ff", accent: "#00d0ff" },
};

export default function App() {
  const [mode, setMode] = useState<"bbs" | "site" | "termo">("bbs");
  const [output, setOutput] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isBooting, setIsBooting] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTheme, setCurrentTheme] =
    useState<keyof typeof THEMES>("aizen");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [bbsFadeOut, setBbsFadeOut] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queueRef = useRef<QueueAction[]>([]);
  const bootStartedRef = useRef(false);

  const addLine = useCallback(
    (text: string, variant: LineVariant = "normal", isInstant = false) => {
      const id = Math.random().toString(36).substring(7);
      setOutput((prev) => [...prev, { id, text, variant, isInstant }]);
    },
    [],
  );

  const processQueue = useCallback(async () => {
    if (isTyping || queueRef.current.length === 0) return;

    setIsTyping(true);
    const action = queueRef.current.shift();
    if (!action) {
      setIsTyping(false);
      return;
    }

    if (action.type === "line") {
      if (action.instant) {
        addLine(action.text, action.variant, true);
      } else {
        const id = Math.random().toString(36).substring(7);
        let displayedText = "";

        setOutput((prev) => [
          ...prev,
          { id, text: "", variant: action.variant },
        ]);

        for (let i = 0; i <= action.text.length; i++) {
          displayedText = action.text.substring(0, i);
          setOutput((prev) =>
            prev.map((line) =>
              line.id === id ? { ...line, text: displayedText } : line,
            ),
          );
          await new Promise((r) => setTimeout(r, action.speed || 20));
        }
      }
    } else if (action.type === "pause") {
      await new Promise((r) => setTimeout(r, action.ms));
    } else if (action.type === "clear") {
      setOutput([]);
    } else if (action.type === "boot_complete") {
      setIsBooting(false);
    } else if (action.type === "switch_site") {
      setBbsFadeOut(true);
      await new Promise((r) => setTimeout(r, 450));
      setMode("site");
      setBbsFadeOut(false);
    } else if (action.type === "switch_termo") {
      setBbsFadeOut(true);
      await new Promise((r) => setTimeout(r, 450));
      setMode("termo");
      setBbsFadeOut(false);
    }

    setIsTyping(false);
    processQueue();
  }, [isTyping, addLine]);

  const enqueue = (items: QueueAction[]) => {
    queueRef.current.push(...items);
    processQueue();
  };

  useEffect(() => {
    if (bootStartedRef.current) return;
    bootStartedRef.current = true;

    const bootLines: QueueAction[] = [
      {
        type: "line",
        text: "establishing secure session...",
        variant: "muted",
        speed: 30,
      },
      { type: "pause", ms: 400 },
      {
        type: "line",
        text: "theme: aizen dark",
        variant: "info",
        speed: 10,
      },
      {
        type: "line",
        text: "terminal: vt-220 · cols 100 · rows 30",
        variant: "muted",
        speed: 10,
      },
      {
        type: "line",
        text: "modules: theme, portfolio, contact, uptime, about, help",
        variant: "muted",
        speed: 10,
      },
      { type: "pause", ms: 300 },
      {
        type: "line",
        text: "\nwes.interface 1.0",
        variant: "muted",
        speed: 10,
      },
      { type: "pause", ms: 800 },
      {
        type: "line",
        text: "wes.interface online",
        variant: "success",
        speed: 12,
      },
      { type: "pause", ms: 200 },
      {
        type: "line",
        text: "\nwelcome to wes experience",
        variant: "accent",
        speed: 28,
      },
      {
        type: "line",
        text: "data. systems. digital product",
        variant: "muted",
        speed: 28,
      },
      {
        type: "line",
        text: "type enter to continue\n",
        variant: "muted",
        speed: 28,
      },
      { type: "boot_complete" },
    ];

    enqueue(bootLines);

    return () => {};
  }, []);

  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };

    scrollToBottom();
    const timeout = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timeout);
  }, [output, isTyping]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const [command, ...args] = trimmed.split(" ");

    if (command !== "clear") {
      enqueue([{ type: "clear" }]);
    }

    switch (command) {
      case "enter":
        enqueue([
          {
            type: "line",
            text: "opening visual interface...",
            variant: "info",
            speed: 18,
          },
          { type: "pause", ms: 520 },
          { type: "switch_site" },
        ]);
        break;
      case "clear":
        setOutput([]);
        break;
      case "help":
      case "home":
        enqueue([
          {
            type: "line",
            text: "commands:",
            variant: "info",
            instant: true,
          },
          {
            type: "line",
            text: "portfolio".padEnd(20) + "work",
            variant: "accent",
            speed: 8,
          },
          {
            type: "line",
            text: "about".padEnd(20) + "profile",
            variant: "accent",
            speed: 8,
          },
          {
            type: "line",
            text: "uptime".padEnd(20) + "status",
            variant: "accent",
            speed: 8,
          },
          {
            type: "line",
            text: "contact".padEnd(20) + "links",
            variant: "accent",
            speed: 8,
          },
          {
            type: "line",
            text: "theme".padEnd(20) + "palette",
            variant: "accent",
            speed: 8,
          },
          {
            type: "line",
            text: "clear".padEnd(20) + "reset screen",
            variant: "accent",
            speed: 8,
          },
          {
            type: "line",
            text: "help".padEnd(20) + "this list",
            variant: "accent",
            speed: 8,
          },
          { type: "pause", ms: 200 },
          {
            type: "line",
            text: "\nhome or click footer for commands.",
            variant: "muted",
            instant: true,
          },
        ]);
        break;
      case "portfolio": {
        const portfolioLines: QueueAction[] = [
          {
            type: "line",
            text: "PORTFOLIO",
            variant: "info",
            instant: true,
          },
          { type: "line", text: "\n", variant: "muted", instant: true },
        ];
        projects.forEach((p, i) => {
          const num = String(i + 1).padStart(2, "0");
          const title =
            p.title.length > 36 ? `${p.title.slice(0, 33)}...` : p.title;
          const padded = title.padEnd(36);
          portfolioLines.push({
            type: "line",
            text: `${num}  ${padded} ${p.category}`,
            variant: "accent",
            speed: 6,
          });
        });
        const openHints = projects
          .map((_, i) => `"OPEN ${String(i + 1).padStart(2, "0")}"`)
          .join(" · ");
        portfolioLines.push(
          {
            type: "line",
            text: `\nTYPE ${openHints}`,
            variant: "muted",
            instant: true,
          },
          {
            type: "line",
            text: "INPUT OR CLICK 'HOME' TO LIST AVAILABLE COMMANDS.",
            variant: "muted",
            instant: true,
          },
        );
        enqueue(portfolioLines);
        break;
      }
      case "open": {
        const rawId = args[0];
        if (!rawId) {
          addLine("usage: open <id>", "error");
          break;
        }
        const id =
          /^\d+$/.test(rawId) ? rawId.padStart(2, "0") : rawId.toLowerCase();
        if (id === "01") {
          enqueue([
            {
              type: "line",
              text: "opening visual interface...",
              variant: "info",
              speed: 18,
            },
            { type: "pause", ms: 520 },
            { type: "switch_site" },
          ]);
        } else if (id === "02") {
          enqueue([
            {
              type: "line",
              text: "loading termo...",
              variant: "info",
              speed: 18,
            },
            { type: "pause", ms: 520 },
            { type: "switch_termo" },
          ]);
        } else if (id === "03") {
          enqueue([
            {
              type: "line",
              text: "barbearia da tropa — projeto em andamento.",
              variant: "info",
              speed: 18,
            },
            {
              type: "line",
              text: "demo ainda não disponível. acompanhe pelo portfólio visual.",
              variant: "muted",
              speed: 14,
            },
            { type: "pause", ms: 400 },
            {
              type: "line",
              text: "\nhome for commands.",
              variant: "muted",
              instant: true,
            },
          ]);
        } else {
          addLine(`invalid experience id: ${rawId}`, "error");
        }
        break;
      }
      case "view":
        const search = args.join(" ").toLowerCase();
        const searchIdx = parseInt(search);
        const project = projects.find(
          (p, idx) =>
            (!isNaN(searchIdx) && idx + 1 === searchIdx) ||
            p.id === search ||
            p.title.toLowerCase() === search,
        );
        if (project) {
          enqueue([
            {
              type: "line",
              text: `» ${project.title}`,
              variant: "accent",
              speed: 20,
            },
            {
              type: "line",
              text: `${project.description}`,
              speed: 10,
            },
            {
              type: "line",
              text: `stack: ${project.category}`,
              variant: "info",
              instant: true,
            },
            {
              type: "line",
              text: `links: ${project.link ? `[demo: ${project.link}] ` : ""}`,
              variant: "success",
              instant: true,
            },
            {
              type: "line",
              text: "\nportfolio to list.",
              variant: "muted",
              instant: true,
            },
          ]);
        } else {
          addLine(`not found: ${search}`, "error");
        }
        break;
      case "about":
        enqueue([
          { type: "line", text: "about", variant: "accent", speed: 24 },
          {
            type: "line",
            text: "full-stack · react, typescript, node.",
            speed: 10,
          },
          {
            type: "line",
            text: "web systems · interfaces · product.",
            speed: 10,
          },
          {
            type: "line",
            text: "\nhome for commands.",
            variant: "muted",
            instant: true,
          },
        ]);
        break;
      case "uptime": {
        const now = new Date();
        const startDate = new Date("2026-02-28T19:28:00");
        const diffMs = now.getTime() - startDate.getTime();
        const uptimeDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const uptimeHours = Math.floor(
          (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const uptimeMinutes = Math.floor(
          (diffMs % (1000 * 60 * 60)) / (1000 * 60),
        );
        const uptimeSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        const uptimeStr = `${uptimeDays} days, ${String(uptimeHours).padStart(2, "0")}:${String(uptimeMinutes).padStart(2, "0")}:${String(uptimeSeconds).padStart(2, "0")}`;
        enqueue([
          {
            type: "line",
            text: `status: online`,
            variant: "success",
            speed: 20,
          },
          {
            type: "line",
            text: `uptime: ${uptimeStr}`,
            speed: 10,
          },
          {
            type: "line",
            text: `local: ${now.toLocaleTimeString()} ${now.toLocaleDateString()}`,
            speed: 10,
          },
          { type: "line", text: `tz: brazil · brasilia`, speed: 10 },
          {
            type: "line",
            text: "\nhome for commands.",
            variant: "muted",
            instant: true,
          },
        ]);
        break;
      }
      case "contact":
        enqueue([
          {
            type: "line",
            text: "contact",
            variant: "accent",
            speed: 20,
          },
          {
            type: "line",
            text: `email: ${CONTACT.email}`,
            variant: "info",
            speed: 10,
          },
          {
            type: "line",
            text: `linkedin: ${CONTACT.linkedin}`,
            variant: "info",
            speed: 10,
          },
          {
            type: "line",
            text: `site: ${CONTACT.site}`,
            variant: "info",
            speed: 10,
          },
          {
            type: "line",
            text: "\nhome for commands.",
            variant: "muted",
            instant: true,
          },
        ]);
        break;
      case "theme":
        const themeName = args[0] as keyof typeof THEMES;
        if (args.length === 0) {
          enqueue([
            {
              type: "line",
              text: "themes:",
              variant: "info",
              instant: true,
            },
            {
              type: "line",
              text: "aizen".padEnd(15) + "default",
              variant: "accent",
              speed: 10,
            },
            {
              type: "line",
              text: "green".padEnd(15) + "matrix",
              variant: "accent",
              speed: 10,
            },
            {
              type: "line",
              text: "amber".padEnd(15) + "crt",
              variant: "accent",
              speed: 10,
            },
            {
              type: "line",
              text: "blue".padEnd(15) + "cyber",
              variant: "accent",
              speed: 10,
            },
            {
              type: "line",
              text: "\nusage: theme <name>",
              variant: "muted",
              instant: true,
            },
          ]);
        } else if (THEMES[themeName]) {
          setCurrentTheme(themeName);
          addLine(`theme: ${themeName}`, "success");
        } else {
          addLine(
            `unknown theme. try: aizen, green, amber, blue`,
            "error",
          );
        }
        break;
      case "sound":
        addLine("sound: off", "muted");
        break;
      case "":
        break;
      default:
        addLine(`command not found: ${command}`, "error");
        break;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (input) {
        handleCommand(input);
        setHistory((prev) => [input, ...prev]);
        setHistoryIndex(-1);
        setInput("");
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const matches = COMMANDS.filter((c) =>
        c.startsWith(input.toLowerCase()),
      );
      if (matches.length === 1) {
        setInput(matches[0]);
      }
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const getLineClass = (variant?: LineVariant) => {
    switch (variant) {
      case "accent":
        return "text-aizen-yellow font-bold";
      case "muted":
        return "text-aizen-fg opacity-90";
      case "error":
        return "text-aizen-red";
      case "success":
        return "text-aizen-green";
      case "warning":
        return "text-aizen-yellow";
      case "info":
        return "text-aizen-cyan";
      default:
        return "text-aizen-fg";
    }
  };

  const renderLineContent = (line: TerminalLine) => {
    const text = line.text;

    if (text.includes("pages ")) {
      const parts = text.split(" ");
      return (
        <span>
          {parts.map((part, i) => {
            const num = parseInt(part);
            if (!isNaN(num)) {
              return (
                <React.Fragment key={i}>
                  <span
                    className="underline cursor-pointer hover:text-aizen-green"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCommand(`portfolio ${num}`);
                    }}
                  >
                    {part}
                  </span>
                  {i < parts.length - 1 ? " " : ""}
                </React.Fragment>
              );
            }
            return <span key={i}>{part} </span>;
          })}
        </span>
      );
    }

    let elements: React.ReactNode[] = [];
    let remainingText = text;

    while (remainingText.length > 0) {
      let matchFound = false;

      const tagMatch = remainingText.match(
        /^(\s{2,})(WEB[|/]APP|WEB|APP|MOBILE|API|FULLSTACK|SHOP)/i,
      );
      if (tagMatch) {
        const spaces = tagMatch[1];
        const tag = tagMatch[2];
        elements.push(spaces);
        elements.push(
          <span key={elements.length} className="text-gray-400 italic">
            {tag}
          </span>,
        );
        remainingText = remainingText.substring(tagMatch[0].length);
        matchFound = true;
      }

      if (matchFound) continue;

      const indexMatch = remainingText.match(/^(\d{2})(\s{2})/);
      if (indexMatch) {
        const idxStr = indexMatch[1];
        const spaces = indexMatch[2];
        elements.push(
          <span
            key={elements.length}
            className="underline decoration-1 underline-offset-4 cursor-pointer hover:opacity-80"
            onClick={(e) => {
              e.stopPropagation();
              handleCommand(`open ${idxStr}`);
            }}
          >
            {idxStr}
          </span>,
        );
        elements.push(spaces);
        remainingText = remainingText.substring(indexMatch[0].length);
        matchFound = true;
      }

      if (matchFound) continue;

      const sortedProjects = [...projects].sort(
        (a, b) => b.title.length - a.title.length,
      );
      for (const project of sortedProjects) {
        const title = project.title;
        const index = remainingText.toLowerCase().indexOf(title.toLowerCase());
        if (index === 0) {
          const matchText = remainingText.substring(0, title.length);
          elements.push(
            <span
              key={elements.length}
              className="underline decoration-1 underline-offset-4 cursor-pointer hover:opacity-80"
              onClick={(e) => {
                e.stopPropagation();
                if (project.link) {
                  window.open(project.link, "_blank", "noopener,noreferrer");
                } else {
                  handleCommand(`view ${project.title}`);
                }
              }}
            >
              {matchText}
            </span>,
          );
          remainingText = remainingText.substring(title.length);
          matchFound = true;
          break;
        }
      }

      if (matchFound) continue;

      const sortedCommands = [...COMMANDS].sort((a, b) => b.length - a.length);
      for (const cmd of sortedCommands) {
        const index = remainingText.toLowerCase().indexOf(cmd);
        if (index === 0) {
          const matchText = remainingText.substring(0, cmd.length);
          elements.push(
            <span
              key={elements.length}
              className="underline decoration-1 underline-offset-4 cursor-pointer hover:opacity-80"
              onClick={(e) => {
                e.stopPropagation();
                handleCommand(cmd.toLowerCase());
              }}
            >
              {matchText}
            </span>,
          );
          remainingText = remainingText.substring(cmd.length);
          matchFound = true;
          break;
        }
      }

      if (matchFound) continue;

      elements.push(remainingText[0]);
      remainingText = remainingText.substring(1);
    }

    return <span>{elements}</span>;
  };

  if (mode === "termo") {
    return (
      <>
        <button
          type="button"
          onClick={() => setMode("bbs")}
          className="fixed top-7 right-7 z-50 px-5 py-2.5 text-sm font-medium tracking-wide rounded-full border border-white/10 bg-white/[0.06] backdrop-blur-md text-neutral-200/95 shadow-sm transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out hover:bg-white/10 hover:border-white/18 hover:shadow-md active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/25"
        >
          ⌘ terminal
        </button>
        <VerboGame />
      </>
    );
  }

  if (mode === "site") {
    return (
      <WesLanding
        onBack={() => setMode("bbs")}
      />
    );
  }

  return (
    <div
      className={`h-screen w-full flex flex-col p-6 md:p-12 relative overflow-hidden transition-opacity duration-500 ease-out ${
        bbsFadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        backgroundColor: THEMES[currentTheme].bg,
        color: THEMES[currentTheme].fg,
      }}
      onClick={focusInput}
    >
      <div className="crt-overlay" />
      <div className="crt-vignette" />
      <div className="scanline" />
      <div className="terminal-grid" />

      <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-4 z-10">
        <div className="flex items-center gap-3">
          <TerminalIcon size={24} className="text-aizen-green" />
          <span className="text-lg tracking-wide opacity-80">
            wes@interface: ~
          </span>
        </div>
        <div className="flex gap-6 text-sm opacity-50 tracking-tight">
          <span className="hidden sm:inline">vt-220</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </header>

      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto min-h-0 z-10 scroll-smooth pr-4 crt-flicker mb-4"
      >
        <div className="space-y-[0.65rem] leading-[1.58]">
          {output.map((line) => (
            <div
              key={line.id}
              className={`whitespace-pre-wrap ${getLineClass(line.variant)}`}
            >
              {renderLineContent(line)}
            </div>
          ))}

          {!isBooting && (
            <div className="flex items-center gap-3 pt-4">
              <span className="text-aizen-green font-bold">$</span>
              <div className="relative flex-1 ">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  autoFocus
                  className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-aizen-fg caret-transparent cursor-none"
                  spellCheck={false}
                  autoComplete="off"
                />
                <div
                  className="absolute inset-0 pointer-events-none flex items-center"
                  style={{ color: THEMES[currentTheme].fg }}
                >
                  <span>{input}</span>
                  <span className="w-[0.65ch] min-w-[2px] h-[1.05em] rounded-[1px] bg-current/90 ml-[2px] cursor-blink" />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {!isBooting && (
        <footer className="z-10 border-t border-white/10 pt-6 mt-auto">
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center items-center">
            {[
              { name: "home", icon: <RefreshCw size={14} /> },
              { name: "portfolio", icon: <Globe size={14} /> },
              { name: "about", icon: <User size={14} /> },
              { name: "uptime", icon: <Clock size={14} /> },
              { name: "contact", icon: <Mail size={14} /> },
              { name: "help", icon: <HelpCircle size={14} /> },
              { name: "clear", icon: <RefreshCw size={14} /> },
            ].map((item) => (
              <button
                key={item.name}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCommand(item.name);
                }}
                className="flex items-center flex-1 gap-2 px-3 py-1.5 border border-white/10 hover:border-aizen-green hover:text-aizen-green transition-all cursor-pointer text-[10px] md:text-xs tracking-wide opacity-80 hover:opacity-100 bg-black/20 lowercase"
              >
                <span className="opacity-70">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </div>
        </footer>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root {
          --aizen-bg: ${THEMES[currentTheme].bg};
          --aizen-fg: ${THEMES[currentTheme].fg};
          --aizen-accent: ${THEMES[currentTheme].accent};
        }
        .text-aizen-fg { color: ${THEMES[currentTheme].fg}; }
        .text-aizen-green { color: ${THEMES[currentTheme].accent}; }
        .text-aizen-yellow { color: ${currentTheme === "aizen" ? "#e8942a" : THEMES[currentTheme].accent}; }
        .text-aizen-red { color: ${currentTheme === "aizen" ? "#e84c32" : THEMES[currentTheme].fg}; }
        .text-aizen-cyan { color: ${currentTheme === "aizen" ? "#00FFFF" : THEMES[currentTheme].accent}; }
      `,
        }}
      />
    </div>
  );
}
