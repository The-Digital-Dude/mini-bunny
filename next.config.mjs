/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Sharp optimizes and compresses uploads to WebP (quality 82, max 1200px)
    // Cloudflare CDN handles edge caching and global delivery
    unoptimized: true,
    remotePatterns: [
      // Cloudflare Custom CDN
      {
        protocol: "https",
        hostname: "cdn.**",
      },
      {
        protocol: "https",
        hostname: "images.**",
      },
      // Supabase Storage (direct fallback)
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Unsplash fallback
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Generic fallback
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        // Cache static media and fonts aggressively at Cloudflare edge
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, s-maxage=31536000, immutable",
          },
        ],
      },
    ]
  },
};

export default nextConfig;
