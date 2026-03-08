import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const CUSTOMER_TYPE_USER_ID = "67289587-b905-43fb-9d61-0030a566101e"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      user_id,
      name,
      email,
      address,
      city,
      phone,
    } = body

    if (!user_id || !name || !email) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (user_id, name, email)" },
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

    const { error } = await supabaseAdmin.from("users").upsert(
      {
        id: user_id,
        name,
        email,
        type_user_id: CUSTOMER_TYPE_USER_ID,
        address: address || null,
        city: city || null,
        phone: phone || null,
      },
      { onConflict: "id" }
    )

    if (error) {
      console.error("Profile upsert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Register profile error:", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
