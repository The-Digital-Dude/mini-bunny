"use client"

import { useState } from "react"
import Image from "next/image"
import { Gift, Heart, Sparkles, Check, ArrowRight, ArrowLeft, ShoppingBag, Truck, ShieldCheck } from "lucide-react"
import { useCartStore } from "@/store/useCartStore"
import { toast } from "sonner"

// Step 1 Box Styles
const BOX_OPTIONS = [
  {
    id: "box-pink",
    name: "Pastel Pink Bunny Keepsake Box",
    color: "Blush Pink",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop",
    desc: "Luxury magnetic closure with satin pink ribbon & gold foil bunny crest.",
    price: 350,
  },
  {
    id: "box-blue",
    name: "Cloud Blue Bunny Keepsake Box",
    color: "Cloud Blue",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop",
    desc: "Signature magnetic keepsake box with sky-blue grosgrain ribbon.",
    price: 350,
  },
  {
    id: "box-ivory",
    name: "Natural Ivory Neutral Keepsake Box",
    color: "Neutral Cream",
    image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=600&auto=format&fit=crop",
    desc: "Minimalist gender-neutral linen texture box with gold embossed bunny emblem.",
    price: 350,
  },
]

// Step 2 Clothing / Swaddles
const APPAREL_OPTIONS = [
  {
    id: "app-1",
    name: "Organic Cloud Cotton Romper",
    category: "0–6M Clothing",
    price: 850,
    image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=600&auto=format&fit=crop",
    size: "0-3M",
  },
  {
    id: "app-2",
    name: "2-Way Zip Ribbed Sleepsuit",
    category: "3–6M Sleepwear",
    price: 950,
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=600&auto=format&fit=crop",
    size: "3-6M",
  },
  {
    id: "app-3",
    name: "Double Muslin Swaddle Blanket",
    category: "Newborn Swaddle",
    price: 750,
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=600&auto=format&fit=crop",
    size: "Universal (110x110cm)",
  },
  {
    id: "app-4",
    name: "Pure Bamboo Kimono Bodysuit & Cap",
    category: "Newborn Set",
    price: 1100,
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=600&auto=format&fit=crop",
    size: "0-3M",
  },
]

// Step 3 Toy / Feeding / Accessory
const ACCESSORY_OPTIONS = [
  {
    id: "acc-1",
    name: "Soft Bunny Organic Plush Rattle",
    category: "Sensory Plush",
    price: 650,
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "acc-2",
    name: "Natural Beechwood & Silicone Teether",
    category: "BPA-Free Teething",
    price: 550,
    image: "https://images.unsplash.com/photo-1594824813579-2453663b6528?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "acc-3",
    name: "Anti-Colic Glass Bottle (160ml)",
    category: "Feeding & Nursing",
    price: 850,
    image: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "acc-4",
    name: "Food-Grade Soft Silicone Catch Bib",
    category: "Feeding Essential",
    price: 450,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop",
  },
]

