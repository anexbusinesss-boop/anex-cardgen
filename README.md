# Eid Wish Card Generator

A production-ready Next.js web application that allows users to generate personalized Eid greeting cards and download them as HD 1080×1080 PNG files.

## Features

- 🌙 **Public Generator** — Fill in your name, designation, and phone number to generate a personalized Eid card
- 🖼️ **HD Download** — Export the card as a 1080×1080 PNG at full quality
- 🔤 **Bilingual Support** — Automatically detects Bengali text and switches to Hind Siliguri font; English uses Trebuchet MS
- 🔐 **Admin Dashboard** — Password-protected panel to view all generated cards with search and pagination
- 🎨 **Design Management** — Admin can upload a new card template (JPG/PNG)

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env` and set your values:

```env
DATABASE_URL="file:./prisma/dev.db"
ADMIN_PASSWORD="your-secure-password"
JWT_SECRET="your-long-random-secret"
```

### 3. Initialize the Database

```bash
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Routes

| Route | Description |
|---|---|
| `/` | Public Eid card generator |
| `/admin` | Admin login |
| `/admin/dashboard` | View all card generation entries |
| `/admin/design` | Upload/change the card template |

---

## Vercel Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/anex-cardgen.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Set the following **Environment Variables** in Vercel project settings:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Use Vercel Postgres (see below) |
| `ADMIN_PASSWORD` | Your secure admin password |
| `JWT_SECRET` | A long random string |

### 3. Database on Vercel

For Vercel deployment, switch to **PostgreSQL** (SQLite doesn't persist on serverless):

1. In Vercel dashboard → **Storage** → **Create Database** → **Postgres**
2. Copy the `DATABASE_URL` connection string
3. Update `prisma/schema.prisma` provider from `"sqlite"` to `"postgresql"`
4. Redeploy

> **Tip:** For a quick demo/prototype, you can keep SQLite if you use a platform like [Railway](https://railway.app) or [Render](https://render.com) instead of Vercel.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Custom CSS
- **Database:** SQLite (dev) / PostgreSQL (production)
- **ORM:** Prisma 5
- **Auth:** JWT via `jose` (HTTP-only cookie)
- **Image Generation:** HTML Canvas API (client-side, 1080×1080)
- **Fonts:** Hind Siliguri (Google Fonts, Bengali), Trebuchet MS (English)

---

## Canvas Text Placement

| Field | X Position | Y from Bottom | Size | Weight |
|---|---|---|---|---|
| Name | 460px | 70px | 35px | 700 |
| Designation | 460px | 42px | 22px | 400 |
| Phone | 460px | 18px | 22px | 400 |

Text color: `#333333` · Alignment: left

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Public generator page
│   ├── layout.tsx               # Root layout with fonts
│   ├── globals.css              # Design system (dark green + gold)
│   ├── admin/
│   │   ├── page.tsx             # Admin login
│   │   ├── dashboard/page.tsx   # Entries table
│   │   └── design/page.tsx      # Template upload
│   └── api/
│       ├── template/route.ts    # GET active template
│       ├── generate/route.ts    # POST save entry
│       └── admin/
│           ├── login/route.ts   # POST authenticate
│           ├── logout/route.ts  # POST clear cookie
│           ├── entries/route.ts # GET paginated entries
│           └── upload/route.ts  # POST upload template
├── components/
│   ├── CardCanvas.tsx           # Canvas renderer
│   └── AdminNav.tsx             # Admin navigation
├── lib/
│   ├── prisma.ts                # Prisma singleton
│   ├── auth.ts                  # JWT sign/verify
│   └── fontDetect.ts            # Bengali detection
└── middleware.ts                # Admin route protection
```
