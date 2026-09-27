import prisma from "../lib/prisma"

const CATEGORIES_DATA = [
  {
    name: "Newborn Essentials",
    slug: "newborn-essentials",
    description: "Essential gentle products curated for baby's first 0–6 months",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=800&auto=format&fit=crop",
    sortOrder: 1,
    showOnNavbar: true,
    showOnHomepage: true,
    children: [
      { name: "Newborn Pillows", slug: "newborn-pillow", sortOrder: 1 },
      { name: "Baby Blankets", slug: "baby-blankets", sortOrder: 2 },
      { name: "Swaddles & Wraps", slug: "swaddles-wraps", sortOrder: 3 },
      { name: "Mittens & Booties", slug: "mittens-booties", sortOrder: 4 },
      { name: "Baby Caps & Beanies", slug: "baby-caps", sortOrder: 5 },
      { name: "Newborn Gift Sets", slug: "newborn-gift-sets", sortOrder: 6 },
      { name: "Sleeping Accessories", slug: "sleeping-accessories", sortOrder: 7 },
    ],
  },
  {
    name: "Baby Clothing",
    slug: "baby-clothing",
    description: "Ultra-soft GOTS organic cotton clothing for ages 0–5 years",
    image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=800&auto=format&fit=crop",
    sortOrder: 2,
    showOnNavbar: true,
    showOnHomepage: true,
    children: [
      { name: "Baby Boy", slug: "baby-boy", sortOrder: 1 },
      { name: "Baby Girl", slug: "baby-girl", sortOrder: 2 },
      { name: "Unisex Baby", slug: "unisex-baby", sortOrder: 3 },
      { name: "Newborn Clothing (0-6M)", slug: "newborn-clothing", sortOrder: 4 },
      { name: "Toddler Clothing (1-5Y)", slug: "toddler-clothing", sortOrder: 5 },
      { name: "Rompers & Onesies", slug: "rompers-onesies", sortOrder: 6 },
      { name: "Bodysuits", slug: "bodysuits", sortOrder: 7 },
      { name: "Baby Dresses", slug: "baby-dresses", sortOrder: 8 },
      { name: "Pajamas & Sleepwear", slug: "pajamas-sleepwear", sortOrder: 9 },
      { name: "Socks & Shoes", slug: "socks-shoes", sortOrder: 10 },
      { name: "Seasonal Clothing", slug: "seasonal-clothing", sortOrder: 11 },
    ],
  },
  {
    name: "Feeding & Nursing",
    slug: "feeding-nursing",
    description: "100% Food-grade, BPA-free baby bottles, pumps & feeding ware",
    image: "https://images.unsplash.com/photo-1594824813579-2453663b6528?q=80&w=800&auto=format&fit=crop",
    sortOrder: 3,
    showOnNavbar: true,
    showOnHomepage: true,
    children: [
      { name: "Baby Bottles", slug: "baby-bottles", sortOrder: 1 },
      { name: "Bottle Accessories", slug: "bottle-accessories", sortOrder: 2 },
      { name: "Bottle Cleaners & Sterilizers", slug: "bottle-cleaners", sortOrder: 3 },
      { name: "Breast Pumps", slug: "breast-pumps", sortOrder: 4 },
      { name: "Feeding Spoons & Cutlery", slug: "feeding-spoons", sortOrder: 5 },
      { name: "Feeding Bowls & Plates", slug: "feeding-bowls", sortOrder: 6 },
      { name: "Silicone Bibs", slug: "bibs", sortOrder: 7 },
      { name: "Food Storage Containers", slug: "food-storage-containers", sortOrder: 8 },
    ],
  },
  {
    name: "Baby Safety",
    slug: "baby-safety",
    description: "Childproofing essentials, monitors & baby safety gear",
    image: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=800&auto=format&fit=crop",
    sortOrder: 4,
    showOnNavbar: true,
    showOnHomepage: true,
    children: [
      { name: "Baby Safety Belts", slug: "baby-safety-belt", sortOrder: 1 },
      { name: "Corner Protectors", slug: "corner-protectors", sortOrder: 2 },
      { name: "Cabinet & Drawer Locks", slug: "cabinet-locks", sortOrder: 3 },
      { name: "Safety Gates", slug: "safety-gates", sortOrder: 4 },
      { name: "Baby Monitors & Alarms", slug: "baby-monitors", sortOrder: 5 },
      { name: "Car Safety Products", slug: "car-safety-products", sortOrder: 6 },
    ],
  },
  {
    name: "Nursery & Storage",
    slug: "nursery-storage",
    description: "Diaper caddies, storage organizers & serene nursery decoration",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop",
    sortOrder: 5,
    showOnNavbar: true,
    showOnHomepage: true,
    children: [
      { name: "Diaper Baskets & Caddies", slug: "diaper-baskets", sortOrder: 1 },
      { name: "Baby Organizers", slug: "baby-organizers", sortOrder: 2 },
      { name: "Storage Boxes", slug: "storage-boxes", sortOrder: 3 },
      { name: "Baby Racks & Hangers", slug: "baby-racks", sortOrder: 4 },
      { name: "Nursery Decoration", slug: "nursery-decoration", sortOrder: 5 },
      { name: "Changing Accessories", slug: "changing-accessories", sortOrder: 6 },
    ],
  },
  {
    name: "Baby Care & Hygiene",
    slug: "baby-care-hygiene",
    description: "Hypoallergenic bath towels, natural skincare & grooming kits",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
    sortOrder: 6,
    showOnNavbar: true,
    showOnHomepage: true,
    children: [
      { name: "Baby Towels & Washcloths", slug: "baby-towels", sortOrder: 1 },
      { name: "Baby Skincare & Balms", slug: "baby-skincare", sortOrder: 2 },
      { name: "Tear-Free Baby Shampoo", slug: "baby-shampoo", sortOrder: 3 },
      { name: "Soothing Baby Lotion", slug: "baby-lotion", sortOrder: 4 },
      { name: "Nail Care Grooming Kits", slug: "nail-care", sortOrder: 5 },
      { name: "Bath Accessories & Tubs", slug: "bath-accessories", sortOrder: 6 },
    ],
  },
  {
    name: "Toys & Learning",
    slug: "toys-learning",
    description: "Montessori development, soft plushies, teethers & sensory toys",
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=800&auto=format&fit=crop",
    sortOrder: 7,
    showOnNavbar: true,
    showOnHomepage: true,
    children: [
      { name: "Soft Plush Toys", slug: "soft-toys", sortOrder: 1 },
      { name: "Educational & Montessori Toys", slug: "educational-toys", sortOrder: 2 },
      { name: "Rattles & Teethers", slug: "rattles", sortOrder: 3 },
      { name: "Sensory Development Toys", slug: "sensory-toys", sortOrder: 4 },
      { name: "Activity Toys & Playmats", slug: "activity-toys", sortOrder: 5 },
    ],
  },
  {
    name: "Baby Travel Essentials",
    slug: "baby-travel-essentials",
    description: "Ergonomic baby carriers, diaper backpacks & stroller accessories",
    image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=800&auto=format&fit=crop",
    sortOrder: 8,
    showOnNavbar: true,
    showOnHomepage: true,
    children: [
      { name: "Diaper Bags & Backpacks", slug: "diaper-bags", sortOrder: 1 },
      { name: "Baby Carriers & Slings", slug: "baby-carriers", sortOrder: 2 },
      { name: "Travel Safety Belts", slug: "travel-safety-belts", sortOrder: 3 },
      { name: "Travel Organizers", slug: "travel-organizers", sortOrder: 4 },
      { name: "Stroller Accessories", slug: "strollers-accessories", sortOrder: 5 },
    ],
  },
  {
    name: "Gift Collections",
    slug: "gift-collections",
    description: "Luxury keepsake gift boxes, baby shower hampers & milestone sets",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop",
    sortOrder: 9,
    showOnNavbar: true,
    showOnHomepage: true,
    children: [
      { name: "Newborn Gift Box", slug: "newborn-gift-box", sortOrder: 1 },
      { name: "Baby Shower Gifts", slug: "baby-shower-gift", sortOrder: 2 },
      { name: "Birthday Gift Sets", slug: "birthday-gift-set", sortOrder: 3 },
      { name: "First Year Keepsake Collection", slug: "first-year-collection", sortOrder: 4 },
    ],
  },
]

