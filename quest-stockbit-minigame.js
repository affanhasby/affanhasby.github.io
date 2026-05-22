/* AFFAN QUEST — Stockbit Bug Hunt mini-game (shooter mechanic) */
(function () {
  const W = 400;  // logical canvas width
  const H = 560;  // logical canvas height
  const PROD_Y = H - 60; // production line y
  const BUG_R = 14;
  const BULLET_R = 5;
  const BULLET_SPEED = 520;
  const FIRE_COOLDOWN_MS = 150;

  let overlay, canvas, ctx;
  let state = null;
  let rafId = null;
  let lastTime = 0;
  let initialized = false;

  // ===== Public API =====
  window.StockbitMiniGame = {
    /** start({ facts: string[], onComplete: ({outcome,caught}) => void }) */
    start(opts) {
      if (!initialized) build();
      state = {
        facts: opts.facts || [],
        onComplete: opts.onComplete || function () {},
        caught: 0,
        missed: 0,
        bugs: [],
        bullets: [],
        particles: [],
        shooter: { x: W / 2, y: PROD_Y + 18 },
        lastShot: 0,
        paused: false,
        ended: false,
        speed: 70,        // px/sec, escalates per catch
        spawnAt: 0.4,
        time: 0,
      };
      overlay.style.display = 'flex';
      document.getElementById('mg-fact').style.display = 'none';
      document.getElementById('mg-end').style.display = 'none';
      updateStats();
      lastTime = performance.now();
      scheduleSpawn(0.4);
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(loop);
    },
    close(outcome) { finish(outcome || 'closed'); }
  };

  // ===== Build overlay =====
  function build() {
    overlay = document.createElement('div');
    overlay.id = 'stockbit-minigame';
    overlay.className = 'minigame-overlay';
    const t = (k) => (window.QuestI18n && window.QuestI18n.t('minigame.' + k)) || k;
    overlay.innerHTML = `
      <div class="mg-panel">
        <div class="mg-header">
          <div class="mg-title" id="mg-title">${t('title')}</div>
          <button class="mg-close" id="mg-close" aria-label="Close">✕</button>
        </div>
        <div class="mg-subtitle" id="mg-subtitle">${t('subtitle')}</div>
        <div class="mg-stats">
          <div class="mg-stat"><span class="mg-stat-label" id="mg-caught-label">${t('caught')}</span>
            <span class="mg-stat-value"><b id="mg-caught">0</b>/<span id="mg-target">3</span></span></div>
          <div class="mg-stat"><span class="mg-stat-label" id="mg-lives-label">${t('lives')}</span>
            <span class="mg-stat-value" id="mg-lives">●●●</span></div>
        </div>
        <div class="mg-canvas-wrap">
          <canvas id="mg-canvas" width="${W}" height="${H}"></canvas>

          <div class="mg-fact" id="mg-fact" style="display:none">
            <div class="mg-fact-icon">✓</div>
            <div class="mg-fact-label" id="mg-fact-label">${t('bugCaught')}</div>
            <div class="mg-fact-text" id="mg-fact-text"></div>
            <button class="mg-btn primary" id="mg-fact-btn">${t('continueBtn')}</button>
          </div>

          <div class="mg-end" id="mg-end" style="display:none">
            <div class="mg-end-emoji" id="mg-end-emoji">🎉</div>
            <div class="mg-end-title" id="mg-end-title"></div>
            <div class="mg-end-text" id="mg-end-text"></div>
            <div class="mg-end-buttons" id="mg-end-buttons"></div>
          </div>
        </div>
        <div class="mg-hint" id="mg-hint">${t('hint')}</div>
      </div>
    `;
    document.body.appendChild(overlay);
    canvas = overlay.querySelector('#mg-canvas');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    setupInput();
    overlay.querySelector('#mg-close').addEventListener('click', () => finish('closed'));
    overlay.querySelector('#mg-fact-btn').addEventListener('click', continueAfterFact);
    initialized = true;
  }

  function updateStats() {
    document.getElementById('mg-caught').textContent = state.caught;
    document.getElementById('mg-target').textContent = state.facts.length;
    const livesEl = document.getElementById('mg-lives');
    const remaining = 3 - state.missed;
    livesEl.textContent = '●●●'.slice(0, remaining) + '○○○'.slice(0, state.missed);
    livesEl.style.color = remaining <= 1 ? '#d94c3d' : '';
    // re-render labels in case language changed
    const t = (k) => (window.QuestI18n && window.QuestI18n.t('minigame.' + k)) || k;
    document.getElementById('mg-title').textContent = t('title');
    document.getElementById('mg-subtitle').textContent = t('subtitle');
    document.getElementById('mg-caught-label').textContent = t('caught');
    document.getElementById('mg-lives-label').textContent = t('lives');
    document.getElementById('mg-hint').textContent = t('hint');
    document.getElementById('mg-fact-label').textContent = t('bugCaught');
    document.getElementById('mg-fact-btn').textContent = t('continueBtn');
  }

  // ===== Input — tap to fire =====
  function setupInput() {
    function pos(e) {
      const r = canvas.getBoundingClientRect();
      const p = e.touches ? e.touches[0] : e;
      return {
        x: (p.clientX - r.left) * (W / r.width),
        y: (p.clientY - r.top) * (H / r.height)
      };
    }
    function fire(e) {
      if (!state || state.paused || state.ended) return;
      const p = pos(e);
      fireBullet(p.x, p.y);
      e.preventDefault();
    }
    canvas.addEventListener('mousedown', fire);
    canvas.addEventListener('touchstart', fire, { passive: false });
  }

  function fireBullet(tx, ty) {
    const now = Date.now();
    if (now - state.lastShot < FIRE_COOLDOWN_MS) return;
    state.lastShot = now;
    const sx = state.shooter.x;
    const sy = state.shooter.y;
    const dx = tx - sx;
    const dy = ty - sy;
    const d = Math.hypot(dx, dy);
    if (d < 1) return;
    // Don't shoot downward — only above shooter
    if (dy > 0) return;
    state.bullets.push({
      x: sx, y: sy,
      vx: (dx / d) * BULLET_SPEED,
      vy: (dy / d) * BULLET_SPEED,
      trail: [],
      dead: false,
    });
    try { if (window.GameAudio) window.GameAudio.factPing(); } catch (e) {}
  }

  function catchBug(b) {
    b.caught = true;
    state.caught++;
    state.paused = true;
    emitParticles(b.x, b.y, 18, ['#c97e8a', '#fff', '#a01030', '#ffaa44']);
    try { if (window.GameAudio) window.GameAudio.catchBug(); } catch (e) {}
    // show fact balloon
    const factEl = document.getElementById('mg-fact');
    const factText = document.getElementById('mg-fact-text');
    const fact = state.facts[state.caught - 1] || '';
    factText.innerHTML = fact;
    factEl.style.display = 'flex';
    updateStats();
  }

  function continueAfterFact() {
    document.getElementById('mg-fact').style.display = 'none';
    state.bugs = state.bugs.filter(b => !b.caught);
    state.paused = false;
    if (state.caught >= state.facts.length) {
      win();
    } else {
      // speed escalates with each catch (steeper if fewer facts)
      const target = state.facts.length;
      state.speed = 70 + (state.caught / target) * 130;
      scheduleSpawn(0.3);
    }
  }

  function win() {
    state.ended = true;
    showEnd({
      emoji: '🎉',
      title: tStr('winTitle'),
      text: tStr('winText'),
      buttons: [{
        label: tStr('winBtn'),
        primary: true,
        action: () => finish('win'),
      }],
    });
  }

  function lose() {
    state.ended = true;
    showEnd({
      emoji: '💢',
      title: tStr('loseTitle'),
      text: tStr('loseText'),
      buttons: [
        { label: tStr('retryBtn'), primary: false, action: () => { hideEnd(); restart(); } },
        { label: tStr('skipBtn'), primary: true, action: () => finish('skip') },
      ],
    });
  }

  function restart() {
    state.caught = 0;
    state.missed = 0;
    state.bugs = [];
    state.bullets = [];
    state.particles = [];
    state.lastShot = 0;
    state.paused = false;
    state.ended = false;
    state.speed = 70;
    state.spawnAt = 0.4;
    state.time = 0;
    updateStats();
    scheduleSpawn(0.4);
  }

  function showEnd(cfg) {
    const end = document.getElementById('mg-end');
    document.getElementById('mg-end-emoji').textContent = cfg.emoji;
    document.getElementById('mg-end-title').textContent = cfg.title;
    document.getElementById('mg-end-text').innerHTML = cfg.text;
    const btnWrap = document.getElementById('mg-end-buttons');
    btnWrap.innerHTML = '';
    cfg.buttons.forEach(b => {
      const el = document.createElement('button');
      el.className = 'mg-btn ' + (b.primary ? 'primary' : 'secondary');
      el.textContent = b.label;
      el.addEventListener('click', b.action);
      btnWrap.appendChild(el);
    });
    end.style.display = 'flex';
  }
  function hideEnd() { document.getElementById('mg-end').style.display = 'none'; }

  function finish(outcome) {
    cancelAnimationFrame(rafId);
    rafId = null;
    overlay.style.display = 'none';
    const cb = state && state.onComplete;
    const result = { outcome, caught: state ? state.caught : 0 };
    state = null;
    if (cb) cb(result);
  }

  function tStr(k) {
    return (window.QuestI18n && window.QuestI18n.t('minigame.' + k)) || k;
  }

  // ===== Spawn logic =====
  function scheduleSpawn(delay) {
    state.spawnAt = state.time + delay;
  }

  function spawnBug() {
    const x = 40 + Math.random() * (W - 80);
    state.bugs.push({
      x, y: -20,
      vx: (Math.random() - 0.5) * 30, // slight horizontal drift
      vy: state.speed,
      r: BUG_R,
      bob: Math.random() * Math.PI * 2,
      caught: false,
      escaped: false,
    });
  }

  // ===== Loop =====
  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    if (!state) return;
    if (!state.paused && !state.ended) {
      state.time += dt;
      if (state.time >= state.spawnAt && state.bugs.filter(b => !b.caught && !b.escaped).length === 0) {
        spawnBug();
        state.spawnAt = state.time + 999; // only one bug at a time
      }
      for (const b of state.bugs) {
        if (b.caught || b.escaped) continue;
        b.y += b.vy * dt;
        b.x += b.vx * dt;
        if (b.x < 20) { b.x = 20; b.vx = Math.abs(b.vx); }
        if (b.x > W - 20) { b.x = W - 20; b.vx = -Math.abs(b.vx); }
        b.bob += dt * 8;
        if (b.y >= PROD_Y) {
          b.escaped = true;
          state.missed++;
          updateStats();
          try { if (window.GameAudio) window.GameAudio.dialogTick(); } catch (e) {}
          if (state.missed >= 3) { lose(); break; }
          else { scheduleSpawn(0.4); }
        }
      }
      state.bugs = state.bugs.filter(b => !(b.escaped && b.y > PROD_Y + 60));

      // bullets — move, check off-screen, check bug collisions
      for (const bul of state.bullets) {
        bul.trail.unshift({ x: bul.x, y: bul.y });
        if (bul.trail.length > 7) bul.trail.pop();
        bul.x += bul.vx * dt;
        bul.y += bul.vy * dt;
        if (bul.x < -10 || bul.x > W + 10 || bul.y < -10 || bul.y > H + 10) {
          bul.dead = true;
          continue;
        }
        for (const b of state.bugs) {
          if (b.caught || b.escaped) continue;
          const dx = b.x - bul.x;
          const dy = b.y - bul.y;
          const hr = BUG_R + BULLET_R + 2;
          if (dx * dx + dy * dy < hr * hr) {
            catchBug(b);
            bul.dead = true;
            break;
          }
        }
      }
      state.bullets = state.bullets.filter(b => !b.dead);
      // particles
      for (const p of state.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 360 * dt;
        p.life -= dt;
      }
      state.particles = state.particles.filter(p => p.life > 0);
    }
    render();
    rafId = requestAnimationFrame(loop);
  }

  function emitParticles(x, y, n, colors) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 80 + Math.random() * 160;
      state.particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 60,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.7,
        size: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  // ===== Render =====
  function render() {
    // background — paper map vibe
    ctx.fillStyle = '#1a2030';
    ctx.fillRect(0, 0, W, H);
    // subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke();
    }
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); ctx.stroke();
    }

    // production line — danger zone
    const grad = ctx.createLinearGradient(0, PROD_Y - 30, 0, H);
    grad.addColorStop(0, 'rgba(217,76,61,0)');
    grad.addColorStop(1, 'rgba(217,76,61,0.18)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, PROD_Y - 30, W, H - (PROD_Y - 30));
    // dashed line
    ctx.strokeStyle = '#d94c3d';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(0, PROD_Y);
    ctx.lineTo(W, PROD_Y);
    ctx.stroke();
    ctx.setLineDash([]);
    // label
    ctx.fillStyle = 'rgba(217,76,61,0.9)';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('▼ ' + tStr('production') + ' ▼', W / 2, PROD_Y - 10);

    // swipe trail
    // (removed — we now use bullets)

    // shooter — small turret at the bottom
    drawShooter();

    // bullets
    for (const bul of state.bullets) {
      // trail
      for (let i = 0; i < bul.trail.length; i++) {
        const t = bul.trail[i];
        const a = 1 - i / bul.trail.length;
        ctx.globalAlpha = a * 0.8;
        ctx.fillStyle = '#ffeb82';
        ctx.beginPath();
        ctx.arc(t.x, t.y, BULLET_R * a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // core
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(bul.x, bul.y, BULLET_R, 0, Math.PI * 2);
      ctx.fill();
      // glow
      ctx.fillStyle = 'rgba(255, 235, 130, 0.6)';
      ctx.beginPath();
      ctx.arc(bul.x, bul.y, BULLET_R + 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // bugs
    for (const b of state.bugs) {
      if (b.caught || b.escaped) continue;
      drawBug(b);
    }

    // escaped bugs — red ghost still falling
    for (const b of state.bugs) {
      if (b.escaped && b.y < PROD_Y + 60) {
        ctx.globalAlpha = Math.max(0, 1 - (b.y - PROD_Y) / 60);
        drawBug(b, true);
        ctx.globalAlpha = 1;
      }
    }

    // particles
    for (const p of state.particles) {
      const a = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawShooter() {
    const sx = state.shooter.x;
    const sy = state.shooter.y;
    // Base / platform
    ctx.fillStyle = 'rgba(197, 225, 165, 0.15)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 6, 22, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body
    ctx.fillStyle = '#c5e1a5';
    ctx.beginPath();
    ctx.moveTo(sx - 12, sy + 4);
    ctx.lineTo(sx + 12, sy + 4);
    ctx.lineTo(sx + 8, sy - 4);
    ctx.lineTo(sx - 8, sy - 4);
    ctx.closePath();
    ctx.fill();
    // Barrel
    ctx.fillStyle = '#a3c97e';
    ctx.fillRect(sx - 3, sy - 14, 6, 10);
    ctx.fillStyle = '#1a3050';
    ctx.fillRect(sx - 4, sy - 16, 8, 3);
  }

  function drawBug(b, escaped) {
    const bob = Math.sin(b.bob) * 1.5;
    const cx = Math.round(b.x), cy = Math.round(b.y + bob);
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 18, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // body
    ctx.fillStyle = escaped ? '#5a2030' : '#c97e8a';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 14, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    // stripe
    ctx.fillStyle = escaped ? '#3a1018' : '#a01030';
    ctx.fillRect(cx - 12, cy - 2, 24, 4);
    // legs
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(cx - 17, cy - 2, 4, 3);
    ctx.fillRect(cx + 13, cy - 2, 4, 3);
    ctx.fillRect(cx - 17, cy + 4, 4, 3);
    ctx.fillRect(cx + 13, cy + 4, 4, 3);
    // eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx - 6, cy - 6, 4, 4);
    ctx.fillRect(cx + 2, cy - 6, 4, 4);
    ctx.fillStyle = '#000';
    ctx.fillRect(cx - 5, cy - 5, 2, 2);
    ctx.fillRect(cx + 3, cy - 5, 2, 2);
  }
})();
