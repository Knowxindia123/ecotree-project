// lib/supabase.ts
// Phase 2 — Uncomment when Supabase project is ready
// Add to .env.local:
//   NEXT_PUBLIC_SUPABASE_URL=your_project_url
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

/*
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getImpactSummary() {
  const { data } = await supabase
    .from('impact_summary')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .single()
  return data
}

export async function getTreeLocations() {
  const { data } = await supabase
    .from('tree_locations')
    .select('*')
    .eq('verified', true)
  return data
}

export async function getActivityFeed() {
  const { data } = await supabase
    .from('activity_feed')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6)
  return data
}
*/

// ── Supabase SQL: Daily auto-calculation (paste into Supabase SQL editor) ──────
//
// Enable pg_cron first: Dashboard → Database → Extensions → pg_cron
//
// SELECT cron.schedule(
//   'update-impact-summary',
//   '0 0 * * *',
//   $$
//     INSERT INTO impact_summary (date, trees_total, co2_kg, waste_kg, water_litres, updated_at)
//     SELECT
//       CURRENT_DATE,
//       (SELECT COUNT(*) FROM tree_locations WHERE verified = true),
//       (SELECT COUNT(*) FROM tree_locations WHERE verified = true) * 22,
//       (SELECT COALESCE(SUM(kg), 0) FROM waste_drives),
//       (SELECT COUNT(*) FROM tree_locations WHERE verified = true) * 3785,
//       NOW()
//     ON CONFLICT (date) DO UPDATE SET
//       trees_total  = EXCLUDED.trees_total,
//       co2_kg       = EXCLUDED.co2_kg,
//       waste_kg     = EXCLUDED.waste_kg,
//       water_litres = EXCLUDED.water_litres,
//       updated_at   = EXCLUDED.updated_at;
//   $$
// );

export {}
