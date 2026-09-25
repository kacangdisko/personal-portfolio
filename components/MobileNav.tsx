"use client";

import { commands, mobileOrder, viewTitles } from "@/content/commands";
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

const mobileSections = mobileOrder;

/**
 * Mobile's replacement for the dock: every section laid out as a plain
 * scrollable list on the home screen itself, rather than tucked behind a
 * menu button a visitor has to discover first. Tapping a row still opens
 * the same full-screen window the dock does on desktop.
 */
export default function MobileNav({ onSelect }: Props) {
  return (
    <div className="mobile-sections">
      <div className="eyebrow">Find out more!</div>
      <div className="mobile-sections-list">
        {mobileSections.map((key) => (
          <button
            key={key}
            type="button"
            className="mobile-section-item"
            onClick={() => onSelect(key)}
          >
            <span className="mobile-section-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {icons[key]}
              </svg>
            </span>
            <span className="mobile-section-text">
              <span className="mobile-section-label">{viewTitles[key]}</span>
              {descriptions[key] && (
                <span className="mobile-section-desc">{descriptions[key]}</span>
              )}
            </span>
            <svg
              className="mobile-section-chevron"
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
  );
}
