import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const alt = `${profile.name} — ${profile.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The link preview card. This is what a recruiter sees when the URL is pasted
 * into LinkedIn, a chat, or an application form — often before they click.
 */
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 90px",
        /* Satori wants the flat colour and the gradients as separate
             properties — a hex inside the `background` shorthand throws. */
        backgroundColor: "#080a12",
        backgroundImage:
          "radial-gradient(60% 70% at 10% 5%, #354bb0 0%, transparent 65%)," +
          "radial-gradient(55% 65% at 95% 25%, #12707f 0%, transparent 60%)," +
          "radial-gradient(70% 80% at 60% 105%, #5b338c 0%, transparent 62%)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          fontSize: 26,
          color: "#5fd39a",
          fontFamily: "monospace",
          marginBottom: 26,
        }}
      >
        <span style={{ color: "#64b3ff" }}>~</span>
        <span>%</span>
        <span style={{ color: "#eceef3" }}>whoami</span>
      </div>

      <div
        style={{
          fontSize: 78,
          fontWeight: 700,
          color: "#eceef3",
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
        }}
      >
        {profile.name}
      </div>

      <div style={{ fontSize: 34, color: "#99a0af", marginTop: 20 }}>{profile.tagline}</div>
    </div>,
    size,
  );
}
