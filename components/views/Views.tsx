import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ResumeViewer from "@/components/ResumeViewer";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { research } from "@/content/research";
import { experience, stack, certifications } from "@/content/experience";
import { commands } from "@/content/commands";
import { formatUpdated } from "@/lib/github";
import type { RepoStats, ViewKey } from "@/lib/types";

/* ═══════════ shared bits ═══════════ */

function Tags({ items }: { items: string[] }) {
  return (
    <div className="tags">
      {items.map((t) => (
        <span className="tag" key={t}>
          {t}
        </span>
      ))}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="bullets">
      {items.map((b) => (
        <li key={b}>{b}</li>
      ))}
    </ul>
  );
}

/** Renders the screenshot, or a labelled well naming the file it expects.
    Click opens it full-size in a viewport-covering lightbox, since a
    dense screenshot can be too small to read at column width. */
function Shot({ src, alt, slug }: { src: string | null; alt: string; slug: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Capture phase, ahead of AppWindow's own bubble-phase Escape
      // listener, and stopped here — otherwise the same keypress closes
      // the lightbox *and* the window behind it.
      e.stopPropagation();
      setOpen(false);
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open]);

  if (!src) {
    return <div className="shot placeholder">drop /public/images/projects/{slug}.png</div>;
  }

  return (
    <>
      <button
        type="button"
        className="shot shot-zoomable"
        onClick={() => setOpen(true)}
        aria-label={`View larger: ${alt}`}
      >
        <Image src={src} alt={alt} fill sizes="(max-width: 860px) 100vw, 50vw" />
        <span className="shot-zoom-hint" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
            <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M15.5 15.5 21 21"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M10.5 8v5M8 10.5h5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="shot-lightbox" onClick={() => setOpen(false)}>
            <button
              type="button"
              className="shot-lightbox-close"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path
                  d="M6 6l12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element -- full-res
                original, deliberately bypassing the optimizer's crop/scale */}
            <img
              src={src}
              alt={alt}
              className="shot-lightbox-img"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body,
        )}
    </>
  );
}

/* ═══════════ About ═══════════ */

