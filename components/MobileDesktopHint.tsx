"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "dz-seen-desktop-hint";

/**
 * A one-time nudge shown the first time someone lands on the mobile layout,
 * pointing them to the full desktop experience (the terminal, the floating
 * windows) that a phone can't really show. Dismissing it writes to
 * localStorage so it never appears again on that device; if storage is
 * unavailable (private browsing, blocked, etc.) it just shows once per
 * visit instead of not at all — never blocks reading the site either way.
 */
export default function MobileDesktopHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Storage unavailable — nothing to persist, the hint just won't repeat this visit.
    }
  };

  if (!visible) return null;

  return (
    <div
      className="desktop-hint-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="desktop-hint-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div className="desktop-hint-card">
        <span className="desktop-hint-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="2.5" y="4.5" width="19" height="12" rx="1.6" />
            <path d="M8 20.5h8M12 16.5v4" strokeLinecap="round" />
          </svg>
        </span>
        <div id="desktop-hint-title" className="desktop-hint-title">
          Best viewed on desktop
        </div>
        <p className="desktop-hint-body">
          This site is built around a terminal and floating windows you can drag and resize — an
          experience made for a bigger screen. You&rsquo;re seeing a streamlined mobile version instead.
          For the full experience, come back on a desktop or laptop.
        </p>
        <button type="button" className="btn primary desktop-hint-btn" onClick={dismiss}>
          Continue on mobile
        </button>
      </div>
    </div>
  );
}
