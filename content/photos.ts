export interface Photo {
  /** Path under /public. Null renders a labelled placeholder instead. */
  src: string | null;
  alt: string;
  caption: string;
}

/**
 * The desktop photo widget.
 *
 * Any number of entries works — the widget adapts. Keep them landscape; the
 * frame is a fixed 16:9 and images are cropped to fill it.
 */
export const photos: Photo[] = [
  {
    src: "/images/photos/komsat.jpg",
    alt: "Core HIMTI Education division team.",
    caption: "HIMTI Education Commission Team",
  },
  {
    src: "/images/photos/hilet.JPG",
    alt: "Engaging with aspiring activist as a vice chairman",
    caption: "HIMTI Leadership Training",
  },
  {
    src: "/images/photos/garena.JPG",
    alt: "Group photo of STDN team and DPI at Garena.",
    caption: "HISHOT 2025 | STDN",
  },
  {
    src: "/images/photos/fl.jpg",
    alt: "Full team of ABN05 batch.",
    caption: "Freshmen Leader - ABN05",
  },
  {
    src: "/images/photos/fp.jpeg",
    alt: "Me and my freshmen.",
    caption: "Freshmen Partner",
  },
  {
    src: "/images/photos/icpc.jpg",
    alt: "Volunteering at the ICPC Asia Jakarta 2025 contest.",
    caption: "ICPC Asia Jakarta 2025",
  },
];

/** Milliseconds each photo is held before the widget advances. */
export const PHOTO_INTERVAL = 5000;
