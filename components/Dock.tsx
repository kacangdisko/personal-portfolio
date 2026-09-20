"use client";

import { dockOrder, viewTitles } from "@/content/commands";
import { icons } from "./Icons";
import type { ViewKey } from "@/lib/types";

interface Props {
  activeView: ViewKey | null;
  onSelect: (view: ViewKey) => void;
}

export default function Dock({ activeView, onSelect }: Props) {
  return (
    <nav className="dock" aria-label="Applications">
      {dockOrder.map((key, i) => (
        <span key={key} style={{ display: "contents" }}>
          {i === dockOrder.length - 1 && <span className="dock-sep" aria-hidden="true" />}
          <button
            type="button"
            className="dock-btn"
            aria-label={viewTitles[key]}
            aria-current={activeView === key}
            onClick={() => onSelect(key)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {icons[key]}
            </svg>
            <span className="tip">{viewTitles[key]}</span>
            <span className="dock-label">{viewTitles[key]}</span>
            <span className="dot" aria-hidden="true" />
          </button>
        </span>
      ))}
    </nav>
  );
}
