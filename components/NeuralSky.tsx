"use client";

import { useEffect, useRef } from "react";

interface Props {
  /** Stops the animation (e.g. while a full-screen section is open over it). */
  paused?: boolean;
}

type RGB = readonly [number, number, number];

const BLUE: RGB = [100, 179, 255];
const MINT: RGB = [95, 211, 154];

/* Tuning. Distances are CSS pixels, times are milliseconds. */
const AREA_PER_NODE = 7500; // ~44 nodes per 390×844 screen
const MIN_SPACING = 36;
const LINK_DIST = 118; // nodes closer than this are linked; links fade out towards it
const MAX_LINK = 145; // off-screen margin kept around the viewport
const PULSE_SPEED = 0.09; // px per ms
const PULSE_TRAIL = 24;
const FIRE_CHANCE = 0.4; // chance a firing node signals each neighbour
const REFRACTORY = 1500; // a node can't be re-triggered this soon after firing
const ENERGY_DECAY = 520; // glow fade time constant
const MAX_PULSES = 16;
const FRAME_MS = 32; // ~30fps is plenty for this and kinder to batteries

/* Scroll depth. Each node sits at a depth between FAR and 1 (nearest), and
   moves with the page at depth × PARALLAX of the scroll speed — near nodes
   slide by faster, far ones barely move. Content itself moves at 1. */
const PARALLAX = 0.6;
const FAR = 0.28;

interface Node {
  ox: number; // position within the (vertically repeating) field
  oy: number;
  x: number; // where it's drawn this frame
  y: number;
  z: number; // depth: FAR (distant) … 1 (near)
  phase: number;
  drift: number;
  amp: number;
  hub: boolean;
  color: RGB;
  energy: number;
  lastFire: number;
  visible: boolean;
}

interface Pulse {
  from: number;
  to: number;
  travelled: number;
}

/** A soft radial glow, drawn once and stamped per node — much cheaper on a
    phone than canvas shadowBlur every frame. */
