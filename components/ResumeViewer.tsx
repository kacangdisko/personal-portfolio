"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

/**
 * Renders every page of /resume.pdf as a stacked, continuously-scrollable
 * strip of canvases — no native browser PDF chrome (toolbar, thumbnail
 * sidebar, page-jump controls). Pages are oversampled well past screen
 * density and re-rendered whenever the window is resized, so the result
 * stays crisp instead of stretching a fixed-resolution raster.
 */
export default function ResumeViewer({
  src,
  onLoaded,
}: {
  src: string;
  onLoaded?: (pageCount: number) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let doc: PDFDocumentProxy | null = null;
    let renderToken = 0;
    let lastRenderedWidth = 0;
    let debounce: ReturnType<typeof setTimeout> | null = null;

    // Oversample generously: at least 2x, and scale up further on hi-dpi
    // displays, so text stays sharp even if the window is later resized
    // larger or the page is pinch-zoomed.
    const pixelDensity = () => Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);

    async function renderPages() {
      if (!doc || !host) return;
      const myToken = ++renderToken;
      const dpr = pixelDensity();
      const targetWidth = host.clientWidth || 720;
      // Recorded at the moment we commit to this width, not when the
      // observer was attached — so a resize that happens mid-load still
      // gets picked up by the very next render rather than being masked
      // by a stale baseline.
      lastRenderedWidth = targetWidth;

      const canvases: HTMLCanvasElement[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        if (myToken !== renderToken) return; // a newer render superseded this one
        const page = await doc.getPage(i);
        if (myToken !== renderToken) return;

        const unscaled = page.getViewport({ scale: 1 });
        const scale = (targetWidth / unscaled.width) * dpr;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.className = "resume-page";
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport }).promise;
        if (myToken !== renderToken) return;
        canvases.push(canvas);
      }

      if (myToken !== renderToken || !host) return;
      host.replaceChildren(...canvases);
      setStatus("ready");
    }

    // Watch for the window being resized (drag handles or the zoom button)
    // and re-render at the new width — debounced so a drag doesn't
    // re-render on every intermediate frame. Attached immediately, before
    // the PDF has even loaded, so a resize during load isn't missed: it
    // just fires once loading finishes and renderPages() reads whatever
    // width the host settled on.
    const resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (!width || Math.abs(width - lastRenderedWidth) < 8) return;
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => {
        if (!cancelled) renderPages();
      }, 180);
    });
    resizeObserver.observe(host);

    async function load() {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

        doc = await pdfjs.getDocument(src).promise;
        if (cancelled) return;
        onLoadedRef.current?.(doc.numPages);

        await renderPages();
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
      renderToken++;
      if (debounce) clearTimeout(debounce);
      resizeObserver.disconnect();
    };
  }, [src]);

  if (status === "error") {
    return (
      <div className="pdf-fallback">
        Could not render the PDF inline.{" "}
        <a href={src} style={{ color: "var(--blue-soft)" }}>
          Open it in a new tab
        </a>
        .
      </div>
    );
  }

  return (
    <div className="resume-viewer">
      {status === "loading" && <div className="resume-viewer-loading">Loading résumé…</div>}
      <div className="resume-pages" ref={hostRef} />
    </div>
  );
}
