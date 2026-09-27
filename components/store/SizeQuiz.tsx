"use client"

import { useState } from "react"
import { Sparkles, Ruler, Weight, Calendar, Check, RotateCcw, ArrowRight, X } from "lucide-react"
import { BunnyIcon } from "./BunnyLogo"

export type BabyAssistantInput = {
  ageMonths: number
  weightKg: number
  heightCm?: number
}

export type BabySizeRecommendation = {
  sizeCode: string
  sizeLabel: string
  fitNote: string
  ageRange: string
  weightRange: string
  heightRange: string
}

export function calculateBabySize(input: BabyAssistantInput): BabySizeRecommendation {
  const { ageMonths, weightKg, heightCm } = input

  // Sizing standard thresholds (weight and height weighted with room-to-grow preference)
  if (weightKg >= 14.5 || (heightCm && heightCm >= 98) || ageMonths >= 30) {
    return {
      sizeCode: "3-4Y",
      sizeLabel: "3-4 Years",
      fitNote: "Provides optimal mobility and relaxed chest room for active toddlers.",
      ageRange: "3–4 Years",
      weightRange: "15.0 – 18.5 kg",
      heightRange: "98 – 105 cm",
    }
  }

  if (weightKg >= 12.5 || (heightCm && heightCm >= 88) || ageMonths >= 20) {
    return {
      sizeCode: "2-3Y",
      sizeLabel: "2-3 Years",
      fitNote: "Perfect for growing toddlers with plenty of comfort and flexible stretch.",
      ageRange: "2–3 Years",
      weightRange: "12.5 – 15.0 kg",
      heightRange: "90 – 98 cm",
    }
  }

  if (weightKg >= 10.5 || (heightCm && heightCm >= 80) || ageMonths >= 15) {
    return {
      sizeCode: "18-24M",
      sizeLabel: "18-24 Months",
      fitNote: "Designed with diaper room and extra leg length for crawling & early walking.",
      ageRange: "18–24 Months",
      weightRange: "11.0 – 13.5 kg",
      heightRange: "83 – 90 cm",
    }
  }

  if (weightKg >= 9.0 || (heightCm && heightCm >= 74) || ageMonths >= 10) {
    return {
      sizeCode: "12-18M",
      sizeLabel: "12-18 Months",
      fitNote: "Great for active exploration with non-binding cuffs and comfortable torso length.",
      ageRange: "12–18 Months",
      weightRange: "9.5 – 11.5 kg",
      heightRange: "76 – 83 cm",
    }
  }

  // Example match: 5 months, 7kg -> Recommended 6-12 Months
  if (weightKg >= 6.8 || (heightCm && heightCm >= 66) || ageMonths >= 5) {
    return {
      sizeCode: "6-12M",
      sizeLabel: "6-12 Months",
      fitNote: "Recommended size ensures a cozy, non-restrictive fit with comfortable room for growth and cloth/disposable diapers.",
      ageRange: "6–12 Months",
      weightRange: "7.5 – 9.5 kg",
      heightRange: "67 – 76 cm",
    }
  }

  if (weightKg >= 5.0 || (heightCm && heightCm >= 60) || ageMonths >= 2.5) {
    return {
      sizeCode: "3-6M",
      sizeLabel: "3-6 Months",
      fitNote: "Snug, ultra-soft fit with foldover scratch mittens and gentle neckline.",
      ageRange: "3–6 Months",
      weightRange: "5.5 – 7.5 kg",
      heightRange: "61 – 67 cm",
    }
  }

  return {
    sizeCode: "0-3M",
    sizeLabel: "0-3 Months (Newborn)",
    fitNote: "Tailored for delicate newborns with gentle umbilical cord protection and easy-snap access.",
    ageRange: "0–3 Months",
    weightRange: "3.0 – 5.5 kg",
    heightRange: "50 – 61 cm",
  }
}

