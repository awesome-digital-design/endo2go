# CLAUDE.md — Endo2Go

Context for Claude Code working on this repo.

## What it is
Endo2Go is a mobile-first PWA that helps people with endometriosis scan a restaurant menu (photo) and see which dishes fit their personal diet, plus concrete questions to ask the chef — in the user's language and the menu's language. Tone: warm, supportive, benefits-focused. Health-adjacent, so accuracy and honesty about uncertainty matter; nothing is presented as medical guarantee.

## Stack
- React 19 + Vite + TypeScript + Tailwind v4 + shadcn/ui (Radix primitives), lucide-react, sonner.
- Hosted on Vercel (frontend + serverless functions). PWA via vite-plugin-pwa.
- Brand: `--primary` is magenta `#E3027F`; status success green `#26A65B`, warning orange `#FFC857`. Theme tokens in `src/index.css`.

## Architecture
- **Frontend** collects input and renders results. Flow state machine in `src/hooks/useFlow.ts`: first run `welcome → profile → capture → analyze → results`; returning users (saved profile) start at `capture`.
- **Backend** is one serverless function `api/analyze-menu.ts` (Node ESM). It calls the Gemini API via plain `fetch` (no SDK). Model fallback chain `["gemini-3.5-flash","gemini-3.1-flash-lite"]` (flash primary for accuracy, lite as overload fallback), with per-attempt AbortController timeout + retry/backoff, wrapped in try/catch. Structured output via `responseMimeType: "application/json"` + `responseSchema`.
  - Helpers: `api/_prompt.ts` (`SYSTEM_PROMPT`, `buildUserText`), `api/_schema.ts` (`responseSchema`). **Imports between api files use the `.js` extension** (NodeNext ESM) — extensionless or `.ts` breaks the production build.
- **Onboarding is fully local** (no AI call): a guided stepped form (checkboxes + per-step notes) that compiles to a natural-language `sensitivities` string. See `OnboardingSteps`.

## Key files
- `src/hooks/useFlow.ts` — flow/state machine, runAnalysis (POST `/api/analyze-menu`), profile edit return logic.
- `src/lib/content.ts` — single source of truth for UI texts, `onboardingSteps`, `dietaryOptions`, `languageOptions`.
- `src/lib/profile.ts` — localStorage profile + `compileSensitivities()` + migrations.
- `src/lib/image.ts` — client-side image downscale before upload.
- `src/components/screens/` — WelcomeScreen, OnboardingSteps, CaptureScreen, AnalyzeScreen, ResultsScreen.
- `src/components/ProfileSummary.tsx`, `src/components/WaiterCard.tsx` (per-dish "toon aan de ober").
- `src/types/domain.ts` — `UserProfile` (v3), `DishResult`, `MenuAnalysis`, `AnalyzeRequest`.
- `src/lib/mock.ts` — mock analysis for UI work without API calls.

## Data & privacy (hard constraint)
- **No server-side storage, no accounts, no database.** The profile lives ONLY in `localStorage` (key `endo2go.profile`). Photos are never stored — base64 in-memory during the request only.
- Per analysis, the photo(s) + the user's `sensitivities` text + `dietary` are sent transiently to Gemini. The API key is server-side only (`process.env.GEMINI_API_KEY`, no `VITE_` prefix), in `.env.local` (gitignored) and in Vercel env vars.

## Diet logic
- Universal exclusions ALWAYS applied regardless of profile: pork, MSG/E-621, ready-made meals.
- `dietary` (omnivore/vegetarian/vegan) is a hard filter.
- The user's free-text profile describes both what works for them AND what they avoid. **Personal tolerances override the generic rules** (e.g. "sourdough is fine" → don't flag bread). Universal exclusions + dietary cannot be overridden.
- Bias toward helpful: prefer `possibly_suitable` + a chef question over excluding; only return "no suitable dishes" when essentially nothing can be adapted (fast food etc.).
- Per dish: `ask_user` (user's language) + `ask_menu` (menu language; empty if same language). Confidence high/medium/low.
- Source of the diet rules: `SAMENVATTING_DIEET.md` (cookbook by Stephanie van Hulst, TCM-based) — see the Google Drive "Endo2Go Claude" folder. Don't copy the book's text verbatim.

## Run / deploy
- `vercel dev` → app + `/api` on http://localhost:3000 (use this for anything that calls the analysis).
- `npm run dev` → UI only on :5173 (no `/api`, analysis won't work).
- `npx tsc --noEmit` to type-check; `npm run build` to verify the production build.
- Deploy: `vercel --prod`. Env changes require a redeploy.

## Planning docs (Google Drive "Endo2Go Claude" folder)
PROJECT_CONTEXT.md, STAPPENPLAN.md, SAMENVATTING_DIEET.md, ONBOARDING_VRAGEN.md.
