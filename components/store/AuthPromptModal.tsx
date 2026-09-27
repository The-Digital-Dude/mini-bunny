"use client"

import Link from "next/link"
import { Sparkles, Heart, Baby, CheckCircle2, X, ArrowRight, LogIn, UserPlus } from "lucide-react"

export default function AuthPromptModal({
  isOpen,
  onClose,
  redirectUrl = "/account",
}: {
  isOpen: boolean
  onClose: () => void
  redirectUrl?: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl border border-[#EDE8DF] shadow-2xl p-6 md:p-8 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pastel Aura Background */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-gradient-to-br from-[#FFF0F3] to-[#F0F7FB] blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#6C7A89] hover:text-[#1E3E5B] hover:bg-[#FAF9F5] rounded-full transition-colors"
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
              Sign In to Add Baby Profile
            </h3>
            <p className="text-xs text-[#6C7A89] leading-relaxed">
              Create a free parent account to save your baby&apos;s milestones, unlock smart size recommendations, and earn VIP rewards!
            </p>
          </div>

          {/* VIP Perks List */}
          <div className="bg-[#FAF9F5] border border-[#EDE8DF] rounded-2xl p-3.5 text-left space-y-2.5 text-xs text-[#1E3E5B]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF758F] shrink-0" />
              <span>
                Earn <strong>100 VIP Points (৳50 value)</strong> on your first profile
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4A8DB7] shrink-0" />
              <span>
                Personalized <strong>exact size picks</strong> across every outfit
              </span>
            </div>
            <div className="flex items-center gap-2">
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
}
