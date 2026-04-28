// app/impact/mockData.ts
// Phase 2: replace currentStats with Supabase query from impact_summary table

// ── GOALS (hardcoded — fixed targets, never change) ──────────────────────────
export const GOALS = {
  trees:       100000,
  waste_kg:    5000000,   // 5,000 tonnes = 5,000,000 kg
  water_litres:500000000, // 50 crore litres
  volunteers:  5000,
  csr:         50,
};

// ── CURRENT (mock — replace with Supabase in Phase 2) ────────────────────────
export const currentStats = {
  trees:       12847,
  waste_kg:    5230,
  water_litres:48625795,
  volunteers:  342,
  csr:         14,
  updated_at:  "22 Apr 2026",
};

// ── VIDEO PLACEHOLDERS (replace IDs when YouTube links ready) ─────────────────
export const VIDEOS = {
 trees:    "kFXrduVKU3Q",
  waste:    "UcF3zj4u_G4",
  water:    "jrTFYRCsuHY",
  skilling: "hdSkPxZkBgo",
  csr:      "8waJfVOJqP8",
};

// ── MILESTONE TIMELINE ────────────────────────────────────────────────────────
export const milestones = [
  { quarter:"Q2 2026", trees:"20,000",  waste:"100T",    water:"10Cr L",  note:"Karnataka-wide launch",      done:true  },
  { quarter:"Q4 2026", trees:"40,000",  waste:"500T",    water:"20Cr L",  note:"Mysuru + Hubli expansion",   done:false },
  { quarter:"Q2 2027", trees:"65,000",  waste:"1,500T",  water:"35Cr L",  note:"25 water bodies restored",   done:false },
  { quarter:"Q4 2027", trees:"85,000",  waste:"3,000T",  water:"45Cr L",  note:"All 30 districts covered",   done:false },
  { quarter:"Q2 2028", trees:"1,00,000",waste:"5,000T",  water:"50Cr L",  note:"GOAL MET — Full Karnataka",  done:false },
];

// ── THREE PILLARS ─────────────────────────────────────────────────────────────
export const pillars = {
  trees: {
    goal:    "1,00,000 trees across all of Karnataka by 2028",
    why:     "Karnataka loses 2,000 hectares of forest every year to urbanisation. Each tree we plant sequesters 22 kg of CO₂ annually, supports local biodiversity, and reduces urban heat. 1,00,000 trees means 22,00,000 kg of CO₂ offset every year — equivalent to taking 4,800 cars off the road.",
    how:     ["Miyawaki dense urban forest method — 10× faster growth", "Native species only — Peepal, Neem, Banyan, Jamun, Rain Tree", "GPS-tagged at planting, health-monitored monthly", "Community-led drives with corporate CSR partners", "School and college campus greening programme"],
    metric:  "22 kg CO₂ per tree per year · ISFR standard",
  },
  waste: {
    goal:    "5,000 tonnes of plastic and mixed waste recycled by 2028",
    why:     "Bangalore generates 5,000 tonnes of waste every single day. Less than 15% is scientifically processed. Plastic that reaches landfills takes 400+ years to degrade. EcoTree's waste programme converts plastic into bricks, tiles, and road-laying material — giving waste a second life.",
    how:     ["Monthly collection drives across wards", "Plastic shredded and converted to bricks and tiles", "Converted material used in road construction", "E-waste safely dismantled and recycled", "Organic waste composted for plantation drives"],
    metric:  "1 tonne plastic = 2,500 paver bricks",
  },
  water: {
    goal:    "50 crore litres of water conserved across Karnataka by 2028",
    why:     "Bangalore faces a severe water crisis — groundwater levels have dropped 300 metres in 30 years. Lakes that once numbered 262 are now fewer than 80. Each tree EcoTree plants saves 3,785 litres of water per year. Our lake restoration and rainwater harvesting projects multiply this impact significantly.",
    how:     ["Rainwater harvesting pit installation", "Borewell recharge structures near plantations", "Lake and tank restoration with local communities", "Check dam construction in peri-urban zones", "Drip irrigation advisory for farmers"],
    metric:  "3,785 L water saved per tree per year",
  },
};

