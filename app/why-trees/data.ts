// app/why-trees/data.ts

export const heroStats = [
  { val: "80%",   label: "of all land species live in forests",        icon: "🌍" },
  { val: "1.6B",  label: "people depend on forests for their livelihood", icon: "👥" },
  { val: "25%",   label: "of medicines come from forest plants",        icon: "💊" },
  { val: "22 kg", label: "CO₂ absorbed per tree every year",            icon: "🌡️" },
];

export const benefits = [
  {
    id:    "air",
    icon:  "🌬️",
    stat:  "100+ pollutants",
    title: "Trees Clean the Air We Breathe",
    body:  "A single mature tree filters over 100 airborne pollutants every day — dust, smoke, and toxic particles that damage lungs and shorten lives. In a city like Bangalore, every tree is a quiet air purifier working around the clock.",
    image: "/images/why-trees/air-quality.jpg",
    color: "#2C5F2D",
    bg:    "#d1fae5",
  },
  {
    id:    "water",
    icon:  "💧",
    stat:  "3,785 litres/year",
    title: "Every Tree Saves Water",
    body:  "Each tree absorbs and conserves 3,785 litres of water per year — recharging groundwater, reducing flooding, and keeping rivers flowing. In water-stressed Bangalore, this is not a small thing. It is survival.",
    image: "/images/why-trees/water.jpg",
    color: "#0284c7",
    bg:    "#e0f2fe",
  },
  {
    id:    "climate",
    icon:  "🌡️",
    stat:  "22 kg CO₂/year",
    title: "Nature's Most Powerful Carbon Capture",
    body:  "Trees are the most cost-effective climate solution on Earth. Each one absorbs 22 kg of CO₂ every year — equivalent to driving 100 km less. Plant 10 trees and you take one car off the road for a month.",
    image: "/images/why-trees/climate.jpg",
    color: "#059669",
    bg:    "#d1fae5",
  },
  {
    id:    "biodiversity",
    icon:  "🐾",
    stat:  "80% of species",
    title: "Home to Most Life on Earth",
    body:  "Over 80% of the world's land-based animals, plants, and insects live in forests. When we lose a tree, we do not just lose wood — we lose an entire neighbourhood of life that took decades to build.",
    image: "/images/why-trees/biodiversity.jpg",
    color: "#7c3aed",
    bg:    "#ede9fe",
  },
  {
    id:    "urban",
    icon:  "🏙️",
    stat:  "3°C cooler",
    title: "Trees Make Cities Liveable",
    body:  "Urban trees reduce local temperature by up to 3°C, lower stress levels, and improve mental wellbeing. For Bangalore — a city heating up fast — trees are not decoration. They are infrastructure.",
    image: "/images/why-trees/urban.jpg",
    color: "#b45309",
    bg:    "#fef3c7",
  },
  {
    id:    "food",
    icon:  "🌾",
    stat:  "75% of crops",
    title: "The Foundation of Food Security",
    body:  "Three quarters of our food crops depend on pollinators that live in trees. Healthy tree cover means healthy soil, thriving farms, and food on the table. Lose the trees, lose the food chain.",
    image: "/images/why-trees/food-soil.jpg",
    color: "#b45309",
    bg:    "#ffedd5",
  },
];

export const uspCards = [
  { icon:"📍", title:"Every tree geo-tagged",      body:"GPS coordinates recorded at the exact moment of planting. No guesswork. No estimates." },
  { icon:"📊", title:"Your personal dashboard",    body:"See your trees on a live map — anytime, anywhere. Watch them grow in real time." },
  { icon:"🔄", title:"3-year monitoring",          body:"Field volunteers check health monthly and report back. Your tree is never left alone." },
  { icon:"✅", title:"Verified impact reports",    body:"GPS reports, impact certificates, and live dashboard — not just promises on paper." },
];

