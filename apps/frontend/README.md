# StyLens Frontend

The user interface for StyLens, built with **Next.js 16** and **React 19**. It provides a sleek, modern experience for uploading outfits, viewing AI fashion analyses, and managing a digital closet.

---

## 🛠️ Technical Stack

- **Core**: Next.js 16 (App Router), React 19
- **State & Auth**: Supabase SSR (`@supabase/ssr`)
- **Styling**: Tailwind CSS 4, Framer Motion
- **Icons**: Lucide React
- **Animations**: Custom Framer Motion transitions for premium feel

---

## 📁 Key Directories

- `app/`: Next.js App Router pages (auth, closet, history, homepage).
- `components/`: UI components categorized by feature (auth, closet, shared).
- `services/`: Client-side logic for interacting with the backend and Supabase.
- `hooks/`: Custom React hooks for session management and UI state.
- `lib/`: Shared utilities, constants, and type definitions.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Run Development Server
```bash
pnpm dev
```
Navigate to `http://localhost:3000`.

---

## 🏗️ Design System

StyLens uses a custom design system based on **Tailwind CSS 4**.
- **Typography**: Inter (Modern, readable)
- **Color Palette**: Dark mode by default with premium glassmorphism effects.
- **Micro-interactions**: Subtle hover effects and page transitions using Framer Motion.

---

## 🔐 Authentication Flow

1. **Supabase Auth**: Users sign up/in via email/password.
2. **Session Persistence**: Managed via Supabase cookies for SSR compatibility.
3. **Protected Routes**: Middleware (`middleware.ts`) ensures only authenticated users can access the dashboard and closet.

---

## 📦 Build & Deployment

Build for production:
```bash
pnpm build
```

The application is optimized for deployment on **Vercel**, leveraging Next.js server actions and optimized image handling.
