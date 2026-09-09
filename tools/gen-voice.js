#!/usr/bin/env node
/* ======================================================================
   gen-voice.js  —  pre-generate Bera's voice clips with the ElevenLabs API
   ----------------------------------------------------------------------
   Bera has a small, fixed set of spoken lines. Rather than call a TTS API
   at runtime (key exposure, cost, latency, needs internet), we render each
   line ONCE to an .mp3 and ship the files. The game plays the clip when it
   exists and falls back to the browser SpeechSynthesis voice otherwise.

   USAGE
     set  ELEVENLABS_API_KEY  in your environment, then:

       node tools/gen-voice.js              # generate any missing clips
       node tools/gen-voice.js --force      # re-generate everything
       node tools/gen-voice.js --only bera_alert,bera_wha   # just these ids
       node tools/gen-voice.js --list       # print the line list and exit

   Requires Node 18+ (built-in fetch). No npm install needed.
   Reads tools/voice-lines.json for the voice id, model, settings and lines.
   ====================================================================== */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(__dirname, 'voice-lines.json');
const API = 'https://api.elevenlabs.io/v1/text-to-speech';

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const LIST  = args.includes('--list');
const onlyArg = args[args.indexOf('--only') + 1];
const ONLY = args.includes('--only') && onlyArg ? new Set(onlyArg.split(',').map(s => s.trim())) : null;

const cfg = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

if (LIST) {
  cfg.clips.forEach(c => console.log(`${c.id.padEnd(22)}  "${c.text}"`));
  console.log(`\n${cfg.clips.length} clips  ->  ${cfg.targets.join('  ')}`);
  process.exit(0);
}

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error('ERROR: set the ELEVENLABS_API_KEY environment variable first.');
  console.error('  Windows (cmd):   set ELEVENLABS_API_KEY=xxxxxxxx');
  console.error('  PowerShell:      $env:ELEVENLABS_API_KEY = "xxxxxxxx"');
  console.error('  macOS/Linux:     export ELEVENLABS_API_KEY=xxxxxxxx');
  process.exit(1);
}

const fmtExt = { mp3_44100_128: 'mp3', mp3_44100_64: 'mp3', mp3_22050_32: 'mp3', pcm_16000: 'wav', pcm_44100: 'wav' };
const EXT = fmtExt[cfg.output_format] || 'mp3';

// make sure the target folders exist
cfg.targets.forEach(t => fs.mkdirSync(path.join(ROOT, t), { recursive: true }));

async function render(clip) {
  const res = await fetch(`${API}/${cfg.voice_id}?output_format=${encodeURIComponent(cfg.output_format)}`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({
      text: clip.text,
      model_id: cfg.model_id,
      voice_settings: cfg.voice_settings
    })
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}  ${body.slice(0, 300)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

(async () => {
  let made = 0, skipped = 0, failed = 0;
  for (const clip of cfg.clips) {
    if (ONLY && !ONLY.has(clip.id)) continue;

    const rel = cfg.targets.map(t => path.join(t, `${clip.id}.${EXT}`));
    const abs = rel.map(r => path.join(ROOT, r));
    const exists = abs.every(a => fs.existsSync(a));

    if (exists && !FORCE) { skipped++; console.log(`skip   ${clip.id}`); continue; }

    try {
      process.stdout.write(`build  ${clip.id} ... `);
      const buf = await render(clip);
      abs.forEach(a => fs.writeFileSync(a, buf));
      made++;
      console.log(`ok  (${(buf.length / 1024).toFixed(1)} KB)  ->  ${rel.join('  ')}`);
      await new Promise(r => setTimeout(r, 400)); // be gentle with the API
    } catch (e) {
      failed++;
      console.log(`FAIL\n       ${e.message}`);
    }
  }
  console.log(`\ndone:  ${made} built, ${skipped} skipped, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