// ── SDG ALIGNMENT ─────────────────────────────────────────────────────────────
export const sdgs = [
  { num:"13", title:"Climate Action",         desc:"Reducing CO₂ through verified tree plantation",        color:"#3F7E44", emoji:"🌍" },
  { num:"15", title:"Life on Land",           desc:"Native species, biodiversity, forest restoration",     color:"#56C02B", emoji:"🌿" },
  { num:"6",  title:"Clean Water",            desc:"Lake restoration, rainwater harvesting, conservation", color:"#26BDE2", emoji:"💧" },
  { num:"11", title:"Sustainable Cities",     desc:"Urban greening, waste to roads, Bangalore cooling",    color:"#FD9D24", emoji:"🏙️" },
  { num:"17", title:"Partnerships for Goals", desc:"CSR partners, NGOs, govt, communities working together",color:"#19486A",emoji:"🤝" },
];

// ── IMPACT NUMBERS ────────────────────────────────────────────────────────────
export const impactFacts = [
  { val:"22 kg",    label:"CO₂ per tree per year",       sub:"ISFR standard",            color:"#2C5F2D" },
  { val:"3,785 L",  label:"Water saved per tree",        sub:"per year average",          color:"#0284c7" },
  { val:"2 people", label:"O₂ produced per tree",        sub:"per year breathing",        color:"#40916C" },
  { val:"400 yrs",  label:"Plastic in landfill",         sub:"what we're preventing",     color:"#c2410c" },
  { val:"₹0",       label:"Cost to plant with EcoTree",  sub:"100% donor funded",         color:"#7c3aed" },
  { val:"30",       label:"Districts of Karnataka",      sub:"our 2028 coverage goal",    color:"#b45309" },
];

// ── FAQ ────────────────────────────────────────────────────────────────────────
export const faqs = [
  {
    q: "Why does EcoTree set public impact goals?",
    a: "We believe accountability builds trust. By publishing our 2028 goals publicly, donors, CSR partners, and communities can hold us to our commitments. Every number on this page is a promise — and our live dashboard shows exactly how we're tracking.",
  },
  {
    q: "How do you verify trees are actually planted?",
    a: "Every tree is GPS-tagged by our field volunteers using the EcoTree app at the moment of planting. Location, species, and health are recorded. Our coordinators verify each entry before it counts toward our totals. You can see every pin on our live dashboard.",
  },
  {
    q: "What is Miyawaki forest plantation?",
    a: "The Miyawaki method is a dense urban forest technique developed by Japanese botanist Akira Miyawaki. Trees are planted 3-5 per square metre using only native species. The result grows 10× faster than conventional plantation, is 30× denser, and becomes self-sustaining within 3 years — perfect for urban Bangalore.",
  },
  {
    q: "How is plastic waste converted to roads in India?",
    a: "Collected plastic is shredded and blended with bitumen at a 1:10 ratio. The mix is laid on roads just like regular asphalt. Roads built with plastic waste are more durable, weather-resistant, and keep 1 tonne of plastic out of landfills per kilometre of road. EcoTree partners with municipal bodies for this process.",
  },
  {
    q: "What are EcoTree's goals for 2028?",
    a: "By 2028 EcoTree aims to plant 1,00,000 trees across all 30 districts of Karnataka, recycle 5,000 tonnes of waste, conserve 50 crore litres of water, engage 5,000 volunteers, and partner with 50 CSR companies. All goals are tracked publicly on our live dashboard.",
  },
  {
    q: "How does tree plantation help water conservation?",
    a: "Trees act as natural water pumps and sponges. Each tree absorbs and retains approximately 3,785 litres of water per year through its root system. Tree canopies reduce surface runoff, recharge groundwater, and regulate local rainfall patterns. Our plantation zones are specifically chosen near water-stressed areas of Karnataka.",
  },
  {
    q: "Which UN Sustainable Development Goals does EcoTree contribute to?",
    a: "EcoTree's work directly contributes to SDG 13 (Climate Action), SDG 15 (Life on Land), SDG 6 (Clean Water and Sanitation), SDG 11 (Sustainable Cities and Communities), and SDG 17 (Partnerships for the Goals). Our impact reports document contribution to each goal annually.",
  },
  {
    q: "How can my company partner with EcoTree for CSR?",
    a: "CSR partners receive a dedicated plantation zone, GPS-verified impact reports, quarterly PDF certificates, and live dashboard access showing their trees on the map. Your team can participate in plantation drives and receive branded impact collateral for ESG reporting. Contact us to design a custom CSR programme.",
  },
];
