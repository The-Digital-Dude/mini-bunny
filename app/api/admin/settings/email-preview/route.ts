import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/adminAuth"
import { EMAIL_TEMPLATE_KEYS, getStoreMeta, renderMockEmailHtml, sendMail } from "@/lib/email"

// GET: list available templates and get preview HTML for a specific key
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const templateKey = req.nextUrl.searchParams.get("key") || "order_confirmation"
    const store = await getStoreMeta()
    const { subject, html } = renderMockEmailHtml(templateKey, store)

    return NextResponse.json({
      templates: EMAIL_TEMPLATE_KEYS,
      currentKey: templateKey,
      subject,
      html,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to render email preview" }, { status: 500 })
  }
}

// POST: send a test email using the selected template
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { templateKey, recipientEmail } = await req.json()
    if (!recipientEmail) {
      return NextResponse.json({ error: "Recipient email is required" }, { status: 400 })
    }

    const store = await getStoreMeta()
    const { subject, html } = renderMockEmailHtml(templateKey || "order_confirmation", store)

    await sendMail(recipientEmail, `[TEST PREVIEW] ${subject}`, html)

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${recipientEmail}`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to send test email" }, { status: 500 })
  }
}
