import prisma from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import ProductCard from "@/components/store/ProductCard"
import { BunnyIcon } from "@/components/store/BunnyLogo"
import {
  Sparkles,
  Heart,
  ShieldCheck,
  Award,
  Users,
  Gift,
  ArrowRight,
  Truck,
  RotateCcw,
  CheckCircle2,
  Star,
  ShoppingBag,
  Clock,
  Baby,
  Smile,
  Feather,
} from "lucide-react"
import { serialize } from "@/lib/utils"
import FadeIn from "@/components/ui/FadeIn"

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

export const metadata = {
  title: "Mini Bunny — Premium Baby & Kids Clothing | Made with Love for Little Ones",
  description: "Shop ultra-soft, 100% organic cotton baby clothes, sleepsuits, newborn gift sets, and toddler wear crafted with love for your little ones.",
}

export default async function StoreHomepage() {
  const [banners, dbCategories, newArrivals, featuredProducts] = await Promise.all([
    prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }).catch(() => []),
    prisma.category.findMany({ where: { isActive: true, showOnHomepage: true }, orderBy: { sortOrder: "asc" } }).catch(() => []),
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, images: true, variants: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { category: true, images: true, variants: true },
      take: 4,
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
  ])

  // Curated Mini Bunny categories required by design
  const boutiqueCategories = [
    {
      name: "Newborn",
      ageRange: "0–3 Months",
      slug: "newborn",
      image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=800&auto=format&fit=crop",
      badge: "Pure Cotton",
      bgClass: "from-[#FFF0F3] to-[#FAF9F5]",
      accentClass: "text-[#FF758F]",
      description: "Gentle kimonos, scratch mittens, soft booties & newborn sets.",
    },
    {
      name: "Baby Clothing",
      ageRange: "3–24 Months",
      slug: "baby-clothing",
      image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop",
      badge: "Bestseller",
      bgClass: "from-[#EBF5FB] to-[#FAF9F5]",
      accentClass: "text-[#4A8DB7]",
      description: "Cloud-soft rompers, 2-way zip sleepsuits, & daytime sets.",
    },
    {
      name: "Feeding",
      ageRange: "All Stages",
      slug: "feeding",
      image: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=800&auto=format&fit=crop",
      badge: "Food Safe",
      bgClass: "from-[#FFF9F0] to-[#FAF9F5]",
      accentClass: "text-[#E67E22]",
      description: "Silicone catch-all bibs, bamboo spoons & organic burp cloths.",
    },
    {
      name: "Safety",
      ageRange: "Peace of Mind",
      slug: "safety",
      image: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?q=80&w=800&auto=format&fit=crop",
      badge: "Non-Toxic",
      bgClass: "from-[#EBF8F2] to-[#FAF9F5]",
      accentClass: "text-[#2ECC71]",
      description: "Organic wooden teethers, knee crawlers & baby-safe grooming.",
    },
    {
      name: "Nursery",
      ageRange: "Sweet Dreams",
      slug: "nursery",
      image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=800&auto=format&fit=crop",
      badge: "Breathable",
      bgClass: "from-[#F3E8FF] to-[#FAF9F5]",
      accentClass: "text-[#9B51E0]",
      description: "Muslin swaddles, soft knitted blankets & snug sleep sacks.",
    },
  ]

  // Age Selector stages
  const ageStages = [
    { code: "0-3M", label: "0–3 Months", title: "Newborn Snuggles", icon: "🍼", count: "Essentials & Bundles" },
    { code: "3-6M", label: "3–6 Months", title: "Play & Roll", icon: "🧸", count: "Soft Daywear" },
    { code: "6-12M", label: "6–12 Months", title: "Crawling & Exploring", icon: "👶", count: "Comfy Rompers" },
    { code: "12-24M", label: "12–24 Months", title: "First Steps", icon: "👣", count: "Flexible Sets" },
    { code: "2-4Y", label: "2–4 Years", title: "Toddler Adventures", icon: "🎈", count: "Active Playwear" },
  ]

  // Gift Collections
  const giftCollections = [
    {
      title: "Welcome Newborn Hamper",
      items: "6-Piece Deluxe Keepsake",
      price: "৳2,450",
      image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=600&auto=format&fit=crop",
      tag: "Baby Shower Favorite",
      tagColor: "bg-[#FFF0F3] text-[#FF758F]",
      link: "/bundles",
    },
    {
      title: "Organic Sleep & Dream Set",
      items: "3 Zip Sleepsuits + 2 Mittens",
      price: "৳1,890",
      image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=600&auto=format&fit=crop",
      tag: "Best Value",
      tagColor: "bg-[#EBF5FB] text-[#4A8DB7]",
      link: "/bundles",
    },
    {
      title: "First Birthday Celebration Box",
      items: "Festive Outfit + Bunny Plush",
      price: "৳2,150",
      image: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?q=80&w=600&auto=format&fit=crop",
      tag: "Special Milestone",
      tagColor: "bg-[#FFF9F0] text-[#D97706]",
      link: "/bundles",
    },
  ]

  // Verified parent reviews
  const reviews = [
    {
      name: "Tanzina Rahman",
      location: "Gulshan, Dhaka",
      baby: "Mom to 4-month-old Ryan",
      rating: 5,
      comment:
        "The organic cotton is heavenly soft! Ryan has very sensitive skin and this is the only brand that leaves zero redness. The 2-way zipper makes midnight diaper changes a breeze.",
    },
    {
      name: "Shafiqul Alam",
      location: "GEC Circle, Chattogram",
      baby: "Dad to 9-month-old Aafia",
      rating: 5,
      comment:
        "Ordered the Newborn Gift Set for our niece. The deluxe bunny gift packaging and personalized card made it the highlight of the baby shower. Super fast delivery too!",
    },
    {
      name: "Dr. Samira Khan",
      location: "Sylhet Sadar",
      baby: "Mom to 1-year-old Zayd",
      rating: 5,
      comment:
        "As a pediatrician and a mom, fabric safety is non-negotiable for me. Mini Bunny's non-toxic dyes and flat seams are medical-grade gentle. Outstanding quality for Bangladesh.",
    },
  ]

  // Social / Community feed images
  const socialImages = [
    {
      url: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=600&auto=format&fit=crop",
      handle: "@anika_and_baby",
    },
    {
      url: "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=600&auto=format&fit=crop",
      handle: "@little.zaara",
    },
    {
      url: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=600&auto=format&fit=crop",
      handle: "@toddler.diaries.bd",
    },
    {
      url: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=600&auto=format&fit=crop",
      handle: "@nafis_mommy",
    },
  ]

  return (
    <div className="w-full bg-[#FAF9F5] text-[#24303E] animate-in fade-in duration-500 overflow-x-hidden">
      
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: HERO BANNER
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[620px] md:min-h-[720px] bg-gradient-to-b from-[#EBF5FB]/80 via-[#FFF9F0]/60 to-[#FAF9F5] flex items-center justify-center overflow-hidden pt-8 pb-16 md:py-24">
        {/* Soft Decorative Blobs */}
        <div className="absolute top-12 left-10 w-72 h-72 rounded-full bg-[#4A8DB7]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[#FF758F]/10 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Messaging & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <FadeIn delay={0.1}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#EDE8DF] text-[#4A8DB7] text-xs font-extrabold uppercase tracking-widest shadow-sm">
                  <BunnyIcon className="w-4 h-4" />
                  <span>Made with Love for Little Ones</span>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-[#1E3E5B] tracking-tight leading-[1.12]">
                  Cloud-Soft Comfort <br className="hidden sm:inline" />
                  For Your <span className="text-[#4A8DB7]">Precious</span> Baby.
                </h1>
              </FadeIn>

              <FadeIn delay={0.3}>
                <p className="text-base sm:text-lg text-[#6C7A89] max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                  Crafted from 100% GOTS certified organic cotton with flatlock anti-chafing seams, nickel-free snaps, and soothing natural dyes for delicate baby skin.
                </p>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link
                    href="/shop"
                    className="w-full sm:w-auto px-8 py-4 bg-[#4A8DB7] hover:bg-[#367299] text-white font-extrabold text-sm rounded-2xl shadow-bunny hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Shop Babywear
                  </Link>
                  <Link
                    href="/bundles"
                    className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-[#FFF9F0] text-[#1E3E5B] border border-[#EDE8DF] font-extrabold text-sm rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Gift className="w-4 h-4 text-[#FF758F]" />
                    Explore Gift Sets
                  </Link>
                  <Link
                    href="/size-guide"
                    className="text-xs font-bold text-[#4A8DB7] hover:underline flex items-center gap-1 pt-1 sm:pt-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Baby Assistant
                  </Link>
                </div>
              </FadeIn>

              {/* Mini Trust Badges */}
              <FadeIn delay={0.5}>
                <div className="pt-6 border-t border-[#EDE8DF] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#6C7A89] font-semibold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#4A8DB7]" /> 100% GOTS Organic
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FF758F]" /> Hypoallergenic Dyes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> Easy 7-Day Exchange
                  </span>
                </div>
              </FadeIn>
            </div>

            {/* Right Column: Visual Hero Grid with Floating Card */}
            <div className="lg:col-span-5 relative">
              <FadeIn delay={0.3}>
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Main Hero Card */}
                  <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                    <Image
                      src="https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=1200&auto=format&fit=crop"
                      alt="Mini Bunny Organic Newborn Collection"
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E3E5B]/60 via-transparent to-transparent" />
                    
                    <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-extrabold uppercase tracking-wider">
                        Newborn Organic Line
                      </span>
                      <p className="text-xl font-heading font-extrabold">Ultra-Soft Cloud Rompers</p>
                      <p className="text-xs text-white/90">Breathable & snug for sweet dreaming</p>
                    </div>
                  </div>

                  {/* Floating Floating Badge: Top Right */}
                  <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl shadow-xl border border-[#EDE8DF] flex items-center gap-3 animate-bounce duration-1000">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] flex items-center justify-center text-[#FF758F]">
                      <Heart className="w-5 h-5 fill-[#FF758F]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#1E3E5B]">10,000+ Happy Babies</p>
                      <p className="text-[10px] text-[#6C7A89]">Loved across Bangladesh</p>
                    </div>
                  </div>

                  {/* Floating Floating Badge: Bottom Left */}
                  <div className="absolute -bottom-6 -left-4 bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl shadow-xl border border-[#EDE8DF] hidden sm:flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EBF5FB] flex items-center justify-center text-[#4A8DB7]">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#1E3E5B]">Pediatrician Approved</p>
                      <p className="text-[10px] text-[#6C7A89]">100% Non-irritating</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: SHOP BY CATEGORY (Newborn, Baby Clothing, Feeding, Safety, Nursery)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-y border-[#EDE8DF]">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF5FB] text-[#4A8DB7] font-bold text-xs uppercase tracking-wider">
                🍼 Curated Collections
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-black text-[#1E3E5B]">
                Shop by Category
              </h2>
              <p className="text-sm text-[#6C7A89]">
                Everything your baby needs from first cuddles to toddler milestones.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {boutiqueCategories.map((cat, idx) => (
              <FadeIn key={cat.name} delay={idx * 0.1}>
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="group relative flex flex-col h-full bg-[#FAF9F5] hover:bg-white rounded-3xl border border-[#EDE8DF] hover:border-[#4A8DB7] p-4 transition-all duration-300 hover:shadow-bunny hover:-translate-y-1.5 overflow-hidden"
                >
                  {/* Category Image */}
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-4 bg-white">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[#1E3E5B] shadow-sm">
                        {cat.badge}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between space-y-1">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#6C7A89]">
                        {cat.ageRange}
                      </p>
                      <h3 className="font-heading font-black text-lg text-[#1E3E5B] group-hover:text-[#4A8DB7] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-[#6C7A89] line-clamp-2 pt-1">
                        {cat.description}
                      </p>
                    </div>

                    <div className="pt-3 flex items-center justify-between text-xs font-bold text-[#4A8DB7]">
                      <span>Shop Now</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: AGE SELECTOR ("Find products for your baby")
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#FFF9F0]/60 border-b border-[#EDE8DF] relative">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] text-[#FF758F] font-bold text-xs uppercase tracking-wider">
                ✨ Age-Based Shopping
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-black text-[#1E3E5B]">
                Find Products for Your Baby
              </h2>
              <p className="text-sm text-[#6C7A89]">
                Select your little one's growth stage to discover clothes that fit just right.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {ageStages.map((stage, idx) => (
              <FadeIn key={stage.code} delay={idx * 0.1}>
                <Link
                  href={`/shop?size=${encodeURIComponent(stage.code)}`}
                  className="group relative flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-[#EDE8DF] hover:border-[#4A8DB7] shadow-sm hover:shadow-bunny transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Icon Circle */}
                  <div className="w-16 h-16 rounded-2xl bg-[#EBF5FB] group-hover:bg-[#4A8DB7] text-[#4A8DB7] group-hover:text-white flex items-center justify-center text-2xl transition-all duration-300 mb-4 shadow-sm">
                    {stage.icon}
                  </div>

                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF9F5] text-[#4A8DB7] border border-[#EDE8DF] mb-1">
                    {stage.code}
                  </span>

                  <h3 className="font-heading font-black text-base text-[#1E3E5B] pt-1">
                    {stage.label}
                  </h3>
                  <p className="text-xs text-[#6C7A89] mt-0.5">
                    {stage.title}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#EDE8DF] w-full text-[11px] font-bold text-[#4A8DB7] group-hover:text-[#367299] flex items-center justify-center gap-1">
                    <span>View Size</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>

          {/* Assistant Banner Tip */}
          <FadeIn delay={0.4}>
            <div className="mt-12 max-w-2xl mx-auto p-5 bg-white rounded-2xl border border-[#EDE8DF] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#FF758F] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-[#1E3E5B]">Not sure about your baby's exact size?</p>
                  <p className="text-xs text-[#6C7A89]">Try the Mini Bunny Baby Assistant with age & weight</p>
                </div>
              </div>
              <Link
                href="/size-guide"
                className="px-5 py-2.5 bg-[#4A8DB7] hover:bg-[#367299] text-white font-bold text-xs rounded-xl shadow-sm transition-colors shrink-0"
              >
                Launch Assistant
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: FEATURED PRODUCTS
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF5FB] text-[#4A8DB7] font-bold text-xs uppercase tracking-wider mb-2">
              ⭐ Handpicked Favorites
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-[#1E3E5B]">
              Featured Products
            </h2>
            <p className="text-sm text-[#6C7A89] mt-1">
              Top-rated organic baby wear loved by parents nationwide.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A8DB7] hover:text-[#367299] transition-colors"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {serialize(featuredProducts).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {serialize(newArrivals.slice(0, 4)).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: GIFT COLLECTIONS & BUNDLES
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-b from-white via-[#FFF0F3]/30 to-white border-y border-[#EDE8DF]">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] text-[#FF758F] font-bold text-xs uppercase tracking-wider">
                🎁 Ready to Gift
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-black text-[#1E3E5B]">
                Gift Collections
              </h2>
              <p className="text-sm text-[#6C7A89]">
                Beautifully packaged in signature Mini Bunny gift boxes with customizable greeting cards.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {giftCollections.map((giftItem, idx) => (
              <FadeIn key={giftItem.title} delay={idx * 0.15}>
                <div className="group bg-white rounded-3xl border border-[#EDE8DF] overflow-hidden shadow-sm hover:shadow-bunny-pink transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
                  {/* Gift Image with ribbon badge */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF9F5]">
                    <Image
                      src={giftItem.image}
                      alt={giftItem.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute top-3.5 left-3.5">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${giftItem.tagColor} shadow-sm`}>
                        {giftItem.tag}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-heading font-black text-lg text-[#1E3E5B] group-hover:text-[#FF758F] transition-colors">
                        {giftItem.title}
                      </h3>
                      <p className="text-xs text-[#6C7A89] flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-[#FF758F]" />
                        {giftItem.items}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#EDE8DF] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#6C7A89] uppercase font-bold">Gift Price</span>
                        <p className="font-mono text-lg font-black text-[#1E3E5B]">{giftItem.price}</p>
                      </div>

                      <Link
                        href={giftItem.link}
                        className="px-4 py-2.5 bg-[#FF758F] hover:bg-[#F45D7B] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <span>Gift This</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4}>
            <div className="mt-12 text-center">
              <Link
                href="/bundles"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-[#EDE8DF] hover:border-[#FF758F] text-[#1E3E5B] font-extrabold text-sm rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <span>View All Bundles & Gift Hampers</span>
                <ArrowRight className="w-4 h-4 text-[#FF758F]" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: TRUST SECTION (Baby Safe, Premium Quality, Parent Trusted)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-b border-[#EDE8DF]">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF5FB] text-[#4A8DB7] font-bold text-xs uppercase tracking-wider">
                🛡️ The Mini Bunny Promise
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-black text-[#1E3E5B]">
                Why Parents Love Mini Bunny
              </h2>
              <p className="text-sm text-[#6C7A89]">
                Safe, gentle, and rigorously tested garments for your baby's absolute comfort.
              </p>
            </div>
          </FadeIn>

          {/* 3 Core Trust Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <FadeIn delay={0.1}>
              <div className="p-8 rounded-3xl bg-[#FAF9F5] border border-[#EDE8DF] space-y-4 text-center md:text-left h-full">
                <div className="w-14 h-14 rounded-2xl bg-[#EBF5FB] text-[#4A8DB7] flex items-center justify-center mx-auto md:mx-0 shadow-sm">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-black text-xl text-[#1E3E5B] flex items-center justify-center md:justify-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#4A8DB7]" /> Baby Safe Materials
                </h3>
                <p className="text-sm text-[#6C7A89] leading-relaxed">
                  100% GOTS certified organic cotton, water-based natural dyes, and lead-free YKK snaps. Zero formaldehyde, zero harsh chemical treatments.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="p-8 rounded-3xl bg-[#FAF9F5] border border-[#EDE8DF] space-y-4 text-center md:text-left h-full">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF0F3] text-[#FF758F] flex items-center justify-center mx-auto md:mx-0 shadow-sm">
                  <Award className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-black text-xl text-[#1E3E5B] flex items-center justify-center md:justify-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#FF758F]" /> Premium Quality
                </h3>
                <p className="text-sm text-[#6C7A89] leading-relaxed">
                  Flat-lock anti-chafing seams, protective zip guards against pinched skin, and reinforced stitching engineered to survive hundreds of gentle washes.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="p-8 rounded-3xl bg-[#FAF9F5] border border-[#EDE8DF] space-y-4 text-center md:text-left h-full">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF9F0] text-[#D97706] flex items-center justify-center mx-auto md:mx-0 shadow-sm">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-black text-xl text-[#1E3E5B] flex items-center justify-center md:justify-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#D97706]" /> Parent Trusted
                </h3>
                <p className="text-sm text-[#6C7A89] leading-relaxed">
                  Loved by over 15,000+ parents across Bangladesh with 5-star ratings, transparent size exchanges, and attentive pediatrician-backed guidance.
                </p>
              </div>
            </FadeIn>
          </div>

          {/* 4 Feature Badges Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-[#EDE8DF]">
            {[
              { icon: Truck, title: "Fast Delivery", desc: "2–4 days across Bangladesh" },
              { icon: RotateCcw, title: "7-Day Size Exchange", desc: "Hassle-free fit guarantee" },
              { icon: Feather, title: "Cloud Soft", desc: "Gentle on sensitive skin" },
              { icon: ShieldCheck, title: "Cash on Delivery", desc: "Pay at your doorstep" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#FAF9F5]/70 border border-[#EDE8DF]">
                <div className="w-10 h-10 rounded-xl bg-white text-[#4A8DB7] flex items-center justify-center shrink-0 shadow-sm">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#1E3E5B]">{f.title}</h4>
                  <p className="text-[11px] text-[#6C7A89]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: CUSTOMER REVIEWS
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#FAF9F5]">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] text-[#FF758F] font-bold text-xs uppercase tracking-wider">
                ❤️ Verified Parent Stories
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-black text-[#1E3E5B]">
                Loved by Parents
              </h2>
              <p className="text-sm text-[#6C7A89]">
                Read genuine experiences from families choosing Mini Bunny for their babies.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((rev, idx) => (
              <FadeIn key={rev.name} delay={idx * 0.15}>
                <div className="bg-white p-8 rounded-3xl border border-[#EDE8DF] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full space-y-6">
                  <div className="space-y-4">
                    {/* Stars */}
                    <div className="flex text-[#FFB703] gap-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>

                    <p className="text-sm text-[#24303E] leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#EDE8DF] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-[#1E3E5B]">{rev.name}</p>
                      <p className="text-xs text-[#6C7A89]">{rev.baby}</p>
                    </div>
                    <span className="text-[11px] font-medium text-[#4A8DB7] bg-[#EBF5FB] px-2.5 py-1 rounded-full">
                      {rev.location}
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 8: INSTAGRAM / SOCIAL SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-t border-[#EDE8DF]">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF5FB] text-[#4A8DB7] font-bold text-xs uppercase tracking-wider">
                📸 #MiniBunnyBabies
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-black text-[#1E3E5B]">
                Join Our Community
              </h2>
              <p className="text-sm text-[#6C7A89]">
                Tag <strong>@minibunny.bd</strong> on Instagram for a chance to be featured!
              </p>
            </div>
          </FadeIn>

          {/* Social Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {socialImages.map((post, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="group relative aspect-square rounded-3xl overflow-hidden border border-[#EDE8DF] bg-[#FAF9F5] shadow-sm">
                  <Image
                    src={post.url}
                    alt="Mini Bunny Community Baby"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-[#1E3E5B]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                    <div className="text-white text-center space-y-1">
                      <InstagramIcon className="w-6 h-6 mx-auto" />
                      <p className="text-xs font-bold">{post.handle}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Newsletter / Club Signup Card */}
          <FadeIn delay={0.4}>
            <div className="mt-16 bg-gradient-to-r from-[#EBF5FB] via-[#FFF0F3] to-[#FFF9F0] rounded-3xl p-8 md:p-12 border border-[#EDE8DF] text-center max-w-3xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white mx-auto flex items-center justify-center shadow-sm text-[#FF758F]">
                <BunnyIcon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl md:text-3xl font-heading font-black text-[#1E3E5B]">
                Join the Mini Bunny VIP Club
              </h3>
              <p className="text-xs md:text-sm text-[#6C7A89] max-w-md mx-auto">
                Get 10% off your first order, parenting tips, and early access to limited newborn drops.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 bg-white border border-[#EDE8DF] rounded-2xl text-xs text-[#1E3E5B] focus:outline-none focus:border-[#4A8DB7] shadow-sm"
                />
                <button
                  type="button"
                  className="px-6 py-3 bg-[#4A8DB7] hover:bg-[#367299] text-white font-bold text-xs rounded-2xl shadow-sm transition-colors shrink-0"
                >
                  Join Club
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  )
}