async function seedCategories() {
  console.log("🌱 Starting 9-Category Catalog Seeding...")

  for (const catData of CATEGORIES_DATA) {
    const { children, ...parentProps } = catData

    // Upsert parent
    const parent = await prisma.category.upsert({
      where: { slug: parentProps.slug },
      update: {
        name: parentProps.name,
        description: parentProps.description,
        image: parentProps.image,
        sortOrder: parentProps.sortOrder,
        showOnNavbar: parentProps.showOnNavbar,
        showOnHomepage: parentProps.showOnHomepage,
        isActive: true,
      },
      create: {
        name: parentProps.name,
        slug: parentProps.slug,
        description: parentProps.description,
        image: parentProps.image,
        sortOrder: parentProps.sortOrder,
        showOnNavbar: parentProps.showOnNavbar,
        showOnHomepage: parentProps.showOnHomepage,
        isActive: true,
      },
    })

    console.log(`✅ Parent category ready: ${parent.name}`)

    // Upsert subcategories
    if (children && children.length > 0) {
      for (const sub of children) {
        await prisma.category.upsert({
          where: { slug: sub.slug },
          update: {
            name: sub.name,
            parentId: parent.id,
            sortOrder: sub.sortOrder,
            showOnNavbar: true,
            showOnHomepage: true,
            isActive: true,
          },
          create: {
            name: sub.name,
            slug: sub.slug,
            parentId: parent.id,
            sortOrder: sub.sortOrder,
            showOnNavbar: true,
            showOnHomepage: true,
            isActive: true,
          },
        })
      }
      console.log(`   ↳ Seeded ${children.length} subcategories for ${parent.name}`)
    }
  }

  console.log("✨ All 9 Mini Bunny departments successfully seeded into database!")
}

seedCategories()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
