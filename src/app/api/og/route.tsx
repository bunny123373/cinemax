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
          background: "#141414",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Netflix-style red glow behind text */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 600,
          height: 600,
          marginLeft: -300,
          marginTop: -300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(229,9,20,0.15) 0%, transparent 65%)",
        }} />

        {/* Diagonal red stripes — Netflix N style */}
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} viewBox="0 0 1280 720">
          <polygon points="0,0 180,0 0,720" fill="rgba(229,9,20,0.04)" />
          <polygon points="1100,0 1280,0 1280,720 1100,720" fill="rgba(229,9,20,0.04)" />
          <line x1="0" y1="720" x2="500" y2="0" stroke="rgba(229,9,20,0.06)" strokeWidth="2" />
          <line x1="780" y1="720" x2="1280" y2="0" stroke="rgba(229,9,20,0.06)" strokeWidth="2" />
        </svg>

        {/* Big C letter like Netflix N */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          fontSize: 420,
          fontWeight: 900,
          fontFamily: "Arial, sans-serif",
          color: "rgba(229,9,20,0.08)",
          lineHeight: 1,
          marginLeft: -140,
          marginTop: -230,
        }}>
          C
        </div>

        {/* Title */}
        <div style={{
          fontSize: 80,
          fontWeight: 900,
          color: "#e50914",
          letterSpacing: "4px",
          fontFamily: "Arial, sans-serif",
          zIndex: 1,
          textShadow: "0 0 60px rgba(229,9,20,0.3)",
        }}>
          CINEMAX
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 24,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "8px",
          fontFamily: "Arial, sans-serif",
          marginTop: 16,
          zIndex: 1,
        }}>
          MOVIES &amp; SERIES
        </div>

        {/* Thin red line */}
        <div style={{
          width: 80,
          height: 3,
          background: "#e50914",
          marginTop: 24,
          borderRadius: 2,
          zIndex: 1,
        }} />

        {/* Feature pills */}
        <div style={{
          display: "flex",
          gap: 16,
          marginTop: 28,
          zIndex: 1,
        }}>
          {["HD", "FREE", "MULTI LANG"].map((label) => (
            <div key={label} style={{
              padding: "6px 20px",
              border: "1px solid rgba(229,9,20,0.4)",
              borderRadius: 4,
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "Arial, sans-serif",
              letterSpacing: "2px",
            }}>
              {label}
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{
          position: "absolute",
          bottom: 50,
          fontSize: 16,
          color: "rgba(255,255,255,0.25)",
          fontFamily: "Arial, sans-serif",
          letterSpacing: "3px",
        }}>
          cinemax77.vercel.app
        </div>

        {/* Bottom red line */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "#e50914" }} />
      </div>
    ),
    {
      width: 1280,
      height: 720,
    }
  );
}
