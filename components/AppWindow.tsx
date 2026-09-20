"use client";

import { useEffect, useRef, useState } from "react";
import { viewTitles } from "@/content/commands";
import { View } from "./views/Views";
import ResizeHandles from "./ResizeHandles";
import type { RepoStats, ViewKey } from "@/lib/types";

interface Props {
  view: ViewKey;
  repoStats: RepoStats;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
}

export default function AppWindow({ view, repoStats, isActive, onFocus, onClose }: Props) {
  const [zoomed, setZoomed] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  /* A new view reuses the window, so reset the scroll and replay the open animation. */
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    const el = ref.current;
    if (!el) return;
    el.classList.remove("is-opening");
    void el.offsetWidth; // force reflow so the animation restarts
    el.classList.add("is-opening");
  }, [view]);

  /* Esc closes the focused window. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const zoom = () => {
    const el = ref.current;
    if (!el || window.innerWidth <= 860) return;
    if (zoomed) {
      el.style.width = "";
      el.style.height = "";
      el.style.left = "";
      el.style.top = "";
      el.style.right = "";
    } else {
      const stage = el.parentElement;
      if (!stage) return;
      const stageBox = stage.getBoundingClientRect();
      const dockBox = document.querySelector<HTMLElement>(".dock")?.getBoundingClientRect();
      const usableBottom = dockBox
        ? Math.min(stageBox.height, dockBox.top - stageBox.top)
        : stageBox.height;
      el.style.left = "12px";
      el.style.top = "12px";
      el.style.right = "auto";
      el.style.width = `${stage.clientWidth - 24}px`;
      el.style.height = `${usableBottom - 24}px`;
    }
    setZoomed(!zoomed);
  };

  return (
    <section
      ref={ref}
      className={`win appwin${isActive ? " is-active" : ""}`}
      role="dialog"
      aria-labelledby="appwin-title"
      onMouseDown={onFocus}
    >
      <ResizeHandles />
      <div className="titlebar" data-drag>
        <div className="lights">
          <button className="light red" type="button" aria-label="Close window" onClick={onClose} />
          <button
            className="light yellow"
            type="button"
            aria-label="Minimize window"
            onClick={onClose}
          />
          <button className="light green" type="button" aria-label="Zoom window" onClick={zoom} />
        </div>
        <span className="title" id="appwin-title">
          {viewTitles[view]}
        </span>
      </div>

      <div className="app-body" ref={bodyRef}>
        <View view={view} repoStats={repoStats} />
      </div>
    </section>
  );
}
