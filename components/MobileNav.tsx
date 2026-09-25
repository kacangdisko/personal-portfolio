"use client";

import { mobileOrder, viewTitles } from "@/content/commands";
import { projects } from "@/content/projects";
import { research } from "@/content/research";
import { experience, stack } from "@/content/experience";
import type { ViewKey } from "@/lib/types";

interface Props {
  onSelect: (view: ViewKey) => void;
}

/** Short, lowercase one-liners for the index — terser than the terminal's
    `help` descriptions, which stay as they are on desktop. */
const blurbs: Record<ViewKey, string> = {
  about: "who I am, what I study",
  projects: "things I built",
  research: "conference papers",
  experience: "roles & activities",
  stack: "languages & tools",
  contact: "where to find me",
  resume: "full formal version",
  help: "every command",
};

/** How many things each section holds, read from the content files so the
    numbers stay right as entries are added. Sections without a natural
    count show none. Spoken languages aren't counted as tools. */
const counts: Partial<Record<ViewKey, number>> = {
  projects: projects.length,
  research: research.length,
  experience: experience.length,
  stack: stack
    .filter((g) => g.display !== "text")
    .reduce((sum, g) => sum + g.items.length, 0),
};

/**
 * Mobile's replacement for the dock: an editorial index of every section in
 * large type, each with its item count and a one-line summary. Tapping a row
 * opens the same full-screen window the dock does on desktop.
 */
export default function MobileNav({ onSelect }: Props) {
  return (
    <nav className="mobile-sections" aria-label="Sections">
      <div className="eyebrow">find out more!</div>
      <ul className="mobile-index">
        {mobileOrder.map((key) => {
          const count = counts[key];
          return (
            <li key={key}>
              <button type="button" className="mobile-index-row" onClick={() => onSelect(key)}>
                <span className="mobile-index-text">
                  <span className="mobile-index-name">
                    {viewTitles[key]}
                    {count !== undefined && (
                      <sup className="mobile-index-count">
                        ({String(count).padStart(2, "0")})
                      </sup>
                    )}
                  </span>
                  <span className="mobile-index-desc">{blurbs[key]}</span>
                </span>
                <svg
                  className="mobile-index-arrow"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
