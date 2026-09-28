/**
 * Cloudflare CDN Image URL Helper for Mini Bunny
 *
 * Rewrites direct Supabase Storage URLs to your Cloudflare CDN domain
 * to benefit from global 300+ edge location caching, bandwidth savings,
 * and sub-50ms image load times.
 *
 * Example:
 * Input:  https://mjkrvbtqbfomhfqjhbny.supabase.co/storage/v1/object/public/product-images/17200-baby-romper.webp
 * Output: https://cdn.minibunny.com/storage/v1/object/public/product-images/17200-baby-romper.webp
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mjkrvbtqbfomhfqjhbny.supabase.co"
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || ""

/**
 * Transforms an image URL to route through the Cloudflare CDN if configured.
 * Safely falls back to the original URL if CDN_URL is not set.
 */
export function cdnUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder-baby.png"

  // If already relative or placeholder, return as-is
  if (url.startsWith("/") || !url.startsWith("http")) {
    return url
  }

  // If CDN_URL is set and the image is hosted on Supabase Storage
  if (CDN_URL && url.includes(SUPABASE_URL)) {
    return url.replace(SUPABASE_URL, CDN_URL.replace(/\/$/, ""))
  }

  return url
}

/**
 * Returns responsive image sizing attributes for Next/Image components
 */
export function getImageDimensions(type: "thumbnail" | "card" | "hero" | "gallery" | "avatar") {
  switch (type) {
    case "thumbnail":
      return { width: 120, height: 120 }
    case "card":
      return { width: 600, height: 600 }
    case "hero":
      return { width: 1200, height: 600 }
    case "gallery":
      return { width: 1000, height: 1000 }
    case "avatar":
      return { width: 80, height: 80 }
    default:
      return { width: 800, height: 800 }
  }
}
