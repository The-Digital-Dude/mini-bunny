import nodemailer from "nodemailer"
import prisma from "@/lib/prisma"

// ---------------------------------------------------------------------------
// Transport factory — reads SMTP config from Setting table or Brevo / Resend
// ---------------------------------------------------------------------------

async function getSmtpConfig() {
  const keys = ["smtp_host", "smtp_port", "smtp_secure", "smtp_user", "smtp_pass", "smtp_from_name", "smtp_from_email"]
  const rows = await prisma.setting.findMany({ where: { key: { in: keys } } })
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return s
}

async function getSenderMeta() {
  const rows = await prisma.setting.findMany({
    where: { key: { in: ["smtp_from_name", "smtp_from_email", "store_name", "support_email"] } },
  })
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]))

  // When Brevo is the active provider, sender MUST be an active verified sender on the Brevo account
  const verifiedBrevoSender = process.env.BREVO_FROM_EMAIL || "minibunnyforu@gmail.com"

  return {
    name: s.smtp_from_name || s.store_name || "Mini Bunny",
    email: process.env.BREVO_API_KEY ? verifiedBrevoSender : (s.smtp_from_email || s.support_email || verifiedBrevoSender),
  }
}

export async function sendMail(to: string, subject: string, html: string) {
  const sender = await getSenderMeta()
  const smtpCfg = await getSmtpConfig()

  // 1. Custom SMTP
  if (smtpCfg.smtp_host && smtpCfg.smtp_user && smtpCfg.smtp_pass) {
    const transport = nodemailer.createTransport({
      host: smtpCfg.smtp_host,
      port: Number(smtpCfg.smtp_port || 587),
      secure: smtpCfg.smtp_secure === "true",
      auth: { user: smtpCfg.smtp_user, pass: smtpCfg.smtp_pass },
    })
    await transport.sendMail({ from: `${sender.name} <${sender.email}>`, to, subject, html })
    return
  }

  // 2. Brevo Transactional Email API (Default Primary Gateway)
  if (process.env.BREVO_API_KEY) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": process.env.BREVO_API_KEY },
      body: JSON.stringify({
        sender: { name: sender.name, email: sender.email },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as any).message || `Brevo API error ${res.status}`)
    }
    return
  }

  // 3. Resend SMTP relay
  if (process.env.RESEND_API_KEY) {
    const transport = nodemailer.createTransport({
      host: "smtp.resend.com", port: 465, secure: true,
      auth: { user: "resend", pass: process.env.RESEND_API_KEY },
    })
    await transport.sendMail({ from: `${sender.name} <${sender.email}>`, to, subject, html })
    return
  }

  // 4. Fallback log
  console.warn("[email] No active provider configured. Logged mail to:", { to, subject })
}

// ---------------------------------------------------------------------------
// Store metadata helper
// ---------------------------------------------------------------------------

export async function getStoreMeta() {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ["store_name", "store_logo", "support_email", "support_phone", "store_url"] } },
  })
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))
  return {
    name: map.store_name || "Mini Bunny",
    logo: map.store_logo || "",
    email: map.support_email || process.env.BREVO_FROM_EMAIL || "minibunnyforu@gmail.com",
    phone: map.support_phone || "01700000000",
    url: map.store_url || process.env.NEXT_PUBLIC_SITE_URL || "https://minibunnybd.com",
  }
}

// ---------------------------------------------------------------------------
// Premium Baby Boutique Master Email Layout
// ---------------------------------------------------------------------------

type HeaderTheme = {
  badgeText: string
  badgeBg: string
  badgeColor: string
  iconEmoji: string
}