export function BabyAssistantWidget({
  onSelect,
  onFilterShop,
  embedded = false,
}: {
  onSelect?: (size: string) => void
  onFilterShop?: (size: string) => void
  embedded?: boolean
}) {
  const [ageMonths, setAgeMonths] = useState<number>(5)
  const [weightKg, setWeightKg] = useState<number>(7.0)
  const [heightCm, setHeightCm] = useState<number>(66)
  const [hasCalculated, setHasCalculated] = useState(false)
  const [result, setResult] = useState<BabySizeRecommendation | null>(null)

  const handleCalculate = () => {
    const rec = calculateBabySize({ ageMonths, weightKg, heightCm })
    setResult(rec)
    setHasCalculated(true)
  }

  const handleReset = () => {
    setHasCalculated(false)
    setResult(null)
  }

  return (
    <div className={`w-full bg-white rounded-3xl ${embedded ? "border border-[#EDE8DF] p-6 md:p-8 shadow-sm" : "p-6"}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-[#EBF5FB] flex items-center justify-center shrink-0">
          <BunnyIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-heading font-extrabold text-lg md:text-xl text-[#1E3E5B] flex items-center gap-2">
            Mini Bunny Baby Assistant
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FFF0F3] text-[#FF758F]">
              Smart Fit
            </span>
          </h3>
          <p className="text-xs text-[#6C7A89]">
            Accurate size recommendations based on your baby's age, weight, and height.
          </p>
        </div>
      </div>

      {!hasCalculated ? (
        <div className="space-y-6">
          {/* Input 1: Age */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs font-bold text-[#1E3E5B]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#4A8DB7]" /> Baby Age
              </span>
              <span className="font-mono text-sm px-2.5 py-0.5 rounded-lg bg-[#EBF5FB] text-[#4A8DB7]">
                {ageMonths < 12 ? `${ageMonths} Months` : `${(ageMonths / 12).toFixed(1)} Years (${ageMonths}m)`}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="48"
              step="1"
              value={ageMonths}
              onChange={(e) => setAgeMonths(Number(e.target.value))}
              className="w-full accent-[#4A8DB7] cursor-pointer"
            />

            {/* Quick Age Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: "Newborn", m: 1 },
                { label: "3 Mo", m: 3 },
                { label: "5 Mo", m: 5 },
                { label: "9 Mo", m: 9 },
                { label: "12 Mo", m: 12 },
                { label: "18 Mo", m: 18 },
                { label: "2 Yrs", m: 24 },
                { label: "3 Yrs", m: 36 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setAgeMonths(p.m)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                    ageMonths === p.m
                      ? "bg-[#4A8DB7] text-white border-[#4A8DB7]"
                      : "bg-[#FAF9F5] text-[#6C7A89] border-[#EDE8DF] hover:border-[#4A8DB7]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input 2: Weight */}
          <div className="space-y-2.5 pt-2 border-t border-[#EDE8DF]">
            <div className="flex justify-between items-center text-xs font-bold text-[#1E3E5B]">
              <span className="flex items-center gap-1.5">
                <Weight className="w-3.5 h-3.5 text-[#FF758F]" /> Baby Weight
              </span>
              <span className="font-mono text-sm px-2.5 py-0.5 rounded-lg bg-[#FFF0F3] text-[#FF758F]">
                {weightKg.toFixed(1)} kg
              </span>
            </div>

            <input
              type="range"
              min="2.5"
              max="20"
              step="0.5"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full accent-[#FF758F] cursor-pointer"
            />

            {/* Quick Weight Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[4.0, 5.5, 7.0, 8.5, 10.0, 12.0, 14.5].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeightKg(w)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                    weightKg === w
                      ? "bg-[#FF758F] text-white border-[#FF758F]"
                      : "bg-[#FAF9F5] text-[#6C7A89] border-[#EDE8DF] hover:border-[#FF758F]"
                  }`}
                >
                  {w} kg
                </button>
              ))}
            </div>
          </div>

          {/* Input 3: Height */}
          <div className="space-y-2.5 pt-2 border-t border-[#EDE8DF]">
            <div className="flex justify-between items-center text-xs font-bold text-[#1E3E5B]">
              <span className="flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-[#4A8DB7]" /> Baby Height / Length
              </span>
              <span className="font-mono text-sm px-2.5 py-0.5 rounded-lg bg-[#EBF5FB] text-[#4A8DB7]">
                {heightCm} cm
              </span>
            </div>

            <input
              type="range"
              min="45"
              max="115"
              step="1"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full accent-[#4A8DB7] cursor-pointer"
            />
          </div>

          {/* Calculate Button */}
          <button
            type="button"
            onClick={handleCalculate}
            className="w-full py-4 bg-[#4A8DB7] hover:bg-[#367299] text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Find Recommended Size
          </button>
        </div>
      ) : (
        /* Result Screen */
        <div className="space-y-6 text-center animate-in fade-in duration-300">
          <div className="bg-[#FAF9F5] border border-[#EDE8DF] rounded-3xl p-6 md:p-8 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] text-[#FF758F] font-bold text-xs uppercase tracking-wider">
              ✨ Best Fit Recommendation
            </span>

            <div className="pt-2">
              <p className="text-4xl md:text-5xl font-heading font-black text-[#1E3E5B] tracking-tight">
                {result?.sizeLabel}
              </p>
              <p className="font-mono text-sm font-bold text-[#4A8DB7] mt-1">
                Size Code: <span className="bg-[#EBF5FB] px-2.5 py-0.5 rounded-md">{result?.sizeCode}</span>
              </p>
            </div>

            <p className="text-xs md:text-sm text-[#6C7A89] max-w-md mx-auto pt-2 leading-relaxed">
              {result?.fitNote}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#EDE8DF] text-[11px] text-[#6C7A89]">
              <div className="p-2 bg-white rounded-xl border border-[#EDE8DF]">
                <p className="font-bold text-[#1E3E5B]">Age</p>
                <p>{result?.ageRange}</p>
              </div>
              <div className="p-2 bg-white rounded-xl border border-[#EDE8DF]">
                <p className="font-bold text-[#1E3E5B]">Weight</p>
                <p>{result?.weightRange}</p>
              </div>
              <div className="p-2 bg-white rounded-xl border border-[#EDE8DF]">
                <p className="font-bold text-[#1E3E5B]">Length</p>
                <p>{result?.heightRange}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {onSelect && result && (
              <button
                type="button"
                onClick={() => onSelect(result.sizeCode)}
                className="flex-1 py-3.5 bg-[#4A8DB7] hover:bg-[#367299] text-white font-bold rounded-2xl transition-colors text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <Check className="w-4 h-4" />
                Select Size {result.sizeCode}
              </button>
            )}

            {onFilterShop && result && (
              <button
                type="button"
                onClick={() => onFilterShop(result.sizeCode)}
                className="flex-1 py-3.5 bg-[#FF758F] hover:bg-[#F45D7B] text-white font-bold rounded-2xl transition-colors text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                Filter Shop ({result.sizeCode}) <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="py-3.5 px-6 border border-[#EDE8DF] hover:bg-[#FAF9F5] text-[#1E3E5B] font-bold rounded-2xl transition-colors text-sm flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4 text-[#6C7A89]" />
              Adjust
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SizeQuiz({
  onSelect,
  buttonText = "Baby Size Assistant",
  variant = "inline",
}: {
  onSelect?: (size: string) => void
  buttonText?: string
  variant?: "inline" | "button" | "pill"
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {variant === "pill" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EBF5FB] hover:bg-[#D8EDF8] text-[#4A8DB7] text-xs font-bold rounded-full transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {buttonText}
        </button>
      ) : variant === "button" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full py-2.5 px-4 bg-[#FAF9F5] hover:bg-[#EBF5FB] border border-[#EDE8DF] hover:border-[#4A8DB7] text-[#1E3E5B] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <BunnyIcon className="w-4 h-4" />
          {buttonText}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A8DB7] hover:text-[#367299] underline transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {buttonText}
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-lg shadow-2xl rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-5 right-5 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#6C7A89] hover:text-[#1E3E5B] flex items-center justify-center shadow-sm transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <BabyAssistantWidget
              onSelect={(size) => {
                if (onSelect) {
                  onSelect(size)
                } else {
                  const selectorEl = document.getElementById("variant-selector")
                  if (selectorEl) {
                    const btn = Array.from(selectorEl.querySelectorAll("button")).find(
                      (b) => b.textContent?.trim().startsWith(size) || b.textContent?.trim() === size
                    )
                    if (btn) (btn as HTMLButtonElement).click()
                  }
                }
                setOpen(false)
              }}
              onFilterShop={(size) => {
                window.location.href = `/shop?size=${encodeURIComponent(size)}`
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
