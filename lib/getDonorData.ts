import { supabase } from '@/lib/supabase'

export interface DonorProfile {
  id: string; name: string; first_name: string; email: string; phone: string | null;
  since: string; location: string; total_trees: number; co2_kg: number;
  water_litres: number; km_equivalent: number; referral_code: string;
  photo_url: string | null; pan: string | null; birthday: string | null;
  anniversary: string | null; raw_id: number;
}

export interface DonorTree {
  id: number; tree_id: string; species: string; tree_type: string;
  lat: number | null; lng: number | null; zone: string; health: number;
  planted: string; occasion: string; verified: boolean; pulse: boolean;
  photo_url: string | null; before_photo_url: string | null;
  after_photo_url: string | null; status: string; qr_code_url: string | null;
  tier: string; partner_name?: string;
}

export interface OccasionItem {
  date: string; occasion: string; species: string; zone: string; icon: string; color: string;
}

const OCCASION_ICON: Record<string, string> = {
  birthday:'🎂', anniversary:'💍', memorial:'🙏', diwali:'🪔',
  'new year':'🎆', 'earth day':'🌍', corporate:'🏢', gift:'🎁',
  valentine:'❤️', pongal:'🌾', holi:'🎨', 'csr drive':'🏢',
}
const OCCASION_COLOR: Record<string, string> = {
  birthday:'#e879f9', anniversary:'#f43f5e', memorial:'#7c3aed',
  diwali:'#f59e0b', 'new year':'#10b981', 'earth day':'#2C5F2D',
  corporate:'#0284c7', gift:'#f59e0b', valentine:'#f43f5e',
  pongal:'#f59e0b', holi:'#e879f9', 'csr drive':'#0284c7',
}
export function getOccasionIcon(occasion: string) {
  const key = (occasion || '').toLowerCase()
  for (const [k, v] of Object.entries(OCCASION_ICON)) { if (key.includes(k)) return v }
  return '🌱'
}
export function getOccasionColor(occasion: string) {
  const key = (occasion || '').toLowerCase()
  for (const [k, v] of Object.entries(OCCASION_COLOR)) { if (key.includes(k)) return v }
  return '#2C5F2D'
}
export const SPECIES_EMOJI: Record<string, string> = {
  Peepal:'🌳', Neem:'🌿', Mango:'🥭', Banyan:'🌴',
  'Rain Tree':'🌲', Jamun:'🍇', Guava:'🍈', Gulmohar:'🌸', 'Custom tree':'🌱',
}
export const SPECIES_COLOR: Record<string, string> = {
  Peepal:'#2C5F2D', Neem:'#40916C', Mango:'#b45309', Banyan:'#7c3aed',
  'Rain Tree':'#1d4ed8', Jamun:'#6d28d9', Guava:'#065f46',
  Gulmohar:'#be185d', 'Custom tree':'#1A3C34',
}
export const HEALTH_COLOR = (h: number) =>
  h >= 85 ? '#22c55e' : h >= 70 ? '#f59e0b' : '#ef4444'

