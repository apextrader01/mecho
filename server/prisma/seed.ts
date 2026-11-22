import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import {
  Role,
  EngineType,
  KycStatus,
  DispatchStatus,
  RfqStatus,
  QuoteStatus,
  SubFrequency,
  SubStatus
} from '../src/types';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Hyperlocal Indian Super-App Database...');

  // 1. Clean existing records in correct relation order
  await prisma.review.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.subscriptionDelivery.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.commerceOrder.deleteMany();
  await prisma.product.deleteMany();
  await prisma.vendorQuote.deleteMany();
  await prisma.quotationRequest.deleteMany();
  await prisma.dispatchBooking.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // 2. Core Users
  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      phone: '+919999900000',
      email: 'admin@shortedge.in',
      passwordHash,
      role: Role.ADMIN,
      preferredLang: 'en'
    }
  });

  const customerRahul = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      phone: '+919876543210',
      email: 'rahul.sharma@gmail.com',
      passwordHash,
      role: Role.USER,
      preferredLang: 'hi'
    }
  });

  const customerPriya = await prisma.user.create({
    data: {
      name: 'Priya Iyer',
      phone: '+919888877777',
      email: 'priya.iyer@gmail.com',
      passwordHash,
      role: Role.USER,
      preferredLang: 'en'
    }
  });

  // 3. Service Categories across the 3 Unified Core Engines
  const catFuel = await prisma.serviceCategory.create({
    data: {
      slug: 'emergency-fuel',
      name: 'Emergency Highway Fuel Assist',
      nameHi: 'आपातकालीन पेट्रोल/डीजल डिलीवरी',
      description: '2-5 Litres emergency reach-to-pump fuel runner with safety check',
      icon: 'Fuel',
      engineType: EngineType.ENGINE_A_DISPATCH,
      basePrice: 150.0,
      pricingUnit: 'runner_fee_plus_receipt',
      metadata: JSON.stringify({
        fuelTypes: ['PETROL', 'DIESEL'],
        minLiters: 2,
        maxLiters: 5,
        requiresIdCheck: true,
        requiresReceiptUpload: true,
        dayFee: 150,
        nightFee: 250
      }),
      sortOrder: 1
    }
  });

  const catRoadside = await prisma.serviceCategory.create({
    data: {
      slug: 'roadside-puncture',
      name: '24/7 Roadside & Tyre Puncture',
      nameHi: '24/7 रोडसाइड पंक्चर व टोइंग',
      description: 'Instant mechanic dispatch for puncture, jumpstart & breakdown',
      icon: 'Wrench',
      engineType: EngineType.ENGINE_A_DISPATCH,
      basePrice: 200.0,
      pricingUnit: 'per_visit',
      metadata: JSON.stringify({
        vehicleTypes: ['2-Wheeler', 'Hatchback/Sedan', 'SUV', 'Commercial'],
        services: ['Puncture Repair', 'Battery Jumpstart', 'Emergency Towing', 'Key Lockout']
      }),
      sortOrder: 2
    }
  });

  const catPharmacy = await prisma.serviceCategory.create({
    data: {
      slug: 'emergency-pharmacy',
      name: '24/7 Emergency Pharmacy & Runner',
      nameHi: '24/7 आपातकालीन दवाइयाँ',
      description: 'Prescription medicines delivered in 30 mins from open chemists',
      icon: 'Pill',
      engineType: EngineType.ENGINE_A_DISPATCH,
      basePrice: 60.0,
      pricingUnit: 'delivery_fee_plus_bill',
      metadata: JSON.stringify({
        requiresPrescriptionUpload: true,
        isNightActive: true
      }),
      sortOrder: 3
    }
  });

  const catGenie = await prisma.serviceCategory.create({
    data: {
      slug: 'genie-pickup-drop',
      name: 'Local Genie (Pickup & Drop)',
      nameHi: 'लोकल पार्सल पिकअप व ड्राप',
      description: 'Point-to-point courier for documents, keys, chargers & tiffins',
      icon: 'PackageCheck',
      engineType: EngineType.ENGINE_A_DISPATCH,
      basePrice: 50.0,
      pricingUnit: 'per_km',
      metadata: JSON.stringify({ maxWeightKg: 15, perKmCharge: 12 }),
      sortOrder: 4
    }
  });

  const catGoods = await prisma.serviceCategory.create({
    data: {
      slug: 'goods-auto-booking',
      name: 'Mini-Truck & Goods Auto',
      nameHi: 'छोटा हाथी व लोडिंग ऑटो',
      description: 'Instant booking for Tata Ace, Ape Auto for house-shifting & cargo',
      icon: 'Truck',
      engineType: EngineType.ENGINE_A_DISPATCH,
      basePrice: 350.0,
      pricingUnit: 'per_trip',
      metadata: JSON.stringify({ vehicleTypes: ['Ape Auto (500kg)', 'Tata Ace (750kg)', 'Pickup 8ft (1 Ton)'] }),
      sortOrder: 5
    }
  });

  const catPaint = await prisma.serviceCategory.create({
    data: {
      slug: 'painting-services',
      name: 'House Paint & Wall Textures',
      nameHi: 'घर की पुताई व डिस्टेंपर',
      description: 'Compare itemized quotes for 1BHK/2BHK/Villa painting from top contractors',
      icon: 'Paintbrush',
      engineType: EngineType.ENGINE_B_QUOTE,
      basePrice: 0.0,
      pricingUnit: 'quote_based',
      metadata: JSON.stringify({
        fields: ['sqftArea', 'paintBrand', 'surfaceType', 'roomsCount']
      }),
      sortOrder: 6
    }
  });

  const catFurniture = await prisma.serviceCategory.create({
    data: {
      slug: 'furniture-interiors',
      name: 'Custom Carpentry & Interiors',
      nameHi: 'कस्टम फर्नीचर व बढ़ई कार्य',
      description: 'Modular kitchen, wardrobes, wooden tables crafted by local carpenters',
      icon: 'Armchair',
      engineType: EngineType.ENGINE_B_QUOTE,
      basePrice: 0.0,
      pricingUnit: 'quote_based',
      metadata: JSON.stringify({
        fields: ['woodType', 'dimensions', 'referencePhoto', 'budgetRange']
      }),
      sortOrder: 7
    }
  });

  const catVehicle = await prisma.serviceCategory.create({
    data: {
      slug: 'vehicle-servicing',
      name: 'Car Denting, Painting & Bodywork',
      nameHi: 'गाड़ी डेंटिंग व पेंटिंग मरम्मत',
      description: 'Upload damage photos to get transparent repair estimates from body shops',
      icon: 'Car',
      engineType: EngineType.ENGINE_B_QUOTE,
      basePrice: 0.0,
      pricingUnit: 'quote_based',
      metadata: JSON.stringify({
        fields: ['carModel', 'year', 'panelDamaged', 'insuranceClaim']
      }),
      sortOrder: 8
    }
  });

  const catKirana = await prisma.serviceCategory.create({
    data: {
      slug: 'kirana-grocery',
      name: 'Local Kirana & Supermarket',
      nameHi: 'नजदीकी किराना दुकान',
      description: 'Daily provisions, spices, oils & pulses delivered within 45 mins',
      icon: 'ShoppingBag',
      engineType: EngineType.ENGINE_C_COMMERCE,
      basePrice: 30.0,
      pricingUnit: 'order_catalog',
      metadata: JSON.stringify({ minOrderAmount: 200, freeDeliveryAbove: 500 }),
      sortOrder: 9
    }
  });

  const catSubs = await prisma.serviceCategory.create({
    data: {
      slug: 'daily-subscriptions',
      name: 'Daily Water & Dairy Subscription',
      nameHi: 'दैनिक दूध व 20L पानी की कैन',
      description: 'Automated morning deliveries of fresh milk packets and 20L water jars',
      icon: 'CalendarSync',
      engineType: EngineType.ENGINE_C_SUBSCRIPTION,
      basePrice: 0.0,
      pricingUnit: 'monthly_or_daily',
      metadata: JSON.stringify({
        timeSlots: ['06:00 AM - 08:00 AM', '06:00 PM - 08:00 PM'],
        frequencies: ['DAILY', 'ALTERNATE_DAYS', 'WEEKDAYS_ONLY']
      }),
      sortOrder: 10
    }
  });

  const catDrivers = await prisma.serviceCategory.create({
    data: {
      slug: 'acting-drivers',
      name: 'Acting Drivers on Call',
      nameHi: 'ड्राइवर ऑन कॉल (प्रति घंटा)',
      description: 'Professional drivers for city errands, outstation trips & night returns',
      icon: 'UserCheck',
      engineType: EngineType.ENGINE_C_APPOINTMENT,
      basePrice: 150.0,
      pricingUnit: 'hourly',
      metadata: JSON.stringify({ minHours: 2, overtimeRate: 80 }),
      sortOrder: 11
    }
  });

  // 4. Multi-Engine Verified Vendors
  // Vendor 1: Sharma Quick Rescue & Highway Fuel Runner
  const vUser1 = await prisma.user.create({
    data: {
      name: 'Ramesh Sharma',
      phone: '+919811122233',
      email: 'sharma.rescue@gmail.com',
      passwordHash,
      role: Role.VENDOR,
      preferredLang: 'hi'
    }
  });

  const vendorSharma = await prisma.vendorProfile.create({
    data: {
      userId: vUser1.id,
      businessName: 'Sharma 24/7 Roadside & Fuel Express',
      businessType: 'MECHANIC_PUMP',
      categories: 'emergency-fuel,roadside-puncture',
      description: '24/7 Certified Highway Rescue Runner. PESO-compliant metal fuel cans, jumpstart cables, tyre change equipment.',
      address: '100ft Road, Near Sony World Signal, Koramangala, Bangalore',
      city: 'Bangalore',
      latitude: 12.9352,
      longitude: 77.6245,
      serviceRadiusKm: 15.0,
      isOnline: true,
      is24x7Emergency: true,
      kycStatus: KycStatus.APPROVED,
      rating: 4.9,
      reviewCount: 148,
      dayRunnerFee: 150.0,
      nightRunnerFee: 250.0,
      perKmCharge: 15.0
    }
  });

  // Vendor 2: Verma Colorcraft & Pro Painters
  const vUser2 = await prisma.user.create({
    data: {
      name: 'Manoj Verma',
      phone: '+919822233344',
      email: 'verma.painters@gmail.com',
      passwordHash,
      role: Role.VENDOR,
      preferredLang: 'en'
    }
  });

  const vendorVerma = await prisma.vendorProfile.create({
    data: {
      userId: vUser2.id,
      businessName: 'Verma Colorcraft & Pro Painters',
      businessType: 'CONTRACTOR',
      categories: 'painting-services,furniture-interiors',
      description: 'Asian Paints certified applicator. Dust-free automated sanders, laser room measurement, moisture inspection.',
      address: 'CMH Road, Indiranagar, Bangalore',
      city: 'Bangalore',
      latitude: 12.9784,
      longitude: 77.6408,
      serviceRadiusKm: 25.0,
      isOnline: true,
      kycStatus: KycStatus.APPROVED,
      rating: 4.8,
      reviewCount: 92
    }
  });

  // Vendor 3: Shree Patel Kirana & Bisleri Water Agency
  const vUser3 = await prisma.user.create({
    data: {
      name: 'Subhash Patel',
      phone: '+919833344455',
      email: 'patel.kirana@gmail.com',
      passwordHash,
      role: Role.VENDOR,
      preferredLang: 'hi'
    }
  });

  const vendorPatel = await prisma.vendorProfile.create({
    data: {
      userId: vUser3.id,
      businessName: 'Shree Patel Kirana & Bisleri Water Agency',
      businessType: 'GROCERY',
      categories: 'kirana-grocery,daily-subscriptions',
      description: 'Trusted neighborhood kirana delivering fresh dairy, 20L sealed water cans & monthly provisions.',
      address: 'Binnamangala 1st Stage, Indiranagar, Bangalore',
      city: 'Bangalore',
      latitude: 12.9719,
      longitude: 77.6412,
      serviceRadiusKm: 6.0,
      isOnline: true,
      kycStatus: KycStatus.APPROVED,
      rating: 4.7,
      reviewCount: 224
    }
  });

  // 5. Products & Catalog for Engine C
  const prodWater = await prisma.product.create({
    data: {
      vendorId: vendorPatel.id,
      categoryId: catSubs.id,
      name: 'Bisleri 20 Litre Mineral Water Can',
      nameHi: 'बिसलेरी 20 लीटर पानी का जार',
      description: 'Factory sealed hygienic 20L mineral water jar delivered to your doorstep.',
      price: 80.0,
      unit: '20L Can',
      inStock: true
    }
  });

  const prodMilk = await prisma.product.create({
    data: {
      vendorId: vendorPatel.id,
      categoryId: catSubs.id,
      name: 'Nandini GoodLife Toned Milk 500ml',
      nameHi: 'नंदिनी टोंड दूध 500 मि.ली.',
      description: 'Pasteurized homogenized milk delivered daily before 7:00 AM.',
      price: 25.0,
      unit: 'packet',
      inStock: true
    }
  });

  await prisma.product.create({
    data: {
      vendorId: vendorPatel.id,
      categoryId: catKirana.id,
      name: 'Aashirvaad Shudh Chakki Atta 5kg',
      nameHi: 'आशीर्वाद चक्की आटा 5 कि.ग्रा.',
      description: '100% pure whole wheat flour.',
      price: 265.0,
      unit: 'packet',
      inStock: true
    }
  });

  await prisma.product.create({
    data: {
      vendorId: vendorPatel.id,
      categoryId: catKirana.id,
      name: 'Fortune Sunlite Refined Sunflower Oil 1L',
      nameHi: 'फॉर्च्यून रिफाइंड सूरजमुखी तेल 1 ली.',
      description: 'Light and healthy cooking oil enriched with vitamins A & D.',
      price: 135.0,
      unit: 'litre',
      inStock: true
    }
  });

  // 6. Active Sample Data across Engines
  // Engine A: Emergency Fuel Dispatch In-Progress
  const dispatchFuel = await prisma.dispatchBooking.create({
    data: {
      bookingNumber: 'SOS-2026-1044',
      categoryId: catFuel.id,
      customerId: customerRahul.id,
      vendorId: vendorSharma.id,
      status: DispatchStatus.ON_THE_WAY,
      pickupLatitude: 12.9378,
      pickupLongitude: 77.6288,
      pickupAddress: 'Near Forum Mall Outer Ring Road, Koramangala',
      requestDetails: JSON.stringify({
        fuelType: 'PETROL',
        liters: 3,
        vehicleModel: 'Honda City (KA 01 MJ 4321)',
        notes: 'Car stalled near flyover ramp, hazard lights on'
      }),
      startOtp: '7429',
      endOtp: '1853',
      runnerServiceFee: 150.0,
      actualFuelReceiptAmount: 312.45,
      totalAmount: 462.45,
      idVerified: true,
      acceptedAt: new Date(Date.now() - 1000 * 60 * 15)
    }
  });

  // Engine B: RFQ for House Painting with Received Quotes
  const rfqPainting = await prisma.quotationRequest.create({
    data: {
      rfqNumber: 'RFQ-2026-8821',
      categoryId: catPaint.id,
      customerId: customerPriya.id,
      title: 'Full 2BHK Repainting + Balcony Waterproofing',
      description: 'Need complete interior painting for 1,150 sq.ft. 2BHK apartment. Prefer Asian Paints Royale luxury emulsion.',
      locationLat: 12.9782,
      locationLng: 77.6405,
      locationAddress: 'Flat 302, Green Glen Heights, Indiranagar, Bangalore',
      specifications: JSON.stringify({
        carpetAreaSqft: 1150,
        rooms: '2 Bedrooms, Living Room, Kitchen, 2 Balconies',
        currentWallCondition: 'Minor hairline cracks, needs 2 coats putty + 2 coats primer',
        targetCompletionDays: 7
      }),
      attachments: JSON.stringify([
        '/uploads/sample-wall-1.jpg',
        '/uploads/sample-living-room.jpg'
      ]),
      status: RfqStatus.QUOTES_RECEIVED
    }
  });

  await prisma.vendorQuote.create({
    data: {
      rfqId: rfqPainting.id,
      vendorId: vendorVerma.id,
      materialCost: 18500.0,
      laborCost: 12000.0,
      deliveryCost: 500.0,
      taxes: 1550.0,
      totalAmount: 32550.0,
      estimatedDays: 6,
      proposalDetails: 'Includes Asian Paints Royale Luxury Emulsion (Sheen finish), Birla White Putty, mechanized sanding machine, and complete masking tape furniture protection.'
    }
  });

  // Engine C: Active Water Can Daily Subscription
  const activeSub = await prisma.subscription.create({
    data: {
      subNumber: 'SUB-2026-3301',
      customerId: customerRahul.id,
      vendorId: vendorPatel.id,
      productId: prodWater.id,
      frequency: SubFrequency.DAILY,
      timeSlot: '06:00 AM - 08:00 AM',
      quantityPerDelivery: 1,
      deliveryAddress: 'House 42, 4th Cross, Koramangala 4th Block, Bangalore',
      deliveryLat: 12.9348,
      deliveryLng: 77.6255,
      status: SubStatus.ACTIVE
    }
  });

  // Today's delivery log
  await prisma.subscriptionDelivery.create({
    data: {
      subscriptionId: activeSub.id,
      deliveryDate: new Date(),
      status: 'DELIVERED',
      deliveredAt: new Date(),
      deliveryOtp: '4821',
      proofPhotoUrl: '/uploads/proof-water-delivered.jpg'
    }
  });

  // In-App Chat negotiation on the active dispatch
  await prisma.chatMessage.create({
    data: {
      senderId: vUser1.id,
      receiverId: customerRahul.id,
      dispatchId: dispatchFuel.id,
      message: 'Namaste Rahul ji, I have purchased 3L petrol from the Indian Oil pump. Leaving on my bike now, ETA 10 minutes.'
    }
  });

  await prisma.chatMessage.create({
    data: {
      senderId: customerRahul.id,
      receiverId: vUser1.id,
      dispatchId: dispatchFuel.id,
      message: 'Thank you Ramesh ji! I am parked right before the Koramangala flyover on the service road.'
    }
  });

  console.log('✅ Seed completed successfully:');
  console.log(`   - Users: Admin, 2 Customers, 3 Vendors`);
  console.log(`   - 11 Dynamic Service Categories across 3 Engines`);
  console.log(`   - Sample active Dispatch (Fuel SOS), RFQ + Quote, and Daily Subscription with Chat`);
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
