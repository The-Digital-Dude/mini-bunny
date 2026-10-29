import { cache } from "react"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import BundleDetail from "./BundleDetail"

export const revalidate = 300 // ISR: revalidate bundle page every 5 minutes
export const dynamicParams = true // Allow on-demand ISR for new bundles

const getBundle = cache(async (slug: string) => {
  return prisma.bundle.findFirst({
    where: { slug, isActive: true },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: "asc" } },
              variants: true,
            },
          },
        },
      },
    },
  }).catch(() => null)
})

export async function generateStaticParams() {
  const bundles = await prisma.bundle.findMany({
    where: { isActive: true },
    select: { slug: true },
  }).catch(() => [])
  return bundles.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  if (!slug) return {}
  const bundle = await getBundle(slug)
  if (!bundle) return {}
  return {
    title: `${bundle.name} — Mini Bunny`,
    description: bundle.description ?? `Save with the ${bundle.name} bundle from Mini Bunny.`,
  }
}

export default async function BundleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!slug) notFound()

  const bundle = await getBundle(slug)

  if (!bundle) notFound()

  return <BundleDetail bundle={JSON.parse(JSON.stringify(bundle))} />
}
