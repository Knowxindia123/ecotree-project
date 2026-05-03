import { supabase } from '@/lib/supabase'

export interface DonorProfile {
  id: string
  name: string
  first_name: string
  email: string
  phone: string | null
  since: string
  location: string
  total_trees: number
  co2_kg: number
  water_litres: number
  km_equivalent: number
  referral_code: string
  photo_url: string | null
  pan: string | null
  birthday: string | null
  anniversary: string | null
  raw_id: number
}

export interface DonorTree {
  id: number
  tree_id: string
  species: string
  tree_type: string
  lat: number | null
  lng: number | null
  zone: string
  health: number
  planted: string
  occasion: string
  verified: boolean
  pulse: boolean
  photo_url: string | null
  status: string
  qr_code_url: string | null
}

export interface OccasionItem {
  date: string
  occasion: string
  species: string
  zone: string
  icon: string
  color: string
}

const OCCASION_ICON: Record<string, string> = {
  birthday: '🎂', anniversary: '💍', memorial: '🙏',
  diwali: '🪔', 'new year': '🎆', 'earth day': '🌍',
  corporate: '🏢', gift: '🎁', valentine: '❤️',
  pongal: '🌾', holi: '🎨', 'csr drive': '🏢',
}

const OCCASION_COLOR: Record<string, string> = {
  birthday: '#e879f9', anniversary: '#f43f5e', memorial: '#7c3aed',
  diwali: '#f59e0b', 'new year': '#10b981', 'earth day': '#2C5F2D',
  corporate: '#0284c7', gift: '#f59e0b', valentine: '#f43f5e',
  pongal: '#f59e0b', holi: '#e879f9', 'csr drive': '#0284c7',
}

export function getOccasionIcon(occasion: string) {
  const key = (occasion || '').toLowerCase()
  for (const [k, v] of Object.entries(OCCASION_ICON)) {
    if (key.includes(k)) return v
  }
  return '🌱'
}

export function getOccasionColor(occasion: string) {
  const key = (occasion || '').toLowerCase()
  for (const [k, v] of Object.entries(OCCASION_COLOR)) {
    if (key.includes(k)) return v
  }
  return '#2C5F2D'
}

export async function getDonorData(email: string): Promise<{
  donor: DonorProfile | null
  myTrees: DonorTree[]
  occasionTimeline: OccasionItem[]
}> {
  // Get donor profile
  const { data: donorData } = await supabase
    .from('donors')
    .select('*')
    .eq('email', email)
    .single()

  if (!donorData) return { donor: null, myTrees: [], occasionTimeline: [] }

  // Get all trees for this donor
  const { data: treesData } = await supabase
    .from('trees')
    .select(`
      id, tree_id, species, tree_type, status,
      latitude, longitude, planting_date,
      latest_health_score, photo_url, qr_code_url,
      sites(name, city)
    `)
    .eq('donor_id', donorData.id)
    .order('planting_date', { ascending: true })

  // Get donations for occasion data
  const { data: donationsData } = await supabase
    .from('donations')
    .select('tree_id, occasion_label, mode, recipient_name')
    .eq('donor_id', donorData.id)

  // Map donations by tree_id for quick lookup
  const donationMap: Record<number, any> = {}
  donationsData?.forEach(d => { donationMap[d.tree_id] = d })

  const totalTrees = treesData?.length || 0
  const co2Kg      = totalTrees * 22
  const waterL     = totalTrees * 3785
  const kmEquiv    = Math.round(co2Kg / 0.21)

  // Build donor profile
  const donor: DonorProfile = {
    id:            `ECO-${new Date(donorData.created_at).getFullYear()}-${String(donorData.id).padStart(4, '0')}`,
    name:          donorData.name,
    first_name:    donorData.name.split(' ')[0],
    email:         donorData.email,
    phone:         donorData.phone,
    since:         new Date(donorData.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    location:      `${donorData.city || 'Bangalore'}`,
    total_trees:   totalTrees,
    co2_kg:        co2Kg,
    water_litres:  waterL,
    km_equivalent: kmEquiv,
    referral_code: donorData.name.toUpperCase().replace(/\s/g, '').slice(0, 6) + donorData.id,
    photo_url:     donorData.photo_url || null,
    pan:           donorData.pan,
    birthday:      donorData.birthday,
    anniversary:   donorData.anniversary,
    raw_id:        donorData.id,
  }

  // Build trees array
  const myTrees: DonorTree[] = (treesData || []).map((t: any, i: number) => {
    const donation = donationMap[t.id]
    const occasion = donation?.occasion_label || 'Gift'
    const site = Array.isArray(t.sites) ? t.sites[0] : t.sites

    return {
      id:          t.id,
      tree_id:     t.tree_id,
      species:     t.species,
      tree_type:   t.tree_type,
      lat:         t.latitude,
      lng:         t.longitude,
      zone:        site?.name || 'Bangalore',
      health:      t.latest_health_score || 80,
      planted:     t.planting_date
        ? new Date(t.planting_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—',
      occasion:    occasion,
      verified:    t.status === 'VERIFIED' || t.status === 'HEALTHY',
      pulse:       i === 0,
      photo_url:   t.photo_url,
      status:      t.status,
      qr_code_url: t.qr_code_url,
    }
  })

  // Build occasion timeline
  const occasionTimeline: OccasionItem[] = myTrees.map(t => ({
    date:     t.planted,
    occasion: t.occasion,
    species:  t.species,
    zone:     t.zone,
    icon:     getOccasionIcon(t.occasion),
    color:    getOccasionColor(t.occasion),
  }))

  return { donor, myTrees, occasionTimeline }
}
export const SPECIES_EMOJI: Record<string, string> = {
  Peepal:"🌳", Neem:"🌿", Mango:"🥭", Banyan:"🌴",
  "Rain Tree":"🌲", Jamun:"🍇", Guava:"🍈",
  Gulmohar:"🌸", "Custom tree":"🌱",
}

export const SPECIES_COLOR: Record<string, string> = {
  Peepal:"#2C5F2D", Neem:"#40916C", Mango:"#b45309",
  Banyan:"#7c3aed", "Rain Tree":"#1d4ed8", Jamun:"#6d28d9",
  Guava:"#065f46", Gulmohar:"#be185d", "Custom tree":"#1A3C34",
}

export const HEALTH_COLOR = (h: number) =>
  h >= 85 ? "#22c55e" : h >= 70 ? "#f59e0b" : "#ef4444"
