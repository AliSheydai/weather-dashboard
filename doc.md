# Weather Dashboard – Full Stack Roadmap

## هدف پروژه

ساخت یک **داشبورد آب‌وهوا به زبان انگلیسی (Weather Dashboard)** با استک زیر:

- **Frontend:** Next.js (App Router + TypeScript)
- **Backend:** NestJS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT
- **External API:** Weather API
- **Deployment:** Docker + Docker Compose

---

# مشخصات کلی پروژه

## نام پروژه

`weather-dashboard`

## معماری

```text
Next.js (Frontend)
        |
        | HTTP (REST API)
        v
NestJS (Backend API)
        |
        | Prisma ORM
        v
PostgreSQL
```

**قانون معماری:** فرانت‌اند هرگز مستقیم به Weather API وصل نمی‌شود؛ تمام درخواست‌ها از طریق NestJS انجام می‌شود.

---

# اطلاعات API

## Weather API

- Provider: OpenWeather
- Base URL: https://api.openweathermap.org/data/2.5
- API Key: 371ec30872dff9e2936e074606552d16

این مقادیر باید در فایل `.env` بک‌اند قرار گیرند.

---

# ساختار پوشه‌ها

## Frontend

```text
frontend/
├── app/
├── components/
├── lib/
├── services/
├── types/
└── public/
```

## Backend

```text
backend/
├── src/
│   ├── auth/
│   ├── users/
│   ├── weather/
│   ├── favorites/
│   ├── history/
│   ├── prisma/
│   └── common/
├── prisma/
└── test/
```

---

# فاز 0 – آماده‌سازی محیط

## نصب ابزارها

- Node.js LTS
- PostgreSQL

---

# فاز 1 – راه‌اندازی Frontend (Next.js)

## اهداف این فاز

- اجرای پروژه روی `localhost:3000`
- ایجاد صفحه اصلی
- ایجاد Layout عمومی
- ایجاد ساختار کامپوننت‌ها

## خروجی مورد انتظار

یک صفحه ساده با عنوان **Weather Dashboard** و یک input برای نام شهر.

---

# فاز 2 – راه‌اندازی Backend (NestJS)

## ایجاد پروژه

```bash
npm i -g @nestjs/cli
nest new backend
```

## نصب پکیج‌های اولیه

```bash
npm install @nestjs/config @nestjs/axios axios
```

## اهداف این فاز

- اجرای بک‌اند روی `localhost:3001`
- ایجاد endpoint تست

### Endpoint

```http
GET /health
```

### پاسخ

```json
{
  "status": "ok"
}
```

---

# فاز 3 – اتصال Frontend و Backend

## کارهای لازم

- فعال‌سازی CORS در NestJS
- ایجاد سرویس API در Next.js
- دریافت `/health` از فرانت‌اند

## خروجی مورد انتظار

نمایش وضعیت سرور در صفحه اصلی.

---

# فاز 4 – اتصال PostgreSQL

## ایجاد دیتابیس

نام پیشنهادی:

```text
weather_dashboard
```

## نصب Prisma

```bash
cd backend
npm install prisma @prisma/client
npx prisma init
```

