// WhatsApp notification & Direct Ordering helper for Mini Bunny Bangladesh
// Supports:
// 1. One-click Direct WhatsApp Ordering
// 2. Automated & Manual Order Confirmation templates
// 3. Dispatch & Delivery Updates (Pathao / Steadfast)
// 4. Post-delivery Review & Fit Check requests

const WA_TOKEN = process.env.WHATSAPP_API_TOKEN
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
export const OFFICIAL_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801700000000"

const STATUS_EMOJI: Record<string, string> = {
  CONFIRMED: "🍼",
  PROCESSING: "🧺",
  PACKED: "🎁",
  SHIPPED: "🚚",
  DELIVERED: "🎉",
  CANCELLED: "❌",
}

export function normalizeBDPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("880")) return digits
  if (digits.startsWith("0")) return `88${digits}`
  return `880${digits}`
}

export function buildWaLink(phone: string, message: string): string {
  const normalized = normalizeBDPhone(phone || OFFICIAL_WHATSAPP_NUMBER)
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

// ─────────────────────────────────────────────
// 1. Direct WhatsApp Order Link (for Product Page)
// ─────────────────────────────────────────────
export function buildWhatsAppOrderLink(params: {
  productName: string
  productUrl?: string
  size?: string
  color?: string
  price: number
  quantity?: number
}): string {
  const { productName, productUrl, size, color, price, quantity = 1 } = params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.minibunny.com"
  const fullUrl = productUrl || siteUrl

  let message = `🐰 *Mini Bunny — Direct WhatsApp Order*\n\n`
  message += `Hi! I would like to order this item for my baby:\n\n`
  message += `• *Product:* ${productName}\n`
  if (size) message += `• *Size:* ${size}\n`
  if (color) message += `• *Color:* ${color}\n`
  message += `• *Quantity:* ${quantity}\n`
  message += `• *Price:* ৳${price.toLocaleString()}\n`
  if (fullUrl) message += `• *Link:* ${fullUrl}\n\n`
  message += `📍 *My Delivery Details:*\n`
  message += `• Name:\n`
  message += `• Phone:\n`
  message += `• Full Address (District & Area):\n`
  message += `• Payment: Cash on Delivery / bKash\n\n`
  message += `Please confirm availability and dispatch time. Thank you! 🍼`

  return buildWaLink(OFFICIAL_WHATSAPP_NUMBER, message)
}

// ─────────────────────────────────────────────
// 2. Order Confirmation Message
// ─────────────────────────────────────────────
export function buildWhatsAppOrderConfirmation(params: {
  customerName: string
  orderNumber: string
  total: number
  paymentMethod: string
  itemsSummary: string
  deliveryAddress: string
}): string {
  const { customerName, orderNumber, total, paymentMethod, itemsSummary, deliveryAddress } = params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.minibunny.com"

  let msg = `🐰 *Mini Bunny — Order Confirmed!* ✨\n\n`
  msg += `Dear ${customerName},\n`
  msg += `Thank you for choosing Mini Bunny for your little one! We've received your order *#${orderNumber}* with love.\n\n`
  msg += `📦 *Order Summary:*\n${itemsSummary}\n\n`
  msg += `💰 *Total Amount:* ৳${total.toLocaleString()} (${paymentMethod})\n`
  msg += `📍 *Delivery To:* ${deliveryAddress}\n\n`
  msg += `🚚 *Estimated Delivery:* 2–3 Days in Dhaka, 3–5 Days Outside Dhaka.\n`
  msg += `🔗 *Track Online:* ${siteUrl}/order/${orderNumber}\n\n`
  msg += `Need help or size exchange? Reply directly to this WhatsApp message anytime! 🍼`

  return msg
}

// ─────────────────────────────────────────────
// 3. Delivery & Courier Tracking Update
// ─────────────────────────────────────────────
export function buildWhatsAppDeliveryUpdate(params: {
  customerName: string
  orderNumber: string
  status: string
  courierName?: string // "Pathao" | "Steadfast" | "RedX"
  trackingNumber?: string
  trackingUrl?: string
}): string {
  const { customerName, orderNumber, status, courierName = "Courier", trackingNumber, trackingUrl } = params
  const emoji = STATUS_EMOJI[status] || "📦"
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.minibunny.com"

  let msg = `${emoji} *Mini Bunny Delivery Update*\n\n`
  msg += `Hi ${customerName},\n\n`
  
  if (status === "SHIPPED") {
    msg += `Great news! Your baby's order *#${orderNumber}* has been packed in sterile packaging and dispatched via *${courierName}*! 🚚\n\n`
    if (trackingNumber) msg += `🔍 *Courier Tracking ID:* ${trackingNumber}\n`
    if (trackingUrl) msg += `🔗 *Live Tracking Link:* ${trackingUrl}\n`
  } else if (status === "DELIVERED") {
    msg += `Your package for order *#${orderNumber}* has been delivered! 🎉 We hope your little one loves their new soft clothes.\n\n`
    msg += `Remember, all items come with our *7-Day Easy Size Exchange Guarantee* if you need a different fit.`
  } else {
    msg += `Your order *#${orderNumber}* status is now: *${status}*\n`
  }

  msg += `\n\n🔗 ${siteUrl}/order/${orderNumber}\n\n`
  msg += `With love, Mini Bunny Team 🐰`

  return msg
}

// ─────────────────────────────────────────────
// 4. Post-Delivery Review Request
// ─────────────────────────────────────────────
export function buildWhatsAppReviewRequest(params: {
  customerName: string
  orderNumber: string
  productNames: string
  reviewUrl?: string
}): string {
  const { customerName, orderNumber, productNames, reviewUrl } = params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.minibunny.com"
  const link = reviewUrl || `${siteUrl}/account?tab=orders`

  let msg = `💖 *How does the outfit fit your baby?*\n\n`
  msg += `Hi ${customerName},\n\n`
  msg += `We hope your baby is cozy and happy in their *${productNames}*! 👶✨\n\n`
  msg += `Could you take 30 seconds to share your experience? Your feedback helps fellow moms & dads pick the best soft outfits for their little ones.\n\n`
  msg += `⭐ *Leave a quick review:* ${link}\n\n`
  msg += `As a thank you, enjoy *50 Mini Bunny VIP Points* added to your account! 🐰🎁`

  return msg
}

// Send via WhatsApp Business Cloud API (Meta)
export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  if (!WA_TOKEN || !WA_PHONE_ID) return false

  const normalized = normalizeBDPhone(phone)

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${WA_PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalized,
        type: "text",
        text: { body: message },
      }),
    })

    return res.ok
  } catch {
    return false
  }
}
