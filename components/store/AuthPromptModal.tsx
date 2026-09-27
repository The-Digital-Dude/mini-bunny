"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { Sparkles, Baby, CheckCircle2, X, LogIn, UserPlus } from "lucide-react"

export default function AuthPromptModal({
  isOpen,
  onClose,
  redirectUrl = "/account",
  title = "Sign In to Add Baby Profile",
  description = "Create a free parent account to save your baby's milestones, unlock smart size recommendations, and earn VIP rewards!",
}: {
  isOpen: boolean
  onClose: () => void
  redirectUrl?: string
  title?: string
  description?: string
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl border border-[#EDE8DF] shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pastel Glow Background */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-gradient-to-br from-[#FFF0F3] to-[#F0F7FB] blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#6C7A89] hover:text-[#1E3E5B] hover:bg-[#FAF9F5] rounded-full transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFF0F3] to-[#F0F7FB] border border-[#FFCCD5] flex items-center justify-center mx-auto text-[#FF758F] shadow-sm">
            <Baby className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] text-[#FF758F] text-[11px] font-bold border border-[#FF758F]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mini Bunny VIP Club Perk</span>
            </div>
            <h3 className="text-xl font-heading font-black text-[#1E3E5B]">
              {title}
            </h3>
            <p className="text-xs text-[#6C7A89] leading-relaxed">
              {description}
            </p>
          </div>

          {/* VIP Perks List */}
          <div className="bg-[#FAF9F5] border border-[#EDE8DF] rounded-2xl p-4 text-left space-y-2.5 text-xs text-[#1E3E5B]">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF758F] shrink-0" />
              <span>
                Earn <strong>100 VIP Points (৳50 value)</strong> on your first profile
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#4A8DB7] shrink-0" />
              <span>
                Personalized <strong>exact size picks</strong> across every outfit
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Automatic <strong>birthday month treats</strong> & milestone vouchers
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <Link
              href={`/register?redirect=${encodeURIComponent(redirectUrl)}`}
              onClick={onClose}
              className="w-full py-3.5 bg-[#4A8DB7] hover:bg-[#367299] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Free Parent Account (+100 Pts)</span>
            </Link>

            <Link
              href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
              onClick={onClose}
              className="w-full py-3 bg-white hover:bg-[#FAF9F5] border border-[#EDE8DF] text-[#1E3E5B] font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-[#6C7A89]" />
              <span>Sign In to Existing Account</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
