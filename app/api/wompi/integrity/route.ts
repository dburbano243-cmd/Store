import { NextResponse } from "next/server"

/**
 * Generates a Wompi integrity signature (SHA-256 hash) server-side
 * so the integrity secret is never exposed to the client.
 *
 * Required env vars:
 *   WOMPI_INTEGRITY_SECRET  - found in Wompi Dashboard > Developers > Secrets
 *
 * POST body: { reference: string, amountInCents: number, currency: string }
 */
export async function POST(request: Request) {
  try {
    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET

    if (!integritySecret) {
      return NextResponse.json(
        { error: "WOMPI_INTEGRITY_SECRET is not configured" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { reference, amountInCents, currency } = body as {
      reference: string
      amountInCents: number
      currency: string
    }

    if (!reference || !amountInCents || !currency) {
      return NextResponse.json(
        { error: "Missing required fields: reference, amountInCents, currency" },
        { status: 400 }
      )
    }

    // Wompi integrity signature format:
    // SHA256("<reference><amountInCents><currency><integritySecret>")
    const concatenated = `${reference}${amountInCents}${currency}${integritySecret}`

    const encoded = new TextEncoder().encode(concatenated)
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoded)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

    return NextResponse.json({ integrity: hashHex })
  } catch {
    return NextResponse.json(
      { error: "Failed to generate integrity signature" },
      { status: 500 }
    )
  }
}
