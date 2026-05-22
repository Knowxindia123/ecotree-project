"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Leaf,
  Gift,
  ShieldCheck,
  Trees,
  Globe2,
  Droplets,
  Heart,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
} from "lucide-react";

const tiers = [
  {
    id: "community100",
    amount: 100,
    title: "Community Contributor",
    subtitle: "Support native community forests",
    color: "#173D33",
    type: "community",
    features: [
      "Community forest participation",
      "Impact updates",
      "Digital appreciation certificate",
      "Eco community access",
    ],
  },
  {
    id: "community250",
    amount: 250,
    title: "Community Supporter",
    subtitle: "Create larger collective impact",
    color: "#173D33",
    type: "community",
    features: [
      "Priority impact updates",
      "Community participation",
      "Forest restoration support",
      "Community dashboard access",
    ],
  },
  {
    id: "shared500",
    amount: 500,
    title: "Shared Tree Impact",
    subtitle: "Co-create a fully tracked tree",
    color: "#3B6C57",
    type: "shared",
    features: [
      "GPS tracked shared tree",
      "Shared ownership certificate",
      "Growth updates",
      "Native species allocation",
    ],
  },
  {
    id: "individual1000",
    amount: 1000,
    title: "Individual Tree",
    subtitle: "Your personal geo-tagged tree",
    color: "#D4A63F",
    type: "individual",
    featured: true,
    features: [
      "Personal dashboard",
      "GPS tree tracking",
      "AI verified plantation",
      "3-year maintenance",
      "Digital certificate",
      "80G benefit",
    ],
  },
  {
    id: "miyawaki5000",
    amount: 5000,
    title: "Miyawaki Forest",
    subtitle: "Create dense ecosystem impact",
    color: "#173D33",
    type: "forest",
    features: [
      "Dense urban forest",
      "Biodiversity impact",
      "Carbon absorption metrics",
      "Forest GPS tracking",
    ],
  },
];

const speciesOptions = [
  { name: "Neem", benefit: "High Oxygen" },
  { name: "Banyan", benefit: "Great Shade" },
  { name: "Mango", benefit: "Fruit Bearing" },
  { name: "Honge", benefit: "Fast Growth" },
];

