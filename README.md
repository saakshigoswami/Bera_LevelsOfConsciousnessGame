# Help Bera! — Doctor Detective

An interactive exhibit for the **NIMHANS Brain Museum** that teaches children the
**levels of consciousness**. The visitor plays *Doctor Detective DD*: they pick a
case, run bedside tests on Bera the bear, tick what they observe, then place her
on the *Awareness vs Wakefulness* map. Bera then explains the state.

It is a single, offline web page. No build step, no backend, no framework.

---

## Run it

Serve the folder over HTTP and open the page — image loading does not work from
`file://`, so a static server is required.

```
# from this folder
python -m http.server 8642
# then open  http://localhost:8642/
```

Any static host works too (Netlify Drop, GitHub Pages, itch.io, …): upload this
whole folder; the entry point is `index.html` at the root.

Target device: a fullscreen kiosk browser, touch or mouse. Works fully offline
once the page + images are cached.

---

## Folder layout

```
index.html          the whole page — markup + all CSS
game.js             all game logic and content (data + state machine + audio)
assets/
  background.png     the Awareness vs Wakefulness diagram
  sprites/bera/      every Bera pose (PNG, transparent)  +  Doctor_Detective.png (title art)
  audio/             optional: pre-generated Bera voice clips (see tools/)
  _source/           the raw sprite contact sheets these poses were cut from — not used at runtime
tools/              optional helper to generate Bera's voice with the ElevenLabs API
```

---

## How the game is put together (`game.js`)

Read top to bottom; the sections are labelled.

| Section | What it holds |
|---|---|
| `ZONES` | the 10 regions on the diagram — each `{id, fx, fy, pose}` where `fx/fy` are fractions (0–1) of the diagram frame. Bera takes `pose` when dragged onto that region. Re-measure these if the diagram art changes. |
| `AX` | fractions of where the diagram's own X/Y axes sit, for the "charge-up" glow bars. |
| `TOOLS` | the bedside tools (call, clap, raise hand, touch nose, name, place, alarm, pinch, "do you know you're dreaming?"). |
| `STATES` | **the content.** 10 states, each with a `zone` (its correct spot on the map), an `explain` line, and a list of `tests`. Every test is `{tool, pose, say, react, q, opts}` where `opts` is exactly **3** choices `[text, isCorrect]`. |
| audio | Web-Audio tones + a small generative background track + speech. Speech uses two distinct browser voices (a caller and Bera). If a pre-generated clip exists for Bera's exact line it plays that instead. |
| screens | `TITLE → SELECT (lever) → OBSERVE → CHECKLIST → PLACE → EXPLAIN → back to SELECT`. One `<section class="screen">` per step in `index.html`; `show(id)` swaps them. |

### Common edits

- **Change a state's words / behaviour** → edit its entry in `STATES`.
- **Move a map region** → change its `fx/fy` in `ZONES` (and the matching state's
  `zone` still points at that `id`).
- **Add / swap a Bera pose** → drop the PNG in `assets/sprites/bera/` and use its
  filename (without `.png`) as a test's `pose`.
- **Deep-link a case** → `?state=rem` (also `alert, meditation, lightsleep,
  lethargic, confused, deepsleep, lucid, anesthesia, comatose`).
- **Resize everything** → the one `html { font-size: … }` line in `index.html` is
  the master scale; all sizes are in `rem` off it.

---

## Bera's voice (optional)

Out of the box Bera speaks with the browser's built-in speech engine. To give her
a specific voice, pre-render her ~27 fixed lines once with the ElevenLabs API —
see `tools/README.md`. The clips drop into `assets/audio/` and the game plays them
automatically, falling back to the browser voice for anything missing. No API key
or API call ships in the game.
