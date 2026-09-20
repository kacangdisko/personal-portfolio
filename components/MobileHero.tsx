"use client";

import type { JSX } from "react";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { research } from "@/content/research";
import { experience } from "@/content/experience";
import type { ViewKey } from "@/lib/types";

interface Props {
  onOpen: (view: ViewKey) => void;
}

/** Counted from the real content, so these never go stale as things are
    added — no hand-maintained numbers to forget to update. */
const stats: { n: number; label: string }[] = [
  { n: projects.length, label: projects.length === 1 ? "Project" : "Projects" },
  { n: research.length, label: research.length === 1 ? "Paper" : "Papers" },
  { n: experience.length, label: experience.length === 1 ? "Role" : "Roles" },
];

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
 * Mobile's landing content: name and tagline (unchanged), plus three things
 * a visitor on a phone would otherwise have to dig for — a sense of scale
 * (the stat chips), the two most likely next actions (the buttons), and a
 * way to reach out without opening the Contact section first (the row of
 * links below, pulled straight from profile.links).
 */
export default function MobileHero({ onOpen }: Props) {
  return (
    <div className="mobile-hero">
      <div className="mobile-hero-name">{profile.name}</div>
      <div className="mobile-hero-tagline">{profile.tagline}</div>

      <div className="mobile-hero-stats">
        {stats.map((s) => (
          <div className="mobile-stat" key={s.label}>
            <span className="mobile-stat-num">{s.n}</span>
            <span className="mobile-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

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
