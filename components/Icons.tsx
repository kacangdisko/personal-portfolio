import type { ViewKey } from "@/lib/types";
import type { JSX } from "react";

/** Single-stroke glyphs, sized and coloured by CSS in .dock-btn svg. */
export const icons: Record<ViewKey, JSX.Element> = {
  about: (
    <>
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
      <path d="M4 20a8 8 0 0116 0" />
    </>
  ),
  projects: (
    <>
      <path d="M3 7l9-4 9 4-9 4-9-4z" />
      <path d="M3 12l9 4 9-4" />
      <path d="M3 17l9 4 9-4" />
    </>
  ),
  research: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.5-4.5" />
    </>
  ),
  experience: (
    <>
      <circle cx="12" cy="6" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
      <path d="M12 8.5v7" />
      <path d="M12 12h5a2 2 0 002-2V8" />
    </>
  ),
  stack: (
    <>
      <path d="M8 8l-4 4 4 4" />
      <path d="M16 8l4 4-4 4" />
      <path d="M13.5 5l-3 14" />
    </>
  ),
  contact: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </>
  ),
  resume: (
    <>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 114 2c-.8.6-1.5 1.1-1.5 2.2" />
      <path d="M12 17.5h.01" />
    </>
  ),
};
