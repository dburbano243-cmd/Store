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

// DELETE product
export async function DELETE(req: NextRequest) {
  try {
    const { productId } = await req.json()
    console.log("[v0] Admin API DELETE product:", productId)

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 })
    }

    const supabase = getAdminClient()

    // 1. Get all media for this product
    const { data: mediaData } = await supabase
      .from("product_media")
      .select("storage_path")
      .eq("product_id", productId)

    // 2. Delete media files from storage
    if (mediaData && mediaData.length > 0) {
      const paths = mediaData.map((m) => m.storage_path)
      await supabase.storage.from("storage").remove(paths)
    }

    // 3. Delete from product_media table
    console.log("[v0] Deleting product_media...")
    const { error: mediaError } = await supabase.from("product_media").delete().eq("product_id", productId)
    if (mediaError) console.log("[v0] product_media error:", mediaError)

    // 4. Delete discounts
    console.log("[v0] Deleting product_price_discounts...")
    const { error: discountsError } = await supabase.from("product_price_discounts").delete().eq("product_id", productId)
    if (discountsError) console.log("[v0] product_price_discounts error:", discountsError)

    // 5. Delete prices
    console.log("[v0] Deleting product_prices...")
    const { error: pricesError } = await supabase.from("product_prices").delete().eq("product_id", productId)
    if (pricesError) console.log("[v0] product_prices error:", pricesError)

    // 6. Delete features
    console.log("[v0] Deleting product_features...")
    const { error: featuresError } = await supabase.from("product_features").delete().eq("product_id", productId)
    if (featuresError) console.log("[v0] product_features error:", featuresError)

    // 7. Finally delete the product
    console.log("[v0] Deleting product...")
    const { error } = await supabase.from("products").delete().eq("id", productId)

    if (error) {
      console.error("Error deleting product:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete product error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
