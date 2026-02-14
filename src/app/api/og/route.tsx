import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") || "skill";
  const slug = searchParams.get("slug") || "";
  const username = searchParams.get("username") || "";
  const name = searchParams.get("name") || "OpenClaw Skill";
  const grade = searchParams.get("grade") || "";
  const category = searchParams.get("category") || "";

  const gradeColors: Record<string, string> = {
    S: "#059669",
    A: "#16a34a",
    B: "#ca8a04",
    C: "#ea580c",
    D: "#dc2626",
  };

  if (type === "stack") {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ fontSize: 80, marginBottom: 20 }}>🛡️</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: "white" }}>
            @{username}&apos;s Stack
          </div>
          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.8)",
              marginTop: 16,
            }}
          >
            ClawStack — Trusted OpenClaw Skills
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // Default: skill card
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: 48 }}>🛡️</span>
          <span
            style={{ fontSize: 28, fontWeight: 700, color: "#14b8a6" }}
          >
            ClawStack
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 56, fontWeight: 800, color: "white" }}>
            {name}
          </div>
          {category && (
            <div
              style={{
                fontSize: 24,
                color: "rgba(255,255,255,0.6)",
                marginTop: 12,
              }}
            >
              {category}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {grade && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: gradeColors[grade] || "#64748b",
                borderRadius: "12px",
                padding: "8px 20px",
              }}
            >
              <span style={{ fontSize: 20, color: "white" }}>
                Security Grade:
              </span>
              <span
                style={{ fontSize: 28, fontWeight: 800, color: "white" }}
              >
                {grade}
              </span>
            </div>
          )}
          <div
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            clawstack.dev/skills/{slug}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
