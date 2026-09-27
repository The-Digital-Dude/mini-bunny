import prisma from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import ProductCard from "@/components/store/ProductCard"
import HomeAgeFilter from "@/components/store/HomeAgeFilter"
import CommunityPhotoWall from "@/components/store/CommunityPhotoWall"
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
  Package,
  Layers,
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
  title: "Mini Bunny — Premium Baby & Kids Boutique | Made with Love for Little Ones",
  description: "Discover ultra-soft GOTS certified organic cotton babywear, sleepsuits, swaddles, feeding sets, and luxury baby shower gift hampers.",
}

export default async function StoreHomepage() {
  const [rootCategories, allProducts, bundles] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: { children: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }).catch(() => []),
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, images: true, variants: true },
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    prisma.bundle.findMany({
      where: { isActive: true },
      take: 3,
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
  ])

  const serializedProducts = serialize(allProducts)
  const featuredProducts = serializedProducts.filter((p: any) => p.isFeatured)

  // 9 Core Category Department Visual Configs
  const categoryThemes: Record<string, { badge: string; icon: string; bgGradient: string; textClass: string }> = {
    "newborn-essentials": { badge: "0–6M Essentials", icon: "👶", bgGradient: "from-[#FFF0F3] to-[#FAF9F5]", textClass: "text-[#FF758F]" },
    "baby-clothing": { badge: "GOTS Organic 0–5Y", icon: "👕", bgGradient: "from-[#F0F7FB] to-[#FAF9F5]", textClass: "text-[#4A8DB7]" },
    "feeding-nursing": { badge: "100% BPA-Free", icon: "🍼", bgGradient: "from-[#FFF9F0] to-[#FAF9F5]", textClass: "text-[#E67E22]" },
    "baby-safety": { badge: "Pediatrician Safe", icon: "🚼", bgGradient: "from-[#F0FDF4] to-[#FAF9F5]", textClass: "text-[#16A34A]" },
    "nursery-storage": { badge: "Nursery Decor", icon: "🏡", bgGradient: "from-[#FAF5FF] to-[#FAF9F5]", textClass: "text-[#9333EA]" },
    "baby-care-hygiene": { badge: "Hypoallergenic", icon: "🧴", bgGradient: "from-[#E0F2FE] to-[#FAF9F5]", textClass: "text-[#0284C7]" },
    "toys-learning": { badge: "Montessori Sensory", icon: "🧸", bgGradient: "from-[#FEF3C7] to-[#FAF9F5]", textClass: "text-[#D97706]" },
    "baby-travel-essentials": { badge: "Travel Ergonomic", icon: "🚗", bgGradient: "from-[#EEF2FF] to-[#FAF9F5]", textClass: "text-[#4F46E5]" },
    "gift-collections": { badge: "Luxury Hampers", icon: "🎁", bgGradient: "from-[#FFF1F2] to-[#FAF9F5]", textClass: "text-[#E11D48]" },
  }

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
        "Ordered the Deluxe Newborn Set for our niece. The luxury bunny gift packaging and personalized card made it the highlight of the baby shower. Super fast delivery too!",
    },
    {
      name: "Dr. Samira Khan",
      location: "Sylhet Sadar",
      baby: "Mom to 1-year-old Zayd",
      rating: 5,
      comment:
        "As a pediatrician and a mom, fabric safety is non-negotiable for me. Mini Bunny's non-toxic dyes and flatlock seams are medical-grade gentle. Outstanding quality in Bangladesh.",
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
    <div className="w-full bg-[#FAF9F5] text-[#1E3E5B] animate-in fade-in duration-500 overflow-x-hidden">
      
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: HERO BANNER
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[600px] md:min-h-[680px] bg-gradient-to-b from-[#F0F7FB]/90 via-[#FFF9F0]/60 to-[#FAF9F5] flex items-center justify-center overflow-hidden pt-8 pb-16 md:py-20">
        {/* Soft Decorative Glows */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#4A8DB7]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[#FF758F]/15 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Messaging & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <FadeIn delay={0.1}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#EDE8DF] text-[#4A8DB7] text-xs font-extrabold uppercase tracking-widest shadow-xs">
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
                  Crafted from 100% GOTS certified organic cotton with flatlock anti-chafing seams, nickel-free snaps, and gentle soothing dyes for delicate newborn skin.
                </p>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link
                    href="/shop"
                    className="w-full sm:w-auto px-8 py-4 bg-[#4A8DB7] hover:bg-[#3d779c] text-white font-extrabold text-sm rounded-2xl shadow-md hover:shadow-lg shadow-[#4A8DB7]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Shop New Arrivals</span>
                  </Link>
                  <Link
                    href="/shop?category=gifts-bundles"
                    className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-[#FFF9F0] text-[#1E3E5B] border border-[#EDE8DF] font-extrabold text-sm rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Gift className="w-4 h-4 text-[#FF758F]" />
                    <span>Gift Collections</span>
                  </Link>
                </div>
              </FadeIn>

              {/* Trust Chips */}
              <FadeIn delay={0.5}>
                <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-bold text-[#6C7A89]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2ECC71]" />
                    <span>GOTS 100% Organic</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2ECC71]" />
                    <span>7-Day Size Exchange</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2ECC71]" />
                    <span>Cash on Delivery across BD</span>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <FadeIn delay={0.3}>
                <div className="relative w-72 sm:w-88 md:w-96 aspect-[4/5] rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-white">
                  <Image
                    src="https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=800&auto=format&fit=crop"
                    alt="Mini Bunny Organic Cotton Babywear"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover"
                  />

                  {/* Floating Highlight Card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#EDE8DF] shadow-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] flex items-center justify-center shrink-0">
                      <Heart className="w-5 h-5 text-[#FF758F] fill-[#FF758F]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#1E3E5B] truncate">Organic Cloud Romper</p>
                      <p className="text-[11px] text-[#6C7A89]">Hypoallergenic · ৳850</p>
                    </div>
                    <Link
                      href="/shop/organic-cotton-cloud-romper"
                      className="text-xs font-bold text-white bg-[#4A8DB7] hover:bg-[#3d779c] px-3 py-1.5 rounded-xl transition-colors shrink-0 shadow-xs"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </FadeIn>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: 9 MAIN CATEGORY DEPARTMENTS
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white border-y border-[#EDE8DF]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4A8DB7] flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 9 Baby & Kids Departments
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-[#1E3E5B]">
              Explore by Category
            </h2>
            <p className="text-sm text-[#6C7A89]">
              From newborn nursery essentials to feeding, safety gear, toys, travel, and luxury gift hampers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {rootCategories.map((cat) => {
              const theme = categoryThemes[cat.slug] || {
                badge: "Boutique Essential",
                icon: "👶",
                bgGradient: "from-[#F0F7FB] to-[#FAF9F5]",
                textClass: "text-[#4A8DB7]",
              }
              const img = cat.image || "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&auto=format&fit=crop"

              return (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group relative flex flex-col rounded-3xl overflow-hidden border border-[#EDE8DF] bg-[#FAF9F5] hover:border-[#4A8DB7] hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-white">
                    <Image
                      src={img}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-white/95 text-[#1E3E5B] font-bold border border-[#EDE8DF] shadow-xs flex items-center gap-1">
                        <span>{theme.icon}</span>
                        <span>{theme.badge}</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between space-y-3">
                    <div>
                      <h3 className="font-heading font-black text-base text-[#1E3E5B] group-hover:text-[#4A8DB7] transition-colors flex items-center justify-between">
                        <span>{cat.name}</span>
                        <ArrowRight className="w-4 h-4 text-[#6C7A89] group-hover:text-[#4A8DB7] group-hover:translate-x-1 transition-transform" />
                      </h3>
                      {cat.children && cat.children.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {cat.children.slice(0, 4).map((c: any) => (
                            <span
                              key={c.id}
                              className="text-[10px] font-medium bg-white text-[#6C7A89] px-2 py-0.5 rounded-md border border-[#EDE8DF]"
                            >
                              {c.name}
                            </span>
                          ))}
                          {cat.children.length > 4 && (
                            <span className="text-[10px] font-bold text-[#4A8DB7] px-1 py-0.5">
                              +{cat.children.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: INTERACTIVE AGE STAGE FILTER
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#FAF9F5]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF758F] flex items-center justify-center gap-1.5">
              <Baby className="w-4 h-4" /> Fit For Every Growth Stage
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-[#1E3E5B]">
              Find Products For Your Baby
            </h2>
            <p className="text-sm text-[#6C7A89]">
              Pick your baby&apos;s age stage for instant size recommendations and curated babywear.
            </p>
          </div>

          <HomeAgeFilter allProducts={serializedProducts as any} />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: FEATURED BESTSELLERS
      ───────────────────────────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="py-16 md:py-20 bg-white border-y border-[#EDE8DF]">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#4A8DB7] flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-current text-amber-400" /> Parent Favorites
                </span>
                <h2 className="text-2xl md:text-3xl font-heading font-black text-[#1E3E5B] mt-1">
                  Mini Bunny Bestsellers
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-xs font-bold text-[#4A8DB7] hover:text-[#3d779c] flex items-center gap-1 transition-colors"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: GIFT COLLECTIONS & BUNDLES
      ───────────────────────────────────────────────────────────── */}
      {bundles.length > 0 && (
        <section className="py-16 md:py-24 bg-gradient-to-b from-[#FFF0F3]/40 via-[#FAF9F5] to-white border-b border-[#EDE8DF]">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF758F] flex items-center justify-center gap-1.5">
                <Gift className="w-4 h-4" /> Baby Shower & Milestones
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-black text-[#1E3E5B]">
                Curated Gift Hampers & Starter Kits
              </h2>
              <p className="text-sm text-[#6C7A89]">
                Presented in our signature keepsake bunny box with complimentary satin ribbon and handwritten greeting cards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bundles.map((bundle: any) => (
                <div
                  key={bundle.id}
                  className="group rounded-3xl overflow-hidden border border-[#EDE8DF] bg-white p-5 shadow-sm hover:shadow-xl hover:border-[#FF758F]/40 transition-all flex flex-col justify-between"
                >
                  <Link href={`/bundles/${bundle.slug || bundle.id}`} className="space-y-4 block">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#FAF9F5] border border-[#EDE8DF]">
                      <Image
                        src={bundle.image || "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=800&auto=format&fit=crop"}
                        alt={bundle.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#FF758F] text-white shadow-xs">
                          Gift-Ready Keepsake Box
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-heading font-black text-lg text-[#1E3E5B] group-hover:text-[#FF758F] transition-colors">
                        {bundle.name}
                      </h3>
                      <p className="text-xs text-[#6C7A89] mt-1.5 line-clamp-2 leading-relaxed">
                        {bundle.description}
                      </p>
                    </div>
                  </Link>

                  <div className="pt-5 mt-4 border-t border-[#EDE8DF] flex items-center justify-between">
                    <div>
                      {bundle.comparePrice && Number(bundle.comparePrice) > Number(bundle.price) && (
                        <span className="text-xs text-[#6C7A89] line-through block font-mono">
                          ৳{Number(bundle.comparePrice).toLocaleString()}
                        </span>
                      )}
                      <span className="text-lg font-black font-mono text-[#1E3E5B]">
                        ৳{Number(bundle.price).toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/bundles/${bundle.slug || bundle.id}`}
                      className="px-4 py-2 bg-[#FF758F] hover:bg-[#e05f77] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Send as Gift</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: TRUST & QUALITY SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-3xl bg-[#FAF9F5] border border-[#EDE8DF] space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#F0F7FB] flex items-center justify-center text-[#4A8DB7] mx-auto sm:mx-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-black text-base text-[#1E3E5B]">Baby Safe Materials</h3>
              <p className="text-xs text-[#6C7A89] leading-relaxed">
                100% GOTS certified organic cotton, hypoallergenic dyes, and nickel-free hardware designed for delicate baby skin.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF9F5] border border-[#EDE8DF] space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0F3] flex items-center justify-center text-[#FF758F] mx-auto sm:mx-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-black text-base text-[#1E3E5B]">7-Day Size Exchange</h3>
              <p className="text-xs text-[#6C7A89] leading-relaxed">
                Babies grow fast! Enjoy our hassle-free size exchange policy across all 64 districts in Bangladesh.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF9F5] border border-[#EDE8DF] space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF9F0] flex items-center justify-center text-[#E67E22] mx-auto sm:mx-0">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-black text-base text-[#1E3E5B]">Hygienic Sterile Packing</h3>
              <p className="text-xs text-[#6C7A89] leading-relaxed">
                Every garment is individually sealed in sanitised, dust-proof babywear bags before dispatch.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF9F5] border border-[#EDE8DF] space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF8F2] flex items-center justify-center text-[#2ECC71] mx-auto sm:mx-0">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-black text-base text-[#1E3E5B]">Fast BD Delivery & COD</h3>
              <p className="text-xs text-[#6C7A89] leading-relaxed">
                Express 24-48h delivery in Dhaka, 3-5 days all Bangladesh with Cash on Delivery & bKash / Nagad options.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: PARENT TESTIMONIALS
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-[#FAF9F5] border-t border-[#EDE8DF]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4A8DB7] flex items-center justify-center gap-1.5">
              <Users className="w-4 h-4" /> Parent Trusted
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-[#1E3E5B]">
              Loved by 10,000+ Happy Families
            </h2>
            <p className="text-sm text-[#6C7A89]">
              Real stories and feedback from parents across Bangladesh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-[#EDE8DF] shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-[#1E3E5B] italic leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EDE8DF] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-[#1E3E5B]">{rev.name}</p>
                    <p className="text-[11px] text-[#6C7A89]">{rev.baby}</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#4A8DB7] bg-[#F0F7FB] px-2.5 py-1 rounded-full border border-[#4A8DB7]/20">
                    {rev.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 8: INSTAGRAM & COMMUNITY GALLERY
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white border-t border-[#EDE8DF]">
        <div className="container mx-auto px-4">
          <CommunityPhotoWall />
        </div>
      </section>

    </div>
  )
}
