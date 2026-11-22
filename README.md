# ShortEdge: Hyperlocal Indian Super-App ("All-in-One Local Services Marketplace")

A modular, production-ready full-stack monorepo architected around **3 Unified Core Engines** driven by a dynamic `ServiceCategory` database configuration. Supports 15+ service categories without code duplication, featuring 4-digit start/end OTP verification, fuel pump receipt photo audit, multi-vendor rate comparison, recurring subscriptions, in-app negotiation chat, and regional language switching (English + Hindi).

---

## 🏛️ The 3 Unified Core Engines

```mermaid
flowchart TD
    subgraph Clients["Frontend Portals (Next.js App Router)"]
        ClientApp["/client (User Web App :3000)\n• 1-Tap Emergency SOS\n• RFQ Compare Hub\n• Kirana & Subs\n• i18n EN/HI"]
        VendorApp["/vendor (Vendor Portal :3001)\n• 24/7 Availability Toggle\n• SOS Dispatch Audio Alert\n• Itemized Quote Builder\n• Delivery Logs"]
        AdminApp["/admin (Admin Panel :3002)\n• Vendor KYC Pipeline\n• Citywide Live Ops Map\n• Dynamic Pricing & Fees"]
    end

    subgraph API["Backend API (:5000 Express + TypeScript)"]
        EngineA["Engine A: Instant Dispatch & Emergency\n(Fuel 2-5L Runner, Roadside Puncture, 24/7 Pharmacy, Genie, Mini-Truck)\n• Haversine Radius Matching\n• 4-Digit Start/End OTP\n• Mandatory Pump Receipt & Photo Audit"]
        EngineB["Engine B: Multi-Vendor Quotations (RFQ)\n(Painting, Furniture & Interiors, Renovation, Weddings, Denting)\n• Radius Broadcast to Local Shops\n• Itemized Rates (Material + Labor + Delivery + Taxes)\n• Side-by-Side Comparison Matrix"]
        EngineC["Engine C: Hyperlocal Commerce & Subscriptions\n(Kirana Grocery, 20L Water Cans, Daily Milk, Acting Drivers)\n• Storefronts & Cart Checkout\n• Daily & Weekday Recurring Schedules\n• Time-Slot Appointments"]
        CrossEngine["Cross-Engine Platform Features\n• In-App Masked Negotiation Chat (/api/chat)\n• Modular WhatsApp Alert Hook (/services/whatsapp.ts)\n• Role-Based JWT Auth (USER, VENDOR, ADMIN)"]
    end

    subgraph DB["Database"]
        PrismaDB["Prisma ORM (SQLite for local / PostgreSQL for production)"]
    end

    ClientApp --> API
    VendorApp --> API
    AdminApp --> API
    API --> PrismaDB
```

---

## 📁 Monorepo Structure

```text
/SHORT EDGE
├── package.json                   # Root monorepo workspace orchestrator
├── README.md                      # Comprehensive system guide
├── .gitignore                     # Git ignore rules
│
├── /server                        # Node.js + Express + TypeScript Backend (:5000)
│   ├── prisma/
│   │   ├── schema.prisma          # Unified schema for all 3 engines & RBAC
│   │   ├── seed.ts                # Realistic Indian seed data (Bangalore hub)
│   │   └── dev.db                 # SQLite local database (PostgreSQL swappable)
│   ├── src/
│   │   ├── controllers/           # Auth, Category, Dispatch, Quote, Commerce, Chat, Admin
│   │   ├── middleware/            # JWT auth, Role guards (USER, VENDOR, ADMIN), Multer uploads
│   │   ├── routes/                # Engine-specific express routers
│   │   ├── services/
│   │   │   ├── haversine.ts       # Hyperlocal GPS radius distance calculation
│   │   │   ├── otp.ts             # Cryptographic 4-digit OTP generator
│   │   │   └── whatsapp.ts        # Modular WhatsApp notification hook
│   │   ├── types/                 # Strict TypeScript enums & interfaces
│   │   └── index.ts               # Express bootstrap & route registration
│   └── package.json
│
├── /client                        # Next.js App Router (User Web App :3000)
│   ├── src/
│   │   ├── app/                   # App Router pages & layout
│   │   ├── components/            # Header, SosSection, CategoryGrid, QuotesHub, Commerce, OrdersTracker, ChatModal
│   │   ├── context/               # Auth & i18n Context
│   │   └── lib/                   # API client & English/Hindi dictionaries
│   └── package.json
│
├── /vendor                        # Next.js App Router (Vendor Portal :3001)
│   ├── src/
│   │   ├── app/                   # Vendor Dashboard
│   │   ├── components/            # SosDispatchesFeed, QuoteRequestsFeed, SubscriptionManager, EarningsSummary, VendorChatModal
│   │   ├── context/               # Vendor Auth & 24/7 Availability Context
│   │   └── lib/                   # API client & Hindi translations
│   └── package.json
│
└── /admin                         # Next.js App Router (Admin Panel :3002)
    ├── src/
    │   ├── app/                   # Admin Console
    │   ├── components/            # KycVerificationTab, LiveDispatchesTab, CategoryManagerTab
    │   ├── context/               # Admin Auth Context
    │   └── lib/                   # Admin API client
    └── package.json
```

---

## 🔑 Pre-Seeded Indian Test Accounts

All accounts are pre-configured with the password: `Password@123`

