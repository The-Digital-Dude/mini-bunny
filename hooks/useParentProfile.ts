"use client"

import { useState, useEffect } from "react"

export type BabyGender = "Boy" | "Girl" | "Surprise"

export interface ParentBabyProfile {
  babyName: string
  birthday: string // YYYY-MM-DD
  gender: BabyGender
  ageMonths: number
  calculatedAgeText: string
  recommendedSize: string
  parentNotes?: string
}

const STORAGE_KEY = "mini-bunny-baby-profile"

export function calculateAgeFromBirthday(birthdayStr: string): {
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

  let recommendedSize = "0-3M"
  if (months >= 36) recommendedSize = "3-4Y"
  else if (months >= 24) recommendedSize = "2-3Y"
  else if (months >= 18) recommendedSize = "18-24M"
  else if (months >= 12) recommendedSize = "12-18M"
  else if (months >= 6) recommendedSize = "6-12M"
  else if (months >= 3) recommendedSize = "3-6M"

  return { ageMonths: months, calculatedAgeText, recommendedSize }
}

export function useParentProfile() {
  const [profile, setProfile] = useState<ParentBabyProfile | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const ageMeta = calculateAgeFromBirthday(parsed.birthday)
        setProfile({
          ...parsed,
          ...ageMeta,
        })
      }
    } catch {
      // localStorage error fallback
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const saveProfile = (data: {
    babyName: string
    birthday: string
    gender: BabyGender
    parentNotes?: string
  }) => {
    const ageMeta = calculateAgeFromBirthday(data.birthday)
    const newProfile: ParentBabyProfile = {
      babyName: data.babyName.trim(),
      birthday: data.birthday,
      gender: data.gender || "Surprise",
      parentNotes: data.parentNotes?.trim(),
      ...ageMeta,
    }

    setProfile(newProfile)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile))
    } catch {}

    // Async sync with backend for authenticated users
    fetch("/api/account/baby-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProfile),
    }).catch(() => {})

    return newProfile
  }

  const clearProfile = () => {
    setProfile(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    fetch("/api/account/baby-profile", { method: "DELETE" }).catch(() => {})
  }

  return {
    profile,
    isLoaded,
    hasProfile: !!profile?.babyName,
    saveProfile,
    clearProfile,
  }
}
