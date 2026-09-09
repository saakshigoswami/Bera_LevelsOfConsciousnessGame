/* ======================================================================
   Help Bera! — Doctor Detective  (single-page build)
   NIMHANS Brain Museum · Levels of Consciousness exhibit

   Flow:  TITLE → SELECT (lever) → OBSERVE (log each response)
        → CHECKLIST → PLACE (drag Bera on the diagram, one submit)
        → EXPLAIN (Bera explains) → back to SELECT
   ====================================================================== */
(function () {
"use strict";

var SPR = 'assets/sprites/bera/';
var $ = function (id) { return document.getElementById(id); };

/* ====================================================================
   1. DIAGRAM ZONES  — fractions (0..1) of the diagram frame.
   fy grows downward, so low fy = high awareness.
   Each zone gives the pose Bera takes when she's dragged onto it, so the
   detective can "match her expression" while placing her.
   (Re-measure fx/fy if the background diagram art changes.)
   ================================================================== */
var ZONES = [
  { id:'alert',      fx:0.852, fy:0.175, pose:'eyes_open',      label:'Wide Awake' },
  { id:'meditation', fx:0.523, fy:0.197, pose:'meditation',     label:'Calm & Aware' },
  { id:'lucid',      fx:0.359, fy:0.175, pose:'lucid_dreaming', label:'Lucid Dream' },
  { id:'rem',        fx:0.359, fy:0.357, pose:'dreaming',       label:'Dreaming' },
  { id:'lethargic',  fx:0.630, fy:0.312, pose:'lethargic2',     label:'Drowsy' },
  { id:'lightsleep', fx:0.441, fy:0.457, pose:'light_sleep',    label:'Light Sleep' },
  { id:'confused',   fx:0.704, fy:0.503, pose:'confused',       label:'Confused' },
  { id:'deepsleep',  fx:0.359, fy:0.533, pose:'sleeping',       label:'Deep Sleep' },
  { id:'anesthesia', fx:0.277, fy:0.686, pose:'anesthesia',     label:'Anaesthesia' },
  { id:'coma',       fx:0.194, fy:0.778, pose:'comatose',       label:'Coma' }
];
function zoneById(id){ for(var i=0;i<ZONES.length;i++) if(ZONES[i].id===id) return ZONES[i]; return null; }

/* diagram axis reference fractions (origin + far ends), for the glow bars — measured on background.png */
var AX = { ox:0.112, oy:0.862, xEnd:0.934, yTop:0.098 };

/* ====================================================================
   2. TOOLS
   ================================================================== */
var TOOLS = {
  observe:   { emo:'👀', label:'Look closely',         say:null },
  call:      { emo:'🗣️', label:'"Bera?"',               say:'Bera?' },
  clap:      { emo:'👏', label:'"Clap your hands"',      say:'Bera, clap your hands.' },
  wave:      { emo:'🤚', label:'"Wave hello"',           say:'Bera, wave hello.' },
  raisehand: { emo:'✋', label:'"Raise your right hand"',say:'Bera, raise your right hand.' },
  touchnose: { emo:'👃', label:'"Touch your nose"',      say:'Bera, touch your nose.' },
  name:      { emo:'🐻', label:'"What is your name?"',   say:'What is your name?' },
  place:     { emo:'📍', label:'"Where are you?"',       say:'Where are you?' },
  alarm:     { emo:'🚨', label:'Sound the alarm',        say:null },
  pinch:     { emo:'🤏', label:'Gentle pinch',           say:null },
  lucidq:    { emo:'🧠', label:'"Do you know you’re dreaming?"', say:'Do you know you are dreaming?' }
};

/* ====================================================================
   3. THE 10 STATES
   Each test:  tool, pose, say (Bera's line or null), react (anim class),
               q (what the detective is deciding), opts [ [text, isCorrect] ]
   ================================================================== */
var STATES = {

  alert: {
    name:'Fully Alert', emoji:'😃', idle:'eyes_open', lying:false, zone:'alert',
    blurb:'Bright-eyed and busy — nothing gets past her.',
    explain:'Bera is fully awake and fully aware. Her brain’s wake-up system is switched right on, so she opens her eyes by herself, does everything you ask straight away, and knows who she is and where she is.',
    tests:[
      { tool:'observe', pose:'eyes_open', react:'react-settle', q:'Her eyes are…',
        opts:[['open and looking around',1],['half-open and droopy',0],['shut',0]] },
      { tool:'call', pose:'turn_head_left', say:'Hi! I’m Bera.', react:'react-perk', q:'When you call her, she…',
        opts:[['looks at you right away',1],['looks over slowly',0],['does not look',0]] },
      { tool:'clap', pose:'clap', say:'Okay!', react:'react-perk', q:'When you ask her to clap, she…',
        opts:[['claps right away',1],['claps slowly',0],['does not clap',0]] },
      { tool:'raisehand', pose:'raise_right_hand', say:'Sure!', react:'react-perk', q:'Asked to raise her right hand, she…',
        opts:[['raises the right hand fast',1],['raises the wrong hand',0],['does not move',0]] },
      { tool:'name', pose:'nod_yes', say:'I’m Bera.', react:'react-perk', q:'Asked her name, she…',
        opts:[['says it clearly',1],['says it slowly',0],['cannot say it',0]] },
      { tool:'place', pose:'nod_yes', say:'I am at the NIMHANS Museum.', react:'react-perk', q:'Asked where she is, she…',
        opts:[['knows: the museum',1],['says the wrong place',0],['has no idea',0]] }
    ]
  },

  lethargic: {
    name:'Lethargic', emoji:'😪', idle:'lethargic2', lying:false, zone:'lethargic',
    blurb:'Keeps nodding off — but a voice brings her back.',
    explain:'Bera is drowsy. Her brain is a little less awake than normal, so she keeps sliding toward sleep. A voice still wakes her up all the way, and her answers are right but slow.',
    tests:[
      { tool:'observe', pose:'lethargic2', react:'react-settle', q:'Her eyes are…',
        opts:[['half-closed, keeps drifting off',1],['wide open',0],['shut tight',0]] },
      { tool:'call', pose:'stretch', say:'Mmm… yeah? I’m Bera… I’m up…', react:'react-stir', q:'When you call her, she…',
        opts:[['wakes up slowly',1],['wakes up fast',0],['does not wake',0]] },
      { tool:'clap', pose:'clap', say:'Okay…', react:'react-stir', q:'Asked to clap, she…',
        opts:[['claps, but slowly',1],['claps fast',0],['does not clap',0]] },
      { tool:'name', pose:'lethargic2', say:'I’m… Bera…', react:'react-stir', q:'Asked her name, she…',
        opts:[['says it right, but slowly',1],['says it fast',0],['says it wrong',0]] },
      { tool:'place', pose:'lethargic2', say:'NIMHANS Museum…', react:'react-stir', q:'Asked where she is, she…',
        opts:[['knows it, but sounds sleepy',1],['answers sharp and quick',0],['does not know',0]] }
    ]
  },

  confused: {
    name:'Confused', emoji:'😵‍💫', idle:'confused', lying:false, zone:'confused',
    blurb:'Awake and moving — but nothing quite makes sense.',
    explain:'Bera is confused. She is awake and moving, but her brain is not working properly, so she cannot put things together. Her reflexes still work — she feels a pinch and pulls away. She can look at things, but may not make sense of them, and she does not answer properly when asked where she is. Being awake and being aware are not the same thing.',
    tests:[
      { tool:'observe', pose:'confused', react:'react-flicker', q:'Her eyes are…',
        opts:[['open, but she looks lost',1],['open, calm and focused',0],['closed',0]] },
      { tool:'call', pose:'looks_at_area', say:'Huh?… yes?', react:'react-flicker', q:'When you call her, she…',
        opts:[['looks over, but seems unsure',1],['answers you clearly',0],['ignores you',0]] },
      { tool:'alarm', pose:'feels_stimulus', say:'What…?', react:'react-flicker', q:'When the alarm sounds, she…',
        opts:[['jumps, but stays confused',1],['wakes up fully clear',0],['does not react',0]] },
      { tool:'pinch', pose:'pulls_away', say:'Ow!', react:'react-flicker', q:'When you gently pinch her, she…',
        opts:[['pulls her paw away',1],['does not feel it',0],['grabs your hand',0]] },
      { tool:'clap', pose:'touch_nose', say:'Clap?… Why?', react:'react-flicker', q:'Asked to clap, she…',
        opts:[['gets muddled and does it wrong',1],['claps correctly',0],['ignores it',0]] },
      { tool:'raisehand', pose:'raise_right_hand', say:'This one?', react:'react-flicker', q:'Asked to raise her right hand, she…',
        opts:[['raises the wrong hand',1],['raises the right hand',0],['does not move',0]] },
      { tool:'name', pose:'confused', say:'Bera… I think?', react:'react-flicker', q:'Asked her name, she…',
        opts:[['is not sure of her name',1],['says it clearly',0],['says nothing',0]] },
      { tool:'place', pose:'confused', say:'At… home?', react:'react-flicker', q:'Asked where she is, she…',
        opts:[['says the wrong place',1],['knows it is the museum',0],['says nothing',0]] }
    ]
  },

  comatose: {
    name:'Comatose', emoji:'😶', idle:'comatose', lying:true, zone:'coma',
    blurb:'Cannot be woken — by anything.',
    explain:'Bera is in a coma. She cannot be woken from this state and does not respond to anything — not a loud sound, not even a pinch. Her brain is only partly working. Her eyes stay shut, but she is still breathing and her heart is still beating.',
    tests:[
      { tool:'observe', pose:'comatose', react:'react-settle', q:'Her eyes are…',
        opts:[['shut, and she is completely still',1],['shut but she keeps stirring',0],['open',0]] },
      { tool:'call', pose:'comatose', say:null, react:'react-fizzle', q:'When you call her, she…',
        opts:[['does nothing',1],['wakes up',0],['stirs a little',0]] },
      { tool:'alarm', pose:'comatose', say:null, react:'react-fizzle', q:'When the alarm sounds, she…',
        opts:[['still does nothing',1],['wakes up',0],['answers a question',0]] },
      { tool:'pinch', pose:'comatose', say:null, react:'react-fizzle', q:'When you pinch her, she…',
        opts:[['does not respond, even to the pinch',1],['pulls her arm away',0],['reaches for the spot',0]] },
      { tool:'clap', pose:'comatose', say:null, react:'react-fizzle', q:'Asked to clap, she…',
        opts:[['does nothing',1],['claps',0],['opens her eyes',0]] }
    ]
  },

  anesthesia: {
    name:'Under Anaesthesia', emoji:'💉', idle:'anesthesia', lying:true, zone:'anesthesia',
    blurb:'Fast asleep on purpose — so the doctors can help.',
    explain:'Bera is under anaesthesia. Doctors have used medicine to switch her brain’s wake-up system off on purpose, so they can operate on her without causing her pain. Even a doctor’s touch gets no response, and she will not remember any of it. When the medicine wears off, she wakes up.',
    tests:[
      { tool:'observe', pose:'anesthesia', react:'react-settle', q:'In the operating room, Bera is…',
        opts:[['eyes closed, completely still',1],['sleeping lightly',0],['awake and talking',0]] },
      { tool:'call', pose:'anesthesia', say:null, react:'react-fizzle', q:'When you call her, she…',
        opts:[['does nothing',1],['mumbles back',0],['wakes up',0]] },
      { tool:'alarm', pose:'anesthesia', say:null, react:'react-fizzle', q:'When the alarm sounds, she…',
        opts:[['does nothing — the medicine keeps her asleep',1],['wakes up',0],['sits up',0]] },
      { tool:'pinch', pose:'anesthesia', say:null, react:'react-fizzle', q:'When the doctor touches the spot, she…',
        opts:[['does not move at all',1],['flinches away',0],['says "ow"',0]] }
    ]
  },

  lightsleep: {
    name:'Light Sleep', emoji:'😌', idle:'light_sleep', lying:true, zone:'lightsleep',
    blurb:'Dozing — the smallest nudge wakes her.',
    explain:'Bera is in light sleep — where the brain gets ready to change gear. Her muscles have relaxed and she has drifted off, but only just: a soft voice or a gentle touch brings her straight back, and she is clear-headed the moment she wakes.',
    tests:[
      { tool:'observe', pose:'light_sleep', react:'react-settle', q:'She is…',
        opts:[['eyes closed, resting calmly',1],['eyes open',0],['tossing and turning',0]] },
      { tool:'call', pose:'stretch', say:'Mm… oh, hello!', react:'react-stir', q:'When you call her, she…',
        opts:[['wakes up easily',1],['will not wake',0],['was already awake',0]] },
      { tool:'clap', pose:'clap', say:'Okay!', react:'react-perk', q:'Once awake, asked to clap, she…',
        opts:[['claps correctly',1],['cannot do it',0],['claps in her sleep',0]] },
      { tool:'touchnose', pose:'touch_nose', say:'Sure!', react:'react-perk', q:'Asked to touch her nose, she…',
        opts:[['touches her nose right',1],['touches the wrong spot',0],['does not move',0]] },
      { tool:'name', pose:'nod_yes', say:'I’m Bera.', react:'react-perk', q:'Asked her name, she…',
        opts:[['says it clearly',1],['gives a sleepy wrong answer',0],['says nothing',0]] }
    ]
  },

  deepsleep: {
    name:'Deep Sleep', emoji:'😴', idle:'sleeping', lying:true, zone:'deepsleep',
    blurb:'Way down deep — hard to wake, groggy when she does.',
    explain:'Bera is in deep sleep — the brain slows right down and the whole body goes into repair mode. This is the sleep it is hardest to wake someone from: it takes a loud sound or a firm touch, and even then she is groggy and slow for a while.',
    tests:[
      { tool:'observe', pose:'sleeping', react:'react-settle', q:'She is…',
        opts:[['eyes closed, very still, deep asleep',1],['lightly dozing',0],['awake',0]] },
      { tool:'call', pose:'sleeping', say:null, react:'react-fizzle', q:'When you call her, she…',
        opts:[['barely reacts, stays asleep',1],['wakes up right away',0],['answers a question',0]] },
      { tool:'alarm', pose:'stretch', say:'Ugh… what? Oh… I’m Bera. That really woke me.', react:'react-stir', q:'It takes the loud alarm. Then she…',
        opts:[['wakes up, but groggy',1],['wakes up wide awake',0],['never wakes',0]] },
      { tool:'pinch', pose:'feels_stimulus', say:'Ugh… what?', react:'react-stir', q:'A firm pinch. She…',
        opts:[['reacts, but slowly',1],['reacts fast',0],['never reacts',0]] },
      { tool:'name', pose:'lethargic2', say:'I’m… Bera…', react:'react-stir', q:'Once awake, asked her name, she…',
        opts:[['says it right, very groggy',1],['says it clearly',0],['says nothing',0]] }
    ]
  },

  rem: {
    name:'REM Sleep', emoji:'💭', idle:'dreaming', lying:true, zone:'rem',
    blurb:'Body asleep, brain busy — she is dreaming.',
    explain:'Bera is in dreaming sleep. Behind her closed eyelids her eyes are darting about and her brain is almost as busy as when she is awake — she is dreaming. Her body is switched off so she cannot act the dream out, and a sound may become part of the dream instead of waking her.',
    tests:[
      { tool:'observe', pose:'dreaming', react:'react-settle', q:'Her eyes are closed, but…',
        opts:[['they are darting about — she is dreaming',1],['everything is perfectly still',0],['her eyes are open',0]] },
      { tool:'call', pose:'dreaming', say:'Mmm…', react:'react-fizzle', q:'When you call her, she…',
        opts:[['mumbles without waking',1],['wakes and answers',0],['does nothing',0]] },
      { tool:'alarm', pose:'dreaming', say:'Mmnh…', react:'react-fizzle', q:'When the alarm sounds, she…',
        opts:[['twitches a little, keeps dreaming',1],['wakes up fully',0],['does nothing',0]] },
      { tool:'name', pose:'dreaming', say:'I’m… flying…', react:'react-fizzle', q:'Asked her name, she…',
        opts:[['answers from inside a dream',1],['gives her real name',0],['says nothing',0]] },
      { tool:'place', pose:'dreaming', say:'I’m in the clouds!', react:'react-fizzle', q:'Asked where she is, she…',
        opts:[['names a dream place',1],['says "the museum"',0],['says nothing',0]] }
    ]
  },

  lucid: {
    name:'Lucid Dreaming', emoji:'🌀', idle:'lucid_dreaming', lying:true, zone:'lucid',
    blurb:'Still dreaming — but she knows it is a dream.',
    explain:'Bera is having a lucid dream. She is still asleep and dreaming, but a part of her knows it is a dream — she can even notice a sound and put it inside the dream. Her brain is very busy, yet the real room barely reaches her.',
    tests:[
      { tool:'observe', pose:'lucid_dreaming', react:'react-settle', q:'She looks…',
        opts:[['eyes closed, dreaming — like REM sleep',1],['wide awake',0],['still, no dreaming',0]] },
      { tool:'call', pose:'lucid_dreaming', say:'Mmm…', react:'react-fizzle', q:'When you call her, she…',
        opts:[['stays inside her dream',1],['wakes up',0],['answers clearly',0]] },
      { tool:'alarm', pose:'lucid_dreaming', say:'I heard that… in my dream.', react:'react-fizzle', q:'When the alarm sounds, she…',
        opts:[['hears it — inside the dream',1],['wakes up',0],['does nothing',0]] },
      { tool:'lucidq', pose:'nod_yes', say:'Yes! I know I’m dreaming!', react:'react-perk', q:'You ask if she knows she is dreaming. She…',
        opts:[['knows she is dreaming!',1],['thinks it is all real',0],['cannot answer',0]] },
      { tool:'place', pose:'lucid_dreaming', say:'I’m dreaming that I’m driving a car!', react:'react-fizzle', q:'Asked where she is, she…',
        opts:[['tells you her dream — and knows it is one',1],['says "the museum"',0],['says nothing',0]] }
    ]
  },

  meditation: {
    name:'Meditation', emoji:'🧘', idle:'meditation', lying:false, zone:'meditation',
    blurb:'Eyes closed, perfectly calm — and wide awake inside.',
    explain:'Bera is meditating. Her eyes are closed and her body is still and relaxed, but she is not asleep. Her mind is calm yet alert, and she can choose to answer you, then settle back into quietude. It is a trained practice that gradually reshapes the brain to hold a calm, relaxed kind of awareness.',
    tests:[
      { tool:'observe', pose:'meditation', react:'react-settle', q:'She is…',
        opts:[['eyes closed, calm and still — but not asleep',1],['fast asleep',0],['fidgety',0]] },
      { tool:'call', pose:'meditation', say:'Yes, I’m here.', react:'react-perk', q:'When you call her, she…',
        opts:[['calmly says she is here, and nods',1],['does not hear you',0],['jumps, startled',0]] },
      { tool:'wave', pose:'wave_hello', say:'Okay.', react:'react-perk', q:'Asked to wave hello, she…',
        opts:[['waves gently, then settles back',1],['ignores it',0],['waves wildly',0]] },
      { tool:'raisehand', pose:'raise_right_hand', say:'Sure.', react:'react-perk', q:'Asked to raise her right hand, she…',
        opts:[['raises the right hand calmly',1],['raises the wrong hand',0],['does not move',0]] },
      { tool:'name', pose:'meditation', say:'I’m Bera.', react:'react-perk', q:'Asked her name, she…',
        opts:[['answers, calm and clear',1],['gives a groggy answer',0],['says nothing',0]] },
      { tool:'place', pose:'meditation', say:'I am at the NIMHANS Museum.', react:'react-perk', q:'Asked where she is, she…',
        opts:[['knows exactly where she is',1],['gives a dream answer',0],['says nothing',0]] }
    ]
  }
};
var STATE_ORDER = ['alert','meditation','lightsleep','lethargic','confused','deepsleep','rem','lucid','anesthesia','comatose'];

/* ====================================================================
   4. AUDIO  (Web Audio tones + generative music + speech w/ clip fallback)
   ================================================================== */
var actx = null, muted = false;
function ctx(){ if(!actx){ actx = new (window.AudioContext||window.webkitAudioContext)(); } if(actx.state==='suspended') actx.resume(); return actx; }
function tone(f,t0,dur,type,gain,det){
  if(muted) return;
  var c=ctx(), o=c.createOscillator(), g=c.createGain();
  o.type=type||'sine'; o.frequency.setValueAtTime(f,c.currentTime+t0);
  if(det) o.detune.setValueAtTime(det,c.currentTime+t0);
  g.gain.setValueAtTime(0,c.currentTime+t0);
  g.gain.linearRampToValueAtTime(gain||0.12,c.currentTime+t0+0.02);
  g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+t0+dur);
  o.connect(g); g.connect(c.destination); o.start(c.currentTime+t0); o.stop(c.currentTime+t0+dur+0.05);
}
function sweep(f0,f1,t0,dur,type,gain){
  if(muted) return;
  var c=ctx(), o=c.createOscillator(), g=c.createGain();
  o.type=type||'sawtooth';
  o.frequency.setValueAtTime(f0,c.currentTime+t0); o.frequency.linearRampToValueAtTime(f1,c.currentTime+t0+dur);
  g.gain.setValueAtTime(0,c.currentTime+t0); g.gain.linearRampToValueAtTime(gain||0.12,c.currentTime+t0+0.03); g.gain.linearRampToValueAtTime(0.001,c.currentTime+t0+dur);
  o.connect(g); g.connect(c.destination); o.start(c.currentTime+t0); o.stop(c.currentTime+t0+dur+0.05);
}
function sTap(){ tone(660,0,.05,'sine',.05); tone(990,.02,.06,'sine',.03); }
function sClick(){ tone(900,0,.03,'square',.04); }
function sClunk(){ tone(130,0,.14,'sine',.16); tone(80,.02,.16,'sine',.1); }
function sGood(){ tone(523,0,.16,'triangle',.09); tone(659,.12,.18,'triangle',.09); tone(784,.26,.3,'sine',.09); }
function sNope(){ tone(330,0,.2,'sine',.08); tone(247,.16,.28,'sine',.08); }
function sAlarm(){ sweep(360,720,0,.26,'sawtooth',.13); sweep(720,360,.28,.26,'sawtooth',.13); sweep(360,720,.56,.26,'sawtooth',.13); }
function sPinch(){ tone(520,0,.07,'sine',.12); tone(720,.06,.08,'sine',.1); }
function sFanfare(){ [523.25,659.25,784,1046.5].forEach(function(f,i){ tone(f,i*0.1,.5,'triangle',.09); tone(f*1.001,i*0.1,.5,'sine',.05,4); }); tone(1046.5,.45,.6,'sine',.08); tone(1318.5,.45,.6,'sine',.06); }

/* --- cozy generative music --- */
var AMB=0.08, ambGain=null, ambOn=false, mStep=0, M_BEAT=480, M_PC=8;
var CHORDS=[
  {b:130.81,p:[261.63,329.63,392.00],m:[523.25,587.33,659.25,784.00]},
  {b:110.00,p:[261.63,329.63,440.00],m:[523.25,659.25,880.00,587.33]},
  {b:174.61,p:[261.63,349.23,440.00],m:[523.25,698.46,880.00,587.33]},
  {b:196.00,p:[246.94,293.66,392.00],m:[587.33,493.88,784.00,987.77]}
];
function mPad(fs,dur){ var c=ctx(),t=c.currentTime; fs.forEach(function(f,i){ var o=c.createOscillator(),g=c.createGain(); o.type=i?'triangle':'sine'; o.frequency.value=f; o.detune.value=(i-1)*4;
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(.15,t+.9); g.gain.setValueAtTime(.15,t+dur-1.3); g.gain.linearRampToValueAtTime(.0001,t+dur);
  o.connect(g); g.connect(ambGain); o.start(t); o.stop(t+dur+.1); }); }
function mBass(f){ var c=ctx(),t=c.currentTime,o=c.createOscillator(),g=c.createGain(); o.type='sine'; o.frequency.setValueAtTime(f,t);
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(.2,t+.03); g.gain.exponentialRampToValueAtTime(.0001,t+1.7); o.connect(g); g.connect(ambGain); o.start(t); o.stop(t+1.8); }
function mBox(f){ var c=ctx(),t=c.currentTime,o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain(),g2=c.createGain();
  o.type='triangle'; o2.type='sine'; o.frequency.value=f; o2.frequency.value=f*2; g2.gain.value=.3;
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(.12,t+.015); g.gain.exponentialRampToValueAtTime(.0001,t+1.15);
  o.connect(g); o2.connect(g2); g2.connect(g); g.connect(ambGain); o.start(t); o2.start(t); o.stop(t+1.2); o2.stop(t+1.2); }
function mTick(){ if(!ambOn||muted){ mStep++; return; }
  var beat=mStep%M_PC, ch=CHORDS[Math.floor(mStep/M_PC)%CHORDS.length];
  if(beat===0){ mPad(ch.p,(M_PC*M_BEAT)/1000); mBass(ch.b); }
  if(beat===2||beat===5||(beat===6&&Math.random()<.55)||(beat===3&&Math.random()<.3)) mBox(ch.m[Math.floor(Math.random()*ch.m.length)]);
  mStep++;
}
function startMusic(){ if(ambOn) return; ambOn=true; var c=ctx(); ambGain=c.createGain(); ambGain.gain.value=muted?0:AMB; ambGain.connect(c.destination); mTick(); setInterval(mTick,M_BEAT); }

/* --- speech: two distinct browser voices (a caller and Bera) --- */
var _voices=[];
function loadVoices(){ try{ _voices=(window.speechSynthesis&&speechSynthesis.getVoices())||[]; }catch(e){ _voices=[]; } }
if('speechSynthesis' in window){ loadVoices(); try{ speechSynthesis.onvoiceschanged=loadVoices; }catch(e){} }
function findVoice(pats){ for(var i=0;i<pats.length;i++) for(var j=0;j<_voices.length;j++){ if(pats[i].test(_voices[j].name)||pats[i].test(_voices[j].voiceURI||'')) return _voices[j]; } return null; }
function callerVoice(){ return findVoice([/zira|hazel|susan|catherine|linda|female/i,/google us english/i,/english/i])||_voices[0]||null; }
function beraVoice(){ var c=callerVoice(); var a=findVoice([/google uk english female/i,/samantha|karen|tessa|moira|fiona|serena/i,/child|kid|junior/i]); if(a&&a!==c) return a; for(var i=0;i<_voices.length;i++) if(_voices[i]!==c) return _voices[i]; return c; }
function ttsSay(text,rate,pitch,vol,isCaller){ if(muted||!('speechSynthesis' in window)) return; try{ speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(text); u.rate=rate; u.pitch=pitch; u.volume=vol; var v=isCaller?callerVoice():beraVoice(); if(v) u.voice=v; speechSynthesis.speak(u); }catch(e){} }

var BERA_CLIPS = {
  "Hi! I’m Bera.":"bera_hi","Okay!":"bera_okay","Sure!":"bera_sure","I’m Bera.":"bera_name",
  "I am at the NIMHANS Museum.":"bera_place","Mmm… yeah? I’m Bera… I’m up…":"bera_up",
  "Okay…":"bera_okay_slow","I’m… Bera…":"bera_name_slow","NIMHANS Museum…":"bera_place_slow",
  "Huh?… yes?":"bera_huh","What…?":"bera_what","Ow!":"bera_ow","Clap?… Why?":"bera_clap_why",
  "This one?":"bera_this_one","Bera… I think?":"bera_name_confused","At… home?":"bera_home",
  "Mm… oh, hello!":"bera_oh_hello","Ugh… what? Oh… I’m Bera. That really woke me.":"bera_woke",
  "Ugh… what?":"bera_ugh","Mmm…":"bera_mmm","Mmnh…":"bera_mmnh",
  "I’m… flying…":"bera_flying","I’m in the clouds!":"bera_clouds",
  "I heard that… in my dream.":"bera_heard_dream","Yes! I know I’m dreaming!":"bera_lucid_yes",
  "I’m dreaming that I’m driving a car!":"bera_dream_car","Yes, I’m here.":"bera_here"
};
var _clipEls={};
function stopClips(){ for(var k in _clipEls){ try{ _clipEls[k].pause(); }catch(e){} } }
function beraSay(text, rate, pitch, vol){
  if(muted||!text) return;
  var base=BERA_CLIPS[text];
  if(base){
    var el=_clipEls[base]||(_clipEls[base]=new Audio('assets/audio/'+base+'.mp3'));
    try{ stopClips(); el.currentTime=0; el.volume=(vol==null?0.95:vol); var p=el.play(); if(p&&p.catch) p.catch(function(){ ttsSay(text,rate||1.0,pitch||1.5,vol==null?0.95:vol,false); }); }
    catch(e){ ttsSay(text,rate||1.0,pitch||1.5,vol==null?0.95:vol,false); }
    return;
  }
  ttsSay(text, rate||1.0, pitch||1.5, vol==null?0.95:vol, false);
}
function callerSay(text){ ttsSay(text, 0.98, 1.05, 1, true); }

/* ====================================================================
   5. SPRITE / REACTION HELPERS
   ================================================================== */
var beraImg, reactWrap, den;
function setPose(name){ beraImg.src = SPR + name + '.png'; }
var _reactT=null;
function reactOnce(cls, dur){
  if(!reactWrap) return;
  ['react-settle','react-stir','react-perk','react-flicker','react-fizzle'].forEach(function(c){ reactWrap.classList.remove(c); });
  void reactWrap.offsetWidth;
  reactWrap.classList.add(cls);
  clearTimeout(_reactT);
  _reactT = setTimeout(function(){ reactWrap.classList.remove(cls); }, dur||900);
}
function setLying(v){ if(den) den.dataset.lying = v ? '1' : '0'; }

/* ====================================================================
   6. SCREENS
   ================================================================== */
var SCREENS = ['scr-title','scr-select','scr-observe','scr-checklist','scr-place','scr-explain'];
function show(id){
  SCREENS.forEach(function(s){ var e=$(s); if(e) e.classList.toggle('on', s===id); });
  document.body.dataset.screen = id;
}

/* ---- run state ---- */
var G = { stateId:null, score:0, done:0, log:[], testIdx:0, placeFX:0.5, placeFY:0.5, placed:false };

/* ==== TITLE ==== */
function initTitle(){
  $('btn-start').addEventListener('click', function(){
    sTap(); ctx(); startMusic();
    try{ var el=document.documentElement; (el.requestFullscreen||el.webkitRequestFullscreen||function(){}).call(el); }catch(e){}
    callerSay("Hey! You are Doctor Detective D D today. Your job is to find out how Bera is feeling. It is simple — watch Bera's face and how she answers, tick what you see, then place her on the map. Let's go!");
    goSelect();
  });
}

/* kiosk: after a long idle, return to the title */
var IDLE_MS = 120000, idleT=null;
function armIdle(){
  clearTimeout(idleT);
  idleT = setTimeout(function(){
    if(document.body.dataset.screen==='scr-title') return;
    try{ speechSynthesis.cancel(); }catch(e){}
    stopClips();
    show('scr-title');
  }, IDLE_MS);
}

/* ==== SELECT (lever) ==== */
var selIndex = 0;
function initSelect(){
  var track=$('sel-track'), handle=$('sel-handle');
  // build notches
  STATE_ORDER.forEach(function(id,i){
    var n=document.createElement('div'); n.className='sel-notch'; n.style.top=(i/(STATE_ORDER.length-1)*100)+'%';
    track.appendChild(n);
  });
  function render(){
    var s=STATES[STATE_ORDER[selIndex]];
    handle.style.top=(selIndex/(STATE_ORDER.length-1)*100)+'%';
    handle.textContent=(selIndex+1);
    $('sel-emoji').textContent=s.emoji;
    $('sel-blurb').textContent=s.blurb;
    $('sel-preview').src=SPR+s.idle+'.png';
    $('sel-preview').className = s.lying ? 'lying' : '';
  }
  var drag=false;
  function fromY(clientY){
    var r=track.getBoundingClientRect();
    var f=Math.max(0,Math.min(1,(clientY-r.top)/r.height));
    return Math.round(f*(STATE_ORDER.length-1));
  }
  function move(e){ if(!drag) return; var y=(e.touches?e.touches[0].clientY:e.clientY); var i=fromY(y); if(i!==selIndex){ selIndex=i; sClick(); render(); } e.preventDefault(); }
  function up(){ drag=false; sClunk(); window.removeEventListener('pointermove',move); window.removeEventListener('pointerup',up); }
  handle.addEventListener('pointerdown',function(e){ drag=true; handle.setPointerCapture&&handle.setPointerCapture(e.pointerId); window.addEventListener('pointermove',move); window.addEventListener('pointerup',up); });
  handle.addEventListener('keydown',function(e){ if(e.key==='ArrowUp'){ selIndex=Math.max(0,selIndex-1); sClick(); render(); e.preventDefault(); } if(e.key==='ArrowDown'){ selIndex=Math.min(STATE_ORDER.length-1,selIndex+1); sClick(); render(); e.preventDefault(); } });
  track.addEventListener('pointerdown',function(e){ var i=fromY(e.clientY); if(i!==selIndex){ selIndex=i; sClick(); render(); } });

  $('sel-random').addEventListener('click', function(){ selIndex=Math.floor(Math.random()*STATE_ORDER.length); sTap(); render(); });
  $('sel-go').addEventListener('click', function(){ sTap(); beginState(STATE_ORDER[selIndex]); });
  render();
}
function goSelect(){
  $('sel-score').textContent = G.done ? ('Cases solved: '+G.done+'   ·   Score: '+G.score) : '';
  show('scr-select');
}

/* ==== OBSERVE ==== */
function beginState(id){
  G.stateId=id; G.log=[]; G.testIdx=0;
  var s=STATES[id];
  setPose(s.idle); setLying(s.lying);
  $('obs-name').textContent = 'Case: '+s.name;
  $('obs-emoji').textContent = s.emoji;
  buildTools();
  renderObsProgress();
  $('obs-feedback').className='obs-feedback';
  $('obs-feedback').textContent='';
  $('obs-opts').innerHTML='';
  $('obs-q').textContent='Pick a tool on the left to test Bera.';
  $('btn-obs-done').style.display='none';
  reactOnce('react-settle',700);
  show('scr-observe');
}
function buildTools(){
  var wrap=$('obs-tools'); wrap.innerHTML='';
  var s=STATES[G.stateId];
  s.tests.forEach(function(t,i){
    var meta=TOOLS[t.tool];
    var b=document.createElement('button');
    b.className='tool-btn'; b.dataset.idx=i;
    b.innerHTML='<span class="te">'+meta.emo+'</span><span class="tl">'+meta.label+'</span><span class="tc">✓</span>';
    b.addEventListener('click', function(){ runTest(i); });
    wrap.appendChild(b);
  });
}
function renderObsProgress(){
  var s=STATES[G.stateId], n=s.tests.length, done=G.log.length;
  $('obs-progress').textContent = done+' / '+n+' observed';
  var tools=$('obs-tools').children;
  for(var i=0;i<tools.length;i++){
    var logged = G.log.some(function(l){ return l.idx===+tools[i].dataset.idx; });
    tools[i].classList.toggle('done', logged);
  }
  if(done>=n) $('btn-obs-done').style.display='';
}
var _busy=false;
function runTest(i){
  if(_busy) return;
  var s=STATES[G.stateId], t=s.tests[i], meta=TOOLS[t.tool];
  _busy=true;
  $('obs-opts').innerHTML=''; $('obs-feedback').className='obs-feedback'; $('obs-feedback').textContent='';
  // stimulus
  if(t.tool==='alarm'){ sAlarm(); den.classList.add('shake'); setTimeout(function(){ den.classList.remove('shake'); },500); }
  else if(t.tool==='pinch'){ sPinch(); }
  else if(meta.say){ callerSay(meta.say); }
  else { sClick(); }
  burst(meta.emo + (meta.say?' “'+meta.say+'”':''));
  // Bera reacts
  setTimeout(function(){
    setPose(t.pose);
    reactOnce(t.react||'react-perk', 900);
    if(t.say) setTimeout(function(){ beraSay(t.say); }, t.tool==='call'||t.tool==='name'||t.tool==='place'||t.tool==='lucidq'||t.tool==='clap'||t.tool==='wave'||t.tool==='raisehand'||t.tool==='touchnose' ? 550 : 250);
    // after the beat, offer the log options
    setTimeout(function(){
      _busy=false;
      askLog(i);
    }, 1200);
  }, 350);
}
function askLog(i){
  var s=STATES[G.stateId], t=s.tests[i];
  $('obs-q').textContent = t.q;
  var box=$('obs-opts'); box.innerHTML='';
  var order=[0,1,2].sort(function(){ return Math.random()-0.5; });
  order.forEach(function(oi){
    var opt=t.opts[oi]; if(!opt) return;
    var b=document.createElement('button');
    b.className='opt-btn'; b.textContent=opt[0];
    b.addEventListener('click', function(){ chooseLog(i, oi, b); });
    box.appendChild(b);
  });
}
function chooseLog(i, oi, btn){
  var s=STATES[G.stateId], t=s.tests[i];
  if(G.log.some(function(l){ return l.idx===i; })) return;   // this test already got a right answer
  var correct = !!t.opts[oi][1];
  Array.prototype.forEach.call($('obs-opts').children, function(b){ b.disabled=true; });
  if(!correct){
    sNope();
    btn.classList.add('chosen-no');
    $('obs-feedback').className='obs-feedback no';
    $('obs-feedback').textContent='';
    showPopup('🔍 Observe Bera again', 'That is not what Bera did. Watch her carefully and try that test once more.', function(){ runTest(i); });
    return;
  }
  btn.classList.add('chosen-ok');
  G.log.push({ idx:i, tool:t.tool, chose:t.opts[oi][0], correct:true });
  G.score += 10;
  sGood();
  var fb=$('obs-feedback'); fb.className='obs-feedback ok'; fb.textContent='Good eye, Detective!';
  renderObsProgress();
}
function initObserve(){
  $('btn-obs-done').addEventListener('click', function(){ sTap(); goChecklist(); });
  $('btn-obs-quit').addEventListener('click', function(){ sTap(); goSelect(); });
}

/* ==== popup ==== */
var _popupOk=null;
function showPopup(title, msg, onOk){
  $('popup-title').textContent = title;
  $('popup-msg').textContent = msg;
  _popupOk = onOk || null;
  $('popup').classList.add('on');
}
function initPopup(){
  $('popup-ok').addEventListener('click', function(){
    sTap();
    $('popup').classList.remove('on');
    var f=_popupOk; _popupOk=null;
    if(f) f();
  });
}

/* ==== CHECKLIST ==== */
function goChecklist(){
  var s=STATES[G.stateId];
  $('chk-name').textContent = s.name;
  $('chk-pose').src = SPR + s.idle + '.png';
  $('chk-pose').className = s.lying ? 'lying' : '';
  var list=$('chk-list'); list.innerHTML='';
  // keep test order
  s.tests.forEach(function(t,i){
    var l=G.log.filter(function(x){ return x.idx===i; })[0];
    if(!l) return;
    var row=document.createElement('div'); row.className='chk-row '+(l.correct?'ok':'no');
    row.innerHTML='<span class="ce">'+TOOLS[t.tool].emo+'</span><span class="ct">'+t.q.replace(/…$/,'')+' <b>'+l.chose+'</b></span><span class="cm">'+(l.correct?'✓':'✗')+'</span>';
    list.appendChild(row);
  });
  show('scr-checklist');
}
function initChecklist(){
  $('btn-chk-next').addEventListener('click', function(){ sTap(); goPlace(); });
}

/* ==== PLACE (drag on diagram) ==== */
var placeEls=null;
function goPlace(){
  var s=STATES[G.stateId];
  G.placed=false;
  $('place-ref').src = SPR + s.idle + '.png';
  $('place-ref').className = s.lying ? 'lying' : '';
  $('place-verdict').className='place-verdict'; $('place-verdict').textContent='';
  $('btn-place-submit').disabled=false; $('btn-place-submit').style.display='';
  $('btn-place-next').style.display='none';
  // start Bera near the middle, alert pose
  G.placeFX=0.5; G.placeFY=0.5;
  show('scr-place');
  requestAnimationFrame(function(){ layoutPlace(); syncBera(true); });
}
function layoutPlace(){
  var frame=$('place-frame'), img=$('place-diagram');
  var fr=frame.getBoundingClientRect();
  placeEls = placeEls || { frame:frame };
  placeEls.w = fr.width; placeEls.h = fr.height;
}
function nearestZone(fx,fy){
  var best=ZONES[0], bd=1e9;
  for(var i=0;i<ZONES.length;i++){
    var dx=ZONES[i].fx-fx, dy=ZONES[i].fy-fy, d=dx*dx+dy*dy;
    if(d<bd){ bd=d; best=ZONES[i]; }
  }
  return best;
}
function syncBera(updatePose){
  var b=$('place-bera'), frame=$('place-frame');
  var fr=frame.getBoundingClientRect();
  b.style.left=(G.placeFX*100)+'%';
  b.style.top=(G.placeFY*100)+'%';
  if(updatePose){
    var z=nearestZone(G.placeFX,G.placeFY);
    b.src=SPR+z.pose+'.png';
    var s=STATES[G.stateId];
    var match = (z.pose === s.idle);
    $('place-hint').textContent = match ? '✓ her face matches — is this the right spot?' : 'keep going — match her expression to the card';
    $('place-hint').classList.toggle('match', match);
  }
  // axis glow
  var gx=$('glow-x'), gy=$('glow-y');
  var cx=Math.max(AX.ox,Math.min(AX.xEnd,G.placeFX));
  var cy=Math.max(AX.yTop,Math.min(AX.oy,G.placeFY));
  gx.style.left=(AX.ox*100)+'%'; gx.style.top=(AX.oy*100)+'%'; gx.style.width=((cx-AX.ox)*100)+'%';
  gy.style.left=(AX.ox*100)+'%'; gy.style.top=(cy*100)+'%'; gy.style.height=((AX.oy-cy)*100)+'%';
}
function initPlace(){
  var frame=$('place-frame'), b=$('place-bera');
  var drag=false;
  function pt(e){ return e.touches?e.touches[0]:e; }
  function moveTo(e){
    var fr=frame.getBoundingClientRect(), p=pt(e);
    G.placeFX=Math.max(0.03,Math.min(0.97,(p.clientX-fr.left)/fr.width));
    G.placeFY=Math.max(0.03,Math.min(0.97,(p.clientY-fr.top)/fr.height));
    syncBera(true);
    e.preventDefault();
  }
  function down(e){
    if(G.placed) return;
    drag=true;
    window.addEventListener('pointermove',move);
    window.addEventListener('pointerup',up);
    try{ b.setPointerCapture && b.setPointerCapture(e.pointerId); }catch(err){}
    moveTo(e);
  }
  function move(e){ if(drag) moveTo(e); }
  function up(){ if(!drag) return; drag=false; sClick(); window.removeEventListener('pointermove',move); window.removeEventListener('pointerup',up); }
  b.addEventListener('pointerdown',down);
  frame.addEventListener('pointerdown',function(e){ if(e.target===b || G.placed) return; down(e); });
  window.addEventListener('resize', function(){ if(document.body.dataset.screen==='scr-place'){ layoutPlace(); syncBera(false); } });

  $('btn-place-submit').addEventListener('click', submitPlace);
  $('btn-place-next').addEventListener('click', function(){ sTap(); goExplain(); });
}
function submitPlace(){
  if(G.placed) return;
  G.placed=true;
  var s=STATES[G.stateId], tgt=zoneById(s.zone);
  var dx=G.placeFX-tgt.fx, dy=G.placeFY-tgt.fy;
  var dist=Math.sqrt(dx*dx+dy*dy);
  var pts, verdict, cls;
  if(dist<0.09){ pts=100; verdict='🎯 Spot on, Detective!'; cls='great'; }
  else if(dist<0.20){ pts=60; verdict='👍 Close! Just a little off.'; cls='ok'; }
  else { pts=25; verdict='🔍 Not quite — here is where it belongs.'; cls='far'; }
  G.score+=pts;
  $('place-verdict').textContent = verdict + '  (+' + pts + ')';
  $('place-verdict').className='place-verdict '+cls;
  $('btn-place-submit').style.display='none';
  // glide Bera to the exact target + correct pose
  var start={fx:G.placeFX,fy:G.placeFY}, t0=null;
  (function anim(ts){
    if(!t0) t0=ts;
    var k=Math.min(1,(ts-t0)/500), e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
    G.placeFX=start.fx+(tgt.fx-start.fx)*e;
    G.placeFY=start.fy+(tgt.fy-start.fy)*e;
    syncBera(false);
    $('place-bera').src=SPR+s.idle+'.png';
    if(k<1) requestAnimationFrame(anim);
    else { $('place-bera').classList.add('landed'); setTimeout(function(){ $('place-bera').classList.remove('landed'); },400); sClunk(); $('btn-place-next').style.display=''; }
  })(0);
  if(pts>=60) sGood(); else sNope();
}

/* ==== EXPLAIN ==== */
function goExplain(){
  var s=STATES[G.stateId];
  $('exp-name').textContent=s.name;
  $('exp-emoji').textContent=s.emoji;
  $('exp-pose').src=SPR+s.idle+'.png';
  $('exp-pose').className = s.lying ? 'lying' : '';
  $('exp-text').innerHTML=s.explain;
  G.done++;
  $('exp-score').textContent='Score so far: '+G.score+'   ·   Cases solved: '+G.done;
  show('scr-explain');
  // Bera "speaks" the explanation via TTS (long line, no clip)
  setTimeout(function(){ ttsSay(s.explain.replace(/<[^>]+>/g,''), 1.0, 1.4, 0.9, false); }, 500);
  reactOnce('react-perk',700);
}
function initExplain(){
  $('btn-exp-again').addEventListener('click', function(){ sTap(); try{ speechSynthesis.cancel(); }catch(e){} goSelect(); });
}

/* ==== call-burst overlay ==== */
var _burstT=null;
function burst(txt){
  var el=$('burst'); if(!el) return;
  el.textContent=txt; el.classList.remove('go'); void el.offsetWidth; el.classList.add('go');
  clearTimeout(_burstT); _burstT=setTimeout(function(){ el.classList.remove('go'); }, 1400);
}

/* ====================================================================
   7. BOOT
   ================================================================== */
function boot(){
  beraImg=$('beraImg'); reactWrap=$('reactWrap'); den=$('den');
  initTitle(); initSelect(); initObserve(); initChecklist(); initPlace(); initExplain(); initPopup();

  $('btn-mute').addEventListener('click', function(){
    muted=!muted; $('btn-mute').textContent=muted?'🔇':'🔊';
    if(muted){ stopClips(); try{ speechSynthesis.cancel(); }catch(e){} }
    if(ambGain){ ambGain.gain.linearRampToValueAtTime(muted?0:AMB, ctx().currentTime+0.3); }
  });

  // deep-link: ?state=rem  (title tap then straight into that case)
  var m = location.search.match(/[?&]state=([a-z]+)/i);
  var deep = (m && STATES[m[1]]) ? m[1] : null;
  if(deep){
    $('btn-start').textContent = '🔍  Start this case';
    $('btn-start').addEventListener('click', function(){ setTimeout(function(){ beginState(deep); }, 30); });
  }
  show('scr-title');

  document.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  document.addEventListener('dragstart', function(e){ e.preventDefault(); });
  document.addEventListener('pointerdown', armIdle, {passive:true});
  document.addEventListener('keydown', armIdle, {passive:true});
  armIdle();

  // idle blink for the alert idle pose
  setInterval(function(){
    if(!beraImg) return;
    if(beraImg.src.indexOf('eyes_open.png') === -1) return;
    beraImg.src = SPR + 'blink1.png';
    setTimeout(function(){ if(beraImg.src.indexOf('blink1.png')!==-1) beraImg.src = SPR + 'eyes_open.png'; }, 110);
  }, 3400);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
