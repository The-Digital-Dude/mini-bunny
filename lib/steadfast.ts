import crypto from "crypto"

const BASE_URL = "https://portal.packzy.com/api/v1"

function headers() {
  return {
    "Content-Type": "application/json",
    "Api-Key": process.env.STEADFAST_API_KEY ?? "",
    "Secret-Key": process.env.STEADFAST_SECRET_KEY ?? "",
  }
}

export interface SteadfastOrder {
  invoice: string
  recipient_name: string
  recipient_phone: string
  recipient_address: string
  cod_amount: number
  note?: string
}

export interface SteadfastConsignment {
  consignment_id: number
  tracking_code: string
  status: string
}

export async function createConsignment(order: SteadfastOrder): Promise<SteadfastConsignment> {
  const res = await fetch(`${BASE_URL}/create_order`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(order),
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Steadfast create failed: ${res.status} - ${errorText}`)
  }
  const data = await res.json()
  return data.consignment
}

export async function getConsignmentStatus(consignmentId: string): Promise<{ status: string }> {
  const res = await fetch(`${BASE_URL}/status_by_cid/${consignmentId}`, { headers: headers() })
  if (!res.ok) throw new Error(`Steadfast status failed: ${res.status}`)
  const data = await res.json()
  return { status: data.delivery_status }
}

export async function getConsignmentStatusByInvoice(invoice: string): Promise<{ status: string }> {
  const res = await fetch(`${BASE_URL}/status_by_invoice/${invoice}`, { headers: headers() })
  if (!res.ok) throw new Error(`Steadfast status by invoice failed: ${res.status}`)
  const data = await res.json()
  return { status: data.delivery_status }
}

export async function getConsignmentStatusByTrackingCode(trackingCode: string): Promise<{ status: string }> {
  const res = await fetch(`${BASE_URL}/status_by_trackingcode/${trackingCode}`, { headers: headers() })
  if (!res.ok) throw new Error(`Steadfast status by tracking code failed: ${res.status}`)
  const data = await res.json()
  return { status: data.delivery_status }
}

export async function getSteadfastBalance(): Promise<{ current_balance: number }> {
  const res = await fetch(`${BASE_URL}/get_balance`, { headers: headers() })
  if (!res.ok) throw new Error(`Steadfast balance check failed: ${res.status}`)
  const data = await res.json()
  return { current_balance: Number(data.current_balance || 0) }
}

export async function bulkCreate(orders: SteadfastOrder[]): Promise<SteadfastConsignment[]> {
  const res = await fetch(`${BASE_URL}/create_order/bulk-order`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(orders),
  })
  if (!res.ok) throw new Error(`Steadfast bulk create failed: ${res.status}`)
  const data = await res.json()
  return data.consignment ?? []
}

/**
 * Verify HMAC-SHA256 signature for incoming Steadfast Webhooks
 */
export function verifySteadfastWebhook(rawBody: string, signature: string | null): boolean {
  const secretKey = process.env.STEADFAST_SECRET_KEY || ""
  if (!secretKey) return true // Allow if secret is not configured
  if (!signature) return false

  try {
    const expected = crypto.createHmac("sha256", secretKey).update(rawBody).digest("hex")
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}
