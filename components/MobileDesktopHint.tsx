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
        <div id="desktop-hint-title" className="desktop-hint-title">
          Wait a minute!
        </div>
        <p className="desktop-hint-body">
          For the full experience, I recommend to open this web on a desktop.
        </p>
        <p className="desktop-hint-helper">Tap outside to close</p>
      </div>
    </div>
  );
}
