import { Metadata } from "next"
import { BabyAssistantWidget } from "@/components/store/SizeQuiz"
import MultiDepartmentGuide from "@/components/store/MultiDepartmentGuide"
import { Sparkles, Heart, ShieldCheck, Truck, RotateCcw } from "lucide-react"

export const metadata: Metadata = {
  title: "Baby Size & Department Buying Guide — Mini Bunny",
  description: "Find the perfect fit across all 9 departments: Baby Clothing (0-5Y), Swaddle TOG ratings, Feeding Bottle Nipple flow stages, and Carrier ergonomics.",
}

export default function SizeGuidePage() {
  return (
    <div className="animate-in fade-in duration-500 pb-20 bg-[#FAF9F5]">
      {/* Hero */}
      <div className="bg-[#1E3E5B] text-white py-16 md:py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#4A8DB7]/20 blur-2xl" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-[#FF758F]/20 blur-2xl" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#FFCCD5] font-bold text-xs uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            9-Department Fit & Buying Guide
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight">
            Baby & Kids Buying Guide
          </h1>
          <p className="text-white/80 text-xs md:text-sm font-medium max-w-xl mx-auto leading-relaxed">
            Babies grow quickly! Explore clothing size charts, room temperature swaddle TOG ratings, feeding nipple flow stages, and carrier ergonomics.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-4xl space-y-12 -mt-6 relative z-20">
        {/* Interactive Baby Assistant */}
        <BabyAssistantWidget
          embedded={true}
          onFilterShop={(size) => {
            window.location.href = `/shop?size=${encodeURIComponent(size)}`
          }}
        />

        {/* Multi-Department Tabbed Guide */}
        <MultiDepartmentGuide />

        {/* How to Measure Your Baby */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#4A8DB7] pb-2 border-b border-[#EDE8DF] flex items-center gap-2">
            <span>📏</span> How to Measure Your Baby
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#6C7A89]">
            {[
              { name: "Length / Height", desc: "Lay baby flat on their back and measure straight from top of head to heel." },
              { name: "Weight", desc: "Use baby's most recent pediatrician weight. Weight is often the most accurate sizing guide." },
              { name: "Chest", desc: "Measure around the fullest part of baby's chest under the arms." },
              { name: "Waist", desc: "Measure gently around baby's tummy just above the diaper line." },
            ].map((m) => (
              <div key={m.name} className="flex gap-2.5 p-4 bg-white border border-[#EDE8DF] rounded-2xl shadow-2xs">
                <span className="font-bold text-[#1E3E5B] shrink-0">{m.name}:</span>
                <span>{m.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Parent Sizing Guarantee */}
        <div className="bg-[#FFF9F0] border border-[#EDE8DF] rounded-3xl p-6 md:p-8 text-xs text-[#6C7A89] space-y-3 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-[#1E3E5B] text-sm">
            <Heart className="w-4 h-4 text-[#FF758F] fill-[#FF758F]" />
            <span>Mini Bunny Parent Guarantee & Sizing Tip</span>
          </div>
          <p className="leading-relaxed">
            Every baby grows at their own pace! If your baby is on the higher end of a weight or height bracket, or if you prefer extra diaper room, we always recommend choosing one size up.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[#1E3E5B] font-bold text-xs">
            <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-[#EDE8DF]">
              <RotateCcw className="w-4 h-4 text-[#4A8DB7] shrink-0" />
              <span>7-Day Free Size Exchange</span>
            </div>
            <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-[#EDE8DF]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Baby-Safe Dyes</span>
            </div>
            <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-[#EDE8DF]">
              <Truck className="w-4 h-4 text-[#FF758F] shrink-0" />
              <span>Sterile Hygienic Packaging</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
