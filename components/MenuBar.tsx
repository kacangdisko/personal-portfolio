"use client";

import { useEffect, useState } from "react";
import { isSfxMuted, setSfxMuted } from "@/lib/sfx";

export default function MenuBar() {
  const [clock, setClock] = useState("");
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(
        `${d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}  ` +
          d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      );
    };
    tick();
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, []);

  /* The stored preference only exists client-side, so it is read after mount
     rather than at initial render, the same way the clock avoids a hydration
     mismatch. */
  useEffect(() => setMuted(isSfxMuted()), []);

  const toggleMuted = () => {
    const next = !muted;
    setSfxMuted(next);
    setMuted(next);
  };

  return (
    <header className="menubar">
      <span className="mb-name">Dzaky&rsquo;s Space</span>
      <span className="mb-spacer" />
      <button
        type="button"
        className="mb-sfx"
        onClick={toggleMuted}
        aria-pressed={muted}
        aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
        title={muted ? "Sound off" : "Sound on"}
      >
        {muted ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 9v6h4l5 4V5L8 9H4z" strokeLinejoin="round" />
            <path d="M16.5 9.5l4 4M20.5 9.5l-4 4" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 9v6h4l5 4V5L8 9H4z" strokeLinejoin="round" />
            <path d="M16.2 8.8a4.5 4.5 0 010 6.4" strokeLinecap="round" />
            <path d="M18.6 6.4a8 8 0 010 11.2" strokeLinecap="round" />
          </svg>
        )}
      </button>
      <span className="mb-clock" suppressHydrationWarning>
        {clock || "—"}
      </span>
    </header>
  );
}
