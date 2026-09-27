import { useState, useEffect } from "react"
import { X, Ruler, Sparkles } from "lucide-react"
import { BabyAssistantWidget } from "@/components/store/SizeQuiz"

type SizeGuide = {
  unit: string
  columns: string[]
  rows: string[][]
  notes: string | null
}

export default function SizeGuideModal({ categoryId, sizeChartImage }: { categoryId: string; sizeChartImage?: string | null }) {
  const [open, setOpen] = useState(false)
  const [guide, setGuide] = useState<SizeGuide | null>(null)
  const [activeTab, setActiveTab] = useState<"assistant" | "chart">("assistant")

  useEffect(() => {
    if (open && !guide) {
      fetch(`/api/admin/size-guide?categoryId=${categoryId}`)
        .then(r => r.json())
        .then(d => { if (d && d.columns) setGuide(d) })
        .catch(() => {})
    }
  }, [open, categoryId, guide])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-[#4A8DB7] underline underline-offset-4 hover:text-[#367299] transition-colors flex items-center gap-1 font-semibold"
      >
        <Sparkles className="w-3.5 h-3.5" /> Size Guide & Assistant
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE8DF]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("assistant")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeTab === "assistant"
                      ? "bg-[#4A8DB7] text-white"
                      : "bg-[#FAF9F5] text-[#6C7A89] hover:text-[#1E3E5B]"
                  }`}
                >
                  ✨ Baby Assistant
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("chart")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeTab === "chart"
                      ? "bg-[#4A8DB7] text-white"
                      : "bg-[#FAF9F5] text-[#6C7A89] hover:text-[#1E3E5B]"
                  }`}
                >
                  📏 Size Chart
                </button>
              </div>
              <button onClick={() => setOpen(false)} className="text-[#6C7A89] hover:text-[#1E3E5B] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {activeTab === "assistant" ? (
                <BabyAssistantWidget
                  onSelect={(size) => {
                    const selectorEl = document.getElementById("variant-selector")
                    if (selectorEl) {
                      const btn = Array.from(selectorEl.querySelectorAll("button")).find(b => b.textContent?.trim() === size)
                      if (btn) (btn as HTMLButtonElement).click()
                    }
                    setOpen(false)
                  }}
                />
              ) : (
                <div className="space-y-6">
                  {sizeChartImage && (
                    <div className="rounded-2xl overflow-hidden border border-[#EDE8DF]">
                      <img src={sizeChartImage} alt="Size chart" className="w-full object-contain max-h-64" />
                    </div>
                  )}

                  {guide && (
                    <div className="overflow-x-auto rounded-2xl border border-[#EDE8DF]">
                      <table className="w-full text-sm">
                        <thead className="bg-[#FAF9F5] border-b border-[#EDE8DF]">
                          <tr>
                            {guide.columns.map((col, i) => (
                              <th key={i} className="py-3 px-3.5 text-left text-xs font-bold uppercase tracking-widest text-[#1E3E5B]">
                                {col} {i > 0 ? `(${guide.unit})` : ""}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {guide.rows.map((row, i) => (
                            <tr key={i} className="border-b border-[#EDE8DF] even:bg-[#FAF9F5]/40 hover:bg-[#EBF5FB]/30 transition-colors">
                              {row.map((cell, j) => (
                                <td key={j} className={`py-3 px-3.5 ${j === 0 ? "font-bold text-[#1E3E5B]" : "text-[#6C7A89]"}`}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {guide?.notes && (
                    <p className="text-xs text-[#6C7A89] border-t border-[#EDE8DF] pt-4 leading-relaxed">{guide.notes}</p>
                  )}

                  {!guide && !sizeChartImage && (
                    <div className="text-sm text-[#6C7A89] text-center py-8">
                      Standard Baby Sizing: 0-3M (3-5.5kg), 3-6M (5.5-7.5kg), 6-12M (7.5-9.5kg), 12-18M (9.5-11.5kg), 18-24M (11.5-13.5kg), 2-3Y (12.5-15kg), 3-4Y (15-18.5kg).
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
