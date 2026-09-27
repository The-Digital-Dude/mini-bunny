"use client"

import Link from "next/link"
import { ArrowRight, Baby, Sparkles, Heart, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useParentProfile, BabyGender, FitPreference } from "@/hooks/useParentProfile"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const { addChild } = useParentProfile()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<"google" | "facebook" | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Optional Baby Profile
  const [includeBaby, setIncludeBaby] = useState(false)
  const [babyName, setBabyName] = useState("")
  const [babyBirthday, setBabyBirthday] = useState("")
  const [babyGender, setBabyGender] = useState<BabyGender>("Surprise")
  const [babyFitPref, setBabyFitPref] = useState<FitPreference>("standard")

  async function handleOAuth(provider: "google" | "facebook") {
    setOauthLoading(provider)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!name) newErrors.name = "Full Name is required"
    if (!email) newErrors.email = "Email Address is required"
    if (!phone) newErrors.phone = "Phone Number is required"
    if (!password) newErrors.password = "Password is required"
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters"

    if (includeBaby && (!babyName.trim() || !babyBirthday)) {
      newErrors.baby = "Please provide your baby's name and birthdate, or uncheck the baby profile option"
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill in all required fields correctly")
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone } },
      })

      if (error) {
        toast.error(error.message || "Registration failed")
        return
      }
      if (!data.user) {
        toast.error("Registration failed")
        return
      }

      // Save baby profile if provided
      if (includeBaby && babyName.trim() && babyBirthday) {
        try {
          addChild({
            babyName: babyName.trim(),
            birthday: babyBirthday,
            gender: babyGender,
            fitPreference: babyFitPref,
          })
        } catch {}
      }

      // Create matching Prisma profile
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data.user.id,
          name,
          email,
          phone,
          babyProfile: includeBaby && babyName ? {
            name: babyName,
            birthday: babyBirthday,
            gender: babyGender,
            fitPreference: babyFitPref,
          } : null,
        }),
      })

      if (!res.ok) {
        const d = await res.json()
        toast.error(d.error || "Failed to set up account")
        return
      }

      if (data.session) {
        toast.success(`Welcome to Mini Bunny! 🎉 ${includeBaby ? "+100 VIP Points (৳50 value) added!" : ""}`)
        router.push("/account")
        router.refresh()
      } else {
        toast.success("Account created! Check your email to confirm, then sign in.")
        router.push("/login")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col md:flex-row-reverse animate-in fade-in duration-500">
      {/* Form Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-10 lg:p-16 bg-[#FAF9F5]">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] text-[#FF758F] text-xs font-bold mb-3 border border-[#FF758F]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bunny VIP Club · Earn 100 Welcome Points</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-black text-[#1E3E5B] mb-1.5">
              Create Parent Account
            </h1>
            <p className="text-xs text-[#6C7A89]">
              Join Mini Bunny for personalized baby size recommendations, milestone gifts, and ৳ rewards.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#1E3E5B]">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }))
                }}
                placeholder="e.g. Sarah Jenkins"
                className={`w-full bg-white border border-[#EDE8DF] focus:border-[#4A8DB7] rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all shadow-2xs ${
                  errors.name ? "border-red-500" : ""
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#1E3E5B]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }))
                  }}
                  placeholder="name@example.com"
                  className={`w-full bg-white border border-[#EDE8DF] focus:border-[#4A8DB7] rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all shadow-2xs ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#1E3E5B]">
                  Phone (for Delivery)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }))
                  }}
                  placeholder="01XXXXXXXXX"
                  className={`w-full bg-white border border-[#EDE8DF] focus:border-[#4A8DB7] rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all shadow-2xs ${
                    errors.phone ? "border-red-500" : ""
                  }`}
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#1E3E5B]">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }))
                }}
                placeholder="Minimum 8 characters"
                className={`w-full bg-white border border-[#EDE8DF] focus:border-[#4A8DB7] rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all shadow-2xs ${
                  errors.password ? "border-red-500" : ""
                }`}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Optional Collapsible Baby Profile Card */}
            <div className="border border-[#4A8DB7]/30 bg-gradient-to-br from-[#F0F7FB] to-[#FFF0F3]/40 rounded-2xl p-3.5 transition-all shadow-2xs">
              <div
                onClick={() => setIncludeBaby(!includeBaby)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#4A8DB7]/15 flex items-center justify-center text-[#4A8DB7]">
                    <Baby className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1E3E5B] flex items-center gap-1.5">
                      Add Baby Profile
                      <span className="text-[10px] font-extrabold bg-[#FF758F] text-white px-1.5 py-0.2 rounded-full">
                        +100 VIP Pts
                      </span>
                    </p>
                    <p className="text-[10px] text-[#6C7A89]">
                      Get accurate size picks & birthday treats
                    </p>
                  </div>
                </div>
                <div className="text-[#4A8DB7]">
                  {includeBaby ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {includeBaby && (
                <div className="mt-3.5 pt-3 border-t border-[#EDE8DF] space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="text-[10px] font-bold text-[#1E3E5B] block mb-1">
                      Baby Name or Nickname
                    </label>
                    <input
                      type="text"
                      value={babyName}
                      onChange={(e) => setBabyName(e.target.value)}
                      placeholder="e.g. Aria, Liam, Little Angel"
                      className="w-full bg-white border border-[#EDE8DF] focus:border-[#4A8DB7] rounded-xl px-3 py-2 text-xs outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-[#1E3E5B] block mb-1">
                        Birthdate / Due Date
                      </label>
                      <input
                        type="date"
                        value={babyBirthday}
                        onChange={(e) => setBabyBirthday(e.target.value)}
                        className="w-full bg-white border border-[#EDE8DF] focus:border-[#4A8DB7] rounded-xl px-2.5 py-2 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#1E3E5B] block mb-1">Gender</label>
                      <div className="grid grid-cols-3 gap-1">
                        {(["Boy", "Girl", "Surprise"] as BabyGender[]).map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setBabyGender(g)}
                            className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${
                              babyGender === g
                                ? "bg-[#4A8DB7] text-white border-[#4A8DB7]"
                                : "bg-white text-[#6C7A89] border-[#EDE8DF]"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#1E3E5B] block mb-1">Fit Preference</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { key: "slim", label: "Slim" },
                        { key: "standard", label: "True to Size" },
                        { key: "roomy", label: "Roomy (+1 Size)" },
                      ].map((f) => (
                        <button
                          key={f.key}
                          type="button"
                          onClick={() => setBabyFitPref(f.key as FitPreference)}
                          className={`py-1.5 text-[10px] font-bold rounded-xl border transition-all ${
                            babyFitPref === f.key
                              ? "bg-[#FF758F] text-white border-[#FF758F]"
                              : "bg-white text-[#6C7A89] border-[#EDE8DF]"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {errors.baby && <p className="text-[11px] text-red-500">{errors.baby}</p>}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-4 bg-[#1E3E5B] hover:bg-[#4A8DB7] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                "Creating Account..."
              ) : (
                <>
                  <span>Create Account & Join VIP Club</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[#EDE8DF]" />
            <span className="text-[10px] uppercase tracking-widest text-[#6C7A89]">Or continue with</span>
            <div className="flex-1 h-px bg-[#EDE8DF]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={oauthLoading !== null}
              className="py-2.5 border border-[#EDE8DF] bg-white hover:bg-[#FAF9F5] rounded-xl text-xs font-bold text-[#1E3E5B] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {oauthLoading === "google" ? "Redirecting..." : "Google"}
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("facebook")}
              disabled={oauthLoading !== null}
              className="py-2.5 border border-[#EDE8DF] bg-white hover:bg-[#FAF9F5] rounded-xl text-xs font-bold text-[#1E3E5B] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {oauthLoading === "facebook" ? "Redirecting..." : "Facebook"}
            </button>
          </div>

          <p className="text-center text-xs text-[#6C7A89] pt-3 border-t border-[#EDE8DF]">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#4A8DB7] hover:underline transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Image Side */}
      <div className="hidden md:block w-1/2 relative bg-[#FAF9F5] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=1920&auto=format&fit=crop"
          alt="Mini Bunny Baby Boutique"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E3E5B]/85 via-[#1E3E5B]/30 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-white space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold">
            <Heart className="w-3.5 h-3.5 fill-current text-[#FF758F]" />
            <span>Gentle Organic Fabrics</span>
          </div>
          <h2 className="text-3xl font-heading font-black">Made with Love for Little Ones.</h2>
          <p className="text-xs text-white/80 leading-relaxed max-w-md">
            Sign up to get 10% off your first boutique order, free size exchange, and earn Bunny VIP loyalty points on every purchase across Bangladesh.
          </p>
        </div>
      </div>
    </div>
  )
}
