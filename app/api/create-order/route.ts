import { NextResponse } from "next/server"

/**
 * Proxy route to the Supabase Edge Function `create-order`.
 *
 * This avoids exposing the Supabase Functions URL and service role key
 * directly in the client.
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase project URL (already configured)
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key for auth
 *
 * POST body (forwarded to Edge Function):
 * {
 *   customer_id: string,
 *   items: Array<{ product_id: string, quantity: number, unit_price: number }>,
 *   total: number,
 *   return_url: string
 * }
 *
 * Response from Edge Function:
 * { order_id: string, payment_url: string }
 */
export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_SUPABASE_URL is not configured" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { customer_id, items, subtotal, shipping_cost, total, return_url, customer, shipment_data } = body as {
      customer_id: string
      items: Array<{ product_id: string; quantity: number; unit_price: number }>
      subtotal: number
      shipping_cost: number
      total: number
      customer: object
      shipment_data?: {
        address: string
        city: string
        neighborhood: string
        additional_info: string
        receiver_name: string
      }
      return_url: string
    }

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Se requiere al menos un producto" },
        { status: 400 }
      )
    }

    if (!total || total <= 0) {
      return NextResponse.json(
        { error: "El total debe ser mayor a cero" },
        { status: 400 }
      )
    }

    if (!return_url) {
      return NextResponse.json(
        { error: "Se requiere la URL de retorno" },
        { status: 400 }
      )
    }

    // For guest checkout, generate a unique UUID so the NOT NULL constraint is satisfied
    const resolvedCustomerId = customer_id || crypto.randomUUID()

    // Call Supabase Edge Function
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/create-order`



    const edgeResponse = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        customer_id: resolvedCustomerId,
        items,
        customer,
        subtotal,
        shipping_cost,
        total,
        return_url,
        shipment_data: shipment_data || null,
      }),
    })

    if (!edgeResponse.ok) {
      const errorText = await edgeResponse.text()
      console.error("Edge Function error:", edgeResponse.status, errorText)

      // Try to parse a JSON error, otherwise forward raw text
      let errorMessage = "Error al crear la orden. Intenta nuevamente."
      try {
        const parsed = JSON.parse(errorText)
        if (parsed.error) errorMessage = parsed.error
        if (parsed.message) errorMessage = parsed.message
      } catch {
        if (errorText) errorMessage = errorText
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: edgeResponse.status }
      )
    }

    const data = await edgeResponse.json()


    // Return the order_id and checkout_url from the Edge Function
    return NextResponse.json({
      order_id: data.order_id,
      checkout_url: data.checkout_url,
    })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json(
      { error: "Error interno al procesar la orden" },
      { status: 500 }
    )
  }
}
