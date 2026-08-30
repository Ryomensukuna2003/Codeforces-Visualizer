import { ImageResponse } from "next/og";

/**
 * The share card. DESIGN.md §8.4 listed this as requested and never made.
 *
 * Built in the product's own language rather than a screenshot: black ground,
 * one red rule, monospace. `next/og` ships only its own sans, so the face has to
 * be supplied — and the fetch is wrapped, because a share card that 500s is
 * worse than one in the wrong font.
 */
export const runtime = "edge";
export const alt =
  "CF Stats — a Codeforces visualizer: rating graph, submission stats and problem ladder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** JetBrains Mono 700, or nothing — never a thrown request. */
async function monoFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    ).then((r) => r.text());
    const url = /src: url\((https:[^)]+)\)/.exec(css)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const font = await monoFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000000",
          color: "#fafafa",
          fontFamily: "JetBrains Mono, monospace",
          padding: "72px 80px",
          borderLeft: "16px solid #ef4444",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, color: "#8a8a8a", letterSpacing: 4 }}>
          CODEFORCES DOSSIER
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 82, fontWeight: 700, lineHeight: 1.05 }}>
            Codeforces Visualizer
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "#a3a3a3",
              marginTop: 24,
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            Rating graph, submission history, problem ladder and contest
            post-mortems for any handle.
          </div>
        </div>

        <div style={{ display: "flex", gap: 48, fontSize: 24, color: "#8a8a8a" }}>
          <div style={{ display: "flex" }}>cfstats.vercel.app</div>
          <div style={{ display: "flex", color: "#ef4444" }}>free · no account</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "JetBrains Mono", data: font, style: "normal", weight: 700 as const }]
        : undefined,
    }
  );
}
