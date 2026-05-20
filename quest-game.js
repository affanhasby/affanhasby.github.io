/* AFFAN QUEST v0.4 — Minimalist redesign + co-located NPCs + particles + chase orbs */

const TILE = 32;
const MAP_W = 56;
const MAP_H = 36;
// View dimensions are dynamic — adjusted in fitCanvas() based on screen.
// Defaults are desktop landscape.
let VIEW_W = 22 * TILE;
let VIEW_H = 14 * TILE;

const T = {
  GRASS: 0, PATH: 1, TREE: 2, FLOWER: 4, STONE: 7, BUSH: 3,
  WATER: 5, LANTERN: 8, BRIDGE: 9, COBBLE: 10, SAND: 11, FLOWERBED: 12
};
const SOLID_TILES = new Set([T.TREE, T.WATER, T.LANTERN]);

// ===== MAP =====
const MAP = [];
(function buildMap() {
  for (let y = 0; y < MAP_H; y++) {
    const row = [];
    for (let x = 0; x < MAP_W; x++) {
      if (x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1) row.push(T.TREE);
      else row.push(T.GRASS);
    }
    MAP.push(row);
  }
  const set = (x, y, t) => { if (MAP[y]?.[x] !== undefined) MAP[y][x] = t; };
  const path = (x, y) => { if (MAP[y]?.[x] === T.GRASS || MAP[y]?.[x] === T.TREE) MAP[y][x] = T.PATH; };

  // Main winding horizontal path (subtle wave)
  for (let x = 3; x < MAP_W - 3; x++) {
    const wave = Math.round(Math.sin(x / 6) * 1);
    path(x, 18 + wave); path(x, 19 + wave);
  }

  // Vertical roads to top buildings (NPCs sit right beside)
  [7, 20, 33, 46].forEach(cx => {
    for (let y = 7; y <= 19; y++) path(cx, y);
  });
  // Vertical roads to bottom buildings
  [12, 30].forEach(cx => {
    for (let y = 19; y <= 28; y++) path(cx, y);
  });

  // Side branches with curves
  for (let x = 7; x <= 33; x++) path(x, 25);

  // === Central plaza (cobble) around signpost ===
  for (let dx = -3; dx <= 3; dx++)
    for (let dy = -2; dy <= 2; dy++)
      set(28 + dx, 18 + dy, T.COBBLE);

  // === Pond near top-right (small lake) ===
  const pondTiles = [
    [49,12],[50,12],[51,12],
    [48,13],[49,13],[50,13],[51,13],[52,13],
    [48,14],[49,14],[50,14],[51,14],[52,14],
    [49,15],[50,15],[51,15]
  ];
  pondTiles.forEach(([x,y]) => set(x, y, T.WATER));
  // sand around pond
  [[47,12],[47,13],[47,14],[47,15],[48,11],[49,11],[50,11],[51,11],[52,11],[52,12],[53,13],[53,14],[48,16],[49,16],[50,16],[51,16],[52,15]]
    .forEach(([x,y]) => { if (MAP[y]?.[x] === T.GRASS) set(x, y, T.SAND); });

  // === Stream + bridge on west side ===
  for (let y = 6; y <= 14; y++) set(3, y, T.WATER);
  for (let y = 6; y <= 14; y++) set(4, y, T.WATER);
  // bridge crossing the stream
  set(3, 10, T.BRIDGE); set(4, 10, T.BRIDGE);
  // path connects to bridge
  path(2, 10); path(5, 10);
  for (let x = 5; x <= 7; x++) path(x, 10);

  // === Flower bed accents ===
  const beds = [
    [10,7],[10,8],[16,7],[16,8],[23,7],[23,8],[29,7],[29,8],
    [36,7],[36,8],[42,7],[42,8],
    [9,29],[9,30],[15,29],[15,30],[27,29],[27,30],[33,29],[33,30]
  ];
  beds.forEach(([x,y]) => { if (MAP[y]?.[x] === T.GRASS) set(x, y, T.FLOWERBED); });

  // === Decorative trees (sparse, intentional) ===
  const trees = [
    [6,7],[14,8],[18,9],[26,8],[40,9],[44,8],
    [6,15],[18,15],[24,15],[34,15],[40,15],
    [7,22],[14,22],[19,22],[24,22],[34,22],[40,22],[46,22],
    [6,30],[14,30],[20,32],[26,32],[34,32],[42,32],[50,32],[50,28],
    [3,30],[52,30],[52,5],[10,32],[18,32],[42,5],[3,33],[52,33]
  ];
  trees.forEach(([x, y]) => { if (MAP[y]?.[x] === T.GRASS) set(x, y, T.TREE); });

  // === Lanterns at plaza corners ===
  const lanterns = [[25,16],[31,16],[25,20],[31,20]];
  lanterns.forEach(([x, y]) => set(x, y, T.LANTERN));

  // === Single flowers scattered along paths ===
  const flowers = [[5,18],[51,18],[28,15],[28,21],[10,11],[40,11],[16,27],[34,27]];
  flowers.forEach(([x, y]) => { if (MAP[y]?.[x] === T.GRASS) set(x, y, T.FLOWER); });
})();

// ===== BUILDINGS — 4×3 minimalist, NPCs sit beside =====
const BUILDINGS = [
  { id: 'stockbit',   name: 'Stockbit',     tag: 'FINTECH',    x: 5,  y: 4,  w: 4, h: 3, color: '#1a8a4a', logo: 'S', pin: 1 },
  { id: 'telkom-uni', name: 'Telkom Univ.', tag: 'EDUCATION',  x: 18, y: 4,  w: 4, h: 3, color: '#d94c3d', logo: 'T', pin: 2 },
  { id: 'telkom-id',  name: 'Telkom Indo.', tag: 'TELCO',      x: 31, y: 4,  w: 4, h: 3, color: '#4a7090', logo: 'T', pin: 3 },
  { id: 'extra',      name: 'Coming Soon',  tag: 'WIP',        x: 44, y: 4,  w: 4, h: 3, color: '#8a7e68', logo: '?', pin: 6 },
  { id: 'kb-bank',    name: 'KB Bukopin',   tag: 'BANKING',    x: 10, y: 30, w: 4, h: 3, color: '#c9962a', logo: 'B', pin: 4 },
  { id: 'mediarumu',  name: 'MEDIARūMU',    tag: 'CREATIVE',   x: 28, y: 30, w: 4, h: 3, color: '#a378c4', logo: 'M', pin: 5 }
];

const buildingMask = {};
BUILDINGS.forEach(b => {
  for (let y = b.y; y < b.y + b.h; y++)
    for (let x = b.x; x < b.x + b.w; x++)
      buildingMask[`${x},${y}`] = b;
});

// ===== NPCs — adjacent to buildings =====
const NPCS = [
  { id: 'stockbit-lead', x: 10, y: 5, color: '#a3c97e', avatar: 'QA' },
  { id: 'telkom-prof',   x: 23, y: 5, color: '#e09b9b', avatar: 'PD' },
  { id: 'telkom-id-mgr', x: 36, y: 5, color: '#9bb3d8', avatar: 'M' },
  { id: 'kb-pm',         x: 15, y: 31, color: '#e6cc92', avatar: 'PL' },
  { id: 'media-creative',x: 33, y: 31, color: '#bda0d4', avatar: 'CD' }
];

// ===== Fact Orbs — chase player when nearby =====
const FACT_ORBS = [
  { id: 'f1', x: 9,  y: 14, px: 9*TILE+16,  py: 14*TILE+16, collected: false, t: 0 },
  { id: 'f2', x: 16, y: 19, px: 16*TILE+16, py: 19*TILE+16, collected: false, t: 1 },
  { id: 'f3', x: 22, y: 12, px: 22*TILE+16, py: 12*TILE+16, collected: false, t: 2 },
  { id: 'f4', x: 36, y: 16, px: 36*TILE+16, py: 16*TILE+16, collected: false, t: 3 },
  { id: 'f5', x: 42, y: 19, px: 42*TILE+16, py: 19*TILE+16, collected: false, t: 4 },
  { id: 'f6', x: 14, y: 25, px: 14*TILE+16, py: 25*TILE+16, collected: false, t: 5 },
  { id: 'f7', x: 30, y: 25, px: 30*TILE+16, py: 25*TILE+16, collected: false, t: 6 },
  { id: 'f8', x: 46, y: 22, px: 46*TILE+16, py: 22*TILE+16, collected: false, t: 7 },
  { id: 'f9', x: 38, y: 25, px: 38*TILE+16, py: 25*TILE+16, collected: false, t: 8 }
];

