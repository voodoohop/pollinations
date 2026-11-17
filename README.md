# LLM Voice Lab

[![Made with pollinations.ai](https://raw.githubusercontent.com/pollinations/pollinations/main/packages/ui/src/brand/badge-made-with.svg)](https://pollinations.ai/?ref=badge)

**Four tools about the LLM voice** — the recognizable way language models write. Built for Pollinations.ai quest #19180 ("An app, tool or agent about the LLM voice").

The reference is Martin Fowler's [LLM Voice bliki](https://martinfowler.com/bliki/LlmVoice.html): the LLM voice is *not* mainly about em-dashes. It is the clichéd extended metaphors ("load-bearing tapestries"), corporate jargon, smoothness-without-soul, and uniform rhythm. A genuine human's clunky prose is preferable — this lab measures it, plays with it, and strips it out.

## What it does

1. **Voice Scanner** — paste text and get an instant 0–100 "LLM-voice likelihood" score computed **entirely in your browser** (regex markers, sentence-rhythm statistics, formatting density): em-dash density, "not just X but Y", rule-of-three lists, tapestry/weave/landscape/journey/embark/delve metaphors, moreover/furthermore scaffolding, "it's important to note", "in conclusion", "at the end of the day", hedging ("arguably", "to some extent"), "plays a crucial role", "navigate the complexities", uniform sentence rhythm (stdev of sentence lengths), bold/header density. Marker-by-marker breakdown with counts and highlighted quotes, plus a verdict ("Reads human: refreshingly clunky" ↔ "Textbook LLM voice: load-bearing tapestries detected"). A **Deep analysis** button then asks a Pollinations model for style-level markers regexes miss (soulless smoothness, clichéd extended metaphors), returned as loosely-parsed JSON.
2. **Voice Compare** — one paragraph in, the same request ("rewrite this text in your natural voice, same meaning") goes to 3 models **in parallel** (openai/gpt-5.4, deepseek/deepseek-v4.1-flash, x-ai/grok-4.6). Each rewrite is scored locally for LLM voice, shown side by side, then a jury model (mistralai/mistral-large-3) streams a short paragraph on which one sounds most human and why.
3. **Human or Model** — a 10-round game. Each round shows either a real public-domain human passage (Austen, Twain, Dickens, Woolf, Melville, Thoreau, Brontë, Conrad, Darwin, Hemingway, Defoe, Barrie, Grahame, Hamilton, Wilde, Johnson, Einstein…) or a fresh model generation (varied prompts, temperature 1.0, asked for 2–4 casual sentences — it still has LLM voice). Guess "Human" or "AI model", get immediate feedback with the marker that gave it away, running score, and a final tally with a rating.
4. **Deslopper** — paste text and a model (openai/gpt-5.4) rewrites it to keep the meaning but remove AI-sounding patterns: no em-dash chains, no rule-of-three, no tapestry metaphors, varied sentence length, allowed clunky humanity. Output **streams live**; local voice scores are computed before and after and the delta is shown.

## Run it

Pure static site — no build step, no npm. Serve the directory (or just open `index.html`):

```bash
cd pollinations-llmvoice
python3 -m http.server 8080   # then open http://localhost:8080
```

Model calls need **your own Pollen**: press the **Connect** button top-right (BYOP — bring your own pollen). The local Voice Scanner works with no connection at all.

## Endpoints used

| Endpoint | Used for |
|---|---|
| `POST https://gen.pollinations.ai/v1/chat/completions` | Deep analysis, Voice Compare (3 rewrites + jury), Human-or-Model generations |
| `POST https://gen.pollinations.ai/v1/chat/completions` (`stream: true`) | Jury verdict, Deslopper live output |
| `https://enter.pollinations.ai` (via `<polli-connect>` web component) | BYOP key connection |
| `https://cdn.jsdelivr.net/npm/@pollinations/ui@.../dist/connect.js` | Connect component loader |

## Files

- `index.html` — the four-tab interface
- `app.js` — all logic: heuristics, 4 tools, wiring
- `pollinations.js`, `polli-common.js`, `polli.css` — shared Pollinations foundation (unmodified copies)
- `README.md` — this file

## BYOP note

This app does not ship an API key. Every model call runs on the connected user's own Pollen (Connect button, top-right); nothing is spent until you press it. App key: `pk_lT4to0x2XzMoK8f1` (identifies the app, not a user secret).

Credit Pollinations — Made with pollinations.ai
