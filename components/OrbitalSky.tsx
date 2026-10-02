"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  playPowerDown,
  playPowerUp,
  playTremor,
  startPulsarHum,
  stopPulsarHum,
} from "@/lib/sfx";

type Phase = "orbit" | "transition" | "pulsar" | "restoring";

interface Props {
  onCosmicFocus: (active: boolean) => void;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export default function OrbitalSky({ onCosmicFocus }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const planetRef = useRef<HTMLDivElement>(null);
  const clickRef = useRef(0);
  const phaseRef = useRef<Phase>("orbit");
  const timersRef = useRef<number[]>([]);
  const [clicks, setClicks] = useState(0);
  const [impact, setImpact] = useState(0);
  const [phase, setPhaseState] = useState<Phase>("orbit");

  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  const later = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    timersRef.current.push(id);
    return id;
  }, []);

  const restore = useCallback(() => {
    if (phaseRef.current === "orbit" || phaseRef.current === "restoring") return;
    const reduced = window.matchMedia(REDUCED_MOTION).matches;
    setPhase("restoring");
    onCosmicFocus(false);
    stopPulsarHum();
    playPowerDown();
    later(() => {
      clickRef.current = 0;
      setClicks(0);
      setImpact(0);
      setPhase("orbit");
    }, reduced ? 40 : 1250);
  }, [later, onCosmicFocus, setPhase]);

  const triggerPlanet = useCallback(() => {
    if (phaseRef.current !== "orbit") return;

    const next = Math.min(3, clickRef.current + 1);
    clickRef.current = next;
    setClicks(next);
    setImpact(next);
    later(() => setImpact(0), next === 3 ? 1050 : 620);

    if (next < 3) {
      playTremor(next as 1 | 2);
      return;
    }

    const reduced = window.matchMedia(REDUCED_MOTION).matches;
    setPhase("transition");
    onCosmicFocus(true);
    playPowerUp();
    later(() => {
      setPhase("pulsar");
      startPulsarHum();
    }, reduced ? 40 : 1280);
  }, [later, onCosmicFocus, setPhase]);

  useEffect(() => {
    const root = rootRef.current;
    const planet = planetRef.current;
    if (!root || !planet) return;

    const reduced = window.matchMedia(REDUCED_MOTION).matches;
    let frame = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const animatePointer = () => {
      currentX += (targetX - currentX) * 0.105;
      currentY += (targetY - currentY) * 0.105;
      root.style.setProperty("--stars-x", `${currentX * -3.5}px`);
      root.style.setProperty("--stars-y", `${currentY * -2.6}px`);
      root.style.setProperty("--nebula-x", `${currentX * -8.2}px`);
      root.style.setProperty("--nebula-y", `${currentY * -5}px`);
      root.style.setProperty("--planet-x", `${currentX * 12}px`);
      root.style.setProperty("--planet-y", `${currentY * 7}px`);
      if (Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002) {
        frame = requestAnimationFrame(animatePointer);
      } else {
        frame = 0;
      }
    };

    const schedulePointer = () => {
      if (!frame) frame = requestAnimationFrame(animatePointer);
    };

    const pointOnPlanet = (x: number, y: number) => {
      const rect = planet.getBoundingClientRect();
      const radius = rect.width / 2;
      const dx = x - (rect.left + radius);
      const dy = y - (rect.top + radius);
      return dx * dx + dy * dy <= radius * radius;
    };

    const blockedByInterface = (target: EventTarget | null) =>
      target instanceof Element &&
      Boolean(target.closest("button, a, input, .win, .dock, .menubar, .photo-widget"));

    const onPointerMove = (event: PointerEvent) => {
      if (phaseRef.current !== "orbit") return;
      const box = root.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;
      root.style.setProperty("--pointer-x", `${x * 100}%`);
      root.style.setProperty("--pointer-y", `${y * 100}%`);
      root.closest(".desk")?.classList.toggle(
        "is-planet-hover",
        pointOnPlanet(event.clientX, event.clientY) && !blockedByInterface(event.target),
      );
      if (reduced) return;
      targetX = (x - 0.5) * 2;
      targetY = (y - 0.5) * 2;
      schedulePointer();
    };

    const onPointerLeave = () => {
      root.closest(".desk")?.classList.remove("is-planet-hover");
      if (reduced) return;
      targetX = 0;
      targetY = 0;
      schedulePointer();
    };

    const onClick = (event: MouseEvent) => {
      if (phaseRef.current === "pulsar") {
        const box = root.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);
        if (Math.hypot(dx, dy) < Math.min(box.width, box.height) * 0.22) restore();
        return;
      }
      if (
        phaseRef.current === "orbit" &&
        !blockedByInterface(event.target) &&
        pointOnPlanet(event.clientX, event.clientY)
      ) {
        triggerPlanet();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || phaseRef.current === "orbit") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      restore();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      cancelAnimationFrame(frame);
      root.closest(".desk")?.classList.remove("is-planet-hover");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [restore, triggerPlanet]);

  useEffect(
    () => () => {
      for (const id of timersRef.current) window.clearTimeout(id);
      stopPulsarHum();
    },
    [],
  );

  return (
    <div
      ref={rootRef}
      className={`orbital-sky phase-${phase} warning-${clicks} impact-${impact}`}
      aria-hidden="true"
    >
      <div className="orbit-stars orbit-layer" />
      <div className="orbit-nebula orbit-layer" />
      <div ref={planetRef} className="orbit-planet orbit-layer">
        <span className="planet-clouds" />
        <span className="planet-atmosphere" />
        <span className="planet-anomaly" />
        <span className="planet-neutron-surface" />
      </div>
      <div className="orbit-pointer-light" />

      <svg className="pulsar-filters" aria-hidden="true">
        <defs>
          <filter id="pulsar-turbulence" x="-35%" y="-35%" width="170%" height="170%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008 0.016"
              numOctaves="2"
              seed="19"
              result="plasmaNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="plasmaNoise"
              scale="24"
              xChannelSelector="R"
              yChannelSelector="B"
            />
          </filter>
        </defs>
      </svg>

      <div className="pulsar-scene">
        <div className="pulsar-beams">
          <span className="pulsar-beam beam-north" />
          <span className="pulsar-beam beam-south" />
        </div>
        <div className="pulsar-plasma">
          <i />
          <i />
          <i />
        </div>
        <div className="pulsar-torus" />
        <div className="pulsar-wisp wisp-a" />
        <div className="pulsar-wisp wisp-b" />
      </div>

      <div className="pulsar-exit">click the pulsar or press esc to restore workspace</div>
    </div>
  );
}
