import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import prisma from "@/lib/prisma"
import { serialize } from "@/lib/utils"
import ProductCard from "@/components/store/ProductCard"
import { BunnyIcon } from "@/components/store/BunnyLogo"
import { Gift, Heart, Sparkles, Star, ArrowRight, CheckCircle2, ShieldCheck, Truck } from "lucide-react"
import FadeIn from "@/components/ui/FadeIn"

export const metadata: Metadata = {
  title: "Baby Shower Gifts & Keepsake Hampers — Mini Bunny",
  description: "Explore premium baby shower gifts, newborn welcome boxes, and organic milestone hampers crafted with love for little ones.",
}

export default async function GiftsPage() {
  const [giftProducts, bundles] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: "Gift", mode: "insensitive" } },
          { name: { contains: "Set", mode: "insensitive" } },
          { isFeatured: true },
        ],
      },
      include: { category: true, images: true, variants: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    prisma.bundle.findMany({
      where: { isActive: true },
      include: {
        items: {
          include: { product: { include: { images: true } } },
        },
      },
      take: 3,
    }).catch(() => []),
  ])

  const giftCategories = [
    {
      title: "Baby Shower Favorites",
      desc: "Top curated hampers with newborn essentials & celebratory boxes.",
      icon: "🎉",
      tag: "Top Pick",
      link: "/bundles",
    },
    {
      title: "Gender-Neutral Neutrals",
      desc: "Warm cream, oatmeal & soft butter tones for surprise arrivals.",
      icon: "🤍",
      tag: "Organic",
      link: "/shop?color=Oatmeal+Beige",
    },
    {
      title: "First Birthday Milestones",
      desc: "Party rompers, memory keepsakes, & cuddly plush companions.",
      icon: "🎂",
      tag: "1-Year",
      link: "/shop?size=12-18M",
    },
    {
      title: "Digital Gift Cards",
      desc: "Instant delivery with luxury themes, personalized note & 1-year validity.",
      icon: "🎁",
      tag: "Instant ৳",
      link: "/gift-cards",
    },
  ]

  return (
    <div className="w-full bg-[#FAF9F5] pb-24 animate-in fade-in duration-500">
      
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-[#FFF0F3]/80 via-[#FFF9F0]/60 to-[#FAF9F5] py-20 px-4 text-center overflow-hidden border-b border-[#EDE8DF]">
        <div className="absolute top-0 right-10 w-72 h-72 rounded-full bg-[#FF758F]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 rounded-full bg-[#4A8DB7]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#EDE8DF] text-[#FF758F] font-bold text-xs uppercase tracking-widest shadow-sm">
            <Gift className="w-4 h-4" />
            <span>The Baby Gift Boutique</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-heading font-black text-[#1E3E5B] tracking-tight">
            Baby Shower & Welcome Hampers
          </h1>

          <p className="text-base md:text-lg text-[#6C7A89] max-w-xl mx-auto">
            Give the gift of cloud-soft organic cotton, deluxe bunny keepsake packaging, and unforgettable memories.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl mt-12 space-y-16">
        
        {/* Gift Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {giftCategories.map((c, i) => (
            <FadeIn key={c.title} delay={i * 0.1}>
              <Link
                href={c.link}
                className="group p-8 bg-white rounded-3xl border border-[#EDE8DF] hover:border-[#FF758F] shadow-sm hover:shadow-bunny-pink transition-all duration-300 flex flex-col justify-between h-full hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{c.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF0F3] text-[#FF758F]">
                      {c.tag}
                    </span>
                  </div>
                  <h3 className="font-heading font-black text-lg text-[#1E3E5B] group-hover:text-[#FF758F] transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-[#6C7A89] leading-relaxed">
                    {c.desc}
                  </p>
                </div>

                <div className="pt-6 border-t border-[#EDE8DF] flex items-center justify-between text-xs font-bold text-[#FF758F]">
                  <span>Explore Gifts</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>

        {/* Gift Wrapping Feature Highlight Banner */}
        <FadeIn>
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-[#FFF0F3] via-[#FFF9F0] to-[#EBF5FB] border border-[#EDE8DF] flex flex-col md:flex-row items-center gap-8 shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-white text-[#FF758F] flex items-center justify-center shrink-0 shadow-md">
              <Gift className="w-10 h-10" />
            </div>
            <div className="flex-1 space-y-2 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#FF758F]">
                <Sparkles className="w-3.5 h-3.5" /> Signature Keepsake Packaging
              </span>
              <h2 className="text-2xl md:text-3xl font-heading font-black text-[#1E3E5B]">
                Complimentary Greeting Card & Luxe Box
              </h2>
              <p className="text-xs md:text-sm text-[#6C7A89] leading-relaxed max-w-2xl">
                Every Mini Bunny gift order can include our signature sturdy pastel keepsake box, soft tissue paper wrap, satin ribbon finish, and a personalized message printed on our deluxe bunny parchment.
              </p>
            </div>
            <Link
              href="/bundles"
              className="px-6 py-3.5 bg-[#FF758F] hover:bg-[#F45D7B] text-white font-bold text-xs rounded-2xl shadow-sm transition-all shrink-0"
            >
              Shop Curated Hampers
            </Link>
          </div>
        </FadeIn>

        {/* Ready-to-Gift Products Grid */}
        <div className="space-y-8">
          <div className="flex items-end justify-between border-b border-[#EDE8DF] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF758F]">Ready to Gift</span>
              <h2 className="text-2xl md:text-3xl font-heading font-black text-[#1E3E5B]">
                Popular Baby Shower Presents
              </h2>
            </div>
            <Link href="/shop" className="text-xs font-bold text-[#4A8DB7] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {serialize(giftProducts).map((prod: any) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