## تنظیم `.env`

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/weather_dashboard"
```

## اولین Migration

```bash
npx prisma migrate dev --name init
```

---

# فاز 5 – طراحی مدل‌های دیتابیس

## User

- id
- email
- passwordHash
- createdAt

## FavoriteCity

- id
- userId
- city
- createdAt

## SearchHistory

- id
- userId
- city
- searchedAt

**نکته:** داده‌های آب‌وهوا در دیتابیس ذخیره نمی‌شوند.

---

# فاز 6 – ماژول کاربران

## اهداف

- ثبت کاربر
- دریافت پروفایل کاربر

## Endpoint ها

### ثبت‌نام

```http
POST /auth/register
```

### پروفایل

```http
GET /users/me
```

---

# فاز 7 – احراز هویت JWT

## نصب پکیج‌ها

```bash
npm install @nestjs/jwt passport passport-jwt @nestjs/passport bcrypt
```

## Endpoint ها

### Login

```http
POST /auth/login
```

### پاسخ

```json
{
  "access_token": "JWT_TOKEN"
}
```

## فرانت‌اند

- ذخیره توکن
- ارسال Authorization Header

---

# فاز 8 – اتصال Weather API

## ایجاد WeatherService

مسیر:

```text
src/weather/weather.service.ts
```

## Endpoint

```http
GET /weather/current?city=Berlin
```

## پاسخ استاندارد

```json
{
  "city": "Berlin",
  "temperature": 24,
  "condition": "Clear",
  "humidity": 40,
  "windSpeed": 12
}
```

---

# Phase 9 -- Weather Dashboard UI Specification

## هدف فاز

پیاده‌سازی رابط کاربری اصلی Weather Dashboard بر اساس طراحی مدرن، تاریک و
کارت‌محور.

این فاز فقط مربوط به ساخت UI و اتصال آن به داده‌های واقعی Backend است.

هدف این نیست که فقط یک صفحه نمایش آب‌وهوا ساخته شود؛ بلکه باید یک
Dashboard کامل با تجربه کاربری حرفه‌ای ایجاد شود.

---

# Design Direction

## سبک طراحی

- Modern Dashboard
- Dark Theme
- Glass / Soft Card Design
- Minimal Interface
- Professional Weather Application

---

# Theme

## رنگ‌بندی

- Background تیره
- Card ها با رنگ کمی روشن‌تر از Background
- Border های ظریف
- Shadow نرم
- Rounded Corner زیاد

---

# Layout اصلی

ساختار کلی صفحه:

    --------------------------------------------------
    | Sidebar |              Dashboard                |
    |         |                                      |
    |         | Current Weather + Info Cards         |
    |         |                                      |
    |         | Forecast + Statistics                |
    --------------------------------------------------

---

# Dashboard Layout Component

مسیر پیشنهادی:

    components/layout/DashboardLayout.tsx

مسئولیت:

- مدیریت ساختار کلی صفحه
- قرار دادن Sidebar
- قرار دادن بخش اصلی Dashboard

---

# Sidebar

مسیر:

    components/weather/WeatherSidebar.tsx

## وظیفه

مدیریت Location ها و جستجوی شهر.

---

# Search Box

بالای Sidebar قرار دارد.

Placeholder:

    Search for a city or airport

قابلیت‌ها:

- دریافت نام شهر
- ارسال درخواست به Backend
- دریافت اطلاعات آب‌وهوا
- تغییر Dashboard

Component:

    SearchCity.tsx

---

# City List

نمایش شهرهای اخیر یا محبوب.

هر City Card شامل:

    New York

    Cloudy

    22°

    H:29° L:15°

اطلاعات:

- City Name
- Weather Condition
- Current Temperature
- High Temperature
- Low Temperature

---

# Active City

شهر انتخاب شده باید:

- Highlight شود
- Background متفاوت داشته باشد
- مشخص کند Dashboard مربوط به آن شهر است

---

# Favorite Cities

در Sidebar:

امکانات:

- نمایش شهرهای مورد علاقه
- انتخاب سریع
- حذف شهر

ارتباط با:

    favorites API

---

# Main Dashboard

## Header

Component:

    DashboardHeader.tsx

شامل:

## Location

مثال:

    HOME • NEW YORK

---

## Navigation

بالای صفحه:

    Browse
    Map
    Metrics

در نسخه اول:

- Browse فعال باشد
- Map و Metrics آماده توسعه آینده باشند

---

# Current Weather Card

مسیر:

    components/weather/CurrentWeather.tsx

نمایش:

    21°

    Cloudy conditions

شامل:

- Temperature
- Weather Condition
- Weather Icon
- Current Time

---

# Hourly Forecast

Component:

    HourlyForecast.tsx

نمایش:

    Now   23   24   01   02

    ☁    ☂    ☁    ☀

    20°  18°  17°  19°

اطلاعات:

- Hour
- Icon
- Temperature

---

# Weather Statistics Cards

تمام کارت‌ها باید Component مشترک داشته باشند:

    WeatherCard.tsx

---

# UV Index Card

نمایش:

    UV INDEX

    0 mm

    Low for the rest of the day

شامل:

- UV Value
- Status
- Progress Bar

---

# Sunrise Card

نمایش:

    SUNRISE

    06:28

شامل:

- Sunrise Time
- Sunset Time
- Timeline

---

# Visibility Card

نمایش:

    Visibility

    34 km

---

# Feels Like Card

نمایش:

    Feels Like

    19°

---

# Average Temperature Card

نمایش:

    +5°

    Above average daily high

---

# Rainfall Card

نمایش:

    Rainfall

    0 mm

---

# Wind Card

Component:

    WindCard.tsx

نمایش:

    Wind

    N

    1 m/s

شامل:

- Direction
- Speed

---

# Air Quality Card

Component:

    AirQualityCard.tsx

نمایش:

    Air Quality

    56

    Moderate

شامل:

- AQI Value
- Status
- Indicator

---

# Humidity Card

Component:

    HumidityCard.tsx

نمایش:

    Humidity

    73%

---

# Weekly Forecast

Component:

    DailyForecast.tsx

نمایش:

    Today   ☂   13° -------- 21°

    Mon     ☁   15° -------- 24°

    Tue     ☀   15° -------- 21°

هر آیتم شامل:

- Day
- Weather Icon
- Min Temperature
- Max Temperature
- Temperature Range

---

# Data Flow

UI نباید مستقیم با Weather Provider ارتباط داشته باشد.

Flow:

    User
    |
    v
    Next.js
    |
    v
    NestJS API
    |
    v
    Weather Service
    |
    v
    External Weather API
    |
    v
    Response
    |
    v
    Update UI

---

# State Management

استفاده از Zustand:

Store ها:

    stores/

    weatherStore.ts
    favoritesStore.ts
    authStore.ts

---

# Component Structure

    components/

    weather/
    |
    ├── WeatherSidebar.tsx
    ├── SearchCity.tsx
    ├── CurrentWeather.tsx
    ├── HourlyForecast.tsx
    ├── DailyForecast.tsx
    ├── WeatherCard.tsx
    ├── WindCard.tsx
    ├── AirQualityCard.tsx
    └── HumidityCard.tsx

    layout/

    └── DashboardLayout.tsx

---

# Responsive Design

## Desktop

- Sidebar ثابت
- Dashboard Grid

## Tablet

- Sidebar کوچک‌تر شود
- کارت‌ها تغییر اندازه دهند

## Mobile

- Sidebar تبدیل به Drawer شود
- کارت‌ها به صورت Stack نمایش داده شوند

# User Profile Section

## هدف

ایجاد بخش پروفایل کاربر برای نمایش اطلاعات حساب و دسترسی سریع به تنظیمات
کاربر.

این بخش باید در Dashboard قابل دسترسی باشد.

---

# Profile Location

پروفایل کاربر در Sidebar یا Header اصلی قرار می‌گیرد.

نمایش پیشنهادی:

    ---
    |  Avatar         |
    |  Ali            |
    |  ali@email.com  |
    ------------------

---

# User Profile Component

مسیر پیشنهادی:

    components/user/UserProfile.tsx

---

# اطلاعات قابل نمایش

## Avatar

نمایش:

- تصویر کاربر در صورت وجود
- Avatar پیش‌فرض در صورت نبود تصویر

---

## User Name

نمایش:

    Ali

---

## Email

نمایش:

    ali@example.com

---

# Profile Menu

با کلیک روی پروفایل یک Dropdown باز شود.

گزینه‌ها:

    Profile

    Settings

    Temperature Unit

    Logout

---

# Settings

کاربر بتواند تنظیمات شخصی خود را مدیریت کند.

## Temperature Unit

انتخاب واحد دما:

    °C
    °F

---

## Default Location

انتخاب شهر پیش‌فرض:

مثال:

    New York

بعد از ورود کاربر Dashboard به صورت خودکار این شهر را نمایش دهد.

---

## Theme

در نسخه اول:

    Dark Mode (Default)

آماده توسعه برای:

    Light Mode
    System Mode

---

# Backend Integration

اطلاعات پروفایل از API دریافت شود.

Endpoint:

```http
GET /users/me
```

Response:

```json
{
  "id": "1",
  "name": "Ali",
  "email": "ali@example.com",
  "avatar": null,
  "defaultCity": "New York",
  "temperatureUnit": "C"
}
```

---

# State Management

اطلاعات کاربر داخل:

    authStore

ذخیره شود.

موارد:

- user
- token
- authentication status

---

# User Actions

## Logout

با کلیک روی Logout:

- حذف Token
- پاک کردن User Store
- انتقال به صفحه Login

---

# Responsive Behavior

## Desktop

پروفایل در Sidebar یا Header نمایش داده شود.

## Mobile

پروفایل داخل Mobile Menu قرار گیرد.

---

# Development Rules

1.  اطلاعات User مستقیماً داخل Component دریافت نشود.
2.  دریافت اطلاعات از Service Layer انجام شود.
3.  UI پروفایل فقط بعد از پیاده‌سازی Auth تکمیل شود.
4.  اطلاعات حساس مثل Token نمایش داده نشود.

---

# Architecture Note

Auth در فاز 7 پیاده‌سازی می‌شود، اما UI پروفایل در فاز 9 ساخته می‌شود.

بنابراین در فاز 9:

- ساخت Authentication جدید انجام نمی‌شود.
- فقط UI پروفایل پیاده‌سازی می‌شود.
- اتصال به endpoint آماده شده انجام می‌شود.
- اطلاعات کاربر از Auth موجود دریافت می‌شود.

---

# UI Technologies

Frontend:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- Framer Motion (اختیاری)

---

# Development Rules

1.  ابتدا UI با داده واقعی Backend ساخته شود.
2.  از Mock Data دائمی استفاده نشود.
3.  تمام Component ها TypeScript باشند.
4.  Component ها کوچک و قابل استفاده مجدد باشند.
5.  Logic مربوط به API داخل Component قرار نگیرد.
6.  تمام درخواست‌ها از Service Layer انجام شوند.

---

# خروجی مورد انتظار این فاز

در پایان این فاز باید:

- Dashboard کامل ساخته شده باشد.
- Sidebar کار کند.
- Search شهر کار کند.
- اطلاعات Weather از Backend دریافت شود.
- کارت‌های اطلاعات نمایش داده شوند.
- Responsive Design پیاده‌سازی شود.

---

# فاز 10 – تاریخچه جستجو

## Backend

ثبت خودکار هر جستجو برای کاربر لاگین‌شده.

### Endpoint

```http
GET /history
```

## Frontend

نمایش آخرین جستجوها در Sidebar.

---

# فاز 11 – شهرهای مورد علاقه

## Endpoint ها

### افزودن

```http
POST /favorites
```

### حذف

```http
DELETE /favorites/:id
```

### لیست

```http
GET /favorites
```

## Frontend

- دکمه ⭐ کنار هر شهر
- لیست علاقه‌مندی‌ها در Sidebar

---

# فاز 12 – پیش‌بینی چندروزه

## Endpoint

```http
GET /weather/forecast?city=Berlin
```

## نمایش

کارت‌های ۵ روز آینده شامل:

- تاریخ
- دمای حداقل
- دمای حداکثر
- وضعیت هوا

---

# فاز 13 – مدیریت وضعیت در فرانت‌اند

## نصب

```bash
npm install zustand
```

## Store ها

- authStore
- weatherStore
- favoritesStore

## قانون

داده ابتدا در Store قرار گیرد و سپس UI رندر شود.

---

# فاز 14 – مدیریت خطا و Loading

## سناریوها

- شهر یافت نشد
- اینترنت قطع شد
- API محدود شد
- سرور در دسترس نیست

## UI

- Spinner
- Error Alert
- Retry Button

---

# فاز 15 – امنیت

## الزامات

- Hash کردن رمزها با bcrypt
- استفاده از JWT Secret
- Validation با DTO
- Rate Limit روی Login
- عدم ارسال API Key به فرانت‌اند

---

# فاز 16 – تست

## Backend

- Unit Test برای WeatherService
- E2E برای Auth

## Frontend

- تست کامپوننت فرم جستجو

---

# فاز 17 – Docker

## فایل‌ها

- `frontend/Dockerfile`
- `backend/Dockerfile`
- `docker-compose.yml`

## سرویس‌ها

- frontend
- backend
- postgres

## اجرای پروژه

```bash
docker compose up --build
```

---

# فاز 18 – استقرار (Deployment) هر موقع به این مرحله رسیدیم خودم انجام میدم.

## Frontend

- Vercel

## Backend

- Render / Railway / VPS

## Database

- Neon / Supabase / Railway PostgreSQL

---

# فاز 19 – بهبود UI (در انتهای پروژه)

فقط پس از تکمیل عملکردها انجام شود.

## پیشنهادها

- Tailwind CSS
- shadcn/ui
- Dark Mode
- Responsive Design
- Animations

---

# چک‌لیست MVP

- [ ] Next.js اجرا می‌شود
- [ ] NestJS اجرا می‌شود
- [ ] PostgreSQL متصل است
- [ ] Register/Login کار می‌کند
- [ ] دریافت آب‌وهوا کار می‌کند
- [ ] نمایش آب‌وهوا در UI انجام می‌شود
- [ ] تاریخچه ذخیره می‌شود
- [ ] علاقه‌مندی‌ها ذخیره می‌شوند
- [ ] Docker Compose اجرا می‌شود

---

# قوانین توسعه برای Agent

1. ابتدا هر فاز را کامل کن سپس وارد فاز بعدی شو.
2. از TypeScript strict mode استفاده کن.
3. در NestJS از Dependency Injection استفاده کن.
4. PrismaClient مستقیم instantiate نشود؛ PrismaService ساخته شود.
5. تمام endpoint ها DTO و Validation داشته باشند.
6. تمام متغیرهای حساس در `.env` قرار گیرند.
7. قبل از تغییر UI، عملکرد endpoint تست شود.
8. Commit ها به صورت فازی باشند.

---

# ترتیب اجرای واقعی پروژه

1. فاز 1
2. فاز 2
3. فاز 3
4. فاز 4
5. فاز 5
6. فاز 6
7. فاز 7
8. فاز 8
9. فاز 9
10. فاز 10
11. فاز 11
12. فاز 12
13. فاز 13
14. فاز 14
15. فاز 15
16. فاز 16
17. فاز 17
18. فاز 18
19. فاز 19

---

# وضعیت فعلی پروژه

- [ ] شروع نشده
- [ ] در حال توسعه
- [ ] MVP کامل شده
- [ ] آماده استقرار
- [ ] منتشر شده
