// mockDonor.ts
// Matches exact Supabase schema — swap with real DB queries in Phase 2

export const donor = {
  id:           "ECO-2025-0042",
  name:         "Rajesh Kumar",
  first_name:   "Rajesh",
  email:        "rajesh@example.com",
  since:        "June 2025",
  location:     "Indiranagar, Bangalore",
  total_trees:  12,
  co2_kg:       264,    // trees × 22 (ISFR)
  water_litres: 45420,  // trees × 3785
  km_equivalent:1180,   // co2_kg / 0.21 (avg car emission per km)
  referral_code:"RAJESH42",
};

export const myTrees = [
  { id:1,  species:"Peepal",    lat:12.9784, lng:77.6408, zone:"Indiranagar",     health:86, planted:"12 Jun 2025",  occasion:"Birthday",     verified:true,  pulse:true  },
  { id:2,  species:"Neem",      lat:13.0350, lng:77.5970, zone:"Hebbal",          health:91, planted:"3 Jul 2025",   occasion:"Anniversary",  verified:true,  pulse:false },
  { id:3,  species:"Mango",     lat:12.9352, lng:77.6245, zone:"Koramangala",     health:78, planted:"19 Aug 2025",  occasion:"CSR Drive",    verified:true,  pulse:false },
  { id:4,  species:"Banyan",    lat:12.9900, lng:77.5560, zone:"Rajajinagar",     health:94, planted:"1 Sep 2025",   occasion:"Memorial",     verified:true,  pulse:false },
  { id:5,  species:"Rain Tree", lat:12.9063, lng:77.5857, zone:"JP Nagar",        health:82, planted:"15 Oct 2025",  occasion:"Diwali Gift",  verified:true,  pulse:false },
  { id:6,  species:"Jamun",     lat:12.8456, lng:77.6603, zone:"Electronic City", health:88, planted:"22 Nov 2025",  occasion:"Birthday",     verified:true,  pulse:false },
  { id:7,  species:"Peepal",    lat:12.9698, lng:77.7500, zone:"Whitefield",      health:79, planted:"5 Dec 2025",   occasion:"New Year",     verified:true,  pulse:false },
  { id:8,  species:"Neem",      lat:12.9279, lng:77.6271, zone:"Koramangala",     health:85, planted:"10 Jan 2026",  occasion:"Pongal",       verified:true,  pulse:false },
  { id:9,  species:"Mango",     lat:12.8530, lng:77.6620, zone:"Electronic City", health:73, planted:"14 Feb 2026",  occasion:"Valentine",    verified:true,  pulse:false },
  { id:10, species:"Rain Tree", lat:13.0450, lng:77.5920, zone:"Hebbal",          health:88, planted:"18 Mar 2026",  occasion:"Holi Gift",    verified:true,  pulse:false },
  { id:11, species:"Banyan",    lat:12.9825, lng:77.6196, zone:"Ulsoor",          health:96, planted:"2 Apr 2026",   occasion:"Birthday",     verified:true,  pulse:false },
  { id:12, species:"Jamun",     lat:12.9170, lng:77.6160, zone:"Madiwala",        health:90, planted:"20 Apr 2026",  occasion:"Earth Day",    verified:true,  pulse:false },
];

export const occasionTimeline = [
  { date:"Jun 2025",  occasion:"Birthday",     species:"Peepal",    zone:"Indiranagar",     icon:"🎂", color:"#e879f9" },
  { date:"Jul 2025",  occasion:"Anniversary",  species:"Neem",      zone:"Hebbal",          icon:"💍", color:"#f43f5e" },
  { date:"Aug 2025",  occasion:"CSR Drive",    species:"Mango",     zone:"Koramangala",     icon:"🏢", color:"#0284c7" },
  { date:"Sep 2025",  occasion:"Memorial",     species:"Banyan",    zone:"Rajajinagar",     icon:"🙏", color:"#7c3aed" },
  { date:"Oct 2025",  occasion:"Diwali Gift",  species:"Rain Tree", zone:"JP Nagar",        icon:"🪔", color:"#f59e0b" },
  { date:"Nov 2025",  occasion:"Birthday",     species:"Jamun",     zone:"Electronic City", icon:"🎂", color:"#e879f9" },
  { date:"Dec 2025",  occasion:"New Year",     species:"Peepal",    zone:"Whitefield",      icon:"🎆", color:"#10b981" },
  { date:"Jan 2026",  occasion:"Pongal",       species:"Neem",      zone:"Koramangala",     icon:"🌾", color:"#f59e0b" },
  { date:"Feb 2026",  occasion:"Valentine",    species:"Mango",     zone:"Electronic City", icon:"❤️", color:"#f43f5e" },
  { date:"Mar 2026",  occasion:"Holi Gift",    species:"Rain Tree", zone:"Hebbal",          icon:"🎨", color:"#e879f9" },
  { date:"Apr 2026",  occasion:"Birthday",     species:"Banyan",    zone:"Ulsoor",          icon:"🎂", color:"#e879f9" },
  { date:"Apr 2026",  occasion:"Earth Day",    species:"Jamun",     zone:"Madiwala",        icon:"🌍", color:"#2C5F2D" },
];

export const SPECIES_EMOJI: Record<string, string> = {
  Peepal:"🌳", Neem:"🌿", Mango:"🥭",
  Banyan:"🌴", "Rain Tree":"🌲", Jamun:"🍇",
};

export const SPECIES_COLOR: Record<string, string> = {
  Peepal:"#2C5F2D", Neem:"#40916C", Mango:"#b45309",
  Banyan:"#7c3aed", "Rain Tree":"#1d4ed8", Jamun:"#6d28d9",
};

export const HEALTH_COLOR = (h: number) =>
  h >= 85 ? "#22c55e" : h >= 70 ? "#f59e0b" : "#ef4444";
