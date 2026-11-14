import { ImageResponse } from "next/og";

export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }];
}

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const px = size === "512" ? 512 : 192;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0e1116", color: "#34d399", fontSize: px * 0.42, fontFamily: "monospace", fontWeight: 700 }}>
        &gt;_
      </div>
    ),
    { width: px, height: px },
  );
}
