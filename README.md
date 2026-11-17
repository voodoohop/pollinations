[![Made with pollinations.ai](https://raw.githubusercontent.com/pollinations/pollinations/main/packages/ui/src/brand/badge-made-with.svg)](https://pollinations.ai/?ref=badge)

# AI Debate Stage

Two or more AIs on one stage — and neither knows how to hang up. Put 2–4 personas
(models + TTS voices + persona prompts) on a virtual stage and let them debate, interview
each other, free-chat, or run a therapy session, out loud.

Inspired by the viral **"two AI agents in a job interview and neither knows how to hang up"**
video: in Interview mode the candidate is instructed to end *every* answer with a question
back to the interviewer, so the conversation politely never ends.

Built for Pollinations quest #19178. Credit Pollinations — Made with pollinations.ai.

## What it does

- **Stage setup (2–4 personas)**: name, model, TTS voice, persona prompt.
  Presets: Skeptical scientist, Enthusiastic optimist, Grumpy grandfather,
  Corporate consultant, Poet, Conspiracy uncle.
- **Modes**:
  - **Debate** — one persona argues FOR the topic, one AGAINST.
  - **Interview** — interviewer + candidate; the candidate must end every answer with a question.
  - **Free chat** — open-ended conversation on the topic.
  - **Therapy** — therapist + anxious client.
- **Automatic turns**: 5–15 turns, each model sees the full transcript + its persona +
  the mode rules, ~120 words per turn, chat bubbles alternate left/right with per-persona
  avatar colors, 1.2 s pause between turns.
- **Voices**: toggle `🔊 Voices on` — each turn's text (first 500 chars) is spoken through
  an `<audio>` element using the persona's voice before the next turn starts.
- **Moderator** (optional, `mistralai/mistral-large-3`): interjects every 4 turns with a
  short steering message (e.g. *"You're going in circles — new angle please"*), and at the
  end declares a debate winner with a 2-sentence justification.
- **Human interjection**: type in "interrupt the conversation…" — your message is injected
  as **Human** into the transcript and the AIs respond to it on the next turn.
- **Controls**: start / stop / restart, copy transcript to clipboard, last setup saved to
  localStorage, friendly error if Pollen isn't connected.

## How to run

No build step:

```bash
cd pollinations-debate
python3 -m http.server 8080   # or any static server
# open http://localhost:8080
```

Open the page, press **Connect** (top-right) to link your Pollen (BYOP), pick personas,
a mode and a topic, then **Start conversation**.

## Endpoints used (Pollinations API)

| Endpoint | Method | Used for |
| --- | --- | --- |
| `https://gen.pollinations.ai/v1/chat/completions` | POST | Each persona's turn + moderator interjections/verdict |
| `https://gen.pollinations.ai/audio/{text}?voice=` | GET | TTS per turn via `client.audioUrl(text, {voice})` |
| `https://enter.pollinations.ai` | — | BYOP `<polli-connect>` login flow |

Models offered (all free tier): `openai/gpt-5.4`, `deepseek/deepseek-v4.1-flash`, `z-ai/glm-5.3-flash`,
`x-ai/grok-4.6`, `mistralai/mistral-large-3` (moderator: `mistralai/mistral-large-3`).
Voices: `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`.

## BYOP note

This app uses **BYOP — Bring Your Own Pollen**: it never ships an API key. Press Connect
at the top-right, log in with your Pollinations account, and your own key is used for all
text and audio calls (stored only in your browser session). Without connecting, the app
shows a friendly error and the stage stays dark.

## Files

- `index.html` — page + layout (script order: `pollinations.js`, `polli-common.js`, `app.js`)
- `app.js` — app logic
- `pollinations.js`, `polli-common.js`, `polli.css` — shared Pollinations helpers/styles

Credit Pollinations — Made with pollinations.ai
