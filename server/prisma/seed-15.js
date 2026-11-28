const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  {
    slug: 'emergency-fuel',
    name: 'Emergency Highway Fuel Delivery',
    nameHi: 'आपातकालीन पेट्रोल/डीजल डिलीवरी',
    description: '2-5 Litres emergency reach-to-pump fuel runner with safety check',
    icon: 'Fuel',
    engineType: 'ENGINE_A_DISPATCH',
    basePrice: 150.0,
    pricingUnit: 'runner_fee_plus_receipt',
    metadata: JSON.stringify({ fuelTypes: ['PETROL', 'DIESEL'], minLiters: 2, maxLiters: 5, dayFee: 150, nightFee: 250 }),
    sortOrder: 1
  },
  {
    slug: 'roadside-puncture',
    name: '24/7 Roadside Assistance & Tyre Puncture',
    nameHi: '24/7 रोडसाइड पंक्चर व टोइंग',
    description: 'Instant mechanic dispatch for puncture, jumpstart & breakdown',
    icon: 'Wrench',
    engineType: 'ENGINE_A_DISPATCH',
    basePrice: 200.0,
    pricingUnit: 'per_visit',
    metadata: JSON.stringify({ vehicleTypes: ['2-Wheeler', 'Hatchback/Sedan', 'SUV', 'Commercial'] }),
    sortOrder: 2
  },
  {
    slug: 'emergency-pharmacy',
    name: '24/7 Emergency Pharmacy & Night Chemist',
    nameHi: '24/7 आपातकालीन दवाइयाँ',
    description: 'Prescription medicines delivered in 30 mins from open chemists',
    icon: 'Pill',
    engineType: 'ENGINE_A_DISPATCH',
    basePrice: 60.0,
    pricingUnit: 'delivery_fee_plus_bill',
    metadata: JSON.stringify({ isNightActive: true }),
    sortOrder: 3
  },
  {
    slug: 'local-genie',
    name: 'Local Genie (Pickup & Drop Courier)',
    nameHi: 'लोकल पार्सल पिकअप व ड्राप',
    description: 'Point-to-point courier for documents, keys, chargers & tiffins',
    icon: 'PackageCheck',
    engineType: 'ENGINE_A_DISPATCH',
    basePrice: 50.0,
    pricingUnit: 'per_km',
    metadata: JSON.stringify({ maxWeightKg: 15, perKmCharge: 12 }),
    sortOrder: 4
  },
  {
    slug: 'goods-auto-booking',
    name: 'Mini-Truck & Goods Auto (Tata Ace)',
    nameHi: 'छोटा हाथी व लोडिंग ऑटो',
    description: 'Instant booking for Tata Ace, Ape Auto for house-shifting & cargo',
    icon: 'Truck',
    engineType: 'ENGINE_A_DISPATCH',
    basePrice: 350.0,
    pricingUnit: 'per_trip',
    metadata: JSON.stringify({ vehicleTypes: ['Ape Auto (500kg)', 'Tata Ace (750kg)', 'Pickup 8ft (1 Ton)'] }),
    sortOrder: 5
  },
  {
    slug: 'acting-drivers',
    name: 'Acting Drivers on Call',
    nameHi: 'ड्राइवर ऑन कॉल (प्रति घंटा)',
    description: 'Professional drivers for city errands, outstation trips & night returns',
    icon: 'UserCheck',
    engineType: 'ENGINE_A_DISPATCH',
    basePrice: 150.0,
    pricingUnit: 'hourly',
    metadata: JSON.stringify({ minHours: 2, overtimeRate: 80 }),
    sortOrder: 6
  },
  {
    slug: 'electrician-services',
    name: '24/7 Electrician & Power Breakdown',
    nameHi: '24/7 इलेक्ट्रीशियन व बिजली मरम्मत',
    description: 'Short circuit emergency, MCB tripping, fan/wiring replacement, switchboard & outage fixing',
    icon: 'Zap',
    engineType: 'ENGINE_A_DISPATCH',
    basePrice: 149.0,
    pricingUnit: 'per_visit',
    metadata: JSON.stringify({ emergencyArrivalMins: 20 }),
    sortOrder: 7
  },
  {
    slug: 'plumbing-services',
    name: 'Emergency Plumber & Leak Repair',
    nameHi: 'आपातकालीन प्लंबर व पाइप लीकेज',
    description: 'Burst pipe repair, leaking taps, water pump motor fixing, and bathroom drain unblocking',
    icon: 'Droplets',
    engineType: 'ENGINE_A_DISPATCH',
    basePrice: 149.0,
    pricingUnit: 'per_visit',
    metadata: JSON.stringify({ emergencyArrivalMins: 25 }),
    sortOrder: 8
  },
  {
    slug: 'ac-appliance-repair',
    name: 'AC Service, Gas Refill & Appliances',
    nameHi: 'एसी सर्विसिंग व घरेलू उपकरण',
    description: 'Split/Window AC cooling repair, foam jet servicing, gas refill & fridge/washing machine repairs',
    icon: 'Wind',
    engineType: 'ENGINE_B_QUOTE',
    basePrice: 0.0,
    pricingUnit: 'quote_based',
    metadata: JSON.stringify({ appliances: ['AC', 'Refrigerator', 'Washing Machine', 'Microwave'] }),
    sortOrder: 9
  },
  {
    slug: 'painting-services',
    name: 'House Paint & Wall Textures',
    nameHi: 'घर की पुताई व डिस्टेंपर',
    description: 'Compare itemized quotes for 1BHK/2BHK/Villa painting from top contractors',
    icon: 'Paintbrush',
    engineType: 'ENGINE_B_QUOTE',
    basePrice: 0.0,
    pricingUnit: 'quote_based',
    metadata: JSON.stringify({ fields: ['sqftArea', 'paintBrand', 'surfaceType'] }),
    sortOrder: 10
  },
  {
    slug: 'furniture-interiors',
    name: 'Custom Carpentry & Modular Interiors',
    nameHi: 'कस्टम फर्नीचर व बढ़ई कार्य',
    description: 'Modular kitchen, wardrobes, wooden tables crafted by local carpenters',
    icon: 'Armchair',
    engineType: 'ENGINE_B_QUOTE',
    basePrice: 0.0,
    pricingUnit: 'quote_based',
    metadata: JSON.stringify({ fields: ['woodType', 'dimensions', 'budgetRange'] }),
    sortOrder: 11
  },
  {
    slug: 'vehicle-servicing',
    name: 'Car Denting, Painting & Bodywork',
    nameHi: 'गाड़ी डेंटिंग व पेंटिंग मरम्मत',
    description: 'Upload damage photos to get transparent repair estimates from body shops',
    icon: 'Car',
    engineType: 'ENGINE_B_QUOTE',
    basePrice: 0.0,
    pricingUnit: 'quote_based',
    metadata: JSON.stringify({ fields: ['carModel', 'year', 'panelDamaged'] }),
    sortOrder: 12
  },
  {
    slug: 'cleaning-pest-control',
    name: 'Deep House Cleaning & Pest Control',
    nameHi: 'घर की डीप क्लीनिंग व पेस्ट कंट्रोल',
    description: 'Bathroom deep disinfection, kitchen degreasing, sofa shampooing & cockroach/termite pest control',
    icon: 'Sparkles',
    engineType: 'ENGINE_B_QUOTE',
    basePrice: 0.0,
    pricingUnit: 'quote_based',
    metadata: JSON.stringify({ serviceTypes: ['Full Home Deep Cleaning', 'Bathroom Deep Clean', 'Cockroach Pest Control', 'Sofa Shampoo'] }),
    sortOrder: 13
  },
  {
    slug: 'kirana-grocery',
    name: 'Local Kirana & Supermarket Delivery',
    nameHi: 'नजदीकी किराना दुकान',
    description: 'Daily provisions, spices, oils & pulses delivered within 45 mins',
    icon: 'ShoppingBag',
    engineType: 'ENGINE_C_COMMERCE',
    basePrice: 30.0,
    pricingUnit: 'order_catalog',
    metadata: JSON.stringify({ minOrderAmount: 200, freeDeliveryAbove: 500 }),
    sortOrder: 14
  },
  {
    slug: 'daily-subscriptions',
    name: 'Daily Water (20L Can) & Milk Subscriptions',
    nameHi: 'दैनिक दूध व 20L पानी की कैन',
    description: 'Automated morning deliveries of fresh milk packets and 20L water jars',
    icon: 'CalendarSync',
    engineType: 'ENGINE_C_SUBSCRIPTION',
    basePrice: 0.0,
    pricingUnit: 'monthly_or_daily',
    metadata: JSON.stringify({ timeSlots: ['06:00 AM - 08:00 AM', '06:00 PM - 08:00 PM'] }),
    sortOrder: 15
  }
];

async function run() {
  console.log('Upserting all 15 services into ShortEdge database...');
  for (const cat of categories) {
    await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat
    });
  }
  await prisma.serviceCategory.upsert({
    where: { slug: 'genie-pickup-drop' },
    update: { ...categories[3], slug: 'genie-pickup-drop' },
    create: { ...categories[3], slug: 'genie-pickup-drop' }
  });

  const count = await prisma.serviceCategory.count();
  console.log('✅ Success! Total Categories in Database now:', count);
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
