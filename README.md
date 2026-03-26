# EduManage — College Dashboard

A full-stack college management system built with Next.js 15, Prisma, NextAuth, and Tailwind CSS.

## Features

- **4 Role-based dashboards**: Admin, Teacher, Student, Principal
- **Admin**: Manage students, teachers, classes, subjects, fees, notices, analytics
- **Teacher**: View assigned classes, take attendance, enter marks, verify fee payments, view notices
- **Student**: View grades, attendance records, submit fee payments (UTR), view notices & profile
- **Principal**: Institution overview, analytics charts, comprehensive reports

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database ORM**: Prisma with PostgreSQL
- **Auth**: NextAuth v4 (JWT sessions, bcrypt)
- **UI**: shadcn/ui + Tailwind CSS v4 + Recharts
- **Validation**: Zod + React Hook Form

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo>
cd college-dashboard
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in:
- `DATABASE_URL` — your PostgreSQL connection string
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` — `http://localhost:3000`

### 3. Database Setup

```bash
pnpm db:push         # Push schema to database
pnpm db:seed         # Seed demo data
```

### 4. Run Development Server

```bash
pnpm dev
```


Open [http://localhost:3000](http://localhost:3000)

## Demo Credentials

| Role      | Email                      | Password     |
|-----------|---------------------------|--------------|
| Admin     | admin@college.edu         | password123  |
| Principal | principal@college.edu     | password123  |
| Teacher   | teacher1@college.edu      | password123  |
| Student   | student1@college.edu      | password123  |

## Project Structure

```
app/
  dashboard/
    admin/        # Admin pages (students, teachers, classes, subjects, fees, notices, analytics)
    teacher/      # Teacher pages (classes, attendance, marks, fees, notices)
    student/      # Student pages (grades, attendance, fees, notices, profile)
    principal/    # Principal pages (overview, analytics, reports)
  api/            # REST API routes
  login/          # Auth page
components/
  admin/          # Admin-specific components
  teacher/        # Teacher-specific components
  student/        # Student-specific components
  principal/      # Principal-specific components
  shared/         # Shared components (notices)
  layout/         # Sidebar, Topbar, DashboardShell
prisma/
  schema.prisma   # Database schema
  seed.ts         # Demo data seeder
```
