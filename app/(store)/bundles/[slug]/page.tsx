import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import BundleDetail from "./BundleDetail"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  if (!slug) return {}
  const bundle = await prisma.bundle.findFirst({
    where: { slug, isActive: true },
  })
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

  const bundle = await prisma.bundle.findFirst({
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
  })

  if (!bundle) notFound()

  return <BundleDetail bundle={JSON.parse(JSON.stringify(bundle))} />
}
