# Doctor's Appointment System - Copilot Instructions

## Project Overview
A complete doctor's appointment booking system built with Next.js 14+, TypeScript, Prisma, PostgreSQL, NextAuth, React Query, and TailwindCSS.

## ✅ Completed Features

### Core System
- [x] Next.js 14+ project with App Router and TypeScript
- [x] PostgreSQL database with Prisma ORM
- [x] NextAuth.js authentication with credentials provider
- [x] Role-based access control (PATIENT, DOCTOR, ADMIN)
- [x] Responsive UI with TailwindCSS
- [x] TanStack Query for data fetching

### Theme System
- [x] **Light Theme**: DentCare-inspired white background with teal (#14B8A6) accent
- [x] **Dark Theme**: Deep black (#000000) background with accent highlights
- [x] **Theme Toggle**: Persistent selection with sun/moon icons
- [x] **CSS Variables**: HSL color system for theme consistency

### Home Page Features
- [x] **Board Swiper**: 3D carousel with coverflow effect
  - 🏥 Branding cards with welcome messages
  - 📅 Notice cards for important announcements
  - 👨‍⚕️ Doctor spotlight cards
  - Autoplay (3.5s), navigation arrows, pagination
  - Responsive: 1 card (mobile) → 3 cards (desktop)

### Prescription Features
- [x] **Frequency Input**: Medical standard M+A+N format (Morning+Afternoon+Night)
  - Interactive numeric input fields
  - Quick presets: 1+0+1, 1+1+1, 1+1+0, 0+0+1, 2+2+2
  - Validation: numeric only, max 2 digits per field
  
- [x] **Frequency Display**: Visual dosing indicators
  - Emoji badges: 🌅 Morning, ☀️ Afternoon, 🌙 Night
  - Daily total calculation
  - Theme-aware styling
  
- [x] **Prescription History**: Timeline visualization
  - Vertical timeline with gradient animation
  - "Latest Prescription" badge with pulse effect
  - Expand/collapse detailed view
  - Statistics: total prescriptions, medications, doctors
  - Print and view detail actions
  - Role-based display (DOCTOR/PATIENT/ADMIN)
  - Search and filter functionality

- [x] **Duplicate Prevention**: Smart prescription handling
  - Pre-flight check before showing creation form
  - Warning screen for existing prescriptions
  - Visual button states (Written vs Write)
  - Automatic redirection with helpful messages
  - Prevents data entry for duplicate prescriptions

### Appointment System
- [x] Doctor search and booking
- [x] Time slot management
- [x] Appointment status tracking
- [x] Fee calculation (first visit, within-window, outside-window)

### Doctor Features
- [x] Dashboard with daily schedule
- [x] Appointment management
- [x] Prescription writing with M+A+N format
- [x] Prescription history with timeline
- [x] Patient record access

### Patient Features
- [x] Doctor search and booking
- [x] Appointment management
- [x] Prescription history timeline
- [x] Test result access

### Admin Features
- [x] System dashboard
- [x] Doctor management
- [x] Payment tracking
- [x] Test result upload

## 🎨 Design Guidelines

### Color Palette
```css
Light Theme:
- Background: #FFFFFF (white)
- Foreground: #171717 (near black)
- Accent: #14B8A6 (teal)
- Card: #F9FAFB (light gray)

Dark Theme:
- Background: #000000 (deep black)
- Foreground: #FAFAFA (off-white)
- Accent: #14B8A6 (teal)
- Card: #0A0A0A (dark gray)
```

### Component Patterns
- Use `style={{backgroundColor: 'var(--background)'}}` for themed backgrounds
- Use `style={{color: 'var(--foreground)'}}` for themed text
- Accent color for CTAs and highlights
- Card background for content containers
- Border color for dividers and outlines

### Typography
- Headings: font-semibold or font-bold
- Body text: default weight with `var(--foreground)`
- Secondary text: text-gray-600 dark:text-gray-300

## 📁 Key Files

### Components
- `src/components/BoardSwiper.tsx` - Home page 3D carousel
- `src/components/FrequencyInput.tsx` - M+A+N dosing input
- `src/components/FrequencyDisplay.tsx` - Visual frequency display
- `src/components/PrescriptionHistory.tsx` - Timeline visualization
- `src/components/providers/theme-provider.tsx` - Theme context
- `src/components/providers/index.tsx` - Combined providers

### Pages
- `src/app/page.tsx` - Home page with BoardSwiper
- `src/app/prescriptions/page.tsx` - Patient prescription history
- `src/app/doctor/prescriptions/page.tsx` - Doctor prescription management
- `src/app/doctor/prescription/create/page.tsx` - Prescription creation with duplicate prevention
- `src/app/doctor/appointments/page.tsx` - Appointment list with smart prescription buttons

### Styles
- `src/app/globals.css` - Global styles with theme variables
- `tailwind.config.ts` - Tailwind configuration with custom colors

### Configuration
- `prisma/schema.prisma` - Database schema
- `.env.local` - Environment variables
- `next.config.js` - Next.js configuration

## 🔧 Development Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run migrations
npm run prisma:studio     # Open Prisma Studio
npm run seed         # Seed database
npm run db:setup     # Complete DB setup
```

## 🎯 Coding Standards

### TypeScript
- Always use TypeScript with proper type definitions
- Define interfaces for complex objects
- Use proper typing for API responses

### React Components
- Use "use client" for client components
- Implement proper error handling
- Add loading states for async operations
- Use TanStack Query for data fetching

### API Routes
- Verify authentication with `getAuthUser()`
- Check user roles before operations
- Return proper HTTP status codes
- Handle errors gracefully

### Database
- Use Prisma client from `@/lib/db`
- Store times in UTC, display in local timezone
- Use transactions for related operations
- Include proper relations in queries

## 📝 Documentation

- README.md - Complete project documentation
- PRESCRIPTION_HISTORY_IMPLEMENTATION.md - Prescription timeline feature details
- PRESCRIPTION_DUPLICATE_HANDLING.md - Duplicate prevention system
- PDF_GENERATION_IMPLEMENTATION.md - PDF generation for invoices and prescriptions
- Inline comments for complex logic
- JSDoc comments for utility functions

## 🚀 Deployment

- **Vercel**: Recommended for Next.js deployment
- Environment variables required:
  - `DATABASE_URL` - PostgreSQL connection string
  - `NEXTAUTH_SECRET` - Secret for session encryption
  - `NEXTAUTH_URL` - Application URL

## 🔐 Demo Credentials

- Patient: `patient@clinic.local` / `patient123`
- Doctor: `doctor@clinic.local` / `doctor123`
- Admin: `admin@clinic.local` / `admin123`
- Cardiologist: `cardio@clinic.local` / `doctor123`

---

**Last Updated**: January 2025
**Build Status**: ✅ Successful
**Dev Server**: ✅ Running on http://localhost:3000