import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Bucket name generico para todos los componentes
const BUCKET_NAME = "component_media"

/**
 * GET - Fetch all media items for a component
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const pageComponentId = searchParams.get("pageComponentId")

    if (!pageComponentId) {
      return NextResponse.json(
        { error: "pageComponentId es requerido" },
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

    // Fetch media items from database
    const { data, error } = await supabaseAdmin
      .from("component_media")
      .select("id, url, media_type, alt, aspect_ratio, position, metadata")
      .eq("page_component_id", pageComponentId)
      .order("position", { ascending: true })

    if (error) {
      console.error("Fetch component media error:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Transform to component format
    const items = (data || []).map((item) => ({
      id: item.id,
      url: item.url,
      type: item.media_type,
      alt: item.alt,
      aspectRatio: item.aspect_ratio,
      metadata: item.metadata,
    }))

    return NextResponse.json({ items })
  } catch (err) {
    console.error("GET component media error:", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

/**
 * POST - Upload new media item
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const pageComponentId = formData.get("pageComponentId") as string
    const mediaType = formData.get("mediaType") as "image" | "video" | "document"

    if (!file || !pageComponentId || !mediaType) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: file, pageComponentId, mediaType" },
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

    // Generate unique filename with folder structure
    const ext = file.name.split(".").pop() || getDefaultExtension(mediaType)
    const fileName = `${pageComponentId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`

    // Get current max position
    const { data: maxPosData } = await supabaseAdmin
      .from("component_media")
      .select("position")
      .eq("page_component_id", pageComponentId)
      .order("position", { ascending: false })
      .limit(1)
      .single()

    const nextPosition = (maxPosData?.position || 0) + 1

    // Insert into database
    const { data: mediaData, error: dbError } = await supabaseAdmin
      .from("component_media")
      .insert({
        page_component_id: pageComponentId,
        storage_path: fileName,
        url: publicUrl,
        media_type: mediaType,
        content_type: file.type,
        file_size: file.size,
        position: nextPosition,
        metadata: {},
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database insert error:", dbError)
      // Try to clean up uploaded file
      await supabaseAdmin.storage.from(BUCKET_NAME).remove([fileName])
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: mediaData.id,
        url: mediaData.url,
        type: mediaData.media_type,
      },
    })
  } catch (err) {
    console.error("POST component media error:", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Remove a media item
 */
export async function DELETE(req: NextRequest) {
  try {
    const { mediaId, pageComponentId } = await req.json()

    if (!mediaId || !pageComponentId) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: mediaId, pageComponentId" },
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

    // Get media record to find storage path
    const { data: mediaData, error: fetchError } = await supabaseAdmin
      .from("component_media")
      .select("storage_path")
      .eq("id", mediaId)
      .eq("page_component_id", pageComponentId)
      .single()

    if (fetchError || !mediaData) {
      return NextResponse.json(
        { error: "Media no encontrado" },
        { status: 404 }
      )
    }

    // Delete from storage
    const { error: storageError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([mediaData.storage_path])

    if (storageError) {
      console.error("Storage delete error:", storageError)
      // Continue anyway to delete from DB
    }

    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from("component_media")
      .delete()
      .eq("id", mediaId)

    if (dbError) {
      console.error("Database delete error:", dbError)
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE component media error:", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Update media item (alt, position, metadata)
 */
export async function PATCH(req: NextRequest) {
  try {
    const { mediaId, pageComponentId, alt, position, metadata } = await req.json()

    if (!mediaId || !pageComponentId) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: mediaId, pageComponentId" },
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

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (alt !== undefined) updateData.alt = alt
    if (position !== undefined) updateData.position = position
    if (metadata !== undefined) updateData.metadata = metadata

    const { data, error } = await supabaseAdmin
      .from("component_media")
      .update(updateData)
      .eq("id", mediaId)
      .eq("page_component_id", pageComponentId)
      .select()
      .single()

    if (error) {
      console.error("Update component media error:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("PATCH component media error:", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

/**
 * Helper: Get default file extension based on media type
 */
function getDefaultExtension(mediaType: string): string {
  switch (mediaType) {
    case "video":
      return "mp4"
    case "document":
      return "pdf"
    default:
      return "jpg"
  }
}
