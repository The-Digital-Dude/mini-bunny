"use client"

import { useState, useRef, useEffect } from "react"
import { useParentProfile, BabyGender, FitPreference } from "@/hooks/useParentProfile"
import { Baby, Plus, Check, ChevronDown, Sparkles, Heart, Trash2, Lock } from "lucide-react"
import AuthPromptModal from "@/components/store/AuthPromptModal"
import { toast } from "sonner"

export default function ChildSwitcher({ className = "" }: { className?: string }) {
  const {
    children,
    activeChild,
    activeChildId,
    setActiveChild,
    addChild,
    removeChild,
    isLoaded,
    isAuthenticated,
    showAuthModal,
    setShowAuthModal,
  } = useParentProfile()

  const [isOpen, setIsOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [name, setName] = useState("")
  const [birthday, setBirthday] = useState("")
  const [gender, setGender] = useState<BabyGender>("Surprise")
  const [fitPref, setFitPref] = useState<FitPreference>("standard")
  const containerRef = useRef<HTMLDivElement>(null)

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowAddForm(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  if (!isLoaded) return null

  const handleOpenAdd = () => {
    if (!isAuthenticated) {
      setIsOpen(false)
      setShowAuthModal(true)
      return
    }
    setShowAddForm(true)
  }

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      setIsOpen(false)
      setShowAuthModal(true)
      return
    }

    if (!name.trim() || !birthday) {
      toast.error("Please enter your baby's name and birthdate")
      return
    }

    const newChild = addChild({
      babyName: name,
      birthday,
      gender,
      fitPreference: fitPref,
    })

    if (newChild) {
      toast.success(`Profile saved for ${newChild.babyName}! +100 VIP Points earned 🎁`)
      setName("")
      setBirthday("")
      setShowAddForm(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <div ref={containerRef} className={`relative inline-block ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-xs ${
            activeChild
              ? "bg-[#FFF0F3] border-[#FF758F]/30 text-[#FF758F] hover:bg-[#FFE3E8]"
              : "bg-[#FAF9F5] border-[#EDE8DF] text-[#1E3E5B] hover:bg-[#F0F7FB] hover:text-[#4A8DB7]"
          }`}
          aria-label="Baby Profile Switcher"
        >
          <Baby className="w-3.5 h-3.5" />
          <span className="truncate max-w-[120px] sm:max-w-[160px]">
            {activeChild ? `${activeChild.babyName} (${activeChild.recommendedSize})` : "Add Baby Profile"}
          </span>
          <ChevronDown className={`w-3 h-3 opacity-60 ml-0.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 p-0 rounded-3xl border border-[#EDE8DF] bg-white shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#FAF9F5] to-[#FFF0F3] border-b border-[#EDE8DF]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#FF758F]" />
                  <span className="font-heading font-black text-xs uppercase tracking-wider text-[#1E3E5B]">
                    Baby Profiles
                  </span>
                </div>
                <span className="text-[10px] font-extrabold bg-[#FF758F] text-white px-2 py-0.5 rounded-full shadow-2xs">
                  +100 VIP Pts / baby
                </span>
              </div>
              <p className="text-[11px] text-[#6C7A89] mt-1">
                Personalizes recommended sizes and curated outfits across the boutique.
              </p>
            </div>

            {/* Child List */}
            {!showAddForm && (
              <div className="p-3 space-y-1.5 max-h-64 overflow-y-auto">
                {children.length === 0 ? (
                  <div className="text-center py-5 px-3 text-xs text-[#6C7A89]">
                    <Baby className="w-8 h-8 text-[#6C7A89]/40 mx-auto mb-2" />
                    <p className="font-bold text-[#1E3E5B]">No baby profiles yet</p>
                    <p className="text-[11px] mt-0.5 mb-3">
                      {isAuthenticated
                        ? "Add your little one for smart size picks!"
                        : "Sign in to your parent account to save your baby's milestones!"}
                    </p>
                  </div>
                ) : (
                  children.map((child) => {
                    const isSelected = child.id === activeChildId
                    return (
                      <div
                        key={child.id}
                        onClick={() => {
                          setActiveChild(child.id)
                          setIsOpen(false)
                          toast.success(`Switched boutique size guide to ${child.babyName}`)
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all border ${
                          isSelected
                            ? "bg-[#FFF0F3] border-[#FF758F]/40 text-[#1E3E5B]"
                            : "bg-white hover:bg-[#FAF9F5] border-transparent text-[#6C7A89]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              child.gender === "Boy"
                                ? "bg-[#F0F7FB] text-[#4A8DB7]"
                                : child.gender === "Girl"
                                ? "bg-[#FFF0F3] text-[#FF758F]"
                                : "bg-[#FFF9F0] text-[#E0A96D]"
                            }`}
                          >
                            {child.babyName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-xs text-[#1E3E5B] truncate">{child.babyName}</p>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#FF758F] shrink-0" />}
                            </div>
                            <p className="text-[10px] text-[#6C7A89]">
                              {child.calculatedAgeText} · Size <span className="font-bold text-[#4A8DB7]">{child.recommendedSize}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {children.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeChild(child.id)
                              }}
                              className="p-1 hover:text-red-500 text-[#6C7A89]/50 transition-colors"
                              title="Remove profile"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}

                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="w-full mt-2 py-2.5 px-3 border border-dashed border-[#4A8DB7]/40 hover:border-[#4A8DB7] bg-[#F0F7FB]/50 hover:bg-[#F0F7FB] text-[#4A8DB7] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  {isAuthenticated ? (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Child (+100 Pts)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Sign In to Add Baby Profile (+100 Pts)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Add Child Form (Authenticated Only) */}
            {showAddForm && isAuthenticated && (
              <form onSubmit={handleAddChild} className="p-4 space-y-3 bg-[#FAF9F5]">
                <div className="flex items-center justify-between pb-1 border-b border-[#EDE8DF]">
                  <span className="text-xs font-bold text-[#1E3E5B]">New Baby Profile</span>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-[11px] text-[#6C7A89] hover:text-[#1E3E5B]"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1E3E5B] block mb-1">Baby Name or Nickname</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aria, Liam, Little Angel"
                    required
                    className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#EDE8DF] focus:outline-none focus:border-[#4A8DB7]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1E3E5B] block mb-1">Birthdate or Due Date</label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#EDE8DF] focus:outline-none focus:border-[#4A8DB7]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1E3E5B] block mb-1">Gender</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["Boy", "Girl", "Surprise"] as BabyGender[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                          gender === g
                            ? "bg-[#4A8DB7] text-white border-[#4A8DB7]"
                            : "bg-white text-[#6C7A89] border-[#EDE8DF] hover:bg-[#FAF9F5]"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1E3E5B] block mb-1">Fit Preference</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { key: "slim", label: "Slim" },
                      { key: "standard", label: "True Size" },
                      { key: "roomy", label: "Roomy (+1 Size)" },
                    ].map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setFitPref(f.key as FitPreference)}
                        className={`py-1.5 text-[10px] font-bold rounded-xl border transition-all ${
                          fitPref === f.key
                            ? "bg-[#FF758F] text-white border-[#FF758F]"
                            : "bg-white text-[#6C7A89] border-[#EDE8DF] hover:bg-[#FAF9F5]"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#4A8DB7] hover:bg-[#3d779c] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>Save & Earn 100 VIP Points</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Dedicated Auth Gate Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectUrl="/account"
      />
    </>
  )
}
