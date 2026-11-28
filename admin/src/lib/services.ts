export interface ServiceDefinition {
  id: string;
  name: string;
  emoji: string;
  badge: string;
  engine: 'instant' | 'rfq' | 'commerce';
  description: string;
  typicalFee: string;
}

export const SHORTEDGE_SERVICES: ServiceDefinition[] = [
  {
    id: 'emergency-fuel',
    name: 'Emergency Highway Fuel Delivery',
    emoji: '⛽',
    badge: '15-Min Rapid SOS',
    engine: 'instant',
    description: 'Deliver 2–5 Litres of Petrol or Diesel directly to stranded vehicles with Jerry can safety check',
    typicalFee: '₹150 + Fuel Cost'
  },
  {
    id: 'roadside-puncture',
    name: '24/7 Roadside Assistance & Tyre Puncture',
    emoji: '🔧',
    badge: '15-Min Rapid SOS',
    engine: 'instant',
    description: 'On-site mobile puncture repair, battery jumpstart, key lockout, and flatbed towing assist',
    typicalFee: '₹200 Inspection'
  },
  {
    id: 'emergency-pharmacy',
    name: '24/7 Emergency Pharmacy & Night Chemist',
    emoji: '💊',
    badge: '30-Min Delivery',
    engine: 'instant',
    description: 'Urgent prescription medicines and emergency first-aid pickup from open late-night medical stores',
    typicalFee: '₹60 Delivery'
  },
  {
    id: 'local-genie',
    name: 'Local Genie (Pickup & Drop Courier)',
    emoji: '📦',
    badge: 'Instant Runner',
    engine: 'instant',
    description: 'Point-to-point intracity courier for keys, office documents, chargers, lunch tiffins, and parcels',
    typicalFee: '₹50 Base'
  },
  {
    id: 'goods-auto-booking',
    name: 'Mini-Truck & Goods Loading Auto',
    emoji: '🚚',
    badge: 'Instant Cargo',
    engine: 'instant',
    description: 'Tata Ace (Chota Hathi), Ape Auto 3-Wheeler, and Bolero for house shifting, market loads & cargo',
    typicalFee: '₹350 Base'
  },
  {
    id: 'acting-drivers',
    name: 'Acting Drivers on Call',
    emoji: '🚗',
    badge: 'Hourly / Trip',
    engine: 'instant',
    description: 'Professional verified drivers for personal manual/automatic cars for night returns, city & outstation',
    typicalFee: '₹150/hr'
  },
  {
    id: 'painting-services',
    name: 'House Paint, Textures & Waterproofing',
    emoji: '🎨',
    badge: 'Compare Quotes',
    engine: 'rfq',
    description: 'Itemized bidding for 1BHK, 2BHK, 3BHK villas, interior textures, exterior waterproofing & primer',
    typicalFee: 'Free Quotes'
  },
  {
    id: 'furniture-interiors',
    name: 'Custom Carpentry & Modular Interiors',
    emoji: '🪚',
    badge: 'Compare Quotes',
    engine: 'rfq',
    description: 'Custom wardrobes, modular kitchen installation, bed repair, dining tables, and interior woodcraft',
    typicalFee: 'Free Quotes'
  },
  {
    id: 'vehicle-servicing',
    name: 'Car Denting, Painting & Bodywork',
    emoji: '🚘',
    badge: 'Compare Quotes',
    engine: 'rfq',
    description: 'Upload damage photos to get itemized bids from verified local denting, painting and bodywork garages',
    typicalFee: 'Free Quotes'
  },
  {
    id: 'kirana-grocery',
    name: 'Local Kirana & Supermarket Delivery',
    emoji: '🛒',
    badge: 'Daily Commerce',
    engine: 'commerce',
    description: 'Local neighborhood grocery store orders: pulses, rice, snacks, spices, and household essentials in 45 mins',
    typicalFee: '₹30 Delivery'
  },
  {
    id: 'daily-subscriptions',
    name: 'Daily Water (20L Can) & Milk Subscriptions',
    emoji: '🥛',
    badge: 'Morning Schedule',
    engine: 'commerce',
    description: 'Automated 6:00 AM – 8:00 AM doorstep delivery of Bisleri/Kinley 20L water cans and fresh milk packets',
    typicalFee: 'Scheduled'
  }
];
