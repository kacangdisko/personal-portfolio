"use client";

import { useEffect, useState } from "react";
import { commands, dockOrder, viewTitles } from "@/content/commands";
import { icons } from "./Icons";
import type { ViewKey } from "@/lib/types";

interface Props {
  onSelect: (view: ViewKey) => void;
}

/** Every section's one-line description, keyed by view — reuses the same
    copy the terminal's `help` table shows, so the two never drift. */
const descriptions = {} as Record<ViewKey, string>;
for (const c of commands) {
  if (c.view) descriptions[c.view] = c.desc;
}

/**
 * Mobile's stand-in for the dock: a single reachable "Menu" button fixed to
 * the bottom of the screen, which opens a full list of every section as a
 * sheet. A grid of eight small icons doesn't hold up at phone width — this
 * keeps everything just as reachable without cramming the hierarchy down.
 */
export default function MobileNav({ onSelect }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open]);

  const pick = (view: ViewKey) => {
    setOpen(false);
    onSelect(view);
  };

  return (
    <>
      <nav className="mnav-bar" aria-label="Menu">
        <button
          type="button"
          className="mnav-trigger"
          onClick={() => setOpen(true)}
          aria-haspopup="true"
          aria-expanded={open}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
          Menu
        </button>
      </nav>

      {open && (
        <div className="mnav-overlay" onClick={() => setOpen(false)}>
          <div className="mnav-sheet" role="menu" aria-label="Sections" onClick={(e) => e.stopPropagation()}>
            <div className="mnav-sheet-handle" aria-hidden="true" />
            <div className="mnav-sheet-head">
              <span>Menu</span>
              <button
                type="button"
                className="mnav-close"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mnav-list">
              {dockOrder.map((key) => (
                <button
                  key={key}
                  type="button"
                  role="menuitem"
                  className="mnav-item"
                  onClick={() => pick(key)}
                >
                  <span className="mnav-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      {icons[key]}
                    </svg>
                  </span>
                  <span className="mnav-text">
                    <span className="mnav-label">{viewTitles[key]}</span>
                    {descriptions[key] && <span className="mnav-desc">{descriptions[key]}</span>}
                  </span>
                  <svg
                    className="mnav-chevron"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    aria-hidden="true"
                  >
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
