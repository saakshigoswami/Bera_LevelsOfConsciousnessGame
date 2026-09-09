# Help Bera! — Doctor Detective

An interactive exhibit for the **NIMHANS Brain Museum** that teaches children the
**levels of consciousness**. The visitor plays *Doctor Detective DD*: they pick a
case, run bedside tests on Bera the bear, tick what they observe, then place her
on the *Awareness vs Wakefulness* map. Bera then explains the state.

It is a single, offline web page. No build step, no backend, no framework.

---

## The idea: levels of consciousness

Consciousness has **two separate parts, and they can come apart:**

- **Wakefulness (arousal)** — how "switched on" the brain is. It is run by a small
  network deep in the brainstem. This is the difference between eyes-open and
  eyes-shut, alert and asleep.
- **Awareness** — the *content* of the mind: noticing yourself and your
  surroundings, understanding, doing things on purpose. This lives in the cortex.

Usually the two rise and fall together — but not always:

| | **Low awareness** | **High awareness** |
|---|---|---|
| **High wakefulness** | eyes open but "not really there" — *confusion, vegetative state* | *fully alert* |
| **Low wakefulness** | cannot be roused — *coma, deep sleep, anaesthesia* | the body is "off" but the mind is vivid — *dreaming, lucid dreaming* |

That grid is exactly the map the visitor places Bera on
(`assets/background.png`): the **X axis is wakefulness**, the **Y axis is
awareness**. "Being awake" and "being aware" are not the same thing — that is the
single big idea the exhibit teaches.

**Why it matters.** After a head injury, when someone collapses, or during an
operation, a clinician must judge *how conscious* a person is — and they do it the
way this game does: by **structured observation**. Do the eyes open on their own?
To a voice? Only to pain? Not at all? Does the person obey a command, mumble, or
do nothing? Each answer narrows down the state. (This is the reasoning behind
bedside tools like the Glasgow Coma Scale and AVPU; the game teaches the *skill*
without the jargon.)

## What the game does

The visitor is **Doctor Detective DD**. For each case:

1. **Observe** — run the bedside tests on Bera: call her name, ask her to clap or
   raise her right hand or touch her nose, ask who she is and where she is, sound
   an alarm, give a gentle pinch. Watch what she does, hear what she says, then
   **tick the observation that matches**. A wrong tick pops up "Observe Bera
   again" — you cannot move on until every test is logged correctly.
2. **Review** — a checklist of everything you noticed, next to Bera's starting
   pose.
3. **Place** — drag Bera onto the wakefulness × awareness map. Her expression
   changes as you move her, so you can match it to your notes. One submit: the
   game shows how close you were and glides her to the correct spot.
4. **Explain** — Bera tells you, in one or two plain sentences, what that state
   really is.

Ten states are covered — **fully alert, lethargic, confused, comatose, under
anaesthesia, light sleep, deep sleep, REM (dreaming) sleep, lucid dreaming,
meditation** — chosen so every corner of the grid is represented (e.g. *coma* and
*anaesthesia* sit low-low; *dreaming* is low-wakefulness but high-awareness;
*confusion* is high-wakefulness but low-awareness; *meditation* is calm body,
fully aware mind).

