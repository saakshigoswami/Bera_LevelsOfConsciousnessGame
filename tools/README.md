# Bera voice clips

Bera's lines are a fixed set. We render them once with the ElevenLabs API and
ship the `.mp3` files; the game plays a clip when it exists and falls back to the
browser's built-in speech voice otherwise. **No API calls happen at runtime** —
the key never ships, there's no per-visit cost, and it works offline.

## Generate the clips

1. Node 18+ (uses built-in `fetch`, no `npm install`).
2. Set your ElevenLabs key:
   - PowerShell: `$env:ELEVENLABS_API_KEY = "sk_..."`
   - cmd: `set ELEVENLABS_API_KEY=sk_...`
   - macOS/Linux: `export ELEVENLABS_API_KEY=sk_...`
3. From the repo root:
   ```
   node tools/gen-voice.js            # build any missing clips
   node tools/gen-voice.js --force    # rebuild everything
   node tools/gen-voice.js --list     # show the line list, build nothing
   ```
   Clips are written to `assets/audio/`.

## Change the voice or settings

Edit `tools/voice-lines.json`:
- `voice_id` — your ElevenLabs voice (currently `9vP6R7VVxNwGIGLnpl17`)
- `model_id` — `eleven_multilingual_v2` (quality) or `eleven_turbo_v2_5` (cheaper/faster)
- `voice_settings` — stability / similarity_boost / style / use_speaker_boost
- `clips[]` — the id → text list

If you change a line's **text**, also update the matching entry in the game's
`BERA_CLIPS` map (search `BERA_CLIPS` in `game.js`) — the game matches the clip
by exact line text.

## No clips present?

The game still works — every line falls back to `speechSynthesis`. So you can
develop without generating anything.
