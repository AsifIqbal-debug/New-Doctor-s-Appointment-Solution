# Doctor's Appointment System

A modern, full-stack appointment booking system built with Next.js 14+, TypeScript, Prisma, and PostgreSQL. Features role-based access control for patients, doctors, and administrators.

## 🌟 Features

### For Patients
- **Search & Book Appointments**: Find doctors by name or specialty and book available time slots
- **Appointment Management**: View upcoming and past appointments
- **Prescription History**: View prescriptions with timeline visualization
- **Digital Prescriptions**: Access prescriptions with frequency display (M+A+N format)
- **PDF Downloads**: Download and print prescriptions as PDF
- **Test Results**: Access uploaded test results

### For Doctors
- **Dashboard**: View daily schedule and upcoming appointments
- **Appointment Management**: Manage patient appointments
- **Prescription Writing**: Create digital prescriptions with M+A+N frequency format
- **Prescription History**: View all prescriptions with timeline and search
- **PDF Generation**: Generate and print prescription PDFs
- **Fee Collection**: Record payments and generate invoices
- **Invoice PDF**: Professional invoices with print and download options
- **Patient Records**: Access patient information and history

### For Administrators
- **System Overview**: Dashboard with key metrics and statistics
- **Doctor Management**: Manage doctor profiles and availability
- **Payment Tracking**: Monitor payments and outstanding amounts
- **Test Result Upload**: Upload test results for patients

## 🎨 UI/UX Features

- **Theme System**: Light (DentCare-style) and deep black dark theme
- **Board Swiper**: Interactive 3D carousel on home page with notices, branding, and doctor highlights
- **Prescription Timeline**: Visual history with expand/collapse, stats, and latest prescription indicator
- **Frequency Display**: Medical standard M+A+N (Morning+Afternoon+Night) dosing format with emoji indicators
- **PDF Generation**: Professional invoices and prescriptions with print/download
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Interface**: Clean, professional medical app design
- **Interactive Components**: Real-time feedback and loading states
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **State Management**: TanStack Query (React Query)
- **PDF Generation**: jsPDF with jspdf-autotable
- **Styling**: Tailwind CSS with responsive design
- **Timezone**: Asia/Dhaka (UTC+6) with proper UTC storage

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd doctor-appointment-system
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env.local
```

Update `.env.local` with your database and authentication settings:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/clinic_db"
NEXTAUTH_SECRET="your-super-secret-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with sample data
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔐 Demo Credentials

The seed script creates demo accounts for testing:

- **Patient**: `patient@clinic.local` / `patient123`
- **Doctor**: `doctor@clinic.local` / `doctor123`
- **Admin**: `admin@clinic.local` / `admin123`
- **Cardiologist**: `cardio@clinic.local` / `doctor123`

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── book/              # Appointment booking
│   ├── login/             # Authentication
│   └── (role-based)/      # Role-specific pages
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   ├── pricing.ts        # Fee calculation logic
│   ├── slots.ts          # Appointment slot management
│   └── time.ts           # Timezone utilities
└── prisma/
    ├── schema.prisma     # Database schema
    └── seed.ts           # Database seeding
```

## 🏥 Key Features Explained

### Appointment Booking System
- **Smart Slot Generation**: 15-minute slots by default (configurable per doctor)
- **Availability Management**: Doctors can set weekly schedules and day-offs
- **Real-time Booking**: Prevents double-booking with database transactions

### Pricing Engine
- **Dynamic Fees**: Based on visit history and configurable rules
- **Visit Types**: First visit, within-window, and outside-window pricing
- **Customizable Rules**: Per-doctor pricing rule sets

### Role-Based Access Control
- **Middleware Protection**: Route-level authentication and authorization
- **UI Components**: Role-aware navigation and content display
- **API Security**: Role verification for all protected endpoints

### Time Zone Handling
- **UTC Storage**: All times stored in UTC for consistency
- **Local Display**: Converted to Asia/Dhaka time for users
- **Date Calculations**: Proper handling across time zones

## 🛡️ Security Features

- **Authentication**: Secure credential-based login with NextAuth.js
- **Password Hashing**: bcryptjs for secure password storage
- **Route Protection**: Middleware-based access control
- **Role Verification**: API-level role checking
- **Input Validation**: Zod schemas for data validation

## 📊 Database Schema

The system uses a comprehensive database schema with the following key models:

- **Users**: Authentication and basic user information
- **Doctors/Patients**: Role-specific profile extensions
- **Appointments**: Booking records with status tracking
- **Visits**: Clinical encounter records
- **Prescriptions**: Digital prescription management
- **Test Orders/Results**: Laboratory test management
- **Payments**: Financial transaction tracking

## � Custom UI Components

### Theme System
- **Light Theme**: Clean white background with teal accent (DentCare-inspired)
- **Dark Theme**: Deep black (#000000) background with accent highlights
- **Theme Toggle**: Persistent theme selection with sun/moon icons

### Board Swiper
- **3D Carousel**: Interactive coverflow effect with autoplay
- **Content Types**: 
  - 🏥 Branding and welcome messages
  - 📅 Important notices and announcements
  - 👨‍⚕️ Featured doctors and specialists
- **Responsive**: 1 card (mobile) → 3 cards (desktop)

### Prescription Timeline
- **Visual History**: Vertical timeline with gradient line animation
- **Latest Badge**: Pulse animation on most recent prescription
- **Expand/Collapse**: Toggle detailed medication view
- **Statistics**: Total prescriptions, medications, and doctors
- **Actions**: Print and view detailed prescriptions

### Frequency Input & Display
- **Input Format**: Medical standard M+A+N (Morning+Afternoon+Night)
- **Quick Presets**: Common dosing patterns (1+0+1, 1+1+1, 2+2+2, etc.)
- **Display Format**: Emoji indicators (🌅 Morning, ☀️ Afternoon, 🌙 Night)
- **Daily Total**: Automatic calculation of doses per day

## �🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Interface**: Clean, professional medical app design
- **Interactive Components**: Real-time feedback and loading states
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Toast Notifications**: User-friendly success/error messages

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run database migrations
npm run prisma:studio     # Open Prisma Studio
npm run seed         # Seed database with sample data
npm run db:setup     # Complete database setup (generate + migrate + seed)
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment

```bash
npm run build
npm run start
```

## 📈 Performance Optimizations

- **React Query**: Efficient data fetching and caching
- **Next.js App Router**: Optimal routing and rendering
- **Database Indexing**: Optimized Prisma schema
- **Image Optimization**: Next.js built-in image optimization
- **Code Splitting**: Automatic bundle optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and connection string is correct
2. **Migration Errors**: Reset database with `npm run prisma:reset`
3. **Authentication Issues**: Verify NEXTAUTH_SECRET is set and URL is correct
4. **Build Errors**: Clear `.next` folder and rebuild

### Support

For support and questions:
- Check the [Issues](../../issues) page
- Review the documentation
- Contact the development team

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.