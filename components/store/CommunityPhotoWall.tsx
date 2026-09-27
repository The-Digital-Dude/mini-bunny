"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingBag, X, Sparkles, ArrowRight, Check } from "lucide-react"
import { useCartStore } from "@/store/useCartStore"
import { toast } from "sonner"

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

export interface CommunityPost {
  id: string
  imageUrl: string
  handle: string
  babyNameAge: string
  caption: string
  likes: number
  product: {
    name: string
    slug: string
    price: number
    image: string
    sizeTag: string
  }
}

const DEFAULT_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    imageUrl: "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=800&auto=format&fit=crop",
    handle: "@anika_and_baby",
    babyNameAge: "Ryan (4 Months)",
    caption: "Morning snuggles in our favorite cloud-soft organic romper ☁️✨ The two-way zip is an absolute lifesaver!",
    likes: 342,
    product: {
      name: "Organic Cotton Cloud Romper",
      slug: "organic-cotton-cloud-romper",
      price: 850,
      image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&auto=format&fit=crop",
      sizeTag: "3-6M",
    },
  },
  {
    id: "post-2",
    imageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop",
    handle: "@little.zaara",
    babyNameAge: "Zaara (6 Months)",
    caption: "Tummy time champion! Wearing the pastel rib knit playsuit. So stretchy and zero skin irritation 💕",
    likes: 519,
    product: {
      name: "Pastel Ribbed Playwear Set",
      slug: "pastel-ribbed-playwear-set",
      price: 1150,
      image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&auto=format&fit=crop",
      sizeTag: "6-12M",
    },
  },
  {
    id: "post-3",
    imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop",
    handle: "@toddler.diaries.bd",
    babyNameAge: "Aafia (9 Months)",
    caption: "Baby shower gift unboxing! The Deluxe Newborn gift hamper box is pure luxury. Kept the bunny keepsake box for nursery storage 🎁",
    likes: 428,
    product: {
      name: "Deluxe Newborn Keepsake Gift Box",
      slug: "deluxe-newborn-keepsake-gift-box",
      price: 2850,
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&auto=format&fit=crop",
      sizeTag: "Gift Set",
    },
  },
  {
    id: "post-4",
    imageUrl: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=800&auto=format&fit=crop",
    handle: "@nafis_mommy",
    babyNameAge: "Nafis (1 Year)",
    caption: "First steps in the coziest organic dungaree set! Breathable fabric perfect for Dhaka's weather 🌟",
    likes: 681,
    product: {
      name: "Organic Linen Toddler Dungaree",
      slug: "organic-linen-toddler-dungaree",
      price: 1350,
      image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&auto=format&fit=crop",
      sizeTag: "12-18M",
    },
  },
]

export default function CommunityPhotoWall({
  posts = DEFAULT_COMMUNITY_POSTS,
  title = "Join the #MiniBunnyFamily",
  subtitle = "Tag @minibunny.bd on Instagram to be featured on our community wall!",
}: {
  posts?: CommunityPost[]
  title?: string
  subtitle?: string
}) {
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null)
  const addItem = useCartStore((s) => s.addItem)

  const handleQuickAdd = (post: CommunityPost) => {
    addItem({
      id: `cart_${post.id}_${Date.now()}`,
      productId: post.product.slug,
      variantId: `var_${post.product.slug}`,
      productSlug: post.product.slug,
      name: post.product.name,
      price: post.product.price,
      image: post.product.image,
      size: post.product.sizeTag,
      color: "Signature Pastel",
      quantity: 1,
    })
    toast.success(`Added ${post.product.name} to your bag! 🛍️`)
    setSelectedPost(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] text-[#FF758F] text-xs font-bold mb-2 border border-[#FF758F]/20">
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>#MiniBunnyFamily on Instagram</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-heading font-black text-[#1E3E5B]">
            {title}
          </h2>
          <p className="text-xs text-[#6C7A89] mt-1">{subtitle}</p>
        </div>

        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF758F] hover:text-[#e0546e] transition-colors"
        >
          <span>Follow @minibunny.bd</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 4-Photo Interactive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="group relative aspect-square rounded-3xl overflow-hidden cursor-pointer border border-[#EDE8DF] bg-white shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <Image
              src={post.imageUrl}
              alt={post.babyNameAge}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Hover Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-white">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full">
                  {post.handle}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold">
                  <Heart className="w-3.5 h-3.5 fill-[#FF758F] text-[#FF758F]" />
                  {post.likes}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold leading-tight">{post.babyNameAge}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4A8DB7] text-white text-[11px] font-bold rounded-full shadow-sm">
                  <ShoppingBag className="w-3 h-3" />
                  <span>Shop Look (৳{post.product.price})</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lookbook Popup Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#EDE8DF] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 text-[#1E3E5B] hover:bg-white transition-colors shadow-sm"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left: Photo */}
            <div className="relative aspect-square md:aspect-auto min-h-[300px] w-full bg-[#FAF9F5]">
              <Image
                src={selectedPost.imageUrl}
                alt={selectedPost.babyNameAge}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Right: Details & Shop Card */}
            <div className="p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#EDE8DF] pb-3">
                  <div>
                    <span className="font-bold text-xs text-[#4A8DB7] block">{selectedPost.handle}</span>
                    <h3 className="font-heading font-black text-base text-[#1E3E5B]">
                      {selectedPost.babyNameAge}
                    </h3>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-[#FF758F] bg-[#FFF0F3] px-2.5 py-1 rounded-full">
                    <Heart className="w-3.5 h-3.5 fill-current" /> {selectedPost.likes}
                  </span>
                </div>

                <p className="text-xs text-[#6C7A89] leading-relaxed italic">
                  &ldquo;{selectedPost.caption}&rdquo;
                </p>
              </div>

              {/* Tagged Product Box */}
              <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EDE8DF] space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4A8DB7] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Featured Item
                </span>

                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#EDE8DF] bg-white shrink-0">
                    <Image
                      src={selectedPost.product.image}
                      alt={selectedPost.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-[#1E3E5B] truncate">
                      {selectedPost.product.name}
                    </h4>
                    <p className="text-xs font-mono font-black text-[#1E3E5B] mt-0.5">
                      ৳{selectedPost.product.price.toLocaleString()}{" "}
                      <span className="text-[10px] text-[#6C7A89] font-normal font-sans">
                        · Size {selectedPost.product.sizeTag}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleQuickAdd(selectedPost)}
                    className="flex-1 py-2.5 bg-[#4A8DB7] hover:bg-[#367299] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>1-Click Add to Bag</span>
                  </button>

                  <Link
                    href={`/shop/${selectedPost.product.slug}`}
                    onClick={() => setSelectedPost(null)}
                    className="py-2.5 px-3 border border-[#EDE8DF] hover:bg-white text-[#1E3E5B] text-xs font-bold rounded-xl transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