export const species = [
  {
    name:   "Peepal",
    emoji:  "🌳",
    co2:    "25 kg CO₂/yr",
    benefit:"Sacred tree · produces oxygen 24 hours a day",
    fact:   "One of the few trees that releases oxygen even at night — making it a life-giving presence in any neighbourhood.",
    image:  "/images/why-trees/peepal.jpg",
    color:  "#2C5F2D",
  },
  {
    name:   "Neem",
    emoji:  "🌿",
    co2:    "18 kg CO₂/yr",
    benefit:"Natural air purifier · medicinal properties",
    fact:   "Every part of the Neem tree has a use — from purifying air to treating skin conditions. A complete tree for Indian soil.",
    image:  "/images/why-trees/neem.jpg",
    color:  "#40916C",
  },
  {
    name:   "Mango",
    emoji:  "🥭",
    co2:    "20 kg CO₂/yr",
    benefit:"Food security · dense canopy shade",
    fact:   "A mango tree can live for over 300 years, feeding generations of families and providing shelter to hundreds of birds.",
    image:  "/images/why-trees/mango.jpg",
    color:  "#b45309",
  },
  {
    name:   "Banyan",
    emoji:  "🌴",
    co2:    "30 kg CO₂/yr",
    benefit:"Largest carbon sink · biodiversity hub",
    fact:   "A single Banyan tree can support an entire ecosystem — home to birds, insects, and small mammals all at once.",
    image:  "/images/why-trees/banyan.jpg",
    color:  "#7c3aed",
  },
  {
    name:   "Rain Tree",
    emoji:  "🌲",
    co2:    "22 kg CO₂/yr",
    benefit:"Urban heat shield · wide canopy cover",
    fact:   "The Rain Tree's wide canopy can cover an area the size of a cricket pitch — making it perfect for cooling city streets.",
    image:  "/images/why-trees/rain-tree.jpg",
    color:  "#1d4ed8",
  },
  {
    name:   "Jamun",
    emoji:  "🍇",
    co2:    "16 kg CO₂/yr",
    benefit:"Water conservation · deep root system",
    fact:   "Jamun's deep roots recharge groundwater and prevent soil erosion — quietly protecting water tables across Karnataka.",
    image:  "/images/why-trees/jamun.jpg",
    color:  "#6d28d9",
  },
];

export const nativeImportance = [
  { icon:"🌱", point:"Native trees are adapted to local soil, rain, and climate — they survive without irrigation or chemicals." },
  { icon:"🦋", point:"Local wildlife — birds, bees, butterflies — depend on native species they have co-evolved with for thousands of years." },
  { icon:"💧", point:"Native roots go deeper, recharging groundwater more effectively than exotic species." },
  { icon:"🌡️", point:"They are more resilient to drought, pest, and disease — requiring far less human intervention after planting." },
];

export const faqs = [
  {
    q: "Why are trees important for the environment?",
    a: "Trees are the foundation of life on Earth. They absorb carbon dioxide, release oxygen, regulate water cycles, prevent soil erosion, and support over 80% of all land-based species. Without trees, ecosystems collapse — and so does everything that depends on them, including us.",
  },
  {
    q: "How does tree plantation help climate change?",
    a: "Trees are natural carbon sinks. Each tree absorbs approximately 22 kg of CO₂ per year. At scale, tree plantation is one of the most cost-effective climate interventions available — more affordable per tonne of carbon than most industrial solutions.",
  },
  {
    q: "What is the Miyawaki forest method?",
    a: "Developed by Japanese botanist Akira Miyawaki, this method plants native trees densely — 3 to 5 per square metre. The result grows 10× faster than conventional plantation and becomes a self-sustaining forest within 3 years, with no maintenance needed after that.",
  },
  {
    q: "Why is tree plantation important for CSR?",
    a: "Tree plantation provides measurable, visible, GPS-verified environmental impact. It directly improves ESG scores, demonstrates sustainability commitment to stakeholders, and gives companies a tangible story to tell — employees can participate, and impact can be reported quarterly.",
  },
  {
    q: "Can I track my planted tree?",
    a: "Yes. With EcoTree, every tree is GPS-tagged at the moment of planting. You get access to a personal dashboard where you can see your trees on a live map, check their health status, and download your impact certificate.",
  },
  {
    q: "Which trees does EcoTree plant in Bangalore?",
    a: "EcoTree plants only native Karnataka species — Peepal, Neem, Banyan, Mango, Rain Tree, and Jamun. Native species are adapted to local soil and climate, support local wildlife, and require no irrigation or chemicals after establishment.",
  },
  {
    q: "How much CO₂ does one tree absorb per year?",
    a: "Using the Indian State of Forest Report (ISFR) standard, each tree absorbs approximately 22 kg of CO₂ per year. This is a conservative, credible baseline. Species like Banyan absorb up to 30 kg, while Jamun absorbs around 16 kg annually.",
  },
  {
    q: "What is the 80G tax benefit for tree donation?",
    a: "EcoTree Impact Foundation is registered under Section 80G of the Indian Income Tax Act. Donations made to EcoTree are eligible for a 50% tax deduction under this provision. You will receive an official 80G certificate with your donation receipt.",
  },
];
