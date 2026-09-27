import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get("title") || "Mini Bunny"
  const price = searchParams.get("price")
  const image = searchParams.get("image")
  const storeName = searchParams.get("store") || "Mini Bunny"

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "1200px",
          height: "630px",
          background: "#1E3E5B",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }}
          />
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "60px",
            position: "relative",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: 20, color: "#FFCCD5", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>
            🐰 {storeName} · Made with Love for Little Ones
          </div>
          <div style={{ fontSize: title.length > 40 ? 44 : 58, color: "#FFFFFF", fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            {title}
          </div>
          {price && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ fontSize: 32, color: "#FF758F", fontWeight: 800, background: "rgba(255, 255, 255, 0.15)", padding: "8px 24px", borderRadius: "100px" }}>
                ৳{price}
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
