import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data, error } = await supabase
      .from('sites')
      .select('*')
    if (error) throw error
    return NextResponse.json({
      status: 'connected ✅',
      message: 'Supabase is working!',
      sites_count: data.length,
      sites: data
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error ❌',
      message: error.message
    }, { status: 500 })
  }
}
