"use client"

import { useState } from "react"
import { useParentProfile, BabyGender, FitPreference, BabyChild } from "@/hooks/useParentProfile"
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
  Plus,
  Trash2,
  Gift,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import AuthPromptModal from "@/components/store/AuthPromptModal"

export default function ParentProfileCard({ compact = false }: { compact?: boolean }) {
  const {
    children,
    activeChild,
    activeChildId,
    setActiveChild,
    addChild,
    updateChild,
    removeChild,
    isLoaded,
    hasProfile,
    isAuthenticated,
    showAuthModal,
    setShowAuthModal,
  } = useParentProfile()

  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingChildId, setEditingChildId] = useState<string | null>(null)

  // Form State
  const [formName, setFormName] = useState("")
  const [formBirthday, setFormBirthday] = useState("")
  const [formGender, setFormGender] = useState<BabyGender>("Surprise")
  const [formFit, setFormFit] = useState<FitPreference>("standard")
  const [formNotes, setFormNotes] = useState("")

  const startAdd = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    setFormName("")
    setFormBirthday("")
    setFormGender("Surprise")
    setFormFit("standard")
    setFormNotes("")
    setIsAddingNew(true)
    setEditingChildId(null)
  }

  const startEdit = (child: BabyChild) => {
    setFormName(child.babyName)
    setFormBirthday(child.birthday)
    setFormGender(child.gender)
    setFormFit(child.fitPreference || "standard")
    setFormNotes(child.parentNotes || "")
    setEditingChildId(child.id)
    setIsAddingNew(false)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formBirthday) {
      toast.error("Please enter baby's name and birthdate")
      return
    }

    if (editingChildId) {
      updateChild(editingChildId, {
        babyName: formName,
        birthday: formBirthday,
        gender: formGender,
        fitPreference: formFit,
        parentNotes: formNotes,
      })
      toast.success(`Updated ${formName}'s profile! ✨`)
      setEditingChildId(null)
    } else {
      const created = addChild({
        babyName: formName,
        birthday: formBirthday,
        gender: formGender,
        fitPreference: formFit,
        parentNotes: formNotes,
      })
      if (created) {
        toast.success(`Added ${created.babyName} to your family! +100 VIP Points (৳50 value) 🎁`)
        setIsAddingNew(false)
      }
    }
  }

  if (!isLoaded) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-[#EDE8DF] animate-pulse">
        <div className="h-6 w-40 bg-[#FAF9F5] rounded-xl mb-4" />
        <div className="h-4 w-60 bg-[#FAF9F5] rounded-lg" />
      </div>
    )
  }

  // Active child milestone logic
  const currentChild = activeChild || children[0]

  return (
    <div className="bg-white rounded-3xl border border-[#EDE8DF] p-6 md:p-8 shadow-sm relative overflow-hidden space-y-6">
      {/* Background Pastel Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-[#FFF0F3]/50 to-[#F0F7FB]/50 blur-3xl pointer-events-none" />

      {/* Top Banner with VIP Perks */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EDE8DF]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-heading font-black text-[#1E3E5B]">
              My Family & Baby Profiles
            </h2>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#FFF0F3] text-[#FF758F] border border-[#FF758F]/30">
              {children.length} {children.length === 1 ? "Child" : "Children"}
            </span>
          </div>
          <p className="text-xs text-[#6C7A89] mt-0.5">
            Auto-sizes boutique items & unlocks ৳ rewards on every milestone.
          </p>
        </div>

        {!isAddingNew && !editingChildId && (
          <button
            onClick={startAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4A8DB7] hover:bg-[#367299] text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Child (+100 Pts / ৳50)</span>
          </button>
        )}
      </div>

      {/* Children Tab Switcher */}
      {children.length > 0 && !isAddingNew && !editingChildId && (
        <div className="flex flex-wrap gap-2">
          {children.map((child) => {
            const isSelected = child.id === activeChildId
            return (
              <button
                key={child.id}
                onClick={() => setActiveChild(child.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 ${
                  isSelected
                    ? "bg-[#1E3E5B] text-white border-[#1E3E5B] shadow-sm"
                    : "bg-[#FAF9F5] hover:bg-[#F0F7FB] text-[#6C7A89] border-[#EDE8DF]"
                }`}
              >
                <span>{child.gender === "Boy" ? "👦" : child.gender === "Girl" ? "👧" : "👶"}</span>
                <span>{child.babyName}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSelected ? "bg-white/20 text-white" : "bg-white text-[#4A8DB7]"}`}>
                  {child.recommendedSize}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Profile Active View */}
      {currentChild && !isAddingNew && !editingChildId && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Active Child Overview Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#FAF9F5] via-white to-[#F0F7FB] border border-[#EDE8DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-heading font-black text-xl shadow-xs shrink-0 ${
                  currentChild.gender === "Boy"
                    ? "bg-[#EBF5FB] text-[#4A8DB7]"
                    : currentChild.gender === "Girl"
                    ? "bg-[#FFF0F3] text-[#FF758F]"
                    : "bg-[#FFF9F0] text-[#D97706]"
                }`}
              >
                {currentChild.babyName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-heading font-black text-[#1E3E5B]">
                    {currentChild.babyName}
                  </h3>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      currentChild.gender === "Boy"
                        ? "bg-[#EBF5FB] text-[#4A8DB7]"
                        : currentChild.gender === "Girl"
                        ? "bg-[#FFF0F3] text-[#FF758F]"
                        : "bg-[#FFF9F0] text-[#D97706]"
                    }`}
                  >
                    {currentChild.gender}
                  </span>
                </div>
                <p className="text-xs text-[#6C7A89] flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-[#4A8DB7]" />
                  Born {new Date(currentChild.birthday).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => startEdit(currentChild)}
                className="px-3.5 py-1.5 border border-[#EDE8DF] hover:bg-white text-[#1E3E5B] text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#6C7A89]" /> Edit
              </button>
              {children.length > 1 && (
                <button
                  onClick={() => removeChild(currentChild.id)}
                  className="p-2 border border-[#EDE8DF] hover:border-red-300 hover:text-red-500 text-[#6C7A89] rounded-xl transition-colors"
                  title="Remove Profile"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Sizing & Milestones 3-Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EDE8DF] space-y-1">
              <span className="text-[10px] font-bold text-[#6C7A89] uppercase tracking-wider">Current Age</span>
              <p className="text-lg font-heading font-black text-[#1E3E5B]">{currentChild.calculatedAgeText}</p>
            </div>

            <div className="p-4 bg-[#EBF5FB] rounded-2xl border border-[#D0E8F7] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#4A8DB7] uppercase tracking-wider">Recommended Size</span>
                {currentChild.fitPreference === "roomy" && (
                  <span className="text-[9px] font-bold bg-[#FF758F] text-white px-1.5 py-0.2 rounded-md">Roomy Fit</span>
                )}
              </div>
              <p className="text-xl font-mono font-black text-[#1E3E5B]">{currentChild.recommendedSize}</p>
            </div>

            <div className="p-4 bg-[#FFF0F3] rounded-2xl border border-[#FFCCD5] space-y-1">
              <span className="text-[10px] font-bold text-[#FF758F] uppercase tracking-wider">Milestone Stage</span>
              <p className="text-sm font-bold text-[#1E3E5B]">
                {currentChild.ageMonths < 6 ? "Weaning & Rolling (6M)" : currentChild.ageMonths < 12 ? "Crawling & First Steps (1Y)" : "Active Toddler (2Y+)"}
              </p>
            </div>
          </div>

          {currentChild.parentNotes && (
            <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EDE8DF] text-xs text-[#6C7A89]">
              <span className="font-bold text-[#1E3E5B] block mb-1">Parent Preferences:</span>
              {currentChild.parentNotes}
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Link
              href={`/shop?size=${encodeURIComponent(currentChild.recommendedSize)}`}
              className="flex-1 py-3.5 bg-[#4A8DB7] hover:bg-[#367299] text-white font-bold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shop Curated Outfits in Size {currentChild.recommendedSize}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/size-guide"
              className="py-3.5 px-5 border border-[#EDE8DF] hover:bg-[#FAF9F5] text-[#1E3E5B] font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF758F]" />
              <span>Size Calculator</span>
            </Link>
          </div>
        </div>
      )}

      {/* Form View (Add / Edit) */}
      {(isAddingNew || editingChildId || children.length === 0) && (
        <form onSubmit={handleSave} className="space-y-4 bg-[#FAF9F5] p-5 rounded-2xl border border-[#EDE8DF] animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-[#EDE8DF]">
            <h3 className="font-bold text-sm text-[#1E3E5B]">
              {editingChildId ? "Edit Baby Profile" : "Add New Baby Profile"}
            </h3>
            {children.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false)
                  setEditingChildId(null)
                }}
                className="text-xs text-[#6C7A89] hover:text-[#1E3E5B]"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1E3E5B]">Baby's Name / Nickname *</label>
            <input
              type="text"
              required
              placeholder="e.g. Aria, Liam, Little Angel"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#EDE8DF] rounded-xl text-xs focus:outline-none focus:border-[#4A8DB7]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1E3E5B]">Birthday or Due Date *</label>
              <input
                type="date"
                required
                value={formBirthday}
                onChange={(e) => setFormBirthday(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#EDE8DF] rounded-xl text-xs focus:outline-none focus:border-[#4A8DB7]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1E3E5B]">Gender</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["Boy", "Girl", "Surprise"] as BabyGender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormGender(g)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      formGender === g
                        ? "bg-[#4A8DB7] text-white border-[#4A8DB7]"
                        : "bg-white text-[#6C7A89] border-[#EDE8DF] hover:bg-[#FAF9F5]"
                    }`}
                  >
                    {g === "Boy" ? "👦 Boy" : g === "Girl" ? "👧 Girl" : "✨ Surprise"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1E3E5B]">Fit Preference</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "slim", label: "Slim Fit" },
                { key: "standard", label: "True to Size" },
                { key: "roomy", label: "Roomy (+1 Size)" },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFormFit(f.key as FitPreference)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    formFit === f.key
                      ? "bg-[#FF758F] text-white border-[#FF758F]"
                      : "bg-white text-[#6C7A89] border-[#EDE8DF]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1E3E5B]">Special Notes / Sensitivities (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Sensitive to synthetic tags, loves soft pastel tones"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#EDE8DF] rounded-xl text-xs focus:outline-none focus:border-[#4A8DB7]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-[#4A8DB7] hover:bg-[#367299] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingChildId ? "Save Profile Changes" : "Save & Earn 100 VIP Points (৳50)"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Dedicated Auth Gate Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectUrl="/account"
      />
    </div>
  )
}
