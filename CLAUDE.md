# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A German-language recreation of **ILeA plus** (Brandenburg's digital "Individuelle Lernstandsanalyse") with sample
diagnostic tasks for the start of grade 2. Vite + React 19 + TypeScript, no backend. All UI text, task content and
code comments are in German; identifiers are English. Reference material: the LISUM handbook
(`ILeAplus-komp.pdf`, linked in README) — Mathematik "Teilpaket AB" / Niveaustufe B, Deutsch "Lesen B1" and
"Rechtschreiben B1".

## Commands

```bash
npm run dev          # Vite dev server (http://localhost:5173)
npm run build        # tsc -b && vite build  → dist/
npm run lint         # ESLint 9 flat config (typescript-eslint + react-hooks v7 incl. React Compiler rules)
npm run typecheck    # tsc -b (project references: tsconfig.app.json + tsconfig.node.json)
npm test             # vitest run (jsdom, globals, @testing-library)
npm run test:watch
npx vitest run src/engine/scoring.test.ts          # single file
npx vitest run -t "ZZ: viele Fehler"               # single test by name
```

Vitest config lives in `vite.config.ts` (`test` block); setup file `src/test/setup.ts` loads jest-dom matchers.
`vitest/globals` types are enabled, so tests use `describe/it/expect/vi` without imports.

## Architecture

**Data → Runner → Item views → Responses → Scoring.**

- `src/types.ts` — the whole domain model. `Item` is a discriminated union on `kind` (15 kinds); `Task` groups items
  and carries `area` (Kompetenzbereich) and an optional `timeLimitMs`. `ItemResult` is what a view reports;
  `Response` adds `taskId/itemId/ms/timedOut` and is what gets persisted in a `Session`.
- `src/data/{mathe,deutsch}.ts` — static task packages; `src/data/areas.ts` maps `AreaId` → label/subject.
  `src/data/index.ts` exposes `ALL_TASKS`, `tasksFor(subjects)`, `findTask(id)`.
- `src/tasks/index.tsx` — `ItemView` switch on `item.kind` → one component per kind in `src/tasks/*.tsx`.
  Every view receives `{task, item, first, onAnswer}` and must call `onAnswer(ItemResult)` exactly once.
  `first` = first item of the task → auto-read the instruction. Views that speak item-specific text
  (Context, CompareSpoken, PlaceValue, SpellWord, Syllables, BookCover) pass `speech` + `autoPlay` to `TaskFrame`.
  `NumericTask` is the shared shell for all number-pad answers (OK / ? / trash, ±1 detection via `numericResult`).
- `src/screens/TaskRunner.tsx` — iterates tasks → intro card → items; measures per-item `ms`; enforces
  `timeLimitMs` (remaining items are emitted as `timedOut` responses). Expiry is dispatched through a ref
  (`expireRef`) updated in an effect, because react-hooks v7 forbids setState directly inside effect bodies.
- `src/App.tsx` — screen state machine (`start` → `run` → `finish`, plus `teacher`); persists the session to
  `localStorage` after every response via `src/engine/storage.ts`.
- `src/engine/scoring.ts` — `evaluate(session, tasks)` → per-area scores, three bands
  (`sicher` / `unterwegs` / `foerderbedarf`) and Förderhinweise (codes ZZ, GV, ZF, SW, LF, LF-W, LG, LV, RS)
  with thresholds adapted proportionally from the handbook. Time-limited tasks are banded by words/minute,
  not points. `graphemeHitRatio` (LCS) is used for spelling detail only.
- `src/audio/speech.ts` — thin wrapper over `speechSynthesis` (de-DE). `useGermanVoice()` (`useGermanVoice.ts`)
  reports whether a German voice exists; views whose prompt is audio-only (CompareSpoken, PlaceValue) render the
  German number word as fallback text when it does not. jsdom has no speech API, so tests rely on that fallback.
  Headless Chrome on macOS *does* have German voices, so the fallback is hidden there. `numberWords.ts` provides
  `numberToGerman` (0–999).

## Conventions worth knowing

- Adding an item kind: extend the union in `types.ts`, add a view in `src/tasks/`, register it in
  `src/tasks/index.tsx` (the switch is exhaustive — TS will flag a missing case), add data, and add a consistency
  check in `src/data/tasks.test.ts` if the item has a derivable answer.
- Diagnostic tool, not a quiz: views never show right/wrong to the child. Praise text is neutral.
- `offByOne` on a result means "answer differs by ±1" and feeds the ZF (zählendes Rechnen) hint; only set it for
  numeric answers.
- Rechtschreiben B1 ignores capitalisation (`spellResult`), matching the handbook.
- Teacher area unlock code is `lisum` (hard-coded in `ResultsScreen.tsx`).
- Component tests with fake timers must use `fireEvent` + `act(vi.advanceTimersByTimeAsync)`; `userEvent`
  hangs under `vi.useFakeTimers()` (see `TaskRunner.test.tsx`).
