# ResourceXchange — B2B Hospitality Resource-Sharing Marketplace

A full-stack peer-to-peer B2B sharing platform where hotels, banquet venues, caterers, restaurants, and event organizers list and share idle hospitality resources (**banquet space, commercial kitchen capacity, guest parking lots, refrigerated vehicles, furniture, and AV systems**).

Built for live hackathon demonstrations with zero external database configuration needed.

---

## 🚀 Live Demo Architecture & Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Canvas Confetti.
- **Backend**: Node.js, Express.js.
- **Database**: SQLite (`better-sqlite3` with WAL mode & foreign keys enabled).
- **Matching Engine**: Multi-factor rule-based algorithm (Haversine distance, price affinity vs budget, calendar availability overlap, capacity fit, provider trust rating).

---

## ⚡ Quick Start

```bash
# 1. Install all dependencies (root, server, and client)
npm run install:all

# 2. Run both Backend API (:5001) and Frontend UI (:5173) concurrently
npm run dev
```

- **Frontend URL**: [http://localhost:5173](http://localhost:5173)
- **Backend API URL**: [http://localhost:5001](http://localhost:5001)

---

## 🌟 Core Features & Live Demo Highlights

### 1. Proper Authentication (Login + Signup) with JWT & bcrypt
- **Secure Password Hashing**: Passwords stored using `bcrypt` (10 salt rounds) in the `password_hash` column.
- **JWT Protection**: Tokens issued on login and signup, signed with HMAC-SHA256, verified via `authenticateToken` middleware.
- **Auth Endpoints**:
  - `POST /api/auth/signup`: Validates email, password (min 6 chars), business type & location; returns JWT + user.
  - `POST /api/auth/login`: Verifies email and hashed password with bcrypt; returns JWT + user.
  - `GET /api/auth/me`: Protected route reading logged-in business profile and live stats from Bearer token.
- **Judge-Friendly Demo Switcher**:
  - Quick demo 1-click login buttons on the Login page and in the top header bar.
  - Instant login into any of the 5 seeded hospitality businesses without typing passwords (**Grand Palace Hotel & Resort, Spice Artistry Catering Co., Azure Grand Banquet & Expo, Apex Stage & AV, Metro Fleet & Logistics**).
  - Test credentials for manual login: `host@grandpalace.com` / `password123`.

### 2. Dual User Roles (Provider & Seeker in One Account)
- Any registered business can seamlessly act as both **Resource Provider** (monetizing idle banquet space or kitchen shifts) and **Resource Seeker** (sourcing overflow capacity).
- **Fast Account Switcher**: Easily switch between pre-seeded demo hospitality businesses (**Grand Palace Hotel & Resort, Spice Artistry Catering Co., Azure Grand Banquet & Expo, Apex Stage & AV, Metro Fleet & Logistics**) with one click in the header.
- **Instant "Reset Demo" button**: Restores realistic listings, requests, calendar slots, and reviews at any time during presentation.

### 2. Provider Side
- **Create & Edit Listings**: Detailed categories, capacity, quantity, daily & hourly rates, conditions/insurance requirements, and amenity tags.
- **Interactive Availability Calendar**:
  - Automatically locks dates upon request acceptance to **prevent double-booking**.
  - Provider can click to manually block/blackout dates for private maintenance or release dates.
- **Incoming Request Management Hub**:
  - Filter requests by *Pending*, *Counter-Offered*, *Accepted*, *Completed*, or *Declined*.
  - Actions: **Accept & Lock Booking**, **Propose Counter-Offer** (revised price/time), or **Decline** with reason.

### 3. Seeker Side
- **Smart Resource Discovery**:
  - Category tabs (Banquet Space, Kitchen & Cold Storage, Parking, Fleet, AV & Lighting, Furniture).
  - Search keyword, date range selector, distance radius slider (1–50 km), capacity minimum, budget filter.
  - Sort by **Smart Match Ranked**, **Price: Low to High**, **Nearest Distance**, or **Highest Rating**.
- **Rule-Based Smart Match Score**:
  - Displays a transparent **Match % Badge** (e.g. `96% MATCH`).
  - Expandable breakdown explaining why the resource matches (Proximity distance score, budget fit, 100% calendar vacancy, capacity match, 4.9★ rating).
- **Side-by-Side Comparison Matrix**:
  - Add 2 to 3 resources to the floating bottom drawer.
  - Open comparison modal to compare pricing, capacity, distance, features, terms, and rating side-by-side.
- **Send Booking Request**:
  - Real-time double-booking collision check.
  - Dynamic duration pricing calculator + custom negotiable offer price.
- **Request Tracking Stepper**:
  - Visual status timeline: `Submitted -> Host Review -> Counter-Offered / Accepted -> Confirmed -> Completed`.
  - Accept or decline provider counter-offers.

### 4. Wanted Board (RFQs)
- Post a custom resource requirement when no exact match exists.
- Nearby hospitality providers can view open RFQs and propose matching resources.

### 5. Verified Ratings & Trust Network
- Once an exchange is marked completed, the seeker can submit a 1–5 star rating with quality tags (*Spotless Sanitary*, *Punctual Handover*, *Mint Equipment*) and a public review.
- Provider overall rating is dynamically recalculated.