export function boutiqueEmailTemplate({
  store,
  title,
  subtitle,
  headerTheme,
  content,
  primaryAction,
  secondaryAction,
}: {
  store: { name: string; logo: string; url: string; phone: string; email: string }
  title: string
  subtitle?: string
  headerTheme: HeaderTheme
  content: string
  primaryAction?: { label: string; url: string }
  secondaryAction?: { label: string; url: string }
}) {
  const cleanPhone = (store.phone || "01700000000").replace(/[^0-9]/g, "")
  const waPhone = cleanPhone.startsWith("88") ? cleanPhone : `88${cleanPhone}`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${store.name}</title>
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse:collapse;border-spacing:0;margin:0;}
    div, td {padding:0;}
    div {margin:0 !important;}
  </style>
  <![endif]-->
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #F8F9FA;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1E293B;
      font-size: 14px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      padding: 24px 12px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(15, 23, 42, 0.05);
      border: 1px solid #EEF2F6;
    }
    .header-bar {
      background: linear-gradient(135deg, #F0F7FB 0%, #E8F3FA 100%);
      padding: 32px 28px 24px;
      text-align: center;
      border-bottom: 1px solid #E2EDF5;
    }
    .brand-logo-text {
      font-size: 20px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 4px;
      text-decoration: none;
      display: inline-block;
    }
    .brand-tagline {
      font-size: 11px;
      color: #64748B;
      font-weight: 500;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
    }
    .action-badge {
      display: inline-flex;
      align-items: center;
      background: ${headerTheme.badgeBg};
      color: ${headerTheme.badgeColor};
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.3px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
    }
    .main-body {
      padding: 32px 28px;
    }
    .headline {
      font-size: 22px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 8px;
      line-height: 1.3;
    }
    .subheadline {
      font-size: 14px;
      color: #64748B;
      margin-bottom: 24px;
    }
    .content-box {
      background: #FDFBF7;
      border: 1px solid #F3EDE2;
      border-radius: 16px;
      padding: 20px;
      margin: 20px 0;
    }
    .info-grid {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    .info-grid td {
      padding: 8px 12px;
      vertical-align: top;
    }
    .info-label {
      font-size: 11px;
      font-weight: 700;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 2px;
    }
    .info-value {
      font-size: 14px;
      font-weight: 600;
      color: #1E293B;
    }
    .item-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    .item-row td {
      padding: 12px 0;
      border-bottom: 1px solid #F1F5F9;
      vertical-align: middle;
    }
    .btn-primary {
      display: inline-block;
      background: #4A8DB7;
      color: #FFFFFF !important;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 12px;
      text-align: center;
      margin: 16px 0 8px;
      box-shadow: 0 4px 12px rgba(74, 141, 183, 0.25);
    }
    .btn-secondary {
      display: inline-block;
      background: #FFFFFF;
      color: #334155 !important;
      border: 1px solid #CBD5E1;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 12px;
      text-align: center;
      margin: 8px 0;
    }
    .pill {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
    }
    .pill-green { background: #ECFDF5; color: #059669; }
    .pill-blue { background: #EFF6FF; color: #2563EB; }
    .pill-amber { background: #FFFBEB; color: #D97706; }
    .pill-rose { background: #FFF1F2; color: #E11D48; }

    /* Trust & Footer */
    .trust-strip {
      background: #FDFEFE;
      border-top: 1px solid #F1F5F9;
      border-bottom: 1px solid #F1F5F9;
      padding: 20px 24px;
      text-align: center;
    }
    .trust-item {
      display: inline-block;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }
    .footer {
      background: #F8FAFC;
      padding: 28px 24px;
      text-align: center;
      font-size: 12px;
      color: #94A3B8;
    }
    .whatsapp-btn {
      display: inline-block;
      background: #25D366;
      color: #FFFFFF !important;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 9999px;
      margin: 8px 0 16px;
      box-shadow: 0 2px 8px rgba(37, 211, 102, 0.2);
    }
    .footer a {
      color: #64748B;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header-bar">
      <a href="${store.url}" class="brand-logo-text">🐰 ${store.name}</a>
      <div class="brand-tagline">Soft, Safe & Lovingly Crafted for Your Little One</div>
      <div>
        <span class="action-badge">${headerTheme.iconEmoji} ${headerTheme.badgeText}</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-body">
      <h1 class="headline">${title}</h1>
      ${subtitle ? `<p class="subheadline">${subtitle}</p>` : ""}

      ${content}

      <!-- Actions -->
      ${primaryAction || secondaryAction ? `
        <div style="text-align: center; margin-top: 28px; padding-top: 20px; border-top: 1px solid #F1F5F9;">
          ${primaryAction ? `<a href="${primaryAction.url}" class="btn-primary">${primaryAction.label}</a>` : ""}
          ${secondaryAction ? `<br><a href="${secondaryAction.url}" class="btn-secondary">${secondaryAction.label}</a>` : ""}
        </div>
      ` : ""}
    </div>

    <!-- Trust Strip -->
    <div class="trust-strip">
      <div class="trust-item">🌿 100% Baby-Safe Fabrics</div>
      <div class="trust-item">🔄 7-Day Size Exchange</div>
      <div class="trust-item">⚡ Swift Home Delivery</div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="color: #475569; font-weight: 600; margin-bottom: 6px;">Questions about your order or baby sizing?</p>
      <div>
        <a href="https://wa.me/${waPhone}?text=Hello%20Mini%20Bunny%20Concierge" class="whatsapp-btn">💬 Chat with Baby Concierge on WhatsApp</a>
      </div>
      <p style="margin-top: 12px;">&copy; ${new Date().getFullYear()} ${store.name} Bangladesh. All rights reserved.</p>
      <p style="margin-top: 4px;">
        <a href="${store.url}/shop">Shop New In</a> &bull;
        <a href="${store.url}/account/orders">My Orders</a> &bull;
        <a href="${store.url}/privacy">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// 1. Order Confirmed Template
// ---------------------------------------------------------------------------

export type OrderConfirmationPayload = {
  to: string
  orderNumber: string
  customerName: string
  items: { productName: string; size?: string; color?: string; quantity: number; price: number; image?: string }[]
  subtotal: number
  shippingCharge: number
  discount: number
  giftWrapCharge?: number
  depositAmount?: number
  depositPaid?: boolean
  total: number
  paymentMethod: string
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shippingArea?: string
  shippingDistrict?: string
  shippingDivision?: string
  note?: string | null
  giftWrap?: boolean
  giftMessage?: string | null
}

export function renderOrderConfirmationHtml(data: OrderConfirmationPayload, store: any) {
  const itemRows = data.items.map((i) => `
    <tr class="item-row">
      <td style="width: 50px;">
        ${i.image ? `<img src="${i.image}" alt="${i.productName}" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover; border: 1px solid #E2E8F0;">` : `<div style="width: 44px; height: 44px; border-radius: 8px; background: #F1F5F9; text-align: center; line-height: 44px; font-size: 18px;">👶</div>`}
      </td>
      <td style="padding-left: 12px;">
        <div style="font-weight: 700; color: #1E293B; font-size: 14px;">${i.productName}</div>
        <div style="font-size: 12px; color: #64748B;">Size: ${i.size || "Standard"} ${i.color ? `&bull; Color: ${i.color}` : ""} &bull; Qty: ${i.quantity}</div>
      </td>
      <td style="text-align: right; font-weight: 700; color: #0F172A; font-size: 14px;">
        ৳${(i.price * i.quantity).toLocaleString()}
      </td>
    </tr>
  `).join("")

  const netDue = (data.depositPaid && data.depositAmount)
    ? Math.max(0, data.total - data.depositAmount)
    : data.total

  const fullAddress = [data.shippingAddress, data.shippingArea, data.shippingDistrict, data.shippingDivision].filter(Boolean).join(", ")

  const content = `
    <div style="background: #F8FAFC; border-radius: 14px; padding: 16px; margin-bottom: 20px;">
      <table style="width: 100%;">
        <tr>
          <td style="padding: 4px 0;">
            <div class="info-label">Order Number</div>
            <div class="info-value" style="font-family: monospace; font-size: 16px; color: #4A8DB7;">#${data.orderNumber}</div>
          </td>
          <td style="padding: 4px 0; text-align: right;">
            <div class="info-label">Payment Method</div>
            <div class="info-value"><span class="pill pill-blue">${data.paymentMethod}</span></div>
          </td>
        </tr>
      </table>
    </div>

    <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748B; margin-bottom: 10px;">Ordered Baby Essentials</h3>
    <table class="item-table">
      ${itemRows}
    </table>

    <!-- Financial Breakdown -->
    <div class="content-box">
      <table style="width: 100%; font-size: 13px;">
        <tr>
          <td style="color: #64748B; padding: 4px 0;">Subtotal</td>
          <td style="text-align: right; font-weight: 600; color: #1E293B;">৳${data.subtotal.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="color: #64748B; padding: 4px 0;">Delivery Charge</td>
          <td style="text-align: right; font-weight: 600; color: #1E293B;">${data.shippingCharge > 0 ? `৳${data.shippingCharge.toLocaleString()}` : `<span class="pill pill-green">Free</span>`}</td>
        </tr>
        ${data.discount > 0 ? `
          <tr>
            <td style="color: #059669; padding: 4px 0;">Discount Savings</td>
            <td style="text-align: right; font-weight: 700; color: #059669;">-৳${data.discount.toLocaleString()}</td>
          </tr>
        ` : ""}
        ${data.depositPaid && data.depositAmount ? `
          <tr>
            <td style="color: #2563EB; padding: 4px 0;">Advance Deposit Paid</td>
            <td style="text-align: right; font-weight: 600; color: #2563EB;">-৳${data.depositAmount.toLocaleString()}</td>
          </tr>
        ` : ""}
        <tr style="border-top: 2px solid #E2E8F0;">
          <td style="font-size: 15px; font-weight: 800; color: #0F172A; padding-top: 10px;">Total Due on Delivery</td>
          <td style="font-size: 18px; font-weight: 800; color: #0F172A; text-align: right; padding-top: 10px;">৳${netDue.toLocaleString()}</td>
        </tr>
      </table>
    </div>

    <!-- Shipping Card -->
    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; margin-top: 20px;">
      <div class="info-label" style="margin-bottom: 6px;">Delivery Destination</div>
      <div style="font-weight: 700; color: #1E293B; font-size: 14px;">${data.shippingName} &bull; ${data.shippingPhone}</div>
      <div style="font-size: 13px; color: #64748B; margin-top: 2px;">${fullAddress}</div>
    </div>

    ${data.note ? `<div style="background: #EFF6FF; border-left: 3px solid #3B82F6; border-radius: 8px; padding: 12px 14px; font-size: 13px; color: #1E40AF; margin-top: 16px;"><strong>Parent Note:</strong> ${data.note}</div>` : ""}
    ${data.giftWrap ? `<div style="background: #FDF2F8; border-left: 3px solid #EC4899; border-radius: 8px; padding: 12px 14px; font-size: 13px; color: #9D174D; margin-top: 12px;">🎁 <strong>Gift Wrapped Package</strong>${data.giftMessage ? ` &mdash; "${data.giftMessage}"` : ""}</div>` : ""}
  `

  return boutiqueEmailTemplate({
    store,
    title: `Thank You, ${data.customerName}! 🐰`,
    subtitle: `We received your Order #${data.orderNumber} and our care team is getting your baby's items packed with love.`,
    headerTheme: {
      badgeText: "Order Confirmed",
      badgeBg: "#E0F2FE",
      badgeColor: "#0369A1",
      iconEmoji: "✨",
    },
    content,
    primaryAction: { label: "Track Your Order →", url: `${store.url}/account/orders` },
  })
}

export async function sendOrderConfirmation(data: OrderConfirmationPayload) {
  const store = await getStoreMeta()
  const html = renderOrderConfirmationHtml(data, store)
  await sendMail(data.to, `Order Confirmed #${data.orderNumber} — ${store.name}`, html)
}

// ---------------------------------------------------------------------------
// 2. Shipment Dispatched Template
// ---------------------------------------------------------------------------

export type ShippingDispatchedPayload = {
  to: string
  customerName: string
  orderNumber: string
  courierName: string
  trackingNumber: string
  trackingUrl?: string
}

export function renderShippingDispatchedHtml(data: ShippingDispatchedPayload, store: any) {
  const trackLink = data.trackingUrl || (data.courierName === "STEADFAST" ? `https://steadfast.com.bd/t/${data.trackingNumber}` : `${store.url}/account/orders`)

  const content = `
    <div style="text-align: center; padding: 10px 0 20px;">
      <div style="display: inline-block; width: 64px; height: 64px; background: #E0F2FE; border-radius: 50%; line-height: 64px; font-size: 30px;">
        🚚
      </div>
    </div>

    <div class="content-box" style="text-align: center;">
      <div class="info-label">Assigned Courier Partner</div>
      <div style="font-size: 18px; font-weight: 800; color: #0F172A; margin: 4px 0 12px;">${data.courierName}</div>
      
      <div class="info-label">Courier Consignment / Tracking Code</div>
      <div style="font-family: monospace; font-size: 16px; font-weight: 700; color: #4A8DB7; background: #FFFFFF; border: 1px dashed #CBD5E1; padding: 10px 18px; border-radius: 10px; display: inline-block; margin-top: 4px;">
        ${data.trackingNumber}
      </div>
    </div>

    <div style="background: #F8FAFC; border-radius: 14px; padding: 16px; margin: 20px 0; font-size: 13px; color: #475569;">
      <p>📦 <strong>Delivery Timeline:</strong> Parcels within Dhaka are typically delivered within <strong>24–48 hours</strong>. Deliveries outside Dhaka take <strong>2–3 days</strong>.</p>
    </div>
  `

  return boutiqueEmailTemplate({
    store,
    title: `Your Order is on the Way! 📦`,
    subtitle: `Great news, ${data.customerName}! Order #${data.orderNumber} has been dispatched with our delivery partner.`,
    headerTheme: {
      badgeText: "Dispatched & In Transit",
      badgeBg: "#EFF6FF",
      badgeColor: "#1D4ED8",
      iconEmoji: "🚚",
    },
    content,
    primaryAction: { label: "Track Live Shipment →", url: trackLink },
  })
}

export async function sendShippingDispatched(data: ShippingDispatchedPayload) {
  const store = await getStoreMeta()
  const html = renderShippingDispatchedHtml(data, store)
  await sendMail(data.to, `Dispatched: Order #${data.orderNumber} is on the way! — ${store.name}`, html)
}

// ---------------------------------------------------------------------------
// 3. Order Delivered Template
// ---------------------------------------------------------------------------

export type OrderDeliveredPayload = {
  to: string
  customerName: string
  orderNumber: string
}

export function renderOrderDeliveredHtml(data: OrderDeliveredPayload, store: any) {
  const content = `
    <div style="text-align: center; padding: 10px 0 20px;">
      <div style="display: inline-block; width: 64px; height: 64px; background: #ECFDF5; border-radius: 50%; line-height: 64px; font-size: 30px;">
        🎁
      </div>
    </div>

    <div class="content-box">
      <p style="font-size: 14px; color: #334155; line-height: 1.7;">
        We hope your little one adores their new outfits! Everything is made from 100% soft, breathable, and baby-safe fabric to keep your child cozy and happy.
      </p>
    </div>

    <div style="background: #FDF2F8; border: 1px solid #FCE7F3; border-radius: 14px; padding: 18px; text-align: center; margin: 20px 0;">
      <p style="font-weight: 700; color: #9D174D; font-size: 14px; margin-bottom: 4px;">7-Day Size Exchange Guarantee</p>
      <p style="font-size: 12px; color: #BE185D;">If you need a different size for your baby, our concierge team is always here on WhatsApp to assist right away.</p>
    </div>
  `

  return boutiqueEmailTemplate({
    store,
    title: `Delivered with Love! 👶✨`,
    subtitle: `Hi ${data.customerName}, your package for Order #${data.orderNumber} has been marked as safely delivered.`,
    headerTheme: {
      badgeText: "Delivered Successfully",
      badgeBg: "#ECFDF5",
      badgeColor: "#047857",
      iconEmoji: "✅",
    },
    content,
    primaryAction: { label: "Write a Baby Review ⭐", url: `${store.url}/account?tab=orders` },
  })
}

export async function sendOrderDelivered(data: OrderDeliveredPayload) {
  const store = await getStoreMeta()
  const html = renderOrderDeliveredHtml(data, store)
  await sendMail(data.to, `Delivered: Order #${data.orderNumber} — ${store.name}`, html)
}

// ---------------------------------------------------------------------------
// 4. Order Status Update Template
// ---------------------------------------------------------------------------

export type OrderStatusUpdatePayload = {
  to: string
  customerName: string
  orderNumber: string
  status: string
  note?: string | null
}

export function renderOrderStatusUpdateHtml(data: OrderStatusUpdatePayload, store: any) {
  const statusConfig: Record<string, { label: string; bg: string; color: string; desc: string }> = {
    CONFIRMED: { label: "Confirmed", bg: "#EFF6FF", color: "#1D4ED8", desc: "Your order details and address have been verified." },
    PROCESSING: { label: "Processing & Quality Check", bg: "#F0FDF4", color: "#15803D", desc: "Our team is carefully inspecting and packing your baby's items." },
    SHIPPED: { label: "Shipped & In Transit", bg: "#EFF6FF", color: "#1D4ED8", desc: "Your package is on the way with our courier partner." },
    DELIVERED: { label: "Delivered", bg: "#ECFDF5", color: "#047857", desc: "Your parcel has arrived safely at your doorstep." },
    CANCELLED: { label: "Cancelled", bg: "#FFF1F2", color: "#BE123C", desc: "Your order has been cancelled per request or verification." },
    RETURNED: { label: "Returned", bg: "#FFFBEB", color: "#B45309", desc: "Your return has reached our fulfillment center." },
  }

  const cfg = statusConfig[data.status] || { label: data.status, bg: "#F1F5F9", color: "#334155", desc: "Status has been updated." }

  const content = `
    <div class="content-box" style="text-align: center; padding: 24px;">
      <div class="info-label">Current Progress</div>
      <div style="margin: 8px 0 12px;">
        <span class="pill" style="background: ${cfg.bg}; color: ${cfg.color}; font-size: 14px; padding: 8px 18px;">
          ${cfg.label}
        </span>
      </div>
      <p style="font-size: 13px; color: #64748B;">${cfg.desc}</p>
    </div>

    ${data.note ? `
      <div style="background: #EFF6FF; border-left: 3px solid #3B82F6; border-radius: 8px; padding: 14px; font-size: 13px; color: #1E40AF; margin-top: 16px;">
        <strong>Care Note from Team:</strong> ${data.note}
      </div>
    ` : ""}
  `

  return boutiqueEmailTemplate({
    store,
    title: `Order #${data.orderNumber} Status Update`,
    subtitle: `Hi ${data.customerName}, here is the latest progress on your order.`,
    headerTheme: {
      badgeText: cfg.label,
      badgeBg: cfg.bg,
      badgeColor: cfg.color,
      iconEmoji: "🔄",
    },
    content,
    primaryAction: { label: "View Order Details →", url: `${store.url}/account/orders` },
  })
}

export async function sendOrderStatusUpdate(data: OrderStatusUpdatePayload) {
  const store = await getStoreMeta()
  const html = renderOrderStatusUpdateHtml(data, store)
  await sendMail(data.to, `Order #${data.orderNumber} is now ${data.status} — ${store.name}`, html)
}

// ---------------------------------------------------------------------------
// 5. Return & Refund Update Template
// ---------------------------------------------------------------------------

export type ReturnUpdatePayload = {
  to: string
  customerName: string
  orderNumber: string
  status: "APPROVED" | "REJECTED" | "REFUNDED" | "RECEIVED" | string
  refundAmount?: number
  adminNote?: string | null
}

export function renderReturnUpdateHtml(data: ReturnUpdatePayload, store: any) {
  const returnPill: Record<string, { label: string; bg: string; color: string }> = {
    APPROVED: { label: "Return Request Approved", bg: "#ECFDF5", color: "#047857" },
    REFUNDED: { label: "Refund Processed", bg: "#ECFDF5", color: "#047857" },
    RECEIVED: { label: "Item Received at Warehouse", bg: "#EFF6FF", color: "#1D4ED8" },
    REJECTED: { label: "Return Not Approved", bg: "#FFF1F2", color: "#BE123C" },
  }

  const p = returnPill[data.status] || { label: data.status, bg: "#F1F5F9", color: "#334155" }

  const content = `
    <div class="content-box" style="text-align: center;">
      <div style="margin-bottom: 12px;">
        <span class="pill" style="background: ${p.bg}; color: ${p.color}; font-size: 14px; padding: 8px 18px;">
          ${p.label}
        </span>
      </div>

      ${data.refundAmount && data.refundAmount > 0 ? `
        <div class="info-label" style="margin-top: 14px;">Refund Amount</div>
        <div style="font-size: 24px; font-weight: 800; color: #047857; margin-top: 2px;">
          ৳${data.refundAmount.toLocaleString()}
        </div>
      ` : ""}
    </div>

    ${data.adminNote ? `
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px; font-size: 13px; color: #334155; margin-top: 16px;">
        <strong>Staff Note:</strong> ${data.adminNote}
      </div>
    ` : ""}
  `

  return boutiqueEmailTemplate({
    store,
    title: `Return Update for Order #${data.orderNumber}`,
    subtitle: `Hi ${data.customerName}, your return request has been reviewed by our support team.`,
    headerTheme: {
      badgeText: p.label,
      badgeBg: p.bg,
      badgeColor: p.color,
      iconEmoji: "🔁",
    },
    content,
    primaryAction: { label: "View Return Details →", url: `${store.url}/account/orders` },
  })
}

export async function sendReturnUpdate(data: ReturnUpdatePayload) {
  const store = await getStoreMeta()
  const html = renderReturnUpdateHtml(data, store)
  await sendMail(data.to, `Return ${data.status} — Order #${data.orderNumber}`, html)
}

// ---------------------------------------------------------------------------
// 6. Abandoned Cart Recovery Template
// ---------------------------------------------------------------------------

export type AbandonedCartPayload = {
  to: string
  customerName: string
  cartItems: { name: string; size?: string; color?: string; quantity: number; price: number; image?: string }[]
  cartTotal: number
  recoveryUrl: string
  discountCode?: string
  note?: string
}

export function renderAbandonedCartHtml(data: AbandonedCartPayload, store: any) {
  const itemRows = data.cartItems.map((i) => `
    <tr class="item-row">
      <td style="width: 50px;">
        ${i.image ? `<img src="${i.image}" alt="${i.name}" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover; border: 1px solid #E2E8F0;">` : `<div style="width: 44px; height: 44px; border-radius: 8px; background: #F1F5F9; text-align: center; line-height: 44px; font-size: 18px;">🛍️</div>`}
      </td>
      <td style="padding-left: 12px;">
        <div style="font-weight: 700; color: #1E293B; font-size: 14px;">${i.name}</div>
        <div style="font-size: 12px; color: #64748B;">${i.size || "Standard"} &bull; Qty: ${i.quantity}</div>
      </td>
      <td style="text-align: right; font-weight: 700; color: #0F172A; font-size: 14px;">
        ৳${(i.price * i.quantity).toLocaleString()}
      </td>
    </tr>
  `).join("")

  const content = `
    <div style="text-align: center; padding: 10px 0 16px;">
      <div style="display: inline-block; width: 64px; height: 64px; background: #FEF3C7; border-radius: 50%; line-height: 64px; font-size: 28px;">
        🛒
      </div>
    </div>

    <p style="font-size: 14px; color: #475569; margin-bottom: 16px;">
      We saved the cozy baby items in your shopping bag so you can pick up right where you left off.
    </p>

    <table class="item-table">
      ${itemRows}
    </table>

    <div class="content-box">
      <table style="width: 100%;">
        <tr>
          <td style="font-size: 14px; font-weight: 700; color: #1E293B;">Bag Total</td>
          <td style="font-size: 18px; font-weight: 800; color: #0F172A; text-align: right;">৳${data.cartTotal.toLocaleString()}</td>
        </tr>
      </table>
    </div>

    ${data.discountCode ? `
      <div style="background: #ECFDF5; border: 1px dashed #10B981; border-radius: 12px; padding: 14px; text-align: center; margin-top: 16px;">
        <div class="info-label" style="color: #047857;">Exclusive Coupon for You</div>
        <div style="font-family: monospace; font-size: 18px; font-weight: 800; color: #047857; letter-spacing: 2px;">${data.discountCode}</div>
      </div>
    ` : ""}
  `

  return boutiqueEmailTemplate({
    store,
    title: `Did You Leave Something for Your Little One? 🐰`,
    subtitle: `Hi ${data.customerName}, your favorite outfits are waiting safely in your bag.`,
    headerTheme: {
      badgeText: "Saved Shopping Bag",
      badgeBg: "#FEF3C7",
      badgeColor: "#B45309",
      iconEmoji: "🛒",
    },
    content,
    primaryAction: { label: "Complete Your Order →", url: data.recoveryUrl },
  })
}

export async function sendAbandonedCartEmail(data: AbandonedCartPayload) {
  const store = await getStoreMeta()
  const html = renderAbandonedCartHtml(data, store)
  await sendMail(data.to, `Your baby bag is waiting — ${store.name}`, html)
}

// ---------------------------------------------------------------------------
// 7. Welcome Email Template
// ---------------------------------------------------------------------------

export type WelcomeEmailPayload = {
  to: string
  name: string
}

export function renderWelcomeEmailHtml(data: WelcomeEmailPayload, store: any) {
  const content = `
    <div style="text-align: center; padding: 10px 0 20px;">
      <div style="display: inline-block; width: 64px; height: 64px; background: #FDF2F8; border-radius: 50%; line-height: 64px; font-size: 32px;">
        👶
      </div>
    </div>

    <div class="content-box">
      <p style="font-size: 14px; color: #334155; line-height: 1.8;">
        At <strong>${store.name}</strong>, we believe every baby deserves the gentlest touch. Every piece in our collection is crafted with love, using ultra-soft organic cotton and hypoallergenic, baby-safe fabrics.
      </p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0;">
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px; text-align: center;">
        <div style="font-size: 20px; margin-bottom: 4px;">🚚</div>
        <div style="font-weight: 700; color: #1E293B; font-size: 13px;">Fast Home Delivery</div>
        <div style="font-size: 11px; color: #64748B;">Cash on delivery across BD</div>
      </div>
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px; text-align: center;">
        <div style="font-size: 20px; margin-bottom: 4px;">🔄</div>
        <div style="font-weight: 700; color: #1E293B; font-size: 13px;">7-Day Easy Exchange</div>
        <div style="font-size: 11px; color: #64748B;">Hassle-free size swaps</div>
      </div>
    </div>
  `

  return boutiqueEmailTemplate({
    store,
    title: `Welcome to the ${store.name} Family! 🐰✨`,
    subtitle: `Hi ${data.name}, thank you for joining our community of loving parents.`,
    headerTheme: {
      badgeText: "Welcome Member",
      badgeBg: "#FDF2F8",
      badgeColor: "#9D174D",
      iconEmoji: "🎉",
    },
    content,
    primaryAction: { label: "Explore New Baby Arrivals →", url: `${store.url}/shop` },
  })
}

export async function sendWelcomeEmail(data: WelcomeEmailPayload) {
  const store = await getStoreMeta()
  const html = renderWelcomeEmailHtml(data, store)
  await sendMail(data.to, `Welcome to ${store.name}! 🐰 Soft Baby Essentials`, html)
}

// ---------------------------------------------------------------------------
// 8. Gift Card Received Template
// ---------------------------------------------------------------------------

export type GiftCardPayload = {
  to: string
  recipientName: string
  senderName: string
  code: string
  amount: number
  message?: string | null
  expiresAt?: Date | string | null
}

export function renderGiftCardHtml(data: GiftCardPayload, store: any) {
  const content = `
    <div style="text-align: center; padding: 10px 0 16px;">
      <div style="display: inline-block; width: 64px; height: 64px; background: #FEF3C7; border-radius: 50%; line-height: 64px; font-size: 32px;">
        🎁
      </div>
    </div>

    ${data.message ? `
      <div style="background: #FFFBEB; border-left: 3px solid #F59E0B; border-radius: 10px; padding: 16px; font-style: italic; color: #92400E; font-size: 14px; margin-bottom: 20px;">
        "${data.message}"
        <div style="font-weight: 700; font-style: normal; margin-top: 6px; font-size: 12px;">&mdash; ${data.senderName}</div>
      </div>
    ` : ""}

    <div style="background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border-radius: 16px; padding: 28px 20px; text-align: center; color: #FFFFFF; margin: 20px 0;">
      <div class="info-label" style="color: #94A3B8;">Gift Card Value</div>
      <div style="font-size: 36px; font-weight: 800; color: #F8FAFC; margin: 4px 0 16px;">৳${data.amount.toLocaleString()}</div>
      
      <div class="info-label" style="color: #94A3B8;">Your Unique Voucher Code</div>
      <div style="background: rgba(255, 255, 255, 0.15); border: 2px dashed rgba(255, 255, 255, 0.4); border-radius: 10px; padding: 12px 24px; font-family: monospace; font-size: 20px; font-weight: 800; letter-spacing: 3px; color: #FDFBF7; display: inline-block;">
        ${data.code}
      </div>
      
      ${data.expiresAt ? `<div style="font-size: 11px; color: #94A3B8; margin-top: 12px;">Valid until ${new Date(data.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</div>` : ""}
    </div>
  `

  return boutiqueEmailTemplate({
    store,
    title: `You've Received a Gift Card! 🎁`,
    subtitle: `${data.senderName} just sent you a ৳${data.amount.toLocaleString()} gift card for ${store.name}.`,
    headerTheme: {
      badgeText: "Gift Card Voucher",
      badgeBg: "#FEF3C7",
      badgeColor: "#B45309",
      iconEmoji: "🎁",
    },
    content,
    primaryAction: { label: "Redeem & Shop Now →", url: `${store.url}/shop` },
  })
}

export async function sendGiftCardEmail(data: GiftCardPayload) {
  const store = await getStoreMeta()
  const html = renderGiftCardHtml(data, store)
  await sendMail(data.to, `${data.senderName} sent you a ৳${data.amount.toLocaleString()} ${store.name} Gift Card!`, html)
}

// ---------------------------------------------------------------------------
// 9. Store Credit Added Template
// ---------------------------------------------------------------------------

export type StoreCreditPayload = {
  to: string
  customerName: string
  amount: number
  reason: string
  balance: number
}

export function renderStoreCreditHtml(data: StoreCreditPayload, store: any) {
  const content = `
    <div class="content-box" style="text-align: center;">
      <div class="info-label">Credit Added</div>
      <div style="font-size: 28px; font-weight: 800; color: #059669; margin: 4px 0 14px;">+৳${data.amount.toLocaleString()}</div>
      
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px; display: inline-block; min-width: 200px;">
        <div class="info-label">New Wallet Balance</div>
        <div style="font-size: 18px; font-weight: 800; color: #0F172A;">৳${data.balance.toLocaleString()}</div>
      </div>
    </div>

    ${data.reason ? `
      <p style="font-size: 13px; color: #64748B; text-align: center; margin-top: 14px;">
        <strong>Reason:</strong> ${data.reason}
      </p>
    ` : ""}
  `

  return boutiqueEmailTemplate({
    store,
    title: `Store Credit Added to Your Account! 💳`,
    subtitle: `Hi ${data.customerName}, your store credit balance has been boosted.`,
    headerTheme: {
      badgeText: "Wallet Credit",
      badgeBg: "#ECFDF5",
      badgeColor: "#047857",
      iconEmoji: "💳",
    },
    content,
    primaryAction: { label: "Use Your Credit →", url: `${store.url}/shop` },
  })
}

export async function sendStoreCreditIssued(data: StoreCreditPayload) {
  const store = await getStoreMeta()
  const html = renderStoreCreditHtml(data, store)
  await sendMail(data.to, `৳${data.amount.toLocaleString()} Store Credit Added — ${store.name}`, html)
}

// ---------------------------------------------------------------------------
// 10. Back In Stock Alert Template
// ---------------------------------------------------------------------------

export type BackInStockPayload = {
  to: string
  productName: string
  productUrl: string
  variantLabel: string
  image?: string
}

export function renderBackInStockHtml(data: BackInStockPayload, store: any) {
  const content = `
    <div style="text-align: center; padding: 10px 0 16px;">
      ${data.image ? `<img src="${data.image}" alt="${data.productName}" style="width: 140px; height: 140px; border-radius: 16px; object-fit: cover; border: 1px solid #E2E8F0;">` : `<div style="display: inline-block; width: 64px; height: 64px; background: #E0F2FE; border-radius: 50%; line-height: 64px; font-size: 32px;">🔔</div>`}
    </div>

    <div class="content-box" style="text-align: center;">
      <div style="font-size: 18px; font-weight: 800; color: #0F172A; margin-bottom: 4px;">${data.productName}</div>
      <div class="info-label" style="color: #4A8DB7;">${data.variantLabel}</div>
    </div>

    <p style="font-size: 13px; color: #64748B; text-align: center; margin-top: 14px;">
      Stock is strictly limited. Grab your size before it sells out again!
    </p>
  `

  return boutiqueEmailTemplate({
    store,
    title: `Back in Stock! 🔔✨`,
    subtitle: `An item on your watchlist has been restocked at ${store.name}.`,
    headerTheme: {
      badgeText: "Restocked Alert",
      badgeBg: "#E0F2FE",
      badgeColor: "#0369A1",
      iconEmoji: "🔔",
    },
    content,
    primaryAction: { label: "Buy Before It Sells Out →", url: data.productUrl },
  })
}

export async function sendBackInStockAlert(data: BackInStockPayload) {
  const store = await getStoreMeta()
  const html = renderBackInStockHtml(data, store)
  await sendMail(data.to, `Back in Stock: ${data.productName} — ${store.name}`, html)
}

// ---------------------------------------------------------------------------
// 11. Post-Purchase Review Request Template
// ---------------------------------------------------------------------------

export type ReviewRequestPayload = {
  to: string
  customerName: string
  orderNumber: string
  productNames: string
  reviewUrl?: string
}

export function renderReviewRequestHtml(data: ReviewRequestPayload, store: any) {
  const reviewLink = data.reviewUrl || `${store.url}/account?tab=orders`

  const content = `
    <div style="text-align: center; padding: 10px 0 16px;">
      <div style="font-size: 32px; letter-spacing: 4px; margin-bottom: 8px;">⭐⭐⭐⭐⭐</div>
    </div>

    <div class="content-box" style="text-align: center;">
      <p style="font-size: 14px; color: #334155; line-height: 1.7;">
        How does the <strong>${data.productNames}</strong> fit your baby? Your review helps other parents find the coziest outfits for their children.
      </p>
    </div>
  `

  return boutiqueEmailTemplate({
    store,
    title: `How Does the Outfit Fit Your Baby? 👶⭐`,
    subtitle: `Hi ${data.customerName}, we hope your little one is loving Order #${data.orderNumber}!`,
    headerTheme: {
      badgeText: "Parent Feedback",
      badgeBg: "#FEF3C7",
      badgeColor: "#B45309",
      iconEmoji: "⭐",
    },
    content,
    primaryAction: { label: "Leave a Quick Review →", url: reviewLink },
  })
}

export async function sendReviewRequestEmail(data: ReviewRequestPayload) {
  const store = await getStoreMeta()
  const html = renderReviewRequestHtml(data, store)
  await sendMail(data.to, `How is your baby enjoying their ${store.name} outfit? (${data.orderNumber})`, html)
}

// ---------------------------------------------------------------------------
// 12. Password Reset / OTP Template
// ---------------------------------------------------------------------------

export type PasswordResetPayload = {
  to: string
  customerName: string
  otpCode?: string
  resetUrl?: string
  expiresInMinutes?: number
}

export function renderPasswordResetHtml(data: PasswordResetPayload, store: any) {
  const content = `
    <div style="text-align: center; padding: 10px 0 16px;">
      <div style="display: inline-block; width: 64px; height: 64px; background: #EFF6FF; border-radius: 50%; line-height: 64px; font-size: 30px;">
        🔐
      </div>
    </div>

    <p style="font-size: 14px; color: #475569; text-align: center; margin-bottom: 20px;">
      We received a request to securely access or reset your ${store.name} account password.
    </p>

    ${data.otpCode ? `
      <div style="background: #F8FAFC; border: 2px dashed #CBD5E1; border-radius: 14px; padding: 20px; text-align: center; margin: 20px 0;">
        <div class="info-label">Your Verification Code</div>
        <div style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4A8DB7; margin: 8px 0;">
          ${data.otpCode}
        </div>
        <div style="font-size: 12px; color: #94A3B8;">Valid for the next ${data.expiresInMinutes || 10} minutes</div>
      </div>
    ` : ""}

    <p style="font-size: 12px; color: #94A3B8; text-align: center; margin-top: 16px;">
      If you did not request this, you can safely ignore this email. Your account remains secure.
    </p>
  `

  return boutiqueEmailTemplate({
    store,
    title: `Account Security Verification 🔐`,
    subtitle: `Hi ${data.customerName}, here is your secure code.`,
    headerTheme: {
      badgeText: "Security Authentication",
      badgeBg: "#EFF6FF",
      badgeColor: "#1D4ED8",
      iconEmoji: "🔐",
    },
    content,
    primaryAction: data.resetUrl ? { label: "Reset Your Password →", url: data.resetUrl } : undefined,
  })
}

export async function sendPasswordResetEmail(data: PasswordResetPayload) {
  const store = await getStoreMeta()
  const html = renderPasswordResetHtml(data, store)
  await sendMail(data.to, `Account Verification Code — ${store.name}`, html)
}

// ---------------------------------------------------------------------------
// 13. Admin Operational Alert: New Order
// ---------------------------------------------------------------------------

export type AdminNewOrderPayload = {
  orderNumber: string
  customerName: string
  customerEmail?: string
  customerPhone: string
  items: { productName: string; size?: string; color?: string; quantity: number; price: number }[]
  subtotal: number
  shippingCharge: number
  discount: number
  total: number
  paymentMethod: string
  shippingAddress: string
  shippingArea?: string
  shippingDistrict?: string
  shippingDivision?: string
}

export function renderAdminNewOrderHtml(data: AdminNewOrderPayload, store: any) {
  const itemRows = data.items.map((i) => `
    <tr class="item-row">
      <td style="padding: 6px 0;">
        <div style="font-weight: 600; color: #1E293B;">${i.productName}</div>
        <div style="font-size: 11px; color: #64748B;">${i.size || "Standard"} &bull; Qty: ${i.quantity}</div>
      </td>
      <td style="text-align: right; font-weight: 700; color: #0F172A;">৳${(i.price * i.quantity).toLocaleString()}</td>
    </tr>
  `).join("")

  const content = `
    <div style="background: #F8FAFC; border-radius: 12px; padding: 14px; margin-bottom: 16px;">
      <table style="width: 100%;">
        <tr>
          <td><span class="info-label">Order</span><div style="font-family: monospace; font-weight: 700;">#${data.orderNumber}</div></td>
          <td><span class="info-label">Payment</span><div><span class="pill pill-blue">${data.paymentMethod}</span></div></td>
          <td style="text-align: right;"><span class="info-label">Net Total</span><div style="font-weight: 800; font-size: 16px; color: #059669;">৳${data.total.toLocaleString()}</div></td>
        </tr>
      </table>
    </div>

    <div class="content-box">
      <div class="info-label">Customer Profile</div>
      <div style="font-weight: 700; font-size: 14px; color: #1E293B;">${data.customerName} &bull; ${data.customerPhone}</div>
      ${data.customerEmail ? `<div style="font-size: 12px; color: #64748B;">${data.customerEmail}</div>` : ""}
      <div style="font-size: 12px; color: #64748B; margin-top: 4px;">📍 ${[data.shippingAddress, data.shippingArea, data.shippingDistrict].filter(Boolean).join(", ")}</div>
    </div>

    <table class="item-table">
      ${itemRows}
    </table>
  `

  return boutiqueEmailTemplate({
    store,
    title: `🚨 New Order #${data.orderNumber} Received!`,
    subtitle: `Total: ৳${data.total.toLocaleString()} &bull; ${data.customerName}`,
    headerTheme: {
      badgeText: "Admin Alert",
      badgeBg: "#FEF3C7",
      badgeColor: "#92400E",
      iconEmoji: "🛍️",
    },
    content,
    primaryAction: { label: "Open in Admin Dashboard →", url: `${store.url}/admin/orders` },
  })
}

export async function sendAdminNewOrder(data: AdminNewOrderPayload) {
  const store = await getStoreMeta()
  const rows = await prisma.setting.findMany({ where: { key: { in: ["admin_notification_email", "support_email"] } } })
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  const adminEmail = s.admin_notification_email || s.support_email || process.env.BREVO_FROM_EMAIL
  if (!adminEmail) return

  const html = renderAdminNewOrderHtml(data, store)
  await sendMail(adminEmail, `🚨 New Order #${data.orderNumber} (৳${data.total.toLocaleString()})`, html)
}

// ---------------------------------------------------------------------------
// 14. Admin Operational Alert: Low Stock
// ---------------------------------------------------------------------------

export type AdminLowStockPayload = {
  productName: string
  sku: string
  size: string
  color: string
  stock: number
  productId: string
}

export function renderAdminLowStockHtml(data: AdminLowStockPayload, store: any) {
  const content = `
    <div class="content-box" style="text-align: center;">
      <div class="info-label">Product Name</div>
      <div style="font-size: 16px; font-weight: 800; color: #0F172A; margin: 4px 0 10px;">${data.productName}</div>
      
      <div style="display: inline-block; background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 12px; padding: 12px 24px; margin-top: 6px;">
        <div class="info-label" style="color: #E11D48;">Remaining Stock</div>
        <div style="font-size: 24px; font-weight: 800; color: #BE123C;">${data.stock} Unit${data.stock === 1 ? "" : "s"}</div>
        <div style="font-size: 11px; color: #881337; margin-top: 2px;">Variant: ${data.size} / ${data.color} (SKU: ${data.sku})</div>
      </div>
    </div>
  `

  return boutiqueEmailTemplate({
    store,
    title: `⚠️ Low Stock Warning: ${data.productName}`,
    subtitle: `Action required: Inventory is down to ${data.stock} units.`,
    headerTheme: {
      badgeText: "Low Stock Alert",
      badgeBg: "#FFF1F2",
      badgeColor: "#BE123C",
      iconEmoji: "⚠️",
    },
    content,
    primaryAction: { label: "Manage Inventory →", url: `${store.url}/admin/inventory` },
  })
}

export async function sendAdminLowStockAlert(data: AdminLowStockPayload) {
  const store = await getStoreMeta()
  const rows = await prisma.setting.findMany({ where: { key: { in: ["admin_notification_email", "support_email"] } } })
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  const adminEmail = s.admin_notification_email || s.support_email || process.env.BREVO_FROM_EMAIL
  if (!adminEmail) return

  const html = renderAdminLowStockHtml(data, store)
  await sendMail(adminEmail, `⚠️ Low Stock Alert: ${data.productName} (${data.stock} left)`, html)
}

// ---------------------------------------------------------------------------
// Template Registry & Live Preview Generator for Admin Studio
// ---------------------------------------------------------------------------

export const EMAIL_TEMPLATE_KEYS = [
  { key: "order_confirmation", label: "1. Order Confirmed", category: "Customer Orders" },
  { key: "shipping_dispatched", label: "2. Shipment Dispatched", category: "Customer Orders" },
  { key: "order_delivered", label: "3. Delivery Confirmed", category: "Customer Orders" },
  { key: "order_status_update", label: "4. Status Changed", category: "Customer Orders" },
  { key: "return_update", label: "5. Return / Refund", category: "Customer Orders" },
  { key: "abandoned_cart", label: "6. Abandoned Cart Recovery", category: "Marketing & Retention" },
  { key: "welcome_email", label: "7. Member Welcome", category: "Marketing & Retention" },
  { key: "gift_card", label: "8. Gift Card Received", category: "Marketing & Retention" },
  { key: "store_credit", label: "9. Store Credit Added", category: "Marketing & Retention" },
  { key: "back_in_stock", label: "10. Back In Stock Alert", category: "Marketing & Retention" },
  { key: "review_request", label: "11. Post-Purchase Review", category: "Marketing & Retention" },
  { key: "password_reset", label: "12. Password Reset / OTP", category: "Security & Auth" },
  { key: "admin_new_order", label: "13. Admin: New Order Alert", category: "Admin Alerts" },
  { key: "admin_low_stock", label: "14. Admin: Low Stock Alert", category: "Admin Alerts" },
]

export function renderMockEmailHtml(templateKey: string, store: any): { subject: string; html: string } {
  switch (templateKey) {
    case "order_confirmation":
      return {
        subject: `Order Confirmed #MB-82910 — ${store.name}`,
        html: renderOrderConfirmationHtml({
          to: "parent@example.com",
          orderNumber: "MB-82910",
          customerName: "Ayesha Rahman",
          items: [
            { productName: "Organic Cotton Baby Romper (Pack of 3)", size: "0-3M", color: "Pastel Sky", quantity: 1, price: 1450, image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=120" },
            { productName: "Soft Bamboo Swaddle Blanket", size: "Standard", color: "Warm Cream", quantity: 2, price: 650, image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=120" },
          ],
          subtotal: 2750,
          shippingCharge: 60,
          discount: 150,
          total: 2660,
          paymentMethod: "Cash on Delivery (COD)",
          shippingName: "Ayesha Rahman",
          shippingPhone: "01712-345678",
          shippingAddress: "House 24, Road 7, Block D",
          shippingArea: "Dhanmondi",
          shippingDistrict: "Dhaka",
          shippingDivision: "Dhaka",
          note: "Please call before delivery as the baby might be asleep.",
          giftWrap: true,
          giftMessage: "Welcome to the world, little angel!",
        }, store),
      }

    case "shipping_dispatched":
      return {
        subject: `Dispatched: Order #MB-82910 is on the way! — ${store.name}`,
        html: renderShippingDispatchedHtml({
          to: "parent@example.com",
          customerName: "Ayesha Rahman",
          orderNumber: "MB-82910",
          courierName: "Steadfast Courier",
          trackingNumber: "SF-89234812",
          trackingUrl: "https://steadfast.com.bd/t/SF-89234812",
        }, store),
      }

    case "order_delivered":
      return {
        subject: `Delivered: Order #MB-82910 — ${store.name}`,
        html: renderOrderDeliveredHtml({
          to: "parent@example.com",
          customerName: "Ayesha Rahman",
          orderNumber: "MB-82910",
        }, store),
      }

    case "order_status_update":
      return {
        subject: `Order #MB-82910 is now Processing & Quality Check — ${store.name}`,
        html: renderOrderStatusUpdateHtml({
          to: "parent@example.com",
          customerName: "Ayesha Rahman",
          orderNumber: "MB-82910",
          status: "PROCESSING",
          note: "Your romper set has passed our stitch & fabric softness inspection.",
        }, store),
      }

    case "return_update":
      return {
        subject: `Return Request Approved — Order #MB-82910`,
        html: renderReturnUpdateHtml({
          to: "parent@example.com",
          customerName: "Ayesha Rahman",
          orderNumber: "MB-82910",
          status: "APPROVED",
          refundAmount: 1450,
          adminNote: "Our rider will pick up the size 0-3M romper and deliver the 3-6M replacement directly to you.",
        }, store),
      }

    case "abandoned_cart":
      return {
        subject: `Your baby bag is waiting — ${store.name}`,
        html: renderAbandonedCartHtml({
          to: "parent@example.com",
          customerName: "Tanvir Ahmed",
          cartItems: [
            { name: "Super-Soft Knitted Baby Cardigan", size: "6-12M", color: "Oatmeal", quantity: 1, price: 1850, image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=120" },
            { name: "Organic Cotton Muslin Bibs (Set of 4)", size: "One Size", color: "Pastel Assorted", quantity: 1, price: 550, image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=120" },
          ],
          cartTotal: 2400,
          recoveryUrl: `${store.url}/cart`,
          discountCode: "BUNNYBABY5",
        }, store),
      }

    case "welcome_email":
      return {
        subject: `Welcome to ${store.name}! 🐰 Soft Baby Essentials`,
        html: renderWelcomeEmailHtml({
          to: "newparent@example.com",
          name: "Farhana Karim",
        }, store),
      }

    case "gift_card":
      return {
        subject: `Sadia Islam sent you a ৳3,000 ${store.name} Gift Card!`,
        html: renderGiftCardHtml({
          to: "friend@example.com",
          recipientName: "Nusrat Jahan",
          senderName: "Sadia Islam",
          code: "BUNNY-GIFT-9821-LOVE",
          amount: 3000,
          message: "Congratulations on your newborn baby girl! Can't wait to meet her soon.",
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        }, store),
      }

    case "store_credit":
      return {
        subject: `৳500 Store Credit Added — ${store.name}`,
        html: renderStoreCreditHtml({
          to: "parent@example.com",
          customerName: "Ayesha Rahman",
          amount: 500,
          reason: "Appreciation bonus for your 5-star baby outfit review",
          balance: 1250,
        }, store),
      }

    case "back_in_stock":
      return {
        subject: `Back in Stock: Organic Newborn Sleepsuit — ${store.name}`,
        html: renderBackInStockHtml({
          to: "parent@example.com",
          productName: "Organic Newborn Sleepsuit with Mittens",
          productUrl: `${store.url}/shop`,
          variantLabel: "Size 3-6 Months &bull; Color: Cloud White",
          image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=120",
        }, store),
      }

    case "review_request":
      return {
        subject: `How is your baby enjoying their ${store.name} outfit? (#MB-82910)`,
        html: renderReviewRequestHtml({
          to: "parent@example.com",
          customerName: "Ayesha Rahman",
          orderNumber: "MB-82910",
          productNames: "Organic Cotton Baby Romper & Bamboo Swaddle",
          reviewUrl: `${store.url}/account?tab=orders`,
        }, store),
      }

    case "password_reset":
      return {
        subject: `Account Verification Code — ${store.name}`,
        html: renderPasswordResetHtml({
          to: "parent@example.com",
          customerName: "Ayesha Rahman",
          otpCode: "492817",
          expiresInMinutes: 10,
          resetUrl: `${store.url}/reset-password?token=sample-token`,
        }, store),
      }

    case "admin_new_order":
      return {
        subject: `🚨 New Order #MB-82910 (৳2,660)`,
        html: renderAdminNewOrderHtml({
          orderNumber: "MB-82910",
          customerName: "Ayesha Rahman",
          customerEmail: "ayesha.rahman@gmail.com",
          customerPhone: "01712-345678",
          items: [
            { productName: "Organic Cotton Baby Romper (Pack of 3)", size: "0-3M", color: "Pastel Sky", quantity: 1, price: 1450 },
            { productName: "Soft Bamboo Swaddle Blanket", size: "Standard", color: "Warm Cream", quantity: 2, price: 650 },
          ],
          subtotal: 2750,
          shippingCharge: 60,
          discount: 150,
          total: 2660,
          paymentMethod: "Cash on Delivery (COD)",
          shippingAddress: "House 24, Road 7, Block D",
          shippingArea: "Dhanmondi",
          shippingDistrict: "Dhaka",
          shippingDivision: "Dhaka",
        }, store),
      }

    case "admin_low_stock":
      return {
        subject: `⚠️ Low Stock Alert: Baby Romper (Pack of 3) (3 left)`,
        html: renderAdminLowStockHtml({
          productName: "Organic Cotton Baby Romper (Pack of 3)",
          sku: "ROM-SKU-03M-SKY",
          size: "0-3 Months",
          color: "Pastel Sky",
          stock: 3,
          productId: "prod_12345",
        }, store),
      }

    default:
      return {
        subject: `Notification from ${store.name}`,
        html: boutiqueEmailTemplate({
          store,
          title: "Mini Bunny Notification",
          subtitle: "Official communication from Mini Bunny Baby Store.",
          headerTheme: { badgeText: "Store Notice", badgeBg: "#F1F5F9", badgeColor: "#334155", iconEmoji: "🐰" },
          content: `<div class="content-box"><p>Hello from Mini Bunny team.</p></div>`,
        }),
      }
  }
}
