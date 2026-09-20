"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { commandLookup, eggs, viewTitles } from "@/content/commands";
import { completeCommand, nearestCommand } from "@/lib/fuzzy";
import ResizeHandles from "./ResizeHandles";
import type { ViewKey } from "@/lib/types";

interface Props {
  onOpen: (view: ViewKey) => void;
  onFocus: () => void;
  isActive: boolean;
}

/** A line before it is given an id. Kept separate so `push` stays type-safe:
    Omit<> over a discriminated union collapses it into nothing useful. */
type LineSpec =
  | { kind: "text"; text: string; cls?: string }
  | { kind: "echo"; text: string }
  | { kind: "spacer" }
  | { kind: "suggest"; lead: string; cmd: string; tail?: string };

type Line = LineSpec & { id: number };

const BOOT_LINES: { text: string; cls: string }[] = [
  { text: "welcome!", cls: "dim" },
  { text: "loading profile… ok", cls: "dim" },
  { text: "mounting /projects /research /experience… ok", cls: "dim" },
  { text: "ready.", cls: "ok" },
];

const Prompt = () => (
  <>
    <span className="prompt-path">~</span> <span className="prompt-sym">%</span>
  </>
);

export default function Terminal({ onOpen, onFocus, isActive }: Props) {
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [booting, setBooting] = useState(true);
  const [typedBoot, setTypedBoot] = useState("");

  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);
  const historyRef = useRef<string[]>([]);
  const histIdx = useRef(0);
  const started = useRef(false);
  const skipped = useRef(false);

  const push = useCallback((line: LineSpec) => {
    setLines((prev) => [...prev, { ...line, id: ++idRef.current }]);
  }, []);

  /* Keep the newest line in view. */
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, typedBoot, booting]);

  /* ── Intro output, shared by the boot path and the skip path ── */
  const printIntro = useCallback(() => {
    push({ kind: "text", text: profile.name, cls: "head" });
    push({ kind: "text", text: profile.tagline, cls: "dim" });
    push({ kind: "spacer" });
    push({
      kind: "suggest",
      lead: "type",
      cmd: "help",
      tail: " to see every command, or click the help button instead",
    });
  }, [push]);

  /* ── Boot sequence ── */
  useEffect(() => {
    if (started.current) return; // React StrictMode runs effects twice in dev
    started.current = true;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem("booted") === "1";
    } catch {
      /* private mode — treat as first visit */
    }

    const skip = () => {
      skipped.current = true;
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);

    const wait = (ms: number) =>
      new Promise<void>((r) => setTimeout(r, skipped.current ? 0 : ms));

    const run = async () => {
      if (seen || reduced) {
        push({ kind: "echo", text: "whoami" });
        printIntro();
        setBooting(false);
        return;
      }

      for (const l of BOOT_LINES) {
        push({ kind: "text", text: l.text, cls: l.cls });
        await wait(230);
      }
      push({ kind: "spacer" });
      await wait(200);

      const word = "whoami";
      for (let i = 1; i <= word.length; i++) {
        setTypedBoot(word.slice(0, i));
        await wait(58);
      }
      await wait(320);

      setTypedBoot("");
      push({ kind: "echo", text: "whoami" });
      printIntro();
      setBooting(false);

      try {
        sessionStorage.setItem("booted", "1");
      } catch {
        /* nothing to do */
      }
    };

    void run();
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [push, printIntro]);

  /* ── Focus the input when the terminal becomes the active window ── */
  useEffect(() => {
    if (isActive && !booting && window.innerWidth > 860) inputRef.current?.focus();
  }, [isActive, booting]);

  /* ── Execution ── */
  const execute = useCallback(
    (raw: string) => {
      const cmd = raw.trim().toLowerCase();
      push({ kind: "echo", text: raw.trim() });
      setValue("");
      if (!cmd) return;

      historyRef.current.push(cmd);
      histIdx.current = historyRef.current.length;

      if (cmd === "clear" || cmd === "cls") {
        setLines([]);
        return;
      }

      if (eggs[cmd]) {
        for (const text of eggs[cmd]) push({ kind: "text", text, cls: "dim" });
        push({ kind: "spacer" });
        return;
      }

      const hit = commandLookup[cmd];
      if (hit?.view) {
        push({ kind: "text", text: `opening ${viewTitles[hit.view]}…`, cls: "dim" });
        push({ kind: "spacer" });
        onOpen(hit.view);
        return;
      }

      push({ kind: "text", text: `zsh: command not found: ${cmd}`, cls: "err" });
      const guess = nearestCommand(cmd);
      push(
        guess
          ? { kind: "suggest", lead: "did you mean", cmd: guess, tail: "?" }
          : { kind: "suggest", lead: "try", cmd: "help", tail: " to see every command" },
      );
      push({ kind: "spacer" });
    },
    [onOpen, push],
  );

  const runChip = (cmd: string) => execute(cmd);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const hist = historyRef.current;

    if (e.key === "Enter") {
      e.preventDefault();
      execute(value);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (histIdx.current > 0) {
        histIdx.current -= 1;
        setValue(hist[histIdx.current]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx.current < hist.length - 1) {
        histIdx.current += 1;
        setValue(hist[histIdx.current]);
      } else {
        histIdx.current = hist.length;
        setValue("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const done = completeCommand(value.trim().toLowerCase());
      if (done) setValue(done);
    }
  };

  return (
    <section
      className={`win term${isActive ? " is-active" : ""}`}
      aria-label="Terminal"
      onMouseDown={onFocus}
    >
      <ResizeHandles />
      <div className="titlebar" data-drag>
        <div className="lights">
          <button className="light red" type="button" aria-label="Close terminal" disabled />
          <button
            className="light yellow"
            type="button"
            aria-label="Minimize terminal"
            disabled
          />
          <button className="light green" type="button" aria-label="Zoom terminal" disabled />
        </div>
        <span className="title">{profile.shortName} — zsh — 80&times;24</span>
      </div>

      <div
        className="term-body"
        ref={bodyRef}
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
        onClick={(e) => {
          if ((e.target as HTMLElement).tagName !== "BUTTON" && window.innerWidth > 860) {
            inputRef.current?.focus();
          }
        }}
      >
        {lines.map((l) => {
          switch (l.kind) {
            case "text":
              return (
                <div key={l.id} className={`line ${l.cls ?? ""}`}>
                  {l.text}
                </div>
              );
            case "echo":
              return (
                <div key={l.id} className="line">
                  <Prompt /> {l.text}
                </div>
              );
            case "spacer":
              return <div key={l.id} className="spacer" />;
            case "suggest":
              return (
                <div key={l.id} className="line dim">
                  {l.lead}{" "}
                  <button type="button" className="chip inline" onClick={() => runChip(l.cmd)}>
                    {l.cmd}
                  </button>
                  {l.tail ?? ""}
                </div>
              );
          }
        })}

        {booting ? (
          typedBoot && (
            <div className="line">
              <Prompt /> {typedBoot}
            </div>
          )
        ) : (
          <div className="inputrow">
            <Prompt />
            <span className="field">
              <input
                id="terminal-input"
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="Type a command"
                placeholder="type a command, or use the dock"
              />
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
