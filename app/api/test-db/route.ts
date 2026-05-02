import { NextResponse } from 'next/server'

export async function GET() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return NextResponse.json({
    url_exists:  !!url,
    key_exists:  !!key,
    url_preview: url  ? url.substring(0, 30) + '...' : 'NOT FOUND',
    key_preview: key  ? key.substring(0, 20) + '...' : 'NOT FOUND',
  })
}
