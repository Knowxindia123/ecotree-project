"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  MapPin,
  Trees,
  ShieldCheck,
  Globe2,
  Droplets,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Gift,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const impactTiers = [
  {
    id: "community100",
    amount: 100,
    title: "Community",
    short: "Support forests",
  },
  {
    id: "shared500",
    amount: 500,
    title: "Shared Tree",
    short: "Co-create impact",
  },
  {
    id: "individual1000",
    amount: 1000,
    title: "Individual",
    short: "Your living tree",
    featured: true,
  },
  {
    id: "forest5000",
    amount: 5000,
    title: "Miyawaki",
    short: "Urban forest",
  },
];

const speciesData = [
  {
    id: "banyan",
    name: "Banyan",
    latin: "Ficus benghalensis",
    title: "The Tree of Generations",
    story:
      "Massive canopy. Deep roots. A living shelter for generations.",
    benefits: [
      "Massive natural shade",
      "Wildlife support",
      "Long lifespan",
    ],
    image:
      "/trees/banyan.jpg",
  },
  {
    id: "neem",
    name: "Neem",
    latin: "Azadirachta indica",
    title: "The Healing Tree",
    story:
      "Naturally purifies air and supports healthier ecosystems.",
    benefits: [
      "Air purification",
      "Native resilience",
      "Medicinal value",
    ],
    image:
      "/trees/neem.jpg",
  },
  {
    id: "raintree",
    name: "Rain Tree",
    latin: "Samanea saman",
    title: "The Giant Canopy",
    story:
      "Creates extraordinary cooling shade across large areas.",
    benefits: [
      "Huge cooling canopy",
      "Fast growth",
      "Urban heat reduction",
    ],
    image:
      "/trees/rain-tree.jpg",
  },
  {
    id: "honge",
    name: "Honge",
    latin: "Pongamia pinnata",
    title: "The Resilient Native",
    story:
      "Strong, adaptive and exceptionally tough for urban landscapes.",
    benefits: [
      "Drought resistant",
      "Native species",
      "Soil enrichment",
    ],
    image:
      "/trees/honge.jpg",
  },
  {
    id: "gulmohar",
    name: "Gulmohar",
    latin: "Delonix regia",
    title: "The Flame of Nature",
    story:
      "Transforms landscapes with vibrant red-orange blooms.",
    benefits: [
      "Beautiful flowers",
      "Roadside appeal",
      "Shade support",
    ],
    image:
      "/trees/gulmohar.jpg",
  },
];

const recentPhotos = [
  "/gallery/tree1.jpg",
  "/gallery/tree2.jpg",
  "/gallery/tree3.jpg",
  "/gallery/tree4.jpg",
];

