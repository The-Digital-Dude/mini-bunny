"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export type BabyGender = "Boy" | "Girl" | "Surprise"
export type FitPreference = "slim" | "standard" | "roomy"

export interface BabyChild {
  id: string
  babyName: string
  birthday: string // YYYY-MM-DD
  gender: BabyGender
  fitPreference?: FitPreference
  ageMonths: number
  calculatedAgeText: string
  recommendedSize: string
  parentNotes?: string
}

export interface ParentBabyProfile extends BabyChild {}

const STORAGE_KEY = "mini-bunny-baby-profiles-v2"
const LEGACY_STORAGE_KEY = "mini-bunny-baby-profile"
const PROFILE_CHANGE_EVENT = "mini-bunny-profile-changed"

const SIZE_ORDER = ["0-3M", "3-6M", "6-12M", "12-18M", "18-24M", "2-3Y", "3-4Y", "4-5Y"]

export function calculateAgeFromBirthday(
  birthdayStr: string,
  fitPref: FitPreference = "standard"
): {
  ageMonths: number
  calculatedAgeText: string
  recommendedSize: string
} {
  if (!birthdayStr) {
    return { ageMonths: 0, calculatedAgeText: "Not set", recommendedSize: "0-3M" }
  }

  const birthDate = new Date(birthdayStr)
  const now = new Date()

  if (isNaN(birthDate.getTime())) {
    return { ageMonths: 0, calculatedAgeText: "Invalid date", recommendedSize: "0-3M" }
  }

  const diffTime = Math.max(0, now.getTime() - birthDate.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const months = Math.floor(diffDays / 30.4375)
  const remainingDays = Math.floor(diffDays % 30.4375)

  let calculatedAgeText = ""
  if (months === 0) {
    calculatedAgeText = `${diffDays} Day${diffDays === 1 ? "" : "s"} (Newborn)`
  } else if (months < 24) {
    calculatedAgeText = `${months} Month${months === 1 ? "" : "s"}${remainingDays > 0 ? ` ${remainingDays}d` : ""}`
  } else {
    const years = (months / 12).toFixed(1)
    calculatedAgeText = `${years} Years (${months}m)`
  }

  let baseSizeIndex = 0
  if (months >= 48) baseSizeIndex = 7 // 4-5Y
  else if (months >= 36) baseSizeIndex = 6 // 3-4Y
  else if (months >= 24) baseSizeIndex = 5 // 2-3Y
  else if (months >= 18) baseSizeIndex = 4 // 18-24M
  else if (months >= 12) baseSizeIndex = 3 // 12-18M
  else if (months >= 6) baseSizeIndex = 2 // 6-12M
  else if (months >= 3) baseSizeIndex = 1 // 3-6M
  else baseSizeIndex = 0 // 0-3M

  if (fitPref === "roomy" && baseSizeIndex < SIZE_ORDER.length - 1) {
    baseSizeIndex += 1
  }

  return {
    ageMonths: months,
    calculatedAgeText,
    recommendedSize: SIZE_ORDER[baseSizeIndex] || "0-3M",
  }
}

interface StoredProfilesData {
  children: BabyChild[]
  activeChildId: string | null
}

export function useParentProfile() {
  const [children, setChildren] = useState<BabyChild[]>([])
  const [activeChildId, setActiveChildId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const authed = !!session?.user
      setIsAuthenticated(authed)

      if (authed) {
        // Fetch from Postgres database
        const res = await fetch("/api/account/baby-profile").catch(() => null)
        if (res && res.ok) {
          const data = await res.json()
          if (data.profiles && Array.isArray(data.profiles) && data.profiles.length > 0) {
            const parsedChildren = data.profiles.map((p: any) => {
              const bStr = typeof p.birthday === "string" ? p.birthday.split("T")[0] : new Date(p.birthday).toISOString().split("T")[0]
              const ageMeta = calculateAgeFromBirthday(bStr, p.fitPreference || "standard")
              return {
                id: p.id,
                babyName: p.babyName,
                birthday: bStr,
                gender: (p.gender as BabyGender) || "Surprise",
                fitPreference: (p.fitPreference as FitPreference) || "standard",
                parentNotes: p.parentNotes || "",
                ...ageMeta,
              }
            })
            setChildren(parsedChildren)
            setActiveChildId(parsedChildren[0]?.id ?? null)
            return
          }
        }
      }

      // Fallback local storage
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: StoredProfilesData = JSON.parse(stored)
        const reCalculatedChildren = (parsed.children || []).map((c) => {
          const ageMeta = calculateAgeFromBirthday(c.birthday, c.fitPreference || "standard")
          return { ...c, ...ageMeta }
        })
        setChildren(reCalculatedChildren)
        setActiveChildId(parsed.activeChildId || (reCalculatedChildren[0]?.id ?? null))
        return
      }

      // Legacy single profile fallback
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
      if (legacy) {
        const parsed = JSON.parse(legacy)
        const ageMeta = calculateAgeFromBirthday(parsed.birthday)
        const child: BabyChild = {
          id: `child_${Date.now()}`,
          babyName: parsed.babyName || "Baby",
          birthday: parsed.birthday,
          gender: parsed.gender || "Surprise",
          fitPreference: "standard",
          parentNotes: parsed.parentNotes,
          ...ageMeta,
        }
        setChildren([child])
        setActiveChildId(child.id)
      }
    } catch {
      // Storage fallback
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    loadData()

    const handleCustomChange = () => loadData()
    window.addEventListener(PROFILE_CHANGE_EVENT, handleCustomChange)
    window.addEventListener("storage", handleCustomChange)

    return () => {
      window.removeEventListener(PROFILE_CHANGE_EVENT, handleCustomChange)
      window.removeEventListener("storage", handleCustomChange)
    }
  }, [loadData])

  const notifyChange = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(PROFILE_CHANGE_EVENT))
    }
  }

  const persist = (updatedChildren: BabyChild[], activeId: string | null) => {
    setChildren(updatedChildren)
    setActiveChildId(activeId)
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ children: updatedChildren, activeChildId: activeId })
      )
      const active = updatedChildren.find((c) => c.id === activeId) || updatedChildren[0]
      if (active) {
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(active))
      } else {
        localStorage.removeItem(LEGACY_STORAGE_KEY)
      }
    } catch {}
    notifyChange()
  }

  const addChild = (data: {
    babyName: string
    birthday: string
    gender: BabyGender
    fitPreference?: FitPreference
    parentNotes?: string
  }) => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return null
    }

    const ageMeta = calculateAgeFromBirthday(data.birthday, data.fitPreference || "standard")
    const newChild: BabyChild = {
      id: `child_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      babyName: data.babyName.trim(),
      birthday: data.birthday,
      gender: data.gender || "Surprise",
      fitPreference: data.fitPreference || "standard",
      parentNotes: data.parentNotes?.trim(),
      ...ageMeta,
    }

    const updated = [...children, newChild]
    persist(updated, newChild.id)

    // Sync to Postgres database
    fetch("/api/account/baby-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        babyName: data.babyName,
        birthday: data.birthday,
        gender: data.gender,
        fitPreference: data.fitPreference,
        parentNotes: data.parentNotes,
      }),
    }).catch(() => {})

    return newChild
  }

  const updateChild = (
    childId: string,
    data: Partial<{
      babyName: string
      birthday: string
      gender: BabyGender
      fitPreference: FitPreference
      parentNotes?: string
    }>
  ) => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    const updated = children.map((c) => {
      if (c.id !== childId) return c
      const nextBirthday = data.birthday ?? c.birthday
      const nextFit = data.fitPreference ?? c.fitPreference ?? "standard"
      const ageMeta = calculateAgeFromBirthday(nextBirthday, nextFit)
      return {
        ...c,
        ...data,
        ...ageMeta,
      }
    })

    persist(updated, activeChildId)

    fetch("/api/account/baby-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ children: updated }),
    }).catch(() => {})
  }

  const removeChild = (childId: string) => {
    const updated = children.filter((c) => c.id !== childId)
    const nextActive = activeChildId === childId ? (updated[0]?.id ?? null) : activeChildId
    persist(updated, nextActive)

    fetch(`/api/account/baby-profile?id=${encodeURIComponent(childId)}`, {
      method: "DELETE",
    }).catch(() => {})
  }

  const setActiveChild = (childId: string) => {
    if (children.some((c) => c.id === childId)) {
      persist(children, childId)
    }
  }

  const saveProfile = (data: {
    babyName: string
    birthday: string
    gender: BabyGender
    fitPreference?: FitPreference
    parentNotes?: string
  }) => {
    if (children.length > 0 && activeChildId) {
      updateChild(activeChildId, data)
      return children.find((c) => c.id === activeChildId)
    } else {
      return addChild(data)
    }
  }

  const clearProfile = () => {
    setChildren([])
    setActiveChildId(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch {}
    notifyChange()
    fetch("/api/account/baby-profile", { method: "DELETE" }).catch(() => {})
  }

  const activeChild = children.find((c) => c.id === activeChildId) || children[0] || null

  return {
    children,
    activeChild,
    profile: activeChild,
    activeChildId,
    isLoaded,
    isAuthenticated,
    hasProfile: !!activeChild?.babyName,
    showAuthModal,
    setShowAuthModal,
    addChild,
    updateChild,
    removeChild,
    setActiveChild,
    saveProfile,
    clearProfile,
  }
}
