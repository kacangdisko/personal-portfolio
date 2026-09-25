"use client";

import { useEffect, useRef, useState } from "react";
import { mobileOrder, viewTitles } from "@/content/commands";
import { View } from "./views/Views";
import ResizeHandles from "./ResizeHandles";
import type { RepoStats, ViewKey } from "@/lib/types";

interface Props {
  view: ViewKey;
  repoStats: RepoStats;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  /** Opens another section in this window — used by the mobile "Next" link. */
  onNavigate: (view: ViewKey) => void;
}

export default function AppWindow({
  view,
  repoStats,
  isActive,
  onFocus,
  onClose,
  onNavigate,
}: Props) {
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

  /* Mobile reads section to section, in the same order as the home list;
     the last one leads back home. Views outside that order (the terminal's
     Commands table) get no link. */
  const orderIndex = mobileOrder.indexOf(view);
  const nextView = orderIndex === -1 ? null : (mobileOrder[orderIndex + 1] ?? null);

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
        {/* Mobile stand-in for the traffic lights: hidden on desktop (see
            .mobile-return in globals.css), shown in their place under the
            860px breakpoint. The lights' small click target and unlabelled
            macOS convention don't carry over to a phone. */}
        <button type="button" className="mobile-return" onClick={onClose}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <span className="title" id="appwin-title">
          {viewTitles[view]}
        </span>
      </div>

      <div className="app-body" ref={bodyRef}>
        <View view={view} repoStats={repoStats} />

        {/* Hidden on desktop (see .mobile-next in globals.css). */}
        {orderIndex !== -1 && (
          <button
            type="button"
            className="mobile-next"
            onClick={() => (nextView ? onNavigate(nextView) : onClose())}
          >
            <span className="mobile-next-text">
              <span className="mobile-next-label">{nextView ? "Next" : "That's everything"}</span>
              <span className="mobile-next-title">
                {nextView ? viewTitles[nextView] : "Back to home"}
              </span>
            </span>
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
