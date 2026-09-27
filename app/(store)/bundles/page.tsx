import prisma from "@/lib/prisma"
import { serialize } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { BunnyIcon } from "@/components/store/BunnyLogo"
import { Gift, Sparkles, Check, ArrowRight, ShoppingBag } from "lucide-react"
import FadeIn from "@/components/ui/FadeIn"

export const metadata: Metadata = {
  title: "Baby Bundles & Starter Kits — Mini Bunny",
  description: "Save more with our curated baby bundles: Newborn Starter Kit, Feeding Sets, and Baby Care Hampers.",
}

export default async function BundlesPage() {
  const bundles = await prisma.bundle.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: { product: { include: { images: { take: 1 } } } },
      },
    },
  }).catch(() => [])

  // Featured baby bundles for display/fallback
  const signatureBabyBundles = [
    {
      id: "newborn-starter-kit",
      name: "Newborn Starter Kit",
      slug: "newborn-starter-kit",
      description: "Everything essential for baby's first weeks: Ergonomic anti-flathead baby pillow, anti-colic feeding bottle, 100% organic muslin swaddle blanket, and cute storage organizer basket.",
      price: 2450,
      comparePrice: 3200,
      image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=800&auto=format&fit=crop",
      badge: "Hospital Bag Essential",
      badgeColor: "bg-[#FFF0F3] text-[#FF758F]",
      includes: ["Baby Pillow", "Anti-Colic Bottle", "Muslin Swaddle Blanket", "Organizer Storage Basket"],
    },
    {
      id: "feeding-bundle",
      name: "Baby Weaning & Feeding Bundle",
      slug: "feeding-bundle",
      description: "Stress-free mealtime starter set: Food-grade silicone catch-all bib, non-slip bamboo suction bowl with soft silicone spoon, training sippy cup, and set of 3 organic muslin burp cloths.",
      price: 1850,
      comparePrice: 2400,
      image: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?q=80&w=800&auto=format&fit=crop",
      badge: "Stage 2 Weaning",
      badgeColor: "bg-[#EBF5FB] text-[#4A8DB7]",
      includes: ["Silicone Catch Bib", "Bamboo Suction Bowl & Spoon", "Training Sippy Cup", "3x Muslin Burp Cloths"],
    },
    {
      id: "baby-care-bundle",
      name: "Daily Baby Care & Grooming Bundle",
      slug: "baby-care-bundle",
      description: "Gentle daily grooming: Pack of 5 ultra-soft organic cotton washcloths, natural beechwood goat hair baby brush, natural wooden teether ring, and organic calming diaper balm.",
      price: 1650,
      comparePrice: 2150,
      image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop",
      badge: "Parent Favorite",
      badgeColor: "bg-[#FFF9F0] text-[#D97706]",
      includes: ["5x Organic Washcloths", "Beechwood Goat Hair Brush", "Wooden Teether Ring", "Calming Baby Balm"],
    },
  ]

  const displayBundles = bundles.length > 0 ? bundles : signatureBabyBundles

  return (
    <div className="w-full bg-[#FAF9F5] pb-24 animate-in fade-in duration-500">
      
      {/* Header */}
      <section className="relative bg-gradient-to-b from-[#EBF5FB]/80 via-[#FFF0F3]/40 to-[#FAF9F5] py-20 px-4 text-center overflow-hidden border-b border-[#EDE8DF]">
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#EDE8DF] text-[#4A8DB7] font-bold text-xs uppercase tracking-widest shadow-sm">
            <Gift className="w-4 h-4 text-[#FF758F]" />
            <span>Curated Value Sets</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-heading font-black text-[#1E3E5B] tracking-tight">
            Baby Bundles & Starter Kits
          </h1>

          <p className="text-base md:text-lg text-[#6C7A89] max-w-xl mx-auto">
            Everything your baby needs bundled together with love at exclusive bundled prices (up to 25% off).
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl mt-12 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayBundles.map((bundle: any, idx: number) => {
            const savings = bundle.comparePrice
              ? Number(bundle.comparePrice) - Number(bundle.price)
              : null
            const itemsList = bundle.includes || bundle.items?.map((i: any) => i.product?.name) || []

            return (
              <FadeIn key={bundle.id || bundle.slug} delay={idx * 0.15}>
                <div className="group bg-white rounded-3xl border border-[#EDE8DF] hover:border-[#4A8DB7] overflow-hidden shadow-sm hover:shadow-bunny transition-all duration-300 flex flex-col h-full hover:-translate-y-1.5">
                  
                  {/* Image */}
                  <div className="relative aspect-[4/3] bg-[#FAF9F5] overflow-hidden">
                    {bundle.image ? (
                      <Image
                        src={bundle.image}
                        alt={bundle.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#EBF5FB] text-[#4A8DB7]">
                        <BunnyIcon className="w-12 h-12 opacity-50" />
                      </div>
                    )}

                    {savings && savings > 0 && (
                      <div className="absolute top-3.5 left-3.5 bg-[#FF758F] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                        Save ৳{savings.toLocaleString()}
                      </div>
                    )}

                    {bundle.badge && (
                      <div className={`absolute top-3.5 right-3.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm ${bundle.badgeColor || "bg-white text-[#1E3E5B]"}`}>
                        {bundle.badge}
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <h2 className="font-heading font-black text-xl text-[#1E3E5B] group-hover:text-[#4A8DB7] transition-colors">
                        {bundle.name}
                      </h2>
                      <p className="text-xs text-[#6C7A89] line-clamp-3 leading-relaxed">
                        {bundle.description}
                      </p>

                      {/* Included Items Pill List */}
                      {itemsList.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-[#EDE8DF]">
                          <span className="text-[10px] font-bold text-[#6C7A89] uppercase tracking-wider">
                            What's Included:
                          </span>
                          <ul className="space-y-1">
                            {itemsList.map((item: string, i: number) => (
                              <li key={i} className="text-xs text-[#1E3E5B] flex items-center gap-1.5 font-medium">
                                <Check className="w-3.5 h-3.5 text-[#2ECC71] shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Pricing & CTA */}
                    <div className="pt-4 border-t border-[#EDE8DF] flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-mono font-black text-[#1E3E5B]">
                            ৳{Number(bundle.price).toLocaleString()}
                          </span>
                          {bundle.comparePrice && (
                            <span className="text-xs font-mono text-[#6C7A89] line-through">
                              ৳{Number(bundle.comparePrice).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#2ECC71] font-bold">In Stock & Gift-Ready</span>
                      </div>

                      <Link
                        href={`/bundles/${bundle.slug}`}
                        className="px-4 py-2.5 bg-[#4A8DB7] hover:bg-[#367299] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <span>View Kit</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>

      </div>
    </div>
  )
}
