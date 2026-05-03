import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email, password, name, donorId } = await req.json()

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Check if auth user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const exists = existingUsers?.users?.find(u => u.email === email)

    if (exists) {
      // Link existing auth user to donor
      await supabaseAdmin
        .from('donors')
        .update({ auth_id: exists.id })
        .eq('id', donorId)
      return NextResponse.json({ success: true, existing: true })
    }

    // Create new auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Link auth_id to donors table
    await supabaseAdmin
      .from('donors')
      .update({ auth_id: authData.user.id })
      .eq('id', donorId)

    return NextResponse.json({ success: true, userId: authData.user.id })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
