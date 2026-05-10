# StyLens

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini-4285F4?logo=google-gemini)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Expert AI fashion styling and outfit analysis.** StyLens is your personal, AI-powered fashion critic that provides brutally honest feedback, styling tips, and weather-aware suggestions to ensure you always look your best.

---

## 📖 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Installation Guide](#installation-guide)
- [Environment Variables](#environment-variables)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Database Design](#database-design)
- [Security Considerations](#security-considerations)
- [Testing](#testing)
- [Deployment](#deployment)
- [Performance and Scalability](#performance-and-scalability)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)

---

## 🌟 Project Overview

StyLens solves the daily dilemma of "What should I wear?" and "Does this look good on me?". By leveraging state-of-the-art Generative AI and real-world context (weather, location), StyLens provides a professional fashion analysis that goes beyond simple "likes".

### Target Users

- **Fashion Enthusiasts**: People looking to refine their personal style.
- **Busy Professionals**: Individuals who need quick, reliable styling advice.
- **Content Creators**: Users wanting to ensure their outfits are visually cohesive for photos/videos.

### Key Objectives

- Provide objective, AI-driven fashion critiques.
- Offer actionable styling tips based on specific user context.
- Enable users to build and organize a digital "Closet" of outfit inspirations.

---

## ✨ Features

### 👗 AI Outfit Analysis

- **Image-Based Feedback**: Upload one or more photos of your outfit for a deep-dive analysis.
- **Brutally Honest Critiques**: No sugar-coating. Get real feedback on color matching, fit, and style cohesion.
- **Rating System**: Outfits are rated on a scale of 1-10 based on professional fashion standards.

### 🌤️ Weather-Aware Styling

- **Real-Time Integration**: Automatically fetches local weather data to assess if your outfit is practical for the current conditions.
- **Thermal Comfort Advice**: Suggestions on layering or fabric choices based on temperature and humidity.

### 📂 Digital Closet

- **Folder Organization**: Categorize your outfits and inspirations into custom folders.
- **Cloud Sync**: All your fashion data is securely stored and synced across devices via Supabase.

### 📈 History & Usage

- **Analysis History**: Look back at your previous critiques to track your style evolution.
- **Usage Limits**: Smart daily caps to manage AI resources effectively.

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 16.2.4 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS 4, Framer Motion (Animations)
- **Icons**: Lucide React
- **Auth/Data**: Supabase SSR

### Backend

- **Framework**: FastAPI (Python 3.12+)
- **AI Service**: Google Gemini Pro Vision
- **Rate Limiting**: SlowAPI
- **HTTP Client**: HTTPX (for Weather API integration)
- **Validation**: Pydantic v2

### Infrastructure

- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (for outfit images)
- **Monorepo**: Turborepo, pnpm

---

## 🏗️ System Architecture

StyLens uses a **Monorepo** architecture managed by Turborepo, separating the concern between the high-performance UI and the AI-orchestration backend.

- **Frontend**: A server-side rendered (SSR) React application that handles user interactions, image uploads, and session management.
- **Backend**: A RESTful API service that orchestrates AI prompts, fetches weather data, and enforces business logic (like usage limits).
- **Supabase**: Serves as the "Backend-as-a-Service", handling Auth, real-time database updates, and large file storage.

---

## 📂 Project Structure

```bash
StyLens/
├── apps/
│   ├── frontend/         # Next.js 16 application
│   │   ├── app/          # Routes and pages
│   │   ├── components/   # Reusable UI components
│   │   ├── services/     # API and Supabase client logic
│   │   └── lib/          # Utilities and mappers
│   └── backend/          # FastAPI application
│       ├── app/
│       │   ├── api/      # Route handlers (v1)
│       │   ├── services/ # AI, Weather, Storage logic
│       │   ├── models/   # Pydantic schemas
│       │   └── core/     # Config and security
│       └── tests/        # Pytest suite
├── supabase/
│   ├── migrations/       # SQL schema definitions
│   └── templates/        # Email/Auth templates
├── package.json          # Root workspace config
└── turbo.json            # Turborepo pipeline config
```

---

## 🚀 Installation Guide

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Python](https://www.python.org/) (v3.12+)
- [pnpm](https://pnpm.io/)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional for local DB)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/StyLens.git
cd StyLens
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Setup Environment Variables

Create `.env` files in both `apps/frontend` and `apps/backend` based on the provided `.env.example` files.

### 4. Start Development Servers

From the root directory:

```bash
pnpm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

---

## 🔑 Environment Variables

### Backend (`apps/backend/.env`)

| Variable                    | Description                      |
| --------------------------- | -------------------------------- |
| `SUPABASE_URL`              | Your Supabase project URL        |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key for backend operations |
| `GEMINI_API_KEY`            | Google AI Studio API key         |
| `WEATHER_API_KEY`           | OpenWeatherMap API key           |

### Frontend (`apps/frontend/.env.local`)

| Variable                        | Description                                      |
| ------------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public client key                                |
| `NEXT_PUBLIC_API_URL`           | Backend API URL (`http://localhost:8000/api/v1`) |

---

## 📖 Usage Guide

1. **Authentication**: Sign up or log in to create your personal fashion profile.
2. **Analysis**: Navigate to the homepage, upload an outfit image, and provide optional context (e.g., "Going to a wedding").
3. **Wait for AI**: The backend will fetch your local weather and generate a comprehensive critique.
4. **Save to Closet**: If you love an outfit or an analysis, save it to a specific folder in your digital closet.
5. **View History**: Access all your previous analyses in the "History" tab to see how your style has changed.

---

## 🛡️ Security Considerations

- **Row Level Security (RLS)**: Every database query is protected by Supabase RLS, ensuring users only access their own data.
- **Input Sanitization**: Backend inputs are strictly validated using Pydantic schemas.
- **Rate Limiting**: Protection against brute-force and API abuse using SlowAPI.
- **Secure Storage**: Images are stored in private Supabase buckets with signed URL access.

---

## 🧪 Testing

### Backend

Run the Python test suite:

```bash
cd apps/backend
pytest
```

### Frontend

Run linting:

```bash
cd apps/frontend
pnpm run lint
```

---

## 🚢 Deployment

### Frontend (Vercel/Netlify)

- Set the build command to `pnpm run build`.
- Root directory should point to `apps/frontend`.

### Backend (Docker/Render/Railway)

- Use the provided `pyproject.toml` to install dependencies.
- Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`.

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👥 Authors

- **StyLens Team** - _Initial work_ - [StyLens GitHub](https://github.com/StyLens)
