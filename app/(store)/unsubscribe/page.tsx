import { Suspense } from "react"
import UnsubscribeClient from "./UnsubscribeClient"

export const metadata = {
  title: "Unsubscribe — Mini Bunny",
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <UnsubscribeClient />
    </Suspense>
  )
}