export async function getDonorData(email: string): Promise<{
  donor: DonorProfile | null; myTrees: DonorTree[]; occasionTimeline: OccasionItem[];
}> {
  // ── Step 1: Get ALL donor rows for this email (one per tier) ──
  const { data: allDonorRows } = await supabase
    .from('donors').select('*').eq('email', email).order('created_at', { ascending: true })

  if (!allDonorRows || allDonorRows.length === 0)
    return { donor: null, myTrees: [], occasionTimeline: [] }

  const primaryDonor = allDonorRows[0]
  const allDonorIds  = allDonorRows.map((d: any) => d.id)

  // ── Step 2: Fetch trees for ALL donor ids ──
  const { data: treesData } = await supabase
    .from('trees')
    .select('id, tree_id, species, tree_type, status, latitude, longitude, planting_date, latest_health_score, photo_url, qr_code_url, donor_id, sites(name, city)')
    .in('donor_id', allDonorIds)
    .order('planting_date', { ascending: true })

  // ── Step 3: Fetch pool trees for ALL donor ids (joint ₹500) ──
  let poolTrees: any[] = []
  const { data: poolMemberships } = await supabase
    .from('tree_pool_members')
    .select('pool_id, donor_id, tree_pools(id, status, tree_id, trees(id, tree_id, species, tree_type, status, latitude, longitude, planting_date, latest_health_score, photo_url, qr_code_url, donor_id, sites(name, city)))')
    .in('donor_id', allDonorIds)

  // Build partner name map: pool_id → partner name
  const partnerMap: Record<number, string> = {}
  ;(poolMemberships || []).forEach((pm: any) => {
    const pool = Array.isArray(pm.tree_pools) ? pm.tree_pools[0] : pm.tree_pools
    if (pool?.status === 'COMPLETE' && pool?.trees) {
      const tree = Array.isArray(pool.trees) ? pool.trees[0] : pool.trees
      if (tree) {
        const alreadyDirect = (treesData || []).some((t: any) => t.id === tree.id)
        if (!alreadyDirect) {
          poolTrees.push({ ...tree, _isPoolTree: true, _poolId: pm.pool_id })
        }
      }
    }
  })

  // Fetch partner names for pool trees
  if (poolTrees.length > 0) {
    const poolIds = [...new Set(poolTrees.map((t: any) => t._poolId))]
    for (const poolId of poolIds) {
      const { data: members } = await supabase
        .from('tree_pool_members')
        .select('donor_id, donors(name)')
        .eq('pool_id', poolId)
        .not('donor_id', 'in', `(${allDonorIds.join(',')})`)
      const partner = members?.[0]
      const partnerName = Array.isArray(partner?.donors) ? partner?.donors[0]?.name : (partner?.donors as any)?.name
      if (partnerName) partnerMap[poolId] = partnerName
    }
  }

  // ── Step 4: Merge all trees ──
  const allTrees = [...(treesData || []), ...poolTrees]

  const treeIds = allTrees.map((t: any) => t.id)
  const { data: updatesData } = await supabase
    .from('tree_updates')
    .select('tree_id, before_photo_url, after_photo_url, latitude, longitude, ai_health_score')
    .in('tree_id', treeIds.length > 0 ? treeIds : [0])
    .order('created_at', { ascending: false })

  const updateMap: Record<number, any> = {}
  updatesData?.forEach((u: any) => { if (!updateMap[u.tree_id]) updateMap[u.tree_id] = u })

  // Fetch donations for all donor ids
  const { data: donationsData } = await supabase
    .from('donations').select('tree_id, occasion_label').in('donor_id', allDonorIds)
  const donationMap: Record<number, any> = {}
  donationsData?.forEach((d: any) => { donationMap[d.tree_id] = d })

  // ── Step 5: Build combined profile ──
  const totalTrees   = allTrees.length
  const co2Kg        = totalTrees * 22
  const waterL       = totalTrees * 3785
  const kmEquiv      = Math.round(co2Kg / 0.21)
  const totalDonated = allDonorRows.reduce((s: number, d: any) => s + Number(d.total_donated || 0), 0)

  // Get donor row matching primary tier for display (use most recent)
  const latestDonor = allDonorRows[allDonorRows.length - 1]

  const donor: DonorProfile = {
    id:            `ECO-${new Date(primaryDonor.created_at).getFullYear()}-${String(primaryDonor.id).padStart(4,'0')}`,
    name:          primaryDonor.name,
    first_name:    primaryDonor.name.split(' ')[0],
    email:         primaryDonor.email,
    phone:         primaryDonor.phone,
    since:         new Date(primaryDonor.created_at).toLocaleDateString('en-IN', { month:'long', year:'numeric' }),
    location:      primaryDonor.city || 'Bangalore',
    total_trees:   totalTrees,
    co2_kg:        co2Kg,
    water_litres:  waterL,
    km_equivalent: kmEquiv,
    referral_code: primaryDonor.name.toUpperCase().replace(/\s/g,'').slice(0,6) + primaryDonor.id,
    photo_url:     latestDonor.photo_url || null,
    pan:           latestDonor.pan,
    birthday:      latestDonor.birthday,
    anniversary:   latestDonor.anniversary,
    raw_id:        primaryDonor.id,
  }

  // ── Step 6: Build tree list with tier info ──
  const myTrees: DonorTree[] = allTrees.map((t: any, i: number) => {
    const donation = donationMap[t.id]
    const update   = updateMap[t.id]
    const site     = Array.isArray(t.sites) ? t.sites[0] : t.sites

    // Find which donor_id this tree belongs to → get tier
    const ownerDonor = allDonorRows.find((d: any) => d.id === t.donor_id)
    const treeTier   = t.tree_type === 'Joint Tree' ? '500' : (ownerDonor?.tier || '1000')

    return {
      id:               t.id,
      tree_id:          t.tree_id,
      species:          t.species,
      tree_type:        t.tree_type || 'Individual Tree',
      tier:             treeTier,
      lat:              update?.latitude  || t.latitude  || null,
      lng:              update?.longitude || t.longitude || null,
      zone:             site?.name || 'Bangalore',
      health:           update?.ai_health_score || t.latest_health_score || 80,
      planted:          t.planting_date
        ? new Date(t.planting_date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
        : '—',
      occasion:         donation?.occasion_label || (t.tree_type === 'Joint Tree' ? '🤝 Joint Tree' : 'Gift'),
      verified:         t.status === 'VERIFIED' || t.status === 'HEALTHY',
      pulse:            i === 0,
      photo_url:        update?.after_photo_url || t.photo_url || null,
      before_photo_url: update?.before_photo_url || null,
      after_photo_url:  update?.after_photo_url  || t.photo_url || null,
      status:           t.status,
      qr_code_url:      t.qr_code_url,
      partner_name:     t._poolId ? partnerMap[t._poolId] : undefined,
    }
  })

  const occasionTimeline: OccasionItem[] = myTrees.map(t => ({
    date: t.planted, occasion: t.occasion, species: t.species,
    zone: t.zone, icon: getOccasionIcon(t.occasion), color: getOccasionColor(t.occasion),
  }))

  return { donor, myTrees, occasionTimeline }
}
