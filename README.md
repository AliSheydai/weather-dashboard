# 🌤️ Modern Full-Stack Weather Dashboard

A premium, state-of-the-art full-stack Weather Dashboard web application engineered with **Next.js 16**, **NestJS 11**, **PostgreSQL 16**, and **Prisma ORM**. Featuring dynamic real-time atmospheric data, glassmorphic UI design, interactive data visualizations, unit metrics, search history, favorite locations, real-time notification alerts, and full user authentication.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Database Schema](#-database-schema)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Database Setup & Migration](#database-setup--migration)
  - [Running Development Servers](#running-development-servers)
  - [Running with Docker Compose](#running-with-docker-compose)
- [Project Directory Structure](#-project-directory-structure)
- [Testing](#-testing)
- [License](#-license)

---

## ✨ Features

### 🎨 Frontend & User Interface
- **Glassmorphic Modern Dark UI**: Built with Tailwind CSS v4, dynamic animations via Framer Motion, and high-contrast glass design elements.
- **Interactive Metric Modals**: Detailed modal dialogs equipped with custom interactive charts, gauges, status scales, and biological/meteorological impact explanations for:
  - 🌡️ **Temperature & Hourly Trend**
  - ☀️ **UV Index & Sun Protection Guidance**
  - 💨 **Wind Speed & Direction Radar**
  - 💧 **Humidity & Dew Point Analytics**
  - 👁️ **Visibility & Atmospheric Clarity**
  - 🌧️ **Rainfall Accumulation & 24h Totals**
  - 🌅 **Sunrise & Sunset Timeline**
  - 😷 **Air Quality Index (AQI)**
  - 🌡️ **Feels-Like Thermal Comfort Index**
- **Live Search & Autocomplete**: Search weather for any global city with instant state synchronization and local/remote history saving.
- **Multi-Day & Hourly Forecasts**: 7-day extended forecasts and 24-hour hourly forecast timelines.
- **Favorite Cities Management**: Save, view, and manage quick-access favorite cities.
- **Real-Time Notification System**: Notification bell with unread badge, categorizing alerts into `WEATHER_ALERT`, `WARNING`, `INFO`, and `SYSTEM` updates, supporting single/bulk read and deletion.
- **User Authentication UI**: Full registration, login, and token session persistence using Zustand and local storage.
- **Fully Responsive**: Optimizations for mobile, tablet, and widescreen desktop layouts.

### ⚙️ Backend & Infrastructure
- **NestJS Modular Architecture**: Decoupled NestJS controllers, services, guards, strategies, and DTO data transformation pipes (`class-validator`).
- **OpenWeatherMap Integration**: Proxy integration consuming Weather, Forecast, Air Pollution, and UV APIs with data transformation (m/s to km/h, degree cardinal conversion, AQI scaling).
- **Rate Limiting & Security**: API rate limiting powered by `@nestjs/throttler` (30 requests/minute), CORS whitelisting, and strict password hashing via `bcrypt`.
- **JWT Authentication**: Secure stateless session handling via `@nestjs/jwt` and `passport-jwt`.
- **PostgreSQL & Prisma ORM**: Relational schema mapping with Prisma 7, supporting cascade deletions and type-safe database queries.
- **Containerized Deployment**: Ready-to-use Dockerfiles for frontend and backend, alongside `docker-compose.yml` for unified orchestration.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router) | Server & Client components, React 19, TypeScript |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) | Lightweight global stores (`auth`, `weather`, `favorites`, `history`, `notifications`) |
| **Styling & UI** | Tailwind CSS v4, Framer Motion, Lucide React, HugeIcons | Responsive glassmorphic layout, smooth transitions |
| **Data Visualization** | [Recharts](https://recharts.org/) | Responsive SVG charts for metrics, temperature, and wind trends |
| **Backend Framework** | [NestJS 11](https://nestjs.com/) | Progressive Node.js framework with Express platform |
| **Database & ORM** | [PostgreSQL 16](https://www.postgresql.org/) & [Prisma 7](https://www.prisma.io/) | Relational database with automated migrations & client generation |
| **Authentication** | Passport JWT, Bcrypt | Stateless JWT bearer authentication & password encryption |
| **Containerization** | Docker, Docker Compose | Multi-container setup for local development and cloud production |
| **Deployment** | Vercel | Multi-service routing (`vercel.json`) linking frontend & backend |

---

## 🗄️ Database Schema

The database schema is defined in [`backend/prisma/schema.prisma`](file:///c:/Users/AFRAA/Desktop/ali/Projects/Next%20Js/weather-dashboard/backend/prisma/schema.prisma):

```prisma
enum NotificationType {
  INFO
  WEATHER_ALERT
  SYSTEM
  WARNING
}

model User {
  id            String          @id @default(cuid())
  email         String          @unique
  passwordHash  String          @map("password_hash")
  name          String?
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")
  favorites     FavoriteCity[]
  history       SearchHistory[]
  notifications Notification[]

  @@map("users")
}

model FavoriteCity {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  city      String
  createdAt DateTime @default(now()) @map("created_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, city])
  @@map("favorite_cities")
}

model SearchHistory {
  id         String   @id @default(cuid())
  userId     String   @map("user_id")
  city       String
  searchedAt DateTime @default(now()) @map("searched_at")
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("search_history")
}

model Notification {
  id        String           @id @default(cuid())
  userId    String           @map("user_id")
  title     String
  message   String
  type      NotificationType @default(INFO)
  isRead    Boolean          @default(false) @map("is_read")
  createdAt DateTime         @default(now()) @map("created_at")
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@map("notifications")
}
```

---

## 📡 API Endpoints Reference

### 🟢 Health Check
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Server status check | No |

### 🔑 Authentication (`/auth`)
| Method | Endpoint | Description | Payload / Query | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new user account | `{ "email": "...", "password": "...", "name": "..." }` | No |
| `POST` | `/auth/login` | Authenticate user & return JWT | `{ "email": "...", "password": "..." }` | No |
| `GET` | `/auth/me` | Fetch authenticated user profile | Bearer Token | Yes |

### 🌤️ Weather Data (`/weather`)
| Method | Endpoint | Description | Query Parameters | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/weather/current` | Get current weather & metric indicators | `?city=London` | No |
| `GET` | `/weather/hourly` | Get 24-hour hourly forecast timeline | `?city=London` | No |
| `GET` | `/weather/daily` | Get 7-day daily forecast summary | `?city=London` | No |

### ⭐ Favorites (`/favorites`)
| Method | Endpoint | Description | Payload / Route | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/favorites` | Fetch user favorite cities list | Header Bearer Token | Yes |
| `POST` | `/favorites` | Add city to favorites | `{ "city": "Paris" }` | Yes |
| `DELETE` | `/favorites/:city` | Remove city from favorites | Path Parameter `:city` | Yes |

### 📜 Search History (`/history`)
| Method | Endpoint | Description | Payload | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/history` | Fetch search history entries | Header Bearer Token | Yes |
| `POST` | `/history` | Add search entry to history | `{ "city": "Tokyo" }` | Yes |
| `DELETE` | `/history` | Clear search history | Header Bearer Token | Yes |

### 🔔 Notifications (`/notifications`)
| Method | Endpoint | Description | Route Parameter | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | Fetch user notifications | Header Bearer Token | Yes |
| `PATCH` | `/notifications/:id/read` | Mark notification as read | Path Parameter `:id` | Yes |
| `PATCH` | `/notifications/read-all` | Mark all notifications as read | Header Bearer Token | Yes |
| `DELETE` | `/notifications/:id` | Delete specific notification | Path Parameter `:id` | Yes |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following software installed locally:
- [Node.js](https://nodejs.org/) (v20.x or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) / [pnpm](https://pnpm.io/)
- [Docker & Docker Desktop](https://www.docker.com/) (Optional for containerized run)
- [PostgreSQL](https://www.postgresql.org/) (If running without Docker)

---

### Environment Configuration

1. **Root & Frontend Environment Variables (`.env.local`)**:
   Create a `.env.local` file in the project root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

2. **Backend Environment Variables (`backend/.env`)**:
   Create a `.env` file inside the `backend/` directory:
   ```env
   PORT=3001
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/weather_dashboard?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   WEATHER_API_KEY="your_openweathermap_api_key"
   WEATHER_API_BASE_URL="https://api.openweathermap.org/data/2.5"
   ```

---

### Database Setup & Migration

Navigate into the `backend` folder and run Prisma migrations:

```bash
cd backend

# Install dependencies
npm install

# Run database migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

---

### Running Development Servers

You can run the application in development mode with hot-reloading:

#### 1. Start NestJS Backend:
```bash
cd backend
npm run start:dev
```
*Backend will start on `http://localhost:3001`*

#### 2. Start Next.js Frontend:
In a new terminal window at the root directory:
```bash
npm install
npm run dev
```
*Frontend will start on `http://localhost:3000`*

---

### Running with Docker Compose

To spin up PostgreSQL, the NestJS Backend, and the Next.js Frontend simultaneously in isolated containers:

```bash
# Build and start all services
docker compose up --build

# Run in background (detached mode)
docker compose up -d --build
```

Services will be mapped to:
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:3001`
- **PostgreSQL Database**: `localhost:5432`

---

## 📁 Project Directory Structure

```
weather-dashboard/
├── backend/                  # NestJS API Backend Application
│   ├── prisma/               # Database Schema, Migrations & Seeds
│   │   ├── schema.prisma     # Prisma Data Models & Enums
│   │   └── seed-final.ts     # Sample Notifications & Users Data Seed
│   ├── src/
│   │   ├── auth/             # JWT Authentication, Passport Strategies & Guards
│   │   ├── favorites/        # Favorite Cities Controller & Service
│   │   ├── history/          # User Search History Management
│   │   ├── notifications/    # Real-Time Notifications Controller & Service
│   │   ├── prisma/           # Prisma Database Service Singleton
│   │   ├── users/            # User Profile Controller & Service
│   │   ├── weather/          # OpenWeatherMap Integration Service
│   │   ├── app.module.ts     # Main NestJS Root Module & Rate Limiter Configuration
│   │   └── main.ts           # NestJS Application Entrypoint, CORS & Pipe Setup
│   ├── Dockerfile            # Backend Docker build specification
│   └── package.json          # Backend Dependencies & Scripts
│
├── src/                      # Next.js Frontend Application
│   ├── app/
│   │   ├── login/            # User Authentication Page (Login / Register)
│   │   ├── globals.css       # Custom Tailwind CSS v4 Styles & Glassmorphism Rules
│   │   ├── home-client.tsx   # Interactive Client Dashboard Entry
│   │   ├── layout.tsx        # Root HTML & Metadata Layout
│   │   └── page.tsx          # Home Page Route Handler
│   ├── components/
│   │   ├── header/           # Notification Bell & Notification Drawer
│   │   ├── layout/           # Dashboard Header & Dashboard Shell Layout
│   │   ├── ui/               # Shadcn / Custom Reusable UI Components
│   │   ├── user/             # User Profile Avatar & Options Menu
│   │   └── weather/          # Weather Cards, Metrics Grid & 9 Interactive Modals
│   ├── hooks/                # Custom React Hooks (`useWeather`, `useMobile`)
│   ├── services/             # HTTP Client API Methods
│   ├── stores/               # Zustand Stores (`auth`, `weather`, `favorites`, `history`, `notifications`)
│   └── types/                # TypeScript Interfaces for Weather & User Data
│
├── docker-compose.yml        # Docker Multi-Container Compose Configuration
├── Dockerfile                # Frontend Next.js Docker build specification
├── package.json              # Frontend Dependencies & Scripts
├── vercel.json               # Vercel Deployment & Proxy Rewrite Rules
└── README.md                 # Project Overview & Documentation
```

---

## 🧪 Testing

Both frontend and backend include automated test suites.

### Backend Unit & E2E Tests
```bash
cd backend

# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e

# Generate test coverage report
npm run test:cov
```

### Frontend Tests
```bash
# Run unit & component tests
npm run test
```

---

## 📄 License

This project is licensed under the **MIT License**.
