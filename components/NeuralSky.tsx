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
const AREA_PER_NODE = 7500; // ~44 nodes on a 390×844 phone
const MIN_NODES = 28;
const MAX_NODES = 70;
const MIN_SPACING = 36;
const LINKS_PER_NODE = 3;
const MAX_LINK = 145;
const PULSE_SPEED = 0.09; // px per ms
const PULSE_TRAIL = 24;
const FIRE_CHANCE = 0.4; // chance a firing node signals each neighbour
const REFRACTORY = 1500; // a node can't be re-triggered this soon after firing
const ENERGY_DECAY = 520; // glow fade time constant
const MAX_PULSES = 16;
const FRAME_MS = 32; // ~30fps is plenty for this and kinder to batteries

interface Node {
  ox: number;
  oy: number;
  x: number;
  y: number;
  phase: number;
  drift: number;
  amp: number;
  hub: boolean;
  color: RGB;
  energy: number;
  lastFire: number;
  links: number[]; // indices into edges
}

interface Edge {
  a: number;
  b: number;
  len: number;
  heat: number; // brightens while a pulse runs along it
}

interface Pulse {
  edge: number;
  from: number; // node index the pulse left
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

/**
 * Mobile background: a faint neural network whose nodes fire. A node lights
 * up, sends pulses down some of its links, and the nodes those reach light
 * up in turn, so activity ripples across the screen and dies out — then a
 * new node fires somewhere else. A refractory period stops it cascading
 * forever. Visitors who prefer reduced motion get a still frame instead.
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
    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let pulses: Pulse[] = [];
    let raf = 0;
    let running = false;
    let last = 0;
    let nextSpontaneous = 0;

    const build = () => {
      const count = Math.max(
        MIN_NODES,
        Math.min(MAX_NODES, Math.round((W * H) / AREA_PER_NODE)),
      );
      nodes = [];
      let attempts = 0;
      while (nodes.length < count && attempts < count * 40) {
        attempts++;
        const x = Math.random() * (W + 20) - 10;
        const y = Math.random() * (H + 20) - 10;
        if (nodes.some((n) => Math.hypot(n.ox - x, n.oy - y) < MIN_SPACING)) continue;
        const mint = Math.random() < 0.22;
        nodes.push({
          ox: x,
          oy: y,
          x,
          y,
          phase: Math.random() * Math.PI * 2,
          drift: 0.00012 + Math.random() * 0.00018,
          amp: 2 + Math.random() * 4,
          hub: Math.random() < 0.15,
          color: mint ? MINT : BLUE,
          energy: 0,
          lastFire: -Infinity,
          links: [],
        });
      }

      edges = [];
      const seen = new Set<string>();
      nodes.forEach((n, i) => {
        nodes
          .map((m, j) => ({ j, d: Math.hypot(m.ox - n.ox, m.oy - n.oy) }))
          .filter(({ j, d }) => j !== i && d <= MAX_LINK)
          .sort((p, q) => p.d - q.d)
          .slice(0, LINKS_PER_NODE)
          .forEach(({ j, d }) => {
            const key = i < j ? `${i}-${j}` : `${j}-${i}`;
            if (seen.has(key)) return;
            seen.add(key);
            const e = edges.push({ a: i, b: j, len: d, heat: 0 }) - 1;
            n.links.push(e);
            nodes[j].links.push(e);
          });
      });
      pulses = [];
    };

    const fire = (i: number, now: number, cameFrom = -1) => {
      const n = nodes[i];
      n.energy = 1;
      n.lastFire = now;
      for (const e of n.links) {
        if (e === cameFrom || pulses.length >= MAX_PULSES) continue;
        if (Math.random() > FIRE_CHANCE) continue;
        const edge = edges[e];
        pulses.push({ edge: e, from: i, to: edge.a === i ? edge.b : edge.a, travelled: 0 });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round";

      // Links, brighter while a signal is on them.
      ctx.lineWidth = 0.8;
      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        const base = 0.04 + 0.08 * (1 - e.len / MAX_LINK);
        ctx.strokeStyle = `rgba(${BLUE[0]},${BLUE[1]},${BLUE[2]},${base + e.heat * 0.12})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Signals travelling along links: a short bright streak.
      ctx.lineWidth = 1.2;
      for (const p of pulses) {
        const from = nodes[p.from];
        const to = nodes[p.to];
        const len = edges[p.edge].len;
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

      // Nodes: a glow that swells when they fire, and a small core.
      for (const n of nodes) {
        const sprite = n.color === MINT ? glow.mint : glow.blue;
        if (n.energy > 0.02) {
          const size = (n.hub ? 24 : 18) * (0.6 + 0.5 * n.energy);
          ctx.globalAlpha = n.energy * 0.5;
          ctx.drawImage(sprite, n.x - size / 2, n.y - size / 2, size, size);
        }
        const [r, g, b] = n.color;
        ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(${r},${g},${b},${0.3 + 0.4 * n.energy})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, (n.hub ? 1.8 : 1.2) + n.energy * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (now: number, dt: number) => {
      for (const n of nodes) {
        n.x = n.ox + Math.sin(now * n.drift + n.phase) * n.amp;
        n.y = n.oy + Math.cos(now * n.drift * 0.8 + n.phase) * n.amp;
        n.energy *= Math.exp(-dt / ENERGY_DECAY);
      }
      for (const e of edges) e.heat *= Math.exp(-dt / 300);

      const arrived: Pulse[] = [];
      pulses = pulses.filter((p) => {
        p.travelled += PULSE_SPEED * dt;
        edges[p.edge].heat = Math.max(edges[p.edge].heat, 1);
        if (p.travelled < edges[p.edge].len) return true;
        arrived.push(p);
        return false;
      });
      for (const p of arrived) {
        const target = nodes[p.to];
        if (now - target.lastFire > REFRACTORY) fire(p.to, now, p.edge);
        else target.energy = Math.max(target.energy, 0.35);
      }

      // A new spark every few seconds — enough to feel alive, not busy.
      if (now >= nextSpontaneous && nodes.length) {
        fire(Math.floor(Math.random() * nodes.length), now);
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
      // Reduced motion: a few nodes lit, nothing moving.
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
      else draw();
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
