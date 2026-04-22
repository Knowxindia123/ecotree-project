// mockData.ts
// Matches exact Supabase DB schema — swap these imports for supabase queries in Phase 2

export const impactSummary = {
  date: "2026-04-22",
  trees_total: 12847,
  co2_kg: 282634,        // trees_total × 22 (ISFR)
  waste_kg: 5230,
  water_litres: 48625795, // trees_total × 3785
  volunteers: 342,
  csr_partners: 14,
  updated_at: "2026-04-22T00:00:00Z",
};

export const treeLocations = [
  { id: 1, species: "Peepal",    left: "15%", top: "28%", health_pct: 86, zone: "Whitefield",     planted_date: "2025-06-12", verified: true, pulse: true  },
  { id: 2, species: "Neem",      left: "28%", top: "48%", health_pct: 91, zone: "Indiranagar",    planted_date: "2025-07-03", verified: true, pulse: false },
  { id: 3, species: "Mango",     left: "44%", top: "22%", health_pct: 78, zone: "Hebbal",         planted_date: "2025-08-19", verified: true, pulse: false },
  { id: 4, species: "Rain Tree", left: "58%", top: "55%", health_pct: 82, zone: "Koramangala",    planted_date: "2025-09-01", verified: true, pulse: false },
  { id: 5, species: "Banyan",    left: "70%", top: "32%", health_pct: 94, zone: "Rajajinagar",    planted_date: "2025-10-15", verified: true, pulse: false },
  { id: 6, species: "Jamun",     left: "35%", top: "70%", health_pct: 88, zone: "JP Nagar",       planted_date: "2025-11-22", verified: true, pulse: false },
  { id: 7, species: "Peepal",    left: "82%", top: "45%", health_pct: 79, zone: "Electronic City",planted_date: "2025-12-05", verified: true, pulse: false },
  { id: 8, species: "Neem",      left: "12%", top: "62%", health_pct: 85, zone: "Whitefield",     planted_date: "2026-01-10", verified: true, pulse: false },
  { id: 9, species: "Mango",     left: "52%", top: "78%", health_pct: 73, zone: "Koramangala",    planted_date: "2026-02-14", verified: true, pulse: false },
  { id: 10,species: "Rain Tree", left: "66%", top: "68%", health_pct: 88, zone: "Electronic City",planted_date: "2026-03-01", verified: true, pulse: false },
  { id: 11,species: "Banyan",    left: "88%", top: "22%", health_pct: 96, zone: "Hebbal",         planted_date: "2026-03-18", verified: true, pulse: false },
  { id: 12,species: "Neem",      left: "22%", top: "15%", health_pct: 90, zone: "Indiranagar",    planted_date: "2026-04-02", verified: true, pulse: false },
];

export const wasteLocations = [
  { id: 1, type: "Plastic",  left: "20%", top: "35%", kg: 2400, zone: "Ward 42", pulse: true  },
  { id: 2, type: "E-Waste",  left: "45%", top: "25%", kg: 1800, zone: "Ward 56", pulse: false },
  { id: 3, type: "Plastic",  left: "62%", top: "50%", kg: 3100, zone: "Ward 31", pulse: false },
  { id: 4, type: "Organic",  left: "30%", top: "65%", kg: 900,  zone: "Ward 18", pulse: false },
  { id: 5, type: "Plastic",  left: "75%", top: "38%", kg: 1500, zone: "Ward 72", pulse: false },
  { id: 6, type: "Paper",    left: "15%", top: "72%", kg: 2000, zone: "Ward 08", pulse: false },
  { id: 7, type: "Plastic",  left: "55%", top: "78%", kg: 1200, zone: "Ward 63", pulse: false },
  { id: 8, type: "E-Waste",  left: "85%", top: "55%", kg: 700,  zone: "Ward 90", pulse: false },
];

export const waterLocations = [
  { id: 1, name: "Ulsoor Lake",   left: "25%", top: "30%", restored_pct: 42, pulse: true  },
  { id: 2, name: "Hebbal Lake",   left: "50%", top: "20%", restored_pct: 68, pulse: false },
  { id: 3, name: "Agara Lake",    left: "70%", top: "42%", restored_pct: 35, pulse: false },
  { id: 4, name: "Madiwala Lake", left: "35%", top: "60%", restored_pct: 55, pulse: false },
  { id: 5, name: "Nagawara Lake", left: "80%", top: "28%", restored_pct: 41, pulse: false },
  { id: 6, name: "Sankey Tank",   left: "18%", top: "55%", restored_pct: 72, pulse: false },
  { id: 7, name: "Bellandur",     left: "60%", top: "70%", restored_pct: 28, pulse: false },
];

