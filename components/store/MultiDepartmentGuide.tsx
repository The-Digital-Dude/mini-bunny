"use client"

import { useState } from "react"
import { Sparkles, Baby, Moon, Milk, Car, CheckCircle2, ShieldCheck, Heart, Info, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function MultiDepartmentGuide() {
  const [activeTab, setActiveTab] = useState<"clothing" | "sleep" | "feeding" | "travel">("clothing")

  return (
    <div className="space-y-10">
      {/* Tab Navigation */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: "clothing", label: "Baby Clothing & Shoes", icon: "👕", desc: "0–5 Years" },
          { key: "sleep", label: "Swaddles & Sleep TOG", icon: "🌙", desc: "Room Temperature Guide" },
          { key: "feeding", label: "Bottle Nipple Stages", icon: "🍼", desc: "Flow Rates 0–12M+" },
          { key: "travel", label: "Carriers & Travel Gear", icon: "🚗", desc: "Ergonomics & Safety" },
        ].map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-3 rounded-2xl text-xs font-bold border transition-all shrink-0 flex items-center gap-2.5 ${
                isActive
                  ? "bg-[#1E3E5B] text-white border-[#1E3E5B] shadow-md scale-102"
                  : "bg-white text-[#6C7A89] border-[#EDE8DF] hover:bg-[#FAF9F5] hover:text-[#1E3E5B]"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <div className="text-left">
                <p className="leading-tight">{tab.label}</p>
                <p className={`text-[10px] font-normal ${isActive ? "text-white/80" : "text-[#6C7A89]"}`}>
                  {tab.desc}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* TAB 1: CLOTHING */}
      {activeTab === "clothing" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="p-5 rounded-3xl bg-white border border-[#EDE8DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-black text-lg text-[#1E3E5B]">
                  Baby & Toddler Apparel Size Chart
                </h3>
                <p className="text-xs text-[#6C7A89]">
                  Standard WHO Pediatric Growth Chart tailored for Mini Bunny 100% GOTS organic cotton garment specifications.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-[#EBF5FB] text-[#4A8DB7] rounded-full border border-[#4A8DB7]/20 shrink-0">
                0–5 Years
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#EDE8DF]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF9F5] border-b border-[#EDE8DF]">
                  <tr>
                    {["Size", "Age Range", "Weight (kg)", "Height / Length (cm)", "Chest (cm)", "Fit Tip"].map((h) => (
                      <th key={h} className="px-4 py-3 font-bold text-[#1E3E5B] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE8DF]">
                  {[
                    ["0-3M", "0–3 Months", "3.0 – 5.5 kg", "50 – 61 cm", "40 cm", "Fold-over scratch mittens"],
                    ["3-6M", "3–6 Months", "5.5 – 7.5 kg", "61 – 67 cm", "43 cm", "2-way diaper zip"],
                    ["6-12M", "6–12 Months", "7.5 – 9.5 kg", "67 – 76 cm", "46 cm", "Non-slip crawler knees"],
                    ["12-18M", "12–18 Months", "9.5 – 11.5 kg", "76 – 83 cm", "49 cm", "Roomy diaper bottom"],
                    ["18-24M", "18–24 Months", "11.5 – 13.5 kg", "83 – 90 cm", "52 cm", "Active stretch waist"],
                    ["2-3Y", "2–3 Years", "13.5 – 15.5 kg", "90 – 98 cm", "54 cm", "Easy pull-on design"],
                    ["3-4Y", "3–4 Years", "15.5 – 18.0 kg", "98 – 105 cm", "56 cm", "Pre-shrunk cotton"],
                    ["4-5Y", "4–5 Years", "18.0 – 21.0 kg", "105 – 112 cm", "58 cm", "Reinforced flatlock seams"],
                  ].map(([size, age, weight, height, chest, tip]) => (
                    <tr key={size} className="hover:bg-[#F0F7FB]/40 transition-colors">
                      <td className="px-4 py-3 font-bold text-[#1E3E5B]">
                        <span className="px-2.5 py-1 rounded-lg bg-[#EBF5FB] text-[#4A8DB7] font-mono text-xs font-bold">{size}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#1E3E5B]">{age}</td>
                      <td className="px-4 py-3 text-[#6C7A89]">{weight}</td>
                      <td className="px-4 py-3 text-[#6C7A89]">{height}</td>
                      <td className="px-4 py-3 text-[#6C7A89]">{chest}</td>
                      <td className="px-4 py-3 text-[#4A8DB7] font-medium">{tip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SWADDLES & SLEEP TOG */}
      {activeTab === "sleep" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="p-5 rounded-3xl bg-white border border-[#EDE8DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-black text-lg text-[#1E3E5B]">
                  Safe Sleepwear & TOG Rating Matrix
                </h3>
                <p className="text-xs text-[#6C7A89]">
                  TOG (Thermal Overall Grade) measures how warm a baby sleepbag or swaddle is. Use this temperature matrix to dress your baby safely.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-[#FFF0F3] text-[#FF758F] rounded-full border border-[#FF758F]/20 shrink-0">
                Safe Sleep Standards
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#FFF9F0] border border-[#FDE68A] space-y-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-[#D97706] border border-[#FDE68A]">
                  0.5 TOG · Summer
                </span>
                <h4 className="font-heading font-black text-base text-[#1E3E5B]">Warm / AC Rooms (24°C – 27°C)</h4>
                <p className="text-xs text-[#6C7A89]">Single layer organic bamboo/muslin. Dress baby in short-sleeve bodysuit or diaper only under the swaddle.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#EBF5FB] border border-[#BAE6FD] space-y-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-[#0284C7] border border-[#BAE6FD]">
                  1.0 TOG · All-Season
                </span>
                <h4 className="font-heading font-black text-base text-[#1E3E5B]">Standard Comfort (20°C – 23°C)</h4>
                <p className="text-xs text-[#6C7A89]">Double layer 100% GOTS cotton. Pair with a long-sleeve cotton sleepsuit or kimono bodysuit.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FFF0F3] border border-[#FECDD3] space-y-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-[#E11D48] border border-[#FECDD3]">
                  2.5 TOG · Cozy Winter
                </span>
                <h4 className="font-heading font-black text-base text-[#1E3E5B]">Cooler Weather (16°C – 19°C)</h4>
                <p className="text-xs text-[#6C7A89]">Plush wadded sleep bag with mittens. Keeps baby snug all night without dangerous loose blankets in the crib.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FEEDING NIPPLE STAGES */}
      {activeTab === "feeding" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="p-5 rounded-3xl bg-white border border-[#EDE8DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-black text-lg text-[#1E3E5B]">
                  Baby Bottle Nipple Flow Stages
                </h3>
                <p className="text-xs text-[#6C7A89]">
                  Anti-colic silicone nipples designed to mimic natural breastfeeding flow rates across developmental stages.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-[#F0FDF4] text-[#16A34A] rounded-full border border-[#16A34A]/20 shrink-0">
                100% BPA Free
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { stage: "Stage 1: Slow Flow", age: "0–3 Months (Newborn)", icon: "💧", desc: "Controlled slow droplet flow prevents gulping and gas in newborns with tender digestive systems." },
                { stage: "Stage 2: Medium Flow", age: "3–6 Months (Infant)", icon: "💧💧", desc: "Slightly faster flow as baby's sucking reflex strengthens and feed volume increases." },
                { stage: "Stage 3: Fast Flow", age: "6–12+ Months", icon: "💧💧💧", desc: "Fast steady flow for active babies taking larger milk feeds and water." },
                { stage: "Y-Cut: Variable Flow", age: "6M+ Thick Liquids", icon: "🥣", desc: "Cross-cut opening for thickened formula, cereal feeds, or purees without clogging." },
              ].map((item) => (
                <div key={item.stage} className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EDE8DF] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-[10px] font-bold bg-white text-[#1E3E5B] px-2 py-0.5 rounded-full border border-[#EDE8DF]">
                      {item.age}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#1E3E5B]">{item.stage}</h4>
                  <p className="text-[11px] text-[#6C7A89] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CARRIERS & TRAVEL */}
      {activeTab === "travel" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="p-5 rounded-3xl bg-white border border-[#EDE8DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-black text-lg text-[#1E3E5B]">
                  Ergonomic Baby Carrier & Travel Gear Guide
                </h3>
                <p className="text-xs text-[#6C7A89]">
                  Certified healthy hip positioning (M-Shape) and lumbar weight distribution guidelines for parents on the go.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-[#EEF2FF] text-[#4F46E5] rounded-full border border-[#4F46E5]/20 shrink-0">
                Hip Dysplasia Safe
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EDE8DF] space-y-2">
                <span className="text-xs font-bold text-[#4A8DB7] uppercase tracking-wider block">1. Inward Front Carry</span>
                <p className="font-bold text-xs text-[#1E3E5B]">0–6 Months (3.5 – 7.5 kg)</p>
                <p className="text-[11px] text-[#6C7A89]">Provides critical newborn head & neck support with knees higher than bottom in the natural 'M' frog position.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EDE8DF] space-y-2">
                <span className="text-xs font-bold text-[#FF758F] uppercase tracking-wider block">2. Outward Front Carry</span>
                <p className="font-bold text-xs text-[#1E3E5B]">6–12 Months (7.5 – 11.5 kg)</p>
                <p className="text-[11px] text-[#6C7A89]">Allows curious babies with steady head control to explore their surroundings during family strolls.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EDE8DF] space-y-2">
                <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider block">3. Back Carry</span>
                <p className="font-bold text-xs text-[#1E3E5B]">12–36 Months (10 – 20 kg)</p>
                <p className="text-[11px] text-[#6C7A89]">Ergonomic padded lumbar belt shifts toddler weight evenly to parent hips for strain-free long walks.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Shop Department Button */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1E3E5B] to-[#4A8DB7] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <h4 className="font-heading font-black text-lg">Ready to shop your baby&apos;s size?</h4>
          <p className="text-xs text-white/80 mt-0.5">
            Explore organic babywear, swaddles, feeding essentials, and safety gear.
          </p>
        </div>
        <Link
          href="/shop"
          className="px-6 py-3 bg-white hover:bg-[#FAF9F5] text-[#1E3E5B] font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <span>Explore All 9 Departments</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
