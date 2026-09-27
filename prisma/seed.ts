import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const prisma = new PrismaClient()

const Role = { ADMIN: 'ADMIN', CUSTOMER: 'CUSTOMER' } as const

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  console.log('🌱 Seeding Mini Bunny database...')

  // ─── Admin User ───────────────────────────────────────────────
  const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers()
  let authUser = existingAuthUsers?.users?.find((u) => u.email === 'admin@store.com')

  if (!authUser) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@store.com',
      password: 'Admin@1234',
      email_confirm: true,
      app_metadata: { role: 'ADMIN' },
      user_metadata: { name: 'Admin' },
    })
    if (error) throw error
    authUser = data.user
  } else {
    await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
      app_metadata: { role: 'ADMIN' },
      user_metadata: { name: 'Admin' },
    })
  }

  const stalePrismaAdmin = await prisma.user.findUnique({ where: { email: 'admin@store.com' } })
  if (stalePrismaAdmin && stalePrismaAdmin.id !== authUser.id) {
    await prisma.user.delete({ where: { id: stalePrismaAdmin.id } })
  }

  const admin = await prisma.user.upsert({
    where: { id: authUser.id },
    update: { role: Role.ADMIN },
    create: {
      id: authUser.id,
      name: 'Admin',
      email: 'admin@store.com',
      role: Role.ADMIN,
    },
  })
  console.log('✅ Admin user:', admin.email)

  // ─── Clean products and categories for fresh hierarchy ───────────
  await prisma.cartItem.deleteMany({})
  await prisma.orderItem.deleteMany({})
  await prisma.productVariant.deleteMany({})
  await prisma.productImage.deleteMany({})
  await prisma.product.deleteMany({})
  await prisma.sizeGuide.deleteMany({})
  await prisma.category.deleteMany({})

  // ─── 5 Main Hub Categories & Subcategories ────────────────────
  const categoryStructure = [
    {
      name: 'Baby Clothing',
      slug: 'baby-clothing',
      description: 'Ultra-soft GOTS certified organic cotton outfits, breathable daywear and sleepwear.',
      image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&auto=format&fit=crop',
      sortOrder: 1,
      children: [
        { name: 'Rompers & Onesies', slug: 'rompers-onesies', sortOrder: 1, image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&auto=format&fit=crop' },
        { name: 'Sleepsuits & Pajamas', slug: 'sleepsuits-pajamas', sortOrder: 2, image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop' },
        { name: 'Bodysuits & Tops', slug: 'bodysuits-tops', sortOrder: 3, image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=600&auto=format&fit=crop' },
        { name: 'Two-Piece Sets & Overalls', slug: 'sets-overalls', sortOrder: 4, image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&auto=format&fit=crop' },
      ],
    },
    {
      name: 'Nursery & Sleep',
      slug: 'nursery-sleep',
      description: 'Peaceful sleep solutions, breathable organic swaddles, sleep bags, and crib comfort.',
      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop',
      sortOrder: 2,
      children: [
        { name: 'Muslin Swaddles & Blankets', slug: 'swaddles-blankets', sortOrder: 1, image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop' },
        { name: 'Sleeping Bags & Sacks', slug: 'sleep-sacks', sortOrder: 2, image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&auto=format&fit=crop' },
        { name: 'Pillows & Positioners', slug: 'pillows-positioners', sortOrder: 3, image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=600&auto=format&fit=crop' },
      ],
    },
    {
      name: 'Feeding & Teething',
      slug: 'feeding-teething',
      description: 'Food-grade silicone essentials, anti-colic bottles, and soothing natural teethers.',
      image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=800&auto=format&fit=crop',
      sortOrder: 3,
      children: [
        { name: 'Silicone Bibs & Bowls', slug: 'bibs-bowls', sortOrder: 1, image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=600&auto=format&fit=crop' },
        { name: 'Teethers & Pacifiers', slug: 'teethers-pacifiers', sortOrder: 2, image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=600&auto=format&fit=crop' },
        { name: 'Anti-Colic Bottles & Cups', slug: 'bottles-cups', sortOrder: 3, image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=600&auto=format&fit=crop' },
      ],
    },
    {
      name: 'Bath & Care',
      slug: 'bath-care',
      description: 'Gentle tear-free care, plush hooded bamboo towels, and newborn grooming essentials.',
      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop',
      sortOrder: 4,
      children: [
        { name: 'Hooded Towels & Washcloths', slug: 'hooded-towels', sortOrder: 1, image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop' },
        { name: 'Grooming & Healthcare Kits', slug: 'grooming-kits', sortOrder: 2, image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&auto=format&fit=crop' },
      ],
    },
    {
      name: 'Gifts & Bundles',
      slug: 'gifts-bundles',
      description: 'Curated baby shower gift hampers, newborn arrival kits, and milestone memory boxes.',
      image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=800&auto=format&fit=crop',
      sortOrder: 5,
      children: [
        { name: 'Newborn Starter Hampers', slug: 'newborn-hampers', sortOrder: 1, image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=600&auto=format&fit=crop' },
        { name: 'Milestone & Shower Gift Sets', slug: 'shower-gifts', sortOrder: 2, image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&auto=format&fit=crop' },
      ],
    },
  ]

  const createdCategories: Record<string, any> = {}

  for (const parent of categoryStructure) {
    const pCat = await prisma.category.create({
      data: {
        name: parent.name,
        slug: parent.slug,
        description: parent.description,
        image: parent.image,
        sortOrder: parent.sortOrder,
        showOnNavbar: true,
        showOnHomepage: true,
        isActive: true,
      },
    })
    createdCategories[parent.slug] = pCat

    for (const child of parent.children) {
      const cCat = await prisma.category.create({
        data: {
          name: child.name,
          slug: child.slug,
          description: `${child.name} for babies & toddlers. Safe, comfortable, premium quality.`,
          image: child.image,
          sortOrder: child.sortOrder,
          parentId: pCat.id,
          showOnNavbar: true,
          showOnHomepage: true,
          isActive: true,
        },
      })
      createdCategories[child.slug] = cCat
    }
  }
  console.log('✅ Created 5 main categories with subcategories')

  // ─── Size Guides ──────────────────────────────────────────────
  const sizeGuideColumns = ["Size", "Age", "Weight (kg)", "Length (cm)", "Chest (cm)"]
  const sizeGuideRows = [
    ["0-3M", "0-3 Months", "3 - 5.5", "55 - 61", "40"],
    ["3-6M", "3-6 Months", "5.5 - 7.5", "61 - 67", "43"],
    ["6-12M", "6-12 Months", "7.5 - 9.5", "67 - 76", "46"],
    ["12-18M", "12-18 Months", "9.5 - 11.5", "76 - 83", "49"],
    ["18-24M", "18-24 Months", "11.5 - 13.5", "83 - 90", "52"],
    ["2-3Y", "2-3 Years", "13.5 - 15.5", "90 - 98", "54"],
    ["3-4Y", "3-4 Years", "15.5 - 17.5", "98 - 105", "56"],
  ]

  const clothingCategories = [
    createdCategories['baby-clothing'],
    createdCategories['rompers-onesies'],
    createdCategories['sleepsuits-pajamas'],
    createdCategories['bodysuits-tops'],
    createdCategories['sets-overalls'],
  ]

  for (const cat of clothingCategories) {
    if (cat) {
      await prisma.sizeGuide.create({
        data: {
          categoryId: cat.id,
          unit: "cm",
          columns: JSON.stringify(sizeGuideColumns),
          rows: JSON.stringify(sizeGuideRows),
          notes: "Measurements are in cm and kg. If between sizes, we recommend sizing up for comfortable growth room."
        }
      })
    }
  }
  console.log('✅ Size Guides assigned')

  // ─── Products ─────────────────────────────────────────────────
  const productData = [
    {
      name: 'Organic Cotton Cloud Romper',
      slug: 'organic-cotton-cloud-romper',
      price: 850,
      comparePrice: 1100,
      categorySlug: 'rompers-onesies',
      featured: true,
      tags: 'romper, onesie, organic, cotton, newborn, baby',
      description: 'Ultra-soft 100% GOTS certified organic cotton romper with nickel-free snaps for effortless diaper changes. Hypoallergenic and gentle against sensitive newborn skin.',
      images: [
        { url: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&auto=format&fit=crop', alt: 'Organic Cotton Cloud Romper' },
      ],
      sizes: ['0-3M', '3-6M', '6-12M', '12-18M'],
      colors: [
        { color: 'Soft Pink', hex: '#FFB7B2' },
        { color: 'Powder Blue', hex: '#A2D2FF' },
        { color: 'Buttercup Yellow', hex: '#FEF08A' },
        { color: 'Cloud White', hex: '#FFFFFF' }
      ],
    },
    {
      name: 'Cozy Bunny Zip Sleepsuit',
      slug: 'cozy-bunny-zip-sleepsuit',
      price: 1050,
      comparePrice: 1350,
      categorySlug: 'sleepsuits-pajamas',
      featured: true,
      tags: 'sleepsuit, pajamas, zipper, newborn, infant, baby',
      description: 'Breathable, stretchy two-way zip sleepsuit with foldover scratch mittens and non-slip footies. Designed for sound sleep and easy midnight changes.',
      images: [
        { url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop', alt: 'Cozy Bunny Zip Sleepsuit' },
      ],
      sizes: ['0-3M', '3-6M', '6-12M', '12-18M', '18-24M'],
      colors: [
        { color: 'Sage Mint', hex: '#A7D7C5' },
        { color: 'Lavender Mist', hex: '#E0BBE4' },
        { color: 'Oatmeal Beige', hex: '#E3D5CA' },
        { color: 'Powder Blue', hex: '#A2D2FF' }
      ],
    },
    {
      name: 'Kimono Wrap Bodysuit (Pack of 3)',
      slug: 'kimono-wrap-bodysuit-pack-3',
      price: 1250,
      comparePrice: 1600,
      categorySlug: 'bodysuits-tops',
      featured: true,
      tags: 'bodysuit, kimono, pack, newborn, organic cotton',
      description: 'Side-snap kimono bodysuits that do not need to be pulled over delicate newborn heads. Made from breathable rib-knit cotton.',
      images: [
        { url: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=800&auto=format&fit=crop', alt: 'Kimono Wrap Bodysuit' },
      ],
      sizes: ['0-3M', '3-6M', '6-12M'],
      colors: [
        { color: 'Cloud White', hex: '#FFFFFF' },
        { color: 'Pastel Yellow', hex: '#FEF08A' },
        { color: 'Oatmeal Beige', hex: '#E3D5CA' }
      ],
    },
    {
      name: 'Little Explorer Cotton Dungaree Set',
      slug: 'little-explorer-cotton-dungaree-set',
      price: 1450,
      comparePrice: 1800,
      categorySlug: 'sets-overalls',
      featured: true,
      tags: 'dungaree, overall, toddler, set, outfit',
      description: 'Adorable toddler overalls with adjustable shoulder straps and inner leg snap buttons, paired with a soft striped cotton inner t-shirt.',
      images: [
        { url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&auto=format&fit=crop', alt: 'Little Explorer Cotton Dungaree Set' },
      ],
      sizes: ['6-12M', '12-18M', '18-24M', '2-3Y', '3-4Y'],
      colors: [
        { color: 'Denim Blue', hex: '#1E3A8A' },
        { color: 'Oatmeal Beige', hex: '#E3D5CA' },
        { color: 'Sage Mint', hex: '#A7D7C5' }
      ],
    },
    {
      name: 'Pure Bamboo Muslin Swaddle (2-Pack)',
      slug: 'pure-bamboo-muslin-swaddle-2-pack',
      price: 1150,
      comparePrice: 1450,
      categorySlug: 'swaddles-blankets',
      featured: true,
      tags: 'swaddle, blanket, bamboo, muslin, newborn, nursery',
      description: 'Silky soft 70% bamboo and 30% organic cotton swaddles. Generously sized at 120x120cm for secure swaddling, nursing cover, or stroller shade.',
      images: [
        { url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop', alt: 'Pure Bamboo Muslin Swaddle' },
      ],
      sizes: ['One Size (120x120cm)'],
      colors: [
        { color: 'Bunny & Stars Print', hex: '#E0E7FF' },
        { color: 'Soft Peach', hex: '#FED7AA' },
        { color: 'Sage Botanical', hex: '#D1FAE5' }
      ],
    },
    {
      name: 'All-Seasons Organic Baby Sleep Sack',
      slug: 'all-seasons-organic-baby-sleep-sack',
      price: 1350,
      comparePrice: 1750,
      categorySlug: 'sleep-sacks',
      featured: false,
      tags: 'sleep sack, sleeping bag, tog, nursery, safe sleep',
      description: '1.0 TOG breathable wearable blanket to replace loose blankets in the crib. Promotes safe sleep with dual-direction zipper.',
      images: [
        { url: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&auto=format&fit=crop', alt: 'All-Seasons Organic Baby Sleep Sack' },
      ],
      sizes: ['0-6M', '6-18M', '18-36M'],
      colors: [
        { color: 'Cloud Grey', hex: '#9CA3AF' },
        { color: 'Powder Blue', hex: '#A2D2FF' },
        { color: 'Rose Pink', hex: '#FFB7B2' }
      ],
    },
    {
      name: 'Food-Grade Silicone Suction Bowl & Spoon',
      slug: 'food-grade-silicone-suction-bowl-spoon',
      price: 680,
      comparePrice: 850,
      categorySlug: 'bibs-bowls',
      featured: true,
      tags: 'silicone, suction bowl, spoon, weaning, feeding, bpa-free',
      description: '100% BPA-free food grade silicone suction bowl that stays firmly on high chair trays. Includes ergonomic soft silicone feeding spoon.',
      images: [
        { url: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=800&auto=format&fit=crop', alt: 'Silicone Suction Bowl & Spoon' },
      ],
      sizes: ['Universal'],
      colors: [
        { color: 'Dusty Rose', hex: '#FDA4AF' },
        { color: 'Sage Green', hex: '#A7D7C5' },
        { color: 'Warm Mustard', hex: '#FDE047' }
      ],
    },
    {
      name: 'Natural Beechwood & Silicone Teether Ring',
      slug: 'natural-beechwood-silicone-teether-ring',
      price: 450,
      comparePrice: 600,
      categorySlug: 'teethers-pacifiers',
      featured: false,
      tags: 'teether, wooden teether, bpa-free, teething, sensory',
      description: 'Soothes tender gums with antibacterial organic beechwood and textured food-grade silicone beads. Easy for tiny hands to grasp.',
      images: [
        { url: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=800&auto=format&fit=crop', alt: 'Natural Beechwood Teether' },
      ],
      sizes: ['One Size'],
      colors: [
        { color: 'Bunny Beige', hex: '#E3D5CA' },
        { color: 'Pastel Blue', hex: '#A2D2FF' },
        { color: 'Blush Pink', hex: '#FFB7B2' }
      ],
    },
    {
      name: 'Plush Bunny Hooded Bamboo Towel',
      slug: 'plush-bunny-hooded-bamboo-towel',
      price: 950,
      comparePrice: 1250,
      categorySlug: 'hooded-towels',
      featured: true,
      tags: 'hooded towel, bath, bamboo towel, ultra soft, baby bath',
      description: '500 GSM thick ultra-absorbent bamboo terry towel with adorable bunny ears hood. Keeps your baby warm and snuggly straight out of the bath.',
      images: [
        { url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop', alt: 'Plush Bunny Hooded Towel' },
      ],
      sizes: ['90x90cm (0-4 Years)'],
      colors: [
        { color: 'Pure White', hex: '#FFFFFF' },
        { color: 'Soft Cream', hex: '#FFF9F0' },
        { color: 'Baby Blue', hex: '#A2D2FF' }
      ],
    },
    {
      name: 'Deluxe Newborn Welcome Set',
      slug: 'deluxe-newborn-welcome-set',
      price: 1850,
      comparePrice: 2400,
      categorySlug: 'newborn-hampers',
      featured: true,
      tags: 'newborn, gift set, hamper, baby shower, welcome kit',
      description: 'The ultimate 5-piece newborn bundle: Kimono romper, matching knotted beanie hat, soft scratch mittens, bib, and swaddle blanket in a luxury gift-ready box.',
      images: [
        { url: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=800&auto=format&fit=crop', alt: 'Deluxe Newborn Welcome Set' },
      ],
      sizes: ['0-3M', '3-6M'],
      colors: [
        { color: 'Soft Pink', hex: '#FFB7B2' },
        { color: 'Powder Blue', hex: '#A2D2FF' },
        { color: 'Buttercup Yellow', hex: '#FEF08A' },
        { color: 'Oatmeal Beige', hex: '#E3D5CA' }
      ],
    },
  ]

  for (const pd of productData) {
    const category = createdCategories[pd.categorySlug]
    if (!category) {
      console.warn(`Category not found for slug: ${pd.categorySlug}`)
      continue
    }

    const product = await prisma.product.create({
      data: {
        name: pd.name,
        slug: pd.slug,
        description: pd.description,
        price: pd.price,
        comparePrice: pd.comparePrice,
        categoryId: category.id,
        tags: pd.tags,
        isActive: true,
        isFeatured: pd.featured,
        images: {
          create: pd.images.map((img, i) => ({ ...img, sortOrder: i })),
        },
        variants: {
          create: pd.sizes.flatMap(size =>
            pd.colors.map(c => ({
              size,
              color: c.color,
              colorHex: c.hex,
              sku: `${pd.slug}-${size}-${c.color}`.toUpperCase().replace(/[^A-Z0-9]/g, '-'),
              stock: Math.floor(Math.random() * 20) + 10,
              price: null,
            }))
          ),
        },
      },
    })
    console.log('✅ Created Product:', product.name)
  }

  // ─── Store Settings ───────────────────────────────────────────
  const settings = [
    { key: 'store_name', value: 'Mini Bunny' },
    { key: 'currency', value: 'BDT' },
    { key: 'gift_wrap_enabled', value: 'true' },
    { key: 'gift_wrap_charge', value: '150' },
    { key: 'points_per_taka', value: '10' },
    { key: 'points_redemption_rate', value: '10' },
    { key: 'free_shipping_above', value: '2000' },
    { key: 'shipping_charge', value: '70' },
    { key: 'support_email', value: 'support@minibunny.com' },
    { key: 'store_tagline', value: 'Made with Love for Little Ones' },
  ]

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    })
  }
  console.log('✅ Settings saved')

  // ─── Bundles ──────────────────────────────────────────────────
  const bundleList = [
    {
      name: 'Newborn Starter Kit',
      slug: 'newborn-starter-kit',
      description: 'Essential kit for newborn arrival: Ergonomic pillow, anti-colic bottle, organic swaddle blanket, and nursery organizer.',
      price: 2450,
      comparePrice: 3200,
      image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&auto=format&fit=crop',
    },
    {
      name: 'Feeding Essentials Bundle',
      slug: 'feeding-bundle',
      description: 'Stage 2 weaning essentials: Silicone catch-all bib, bamboo suction bowl & spoon, training sippy cup, and 3x muslin burp cloths.',
      price: 1850,
      comparePrice: 2400,
      image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=800&auto=format&fit=crop',
    },
    {
      name: 'Gentle Baby Care Bundle',
      slug: 'baby-care-bundle',
      description: 'Daily gentle grooming: Pack of 5 organic washcloths, goat hair wooden brush, natural teether, and hooded bamboo towel.',
      price: 1650,
      comparePrice: 2150,
      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop',
    },
  ]

  for (const b of bundleList) {
    await prisma.bundle.upsert({
      where: { slug: b.slug },
      update: {
        name: b.name,
        description: b.description,
        price: b.price,
        comparePrice: b.comparePrice,
        image: b.image,
        isActive: true,
      },
      create: {
        name: b.name,
        slug: b.slug,
        description: b.description,
        price: b.price,
        comparePrice: b.comparePrice,
        image: b.image,
        isActive: true,
      },
    })
  }
  console.log('✅ Baby Bundles saved')

  // ─── Pages ────────────────────────────────────────────────────
  const pages = [
    {
      slug: 'faq',
      title: 'FAQ & Shipping',
      content: '<h3>Baby Care & Shipping Policy</h3><p>We offer <strong>Free shipping across Bangladesh on orders above ৳2,000</strong>. All baby garments are packaged in sterile, hygienic sealed bags.</p><h3>Washing Instructions</h3><p>Machine wash cold on gentle cycle with mild baby-friendly detergent. Tumble dry low or air dry in shade.</p>',
    },
    {
      slug: 'returns',
      title: 'Returns & Size Exchanges',
      content: '<h3>Hassle-Free Size Exchange</h3><p>We understand babies grow fast! We offer a <strong>7-day size exchange guarantee</strong> for unwashed, unworn items with tags attached.</p>',
    },
  ]

  for (const p of pages) {
    await prisma.page.upsert({
      where: { slug: p.slug },
      update: { title: p.title, content: p.content },
      create: { ...p, isPublished: true },
    })
  }
  console.log('✅ Pages saved')

  console.log('\n🎉 Mini Bunny Seed complete!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
