import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

// Admin client with service role to bypass RLS
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

// POST - Create discount
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      product_id,
      currency_code,
      discount_amount,
      discount_percent,
      start_at,
      end_at,
      metadata,
      is_active,
    } = body

    if (!product_id) {
      return NextResponse.json({ error: "product_id is required" }, { status: 400 })
    }

    const supabase = getAdminClient()

    const { data, error } = await supabase
      .from("product_price_discounts")
      .insert({
        product_id,
        currency_code: currency_code || "COP",
        discount_amount: discount_amount || null,
        discount_percent: discount_percent || null,
        start_at: start_at || new Date().toISOString(),
        end_at: end_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: metadata || null,
        is_active: is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating discount:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("Create discount error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update discount
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      id,
      currency_code,
      discount_amount,
      discount_percent,
      start_at,
      end_at,
      metadata,
      is_active,
    } = body

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const supabase = getAdminClient()

    const updateData: Record<string, unknown> = {}
    if (currency_code !== undefined) updateData.currency_code = currency_code
    if (discount_amount !== undefined) updateData.discount_amount = discount_amount
    if (discount_percent !== undefined) updateData.discount_percent = discount_percent
    if (start_at !== undefined) updateData.start_at = start_at
    if (end_at !== undefined) updateData.end_at = end_at
    if (metadata !== undefined) updateData.metadata = metadata
    if (is_active !== undefined) updateData.is_active = is_active

    const { data, error } = await supabase
      .from("product_price_discounts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating discount:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("Update discount error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete discount
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const supabase = getAdminClient()

    const { error } = await supabase
      .from("product_price_discounts")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting discount:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete discount error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
