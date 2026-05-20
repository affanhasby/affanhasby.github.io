/* AFFAN QUEST — Audio engine */
(function() {
  let ctx, bgmGain, sfxGain, bgmInterval, melodyIdx = 0;
  let muted = false;

  function ensure() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    bgmGain = ctx.createGain();
    bgmGain.gain.value = 0.04;
    bgmGain.connect(ctx.destination);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.1;
    sfxGain.connect(ctx.destination);
  }

  function tone(freq, dur, type = 'square', gain = 1, when = 0) {
    if (muted) return;
    ensure();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(sfxGain);
    const t = ctx.currentTime + when;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  const melody = [
    [262, 0.25], [330, 0.25], [392, 0.25], [330, 0.25],
    [262, 0.25], [349, 0.25], [440, 0.25], [349, 0.25],
    [294, 0.25], [370, 0.25], [440, 0.25], [370, 0.25],
    [262, 0.25], [330, 0.25], [392, 0.5]
  ];

  function startBGM() {
    ensure();
    if (bgmInterval) return;
    function play() {
      if (muted) return;
      const [f, d] = melody[melodyIdx % melody.length];
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'square';
      o.frequency.value = f;
      o.connect(g);
      g.connect(bgmGain);
      const t = ctx.currentTime;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.35, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.start(t);
      o.stop(t + d + 0.02);
      melodyIdx++;
    }
    play();
    bgmInterval = setInterval(play, 250);
  }

  function start() {
    ensure();
    if (ctx.state === 'suspended') ctx.resume();
    startBGM();
  }

  function setMuted(m) {
    muted = m;
    ensure();
    if (bgmGain) bgmGain.gain.value = m ? 0 : 0.04;
    if (sfxGain) sfxGain.gain.value = m ? 0 : 0.1;
  }

  function isMuted() { return muted; }

  window.GameAudio = {
    start,
    setMuted,
    isMuted,
    footstep: () => tone(180 + Math.random() * 30, 0.04, 'triangle', 0.25),
    dialogTick: () => tone(660, 0.02, 'square', 0.15),
    dialogOpen: () => { tone(440, 0.05, 'square', 0.4); tone(660, 0.06, 'square', 0.4, 0.05); },
    questUpdate: () => { tone(523, 0.08, 'square', 0.5); tone(784, 0.12, 'square', 0.5, 0.08); },
    factPing: () => { tone(880, 0.06, 'sine', 0.3); tone(1320, 0.08, 'sine', 0.3, 0.06); },
    catchBug: () => { tone(440, 0.06, 'sawtooth', 0.4); tone(220, 0.15, 'sawtooth', 0.4, 0.06); }
  };
})();