The full behaviour of every state is in the [Test & response matrix](#test--response-matrix) at the bottom.

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

---

## Test & response matrix

The full design table for every state — what each bedside test does and how Bera
reacts. The running game uses simplified 3-choice versions of these; the
authoritative runtime copy is the `STATES` object in `game.js`.

### Fully Alert
> Bera is fully awake and fully aware. Her brain's wake-up system is switched
> right on, so she opens her eyes by herself, does everything you ask straight
> away, and knows who she is and where she is.

| Test / stimulus | What Bera does | What Bera says |
|---|---|---|
| 👀 Observe eyes | Eyes open; looks around; blinks normally | — |
| 🗣️ "Bera?" | Immediately turns / looks toward examiner | "Hi! I'm Bera." |
| 👏 "Bera, clap your hands." | Immediately claps correctly | "Okay!" |
| ✋ "Bera, raise your right hand." | Immediately raises right hand correctly | "Sure!" |
| 🐻 "What is your name?" | Answers confidently | "I'm Bera." |
| 📍 "Where are you?" | Answers correctly | "I am at NIMHANS Museum." |

### Lethargic
> Bera is drowsy. Her brain is a little less awake than normal, so she keeps
> sliding toward sleep. A voice still wakes her up all the way, and her answers
> are right — just slow.

| Test / stimulus | What Bera does | What Bera says |
|---|---|---|
| 👀 Observe eyes | Eyes partly open / half-closed; drifts toward sleep | — |
| 🗣️ "Bera?" | Slowly opens eyes and looks toward examiner | "Mmm… yeah? I'm Bera… I'm up…" |
| 👏 Clap | Claps slowly after waking | "Okay…" |
| 🐻 Name | Answers correctly but slowly | "I'm… Bera…" |
| 📍 Place | Answers correctly but drowsily | "NIMHANS Museum…" |

### Confused
> Bera is confused. She is awake and moving, but her brain is not putting things
> together. She feels a pinch and pulls away, and she can look at things, but she
> mixes up what you ask and does not know where she is. Being awake and being
> aware are not the same thing.

| Test / stimulus | What Bera does | What Bera says |
|---|---|---|
| 👀 Observe eyes | Eyes open; looks around but appears disoriented | — |
| 🗣️ "Bera?" | Looks toward examiner but seems uncertain | "Huh?… yes?" |
| 🚨 Alarm | Startles and looks around, but appears confused rather than becoming fully oriented | "What…?" |
| 🤏 Pinch | Purposefully pulls the stimulated hand / limb away; may look toward the stimulated area | "Ow!" |
| 👏 Clap | Hesitates, misunderstands or performs incorrectly | "Clap?… Why?" |
| ✋ Right hand | Hesitates or raises wrong hand | "This one?" |
| 🐻 Name | Gives confused answer | "Bera… I think?" |
| 📍 Place | Gives incorrect location | "At home?" |

### Comatose
> Bera is in a coma. Her brain cannot be woken. Her eyes stay shut and nothing —
> not a loud sound, not even a pinch — makes her respond. Her body still breathes
> on its own.

| Test / stimulus | What Bera does | What Bera says |
|---|---|---|
| 👀 Observe eyes | Eyes remain closed; no purposeful spontaneous movement | — |
| 🗣️ "Bera?" | No response | — |
| 🚨 Alarm | No meaningful response; may show no movement or only a brief nonspecific startle depending on the intended depth of coma | — |
| 🤏 Pinch | No purposeful response. For our Bera rule, she remains unresponsive rather than reaching toward or understanding the stimulus | — |
| 👏 Clap | No response | — |
| ✋ Right hand | No purposeful movement | — |

### Under Anaesthesia
> Bera is under anaesthesia. Doctors have used medicine to switch her brain's
> wake-up system off on purpose, so they can help her without her feeling
> anything. Even a doctor's touch gets no response, and she will not remember it.
> When the medicine wears off, she wakes up.

| Test / stimulus | What Bera does | What Bera says |
|---|---|---|
| 👀 Observe eyes | Eyes closed; completely still / unresponsive; operating-room context visible | — |
| 🗣️ "Bera?" | No response | — |
| 🚨 Alarm | No response; remains unconscious during the procedure | — |
| 🤏 Pinch | No movement / no meaningful response to the simulated physical stimulus | — |
| 👏 Clap | No response | — |
| ✋ Right hand | No response | — |

### Light Sleep
> Bera is in light sleep. Her muscles have relaxed and she has drifted off, but
> only just — a soft voice or a gentle touch brings her straight back, and she is
> clear-headed the moment she wakes.

| Test / stimulus | What Bera does | What Bera says |
|---|---|---|
| 👀 Observe eyes | Eyes closed; relaxed sleeping posture | — |
| 🗣️ "Bera?" | Wakes easily and looks toward examiner | "Mm… oh, hello!" |
| 👏 Clap | Claps correctly after waking | "Okay!" |
| 👃 Touch your nose | Touches the nose after waking | "Sure!" |
| 🐻 Name | Answers correctly | "I'm Bera." |

### Deep Sleep
> Bera is in deep sleep. Her brain is making slow, big waves. This is the sleep
> it is hardest to wake someone from — it takes a loud sound or a firm touch, and
> even then she is groggy and slow for a while.

| Test / stimulus | What Bera does | What Bera says |
|---|---|---|
| 👀 Observe eyes | Eyes closed; very still; deeply asleep | — |
| 🗣️ "Bera?" | Little / no response; remains asleep | — |
| 🚨 Alarm | Stirs and eventually wakes groggily | "Ugh… what? Oh… I'm Bera. That really woke me." |
| 🤏 Pinch | Stronger stimulus eventually wakes her; initially reacts slowly | "Ugh… what?" |
| 👃 Touch your nose | Touches the nose slowly after waking | "Okay…" |
| 🐻 Name | Eventually answers correctly but groggily | "I'm… Bera…" |

### REM Sleep
> Bera is in dreaming sleep. Behind her closed eyelids her eyes are darting about
> and her brain is almost as busy as when she is awake — she is dreaming. Her body
> is switched off so she cannot act the dream out, and a sound may become part of
> the dream instead of waking her.

| Test / stimulus | What Bera does | What Bera says |
|---|---|---|
| 👀 Observe eyes | Eyes closed; rapid eye / dreaming movements; body remains still | — |
| 🗣️ "Bera?" | Doesn't properly wake; small dream reaction | "Mmm…" |
| 🚨 Alarm | Brief reaction while remaining asleep / dreaming | "Mmnh…" |
| 🤏 Pinch | Little / no purposeful response; may show a small twitch | — |
| 🐻 Name | Responds as if inside a dream | "I'm… flying…" |
| 📍 Place | Gives dream-world location | "I'm in the clouds!" |

### Lucid Dreaming
> Bera is having a lucid dream. She is still asleep and dreaming, but a part of
> her knows it is a dream — she can even notice a sound and put it inside the
> dream. Her brain is very busy, yet the real room barely reaches her.

| Test / stimulus | What Bera does | What Bera says |
|---|---|---|
| 👀 Observe eyes | Eyes closed; dreaming / REM-like behavior | — |
| 🗣️ "Bera?" | Remains in dream | "Mmm…" |
| 🚨 Alarm | Brief dream reaction but continues dreaming | "I heard that… in my dream." |
| 🤏 Pinch | Little / no purposeful response; dream continues | — |
| 🧠 "Do you know you're dreaming?" | Recognizes that she is dreaming | "Yes! I know I'm dreaming!" |
| 📍 Place | Gives dream-world answer | "I'm dreaming that I'm driving a car!" |

### Meditation
> Bera is meditating. Her eyes are closed and her body is still, but she is not
> asleep at all. Her mind is calm and very focused, and she can answer you at any
> moment, then settle back into stillness. It is a trained way of being quietly,
> deeply awake.

| Test / stimulus | What Bera does | What Bera says |
|---|---|---|
| 👀 Observe eyes | Eyes closed / soft gaze; calm and still | — |
| 🗣️ "Bera?" | Calmly acknowledges examiner in a relaxed way | "Yes, I'm here." |
| 👏 Clap | Deliberately claps, then returns to calm posture | "Okay." |
| ✋ Right hand | Deliberately raises right hand, then returns to calm posture | "Sure." |
| 🐻 Name | Answers calmly | "I'm Bera." |
| 📍 Place | Answers correctly | "I am at NIMHANS Museum." |
