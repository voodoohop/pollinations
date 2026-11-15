[![Made with pollinations.ai](https://raw.githubusercontent.com/pollinations/pollinations/main/packages/ui/src/brand/badge-made-with.svg)](https://pollinations.ai/?ref=badge)

# Decision Arena — Grid Rush

**A game that AI models play.** Decision models on Pollinations play *Grid Rush*, a deterministic
snake-like collection game, and you watch them race.

- 15×15 grid, snake starts center-left (length 3, moving right)
- 20 pellets placed by a seeded RNG (mulberry32) — **same seed = same pellet layout for both racers**
- Each tick: move 1 cell; eat a pellet → +1 score, +1 grow; hit a wall or your own body → game over; 200 tick max
- Every tick the model is asked for its move with a strict output format: `DIRECTION: up|down|left|right`
  (temperature 0, parsed defensively with a regex, fallback = keep current direction)
- Deterministic engine + recorded move lists → every run can be **replayed** exactly (▶ replay on the leaderboard)

Inspired by Opper decision benchmarks (seeded games, hand-written bots as reference entries) and
Simon Willison's Battle Drones (deterministic sim enables replays; AI-vs-AI spectator is the content).

## Racers

**Decision models (the stars)** — each move is a chat-completion call on your own Pollen:

| Model |
| --- |
| `typesafe/jev-1.14` |
| `perplexity/pplx-decider-v1.2` |
| `vllm-sr/d3` |
| `microsoft/microsoft-decision-1` |
| `openai/gpt-6-luna-decisions` |
| `liquid/d1` |
| `jaredpalmer/kev-4b` |
| `respan/span-01-lite` |

Plus two plain text models for fun: `openai/gpt-5.4-nano`, `google/gemini-3.5-flash-lite`.

**Reference bots** (unranked, free, no API key needed) — shown separately, per Opper convention:

- `random` — seeded random turn with 15% chance per tick
- `greedy` — moves toward the nearest pellet while avoiding immediate death

## Modes

- **Race** — pick any 2 racers (models, bots, or a mix) + a seed; both run the same seed in parallel
  on a split screen, animated tick by tick, with live scores and a winner banner.
- **Solo** — one racer for score.
- **Leaderboard** — every run is saved to `localStorage` (racer, model, mode, seed, score, ticks, date),
  sortable, with JSON export and a ▶ replay button that re-runs the recorded game animated.

## How to run

No build step:

```bash
cd pollinations-arena
python3 -m http.server 8080
# open http://localhost:8080
```

Reference bots work immediately with no key. To let AI models play, press **Connect** (top right)
and link your Pollen — model moves are charged to your own Pollen (BYOP: Bring Your Own Pollen).
A 200-tick game is up to 200 model calls, so races with two model racers can use a noticeable
amount of Pollen; bots are always free.

## Endpoints used

| Endpoint | Purpose |
| --- | --- |
| `POST https://gen.pollinations.ai/v1/chat/completions` | Ask a decision model for its next move (temperature 0, BYOP key) |
| `GET https://enter.pollinations.ai` | `<polli-connect>` BYOP key flow (via `@pollinations/ui` connect.js CDN) |
| `GET https://cdn.jsdelivr.net/npm/@pollinations/ui@0.1.0-alpha.20/dist/connect.js` | Connect web component |

## BYOP note

This app uses **BYOP (Bring Your Own Pollen)**: there is no shared key. Each user connects their own
Pollen with the button in the header; every model move during a game costs the *user's* Pollen.
Reference bots (`random`, `greedy`) are hand-written and cost nothing.

Credit Pollinations — Made with pollinations.ai