function About() {
  return (
    <>
      <div className="eyebrow">About</div>
      <h2>{profile.name}</h2>
      <p className="lede">{profile.tagline}</p>
      <hr className="rule" />

      <div className="about-split">
        <div>
          {profile.bio.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>

        <div className="about-aside">
          <div className="eyebrow">Education</div>
          {profile.education.map((e) => (
            <div className="edu" key={e.school}>
              <div>
                <div className="edu-school">{e.school}</div>
                <div className="edu-cred">{e.credential}</div>
                {e.detail && <div className="edu-detail">{e.detail}</div>}
              </div>
              <div className="edu-period">
                {e.period}
                <br />
                {e.location}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ═══════════ Projects ═══════════ */

function Projects({ repoStats }: { repoStats: RepoStats }) {
  return (
    <>
      <div className="eyebrow">Projects · {projects.length}</div>
      <h2>Things I built</h2>
      <p>Each of these started as a problem someone actually had.</p>
      <hr className="rule" />

      {projects.map((p) => {
        const gh = p.githubRepo ? repoStats[p.githubRepo] : undefined;
        const updated = formatUpdated(gh?.updated ?? null);

        return (
          <article className="entry" key={p.slug}>
            <div className="entry-head">
              <div>
                <h3>{p.title}</h3>
                <div className="entry-role">{p.role}</div>
                <div className="entry-team">{p.team}</div>
              </div>
              <div className="entry-period">{p.period}</div>
            </div>

            <div className="entry-split with-media">
              <Shot src={p.image} alt={p.imageAlt} slug={p.slug} />
              <div className="entry-text">
                <p>{p.body}</p>
                <Bullets items={p.highlights} />
              </div>
            </div>

            <Tags items={p.stack} />

            {(gh || p.links.length > 0) && (
              <div className="ghline">
                {p.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label} ↗
                  </a>
                ))}
                {gh?.language && <span>{gh.language}</span>}
                {gh && gh.stars > 0 && <span>★ {gh.stars}</span>}
                {updated && <span>{updated}</span>}
              </div>
            )}
          </article>
        );
      })}
    </>
  );
}

/* ═══════════ Research ═══════════ */

function Research() {
  return (
    <>
      <div className="eyebrow">Research · {research.length}</div>
      <h2>Two papers that teach me some lessons</h2>
      <p>
        Starting off with curiosity, turns out it drags me deeper into this formal scientific
        experiment.
      </p>
      <hr className="rule" />

      {research.map((r) => (
        <article className="entry" key={r.slug}>
          <div className="entry-head">
            <h3 className="research-title">{r.title}</h3>
            <span className={`status ${r.status}`}>{r.statusLabel}</span>
          </div>

          <div className="meta">
            <span>
              <b>{r.venue}</b>
            </span>
            <span>{r.authorship}</span>
            <span>{r.team}</span>
          </div>

          <div className="entry-split">
            <p>{r.body}</p>
            <div className="entry-text">
              <Bullets items={r.highlights} />
            </div>
          </div>

          {r.links.length > 0 && (
            <div className="ghline">
              {r.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
        </article>
      ))}
    </>
  );
}

/* ═══════════ Experience ═══════════ */

function Experience() {
  return (
    <>
      <div className="eyebrow">Organisational experience</div>
      <h2>Where I&rsquo;ve been</h2>
      <p>Four roles across HIMTI and Bina Nusantara</p>
      <hr className="rule" />

      <div className="timeline">
        {experience.map((e) => (
          <div className="tl-item" key={e.id}>
            <div className="tl-track" aria-hidden="true" />
            <div className="tl-content">
              <div className="tl-head">
                <h3>{e.role}</h3>
                <span className="tl-period">{e.period}</span>
              </div>
              <div className="tl-org">{e.org}</div>
              {e.notes.map((n) => (
                <p className="tl-note" key={n.slice(0, 24)}>
                  {n}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <hr className="rule" />
      <div className="eyebrow">Certifications and volunteering</div>
      <div className="certlist">
        {certifications.map((c) => (
          <div className="cert" key={c.title}>
            <div>
              <div>{c.title}</div>
              <div className="cert-issuer">{c.issuer}</div>
            </div>
            <div className="cert-date">{c.date}</div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════ Stack ═══════════ */

function Stack() {
  return (
    <>
      <div className="eyebrow">Tech stack</div>
      <h2>What I reach for</h2>
      <p>Ordered by how often I actually use them.</p>
      <hr className="rule" />

      <div className="stack-grid">
        {stack.map((g) => (
          <div className="stackgrp" key={g.group}>
            <h3>{g.group}</h3>
            <Tags items={g.items} />
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════ Contact ═══════════ */

function Contact() {
  return (
    <>
      <div className="eyebrow">Contact</div>
      <h2>Get in touch</h2>
      <p>Easily click and meet me there!</p>
      <hr className="rule" />
      {profile.links.map((l) => (
        <a
          className="contact-link"
          key={l.href}
          href={l.href}
          {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          <span>{l.label}</span>
          <span className="contact-value">
            {l.value} {l.external ? "↗" : ""}
          </span>
        </a>
      ))}
    </>
  );
}

/* ═══════════ Resume ═══════════ */

function Resume() {
  const [pageCount, setPageCount] = useState<number | null>(null);

  return (
    <>
      <div className="resume-bar">
        <div>
          <div className="eyebrow" style={{ margin: 0 }}>
            Resume
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>
            resume.pdf
            {pageCount !== null ? ` · ${pageCount} page${pageCount === 1 ? "" : "s"}` : ""}
          </div>
        </div>
        <a className="btn primary" href="/resume.pdf" download>
          Download PDF
        </a>
      </div>

      <ResumeViewer src="/resume.pdf" onLoaded={setPageCount} />
    </>
  );
}

/* ═══════════ Help ═══════════ */

function Help() {
  return (
    <>
      <div className="eyebrow">Reference</div>
      <h2>Every command</h2>
      <p>
        Type any of these, or click an icon in the dock. Tab completes, ↑ and ↓ walk your
        history. There are a few more that are not on this list.
      </p>
      <hr className="rule" />
      <table className="cmdtable">
        <tbody>
          {commands.map((c) => (
            <tr key={c.name}>
              <td>
                <code>{c.name}</code>
              </td>
              <td>
                {c.desc}
                {c.aliases.length > 0 && (
                  <div className="alias">aliases: {c.aliases.join(", ")}</div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

/* ═══════════ dispatch ═══════════ */

export function View({ view, repoStats }: { view: ViewKey; repoStats: RepoStats }) {
  switch (view) {
    case "about":
      return <About />;
    case "projects":
      return <Projects repoStats={repoStats} />;
    case "research":
      return <Research />;
    case "experience":
      return <Experience />;
    case "stack":
      return <Stack />;
    case "contact":
      return <Contact />;
    case "resume":
      return <Resume />;
    case "help":
      return <Help />;
  }
}
