import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const productId = formData.get("product_id") as string
    const fileName = formData.get("file_name") as string
    const position = formData.get("position") as string
    const isPrimary = formData.get("is_primary") === "true"

    if (!file || !productId || !fileName) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Configuracion del servidor incompleta" },
        { status: 500 }
      )
    }

    // Use service role key to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const storagePath = `products/${productId}/${fileName}`

    // Convert File to ArrayBuffer then to Buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to storage bucket
    const { error: uploadError } = await supabaseAdmin.storage
      .from("storage")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/storage/${storagePath}`

    // Determine media type
    const mediaType = file.type.startsWith("video/") ? "video" : "image"

    // Insert into product_media table
    const { data: mediaData, error: dbError } = await supabaseAdmin
      .from("product_media")
      .insert({
        product_id: productId,
        storage_path: storagePath,
        url: publicUrl,
        media_type: mediaType,
        content_type: file.type,
        file_name: fileName,
        file_size: file.size,
        position: Number(position) || 1,
        is_primary: isPrimary,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database insert error:", dbError)
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: mediaData,
      url: publicUrl,
    })
  } catch (err) {
    console.error("Upload media error:", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { mediaId, storagePath } = await req.json()

    if (!mediaId || !storagePath) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Configuracion del servidor incompleta" },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // Delete from storage
    await supabaseAdmin.storage.from("storage").remove([storagePath])

    // Delete from product_media table
    await supabaseAdmin.from("product_media").delete().eq("id", mediaId)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete media error:", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
