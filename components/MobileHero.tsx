"use client";

import type { JSX } from "react";
import { profile } from "@/content/profile";
import { experience } from "@/content/experience";
import type { ViewKey } from "@/lib/types";

interface Props {
  onOpen: (view: ViewKey) => void;
}

/** experience[0] is the most recent role (same ordering the Experience view
    itself relies on). The org string is "Short — Long form"; only the short
    form fits a one-line status. */
const current = experience[0];
const currentOrg = current?.org.split("—")[0].trim();

/** Small single-stroke glyphs, in the same visual language as Icons.tsx —
    generic rather than exact brand marks, since the visible label next to
    each one already does the identifying. */
const socialIcons: Record<string, JSX.Element> = {
  Email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </>
  ),
  GitHub: (
    <>
      <path d="M9 8l-4 4 4 4" />
      <path d="M15 8l4 4-4 4" />
    </>
  ),
  LinkedIn: (
    <>
      <circle cx="5" cy="19" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="5" r="1.6" />
      <path d="M6.3 17.7l4.3-4.3M13.4 10.6l4.3-4.3" />
    </>
  ),
};

/**
 * Mobile's landing content: name and tagline (unchanged), plus a few things
 * a visitor on a phone would otherwise have to dig for — a present-tense
 * sense of what you're doing right now (the status line), the two most
 * likely next actions (the buttons), and a way to reach out without
 * opening the Contact section first (the row of links below, pulled
 * straight from profile.links).
 */
export default function MobileHero({ onOpen }: Props) {
  return (
    <div className="mobile-hero">
      <div className="mobile-hero-name">{profile.name}</div>
      <div className="mobile-hero-tagline">{profile.tagline}</div>

      {current && (
        <button
          type="button"
          className="mobile-hero-status"
          onClick={() => onOpen("experience")}
        >
          <span className="mobile-status-dot" aria-hidden="true" />
          <span>
            Currently <strong>{current.role}</strong>
            {currentOrg ? ` at ${currentOrg}` : ""}
          </span>
        </button>
      )}

      <div className="mobile-hero-actions">
        <button type="button" className="btn primary" onClick={() => onOpen("projects")}>
          View Projects
        </button>
        <button type="button" className="btn" onClick={() => onOpen("resume")}>
          Resume
        </button>
      </div>

      <div className="mobile-hero-social">
        {profile.links.map((l) => (
          <a
            key={l.href}
            className="mobile-social-btn"
            href={l.href}
            aria-label={l.label}
            {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {socialIcons[l.label] ?? <circle cx="12" cy="12" r="8" />}
            </svg>
            <span>{l.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
