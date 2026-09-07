import { and, eq } from 'drizzle-orm'
import { db } from './client.js'
import { users, properties, propertyImages, commissions, COMMISSION_FLAT_RATE } from './schema.js'
import { hashPassword } from '../lib/password.js'

interface SeedProperty {
  title: string
  description: string
  address: string
  city: string
  state: string
  zip_code: string
  price: number
  bedrooms: number
  bathrooms: number
  square_feet: number
  is_vendor_terms: boolean
  is_deceased_estate: boolean
  images: string[]
}

const propertiesVendor1: SeedProperty[] = [
  {
    title: 'Charming Bungalow in Historic District',
    description: 'Beautifully restored 1920s bungalow featuring original hardwood floors, vintage fixtures, and modern amenities. This 2-bedroom gem offers a perfect blend of historic charm and contemporary comfort. Updated kitchen with stainless steel appliances, cozy fireplace in living room, and a lovely backyard garden.',
    address: '342 Oak Street', city: 'Austin', state: 'TX', zip_code: '78701',
    price: 165000, bedrooms: 2, bathrooms: 1.5, square_feet: 1250,
    is_vendor_terms: false, is_deceased_estate: false,
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3',
    ],
  },
  {
    title: 'Modern Downtown Loft',
    description: "Sleek and stylish loft in the heart of downtown. Open floor plan with exposed brick walls, high ceilings, and floor-to-ceiling windows offering stunning city views. Features a chef's kitchen with granite countertops, walk-in closet, and in-unit washer/dryer. Perfect for urban professionals.",
    address: '789 Main Street, Unit 405', city: 'Portland', state: 'OR', zip_code: '97204',
    price: 189500, bedrooms: 1, bathrooms: 1.0, square_feet: 950,
    is_vendor_terms: false, is_deceased_estate: false,
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0',
    ],
  },
  {
    title: 'Cozy Cottage with Garden',
    description: 'Adorable cottage nestled on a quiet street with a white picket fence and mature landscaping. This 3-bedroom home features a country-style kitchen, built-in bookshelves, and a sunroom perfect for morning coffee. Large backyard with fruit trees and vegetable garden. Move-in ready!',
    address: '156 Maple Lane', city: 'Nashville', state: 'TN', zip_code: '37201',
    price: 175000, bedrooms: 3, bathrooms: 2.0, square_feet: 1400,
    is_vendor_terms: true, is_deceased_estate: false,
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d',
      'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68',
    ],
  },
  {
    title: 'Renovated Ranch Home',
    description: 'Completely updated 1960s ranch home with new roof, HVAC, and windows. Open concept living and dining area with vaulted ceilings. Modern kitchen with quartz countertops and subway tile backsplash. Three spacious bedrooms and two full baths. Large corner lot with attached garage.',
    address: '2234 Cedar Drive', city: 'Indianapolis', state: 'IN', zip_code: '46201',
    price: 158000, bedrooms: 3, bathrooms: 2.0, square_feet: 1550,
    is_vendor_terms: false, is_deceased_estate: true,
    images: [
      'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099',
      'https://images.unsplash.com/photo-1600566753151-384129cf4e3e',
      'https://images.unsplash.com/photo-1600563438938-a9a27216b4f5',
    ],
  },
  {
    title: 'Townhouse in Family-Friendly Community',
    description: 'Spacious 3-bedroom townhouse in highly sought-after neighborhood with excellent schools. End unit with extra windows providing abundant natural light. Updated bathrooms, new carpet throughout, and a finished basement ideal for playroom or home office. Community amenities include pool and playground.',
    address: '567 Willow Court', city: 'Raleigh', state: 'NC', zip_code: '27601',
    price: 195000, bedrooms: 3, bathrooms: 2.5, square_feet: 1650,
    is_vendor_terms: false, is_deceased_estate: false,
    images: [
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea',
      'https://images.unsplash.com/photo-1600563438578-d5ab5fc4c81e',
    ],
  },
  {
    title: 'Starter Home with Potential',
    description: 'Perfect opportunity for first-time buyers or investors! This 2-bedroom home needs some TLC but has great bones. Features include hardwood floors under carpet, spacious rooms, and a large fenced yard. Recent updates to electrical and plumbing. Priced to sell quickly!',
    address: '890 Pine Street', city: 'Memphis', state: 'TN', zip_code: '38103',
    price: 125000, bedrooms: 2, bathrooms: 1.0, square_feet: 1100,
    is_vendor_terms: true, is_deceased_estate: false,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d',
      'https://images.unsplash.com/photo-1600566753229-b3c2f882ed96',
    ],
  },
]