// ===== Bug system =====
const BUG_CAGE = { x: 50, y: 26 };
const bugs = [];
let bugSpawnTimer = 0;
let bugCaughtCount = 0;

function spawnBug() {
  bugs.push({
    id: 'bug-' + Date.now(),
    px: (10 + Math.random() * 30) * TILE,
    py: (15 + Math.random() * 10) * TILE,
    targetTx: 16, targetTy: 20,
    targetTimer: 0,
    caught: false, cageIdx: null
  });
}
spawnBug();

// ===== Particles =====
const particles = [];
function emitParticles(px, py, opts = {}) {
  const { count = 14, colors = ['#c97e8a', '#fff', '#a01030'], speed = 120, life = 0.6 } = opts;
  for (let i = 0; i < count; i++) {
    const ang = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const sp = speed * (0.4 + Math.random() * 0.6);
    particles.push({
      x: px, y: py,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp - 30,
      life: life * (0.6 + Math.random() * 0.6),
      maxLife: life,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 2 + Math.random() * 2
    });
  }
}

// ===== Achievement popups =====
const achievementsShown = new Set();
let activeAchievement = null;

function showAchievement(id, title, desc) {
  if (achievementsShown.has(id)) return;
  achievementsShown.add(id);
  activeAchievement = { title, desc, t: 4 };
  const el = document.getElementById('achievement-toast');
  el.querySelector('.title').textContent = title;
  el.querySelector('.desc').textContent = desc;
  el.classList.add('show');
  clearTimeout(window._achTO);
  window._achTO = setTimeout(() => el.classList.remove('show'), 4000);
  if (window.GameAudio) window.GameAudio.questUpdate();
}

// ===== Signpost & Portal =====
const SIGNPOST = { x: 28, y: 18 };
const PORTAL = { x: 4, y: 33 };

// ===== STATE =====
const game = {
  state: 'title',
  player: { x: 28 * TILE, y: 22 * TILE, dir: 'down', moving: false, frame: 0, animTime: 0 },
  camera: { x: 0, y: 0 },
  keys: new Set(),
  dialog: null,
  near: null,
  metNpcs: new Set(),
  factsCollected: 0,
  portalTime: 0,
  joystick: { active: false, dx: 0, dy: 0 },
  questLogAttention: true,  // pulse for first 5s
  steps: 0,
  startTime: 0,
  lastActiveQuestId: null,
  hintShown: new Set(),
  hintTime: 0,
  quests: [
    { id: 'q1', done: false },
    { id: 'q2', done: false, count: 0, target: 3 },
    { id: 'q3', done: false },
    { id: 'q4', done: false },
    { id: 'q6', done: false, count: 0, target: 3 }
  ]
};

// ===== Canvas =====
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
canvas.width = VIEW_W;
canvas.height = VIEW_H;

function fitCanvas() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isMobile = w < 700;
  const isPortrait = h > w;

  // Adjust internal canvas resolution per device orientation so the game
  // feels equally large on phones, tablets, and desktops.
  if (isMobile && isPortrait) {
    VIEW_W = 14 * TILE; // 448px — narrower, more square
    VIEW_H = 18 * TILE; // 576px — taller for portrait
  } else if (isMobile) {
    VIEW_W = 22 * TILE; // 704px — wide landscape
    VIEW_H = 12 * TILE; // 384px — shorter for landscape phone
  } else {
    VIEW_W = 22 * TILE; // desktop default
    VIEW_H = 14 * TILE;
  }
  canvas.width = VIEW_W;
  canvas.height = VIEW_H;
  ctx.imageSmoothingEnabled = false;

  let s;
  if (isMobile && isPortrait) {
    // Fit by width, canvas fills screen horizontally
    s = w / VIEW_W;
    const maxByHeight = (h * 0.92) / VIEW_H;
    s = Math.min(s, maxByHeight);
  } else if (isMobile) {
    const sx = w / VIEW_W;
    const sy = h / VIEW_H;
    s = Math.min(sx, sy);
  } else {
    const sx = (w - 24) / VIEW_W;
    const sy = (h - 24) / VIEW_H;
    s = Math.min(sx, sy, 2);
  }

  canvas.style.width = (VIEW_W * s) + 'px';
  canvas.style.height = (VIEW_H * s) + 'px';
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

