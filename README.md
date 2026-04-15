# wes.interface

## Preview

There is no checked-in GIF in this repo; run the app locally to see the interface (see [Run it locally](#run-it-locally)).

**A terminal-native portfolio you actually use — not scroll.**

wes.interface is a personal product surface: a browser-based CLI that behaves like a late-century BBS session, wrapped in CRT treatment and keyboard-first flow. It is how I present work, contact, and play — one coherent experience instead of a static grid of cards.

---

## What this is

This repository ships **wes.interface**, my interactive portfolio. Navigation is command-driven: you type, the system responds, history and tab completion behave like a real shell. Under the hood it is a deliberate constraint — **terminal + interface + product** — where the “UI” is the protocol (commands, prompts, themes), not a pile of decorative sections.

A second mode opens a **graphical landing** when the session asks for it; a third drops you into **TERMO** without leaving the world of the app. Same identity, different layers.

---

## TERMO — play inside the portfolio

**TERMO** is a word-guessing game (Portuguese Wordle-style) built into the same shell. It is not a tacked-on iframe: it is part of the experience — something to launch from the terminal, play, and return from. The goal is simple: guess the word with tight feedback, same ritual as the daily puzzle genre, but sitting inside **wes.interface** as a deliberate break from “read my résumé” energy.

---

## Concept in one line

**Terminal** sets the rules (text, commands, rhythm). **Interface** is how those rules become legible on screen (CRT, typography, themes). **Product** is the whole: portfolio, contact, optional site view, and TERMO — shipped as one authored piece, not a theme demo.

---

## Stack (short)

React, TypeScript, Vite, Tailwind CSS — enough to move fast and keep the surface sharp. Visuals lean on CSS (scanlines, flicker, themes) and a monospace voice; no need for a longer table.

---

## Run it locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. For a production build: `npm run build` then `npm run preview`.

---

## Authorship

**wes.interface** (including TERMO as shipped here) is an authored project by **wes**.

**GitHub:** [github.com/Wesley-0001](https://github.com/Wesley-0001)

---

## Extending the portfolio

New work is registered in `src/data/projects.ts` — the CLI reads from there.

---

## Deploy

Static output (`dist/` after `npm run build`) works on any static host — Vercel, GitHub Pages, or a CDN of your choice.