const propertiesVendor2: SeedProperty[] = [
  {
    title: 'Beach-Style Bungalow',
    description: 'Charming coastal-inspired home just minutes from the beach! Light and airy with white-washed walls, shiplap accents, and tile floors. Open kitchen with breakfast bar, master suite with walk-in shower, and a screened porch perfect for enjoying ocean breezes. Low maintenance landscaping.',
    address: '123 Oceanview Drive', city: 'Wilmington', state: 'NC', zip_code: '28401',
    price: 198000, bedrooms: 2, bathrooms: 2.0, square_feet: 1200,
    is_vendor_terms: false, is_deceased_estate: false,
    images: [
      'https://images.unsplash.com/photo-1600585152915-d208bec867a1',
      'https://images.unsplash.com/photo-1600566752229-250ed79c31b1',
      'https://images.unsplash.com/photo-1600573472592-401b489a3cdc',
    ],
  },
  {
    title: 'Historic Victorian with Character',
    description: 'Step back in time in this lovingly maintained Victorian home. Original details include stained glass windows, pocket doors, and ornate crown molding. Four bedrooms, formal dining room, and wrap-around porch. Updated mechanicals while preserving historic charm. A rare find!',
    address: '456 Heritage Boulevard', city: 'Louisville', state: 'KY', zip_code: '40201',
    price: 185000, bedrooms: 4, bathrooms: 2.0, square_feet: 2100,
    is_vendor_terms: true, is_deceased_estate: true,
    images: [
      'https://images.unsplash.com/photo-1600585154084-4e5fe7c39198',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
      'https://images.unsplash.com/photo-1600566753151-384129cf4e3e',
    ],
  },
  {
    title: 'Split-Level Home with Mountain Views',
    description: 'Enjoy panoramic mountain views from this updated split-level home. Main level features living room with stone fireplace, eat-in kitchen, and deck access. Lower level includes family room, two bedrooms, and walkout to patio. Newer roof and HVAC. Two-car garage.',
    address: '789 Mountain Ridge Road', city: 'Asheville', state: 'NC', zip_code: '28801',
    price: 192000, bedrooms: 3, bathrooms: 2.0, square_feet: 1750,
    is_vendor_terms: false, is_deceased_estate: false,
    images: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3',
    ],
  },
  {
    title: 'Affordable Condo in Prime Location',
    description: 'Perfect starter condo in sought-after building! One bedroom with efficient layout, updated kitchen with stainless appliances, and modern bathroom. Building amenities include fitness center, community room, and secure parking. Low HOA fees. Close to shopping, dining, and public transit.',
    address: '234 Downtown Plaza, Unit 302', city: 'Columbus', state: 'OH', zip_code: '43215',
    price: 142000, bedrooms: 1, bathrooms: 1.0, square_feet: 750,
    is_vendor_terms: false, is_deceased_estate: false,
    images: [
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    ],
  },
  {
    title: 'Suburban Family Home',
    description: 'Move-in ready 4-bedroom home in quiet suburban neighborhood. Spacious eat-in kitchen, formal living and dining rooms, family room with fireplace, and master suite with soaking tub. Fenced backyard with deck perfect for entertaining. Two-car garage and plenty of storage.',
    address: '678 Suburban Lane', city: 'Oklahoma City', state: 'OK', zip_code: '73102',
    price: 179000, bedrooms: 4, bathrooms: 2.5, square_feet: 2000,
    is_vendor_terms: true, is_deceased_estate: false,
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d',
      'https://images.unsplash.com/photo-1600566753376-c91b1e39b1a1',
      'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87',
    ],
  },
  {
    title: 'Duplex Investment Opportunity',
    description: 'Excellent investment property! Side-by-side duplex with two 2-bedroom units, each with separate utilities. Long-term tenants in place. Recent updates include new roofs, updated electrical, and fresh paint. Great cash flow opportunity. Priced below market value.',
    address: '901 Investment Avenue', city: 'Kansas City', state: 'MO', zip_code: '64101',
    price: 168000, bedrooms: 4, bathrooms: 2.0, square_feet: 2200,
    is_vendor_terms: true, is_deceased_estate: false,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
      'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d',
    ],
  },
]

async function getOrCreateVendor(opts: {
  username: string; email: string; companyName: string; phone: string; firstName: string; lastName: string
}) {
  const [existing] = await db.select().from(users).where(eq(users.username, opts.username)).limit(1)
  if (existing) {
    console.log(`Already exists: vendor ${opts.username}`)
    return existing
  }
  const [created] = await db.insert(users).values({
    username: opts.username,
    email: opts.email,
    passwordHash: await hashPassword('password123'),
    isVendor: true,
    companyName: opts.companyName,
    phone: opts.phone,
    firstName: opts.firstName,
    lastName: opts.lastName,
  }).returning()
  console.log(`Created vendor: ${created.username}`)
  return created
}

async function seedProperties(vendorId: number, list: SeedProperty[]) {
  for (const p of list) {
    const [existing] = await db.select({ id: properties.id }).from(properties)
      .where(and(eq(properties.vendorId, vendorId), eq(properties.title, p.title))).limit(1)
    if (existing) {
      console.log(`Already exists: ${p.title}`)
      continue
    }

    const [created] = await db.insert(properties).values({
      vendorId,
      title: p.title,
      description: p.description,
      address: p.address,
      city: p.city,
      state: p.state,
      zipCode: p.zip_code,
      price: p.price,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      squareFeet: p.square_feet,
      isVendorTerms: p.is_vendor_terms,
      isDeceasedEstate: p.is_deceased_estate,
    }).returning()

    await db.insert(commissions).values({ propertyId: created.id, amount: COMMISSION_FLAT_RATE })

    for (const [idx, url] of p.images.entries()) {
      await db.insert(propertyImages).values({
        propertyId: created.id,
        image: `${url}?w=800&h=600&fit=crop`,
        isPrimary: idx === 0,
      })
    }
    console.log(`Created: ${p.title}`)
  }
}

async function main() {
  console.log('Creating vendors...')
  const vendor1 = await getOrCreateVendor({
    username: 'vendor1', email: 'vendor1@realest8.com', companyName: 'Sunshine Properties LLC',
    phone: '555-0101', firstName: 'Sarah', lastName: 'Johnson',
  })
  const vendor2 = await getOrCreateVendor({
    username: 'vendor2', email: 'vendor2@realest8.com', companyName: 'Coastal Realty Group',
    phone: '555-0102', firstName: 'Michael', lastName: 'Chen',
  })

  console.log('Creating properties for vendor 1...')
  await seedProperties(vendor1.id, propertiesVendor1)

  console.log('Creating properties for vendor 2...')
  await seedProperties(vendor2.id, propertiesVendor2)

  console.log('\nDatabase population complete!')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