// ===== Tile drawing — paper map style =====
function drawTile(x, y) {
  const t = MAP[y][x];
  const px = x * TILE - game.camera.x;
  const py = y * TILE - game.camera.y;
  if (px < -TILE || py < -TILE || px > VIEW_W || py > VIEW_H) return;
  if (buildingMask[`${x},${y}`]) return;

  // ===== Ground base — muted moss (darker, low contrast) =====
  const baseLight = '#6e7a52';
  const baseDark = '#6a7650';
  ctx.fillStyle = (x + y) % 2 ? baseLight : baseDark;
  ctx.fillRect(px, py, TILE, TILE);
  // subtle paper noise (deterministic)
  if (((x * 31 + y * 17) % 7) === 0) {
    ctx.fillStyle = 'rgba(40, 50, 30, 0.08)';
    ctx.fillRect(px + ((x * 7) % 24), py + ((y * 5) % 24), 2, 2);
  }

  if (t === T.PATH) {
    // muted tan path — close to ground, not high contrast
    ctx.fillStyle = '#8a8260';
    ctx.fillRect(px, py, TILE, TILE);
  } else if (t === T.COBBLE) {
    // central plaza — warm beige stone
    ctx.fillStyle = '#e8d6b2';
    ctx.fillRect(px, py, TILE, TILE);
    ctx.strokeStyle = 'rgba(150, 110, 60, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, py + 16); ctx.lineTo(px + TILE, py + 16);
    ctx.moveTo(px + 16, py); ctx.lineTo(px + 16, py + TILE);
    ctx.stroke();
  } else if (t === T.SAND) {
    ctx.fillStyle = '#e8d8a8';
    ctx.fillRect(px, py, TILE, TILE);
  } else if (t === T.WATER) {
    // soft blue lake
    const shimmer = Math.sin(Date.now() / 800 + x * 0.5 + y * 0.5) * 0.5 + 0.5;
    ctx.fillStyle = '#a8c8de';
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = `rgba(255,255,255,${0.15 + shimmer * 0.15})`;
    ctx.fillRect(px + 6, py + 10, 8, 1);
    ctx.fillRect(px + 18, py + 20, 8, 1);
    ctx.fillStyle = 'rgba(120, 160, 190, 0.4)';
    ctx.fillRect(px, py, TILE, 2);
  } else if (t === T.BRIDGE) {
    // light wooden bridge
    ctx.fillStyle = '#d8b888';
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = '#a88858';
    for (let i = 0; i < 4; i++) ctx.fillRect(px, py + 6 + i * 7, TILE, 1);
    ctx.fillStyle = '#8a6840';
    ctx.fillRect(px, py, 2, TILE);
    ctx.fillRect(px + TILE - 2, py, 2, TILE);
  } else if (t === T.TREE) {
    // ROUND illustrated tree — single circle with highlight
    // shadow
    ctx.fillStyle = 'rgba(60, 40, 20, 0.18)';
    ctx.beginPath();
    ctx.ellipse(px + 16, py + 26, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // canopy
    ctx.fillStyle = '#7fa860';
    ctx.beginPath();
    ctx.arc(px + 16, py + 14, 11, 0, Math.PI * 2);
    ctx.fill();
    // darker bottom
    ctx.fillStyle = '#6a9050';
    ctx.beginPath();
    ctx.arc(px + 16, py + 18, 9, 0, Math.PI * 2);
    ctx.fill();
    // highlight
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(px + 12, py + 11, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (t === T.BUSH) {
    ctx.fillStyle = '#7fa860';
    ctx.beginPath();
    ctx.arc(px + 16, py + 18, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (t === T.FLOWER) {
    ctx.fillStyle = '#d94c3d';
    ctx.beginPath();
    ctx.arc(px + 16, py + 18, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (t === T.FLOWERBED) {
    ctx.fillStyle = 'rgba(180, 140, 80, 0.18)';
    ctx.fillRect(px + 4, py + 14, TILE - 8, 14);
    const colors = ['#d94c3d', '#c9962a', '#a378c4', '#6a8e4a'];
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = colors[(x + y + i) % colors.length];
      ctx.beginPath();
      ctx.arc(px + 8 + i * 8, py + 19 + (i % 2) * 4, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (t === T.LANTERN) {
    // red palace lantern
    const flick = Math.sin(Date.now() / 400 + x) * 0.15 + 0.85;
    ctx.fillStyle = `rgba(217, 76, 61, ${flick * 0.25})`;
    ctx.beginPath();
    ctx.arc(px + 16, py + 12, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a1f18';
    ctx.fillRect(px + 14, py + 14, 4, 16);
    ctx.fillStyle = '#d94c3d';
    ctx.fillRect(px + 11, py + 6, 10, 8);
    ctx.fillStyle = '#c9962a';
    ctx.fillRect(px + 10, py + 5, 12, 2);
    ctx.fillRect(px + 10, py + 13, 12, 2);
  }
}

// ===== Building — isometric palace style =====
function drawBuilding(b) {
  const px = b.x * TILE - game.camera.x;
  const py = b.y * TILE - game.camera.y;
  const w = b.w * TILE;
  const h = b.h * TILE;
  if (px + w < 0 || py + h < 0 || px > VIEW_W || py > VIEW_H) return;

  // ===== soft shadow =====
  ctx.fillStyle = 'rgba(60, 40, 20, 0.22)';
  ctx.beginPath();
  ctx.ellipse(px + w/2, py + h + 4, w/2 + 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // ===== cream walls (white-ish) =====
  ctx.fillStyle = '#f4e8cc';
  ctx.fillRect(px, py + 12, w, h - 12);
  // wall shadow on bottom
  ctx.fillStyle = '#d8c39c';
  ctx.fillRect(px, py + h - 6, w, 6);
  // side shadow
  ctx.fillStyle = 'rgba(120, 90, 50, 0.12)';
  ctx.fillRect(px, py + 12, 4, h - 12);

  // ===== columns / windows =====
  const cols = b.w;
  for (let i = 0; i < cols; i++) {
    if (i === Math.floor(cols / 2)) continue;
    const cx = px + i * TILE + (TILE - 8) / 2;
    // window
    ctx.fillStyle = '#4a5560';
    ctx.fillRect(cx, py + 20, 8, 12);
    // window frame
    ctx.strokeStyle = '#8a6840';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 0.5, py + 20, 8, 12);
  }

  // ===== door =====
  const doorX = px + Math.floor(b.w / 2) * TILE + (TILE - 12) / 2;
  const doorY = py + h - 22;
  ctx.fillStyle = '#5a3018';
  ctx.fillRect(doorX, doorY, 12, 16);
  ctx.fillStyle = '#8a4830';
  ctx.fillRect(doorX, doorY, 12, 2);

  // ===== RED palace roof (signature look) =====
  // base roof color comes from building accent if it's vibrant, else default red
  const useColor = b.color || '#d94c3d';
  // roof main slab (extends beyond walls)
  ctx.fillStyle = useColor;
  ctx.beginPath();
  ctx.moveTo(px - 6, py + 12);
  ctx.lineTo(px + w + 6, py + 12);
  ctx.lineTo(px + w + 2, py + 4);
  ctx.lineTo(px - 2, py + 4);
  ctx.closePath();
  ctx.fill();
  // roof top
  ctx.fillStyle = '#a83a2e';
  ctx.fillRect(px - 2, py, px + w + 2 - (px - 2), 6);
  ctx.fillStyle = useColor;
  ctx.fillRect(px, py, w, 4);
  // roof tile lines
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(px - 4 + i * (w + 8) / 4, py + 4, 1, 8);
  }
  // roof ridge (top line)
  ctx.fillStyle = '#7a2818';
  ctx.fillRect(px - 4, py - 2, w + 8, 3);
  // roof curls (corners) — traditional palace upturned edges
  ctx.fillStyle = useColor;
  ctx.beginPath();
  ctx.arc(px - 6, py + 12, 4, Math.PI, Math.PI * 1.5);
  ctx.lineTo(px - 6, py + 8);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(px + w + 6, py + 12, 4, Math.PI * 1.5, 0);
  ctx.lineTo(px + w + 6, py + 8);
  ctx.closePath();
  ctx.fill();

  // ===== logo letter centered on roof =====
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(b.logo, px + w / 2, py + 8);
  ctx.textAlign = 'left';

  // ===== Name label — small paper plate below building =====
  ctx.fillStyle = 'rgba(255, 250, 235, 0.95)';
  const labelW = b.name.length * 5.5 + 14;
  const labelX = px + w / 2 - labelW / 2;
  const labelY = py + h + 10;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(labelX, labelY, labelW, 14, 4) : ctx.rect(labelX, labelY, labelW, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(60, 40, 20, 0.18)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#2a2419';
  ctx.font = 'bold 8px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(b.name.toUpperCase(), px + w / 2, labelY + 7);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // ===== Numbered pin floating above building =====
  if (b.pin) {
    const pinX = px + w / 2;
    const pinY = py - 18;
    const t = Date.now() / 600;
    const float = Math.sin(t + b.x) * 1.5;
    const pulse = (Math.sin(t * 1.5 + b.x) + 1) / 2;

    // halo
    if (!game.metNpcs.has(NPCS[b.pin - 1]?.id)) {
      ctx.fillStyle = `rgba(217, 76, 61, ${0.15 + pulse * 0.15})`;
      ctx.beginPath();
      ctx.arc(pinX, pinY + float, 14 + pulse * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // pin shadow
    ctx.fillStyle = 'rgba(60, 40, 20, 0.3)';
    ctx.beginPath();
    ctx.ellipse(pinX, py - 2, 6, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // pin teardrop body
    ctx.fillStyle = '#d94c3d';
    ctx.beginPath();
    ctx.moveTo(pinX, py - 4);
    ctx.lineTo(pinX - 7, pinY + float + 3);
    ctx.arc(pinX, pinY + float, 9, Math.PI * 0.75, Math.PI * 0.25, false);
    ctx.lineTo(pinX, py - 4);
    ctx.closePath();
    ctx.fill();

    // pin white inner circle
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(pinX, pinY + float, 6, 0, Math.PI * 2);
    ctx.fill();

    // number
    ctx.fillStyle = '#d94c3d';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.pin, pinX, pinY + float + 1);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
}

// ===== Signpost =====
function drawSignpost() {
  const px = SIGNPOST.x * TILE - game.camera.x + 4;
  const py = SIGNPOST.y * TILE - game.camera.y;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(px + 6, py + 26, 14, 4);
  ctx.fillStyle = '#5a3d22';
  ctx.fillRect(px + 11, py + 14, 4, 14);
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(px + 2, py + 4, 22, 14);
  ctx.fillStyle = '#9a7240';
  ctx.fillRect(px + 3, py + 5, 20, 2);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(px + 6, py + 9, 14, 1);
  ctx.fillRect(px + 6, py + 12, 12, 1);
  ctx.fillRect(px + 6, py + 15, 10, 1);
  if (Math.floor(Date.now() / 600) % 2) {
    ctx.fillStyle = '#c5e1a5';
    ctx.beginPath();
    ctx.arc(px + 13, py - 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===== Portal =====
function drawPortal() {
  const px = PORTAL.x * TILE - game.camera.x + 16;
  const py = PORTAL.y * TILE - game.camera.y + 16;
  game.portalTime += 0.04;
  for (let i = 0; i < 3; i++) {
    const r = 20 + i * 4 + Math.sin(game.portalTime + i) * 2;
    ctx.strokeStyle = `rgba(197, 225, 165, ${0.3 - i * 0.08})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  const grad = ctx.createRadialGradient(px, py, 3, px, py, 16);
  grad.addColorStop(0, '#fff');
  grad.addColorStop(0.4, '#c5e1a5');
  grad.addColorStop(1, 'rgba(15, 22, 38, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(px, py, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(197, 225, 165, 0.7)';
  ctx.font = 'bold 9px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('◀ MENU', px, py + 26);
  ctx.textAlign = 'left';
}

// ===== Bug cage =====
function drawCage() {
  const px = BUG_CAGE.x * TILE - game.camera.x;
  const py = BUG_CAGE.y * TILE - game.camera.y;
  ctx.fillStyle = '#1f1f1f';
  ctx.fillRect(px + 2, py + 6, 28, 22);
  ctx.fillStyle = '#5a5a5a';
  for (let i = 0; i < 5; i++) ctx.fillRect(px + 4 + i * 6, py + 9, 1, 18);
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(px, py + 4, 32, 4);
  ctx.fillStyle = '#c5e1a5';
  ctx.font = 'bold 9px JetBrains Mono';
  ctx.textAlign = 'center';
  ctx.fillText(`${bugCaughtCount}`, px + 16, py + 22);
  ctx.textAlign = 'left';
  for (let i = 0; i < Math.min(bugCaughtCount, 3); i++) {
    const cx = px + 8 + i * 8;
    const cy = py + 16;
    ctx.fillStyle = '#8a3a4d';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===== Fact orb — bigger, brighter, chases player =====
function drawOrb(o) {
  if (o.collected) return;
  const sx = o.px - game.camera.x;
  const sy = o.py - game.camera.y;
  const t = Date.now() / 400;
  const pulse = Math.sin(t + o.t) * 0.5 + 0.5;
  const float = Math.sin(t * 1.5 + o.t) * 3;

  // Outer ripple
  for (let i = 0; i < 2; i++) {
    const r = 18 + i * 6 + pulse * 4;
    ctx.strokeStyle = `rgba(255, 235, 130, ${0.25 - i * 0.1})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sx, sy + float, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Big glow
  const grad = ctx.createRadialGradient(sx, sy + float, 2, sx, sy + float, 22);
  grad.addColorStop(0, '#fffbcc');
  grad.addColorStop(0.3, 'rgba(255, 220, 100, 0.9)');
  grad.addColorStop(0.6, 'rgba(255, 200, 80, 0.4)');
  grad.addColorStop(1, 'rgba(255, 200, 80, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(sx, sy + float, 22, 0, Math.PI * 2);
  ctx.fill();

  // Bright core
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(sx, sy + float, 4 + pulse * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // sparkle "+" 
  const sparkLen = 8 + pulse * 4;
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 + pulse * 0.4})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sx - sparkLen, sy + float); ctx.lineTo(sx + sparkLen, sy + float);
  ctx.moveTo(sx, sy + float - sparkLen); ctx.lineTo(sx, sy + float + sparkLen);
  ctx.stroke();
}

// ===== Character =====
function drawCharacter(px, py, opts) {
  const { shirt = '#c5e1a5', shirt2 = '#a3c97e', dir = 'down', frame = 0, isBug = false, color = '#c97e8a', dim = false } = opts;
  const sx = Math.round(px - game.camera.x);
  const sy = Math.round(py - game.camera.y);
  const bob = frame === 1 ? -1 : 0;
  const alpha = dim ? 0.5 : 1;
  ctx.globalAlpha = alpha;

  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(sx + 10, sy + 26, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isBug) {
    const tt = Date.now() / 300;
    const bb = dim ? 0 : Math.sin(tt) * 1;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(sx + 10, sy + 14 + bb, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a01030';
    ctx.fillRect(sx + 4, sy + 12 + bb, 12, 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(sx + 1, sy + 12 + bb, 2, 2);
    ctx.fillRect(sx + 17, sy + 12 + bb, 2, 2);
    ctx.fillRect(sx + 1, sy + 16 + bb, 2, 2);
    ctx.fillRect(sx + 17, sy + 16 + bb, 2, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(sx + 7, sy + 11 + bb, 2, 2);
    ctx.fillRect(sx + 11, sy + 11 + bb, 2, 2);
    ctx.fillStyle = '#000';
    ctx.fillRect(sx + 8, sy + 12 + bb, 1, 1);
    ctx.fillRect(sx + 12, sy + 12 + bb, 1, 1);
    ctx.globalAlpha = 1;
    return;
  }

  ctx.fillStyle = '#1a3050';
  if (frame === 0) { ctx.fillRect(sx + 5, sy + 18, 4, 7); ctx.fillRect(sx + 11, sy + 18, 4, 7); }
  else { ctx.fillRect(sx + 4, sy + 18, 4, 7); ctx.fillRect(sx + 12, sy + 18, 4, 7); }
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(sx + 4, sy + 24, 5, 2);
  ctx.fillRect(sx + 11, sy + 24, 5, 2);

  ctx.fillStyle = shirt;
  ctx.fillRect(sx + 4, sy + 11 + bob, 12, 8);
  ctx.fillStyle = shirt2;
  ctx.fillRect(sx + 4, sy + 17 + bob, 12, 2);

  ctx.fillStyle = '#f0c89c';
  ctx.fillRect(sx + 2, sy + 12 + bob, 3, 6);
  ctx.fillRect(sx + 15, sy + 12 + bob, 3, 6);
  ctx.fillRect(sx + 5, sy + 3 + bob, 10, 9);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(sx + 5, sy + 3 + bob, 10, 3);
  ctx.fillRect(sx + 4, sy + 4 + bob, 1, 3);
  ctx.fillRect(sx + 15, sy + 4 + bob, 1, 3);

  ctx.fillStyle = '#1a1a1a';
  if (dir === 'up') ctx.fillRect(sx + 5, sy + 6 + bob, 10, 3);
  else if (dir === 'left') ctx.fillRect(sx + 6, sy + 8 + bob, 2, 2);
  else if (dir === 'right') ctx.fillRect(sx + 12, sy + 8 + bob, 2, 2);
  else { ctx.fillRect(sx + 7, sy + 8 + bob, 2, 2); ctx.fillRect(sx + 11, sy + 8 + bob, 2, 2); }
  ctx.globalAlpha = 1;
}

function drawPlayer() {
  drawCharacter(game.player.x, game.player.y, {
    dir: game.player.dir,
    frame: game.player.moving ? Math.floor(game.player.frame) % 2 : 0
  });
}

function drawNpc(n) {
  const px = n.x * TILE + 4;
  const py = n.y * TILE + 4;
  drawCharacter(px, py, { shirt: n.color, shirt2: n.color, frame: 0 });
  if (!game.metNpcs.has(n.id)) {
    const flash = (Math.floor(Date.now() / 400) % 2) === 0;
    if (flash) {
      const sx = Math.round(px - game.camera.x);
      const sy = Math.round(py - game.camera.y);
      ctx.fillStyle = '#e6cc92';
      ctx.fillRect(sx + 9, sy - 10, 2, 6);
      ctx.fillRect(sx + 9, sy - 2, 2, 2);
    }
  }
}

function drawBugs() {
  bugs.forEach(b => {
    if (b.caught) {
      const cx = BUG_CAGE.x * TILE + 4 + (b.cageIdx % 3) * 8;
      const cy = BUG_CAGE.y * TILE + 8;
      drawCharacter(cx, cy, { isBug: true, color: '#8a3a4d', dim: true });
    } else {
      drawCharacter(b.px, b.py, { isBug: true, color: '#c97e8a' });
      if (!game.metNpcs.has('bug')) {
        const sx = Math.round(b.px - game.camera.x);
        const sy = Math.round(b.py - game.camera.y);
        if (Math.floor(Date.now() / 500) % 2) {
          ctx.fillStyle = '#c97e8a';
          ctx.font = 'bold 10px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillText('?', sx + 10, sy - 4);
          ctx.textAlign = 'left';
        }
      }
    }
  });
}

function drawParticles() {
  particles.forEach(p => {
    const sx = p.x - game.camera.x;
    const sy = p.y - game.camera.y;
    const a = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(sx, sy, p.size * a, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

// ===== Collision =====
function isSolid(px, py) {
  const corners = [[px + 3, py + 14], [px + 17, py + 14], [px + 3, py + 25], [px + 17, py + 25]];
  for (const [cx, cy] of corners) {
    const tx = Math.floor(cx / TILE);
    const ty = Math.floor(cy / TILE);
    if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return true;
    if (SOLID_TILES.has(MAP[ty][tx])) return true;
    if (buildingMask[`${tx},${ty}`]) return true;
  }
  for (const n of NPCS) {
    const dx = (n.x * TILE + 14) - (px + 10);
    const dy = (n.y * TILE + 18) - (py + 19);
    if (Math.abs(dx) < 14 && Math.abs(dy) < 12) return true;
  }
  const sx = SIGNPOST.x * TILE + 12;
  const sy = SIGNPOST.y * TILE + 14;
  if (Math.abs(sx - (px + 10)) < 14 && Math.abs(sy - (py + 19)) < 14) return true;
  const cx = BUG_CAGE.x * TILE + 16;
  const cy = BUG_CAGE.y * TILE + 16;
  if (Math.abs(cx - (px + 10)) < 18 && Math.abs(cy - (py + 19)) < 14) return true;
  return false;
}

// ===== Update =====
let bugTargetTimer = 0;
function update(dt) {
  if (game.state !== 'playing') return;

  // Auto-clear stuck movement keys (safety net for phantom keydown events
  // from OS gestures / accessibility features that fire arrow keys).
  const now = Date.now();
  for (const k of MOVE_KEYS) {
    if (game.keys.has(k)) {
      const t = keyTime.get(k) || 0;
      if (now - t > 800) { game.keys.delete(k); keyTime.delete(k); }
    }
  }

  let dx = 0, dy = 0;
  // Arrow keys + WASD. Auto-clear above mitigates phantom arrow events
  // from OS gestures (Chrome on Mac trackpad sometimes fires ArrowRight on click).
  if (game.keys.has('arrowup') || game.keys.has('w')) dy -= 1;
  if (game.keys.has('arrowdown') || game.keys.has('s')) dy += 1;
  if (game.keys.has('arrowleft') || game.keys.has('a')) dx -= 1;
  if (game.keys.has('arrowright') || game.keys.has('d')) dx += 1;
  if (game.joystick.active) { dx = game.joystick.dx; dy = game.joystick.dy; }

  if (dx || dy) {
    if (Math.abs(dx) > Math.abs(dy)) game.player.dir = dx < 0 ? 'left' : 'right';
    else game.player.dir = dy < 0 ? 'up' : 'down';
  }
  if (dx && dy && !game.joystick.active) { dx *= 0.707; dy *= 0.707; }

  const moving = Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05;
  game.player.moving = moving;

  const speed = 110;
  if (moving) {
    const nx = game.player.x + dx * speed * dt;
    const ny = game.player.y + dy * speed * dt;
    if (!isSolid(nx, game.player.y)) game.player.x = nx;
    if (!isSolid(game.player.x, ny)) game.player.y = ny;
    game.player.animTime += dt;
    if (game.player.animTime > 0.18) {
      game.player.animTime = 0;
      game.player.frame = (game.player.frame + 1) % 2;
      game.steps++;
      if (window.GameAudio) window.GameAudio.footstep();
    }
  } else game.player.frame = 0;

  // camera
  const cx = game.player.x + 10 - VIEW_W / 2;
  const cy = game.player.y + 12 - VIEW_H / 2;
  game.camera.x = Math.max(0, Math.min(MAP_W * TILE - VIEW_W, cx));
  game.camera.y = Math.max(0, Math.min(MAP_H * TILE - VIEW_H, cy));

  // Bugs wander
  bugTargetTimer -= dt;
  bugs.forEach(b => {
    if (b.caught) return;
    if (bugTargetTimer <= 0) {
      if (Math.random() < 0.25) {
        b.targetTx = Math.floor(game.player.x / TILE);
        b.targetTy = Math.floor(game.player.y / TILE);
      } else {
        b.targetTx = 6 + Math.floor(Math.random() * (MAP_W - 12));
        b.targetTy = 14 + Math.floor(Math.random() * 14);
      }
    }
    const tpx = b.targetTx * TILE;
    const tpy = b.targetTy * TILE;
    const bdx = tpx - b.px;
    const bdy = tpy - b.py;
    const bd = Math.hypot(bdx, bdy);
    if (bd > 4) {
      const sp = 55;
      b.px += (bdx / bd) * sp * dt;
      b.py += (bdy / bd) * sp * dt;
    }
  });
  if (bugTargetTimer <= 0) bugTargetTimer = 1.5 + Math.random() * 2.5;

  bugSpawnTimer -= dt;
  const activeBugs = bugs.filter(b => !b.caught).length;
  if (activeBugs === 0 && bugSpawnTimer <= 0) {
    bugSpawnTimer = 12 + Math.random() * 8;
    spawnBug();
  }

  // Fact orbs — chase player when nearby + auto-collect
  for (const o of FACT_ORBS) {
    if (o.collected) continue;
    const playerX = game.player.x + 10;
    const playerY = game.player.y + 12;
    const ddx = playerX - o.px;
    const ddy = playerY - o.py;
    const d = Math.hypot(ddx, ddy);

    // Chase when in range
    const chaseRange = 110;
    if (d < chaseRange && d > 2) {
      const chasePower = (1 - d / chaseRange);
      const chaseSpeed = 60 * chasePower;
      o.px += (ddx / d) * chaseSpeed * dt;
      o.py += (ddy / d) * chaseSpeed * dt;
    }

    // Collect
    if (d < 22) {
      o.collected = true;
      game.factsCollected++;
      const q6 = game.quests.find(q => q.id === 'q6');
      if (q6 && !q6.done) {
        q6.count = Math.min(q6.target, q6.count + 1);
        if (q6.count >= q6.target) q6.done = true;
      }
      // sparkle particles on collect
      emitParticles(o.px, o.py, { count: 12, colors: ['#fff', '#ffeb82', '#c5e1a5'], speed: 80, life: 0.5 });
      showFactToast(o.id);
      if (window.GameAudio) window.GameAudio.factPing();
    }
  }

  // Particles update
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 240 * dt; // gravity
    p.vx *= 0.96;
  }

  // Quest log attention timer
  if (game.questLogAttention) {
    if ((Date.now() - game.startTime) > 5000) {
      game.questLogAttention = false;
      const ql = document.querySelector('.quest-log');
      if (ql && !ql.classList.contains('user-toggled')) {
        ql.classList.add('minimized');
        ql.classList.remove('attention');
      }
    }
  }

  // Active quest change → show hint
  const active = getActiveQuest();
  if (active && active.id !== game.lastActiveQuestId) {
    game.lastActiveQuestId = active.id;
    // delay slightly so it doesn't pile on dialog close etc
    setTimeout(() => {
      if (game.state === 'playing' && getActiveQuest()?.id === active.id) showHintBanner(active.id);
    }, 600);
  }

  // Check all quests done
  if (game.quests.every(q => q.done)) {
    showAchievement('all-done',
      window.QuestI18n.current === 'id' ? 'Misi Lengkap!' : 'All Quests Complete!',
      window.QuestI18n.current === 'id' ? 'Kamu sudah mengenal Affan dengan baik.' : 'You know Affan really well now.'
    );
  }

  // Find near
  game.near = null;
  let bd2 = 999;
  for (const n of NPCS) {
    const d = Math.hypot(n.x * TILE - game.player.x, n.y * TILE - game.player.y);
    if (d < 44 && d < bd2) { bd2 = d; game.near = { type: 'npc', target: n, label: I('dialog.talk') }; }
  }
  for (const b of bugs) {
    if (b.caught) continue;
    const d = Math.hypot(b.px - game.player.x, b.py - game.player.y);
    if (d < 38 && d < bd2) { bd2 = d; game.near = { type: 'bug', target: b, label: I('dialog.catch') }; }
  }
  const sd = Math.hypot(SIGNPOST.x * TILE - game.player.x, SIGNPOST.y * TILE - game.player.y);
  if (sd < 40 && sd < bd2) { bd2 = sd; game.near = { type: 'sign', label: I('dialog.read') }; }
  const pd = Math.hypot((PORTAL.x * TILE + 16) - (game.player.x + 10), (PORTAL.y * TILE + 16) - (game.player.y + 12));
  if (pd < 32 && pd < bd2) { bd2 = pd; game.near = { type: 'portal', label: I('dialog.enter') }; }
}

function I(key) { return window.QuestI18n.t(key); }

// ===== Sequential quest helpers =====
function getActiveQuest() { return game.quests.find(q => !q.done); }
function canProgress(questId) {
  const idx = game.quests.findIndex(q => q.id === questId);
  for (let i = 0; i < idx; i++) if (!game.quests[i].done) return false;
  return true;
}
function getQuestTarget(quest) {
  if (!quest) return null;
  switch (quest.id) {
    case 'q1': {
      const n = NPCS.find(n => n.id === 'stockbit-lead');
      return { x: n.x * TILE + 14, y: n.y * TILE + 14 };
    }
    case 'q2': {
      const visited = ['stockbit-lead'];
      const candidates = NPCS.filter(n => !visited.includes(n.id) && !game.metNpcs.has(n.id));
      if (!candidates.length) return null;
      let best, bd = Infinity;
      for (const n of candidates) {
        const d = Math.hypot(n.x * TILE - game.player.x, n.y * TILE - game.player.y);
        if (d < bd) { bd = d; best = n; }
      }
      return { x: best.x * TILE + 14, y: best.y * TILE + 14 };
    }
    case 'q3': {
      const b = bugs.find(b => !b.caught);
      if (!b) return null;
      return { x: b.px + 10, y: b.py + 14 };
    }
    case 'q4': return { x: SIGNPOST.x * TILE + 14, y: SIGNPOST.y * TILE + 14 };
    case 'q5': return { x: PORTAL.x * TILE + 16, y: PORTAL.y * TILE + 16 };
    case 'q6': {
      const o = FACT_ORBS.find(o => !o.collected);
      if (!o) return null;
      return { x: o.px, y: o.py };
    }
  }
  return null;
}

function showHintBanner(questId) {
  const data = window.QuestI18n.t(`hints.${questId}`);
  if (!data || data === `hints.${questId}`) return;
  const el = document.getElementById('hint-banner');
  el.querySelector('#hint-label').textContent = window.QuestI18n.t('hints.label') || 'HINT';
  el.querySelector('#hint-text').innerHTML = data;
  // On mobile, alternate with quest-log so they don't overlap
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  if (isMobile) {
    const ql = document.querySelector('.quest-log');
    if (ql && !ql.classList.contains('minimized')) {
      ql.classList.add('minimized');
      ql.classList.remove('attention');
    }
  }
  el.classList.add('show');
  clearTimeout(window._hintTO);
  window._hintTO = setTimeout(() => el.classList.remove('show'), 5000);
}

function showFactToast(id) {
  const data = window.QuestI18n.t(`facts.${id}`);
  const el = document.getElementById('fact-toast');
  el.querySelector('.label').textContent = data.label;
  el.querySelector('.text').innerHTML = data.text;
  el.classList.add('show');
  clearTimeout(window._factTO);
  window._factTO = setTimeout(() => el.classList.remove('show'), 3500);
}

// ===== Render =====
function render() {
  ctx.fillStyle = '#6a7650';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++) drawTile(x, y);

  drawSignpost();
  drawPortal();
  drawCage();
  FACT_ORBS.forEach(drawOrb);

  const sortedB = [...BUILDINGS].sort((a, b) => a.y - b.y);
  sortedB.forEach(drawBuilding);

  const ents = [
    { y: game.player.y, draw: drawPlayer },
    ...bugs.map(b => ({ y: b.caught ? -1 : b.py, draw: drawBugs })),
    ...NPCS.map(n => ({ y: n.y * TILE, draw: () => drawNpc(n) }))
  ];
  const seenBugs = entsHelper(ents);
  seenBugs.sort((a, b) => a.y - b.y).forEach(e => e.draw());

  drawParticles();

  // ===== Edge arrow pointing to active quest target =====
  const activeQ = getActiveQuest();
  const target = getQuestTarget(activeQ);
  if (target) {
    const sx = target.x - game.camera.x;
    const sy = target.y - game.camera.y;
    const onScreen = sx >= 0 && sx <= VIEW_W && sy >= 0 && sy <= VIEW_H;
    if (!onScreen) {
      // clamp to screen edge with margin
      const margin = 28;
      const cx = VIEW_W / 2;
      const cy = VIEW_H / 2;
      const dx = sx - cx;
      const dy = sy - cy;
      const ang = Math.atan2(dy, dx);
      const maxX = VIEW_W / 2 - margin;
      const maxY = VIEW_H / 2 - margin;
      const t = Math.min(maxX / Math.abs(dx || 0.001), maxY / Math.abs(dy || 0.001));
      const ax = cx + dx * t;
      const ay = cy + dy * t;
      const pulse = (Math.sin(Date.now() / 400) + 1) / 2;
      ctx.save();
      ctx.globalAlpha = 0.55 + pulse * 0.3;
      ctx.translate(ax, ay);
      ctx.rotate(ang);
      // small red triangle arrow
      ctx.fillStyle = '#d94c3d';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-6, -7);
      ctx.lineTo(-6, 7);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  }

  // soft paper warmth overlay (very subtle)
  const grad = ctx.createRadialGradient(VIEW_W/2, VIEW_H/2, VIEW_H * 0.3, VIEW_W/2, VIEW_H/2, VIEW_H);
  grad.addColorStop(0, 'rgba(255, 240, 200, 0)');
  grad.addColorStop(1, 'rgba(120, 80, 40, 0.08)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function entsHelper(ents) {
  const out = [];
  let bugsAdded = false;
  for (const e of ents) {
    if (e.draw === drawBugs) { if (!bugsAdded) { out.push(e); bugsAdded = true; } }
    else out.push(e);
  }
  return out;
}

// ===== Interactions =====
function interact() {
  if (!game.near) return;
  const t = game.near;
  if (t.type === 'npc') startDialog(t.target.id);
  else if (t.type === 'bug') {
    t.target.caught = true;
    t.target.cageIdx = bugCaughtCount;
    bugCaughtCount++;
    bugSpawnTimer = 8 + Math.random() * 6;
    // 💥 explosion!
    emitParticles(t.target.px + 10, t.target.py + 14, {
      count: 22, colors: ['#c97e8a', '#fff', '#a01030', '#ffaa44'], speed: 180, life: 0.8
    });
    if (window.GameAudio) window.GameAudio.catchBug();
    if (!game.metNpcs.has('bug')) startDialog('bug');
    const q3 = game.quests.find(q => q.id === 'q3');
    if (q3 && !q3.done) { q3.done = true; if (window.GameAudio) window.GameAudio.questUpdate(); }
  } else if (t.type === 'sign') openInfoModal();
  else if (t.type === 'portal') returnToTitle();
}

function startDialog(npcId) {
  const data = window.QuestI18n.t(`npcs.${npcId}`);
  game.state = 'dialog';
  const npcMeta = NPCS.find(n => n.id === npcId);
  game.dialog = {
    npcId,
    name: data.name,
    role: data.role,
    color: npcMeta?.color || '#c97e8a',
    avatar: npcMeta?.avatar || '?',
    lines: data.d,
    idx: 0, charIdx: 0, lastChar: 0, complete: false
  };
  if (!game.metNpcs.has(npcId)) {
    game.metNpcs.add(npcId);
    // q1: stockbit-lead
    if (npcId === 'stockbit-lead') { const q1 = game.quests.find(q => q.id === 'q1'); if (!q1.done) q1.done = true; }
    // q2: visit other experience buildings
    if (['telkom-prof','telkom-id-mgr','kb-pm','media-creative'].includes(npcId)) {
      const q2 = game.quests.find(q => q.id === 'q2');
      if (!q2.done) { q2.count = Math.min(q2.target, q2.count + 1); if (q2.count >= q2.target) q2.done = true; }
    }
    if (window.GameAudio) window.GameAudio.questUpdate();
  }
  if (window.GameAudio) window.GameAudio.dialogOpen();
}

function advanceDialog() {
  const d = game.dialog;
  if (!d) return;
  const cur = d.lines[d.idx];
  if (!d.complete) { d.charIdx = cur.length; d.complete = true; return; }
  d.idx++;
  if (d.idx >= d.lines.length) closeDialog();
  else { d.charIdx = 0; d.complete = false; d.lastChar = 0; }
}

function closeDialog() { game.state = 'playing'; game.dialog = null; }

function openInfoModal() {
  game.state = 'info';
  const q4 = game.quests.find(q => q.id === 'q4');
  if (q4 && !q4.done) { q4.done = true; if (window.GameAudio) window.GameAudio.questUpdate(); }
  document.getElementById('info-modal').style.display = 'flex';
  renderInfoModal();
}

function closeInfoModal() {
  game.state = 'playing';
  document.getElementById('info-modal').style.display = 'none';
  // Tutup juga chatbox Crisp kalau lagi terbuka (skip ini kalau lagi mau buka chat)
  if (window._suppressCrispHide) return;
  try {
    if (window.$crisp) {
      window.$crisp.push(['do', 'chat:close']);
      window.$crisp.push(['do', 'chat:hide']);
    }
  } catch (e) { /* no-op */ }
}

function returnToTitle() {
  if (window.GameAudio) window.GameAudio.dialogOpen();
  game.state = 'title';
  const ts = document.getElementById('title-screen');
  ts.classList.remove('hide');
  ts.style.display = 'flex';
  game.player.x = 28 * TILE;
  game.player.y = 22 * TILE;
}

// ===== UI =====
function updateUI() {
  const dialogEl = document.getElementById('dialog-box');
  if (game.state === 'dialog' && game.dialog) {
    const d = game.dialog;
    const cur = d.lines[d.idx];
    if (!d.complete) {
      const now = performance.now();
      if (now - d.lastChar > 22) {
        d.charIdx++;
        d.lastChar = now;
        if (d.charIdx >= cur.length) d.complete = true;
        if (window.GameAudio && d.charIdx % 3 === 0) window.GameAudio.dialogTick();
      }
    }
    const visible = cur.slice(0, d.charIdx);
    document.getElementById('dialog-speaker').textContent = d.name;
    document.getElementById('dialog-role').textContent = d.role;
    const av = document.getElementById('dialog-avatar');
    av.textContent = d.avatar;
    av.style.background = d.color;
    document.getElementById('dialog-text').innerHTML = visible + (d.complete ? '' : '<span style="opacity:0.3">▌</span>');
    document.getElementById('dialog-progress').textContent = `${d.idx + 1}/${d.lines.length}`;
    document.getElementById('dialog-continue').textContent = I('dialog.continue');
    dialogEl.style.display = 'block';
  } else dialogEl.style.display = 'none';

  const promptEl = document.getElementById('interact-prompt');
  if (game.state === 'playing' && game.near) {
    let wx = 0, wy = 0;
    const t = game.near;
    if (t.type === 'npc') { wx = t.target.x * TILE + 14; wy = t.target.y * TILE; }
    else if (t.type === 'bug') { wx = t.target.px + 10; wy = t.target.py; }
    else if (t.type === 'sign') { wx = SIGNPOST.x * TILE + 16; wy = SIGNPOST.y * TILE - 4; }
    else if (t.type === 'portal') { wx = PORTAL.x * TILE + 16; wy = PORTAL.y * TILE - 8; }
    const screenX = wx - game.camera.x;
    const screenY = wy - game.camera.y;
    const rect = canvas.getBoundingClientRect();
    const sx = rect.width / VIEW_W;
    const sy = rect.height / VIEW_H;
    promptEl.style.display = 'block';
    promptEl.style.left = (rect.left + screenX * sx) + 'px';
    promptEl.style.top = (rect.top + screenY * sy - 20) + 'px';
    promptEl.style.transform = 'translateX(-50%)';
    promptEl.textContent = `[E] ${t.label}`;
  } else promptEl.style.display = 'none';

  const ql = document.getElementById('quest-list');
  const totalDone = game.quests.filter(q => q.done).length;
  document.getElementById('quest-progress').textContent = `${totalDone}/${game.quests.length}`;
  document.getElementById('quest-title').textContent = I('quests.title');
  const activeQ = getActiveQuest();
  ql.innerHTML = game.quests.map(q => {
    let txt = I(`quests.${q.id}`);
    if (q.target) txt += ` (${q.count}/${q.target})`;
    let cls = q.done ? 'done' : (q === activeQ ? 'active' : 'locked');
    return `<div class="quest ${cls}"><span class="check">${q.done ? '✓' : (q === activeQ ? '▸' : '○')}</span>${txt}</div>`;
  }).join('');

  let zone = window.QuestI18n.current === 'id' ? 'Taman' : 'Park';
  for (const b of BUILDINGS) {
    const d = Math.hypot(b.x * TILE + b.w * TILE / 2 - game.player.x, b.y * TILE + b.h * TILE - game.player.y);
    if (d < 100) { zone = b.name; break; }
  }
  document.getElementById('zone-name').textContent = zone;
  document.getElementById('zone-label').textContent = I('hud.zone');
}

function renderInfoModal() {
  const t = window.QuestI18n.t.bind(window.QuestI18n);
  document.getElementById('info-label').textContent = t('info.label');
  document.getElementById('info-summary').innerHTML = t('info.summary');
  document.getElementById('contact-email').textContent = t('info.contact.email');
  document.getElementById('contact-linkedin').textContent = t('info.contact.linkedin');
  document.getElementById('contact-origin').textContent = t('info.contact.origin');
  document.getElementById('contact-edu').textContent = t('info.contact.edu');
  document.getElementById('info-cta').textContent = t('info.contactBtn');
}

function renderTitleScreen() {
  const t = window.QuestI18n.t.bind(window.QuestI18n);
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('title-name', t('title.name'));
  set('title-subtitle', t('title.subtitle'));
  set('title-desc', t('title.desc'));
  set('title-start', t('title.start'));
  set('title-version', t('title.version'));
  set('title-badge', t('title.badge'));
  set('legend-move', t('title.legend_move'));
  set('legend-talk', t('title.legend_talk'));
  set('legend-quest', t('title.legend_quest'));
}

// ===== Input =====
const MOVE_KEYS = ['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'];
const keyTime = new Map(); // last keydown time per key, used to detect stuck keys
function clearMovementKeys() {
  for (const k of MOVE_KEYS) { game.keys.delete(k); keyTime.delete(k); }
}

window.addEventListener('keydown', e => {
  // Abaikan kalau user lagi ngetik di input/textarea/contenteditable (misal: chatbox Crisp)
  const tgt = e.target;
  if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.isContentEditable)) return;
  // Modifier shortcut (Cmd/Ctrl/Alt + key) — OS often swallows the matching keyup,
  // which would leave the arrow/WASD key "stuck" and walk the player by itself.
  // Skip adding to game.keys AND clear any movement keys that may already be stuck.
  if (e.metaKey || e.ctrlKey || e.altKey) {
    clearMovementKeys();
    return;
  }
  const k = e.key.toLowerCase();
  keyTime.set(k, Date.now());
  if (game.state === 'title') {
    if (k === 'enter' || k === ' ') { startGame(); e.preventDefault(); }
    return;
  }
  if (game.state === 'info') { if (k === 'escape' || k === 'e') closeInfoModal(); return; }
  if (game.state === 'dialog') {
    if (k === 'enter' || k === ' ' || k === 'e') { advanceDialog(); e.preventDefault(); }
    if (k === 'escape') closeDialog();
    return;
  }
  if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) e.preventDefault();
  game.keys.add(k);
  if (k === 'e' || k === 'enter' || k === ' ') interact();
});
window.addEventListener('keyup', e => {
  // Always clear the key from the game's pressed set, even if focus is in an input.
  // Otherwise the key stays "stuck" and the player walks by itself.
  game.keys.delete(e.key.toLowerCase());
});

// Reset all input state when the window loses focus or becomes hidden.
// Prevents "phantom walking" caused by keys/touches that release outside the page.
function resetAllInput() {
  game.keys.clear();
  if (game.joystick) {
    game.joystick.active = false;
    game.joystick.dx = 0;
    game.joystick.dy = 0;
  }
  const stick = document.querySelector('.dpad .stick');
  if (stick) stick.style.transform = 'translate(0, 0)';
}
window.addEventListener('blur', resetAllInput);
document.addEventListener('visibilitychange', () => { if (document.hidden) resetAllInput(); });
canvas.addEventListener('click', () => {
  if (game.state === 'dialog') { advanceDialog(); return; }
  if (game.state === 'playing' && game.near) interact();
});
// Safety: clicking/touching the canvas (NOT the dpad) should never activate
// the joystick. Also clear any stuck movement keys, since the click is a fresh
// user action and any "held" key from before is almost certainly a phantom.
canvas.addEventListener('mousedown', () => {
  game.joystick.active = false;
  game.joystick.dx = 0;
  game.joystick.dy = 0;
  clearMovementKeys();
});
canvas.addEventListener('touchstart', () => {
  // Only reset if no joystick touch is currently active on the dpad
  const dpad = document.querySelector('.dpad');
  if (!dpad) return;
  const r = dpad.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) {
    game.joystick.active = false;
    game.joystick.dx = 0;
    game.joystick.dy = 0;
  }
}, { passive: true });

// ===== Joystick =====
function setupJoystick() {
  const dpad = document.querySelector('.dpad');
  const stick = document.querySelector('.dpad .stick');
  if (!dpad) return;
  let touchId = null;
  let cx, cy;
  function start(e) {
    const r = dpad.getBoundingClientRect();
    // Safety: if the dpad is hidden (display:none on desktop), its rect is all zeros.
    // Don't activate the joystick in that case — otherwise clicking anywhere computes
    // a positive dx/dy from (0,0) and the player walks to the bottom-right by itself.
    if (r.width === 0 || r.height === 0) return;
    const t = e.touches ? e.touches[0] : e;
    touchId = e.touches ? t.identifier : 'mouse';
    cx = r.left + r.width / 2;
    cy = r.top + r.height / 2;
    game.joystick.active = true;
    move(e);
    e.preventDefault();
  }
  function move(e) {
    let t;
    if (e.touches) {
      for (const tc of e.touches) if (tc.identifier === touchId) { t = tc; break; }
      if (!t) return;
    } else t = e;
    const dx = t.clientX - cx;
    const dy = t.clientY - cy;
    const d = Math.hypot(dx, dy);
    const max = 40;
    const nx = d > max ? dx / d * max : dx;
    const ny = d > max ? dy / d * max : dy;
    stick.style.transform = `translate(${nx}px, ${ny}px)`;
    game.joystick.dx = nx / max;
    game.joystick.dy = ny / max;
  }
  function end() {
    touchId = null;
    game.joystick.active = false;
    game.joystick.dx = 0;
    game.joystick.dy = 0;
    stick.style.transform = 'translate(0, 0)';
  }
  dpad.addEventListener('touchstart', start, { passive: false });
  dpad.addEventListener('touchmove', move, { passive: false });
  dpad.addEventListener('touchend', end);
  dpad.addEventListener('touchcancel', end);
  // Safety nets: if the touch ends or cancels anywhere (not just on the dpad),
  // make sure the joystick resets. Without this, the player can "walk by itself"
  // on mobile when the finger lifts off the dpad area.
  window.addEventListener('touchend', e => {
    if (touchId === null || touchId === 'mouse') return;
    let stillThere = false;
    for (const tc of e.touches) if (tc.identifier === touchId) { stillThere = true; break; }
    if (!stillThere) end();
  });
  window.addEventListener('touchcancel', () => { if (touchId !== null && touchId !== 'mouse') end(); });
  dpad.addEventListener('mousedown', start);
  window.addEventListener('mousemove', e => { if (game.joystick.active && touchId === 'mouse') move(e); });
  window.addEventListener('mouseup', () => { if (touchId === 'mouse') end(); });
}

// ===== Loop =====
let lastT = 0;
function loop(t) {
  const dt = Math.min(0.05, (t - lastT) / 1000);
  lastT = t;
  update(dt);
  render();
  updateUI();
  requestAnimationFrame(loop);
}

// ===== Public API =====
function startGame() {
  game.state = 'playing';
  game.startTime = Date.now();
  document.getElementById('title-screen').classList.add('hide');
  setTimeout(() => { document.getElementById('title-screen').style.display = 'none'; }, 500);
  // attention pulse on quest log for 5s
  const ql = document.querySelector('.quest-log');
  if (ql) {
    ql.classList.remove('minimized', 'user-toggled');
    ql.classList.add('attention');
  }
  if (window.GameAudio) window.GameAudio.start();
}

function setLanguage(lang) {
  window.QuestI18n.setLang(lang);
  document.querySelectorAll('[data-lang-btn]').forEach(b => b.classList.toggle('active', b.dataset.langBtn === lang));
  renderTitleScreen();
  if (game.state === 'info') renderInfoModal();
}

function toggleMute() {
  const m = !window.GameAudio.isMuted();
  window.GameAudio.setMuted(m);
  document.getElementById('btn-mute').classList.toggle('muted', m);
}

function toggleQuestLog() {
  const ql = document.querySelector('.quest-log');
  ql.classList.toggle('minimized');
  ql.classList.add('user-toggled');
  ql.classList.remove('attention');
  game.questLogAttention = false;
  // On mobile, hide hint banner when quest log is expanded
  if (!ql.classList.contains('minimized')) {
    const hb = document.getElementById('hint-banner');
    if (hb) hb.classList.remove('show');
    clearTimeout(window._hintTO);
  }
}

function setupActionBtn() {
  const btn = document.getElementById('action-btn');
  if (!btn) return;
  btn.addEventListener('touchstart', e => {
    e.preventDefault();
    if (game.state === 'dialog') advanceDialog();
    else if (game.state === 'playing' && game.near) interact();
  });
  btn.addEventListener('click', e => {
    if (game.state === 'dialog') advanceDialog();
    else if (game.state === 'playing' && game.near) interact();
  });
}

window.QuestGame = { startGame, closeInfoModal, setLanguage, toggleMute, toggleQuestLog };

document.addEventListener('DOMContentLoaded', () => {
  // Detect real touch device — only then show mobile controls.
  // Use screen size as primary signal because navigator.maxTouchPoints
  // often false-positives on Windows laptops, hybrid devices, and fullscreen mode.
  // Only treat as touch device if screen is small enough to BE a phone/tablet.
  function applyTouchMode() {
    const smallScreen = window.innerWidth < 900;
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const noHover = window.matchMedia && window.matchMedia('(hover: none)').matches;
    // Only enable touch UI when BOTH small screen AND (touch OR no-hover)
    const isTouch = smallScreen && (hasTouch || noHover);
    document.body.classList.toggle('is-touch', isTouch);
  }
  applyTouchMode();
  window.addEventListener('resize', applyTouchMode);

  renderTitleScreen();
  setupJoystick();
  setupActionBtn();
});

requestAnimationFrame(loop);
