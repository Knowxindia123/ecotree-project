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
  const { data: donorData } = await supabase.from('donors').select('*').eq('email', email).single()
  if (!donorData) return { donor: null, myTrees: [], occasionTimeline: [] }

  // ── Step 1: Direct trees (individual ₹1000, miyawaki, etc.) ──
  const { data: treesData } = await supabase
    .from('trees')
    .select('id, tree_id, species, tree_type, status, latitude, longitude, planting_date, latest_health_score, photo_url, qr_code_url, sites(name, city)')
    .eq('donor_id', donorData.id)
    .order('planting_date', { ascending: true })

  // ── Step 2: Pool trees for ₹500 joint donors ──
  // Donor 2 has NO donor_id on the tree — find via tree_pool_members → tree_pools → trees
  let poolTrees: any[] = []
  if (donorData.tier === '500') {
    const { data: poolMemberships } = await supabase
      .from('tree_pool_members')
      .select('pool_id, tree_pools(id, status, tree_id, trees(id, tree_id, species, tree_type, status, latitude, longitude, planting_date, latest_health_score, photo_url, qr_code_url, sites(name, city)))')
      .eq('donor_id', donorData.id)

    ;(poolMemberships || []).forEach((pm: any) => {
      const pool = Array.isArray(pm.tree_pools) ? pm.tree_pools[0] : pm.tree_pools
      if (pool?.status === 'COMPLETE' && pool?.trees) {
        const tree = Array.isArray(pool.trees) ? pool.trees[0] : pool.trees
        if (tree) {
          // Only add if not already in treesData (avoids Donor 1 double-counting)
          const alreadyDirect = (treesData || []).some((t: any) => t.id === tree.id)
          if (!alreadyDirect) poolTrees.push({ ...tree, _isPoolTree: true })
        }
      }
    })
  }

  // ── Step 3: Merge direct + pool trees ──
  const allTrees = [...(treesData || []), ...poolTrees]

  const treeIds = allTrees.map((t: any) => t.id)
  const { data: updatesData } = await supabase
    .from('tree_updates')
    .select('tree_id, before_photo_url, after_photo_url, latitude, longitude, ai_health_score')
    .in('tree_id', treeIds.length > 0 ? treeIds : [0])
    .order('created_at', { ascending: false })

  const updateMap: Record<number, any> = {}
  updatesData?.forEach((u: any) => { if (!updateMap[u.tree_id]) updateMap[u.tree_id] = u })

  const { data: donationsData } = await supabase
    .from('donations').select('tree_id, occasion_label').eq('donor_id', donorData.id)
  const donationMap: Record<number, any> = {}
  donationsData?.forEach((d: any) => { donationMap[d.tree_id] = d })

  const totalTrees = allTrees.length
  const co2Kg      = totalTrees * 22
  const waterL     = totalTrees * 3785
  const kmEquiv    = Math.round(co2Kg / 0.21)

  const donor: DonorProfile = {
    id:            `ECO-${new Date(donorData.created_at).getFullYear()}-${String(donorData.id).padStart(4,'0')}`,
    name:          donorData.name,
    first_name:    donorData.name.split(' ')[0],
    email:         donorData.email,
    phone:         donorData.phone,
    since:         new Date(donorData.created_at).toLocaleDateString('en-IN', { month:'long', year:'numeric' }),
    location:      donorData.city || 'Bangalore',
    total_trees:   totalTrees,
    co2_kg:        co2Kg,
    water_litres:  waterL,
    km_equivalent: kmEquiv,
    referral_code: donorData.name.toUpperCase().replace(/\s/g,'').slice(0,6) + donorData.id,
    photo_url:     donorData.photo_url || null,
    pan:           donorData.pan,
    birthday:      donorData.birthday,
    anniversary:   donorData.anniversary,
    raw_id:        donorData.id,
  }

  const myTrees: DonorTree[] = allTrees.map((t: any, i: number) => {
    const donation = donationMap[t.id]
    const update   = updateMap[t.id]
    const site     = Array.isArray(t.sites) ? t.sites[0] : t.sites
    return {
      id:               t.id,
      tree_id:          t.tree_id,
      species:          t.species,
      tree_type:        t.tree_type || 'Joint Tree',
      lat:              update?.latitude  || t.latitude  || null,
      lng:              update?.longitude || t.longitude || null,
      zone:             site?.name || 'Bangalore',
      health:           update?.ai_health_score || t.latest_health_score || 80,
      planted:          t.planting_date ? new Date(t.planting_date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—',
     occasion: donation?.occasion_label || (t.tree_type === 'Joint Tree' ? '🤝 Joint Tree' : 'Gift'),
      verified:         t.status === 'VERIFIED' || t.status === 'HEALTHY',
      pulse:            i === 0,
      photo_url:        update?.after_photo_url || t.photo_url || null,
      before_photo_url: update?.before_photo_url || null,
      after_photo_url:  update?.after_photo_url  || t.photo_url || null,
      status:           t.status,
      qr_code_url:      t.qr_code_url,
    }
  })

  const occasionTimeline: OccasionItem[] = myTrees.map(t => ({
    date: t.planted, occasion: t.occasion, species: t.species,
    zone: t.zone, icon: getOccasionIcon(t.occasion), color: getOccasionColor(t.occasion),
  }))

  return { donor, myTrees, occasionTimeline }
}