export default function EcoTreeCheckoutPage() {
  const [expanded, setExpanded] = useState("individual1000");
  const [giftMode, setGiftMode] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState("Neem");
  const [quantity, setQuantity] = useState(1);

  const selectedTier =
    tiers.find((t) => t.id === expanded) || tiers[3];

  return (
    <div className="min-h-screen bg-[#F8F6F1] text-[#1B1B1B]">
      {/* TRUST BAR */}
      <div className="sticky top-0 z-50 bg-[#173D33] text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-4 justify-center text-sm font-medium">
          <div className="flex items-center gap-2">
            <Trees size={16} /> 10,000+ Trees Planted
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} /> GPS Verified
          </div>
          <div className="flex items-center gap-2">
            <BadgeCheck size={16} /> AI Verified
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} /> 91% Survival
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 pt-12 pb-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-[#173D33] tracking-tight">
            Plant Impact That Lives
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Geo-tagged trees. AI-verified plantations. Personal dashboards.
            Real environmental impact you can track.
          </p>
        </div>

        {/* TOGGLE */}
        <div className="mt-10 flex justify-center">
          <div className="bg-white rounded-2xl shadow-md p-2 flex gap-2">
            <button
              onClick={() => setGiftMode(false)}
              className={`px-6 py-3 rounded-xl font-semibold transition ${
                !giftMode
                  ? "bg-[#173D33] text-white"
                  : "bg-[#F3F1EA] text-[#173D33]"
              }`}
            >
              🌱 Plant for Myself
            </button>

            <button
              onClick={() => setGiftMode(true)}
              className={`px-6 py-3 rounded-xl font-semibold transition ${
                giftMode
                  ? "bg-[#8B5CF6] text-white"
                  : "bg-[#F3F1EA] text-[#173D33]"
              }`}
            >
              🎁 Gift a Tree
            </button>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <section className="max-w-7xl mx-auto px-4 pb-20 grid grid-cols-1 lg:grid-cols-[1.6fr_0.9fr] gap-10">
        {/* LEFT */}
        <div className="space-y-6">
          {tiers.map((tier) => {
            const isExpanded = expanded === tier.id;

            return (
              <motion.div
                layout
                key={tier.id}
                className={`rounded-3xl border transition overflow-hidden ${
                  tier.featured
                    ? "border-[#D4A63F] shadow-2xl bg-white"
                    : "border-gray-200 bg-white"
                }`}
              >
                <button
                  onClick={() =>
                    setExpanded(isExpanded ? "" : tier.id)
                  }
                  className="w-full text-left p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      {tier.featured && (
                        <div className="inline-block bg-[#D4A63F] text-[#173D33] px-3 py-1 rounded-full text-xs font-bold mb-3">
                          🌟 MOST LOVED OPTION
                        </div>
                      )}

                      <h3 className="text-2xl font-bold text-[#173D33]">
                        {giftMode
                          ? `🎁 Gift ${tier.title}`
                          : tier.title}
                      </h3>

                      <p className="text-gray-600 mt-2">
                        {giftMode
                          ? "Gift a living impact experience"
                          : tier.subtitle}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold text-[#173D33]">
                        ₹{tier.amount}
                      </div>

                      {isExpanded ? (
                        <ChevronUp />
                      ) : (
                        <ChevronDown />
                      )}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 pb-6"
                    >
                      {/* FEATURES */}
                      <div className="grid md:grid-cols-2 gap-3 mt-2">
                        {tier.features.map((feature) => (
                          <div
                            key={feature}
                            className="flex items-center gap-2 bg-[#F8F6F1] rounded-xl px-4 py-3"
                          >
                            <Leaf
                              size={16}
                              className="text-green-700"
                            />
                            <span className="text-sm">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* SPECIES ONLY FOR ₹1000 */}
                      {tier.type === "individual" && (
                        <>
                          <div className="mt-8">
                            <h4 className="font-bold text-lg text-[#173D33]">
                              Choose Your Species
                            </h4>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              {speciesOptions.map((sp) => (
                                <button
                                  key={sp.name}
                                  onClick={() =>
                                    setSelectedSpecies(sp.name)
                                  }
                                  className={`rounded-2xl border p-4 text-left transition ${
                                    selectedSpecies === sp.name
                                      ? "border-[#173D33] bg-[#E7F4EA]"
                                      : "border-gray-200 bg-white"
                                  }`}
                                >
                                  <div className="text-3xl">🌳</div>
                                  <div className="font-bold mt-3">
                                    {sp.name}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {sp.benefit}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* QUANTITY */}
                          <div className="mt-8">
                            <h4 className="font-bold text-lg text-[#173D33]">
                              Number of Trees
                            </h4>

                            <div className="flex items-center gap-4 mt-4">
                              <button
                                onClick={() =>
                                  setQuantity(
                                    Math.max(1, quantity - 1)
                                  )
                                }
                                className="w-12 h-12 rounded-xl bg-[#173D33] text-white text-xl"
                              >
                                -
                              </button>

                              <div className="text-2xl font-bold">
                                {quantity}
                              </div>

                              <button
                                onClick={() =>
                                  setQuantity(quantity + 1)
                                }
                                className="w-12 h-12 rounded-xl bg-[#173D33] text-white text-xl"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {/* GIFT FIELDS */}
                      {giftMode && (
                        <div className="mt-8 grid md:grid-cols-2 gap-4">
                          <input
                            placeholder="Recipient Name"
                            className="rounded-xl border border-gray-300 p-4 bg-white"
                          />

                          <input
                            placeholder="Recipient Email"
                            className="rounded-xl border border-gray-300 p-4 bg-white"
                          />

                          <input
                            placeholder="Occasion"
                            className="rounded-xl border border-gray-300 p-4 bg-white"
                          />

                          <input
                            placeholder="Delivery Date"
                            className="rounded-xl border border-gray-300 p-4 bg-white"
                          />

                          <textarea
                            placeholder="Personal Message"
                            className="rounded-xl border border-gray-300 p-4 bg-white md:col-span-2 min-h-[120px]"
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:sticky lg:top-28 h-fit">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="flex items-center gap-2 text-[#173D33]">
              <Leaf />
              <h3 className="text-2xl font-bold">
                Your Impact
              </h3>
            </div>

            {/* PREVIEW */}
            <div className="mt-6 rounded-2xl bg-[#E7F4EA] p-5">
              <div className="text-3xl">🌳</div>

              <div className="mt-3 font-bold text-lg">
                {selectedSpecies} Tree
              </div>

              <div className="text-sm text-gray-600 mt-1">
                GPS Tracking Enabled
              </div>

              <div className="text-sm text-gray-600">
                Bangalore Region
              </div>
            </div>

            {/* IMPACT */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <Globe2 size={18} />
                <span>~22kg CO₂/year</span>
              </div>

              <div className="flex items-center gap-3">
                <Droplets size={18} />
                <span>Water restoration impact</span>
              </div>

              <div className="flex items-center gap-3">
                <Heart size={18} />
                <span>Biodiversity support</span>
              </div>
            </div>

            {/* FORM */}
            <div className="mt-8 space-y-4">
              <input
                placeholder="Full Name"
                className="w-full rounded-xl border border-gray-300 p-4"
              />

              <input
                placeholder="Email Address"
                className="w-full rounded-xl border border-gray-300 p-4"
              />

              <input
                placeholder="Phone Number"
                className="w-full rounded-xl border border-gray-300 p-4"
              />
            </div>

            {/* TOTAL */}
            <div className="mt-8 flex items-center justify-between">
              <span className="text-gray-600">
                Total Contribution
              </span>

              <span className="text-3xl font-bold text-[#173D33]">
                ₹{selectedTier.amount * quantity}
              </span>
            </div>

            {/* CTA */}
            <button className="mt-8 w-full rounded-2xl bg-[#173D33] text-white py-5 text-lg font-bold hover:opacity-95 transition">
              {giftMode
                ? "🎁 Gift This Impact"
                : "🌱 Plant & Track My Tree"}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Certificate + GPS Tracking Included
            </p>

            {/* TRUST */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-600 space-y-2">
              <div className="flex items-center gap-2">
                🔒 Razorpay Secure
              </div>

              <div className="flex items-center gap-2">
                📍 Geo-tagged Plantation
              </div>

              <div className="flex items-center gap-2">
                🧾 Instant Certificate
              </div>

              <div className="flex items-center gap-2">
                🛡 91% Survival Rate
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
