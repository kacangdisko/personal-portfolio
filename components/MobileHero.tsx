"use client";

import type { JSX } from "react";
import { profile } from "@/content/profile";
import type { ViewKey } from "@/lib/types";

interface Props {
  onOpen: (view: ViewKey) => void;
}

/** Small single-stroke glyphs, in the same visual language as Icons.tsx,
    for links without a brand mark (see brandLogos below). */
const socialIcons: Record<string, JSX.Element> = {
  Email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </>
  ),
};

/** Official brand marks (white versions, in /public/icons) for the services
    that have one. Mobile only — the desktop Contact window keeps its own
    look. Anything not listed here falls back to a line glyph above. */
const brandLogos: Record<string, string> = {
  GitHub: "/icons/github.svg",
  LinkedIn: "/icons/linkedin.png",
};

/**
 * Mobile's landing content: name and tagline (unchanged), plus the two most
 * likely next actions (the buttons) and a way to reach out without opening
 * the Contact section first (the row of links below, pulled straight from
 * profile.links).
 */
const [firstName, ...others] = profile.name.split(" ");
const restOfName = others.join(" ");

export default function MobileHero({ onOpen }: Props) {
  return (
    <div className="mobile-hero">
      {/* First name on its own line, the rest below in a softer tone. A
          light sweeps across both every few seconds (see .name-shine). */}
      <h1 className="mobile-hero-name">
        <span className="name-shine name-first">{firstName}</span>
        {restOfName && <span className="name-shine name-rest">{restOfName}</span>}
      </h1>
      <div className="mobile-hero-tagline">{profile.tagline}</div>

      <div className="mobile-hero-actions">
        {/* Styled as terminal commands — a nod to the desktop's terminal,
            which phones don't get. The aria-labels keep the plain names for
            screen readers; the blinking cursor marks the main action. */}
        <button
          type="button"
          className="term-btn term-btn-mint"
          aria-label="View Projects"
          onClick={() => onOpen("projects")}
        >
          <span className="term-prompt" aria-hidden="true">
            &gt;
          </span>
          view projects
          <span className="term-cursor" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="term-btn term-btn-amber"
          aria-label="Resume"
          onClick={() => onOpen("resume")}
        >
          <span className="term-prompt" aria-hidden="true">
            &gt;
          </span>
          view resume
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
            {brandLogos[l.label] ? (
              // A tiny static icon; next/image's optimizer adds nothing here.
              // eslint-disable-next-line @next/next/no-img-element
              <img className="mobile-social-logo" src={brandLogos[l.label]} alt="" />
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {socialIcons[l.label] ?? <circle cx="12" cy="12" r="8" />}
              </svg>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
