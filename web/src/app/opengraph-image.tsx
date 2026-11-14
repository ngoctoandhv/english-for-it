import { ImageResponse } from "next/og";

export const alt = "English for IT";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#0e1116", color: "#e8edf3", fontFamily: "monospace" }}>
        <div style={{ fontSize: 40, color: "#34d399", display: "flex" }}>&gt;_ English for IT</div>
        <div style={{ fontSize: 76, marginTop: 24, lineHeight: 1.1, display: "flex" }}>Standups, code reviews, incident updates.</div>
        <div style={{ fontSize: 34, marginTop: 28, color: "#9aa6b2", display: "flex" }}>5 minutes a day. Free.</div>
      </div>
    ),
    size,
  );
}
