import { Metadata } from "next"
import { BabyAssistantWidget } from "@/components/store/SizeQuiz"
import { Sparkles, Heart } from "lucide-react"

export const metadata: Metadata = {
  title: "Baby Size Guide & Assistant — Mini Bunny",
  description: "Find the perfect fit for your little one with Mini Bunny's smart baby size assistant and comprehensive infant & toddler size charts.",
}

export default function SizeGuidePage() {
  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* Hero */}
      <div className="bg-[#1E3E5B] text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#4A8DB7]/20 blur-2xl" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-[#FF758F]/20 blur-2xl" />
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#FFCCD5] font-bold text-xs uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Fit & Sizing Guide
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight">
            Baby & Kids Size Guide
          </h1>
          <p className="text-white/80 text-sm md:text-base font-medium">
            Babies grow quickly! Use our interactive smart assistant below or explore the standard age, weight, and height charts.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-16 -mt-8 relative z-20">

        {/* Embedded Interactive Assistant */}
        <BabyAssistantWidget
          embedded={true}
          onFilterShop={(size) => {
            window.location.href = `/shop?size=${encodeURIComponent(size)}`
          }}
        />

        {/* How to measure baby */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#4A8DB7] pb-2 border-b border-[#EDE8DF] flex items-center gap-2">
            <span>📏</span> How to Measure Your Baby
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#6C7A89]">
            {[
              { name: "Length / Height", desc: "Lay baby flat on their back and measure straight from top of head to heel." },
              { name: "Weight", desc: "Use baby's most recent pediatrician weight. Weight is often the most accurate guide." },
              { name: "Chest", desc: "Measure around the fullest part of baby's chest under the arms." },
              { name: "Waist", desc: "Measure gently around baby's tummy just above the diaper line." },
            ].map((m) => (
              <div key={m.name} className="flex gap-3 p-4 bg-[#FAF9F5] border border-[#EDE8DF] rounded-2xl">
                <span className="font-bold text-[#1E3E5B] shrink-0">{m.name}:</span>
                <span>{m.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Baby & Infant Clothing (0-24 Months) */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#4A8DB7] pb-2 border-b border-[#EDE8DF] flex items-center gap-2">
            <span>🍼</span> Baby & Infant (0–24 Months)
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-[#EDE8DF] bg-white shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#FAF9F5] border-b border-[#EDE8DF]">
                <tr>
                  {["Size", "Age", "Weight (kg)", "Height (cm)", "Chest (cm)"].map((h) => (
                    <th key={h} className="px-4 py-3.5 font-bold text-[#1E3E5B] text-xs uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["0-3M", "0–3 Months", "3.0 – 5.5 kg", "50 – 61 cm", "40 cm"],
                  ["3-6M", "3–6 Months", "5.5 – 7.5 kg", "61 – 67 cm", "43 cm"],
                  ["6-12M", "6–12 Months", "7.5 – 9.5 kg", "67 – 76 cm", "46 cm"],
                  ["12-18M", "12–18 Months", "9.5 – 11.5 kg", "76 – 83 cm", "49 cm"],
                  ["18-24M", "18–24 Months", "11.5 – 13.5 kg", "83 – 90 cm", "52 cm"],
                ].map(([size, ...vals]) => (
                  <tr key={size} className="border-t border-[#EDE8DF] even:bg-[#FAF9F5]/40 hover:bg-[#EBF5FB]/30 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-[#1E3E5B]">
                      <span className="px-2.5 py-1 rounded-lg bg-[#EBF5FB] text-[#4A8DB7] font-mono text-xs">{size}</span>
                    </td>
                    {vals.map((v, i) => <td key={i} className="px-4 py-3.5 text-[#6C7A89]">{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Toddler & Kids (1-4 Years) */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#4A8DB7] pb-2 border-b border-[#EDE8DF] flex items-center gap-2">
            <span>🧸</span> Toddler & Kids (1–4 Years)
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-[#EDE8DF] bg-white shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#FAF9F5] border-b border-[#EDE8DF]">
                <tr>
                  {["Size", "Age", "Weight (kg)", "Height (cm)", "Waist (cm)"].map((h) => (
                    <th key={h} className="px-4 py-3.5 font-bold text-[#1E3E5B] text-xs uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["1-2Y", "1–2 Years", "11.0 – 13.0 kg", "80 – 90 cm", "48 cm"],
                  ["2-3Y", "2–3 Years", "12.5 – 15.0 kg", "90 – 98 cm", "51 cm"],
                  ["3-4Y", "3–4 Years", "15.0 – 18.5 kg", "98 – 105 cm", "53 cm"],
                ].map(([size, ...vals]) => (
                  <tr key={size} className="border-t border-[#EDE8DF] even:bg-[#FAF9F5]/40 hover:bg-[#EBF5FB]/30 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-[#1E3E5B]">
                      <span className="px-2.5 py-1 rounded-lg bg-[#FFF0F3] text-[#FF758F] font-mono text-xs">{size}</span>
                    </td>
                    {vals.map((v, i) => <td key={i} className="px-4 py-3.5 text-[#6C7A89]">{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Parent Sizing Tip */}
        <div className="bg-[#FFF9F0] border border-[#EDE8DF] rounded-3xl p-6 md:p-8 text-sm text-[#6C7A89] space-y-3 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-[#1E3E5B] text-base">
            <Heart className="w-5 h-5 text-[#FF758F] fill-[#FF758F]" />
            Parent Sizing Tip
          </div>
          <p className="leading-relaxed">
            Every baby grows at their own pace! If your baby is on the higher end of a weight or height bracket, we always recommend ordering one size up for comfortable growth room and diaper bulk.
          </p>
          <p className="leading-relaxed">
            If an item doesn't fit quite right, our <strong>7-Day Size Exchange</strong> policy has you covered. <a href="/contact" className="underline text-[#4A8DB7] font-bold hover:text-[#367299] transition-colors">Contact our support team</a> if you need personalized assistance picking sizes.
          </p>
        </div>

      </div>
    </div>
  )
}

