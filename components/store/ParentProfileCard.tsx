"use client"

import { useState } from "react"
import { useParentProfile, BabyGender } from "@/hooks/useParentProfile"
import { BunnyIcon } from "@/components/store/BunnyLogo"
import {
  Calendar,
  Sparkles,
  Heart,
  Baby,
  Edit2,
  Check,
  RotateCcw,
  ShoppingBag,
  ArrowRight,
  Info,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function ParentProfileCard({ compact = false }: { compact?: boolean }) {
  const { profile, isLoaded, hasProfile, saveProfile, clearProfile } = useParentProfile()
  const [isEditing, setIsEditing] = useState(!hasProfile)
  const [babyName, setBabyName] = useState(profile?.babyName || "")
  const [birthday, setBirthday] = useState(profile?.birthday || "")
  const [gender, setGender] = useState<BabyGender>(profile?.gender || "Surprise")
  const [parentNotes, setParentNotes] = useState(profile?.parentNotes || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!babyName.trim()) {
      toast.error("Please enter your baby's name.")
      return
    }
    if (!birthday) {
      toast.error("Please select your baby's birthday or due date.")
      return
    }

    saveProfile({
      babyName,
      birthday,
      gender,
      parentNotes,
    })

    setIsEditing(false)
    toast.success(`Saved profile for ${babyName}! ✨`, {
      description: `Smart recommendations will now tailor to ${babyName}'s stage.`,
    })
  }

  if (!isLoaded) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-[#EDE8DF] animate-pulse">
        <div className="h-6 w-40 bg-[#FAF9F5] rounded-xl mb-4" />
        <div className="h-4 w-60 bg-[#FAF9F5] rounded-lg" />
      </div>
    )
  }

  if (hasProfile && profile && !isEditing) {
    return (
      <div className="bg-white rounded-3xl border border-[#EDE8DF] p-6 md:p-8 shadow-sm relative overflow-hidden space-y-6">
        {/* Background Pastel Aura */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#FFF0F3]/40 blur-2xl pointer-events-none" />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EDE8DF] pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF5FB] text-[#4A8DB7] flex items-center justify-center shadow-sm shrink-0">
              <BunnyIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-heading font-black text-[#1E3E5B]">
                  {profile.babyName}'s Profile
                </h2>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    profile.gender === "Boy"
                      ? "bg-[#EBF5FB] text-[#4A8DB7]"
                      : profile.gender === "Girl"
                      ? "bg-[#FFF0F3] text-[#FF758F]"
                      : "bg-[#FFF9F0] text-[#D97706]"
                  }`}
                >
                  {profile.gender}
                </span>
              </div>
              <p className="text-xs text-[#6C7A89] flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#4A8DB7]" />
                Born on {new Date(profile.birthday).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setBabyName(profile.babyName)
              setBirthday(profile.birthday)
              setGender(profile.gender)
              setParentNotes(profile.parentNotes || "")
              setIsEditing(true)
            }}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-[#EDE8DF] hover:bg-[#FAF9F5] text-[#1E3E5B] text-xs font-bold rounded-xl transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#6C7A89]" /> Edit Profile
          </button>
        </div>

        {/* Milestone & Recommended Sizing Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EDE8DF] space-y-1">
            <span className="text-[10px] font-bold text-[#6C7A89] uppercase tracking-wider">Current Age</span>
            <p className="text-lg font-heading font-black text-[#1E3E5B]">{profile.calculatedAgeText}</p>
          </div>

          <div className="p-4 bg-[#EBF5FB] rounded-2xl border border-[#D0E8F7] space-y-1">
            <span className="text-[10px] font-bold text-[#4A8DB7] uppercase tracking-wider">Recommended Size</span>
            <p className="text-lg font-mono font-black text-[#1E3E5B]">{profile.recommendedSize}</p>
          </div>

          <div className="p-4 bg-[#FFF0F3] rounded-2xl border border-[#FFCCD5] space-y-1">
            <span className="text-[10px] font-bold text-[#FF758F] uppercase tracking-wider">Next Milestone</span>
            <p className="text-sm font-bold text-[#1E3E5B]">
              {profile.ageMonths < 6 ? "Weaning & Rolling (6M)" : profile.ageMonths < 12 ? "Crawling to First Steps (1Y)" : "Active Toddler (2Y)"}
            </p>
          </div>
        </div>

        {profile.parentNotes && (
          <div className="p-4 bg-white rounded-2xl border border-[#EDE8DF] text-xs text-[#6C7A89]">
            <span className="font-bold text-[#1E3E5B] block mb-1">Parent Notes:</span>
            {profile.parentNotes}
          </div>
        )}

        {/* Action Shortcuts */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={`/shop?size=${encodeURIComponent(profile.recommendedSize)}`}
            className="flex-1 py-3 bg-[#4A8DB7] hover:bg-[#367299] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Shop Size {profile.recommendedSize} for {profile.babyName}
          </Link>
          <Link
            href="/size-guide"
            className="py-3 px-5 border border-[#EDE8DF] hover:bg-[#FAF9F5] text-[#1E3E5B] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF758F]" /> Size Assistant
          </Link>
        </div>
      </div>
    )
  }

  // Edit / Create Mode
  return (
    <div className="bg-white rounded-3xl border border-[#EDE8DF] p-6 md:p-8 shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#FFF0F3] text-[#FF758F] flex items-center justify-center">
          <Heart className="w-5 h-5 fill-[#FF758F]" />
        </div>
        <div>
          <h2 className="text-xl font-heading font-black text-[#1E3E5B]">
            {hasProfile ? `Edit ${profile?.babyName}'s Info` : "Create Parent & Baby Profile"}
          </h2>
          <p className="text-xs text-[#6C7A89]">
            Save your little one's details to get personalized size recommendations and age-stage reminders.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Baby Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#1E3E5B]">Baby's Name / Nickname *</label>
          <input
            type="text"
            required
            placeholder="e.g. Ryan, Zaara, Aayan"
            value={babyName}
            onChange={(e) => setBabyName(e.target.value)}
            className="w-full px-4 py-3 bg-[#FAF9F5] border border-[#EDE8DF] rounded-2xl text-xs text-[#1E3E5B] focus:bg-white focus:outline-none focus:border-[#4A8DB7] transition-all"
          />
        </div>

        {/* Birthday & Gender Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1E3E5B]">Birthday or Due Date *</label>
            <input
              type="date"
              required
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full px-4 py-3 bg-[#FAF9F5] border border-[#EDE8DF] rounded-2xl text-xs text-[#1E3E5B] focus:bg-white focus:outline-none focus:border-[#4A8DB7] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1E3E5B]">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Boy", "Girl", "Surprise"] as BabyGender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-3 text-xs font-bold rounded-2xl border transition-all ${
                    gender === g
                      ? "bg-[#4A8DB7] text-white border-[#4A8DB7] shadow-sm"
                      : "bg-[#FAF9F5] text-[#6C7A89] border-[#EDE8DF] hover:border-[#4A8DB7]"
                  }`}
                >
                  {g === "Boy" ? "👦 Boy" : g === "Girl" ? "👧 Girl" : "✨ Surprise"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes (Allergies, preferences) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#1E3E5B]">Special Notes (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Sensitive to synthetic fabrics, loves pastel yellow"
            value={parentNotes}
            onChange={(e) => setParentNotes(e.target.value)}
            className="w-full px-4 py-3 bg-[#FAF9F5] border border-[#EDE8DF] rounded-2xl text-xs text-[#1E3E5B] focus:bg-white focus:outline-none focus:border-[#4A8DB7] transition-all"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-3.5 bg-[#4A8DB7] hover:bg-[#367299] text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> Save Baby Profile
          </button>
          {hasProfile && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="py-3.5 px-5 border border-[#EDE8DF] hover:bg-[#FAF9F5] text-[#6C7A89] font-bold text-xs rounded-2xl transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
