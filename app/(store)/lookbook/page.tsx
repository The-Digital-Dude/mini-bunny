import Link from "next/link"
import { ArrowRight } from "lucide-react"

const looks = [
  {
    title: "Nursery Essentials",
    subtitle: "Organic Cotton",
    image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=800&auto=format&fit=crop",
    href: "/shop?sort=newest",
  },
  {
    title: "Cozy Sleep & Snuggle",
    subtitle: "Sleepsuits & Rompers",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop",
    href: "/shop",
  },
  {
    title: "Little Explorer",
    subtitle: "Playdate & Outdoor",
    image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=800&auto=format&fit=crop",
    href: "/shop",
  },
  {
    title: "Newborn Welcome Boxes",
    subtitle: "Gift Sets",
    image: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?q=80&w=800&auto=format&fit=crop",
    href: "/shop",
  },
  {
    title: "Pastel Blooms",
    subtitle: "Baby Girl Dresses",
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop",
    href: "/shop",
  },
  {
    title: "Tiny Gentleman",
    subtitle: "Dungarees & Sets",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=800&auto=format&fit=crop",
    href: "/shop",
  },
]

export default function LookbookPage() {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero */}
      <div className="relative h-[60vh] flex items-end overflow-hidden bg-stone-900">
        <img
          src="https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=2070&auto=format&fit=crop"
          alt="Mini Bunny Lookbook"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 px-8 md:px-16 pb-12 text-white">
          <p className="text-amber-300 font-bold tracking-[0.2em] text-xs uppercase mb-3">Season 2026</p>
          <h1 className="text-4xl md:text-6xl font-heading font-bold leading-none mb-4">Baby Lookbook</h1>
          <p className="text-lg text-gray-200 max-w-md">
            Adorable comfort for every milestone. Crafted with love, designed for play and sweet dreams.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {looks.map((look, i) => (
            <Link
              key={i}
              href={look.href}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl block bg-bunny-muted shadow-sm"
            >
              <img
                src={look.image}
                alt={look.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-300 mb-1">{look.subtitle}</p>
                <h3 className="text-2xl font-heading font-bold mb-3">{look.title}</h3>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest border-b border-white/50 pb-0.5 group-hover:border-amber-300 group-hover:text-amber-300 transition-colors">
                  Shop Collection <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
