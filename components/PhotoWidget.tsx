"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { photos, PHOTO_INTERVAL } from "@/content/photos";

/* Widget geometry. The frame is a fixed 16:9, like a real macOS widget —
   it never resizes, it only moves between slots. */
const W = 352;
const H = Math.round((W * 9) / 16); // 198
const GAP = 20;
const PAD = 24;
const MOBILE = 860;

interface Slot {
  col: number;
  row: number;
}

export default function PhotoWidget() {
  const [index, setIndex] = useState(0);
  /* Starts in the top-left slot. */
  const [slot, setSlot] = useState<Slot>({ col: 0, row: 0 });
  const [grid, setGrid] = useState({ cols: 1, rows: 1 });
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [hovering, setHovering] = useState(false);

  const ref = useRef<HTMLElement>(null);

  /* ── Work out how many slots fit, and keep the widget inside them ── */
  const measure = useCallback(() => {
    const stage = ref.current?.parentElement;
    if (!stage) return;
    const cols = Math.max(1, Math.floor((stage.clientWidth - PAD * 2 + GAP) / (W + GAP)));
    const rows = Math.max(1, Math.floor((stage.clientHeight - PAD * 2 + GAP) / (H + GAP)));
    setGrid({ cols, rows });
    setSlot((s) => ({
      col: Math.min(s.col, cols - 1),
      row: Math.min(s.row, rows - 1),
    }));
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  /* ── Slideshow. Paused while dragging or while the pointer is over it, so
        a visitor reading a caption is never interrupted. ── */
  useEffect(() => {
    if (photos.length < 2 || drag || hovering) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % photos.length), PHOTO_INTERVAL);
    return () => clearInterval(id);
  }, [drag, hovering]);

  /* ── Dragging, with a snap to the nearest slot on release ── */
  const onPointerDown = (e: React.PointerEvent) => {
    if (window.innerWidth <= MOBILE || e.button !== 0) return;

    const el = ref.current;
    const stage = el?.parentElement;
    if (!el || !stage) return;

    const stageBox = stage.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    const offX = e.clientX - box.left;
    const offY = e.clientY - box.top;

    const move = (ev: PointerEvent) => {
      setDrag({
        x: Math.max(0, Math.min(ev.clientX - stageBox.left - offX, stageBox.width - W)),
        y: Math.max(0, Math.min(ev.clientY - stageBox.top - offY, stageBox.height - H)),
      });
    };

    const up = (ev: PointerEvent) => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);

      // Snap: round the dropped position to the nearest slot centre.
      const x = ev.clientX - stageBox.left - offX;
      const y = ev.clientY - stageBox.top - offY;
      setSlot({
        col: Math.max(0, Math.min(Math.round((x - PAD) / (W + GAP)), grid.cols - 1)),
        row: Math.max(0, Math.min(Math.round((y - PAD) / (H + GAP)), grid.rows - 1)),
      });
      setDrag(null);
      document.body.style.userSelect = "";
    };

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
    document.body.style.userSelect = "none";
    e.preventDefault();
  };

  const left = drag ? drag.x : PAD + slot.col * (W + GAP);
  const top = drag ? drag.y : PAD + slot.row * (H + GAP);

  const current = photos[index];

  /* The snap grid is invisible: the widget simply settles into the nearest
     slot when released, with no outlines drawn during the drag. */
  return (
    <section
      ref={ref}
      className={`photo-widget${drag ? " is-dragging" : ""}`}
      style={{ left, top, width: W, height: H }}
      onPointerDown={onPointerDown}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      aria-label="Photos"
    >
      {photos.map((p, i) => (
        <div
          key={p.caption}
          className={`slide${i === index ? " is-current" : ""}`}
          aria-hidden={i !== index}
        >
          {p.src ? (
            <Image src={p.src} alt={p.alt} fill sizes="352px" quality={92} />
          ) : (
            <div className={`slide-placeholder tone-${i % 4}`}>
              <span>photo {i + 1}</span>
            </div>
          )}
        </div>
      ))}

      <div className="widget-caption">{current.caption}</div>
  </section>
  );
}