export default function HamperBuilder() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Builder Selections
  const [selectedBox, setSelectedBox] = useState(BOX_OPTIONS[0])
  const [selectedApparel, setSelectedApparel] = useState(APPAREL_OPTIONS[0])
  const [selectedAccessory, setSelectedAccessory] = useState(ACCESSORY_OPTIONS[0])

  // Step 4 Details
  const [recipientName, setRecipientName] = useState("")
  const [recipientPhone, setRecipientPhone] = useState("")
  const [greetingMessage, setGreetingMessage] = useState(
    "Welcome to the world, little angel! Sending so much love to the happy family. 💕"
  )
  const [hidePriceInvoice, setHidePriceInvoice] = useState(true)

  const addItem = useCartStore((s) => s.addItem)

  // Financials (10% Bundle Discount)
  const subtotal = selectedBox.price + selectedApparel.price + selectedAccessory.price
  const discountAmount = Math.round(subtotal * 0.1)
  const finalPrice = subtotal - discountAmount

  const handleAddHamperToCart = () => {
    const hamperGroupId = `hamper_${Date.now()}`

    // Add Box
    addItem({
      id: `${hamperGroupId}_box`,
      productId: "custom-hamper-box",
      variantId: `var_${selectedBox.id}`,
      productSlug: "deluxe-newborn-keepsake-gift-box",
      name: `🎁 Hamper: ${selectedBox.name}`,
      price: selectedBox.price,
      image: selectedBox.image,
      size: "Luxury Box",
      color: selectedBox.color,
      quantity: 1,
      setGroupId: hamperGroupId,
    })

    // Add Apparel
    addItem({
      id: `${hamperGroupId}_apparel`,
      productId: selectedApparel.id,
      variantId: `var_${selectedApparel.id}`,
      productSlug: selectedApparel.id,
      name: selectedApparel.name,
      price: Math.round(selectedApparel.price * 0.9), // 10% bundle discount applied
      image: selectedApparel.image,
      size: selectedApparel.size,
      color: "Signature",
      quantity: 1,
      setGroupId: hamperGroupId,
    })

    // Add Accessory
    addItem({
      id: `${hamperGroupId}_accessory`,
      productId: selectedAccessory.id,
      variantId: `var_${selectedAccessory.id}`,
      productSlug: selectedAccessory.id,
      name: selectedAccessory.name,
      price: Math.round(selectedAccessory.price * 0.9), // 10% bundle discount applied
      image: selectedAccessory.image,
      size: "One Size",
      color: "Signature",
      quantity: 1,
      setGroupId: hamperGroupId,
    })

    toast.success("Custom Baby Hamper added to your bag! 🎁", {
      description: `Saved ৳${discountAmount.toLocaleString()} with 10% Hamper Bundle Savings.`,
    })
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 4-Step Progress Indicator */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 border-b border-[#EDE8DF] pb-5">
        {[
          { num: 1, label: "1. Keepsake Box", active: step >= 1 },
          { num: 2, label: "2. Outfit / Swaddle", active: step >= 2 },
          { num: 3, label: "3. Toy & Accessory", active: step >= 3 },
          { num: 4, label: "4. Gift Note & Deliver", active: step >= 4 },
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => setStep(s.num as any)}
            className={`text-left p-2.5 sm:p-3 rounded-2xl border transition-all ${
              step === s.num
                ? "bg-[#1E3E5B] text-white border-[#1E3E5B] shadow-sm"
                : s.active
                ? "bg-white text-[#4A8DB7] border-[#4A8DB7]/30"
                : "bg-[#FAF9F5] text-[#6C7A89] border-transparent"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === s.num ? "bg-white text-[#1E3E5B]" : "bg-[#EDE8DF] text-[#1E3E5B]"
              }`}>
                {s.num}
              </span>
              <span className="font-bold text-xs truncate hidden sm:inline">{s.label.split(". ")[1]}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Step Views (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: BOX SELECTION */}
          {step === 1 && (
            <div className="p-6 rounded-3xl bg-white border border-[#EDE8DF] shadow-xs space-y-5 animate-in fade-in">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF758F]">
                  Step 1 of 4
                </span>
                <h3 className="font-heading font-black text-xl text-[#1E3E5B]">
                  Choose Your Keepsake Box Style
                </h3>
                <p className="text-xs text-[#6C7A89]">
                  Each luxury gift box features a magnetic closure, grosgrain ribbon, and tissue wrapping.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {BOX_OPTIONS.map((box) => {
                  const isSelected = selectedBox.id === box.id
                  return (
                    <div
                      key={box.id}
                      onClick={() => setSelectedBox(box)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? "border-[#4A8DB7] bg-[#F0F7FB]/50 shadow-md ring-2 ring-[#4A8DB7]/20"
                          : "border-[#EDE8DF] bg-white hover:bg-[#FAF9F5]"
                      }`}
                    >
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-[#EDE8DF]">
                        <Image src={box.image} alt={box.name} fill className="object-cover" />
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#4A8DB7] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs text-[#1E3E5B]">{box.name}</h4>
                        <p className="text-[10px] text-[#6C7A89] leading-tight">{box.desc}</p>
                      </div>
                      <p className="font-mono text-xs font-bold text-[#4A8DB7]">৳{box.price}</p>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-[#4A8DB7] hover:bg-[#367299] text-white text-xs font-bold rounded-2xl shadow-sm transition-all flex items-center gap-2"
                >
                  <span>Next: Pick Clothing & Swaddles</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: APPAREL SELECTION */}
          {step === 2 && (
            <div className="p-6 rounded-3xl bg-white border border-[#EDE8DF] shadow-xs space-y-5 animate-in fade-in">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4A8DB7]">
                  Step 2 of 4
                </span>
                <h3 className="font-heading font-black text-xl text-[#1E3E5B]">
                  Select Organic Clothing or Swaddle
                </h3>
                <p className="text-xs text-[#6C7A89]">
                  100% GOTS certified organic cotton garments, gentle on delicate newborn skin.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {APPAREL_OPTIONS.map((item) => {
                  const isSelected = selectedApparel.id === item.id
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedApparel(item)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex gap-3.5 ${
                        isSelected
                          ? "border-[#4A8DB7] bg-[#F0F7FB]/50 shadow-md ring-2 ring-[#4A8DB7]/20"
                          : "border-[#EDE8DF] bg-white hover:bg-[#FAF9F5]"
                      }`}
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white border border-[#EDE8DF] shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#4A8DB7] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-between py-0.5">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#FF758F] block">
                            {item.category}
                          </span>
                          <h4 className="font-bold text-xs text-[#1E3E5B]">{item.name}</h4>
                          <span className="text-[10px] text-[#6C7A89]">Size: {item.size}</span>
                        </div>
                        <p className="font-mono text-xs font-bold text-[#1E3E5B]">৳{item.price}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 border border-[#EDE8DF] hover:bg-[#FAF9F5] text-xs font-bold text-[#6C7A89] rounded-2xl flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Box</span>
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-[#4A8DB7] hover:bg-[#367299] text-white text-xs font-bold rounded-2xl shadow-sm transition-all flex items-center gap-2"
                >
                  <span>Next: Pick Toy & Accessory</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: TOY & ACCESSORY */}
          {step === 3 && (
            <div className="p-6 rounded-3xl bg-white border border-[#EDE8DF] shadow-xs space-y-5 animate-in fade-in">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E67E22]">
                  Step 3 of 4
                </span>
                <h3 className="font-heading font-black text-xl text-[#1E3E5B]">
                  Add a Plush Toy, Teether, or Bottle
                </h3>
                <p className="text-xs text-[#6C7A89]">
                  Complete the hamper with a sensory plush companion or food-grade baby care item.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ACCESSORY_OPTIONS.map((item) => {
                  const isSelected = selectedAccessory.id === item.id
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedAccessory(item)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex gap-3.5 ${
                        isSelected
                          ? "border-[#4A8DB7] bg-[#F0F7FB]/50 shadow-md ring-2 ring-[#4A8DB7]/20"
                          : "border-[#EDE8DF] bg-white hover:bg-[#FAF9F5]"
                      }`}
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white border border-[#EDE8DF] shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#4A8DB7] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-between py-0.5">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#E67E22] block">
                            {item.category}
                          </span>
                          <h4 className="font-bold text-xs text-[#1E3E5B]">{item.name}</h4>
                        </div>
                        <p className="font-mono text-xs font-bold text-[#1E3E5B]">৳{item.price}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 border border-[#EDE8DF] hover:bg-[#FAF9F5] text-xs font-bold text-[#6C7A89] rounded-2xl flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Outfits</span>
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-3 bg-[#4A8DB7] hover:bg-[#367299] text-white text-xs font-bold rounded-2xl shadow-sm transition-all flex items-center gap-2"
                >
                  <span>Next: Gift Note & Delivery</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: GREETING & DELIVERY */}
          {step === 4 && (
            <div className="p-6 rounded-3xl bg-white border border-[#EDE8DF] shadow-xs space-y-5 animate-in fade-in">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2ECC71]">
                  Step 4 of 4
                </span>
                <h3 className="font-heading font-black text-xl text-[#1E3E5B]">
                  Handwritten Card & Recipient Delivery
                </h3>
                <p className="text-xs text-[#6C7A89]">
                  We will pen your personal message into a gold-foil bunny card and ship directly to the new parents.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#1E3E5B]">Recipient Parent Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Tanzina & Baby Ryan"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#EDE8DF] focus:border-[#4A8DB7] rounded-xl text-xs focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#1E3E5B]">Recipient Phone (for Courier)</label>
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#EDE8DF] focus:border-[#4A8DB7] rounded-xl text-xs focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-[#1E3E5B] flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-[#FF758F] fill-[#FF758F]" /> Handwritten Card Note
                    </label>
                    <span className="text-[10px] text-[#6C7A89]">{greetingMessage.length}/180</span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={180}
                    value={greetingMessage}
                    onChange={(e) => setGreetingMessage(e.target.value)}
                    placeholder="Write your heartfelt baby shower blessings..."
                    className="w-full p-3 bg-[#FAF9F5] border border-[#EDE8DF] focus:border-[#FF758F] rounded-2xl text-xs text-[#1E3E5B] focus:outline-none focus:bg-white"
                  />
                </div>

                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FAF9F5] border border-[#EDE8DF] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hidePriceInvoice}
                    onChange={(e) => setHidePriceInvoice(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#4A8DB7] cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#1E3E5B]">Hide Prices on Packing Slip (Gift Invoice)</p>
                    <p className="text-[10px] text-[#6C7A89]">No prices shown inside box; receipt emailed to buyer.</p>
                  </div>
                </label>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 border border-[#EDE8DF] hover:bg-[#FAF9F5] text-xs font-bold text-[#6C7A89] rounded-2xl flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Toy</span>
                </button>
                <button
                  onClick={handleAddHamperToCart}
                  className="px-6 py-3.5 bg-[#4A8DB7] hover:bg-[#367299] text-white text-xs font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Hamper to Bag (৳{finalPrice.toLocaleString()})</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Hamper Summary Box (Right Column) */}
        <div className="p-6 rounded-3xl bg-white border border-[#EDE8DF] shadow-md space-y-5 sticky top-24">
          <div className="flex items-center justify-between border-b border-[#EDE8DF] pb-3">
            <h4 className="font-heading font-black text-base text-[#1E3E5B] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FF758F]" />
              <span>Hamper Summary</span>
            </h4>
            <span className="text-[10px] font-extrabold bg-[#FFF0F3] text-[#FF758F] px-2 py-0.5 rounded-full border border-[#FF758F]/20">
              10% Bundle Savings
            </span>
          </div>

          {/* Selected Items Breakdown */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#6C7A89] truncate max-w-[170px]">1. {selectedBox.name}</span>
              <span className="font-mono font-bold text-[#1E3E5B]">৳{selectedBox.price}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6C7A89] truncate max-w-[170px]">2. {selectedApparel.name}</span>
              <span className="font-mono font-bold text-[#1E3E5B]">৳{selectedApparel.price}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6C7A89] truncate max-w-[170px]">3. {selectedAccessory.name}</span>
              <span className="font-mono font-bold text-[#1E3E5B]">৳{selectedAccessory.price}</span>
            </div>
            <div className="flex items-center justify-between text-emerald-600 font-bold pt-1 border-t border-[#EDE8DF]">
              <span>4. Handwritten Gift Note</span>
              <span>FREE</span>
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="pt-3 border-t border-[#EDE8DF] space-y-1.5 text-xs">
            <div className="flex justify-between text-[#6C7A89]">
              <span>Items Total:</span>
              <span className="line-through font-mono">৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>10% Hamper Discount:</span>
              <span className="font-mono">-৳{discountAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#EDE8DF] text-base font-extrabold text-[#1E3E5B]">
              <span>Hamper Price:</span>
              <span className="font-mono text-xl text-[#1E3E5B]">৳{finalPrice.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleAddHamperToCart}
            className="w-full py-3.5 bg-[#4A8DB7] hover:bg-[#367299] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Gift className="w-4 h-4" />
            <span>Add Hamper to Bag</span>
          </button>

          <div className="space-y-1 text-[10px] text-[#6C7A89] pt-2 border-t border-[#EDE8DF]/60">
            <p className="flex items-center gap-1">
              <Truck className="w-3 h-3 text-[#4A8DB7]" /> Free Delivery across Bangladesh over ৳2,000
            </p>
            <p className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Sterile Packed & Ready to Gift
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
