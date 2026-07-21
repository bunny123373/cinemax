import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1280px",
          height: "720px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top accent */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg, transparent, #f5c542, transparent)" }} />
        {/* Bottom accent */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg, transparent, #f5c542, transparent)" }} />

        {/* Left bar */}
        <div style={{ position: "absolute", left: 60, top: 180, width: "4px", height: "360px", background: "#f5c542", opacity: 0.4, borderRadius: "2px" }} />
        {/* Right bar */}
        <div style={{ position: "absolute", right: 60, top: 180, width: "4px", height: "360px", background: "#f5c542", opacity: 0.4, borderRadius: "2px" }} />

        {/* Corner accents */}
        <div style={{ position: "absolute", top: 40, left: 40, width: 40, height: 3, background: "#f5c542", opacity: 0.3 }} />
        <div style={{ position: "absolute", top: 40, left: 40, width: 3, height: 40, background: "#f5c542", opacity: 0.3 }} />
        <div style={{ position: "absolute", top: 40, right: 40, width: 40, height: 3, background: "#f5c542", opacity: 0.3 }} />
        <div style={{ position: "absolute", top: 40, right: 40, width: 3, height: 40, background: "#f5c542", opacity: 0.3 }} />
        <div style={{ position: "absolute", bottom: 40, left: 40, width: 40, height: 3, background: "#f5c542", opacity: 0.3 }} />
        <div style={{ position: "absolute", bottom: 40, left: 40, width: 3, height: 40, background: "#f5c542", opacity: 0.3 }} />
        <div style={{ position: "absolute", bottom: 40, right: 40, width: 40, height: 3, background: "#f5c542", opacity: 0.3 }} />
        <div style={{ position: "absolute", bottom: 40, right: 40, width: 3, height: 40, background: "#f5c542", opacity: 0.3 }} />

        {/* Glow */}
        <div style={{ position: "absolute", top: 180, left: "50%", width: 240, height: 240, marginLeft: -120, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,197,66,0.12) 0%, transparent 70%)" }} />

        {/* Play icon */}
        <div style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          border: "3px solid rgba(245,197,66,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#f5c542">
            <polygon points="6,3 20,12 6,21" />
          </svg>
        </div>

        {/* Title */}
        <div style={{
          fontSize: 72,
          fontWeight: "bold",
          color: "#f5c542",
          letterSpacing: "8px",
          fontFamily: "Arial, sans-serif",
          marginBottom: 8,
        }}>
          CINEMAX
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 22,
          color: "#8e8ea0",
          letterSpacing: "6px",
          fontFamily: "Arial, sans-serif",
          marginBottom: 24,
        }}>
          STREAM PREMIUM MOVIES &amp; SERIES
        </div>

        {/* Separator */}
        <div style={{ width: 200, height: 2, background: "linear-gradient(90deg, transparent, #f5c542, transparent)", marginBottom: 24 }} />

        {/* Features */}
        <div style={{ display: "flex", gap: 40, fontFamily: "Arial, sans-serif", fontSize: 16, color: "#8e8ea0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#46d369" }} />
            HD Quality
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#46d369" }} />
            Multi Language
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#46d369" }} />
            Free Streaming
          </div>
        </div>

        {/* URL */}
        <div style={{
          position: "absolute",
          bottom: 80,
          fontSize: 18,
          color: "rgba(245,197,66,0.6)",
          fontFamily: "Arial, sans-serif",
          letterSpacing: "2px",
        }}>
          cinemax77.vercel.app
        </div>
      </div>
    ),
    {
      width: 1280,
      height: 720,
    }
  );
}