export const speciesBreakdown = [
  { species: "Peepal",    count: 3241, color: "#2C5F2D", emoji: "🌳" },
  { species: "Neem",      count: 2890, color: "#40916C", emoji: "🌿" },
  { species: "Mango",     count: 2134, color: "#b45309", emoji: "🥭" },
  { species: "Banyan",    count: 1876, color: "#7c3aed", emoji: "🌴" },
  { species: "Rain Tree", count: 1543, color: "#1d4ed8", emoji: "🌲" },
  { species: "Jamun",     count: 1163, color: "#6d28d9", emoji: "🍇" },
];

export const wasteBreakdown = [
  { category: "Plastic",  kg: 2180, color: "#c2410c", emoji: "🧴" },
  { category: "E-Waste",  kg: 1240, color: "#92400e", emoji: "💻" },
  { category: "Organic",  kg: 980,  color: "#15803d", emoji: "🌱" },
  { category: "Paper",    kg: 830,  color: "#1d4ed8", emoji: "📄" },
];

export const waterBreakdown = [
  { method: "Rainwater Harvesting", litres: 18200000, color: "#0284c7", emoji: "🌧️" },
  { method: "Borewell Recharge",    litres: 14300000, color: "#0369a1", emoji: "🔄" },
  { method: "Check Dams",           litres: 9800000,  color: "#075985", emoji: "🏞️" },
  { method: "Drip Irrigation Saved",litres: 6325795,  color: "#0c4a6e", emoji: "💦" },
];

export const monthlyGrowth = [
  { month: "Jan", trees: 1820, waste: 620, water: 6888700  },
  { month: "Feb", trees: 2340, waste: 780, water: 8856900  },
  { month: "Mar", trees: 3100, waste: 1040,water: 11734500 },
  { month: "Apr", trees: 5587, waste: 2790,water: 21145695 },
];

export const activityFeed = [
  { type: "tree",  icon: "🌳", text: "50 Peepal saplings planted at Cubbon Park",   zone: "Central",       time: "2 hours ago"  },
  { type: "waste", icon: "♻️", text: "120 kg plastic collected — drive completed",   zone: "Whitefield",    time: "5 hours ago"  },
  { type: "water", icon: "💧", text: "Rainwater harvesting pit installed",            zone: "JP Nagar",      time: "Yesterday"    },
  { type: "tree",  icon: "🌿", text: "35 Neem trees verified by field volunteer",    zone: "Hebbal",        time: "Yesterday"    },
  { type: "waste", icon: "🗑", text: "E-waste collection drive — 85 kg collected",   zone: "Koramangala",   time: "2 days ago"   },
  { type: "water", icon: "🌊", text: "Bellandur lake restoration check completed",    zone: "Electronic City","time": "3 days ago" },
];

export const csrPartners = [
  { name: "Infosys Foundation",  trees: 2400, logo: "IF", color: "#0056a6" },
  { name: "Wipro GreenTech",     trees: 1800, logo: "WG", color: "#5c068c" },
  { name: "Bosch India CSR",     trees: 1200, logo: "BI", color: "#e20015" },
];

export const faqs = [
  {
    q: "How does EcoTree track trees planted?",
    a: "Each tree is GPS-tagged by our field volunteers using the EcoTree mobile app. The location, species, and planting date are recorded and verified by our coordinators before being counted in the dashboard.",
  },
  {
    q: "Is this data updated in real time?",
    a: "The dashboard refreshes daily at midnight. Our full real-time tracking platform launches in late 2026. All numbers shown reflect verified impact as of today.",
  },
  {
    q: "How is CO₂ offset calculated?",
    a: "We use the Indian State of Forest Report (ISFR) standard of 22 kg CO₂ absorbed per tree per year. This is a conservative, credible baseline used across Indian environmental reporting.",
  },
  {
    q: "Can my company get a CSR impact report?",
    a: "Yes. All CSR partners receive a quarterly PDF impact report with GPS data, species breakdown, and verified tree counts. Contact us to start your partnership.",
  },
  {
    q: "Which areas of Bangalore have trees been planted?",
    a: "Our planting drives cover Whitefield, Hebbal, Koramangala, JP Nagar, Rajajinagar, Indiranagar, and the Cubbon Park corridor — with expansion to Yelahanka and Electronic City underway.",
  },
  {
    q: "How is waste recycling data collected?",
    a: "Collection drive coordinators log the weight of materials collected at each site. Data is submitted via the EcoTree volunteer app and verified by our waste management team before it appears on the dashboard.",
  },
  {
    q: "What water conservation methods does EcoTree use?",
    a: "We implement rainwater harvesting pits, borewell recharge structures, check dams in peri-urban zones, and provide drip irrigation advisory to farmers — tracking the estimated water saved by each method.",
  },
  {
    q: "Can individual donors see their personal impact?",
    a: "Personalized impact certificates are issued to every donor showing their tree count and CO₂ offset. A full donor portal with GPS tree tracking is coming with our EcoTree app in late 2026.",
  },
];
