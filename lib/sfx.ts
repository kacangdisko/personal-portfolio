"use client";

/* ── Pulsar SFX ───────────────────────────────────────────────────────────
   Plays your own MP3s from /public/sfx. Drop files in with the names below
   and they play automatically — nothing else to wire up.

     /public/sfx/tremor-1.mp3     first warning click
     /public/sfx/tremor-2.mp3     second warning click
     /public/sfx/power-up.mp3     third click: transition into pulsar focus
     /public/sfx/pulsar-loop.mp3  looped while pulsar focus is active
     /public/sfx/power-down.mp3   restoring back to the desktop

   Until a file exists this fails silently — a 404 caught and ignored — the
   same way GitHub stats and project screenshots degrade gracefully
   elsewhere in this project. See README.txt in /public/sfx for format tips. */

const FILES = {
  tremor1: "/sfx/tremor-1.mp3",
  tremor2: "/sfx/tremor-2.mp3",
  powerUp: "/sfx/power-up.mp3",
  pulsarLoop: "/sfx/pulsar-loop.mp3",
  powerDown: "/sfx/power-down.mp3",
} as const;

type Key = keyof typeof FILES;

const VOLUME = 0.55;
const STORAGE_KEY = "pulsar-sfx-muted";
const FADE_MS = 260;

const cache = new Map<Key, HTMLAudioElement>();
let loopEl: HTMLAudioElement | null = null;
let muted = false;

function readMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

if (typeof window !== "undefined") muted = readMuted();

function getAudio(key: Key): HTMLAudioElement {
  let el = cache.get(key);
  if (!el) {
    el = new Audio(FILES[key]);
    el.preload = "auto";
    el.volume = VOLUME;
    cache.set(key, el);
  }
  return el;
}

function fadeOutAndStop(el: HTMLAudioElement) {
  const steps = 8;
  const startVolume = el.volume;
  let i = 0;
  const id = window.setInterval(() => {
    i += 1;
    el.volume = Math.max(0, startVolume * (1 - i / steps));
    if (i >= steps) {
      window.clearInterval(id);
      el.pause();
      el.currentTime = 0;
      el.volume = startVolume; // restore for the next time it plays
    }
  }, FADE_MS / steps);
}

export function isSfxMuted(): boolean {
  return muted;
}

export function setSfxMuted(next: boolean): void {
  muted = next;
  try {
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    /* Nothing to persist to — the in-memory value still applies this visit. */
  }
  if (loopEl) loopEl.muted = next;
}

function playOnce(key: Key) {
  if (muted) return;
  const el = getAudio(key);
  el.currentTime = 0;
  void el.play().catch(() => {
    /* No file at that path yet, or autoplay was blocked — stay silent. */
  });
}

/** The two warning clicks before pulsar focus. */
export function playTremor(level: 1 | 2): void {
  playOnce(level === 1 ? "tremor1" : "tremor2");
}

/** Third click: the interface exits and the planet travels to center. */
export function playPowerUp(): void {
  playOnce("powerUp");
}

/** Looped for as long as pulsar focus is active. */
export function startPulsarHum(): void {
  if (loopEl) return;
  const el = getAudio("pulsarLoop");
  el.loop = true;
  el.muted = muted;
  el.currentTime = 0;
  void el.play().catch(() => {});
  loopEl = el;
}

export function stopPulsarHum(): void {
  if (!loopEl) return;
  fadeOutAndStop(loopEl);
  loopEl = null;
}

/** Restoration: the planet's return journey. */
export function playPowerDown(): void {
  playOnce("powerDown");
}
