import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mini Bunny",
    short_name: "Mini Bunny",
    description: "Premium baby and kids clothing in Bangladesh. Made with Love for Little Ones.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF9F5",
    theme_color: "#4A8DB7",
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png" },
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