export default function EcoTreeCheckoutPage() {
  const [selectedTier, setSelectedTier] =
    useState("individual1000");

  const [giftMode, setGiftMode] = useState(false);

  const [selectedSpecies, setSelectedSpecies] =
    useState(0);

  const [quantity, setQuantity] = useState(1);

  const species = useMemo(
    () => speciesData[selectedSpecies],
    [selectedSpecies]
  );

  const activeTier = useMemo(
    () =>
      impactTiers.find((t) => t.id === selectedTier),
    [selectedTier]
  );

  const nextSpecies = () => {
    setSelectedSpecies(
      (prev) => (prev + 1) % speciesData.length
    );
  };

  const prevSpecies = () => {
    setSelectedSpecies(
      (prev) =>
        prev === 0
          ? speciesData.length - 1
          : prev - 1
    );
  };

  return (
    <div className="bg-[#F8F6F1] min-h-screen text-[#173D33]">
      {/* TOP TRUST BAR */}
      <div className="sticky top-0 z-50 border-b border-white/10 backdrop-blur bg-[#173D33]/95">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-center gap-6 text-sm text-white">
          <div className="flex items-center gap-2">
            <Trees size={16} />
            10,000+ Trees
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={16} />
            GPS Verified
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            AI Verified
          </div>

          <div className="flex items-center gap-2">
            <Leaf size={16} />
            91% Survival
          </div>
        </div>
      </div>

      {/* HERO + MAIN */}
      <section className="max-w-7xl mx-auto px-4 py-8 lg:py-10">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          {/* LEFT SIDE */}
          <div>
            {/* HERO */}
            <div className="relative overflow-hidden rounded-[32px] min-h-[420px] lg:min-h-[520px]">
              <Image
                src={species.image}
                alt={species.name}
                fill
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />

              <div className="relative z-10 p-6 lg:p-10 flex flex-col h-full justify-between">
                {/* HERO TOP */}
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-2 text-white text-sm mb-5">
                    🌿 AI-verified · GPS-tagged · 3yr care
                  </div>

                  <h1 className="text-white text-5xl lg:text-7xl font-bold leading-[0.95] tracking-tight">
                    Plant a Living Legacy
                  </h1>

                  <p className="text-white/90 mt-6 text-lg lg:text-xl max-w-xl">
                    Adopt and track real trees with
                    geo-tagging, live impact metrics and
                    long-term ecological care.
                  </p>

                  {/* TOGGLE */}
                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        setGiftMode(false)
                      }
                      className={`px-6 py-4 rounded-2xl font-semibold transition ${
                        !giftMode
                          ? "bg-[#173D33] text-white"
                          : "bg-white/90 text-[#173D33]"
                      }`}
                    >
                      🌱 Plant For Myself
                    </button>

                    <button
                      onClick={() =>
                        setGiftMode(true)
                      }
                      className={`px-6 py-4 rounded-2xl font-semibold transition ${
                        giftMode
                          ? "bg-[#8B5CF6] text-white"
                          : "bg-white/90 text-[#173D33]"
                      }`}
                    >
                      🎁 Gift a Tree
                    </button>
                  </div>
                </div>

                {/* IMPACT TIERS */}
                <div className="mt-10">
                  <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
                    {impactTiers.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() =>
                          setSelectedTier(tier.id)
                        }
                        className={`min-w-[180px] rounded-3xl p-5 backdrop-blur border transition ${
                          selectedTier === tier.id
                            ? "bg-white text-[#173D33] border-white shadow-2xl"
                            : "bg-white/10 text-white border-white/20"
                        }`}
                      >
                        {tier.featured && (
                          <div className="text-xs font-bold mb-2 text-[#D4A63F]">
                            MOST LOVED
                          </div>
                        )}

                        <div className="text-3xl font-bold">
                          ₹{tier.amount}
                        </div>

                        <div className="mt-2 font-semibold">
                          {tier.title}
                        </div>

                        <div className="text-sm opacity-80 mt-1">
                          {tier.short}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* TREE EXPERIENCE */}
            <div className="bg-white rounded-[32px] p-6 lg:p-8 mt-8 shadow-sm border border-[#E8E2D8]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm uppercase tracking-[0.2em] text-[#173D33]/60">
                    Your Tree Experience
                  </div>

                  <h2 className="text-3xl lg:text-4xl font-bold mt-2">
                    {species.title}
                  </h2>
                </div>

                {/* SLIDER */}
                <div className="flex gap-2">
                  <button
                    onClick={prevSpecies}
                    className="w-12 h-12 rounded-2xl border border-[#E6E0D7] flex items-center justify-center hover:bg-[#F4F0E9]"
                  >
                    <ChevronLeft />
                  </button>

                  <button
                    onClick={nextSpecies}
                    className="w-12 h-12 rounded-2xl border border-[#E6E0D7] flex items-center justify-center hover:bg-[#F4F0E9]"
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>

              {/* MAIN TREE VIEW */}
              <div className="grid lg:grid-cols-[1fr_0.9fr] gap-8 mt-8">
                {/* IMAGE */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={species.id}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -20,
                    }}
                    transition={{
                      duration: 0.4,
                    }}
                    className="relative rounded-[28px] overflow-hidden min-h-[420px]"
                  >
                    <Image
                      src={species.image}
                      alt={species.name}
                      fill
                      className="object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute bottom-0 left-0 p-6 text-white">
                      <div className="text-4xl font-bold">
                        {species.name}
                      </div>

                      <div className="opacity-80 italic mt-1">
                        {species.latin}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* CONTENT */}
                <div>
                  <p className="text-lg leading-relaxed text-[#173D33]/80">
                    {species.story}
                  </p>

                  {/* BENEFITS */}
                  <div className="mt-8 space-y-4">
                    {species.benefits.map(
                      (benefit) => (
                        <div
                          key={benefit}
                          className="flex items-center gap-3 rounded-2xl bg-[#F5F2EC] px-5 py-4"
                        >
                          <Leaf
                            size={18}
                            className="text-green-700"
                          />

                          <span className="font-medium">
                            {benefit}
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  {/* SPECIES THUMBNAILS */}
                  <div className="mt-8 overflow-x-auto flex gap-4 pb-2">
                    {speciesData.map(
                      (tree, index) => (
                        <button
                          key={tree.id}
                          onClick={() =>
                            setSelectedSpecies(
                              index
                            )
                          }
                          className={`min-w-[110px] rounded-2xl overflow-hidden border transition ${
                            selectedSpecies ===
                            index
                              ? "border-[#173D33] shadow-lg"
                              : "border-[#E8E2D8]"
                          }`}
                        >
                          <div className="relative h-[90px]">
                            <Image
                              src={tree.image}
                              alt={tree.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="p-3 bg-white text-left">
                            <div className="font-semibold text-sm">
                              {tree.name}
                            </div>
                          </div>
                        </button>
                      )
                    )}
                  </div>

                  {/* QUANTITY */}
                  {selectedTier ===
                    "individual1000" && (
                    <div className="mt-10 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-lg">
                          Number of Trees
                        </div>

                        <div className="text-sm text-[#173D33]/60 mt-1">
                          Each tree gets unique GPS
                          tracking
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() =>
                            setQuantity(
                              Math.max(
                                1,
                                quantity - 1
                              )
                            )
                          }
                          className="w-12 h-12 rounded-2xl bg-[#173D33] text-white"
                        >
                          -
                        </button>

                        <div className="text-2xl font-bold w-8 text-center">
                          {quantity}
                        </div>

                        <button
                          onClick={() =>
                            setQuantity(
                              quantity + 1
                            )
                          }
                          className="w-12 h-12 rounded-2xl bg-[#173D33] text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-[32px] p-6 border border-[#E8E2D8] shadow-sm">
              {/* TITLE */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F2EA] flex items-center justify-center">
                  🌳
                </div>

                <div>
                  <div className="text-sm uppercase tracking-[0.15em] text-[#173D33]/60">
                    Your Living Impact
                  </div>

                  <div className="text-2xl font-bold">
                    {species.name} Tree
                  </div>
                </div>
              </div>

              {/* GPS MAP */}
              <div className="mt-6 rounded-[28px] overflow-hidden relative h-[240px]">
                <Image
                  src="/map-preview.jpg"
                  alt="GPS Map"
                  fill
                  className="object-cover"
                />

                <div className="absolute top-4 left-4 bg-white rounded-full px-4 py-2 text-sm font-semibold shadow">
                  📍 GPS Tracking Enabled
                </div>
              </div>

              {/* IMPACT */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-[#F5F2EC] rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-[#173D33]/70">
                    <Globe2 size={18} />
                    CO₂ Impact
                  </div>

                  <div className="text-3xl font-bold mt-3">
                    ~22kg
                  </div>

                  <div className="text-sm mt-1 text-[#173D33]/60">
                    absorbed per year
                  </div>
                </div>

                <div className="bg-[#F5F2EC] rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-[#173D33]/70">
                    <Droplets size={18} />
                    Water Support
                  </div>

                  <div className="text-3xl font-bold mt-3">
                    18,000L
                  </div>

                  <div className="text-sm mt-1 text-[#173D33]/60">
                    restored yearly
                  </div>
                </div>
              </div>

              {/* RECENT TREE PHOTOS */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold">
                    Live Tree Photos
                  </div>

                  <div className="text-sm text-[#173D33]/60">
                    Updated regularly
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  {recentPhotos.map((photo) => (
                    <div
                      key={photo}
                      className="relative rounded-2xl overflow-hidden h-[120px]"
                    >
                      <Image
                        src={photo}
                        alt="Tree"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* GIFT MODE */}
              {giftMode && (
                <div className="mt-8 bg-[#F7F0FF] border border-[#E4D5FF] rounded-[28px] p-5">
                  <div className="flex items-center gap-2 text-[#8B5CF6] font-bold text-lg">
                    <Gift size={18} />
                    Gift This Tree
                  </div>

                  <div className="mt-5 grid gap-4">
                    <input
                      placeholder="Recipient Name"
                      className="w-full rounded-2xl border border-[#E4D5FF] bg-white px-4 py-4 outline-none"
                    />

                    <input
                      placeholder="Recipient Email"
                      className="w-full rounded-2xl border border-[#E4D5FF] bg-white px-4 py-4 outline-none"
                    />

                    <textarea
                      placeholder="Personal Message"
                      className="w-full rounded-2xl border border-[#E4D5FF] bg-white px-4 py-4 outline-none min-h-[120px]"
                    />
                  </div>
                </div>
              )}

              {/* DONOR FORM */}
              <div className="mt-8">
                <div className="text-xl font-bold">
                  Your Details
                </div>

                <div className="grid gap-4 mt-5">
                  <input
                    placeholder="Full Name"
                    className="w-full rounded-2xl border border-[#E8E2D8] bg-[#FCFBF8] px-4 py-4 outline-none"
                  />

                  <input
                    placeholder="Email Address"
                    className="w-full rounded-2xl border border-[#E8E2D8] bg-[#FCFBF8] px-4 py-4 outline-none"
                  />

                  <input
                    placeholder="Phone Number"
                    className="w-full rounded-2xl border border-[#E8E2D8] bg-[#FCFBF8] px-4 py-4 outline-none"
                  />
                </div>
              </div>

              {/* TOTAL */}
              <div className="mt-8 flex items-center justify-between border-t border-[#ECE5DA] pt-6">
                <div>
                  <div className="text-[#173D33]/60 text-sm">
                    Total Contribution
                  </div>

                  <div className="text-4xl font-bold mt-1">
                    ₹
                    {(activeTier?.amount || 1000) *
                      quantity}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-[#173D33]/60">
                    Includes:
                  </div>

                  <div className="font-semibold mt-1">
                    GPS + 3yr Care
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button className="w-full mt-8 rounded-[24px] bg-[#173D33] hover:bg-[#0F2A22] transition text-white py-5 text-lg font-bold shadow-xl">
                {giftMode
                  ? "🎁 Gift This Living Tree"
                  : "🌱 Adopt This Living Tree"}
              </button>

              {/* TRUST */}
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-[#173D33]/60">
                <div>🔒 Secure Payment</div>
                <div>📍 Geo-tagged</div>
                <div>🌿 AI Verified</div>
                <div>🛡 91% Survival</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
