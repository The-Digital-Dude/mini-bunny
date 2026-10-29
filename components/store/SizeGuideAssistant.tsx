"use client"

import { BabyAssistantWidget } from "./SizeQuiz"

export default function SizeGuideAssistant() {
  return (
    <BabyAssistantWidget
      embedded={true}
      onFilterShop={(size) => {
        window.location.href = `/shop?size=${encodeURIComponent(size)}`
      }}
    />
  )
}