function makeGlow([r, g, b]: RGB): HTMLCanvasElement {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g2 = c.getContext("2d")!;
  const grad = g2.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
  grad.addColorStop(0.22, `rgba(${r},${g},${b},0.45)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  g2.fillStyle = grad;
  g2.fillRect(0, 0, size, size);
  return c;
}

const pairKey = (a: number, b: number) => (a < b ? a * 4096 + b : b * 4096 + a);

/**
 * Mobile background: a faint neural network whose nodes fire. A node lights
 * up, sends pulses down some of its links, and the nodes those reach light
 * up in turn, so activity ripples across the screen and dies out — then a
 * new node fires somewhere else. A refractory period stops it cascading
 * forever.
 *
 * Scrolling moves the network at different speeds by depth, so it reads as
 * a 3D field you drift through. Because nodes shift relative to each other,
 * links are re-formed every frame between whichever nodes are currently
 * close. The field repeats vertically, so it never runs out on long pages.
 *
 * Visitors who prefer reduced motion get a still frame instead.
 */
export default function NeuralSky({ paused = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const wakeRef = useRef<() => void>(() => {});

  useEffect(() => {
    pausedRef.current = paused;
    if (!paused) wakeRef.current();
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const glow = { blue: makeGlow(BLUE), mint: makeGlow(MINT) };

    let W = 0;
    let H = 0;
    let fieldH = 0; // height of one repeat of the field
    let nodes: Node[] = [];
    let links: number[][] = []; // per node: indices of currently linked nodes
    let linkSet = new Set<number>();
    let pulses: Pulse[] = [];
    let raf = 0;
    let running = false;
    let last = 0;
    let nextSpontaneous = 0;

    const build = () => {
      // Taller than the screen by a link's reach, so nodes wrapping round
      // from one edge are already linked up before they come into view.
      fieldH = H + MAX_LINK * 2;
      const count = Math.round((W * fieldH) / AREA_PER_NODE);
      nodes = [];
      let attempts = 0;
      while (nodes.length < count && attempts < count * 40) {
        attempts++;
        const x = Math.random() * (W + 20) - 10;
        const y = Math.random() * fieldH;
        if (nodes.some((n) => Math.hypot(n.ox - x, n.oy - y) < MIN_SPACING)) continue;
        nodes.push({
          ox: x,
          oy: y,
          x,
          y,
          z: FAR + Math.random() * (1 - FAR),
          phase: Math.random() * Math.PI * 2,
          drift: 0.00012 + Math.random() * 0.00018,
          amp: 2 + Math.random() * 4,
          hub: Math.random() < 0.15,
          color: Math.random() < 0.22 ? MINT : BLUE,
          energy: 0,
          lastFire: -Infinity,
          visible: false,
        });
      }
      pulses = [];
    };

    /** Places every node for this moment and scroll position, then links
        every pair closer than LINK_DIST. A distance threshold (rather than
        "nearest few") means links only ever appear or vanish at that
        distance, where they've already faded to nothing — so nodes passing
        each other while scrolling never make lines pop. */
    const layout = (now: number, scroll: number) => {
      for (const n of nodes) {
        const shifted = n.oy - scroll * n.z * PARALLAX;
        // Wrap into [-MAX_LINK, H + MAX_LINK): one field-height of room.
        const y = ((((shifted + MAX_LINK) % fieldH) + fieldH) % fieldH) - MAX_LINK;
        n.x = n.ox + Math.sin(now * n.drift + n.phase) * n.amp;
        n.y = y + Math.cos(now * n.drift * 0.8 + n.phase) * n.amp;
        n.visible = n.y > -MAX_LINK && n.y < H + MAX_LINK;
      }

      links = nodes.map(() => []);
      linkSet = new Set();
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!n.visible) continue;
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          if (!m.visible) continue;
          const dx = m.x - n.x;
          const dy = m.y - n.y;
          if (dx * dx + dy * dy > LINK_DIST * LINK_DIST) continue;
          linkSet.add(pairKey(i, j));
          links[i].push(j);
          links[j].push(i);
        }
      }
    };

    const fire = (i: number, now: number, cameFrom = -1) => {
      const n = nodes[i];
      n.energy = 1;
      n.lastFire = now;
      for (const j of links[i]) {
        if (j === cameFrom || pulses.length >= MAX_PULSES) continue;
        if (Math.random() > FIRE_CHANCE) continue;
        pulses.push({ from: i, to: j, travelled: 0 });
      }
    };

    /** Depth fades distant nodes and links back; near ones are fuller. */
    const depthAlpha = (z: number) => 0.35 + 0.65 * ((z - FAR) / (1 - FAR));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round";

      const busy = new Set(pulses.map((p) => pairKey(p.from, p.to)));

      // Links, fading with length and depth, brighter while carrying a signal.
      ctx.lineWidth = 0.8;
      nodes.forEach((a, i) => {
        for (const j of links[i]) {
          if (j < i) continue;
          const b = nodes[j];
          const len = Math.hypot(b.x - a.x, b.y - a.y);
          const depth = depthAlpha(Math.min(a.z, b.z));
          // Full strength for most of the range, fading to 0 over the last
          // third so links forming or breaking never pop.
          const fade = Math.min(1, (LINK_DIST - len) / (LINK_DIST * 0.33));
          const base = (0.05 + 0.08 * (1 - len / LINK_DIST)) * depth * fade;
          const heat = busy.has(pairKey(i, j)) ? 0.12 * fade : 0;
          ctx.strokeStyle = `rgba(${BLUE[0]},${BLUE[1]},${BLUE[2]},${base + heat})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      });

      // Signals travelling along links: a short soft streak.
      ctx.lineWidth = 1.2;
      for (const p of pulses) {
        const from = nodes[p.from];
        const to = nodes[p.to];
        const len = Math.hypot(to.x - from.x, to.y - from.y) || 1;
        const t = Math.min(1, p.travelled / len);
        const t0 = Math.max(0, (p.travelled - PULSE_TRAIL) / len);
        const hx = from.x + (to.x - from.x) * t;
        const hy = from.y + (to.y - from.y) * t;
        const tx = from.x + (to.x - from.x) * t0;
        const ty = from.y + (to.y - from.y) * t0;
        const [r, g, b] = from.color;
        const grad = ctx.createLinearGradient(tx, ty, hx, hy);
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0.5)`);
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        ctx.globalAlpha = 0.5;
        ctx.drawImage(from.color === MINT ? glow.mint : glow.blue, hx - 5, hy - 5, 10, 10);
        ctx.globalAlpha = 1;
      }

      // Nodes: near ones a touch larger and brighter; a glow when they fire.
      for (const n of nodes) {
        if (!n.visible) continue;
        const depth = depthAlpha(n.z);
        const scale = 0.75 + 0.35 * n.z;
        const sprite = n.color === MINT ? glow.mint : glow.blue;
        if (n.energy > 0.02) {
          const size = (n.hub ? 24 : 18) * (0.6 + 0.5 * n.energy) * scale;
          ctx.globalAlpha = n.energy * 0.5 * depth;
          ctx.drawImage(sprite, n.x - size / 2, n.y - size / 2, size, size);
        }
        const [r, g, b] = n.color;
        ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(${r},${g},${b},${(0.3 + 0.4 * n.energy) * depth})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, ((n.hub ? 1.8 : 1.2) + n.energy * 0.5) * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (now: number, dt: number) => {
      for (const n of nodes) n.energy *= Math.exp(-dt / ENERGY_DECAY);

      const arrived: Pulse[] = [];
      pulses = pulses.filter((p) => {
        // Scrolling can pull two nodes apart; the signal dies with the link.
        if (!linkSet.has(pairKey(p.from, p.to))) return false;
        p.travelled += PULSE_SPEED * dt;
        const a = nodes[p.from];
        const b = nodes[p.to];
        if (p.travelled < Math.hypot(b.x - a.x, b.y - a.y)) return true;
        arrived.push(p);
        return false;
      });
      for (const p of arrived) {
        const target = nodes[p.to];
        if (now - target.lastFire > REFRACTORY) fire(p.to, now, p.from);
        else target.energy = Math.max(target.energy, 0.35);
      }

      // A new spark every few seconds — enough to feel alive, not busy.
      // Only on-screen nodes, so every spark is one you can see.
      if (now >= nextSpontaneous) {
        const onScreen = nodes
          .map((n, i) => (n.y > 0 && n.y < H ? i : -1))
          .filter((i) => i !== -1);
        if (onScreen.length) fire(onScreen[Math.floor(Math.random() * onScreen.length)], now);
        nextSpontaneous = now + 2600 + Math.random() * 2400;
      }
    };

    const loop = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      if (pausedRef.current) {
        running = false;
        cancelAnimationFrame(raf);
        return;
      }
      if (now - last < FRAME_MS) return;
      const dt = Math.min(100, now - last); // tab switches shouldn't jump
      last = now;
      layout(now, window.scrollY);
      step(now, dt);
      draw();
    };

    const start = () => {
      if (running || reduceMotion || pausedRef.current) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    wakeRef.current = start;

    const stillFrame = () => {
      // Reduced motion: a few nodes lit, nothing moving, no scroll depth.
      layout(0, 0);
      nodes.forEach((n) => (n.energy = Math.random() < 0.12 ? 0.7 : 0));
      draw();
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Phones resize the viewport as the address bar slides; only rebuild
      // the network for real changes (rotation, a different width).
      if (w !== W || Math.abs(h - H) > 140 || !nodes.length) {
        W = w;
        H = h;
        build();
      }
      if (reduceMotion) stillFrame();
      else {
        layout(performance.now(), window.scrollY);
        draw();
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    start();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      wakeRef.current = () => {};
    };
  }, []);

  return <canvas ref={canvasRef} className="neural-sky" aria-hidden="true" />;
}
