import { cache } from "react"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.minibunny.com"

export const revalidate = 300 // ISR: revalidate custom pages every 5 minutes
export const dynamicParams = true // Allow on-demand ISR for new pages

const getPage = cache(async (slug: string) => {
  return prisma.page.findUnique({ where: { slug, isPublished: true } }).catch(() => null)
})

export async function generateStaticParams() {
  const pages = await prisma.page.findMany({
    where: { isPublished: true },
    select: { slug: true },
  }).catch(() => [])
  return pages.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return {}
  return {
    title: page.title,
    alternates: { canonical: `${SITE_URL}/pages/${slug}` },
  }
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  return (
    <div className="bg-bunny-bg min-h-screen">
      <div className="container mx-auto px-4 md:px-8 py-16 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-bunny-navy mb-8">{page.title}</h1>
        <div
          className="prose prose-neutral max-w-none prose-headings:font-heading prose-a:text-bunny-blue prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  )
}
