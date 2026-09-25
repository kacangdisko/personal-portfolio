"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MenuBar from "./MenuBar";
import Terminal from "./Terminal";
import AppWindow from "./AppWindow";
import Dock from "./Dock";
import MobileNav from "./MobileNav";
import MobileHero from "./MobileHero";
import MobileDesktopHint from "./MobileDesktopHint";
import PhotoWidget from "./PhotoWidget";
import OrbitalSky from "./OrbitalSky";
import { commandLookup } from "@/content/commands";
import type { RepoStats, ViewKey } from "@/lib/types";

type Focus = "terminal" | "app";

const MOBILE = 860;
const MIN_W = 340;
const MIN_H = 220;

export default function Desktop({ repoStats }: { repoStats: RepoStats }) {
  const [activeView, setActiveView] = useState<ViewKey | null>(null);
  const [focus, setFocus] = useState<Focus>("terminal");
  const [cosmicFocus, setCosmicFocus] = useState(false);
  const [cosmicAnimating, setCosmicAnimating] = useState(false);
  const stageRef = useRef<HTMLElement>(null);
  const cosmicTimerRef = useRef<number | null>(null);

  /* Mobile gets its own layout entirely: no terminal, no orbital-sky/pulsar
     animation, and the dock becomes a menu sheet instead of an icon grid —
     none of which is a CSS-only swap, so it's tracked in state and the
     components are swapped outright. Starts false (matching the server's
     render) and is corrected right after mount, the same pattern MenuBar
     uses for the clock and mute state, so the desktop's own first render
     is never touched. */
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE}px)`);
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  /* Tracks whether the one-time desktop-hint overlay is currently showing,
     reported up from MobileDesktopHint so the scroll lock below can account
     for it. A shared link can open straight to a section (see the hash
     effect further down) on someone's very first mobile visit, so the hint
     and an open window can legitimately be up at the same time — the lock
     has to hold until BOTH are gone, not just whichever one closes first. */
  const [hintVisible, setHintVisible] = useState(false);

  /* On mobile, an open window — or the desktop-hint overlay — is a
     full-screen sheet, and the page behind it shouldn't still scroll (or
     rubber-band) underneath. Guarded by isMobile, so this never touches the
     desktop's own scroll behaviour. */
  useEffect(() => {
    if (!isMobile || (!activeView && !hintVisible)) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, activeView, hintVisible]);

  const setCosmicMode = useCallback((active: boolean) => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(".menubar, .photo-widget, .win, .dock"),
    );

    if (cosmicTimerRef.current) window.clearTimeout(cosmicTimerRef.current);

    const transitionMs = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 40
      : 1120;

    if (active) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      elements.forEach((element, index) => {
        const box = element.getBoundingClientRect();
        let x = 0;
        let y = 0;
        if (element.classList.contains("menubar")) {
          // A full-width bar is equally close to both side edges; forcing it
          // upward preserves the desktop's spatial hierarchy during focus.
          y = -box.bottom - 48;
        } else {
          const distances = [box.left, vw - box.right, box.top, vh - box.bottom];
          const nearest = distances.indexOf(Math.min(...distances));
          if (nearest === 0) x = -box.right - 48;
          if (nearest === 1) x = vw - box.left + 48;
          if (nearest === 2) y = -box.bottom - 48;
          if (nearest === 3) y = vh - box.top + 48;
        }
        element.style.setProperty("--cosmic-x", `${x}px`);
        element.style.setProperty("--cosmic-y", `${y}px`);
        element.style.setProperty("--cosmic-delay", `${index * 45}ms`);
      });
      setCosmicAnimating(true);
      setCosmicFocus(true);
      cosmicTimerRef.current = window.setTimeout(() => {
        setCosmicAnimating(false);
        for (const element of elements) {
          element.setAttribute("inert", "");
          element.setAttribute("aria-hidden", "true");
        }
      }, transitionMs);
      return;
    }

    for (const element of elements) {
      element.removeAttribute("inert");
      element.removeAttribute("aria-hidden");
    }
    setCosmicAnimating(true);
    setCosmicFocus(false);
    cosmicTimerRef.current = window.setTimeout(() => setCosmicAnimating(false), transitionMs);
  }, []);

  useEffect(
    () => () => {
      if (cosmicTimerRef.current) window.clearTimeout(cosmicTimerRef.current);
    },
    [],
  );

  const open = useCallback((view: ViewKey) => {
    setActiveView(view);
    setFocus("app");
    history.replaceState(null, "", `#${view}`);
  }, []);

  const close = useCallback(() => {
    setActiveView(null);
    setFocus("terminal");
    history.replaceState(null, "", window.location.pathname);
  }, []);

  /* A shared link like /#projects opens straight to that window. */
  useEffect(() => {
    const hash = window.location.hash.replace("#", "").toLowerCase();
    const hit = commandLookup[hash];
    if (hit?.view) {
      setActiveView(hit.view);
      setFocus("app");
    }
  }, []);

  /* Clicking the dock icon of the open app closes it — with one window at a
     time, the dock has to toggle or you get stuck reopening what is open. */
  const onDockSelect = (view: ViewKey) => {
    if (activeView === view) close();
    else open(view);
  };

  /* ── Dragging and resizing ──────────────────────────────────────────────
     One delegated listener on the stage handles both. A window starts with
     percentage CSS positioning; the first interaction converts it to pixels
     so the two never fight. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onPointerDown = (e: PointerEvent) => {
      if (window.innerWidth <= MOBILE || e.button !== 0) return;

      const target = e.target as HTMLElement;
      const handle = target.closest<HTMLElement>("[data-resize]");
      const bar = target.closest<HTMLElement>("[data-drag]");
      if (!handle && (!bar || target.closest(".light"))) return;

      const win = (handle ?? bar)!.closest<HTMLElement>(".win");
      if (!win) return;

      const stageBox = stage.getBoundingClientRect();
      const box = win.getBoundingClientRect();
      const dockBox = document.querySelector<HTMLElement>(".dock")?.getBoundingClientRect();
      const dockBounds = dockBox
        ? {
            left: dockBox.left - stageBox.left,
            right: dockBox.right - stageBox.left,
            top: dockBox.top - stageBox.top,
            bottom: dockBox.bottom - stageBox.top,
          }
        : null;

      // Pin the window in pixels relative to the stage before moving it.
      const startL = box.left - stageBox.left;
      const startT = box.top - stageBox.top;
      const startW = box.width;
      const startH = box.height;

      win.style.left = `${startL}px`;
      win.style.top = `${startT}px`;
      win.style.width = `${startW}px`;
      win.style.height = `${startH}px`;
      win.style.right = "auto";
      win.style.bottom = "auto";

      const startX = e.clientX;
      const startY = e.clientY;
      const dir = handle?.dataset.resize ?? null;

      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        if (!dir) {
          // The stage reaches the viewport bottom. Only the dock itself is an
          // obstacle, so windows can use the empty space on either side of it.
          const x = Math.max(0, Math.min(startL + dx, stageBox.width - startW));
          let y = Math.max(0, Math.min(startT + dy, stageBox.height - startH));
          const hitsDock =
            dockBounds &&
            x < dockBounds.right &&
            x + startW > dockBounds.left &&
            y < dockBounds.bottom &&
            y + startH > dockBounds.top;
          if (hitsDock) y = Math.max(0, dockBounds.top - startH);
          win.style.left = `${x}px`;
          win.style.top = `${y}px`;
          return;
        }

        let w = startW;
        let h = startH;
        let l = startL;
        let t = startT;

        if (dir.includes("e")) w = startW + dx;
        if (dir.includes("s")) h = startH + dy;
        if (dir.includes("w")) {
          w = startW - dx;
          l = startL + dx;
        }
        if (dir.includes("n")) {
          h = startH - dy;
          t = startT + dy;
        }

        // Clamp to the minimum, anchoring the opposite edge.
        if (w < MIN_W) {
          if (dir.includes("w")) l = startL + (startW - MIN_W);
          w = MIN_W;
        }
        if (h < MIN_H) {
          if (dir.includes("n")) t = startT + (startH - MIN_H);
          h = MIN_H;
        }

        // Clamp to the stage so a window cannot be dragged out of reach.
        if (l < 0) {
          w += l;
          l = 0;
        }
        if (t < 0) {
          h += t;
          t = 0;
        }
        if (l + w > stageBox.width) w = stageBox.width - l;
        if (t + h > stageBox.height) h = stageBox.height - t;

        const hitsDock =
          dockBounds &&
          l < dockBounds.right &&
          l + w > dockBounds.left &&
          t < dockBounds.bottom &&
          t + h > dockBounds.top;
        if (hitsDock) {
          h = Math.max(MIN_H, dockBounds.top - t);
          if (t + h > dockBounds.top) t = Math.max(0, dockBounds.top - h);
        }

        win.style.left = `${l}px`;
        win.style.top = `${t}px`;
        win.style.width = `${Math.max(MIN_W, w)}px`;
        win.style.height = `${Math.max(MIN_H, h)}px`;
      };

      const up = () => {
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
        document.body.style.userSelect = "";
      };

      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
      document.body.style.userSelect = "none";
      e.preventDefault();
    };

    stage.addEventListener("pointerdown", onPointerDown);
    return () => stage.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div
      className={`desk${cosmicFocus ? " is-cosmic-focus" : ""}${
        cosmicAnimating ? " is-cosmic-animating" : ""
      }`}
    >
      <div className="wallpaper" aria-hidden="true" />
      {!isMobile && <OrbitalSky onCosmicFocus={setCosmicMode} />}

      <MenuBar />

      {isMobile && <MobileDesktopHint onVisibleChange={setHintVisible} />}

      <main className="stage" ref={stageRef}>
        {/* Sits in the background layer: windows always paint on top of it. */}
        <PhotoWidget />

        {isMobile ? (
          <>
            {/* Stands in for the terminal's boot intro, which isn't
                rendered on mobile at all — plus the landing content a
                phone visitor would otherwise have to dig for. */}
            <MobileHero onOpen={open} />
            {/* Every section laid out in the normal page flow — scroll to
                see them all — rather than behind a menu button. An open
                window is a full-screen sheet regardless of where in the
                flow this sits. */}
            <MobileNav onSelect={onDockSelect} />
          </>
        ) : (
          <Terminal
            onOpen={open}
            onFocus={() => setFocus("terminal")}
            isActive={focus === "terminal"}
          />
        )}

        {activeView && (
          <AppWindow
            view={activeView}
            repoStats={repoStats}
            isActive={focus === "app"}
            onFocus={() => setFocus("app")}
            onClose={close}
            onNavigate={open}
          />
        )}
      </main>

      {!isMobile && <Dock activeView={activeView} onSelect={onDockSelect} />}
    </div>
  );
}