| Portal | Name / Role | Identifier / Email | Purpose |
| :--- | :--- | :--- | :--- |
| **Admin Panel** (`:3002`) | Super Admin | `admin@shortedge.in` | KYC approval, live dispatch map, category pricing |
| **Vendor Portal** (`:3001`) | **Ramesh Sharma** (24/7 Runner) | `sharma.rescue@gmail.com` | **Engine A:** Highway Fuel Assist (2–5L) & Roadside Puncture |
| **Vendor Portal** (`:3001`) | **Manoj Verma** (Contractor) | `verma.painters@gmail.com` | **Engine B:** Asian Paints Pro & Interior RFQ bidding |
| **Vendor Portal** (`:3001`) | **Subhash Patel** (Kirana & Water) | `patel.kirana@gmail.com` | **Engine C:** Kirana catalog, 20L water cans & daily milk |
| **User Web App** (`:3000`) | **Rahul Sharma** (Customer) | `rahul.sharma@gmail.com` | Active SOS fuel dispatch & water subscription |
| **User Web App** (`:3000`) | **Priya Iyer** (Customer) | `priya.iyer@gmail.com` | Active house painting RFQ with received quotes |

---

## 🚀 Quick Start (Local Run)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### 2. Setup Database & Seed Data
From the root directory, navigate to `/server` and run:
```bash
cd server
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```
*This provisions the SQLite database with 11 dynamic categories across all 3 engines, verified Indian vendors with Bangalore coordinates, and active sample transactions.*

### 3. Launch Development Servers
You can run the backend and portals concurrently:

#### Terminal 1: Backend API (`http://localhost:5000`)
```bash
cd server
npm run dev
```

#### Terminal 2: User Web App (`http://localhost:3000`)
```bash
cd client
npm run dev
```

#### Terminal 3: Vendor Portal (`http://localhost:3001`)
```bash
cd vendor
npm run dev
```

#### Terminal 4: Admin Panel (`http://localhost:3002`)
```bash
cd admin
npm run dev
```

---

## 🛠️ Verification of the 3 Unified Core Engines

### Engine A: Emergency & Instant Dispatch (Roadside & Fuel Runner)
1. Open the **User App** (`http://localhost:3000`).
2. Click **"Highway Fuel Assist"** in the top SOS bar.
3. Select **Petrol**, choose **3.5 Litres** (strictly capped 2–5L for reach-to-nearest-pump safety), confirm GPS breakdown location, and tap **"Request Emergency Fuel Runner"**.
4. The system calculates Day Runner Fee (₹150) / Night Fee (₹250), generates a **4-Digit Start OTP** and **End OTP**, and broadcasts an alert via the WhatsApp hook.
5. In the **Vendor Portal** (`http://localhost:3001`), accept the dispatch as *Sharma 24/7 Roadside & Fuel Express*.
6. Enter the customer's Start OTP upon arrival $\rightarrow$ status moves to `IN_PROGRESS`.
7. Fill in the fuel pump receipt amount (e.g. ₹365.50), upload the pump bill photo, and enter the customer's Completion OTP $\rightarrow$ status updates to `COMPLETED`.

### Engine B: Multi-Vendor Quotation & Rate Comparison (RFQ)
1. Go to the **"Get Quotes"** tab on the User App.
2. Select an RFQ (e.g. *Full 2BHK Repainting + Balcony Waterproofing*).
3. Inspect the **Transparent Rate Comparison Matrix** side-by-side:
   - Material Cost + Labor Cost + Delivery + Taxes = Total Amount.
   - Guaranteed completion timeline in days.
4. Click **"Chat"** to negotiate with the contractor without revealing phone numbers.
5. Tap **"Accept & Book"** to award the contract and reject competing quotes.

### Engine C: Hyperlocal Commerce & Daily Subscriptions
1. Go to the **"Kirana & Subscriptions"** tab.
2. Browse local grocery provisions (Aashirvaad Atta, Fortune Sunflower Oil, Nandini Milk) and click **"Add to Cart"** $\rightarrow$ Instant checkout with delivery OTP.
3. Switch to **"Daily Subscriptions"**: configure recurring schedules for **Bisleri 20L Mineral Water Cans** or fresh milk with time-slot selection (`06:00 AM - 08:00 AM`).
4. In the Vendor Portal, tap **"Log Today's Delivery"** with the customer OTP to verify delivery.

---

## 🌐 Production & Staging Deployment

### Recommended Subdomain Mapping
| Service | Subdomain | Technology |
| :--- | :--- | :--- |
| User Web App | `app.shortedge.in` | Next.js (Vercel / VPS) |
| Vendor Portal | `partner.shortedge.in` | Next.js (Vercel / VPS) |
| Admin Panel | `admin.shortedge.in` | Next.js (Vercel / VPS) |
| Unified REST API | `api.shortedge.in` | Node.js + Express (PM2 / Docker) |

### Switching to PostgreSQL in Production
In `server/prisma/schema.prisma`, update the datasource:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
Set your production connection string in `server/.env`:
```env
DATABASE_URL="postgresql://shortedge_admin:SECURE_PASSWORD@postgres.yourcloud.com:5432/shortedge_prod?sslmode=require"
```
Run the migration:
```bash
npx prisma migrate deploy
```

---

## 📄 License
MIT License. Built as a high-performance, modular hyperlocal marketplace architecture.
